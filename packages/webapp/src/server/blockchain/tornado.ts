import {
  CBToken,
  CBToken__factory,
  ERC20Tornado,
  ERC20Tornado__factory,
} from "@pengekrukka/contracts/lib/typechain";
import { ethers, Signer } from "ethers";

export const getTornadoContractFor = (signer: Signer) => {
  const address = process.env.TORNADO_ADDRESS;
  if (!address) {
    throw new Error("Tornado Address not found in environment");
  }

  const tornado = ERC20Tornado__factory.connect(address, signer) as ERC20Tornado;
  return tornado;
};

export const getNokTokenFor = (signer: Signer) => {
  const address = process.env.NOK_ADDRESS;
  if (!address) {
    throw new Error("NOK Address not found in environment");
  }

  const nokToken = CBToken__factory.connect(address, signer) as CBToken;
  return nokToken;
};
