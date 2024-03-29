const { ethers } = require("hardhat")

const networkConfig = {
    11155111:{
        name: "sepolia",
        vrfCoordinatorV2 :"0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        mintFee: ethers.utils.parseEther("0.02"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        subscriptionId : "6926",
        callbackGasLimit : "500000",
    },
    31337:{
        name: "hardhat",
        mintFee: ethers.utils.parseEther("0.02"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        callbackGasLimit : "500000",
        
        
    }
}
const developmentChains = ["hardhat", "localhost"]
const waitConfirmations = 6
const DECIMALS = "18"
const INITIAL_PRICE = "200000000000000000000"
module.exports= {
    developmentChains, networkConfig, waitConfirmations, DECIMALS, INITIAL_PRICE
}