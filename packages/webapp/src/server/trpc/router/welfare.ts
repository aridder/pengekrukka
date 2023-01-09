import { generateVC } from "@pengekrukka/vc-shared";
import { getConfig } from "../../../utils/config";
import { router, schemas } from "../trpc";
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
        ["WelfareCredential", "VerifiableCredential"],
        config
      ),
    };
  }),
});
