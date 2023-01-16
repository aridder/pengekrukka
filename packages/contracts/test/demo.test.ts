import assert from "assert";
import circomlib from "circomlib";
import crypto from "crypto";
import { Signer } from "ethers";
import merkleTree from "fixed-merkle-tree";
import fs from "fs";
import { deployments, ethers } from "hardhat";
import { bigInt } from "snarkjs";
import buildGroth16 from "websnark/src/groth16";
import websnarkUtils from "websnark/src/utils";
import { ERC20Tornado } from "../typechain-types/contracts/ERC20Tornado";
import { ERC20Tornado__factory } from "../typechain-types/factories/contracts/ERC20Tornado__factory";

let web3, contract, netId, circuit, proving_key, groth16;
const MERKLE_TREE_HEIGHT = 20;

const { RPC_URL, FREDRIK_MNEMONIC } = process.env;
const userSigner = ethers.Wallet.fromMnemonic(FREDRIK_MNEMONIC);

const AMOUNT = "1";

// CURRENCY = 'ETH'

/** Generate random number of specified byte length */
const rbigint = (nbytes: number) => bigInt.leBuff2int(crypto.randomBytes(nbytes));

/** Compute pedersen hash */
const pedersenHash = (data: Buffer) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0];

/** BigNumber to hex string of specified length */
const toHex = (number: any, length = 32) =>
  "0x" + (number instanceof Buffer ? number.toString("hex") : bigInt(number).toString(16)).padStart(length * 2, "0");

/**
 * Create deposit object from secret and nullifier
 */
function createDeposit(nullifier: BigInt, secret: BigInt) {
  const deposit = { nullifier, secret };
  const preimage = Buffer.concat([(deposit.nullifier as any).leInt2Buff(31), (deposit.secret as any).leInt2Buff(31)]);

  return {
    ...deposit,
    preimage: preimage,
    commitment: pedersenHash(preimage),
    nullifierHash: pedersenHash((deposit.nullifier as any).leInt2Buff(31)),
  };
}

/**
 * Make an ETH deposit
 */
async function deposit(contract: ERC20Tornado, signer: Signer) {

  const netId = (await ethers.getDefaultProvider().getNetwork()).chainId
  const deposit = createDeposit(rbigint(31), rbigint(31));

  await contract.connect(signer).deposit(toHex(deposit.commitment));

  return `tornado-eth-${AMOUNT}-${netId}-${toHex(deposit.preimage, 62)}`;
}

/**
 * Do an ETH withdrawal
 * @param note Note to withdraw
 * @param recipient Recipient address
 */
async function withdraw(note: string, recipient: string) {
  const deposit = parseNote(note);
  const { proof, args } = await generateSnarkProof(deposit, recipient);
  console.log("Sending withdrawal transaction...");
  const tx = await contract.methods.withdraw(proof, ...args).send({ from: web3.eth.defaultAccount, gas: 1e6 });
  console.log(`https://kovan.etherscan.io/tx/${tx.transactionHash}`);
}

/**
 * Parses Tornado.cash note
 * @param noteString the note
 */
function parseNote(noteString) {
  const noteRegex = /tornado-(?<currency>\w+)-(?<amount>[\d.]+)-(?<netId>\d+)-0x(?<note>[0-9a-fA-F]{124})/g;
  const match = noteRegex.exec(noteString);

  // we are ignoring `currency`, `amount`, and `netId` for this minimal example
  const buf = Buffer.from(match.groups.note, "hex");
  const nullifier = bigInt.leBuff2int(buf.slice(0, 31));
  const secret = bigInt.leBuff2int(buf.slice(31, 62));
  return createDeposit(nullifier, secret);
}

/**
 * Generate merkle tree for a deposit.
 * Download deposit events from the contract, reconstructs merkle tree, finds our deposit leaf
 * in it and generates merkle proof
 * @param deposit Deposit object
 */
async function generateMerkleProof(deposit) {
  console.log("Getting contract state...");
  const events = await contract.getPastEvents("Deposit", { fromBlock: 0, toBlock: "latest" });
  const leaves = events
    .sort((a, b) => a.returnValues.leafIndex - b.returnValues.leafIndex) // Sort events in chronological order
    .map((e) => e.returnValues.commitment);
  const tree = new merkleTree(MERKLE_TREE_HEIGHT, leaves);

  // Find current commitment in the tree
  let depositEvent = events.find((e) => e.returnValues.commitment === toHex(deposit.commitment));
  let leafIndex = depositEvent ? depositEvent.returnValues.leafIndex : -1;

  // Validate that our data is correct (optional)
  const isValidRoot = await contract.methods.isKnownRoot(toHex(tree.root())).call();
  const isSpent = await contract.methods.isSpent(toHex(deposit.nullifierHash)).call();
  assert(isValidRoot === true, "Merkle tree is corrupted");
  assert(isSpent === false, "The note is already spent");
  assert(leafIndex >= 0, "The deposit is not found in the tree");

  // Compute merkle proof of our commitment
  const { pathElements, pathIndices } = tree.path(leafIndex);
  return { pathElements, pathIndices, root: tree.root() };
}

/**
 * Generate SNARK proof for withdrawal
 * @param deposit Deposit object
 * @param recipient Funds recipient
 */
async function generateSnarkProof(deposit, recipient) {
  // Compute merkle proof of our commitment
  const { root, pathElements, pathIndices } = await generateMerkleProof(deposit);

  // Prepare circuit input
  const input = {
    // Public snark inputs
    root: root,
    nullifierHash: deposit.nullifierHash,
    recipient: bigInt(recipient),
    relayer: 0,
    fee: 0,
    refund: 0,

    // Private snark inputs
    nullifier: deposit.nullifier,
    secret: deposit.secret,
    pathElements: pathElements,
    pathIndices: pathIndices,
  };

  console.log("Generating SNARK proof...");
  const proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, proving_key);
  const { proof } = websnarkUtils.toSolidityInput(proofData);

  const args = [
    toHex(input.root),
    toHex(input.nullifierHash),
    toHex(input.recipient, 20),
    toHex(input.relayer, 20),
    toHex(input.fee),
    toHex(input.refund),
  ];

  return { proof, args };
}

async function main() {
  circuit = require(__dirname + "/../build/circuits/withdraw.json");
  proving_key = fs.readFileSync(__dirname + "/../build/circuits/withdraw_proving_key.bin").buffer;

  groth16 = await buildGroth16();

  

  await deployments.fixture("Tornado");
  const deployedTornadoContract = await deployments.get("ERC20Tornado");

  const contract = ERC20Tornado__factory.connect(deployedTornadoContract.address, userSigner);

  const note = await deposit(contract, userSigner);
  console.log("Deposited note:", note);
  await withdraw(note, userSigner.address);
  console.log("Done");
  process.exit();
}

describe("The Demo", () => {
  it.only("Should run", async () => {
    await main();
  });
});
