# 模組化帳戶插件教程 (Modular Account Plugin Tutorial)

## 📚 專案概述

這是一個基於 **ERC-6900 標準**的模組化智能合約帳戶插件範例。本專案示範如何創建和使用 Alchemy 的 Modular Account 插件系統，實現一個簡單的計數器功能。

### 🎯 學習目標

通過本教程，你將學會：
- 理解 ERC-6900 模組化帳戶標準
- 了解 Account Abstraction (ERC-4337) 的基本概念
- 學會如何創建自定義插件
- 掌握模組化帳戶的插件安裝和使用流程
- 理解 UserOperation 的工作原理

## 🔧 技術背景

### ERC-6900 標準
ERC-6900 是一個關於模組化智能合約帳戶的標準，允許用戶在智能錢包中安裝和移除功能插件，使帳戶具有可擴展性和自定義功能。

### 帳戶抽象 (Account Abstraction)
基於 ERC-4337 標準，允許用戶通過 UserOperation 而非傳統交易來執行操作，提供更靈活的帳戶管理和用戶體驗。

### 核心組件
- **UpgradeableModularAccount**: 可升級的模組化智能帳戶
- **MultiOwnerPlugin**: 多重所有者驗證插件
- **CounterPlugin**: 我們的自定義計數器插件
- **EntryPoint**: ERC-4337 入口點合約

## 🚀 快速開始

### 1. 環境設置

```bash
# 確保已安裝 Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 進入專案目錄
cd 110-au-modular-account-plugin

# 安裝依賴
forge install

# 構建專案
forge build
```

### 2. 運行測試

```bash
# 運行所有測試
forge test

# 運行特定測試並顯示詳細輸出
forge test --match-test test_Increment -vvv
```

### 3. 項目結構

```
110-au-modular-account-plugin/
├── src/
│   └── CounterPlugin.sol          # 計數器插件實現
├── test/
│   └── CounterPlugin.t.sol        # 測試文件
├── lib/                           # 依賴庫
│   ├── modular-account/           # Alchemy 模組化帳戶
│   ├── account-abstraction/       # ERC-4337 實現
│   └── openzeppelin-contracts/    # OpenZeppelin 合約庫
├── foundry.toml                   # Foundry 配置
└── remappings.txt                 # 導入重映射
```

## 📖 代碼解析

### CounterPlugin.sol 詳解

#### 1. 基本結構

```solidity
contract CounterPlugin is BasePlugin {
    string public constant NAME = "Counter Plugin";
    string public constant VERSION = "1.0.0";
    string public constant AUTHOR = "Alchemy";
    
    // 關聯存儲：每個帳戶地址對應一個計數
    mapping(address => uint256) public count;
```

#### 2. 核心功能

```solidity
function increment() external {
    count[msg.sender]++;
}
```

這是插件的主要功能，允許帳戶增加其計數。注意 `msg.sender` 是調用此函數的模組化帳戶地址。

#### 3. 插件清單 (Plugin Manifest)

```solidity
function pluginManifest() external pure override returns (PluginManifest memory) {
    // 定義依賴、執行函數和驗證規則
}
```

清單定義了：
- **依賴關係**: 需要 MultiOwnerPlugin 進行用戶操作驗證
- **執行函數**: 可以被調用的函數 (increment)
- **驗證規則**: 只有帳戶所有者可以調用 increment
- **安全限制**: 禁止運行時直接調用，僅允許通過 UserOperation

### 測試文件解析

#### 1. 環境設置

```solidity
function setUp() public {
    // 1. 部署 EntryPoint (ERC-4337 入口點)
    entryPoint = IEntryPoint(address(new EntryPoint()));
    
    // 2. 部署 MultiOwnerPlugin
    MultiOwnerPlugin multiOwnerPlugin = new MultiOwnerPlugin();
    
    // 3. 創建帳戶工廠
    MultiOwnerModularAccountFactory factory = new MultiOwnerModularAccountFactory(/*...*/);
    
    // 4. 創建模組化帳戶
    account1 = UpgradeableModularAccount(payable(factory.createAccount(0, owners)));
    
    // 5. 安裝 CounterPlugin
    vm.prank(owner1);
    account1.installPlugin({
        plugin: address(counterPlugin),
        manifestHash: manifestHash,
        pluginInstallData: "0x",
        dependencies: dependencies
    });
}
```

#### 2. 測試執行

```solidity
function test_Increment() public {
    // 1. 創建 UserOperation
    UserOperation memory userOp = UserOperation({
        sender: address(account1),
        nonce: 0,
        callData: abi.encodeCall(CounterPlugin.increment, ()),
        // ... 其他參數
    });
    
    // 2. 簽名 UserOperation
    bytes32 userOpHash = entryPoint.getUserOpHash(userOp);
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(owner1Key, userOpHash.toEthSignedMessageHash());
    userOp.signature = abi.encodePacked(r, s, v);
    
    // 3. 執行 UserOperation
    UserOperation[] memory userOps = new UserOperation[](1);
    userOps[0] = userOp;
    entryPoint.handleOps(userOps, beneficiary);
    
    // 4. 驗證結果
    assertEq(counterPlugin.count(address(account1)), 1);
}
```

## 🎯 實踐步驟

### 步驟 1: 理解工作流程

1. **帳戶創建**: 使用工廠合約創建模組化帳戶
2. **插件安裝**: 將 CounterPlugin 安裝到帳戶
3. **操作執行**: 通過 UserOperation 調用 increment 函數
4. **驗證**: 檢查計數是否正確增加

### 步驟 2: 修改和擴展

嘗試修改 CounterPlugin 添加新功能：

```solidity
// 添加減少計數功能
function decrement() external {
    require(count[msg.sender] > 0, "Count cannot be negative");
    count[msg.sender]--;
}

// 添加重置功能
function reset() external {
    count[msg.sender] = 0;
}

// 添加批量操作
function incrementBy(uint256 amount) external {
    count[msg.sender] += amount;
}
```

### 步驟 3: 測試你的修改

```solidity
function test_NewFunctions() public {
    // 測試新增的功能
    // 記得更新插件清單以包含新函數
}
```

## 🔐 安全考慮

### 1. 關聯存儲 (Associated Storage)
```solidity
mapping(address => uint256) public count;
```
使用從帳戶地址到數據的映射，符合 ERC-7562 的關聯存儲規則。

### 2. 驗證機制
- 只有帳戶所有者可以調用 increment
- 禁止運行時直接調用，僅允許通過 UserOperation

### 3. 插件依賴
- 依賴於 MultiOwnerPlugin 進行用戶操作驗證
- 清楚定義插件間的依賴關係

## 🚀 進階學習

### 1. 創建更複雜的插件

嘗試創建具有以下功能的插件：
- 時間鎖定功能
- 多重簽名驗證
- 條件執行邏輯
- 與其他 DeFi 協議的集成

### 2. 理解 ERC-6900 標準

深入研究：
- 插件生命週期管理
- 插件間的通信機制
- 升級和遷移策略

### 3. 帳戶抽象深入

學習：
- Paymaster 機制
- 批量操作
- 社會化恢復
- 氣費優化

## 📚 相關資源

- [ERC-6900 標準](https://eips.ethereum.org/EIPS/eip-6900)
- [ERC-4337 帳戶抽象](https://eips.ethereum.org/EIPS/eip-4337)
- [Alchemy Modular Account 文檔](https://docs.alchemy.com/reference/modular-account)
- [Foundry 文檔](https://book.getfoundry.sh/)

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改進這個教程範例！

## 📄 許可證

本專案採用 GPL-3.0 許可證。
