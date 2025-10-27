// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleCounter
 * @notice 支援元交易的簡單計數器合約
 * @dev 示範如何在合約中支援 ERC-2771 元交易
 */
contract SimpleCounter {
    // 計數器值
    uint256 public counter;

    // 可信任的轉發器
    address public trustedForwarder;

    // 每個地址的計數記錄
    mapping(address => uint256) public userCounts;

    // 事件
    event CounterIncremented(address indexed user, uint256 newValue);
    event CounterDecremented(address indexed user, uint256 newValue);
    event CounterReset(address indexed user);

    /**
     * @notice 建構子
     * @param _trustedForwarder 可信任的轉發器地址
     */
    constructor(address _trustedForwarder) {
        trustedForwarder = _trustedForwarder;
    }

    /**
     * @notice 獲取真實的發送者
     * @dev 如果是透過轉發器調用，從 calldata 末尾提取原始發送者
     * @return sender 真實的發送者地址
     */
    function _msgSender() internal view returns (address sender) {
        if (msg.sender == trustedForwarder && msg.data.length >= 20) {
            // 從 calldata 末尾提取 20 字節的地址
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            sender = msg.sender;
        }
    }

    /**
     * @notice 獲取原始 msg.data
     * @dev 如果是透過轉發器調用，移除末尾附加的地址
     * @return data 原始的 msg.data
     */
    function _msgData() internal view returns (bytes calldata) {
        if (msg.sender == trustedForwarder && msg.data.length >= 20) {
            return msg.data[:msg.data.length - 20];
        } else {
            return msg.data;
        }
    }

    /**
     * @notice 增加計數器
     * @param amount 增加的數量
     */
    function increment(uint256 amount) external {
        address sender = _msgSender();
        counter += amount;
        userCounts[sender] += amount;
        emit CounterIncremented(sender, counter);
    }

    /**
     * @notice 減少計數器
     * @param amount 減少的數量
     */
    function decrement(uint256 amount) external {
        address sender = _msgSender();
        require(counter >= amount, "Counter: underflow");
        counter -= amount;
        
        require(userCounts[sender] >= amount, "Counter: user underflow");
        userCounts[sender] -= amount;
        
        emit CounterDecremented(sender, counter);
    }

    /**
     * @notice 重置計數器（僅限個人計數）
     */
    function reset() external {
        address sender = _msgSender();
        uint256 userCount = userCounts[sender];
        
        require(counter >= userCount, "Counter: invalid state");
        counter -= userCount;
        userCounts[sender] = 0;
        
        emit CounterReset(sender);
    }

    /**
     * @notice 獲取使用者的計數
     * @param user 使用者地址
     * @return 使用者的計數
     */
    function getUserCount(address user) external view returns (uint256) {
        return userCounts[user];
    }

    /**
     * @notice 檢查是否為可信任的轉發器
     * @param forwarder 要檢查的地址
     * @return 是否為可信任的轉發器
     */
    function isTrustedForwarder(address forwarder) external view returns (bool) {
        return forwarder == trustedForwarder;
    }
}

