const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Stress testing with account:", deployer.address);

  const factoryAddr = "0x4e1E64da55adFb53f0508AaA5DCb3F6F710a05c0";
  const factory = await hre.ethers.getContractAt("GardenFactory", factoryAddr);

  const gardens = [];
  const essays = [];

  console.log("\n=== Creating diverse gardens to test edge cases ===\n");

  // Test 1: Minimal garden (all defaults)
  console.log("1. Minimal garden (all empty optional fields)...");
  try {
    const tx1 = await factory.createGarden(
      "", // empty title - should use default
      "Minimalist",
      "",
      [],
      [],
      "", // empty symbol - should use default ⚘
      "",
      [],
      "", // empty collection term - should use default
      "", // empty bg color - should use default
      "", // empty text color - should use default
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt1 = await tx1.wait();
    const event1 = receipt1.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Minimal", address: event1.args.garden });
    console.log("✅ Created:", event1.args.garden);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  // Test 2: Maximum garden (all fields filled)
  console.log("\n2. Maximum garden (all fields maxed out)...");
  try {
    const tx2 = await factory.createGarden(
      "The Super Long Garden Title That Tests Character Limits And Display",
      "Curator with a Really Long Name That Might Cause Display Issues",
      "https://this-is-a-very-long-url.example.com/path/to/something/really/deep",
      ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"], // many thank yous
      ["https://alice.com", "https://bob.com", "https://charlie.com", "https://diana.com", "https://eve.com", "https://frank.com"],
      "🌺",
      "This is a very long exhibition text that describes the garden in great detail. It goes on and on about the philosophy of the garden, the artists involved, and the meaning behind everything. It's meant to test how long text is handled in the rendering.",
      ["https://garden1.com", "https://garden2.com", "https://garden3.com"],
      "anthology",
      "#FF00FF",
      "#00FFFF",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt2 = await tx2.wait();
    const event2 = receipt2.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Maximum", address: event2.args.garden });
    console.log("✅ Created:", event2.args.garden);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  // Test 3: Special characters and unicode
  console.log("\n3. Special characters and unicode...");
  try {
    const tx3 = await factory.createGarden(
      "Garden 🌸🌺🌻 with émojis & spëcial çhars",
      "Curator <>&\"'",
      "https://test.com?param=value&other=test",
      ["Alice & Bob", "Charlie's Garden", 'Diana "The Artist"'],
      ["https://test.com?a=1&b=2", "", "https://test.com/path"],
      "🎨",
      "Testing special chars: <>&\"' and unicode: 你好世界 مرحبا العالم",
      ["https://test.com?query=test&param=value"],
      "collection",
      "#000000",
      "#FFFFFF",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt3 = await tx3.wait();
    const event3 = receipt3.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Special Chars", address: event3.args.garden });
    console.log("✅ Created:", event3.args.garden);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  // Test 4: No curator URL but has thank yous with mixed URLs
  console.log("\n4. Mixed URL patterns (some empty, some filled)...");
  try {
    const tx4 = await factory.createGarden(
      "Mixed Links Garden",
      "Anonymous Curator",
      "", // no curator URL
      ["Person1", "Person2", "Person3", "Person4"],
      ["https://person1.com", "", "https://person3.com", ""], // alternating URLs
      "🌼",
      "Some people have links, some don't",
      ["", "https://garden.com", ""],
      "show",
      "#FFCCAA",
      "#332211",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt4 = await tx4.wait();
    const event4 = receipt4.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Mixed Links", address: event4.args.garden });
    console.log("✅ Created:", event4.args.garden);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  // Test 5: Dark mode colors
  console.log("\n5. Dark mode styling...");
  try {
    const tx5 = await factory.createGarden(
      "Dark Mode Garden",
      "Night Curator",
      "https://dark.garden",
      ["Moon", "Stars"],
      ["https://moon.com", "https://stars.com"],
      "🌙",
      "A garden designed for dark mode viewing",
      [],
      "nocturnal collection",
      "#000000",
      "#FFFFFF",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt5 = await tx5.wait();
    const event5 = receipt5.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Dark Mode", address: event5.args.garden });
    console.log("✅ Created:", event5.args.garden);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  // Test 6: Single thank you
  console.log("\n6. Single thank you...");
  try {
    const tx6 = await factory.createGarden(
      "Solo Thanks",
      "Grateful Curator",
      "https://grateful.com",
      ["One Person"],
      ["https://oneperson.com"],
      "💐",
      "Testing singular thank you rendering",
      [],
      "gratitude",
      "#FFD700",
      "#8B4513",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt6 = await tx6.wait();
    const event6 = receipt6.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Single Thanks", address: event6.args.garden });
    console.log("✅ Created:", event6.args.garden);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  console.log("\n=== Testing essay deployments ===\n");

  // Essay 1: Minimal essay
  console.log("1. Deploying minimal essay...");
  try {
    const txE1 = await factory.deployEssay();
    const receiptE1 = await txE1.wait();
    const eventE1 = receiptE1.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essayAddr1 = eventE1.args.essay;
    const essay1 = await hre.ethers.getContractAt("Essay", essayAddr1);

    await (await essay1.publish("Short", "Author", "<p>Minimal content.</p>")).wait();
    essays.push({ name: "Minimal Essay", address: essayAddr1 });
    console.log("✅ Published:", essayAddr1);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  // Essay 2: Essay with unicode and special chars
  console.log("\n2. Essay with unicode and special chars...");
  try {
    const txE2 = await factory.deployEssay();
    const receiptE2 = await txE2.wait();
    const eventE2 = receiptE2.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essayAddr2 = eventE2.args.essay;
    const essay2 = await hre.ethers.getContractAt("Essay", essayAddr2);

    const content2 = "<h1>Unicode Test 🌸</h1><p>你好世界 مرحبا العالم Здравствуй мир</p><p>Special chars: &lt;&gt;&amp;&quot;&#39;</p>";
    await (await essay2.publish("Unicode Essay", "International Author", content2)).wait();
    essays.push({ name: "Unicode Essay", address: essayAddr2 });
    console.log("✅ Published:", essayAddr2);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  // Essay 3: Large essay (close to 24KB limit)
  console.log("\n3. Large essay (testing size limits)...");
  try {
    const txE3 = await factory.deployEssay();
    const receiptE3 = await txE3.wait();
    const eventE3 = receiptE3.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essayAddr3 = eventE3.args.essay;
    const essay3 = await hre.ethers.getContractAt("Essay", essayAddr3);

    // Generate large content
    const paragraph = "<p>This is a paragraph that will be repeated many times to test the large essay handling. It contains enough text to make the total size substantial but not too large. We want to get close to the 24KB threshold to test the single-part storage. " + "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ".repeat(5) + "</p>";
    const largeContent = "<h1>Large Essay</h1>" + paragraph.repeat(40);

    await (await essay3.publish("Large Essay", "Verbose Author", largeContent)).wait();
    essays.push({ name: "Large Essay", address: essayAddr3 });
    console.log("✅ Published:", essayAddr3, "- Size:", new TextEncoder().encode(largeContent).length, "bytes");
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  // Essay 4: Very large essay (requires 2 parts)
  console.log("\n4. Very large essay (testing 2-part storage)...");
  try {
    const txE4 = await factory.deployEssay();
    const receiptE4 = await txE4.wait();
    const eventE4 = receiptE4.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essayAddr4 = eventE4.args.essay;
    const essay4 = await hre.ethers.getContractAt("Essay", essayAddr4);

    // Generate content >24KB
    const paragraph2 = "<p>This is a very long paragraph designed to exceed the 24KB threshold and require two-part storage. " + "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ".repeat(10) + "</p>";
    const veryLargeContent = "<h1>Very Large Essay</h1>" + paragraph2.repeat(60);

    // Split content
    const bytes = new TextEncoder().encode(veryLargeContent);
    const splitPoint = veryLargeContent.lastIndexOf('>',24000);
    const part1 = veryLargeContent.substring(0, splitPoint + 1);
    const part2 = veryLargeContent.substring(splitPoint + 1);

    await (await essay4.publishLarge("Huge Essay", "Prolific Author", part1, part2)).wait();
    essays.push({ name: "Huge Essay", address: essayAddr4 });
    console.log("✅ Published:", essayAddr4, "- Total size:", bytes.length, "bytes (2 parts)");
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  console.log("\n=== Testing garden HTML rendering ===\n");

  for (const garden of gardens) {
    console.log(`Testing ${garden.name} (${garden.address})...`);
    try {
      const gardenContract = await hre.ethers.getContractAt("GardenConfigurable", garden.address);
      const html = await gardenContract.html();
      console.log(`✅ Renders successfully (${html.length} bytes)`);

      // Check for common issues
      if (html.includes('href=""')) {
        console.log("⚠️  WARNING: Contains empty href attributes");
      }
      if (html.includes('undefined')) {
        console.log("⚠️  WARNING: Contains 'undefined' text");
      }
      if (html.includes('null')) {
        console.log("⚠️  WARNING: Contains 'null' text");
      }
    } catch (error) {
      console.log(`❌ FAILED to render: ${error.message}`);
    }
  }

  console.log("\n=== Testing essay HTML rendering ===\n");

  for (const essay of essays) {
    console.log(`Testing ${essay.name} (${essay.address})...`);
    try {
      const essayContract = await hre.ethers.getContractAt("Essay", essay.address);
      const html = await essayContract.html();
      console.log(`✅ Renders successfully (${html.length} bytes)`);
    } catch (error) {
      console.log(`❌ FAILED to render: ${error.message}`);
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Gardens created: ${gardens.length}`);
  console.log(`Essays created: ${essays.length}`);
  console.log("\nGarden addresses:");
  gardens.forEach(g => console.log(`  ${g.name}: ${g.address}`));
  console.log("\nEssay addresses:");
  essays.forEach(e => console.log(`  ${e.name}: ${e.address}`));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
