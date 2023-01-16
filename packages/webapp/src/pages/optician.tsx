import React, { useState } from "react";
import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";
import { Glasses } from "../components/optician/Glasses";
import { UploadSection } from "../components/UploadSection";
import { Button, ClientOnly } from "../components/utils";
import {
  isWelfareCredential,
  VerifiableCredential,
  WelfareCredential
} from "../server/trpc/schemas";
import { VerifiableCredentialType } from "../server/trpc/vc-shared";

const DiscountSection = (props: {
  address: string | undefined;
  onDiscount: (credential: WelfareCredential) => void;
}) => {
  if (!props.address) {
    return <p>Logg inn for å legge til støtte</p>;
  }

  const onUpload = (credential: VerifiableCredential) => {
    if (!isWelfareCredential(credential)) {
      alert("Kun brillestøtte tillat");
    } else {
      props.onDiscount(credential);
    }
  };

  return (
    <UploadSection
      address={props.address}
      onCredentialSelected={onUpload}
      type={VerifiableCredentialType.WelfareCredential}
    />
  );
};

export default () => {
  const { address, isConnected } = useAccount();
  const [discountCredential, setDiscountCredential] = useState<WelfareCredential | null>(null);

  const PRICE = 2500;
  const [total, setTotal] = React.useState(PRICE);

  React.useEffect(() => {
    if (discountCredential) {
      setTotal(PRICE - discountCredential.credentialSubject.amount);
    }
  }, [discountCredential?.credentialSubject.amount]);

  return (
    <Layout>
      <div className="">
        <h1 className="text-6xl">Hansens Brilleforetning</h1>
        <Glasses price={PRICE} />
        {!discountCredential && (
          <ClientOnly>
            <DiscountSection address={address} onDiscount={setDiscountCredential} />
          </ClientOnly>
        )}
        {discountCredential && (
          <div className="text-gray-500">
            <b>Støtte: </b>
            <span>
              {PRICE} - {discountCredential.credentialSubject.amount}
            </span>
          </div>
        )}
        <div className="my-8 flex">
          <p className=""><b>Total:</b> {total}</p>
          <Button className="mx-4">Kjøp</Button>
        </div>
      </div>
    </Layout>
  );
};
