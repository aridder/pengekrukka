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
        return (
          <div className="p-10">
            <p className="text-md my-4 max-w-lg">
              Basert på din inntekt har vi kommet frem til at du kan motta 2500,- i brillestøtte
            </p>
            <div className="flex">
              <VcCard vc={vc} />
              <div className="flex flex-col self-end">
                <Button
                  onClick={() => {
                    //FIXME: IMPLEMENT
                    alert("NOT IMPLEMENTED");
                  }}
                >
                  Overfør til lommebok
                </Button>
                {/*TODO: enable if PDF is enabled */}
                <Button disabled>Skriv ut</Button>
              </div>
            </div>
          </div>
        );
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
      type: ["GlassesProofCredential"],
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
      type: ["PersonCredential"],
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
        <h2 className="text-3xl">Dine bevis</h2>

        {credentials.map((credential) => (
          <div key={credential.id} className="my-2 flex space-x-4">
            <VcCard vc={credential} />
            <Button className="max-h-10 self-end" onClick={() => onConvert(credential)}>
              Konverter
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h2 className="my-4 text-lg underline">Last opp dine bevis</h2>
      <div className="flex max-w-lg space-x-4">
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
    </div>
  );
};

const WelfarePage: NextPage = () => {
  const { address } = useAccount();

  const [generatedVCs, setGeneratedVCs] = React.useState<VerifiableCredential[]>([]);

  return (
    <Layout>
      <h1 className="text-4xl">Statens Støtteordnings System</h1>
      <div>
        <WelfareCredentials vcs={generatedVCs}></WelfareCredentials>
      </div>

      {generatedVCs.length === 0 && (
        <div className="my-10 mx-5 max-w-xl">
          <UploadSection
            address={address as string}
            receiveWelfareVC={(welfareVC) => {
              setGeneratedVCs([welfareVC, ...generatedVCs]);
            }}
          />
        </div>
      )}
    </Layout>
  );
};

export default WelfarePage;
