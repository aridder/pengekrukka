"use client";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { VerifiableCredential } from "../server/trpc/schemas";
import { trpc } from "../utils/trpc";
import { Button, ClientOnly } from "./utils";
import { VcCard } from "./VcCard";

export default function Wallet() {
  const { address, isConnected } = useAccount();
  const utils = trpc.useContext();

  const [myVerifiableCredentials, setMyVerifiableCredentials] = useState<VerifiableCredential[]>(
    []
  );

  useEffect(() => {
    utils.client.wallet.generatePersonalCredential
      .mutate({ publicKey: address as string })
      .then(() => getVc());
  }, []);

  /** Polling for backend updates.
   * TODO: listen with websockets
   */
  useEffect(() => {
    const id = setInterval(() => {
      console.log("Get VC");
      getVc();
    }, 2000);

    return () => clearInterval(id);
  }, []);

  const getVc = useCallback(async () => {
    if (address) {
      const vcs = await utils.client.wallet.list.query({ publicKey: address as string });
      setMyVerifiableCredentials(vcs);
    }
  }, [address, isConnected]);

  return (
    <div className="flex h-full flex-col items-center space-y-8 bg-green-400">
      <p className="mt-4">Mine digitale bevis</p>
      <ClientOnly>
        {!isConnected && <p>Du må være logget inn for å se dine digitale bevis</p>}
        {isConnected && (
          <div className="flex flex-col">
            <Button onClick={getVc}>Hent bevis</Button>
            <div>
              {myVerifiableCredentials.map((vc, index) => {
                return <VcCard vc={vc} key={index} />;
              })}
            </div>
          </div>
        )}
      </ClientOnly>
    </div>
  );
}
