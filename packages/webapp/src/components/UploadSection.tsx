import React, { useEffect } from "react";
import { VerifiableCredential } from "../server/trpc/schemas";
import { VerifiableCredentialType } from "../server/trpc/vc-shared";
import { trpc } from "../utils/trpc";
import { Button } from "./utils";
import { VcCard } from "./VcCard";

const useWalletVcs = (
  address: string,
  filter: (credential: VerifiableCredential) => boolean = () => true
) => {
  const utils = trpc.useContext();

  const [credentials, setCredentials] = React.useState<VerifiableCredential[]>([]);

  const listWallet = async () => {
    const credentials = await utils.client.wallet.list.query();
    setCredentials(credentials.filter(filter));
  };

  useEffect(() => {
    listWallet();
  }, [address]);

  return credentials;
};

export const UploadSection = (props: {
  address: string;
  onCredentialSelected: (welfareVC: VerifiableCredential) => void;
  type: VerifiableCredentialType;
}) => {
  const [showWalletCredentials, setWalletCredentials] = React.useState(false);

  const credentials = useWalletVcs(props.address, (credential) =>
    credential.type.includes(props.type)
  );

  if (showWalletCredentials) {
    return (
      <div>
        <h2 className="text-3xl">Your relevant proofs</h2>

        {credentials.length === 0 && <p>You've no proofs in your wallet..</p>}
        {credentials.map((credential) => (
          <div key={credential.id} className="my-2 flex space-x-4">
            <VcCard vc={credential} />
            <Button
              className="max-h-10 self-end"
              onClick={() => props.onCredentialSelected(credential)}
            >
              Last opp
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h2 className="my-4 text-lg underline">Upload your proofs</h2>
      <div className="flex max-w-lg space-x-4">
        <Button
          onClick={() => {
            setWalletCredentials(true);
          }}
        >
          From digital wallet
        </Button>
        <Button
          /* TODO: enable if we add support */
          disabled
          onClick={() => {
            /*TODO: if we add support for PDF */
          }}
        >
          From PDF
        </Button>
      </div>
    </div>
  );
};
