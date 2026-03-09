// Deploy a minimal WCSG-compatible garden on Sepolia for testing recursive structure
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("Deploying minimal WCSG-compatible garden on Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // We'll deploy using the existing GardenFactory's template deployer
  // to create a simple garden that mimics WCSG structure

  const factoryAddress = "0xa0288D3cDF79D5e39dcA04eC43F851BFd8e02c17"; // Sepolia factory (updated)
  const factory = await ethers.getContractAt("GardenFactory", factoryAddress);

  console.log("Creating WCSG-style garden via factory...");

  const tx = await factory.createGarden(
    "World Computer Sculpture Garden",           // gardenTitle
    "0xfff",                                      // curatorName
    "https://www.0xfff.love",                     // curatorUrl
    ["113", "sssluke", "maltefr"],                // thankYouNames (contributors)
    ["https://x.com/0x113d", "https://x.com/sssluke1", "https://x.com/maltefr_eth"], // thankYouUrls
    "⚘",                                          // unicodeSymbol
    "I invite you into the garden of many running sculptures – an open ground for all to visit. This is an encouragement to move forward, to go beyond the white cube VR-replica spaces and ignore the stratifying forces that seek to mummify New Art.", // exhibitionText
    [],                                           // gardenUrls (empty like WCSG mainnet)
    "show",                                       // collectionTerm
    "#000000",                                    // backgroundColor (black)
    "#ffffff",                                    // textColor (white)
    { value: ethers.parseEther("0.01") }
  );

  console.log("Transaction:", tx.hash);
  const receipt = await tx.wait();

  // Find GardenPlanted event
  const gardenPlantedEvent = receipt.logs
    .map(log => {
      try {
        return factory.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(log => log && log.name === "GardenPlanted");

  if (gardenPlantedEvent) {
    const wcsgSepoliaAddress = gardenPlantedEvent.args.garden;
    console.log("\n✅ WCSG-style garden deployed!");
    console.log("Address:", wcsgSepoliaAddress);
    console.log("Curator:", gardenPlantedEvent.args.curatorName);
    console.log("Symbol:", gardenPlantedEvent.args.unicodeSymbol);

    // Verify the Sculpture interface
    const wcsg = await ethers.getContractAt("GardenConfigurable", wcsgSepoliaAddress);
    console.log("\nVerifying Sculpture interface:");
    console.log("title():", await wcsg.title());
    const authors = await wcsg.authors();
    console.log("authors():", authors);
    console.log("Last author (curator):", authors[authors.length - 1]);
    const addresses = await wcsg.addresses();
    console.log("addresses()[0]:", addresses[0]);
    console.log("text():", (await wcsg.text()).substring(0, 100) + "...");
    console.log("urls():", await wcsg.urls());

    console.log("\n📝 Save this address for testing:");
    console.log("WCSG_SEPOLIA =", wcsgSepoliaAddress);
  } else {
    console.error("Could not find GardenPlanted event");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
