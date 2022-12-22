import { protectedProcedure } from "./../trpc";
import { generateVC, VCConfig } from "@pengekrukka/vc-shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

//TODO: the type accessible with ._type with frontend
const validation = z.object({ publicKey: z.string() });

const getConfig = (): VCConfig => {
  const fromEnv = [process.env.DOCTOR_MNEMONIC, process.env.RPC_URL];

  if (fromEnv.every((e) => !!e)) {
    return {
      mnemonic: process.env.DOCTOR_MNEMONIC as string,
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

export const doctorRouter = router({
  glassesProof: protectedProcedure
    .input(validation)
    .query(async ({ input, ctx }) => {
      const config = getConfig();
      const base_url = process.env.BASE_URL;
      console.log("ctx", ctx);

      return {
        vc: await generateVC(
          {
            id: `did:ethr:${input.publicKey}`,
            revocation: `${base_url}/api/doctor/revocation/${`did:ethr:${input.publicKey}`}`,
          },
          ["GlassesProofCredential", "VerifiableCredential"],
          config
        ),
      };
    }),
});
