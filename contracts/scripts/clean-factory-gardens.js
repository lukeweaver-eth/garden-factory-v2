// Clean up Factory gardens - remove duplicates
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Cleaning up Factory gardens");
  console.log("Deployer:", deployer.address);
  console.log();

  // Get factory address from deployment
  const factoryDeployment = await hre.deployments.get("GardenFactory");
  const factoryAddress = factoryDeployment.address;
  const factory = await ethers.getContractAt("GardenFactory", factoryAddress);

  console.log("GardenFactory:", factoryAddress);
  console.log();

  // Check current gardens
  const currentCount = await factory.gardenCount();
  console.log("Current garden count:", currentCount.toString());
  console.log("Current gardens:");
  for (let i = 0; i < currentCount; i++) {
    const g = await factory.garden(i);
    console.log(`  ${i}: ${g.unicodeSymbol} ${g.curatorName} - ${g.gardenAddr}`);
  }
  console.log();

  // Remove gardens 3 and 2 (reverse order to preserve indices)
  console.log("=== Removing duplicates (gardens 3 and 2) ===");

  const tx1 = await factory.removeGarden(3);
  console.log("Removing garden 3, transaction:", tx1.hash);
  await tx1.wait();
  console.log("✅ Garden 3 removed");

  const tx2 = await factory.removeGarden(2);
  console.log("Removing garden 2, transaction:", tx2.hash);
  await tx2.wait();
  console.log("✅ Garden 2 removed");
  console.log();

  // Show final gardens
  const finalCount = await factory.gardenCount();
  console.log("=== Final Garden List ===");
  console.log("Total gardens:", finalCount.toString());
  console.log();

  for (let i = 0; i < finalCount; i++) {
    const g = await factory.garden(i);
    console.log(`  ${i}: ${g.unicodeSymbol} ${g.curatorName} - ${g.gardenAddr}`);
  }
  console.log();
  console.log("✅ Factory now exhibits itself (garden 0) and WCSG Sepolia (garden 1)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
