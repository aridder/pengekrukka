import { inferAsyncReturnType } from "@trpc/server";
import { VCIssuer } from "@symfoni/vc-tools";
import { ethers } from "ethers";

type BaseSubject = {
  id: `did:ethr:${string}`;
};

export type VCConfig = {
  mnemonic: string;
  rpcUrl: string;
};

export type VerifiableCredential = Awaited<ReturnType<typeof generateVC>>;

export const generateVC = async <Subject extends BaseSubject>(
  subject: Subject,
  type: string[],
  options: VCConfig
) => {
  const wallet = ethers.Wallet.fromMnemonic(options.mnemonic);
  const withoutPrefix = wallet.privateKey.replace("0x", "");
  const did = `did:ethr:${wallet.address}`;
  const issuer = await VCIssuer.init({
    dbName: `db-${did}`,
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
    type: type,
    credentialSubject: subject,
  });
};
