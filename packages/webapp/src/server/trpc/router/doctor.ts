import { getConfig } from "../../../utils/config";
import { schemas } from "../schemas";
import { router } from "../trpc";
import { generateVC, VerifiableCredentialType } from "../vc-shared";
import { protectedProcedure } from "./../trpc";

export const doctorRouter = router({
  glassesProof: protectedProcedure
    .input(schemas.personalCredential)
    .query(async ({ input: personalCredential, ctx }) => {
      const config = getConfig("DOCTOR_MNEMONIC");

      return await generateVC(
        {
          id: personalCredential.credentialSubject.id,
          needsGlasses: true,
        },
        [
          VerifiableCredentialType.GlassesProofCredential,
          VerifiableCredentialType.VerifiableCredential,
        ],
        config
      );
    }),
});
