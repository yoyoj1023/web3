// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleConditionalTokens is ERC1155, Ownable {
    
    // --- 結構定義 ---
    
    struct Question {
        bool resolved;      // 是否已經開獎
        uint256 winningOutcome; // 贏的結果 (0 或 1)
        string description; // 問題描述 (例如: "Will BTC > 100k?")
    }

    // --- 狀態變數 ---
    
    // questionId => 問題資訊
    mapping(uint256 => Question) public questions;
    
    // 用來追蹤目前發布到第幾個問題
    uint256 public nextQuestionId;

    // 定義結果常數：0 代表 NO, 1 代表 YES
    uint256 constant OUTCOME_NO = 0;
    uint256 constant OUTCOME_YES = 1;

    // --- 建構子 ---
    
    constructor() ERC1155("https://api.example.com/metadata/{id}.json") Ownable(msg.sender) {}

    // --- 核心功能 1: 創建新賭局 ---
    
    function createQuestion(string memory _description) external onlyOwner {
        questions[nextQuestionId] = Question({
            resolved: false,
            winningOutcome: 0, // 預設為 0，開獎前無效
            description: _description
        });
        nextQuestionId++;
    }

    // --- 核心功能 2: 分割 (Split) / 下注 ---
    // 用戶存入 ETH，獲得同等數量的 YES 和 NO 代幣
    // tokenId 的設計邏輯： (questionId * 10) + outcome
    // 例如 Question 0: NO代幣ID=0, YES代幣ID=1
    // 例如 Question 1: NO代幣ID=10, YES代幣ID=11
    
    function splitPosition(uint256 _questionId) external payable {
        require(_questionId < nextQuestionId, "Question does not exist");
        require(!questions[_questionId].resolved, "Question already resolved");
        require(msg.value > 0, "Must send ETH");

        // 計算 Token ID
        uint256 noTokenId = getTokenId(_questionId, OUTCOME_NO);
        uint256 yesTokenId = getTokenId(_questionId, OUTCOME_YES);

        // 鑄造代幣給用戶
        // 這裡展現了 ERC-1155 的強大：一次鑄造兩種不同的代幣
        uint256[] memory ids = new uint256[](2);
        ids[0] = noTokenId;
        ids[1] = yesTokenId;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = msg.value; // 1 ETH 換 1個 NO
        amounts[1] = msg.value; // 1 ETH 換 1個 YES

        _mintBatch(msg.sender, ids, amounts, "");
    }

    // --- 核心功能 3: 決議 (Resolve) / 開獎 ---
    // 由合約擁有者（模擬預言機）設定結果
    
    function resolveQuestion(uint256 _questionId, uint256 _winningOutcome) external onlyOwner {
        require(_questionId < nextQuestionId, "Question does not exist");
        require(!questions[_questionId].resolved, "Already resolved");
        require(_winningOutcome == 0 || _winningOutcome == 1, "Invalid outcome");

        questions[_questionId].resolved = true;
        questions[_questionId].winningOutcome = _winningOutcome;
    }

    // --- 核心功能 4: 贖回 (Redeem) ---
    // 持有贏家代幣的人可以換回 ETH
    
    function redeem(uint256 _questionId) external {
        Question memory q = questions[_questionId];
        require(q.resolved, "Question not resolved yet");

        // 計算贏家 Token ID
        uint256 winningTokenId = getTokenId(_questionId, q.winningOutcome);
        
        // 檢查用戶有多少贏家代幣
        uint256 balance = balanceOf(msg.sender, winningTokenId);
        require(balance > 0, "No winning tokens to redeem");

        // 銷毀代幣 (Burn)
        _burn(msg.sender, winningTokenId, balance);

        // 發送 ETH 給用戶
        // 1 Token = 1 Wei (為了簡化，不做小數點轉換)
        payable(msg.sender).transfer(balance);
    }

    // --- 輔助函式 ---
    
    function getTokenId(uint256 _questionId, uint256 _outcome) public pure returns (uint256) {
        // 簡單的 ID 生成邏輯：問題ID後接一位數的結果
        // 實際專案通常使用位移運算 (Bit shifting)
        return _questionId * 10 + _outcome;
    }
}