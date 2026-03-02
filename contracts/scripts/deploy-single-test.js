const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying test garden with account:", deployer.address);

  const factoryAddr = "0xEb19b65a3C63Be6001A2A91320FF4f85CbE12207";
  const factory = await hre.ethers.getContractAt("GardenFactory", factoryAddr);

  console.log("\n=== Deploying Test Garden ===\n");

  let gardenAddr, essayAddr;

  // Deploy garden
  console.log("Creating garden...");
  try {
    const tx = await factory.createGarden(
      "Test Garden",
      "Test Curator",
      "https://testcurator.example",
      ["Alice", "Bob"],
      ["https://alice.example", "https://bob.example"],
      "🌻",
      "This is a test garden with an introductory essay and a sculpture.",
      ["https://test-garden.example"],
      "anthology",
      "#FFFACD",
      "#8B7355",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardenAddr = event.args.garden;
    essayAddr = event.args.essay;
    console.log("✅ Garden deployed:", gardenAddr);
    console.log("✅ Essay contract:", essayAddr);
  } catch (error) {
    console.log("❌ Failed:", error.message);
    process.exit(1);
  }

  // Write intro essay
  console.log("\n=== Writing Intro Essay ===\n");
  try {
    const essay = await hre.ethers.getContractAt("Essay", essayAddr);

    const essayContent = `<h1>Welcome to the Test Garden</h1>

<p>This garden serves as a demonstration of the Garden Factory system on Sepolia testnet.</p>

<h2>What is a Digital Garden?</h2>

<p>A digital garden is a curated collection of on-chain content—essays, artworks, and programs—that exists entirely on the Ethereum blockchain.</p>

<p>Unlike traditional websites that can disappear when servers go offline, gardens stored on-chain are:</p>

<ul>
<li><strong>Permanent</strong> - They persist as long as Ethereum exists</li>
<li><strong>Censorship-resistant</strong> - No single entity can take them down</li>
<li><strong>Composable</strong> - Gardens can reference and include other on-chain content</li>
<li><strong>Ownable</strong> - Garden creators maintain control through their wallet</li>
</ul>

<h2>This Garden's Purpose</h2>

<p>This particular garden demonstrates:</p>

<blockquote>
How introductory essays provide context and framing for the sculptures within a garden.
</blockquote>

<p>The essay you're reading right now is stored entirely on-chain using SSTORE2, a gas-efficient method for storing data in smart contracts.</p>

<h2>What's Next?</h2>

<p>Gardens can be extended over time. The curator can:</p>

<ol>
<li>Add new sculptures (contract addresses implementing the Sculpture interface)</li>
<li>Update metadata like colors, symbols, and text</li>
<li>Modify the list of contributors and thank yous</li>
</ol>

<p>Each garden is unique, reflecting the aesthetic and curatorial choices of its creator.</p>

<hr>

<p><em>This essay was published on ${new Date().toLocaleDateString()} as part of the Garden Factory testing process.</em></p>`;

    console.log("Publishing intro essay...");
    await (await essay.publish(
      "Introduction to the Test Garden",
      "Test Curator",
      essayContent
    )).wait();
    console.log("✅ Intro essay published");
  } catch (error) {
    console.log("❌ Essay failed:", error.message);
  }

  // Deploy sculpture essay
  console.log("\n=== Deploying Sculpture ===\n");
  try {
    console.log("Deploying sculpture contract...");
    const txScuplture = await factory.deployEssay();
    const receiptSculpture = await txScuplture.wait();
    const eventSculpture = receiptSculpture.logs.find(log => log.fragment?.name === "EssayDeployed");
    const sculptureAddr = eventSculpture.args.essay;
    console.log("✅ Sculpture contract:", sculptureAddr);

    const sculpture = await hre.ethers.getContractAt("Essay", sculptureAddr);

    const sculptureContent = `<h1>The Garden as Medium</h1>

<p>Gardens have long served as spaces for contemplation, cultivation, and community.</p>

<h2>From Physical to Digital</h2>

<p>The metaphor of the garden translates beautifully to the blockchain:</p>

<ul>
<li><strong>Planting</strong> - Deploying contracts to Ethereum</li>
<li><strong>Cultivation</strong> - Curating which sculptures to include</li>
<li><strong>Growth</strong> - Adding new works over time</li>
<li><strong>Permanence</strong> - Like ancient gardens preserved in stone, blockchain gardens persist</li>
</ul>

<h2>The Curator's Role</h2>

<p>Just as a traditional curator selects works for a museum exhibition, a garden curator chooses which on-chain sculptures to include. This curatorial act is itself a creative statement.</p>

<blockquote>
The garden is not just a container for artworks—it is an artwork itself.
</blockquote>

<h2>Public, Permanent, Programmable</h2>

<p>What makes blockchain gardens unique is their triple nature:</p>

<p><strong>Public</strong> - Anyone can view them, no login required, no paywall</p>

<p><strong>Permanent</strong> - Once deployed, they exist forever on Ethereum</p>

<p><strong>Programmable</strong> - They can respond to queries, compute values, and interact with other contracts</p>

<h2>A Living Archive</h2>

<p>Over time, as more gardens are planted and more sculptures are created, we build a living archive of creative work that transcends platforms, companies, and traditional institutions.</p>

<p>This is the promise of the Garden Factory: to democratize the creation of permanent, on-chain exhibitions.</p>

<hr>

<p><em>This sculpture explores the conceptual foundations of digital gardens on Ethereum.</em></p>`;

    console.log("Publishing sculpture content...");
    await (await sculpture.publish(
      "The Garden as Medium",
      "Digital Gardener",
      sculptureContent
    )).wait();
    console.log("✅ Sculpture content published");

    // Add sculpture to garden
    console.log("\nAdding sculpture to garden...");
    const garden = await hre.ethers.getContractAt("GardenConfigurable", gardenAddr);
    await (await garden.setSculptures([sculptureAddr])).wait();
    console.log("✅ Sculpture added to garden");
  } catch (error) {
    console.log("❌ Sculpture failed:", error.message);
  }

  // Test rendering
  console.log("\n=== Testing Rendering ===\n");
  try {
    const garden = await hre.ethers.getContractAt("GardenConfigurable", gardenAddr);
    const html = await garden.html();
    console.log(`✅ Garden renders: ${html.length} bytes`);

    // Test essay route
    const web = await hre.ethers.getContractAt(
      ["function request(string[] resource, tuple(string,string)[]) external view returns (uint256, string, bytes)"],
      await garden.render()
    );
    const [statusCode, , essayHtml] = await web.request(["essay"], []);
    console.log(`✅ Essay route works: ${statusCode} status, ${essayHtml.length} bytes`);
  } catch (error) {
    console.log("❌ Rendering test failed:", error.message);
  }

  console.log("\n=== Summary ===");
  console.log(`\nGarden deployed at: ${gardenAddr}`);
  console.log(`View garden: https://factory.garden/${gardenAddr}`);
  console.log(`View essay: https://factory.garden/${gardenAddr}/essay`);
  console.log("\nOR on Netlify:");
  console.log(`View garden: https://comfy-queijadas-c4223d.netlify.app/${gardenAddr}`);
  console.log(`View essay: https://comfy-queijadas-c4223d.netlify.app/${gardenAddr}/essay`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
