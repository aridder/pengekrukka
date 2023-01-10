import { generateVC } from "@pengekrukka/vc-shared";
import { TRPCError } from "@trpc/server";
import { getConfig } from "../../../utils/config";
import { schemas } from "../schemas";
import { router } from "../trpc";
import { protectedProcedure } from "./../trpc";

export const welfareRouter = router({
  //FIXME: use personal credential after https://github.com/aridder/pengekrukka/pull/74/files
  convertWelfareToken: protectedProcedure
    .input(schemas.personalCredential)
    .mutation(async ({ input, ctx }) => {
      //TODO: validate issuer as well

      if (`did:ethr:${ctx.session.address}` !== input.credentialSubject.id) {
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
          title: "Støtte til 100,- NOK for briller",
          amount: 100,
        },
        ["WelfareCredential", "VerifiableCredential"],
        config
      );
    }),
});
