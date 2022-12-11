import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const name = "EthereumDIDRegistry";
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (hre.network.name === "hardhat") {
  } else {
    throw new Error("This network is not listed in hardhat.config.ts");
  }

  const res = await deploy(name, {
    from: deployer,
    args: [],
  });
};

export { name };
export default func;
func.tags = [name];
