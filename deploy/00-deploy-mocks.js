const { network, ethers } = require("hardhat");
const { DECIMALS, INITIAL_PRICE } = require("../hardhat-helperConfig");
const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;
  const args = [BASE_FEE, GAS_PRICE_LINK];
  if (chainId === 31337) {
    console.log("local network detected");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args,
    });
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
  }
  console.log("MOCK DEPLOYED");
};
module.exports.tags = ["all", "mocks", "main"];
