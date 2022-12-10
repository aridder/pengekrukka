import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const name = "TokenLock";
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer, tokenOwner } = await getNamedAccounts();

  const nokAddress: string | undefined = process.env.NOK_ADDRESS;

  if (hre.network.name === "hardhat") {
  } else {
    throw new Error("This network is not listed in hardhat.config.ts");
  }

  const now = Math.round(Date.now() / 1000);
  const oneWeek = 7 * 24 * 60 * 60;

  const res = await deploy("TokenLock", {
    from: deployer,
    args: [nokAddress, now + oneWeek, 0, "MyLock", "ML"],
  });
};

export { name };
export default func;
func.tags = [name];
