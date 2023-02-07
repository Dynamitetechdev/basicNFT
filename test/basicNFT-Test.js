const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");

process.env.RANDOM_NFT
  ? describe.skip
  : describe("basicNFT", () => {
      let deployer, basicNFTContract;
      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["all"]);
        basicNFTContract = await ethers.getContract("BasicNft");
      });
      describe("mint", () => {
        it("should mint 1 nft", async () => {
          const startingNFTtokenId = await basicNFTContract.getTokenId();

          console.log(startingNFTtokenId.toString());

          await basicNFTContract._mint();

          const endingNFTtokenId = await basicNFTContract.getTokenId();
          console.log(endingNFTtokenId.toString());

          assert(endingNFTtokenId > startingNFTtokenId);
        });

        it("should emit an events", async () => {
          const TX = await basicNFTContract._mint();

          expect(TX).to.emit(basicNFTContract, "Transfer");
        });
      });
    });
