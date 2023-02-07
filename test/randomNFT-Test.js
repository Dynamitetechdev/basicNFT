const { expect } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");

process.env.RANDOM_NFT
  ? describe("RandomNFT", () => {
      let deployer, mockContract, RandomNFT;
      const funds = ethers.utils.parseEther("2");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        RandomNFT = await ethers.getContract("randomNFT");
        mockContract = await ethers.getContract("VRFCoordinatorV2Mock");
        console.log(RandomNFT.address);
      });

      describe("constructor", () => {
        it("should be the same as the initialized Constructor", async () => {
          const MINT_FEE = await RandomNFT.getMintFee();
          expect(MINT_FEE).to.equal(ethers.utils.parseEther("1"));
        });
      });

      describe("request Nft", async () => {
        //   1. Pay
        // 2. check address
        // 3. emit
        it("Should Pay Sucessfully and emit an event", async () => {
          const transactionResponse = await RandomNFT.requestNft({
            value: funds,
          });
          const transactionReceipt = await transactionResponse.wait();
          const { requestId, Requester } = transactionReceipt.events[1].args;

          const requesterAddress = await RandomNFT.requesterAddress(requestId);
          expect(transactionResponse).to.emit(RandomNFT, "NFTrequest");
          expect(requesterAddress).to.equal(deployer);
        });

        it("should revert if payment is low", async () => {
          const transactionResponse = await RandomNFT.requestNft({
            value: ethers.utils.parseEther("0.9"),
          });

          expect(transactionResponse).to.be.revertedWith("randomNFT_lowFund");
        });
      });

      describe("fulfilRandomWord", async () => {
        it("fulfilling NFT", async () => {
          const transactionResponse = await RandomNFT.requestNft({
            value: funds,
          });
          const transactionReceipt = await transactionResponse.wait();
          const { requestId, Requester } = transactionReceipt.events[1].args;

          const fulfillingNFT = await mockContract.fulfillRandomWords(
            requestId,
            RandomNFT.address
          );

          const txReceipt = await fulfillingNFT.wait();
          const NFT_URI = await RandomNFT.getNFTURI(1);
          console.log(`NFT: ${NFT_URI}`);
          expect(fulfillingNFT).to.emit(RandomNFT, "NFTrequest");
        });
      });

      describe("withdrawal", () => {
        beforeEach(async () => {
          const transactionResponse = await RandomNFT.requestNft({
            value: funds,
          });
          const transactionReceipt = await transactionResponse.wait();
          const { requestId, Requester } = transactionReceipt.events[1].args;

          const fulfillingNFT = await mockContract.fulfillRandomWords(
            requestId,
            RandomNFT.address
          );
        });

        it.only("withdraw", async () => {
          const startingBalance = await RandomNFT.getBalance();

          await RandomNFT.withdraw();

          const EndingBalance = await RandomNFT.getBalance();

          expect(startingBalance > EndingBalance);
        });
      });
    })
  : describe.skip;
