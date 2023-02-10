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
      const svgToknURI = await DynamicNFT.__lowSvg();
      console.log(`SVGLINK: ${svgToknURI}`.bgWhite);
      expect(deployer).to.equal(deployer);
    });
  });

  describe("tokenURI", () => {
    it("should return a base64 string to access the TOKEN URI of our nft", async () => {
      const tokenURI = await DynamicNFT.tokenURI(7);
      console.log(tokenURI);
      expect(deployer).to.equal(deployer);
    });

    it.only("should create an NFT and emit and event", async () => {
      const mintNFT = await DynamicNFT.mintNFT(ethers.utils.parseEther("10"));
      const tokenId = await DynamicNFT.__tokenId();
      const getTokenURI = await DynamicNFT.tokenURI(0);
      console.log(`TOKEN URI: ${getTokenURI}`.bgYellow);
      expect(tokenId).to.equal(1);
      expect(mintNFT).to.emit(DynamicNFT, "createdNFT");
    });
  });
});
