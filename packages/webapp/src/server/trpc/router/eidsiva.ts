import { VCIssuer } from "@symfoni/vc-tools";

import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const generateVC = async (publicKey: string) => {
  const issuer = await VCIssuer.init({
    dbName: "test",
    walletSecret: "test test test test test test test test test test test junk",
    chains: [
      {
        default: true,
        chainId: 5,
        provider: "TODO_SOMEHOW_GET_A_PROVIDER",
      },
    ],
  });
  issuer.createVC({
    credentialSubject: {
      watt: {
        value: 130,
        unit: "kWh",
      },
    },
  });
};

//TODO: the type accessible with ._type with frontend
const validation = z.object({ publicKey: z.string() });

export const eidsivaRouter = router({
  getUsageVC: publicProcedure.input(validation).query(async ({ input }) => {
    return {
      vc: await generateVC(input.publicKey),
    };
  }),
});
