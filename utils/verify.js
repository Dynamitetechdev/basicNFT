const verify = async (address, args) => {
  await run("verify:verify", {
    address: address,
    contractAddresses: args,
  });
};
module.exports = {
  verify,
};
