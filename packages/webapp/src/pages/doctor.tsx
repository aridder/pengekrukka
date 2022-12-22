import { sign } from "crypto";
import { ethers } from "ethers";
import { NextPage } from "next";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { Login } from "../components/authentication/Login";
import Layout from "../components/layout/Layout";
import { trpc } from "../utils/trpc";

const DoctorPage: NextPage = () => {
  const { address, isConnected } = useAccount();
  const utils = trpc.useContext();

  const [vc, setVc] = useState<null | any>(null);

  const getVc = useCallback(async () => {
    // const publicKey = await signer?.getAddress();
    // console.log("publicKey", publicKey);
    // console.log("signer", signer);

    if (address) {
      console.log("address", address);
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
