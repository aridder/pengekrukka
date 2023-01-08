import { generateVC } from "@pengekrukka/vc-shared";
import { getConfig } from "../../../utils/config";
import { router, schemas } from "../trpc";
import { protectedProcedure } from "./../trpc";

export const doctorRouter = router({
  glassesProof: protectedProcedure
    .input(schemas.personalCredential)
    .query(async ({ input, ctx }) => {
      const config = getConfig("DOCTOR_MNEMONIC");
      const base_url = process.env.BASE_URL;

      //FIXME: include data from person credential, see JSON spec in https://www.figma.com/file/rlraezDx5mZpizzC4GEWBe/Pengekrukka?node-id=0%3A1&t=FKmuPOIVnmwWfiuN-0
      return {
        vc: await generateVC(
          {
            id: input.did,
            title: "Bevis på brillebehov",
            expirationDate: new Date().toISOString(),
            revocation: `${base_url}/api/doctor/revocation/${`did:ethr:${input.publicKey}`}`,
            required: [
              {
                type: "credential",
                issuer: input.service.host,
                credential: "PersonCredential",
              },
            ],
          },
          ["GlassesProofCredential", "VerifiableCredential"],
          config
        ),
      };
    }),
});
