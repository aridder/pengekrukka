import { VCIssuer } from "@symfoni/vc-tools";
import { ethers } from "ethers";

export type BaseSubject = {
  id: string;
};

export type VCConfig = {
  mnemonic: string;
  rpcUrl: string;
};

export const verifiableCredentialTypes = [
  "WelfareCredential",
  "VerifiableCredential",
  "GlassesProofCredential",
  "VerifiableCredential",
  "PersonCredential",
] as const;

export type VerifiableCredentialType = typeof verifiableCredentialTypes[number];

export type VerifiableCredential = Awaited<ReturnType<typeof generateVC>>;

export const generateVC = async <Subject extends BaseSubject>(
  credentialSubject: Subject,
  type: VerifiableCredentialType[],
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
    credentialSubject: credentialSubject,
  });
};
