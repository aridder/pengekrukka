import { ethers } from "ethers";
import actions from "./actions";

export const Login = (props: {
  setSigner: (signer: ethers.providers.JsonRpcSigner) => void;
}) => {
  const onLoginClick = async () => {
    const signer = await actions.login(
      new ethers.providers.Web3Provider((window as any).ethereum)
    );

    props.setSigner(signer);
  };

  return (
    <div>
      <button onClick={onLoginClick}>Logg inn til pengekrukka</button>
    </div>
  );
};
