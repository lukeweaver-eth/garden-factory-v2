const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Essay Garden with account:", deployer.address);

  const factoryAddr = "0xEb19b65a3C63Be6001A2A91320FF4f85CbE12207";
  const factory = await hre.ethers.getContractAt("GardenFactory", factoryAddr);

  console.log("\n=== Deploying Essay Garden ===\n");

  // Garden parameters
  const gardenTitle = "Essay Garden";
  const curatorName = "Luke Weaver";
  const curatorUrl = "https://x.com/lukeweaver_eth";
  const thankYouNames = ["fff", "113", "Yigit Duman"];
  const thankYouUrls = ["https://0xfff.love", "https://x.com/0x113d", "https://x.com/YigitDuman"];
  const unicodeSymbol = "ꖛ";
  const exhibitionText = "Welcome to my essay garden. As I write essays and develop conceptual frameworks, I'll share them here.";
  const gardenUrls = ["https://essay.garden"];
  const collectionTerm = "anthology";
  const backgroundColor = "#12141a";
  const textColor = "#fefefe";

  console.log("Creating garden...");
  try {
    const tx = await factory.createGarden(
      gardenTitle,
      curatorName,
      curatorUrl,
      thankYouNames,
      thankYouUrls,
      unicodeSymbol,
      exhibitionText,
      gardenUrls,
      collectionTerm,
      backgroundColor,
      textColor,
      { value: hre.ethers.parseEther("0.01") }
    );

    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    const gardenAddr = event.args.garden;
    const essayAddr = event.args.essay;

    console.log("\n✅ Essay Garden Deployed!\n");
    console.log("Garden contract:", gardenAddr);
    console.log("Essay contract:", essayAddr);
    console.log("\n=== View URLs ===");
    console.log("Factory.garden:", `https://factory.garden/${gardenAddr}`);
    console.log("Factory essay:", `https://factory.garden/${gardenAddr}/essay`);
    console.log("\n=== Once essay.garden is configured ===");
    console.log("Garden:", "https://essay.garden");
    console.log("Essay:", "https://essay.garden/essay");
    console.log("\n=== Etherscan ===");
    console.log("Garden:", `https://sepolia.etherscan.io/address/${gardenAddr}`);
    console.log("Essay:", `https://sepolia.etherscan.io/address/${essayAddr}`);

    console.log("\n=== Next Steps ===");
    console.log("1. Write your introductory essay at https://factory.garden/#/essay");
    console.log("2. Select this garden from the dropdown");
    console.log("3. Write and publish your intro essay");
    console.log("4. Set up essay.garden DNS and Netlify (see instructions below)");

  } catch (error) {
    console.log("❌ Failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
