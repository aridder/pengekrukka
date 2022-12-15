import { generateVC, VCConfig } from "@pengekrukka/vc-shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

//TODO: the type accessible with ._type with frontend
const validation = z.object({ publicKey: z.string() });

const exists = <T>(elements: (T | undefined)[]): T[] | Error => {
  if (elements.every((element) => !!element)) {
    return {
      name: "Value does not exist",
      message: `Expected all elements to be defined.`,
    };
  } else {
    return elements as NonNullable<T>[];
  }
};

const getConfig = (): VCConfig => {
  const fromEnv = [process.env.MNEMONIC, process.env.RPC_URL];

  if (fromEnv.every((e) => !!e)) {
    return {
      mnemonic: process.env.MNEMONIC as string,
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

export const eidsivaRouter = router({
  getUsageVC: publicProcedure.input(validation).query(async ({ input }) => {
    const config = getConfig();

    return {
      vc: await generateVC(
        {
          id: `did:ethr:${input.publicKey}`,
          kw: 100,
        },
        config
      ),
    };
  }),
});
