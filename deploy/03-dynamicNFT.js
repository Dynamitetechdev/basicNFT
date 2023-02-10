const fs = require("fs");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const lowSvgImage = fs.readFileSync("images/dynamicNft/frown.svg", {
    encoding: "utf8",
  });

  const highSvgImage = fs.readFileSync("images/dynamicNFT/happy.svg", {
    encoding: "utf8",
  });

  const arguments = [lowSvgImage, highSvgImage];
  await deploy("DynamicNFT", {
    from: deployer,
    log: true,
    args: arguments,
  });

  console.log(`LowSVG: ${lowSvgImage}`);
};

module.exports.tags = ["all", "DNFT"];
