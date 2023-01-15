import { TRPCError } from "@trpc/server";
import { addDidPrefix } from "../../../utils";
import { getConfig } from "../../../utils/config";
import { schemas, WelfareCredential } from "../schemas";
import { router } from "../trpc";
import { generateVC, VerifiableCredentialType } from "../vc-shared";
import { protectedProcedure } from "./../trpc";

export const welfareRouter = router({
  convertWelfareToken: protectedProcedure
    .input(schemas.glassesCredential)
    .mutation(async ({ input, ctx }) => {
      //TODO: validate folkeregisteret issuer as well
      if (addDidPrefix(ctx.session.address as `0x${string}`) !== input.credentialSubject.id) {
        throw new TRPCError({
          message: "Not authorized to modify this credential",
          code: "UNAUTHORIZED",
        });
      }

      //TODO: something about the user used to generate support amount?

      const config = getConfig("WELFARE_MNEMONIC");
      return (await generateVC(
        {
          id: input.credentialSubject.id,
          amount: 1000,
        },
        [VerifiableCredentialType.WelfareCredential, VerifiableCredentialType.VerifiableCredential],
        config
      )) as WelfareCredential;
    }),
});
