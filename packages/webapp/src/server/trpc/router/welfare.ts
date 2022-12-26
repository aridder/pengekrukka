import { generateVC, VCConfig } from "@pengekrukka/vc-shared";
import { TRPCError } from "@trpc/server";
import { router, validations } from "../trpc";
import { protectedProcedure } from "./../trpc";

const getConfig = (): VCConfig => {
  const fromEnv = [process.env.WELFARE_MNEMONIC, process.env.RPC_URL];

  if (fromEnv.every((e) => !!e)) {
    return {
      mnemonic: process.env.WELFARE_MNEMONIC as string,
      rpcUrl: process.env.RPC_URL as string,
    };
  } else {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Configuration was not in expected state: Something was undefined",
    });
  }
};

export const welfareRouter = router({
  getWelfareVc: protectedProcedure
    .input(validations.publicKey)
    .query(async ({ input }) => {
      const config = getConfig();

      //FIXME: some user id validation and lookup of actual welfare amount
      // TODO add revocation and type of credential from a config file or something
      return {
        vc: await generateVC(
          {
            id: `did:ethr:${input.publicKey}`,
            amount: 100,
          },
          ["WelfareCredential", "VerifiableCredential"],
          config
        ),
      };
    }),
});
