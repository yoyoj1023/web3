// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LottoNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // 儲存每個 NFT 的號碼組合
    mapping(uint256 => uint256[6]) public lottoNumbers;

    constructor() ERC721("LottoNFT", "LTNFT") {}

    // 鑄造 NFT 並儲存號碼組合
    function mintNFT(uint256[6] memory _numbers) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        lottoNumbers[newItemId] = _numbers;

        return newItemId;
    }

    // 取得 NFT 的號碼組合
    function getLottoNumbers(uint256 _tokenId) public view returns (uint256[6] memory) {
        require(_exists(_tokenId), "NFT does not exist");
        return lottoNumbers[_tokenId];
    }
}