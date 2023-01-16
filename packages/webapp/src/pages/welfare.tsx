import { NextPage } from "next";
import React from "react";
import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";
import { UploadSection } from "../components/UploadSection";
import { Button } from "../components/utils";
import { VcCard } from "../components/VcCard";
import { isGlassesCredential, VerifiableCredential } from "../server/trpc/schemas";
import { OpticianName, VerifiableCredentialType } from "../server/trpc/vc-shared";
import { trpc } from "../utils/trpc";

const WelfareCredentials = (props: { vcs: VerifiableCredential[] }) => {
  const utils = trpc.useContext();
  const transferToWallet = (credential: VerifiableCredential) => {
    utils.client.wallet.save.mutate(credential);
  };
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
              <div className="flex flex-col self-end mx-4">
                <Button onClick={() => transferToWallet(vc)}>Overfør til lommebok</Button>
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

const WelfarePage: NextPage = () => {
  const { address } = useAccount();
  const utils = trpc.useContext();
  const [generatedVCs, setGeneratedVCs] = React.useState<VerifiableCredential[]>([]);
  const [optician, setOptician] = React.useState<OpticianName | null>(null);

  return (
    <Layout>
      <h1 className="text-6xl">Statens Støtteordnings System</h1>
      <div>
        <WelfareCredentials vcs={generatedVCs}></WelfareCredentials>
      </div>
      {!optician && (
        <div className="my-4 mx-5">
          <h2 className="my-1 text-2xl">Velg Brilleforetning for brillestøtte</h2>
          <div>
            <select
              defaultValue={""}
              className="border-1 mx-5 rounded-md border-2 border-solid border-black bg-white p-2"
              onChange={(event) => {
                setOptician(event.target.value as OpticianName);
              }}
            >
              <option selected={undefined}>-- Velg en optiker --</option>
              {Object.values(OpticianName).map((opticianName) => (
                <option
                  key={opticianName}
                  value={opticianName}
                  disabled={opticianName !== OpticianName.Hansens_Brilleforetning}
                >
                  {opticianName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      {optician && generatedVCs.length === 0 && (
        <div className="my-10 mx-5 max-w-xl">
          <h2 className="my-1 text-2xl">Last opp brillebevis</h2>
          <h2 className="text-xl text-gray-500">Gir gyldig bevis hos {optician}</h2>
          <UploadSection
            address={address as string}
            type={VerifiableCredentialType.GlassesProofCredential}
            onCredentialSelected={async (credential) => {
              if (!isGlassesCredential(credential)) {
                alert("Beviset må være et brillebevis");
              } else {
                const generatedVC = await utils.client.welfare.convertWelfareToken.mutate({
                  credential,
                  optician,
                });
                setGeneratedVCs([generatedVC, ...generatedVCs]);
              }
            }}
          />
        </div>
      )}
    </Layout>
  );
};

export default WelfarePage;
