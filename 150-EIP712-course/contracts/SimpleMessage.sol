// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleMessage
 * @dev 最簡單的 EIP712 訊息簽名驗證合約
 * 
 * 這個合約演示了 EIP712 的核心概念：
 * 1. Domain Separator（域分隔符）
 * 2. Type Hash（類型哈希）
 * 3. Struct Hash（結構哈希）
 * 4. 簽名驗證
 * 
 * 學習重點：
 * - 如何在 Solidity 中實現 EIP712
 * - Domain Separator 的計算和使用
 * - 使用 ecrecover 恢復簽名者地址
 * - 防止簽名可塑性攻擊
 */
contract SimpleMessage {
    
    // ============================================
    // 常量定義
    // ============================================
    
    /// @notice EIP712 Domain 的類型哈希
    /// @dev 這是固定的，除非你修改 domain 的結構
    bytes32 public constant DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    
    /// @notice Message 結構的類型哈希
    /// @dev 定義了我們要簽名的數據結構
    bytes32 public constant MESSAGE_TYPEHASH = keccak256(
        "Message(string content,address sender)"
    );
    
    /// @notice 合約名稱
    string public constant NAME = "SimpleMessage";
    
    /// @notice 合約版本
    string public constant VERSION = "1";
    
    // ============================================
    // 狀態變量
    // ============================================
    
    /// @notice Domain Separator - 在構造函數中計算，之後不變
    /// @dev 使用 immutable 節省 gas
    bytes32 public immutable DOMAIN_SEPARATOR;
    
    // ============================================
    // 事件
    // ============================================
    
    /// @notice 當簽名驗證成功時觸發
    event MessageVerified(address indexed sender, string content);
    
    // ============================================
    // 構造函數
    // ============================================
    
    /**
     * @dev 構造函數：計算並存儲 Domain Separator
     * 
     * Domain Separator 包含：
     * - 合約名稱
     * - 版本號
     * - 鏈 ID（防止跨鏈重放）
     * - 合約地址（防止跨合約重放）
     */
    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes(NAME)),      // name 是 string，需要先哈希
                keccak256(bytes(VERSION)),   // version 也是 string
                block.chainid,               // 當前鏈的 ID
                address(this)                // 合約自己的地址
            )
        );
    }
    
    // ============================================
    // 主要功能
    // ============================================
    
    /**
     * @notice 驗證訊息簽名
     * @dev 這是核心的驗證函數
     * 
     * 驗證流程：
     * 1. 計算 struct hash
     * 2. 組合成 digest
     * 3. 使用 ecrecover 恢復地址
     * 4. 比對地址
     * 
     * @param content 訊息內容
     * @param sender 聲稱的發送者地址
     * @param v 簽名的 v 值（27 或 28）
     * @param r 簽名的 r 值（32 bytes）
     * @param s 簽名的 s 值（32 bytes）
     * @return 簽名是否有效
     */
    function verifyMessage(
        string memory content,
        address sender,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (bool) {
        // 步驟 1: 計算 struct hash
        // 注意：string 類型需要先哈希再編碼
        bytes32 structHash = keccak256(
            abi.encode(
                MESSAGE_TYPEHASH,
                keccak256(bytes(content)),  // string 必須先哈希
                sender                      // address 直接編碼
            )
        );
        
        // 步驟 2: 計算最終的 digest
        // 格式：keccak256("\x19\x01" || domainSeparator || structHash)
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",           // EIP-191 前綴 + EIP-712 版本
                DOMAIN_SEPARATOR,     // 域分隔符
                structHash            // 結構哈希
            )
        );
        
        // 步驟 3: 使用 ecrecover 恢復簽名者地址
        address recoveredSigner = ecrecover(digest, v, r, s);
        
        // 步驟 4: 驗證
        // ecrecover 失敗會返回 address(0)，所以要檢查
        return recoveredSigner == sender && recoveredSigner != address(0);
    }
    
    /**
     * @notice 使用完整簽名驗證訊息
     * @dev 方便前端調用，不需要分解簽名
     * 
     * @param content 訊息內容
     * @param sender 聲稱的發送者地址
     * @param signature 完整的簽名（65 bytes: r+s+v）
     * @return 簽名是否有效
     */
    function verifyMessageWithSignature(
        string memory content,
        address sender,
        bytes memory signature
    ) public view returns (bool) {
        // 檢查簽名長度
        require(signature.length == 65, "Invalid signature length");
        
        // 分解簽名為 r, s, v
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        // 使用內聯彙編高效分解簽名
        assembly {
            // signature 的內存布局：
            // [0:32]   - length (由 Solidity 自動添加)
            // [32:64]  - r
            // [64:96]  - s
            // [96:97]  - v
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        // EIP-2: 防止簽名可塑性攻擊
        // s 必須在低半部分
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            return false;
        }
        
        // 調用主驗證函數
        return verifyMessage(content, sender, v, r, s);
    }
    
    /**
     * @notice 驗證並記錄訊息（狀態修改版本）
     * @dev 如果驗證成功，發出事件
     * 
     * @param content 訊息內容
     * @param sender 聲稱的發送者地址
     * @param signature 完整的簽名
     */
    function verifyAndLogMessage(
        string memory content,
        address sender,
        bytes memory signature
    ) public returns (bool) {
        bool isValid = verifyMessageWithSignature(content, sender, signature);
        
        if (isValid) {
            emit MessageVerified(sender, content);
        }
        
        return isValid;
    }
    
    // ============================================
    // 輔助函數（調試用）
    // ============================================
    
    /**
     * @notice 獲取訊息的 struct hash
     * @dev 用於調試，幫助理解編碼過程
     * 
     * @param content 訊息內容
     * @param sender 發送者地址
     * @return struct hash
     */
    function getStructHash(
        string memory content,
        address sender
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                MESSAGE_TYPEHASH,
                keccak256(bytes(content)),
                sender
            )
        );
    }
    
    /**
     * @notice 獲取訊息的 digest（最終要簽名的數據）
     * @dev 用於調試，可以與前端計算的 digest 對比
     * 
     * @param content 訊息內容
     * @param sender 發送者地址
     * @return digest（32 bytes）
     */
    function getDigest(
        string memory content,
        address sender
    ) public view returns (bytes32) {
        bytes32 structHash = getStructHash(content, sender);
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                structHash
            )
        );
    }
    
    /**
     * @notice 獲取當前的鏈 ID
     * @dev 用於調試
     */
    function getChainId() public view returns (uint256) {
        return block.chainid;
    }
}

