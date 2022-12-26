import { generateVC } from "@pengekrukka/vc-shared";
import { z } from "zod";
import { getConfig } from "../../../utils/config";
import { router } from "../trpc";
import { protectedProcedure } from "./../trpc";

//TODO: the type accessible with ._type with frontend
const validation = z.object({ publicKey: z.string() });

export const doctorRouter = router({
  glassesProof: protectedProcedure
    .input(validation)
    .query(async ({ input, ctx }) => {
      const config = getConfig("DOCTOR_MNEMONIC");
      const base_url = process.env.BASE_URL;
      console.log("ctx", ctx);

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
