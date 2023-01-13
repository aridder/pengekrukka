"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useCallback, useEffect, useState } from "react";
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

  /**
   * In this hackathon implementation, this call will
   * also generate the credential as if it came from
   * Folkeregisteret.
   *
   * The `useRef`-call is a **HACK** to ensure
   * that the credential endpoint is only called
   * once, avoiding a race condition where we'd
   * end up with two personal credentials.
   */
  const called = React.useRef(false);
  useEffect(() => {
    if (address && !called.current) {
      called.current = true;
      utils.client.wallet.getPersonalCredential.query({ publicKey: address });
    }
  }, []);

  /** Polling for backend updates.
   * TODO: listen with websockets
   */
  useEffect(() => {
    const id = setInterval(() => {
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
      <ConnectButton />
    </div>
  );
}
