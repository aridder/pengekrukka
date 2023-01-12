import React, { useEffect } from "react";
import { VerifiableCredential } from "../server/trpc/schemas";
import { trpc } from "../utils/trpc";
import { Button } from "./utils";
import { VcCard } from "./VcCard";

const useWalletVcs = (address: string) => {
  const utils = trpc.useContext();

  const [credentials, setCredentials] = React.useState<VerifiableCredential[]>([]);

  const listWallet = async () => {
    const credentials = await utils.client.wallet.list.query();
    console.log("Got credentials", credentials);
    setCredentials(credentials);
  };

  useEffect(() => {
    listWallet();
  }, [address]);

  return credentials;
};

export const UploadSection = (props: {
  address: string;
  onCredentialSelected: (welfareVC: VerifiableCredential) => void;
}) => {
  const [showWalletCredentials, setWalletCredentials] = React.useState(false);

  const credentials = useWalletVcs(props.address);

  if (showWalletCredentials) {
    return (
      <div>
        <h2 className="text-3xl">Dine bevis</h2>

        {credentials.length === 0 && <p>Du har ingen bevis i din lommebok..</p>}
        {credentials.map((credential) => (
          <div key={credential.id} className="my-2 flex space-x-4">
            <VcCard vc={credential} />
            <Button
              className="max-h-10 self-end"
              onClick={() => props.onCredentialSelected(credential)}
            >
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
