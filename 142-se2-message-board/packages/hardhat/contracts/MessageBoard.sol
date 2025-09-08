// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MessageBoard
 * @dev 一個基於 IPFS 的去中心化留言板智能合約
 * @author Your Name
 */
contract MessageBoard {
    // ==================== 資料結構 ====================

    /**
     * @dev 留言結構
     */
    struct Message {
        address sender; // 發送者地址
        uint256 timestamp; // 發送時間戳
        string ipfsCid; // IPFS 內容識別碼
        uint256 messageId; // 留言唯一識別碼
    }

    // ==================== 狀態變數 ====================

    /// @dev 儲存所有留言的陣列
    Message[] public messages;

    /// @dev 追蹤每個地址發送的留言數量
    mapping(address => uint256) public userMessageCount;

    /// @dev 合約擁有者（可選功能）
    address public owner;

    /// @dev 留言板是否暫停（緊急停止功能）
    bool public isPaused;

    // ==================== 事件 ====================

    /**
     * @dev 當新留言發布時觸發
     */
    event MessagePosted(uint256 indexed messageId, address indexed sender, uint256 timestamp, string ipfsCid);

    /**
     * @dev 當留言板狀態改變時觸發
     */
    event BoardStatusChanged(bool isPaused);

    // ==================== 修飾符 ====================

    /// @dev 檢查留言板是否未暫停
    modifier whenNotPaused() {
        require(!isPaused, "MessageBoard: Contract is paused");
        _;
    }

    /// @dev 檢查是否為合約擁有者
    modifier onlyOwner() {
        require(msg.sender == owner, "MessageBoard: Not the owner");
        _;
    }

    /// @dev 檢查 CID 是否有效
    modifier validCid(string calldata _ipfsCid) {
        require(bytes(_ipfsCid).length > 0, "MessageBoard: CID cannot be empty");
        require(bytes(_ipfsCid).length <= 100, "MessageBoard: CID too long");
        _;
    }

    // ==================== 建構函式 ====================

    constructor() {
        owner = msg.sender;
        isPaused = false;
    }

    // ==================== 主要功能 ====================

    /**
     * @dev 發布新留言
     * @param _ipfsCid IPFS 內容識別碼
     */
    function postMessage(string calldata _ipfsCid) external whenNotPaused validCid(_ipfsCid) {
        uint256 messageId = messages.length;

        // 建立新留言
        Message memory newMessage = Message({
            sender: msg.sender,
            timestamp: block.timestamp,
            ipfsCid: _ipfsCid,
            messageId: messageId
        });

        // 儲存留言
        messages.push(newMessage);

        // 更新使用者留言計數
        userMessageCount[msg.sender]++;

        // 發出事件
        emit MessagePosted(messageId, msg.sender, block.timestamp, _ipfsCid);
    }

    /**
     * @dev 獲取所有留言
     * @return 所有留言的陣列
     */
    function getAllMessages() external view returns (Message[] memory) {
        return messages;
    }

    /**
     * @dev 獲取特定留言
     * @param _messageId 留言 ID
     * @return 指定的留言
     */
    function getMessage(uint256 _messageId) external view returns (Message memory) {
        require(_messageId < messages.length, "MessageBoard: Message does not exist");
        return messages[_messageId];
    }

    /**
     * @dev 獲取最新的 N 則留言
     * @param _count 要獲取的留言數量
     * @return 最新的留言陣列
     */
    function getLatestMessages(uint256 _count) external view returns (Message[] memory) {
        uint256 totalMessages = messages.length;

        if (totalMessages == 0) {
            return new Message[](0);
        }

        uint256 returnCount = _count > totalMessages ? totalMessages : _count;
        Message[] memory latestMessages = new Message[](returnCount);

        for (uint256 i = 0; i < returnCount; i++) {
            latestMessages[i] = messages[totalMessages - 1 - i];
        }

        return latestMessages;
    }

    /**
     * @dev 獲取特定使用者的留言
     * @param _user 使用者地址
     * @return 該使用者的所有留言
     */
    // 這個函數很糟糕，應該要用 Mapping 來做
    function getUserMessages(address _user) external view returns (Message[] memory) {
        uint256 userMsgCount = userMessageCount[_user];

        if (userMsgCount == 0) {
            return new Message[](0);
        }

        Message[] memory userMessages = new Message[](userMsgCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < messages.length; i++) {
            if (messages[i].sender == _user) {
                userMessages[currentIndex] = messages[i];
                currentIndex++;
            }
        }

        return userMessages;
    }

    // ==================== 資訊查詢 ====================

    /**
     * @dev 獲取留言總數
     * @return 留言總數
     */
    function getTotalMessages() external view returns (uint256) {
        return messages.length;
    }

    /**
     * @dev 獲取使用者留言數量
     * @param _user 使用者地址
     * @return 該使用者的留言數量
     */
    function getUserMessageCount(address _user) external view returns (uint256) {
        return userMessageCount[_user];
    }

    // ==================== 管理功能 ====================

    /**
     * @dev 暫停或恢復留言板（僅擁有者）
     * @param _paused 是否暫停
     */
    function setPaused(bool _paused) external onlyOwner {
        isPaused = _paused;
        emit BoardStatusChanged(_paused);
    }

    /**
     * @dev 轉移擁有權（僅擁有者）
     * @param _newOwner 新擁有者地址
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "MessageBoard: New owner cannot be zero address");
        owner = _newOwner;
    }
}
