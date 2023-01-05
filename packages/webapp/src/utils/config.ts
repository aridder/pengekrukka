import { VCConfig } from "@pengekrukka/vc-shared";
import { TRPCError } from "@trpc/server";

export const MnemonicConfig = [
  "FOLKEREGISTERET_MNEMONIC",
  "WELFARE_MNEMONIC",
  "DOCTOR_MNEMONIC",
  "OPTICIAN_MNEMONIC",
  "FREDRIK_MNEMONIC",
] as const;

export const getConfig = (mnemonicKey: typeof MnemonicConfig[number]): VCConfig => {
  const fromEnv = [process.env[mnemonicKey], process.env.RPC_URL] as const;

  if (fromEnv.some((variable) => variable === undefined)) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Configuration was not in expected state: Something was undefined",
    });
  }
  const [mnemonic, rpcUrl] = fromEnv;
  return {
    mnemonic: mnemonic as string,
    rpcUrl: rpcUrl as string,
  };
};
