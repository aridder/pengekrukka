import { generateVC } from "@pengekrukka/vc-shared";
import { getConfig } from "../../../utils/config";
import { protectedProcedure, router, validations } from "../trpc";

export const folkeregisteretRouter = router({
  personCredential: protectedProcedure.input(validations.publicKey).query(async ({ input }) => {
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
