import { generateVC } from "@pengekrukka/vc-shared";
import { getConfig } from "../../../utils/config";
import { schemas } from "../schemas";
import { router } from "../trpc";
import { protectedProcedure } from "./../trpc";

export const doctorRouter = router({
  glassesProof: protectedProcedure
    .input(schemas.personalCredential)
    .query(async ({ input: personalCredential, ctx }) => {
      const config = getConfig("DOCTOR_MNEMONIC");

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
