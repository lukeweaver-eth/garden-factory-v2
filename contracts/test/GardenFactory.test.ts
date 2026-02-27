import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { GardenFactory, GardenTemplateDeployer, GardenConfigurable } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("GardenFactory", function () {
  let factory: GardenFactory;
  let deployer: GardenTemplateDeployer;
  let owner: SignerWithAddress;
  let gardener: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async function () {
    [owner, gardener, other] = await ethers.getSigners();

    // Use deployments fixture to run deployment scripts
    await deployments.fixture(["Factory"]);

    // Get deployed contracts
    const factoryDeployment = await deployments.get("GardenFactory");
    const deployerDeployment = await deployments.get("GardenTemplateDeployer");

    factory = await ethers.getContractAt("GardenFactory", factoryDeployment.address) as GardenFactory;
    deployer = await ethers.getContractAt("GardenTemplateDeployer", deployerDeployment.address) as GardenTemplateDeployer;
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await factory.owner()).to.equal(owner.address);
    });

    it("Should set the correct deployer", async function () {
      expect(await factory.deployer()).to.equal(await deployer.getAddress());
    });

    it("Should have correct planting fee", async function () {
      expect(await factory.PLANTING_FEE()).to.equal(ethers.parseEther("0.01"));
    });

    it("Should start with 0 gardens", async function () {
      expect(await factory.gardenCount()).to.equal(0);
    });

    it("Should start with 0 gardeners", async function () {
      expect(await factory.totalGardeners()).to.equal(0);
    });
  });

  describe("createGarden", function () {
    const gardenParams = {
      gardenTitle: "Test Garden",
      curatorName: "Test Curator",
      curatorUrl: "https://test.com",
      thankYouNames: ["Alice", "Bob"],
      thankYouUrls: ["https://alice.com", "https://bob.com"],
      unicodeSymbol: "🌸",
      exhibitionText: "A test exhibition",
      gardenUrls: ["https://garden.com"],
      collectionTerm: "anthology",
      backgroundColor: "#000000",
      textColor: "#ffffff"
    };

    it("Should revert if planting fee not paid", async function () {
      await expect(
        factory.connect(gardener).createGarden(
          gardenParams.gardenTitle,
          gardenParams.curatorName,
          gardenParams.curatorUrl,
          gardenParams.thankYouNames,
          gardenParams.thankYouUrls,
          gardenParams.unicodeSymbol,
          gardenParams.exhibitionText,
          gardenParams.gardenUrls,
          gardenParams.collectionTerm,
          gardenParams.backgroundColor,
          gardenParams.textColor,
          { value: ethers.parseEther("0.009") }
        )
      ).to.be.revertedWith("Send 0.01 ETH to plant a garden");
    });

    it("Should plant a garden with correct fee", async function () {
      const tx = await factory.connect(gardener).createGarden(
        gardenParams.gardenTitle,
        gardenParams.curatorName,
        gardenParams.curatorUrl,
        gardenParams.thankYouNames,
        gardenParams.thankYouUrls,
        gardenParams.unicodeSymbol,
        gardenParams.exhibitionText,
        gardenParams.gardenUrls,
        gardenParams.collectionTerm,
        gardenParams.backgroundColor,
        gardenParams.textColor,
        { value: ethers.parseEther("0.01") }
      );

      await expect(tx).to.emit(factory, "GardenPlanted");
      expect(await factory.gardenCount()).to.equal(1);
      expect(await factory.totalGardeners()).to.equal(1);
      expect(await factory.gardensPlantedBy(gardener.address)).to.equal(1);
    });

    it("Should refund excess ETH", async function () {
      const balanceBefore = await ethers.provider.getBalance(gardener.address);

      const tx = await factory.connect(gardener).createGarden(
        gardenParams.gardenTitle,
        gardenParams.curatorName,
        gardenParams.curatorUrl,
        gardenParams.thankYouNames,
        gardenParams.thankYouUrls,
        gardenParams.unicodeSymbol,
        gardenParams.exhibitionText,
        gardenParams.gardenUrls,
        gardenParams.collectionTerm,
        gardenParams.backgroundColor,
        gardenParams.textColor,
        { value: ethers.parseEther("0.05") }
      );

      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(gardener.address);

      // Should only lose 0.01 ETH + gas
      const expectedBalance = balanceBefore - ethers.parseEther("0.01") - gasUsed;
      expect(balanceAfter).to.equal(expectedBalance);
    });

    it("Should use default symbol if empty", async function () {
      await factory.connect(gardener).createGarden(
        gardenParams.gardenTitle,
        gardenParams.curatorName,
        gardenParams.curatorUrl,
        gardenParams.thankYouNames,
        gardenParams.thankYouUrls,
        "", // empty symbol
        gardenParams.exhibitionText,
        gardenParams.gardenUrls,
        gardenParams.collectionTerm,
        gardenParams.backgroundColor,
        gardenParams.textColor,
        { value: ethers.parseEther("0.01") }
      );

      const entry = await factory.garden(0);
      expect(entry.unicodeSymbol).to.equal("⚘"); // default symbol
    });

    it("Should track multiple gardens by same gardener", async function () {
      // Plant first garden
      await factory.connect(gardener).createGarden(
        gardenParams.gardenTitle,
        gardenParams.curatorName,
        gardenParams.curatorUrl,
        gardenParams.thankYouNames,
        gardenParams.thankYouUrls,
        gardenParams.unicodeSymbol,
        gardenParams.exhibitionText,
        gardenParams.gardenUrls,
        gardenParams.collectionTerm,
        gardenParams.backgroundColor,
        gardenParams.textColor,
        { value: ethers.parseEther("0.01") }
      );

      // Plant second garden
      await factory.connect(gardener).createGarden(
        "Second Garden",
        "Curator 2",
        "https://test2.com",
        [],
        [],
        "🌺",
        "Another exhibition",
        [],
        "collection",
        "#ffffff",
        "#000000",
        { value: ethers.parseEther("0.01") }
      );

      expect(await factory.gardenCount()).to.equal(2);
      expect(await factory.totalGardeners()).to.equal(1); // Still 1 unique gardener
      expect(await factory.gardensPlantedBy(gardener.address)).to.equal(2);
    });

    it("Should track multiple unique gardeners", async function () {
      // Plant by first gardener
      await factory.connect(gardener).createGarden(
        gardenParams.gardenTitle,
        gardenParams.curatorName,
        gardenParams.curatorUrl,
        gardenParams.thankYouNames,
        gardenParams.thankYouUrls,
        gardenParams.unicodeSymbol,
        gardenParams.exhibitionText,
        gardenParams.gardenUrls,
        gardenParams.collectionTerm,
        gardenParams.backgroundColor,
        gardenParams.textColor,
        { value: ethers.parseEther("0.01") }
      );

      // Plant by second gardener
      await factory.connect(other).createGarden(
        "Other Garden",
        "Other Curator",
        "https://other.com",
        [],
        [],
        "🌻",
        "Other exhibition",
        [],
        "collection",
        "#ffffff",
        "#000000",
        { value: ethers.parseEther("0.01") }
      );

      expect(await factory.gardenCount()).to.equal(2);
      expect(await factory.totalGardeners()).to.equal(2);
      expect(await factory.gardensPlantedBy(gardener.address)).to.equal(1);
      expect(await factory.gardensPlantedBy(other.address)).to.equal(1);
    });

    it("Should emit GardenPlanted event with correct data", async function () {
      const tx = await factory.connect(gardener).createGarden(
        gardenParams.gardenTitle,
        gardenParams.curatorName,
        gardenParams.curatorUrl,
        gardenParams.thankYouNames,
        gardenParams.thankYouUrls,
        gardenParams.unicodeSymbol,
        gardenParams.exhibitionText,
        gardenParams.gardenUrls,
        gardenParams.collectionTerm,
        gardenParams.backgroundColor,
        gardenParams.textColor,
        { value: ethers.parseEther("0.01") }
      );

      const receipt = await tx.wait();
      const event = receipt!.logs.find(
        (log: any) => log.fragment && log.fragment.name === "GardenPlanted"
      );

      expect(event).to.not.be.undefined;
    });
  });

  describe("deployEssay", function () {
    it("Should deploy a standalone essay", async function () {
      const tx = await factory.connect(gardener).deployEssay();
      await expect(tx).to.emit(factory, "EssayDeployed");
    });

    it("Should allow anyone to deploy essays", async function () {
      await expect(factory.connect(gardener).deployEssay()).to.not.be.reverted;
      await expect(factory.connect(other).deployEssay()).to.not.be.reverted;
    });

    it("Should be free to deploy essays", async function () {
      const balanceBefore = await ethers.provider.getBalance(gardener.address);
      const tx = await factory.connect(gardener).deployEssay();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(gardener.address);

      // Should only lose gas, no additional fee
      expect(balanceAfter).to.equal(balanceBefore - gasUsed);
    });
  });

  describe("Garden Registry", function () {
    beforeEach(async function () {
      // Plant test garden
      await factory.connect(gardener).createGarden(
        "Test Garden",
        "Test Curator",
        "https://test.com",
        ["Alice"],
        ["https://alice.com"],
        "🌸",
        "Test exhibition",
        ["https://garden.com"],
        "anthology",
        "#000000",
        "#ffffff",
        { value: ethers.parseEther("0.01") }
      );
    });

    it("Should return garden entry by index", async function () {
      const entry = await factory.garden(0);
      expect(entry.gardener).to.equal(gardener.address);
      expect(entry.curatorName).to.equal("Test Curator");
      expect(entry.unicodeSymbol).to.equal("🌸");
    });

    it("Should revert for invalid index", async function () {
      await expect(factory.garden(1)).to.be.revertedWith("Index out of bounds");
    });

    it("Should return all garden addresses", async function () {
      const gardens = await factory.getGardens();
      expect(gardens.length).to.equal(1);
    });

    it("Should return all garden entries", async function () {
      const entries = await factory.getGardenEntries();
      expect(entries.length).to.equal(1);
      expect(entries[0].curatorName).to.equal("Test Curator");
    });
  });

  describe("Sculpture Interface", function () {
    it("Should return correct title", async function () {
      expect(await factory.title()).to.equal("Garden Factory");
    });

    it("Should return authors (curator names)", async function () {
      await factory.connect(gardener).createGarden(
        "Garden 1",
        "Curator 1",
        "https://test.com",
        [],
        [],
        "🌸",
        "Test",
        [],
        "anthology",
        "#000000",
        "#ffffff",
        { value: ethers.parseEther("0.01") }
      );

      const authors = await factory.authors();
      expect(authors.length).to.equal(1);
      expect(authors[0]).to.equal("Curator 1");
    });

    it("Should return addresses (factory + gardens)", async function () {
      await factory.connect(gardener).createGarden(
        "Garden 1",
        "Curator 1",
        "https://test.com",
        [],
        [],
        "🌸",
        "Test",
        [],
        "anthology",
        "#000000",
        "#ffffff",
        { value: ethers.parseEther("0.01") }
      );

      const addresses = await factory.addresses();
      expect(addresses.length).to.equal(2); // factory + 1 garden
      expect(addresses[0]).to.equal(await factory.getAddress());
    });

    it("Should return sculptures (gardens)", async function () {
      await factory.connect(gardener).createGarden(
        "Garden 1",
        "Curator 1",
        "https://test.com",
        [],
        [],
        "🌸",
        "Test",
        [],
        "anthology",
        "#000000",
        "#ffffff",
        { value: ethers.parseEther("0.01") }
      );

      const sculptures = await factory.getSculptures();
      expect(sculptures.length).to.equal(1);
    });

    it("Should return text description", async function () {
      const text = await factory.text();
      expect(text.length).to.be.greaterThan(0);
      expect(text).to.include("garden");
    });

    it("Should return urls array with factory.garden", async function () {
      const urls = await factory.urls();
      expect(urls.length).to.equal(1);
      expect(urls[0]).to.equal("https://factory.garden");
    });
  });

  describe("ETH Management", function () {
    beforeEach(async function () {
      // Plant garden to add funds
      await factory.connect(gardener).createGarden(
        "Test Garden",
        "Test Curator",
        "https://test.com",
        [],
        [],
        "🌸",
        "Test",
        [],
        "anthology",
        "#000000",
        "#ffffff",
        { value: ethers.parseEther("0.01") }
      );
    });

    it("Should allow owner to withdraw", async function () {
      const balanceBefore = await ethers.provider.getBalance(owner.address);

      const tx = await factory.connect(owner).withdraw(owner.address);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(owner.address);

      // Should receive 0.01 ETH minus gas
      expect(balanceAfter).to.equal(
        balanceBefore + ethers.parseEther("0.01") - gasUsed
      );
    });

    it("Should not allow non-owner to withdraw", async function () {
      await expect(
        factory.connect(gardener).withdraw(gardener.address)
      ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount");
    });

    it("Should revert on direct ETH transfer", async function () {
      await expect(
        owner.sendTransaction({
          to: await factory.getAddress(),
          value: ethers.parseEther("0.01")
        })
      ).to.be.revertedWith("Call createGarden() to plant a garden");
    });
  });

  describe("Web Interface", function () {
    it("Should return HTML", async function () {
      const html = await factory.html();
      expect(html).to.include("Garden Factory");
      expect(html).to.include("<!DOCTYPE html>");
    });

    it("Should include garden count in HTML", async function () {
      await factory.connect(gardener).createGarden(
        "Test Garden",
        "Test Curator",
        "https://test.com",
        [],
        [],
        "🌸",
        "Test",
        [],
        "anthology",
        "#000000",
        "#ffffff",
        { value: ethers.parseEther("0.01") }
      );

      const html = await factory.html();
      expect(html).to.include("1 gardens planted");
    });

    it("Should return resolve mode 5219", async function () {
      const mode = await factory.resolveMode();
      expect(ethers.decodeBytes32String(mode)).to.equal("5219");
    });

    it("Should handle request with no resource", async function () {
      const [statusCode, body, headers] = await factory.request([], []);
      expect(statusCode).to.equal(200);
      expect(body).to.include("Garden Factory");
      expect(headers[0].key).to.equal("Content-Type");
      expect(headers[0].value).to.equal("text/html; charset=utf-8");
    });

    it("Should return 404 for unknown resource", async function () {
      const [statusCode] = await factory.request(["unknown"], []);
      expect(statusCode).to.equal(404);
    });
  });
});
