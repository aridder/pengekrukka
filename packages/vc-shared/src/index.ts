import { VCIssuer } from "@symfoni/vc-tools";
import { ethers } from "ethers";

export const generateVC = async (publicKey: string) => {
  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC!);
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
