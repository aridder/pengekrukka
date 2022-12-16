import { ethers } from "ethers";

const login = async (provider: ethers.providers.Web3Provider) => {
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

export default { login };
