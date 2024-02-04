const { developmentChains } = require("../hardhat-helperConfig");
const {verify}= require("../utils/verify")

module.exports= async({getNamedAccounts, deployments})=>{
    const {deployer} = await getNamedAccounts()
    const {deploy, log}= deployments
    console.log("_______________");
const args = []

    const basicNft = await deploy("BasicNft", {
        from:deployer,
      args:args,
      log:true,
      waitConfirmations: 1
    })
    console.log("__________");

    if (!developmentChains) {
        await verify(basicNft.address, args)
    }


}
module.exports.tags=["basicnft"]
    