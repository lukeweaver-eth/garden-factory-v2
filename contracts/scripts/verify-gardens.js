/**
 * Garden Auto-Verification Service
 *
 * Watches for GardenPlanted events and automatically verifies all deployed contracts
 * using constructor args from GardenConstructorArgs event.
 *
 * Usage:
 *   # Verify all unverified gardens (one-time catchup)
 *   npx hardhat run scripts/verify-gardens.js --network sepolia
 *
 *   # Watch for new gardens continuously
 *   WATCH=true npx hardhat run scripts/verify-gardens.js --network sepolia
 *
 * Environment variables:
 *   WATCH=true           - Run continuously, watching for new gardens
 *   ETHERSCAN_API_KEY    - Required for verification
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const FACTORY_DEPLOYMENT = "../deployments/" + hre.network.name + "/GardenFactory.json";
const VERIFIED_GARDENS_FILE = path.join(__dirname, `../verified-gardens-${hre.network.name}.json`);

// Track which gardens we've already verified
let verifiedGardens = {};
if (fs.existsSync(VERIFIED_GARDENS_FILE)) {
  verifiedGardens = JSON.parse(fs.readFileSync(VERIFIED_GARDENS_FILE, 'utf8'));
}

function saveVerifiedGardens() {
  fs.writeFileSync(VERIFIED_GARDENS_FILE, JSON.stringify(verifiedGardens, null, 2));
}

async function verifyContract(address, constructorArguments, contractName) {
  if (!process.env.ETHERSCAN_API_KEY) {
    console.log(`  ⚠️  ETHERSCAN_API_KEY not set, skipping ${contractName} verification`);
    return false;
  }

  try {
    console.log(`  Verifying ${contractName} at ${address}...`);
    await hre.run("verify:verify", {
      address,
      constructorArguments,
    });
    console.log(`  ✅ ${contractName} verified`);
    return true;
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`  ✓  ${contractName} already verified`);
      return true;
    } else if (error.message.includes("does not have bytecode")) {
      console.log(`  ❌ ${contractName} - no bytecode at address`);
      return false;
    } else {
      console.log(`  ❌ ${contractName} verification failed: ${error.message}`);
      return false;
    }
  }
}

async function verifyGarden(plantedEvent, constructorEvent) {
  const { garden, mod, essay, renderer, web } = plantedEvent.args;

  console.log(`\n🌱 Verifying garden: ${garden}`);

  if (verifiedGardens[garden.toLowerCase()]) {
    console.log(`  ⏭️  Already processed, skipping`);
    return;
  }

  // Get constructor args from event
  if (!constructorEvent) {
    console.log(`  ⚠️  No GardenConstructorArgs event found, skipping`);
    return;
  }

  const {
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
    textColor
  } = constructorEvent.args;

  // Prepare constructor arguments for each contract

  // 1. ModConfigurable
  const modArgs = [
    gardenTitle,
    curatorName,
    curatorUrl,
    thankYouNames,
    thankYouUrls,
    unicodeSymbol,
    collectionTerm,
    backgroundColor,
    textColor
  ];

  // 2. Essay - no constructor args
  const essayArgs = [];

  // 3. GardenConfigurable - deployed with empty sculptures, render address set later, mod address
  const gardenArgs = [
    [],      // empty sculptures array
    web,     // render address (Web contract)
    mod      // data address (ModConfigurable)
  ];

  // 4. GardenRendererConfigurable
  const rendererArgs = [
    garden,
    essay,
    mod
  ];

  // 5. Web - no constructor args
  const webArgs = [];

  // Verify all contracts
  console.log(`  📝 Constructor args prepared`);

  const results = {
    mod: await verifyContract(mod, modArgs, "ModConfigurable"),
    essay: await verifyContract(essay, essayArgs, "Essay"),
    garden: await verifyContract(garden, gardenArgs, "GardenConfigurable"),
    renderer: await verifyContract(renderer, rendererArgs, "GardenRendererConfigurable"),
    web: await verifyContract(web, webArgs, "Web"),
  };

  // Mark as processed
  verifiedGardens[garden.toLowerCase()] = {
    timestamp: Date.now(),
    addresses: { garden, mod, essay, renderer, web },
    verified: results
  };
  saveVerifiedGardens();

  const total = Object.values(results).filter(Boolean).length;
  console.log(`  ✅ Verified ${total}/5 contracts for garden ${garden}`);
}

async function main() {
  const network = hre.network.name;
  console.log(`🔍 Garden Verification Service`);
  console.log(`   Network: ${network}`);

  // Load factory deployment
  const deploymentPath = path.join(__dirname, FACTORY_DEPLOYMENT);
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Factory not deployed on ${network}. Deploy first with: npx hardhat deploy --network ${network}`);
  }

  const factoryDeployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const factoryAddress = factoryDeployment.address;
  console.log(`   Factory: ${factoryAddress}`);

  if (!process.env.ETHERSCAN_API_KEY) {
    console.log(`   ⚠️  ETHERSCAN_API_KEY not set - contracts will not be verified`);
    console.log(`   Set it in .env or export ETHERSCAN_API_KEY=your_key`);
  }

  const factory = await hre.ethers.getContractAt("GardenFactory", factoryAddress);

  // Get all past events
  console.log(`\n📡 Fetching past GardenPlanted events...`);
  const plantedFilter = factory.filters.GardenPlanted();
  const constructorFilter = factory.filters.GardenConstructorArgs();

  const [plantedEvents, constructorEvents] = await Promise.all([
    factory.queryFilter(plantedFilter),
    factory.queryFilter(constructorFilter)
  ]);

  console.log(`   Found ${plantedEvents.length} gardens`);

  // Create a map of garden address -> constructor event
  const constructorMap = {};
  for (const event of constructorEvents) {
    const gardenAddr = event.args.garden.toLowerCase();
    constructorMap[gardenAddr] = event;
  }

  // Verify all gardens
  for (const plantedEvent of plantedEvents) {
    const gardenAddr = plantedEvent.args.garden.toLowerCase();
    const constructorEvent = constructorMap[gardenAddr];

    if (!constructorEvent) {
      console.log(`\n⚠️  Garden ${plantedEvent.args.garden} has no GardenConstructorArgs event (older deployment)`);
      console.log(`   Skipping automatic verification - verify manually if needed`);
      continue;
    }

    await verifyGarden(plantedEvent, constructorEvent);
  }

  // Watch mode
  if (process.env.WATCH === 'true') {
    console.log(`\n👀 Watching for new gardens... (Ctrl+C to stop)`);

    // Store constructor args as they arrive
    const pendingConstructorArgs = {};

    factory.on("GardenConstructorArgs", (garden, gardenTitle, curatorName, curatorUrl, thankYouNames, thankYouUrls, unicodeSymbol, exhibitionText, gardenUrls, collectionTerm, backgroundColor, textColor, event) => {
      pendingConstructorArgs[garden.toLowerCase()] = event;
    });

    factory.on("GardenPlanted", async (garden, gardener, curatorName, unicodeSymbol, mod, essay, renderer, web, event) => {
      // Wait a bit for GardenConstructorArgs event to arrive
      await new Promise(resolve => setTimeout(resolve, 1000));

      const constructorEvent = pendingConstructorArgs[garden.toLowerCase()];
      if (!constructorEvent) {
        console.log(`\n⚠️  No GardenConstructorArgs event for ${garden}, waiting longer...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      await verifyGarden(event, constructorEvent);
      delete pendingConstructorArgs[garden.toLowerCase()];
    });

    // Keep process alive
    await new Promise(() => {});
  } else {
    console.log(`\n✅ Verification complete`);
    console.log(`   To watch for new gardens continuously, run:`);
    console.log(`   WATCH=true npx hardhat run scripts/verify-gardens.js --network ${network}`);
  }
}

main()
  .then(() => process.env.WATCH === 'true' ? null : process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
