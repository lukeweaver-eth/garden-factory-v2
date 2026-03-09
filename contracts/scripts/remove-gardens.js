// Remove specific gardens from factory
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Removing gardens from Factory");
  console.log("Deployer:", deployer.address);
  console.log();

  // Get factory address from deployment
  const factoryDeployment = await hre.deployments.get("GardenFactory");
  const factoryAddress = factoryDeployment.address;
  const factory = await ethers.getContractAt("GardenFactory", factoryAddress);

  console.log("GardenFactory:", factoryAddress);

  // Check current garden count
  const initialCount = await factory.gardenCount();
  console.log("Current garden count:", initialCount.toString());
  console.log();

  // Show current gardens
  console.log("Current gardens:");
  for (let i = 0; i < initialCount; i++) {
    const g = await factory.garden(i);
    console.log(`  ${i}: ${g.unicodeSymbol} ${g.curatorName} - ${g.gardenAddr}`);
  }
  console.log();

  // Remove gardens 0, 1, 2
  // Note: When we remove index 0, what was index 1 becomes index 0, etc.
  // So we need to remove index 0 three times
  console.log("Removing first 3 gardens (always removing index 0)...");

  for (let i = 0; i < 3; i++) {
    console.log(`\nRemoving garden at index 0...`);
    const g = await factory.garden(0);
    console.log(`  Current garden 0: ${g.curatorName} - ${g.gardenAddr}`);

    const tx = await factory.removeGarden(0);
    console.log(`  Transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`  ✅ Removed`);
  }

  // Show final gardens
  const finalCount = await factory.gardenCount();
  console.log("\n=== Final Garden List ===");
  console.log("Total gardens:", finalCount.toString());
  console.log();

  for (let i = 0; i < finalCount; i++) {
    const g = await factory.garden(i);
    console.log(`  ${i}: ${g.unicodeSymbol} ${g.curatorName} - ${g.gardenAddr}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
