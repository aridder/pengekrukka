import { ERC20Tornado } from "@pengekrukka/contracts/lib/typechain";
import { proving_key, withdraw as withdrawCircuit } from "@pengekrukka/contracts/src/circuits";
import assert from "assert";
//@ts-ignore
import circomlib from "circomlib";
import crypto from "crypto";
import { BytesLike, ethers, Signer } from "ethers";
//@ts-ignore
import merkleTree from "fixed-merkle-tree";
//@ts-ignore
import { bigInt } from "snarkjs";
//@ts-ignore
import { Groth16 } from "websnark/src/groth16";
//@ts-ignore
import { websnarkUtils } from "websnark/src/utils";
import { DepositEvent } from "@pengekrukka/contracts/typechain-types/contracts/ERC20Tornado";

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
const pedersenHash = (data: Buffer) =>
  circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0];

/** BigNumber to hex string of specified length */
const toHex = (number: any, length = 32) =>
  "0x" +
  (number instanceof Buffer ? number.toString("hex") : bigInt(number).toString(16)).padStart(
    length * 2,
    "0"
  );

export async function deposit(amount: number, contract: ERC20Tornado, signer: Signer) {
  const netId = (await ethers.getDefaultProvider().getNetwork()).chainId;
  const deposit = createDeposit(amount, rbigint(31), rbigint(31));
  console.log("Deposit:", deposit);

  const tx = await contract.connect(signer).deposit(toHex(deposit.commitment));
  const receipt = await tx.wait();
  console.log("Deposit transaction:", receipt.transactionHash);

  return `tornado-eth-${amount}-${netId}-${toHex(deposit.preimage, 62)}`;
}

/**
 * Do an ETH withdrawal
 * @param note Note to withdraw
 * @param recipient Recipient address
 */
async function withdraw(
  contract: ERC20Tornado,
  note: string,
  recipient: string,
  groth16: Groth16,
  rpcUrl: string
) {
  const deposit = parseNote(note);
  console.log("Withdrawal deposit:", deposit);
  const { proof, args } = await generateSnarkProof(
    contract,
    deposit,
    recipient,
    groth16,
    withdrawCircuit,
    proving_key
  );
  console.log("Sending withdrawal transaction...");
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
 * FIXME: use amount if when it's no longer fixed in the contract
 */
function createDeposit(amount: number, nullifier: BigInt, secret: BigInt): Deposit {
  const deposit = { nullifier, secret };
  const preimage = Buffer.concat([
    (deposit.nullifier as any).leInt2Buff(31),
    (deposit.secret as any).leInt2Buff(31),
  ]);

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
  const noteRegex =
    /tornado-(?<currency>\w+)-(?<amount>[\d.]+)-(?<netId>\d+)-0x(?<note>[0-9a-fA-F]{124})/g;
  const match = noteRegex.exec(noteString);

  if (!match) {
    throw new Error("Invalid note");
  }

  // we are ignoring `currency`, `amount`, and `netId` for this minimal example
  const buf = Buffer.from(match.groups!!.note!!, "hex");
  const amount = parseInt(match.groups!!.amount!!);
  const nullifier = bigInt.leBuff2int(buf.slice(0, 31));
  const secret = bigInt.leBuff2int(buf.slice(31, 62));
  return createDeposit(amount, nullifier, secret);
}

export async function generateMerkleProof(
  contract: ERC20Tornado,
  deposit: Deposit,
  fromBlock: number = 4207655,
  treeHeight: number = 20
): Promise<MerkleProof> {
  const eventFilter = contract.filters.Deposit();
  let events: DepositEvent[] = (await contract.queryFilter(
    eventFilter,
    fromBlock,
    "latest"
  )) as DepositEvent[];
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
