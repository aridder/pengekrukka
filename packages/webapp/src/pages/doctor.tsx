import {
  BaseSubject,
  VerifiableCredential,
  VerifiableCredentialType,
} from "@pengekrukka/vc-shared";
import { NextPage } from "next";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";
import { VcCard } from "../components/VcCard";
import { trpc } from "../utils/trpc";

const DoctorPage: NextPage = () => {
  const { address } = useAccount();
  const utils = trpc.useContext();

  const [vc, setVc] = useState<null | VerifiableCredential>(null);

  const getVc = useCallback(async () => {
    if (address) {
      const { vc } = await utils.client.doctor.glassesProof.query({
        publicKey: address!,
      });
      setVc(vc);
    }
  }, []);

  return (
    <Layout>
      <div>
        <button onClick={getVc}>Get VC</button>
        {vc && (
          <VcCard
            subject={vc.credentialSubject as BaseSubject}
            types={(vc.type as VerifiableCredentialType[]) || []}
          />
        )}
      </div>
    </Layout>
  );
};

export default DoctorPage;
