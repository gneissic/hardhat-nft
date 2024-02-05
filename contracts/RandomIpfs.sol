// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//errors
error RandomIpfs__OUT_OF_RANGE();
error RandomIpfs__NOT_ENOUGH_ETH_ENTERED();
error RandomIpfs__YOU_ARE_NOT_THE_OWNER_OF_THE_CONTRACT();
error RandomIpfs__OwnableUnauthorizedAccount();


contract RandomIpfs is VRFConsumerBaseV2, ERC721URIStorage{

//vrf variables
VRFCoordinatorV2Interface private immutable i_vrfCoordinatorV2;
uint64 private immutable i_subscriptionId;
bytes32 private immutable i_keyHash;
uint32  private immutable i_callbackGasLimit;
uint16 private constant REQUEST_CONFRIMATIONS = 3;
uint32 private constant NUW_WORDS =  1;

//vrf helpers
mapping(uint256 => address) public s_requestIdToSender;

//Nft variables
uint256 internal constant MAX_VALUE = 100;
uint256 private s_tokenCounter; 
string[] internal s_dogTokenUris;
uint256 private immutable i_mintFee;
address private owner;

//enums
enum Breed {Pug, Shiba_inu, St_benard }
//events
event NftRequested(uint256 indexed requestId, address indexed requester);
event NftMinted(uint256 indexed tokenId , Breed indexed breed, address minter);



constructor (address vrfCoordinatorV2, uint64 subscriptionId, bytes32 keyHash, uint32 callBackGasLimit, string[3] memory dogTokenUris, uint256 mintFee) 
VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("RandomDogsNft", "DOGS")  {
    i_vrfCoordinatorV2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_subscriptionId = subscriptionId;
    i_keyHash = keyHash;
    i_callbackGasLimit = callBackGasLimit;
    s_tokenCounter = 0;
    s_dogTokenUris = dogTokenUris;
    i_mintFee = mintFee;
}

 function requestNft() public payable returns (uint256 requestId) {
   if (msg.value < i_mintFee) {
      revert RandomIpfs__NOT_ENOUGH_ETH_ENTERED();
   }
    requestId = i_vrfCoordinatorV2.requestRandomWords(i_keyHash, i_subscriptionId, REQUEST_CONFRIMATIONS, i_callbackGasLimit,NUW_WORDS );
    s_requestIdToSender[requestId]  = msg.sender;
    emit NftRequested( requestId, msg.sender);
 }
 function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
   address dogOwner  = s_requestIdToSender[requestId];
   uint256 newTokenId  = s_tokenCounter;
   s_tokenCounter++;
   uint256 moddedRng = randomWords[0] % MAX_VALUE;
   Breed dogBreed =  getBreedFromRandomNum(moddedRng);
   _safeMint(dogOwner, newTokenId);
   _setTokenURI(newTokenId,  s_dogTokenUris[uint256(dogBreed)]);
   emit NftMinted(newTokenId, dogBreed, dogOwner);
 }

 function getChancesArray() public pure returns (uint256[3] memory ) {
    return [10, 30, MAX_VALUE];
 }
 function getBreedFromRandomNum(uint256 moddedRng) public pure returns(Breed) {
     uint256[3] memory chanceArray = getChancesArray();
     uint256 cumSum  = 0;

     for (uint256 i = 0; i < chanceArray.length; i++) {
      if (moddedRng >= cumSum && moddedRng < chanceArray[i] ) {
         
         return Breed(i);

      } 
      cumSum  =chanceArray[i];
         

     }
     revert RandomIpfs__OUT_OF_RANGE();

 }
 function getOwner()public view returns (address) {
   return owner;
 }
 
 function withdraw() public  {
   if (getOwner() != msg.sender) {
            revert RandomIpfs__OwnableUnauthorizedAccount();
        }
   uint256 amount = address(this).balance;
   (bool success, ) = payable(msg.sender).call{value:amount}("");

   if (!success) {
      revert  RandomIpfs__YOU_ARE_NOT_THE_OWNER_OF_THE_CONTRACT();
   } 
 }
 function getMintFee() public view returns(uint256) {
   return i_mintFee;
 }
 function getDogTokenUris(uint256 index)  public view returns(string memory){
   return s_dogTokenUris[index];

 }
 function getTokenCounter( ) public view returns (uint256) {
   return s_tokenCounter;
 }
 
}