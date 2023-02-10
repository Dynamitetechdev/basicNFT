const { getNamedAccounts, deployments, ethers } = require("hardhat");
const fs = require("fs");
const colors = require("colors");
const { assert } = require("console");
const { expect } = require("chai");
const lowSvg = fs.readFileSync("images/dynamicNft/frown.svg", {
  encoding: "utf8",
});

describe("Dynamic NFT", () => {
  let deployer, DynamicNFT;
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;

    await deployments.fixture(["all"]);

    DynamicNFT = await ethers.getContract("DynamicNFT");
    console.log(`Contract Address: ${DynamicNFT.address}`.bgYellow);
  });

  describe("svgToImageURI", () => {
    it("return an url to view the encoded svg", async () => {
      const svgLink = await DynamicNFT.svgToImageURI(lowSvg);
      console.log(`SVGLINK: ${svgLink}`.bgWhite);
      expect(deployer).to.equal(deployer);
    });
  });

  describe("tokenURI", () => {
    it.only("should return a base64 string to access the TOKEN URI of our nft", async () => {
      const tokenURI = await DynamicNFT.tokenURI(7);
      console.log(tokenURI);
      expect(deployer).to.equal(deployer);
    });
  });
});
