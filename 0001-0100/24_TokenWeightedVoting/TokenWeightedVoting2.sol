pragma solidity ^0.8.0;

// ERC-20 代幣合約接口
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

// 投票合約
contract TokenWeightedVoting2 {
    // 候選人列表
    string[] public candidates;
    // 每個候選人的得票數，鍵是候選人索引
    mapping(uint => uint) public votesReceived;
    // 記錄哪些地址已經投票
    mapping(address => bool) public hasVoted;
    // 代幣合約實例
    IERC20 public token;

    // 投票事件
    event Voted(address indexed voter, uint indexed candidateIndex, uint weight);

    // 建構子，初始化候選人列表和代幣合約地址
    constructor(string[] memory _candidates, address _tokenAddress) {
        require(_tokenAddress != address(0), "Token address cannot be zero.");
        candidates = _candidates;
        token = IERC20(_tokenAddress);
    }

    // 投票函數
    function vote(uint candidateIndex) public {
        // 檢查是否已投票
        require(!hasVoted[msg.sender], "You have already voted.");
        // 檢查候選人索引是否有效
        require(candidateIndex < candidates.length, "Invalid candidate index.");

        // 獲取投票者的代幣餘額作為投票權重
        uint weight = token.balanceOf(msg.sender);
        // 增加候選人的得票數
        votesReceived[candidateIndex] += weight;
        // 標記該地址已投票
        hasVoted[msg.sender] = true;

        // 發出投票事件
        emit Voted(msg.sender, candidateIndex, weight);
    }

    // 獲取所有候選人的得票數
    function getVotes() public view returns (uint[] memory) {
        uint[] memory votes = new uint[](candidates.length);
        for (uint i = 0; i < candidates.length; i++) {
            votes[i] = votesReceived[i];
        }
        return votes;
    }

    // 獲取候選人列表
    function getCandidates() public view returns (string[] memory) {
        return candidates;
    }
}