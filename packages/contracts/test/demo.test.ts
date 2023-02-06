import { ERC20Mock } from "./../src/typechain/contracts/ERC20Mock";
//@ts-ignore
import fs from "fs";
//@ts-ignore
import assert from "assert";
//@ts-ignore
import circomlib from "circomlib";
import crypto from "crypto";
import { BytesLike, Signer } from "ethers";
//@ts-ignore
import merkleTree from "fixed-merkle-tree";
import { deployments, ethers } from "hardhat";
//@ts-ignore
import { bigInt } from "snarkjs";
//@ts-ignore
import buildGroth16, { Groth16 } from "websnark/src/groth16";
//@ts-ignore
import websnarkUtils from "websnark/src/utils";
import { DepositEvent, ERC20Tornado } from "../typechain-types/contracts/ERC20Tornado";

type Deposit = {
  nullifier: BigInt;
  secret: BigInt;
  preimage: Buffer;
  commitment: string;
  nullifierHash: string;
};

type MerkleProof = {
  pathElements: string[];
  pathIndices: string[];
  root: string;
};

export type WithdrawArgs = {
  root: string;
  nullifierHash: string;
  recipient: string;
  relayer: string;
  fee: string;
  refund: string;
};

export type SnarkProof = {
  proof: BytesLike;
  args: WithdrawArgs;
};

const rbigint = (nbytes: number) => bigInt.leBuff2int(crypto.randomBytes(nbytes));

/** Compute pedersen hash */
const pedersenHash = (data: Buffer) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0];

/** BigNumber to hex string of specified length */
const toHex = (number: any, length = 32) =>
  "0x" + (number instanceof Buffer ? number.toString("hex") : bigInt(number).toString(16)).padStart(length * 2, "0");

export async function deposit(contract: ERC20Tornado, signer: Signer) {
  const netId = (await ethers.getDefaultProvider().getNetwork()).chainId;
  const deposit = createDeposit(rbigint(31), rbigint(31));

  const tx = await contract.connect(signer).deposit(toHex(deposit.commitment));
  const receipt = await tx.wait();

  return `tornado-eth-${process.env.AMOUNT}-${netId}-${toHex(deposit.preimage, 62)}`;
}

/**
 * Do an ETH withdrawal
 * @param note Note to withdraw
 * @param recipient Recipient address
 */
async function withdraw(contract: ERC20Tornado, note: string, recipient: string, groth16: Groth16, rpcUrl: string) {
  const circuit = require(__dirname + "/../build/circuits/withdraw.json");
  const proving_key = fs.readFileSync(__dirname + "/../build/circuits/withdraw_proving_key.bin").buffer;
  const deposit = parseNote(note);
  const { proof, args } = await generateSnarkProof(contract, deposit, recipient, groth16, circuit, proving_key);
  const tx = await contract.withdraw(
    proof,
    args.root,
    args.nullifierHash,
    args.recipient,
    args.relayer,
    args.fee,
    args.refund
  );
  return await tx.wait();
}

/**
 * Create deposit object from secret and nullifier
 */
function createDeposit(nullifier: BigInt, secret: BigInt): Deposit {
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
 * Parses Tornado.cash note
 * @param noteString the note
 */
function parseNote(noteString: string): Deposit {
  const noteRegex = /tornado-(?<currency>\w+)-(?<amount>[\d.]+)-(?<netId>\d+)-0x(?<note>[0-9a-fA-F]{124})/g;
  const match = noteRegex.exec(noteString);

  if (!match) {
    throw new Error("Invalid note");
  }

  // we are ignoring `currency`, `amount`, and `netId` for this minimal example
  const buf = Buffer.from(match.groups!!.note!!, "hex");
  const nullifier = bigInt.leBuff2int(buf.slice(0, 31));
  const secret = bigInt.leBuff2int(buf.slice(31, 62));
  return createDeposit(nullifier, secret);
}

export async function generateMerkleProof(
  contract: ERC20Tornado,
  deposit: Deposit,
  fromBlock: number = 0,
  treeHeight: number = 20
): Promise<MerkleProof> {
  const eventFilter = contract.filters.Deposit();
  let events: DepositEvent[] = (await contract.queryFilter(eventFilter, fromBlock, "latest")) as DepositEvent[];
  console.log("Getting contract state...");
  // const DepositEvent = contract.interface.getEvent("Deposit");
  // const events = await contract.getPastEvents("Deposit", {
  //   fromBlock: fromBlock,
  //   toBlock: "latest",
  // });
  console.log("Got events:", events.length);
  const leaves = events
    .sort((a, b) => a.args.leafIndex - b.args.leafIndex) // Sort events in chronological order
    .map((e) => e.args.commitment);
  const tree = new merkleTree(treeHeight, leaves);

  // Find current commitment in the tree
  let depositEvent = events.find((e) => e.args.commitment === toHex(deposit.commitment));
  let leafIndex = depositEvent ? depositEvent.args.leafIndex : -1;

  // Validate that our data is correct (optional)
  const isValidRoot = await contract.isKnownRoot!!(toHex(tree.root()));
  const isSpent = await contract.isSpent!!(toHex(deposit.nullifierHash));

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
async function generateSnarkProof(
  contract: ERC20Tornado,
  deposit: Deposit,
  recipient: string,
  groth16: Groth16,
  circuit: any,
  proving_key: any
): Promise<SnarkProof> {
  // Compute merkle proof of our commitment
  const { root, pathElements, pathIndices } = await generateMerkleProof(contract, deposit);

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

  const args: WithdrawArgs = {
    root: toHex(input.root),
    nullifierHash: toHex(input.nullifierHash),
    recipient: toHex(input.recipient, 20),
    relayer: toHex(input.relayer, 20),
    fee: toHex(input.fee),
    refund: toHex(input.refund),
  };

  return { proof, args };
}

async function main() {
  const groth16 = await buildGroth16();
  const AMOUNT = process.env.AMOUNT!;

  await deployments.fixture("Tornado");
  const deployedTornadoContract = await deployments.get("ERC20Tornado");
  const mockERC20Contract = await deployments.get("ERC20Mock");
  const userSigner = await (await ethers.getSigners())[0];
  const recipient = await (await ethers.getSigners())[1];

  const tornado = new ethers.Contract(
    deployedTornadoContract.address,
    deployedTornadoContract.abi,
    userSigner
  ) as ERC20Tornado;

  const nokToken = new ethers.Contract(mockERC20Contract.address, mockERC20Contract.abi, userSigner) as ERC20Mock;

  // const erc20 = new ethers.Contract(erc20Contract.address, erc20Contract.abi, userSigner) as ERC20Mock;

  await nokToken.mint(userSigner.address, ethers.utils.parseEther(AMOUNT));
  const balanceKrukkaBefore = await nokToken.balanceOf(userSigner.address);
  await nokToken.connect(userSigner).approve(tornado.address, ethers.utils.parseEther(AMOUNT));

  const note = await deposit(tornado, userSigner);
  await withdraw(tornado, note, recipient.address, groth16, "http://localhost:8545");
  console.log("Done");
}

describe("The Demo", () => {
  it("Should run", async () => {
    await main();
  });
});
