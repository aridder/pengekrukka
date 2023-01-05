"use client";
import { VerifiableCredential } from "@pengekrukka/vc-shared";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { formatDate, shortenDid } from "../utils";
import { trpc } from "../utils/trpc";
import { ClientOnly } from "./utils";

export default function Wallet() {
  const { address, isConnected } = useAccount();
  const utils = trpc.useContext();

  const [myVerifiableCredentials, setMyVerifiableCredentials] = useState<VerifiableCredential[]>(
    []
  );

  const getVc = useCallback(async () => {
    if (address) {
      const vcs = await utils.client.wallet.list.query({ publicKey: address! });
      setMyVerifiableCredentials(vcs);
    }
  }, [address, isConnected]);

  return (
    <div className="flex h-full flex-col items-center space-y-8 bg-green-600">
      <p className="mt-4">Mine digitale bevis</p>
      <ClientOnly>
        {!isConnected && <p>Du må være logget inn for å se dine digitale bevis</p>}
        {isConnected && (
          <div>
            <button onClick={getVc}>Hent bevis</button>
            {myVerifiableCredentials.map((vc, index) => {
              return (
                <div
                  key={index}
                  className="flex h-36 w-3/4 flex-col items-center justify-center rounded-xl bg-slate-400"
                >
                  <div className="flex flex-col">
                    {vc.type && <p className="text-s font-bold">{vc.type[vc.type.length - 1]}</p>}
                    <p>{formatDate(vc.issuanceDate)}</p>
                    {vc.credentialSubject.id && <p>{shortenDid(vc.credentialSubject.id)}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ClientOnly>
    </div>
  );
}
