import { VerifiableCredential } from "@pengekrukka/vc-shared";
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
    //FIXME: get the VC from user?
    if (address) {
      const { vc } = await utils.client.doctor.glassesProof.query({
        credentialSubject: {
          id: "did:ethr:0xFIXME-personal-did",
          //TODO: add something more
        },
        "@context": ["https://folkeregisteret.no/vc-did-specification"],
        issuer: {
          id: "did:ethr:0xFIXME-folkeregister-did",
        },
        proof: {
          type: "proof2020",
          jwt: "FIXME",
        },
        type: "PersonCredential",
        issuanceDate: new Date().toISOString(),
      });
      setVc(vc);
    }
  }, []);

  return (
    <Layout>
      <div>
        <button onClick={getVc}>Get VC</button>
        {vc && <VcCard vc={vc} />}
      </div>
    </Layout>
  );
};

export default DoctorPage;
