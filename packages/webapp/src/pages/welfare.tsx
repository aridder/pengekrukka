import { NextPage } from "next";
import React from "react";
import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";
import { UploadSection } from "../components/UploadSection";
import { Button } from "../components/utils";
import { VcCard } from "../components/VcCard";
import { GlassesCredential, VerifiableCredential } from "../server/trpc/schemas";
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
              <div className="flex flex-col self-end">
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
            onCredentialSelected={async (assumedPersonalCredential) => {
              //THINKABOUT: how to handle the user selecting anything other than a personal credential

              const generatedVC = await utils.client.welfare.convertWelfareToken.mutate(
                assumedPersonalCredential as GlassesCredential
              );
              setGeneratedVCs([generatedVC, ...generatedVCs]);
            }}
          />
        </div>
      )}
    </Layout>
  );
};

export default WelfarePage;
