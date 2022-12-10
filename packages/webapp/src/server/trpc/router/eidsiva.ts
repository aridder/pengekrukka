import { ethers } from "ethers";
import { VCIssuer } from "@symfoni/vc-tools";

import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const generateVC = async (publicKey: string) => {
  const wallet = await ethers.Wallet.fromMnemonic(process.env.MNEMONIC!);
  const withoutPrefix = wallet.privateKey.replace("0x", "");
  const issuer = await VCIssuer.init({
    dbName: "db-name",
    storeEncryptKey: withoutPrefix,
    walletSecret: wallet.mnemonic.phrase,
    chains: [
      {
        default: true,
        chainId: 5,
        provider: {
          url: process.env.RPC_URL!,
        },
      },
    ],
  });
  //TODO make sure format if did ethr is correct
  return await issuer.createVC({
    credentialSubject: {
      id: `did:ethr:${publicKey}`,
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
