// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
 
/// @title ERC20 Token Interface
/// @notice 只需使用 balanceOf 函數查詢代幣持有量
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}
 
/// @title TokenWeightedVoting
/// @notice 此合約允許用戶根據其持有的指定 ERC20 代幣數量來投票
contract TokenWeightedVoting {
    // 指定用於計算投票權重的 ERC20 代幣合約
    IERC20 public token;
 
    // 投票提案結構體
    struct Proposal {
        string description; // 提案描述
        uint256 voteCount;  // 此提案獲得的總票數（加權）
    }
 
    // 儲存所有提案的陣列
    Proposal[] public proposals;
 
    // 紀錄每個地址是否已經投票（防止重複投票）
    mapping(address => bool) public voted;
 
    /// @notice 建構子中傳入 ERC20 代幣地址和一組提案描述
    /// @param _token ERC20 代幣合約地址
    /// @param proposalNames 一組提案的描述
    constructor(address _token, string[] memory proposalNames) {
        token = IERC20(_token);
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                description: proposalNames[i],
                voteCount: 0
            }));
        }
    }
 
    /// @notice 進行投票，根據投票者持有代幣數量增加對應提案的票數
    /// @param proposal 索引對應到 proposals 陣列中的某個提案
    function vote(uint proposal) public {
        require(!voted[msg.sender], unicode"已經投票過了");
        require(proposal < proposals.length, unicode"提案索引無效");
 
        // 根據 ERC20 代幣餘額作為權重
        uint256 weight = token.balanceOf(msg.sender);
        require(weight > 0, unicode"沒有投票權重");
 
        proposals[proposal].voteCount += weight;
        voted[msg.sender] = true;
    }
 
    /// @notice 查詢目前獲得最多票數的提案索引
    /// @return winningProposal_ 獲勝提案的索引
    function winningProposal() public view returns (uint winningProposal_) {
        uint256 winningVoteCount = 0;
        for(uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }
 
    /// @notice 查詢獲勝提案的描述
    /// @return winnerName_ 獲勝提案的描述
    function winnerName() public view returns (string memory winnerName_) {
        winnerName_ = proposals[winningProposal()].description;
    }
}
 