import { faker } from "@faker-js/faker";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addDidPrefix } from "../../../utils";
import { getConfig } from "../../../utils/config";
import { schemas, WelfareCredential } from "../schemas";
import { router } from "../trpc";
import { generateVC, OpticianName, VerifiableCredentialType } from "../vc-shared";
import { protectedProcedure } from "./../trpc";

/**
 * @param amount yearly income in NOK
 * @returns the amount of support granted
 */
export const calculateGlassesVoucherAmount = (amount: number) => {
  if (amount < 200_000) {
    return 2000;
  }

  if (amount > 600_000) {
    return 500;
  }

  if (amount > 800_000) {
    return 250;
  }

  return 1000;
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

      //FIXME: use optician to encrypt tornado note with the opticians public key
      // https://github.com/aridder/pengekrukka/issues/98

      const config = getConfig("WELFARE_MNEMONIC");
      return (await generateVC(
        {
          id: credential.credentialSubject.id,
          amount: calculateGlassesVoucherAmount(
            //NOTE: income just set to a random number for now
            faker.datatype.number({ min: 50_000, max: 950_000 })
          ),
        },
        [VerifiableCredentialType.WelfareCredential, VerifiableCredentialType.VerifiableCredential],
        config
      )) as WelfareCredential;
    }),
});
