const hre = require("hardhat");

async function main() {
  console.log("Verifying garden 0xAa603103539d7Ac7cc53C7Fe00f159aAFe3A29e2\n");

  // Contract addresses
  const gardenAddress = "0xAa603103539d7Ac7cc53C7Fe00f159aAFe3A29e2";
  const mod = "0xCa78806659095baf180bB7E0947C76692Aa0AC7C";
  const essay = "0xf73369Cf6C94bB7572a8d12a1d42E933db521054";
  const renderer = "0xC2584a483Db164ACA149EBc657D9783CDd0d1690";
  const web = "0xD1e469775c62DB99927417f364B0f4362A428866";

  // Constructor args from GardenConstructorArgs event
  const gardenTitle = "essay garden 2";
  const curatorName = "luke weaver";
  const curatorUrl = "";
  const thankYouNames = [];
  const thankYouUrls = [];
  const unicodeSymbol = "⚘";
  const exhibitionText = "introduction to your garden";
  const gardenUrls = ["essay.garden"];
  const collectionTerm = "anthology";
  const backgroundColor = "#121411a";
  const textColor = "#fefefe";

  const modArgs = [gardenTitle, curatorName, curatorUrl, thankYouNames, thankYouUrls, unicodeSymbol, collectionTerm, backgroundColor, textColor];
  const essayArgs = [];
  const gardenArgs = [[], web, mod];
  const rendererArgs = [gardenAddress, essay, mod];
  const webArgs = [];

  console.log("Verifying ModConfigurable...");
  try {
    await hre.run("verify:verify", { address: mod, constructorArguments: modArgs });
    console.log("✅ Mod verified\n");
  } catch (e) {
    if (e.message.includes("Already Verified")) {
      console.log("✓ Already verified\n");
    } else {
      console.log("❌ Error:", e.message.split('\n')[0], "\n");
    }
  }

  console.log("Verifying Essay...");
  try {
    await hre.run("verify:verify", { address: essay, constructorArguments: essayArgs });
    console.log("✅ Essay verified\n");
  } catch (e) {
    if (e.message.includes("Already Verified")) {
      console.log("✓ Already verified\n");
    } else {
      console.log("❌ Error:", e.message.split('\n')[0], "\n");
    }
  }

  console.log("Verifying GardenConfigurable...");
  try {
    await hre.run("verify:verify", { address: gardenAddress, constructorArguments: gardenArgs });
    console.log("✅ Garden verified\n");
  } catch (e) {
    if (e.message.includes("Already Verified")) {
      console.log("✓ Already verified\n");
    } else {
      console.log("❌ Error:", e.message.split('\n')[0], "\n");
    }
  }

  console.log("Verifying GardenRendererConfigurable...");
  try {
    await hre.run("verify:verify", { address: renderer, constructorArguments: rendererArgs });
    console.log("✅ Renderer verified\n");
  } catch (e) {
    if (e.message.includes("Already Verified")) {
      console.log("✓ Already verified\n");
    } else {
      console.log("❌ Error:", e.message.split('\n')[0], "\n");
    }
  }

  console.log("Verifying Web...");
  try {
    await hre.run("verify:verify", { address: web, constructorArguments: webArgs });
    console.log("✅ Web verified\n");
  } catch (e) {
    if (e.message.includes("Already Verified")) {
      console.log("✓ Already verified\n");
    } else {
      console.log("❌ Error:", e.message.split('\n')[0], "\n");
    }
  }

  console.log("🎉 Verification complete!");
  console.log(`View on Etherscan: https://sepolia.etherscan.io/address/${gardenAddress}#code`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
