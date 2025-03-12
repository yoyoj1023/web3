// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundToken is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    constructor() ERC721("SoulboundToken", "SBT") {}

    function mint(address to) public onlyOwner {
        require(balanceOf(to) == 0, "Address already owns a token");
        _tokenIdCounter++;
        _safeMint(to, _tokenIdCounter);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override {
        require(from == address(0), "Soulbound tokens cannot be transferred");
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        _burn(tokenId);
    }
}