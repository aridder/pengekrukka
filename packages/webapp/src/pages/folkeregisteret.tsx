import { NextPage } from "next";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";
import { trpc } from "../utils/trpc";
import { VerifiableCredential } from "@pengekrukka/vc-shared";

const FolkeregisteretPage: NextPage = () => {
  const { address, isConnected } = useAccount();
  const utils = trpc.useContext();

  const [vc, setVc] = useState<VerifiableCredential | undefined>(undefined);

  const getPersonCredential = useCallback(async () => {
    if (address) {
      const vc = await utils.client.folkeregisteret.personCredential.query({
        publicKey: address!,
      });
      setVc(vc);
    }
  }, []);

  const addToWallet = useCallback(async (vc: VerifiableCredential) => {
    if (address && vc) {
      await utils.client.wallet.save.mutate({ vc });
    }
  }, []);

  return (
    <Layout>
      <div className="w-full overflow-auto">
        <button onClick={getPersonCredential}>Get PersonCredential VC</button>
        {vc && (
          <div>
            <p>VC: {JSON.stringify(vc, null, 2)}</p>
            <div className="flex flex-col">
              {/* <p>VC type: {vc.type[vc.type?.length - 1]}</p> */}
              <p>VC issuanceDate: {vc.issuanceDate}</p>
              {/* <p>VC credentialSubject.id: {vc.credentialSubject.id}</p> */}
              <button onClick={() => addToWallet(vc)}>Legg til i din wallet</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FolkeregisteretPage;
