import { faker } from "@faker-js/faker";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ethers } from "ethers";
import { deposit } from "../../blockchain/blockchain";
import { getTornadoContractFor } from "../../blockchain/tornado";
import { addDidPrefix } from "../../../utils";
import { getConfig } from "../../../utils/config";
import { schemas, WelfareCredential } from "../schemas";
import { router } from "../trpc";
import { generateVC, OpticianName, VCConfig, VerifiableCredentialType } from "../vc-shared";
import { protectedProcedure } from "./../trpc";
import { encryption } from "../../blockchain/encryption";

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

/**
 * NOTE: amount and optician are not used in this hackathon implementaiton.
 * The amount is fixed to 1,- NOK in the contract in order to not overspend the test account
 * Optician is always HANSENS_BRILLEFORETNING.
 */
const depositWelfareMoney = async (optician: OpticianName, amount: number) => {
  const signer = ethers.Wallet.fromMnemonic(process.env.WELFARE_MNEMONIC as string);
  const contract = getTornadoContractFor(signer);

  //TODO: In a real scenario, this server would not have access to the mnenomic, and would have to get the public key elsewhere
  const opticianPublicKey = ethers.Wallet.fromMnemonic(
    process.env.OPTICIAN_MNEMONIC as string
  ).publicKey;

  const note = await deposit(amount, contract, signer);

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
          tornadoNote
        },
        [VerifiableCredentialType.WelfareCredential, VerifiableCredentialType.VerifiableCredential],
        config
      )) as WelfareCredential;
    }),
});
