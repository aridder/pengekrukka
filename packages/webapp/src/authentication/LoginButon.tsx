import { ethers } from "ethers";
import React from "react";
import actions from "./actions";

export const LoginButton = () => {
  const [signer, setSigner] = React.useState<ethers.providers.JsonRpcSigner>();
  const [address, setAddress] = React.useState<string>();

  const onLoginClick = async () => {
    const signer = await actions.login(
      new ethers.providers.Web3Provider((window as any).ethereum)
    );

    setSigner(signer);
    setAddress(await signer.getAddress());
  };

  return <button onClick={onLoginClick}>Login</button>;
};
