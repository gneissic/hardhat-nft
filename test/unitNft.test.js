const { getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../hardhat-helperConfig");
const { assert } = require("chai");

!developmentChains.includes(network.name) ? describe.skip : describe("basic-nft", ()=>{
    let deployer, basicNft
      beforeEach(async ()=>{
      accounts = await ethers.getSigners()
              deployer = accounts[0]
        await deployments.fixture(["basicnft"])
        basicNft = await ethers.getContract("BasicNft")
      })
      describe("constructor", function () {
        it("it initializes the nft correctly", async ()=>{
            const name = await basicNft.name()
            const symbol = await basicNft.symbol()
            const tokenCounter = await basicNft.getTokenCounter()
            assert.equal(name, "Dogie")
            assert.equal(symbol, "DOG")
            assert.equal(tokenCounter.toString(), "0")
        })
      })
      describe("mint-nft", function () {
        beforeEach(async function () {
            const txReponse  = await basicNft.mintNft()
            await txReponse.wait(1)
            
        })
        it("calls the mintNft function apporpiately", async function() {
            const tokenCounter  = await basicNft.getTokenCounter()
            const tokenURI = await basicNft.tokenURI(0)
            assert.equal(tokenCounter.toString(), "1")
            assert.equal(tokenURI, await basicNft.TOKEN_URI())
        })
        it("shows the correct balance and the owner of the NFT", async ()=>{
            const owner  = deployer.address
            const nftOwner  = await basicNft.ownerOf(0)
            const deployerBalance  = await basicNft.balanceOf(owner)
            assert.equal(owner, nftOwner)
            assert.equal(deployerBalance.toString(), "1")
        })
      })
})