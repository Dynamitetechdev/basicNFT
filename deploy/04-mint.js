const { ethers, network } = require("hardhat");
const chainId = network.config.chainId;
module.exports = async ({ getNamedAccounts }) => {
  //   const deployer = await getNamedAccounts();
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  //basic NFT
  const basicNFT = await ethers.getContract("BasicNft", deployer);
  const basicNFTTX = await basicNFT._mint();
  await basicNFTTX.wait();
  console.log(`Token URI for Basic NFT: ${await basicNFT.tokenURI(0)}`);

  //dynamic NFT
  const dynamicNft = await ethers.getContract("DynamicNFT", deployer);

  const mintNFT = await dynamicNft.mintNFT(ethers.utils.parseEther("1"));
  await mintNFT.wait(1);

  const tokenURI = await dynamicNft.tokenURI(0);

  console.log(`DynamicNFT Token : ${tokenURI}`);

  // randomIPFS

  const randomIPFSNFT = await ethers.getContract("randomNFT", deployer);
  const getMintFee = await randomIPFSNFT.getMintFee();
  const requestNFTTX = await randomIPFSNFT.requestNft({
    value: getMintFee.toString(),
  });
  const requestNFTreceipt = await requestNFTTX.wait(1);
  await new Promise(async (resolve, reject) => {
    setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 500000);
    randomIPFSNFT.once("NFTMINT", async () => {
      console.log(`Token URI Random Ipfs: ${await randomIPFSNFT.getNFTURI(0)}`);
      resolve();
    });

    if (chainId == 31337) {
      const requestId = requestNFTreceipt.events[1].args.requestId;
      const mockV3Contract = await ethers.getContract("VRFCoordinatorV2Mock");
      await mockV3Contract.fulfillRandomWords(
        requestId,
        mockV3Contract.address
      );
    }
  });
};

module.exports.tags = ["all", "mint"];
