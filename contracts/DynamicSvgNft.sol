// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";


contract DynamicSvgNft is ERC721Enumerable {
  uint256 private s_tokenCounter;
  string private  i_lowSvg;
  string private  i_highSvg;
  string private constant base64EncodingPrefix = "data:image/svg+xml;base64, ";
  mapping(uint256=> int256) private s_tokenIdToHighValue;
  AggregatorV3Interface internal immutable i_priceFeed;
  //events
  event createdNft(uint256 indexed tokenId, int256 highValue);
  constructor(
    string memory lowSvg,
    string memory highSvg,
    address priceFeedAddess
  ) ERC721("Dynamic Svg Nft", "DIN") {
    s_tokenCounter = 0;
    i_highSvg = convertSvgUrl(highSvg);
    i_lowSvg = convertSvgUrl(lowSvg);
    i_priceFeed = AggregatorV3Interface(priceFeedAddess);
  }

  function convertSvgUrl(
    string memory svgUri
  ) public pure returns (string memory) {
    string memory svgBase64Encoded = Base64.encode(
      bytes(string(abi.encodePacked(svgUri)))
    );
    return string(abi.encodePacked(base64EncodingPrefix, svgBase64Encoded));
  }
   function _baseURI() internal pure override returns(string memory) {
    return "data:application/json;base64,";
   }
  function MintNft(int256 highValue) public {
    uint256 newTokenId  = s_tokenCounter;
    s_tokenIdToHighValue[s_tokenCounter] = highValue;
    _safeMint(msg.sender, newTokenId);
    s_tokenCounter = s_tokenCounter + 1;

    emit createdNft(s_tokenCounter, highValue);
  }
  function tokenURI(
    uint256 tokenId
  ) public view override returns (string memory) {
    
    (, int256 price, , , )  = i_priceFeed.latestRoundData();
    string memory imageURI = i_lowSvg;

    if (price >= s_tokenIdToHighValue[tokenId]) {
        imageURI = i_highSvg;
    } 


   return  string(abi.encodePacked(_baseURI(), Base64.encode(
      bytes(
            abi.encodePacked(
              '{"name":", "description":"Dynamic svg nft",'
            
              '", "description":"An NFT that changes based on the Chainlink Feed", ',
              '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
              imageURI,
              '"}'
        )
      )
    )));
   
  }
}
