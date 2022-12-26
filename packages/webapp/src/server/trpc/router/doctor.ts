import { generateVC } from "@pengekrukka/vc-shared";
import { getConfig } from "../../../utils/config";
import { router, validations } from "../trpc";
import { protectedProcedure } from "./../trpc";

export const doctorRouter = router({
  glassesProof: protectedProcedure
    .input(validations.publicKey)
    .query(async ({ input, ctx }) => {
      const config = getConfig("DOCTOR_MNEMONIC");
      const base_url = process.env.BASE_URL;

      return {
        vc: await generateVC(
          {
            id: `did:ethr:${input.publicKey}`,
            revocation: `${base_url}/api/doctor/revocation/${`did:ethr:${input.publicKey}`}`,
          },
          ["GlassesProofCredential", "VerifiableCredential"],
          config
        ),
      };
    }),
});
