"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { VerifiableCredential } from "../server/trpc/schemas";
import { trpc } from "../utils/trpc";
import { ClientOnly } from "./utils";
import { VcCard } from "./VcCard";

export default function Wallet() {
  const { address, isConnected } = useAccount();
  const utils = trpc.useContext();

  const [myVerifiableCredentials, setMyVerifiableCredentials] = useState<VerifiableCredential[]>(
    []
  );

  const getVc = useCallback(async () => {
    if (address) {
      const vcs = await utils.client.wallet.list.query();
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
              return <VcCard vc={vc} />;
            })}
          </div>
        )}
      </ClientOnly>
      <ConnectButton />
    </div>
  );
}
