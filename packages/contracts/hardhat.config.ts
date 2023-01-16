import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config({ path: "./../../../.env.development" });

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      /* forking: {
        url: process.env.RPC_URL!,
        //   //
        //   // blockNumber: 3329314, <- If you want to fork from a specific block
      }, */
      allowUnlimitedContractSize: true,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.8.17",
      },
      {
        version: "0.8.6",
      },
      {
        version: "0.7.0",
      },
      {
        version: "0.5.17",
      },
    ],
  },
  namedAccounts: {
    deployer: 0,
  },
};

export default config;
