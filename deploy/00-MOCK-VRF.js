const { network, ethers } = require("hardhat");
const chainId = network.config.chainId;

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const BASE_FEE = "250000000000000000"; // 0.25 is this the premium in LINK?
  const GAS_PRICE_LINK = 1e9; // link per gas, is this the gas lane? // 0.000000001 LINK per gas

  const DECIMALS = 8;
  const INITIAL_PRICE = "10000000000000000000";
  const VRFargs = [BASE_FEE, GAS_PRICE_LINK];
  const AGGREGATORargs = [DECIMALS, INITIAL_PRICE];

  if (chainId == 31337) {
    log("--------Deploying Mock Contracts--------");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: VRFargs,
      log: true,
      waitConfirmations: network.config.blockConfirmations,
    });

    await deploy("MockV3Aggregator", {
      from: deployer,
      args: AGGREGATORargs,
      log: true,
    });
    log("------------Mocks Deployed---------------------");
  }
};

module.exports.tags = ["all", "mock"];
