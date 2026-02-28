const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Testing garden modifications with account:", deployer.address);

  // Test on some of our existing gardens
  const gardens = [
    { name: "Minimal", address: "0xb22C6468Fa6ddAC98886003A718dbB2a4d803E59" },
    { name: "Pastel", address: "0x551254C02a8e1C95a7664c918A7af15eBA065D03" },
    { name: "Ocean", address: "0xFf0d28f2E619E327e6b305ea6587ab49aa19F797" }
  ];

  console.log("\n=== Testing Garden Modifications ===\n");

  // Test 1: Modify Minimal garden (add all the fields it was missing)
  console.log("1. Minimal Garden - Adding missing metadata...");
  try {
    const garden = await hre.ethers.getContractAt("GardenConfigurable", gardens[0].address);
    const mod = await hre.ethers.getContractAt("ModConfigurable", await garden.data());

    console.log("  Current state:");
    console.log("    Title:", await mod.gardenTitle());
    console.log("    Curator:", await mod.curatorName(), "-", await mod.curatorUrl());
    console.log("    Symbol:", await mod.unicodeSymbol());

    // Add garden title
    console.log("\n  Setting garden title...");
    await (await mod.setGardenTitle("The Minimal Garden - Now Complete")).wait();
    console.log("  ✅ New title:", await mod.gardenTitle());

    // Add curator URL (was empty)
    console.log("\n  Setting curator URL...");
    await (await mod.setCurator("Minimalist", "https://minimal.design")).wait();
    console.log("  ✅ New curator:", await mod.curatorName(), "-", await mod.curatorUrl());

    // Add exhibition URLs
    console.log("\n  Setting exhibition URLs...");
    await (await mod.setExhibitionUrls(["https://minimal.garden", "https://less-is-more.art"])).wait();
    const urls = await garden.urls();
    console.log("  ✅ URLs:", urls);

    // Add thank yous
    console.log("\n  Setting thank yous...");
    await (await mod.setThankYous(
      ["Dieter Rams", "Donald Judd", "Agnes Martin"],
      ["https://rams.design", "", "https://agnesmartin.art"]
    )).wait();
    console.log("  ✅ Thank yous added");

    // Add exhibition text
    console.log("\n  Setting exhibition text...");
    await (await mod.setText("Less is more. This garden celebrates minimalist aesthetics.")).wait();
    console.log("  ✅ Text set");

    // Test rendering
    const html = await garden.html();
    console.log("\n  ✅ Garden still renders:", html.length, "bytes");
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Test 2: Change Pastel garden colors
  console.log("\n2. Pastel Garden - Changing colors...");
  try {
    const garden = await hre.ethers.getContractAt("GardenConfigurable", gardens[1].address);
    const mod = await hre.ethers.getContractAt("ModConfigurable", await garden.data());

    console.log("  Current colors:");
    console.log("    Background:", await mod.backgroundColor());
    console.log("    Text:", await mod.textColor());

    // Change to different pastel colors
    await (await mod.setColors("#E6F3FF", "#4A5D7D")).wait();
    console.log("\n  ✅ New colors:");
    console.log("    Background:", await mod.backgroundColor());
    console.log("    Text:", await mod.textColor());

    const html = await garden.html();
    console.log("  ✅ Garden renders:", html.length, "bytes");
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Test 3: Change Ocean garden symbol and collection term
  console.log("\n3. Ocean Garden - Changing symbol and term...");
  try {
    const garden = await hre.ethers.getContractAt("GardenConfigurable", gardens[2].address);
    const mod = await hre.ethers.getContractAt("ModConfigurable", await garden.data());

    console.log("  Current:");
    console.log("    Symbol:", await mod.unicodeSymbol());
    console.log("    Term:", await mod.collectionTerm());

    // Change symbol
    await (await mod.setUnicodeSymbol("🌊")).wait();
    console.log("\n  ✅ New symbol:", await mod.unicodeSymbol());

    // Change collection term
    await (await mod.setCollectionTerm("oceanic anthology")).wait();
    console.log("  ✅ New term:", await mod.collectionTerm());

    const html = await garden.html();
    console.log("  ✅ Garden renders:", html.length, "bytes");
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Test 4: Update thank yous (add more people)
  console.log("\n4. Ocean Garden - Updating thank yous...");
  try {
    const garden = await hre.ethers.getContractAt("GardenConfigurable", gardens[2].address);
    const mod = await hre.ethers.getContractAt("ModConfigurable", await garden.data());

    console.log("  Current thank you count:", await mod.getThankYouCount());

    // Add more people
    await (await mod.setThankYous(
      ["Wave", "Tide", "Current", "Storm", "Reef"],
      ["https://wave.com", "", "", "https://storm.io", "https://reef.org"]
    )).wait();
    console.log("  ✅ New thank you count:", await mod.getThankYouCount());

    // Verify they render
    const html = await garden.html();
    const hasWave = html.includes("Wave");
    const hasStorm = html.includes("Storm");
    const hasReef = html.includes("Reef");
    console.log("  ✅ Thank yous in HTML:", { hasWave, hasStorm, hasReef });
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Test 5: Change exhibition text multiple times
  console.log("\n5. Pastel Garden - Updating exhibition text...");
  try {
    const garden = await hre.ethers.getContractAt("GardenConfigurable", gardens[1].address);
    const mod = await hre.ethers.getContractAt("ModConfigurable", await garden.data());

    console.log("  Setting text version 1...");
    await (await mod.setText("First version of the exhibition text.")).wait();
    let text = await mod.text();
    console.log("  ✅", text);

    console.log("\n  Setting text version 2...");
    await (await mod.setText("Updated exhibition text with more details about the pastel aesthetic.")).wait();
    text = await mod.text();
    console.log("  ✅", text);

    const html = await garden.html();
    const hasUpdatedText = html.includes("Updated exhibition text");
    console.log("  ✅ Updated text in HTML:", hasUpdatedText);
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Test 6: Change curator name and URL
  console.log("\n6. Pastel Garden - Changing curator...");
  try {
    const garden = await hre.ethers.getContractAt("GardenConfigurable", gardens[1].address);
    const mod = await hre.ethers.getContractAt("ModConfigurable", await garden.data());

    console.log("  Current curator:", await mod.curatorName());

    await (await mod.setCurator("New Curator Name", "https://newcurator.art")).wait();
    console.log("  ✅ New curator:", await mod.curatorName());
    console.log("  ✅ New URL:", await mod.curatorUrl());

    const html = await garden.html();
    const hasNewCurator = html.includes("New Curator Name");
    console.log("  ✅ New curator in HTML:", hasNewCurator);
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Test 7: Remove thank yous (set to empty arrays)
  console.log("\n7. Minimal Garden - Removing thank yous...");
  try {
    const garden = await hre.ethers.getContractAt("GardenConfigurable", gardens[0].address);
    const mod = await hre.ethers.getContractAt("ModConfigurable", await garden.data());

    console.log("  Current thank you count:", await mod.getThankYouCount());

    await (await mod.setThankYous([], [])).wait();
    console.log("  ✅ New thank you count:", await mod.getThankYouCount());

    const html = await garden.html();
    const hasThankYouText = html.includes("with special thanks to");
    console.log("  ✅ No thank you section in HTML:", !hasThankYouText);
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Test 8: Change exhibition URLs
  console.log("\n8. Minimal Garden - Changing exhibition URLs...");
  try {
    const garden = await hre.ethers.getContractAt("GardenConfigurable", gardens[0].address);
    const mod = await hre.ethers.getContractAt("ModConfigurable", await garden.data());

    console.log("  Setting new URLs...");
    await (await mod.setExhibitionUrls([
      "https://updated-url-1.com",
      "https://updated-url-2.org",
      "https://updated-url-3.net"
    ])).wait();

    const urls = await garden.urls();
    console.log("  ✅ New URLs:", urls);

    const html = await garden.html();
    const hasNewUrl = html.includes("updated-url-1");
    console.log("  ✅ New URLs in HTML:", hasNewUrl);
  } catch (error) {
    console.log("  ❌", error.message);
  }

  console.log("\n=== Testing Complete Garden Renders ===\n");

  for (const g of gardens) {
    try {
      const garden = await hre.ethers.getContractAt("GardenConfigurable", g.address);
      const html = await garden.html();

      let issues = [];
      if (html.includes('href=""')) issues.push("empty href");
      if (html.includes('undefined')) issues.push("undefined text");
      if (html.includes('null')) issues.push("null text");

      if (issues.length > 0) {
        console.log(`⚠️  ${g.name}: ${html.length}b - Issues: ${issues.join(", ")}`);
      } else {
        console.log(`✅ ${g.name}: ${html.length}b - All good`);
      }
    } catch (error) {
      console.log(`❌ ${g.name}: ${error.message}`);
    }
  }

  console.log("\n=== Summary ===");
  console.log("All modification functions tested:");
  console.log("  ✓ setGardenTitle");
  console.log("  ✓ setCurator");
  console.log("  ✓ setExhibitionUrls");
  console.log("  ✓ setThankYous");
  console.log("  ✓ setText");
  console.log("  ✓ setUnicodeSymbol");
  console.log("  ✓ setCollectionTerm");
  console.log("  ✓ setColors");
  console.log("\nGardens tested:");
  gardens.forEach(g => console.log(`  ${g.name}: https://comfy-queijadas-c4223d.netlify.app/${g.address}`));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
