// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 導入 OpenZeppelin 的 ERC20 合約
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LepusToken is ERC20 {
    uint256 public constant TWD_TOTAL_SUPPLY = 64458727000000; // 新台幣總供應量
    uint256 public immutable DEPLOYMENT_TIMESTAMP; // 部署時間戳

    // 建構函數，初始化代幣名稱、符號和初始供應量
    constructor() ERC20("LepusToken", "LPT") {
        DEPLOYMENT_TIMESTAMP = block.timestamp; // 紀錄部署時間戳
        _mint(msg.sender, TWD_TOTAL_SUPPLY * 10 ** decimals());
    }
}