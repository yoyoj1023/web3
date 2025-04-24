// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 導入 OpenZeppelin 的 IERC20 介面
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LepusDAO {
    uint256 public immutable DEPLOYMENT_TIMESTAMP; // 部署時間戳
    IERC20 public token; // 代幣合約地址

    // 成員結構
    struct Member {
        address memberAddress; // 成員地址
        uint256 joinTime;      // 加入時間
    }

    // 提案結構
    struct Proposal {
        uint256 id;            // 提案 ID
        string description;    // 提案描述
        address proposer;      // 提案發起人
        uint256 deadline;      // 投票截止時間
        uint256 yesVotes;      // 贊成票數
        uint256 noVotes;       // 反對票數
        bool executed;         // 是否已執行
    }

    // 建構函數，初始化代幣名稱、符號和初始供應量
    constructor(address _token) {
        DEPLOYMENT_TIMESTAMP = block.timestamp; // 紀錄部署時間戳
        token = IERC20(_token);                 // 初始化代幣合約地址，強制轉型為 IERC20 介面
    }

}