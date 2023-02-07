import { TRPCError } from "@trpc/server";
import { VCConfig } from "../server/trpc/vc-shared";

export const MnemonicConfig = [
  "FOLKEREGISTERET_MNEMONIC",
  "WELFARE_MNEMONIC",
  "DOCTOR_MNEMONIC",
  "OPTICIAN_MNEMONIC",
  "USER_MNEMONIC",
] as const;

export const getConfig = (mnemonicKey: typeof MnemonicConfig[number]): VCConfig => {
  const fromEnv = [process.env[mnemonicKey], process.env.RUNTIME_RPC_NODE] as const;

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
