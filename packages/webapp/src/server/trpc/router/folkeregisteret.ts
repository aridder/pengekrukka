import { generateVC, VCConfig } from "@pengekrukka/vc-shared";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router, validations } from "../trpc";

const getConfig = (): VCConfig => {
  const fromEnv = [process.env.FOLKEREGISTERET_MNEMONIC, process.env.RPC_URL];

  if (fromEnv.every((e) => !!e)) {
    return {
      mnemonic: process.env.FOLKEREGISTERET_MNEMONIC as string,
      rpcUrl: process.env.RPC_URL as string,
    };
  } else {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Configuration was not in expected state: Something was undefined",
    });
  }
};

export const folkeregisteretRouter = router({
  personCredential: protectedProcedure.input(validations.publicKey).query(async ({ input }) => {
    const config = getConfig();
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
