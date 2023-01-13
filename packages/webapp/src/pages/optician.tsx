import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";
import { Glasses } from "../components/optician/Glasses";
import { UploadSection } from "../components/UploadSection";
import { ClientOnly } from "../components/utils";
import { isWelfareCredential, VerifiableCredential } from "../server/trpc/schemas";

const DiscountSection = (props: { address: string | undefined }) => {
  if (!props.address) {
    return <p>Logg inn for å legge til støtte</p>;
  }

  const onUpload = (credential: VerifiableCredential) => {
    if (!isWelfareCredential(credential)) {
      alert("Kun brillestøtte tillat");
    } else {
      alert("Skal legge til stoette paa " + credential.credentialSubject.amount);
    }
  };

  return <UploadSection address={props.address} onCredentialSelected={onUpload} />;
};

export default () => {
  const { address, isConnected } = useAccount();

  return (
    <Layout>
      <div>TODO: optician's store</div>
      <h1 className="text-6xl">Hansens Brilleforetning</h1>
      <Glasses price={2500} />
      <ClientOnly>
        <DiscountSection address={address} />
      </ClientOnly>
    </Layout>
  );
};
