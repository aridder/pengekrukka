import { useAccount } from "wagmi";
import Layout from "../components/layout/Layout";
import { Glasses } from "../components/optician/Glasses";
import { UploadSection } from "../components/UploadSection";
import { ClientOnly } from "../components/utils";
import { GlassesCredential, VerifiableCredential } from "../server/trpc/schemas";
import { VerifiableCredentialType } from "../server/trpc/vc-shared";

function isGlassesCredential(credential: VerifiableCredential): credential is GlassesCredential {
  return (
    credential.type.includes(VerifiableCredentialType.GlassesProofCredential) &&
    (credential as GlassesCredential).credentialSubject.amount !== undefined &&
    (credential as GlassesCredential).credentialSubject.amount !== null
  );
}

const DiscountSection = (props: { address: string | undefined }) => {
  if (!props.address) {
    return <p>Logg inn for å legge til støtte</p>;
  }

  const onUpload = (credential: VerifiableCredential) => {
    if (!isGlassesCredential(credential)) {
      alert("Kun brillebevis tillat");
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
