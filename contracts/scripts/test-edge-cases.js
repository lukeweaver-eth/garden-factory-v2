const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Testing edge cases with account:", deployer.address);

  // Get factory
  const factoryAddr = "0x4e1E64da55adFb53f0508AaA5DCb3F6F710a05c0";
  const factory = await hre.ethers.getContractAt("GardenFactory", factoryAddr);

  console.log("\n=== Test Case 1: Garden with thank yous but no URLs (should work) ===");
  try {
    const tx1 = await factory.createGarden(
      "Edge Case Garden 1",
      "Test Curator",
      "", // no curator URL
      ["Alice", "Bob"], // thank you names
      [], // empty URLs - this should now show error in frontend validation
      "🌸",
      "Testing edge cases",
      [],
      "test",
      "#ffffff",
      "#000000",
      { value: hre.ethers.parseEther("0.01") }
    );
    await tx1.wait();
    console.log("❌ Should have failed but succeeded!");
  } catch (error) {
    console.log("✅ Correctly rejected mismatched arrays");
  }

  console.log("\n=== Test Case 2: Garden with matched thank you arrays ===");
  try {
    const tx2 = await factory.createGarden(
      "Edge Case Garden 2",
      "Test Curator",
      "", // no curator URL
      ["Alice", "Bob"], // thank you names
      ["https://alice.com", ""], // URLs - Alice has URL, Bob doesn't
      "🌺",
      "Testing matched arrays",
      [],
      "test",
      "#ffffff",
      "#000000",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt2 = await tx2.wait();
    const event2 = receipt2.logs.find(log => log.fragment?.name === "GardenPlanted");
    const gardenAddr2 = event2.args.garden;
    console.log("✅ Garden deployed:", gardenAddr2);

    // Try to call html() on the garden
    const garden2 = await hre.ethers.getContractAt("GardenConfigurable", gardenAddr2);
    const html2 = await garden2.html();
    console.log("✅ HTML rendered successfully (length:", html2.length, "bytes)");

    // Check it includes both thank yous
    if (html2.includes("Alice") && html2.includes("Bob")) {
      console.log("✅ Both thank yous appear in HTML");
    }
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  console.log("\n=== Test Case 3: Garden with no curator URL (should render without link) ===");
  try {
    const tx3 = await factory.createGarden(
      "Edge Case Garden 3",
      "Curator Without URL",
      "", // no curator URL - should render as plain text
      [],
      [],
      "🌻",
      "Testing curator without URL",
      [],
      "collection",
      "#000000",
      "#ffffff",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt3 = await tx3.wait();
    const event3 = receipt3.logs.find(log => log.fragment?.name === "GardenPlanted");
    const gardenAddr3 = event3.args.garden;
    console.log("✅ Garden deployed:", gardenAddr3);

    const garden3 = await hre.ethers.getContractAt("GardenConfigurable", gardenAddr3);
    const html3 = await garden3.html();
    console.log("✅ HTML rendered successfully");

    // Check curator name appears but not in a broken link
    if (html3.includes("Curator Without URL") && !html3.includes('href=""')) {
      console.log("✅ Curator rendered as plain text (no broken link)");
    }
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }

  console.log("\n=== All edge case tests completed ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
