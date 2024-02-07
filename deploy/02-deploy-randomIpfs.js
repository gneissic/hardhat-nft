const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../hardhat-helperConfig")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/deployToPinata")
require("dotenv").config()

const FUNDS_AMOUNT = ethers.utils.parseEther("1")
const imagesLocation = "./images/nftRandomImages"
const tokenUris =  [
    'ipfs://QmaPFnU9ifadTGpEBQxarK43PUNa8FgT799SFr9UkaR3FK',
  'ipfs://QmNuLoeLStvUGGZJ6o4bfG8hWZ9kRuaKrfjG3TpQhFd7tF',
  'ipfs://QmbMLXUDq11efj3cJfRZ48cKnRhBKZHXkrxsxRaUciqSWQ'
  ]

const metadataTemplate  = {
    name: "",
    image: "",
    attributes:[
        {
            trait_type: "cuteness",
            value:100
        }
    ]
}
 

module.exports = async ({getNamedAccounts, deployments})=>{
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    if (chainId == 31337) {
        // create VRFV2 Subscription
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        subscriptionId = transactionReceipt.events[0].args.subId
        // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUNDS_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("----------------------------------------------------")
    const arguments = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["mintFee"],
        networkConfig[chainId]["callbackGasLimit"],
        tokenUris,
    ]

    const randomIpfsNft = await deploy("RandomIpfs", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: 1
    })
    console.log("hii");
    if (chainId == 31337) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)
    }
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomIpfsNft.address, arguments)
    }

}

async function handleTokenUris() {

    const tokenUris = []
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (const imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(/\b.png|\b.jpg|\b.jpeg/, "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs uploaded! They are:")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]

// const { network, ethers } = require("hardhat");
// const { networkConfig, developmentChains } = require("../hardhat-helperConfig");
// const { verify } = require("../utils/verify");

// const Token_URIs = [
//   "ipfs://QmaPFnU9ifadTGpEBQxarK43PUNa8FgT799SFr9UkaR3FK",
//   "ipfs://QmNuLoeLStvUGGZJ6o4bfG8hWZ9kRuaKrfjG3TpQhFd7tF",
//   "ipfs://QmbMLXUDq11efj3cJfRZ48cKnRhBKZHXkrxsxRaUciqSWQ",
// ];

// const FUND_AMOUNT = "1000000000000000000000"
// module.exports = async ({ getNamedAccounts, deployments }) => {
//     const { deploy, log } = deployments
//     const { deployer } = await getNamedAccounts()
//     const chainId = network.config.chainId
//     let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

//     if (chainId == 31337) {
//         // create VRFV2 Subscription
//         vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
//         vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
//         const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
//         const transactionReceipt = await transactionResponse.wait()
//         subscriptionId = transactionReceipt.events[0].args.subId
//         // Fund the subscription
//         // Our mock makes it so we don't actually have to worry about sending fund
//         await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
//     } else {
//         vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
//         subscriptionId = networkConfig[chainId].subscriptionId
//     }

//     log("----------------------------------------------------")
//     const arguments = [
//         vrfCoordinatorV2Address,
//         subscriptionId,
//         networkConfig[chainId]["gasLane"],
//         networkConfig[chainId]["mintFee"],
//         networkConfig[chainId]["callbackGasLimit"],
//         Token_URIs,
//     ]
//     const randomIpfsNft = await deploy("RandomIpfsNft", {
//         from: deployer,
//         args: arguments,
//         log: true,
//         waitConfirmations: 1,
//     })

//     if (chainId == 31337) {
//         await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)
//     }

//     // Verify the deployment
//     if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
//         log("Verifying...")
//         await verify(randomIpfsNft.address, arguments)
//     }
// }
