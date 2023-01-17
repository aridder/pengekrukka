const fs = require("fs");
const { deployments } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const { toBN } = require("web3-utils");
const snarkjs = require("snarkjs");
const bigInt = snarkjs.bigInt;
const crypto = require("crypto");
const circomlib = require("circomlib");
const { expect } = require("chai");
const MerkleTree = require("fixed-merkle-tree");
const websnarkUtils = require("websnark/src/utils");
const buildGroth16 = require("websnark/src/groth16");
const exp = require("constants");
const stringifyBigInts = require("websnark/tools/stringifybigint").stringifyBigInts;
const unstringifyBigInts2 = require("snarkjs/src/stringifybigint").unstringifyBigInts;

const rbigint = (nbytes) => snarkjs.bigInt.leBuff2int(crypto.randomBytes(nbytes));
const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0];
const toFixedHex = (number, length = 32) =>
  "0x" +
  bigInt(number)
    .toString(16)
    .padStart(length * 2, "0");
const getRandomRecipient = () => rbigint(20);

function generateDeposit() {
  let deposit = {
    secret: rbigint(31),
    nullifier: rbigint(31),
  };
  const preimage = Buffer.concat([deposit.nullifier.leInt2Buff(31), deposit.secret.leInt2Buff(31)]);
  deposit.commitment = pedersenHash(preimage);
  return deposit;
}

function snarkVerify(proof) {
  proof = unstringifyBigInts2(proof);
  const verification_key = unstringifyBigInts2(require("../build/circuits/withdraw_verification_key.json"));
  return snarkjs["groth"].isValid(verification_key, proof, proof.publicSignals);
}

describe("NOKWelfare", () => {
  let tokenDenomination = "1000000000000000000";

  async function fixture() {
    let tree = new MerkleTree(20);
    let groth16 = await buildGroth16();
    let fee = bigInt(0).shr(1);
    let refund = 0;
    let circuit = require("../build/circuits/withdraw.json");
    let proving_key = fs.readFileSync("build/circuits/withdraw_proving_key.bin").buffer;

    let sender = (await ethers.getSigners())[0].address;
    let recipient = (await ethers.getSigners())[1].address;
    let relayer = (await ethers.getSigners())[2];
    await deployments.fixture("Tornado");
    let tornadoDeployment = await deployments.get("ERC20Tornado");
    let tornado = await ethers.getContractAt(tornadoDeployment.abi, tornadoDeployment.address);

    let tokenDeployment = await deployments.get("ERC20Mock");
    let token = await ethers.getContractAt(tokenDeployment.abi, tokenDeployment.address);

    let verifierDeployment = await deployments.get("Verifier");
    let verifier = await ethers.getContractAt(verifierDeployment.abi, verifierDeployment.address);

    await token.mint(sender, 1000);

    return {
      tree,
      groth16,
      circuit,
      proving_key,
      tornado,
      token,
      sender,
      recipient,
      fee,
      refund,
      relayer,
      verifier,
    };
  }

  describe("deposit", () => {
    it("should deposit", async () => {
      const { tornado, token, sender } = await loadFixture(fixture);
      const commitment = toFixedHex(43);
      await token.approve(tornado.address, tokenDenomination);

      let depositTx = await tornado.deposit(commitment, { from: sender });
      let receipt = await depositTx.wait();
      let hasDepositEvent = receipt.events.find((e) => e.event === "Deposit");
      expect(hasDepositEvent).to.not.be.undefined;
    });

    it("should not be allowed to deposit ETH", async () => {
      const { tornado } = await loadFixture(fixture);
      await expect(tornado.deposit(toFixedHex(44), { value: 1 })).to.be.revertedWith(
        "ETH value is supposed to be 0 for ERC20 instance"
      );
    });
  });
  describe("withdraw", () => {
    it("should withdraw", async () => {
      const { sender, recipient, tornado, token, tree, groth16, circuit, fee, refund, proving_key, relayer, verifier } =
        await loadFixture(fixture);

      const deposit = generateDeposit();
      tree.insert(deposit.commitment);
      const receiverBalanceBefore = await token.balanceOf(recipient);
      const senderBalanceBefore = await token.balanceOf(sender);
      expect(senderBalanceBefore).to.be.equal(1000);
      expect(receiverBalanceBefore).to.be.equal(0);

      await token.approve(tornado.address, tokenDenomination, {
        from: sender,
      });

      await tornado.deposit(toFixedHex(deposit.commitment), {
        from: sender,
      });
      const balanceSenderAfterDeposit = await token.balanceOf(sender);
      expect(balanceSenderAfterDeposit).to.be.equal(999);

      const { pathElements, pathIndices } = tree.path(0);
      const input = stringifyBigInts({
        // public
        root: tree.root(),
        nullifierHash: pedersenHash(deposit.nullifier.leInt2Buff(31)),
        relayer: 0,
        recipient,
        fee,
        refund,

        // private
        nullifier: deposit.nullifier,
        secret: deposit.secret,
        pathElements: pathElements,
        pathIndices: pathIndices,
      });

      const proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, proving_key);
      const copy = proofData;
      const { proof } = websnarkUtils.toSolidityInput(proofData);
      let isValidProof = snarkVerify(proofData);
      expect(isValidProof).to.be.true;

      copy.publicSignals[0] = "133792158246920651341275668520530514036799294649489851421007411546007850802";
      let isValidProof2 = snarkVerify(copy);
      expect(isValidProof2).to.be.false;

      const balanceTornadoBefore = await token.balanceOf(tornado.address);
      const balanceReceiverBefore = await token.balanceOf(toFixedHex(recipient, 20));
      const balanceRelayerBefore = await token.balanceOf(relayer.address);

      let isSpent = await tornado.isSpent(toFixedHex(input.nullifierHash));
      expect(isSpent).to.be.false;

      const args = [
        toFixedHex(input.root),
        toFixedHex(input.nullifierHash),
        toFixedHex(input.recipient, 20),
        toFixedHex(input.relayer, 20),
        toFixedHex(input.fee),
        toFixedHex(input.refund),
      ];

      const isValid = await verifier.verifyProof(proof, args);
      expect(isValid).to.be.true;

      const result = await tornado.connect(relayer).withdraw(proof, ...args, {
        value: refund,
        from: recipient.address,
      });

      const withdrawTx = await result.wait();
      const hasWithdrawEvent = withdrawTx.events.find((e) => e.event === "Withdrawal");
      expect(hasWithdrawEvent).to.not.be.undefined;

      const balanceTornadoAfter = await token.balanceOf(tornado.address);
      const balanceRelayerAfter = await token.balanceOf(relayer.address);
      const balanceReceiverAfter = await token.balanceOf(toFixedHex(recipient, 20));

      expect(balanceTornadoAfter).to.be.equal(balanceTornadoBefore - 1);
      expect(balanceRelayerAfter).to.be.equal(balanceRelayerBefore + fee);
      expect(balanceReceiverAfter).to.be.equal(balanceReceiverBefore + 1);

      isSpent = await tornado.isSpent(toFixedHex(input.nullifierHash));
      expect(isSpent).to.be.true;
    });

    it("should work with encode and decoding of notes", async () => {});
  });
});
