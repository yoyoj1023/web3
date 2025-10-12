// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VotingSystem
 * @dev 練習 1：使用 EIP712 簽名的投票系統
 * 
 * 這是起始代碼，包含基本結構和函數簽名
 * 請實現標記為 TODO 的部分
 */
contract VotingSystem {
    
    // ============================================
    // 結構定義
    // ============================================
    
    /// @notice 提案結構
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 deadline;
        uint256 yesVotes;
        uint256 noVotes;
        bool exists;
    }
    
    /// @notice 投票結構（用於 EIP712 簽名）
    struct Vote {
        uint256 proposalId;  // 提案 ID
        bool support;        // true=支持, false=反對
        address voter;       // 投票者地址
        uint256 nonce;       // 防止重放
    }
    
    // ============================================
    // 狀態變量
    // ============================================
    
    /// @notice EIP712 Domain Separator
    bytes32 public immutable DOMAIN_SEPARATOR;
    
    /// @notice Vote 類型哈希
    bytes32 public constant VOTE_TYPEHASH = keccak256(
        "Vote(uint256 proposalId,bool support,address voter,uint256 nonce)"
    );
    
    /// @notice 提案映射
    mapping(uint256 => Proposal) public proposals;
    
    /// @notice 下一個提案 ID
    uint256 public nextProposalId = 1;
    
    /// @notice 記錄是否已投票：proposalId => voter => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    /// @notice 每個地址的 nonce（防止重放攻擊）
    mapping(address => uint256) public nonces;
    
    // ============================================
    // 事件
    // ============================================
    
    event ProposalCreated(
        uint256 indexed proposalId,
        string title,
        uint256 deadline
    );
    
    event VoteSubmitted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support
    );
    
    // ============================================
    // 構造函數
    // ============================================
    
    constructor() {
        // TODO: 計算 Domain Separator
        // 提示：參考 SimpleMessage.sol 的實現
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("VotingSystem")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }
    
    // ============================================
    // 提案管理
    // ============================================
    
    /**
     * @notice 創建新提案
     * @param title 提案標題
     * @param description 提案描述
     * @param durationInDays 投票持續天數
     * @return proposalId 新創建的提案 ID
     */
    function createProposal(
        string memory title,
        string memory description,
        uint256 durationInDays
    ) public returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(durationInDays > 0, "Duration must be positive");
        
        uint256 proposalId = nextProposalId++;
        uint256 deadline = block.timestamp + (durationInDays * 1 days);
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            title: title,
            description: description,
            deadline: deadline,
            yesVotes: 0,
            noVotes: 0,
            exists: true
        });
        
        emit ProposalCreated(proposalId, title, deadline);
        return proposalId;
    }
    
    // ============================================
    // 投票功能（需要實現）
    // ============================================
    
    /**
     * @notice 驗證投票簽名
     * @param vote 投票數據
     * @param signature 簽名
     * @return 簽名是否有效
     * 
     * TODO: 實現簽名驗證邏輯
     * 步驟：
     * 1. 檢查提案是否存在
     * 2. 檢查提案是否過期
     * 3. 檢查是否已投票
     * 4. 檢查 nonce 是否正確
     * 5. 計算 struct hash
     * 6. 計算 digest
     * 7. 恢復簽名者地址
     * 8. 驗證地址是否匹配
     */
    function verifyVote(
        Vote memory vote,
        bytes memory signature
    ) public view returns (bool) {
        // TODO: 實現驗證邏輯
        
        // 檢查提案
        Proposal storage proposal = proposals[vote.proposalId];
        if (!proposal.exists) return false;
        if (block.timestamp > proposal.deadline) return false;
        
        // 檢查是否已投票
        if (hasVoted[vote.proposalId][vote.voter]) return false;
        
        // 檢查 nonce
        if (nonces[vote.voter] != vote.nonce) return false;
        
        // TODO: 計算 struct hash
        bytes32 structHash = keccak256(
            abi.encode(
                VOTE_TYPEHASH,
                vote.proposalId,
                vote.support,
                vote.voter,
                vote.nonce
            )
        );
        
        // TODO: 計算 digest
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                structHash
            )
        );
        
        // TODO: 從簽名恢復地址並驗證
        // 提示：需要分解簽名為 r, s, v
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        address recoveredSigner = ecrecover(digest, v, r, s);
        
        return recoveredSigner != address(0) && recoveredSigner == vote.voter;
    }
    
    /**
     * @notice 提交單個投票
     * @param vote 投票數據
     * @param signature 簽名
     * 
     * TODO: 實現投票提交邏輯
     */
    function submitVote(
        Vote memory vote,
        bytes memory signature
    ) public {
        // TODO: 驗證簽名
        require(verifyVote(vote, signature), "Invalid vote signature");
        
        // TODO: 更新 nonce
        nonces[vote.voter]++;
        
        // TODO: 記錄投票
        _recordVote(vote);
    }
    
    /**
     * @notice 批量提交投票（gas 優化）
     * @param votes 投票數組
     * @param signatures 簽名數組
     * 
     * TODO: 實現批量提交邏輯
     * 提示：使用 try-catch 避免單個失敗影響整體
     */
    function submitVotes(
        Vote[] memory votes,
        bytes[] memory signatures
    ) public {
        require(votes.length == signatures.length, "Length mismatch");
        require(votes.length > 0, "Empty array");
        
        // TODO: 實現批量提交
        for (uint256 i = 0; i < votes.length; i++) {
            try this.submitVote(votes[i], signatures[i]) {
                // 成功，繼續
            } catch {
                // 失敗，跳過這個投票
                // 可以發出事件記錄失敗
            }
        }
    }
    
    /**
     * @notice 記錄投票（內部函數）
     * @param vote 投票數據
     * 
     * TODO: 實現投票記錄邏輯
     */
    function _recordVote(Vote memory vote) internal {
        // TODO: 標記已投票
        hasVoted[vote.proposalId][vote.voter] = true;
        
        // TODO: 更新投票計數
        if (vote.support) {
            proposals[vote.proposalId].yesVotes++;
        } else {
            proposals[vote.proposalId].noVotes++;
        }
        
        // TODO: 發出事件
        emit VoteSubmitted(vote.proposalId, vote.voter, vote.support);
    }
    
    // ============================================
    // 查詢函數
    // ============================================
    
    /**
     * @notice 獲取提案信息
     */
    function getProposal(uint256 proposalId) public view returns (
        string memory title,
        string memory description,
        uint256 deadline,
        uint256 yesVotes,
        uint256 noVotes,
        bool isActive
    ) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.exists, "Proposal does not exist");
        
        return (
            proposal.title,
            proposal.description,
            proposal.deadline,
            proposal.yesVotes,
            proposal.noVotes,
            block.timestamp <= proposal.deadline
        );
    }
    
    /**
     * @notice 檢查地址是否已對某提案投票
     */
    function hasVotedOn(
        uint256 proposalId,
        address voter
    ) public view returns (bool) {
        return hasVoted[proposalId][voter];
    }
    
    /**
     * @notice 獲取投票結果
     */
    function getVoteCount(uint256 proposalId) public view returns (
        uint256 yesVotes,
        uint256 noVotes,
        uint256 totalVotes
    ) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.exists, "Proposal does not exist");
        
        return (
            proposal.yesVotes,
            proposal.noVotes,
            proposal.yesVotes + proposal.noVotes
        );
    }
    
    // ============================================
    // 調試輔助函數
    // ============================================
    
    /**
     * @notice 獲取投票的 digest（用於前端調試）
     */
    function getVoteDigest(Vote memory vote) public view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                VOTE_TYPEHASH,
                vote.proposalId,
                vote.support,
                vote.voter,
                vote.nonce
            )
        );
        
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                structHash
            )
        );
    }
}

