const { network, ethers } = require("hardhat");
const { developmentChains } = require("../hardhat-helperConfig");
const {verify}= require("../utils/verify")
const fs  =  require("fs")

module.exports= async({getNamedAccounts, deployments})=>{
    const {deployer} = await getNamedAccounts()
    const {deploy, log}= deployments
    const chainId = network.config.chainId;
    let ethUdPriceAddress

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator  = await ethers.getContract("MockV3Aggregator")
ethUdPriceAddress = ethUsdAggregator.address
    }else{
        ethUdPriceAddress  = "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
    const highSvg = fs.readFileSync("../images/dynamicNft/cloud-bold.svg", { encoding: "utf8" })
    const lowSvg = fs.readFileSync("../images/dynamicNft/cloud-rain.svg", { encoding: "utf8" })
    const args = [lowSvg, highSvg, ethUdPriceAddress ]

    const dynmaicSvg  = await deploy("DynamicSvgNft", {from:deployer, args:args, log:true, waitConfirmations:1})
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(dynmaicSvg.address, arguments)
    }

    module.exports.tags = ["all", "dynamicsvg", "main"]

}