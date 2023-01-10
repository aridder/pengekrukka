import { VerifiableCredential } from "@pengekrukka/vc-shared";
import { NextPage } from "next";
import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";
import { Button } from "../components/utils";
import { VcCard } from "../components/VcCard";
import { trpc } from "../utils/trpc";

const WelfareCredentials = (props: { vcs: VerifiableCredential[] }) => {
  return (
    <div>
      {props.vcs.map((vc) => {
        return <VcCard vc={vc} />;
      })}
    </div>
  );
};

const useWalletVcs = (address: string) => {
  const utils = trpc.useContext();

  const [credentials, setCredentials] = React.useState<VerifiableCredential[]>([]);

  const listWallet = async () => {
    const credentials = await utils.client.wallet.list.query();
    setCredentials(credentials);
  };

  useEffect(() => {
    listWallet();
  }, [address]);

  return credentials;
};

const UploadSection = (props: {
  address: string;
  receiveWelfareVC: (welfareVC: VerifiableCredential) => void;
}) => {
  const utils = trpc.useContext();
  const [showWalletCredentials, setWalletCredentials] = React.useState(false);
  //FIXME: use this instead of mock before merging
  const _credentials = useWalletVcs(props.address);
  const credentials: VerifiableCredential[] = [
    {
      credentialSubject: {
        id: `did:ethr:${props.address}`,
        //TODO: add something more
      },
      "@context": ["https://folkeregisteret.no/vc-did-specification"],
      issuer: {
        id: "did:ethr:0xtestvalue-folkeregister-did",
      },
      proof: {
        type: "proof2020",
        jwt: "testvalue",
      },
      type: "GlassesProofCredential",
      issuanceDate: new Date().toISOString(),
    },
    {
      credentialSubject: {
        id: `did:ethr:${props.address}`,
        //TODO: add something more
      },
      "@context": ["https://folkeregisteret.no/vc-did-specification"],
      issuer: {
        id: "did:ethr:0xtestvalue-folkeregister-did",
      },
      proof: {
        type: "proof2020",
        jwt: "testvalue",
      },
      type: "PersonCredential",
      issuanceDate: new Date().toISOString(),
    },
  ];

  const onConvert = async (credential: VerifiableCredential) => {
    const generatedVC = await utils.client.welfare.convertWelfareToken.mutate(credential);

    props.receiveWelfareVC(generatedVC);
  };

  if (showWalletCredentials) {
    return (
      <div>
        <h2>Dine bevis</h2>
        {credentials.map((credential) => (
          <div>
            <Button onClick={() => onConvert(credential)}>Konverter</Button>
            <VcCard vc={credential} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2>Last opp dine bevis</h2>
      <Button
        onClick={() => {
          setWalletCredentials(true);
        }}
      >
        Fra Lommebok
      </Button>
      <Button
        /* TODO: enable if we add support */
        disabled
        onClick={() => {
          /*TODO: if we add support for PDF */
        }}
      >
        Fra PDF
      </Button>
    </div>
  );
};

const WelfarePage: NextPage = () => {
  const { address } = useAccount();

  const [generatedVCs, setGeneratedVCs] = React.useState<VerifiableCredential[]>([]);

  return (
    <Layout>
      {address}
      <h1>Statens Støtteordnings System</h1>
      <div>
        <WelfareCredentials vcs={generatedVCs}></WelfareCredentials>
      </div>

      <div className="my-10 mx-5 max-w-xl bg-slate-100">
        <UploadSection
          address={address as string}
          receiveWelfareVC={(welfareVC) => {
            setGeneratedVCs([welfareVC, ...generatedVCs]);
          }}
        />
      </div>
    </Layout>
  );
};

export default WelfarePage;
