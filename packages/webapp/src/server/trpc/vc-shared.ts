import { VCIssuer } from "@symfoni/vc-tools";
import { ethers } from "ethers";
import { VerifiableCredential } from "./schemas";

export type BaseSubject = {
  id: string;
};

export type VCConfig = {
  mnemonic: string;
  rpcUrl: string;
};

export enum VerifiableCredentialType {
  WelfareCredential = "WelfareCredential",
  GlassesProofCredential = "GlassesProofCredential",
  VerifiableCredential = "VerifiableCredential",
  PersonCredential = "PersonCredential",
}

export const generateVC = async <Subject extends BaseSubject>(
  credentialSubject: Subject,
  type: VerifiableCredentialType[],
  options: VCConfig
): Promise<VerifiableCredential> => {
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

  const vc = await issuer.createVC({
    type: type,
    credentialSubject: credentialSubject,
  });

  return vc as VerifiableCredential;
};
