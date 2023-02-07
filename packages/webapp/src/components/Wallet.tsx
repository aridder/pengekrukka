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
      const vcs = await utils.client.wallet.list.query();
      setMyVerifiableCredentials(vcs);
    }
  }, [address, isConnected]);

  return (
    <div className="flex h-full flex-col items-center space-y-8 overflow-auto border-l-8 border-black bg-white">
      <h1 className="mt-4 text-4xl underline underline-offset-4">My digital wallet</h1>
      <ClientOnly>
        {!isConnected && <p>You have to be logged in to see your digital credentials</p>}
        {isConnected && (
          <div className="flex flex-col">
            <div>
              {myVerifiableCredentials.map((vc, index) => {
                return <VcCard vc={vc} key={index} />;
              })}
            </div>
            <Button className="self-center" onClick={getVc}>
              Get credentials
            </Button>
          </div>
        )}
      </ClientOnly>
      <ConnectButton />
    </div>
  );
}
