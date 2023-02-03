const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helper.config");
const { verify } = require("../utils/verify");

const chainId = network.config.chainId;

module.exports = async ({ deployments, getNamedAccounts }) => {
  let mockContract, vrfAddress, subscriptionId;
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
