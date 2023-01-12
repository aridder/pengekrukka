import { TRPCError } from "@trpc/server";
import { addDidPrefix } from "../../../utils";
import { getConfig } from "../../../utils/config";
import { schemas } from "../schemas";
import { router } from "../trpc";
import { generateVC, VerifiableCredentialType } from "../vc-shared";
import { protectedProcedure } from "./../trpc";

export const welfareRouter = router({
  convertWelfareToken: protectedProcedure
    .input(schemas.personalCredential)
    .mutation(async ({ input, ctx }) => {
      //TODO: validate folkeregisteret issuer as well
      if (addDidPrefix(ctx.session.address as `0x${string}`) !== input.credentialSubject.id) {
        throw new TRPCError({
          message: "Not authorized to modify this credential",
          code: "UNAUTHORIZED",
        });
      }

      //FIXME: use user data in returned VC after https://github.com/aridder/pengekrukka/pull/74/files

      const config = getConfig("WELFARE_MNEMONIC");
      return await generateVC(
        {
          id: `did:ethr:${input.credentialSubject.id}`,
          amount: 100,
        },
        [VerifiableCredentialType.WelfareCredential, VerifiableCredentialType.VerifiableCredential],
        config
      );
    }),
});
