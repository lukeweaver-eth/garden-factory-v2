const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Creating diverse gardens with account:", deployer.address);

  const factoryAddr = "0x4e1E64da55adFb53f0508AaA5DCb3F6F710a05c0";
  const factory = await hre.ethers.getContractAt("GardenFactory", factoryAddr);

  const gardens = [];
  const essays = [];

  console.log("\n=== Creating 15+ diverse gardens ===\n");

  // Garden 1: Classic white background, black text
  console.log("1. Classic (white/black, flower symbol)...");
  try {
    const tx = await factory.createGarden(
      "Classic Garden",
      "Traditional Curator",
      "https://classic.garden",
      ["Alice", "Bob"],
      ["https://alice.com", "https://bob.com"],
      "🌸",
      "A traditional garden with classic styling",
      ["https://classic.garden"],
      "exhibition",
      "#FFFFFF",
      "#000000",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Classic", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 2: Dark mode
  console.log("\n2. Dark Mode (black/white, moon symbol)...");
  try {
    const tx = await factory.createGarden(
      "Night Garden",
      "Nocturnal Curator",
      "https://night.garden",
      ["Moon", "Stars", "Night"],
      ["https://moon.com", "", "https://night.com"],
      "🌙",
      "A garden designed for darkness",
      [],
      "nocturnal show",
      "#000000",
      "#FFFFFF",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Dark Mode", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 3: Pastel colors
  console.log("\n3. Pastel (soft colors, tulip)...");
  try {
    const tx = await factory.createGarden(
      "Pastel Dreams",
      "Soft Curator",
      "",
      ["Spring", "Summer"],
      ["", "https://summer.com"],
      "🌷",
      "Soft pastel aesthetic",
      ["https://pastel.garden"],
      "collection",
      "#FFF5F7",
      "#8B5A7D",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Pastel", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 4: Vibrant/neon colors
  console.log("\n4. Neon (bright colors, rose)...");
  try {
    const tx = await factory.createGarden(
      "Neon Garden",
      "Electric Curator",
      "https://neon.art",
      ["Volt"],
      ["https://volt.com"],
      "🌹",
      "High contrast neon aesthetics",
      [],
      "electric anthology",
      "#FF00FF",
      "#00FF00",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Neon", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 5: Earth tones
  console.log("\n5. Earth Tones (browns/greens, herb)...");
  try {
    const tx = await factory.createGarden(
      "Natural Garden",
      "Earth Keeper",
      "https://earth.garden",
      [],
      [],
      "🌿",
      "Inspired by nature and earth",
      ["https://natural.com", "https://organic.garden"],
      "natural collection",
      "#F5DEB3",
      "#2F4F2F",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Earth Tones", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 6: Ocean theme
  console.log("\n6. Ocean (blue theme, blossom)...");
  try {
    const tx = await factory.createGarden(
      "Deep Blue",
      "Ocean Curator",
      "",
      ["Wave", "Tide", "Current"],
      ["https://wave.com", "", ""],
      "🌺",
      "Depths of the digital ocean",
      [],
      "aquatic show",
      "#E0F7FA",
      "#006064",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Ocean", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 7: Minimal (no thank yous, no URLs, defaults)
  console.log("\n7. Minimal (empty fields, defaults)...");
  try {
    const tx = await factory.createGarden(
      "",
      "Minimal",
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
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Minimal", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 8: Sunset colors
  console.log("\n8. Sunset (warm oranges/purples, sunflower)...");
  try {
    const tx = await factory.createGarden(
      "Golden Hour",
      "Sunset Watcher",
      "https://sunset.gallery",
      ["Dawn", "Dusk"],
      ["https://dawn.art", "https://dusk.art"],
      "🌻",
      "Capturing the magic hour",
      ["https://golden.hour"],
      "twilight anthology",
      "#FFE5B4",
      "#8B4789",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Sunset", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 9: Monochrome red
  console.log("\n9. Monochrome Red (hibiscus)...");
  try {
    const tx = await factory.createGarden(
      "Ruby Garden",
      "Red Curator",
      "https://ruby.red",
      ["Crimson"],
      [""],
      "🌺",
      "Shades of red",
      [],
      "monochrome",
      "#FFE4E1",
      "#8B0000",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Monochrome Red", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 10: Retro/vintage
  console.log("\n10. Retro (vintage colors, daisy)...");
  try {
    const tx = await factory.createGarden(
      "Vintage Vibes",
      "Retro Collector",
      "",
      ["Nostalgia", "Memory", "Time"],
      ["", "", "https://time.travel"],
      "🌼",
      "A nostalgic journey through digital gardens",
      ["https://vintage.garden"],
      "retrospective",
      "#FAEBD7",
      "#8B4513",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Retro", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 11: Spring theme
  console.log("\n11. Spring (fresh greens, cherry blossom)...");
  try {
    const tx = await factory.createGarden(
      "Spring Awakening",
      "Season Keeper",
      "https://spring.garden",
      ["Bloom", "Growth", "Renewal"],
      ["https://bloom.com", "https://growth.org", ""],
      "🌸",
      "Celebrating new beginnings",
      [],
      "seasonal collection",
      "#F0FFF0",
      "#228B22",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Spring", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 12: High contrast
  console.log("\n12. High Contrast (pure black/white, lotus)...");
  try {
    const tx = await factory.createGarden(
      "Stark Contrast",
      "Binary Artist",
      "https://binary.art",
      ["Zero", "One"],
      ["https://zero.net", "https://one.net"],
      "🪷",
      "Pure digital dichotomy",
      [],
      "binary show",
      "#000000",
      "#FFFFFF",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "High Contrast", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 13: Purple reign
  console.log("\n13. Purple (violet theme, bouquet)...");
  try {
    const tx = await factory.createGarden(
      "Violet Valley",
      "Purple Collector",
      "",
      ["Lavender", "Amethyst", "Plum", "Violet", "Orchid"],
      ["", "", "", "", "https://orchid.com"],
      "💐",
      "Everything purple",
      ["https://violet.zone"],
      "monochromatic anthology",
      "#E6E6FA",
      "#4B0082",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Purple", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 14: Gold/luxury
  console.log("\n14. Gold (luxury theme, rose)...");
  try {
    const tx = await factory.createGarden(
      "Gilded Garden",
      "Gold Curator",
      "https://gold.luxury",
      ["Midas"],
      ["https://midas.touch"],
      "🌹",
      "Opulence in every petal",
      ["https://luxury.garden", "https://gilded.art"],
      "luxury collection",
      "#FFF8DC",
      "#DAA520",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Gold", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Garden 15: Autumn
  console.log("\n15. Autumn (fall colors, maple)...");
  try {
    const tx = await factory.createGarden(
      "Fall Harvest",
      "Autumn Keeper",
      "https://autumn.garden",
      ["Leaf", "Harvest"],
      ["https://leaf.fall", ""],
      "🍁",
      "Celebrating the changing season",
      [],
      "autumnal show",
      "#FFF8E7",
      "#8B4500",
      { value: hre.ethers.parseEther("0.01") }
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === "GardenPlanted");
    gardens.push({ name: "Autumn", address: event.args.garden });
    console.log("✅", event.args.garden);
  } catch (error) {
    console.log("❌", error.message);
  }

  console.log("\n=== Creating diverse essays ===\n");

  // Essay 1: Short and sweet
  console.log("1. Short essay...");
  try {
    const txE = await factory.deployEssay();
    const receiptE = await txE.wait();
    const eventE = receiptE.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay = await hre.ethers.getContractAt("Essay", eventE.args.essay);

    await (await essay.publish(
      "Brief Thoughts",
      "Minimalist Writer",
      "<p>Sometimes less is more. This essay proves it.</p>"
    )).wait();

    essays.push({ name: "Short", address: eventE.args.essay });
    console.log("✅", eventE.args.essay);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Essay 2: With formatting
  console.log("\n2. Formatted essay (headings, lists, quotes)...");
  try {
    const txE = await factory.deployEssay();
    const receiptE = await txE.wait();
    const eventE = receiptE.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay = await hre.ethers.getContractAt("Essay", eventE.args.essay);

    const content = `<h1>The Art of Gardens</h1>
<p>A treatise on digital cultivation.</p>

<h2>Introduction</h2>
<p>Gardens have always been spaces of reflection and beauty.</p>

<h3>Key Points</h3>
<ul>
  <li>Gardens are living spaces</li>
  <li>They evolve over time</li>
  <li>Community matters</li>
</ul>

<blockquote>
"A garden is never finished" - Ancient Proverb
</blockquote>

<p>And so we continue to plant.</p>`;

    await (await essay.publish(
      "The Art of Gardens",
      "Philosophical Gardener",
      content
    )).wait();

    essays.push({ name: "Formatted", address: eventE.args.essay });
    console.log("✅", eventE.args.essay);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Essay 3: Medium length with unicode
  console.log("\n3. Unicode essay...");
  try {
    const txE = await factory.deployEssay();
    const receiptE = await txE.wait();
    const eventE = receiptE.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay = await hre.ethers.getContractAt("Essay", eventE.args.essay);

    const content = `<h1>花园 🌸 Garden 庭園</h1>
<p>Gardens transcend language and culture. In Chinese: 花园 (huāyuán). In Japanese: 庭園 (teien).</p>
<p>🌍 Universal symbols: 🌸🌺🌻🌷🌹🌼</p>
<p>Cyrillic: Сад • Arabic: حديقة • Hebrew: גן</p>
<p>The concept of cultivation is universal.</p>`;

    await (await essay.publish(
      "Universal Gardens",
      "Global Curator",
      content
    )).wait();

    essays.push({ name: "Unicode", address: eventE.args.essay });
    console.log("✅", eventE.args.essay);
  } catch (error) {
    console.log("❌", error.message);
  }

  // Essay 4: Longer essay (testing size handling)
  console.log("\n4. Longer essay (multiple paragraphs)...");
  try {
    const txE = await factory.deployEssay();
    const receiptE = await txE.wait();
    const eventE = receiptE.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay = await hre.ethers.getContractAt("Essay", eventE.args.essay);

    const paragraph = "<p>This is a paragraph exploring the nature of digital gardens and their place in our contemporary landscape. Each word contributes to the overall meaning and structure of the piece.</p>";
    const content = "<h1>Extended Thoughts on Digital Gardens</h1>" +
                    paragraph.repeat(30) +
                    "<p><strong>Conclusion:</strong> Gardens persist.</p>";

    await (await essay.publish(
      "Extended Thoughts",
      "Verbose Author",
      content
    )).wait();

    essays.push({ name: "Longer", address: eventE.args.essay });
    console.log("✅", eventE.args.essay, "- Size:", new TextEncoder().encode(content).length, "bytes");
  } catch (error) {
    console.log("❌", error.message);
  }

  console.log("\n=== Testing all garden renders ===\n");

  for (const garden of gardens) {
    try {
      const g = await hre.ethers.getContractAt("GardenConfigurable", garden.address);
      const html = await g.html();

      let issues = [];
      if (html.includes('href=""')) issues.push("empty href");
      if (html.includes('undefined')) issues.push("undefined text");
      if (html.includes('null')) issues.push("null text");

      if (issues.length > 0) {
        console.log(`⚠️  ${garden.name}: ${html.length}b - Issues: ${issues.join(", ")}`);
      } else {
        console.log(`✅ ${garden.name}: ${html.length}b`);
      }
    } catch (error) {
      console.log(`❌ ${garden.name}: ${error.message}`);
    }
  }

  console.log("\n=== Testing all essay renders ===\n");

  for (const essay of essays) {
    try {
      const e = await hre.ethers.getContractAt("Essay", essay.address);
      const html = await e.html();
      console.log(`✅ ${essay.name}: ${html.length}b`);
    } catch (error) {
      console.log(`❌ ${essay.name}: ${error.message}`);
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Gardens created: ${gardens.length}`);
  console.log(`Essays created: ${essays.length}`);
  console.log("\nAll garden addresses:");
  gardens.forEach(g => console.log(`  ${g.name}: https://comfy-queijadas-c4223d.netlify.app/${g.address}`));
  console.log("\nAll essay addresses:");
  essays.forEach(e => console.log(`  ${e.name}: ${e.address}`));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
