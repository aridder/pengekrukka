import { NextPage } from "next";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";
import { VcCard } from "../components/VcCard";
import { VerifiableCredential } from "../server/trpc/schemas";
import { trpc } from "../utils/trpc";

const WelfarePage: NextPage = () => {
  const { address, isConnected } = useAccount();
  const utils = trpc.useContext();

  const [vc, setVc] = useState<null | VerifiableCredential>(null);

  const getVc = useCallback(async () => {
    if (address) {
      const personalCredential = await utils.client.wallet.getPersonalCredential.query({
        publicKey: address as string,
      });

      const { vc } = await utils.client.welfare.getWelfareVc.query(personalCredential);
      setVc(vc);
    }
  }, [address, isConnected]);

  return (
    <Layout>
      <div>
        <button onClick={getVc}>Get Welfare VC</button>
        {vc && <VcCard vc={vc} />}
      </div>
    </Layout>
  );
};

export default WelfarePage;
