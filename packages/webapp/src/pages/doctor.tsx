import { NextPage } from "next";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";
import { trpc } from "../utils/trpc";

const DoctorPage: NextPage = () => {
  const { address, isConnected } = useAccount();
  const utils = trpc.useContext();

  const [vc, setVc] = useState<null | any>(null);

  const getVc = useCallback(async () => {
    if (address) {
      const vc = await utils.client.doctor.glassesProof.query({
        publicKey: address!,
      });
      setVc(vc);
    }
  }, []);

  return (
    <Layout>
      <div>
        <button onClick={getVc}>Get VC</button>
        {vc && JSON.stringify(vc)}
      </div>
    </Layout>
  );
};

export default DoctorPage;
