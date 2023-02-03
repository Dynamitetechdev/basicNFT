const { ethers } = require("hardhat");

const networkConfig = {
  5: {
    name: "goerli",
    vrfAddress: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    keyHash:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subId: "9104",
    callBackGasLimit: "500000",
    NFT_URIs: ["one", "two", "three"],
    MINT_FEE: ethers.utils.parseEther("1"),
  },
  31337: {
    name: "hardhat",
    keyHash:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    callBackGasLimit: "500000",
    NFT_URIs: ["one", "two", "three"],
    MINT_FEE: ethers.utils.parseEther("1"),
  },
};

module.exports = {
  networkConfig,
};
