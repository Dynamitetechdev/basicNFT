const { network, ethers } = require("hardhat");
const chainId = network.config.chainId;

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const BASE_FEE = "250000000000000000"; // 0.25 is this the premium in LINK?
  const GAS_PRICE_LINK = 1e9; // link per gas, is this the gas lane? // 0.000000001 LINK per gas
  const args = [BASE_FEE, GAS_PRICE_LINK];

  if (chainId == 31337) {
    log("--------Deploying VRF Mock Contract--------");
    const mockVRFContract = await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: args,
      log: true,
      waitConfirmations: network.config.blockConfirmations,
    });

    log("------------Mock Deployed---------------------");
  }
};

module.exports.tags = ["all", "mock"];
