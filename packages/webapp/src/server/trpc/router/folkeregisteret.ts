import { getConfig } from "../../../utils/config";
import { PersonalCredential, schemas } from "../schemas";
import { protectedProcedure, router } from "../trpc";
import { generateVC, VerifiableCredentialType } from "../vc-shared";

export const folkeregisteretRouter = router({
  personCredential: protectedProcedure.input(schemas.userAddressSchema).query(async ({ input }) => {
    const config = getConfig("FOLKEREGISTERET_MNEMONIC");
    const vc = await generateVC(
      {
        id: `did:ethr:${input.publicKey}`,
        ssn: "12345678901",
      },
      [VerifiableCredentialType.PersonCredential, VerifiableCredentialType.VerifiableCredential],
      config
    );

    //THINKABOUT: how to infer and ensure `PersonalCredential` from `generateVC`
    return vc as PersonalCredential;
  }),
});
