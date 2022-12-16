import { ethers } from "ethers";
import { type NextPage } from "next";
import React from "react";
import { Login } from "../components/authentication/Login";

const Home: NextPage = () => {
  /* const eidsivaUser = trpc.eidsiva.getUsageVC.useQuery({
    publicKey: publicKey ?? "NO KEY",
  }); */

  const [signer, setSigner] = React.useState<ethers.Signer>();

  return signer ? <div>FIXME: GUI</div> : <Login setSigner={setSigner} />;
};

export default Home;
