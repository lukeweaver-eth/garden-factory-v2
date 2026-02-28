const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Adding sculptures with account:", deployer.address);

  const factoryAddr = "0x4e1E64da55adFb53f0508AaA5DCb3F6F710a05c0";
  const factory = await hre.ethers.getContractAt("GardenFactory", factoryAddr);

  // Gardens from previous deployment
  const gardens = [
    { name: "Classic", address: "0xEB88d9a80270B88d0a8f736b3D94B8a02b449439" },
    { name: "Dark Mode", address: "0xCb4E3fD2AeFBE8F15D385521a8a1858Ce7B2acA7" },
    { name: "Pastel", address: "0x551254C02a8e1C95a7664c918A7af15eBA065D03" },
    { name: "Neon", address: "0x87b783b275a3f941d446C3Dc626d21A3D0321362" },
    { name: "Earth Tones", address: "0x863bc45D31dc25B4508C689cDB70dD7cC995c154" }
  ];

  console.log("\n=== Creating and adding sculptures to gardens ===\n");

  // Garden 1: Classic - Add 3 essays
  console.log("1. Classic Garden - Adding 3 sculptures...");
  try {
    // Deploy 3 essays
    const essays1 = [];

    // Essay 1: About beauty
    const tx1_1 = await factory.deployEssay();
    const receipt1_1 = await tx1_1.wait();
    const event1_1 = receipt1_1.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay1_1 = await hre.ethers.getContractAt("Essay", event1_1.args.essay);
    await (await essay1_1.publish(
      "On Beauty",
      "Classic Author",
      "<h2>The Nature of Beauty</h2><p>Beauty is not merely in the eye of the beholder, but in the careful cultivation of form and function. Like a well-tended garden, true beauty emerges from attention to detail and harmony of elements.</p><p>In the classical tradition, we find enduring principles that guide our aesthetic judgment. These principles, tested by time, offer us a foundation upon which to build new understanding.</p>"
    )).wait();
    essays1.push(event1_1.args.essay);
    console.log("  ✅ Essay 1:", event1_1.args.essay);

    // Essay 2: About time
    const tx1_2 = await factory.deployEssay();
    const receipt1_2 = await tx1_2.wait();
    const event1_2 = receipt1_2.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay1_2 = await hre.ethers.getContractAt("Essay", event1_2.args.essay);
    await (await essay1_2.publish(
      "Time & Gardens",
      "Temporal Philosopher",
      "<h2>The Garden Through Time</h2><p>A garden is never static. It exists in constant dialogue with time, each season bringing transformation. What we plant today becomes tomorrow's legacy.</p><blockquote>\"To plant a garden is to believe in tomorrow.\" - Audrey Hepburn</blockquote>"
    )).wait();
    essays1.push(event1_2.args.essay);
    console.log("  ✅ Essay 2:", event1_2.args.essay);

    // Essay 3: About form
    const tx1_3 = await factory.deployEssay();
    const receipt1_3 = await tx1_3.wait();
    const event1_3 = receipt1_3.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay1_3 = await hre.ethers.getContractAt("Essay", event1_3.args.essay);
    await (await essay1_3.publish(
      "Classical Form",
      "Formalist",
      "<h2>Form Follows Function</h2><p>In classical design, every element serves a purpose. The marriage of form and function creates timeless works that endure.</p>"
    )).wait();
    essays1.push(event1_3.args.essay);
    console.log("  ✅ Essay 3:", event1_3.args.essay);

    // Add to garden
    const garden1 = await hre.ethers.getContractAt("GardenConfigurable", gardens[0].address);
    await (await garden1.setSculptures(essays1)).wait();
    console.log("  ✅ Added to Classic Garden");
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Garden 2: Dark Mode - Add 2 essays
  console.log("\n2. Dark Mode Garden - Adding 2 sculptures...");
  try {
    const essays2 = [];

    // Essay 1: Night thoughts
    const tx2_1 = await factory.deployEssay();
    const receipt2_1 = await tx2_1.wait();
    const event2_1 = receipt2_1.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay2_1 = await hre.ethers.getContractAt("Essay", event2_1.args.essay);
    await (await essay2_1.publish(
      "Nocturnal Musings",
      "Night Owl",
      "<h2>The Dark as Canvas</h2><p>Darkness is not absence but presence. In the night, we find clarity that daylight obscures. The shadows teach us to see differently.</p><p>🌙 Under the moon's gentle light, truth emerges.</p>"
    )).wait();
    essays2.push(event2_1.args.essay);
    console.log("  ✅ Essay 1:", event2_1.args.essay);

    // Essay 2: Stars
    const tx2_2 = await factory.deployEssay();
    const receipt2_2 = await tx2_2.wait();
    const event2_2 = receipt2_2.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay2_2 = await hre.ethers.getContractAt("Essay", event2_2.args.essay);
    await (await essay2_2.publish(
      "Stellar Garden",
      "Star Gazer",
      "<h2>Gardens in the Sky</h2><p>The night sky is the ultimate garden - vast, mysterious, ever-changing. Each star a seed of light planted in the cosmic soil.</p><p>⭐ We are all made of stardust.</p>"
    )).wait();
    essays2.push(event2_2.args.essay);
    console.log("  ✅ Essay 2:", event2_2.args.essay);

    // Add to garden
    const garden2 = await hre.ethers.getContractAt("GardenConfigurable", gardens[1].address);
    await (await garden2.setSculptures(essays2)).wait();
    console.log("  ✅ Added to Dark Mode Garden");
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Garden 3: Pastel - Add 1 essay
  console.log("\n3. Pastel Garden - Adding 1 sculpture...");
  try {
    const essays3 = [];

    const tx3_1 = await factory.deployEssay();
    const receipt3_1 = await tx3_1.wait();
    const event3_1 = receipt3_1.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay3_1 = await hre.ethers.getContractAt("Essay", event3_1.args.essay);
    await (await essay3_1.publish(
      "Soft Thoughts",
      "Gentle Soul",
      "<h2>The Softness of Being</h2><p>In pastel shades we find gentleness. Not weakness, but a quiet strength that whispers rather than shouts.</p><p>Like watercolors on paper, ideas blend and merge, creating something new from soft beginnings. 🌷</p><p><em>Soft is not weak. Soft is powerful.</em></p>"
    )).wait();
    essays3.push(event3_1.args.essay);
    console.log("  ✅ Essay 1:", event3_1.args.essay);

    // Add to garden
    const garden3 = await hre.ethers.getContractAt("GardenConfigurable", gardens[2].address);
    await (await garden3.setSculptures(essays3)).wait();
    console.log("  ✅ Added to Pastel Garden");
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Garden 4: Neon - Add 4 essays (test larger collection)
  console.log("\n4. Neon Garden - Adding 4 sculptures...");
  try {
    const essays4 = [];

    // Essay 1: Energy
    const tx4_1 = await factory.deployEssay();
    const receipt4_1 = await tx4_1.wait();
    const event4_1 = receipt4_1.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay4_1 = await hre.ethers.getContractAt("Essay", event4_1.args.essay);
    await (await essay4_1.publish(
      "Electric Dreams",
      "Voltage Poet",
      "<h2>⚡ High Voltage Thoughts</h2><p>Energy crackles through the digital garden. Neon light traces patterns in the dark, illuminating pathways never seen before.</p>"
    )).wait();
    essays4.push(event4_1.args.essay);
    console.log("  ✅ Essay 1:", event4_1.args.essay);

    // Essay 2: Color
    const tx4_2 = await factory.deployEssay();
    const receipt4_2 = await tx4_2.wait();
    const event4_2 = receipt4_2.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay4_2 = await hre.ethers.getContractAt("Essay", event4_2.args.essay);
    await (await essay4_2.publish(
      "Chromatic Explosion",
      "Color Theorist",
      "<h2>🎨 Beyond the Spectrum</h2><p>Color is not passive. It vibrates, it pulses, it demands attention. In neon we find color unleashed.</p>"
    )).wait();
    essays4.push(event4_2.args.essay);
    console.log("  ✅ Essay 2:", event4_2.args.essay);

    // Essay 3: Contrast
    const tx4_3 = await factory.deployEssay();
    const receipt4_3 = await tx4_3.wait();
    const event4_3 = receipt4_3.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay4_3 = await hre.ethers.getContractAt("Essay", event4_3.args.essay);
    await (await essay4_3.publish(
      "High Contrast Living",
      "Maximalist",
      "<h2>Embrace the Extreme</h2><p>Why whisper when you can shout? Neon is about maximal expression, pushing boundaries, refusing to blend in.</p>"
    )).wait();
    essays4.push(event4_3.args.essay);
    console.log("  ✅ Essay 3:", event4_3.args.essay);

    // Essay 4: Future
    const tx4_4 = await factory.deployEssay();
    const receipt4_4 = await tx4_4.wait();
    const event4_4 = receipt4_4.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay4_4 = await hre.ethers.getContractAt("Essay", event4_4.args.essay);
    await (await essay4_4.publish(
      "Cyberpunk Garden",
      "Future Botanist",
      "<h2>🤖 Digital Flora</h2><p>In the neon garden, flowers are made of light and data. They bloom in cyberspace, pollinated by algorithms.</p>"
    )).wait();
    essays4.push(event4_4.args.essay);
    console.log("  ✅ Essay 4:", event4_4.args.essay);

    // Add to garden
    const garden4 = await hre.ethers.getContractAt("GardenConfigurable", gardens[3].address);
    await (await garden4.setSculptures(essays4)).wait();
    console.log("  ✅ Added to Neon Garden");
  } catch (error) {
    console.log("  ❌", error.message);
  }

  // Garden 5: Earth Tones - Add 2 essays
  console.log("\n5. Earth Tones Garden - Adding 2 sculptures...");
  try {
    const essays5 = [];

    // Essay 1: Nature
    const tx5_1 = await factory.deployEssay();
    const receipt5_1 = await tx5_1.wait();
    const event5_1 = receipt5_1.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay5_1 = await hre.ethers.getContractAt("Essay", event5_1.args.essay);
    await (await essay5_1.publish(
      "Return to Earth",
      "Nature Lover",
      "<h2>🌿 Grounded in Reality</h2><p>The earth does not lie. In soil and stone we find truth. Natural systems teach us balance, patience, cycles of growth and decay.</p><p>To garden is to participate in these ancient rhythms.</p>"
    )).wait();
    essays5.push(event5_1.args.essay);
    console.log("  ✅ Essay 1:", event5_1.args.essay);

    // Essay 2: Organic
    const tx5_2 = await factory.deployEssay();
    const receipt5_2 = await tx5_2.wait();
    const event5_2 = receipt5_2.logs.find(log => log.fragment?.name === "EssayDeployed");
    const essay5_2 = await hre.ethers.getContractAt("Essay", event5_2.args.essay);
    await (await essay5_2.publish(
      "Organic Growth",
      "Permaculturist",
      "<h2>Growing Naturally</h2><p>Organic growth cannot be forced. It emerges from the right conditions: good soil, adequate water, patient tending.</p><p>Digital gardens grow the same way.</p>"
    )).wait();
    essays5.push(event5_2.args.essay);
    console.log("  ✅ Essay 2:", event5_2.args.essay);

    // Add to garden
    const garden5 = await hre.ethers.getContractAt("GardenConfigurable", gardens[4].address);
    await (await garden5.setSculptures(essays5)).wait();
    console.log("  ✅ Added to Earth Tones Garden");
  } catch (error) {
    console.log("  ❌", error.message);
  }

  console.log("\n=== Testing populated gardens render ===\n");

  for (const garden of gardens) {
    try {
      const g = await hre.ethers.getContractAt("GardenConfigurable", garden.address);
      const html = await g.html();
      const sculptures = await g.getSculptures();

      console.log(`✅ ${garden.name}: ${html.length}b, ${sculptures.length} sculptures`);
    } catch (error) {
      console.log(`❌ ${garden.name}: ${error.message}`);
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log("Garden 1 (Classic): 3 sculptures");
  console.log("Garden 2 (Dark Mode): 2 sculptures");
  console.log("Garden 3 (Pastel): 1 sculpture");
  console.log("Garden 4 (Neon): 4 sculptures");
  console.log("Garden 5 (Earth Tones): 2 sculptures");
  console.log("\nVisit gardens at:");
  gardens.forEach(g => console.log(`  ${g.name}: https://comfy-queijadas-c4223d.netlify.app/${g.address}`));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
