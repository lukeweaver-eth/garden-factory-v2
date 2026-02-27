import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Step 4: Verify contracts on Etherscan
 *
 * Note: GardenTemplateDeployer's constructor args are raw bytecode blobs.
 * Etherscan verification for it may require manual submission with the
 * exact ABI-encoded constructor args. The script attempts automatic
 * verification but this contract is the most likely to need manual help.
 *
 * Child contracts (Mod, Essay, Garden, Renderer, Web) deployed by the
 * template deployer can be verified individually after a garden is created,
 * using their respective constructor args.
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, artifacts } = hre;
  const { get } = deployments;

  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    console.log("\nSkipping verification on local network.\n");
    return;
  }

  console.log("\n=== Step 4: Verify Contracts on Etherscan ===\n");

  // Libraries (no args)
  const simpleContracts = [
    "GardenHTML",
    "GardenContributions",
  ];

  // Libraries with dependencies
  const gardenHTML = await get("GardenHTML");
  const gardenContributions = await get("GardenContributions");
  const gardenIndex = await get("GardenIndexConfigurable");
  const gardenEssay = await get("GardenEssay");

  const linkedContracts: { name: string; libraries: Record<string, string> }[] = [
    {
      name: "GardenIndexConfigurable",
      libraries: {
        GardenHTML: gardenHTML.address,
        GardenContributions: gardenContributions.address,
      },
    },
    {
      name: "GardenEssay",
      libraries: { GardenHTML: gardenHTML.address },
    },
  ];

  // Template deployer (constructor args are bytecodes)
  const modArtifact = await artifacts.readArtifact("ModConfigurable");
  const essayArtifact = await artifacts.readArtifact("Essay");
  const gardenArtifact = await artifacts.readArtifact("GardenConfigurable");
  const rendererArtifact = await artifacts.readArtifact("GardenRendererConfigurable");
  const webArtifact = await artifacts.readArtifact("Web");

  // Re-link renderer bytecode (same as deploy step)
  let rendererLinked = rendererArtifact.bytecode;
  for (const [sourcePath, libRefs] of Object.entries(rendererArtifact.linkReferences)) {
    for (const [libName, positions] of Object.entries(libRefs as Record<string, Array<{ length: number; start: number }>>)) {
      const libAddr = libName === "GardenIndexConfigurable" ? gardenIndex.address
                    : libName === "GardenEssay" ? gardenEssay.address
                    : "";
      const addr = libAddr.replace("0x", "").toLowerCase().padStart(40, "0");
      for (const pos of positions) {
        const hexStart = pos.start * 2 + 2;
        const hexLength = pos.length * 2;
        rendererLinked = rendererLinked.substring(0, hexStart) + addr + rendererLinked.substring(hexStart + hexLength);
      }
    }
  }

  // Factory
  const templateDeployer = await get("GardenTemplateDeployer");

  // Verify simple libraries
  for (const name of simpleContracts) {
    await verifyContract(hre, name);
  }

  // Verify linked libraries
  for (const { name, libraries } of linkedContracts) {
    await verifyContract(hre, name, [], libraries);
  }

  // Verify template deployer
  await verifyContract(hre, "GardenTemplateDeployer", [
    modArtifact.bytecode,
    essayArtifact.bytecode,
    gardenArtifact.bytecode,
    rendererLinked,
    webArtifact.bytecode,
  ]);

  // Verify factory
  await verifyContract(hre, "GardenFactory", [templateDeployer.address]);

  console.log("\nVerification complete.\n");
};

async function verifyContract(
  hre: HardhatRuntimeEnvironment,
  name: string,
  args: any[] = [],
  libraries: Record<string, string> = {},
) {
  try {
    const deployment = await hre.deployments.get(name);
    console.log(`  Verifying ${name} at ${deployment.address}...`);

    await hre.run("verify:verify", {
      address: deployment.address,
      constructorArguments: args,
      libraries,
    });

    console.log(`  ✅ ${name} verified`);
  } catch (e: any) {
    if (e.message?.includes("Already Verified")) {
      console.log(`  ✅ ${name} already verified`);
    } else {
      console.log(`  ⚠️  ${name}: ${e.message?.substring(0, 100)}`);
    }
  }
}

export default func;
func.tags = ["Verify"];
func.dependencies = ["Factory"];
func.runAtTheEnd = true;
