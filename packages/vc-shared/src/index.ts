import { VCIssuer } from "@symfoni/vc-tools";
import { ethers } from "ethers";

type BaseSubject = {
  id: `did:ethr:${string}`;
};

export type VCConfig = {
  mnemonic: string;
  rpcUrl: string;
};

export const generateVC = async <Subject extends BaseSubject>(
  subject: Subject,
  options: VCConfig
) => {
  const wallet = ethers.Wallet.fromMnemonic(options.mnemonic);
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
          url: options.rpcUrl,
        },
      },
    ],
  });

  return await issuer.createVC({
    credentialSubject: subject,
  });
};
