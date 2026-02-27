import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import {
  GardenFactory,
  GardenTemplateDeployer,
  GardenConfigurable,
  Essay,
  ModConfigurable,
  GardenRendererConfigurable,
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Integration Tests", function () {
  let factory: GardenFactory;
  let deployer: GardenTemplateDeployer;
  let owner: SignerWithAddress;
  let gardener: SignerWithAddress;

  beforeEach(async function () {
    [owner, gardener] = await ethers.getSigners();

    // Use deployments fixture to run deployment scripts
    await deployments.fixture(["Factory"]);

    // Get deployed contracts
    const factoryDeployment = await deployments.get("GardenFactory");
    const deployerDeployment = await deployments.get("GardenTemplateDeployer");

    factory = await ethers.getContractAt("GardenFactory", factoryDeployment.address) as GardenFactory;
    deployer = await ethers.getContractAt("GardenTemplateDeployer", deployerDeployment.address) as GardenTemplateDeployer;
  });

  describe("Full Garden Creation Flow", function () {
    it("Should create a complete garden with all contracts", async function () {
      // Create garden
      const tx = await factory.connect(gardener).createGarden(
        "My Garden",
        "The Gardener",
        "https://gardener.com",
        ["Alice", "Bob"],
        ["https://alice.com", "https://bob.com"],
        "🌻",
        "This is my exhibition text",
        ["https://garden.com"],
        "anthology",
        "#f0f0f0",
        "#101010",
        { value: ethers.parseEther("0.01") }
      );

      const receipt = await tx.wait();

      // Find GardenPlanted event
      const event = receipt!.logs.find(
        (log: any) => log.fragment && log.fragment.name === "GardenPlanted"
      ) as any;

      expect(event).to.not.be.undefined;

      // Get deployed addresses from event
      const gardenAddress = event.args.garden;
      const modAddress = event.args.mod;
      const essayAddress = event.args.essay;
      const rendererAddress = event.args.renderer;
      const webAddress = event.args.web;

      // Verify all contracts were deployed
      expect(gardenAddress).to.not.equal(ethers.ZeroAddress);
      expect(modAddress).to.not.equal(ethers.ZeroAddress);
      expect(essayAddress).to.not.equal(ethers.ZeroAddress);
      expect(rendererAddress).to.not.equal(ethers.ZeroAddress);
      expect(webAddress).to.not.equal(ethers.ZeroAddress);

      // Test Garden contract
      const garden = await ethers.getContractAt("GardenConfigurable", gardenAddress);
      expect(await garden.owner()).to.equal(gardener.address);
      expect(await garden.data()).to.equal(modAddress);

      // Test Mod contract
      const mod = await ethers.getContractAt("ModConfigurable", modAddress);
      expect(await mod.gardenTitle()).to.equal("My Garden");
      expect(await mod.curatorName()).to.equal("The Gardener");
      expect(await mod.curatorUrl()).to.equal("https://gardener.com");
      expect(await mod.unicodeSymbol()).to.equal("🌻");
      expect(await mod.collectionTerm()).to.equal("anthology");
      expect(await mod.backgroundColor()).to.equal("#f0f0f0");
      expect(await mod.textColor()).to.equal("#101010");

      // Test thank yous
      expect(await mod.getThankYouCount()).to.equal(2);
      const [name1, url1] = await mod.getThankYou(0);
      expect(name1).to.equal("Alice");
      expect(url1).to.equal("https://alice.com");

      // Test Essay contract
      const essay = await ethers.getContractAt("Essay", essayAddress);
      expect(await essay.owner()).to.equal(gardener.address);

      // Test Renderer contract
      const renderer = await ethers.getContractAt("GardenRendererConfigurable", rendererAddress);
      expect(await renderer.garden()).to.equal(gardenAddress);
      expect(await renderer.essayContract()).to.equal(essayAddress);
      expect(await renderer.data()).to.equal(modAddress);
    });

    it("Should allow garden owner to manage sculptures", async function () {
      // Create garden
      const tx = await factory.connect(gardener).createGarden(
        "Test Garden",
        "Curator",
        "https://curator.com",
        [],
        [],
        "🌺",
        "Exhibition",
        [],
        "collection",
        "#ffffff",
        "#000000",
        { value: ethers.parseEther("0.01") }
      );

      const receipt = await tx.wait();
      const event = receipt!.logs.find(
        (log: any) => log.fragment && log.fragment.name === "GardenPlanted"
      ) as any;

      const gardenAddress = event.args.garden;
      const garden = await ethers.getContractAt("GardenConfigurable", gardenAddress);

      // Deploy an independent essay to use as sculpture
      const essayTx = await factory.connect(gardener).deployEssay();
      const essayReceipt = await essayTx.wait();
      const essayEvent = essayReceipt!.logs.find(
        (log: any) => log.fragment && log.fragment.name === "EssayDeployed"
      ) as any;
      const sculptureAddress = essayEvent.args.essay;

      // Set up the essay with title and author so it implements Sculpture interface
      const sculpture = await ethers.getContractAt("Essay", sculptureAddress);
      await sculpture.connect(gardener).setTitle("My Sculpture");
      await sculpture.connect(gardener).setAuthor("Sculptor");

      // Add sculpture to garden
      await garden.connect(gardener).setSculptures([sculptureAddress]);

      // Verify sculpture was added
      const sculptures = await garden.getSculptures();
      expect(sculptures.length).to.equal(1);
      expect(sculptures[0]).to.equal(sculptureAddress);
    });

    it("Should allow writing an essay to the garden", async function () {
      // Create garden
      const tx = await factory.connect(gardener).createGarden(
        "Essay Garden",
        "Writer",
        "https://writer.com",
        [],
        [],
        "📝",
        "An exhibition of essays",
        [],
        "anthology",
        "#ffffff",
        "#000000",
        { value: ethers.parseEther("0.01") }
      );

      const receipt = await tx.wait();
      const event = receipt!.logs.find(
        (log: any) => log.fragment && log.fragment.name === "GardenPlanted"
      ) as any;

      const essayAddress = event.args.essay;
      const essay = await ethers.getContractAt("Essay", essayAddress);

      // Write essay content
      await essay.connect(gardener).setTitle("My First Essay");
      await essay.connect(gardener).setAuthor("The Writer");
      await essay.connect(gardener).setTextPt1("<p>This is the essay content.</p>");

      // Verify essay content
      expect(await essay.title()).to.equal("My First Essay");
      const authors = await essay.authors();
      expect(authors[0]).to.equal("The Writer");
      expect(await essay.text()).to.equal("<p>This is the essay content.</p>");
    });

    it("Should render HTML from garden", async function () {
      // Create garden
      const tx = await factory.connect(gardener).createGarden(
        "HTML Test Garden",
        "HTML Curator",
        "https://html.com",
        [],
        [],
        "🎨",
        "Testing HTML rendering",
        [],
        "gallery",
        "#000000",
        "#ffffff",
        { value: ethers.parseEther("0.01") }
      );

      const receipt = await tx.wait();
      const event = receipt!.logs.find(
        (log: any) => log.fragment && log.fragment.name === "GardenPlanted"
      ) as any;

      const gardenAddress = event.args.garden;
      const garden = await ethers.getContractAt("GardenConfigurable", gardenAddress);

      // Get HTML
      const html = await garden.html();

      // Verify HTML contains expected content
      expect(html).to.include("<!DOCTYPE html>");
      expect(html).to.include("HTML Test Garden");
      expect(html).to.include("HTML Curator");
      expect(html).to.include("🎨");
    });

    it("Should handle large essay content split across two parts", async function () {
      // Create garden
      const tx = await factory.connect(gardener).createGarden(
        "Large Essay Garden",
        "Prolific Writer",
        "https://writer.com",
        [],
        [],
        "📚",
        "Long form content",
        [],
        "library",
        "#f5f5f5",
        "#1a1a1a",
        { value: ethers.parseEther("0.01") }
      );

      const receipt = await tx.wait();
      const event = receipt!.logs.find(
        (log: any) => log.fragment && log.fragment.name === "GardenPlanted"
      ) as any;

      const essayAddress = event.args.essay;
      const essay = await ethers.getContractAt("Essay", essayAddress);

      // Write large essay (simulating content that needs two parts)
      const part1 = "<p>" + "a".repeat(10000) + "</p>";
      const part2 = "<p>" + "b".repeat(10000) + "</p>";

      await essay.connect(gardener).setTitle("A Very Long Essay");
      await essay.connect(gardener).setAuthor("Verbose Author");
      await essay.connect(gardener).setTextPt1(part1);
      await essay.connect(gardener).setTextPt2(part2);

      // Verify both parts are concatenated
      const text = await essay.text();
      expect(text).to.include(part1);
      expect(text).to.include(part2);
      expect(text.length).to.equal(part1.length + part2.length);
    });
  });

  describe("Multiple Gardens", function () {
    it("Should support multiple gardens from same gardener", async function () {
      // Plant first garden
      await factory.connect(gardener).createGarden(
        "Garden 1",
        "Curator 1",
        "https://garden1.com",
        [],
        [],
        "🌸",
        "First garden",
        [],
        "anthology",
        "#ffffff",
        "#000000",
        { value: ethers.parseEther("0.01") }
      );

      // Plant second garden
      await factory.connect(gardener).createGarden(
        "Garden 2",
        "Curator 2",
        "https://garden2.com",
        [],
        [],
        "🌺",
        "Second garden",
        [],
        "collection",
        "#000000",
        "#ffffff",
        { value: ethers.parseEther("0.01") }
      );

      // Verify both gardens exist
      expect(await factory.gardenCount()).to.equal(2);
      const gardens = await factory.getGardens();
      expect(gardens.length).to.equal(2);
      expect(gardens[0]).to.not.equal(gardens[1]);

      // Verify gardener owns both
      const garden1 = await ethers.getContractAt("GardenConfigurable", gardens[0]);
      const garden2 = await ethers.getContractAt("GardenConfigurable", gardens[1]);
      expect(await garden1.owner()).to.equal(gardener.address);
      expect(await garden2.owner()).to.equal(gardener.address);
    });

    it("Should track gardens independently", async function () {
      // Create first garden with essay
      const tx1 = await factory.connect(gardener).createGarden(
        "Garden A",
        "Curator A",
        "https://a.com",
        [],
        [],
        "🌻",
        "Exhibition A",
        [],
        "show",
        "#aaaaaa",
        "#111111",
        { value: ethers.parseEther("0.01") }
      );

      const receipt1 = await tx1.wait();
      const event1 = receipt1!.logs.find(
        (log: any) => log.fragment && log.fragment.name === "GardenPlanted"
      ) as any;
      const essay1Address = event1.args.essay;

      // Create second garden with essay
      const tx2 = await factory.connect(gardener).createGarden(
        "Garden B",
        "Curator B",
        "https://b.com",
        [],
        [],
        "🌷",
        "Exhibition B",
        [],
        "gallery",
        "#bbbbbb",
        "#222222",
        { value: ethers.parseEther("0.01") }
      );

      const receipt2 = await tx2.wait();
      const event2 = receipt2!.logs.find(
        (log: any) => log.fragment && log.fragment.name === "GardenPlanted"
      ) as any;
      const essay2Address = event2.args.essay;

      // Write different content to each essay
      const essay1 = await ethers.getContractAt("Essay", essay1Address);
      const essay2 = await ethers.getContractAt("Essay", essay2Address);

      await essay1.connect(gardener).setTitle("Essay for Garden A");
      await essay2.connect(gardener).setTitle("Essay for Garden B");

      // Verify essays are independent
      expect(await essay1.title()).to.equal("Essay for Garden A");
      expect(await essay2.title()).to.equal("Essay for Garden B");
      expect(essay1Address).to.not.equal(essay2Address);
    });
  });

  describe("Gas Usage", function () {
    it("Should plant garden within reasonable gas limits", async function () {
      const tx = await factory.connect(gardener).createGarden(
        "Gas Test",
        "Gas Tester",
        "https://gas.com",
        [],
        [],
        "⛽",
        "Testing gas usage",
        [],
        "test",
        "#ffffff",
        "#000000",
        { value: ethers.parseEther("0.01") }
      );

      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed;

      console.log(`      Gas used for garden creation: ${gasUsed.toString()}`);

      // Should be less than 10M gas (current estimate ~6M)
      expect(gasUsed).to.be.lessThan(10000000n);
    });

    it("Should deploy essay with minimal gas", async function () {
      const tx = await factory.connect(gardener).deployEssay();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed;

      console.log(`      Gas used for essay deployment: ${gasUsed.toString()}`);

      // Should be reasonable for a contract deployment
      expect(gasUsed).to.be.lessThan(2000000n);
    });
  });

  describe("Error Handling", function () {
    it("Should revert if non-owner tries to modify garden", async function () {
      const [, , attacker] = await ethers.getSigners();

      // Create garden
      const tx = await factory.connect(gardener).createGarden(
        "Secure Garden",
        "Secure Curator",
        "https://secure.com",
        [],
        [],
        "🔒",
        "Security test",
        [],
        "vault",
        "#ffffff",
        "#000000",
        { value: ethers.parseEther("0.01") }
      );

      const receipt = await tx.wait();
      const event = receipt!.logs.find(
        (log: any) => log.fragment && log.fragment.name === "GardenPlanted"
      ) as any;

      const gardenAddress = event.args.garden;
      const garden = await ethers.getContractAt("GardenConfigurable", gardenAddress);

      // Attacker tries to modify sculptures
      await expect(
        garden.connect(attacker).setSculptures([])
      ).to.be.revertedWithCustomError(garden, "OwnableUnauthorizedAccount");
    });

    it("Should revert if non-owner tries to modify essay", async function () {
      const [, , attacker] = await ethers.getSigners();

      // Create garden with essay
      const tx = await factory.connect(gardener).createGarden(
        "Essay Garden",
        "Essay Curator",
        "https://essay.com",
        [],
        [],
        "📝",
        "Essay collection",
        [],
        "anthology",
        "#ffffff",
        "#000000",
        { value: ethers.parseEther("0.01") }
      );

      const receipt = await tx.wait();
      const event = receipt!.logs.find(
        (log: any) => log.fragment && log.fragment.name === "GardenPlanted"
      ) as any;

      const essayAddress = event.args.essay;
      const essay = await ethers.getContractAt("Essay", essayAddress);

      // Attacker tries to modify essay
      await expect(
        essay.connect(attacker).setTitle("Hacked")
      ).to.be.revertedWithCustomError(essay, "OwnableUnauthorizedAccount");

      await expect(
        essay.connect(attacker).setAuthor("Hacker")
      ).to.be.revertedWithCustomError(essay, "OwnableUnauthorizedAccount");

      await expect(
        essay.connect(attacker).setTextPt1("Hacked content")
      ).to.be.revertedWithCustomError(essay, "OwnableUnauthorizedAccount");
    });
  });
});
