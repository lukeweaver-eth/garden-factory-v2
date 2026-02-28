const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying test gardens with account:", deployer.address);

  const factoryAddr = "0x58CDF3546AB890a7961FCD393CA02859C946A18a";
  const factory = await hre.ethers.getContractAt("GardenFactory", factoryAddr);

  console.log("\n=== Deploying 4 Test Gardens ===\n");

  const gardens = [];

  // Garden 1: Full configuration with all fields
  console.log("1. Deploying garden with all fields...");
  try {
    const tx1 = await factory.createGarden(
      "Complete Test Garden",
      "Test Curator",
      "https://testcurator.com",
      ["Alice", "Bob", "Charlie"],
      ["https://alice.com", "https://bob.com", ""],
      "🌸",
      "This is a fully configured test garden with all optional fields filled in.",
      ["https://garden-site-1.com", "https://garden-site-2.com"],
      "anthology",
      "#FFF0F5",
      "#8B4789",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt1 = await tx1.wait();
    const event1 = receipt1.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({
      name: "Complete",
      address: event1.args.garden,
      essay: event1.args.essay
    });
    console.log("  ✅ Garden:", event1.args.garden);
    console.log("  ✅ Essay:", event1.args.essay);
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Garden 2: Minimal configuration (curator name only)
  console.log("\n2. Deploying minimal garden...");
  try {
    const tx2 = await factory.createGarden(
      "",
      "Minimal Curator",
      "",
      [],
      [],
      "",
      "",
      [],
      "",
      "",
      "",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt2 = await tx2.wait();
    const event2 = receipt2.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({
      name: "Minimal",
      address: event2.args.garden,
      essay: event2.args.essay
    });
    console.log("  ✅ Garden:", event2.args.garden);
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Garden 3: Mixed (some fields filled, some empty)
  console.log("\n3. Deploying mixed configuration garden...");
  try {
    const tx3 = await factory.createGarden(
      "Mixed Garden",
      "Eclectic Curator",
      "",
      ["Friend1", "Friend2"],
      ["", "https://friend2.com"],
      "🌺",
      "This garden has a mix of filled and empty fields.",
      [],
      "collection",
      "#E6F3FF",
      "#2C5F7F",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt3 = await tx3.wait();
    const event3 = receipt3.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({
      name: "Mixed",
      address: event3.args.garden,
      essay: event3.args.essay
    });
    console.log("  ✅ Garden:", event3.args.garden);
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Garden 4: Dark theme with custom symbol
  console.log("\n4. Deploying dark theme garden...");
  try {
    const tx4 = await factory.createGarden(
      "Night Garden",
      "Nocturnal Curator",
      "https://nightgarden.art",
      ["Moon", "Stars"],
      ["https://moon.io", "https://stars.io"],
      "🌙",
      "A garden that thrives in darkness.",
      ["https://dark.garden"],
      "nocturnal show",
      "#1a1a1a",
      "#e0e0e0",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt4 = await tx4.wait();
    const event4 = receipt4.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({
      name: "Dark",
      address: event4.args.garden,
      essay: event4.args.essay
    });
    console.log("  ✅ Garden:", event4.args.garden);
  } catch (error) {
    console.log("  ❌", error.message);
  }

  console.log("\n=== Writing Intro Essay to First Garden ===\n");

  // Write intro essay to the first garden
  try {
    const essay1 = await hre.ethers.getContractAt("Essay", gardens[0].essay);

    const essayContent = `<h1>Welcome to the Complete Test Garden</h1>

<p>This is an introductory essay for a test garden that demonstrates all the features of the Garden Factory system.</p>

<h2>About This Garden</h2>

<p>This garden was created to showcase the full capabilities of on-chain gardens:</p>

<ul>
<li>Customizable metadata and styling</li>
<li>Introductory essays stored on-chain</li>
<li>Sculpture collections from various artists</li>
<li>Full configuration flexibility</li>
</ul>

<h2>The Vision</h2>

<p>Digital gardens on the blockchain represent a new paradigm for curating and presenting creative work. Each garden is:</p>

<blockquote>
A permanent, censorship-resistant exhibition space that lives on Ethereum forever.
</blockquote>

<p>By storing all content on-chain using SSTORE2, these gardens are truly decentralized and will persist as long as Ethereum exists.</p>

<h2>Building Your Own Garden</h2>

<p>Creating a garden is simple:</p>

<ol>
<li>Connect your wallet</li>
<li>Plant a garden with 0.01 ETH</li>
<li>Add sculptures from contract addresses</li>
<li>Write essays to provide context</li>
</ol>

<p>Welcome to the garden of gardens.</p>`;

    console.log("Publishing essay...");
    await (await essay1.publish(
      "Introduction to the Complete Test Garden",
      "Test Curator",
      essayContent
    )).wait();
    console.log("✅ Essay published");
  } catch (error) {
    console.log("❌ Essay publication failed:", error.message);
  }

  console.log("\n=== Deploying and Adding Sculpture to First Garden ===\n");

  // Deploy a standalone essay as a sculpture
  try {
    console.log("Deploying sculpture essay...");
    const txEssay = await factory.deployEssay();
    const receiptEssay = await txEssay.wait();
    const eventEssay = receiptEssay.logs.find(log => log.fragment?.name === "EssayDeployed");
    const sculptureAddr = eventEssay.args.essay;
    console.log("  ✅ Sculpture deployed:", sculptureAddr);

    // Publish content to the sculpture
    const sculpture = await hre.ethers.getContractAt("Essay", sculptureAddr);
    const sculptureContent = `<h1>On Digital Permanence</h1>

<p>What does it mean for art to be truly permanent?</p>

<p>Throughout history, artworks have been vulnerable to:</p>

<ul>
<li>Physical decay</li>
<li>Theft or destruction</li>
<li>Censorship</li>
<li>Loss through neglect</li>
</ul>

<p>Blockchain technology offers a new solution: <strong>cryptographic permanence</strong>.</p>

<h2>The Promise of On-Chain Storage</h2>

<p>When we store content directly on Ethereum:</p>

<blockquote>
The work becomes part of the ledger itself, replicated across thousands of nodes worldwide.
</blockquote>

<p>No single entity can delete it. No government can censor it. No company going bankrupt can cause its loss.</p>

<h2>A New Medium</h2>

<p>This permanence creates new artistic possibilities. Artists can create knowing their work will outlive institutions, platforms, and perhaps even themselves.</p>

<p>This is not just preservation—it's a fundamentally new medium for creative expression.</p>`;

    console.log("Publishing sculpture content...");
    await (await sculpture.publish(
      "On Digital Permanence",
      "Blockchain Philosopher",
      sculptureContent
    )).wait();
    console.log("  ✅ Sculpture content published");

    // Add sculpture to first garden
    console.log("\nAdding sculpture to first garden...");
    const garden1 = await hre.ethers.getContractAt("GardenConfigurable", gardens[0].address);
    await (await garden1.setSculptures([sculptureAddr])).wait();
    console.log("  ✅ Sculpture added to garden");

  } catch (error) {
    console.log("❌ Sculpture deployment/addition failed:", error.message);
  }

  console.log("\n=== Testing HTML Rendering ===\n");

  for (const g of gardens) {
    try {
      const garden = await hre.ethers.getContractAt("GardenConfigurable", g.address);
      const html = await garden.html();
      console.log(`✅ ${g.name}: ${html.length} bytes`);
    } catch (error) {
      console.log(`❌ ${g.name}: ${error.message}`);
    }
  }

  console.log("\n=== Summary ===");
  console.log("\nGardens deployed:");
  gardens.forEach(g => {
    console.log(`  ${g.name}: https://comfy-queijadas-c4223d.netlify.app/${g.address}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
