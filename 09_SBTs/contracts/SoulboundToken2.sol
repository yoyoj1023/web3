// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundToken is ERC721, Ownable {
    bool public locked;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        locked = true;
    }

    // 覆蓋 _beforeTokenTransfer 阻止轉移
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        require(from == address(0) || to == address(0) || locked == false, "SoulboundToken: token is non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function mint(address to, uint256 tokenId) public onlyOwner {
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
    }

    function unlock() public onlyOwner {
        locked = false;
    }

    function lock() public onlyOwner {
        locked = true;
    }
}