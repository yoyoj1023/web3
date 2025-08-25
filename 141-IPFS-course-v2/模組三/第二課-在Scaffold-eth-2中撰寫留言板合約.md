# 第二課：【實作】在 Scaffold-eth-2 中撰寫留言板合約

## 🎯 學習目標

完成本課後，您將能夠：
- 在 Scaffold-eth-2 專案中建立新的智能合約
- 實作完整的留言板合約功能
- 理解 Solidity 開發的最佳實踐
- 掌握合約的模組化設計方法

## 📋 課程大綱

1. [建立 Scaffold-eth-2 專案](#建立-scaffold-eth-2-專案)
2. [MessageBoard 合約完整實作](#messageboard-合約完整實作)
3. [程式碼解析](#程式碼解析)
4. [安全性考量](#安全性考量)
5. [測試策略](#測試策略)

---

## 建立 Scaffold-eth-2 專案

### 🛠️ **步驟一：建立新專案**

首先，讓我們建立一個新的 Scaffold-eth-2 專案：

```bash
# 使用 Scaffold-eth-2 模板建立專案
npx create-eth@latest my-message-board

# 進入專案目錄
cd my-message-board

# 安裝依賴
yarn install
```

### 🛠️ **步驟二：檢查專案結構**

確認專案結構正確：

```
my-message-board/
├── packages/
│   ├── hardhat/          # 智能合約開發環境
│   │   ├── contracts/    # 合約檔案夾 ←← 我們的重點
│   │   ├── deploy/      # 部署腳本
│   │   └── test/        # 測試檔案
│   └── nextjs/          # 前端應用
└── README.md
```

### 🛠️ **步驟三：清理範例合約**

刪除或重新命名現有的範例合約：

```bash
# 進入合約目錄
cd packages/hardhat/contracts

# 備份原有合約（可選）
mv YourContract.sol YourContract.sol.backup

# 或者直接刪除
rm YourContract.sol
```

---

## MessageBoard 合約完整實作

### 📝 **建立合約檔案**

在 `packages/hardhat/contracts/` 目錄下建立 `MessageBoard.sol`：

```solidity
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
        address sender;        // 發送者地址
        uint256 timestamp;     // 發送時間戳
        string ipfsCid;       // IPFS 內容識別碼
        uint256 messageId;    // 留言唯一識別碼
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
    event MessagePosted(
        uint256 indexed messageId,
        address indexed sender,
        uint256 timestamp,
        string ipfsCid
    );
    
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
    function postMessage(string calldata _ipfsCid) 
        external 
        whenNotPaused 
        validCid(_ipfsCid) 
    {
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
```

---

## 程式碼解析

### 🔍 **核心設計理念**

#### **1. 模組化結構**
- **資料結構**：清晰定義 `Message` struct
- **狀態變數**：分離不同用途的變數
- **功能分組**：主要功能、查詢功能、管理功能分開

#### **2. 安全性設計**
- **修飾符保護**：`whenNotPaused`、`onlyOwner`、`validCid`
- **輸入驗證**：檢查 CID 長度和有效性
- **緊急停止**：合約可暫停功能

#### **3. Gas 優化**
- **Storage Packing**：合理安排 struct 成員順序
- **Memory vs Storage**：適當使用不同儲存類型
- **事件使用**：減少不必要的 storage 讀取

### 🔍 **關鍵功能解析**

#### **`postMessage` 函式**
```solidity
function postMessage(string calldata _ipfsCid) 
    external 
    whenNotPaused 
    validCid(_ipfsCid) 
{
    // 1. 生成唯一 ID
    uint256 messageId = messages.length;
    
    // 2. 在 memory 中建立留言
    Message memory newMessage = Message({
        sender: msg.sender,           // 自動獲取發送者
        timestamp: block.timestamp,   // 自動獲取時間戳
        ipfsCid: _ipfsCid,           // 用戶提供的 CID
        messageId: messageId          // 唯一識別碼
    });
    
    // 3. 一次性寫入 storage
    messages.push(newMessage);
    
    // 4. 更新計數器
    userMessageCount[msg.sender]++;
    
    // 5. 發出事件
    emit MessagePosted(messageId, msg.sender, block.timestamp, _ipfsCid);
}
```

#### **`getAllMessages` vs `getLatestMessages`**
```solidity
// 獲取所有留言（可能很大）
function getAllMessages() external view returns (Message[] memory) {
    return messages;  // 直接返回整個陣列
}

// 獲取最新留言（推薦用於前端）
function getLatestMessages(uint256 _count) external view returns (Message[] memory) {
    // 動態分配記憶體，只返回需要的數量
    // 從最新開始倒序返回
}
```

#### **使用者留言查詢優化**
```solidity
function getUserMessages(address _user) external view returns (Message[] memory) {
    // 1. 預先知道數量，避免動態陣列
    uint256 userMsgCount = userMessageCount[_user];
    
    // 2. 分配正確大小的記憶體
    Message[] memory userMessages = new Message[](userMsgCount);
    
    // 3. 一次遍歷填入結果
    uint256 currentIndex = 0;
    for (uint256 i = 0; i < messages.length; i++) {
        if (messages[i].sender == _user) {
            userMessages[currentIndex] = messages[i];
            currentIndex++;
        }
    }
    
    return userMessages;
}
```

---

## 安全性考量

### 🛡️ **輸入驗證**

```solidity
// CID 驗證
modifier validCid(string calldata _ipfsCid) {
    require(bytes(_ipfsCid).length > 0, "CID cannot be empty");
    require(bytes(_ipfsCid).length <= 100, "CID too long");
    _;
}

// 可選：更嚴格的 CID 格式驗證
function isValidCid(string calldata _cid) internal pure returns (bool) {
    bytes memory cidBytes = bytes(_cid);
    
    // 檢查是否以 'Qm' 開頭（CIDv0）或 'bafy' 開頭（CIDv1）
    if (cidBytes.length >= 2) {
        return (cidBytes[0] == 'Q' && cidBytes[1] == 'm') ||
               (cidBytes.length >= 4 && 
                cidBytes[0] == 'b' && 
                cidBytes[1] == 'a' && 
                cidBytes[2] == 'f' && 
                cidBytes[3] == 'y');
    }
    
    return false;
}
```

### 🛡️ **重入攻擊防護**

雖然此合約不涉及 Ether 轉帳，但好的習慣是遵循 Checks-Effects-Interactions 模式：

```solidity
function postMessage(string calldata _ipfsCid) external {
    // 1. Checks - 檢查所有條件
    require(!isPaused, "Contract is paused");
    require(bytes(_ipfsCid).length > 0, "CID cannot be empty");
    
    // 2. Effects - 更新狀態
    uint256 messageId = messages.length;
    Message memory newMessage = Message({...});
    messages.push(newMessage);
    userMessageCount[msg.sender]++;
    
    // 3. Interactions - 外部呼叫（如果有的話）
    emit MessagePosted(...);
}
```

### 🛡️ **緊急暫停機制**

```solidity
bool public isPaused;

modifier whenNotPaused() {
    require(!isPaused, "Contract is paused");
    _;
}

function setPaused(bool _paused) external onlyOwner {
    isPaused = _paused;
    emit BoardStatusChanged(_paused);
}
```

---

## 測試策略

### 🧪 **基礎測試檔案**

在 `packages/hardhat/test/` 目錄下建立 `MessageBoard.test.js`：

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MessageBoard", function () {
  let messageBoard;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const MessageBoard = await ethers.getContractFactory("MessageBoard");
    messageBoard = await MessageBoard.deploy();
    await messageBoard.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await messageBoard.owner()).to.equal(owner.address);
    });

    it("Should start unpaused", async function () {
      expect(await messageBoard.isPaused()).to.equal(false);
    });
  });

  describe("Posting Messages", function () {
    it("Should post a message successfully", async function () {
      const testCid = "QmTestHash123";
      
      await expect(messageBoard.connect(user1).postMessage(testCid))
        .to.emit(messageBoard, "MessagePosted")
        .withArgs(0, user1.address, anyValue, testCid);
      
      expect(await messageBoard.getTotalMessages()).to.equal(1);
    });

    it("Should reject empty CID", async function () {
      await expect(messageBoard.postMessage(""))
        .to.be.revertedWith("MessageBoard: CID cannot be empty");
    });

    it("Should reject too long CID", async function () {
      const longCid = "Q".repeat(101);
      await expect(messageBoard.postMessage(longCid))
        .to.be.revertedWith("MessageBoard: CID too long");
    });
  });

  describe("Reading Messages", function () {
    beforeEach(async function () {
      await messageBoard.connect(user1).postMessage("QmHash1");
      await messageBoard.connect(user2).postMessage("QmHash2");
    });

    it("Should return all messages", async function () {
      const messages = await messageBoard.getAllMessages();
      expect(messages.length).to.equal(2);
      expect(messages[0].sender).to.equal(user1.address);
      expect(messages[1].sender).to.equal(user2.address);
    });

    it("Should return latest messages", async function () {
      const latest = await messageBoard.getLatestMessages(1);
      expect(latest.length).to.equal(1);
      expect(latest[0].sender).to.equal(user2.address); // 最新的
    });

    it("Should return user messages", async function () {
      const userMessages = await messageBoard.getUserMessages(user1.address);
      expect(userMessages.length).to.equal(1);
      expect(userMessages[0].sender).to.equal(user1.address);
    });
  });

  describe("Admin Functions", function () {
    it("Should pause and unpause", async function () {
      await messageBoard.setPaused(true);
      expect(await messageBoard.isPaused()).to.equal(true);
      
      await expect(messageBoard.connect(user1).postMessage("QmTest"))
        .to.be.revertedWith("MessageBoard: Contract is paused");
    });

    it("Should reject non-owner admin calls", async function () {
      await expect(messageBoard.connect(user1).setPaused(true))
        .to.be.revertedWith("MessageBoard: Not the owner");
    });
  });
});
```

### 🧪 **執行測試**

```bash
# 在專案根目錄執行
cd packages/hardhat

# 執行測試
npx hardhat test

# 查看測試覆蓋率（需要安裝 solidity-coverage）
npx hardhat coverage
```

---

## 💡 部署準備

### 📝 **部署腳本**

在 `packages/hardhat/deploy/` 目錄下修改或建立 `00_deploy_message_board.ts`：

```typescript
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMessageBoard: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("MessageBoard", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  const messageBoard = await hre.ethers.getContract("MessageBoard", deployer);
  console.log("👋 MessageBoard deployed to:", messageBoard.address);
};

export default deployMessageBoard;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags MessageBoard
deployMessageBoard.tags = ["MessageBoard"];
```

---

## 📝 本課總結

### **已完成的功能**

1. ✅ **核心留言功能**：發布和讀取留言
2. ✅ **安全性機制**：輸入驗證、暫停功能、權限控制
3. ✅ **查詢優化**：多種查詢方式，支援分頁
4. ✅ **事件系統**：便於前端監聽
5. ✅ **測試框架**：完整的單元測試

### **關鍵學習點**

1. **模組化設計**：清晰的程式碼結構便於維護
2. **Gas 優化**：合理使用 storage 和 memory
3. **安全性考量**：多層防護機制
4. **使用者體驗**：多樣化的查詢功能

### **下一課預告**

在下一課中，我們將把這個合約部署到本地開發網路，並使用 Scaffold-eth-2 的 Debug Contracts 頁面來測試所有功能！

---

## 🔗 延伸閱讀

- [Hardhat 測試指南](https://hardhat.org/tutorial/testing-contracts.html)
- [Solidity 最佳實踐](https://consensys.github.io/smart-contract-best-practices/)
- [OpenZeppelin 合約安全指南](https://docs.openzeppelin.com/contracts/4.x/api/security)

**下一課：** [第三課：合約部署與鏈上互動測試](第三課-合約部署與鏈上互動測試.md)
