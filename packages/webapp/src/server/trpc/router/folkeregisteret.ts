import { generateVC } from "@pengekrukka/vc-shared";
import { getConfig } from "../../../utils/config";
import { protectedProcedure, router, schemas } from "../trpc";

export const folkeregisteretRouter = router({
  personCredential: protectedProcedure.input(schemas.userAddressSchema).query(async ({ input }) => {
    const config = getConfig("FOLKEREGISTERET_MNEMONIC");
    const vc = await generateVC(
      {
        id: `did:ethr:${input.publicKey}`,
        ssn: "12345678901",
      },
      ["VerifiableCredential", "PersonCredential"],
      config
    );

    return {
      ...vc,
    };
  }),
});
