# 模組一：UMA 系統架構與合約入口 (Finder.sol & Store.sol)

## 課程目標

在本模組中，你將：
1. 理解 UMA 的整體合約架構與依賴關係
2. 深入分析 `Finder.sol` 作為服務發現入口的設計模式
3. 掌握 `Store.sol` 作為通用金庫的實現細節
4. 理解 UMA 的治理權限與角色管理機制

## 前置知識

在開始本模組前，請確保你已經：
- 完成模組零，理解 UMA 的基本概念和設計哲學
- 熟悉 Solidity 的繼承、介面和修飾符
- 了解 OpenZeppelin 的 `Ownable` 和 `IERC20` 標準

---

## 目錄

1. [UMA 核心合約架構概覽](#1-uma-核心合約架構概覽)
2. [Finder.sol：服務發現的入口](#2-findersol服務發現的入口)
3. [Store.sol：UMA 的通用金庫](#3-storesol-uma-的通用金庫)
4. [角色與權限管理](#4-角色與權限管理)
5. [實戰練習](#5-實戰練習)

---

## 1. UMA 核心合約架構概覽

### 1.1 核心合約與依賴關係

UMA 的合約系統採用**模組化設計**，核心合約之間通過 `Finder` 進行動態查找，而非硬編碼地址。這種設計使系統具備良好的可升級性。

```
                    ┌─────────────────┐
                    │   Governance    │
                    │   (Governor)    │
                    └────────┬────────┘
                             │ 控制
                    ┌────────▼────────┐
                    │     Finder      │ ◄─── 服務發現中心
                    └────────┬────────┘
                             │ 註冊
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────────┐ ┌──▼──────┐ ┌────▼──────────┐
     │ OptimisticOracleV3│ │ Store  │ │   VotingV2   │
     │   (樂觀層)        │ │(金庫)  │ │  (DVM 投票)  │
     └────────┬────────┘ └──┬──────┘ └────┬──────────┘
              │              │              │
              │     ┌────────▼────────┐     │
              └────►│  資金流與數據流  │◄────┘
                    └─────────────────┘
```

### 1.2 核心合約文件位置

在 UMA protocol 代碼庫中，核心合約位於：

```
protocol/packages/core/contracts/
├── data-verification-mechanism/
│   ├── implementation/
│   │   ├── Finder.sol          ← 本模組重點
│   │   ├── Store.sol           ← 本模組重點
│   │   ├── VotingV2.sol        ← 模組三詳解
│   │   └── ...
│   └── interfaces/
│       ├── FinderInterface.sol
│       └── StoreInterface.sol
├── optimistic-oracle-v3/
│   ├── implementation/
│   │   └── OptimisticOracleV3.sol  ← 模組二詳解
│   └── interfaces/
└── common/
    └── implementation/
        ├── MultiRole.sol       ← 權限管理
        └── Withdrawable.sol    ← 資金提取
```

### 1.3 數據流與調用鏈

當一個應用要使用 UMA 時，典型的調用流程是：

```solidity
// 步驟 1：獲取 Finder 地址（通常在部署時設定）
FinderInterface finder = FinderInterface(FINDER_ADDRESS);

// 步驟 2：通過 Finder 查找 OptimisticOracleV3
address ooV3Address = finder.getImplementationAddress("OptimisticOracleV3");
OptimisticOracleV3Interface oo = OptimisticOracleV3Interface(ooV3Address);

// 步驟 3：提出斷言
bytes32 assertionId = oo.assertTruthWithDefaults(claim, asserter);

// 步驟 4：OptimisticOracleV3 內部會通過 Finder 查找 Store 來處理保證金
// 步驟 5：如果發生爭議，會通過 Finder 查找 VotingV2 來升級仲裁
```

**關鍵洞察**：
- **應用只需要知道 Finder 的地址**
- 所有其他合約地址都是動態查找的
- 這使得 UMA 可以升級合約而不影響現有應用

---

## 2. Finder.sol：服務發現的入口

### 2.1 合約概述

`Finder.sol` 是 UMA 系統的**註冊表（Registry）**，類似於 DNS：
- 將**介面名稱**（如 `"OptimisticOracleV3"`）映射到**實現合約地址**
- 由治理控制，只有 Owner（通常是 UMA Governor）可以修改映射

### 2.2 完整合約代碼解析

讓我們逐行分析 `Finder.sol` 的實現：

```solidity
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/FinderInterface.sol";

/**
 * @title Provides addresses of the live contracts implementing certain interfaces.
 * @dev Examples of interfaces with implementations that Finder locates are the Oracle and Store interfaces.
 */
contract Finder is FinderInterface, Ownable {
    // 核心數據結構：介面名稱 → 實現地址
    mapping(bytes32 => address) public interfacesImplemented;

    // 事件：記錄介面實現變更
    event InterfaceImplementationChanged(bytes32 indexed interfaceName, address indexed newImplementationAddress);

    /**
     * @notice Updates the address of the contract that implements `interfaceName`.
     * @param interfaceName bytes32 of the interface name that is either changed or registered.
     * @param implementationAddress address of the implementation contract.
     */
    function changeImplementationAddress(bytes32 interfaceName, address implementationAddress)
        external
        override
        onlyOwner  // 只有 Owner（治理）可以修改
    {
        interfacesImplemented[interfaceName] = implementationAddress;

        emit InterfaceImplementationChanged(interfaceName, implementationAddress);
    }

    /**
     * @notice Gets the address of the contract that implements the given `interfaceName`.
     * @param interfaceName queried interface.
     * @return implementationAddress address of the defined interface.
     */
    function getImplementationAddress(bytes32 interfaceName) external view override returns (address) {
        address implementationAddress = interfacesImplemented[interfaceName];
        require(implementationAddress != address(0x0), "Implementation not found");
        return implementationAddress;
    }
}
```

### 2.3 設計模式深度分析

#### 2.3.1 為什麼使用 `bytes32` 而非 `string`？

```solidity
mapping(bytes32 => address) public interfacesImplemented;
```

**原因**：
1. **Gas 優化**：`bytes32` 是固定長度（32 bytes），而 `string` 是動態長度
2. **統一性**：所有介面名稱都是標準化的，如 `"OptimisticOracleV3"` 轉換為 `bytes32`

**如何轉換**：
```solidity
bytes32 interfaceName = bytes32("OptimisticOracleV3");
// 或者在 JavaScript/TypeScript 中：
const interfaceName = ethers.utils.formatBytes32String("OptimisticOracleV3");
```

#### 2.3.2 服務定位器模式（Service Locator Pattern）

`Finder` 實現了經典的服務定位器模式：

**優點**：
1. **解耦**：合約不需要硬編碼依賴地址
2. **可升級性**：可以透過修改 Finder 映射來升級合約
3. **靈活性**：同一介面可以有多個實現（在不同網絡上）

**缺點**：
1. **單點故障**：如果 Finder 地址錯誤，整個系統失效
2. **需要信任治理**：Owner 可以修改任何介面的實現

#### 2.3.3 常見的介面名稱

在 UMA 系統中，以下是常見的介面名稱：

```solidity
// 核心合約
bytes32 constant OO_V3 = "OptimisticOracleV3";
bytes32 constant STORE = "Store";
bytes32 constant ORACLE = "Oracle";  // 指向 VotingV2

// 治理相關
bytes32 constant GOVERNOR = "Governor";
bytes32 constant PROPOSER = "Proposer";

// 輔助合約
bytes32 constant IDENTIFIER_WHITELIST = "IdentifierWhitelist";
bytes32 constant ADDRESS_WHITELIST = "AddressWhitelist";
```

### 2.4 Finder 的使用範例

#### 範例 1：在應用合約中查找 OptimisticOracleV3

```solidity
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";
import "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";

contract MyInsuranceContract {
    FinderInterface public immutable finder;
    
    constructor(address _finderAddress) {
        finder = FinderInterface(_finderAddress);
    }
    
    function makeAssertion(bytes memory claim) external returns (bytes32) {
        // 動態查找 OptimisticOracleV3 地址
        OptimisticOracleV3Interface oo = OptimisticOracleV3Interface(
            finder.getImplementationAddress("OptimisticOracleV3")
        );
        
        // 提出斷言
        return oo.assertTruthWithDefaults(claim, msg.sender);
    }
}
```

**關鍵點**：
- 合約只需要儲存 `finder` 地址
- 每次調用時動態查找 `OptimisticOracleV3`
- 如果 UMA 升級 OOv3，你的合約無需重新部署

#### 範例 2：治理修改介面實現

```solidity
// 這是 UMA 治理的操作，開發者不需要執行

// 假設 UMA 部署了新版本的 OptimisticOracleV3
address newOOv3 = 0x1234...;

// 通過治理提案，修改 Finder 中的映射
finder.changeImplementationAddress("OptimisticOracleV3", newOOv3);
```

### 2.5 安全考量

#### 2.5.1 Finder 地址的不可變性

在應用合約中，**Finder 地址應該是 `immutable`**：

```solidity
FinderInterface public immutable finder;  // ✅ 推薦

FinderInterface public finder;  // ❌ 可變，存在安全風險
```

**原因**：如果 `finder` 是可變的，惡意管理員可以將其指向假的 Finder，竊取資金。

#### 2.5.2 查找失敗的處理

```solidity
address implementation = finder.getImplementationAddress("OptimisticOracleV3");
// 如果介面名稱不存在，會 revert，確保不會使用 address(0)
```

---

## 3. Store.sol：UMA 的通用金庫

### 3.1 合約概述

`Store.sol` 是 UMA 系統的**中央金庫**，負責：
1. **收集 Oracle 費用**：支持 ETH 和任意 ERC20 代幣
2. **計算 final fee**：爭議解決時需要支付的固定費用
3. **儲存資金**：統一管理系統資金，支持提取

### 3.2 核心數據結構

```solidity
contract Store is StoreInterface, Withdrawable, Testable {
    using SafeMath for uint256;
    using FixedPoint for FixedPoint.Unsigned;
    using SafeERC20 for IERC20;

    /****************************************
     *    INTERNAL VARIABLES AND STORAGE    *
     ****************************************/

    enum Roles { Owner, Withdrawer }

    // 固定的 Oracle 費用率（每秒每 PFC）
    FixedPoint.Unsigned public fixedOracleFeePerSecondPerPfc;
    
    // 延遲支付的懲罰費用率
    FixedPoint.Unsigned public weeklyDelayFeePerSecondPerPfc;

    // 每種貨幣的 final fee
    mapping(address => FixedPoint.Unsigned) public finalFees;
    
    uint256 public constant SECONDS_PER_WEEK = 604800;
}
```

### 3.3 關鍵概念：PFC (Profit From Corruption)

**PFC** 是 UMA 經濟模型的核心概念：
- **定義**：如果 Oracle 被操縱，攻擊者能獲得的最大利潤
- **用途**：用來計算應該收取多少 Oracle 費用

**範例**：
- 假設一個合成資產合約中鎖定了 $1M 的抵押品
- 如果價格數據被操縱，攻擊者最多能竊取 $1M
- 因此，PFC = $1M
- Oracle 費用 = PFC × 時間 × 費用率

### 3.4 費用計算邏輯

#### 3.4.1 Regular Fee（常規費用）

```solidity
function computeRegularFee(
    uint256 startTime,
    uint256 endTime,
    FixedPoint.Unsigned calldata pfc
) external view override returns (
    FixedPoint.Unsigned memory regularFee, 
    FixedPoint.Unsigned memory latePenalty
) {
    uint256 timeDiff = endTime.sub(startTime);

    // 常規費用 = PFC × 時間差 × 費用率
    regularFee = pfc.mul(timeDiff).mul(fixedOracleFeePerSecondPerPfc);

    // 計算延遲支付的時間
    uint256 paymentDelay = getCurrentTime().sub(startTime);

    // 延遲懲罰 = 每延遲一週，增加 weeklyDelayFeePerSecondPerPfc 的懲罰
    // 例如：如果延遲 2 週，懲罰率 = 2 × weeklyDelayFeePerSecondPerPfc
    FixedPoint.Unsigned memory penaltyPercentagePerSecond =
        weeklyDelayFeePerSecondPerPfc.mul(paymentDelay.div(SECONDS_PER_WEEK));

    // 應用懲罰
    latePenalty = pfc.mul(timeDiff).mul(penaltyPercentagePerSecond);
}
```

**費用計算範例**：

假設：
- PFC = 1,000,000 USDC
- `fixedOracleFeePerSecondPerPfc` = 0.0001%（0.000001）
- `weeklyDelayFeePerSecondPerPfc` = 0.0005%（0.000005）
- 持續時間 = 30 天 = 2,592,000 秒
- 延遲支付 = 14 天（2 週）

計算：
```
regularFee = 1,000,000 × 2,592,000 × 0.000001
           = 2,592 USDC

延遲週數 = 14 天 / 7 = 2 週
penaltyRate = 0.000005 × 2 = 0.00001
latePenalty = 1,000,000 × 2,592,000 × 0.00001
            = 25,920 USDC

總費用 = 2,592 + 25,920 = 28,512 USDC
```

#### 3.4.2 Final Fee（最終費用）

```solidity
mapping(address => FixedPoint.Unsigned) public finalFees;

function computeFinalFee(address currency) external view override returns (FixedPoint.Unsigned memory) {
    return finalFees[currency];
}
```

**Final Fee 的用途**：
- 當發生爭議時，爭議雙方都需要支付 final fee
- Final fee 用於補償 UMA 代幣持有者（投票者）的 gas 成本
- 每種貨幣的 final fee 由治理設定

**典型值**（以 mainnet 為例）：
```
WETH: 0.1 ETH
USDC: 150 USDC
DAI: 150 DAI
```

### 3.5 支付費用的方法

#### 3.5.1 支付 ETH

```solidity
function payOracleFees() external payable override {
    require(msg.value > 0, "Value sent can't be zero");
    // ETH 直接儲存在合約中
}
```

**使用範例**：
```solidity
store.payOracleFees{value: 0.1 ether}();
```

#### 3.5.2 支付 ERC20

```solidity
function payOracleFeesErc20(address erc20Address, FixedPoint.Unsigned calldata amount) external override {
    IERC20 erc20 = IERC20(erc20Address);
    require(amount.isGreaterThan(0), "Amount sent can't be zero");
    erc20.safeTransferFrom(msg.sender, address(this), amount.rawValue);
}
```

**使用範例**：
```solidity
IERC20(USDC).approve(address(store), 150e6);  // 先授權
store.payOracleFeesErc20(USDC, FixedPoint.Unsigned(150e6));
```

### 3.6 資金管理與提取

`Store` 繼承自 `Withdrawable`，支持多角色權限控制：

```solidity
contract Store is StoreInterface, Withdrawable, Testable {
    enum Roles { Owner, Withdrawer }

    constructor(
        FixedPoint.Unsigned memory _fixedOracleFeePerSecondPerPfc,
        FixedPoint.Unsigned memory _weeklyDelayFeePerSecondPerPfc,
        address _timerAddress
    ) Testable(_timerAddress) {
        // 創建 Owner 角色
        _createExclusiveRole(uint256(Roles.Owner), uint256(Roles.Owner), msg.sender);
        
        // 創建 Withdrawer 角色
        _createWithdrawRole(uint256(Roles.Withdrawer), uint256(Roles.Owner), msg.sender);
        
        // ...
    }
}
```

**角色權限**：
- **Owner**：可以修改費用率、設定 final fee、管理角色
- **Withdrawer**：可以提取 Store 中的資金

### 3.7 Store 在 OptimisticOracleV3 中的使用

當你在 OOv3 中提出斷言時，保證金的處理流程：

```solidity
// 在 OptimisticOracleV3.sol 中
function assertTruth(...) external returns (bytes32) {
    // 1. 計算最小保證金
    uint256 minimumBond = getMinimumBond(address(currency));
    
    // 2. 從 asserter 轉移保證金到 OOv3 合約
    currency.safeTransferFrom(msg.sender, address(this), bond);
    
    // 3. 如果發生爭議，會將部分保證金轉移到 Store
    if (disputed) {
        uint256 burnedBond = (bond * burnedBondPercentage) / 1e18;
        currency.safeTransfer(address(store), burnedBond);
    }
}
```

---

## 4. 角色與權限管理

### 4.1 UMA 的治理架構

UMA 使用多層權限控制：

```
┌──────────────────────────────────────────────┐
│          UMA Token Holders (投票)            │
│              ↓ 控制                          │
│          Governor Contract                    │
│              ↓ 擁有                          │
│   ┌──────────┴───────────┬─────────────┐    │
│   │                      │             │    │
│ Finder              Store          VotingV2  │
│   │                      │             │    │
│   └──────────────────────┴─────────────┘    │
└──────────────────────────────────────────────┘
```

### 4.2 Ownable 模式

`Finder` 和 `OptimisticOracleV3` 都使用 OpenZeppelin 的 `Ownable`：

```solidity
contract Finder is FinderInterface, Ownable {
    function changeImplementationAddress(bytes32 interfaceName, address implementationAddress)
        external
        override
        onlyOwner  // 只有 Owner 可以調用
    {
        interfacesImplemented[interfaceName] = implementationAddress;
        emit InterfaceImplementationChanged(interfaceName, implementationAddress);
    }
}
```

**Owner 通常是誰？**
- 在主網上，Owner 是 UMA Governor 合約
- Governor 由 UMA 代幣持有者通過投票控制
- 任何修改都需要經過提案、投票、執行的流程

### 4.3 MultiRole 模式

`Store` 使用更複雜的 `MultiRole` 權限系統：

```solidity
contract Store is StoreInterface, Withdrawable, Testable {
    enum Roles { Owner, Withdrawer }

    function setFinalFee(address currency, FixedPoint.Unsigned memory newFinalFee)
        public
        onlyRoleHolder(uint256(Roles.Owner))  // 只有 Owner 角色可以調用
    {
        finalFees[currency] = newFinalFee;
        emit NewFinalFee(newFinalFee);
    }
}
```

**多角色的優勢**：
- **分離關注點**：Owner 負責治理，Withdrawer 負責資金管理
- **減少風險**：即使 Withdrawer 私鑰洩漏，也無法修改系統參數

### 4.4 安全考量：時間鎖（Timelock）

UMA 的治理操作通常會經過時間鎖：

```
提案 → 投票通過 → 等待 2-7 天 → 執行
```

**目的**：
- 給社群時間審查變更
- 防止惡意治理攻擊
- 允許用戶在不同意變更時退出

---

## 5. 實戰練習

### 練習 1：部署和配置 Finder

**任務**：在測試網上部署一個簡化的 Finder，並註冊一個假的 Store 地址。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleFinder is Ownable {
    mapping(bytes32 => address) public interfacesImplemented;

    event InterfaceImplementationChanged(bytes32 indexed interfaceName, address indexed newImplementationAddress);

    function changeImplementationAddress(bytes32 interfaceName, address implementationAddress)
        external
        onlyOwner
    {
        interfacesImplemented[interfaceName] = implementationAddress;
        emit InterfaceImplementationChanged(interfaceName, implementationAddress);
    }

    function getImplementationAddress(bytes32 interfaceName) external view returns (address) {
        address implementationAddress = interfacesImplemented[interfaceName];
        require(implementationAddress != address(0), "Implementation not found");
        return implementationAddress;
    }
}
```

**部署步驟**：
1. 部署 `SimpleFinder`
2. 調用 `changeImplementationAddress("Store", 0x123...)`
3. 調用 `getImplementationAddress("Store")` 驗證

### 練習 2：使用 Finder 查找合約

**任務**：編寫一個合約，通過 Finder 動態查找 Store 地址。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFinder {
    function getImplementationAddress(bytes32 interfaceName) external view returns (address);
}

contract MyDApp {
    IFinder public immutable finder;

    constructor(address _finder) {
        finder = IFinder(_finder);
    }

    function getStoreAddress() public view returns (address) {
        return finder.getImplementationAddress("Store");
    }
}
```

**測試**：
1. 部署 `MyDApp`，傳入 Finder 地址
2. 調用 `getStoreAddress()`，驗證返回正確的 Store 地址

### 練習 3：計算 Final Fee

**任務**：查詢主網上不同貨幣的 final fee。

```javascript
// 使用 ethers.js
const storeAddress = await finder.getImplementationAddress(ethers.utils.formatBytes32String("Store"));
const store = await ethers.getContractAt("StoreInterface", storeAddress);

const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const finalFee = await store.computeFinalFee(usdcAddress);
console.log("USDC final fee:", ethers.utils.formatUnits(finalFee, 6));
```

### 練習 4：模擬費用計算

**任務**：編寫一個腳本，計算給定 PFC 和時間範圍的 Oracle 費用。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FeeCalculator {
    // 假設費用率
    uint256 public constant FEE_RATE = 1e12; // 0.0001% = 0.000001 = 1e12 / 1e18

    function calculateFee(
        uint256 pfc,
        uint256 startTime,
        uint256 endTime
    ) public pure returns (uint256) {
        uint256 duration = endTime - startTime;
        return (pfc * duration * FEE_RATE) / 1e18;
    }
}
```

**測試範例**：
```javascript
const pfc = ethers.utils.parseEther("1000000"); // 1M tokens
const startTime = Math.floor(Date.now() / 1000);
const endTime = startTime + 30 * 24 * 60 * 60; // 30 days later

const fee = await feeCalculator.calculateFee(pfc, startTime, endTime);
console.log("Estimated fee:", ethers.utils.formatEther(fee));
```

---

## 總結

在本模組中，你已經掌握了：

### 關於 Finder.sol
1. **服務定位器模式**：Finder 作為 UMA 系統的中央註冊表
2. **動態查找機制**：應用通過 Finder 動態查找其他合約地址
3. **可升級性設計**：通過修改 Finder 映射實現系統升級

### 關於 Store.sol
1. **通用金庫功能**：支持 ETH 和任意 ERC20 代幣
2. **費用計算機制**：Regular fee（基於 PFC 和時間）+ Late penalty
3. **Final fee 設計**：補償投票者的固定費用
4. **多角色權限控制**：Owner 和 Withdrawer 的分離

### 關於系統架構
1. **模組化設計**：合約之間通過介面解耦
2. **治理控制**：所有關鍵參數由 UMA 代幣持有者投票決定
3. **安全考量**：時間鎖、多簽、不可變 Finder 地址

---

## 下一步

在 **模組二**，我們將深入探討 **OptimisticOracleV3.sol**，分析：
- `assertTruth()` 的完整實現
- 爭議處理機制
- Escalation Managers 的工作原理
- Callback 機制的設計

準備好迎接更複雜的合約邏輯了嗎？讓我們繼續前進！

---

## 延伸閱讀

- [UMA Finder 合約源碼](../../protocol/packages/core/contracts/data-verification-mechanism/implementation/Finder.sol)
- [UMA Store 合約源碼](../../protocol/packages/core/contracts/data-verification-mechanism/implementation/Store.sol)
- [UMA 治理文檔](https://docs.umaproject.org/protocol-overview/how-does-uma-governance-work)
- [服務定位器模式](https://en.wikipedia.org/wiki/Service_locator_pattern)

