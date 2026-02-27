/**
 * Verify a single garden on Etherscan
 *
 * Simple, one-off verification - no continuous service needed.
 *
 * Usage:
 *   npx hardhat run scripts/verify-garden.js --network sepolia
 *
 * The script will prompt you for the garden address.
 * Or pass it as an environment variable:
 *   GARDEN=0x... npx hardhat run scripts/verify-garden.js --network sepolia
 *
 * Requires (free):
 *   ETHERSCAN_API_KEY - Get from https://etherscan.io/myapikey
 */

const hre = require("hardhat");
const readline = require("readline");

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function verifyContract(address, constructorArguments, contractName) {
  if (!process.env.ETHERSCAN_API_KEY) {
    console.log(`  ⚠️  ETHERSCAN_API_KEY not set, skipping verification`);
    console.log(`  Get a free API key: https://etherscan.io/myapikey`);
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
    } else {
      console.log(`  ❌ ${contractName} failed: ${error.message.split('\n')[0]}`);
      return false;
    }
  }
}

async function main() {
  console.log(`🔍 Garden Verification\n`);

  // Get garden address
  let gardenAddress = process.env.GARDEN;
  if (!gardenAddress) {
    gardenAddress = await askQuestion("Enter garden address: ");
  }

  try {
    gardenAddress = hre.ethers.getAddress(gardenAddress.trim());
  } catch (e) {
    throw new Error(`Invalid address: ${gardenAddress}`);
  }

  console.log(`   Garden: ${gardenAddress}`);
  console.log(`   Network: ${hre.network.name}\n`);

  // Read garden state to get addresses
  const garden = await hre.ethers.getContractAt("GardenConfigurable", gardenAddress);

  let web, mod;
  try {
    [web, mod] = await Promise.all([
      garden.render(),
      garden.data()
    ]);
  } catch (e) {
    throw new Error(`Failed to read garden state. Is this a valid garden contract?\n${e.message}`);
  }

  console.log(`   Found contracts:`);
  console.log(`     Garden: ${gardenAddress}`);
  console.log(`     Web:    ${web}`);
  console.log(`     Mod:    ${mod}`);

  // Get renderer and essay from web contract
  const webContract = await hre.ethers.getContractAt("Web", web);
  const renderer = await webContract.renderer();
  console.log(`     Renderer: ${renderer}`);

  const rendererContract = await hre.ethers.getContractAt("GardenRendererConfigurable", renderer);
  const essay = await rendererContract.essayContract();
  console.log(`     Essay: ${essay}\n`);

  // Try to find constructor args from events
  console.log(`📡 Searching for constructor args in factory events...`);

  const deployments = await hre.deployments.all();
  const factoryDeployment = deployments.GardenFactory;

  if (!factoryDeployment) {
    throw new Error("GardenFactory not deployed on this network");
  }

  const factory = await hre.ethers.getContractAt("GardenFactory", factoryDeployment.address);

  // Query events - search recent blocks first (most likely)
  const currentBlock = await hre.ethers.provider.getBlockNumber();
  const chunkSize = 1000; // Small chunks for free RPCs
  const maxBlocksBack = 10000; // Don't search too far back

  let constructorArgs = null;

  // Search backwards from current block
  for (let toBlock = currentBlock; toBlock > currentBlock - maxBlocksBack && !constructorArgs; toBlock -= chunkSize) {
    const fromBlock = Math.max(toBlock - chunkSize + 1, currentBlock - maxBlocksBack);

    try {
      const filter = factory.filters.GardenConstructorArgs(gardenAddress);
      const events = await factory.queryFilter(filter, fromBlock, toBlock);

      if (events.length > 0) {
        constructorArgs = events[0].args;
        console.log(`   ✓ Found constructor args in block ${events[0].blockNumber}\n`);
        break;
      }
    } catch (e) {
      // Skip this chunk on error
      continue;
    }
  }

  if (!constructorArgs) {
    console.log(`   ⚠️  No GardenConstructorArgs event found`);
    console.log(`   This garden may have been deployed before the verification update.`);
    console.log(`   Manual verification required.\n`);
    return;
  }

  // Prepare constructor arguments for each contract
  const {
    gardenTitle,
    curatorName,
    curatorUrl,
    thankYouNames,
    thankYouUrls,
    unicodeSymbol,
    collectionTerm,
    backgroundColor,
    textColor
  } = constructorArgs;

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

  const essayArgs = [];
  const gardenArgs = [[], web, mod];
  const rendererArgs = [gardenAddress, essay, mod];
  const webArgs = [];

  // Verify all contracts
  console.log(`🔨 Verifying contracts...\n`);

  const results = {
    mod: await verifyContract(mod, modArgs, "ModConfigurable"),
    essay: await verifyContract(essay, essayArgs, "Essay"),
    garden: await verifyContract(gardenAddress, gardenArgs, "GardenConfigurable"),
    renderer: await verifyContract(renderer, rendererArgs, "GardenRendererConfigurable"),
    web: await verifyContract(web, webArgs, "Web"),
  };

  const total = Object.values(results).filter(Boolean).length;
  console.log(`\n✅ Verified ${total}/5 contracts`);

  if (total === 5) {
    console.log(`\n🎉 All contracts verified! View on Etherscan:`);
    const explorerBase = hre.network.name === 'mainnet'
      ? 'https://etherscan.io'
      : `https://${hre.network.name}.etherscan.io`;
    console.log(`   ${explorerBase}/address/${gardenAddress}#code`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  });
