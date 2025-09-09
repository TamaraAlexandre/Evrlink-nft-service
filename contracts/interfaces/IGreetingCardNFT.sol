// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGreetingCardNFT {
    // Events
    event GreetingCardMinted(uint256 tokenId, address owner, string tokenURI);
    event BatchMinted(uint256[] tokenIds, address owner);
    
    // View functions
    function MINT_PRICE() external view returns (uint256);
    function MAX_SUPPLY() external view returns (uint256);
    function tokenURI(uint256 tokenId) external view returns (string memory);
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
    
    // State changing functions
    function mintGreetingCard(string memory tokenURI, address recipient) external payable returns (uint256);
    function batchMintGreetingCards(string[] memory tokenURIs, address recipient) external payable returns (uint256[] memory);
    function withdraw() external;
    function setBaseURI(string memory baseURI) external;
}

