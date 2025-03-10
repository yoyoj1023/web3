pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MyNFT - 一個簡單的 NFT 合約範例
/// @notice 此合約繼承自 ERC721 標準，用來建立獨一無二的 NFT
contract MyNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCount;

    constructor() ERC721("MyNFT", "MNFT") {}

    /// @notice 僅限合約擁有者呼叫，用來 mint (鑄造) 一個新的 NFT
    /// @param tokenURI NFT 資料（如圖片、json 資料等）的 URI
    /// @return newTokenId 新 NFT 的 tokenId
    function mint(string memory tokenURI) public onlyOwner returns (uint256) {
        tokenCount += 1;
        uint256 newTokenId = tokenCount;
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        return newTokenId;
    }
}