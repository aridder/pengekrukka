import { generateVC } from "@pengekrukka/vc-shared";
import { getConfig } from "../../../utils/config";
import { router, schemas } from "../trpc";
import { protectedProcedure } from "./../trpc";

export const doctorRouter = router({
  glassesProof: protectedProcedure
    .input(schemas.personalCredential)
    .query(async ({ input: personalCredential, ctx }) => {
      const config = getConfig("DOCTOR_MNEMONIC");

      const vc = await generateVC(
        {
          id: personalCredential.credentialSubject.id,
        },
        ["GlassesProofCredential", "VerifiableCredential"],
        config
      );

      vc.credentialSubject;

      return {
        vc: await generateVC(
          {
            id: personalCredential.credentialSubject.id,
          },
          ["GlassesProofCredential", "VerifiableCredential"],
          config
        ),
      };
    }),
});
