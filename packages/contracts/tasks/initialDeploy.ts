import { upgrades, ethers, network, upgrades } from "hardhat";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";

// task("initialDeploy", "Deploys a fresh TokenLock contract")
//   .addParam("owner", "Address of the owner", undefined, types.string)
//   .addParam("token", "Address of the token to lock", undefined, types.string)
//   .addParam(
//     "depositDeadline",
//     "Unix timestamp (seconds) of the deposit deadline",
//     undefined,
//     types.int
//   )
//   .addParam(
//     "lockDuration",
//     "Lock duration in seconds, period starts after the deposit deadline",
//     undefined,
//     types.int
//   )
//   .addParam(
//     "name",
//     "Name of the token representing the claim on the locked token",
//     undefined,
//     types.string
//   )
//   .addParam(
//     "symbol",
//     "Symbol of the token representing the claim on the locked token",
//     undefined,
//     types.string
//   )
//   .setAction(async (taskArgs, hre) => {
//     const [caller] = await ethers.getSigners();
//     console.log("Using the account:", caller.address);
//     const TokenLock = await ethers.getContractFactory("TokenLock");
//     const tokenLock = await upgrades.deployProxy(TokenLock, [
//       taskArgs.owner,
//       taskArgs.token,
//       taskArgs.depositDeadline,
//       taskArgs.lockDuration,
//       taskArgs.name,
//       taskArgs.symbol,
//     ]);

//     console.log("TokenLock proxy deployed to:", tokenLock.address);
//     console.log("Waiting for deploy transaction to be mined...");

//     await tokenLock.deployed();
//     const implementationAddress =
//       await upgrades.erc1967.getImplementationAddress(tokenLock.address);
//     console.log(
//       "Using the logic implementation contract deployed at:",
//       implementationAddress
//     );
//   });

// export {};
