const { network } = require("hardhat");
const { verify } = require("../utils/verify");
const chainId = network.config.chainId;
module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const args = [];
  log("----------------Deploying BasicNft----------------------");
  const basicNFT = await deploy("BasicNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("----------------Deploying successful----------------------");

  if (chainId !== 31337 && process.env.ETHER_SCAN_API_KEY) {
    log("----------------Verifying BasicNFT----------------------");
    await verify(basicNFT.address, args);
    log("----------------Verification Successful----------------------");
  }
};

module.exports.tags = ["all", "BasicNft"];
