import { ethers } from "ethers";
import { type NextPage } from "next";
import React from "react";

//FIXME: use NB wallet instead of Metamask?
const usePublicKey = () => {
  const [publicKey, setPublicKey] = React.useState<string | null>(null);
  React.useEffect(() => {
    (async () => {
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );

      await provider.send("eth_requestAccounts", []);

      const publicKey = await provider.getSigner().getAddress();
      setPublicKey(publicKey);
    })();
  }, []);

  return publicKey;
};

const login = async () => {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);

  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

const Home: NextPage = () => {
  /* const eidsivaUser = trpc.eidsiva.getUsageVC.useQuery({
    publicKey: publicKey ?? "NO KEY",
  }); */

  return <div>Logged in as {JSON.stringify({ message: "TODO" })}</div>;
};

export default Home;
