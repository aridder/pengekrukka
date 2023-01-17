import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config({ path: "./../../.env.development" });

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.WELFARE_MNEMONIC!,
      },
      forking: {
        url: process.env.FORKING_RPC_NODE!,
        blockNumber: 4207655,
      },
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
  typechain: {
    outDir: "./src/typechain",
  },
  namedAccounts: {
    deployer: 0,
  },
};

export default config;
