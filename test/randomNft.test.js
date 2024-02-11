const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../hardhat-helperConfig");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name) ? describe.skip : describe("randomNFt", ()=>{
  let deployer, randomNft, VrfCoordinatorV2Mock
beforeEach(async()=>{
  deployer  = await getNamedAccounts().deployer
    await deployments.fixture(["randomipfs", "mocks"])
    randomNft = await ethers.getContract("RandomIpfs", deployer)
    VrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
})
    
  describe("constructor", function () {
    
    it("initializes the contract correctly ",async function() {
      const name = await randomNft.name()
      const symbol  = await randomNft.symbol()
      const mintFee  = await randomNft.getMintFee()
      assert.equal(name, "RandomDogsNft")
      assert.equal(symbol, "DOGS")
      assert.equal(mintFee.toString(), "20000000000000000"  )

    })
  })
  describe('request nft', async() => { 
    it("ensures the minter has enough eth", async function() {
    await  expect( randomNft.requestNft()).to.be.revertedWith("RandomIpfs__NOT_ENOUGH_ETH_ENTERED")
    })

})
})