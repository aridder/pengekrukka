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
              You'll recieve 2500,- NOK in support based on your income
            </p>
            <div className="flex">
              <VcCard vc={vc} />
              <div className="mx-4 flex flex-col self-end">
                <Button onClick={() => transferToWallet(vc)}>Transfer to digital wallet</Button>
                {/*TODO: enable if PDF is enabled */}
                <Button disabled>Print proof</Button>
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
    <Layout className="bg-green-100">
      <h1 className="text-6xl">Pengekrukka</h1>
      <div>
        <WelfareCredentials vcs={generatedVCs}></WelfareCredentials>
      </div>
      {!optician && (
        <div className="my-4 mx-5">
          <h2 className="my-1 text-2xl">Choose optician for support</h2>
          <div>
            <select
              defaultValue={""}
              className="border-1 mx-5 rounded-md border-2 border-solid border-black bg-white p-2"
              onChange={(event) => {
                setOptician(event.target.value as OpticianName);
              }}
            >
              <option selected={undefined}>-- Choose an optician --</option>
              {Object.values(OpticianName).map((opticianName) => (
                <option
                  key={opticianName}
                  value={opticianName}
                  disabled={opticianName !== OpticianName.TestOptician}
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
          <h2 className="my-1 text-2xl">Upload proof</h2>
          <h2 className="text-xl text-gray-500">Gives a valid proof at {optician}</h2>
          <UploadSection
            address={address as string}
            type={VerifiableCredentialType.GlassesProofCredential}
            onCredentialSelected={async (credential) => {
              if (!isGlassesCredential(credential)) {
                alert("The proof has to be a proof of bad eyesight!");
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
