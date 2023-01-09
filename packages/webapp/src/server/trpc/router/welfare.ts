import { generateVC } from "@pengekrukka/vc-shared";
import { TRPCError } from "@trpc/server";
import { getConfig } from "../../../utils/config";
import { router, validations } from "../trpc";
import { protectedProcedure } from "./../trpc";

export const welfareRouter = router({
  //FIXME: use personal credential after https://github.com/aridder/pengekrukka/pull/74/files
  convertWelfareToken: protectedProcedure
    .input(validations.publicKey)
    .mutation(async ({ input, ctx }) => {
      if (`did:ethr:${ctx.session.address}` !== input.publicKey) {
        throw new TRPCError({
          message: "Not authorized to modify this credential",
          code: "UNAUTHORIZED",
        });
      }

      //FIXME: use user data in returned VC after https://github.com/aridder/pengekrukka/pull/74/files

      const config = getConfig("WELFARE_MNEMONIC");
      return await generateVC(
        {
          id: `did:ethr:${input.publicKey}`,
          title: "Støtte til 100,- NOK for briller",
          amount: 100,
        },
        ["WelfareCredential", "VerifiableCredential"],
        config
      );
    }),
});
