const fs = require("fs");
const { network } = require("hardhat");
const { networkConfig } = require("../helper.config");
const colors = require("colors");
const chainId = network.config.chainId;
module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  let aggregatorAddress, aggregatorMockContract;

  const lowSvgImage = fs.readFileSync("images/dynamicNft/frown.svg", {
    encoding: "utf8",
  });

  const highSvgImage = fs.readFileSync("images/dynamicNFT/happy.svg", {
    encoding: "utf8",
  });

  if (chainId == 31337) {
    aggregatorMockContract = await ethers.getContract("MockV3Aggregator");
    aggregatorAddress = aggregatorMockContract.address;
  } else {
    aggregatorAddress = networkConfig[chainId]["aggregatorAddress"];
  }

  const arguments = [aggregatorAddress, lowSvgImage, highSvgImage];
  await deploy("DynamicNFT", {
    from: deployer,
    log: true,
    args: arguments,
  });

  console.log(`Aggregator Address: ${aggregatorAddress}`.bgYellow);
};

module.exports.tags = ["all", "DNFT"];
