import { ethers } from "ethers";

//FIXME: use NB wallet instead of Metamask?
const login = async (provider: ethers.providers.Web3Provider) => {
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

export default { login };
