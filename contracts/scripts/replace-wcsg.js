// Replace test WCSG with real WCSG Sepolia deployment
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Replacing test WCSG with real WCSG Sepolia");
  console.log("Deployer:", deployer.address);
  console.log();

  // Get factory address from deployment
  const factoryDeployment = await hre.deployments.get("GardenFactory");
  const factoryAddress = factoryDeployment.address;
  const factory = await ethers.getContractAt("GardenFactory", factoryAddress);

  console.log("GardenFactory:", factoryAddress);

  // Real WCSG Sepolia address (from worldcomputersculpturegarden-main deployments)
  const wcsgSepoliaAddress = "0x6CDb67AeA00347f82Aa1cc926D8B006E9385c83B";
  console.log("WCSG Sepolia:", wcsgSepoliaAddress);
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

  // Remove garden 1 (test WCSG)
  console.log("=== Step 1: Removing test WCSG (garden 1) ===");
  const tx1 = await factory.removeGarden(1);
  console.log("Transaction:", tx1.hash);
  await tx1.wait();
  console.log("✅ Test WCSG removed");
  console.log();

  // Add real WCSG
  console.log("=== Step 2: Adding real WCSG Sepolia ===");
  const tx2 = await factory.addGarden(wcsgSepoliaAddress);
  console.log("Transaction:", tx2.hash);
  await tx2.wait();
  console.log("✅ Real WCSG added");
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
