import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Step 0: Deploy independent libraries
 * - GardenHTML: HTML wrapper utilities
 * - GardenContributions: Guestbook rendering
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("\n=== Step 0: Deploy Independent Libraries ===\n");

  const gardenHTML = await deploy("GardenHTML", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });

  const gardenContributions = await deploy("GardenContributions", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });

  console.log(`  GardenHTML:          ${gardenHTML.address}`);
  console.log(`  GardenContributions: ${gardenContributions.address}`);
};

export default func;
func.tags = ["Libraries"];
