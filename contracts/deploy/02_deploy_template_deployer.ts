import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Step 2: Deploy GardenTemplateDeployer
 *
 * This is the core of the template approach. We:
 * 1. Read creation bytecode from compiled artifacts for each child contract
 * 2. Link libraries into GardenRendererConfigurable's bytecode
 * 3. Pass all 5 bytecodes to the constructor, which stores them via SSTORE2
 *
 * The constructor runs 5 SSTORE2.write() calls, so the deployment transaction
 * is large (~5 contract bytecodes worth of calldata). This is a one-time cost.
 * After this, every createGarden() call reads from SSTORE2 and deploys via
 * assembly CREATE — the deployer itself stays tiny.
 *
 * Library linking note:
 * GardenRendererConfigurable references GardenIndexConfigurable and GardenEssay
 * as external Solidity libraries. The compiled bytecode contains placeholder
 * strings like __$abc123...$__ where the library addresses need to be inserted.
 * We must resolve these BEFORE storing the bytecode, because the stored template
 * is used directly with CREATE — there's no second linking step at deploy time.
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, artifacts } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("\n=== Step 2: Deploy GardenTemplateDeployer ===\n");

  // Get deployed library addresses (needed for linking)
  const gardenIndexConfigurable = await get("GardenIndexConfigurable");
  const gardenEssay = await get("GardenEssay");

  // Read creation bytecodes from compiled artifacts
  const modArtifact = await artifacts.readArtifact("ModConfigurable");
  const essayArtifact = await artifacts.readArtifact("Essay");
  const gardenArtifact = await artifacts.readArtifact("GardenConfigurable");
  const rendererArtifact = await artifacts.readArtifact("GardenRendererConfigurable");
  const webArtifact = await artifacts.readArtifact("Web");

  // Link libraries into Renderer bytecode using artifact's linkReferences
  const rendererLinked = linkLibraries(
    rendererArtifact.bytecode,
    rendererArtifact.linkReferences,
    {
      "GardenIndexConfigurable": gardenIndexConfigurable.address,
      "GardenEssay": gardenEssay.address,
    }
  );

  console.log("  Bytecode sizes (creation code):");
  console.log(`    ModConfigurable:             ${(modArtifact.bytecode.length - 2) / 2} bytes`);
  console.log(`    Essay:                       ${(essayArtifact.bytecode.length - 2) / 2} bytes`);
  console.log(`    GardenConfigurable:          ${(gardenArtifact.bytecode.length - 2) / 2} bytes`);
  console.log(`    GardenRendererConfigurable:  ${(rendererLinked.length - 2) / 2} bytes (linked)`);
  console.log(`    Web:                         ${(webArtifact.bytecode.length - 2) / 2} bytes`);
  console.log("");

  const totalBytes = [
    modArtifact.bytecode,
    essayArtifact.bytecode,
    gardenArtifact.bytecode,
    rendererLinked,
    webArtifact.bytecode,
  ].reduce((sum, bc) => sum + (bc.length - 2) / 2, 0);
  console.log(`    Total template storage:      ${totalBytes} bytes`);
  console.log(`    SSTORE2 cost:                ~${Math.ceil(totalBytes / 24576)} SSTORE2 writes\n`);

  // Deploy GardenTemplateDeployer with all 5 bytecodes as constructor args
  const templateDeployer = await deploy("GardenTemplateDeployer", {
    from: deployer,
    args: [
      modArtifact.bytecode,
      essayArtifact.bytecode,
      gardenArtifact.bytecode,
      rendererLinked,
      webArtifact.bytecode,
    ],
    log: true,
    waitConfirmations: 1,
    // No library linking needed for the deployer itself — it only
    // imports child contracts for their type interfaces (Ownable, etc.),
    // not for library calls
  });

  console.log(`\n  GardenTemplateDeployer: ${templateDeployer.address}`);
  console.log(`  SSTORE2 template pointers stored on-chain ✓\n`);
};

/**
 * Replace library placeholders in bytecode with actual addresses.
 *
 * Uses the artifact's linkReferences to find placeholder positions, then
 * replaces the __$hash$__ patterns with the actual library addresses.
 *
 * This is more robust than reconstructing placeholder hashes from file paths
 * because it works regardless of directory structure or remappings.
 */
function linkLibraries(
  bytecode: string,
  linkReferences: Record<string, Record<string, Array<{ length: number; start: number }>>>,
  libraries: Record<string, string>
): string {
  let linked = bytecode;

  for (const [sourcePath, libRefs] of Object.entries(linkReferences)) {
    for (const [libName, positions] of Object.entries(libRefs)) {
      const address = libraries[libName];
      if (!address) {
        throw new Error(`No address provided for library ${libName} (${sourcePath})`);
      }

      const addr = address.replace("0x", "").toLowerCase().padStart(40, "0");

      // Replace at each position (bytecode is hex string with 0x prefix,
      // so position in bytes = position * 2 + 2 in the hex string)
      for (const pos of positions) {
        const hexStart = pos.start * 2 + 2; // +2 for "0x" prefix
        const hexLength = pos.length * 2;    // 20 bytes = 40 hex chars

        const before = linked.substring(0, hexStart);
        const after = linked.substring(hexStart + hexLength);
        linked = before + addr + after;
      }

      console.log(`  Linked ${libName} → ${address}`);
    }
  }

  // Safety check
  if (linked.includes("__$")) {
    const remaining = linked.match(/__\$[a-f0-9]{34}\$__/g);
    throw new Error(`Unlinked placeholders remain: ${remaining}`);
  }

  return linked;
}

export default func;
func.tags = ["TemplateDeployer", "GardenTemplateDeployer"];
func.dependencies = ["LibraryDeps"];
