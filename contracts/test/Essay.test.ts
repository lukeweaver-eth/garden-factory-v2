import { expect } from "chai";
import { ethers } from "hardhat";
import { Essay } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Essay", function () {
  let essay: Essay;
  let owner: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();

    const Essay = await ethers.getContractFactory("Essay");
    essay = await Essay.deploy();
    await essay.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await essay.owner()).to.equal(owner.address);
    });

    it("Should start with empty title", async function () {
      expect(await essay.title()).to.equal("");
    });

    it("Should start with empty author", async function () {
      const authors = await essay.authors();
      expect(authors[0]).to.equal("");
    });

    it("Should start with empty text", async function () {
      expect(await essay.text()).to.equal("");
    });

    it("Should return own address in addresses()", async function () {
      const addresses = await essay.addresses();
      expect(addresses.length).to.equal(1);
      expect(addresses[0]).to.equal(await essay.getAddress());
    });
  });

  describe("setTitle", function () {
    it("Should allow owner to set title", async function () {
      await essay.setTitle("Test Essay");
      expect(await essay.title()).to.equal("Test Essay");
    });

    it("Should not allow non-owner to set title", async function () {
      await expect(
        essay.connect(other).setTitle("Hack")
      ).to.be.revertedWithCustomError(essay, "OwnableUnauthorizedAccount");
    });

    it("Should allow updating title multiple times", async function () {
      await essay.setTitle("First Title");
      await essay.setTitle("Second Title");
      expect(await essay.title()).to.equal("Second Title");
    });
  });

  describe("setAuthor", function () {
    it("Should allow owner to set author", async function () {
      await essay.setAuthor("Test Author");
      const authors = await essay.authors();
      expect(authors[0]).to.equal("Test Author");
    });

    it("Should not allow non-owner to set author", async function () {
      await expect(
        essay.connect(other).setAuthor("Hacker")
      ).to.be.revertedWithCustomError(essay, "OwnableUnauthorizedAccount");
    });

    it("Should return author in array format", async function () {
      await essay.setAuthor("Alice");
      const authors = await essay.authors();
      expect(authors.length).to.equal(1);
      expect(authors[0]).to.equal("Alice");
    });
  });

  describe("setUrls", function () {
    it("Should allow owner to set URLs", async function () {
      const urls = ["https://example.com", "https://test.com"];
      await essay.setUrls(urls);
      const result = await essay.urls();
      expect(result.length).to.equal(2);
      expect(result[0]).to.equal("https://example.com");
      expect(result[1]).to.equal("https://test.com");
    });

    it("Should not allow non-owner to set URLs", async function () {
      await expect(
        essay.connect(other).setUrls(["https://hack.com"])
      ).to.be.revertedWithCustomError(essay, "OwnableUnauthorizedAccount");
    });

    it("Should allow empty URLs array", async function () {
      await essay.setUrls([]);
      const result = await essay.urls();
      expect(result.length).to.equal(0);
    });
  });

  describe("setTextPt1 and setTextPt2", function () {
    it("Should store text in part 1 using SSTORE2", async function () {
      const text = "This is a test essay content.";
      await essay.setTextPt1(text);
      expect(await essay.text()).to.equal(text);
    });

    it("Should not allow non-owner to set text part 1", async function () {
      await expect(
        essay.connect(other).setTextPt1("Hack")
      ).to.be.revertedWithCustomError(essay, "OwnableUnauthorizedAccount");
    });

    it("Should not allow non-owner to set text part 2", async function () {
      await expect(
        essay.connect(other).setTextPt2("Hack")
      ).to.be.revertedWithCustomError(essay, "OwnableUnauthorizedAccount");
    });

    it("Should concatenate part 1 and part 2", async function () {
      await essay.setTextPt1("First part. ");
      await essay.setTextPt2("Second part.");
      expect(await essay.text()).to.equal("First part. Second part.");
    });

    it("Should handle large text in part 1", async function () {
      const largeText = "a".repeat(10000);
      await essay.setTextPt1(largeText);
      expect(await essay.text()).to.equal(largeText);
    });

    it("Should return only part 1 if part 2 not set", async function () {
      await essay.setTextPt1("Only part one");
      expect(await essay.text()).to.equal("Only part one");
    });

    it("Should update text when called multiple times", async function () {
      await essay.setTextPt1("First version");
      await essay.setTextPt1("Updated version");
      expect(await essay.text()).to.equal("Updated version");
    });
  });

  describe("html", function () {
    it("Should return formatted HTML with title", async function () {
      await essay.setTitle("My Essay");
      const html = await essay.html();
      expect(html).to.include("<h1>My Essay</h1>");
    });

    it("Should include author in HTML when set", async function () {
      await essay.setTitle("Test");
      await essay.setAuthor("John Doe");
      const html = await essay.html();
      expect(html).to.include("John Doe");
      expect(html).to.include("Written by");
    });

    it("Should not show author line if author empty", async function () {
      await essay.setTitle("Test");
      const html = await essay.html();
      expect(html).to.not.include("Written by");
    });

    it("Should include text content in HTML", async function () {
      await essay.setTitle("Test");
      await essay.setTextPt1("<p>Essay content here</p>");
      const html = await essay.html();
      expect(html).to.include("<p>Essay content here</p>");
    });

    it("Should handle HTML with both text parts", async function () {
      await essay.setTitle("Complete Essay");
      await essay.setAuthor("Jane Smith");
      await essay.setTextPt1("<p>First paragraph.</p>");
      await essay.setTextPt2("<p>Second paragraph.</p>");

      const html = await essay.html();
      expect(html).to.include("<h1>Complete Essay</h1>");
      expect(html).to.include("Jane Smith");
      expect(html).to.include("<p>First paragraph.</p>");
      expect(html).to.include("<p>Second paragraph.</p>");
    });

    it("Should return minimal HTML when nothing set", async function () {
      const html = await essay.html();
      expect(html).to.include("<h1></h1>");
      expect(html).to.include("<div>");
    });
  });

  describe("Sculpture Interface", function () {
    it("Should implement title() from Sculpture", async function () {
      await essay.setTitle("Interface Test");
      expect(await essay.title()).to.equal("Interface Test");
    });

    it("Should implement authors() from Sculpture", async function () {
      await essay.setAuthor("Test Author");
      const authors = await essay.authors();
      expect(authors.length).to.equal(1);
      expect(authors[0]).to.equal("Test Author");
    });

    it("Should implement addresses() from Sculpture", async function () {
      const addresses = await essay.addresses();
      expect(addresses.length).to.equal(1);
      expect(addresses[0]).to.equal(await essay.getAddress());
    });

    it("Should implement urls() from Sculpture", async function () {
      const testUrls = ["https://example.com"];
      await essay.setUrls(testUrls);
      const urls = await essay.urls();
      expect(urls.length).to.equal(1);
      expect(urls[0]).to.equal("https://example.com");
    });

    it("Should implement text() from Sculpture", async function () {
      await essay.setTextPt1("Test content");
      expect(await essay.text()).to.equal("Test content");
    });
  });

  describe("Ownership Transfer", function () {
    it("Should allow owner to transfer ownership", async function () {
      await essay.transferOwnership(other.address);
      expect(await essay.owner()).to.equal(other.address);
    });

    it("Should allow new owner to set content", async function () {
      await essay.transferOwnership(other.address);
      await essay.connect(other).setTitle("New Owner Essay");
      expect(await essay.title()).to.equal("New Owner Essay");
    });

    it("Should prevent old owner from setting content after transfer", async function () {
      await essay.transferOwnership(other.address);
      await expect(
        essay.connect(owner).setTitle("Should Fail")
      ).to.be.revertedWithCustomError(essay, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle unicode in title", async function () {
      await essay.setTitle("Essay 🌸 Title");
      expect(await essay.title()).to.equal("Essay 🌸 Title");
    });

    it("Should handle unicode in author", async function () {
      await essay.setAuthor("作者");
      const authors = await essay.authors();
      expect(authors[0]).to.equal("作者");
    });

    it("Should handle special characters in text", async function () {
      await essay.setTextPt1("<p>Special chars: & < > \" '</p>");
      const text = await essay.text();
      expect(text).to.include("& < > \" '");
    });

    it("Should handle empty strings", async function () {
      await essay.setTitle("");
      await essay.setAuthor("");
      await essay.setTextPt1("");

      expect(await essay.title()).to.equal("");
      const authors = await essay.authors();
      expect(authors[0]).to.equal("");
      expect(await essay.text()).to.equal("");
    });
  });
});
