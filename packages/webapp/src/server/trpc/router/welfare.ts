import { faker } from "@faker-js/faker";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ethers } from "ethers";
import { deposit } from "../../blockchain/blockchain";
import { getNokTokenFor, getTornadoContractFor } from "../../blockchain/tornado";
import { addDidPrefix } from "../../../utils";
import { getConfig } from "../../../utils/config";
import { schemas, WelfareCredential } from "../schemas";
import { router } from "../trpc";
import { generateVC, OpticianName, VCConfig, VerifiableCredentialType } from "../vc-shared";
import { protectedProcedure } from "./../trpc";
import { encryption } from "../../blockchain/encryption";
import { ConnectionInfo } from "ethers/lib/utils.js";

/**
 * @param income yearly income in NOK
 * @returns the amount of support granted
 */
export const calculateGlassesVoucherAmount = (income: number) => {
  if (income < 200_000) {
    return 2000;
  }

  if (income > 600_000) {
    return 500;
  }

  if (income > 800_000) {
    return 250;
  }

  return 1000;
};

const getSignerAndProvider = (rpcUrl: String) => {
  if (rpcUrl.includes("bergen")) {
    const info: ConnectionInfo = {
      url: process.env.RUNTIME_RPC_NODE!,
      user: process.env.NORGESBANK_USER!,
      password: process.env.NORGESBANK_PASSWORD!,
    };
    return ethers.Wallet.fromMnemonic(process.env.WELFARE_MNEMONIC as string).connect(
      new ethers.providers.JsonRpcProvider(info)
    );
  } else {
    return ethers.Wallet.fromMnemonic(process.env.WELFARE_MNEMONIC as string).connect(
      new ethers.providers.JsonRpcProvider(process.env.RUNTIME_RPC_NODE!)
    );
  }
};

/**
 * NOTE: amount and optician are not used in this hackathon implementation.
 * The amount is fixed to 1,- NOK in the contract in order to not overspend the test account
 * Optician is always OpticianName.TestOptician.
 */
const depositWelfareMoney = async (optician: OpticianName, amount: number) => {
  const signer = getSignerAndProvider(process.env.RUNTIME_RPC_NODE!);
  console.log(process.env.RUNTIME_RPC_NODE);
  const contract = getTornadoContractFor(signer);
  const nokContract = getNokTokenFor(signer);
  const allowance = await nokContract.allowance(signer.address, contract.address);
  const balance = await nokContract.balanceOf(signer.address);
  console.log("Allowance:", allowance.toString());
  console.log("Balance:", balance.toString());
  if (allowance.lt(ethers.utils.parseEther("100"))) {
    await nokContract.approve(contract.address, ethers.utils.parseEther("100"));
  }

  //TODO: In a real scenario, this server would not have access to the mnenomic, and would have to get the public key elsewhere
  const opticianPublicKey = ethers.Wallet.fromMnemonic(
    process.env.OPTICIAN_MNEMONIC as string
  ).publicKey.slice(2);

  const note = await deposit(amount, contract);

  return encryption.encrypt({
    message: note,
    receiverPublicKey: opticianPublicKey,
    senderPrivateKye: signer.privateKey,
  });
};

export const welfareRouter = router({
  convertWelfareToken: protectedProcedure
    .input(
      z.object({ credential: schemas.glassesCredential, optician: z.nativeEnum(OpticianName) })
    )
    .mutation(async ({ input: { credential, optician }, ctx }) => {
      //TODO: validate folkeregisteret issuer as well
      if (addDidPrefix(ctx.session.address as `0x${string}`) !== credential.credentialSubject.id) {
        throw new TRPCError({
          message: "Not authorized to modify this credential",
          code: "UNAUTHORIZED",
        });
      }

      const amount = calculateGlassesVoucherAmount(
        //NOTE: income just set to a random number for now
        faker.datatype.number({ min: 50_000, max: 950_000 })
      );

      const tornadoNote = await depositWelfareMoney(optician, amount);

      const config = getConfig("WELFARE_MNEMONIC");
      return (await generateVC(
        {
          id: credential.credentialSubject.id,
          amount,
          tornadoNote,
        },
        [VerifiableCredentialType.WelfareCredential, VerifiableCredentialType.VerifiableCredential],
        config
      )) as WelfareCredential;
    }),
});
