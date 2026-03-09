// Setup recursive structure on Sepolia: Factory exhibits itself + WCSG mainnet
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Setting up recursive garden structure on Sepolia");
  console.log("Deployer:", deployer.address);
  console.log();

  // Get factory address from deployment
  const factoryDeployment = await hre.deployments.get("GardenFactory");
  const factoryAddress = factoryDeployment.address;
  const factory = await ethers.getContractAt("GardenFactory", factoryAddress);

  console.log("GardenFactory:", factoryAddress);

  // Use real WCSG Sepolia deployment
  const wcsgAddress = "0x6CDb67AeA00347f82Aa1cc926D8B006E9385c83B";
  console.log("WCSG Sepolia (real):", wcsgAddress);
  console.log();

  // Verify factory Sculpture interface
  console.log("=== Verifying GardenFactory Sculpture Interface ===");
  console.log("title():", await factory.title());
  const factoryAuthors = await factory.authors();
  console.log("authors():", factoryAuthors);
  console.log("Last author (curator):", factoryAuthors[factoryAuthors.length - 1]);
  const factoryAddrs = await factory.addresses();
  console.log("addresses()[0]:", factoryAddrs[0]);
  console.log("text():", (await factory.text()).substring(0, 80) + "...");
  console.log("urls():", await factory.urls());
  console.log();

  // Check current garden count
  const currentCount = await factory.gardenCount();
  console.log("Current garden count:", currentCount.toString());

  if (currentCount > 0) {
    console.log("Current gardens:");
    for (let i = 0; i < currentCount; i++) {
      const g = await factory.garden(i);
      console.log(`  ${i}: ${g.unicodeSymbol} ${g.curatorName} - ${g.gardenAddr}`);
    }
  }
  console.log();

  // Step 1: Add factory to itself
  console.log("=== Step 1: Adding GardenFactory to itself ===");
  console.log("Calling addGarden(" + factoryAddress + ")...");

  const tx1 = await factory.addGarden(factoryAddress);
  console.log("Transaction:", tx1.hash);
  await tx1.wait();
  console.log("✅ Factory added to itself");

  const garden0 = await factory.garden(0);
  console.log("Garden 0:", garden0.curatorName, "-", garden0.gardenAddr);
  console.log();

  // Step 2: Add WCSG Sepolia to factory
  console.log("=== Step 2: Adding WCSG Sepolia to factory ===");
  console.log("Calling addGarden(" + wcsgAddress + ")...");
  console.log("Note: This will read metadata from WCSG test garden on Sepolia");

  const tx2 = await factory.addGarden(wcsgAddress);
  console.log("Transaction:", tx2.hash);
  await tx2.wait();
  console.log("✅ WCSG added to factory");

  const garden1 = await factory.garden(1);
  console.log("Garden 1:", garden1.curatorName, "-", garden1.gardenAddr);
  console.log();

  // Summary
  console.log("=== Recursive Structure Complete ===");
  const finalCount = await factory.gardenCount();
  console.log("Total gardens:", finalCount.toString());
  console.log();
  console.log("Garden list:");
  for (let i = 0; i < finalCount; i++) {
    const g = await factory.garden(i);
    console.log(`  ${i}: ${g.unicodeSymbol} ${g.curatorName} - ${g.gardenAddr}`);
  }
  console.log();

  console.log("✅ Factory now exhibits itself (garden 0) and WCSG Sepolia (garden 1)");
  console.log();
  console.log("Next step:");
  console.log("- View on Sepolia factory interface (update CONFIG to point to:", factoryAddress + ")");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
