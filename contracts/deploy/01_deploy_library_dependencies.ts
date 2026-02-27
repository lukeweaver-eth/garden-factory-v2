import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Step 1: Deploy libraries with dependencies
 * - GardenIndexConfigurable (needs GardenHTML + GardenContributions)
 * - GardenEssay (needs GardenHTML)
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("\n=== Step 1: Deploy Library Dependencies ===\n");

  const gardenHTML = await get("GardenHTML");
  const gardenContributions = await get("GardenContributions");

  const gardenIndex = await deploy("GardenIndexConfigurable", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
    libraries: {
      GardenHTML: gardenHTML.address,
      GardenContributions: gardenContributions.address,
    },
  });

  const gardenEssay = await deploy("GardenEssay", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
    libraries: {
      GardenHTML: gardenHTML.address,
    },
  });

  console.log(`  GardenIndexConfigurable: ${gardenIndex.address}`);
  console.log(`  GardenEssay:             ${gardenEssay.address}`);
};

export default func;
func.tags = ["LibraryDeps"];
func.dependencies = ["Libraries"];
