import { NextPage } from "next";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";
import { VerifiableCredential } from "../server/trpc/schemas";
import { trpc } from "../utils/trpc";

const FolkeregisteretPage: NextPage = () => {
  const { address } = useAccount();
  const utils = trpc.useContext();

  const [vc, setVc] = useState<VerifiableCredential | undefined>(undefined);

  const getPersonCredential = useCallback(async () => {
    if (address) {
      const vc = await utils.client.folkeregisteret.personCredential.query({
        publicKey: address!,
      });
      setVc(vc);
    } else {
      console.error("no address: ", address);
    }
  }, [address]);

  const addToWallet = useCallback(
    async (vc: VerifiableCredential) => {
      if (address && vc) {
        await utils.client.wallet.save.mutate(vc);
      } else {
        console.error("no address && vc: ", address, vc);
      }
    },
    [address, vc]
  );

  return (
    <Layout>
      <div className="w-full overflow-auto">
        <button onClick={getPersonCredential}>Get PersonCredential VC</button>
        {vc && (
          <div>
            <div className="flex flex-col">
              <p>VC issuanceDate: {vc.issuanceDate}</p>
              <button onClick={() => addToWallet(vc)}>Legg til i din wallet</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FolkeregisteretPage;
