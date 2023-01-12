import { getConfig } from "../../../utils/config";
import { schemas } from "../schemas";
import { router } from "../trpc";
import { generateVC, VerifiableCredentialType } from "../vc-shared";
import { protectedProcedure } from "./../trpc";

export const welfareRouter = router({
  getWelfareVc: protectedProcedure.input(schemas.personalCredential).query(async ({ input }) => {
    const config = getConfig("WELFARE_MNEMONIC");

    //FIXME: some user id validation and lookup of actual welfare amount
    // TODO add revocation and type of credential from a config file or something
    return {
      vc: await generateVC(
        {
          id: `did:ethr:${input.credentialSubject.id}`,
          title: "Støtte til 100,- NOK for briller",
          amount: 100,
        },
        [VerifiableCredentialType.WelfareCredential, VerifiableCredentialType.VerifiableCredential],
        config
      ),
    };
  }),
});
