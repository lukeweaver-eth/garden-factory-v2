import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Step 3: Deploy GardenFactory
 *
 * The factory is now very simple — it takes a single constructor arg
 * (the GardenTemplateDeployer address) and delegates all deployment
 * logic to it.
 *
 * Compared to the split deployer approach:
 * - Old: constructor(address deployerA, address deployerB)
 * - New: constructor(address deployer)
 *
 * The factory itself is lightweight: garden registry, event emission,
 * FlowerGuestbook, and the ERC-5219 web interface.
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("\n=== Step 3: Deploy GardenFactory ===\n");

  const templateDeployer = await get("GardenTemplateDeployer");

  const factory = await deploy("GardenFactory", {
    from: deployer,
    args: [templateDeployer.address],
    log: true,
    waitConfirmations: 1,
  });

  // Print summary
  const gardenHTML = await get("GardenHTML");
  const gardenContributions = await get("GardenContributions");
  const gardenIndex = await get("GardenIndexConfigurable");
  const gardenEssay = await get("GardenEssay");

  console.log(`\n${"=".repeat(60)}`);
  console.log("Deployment Complete");
  console.log("=".repeat(60));
  console.log(`  GardenHTML:              ${gardenHTML.address}`);
  console.log(`  GardenContributions:     ${gardenContributions.address}`);
  console.log(`  GardenIndexConfigurable: ${gardenIndex.address}`);
  console.log(`  GardenEssay:             ${gardenEssay.address}`);
  console.log(`  GardenTemplateDeployer:  ${templateDeployer.address}`);
  console.log(`  GardenFactory:           ${factory.address}`);
  console.log("=".repeat(60));
  console.log(`\n  Update CONFIG.FACTORY_ADDRESS in index.html to:`);
  console.log(`  ${factory.address}\n`);
};

export default func;
func.tags = ["Factory", "GardenFactory"];
func.dependencies = ["TemplateDeployer"];
