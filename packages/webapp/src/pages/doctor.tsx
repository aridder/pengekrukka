import { NextPage } from "next";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";
import { Button } from "../components/utils";
import { VcCard } from "../components/VcCard";
import { VerifiableCredential } from "../server/trpc/schemas";
import { trpc } from "../utils/trpc";

const DoctorPage: NextPage = () => {
  const { address } = useAccount();
  const utils = trpc.useContext();

  const [vc, setVc] = useState<null | VerifiableCredential>(null);

  const getVc = useCallback(async () => {
    //FIXME: get the VC from user?
    if (address) {
      const personalCredential = await utils.client.wallet.getPersonalCredential.query({
        publicKey: address as string,
      });
      const vc = await utils.client.doctor.glassesProof.query(personalCredential);

      setVc(vc);
    }
  }, []);

  return (
    <Layout className="bg-yellow-100">
      <Heading />
      {!vc && (
        <Button className="my-10" onClick={getVc}>
          Hent brillebevis
        </Button>
      )}
      {vc && <VCSection vc={vc} />}
    </Layout>
  );
};

export default DoctorPage;

const VCSection = (props: { vc: VerifiableCredential }) => {
  const utils = trpc.useContext();

  return (
    <div className="flex">
      <VcCard vc={props.vc} />
      <div className="mx-2 flex flex-col gap-2 place-self-end">
        <Button disabled onClick={() => {} /**FIXME: Something */}>
          Last ned som PDF
        </Button>
        <Button
          onClick={() => {
            utils.client.wallet.save.mutate(props.vc);
          }}
        >
          Flytt til digital lommebok
        </Button>
      </div>
    </div>
  );
};

const Heading = () => (
  <div className=" mx-auto max-w-xl">
    <h1 className=" py-4 text-4xl underline underline-offset-4">
      Din Journal hos legekontor Jensen
    </h1>
    <h2 className="flex-auto text-left">Du har mottat et digitalt bevis!</h2>
  </div>
);
