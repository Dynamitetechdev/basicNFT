const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helper.config");
const {
  storeImage,
  storeTokenURIMetadata,
} = require("../utils/uploadTopinata");
const { verify } = require("../utils/verify");
require("dotenv").config();

const chainId = network.config.chainId;
const imagesLocation = "images/randomNft";
const metaDataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "cuteness",
      value: 100,
    },
  ],
};

module.exports = async ({ deployments, getNamedAccounts }) => {
  let mockContract, vrfAddress, subscriptionId, tokenURIS;

  const handleTokenURIs = async () => {
    tokenURIS = [];

    const { responses: pinataResponse, imageFiles } = await storeImage(
      imagesLocation
    );

    for (index in pinataResponse) {
      let tokenURIMetaData = { ...metaDataTemplate };

      tokenURIMetaData.name = imageFiles[index].replace(".png", "");
      tokenURIMetaData.description = `${tokenURIMetaData.name} is a good ART.`;
      tokenURIMetaData.image = `ipfs://${pinataResponse[index].IpfsHash}`;

      const storeMetaDataRes = await storeTokenURIMetadata(
        tokenURIMetaData
      ).catch((e) => console.log(e));

      tokenURIS.push(`ipfs://${storeMetaDataRes.IpfsHash}`);
      console.log(`Uploading ${tokenURIMetaData.name}`);
      console.log("Uploading Token URIs. they are:");
      console.log(tokenURIS);
    }

    return tokenURIS;
  };
  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenURIS = await handleTokenURIs();
  }

  const amount = ethers.utils.parseEther("2");
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (chainId == 31337) {
    mockContract = await ethers.getContract("VRFCoordinatorV2Mock");
    const transactionResponse = await mockContract.createSubscription();
    const transactionReceipt = await transactionResponse.wait();
    subscriptionId = transactionReceipt.events[0].args.subId;
    mockContract.fundSubscription(subscriptionId, amount);

    vrfAddress = mockContract.address;
  } else {
    vrfAddress = networkConfig[chainId]["vrfAddress"];
    subscriptionId = networkConfig[chainId]["subId"];
  }
  const args = [
    vrfAddress,
    networkConfig[chainId]["keyHash"],
    subscriptionId,
    networkConfig[chainId]["callBackGasLimit"],
    networkConfig[chainId]["NFT_URIs"],
    networkConfig[chainId]["MINT_FEE"],
  ];

  log("--------Deploying Random NFT Contract-----------");
  const randomNFTContract = await deploy("randomNFT", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations,
  });
  log("--------Deployed Random NFT Contract-----------");

  if (chainId === 31337) {
    await mockContract.addConsumer(subscriptionId, randomNFTContract.address);
  }
  if (chainId !== 31337 && process.env.ETHER_SCAN_API_KEY) {
    log("--------verifying Random NFT Contract-----------");
    await verify(randomNFTContract.address, args);
    log("--------verified Random NFT Contract-----------");
  }
};

module.exports.tags = ["all", "RNT"];
