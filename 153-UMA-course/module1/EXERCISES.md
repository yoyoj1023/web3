# 模組一：練習指南

本文檔提供模組一的實踐練習，幫助你掌握 Finder.sol 和 Store.sol 的實現細節。

---

## 前置準備

### 環境設置

在開始練習前，請確保你已經安裝：

```bash
# 1. 安裝 Node.js 和 npm (建議 v16+)
node --version
npm --version

# 2. 安裝 Hardhat
npm install --save-dev hardhat

# 3. 初始化 Hardhat 項目
npx hardhat init

# 4. 安裝 OpenZeppelin 合約
npm install @openzeppelin/contracts

# 5. 安裝 UMA SDK (可選，用於與真實合約交互)
npm install @uma/sdk
```

### 測試網設置

建議使用以下測試網之一：
- **Sepolia**：以太坊測試網
- **Mumbai**：Polygon 測試網
- **Goerli**：以太坊測試網（即將棄用）

獲取測試幣：
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Mumbai Faucet](https://faucet.polygon.technology/)

---

## 練習 1：部署和測試 SimpleFinder

### 目標
理解 Finder 的服務定位器模式，並實踐部署和使用。

### 步驟

#### 1.1 編譯合約

```bash
# 將 01-SimpleFinder.sol 複製到 contracts/ 目錄
cp module1/01-SimpleFinder.sol contracts/

# 編譯
npx hardhat compile
```

#### 1.2 編寫部署腳本

創建 `scripts/deploy-finder.js`：

```javascript
const { ethers } = require("hardhat");

async function main() {
    console.log("部署 SimpleFinder...");
    
    const SimpleFinder = await ethers.getContractFactory("SimpleFinder");
    const finder = await SimpleFinder.deploy();
    await finder.deployed();
    
    console.log("SimpleFinder 部署到:", finder.address);
    
    // 驗證 owner
    const owner = await finder.owner();
    console.log("Owner:", owner);
    
    return finder;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

#### 1.3 部署到本地網絡

```bash
# 啟動本地 Hardhat 節點（新終端）
npx hardhat node

# 部署（另一個終端）
npx hardhat run scripts/deploy-finder.js --network localhost
```

#### 1.4 註冊介面

修改部署腳本，添加介面註冊：

```javascript
// 在 main() 函數最後添加
async function main() {
    // ... 前面的部署代碼
    
    // 註冊 Store 介面
    const storeInterface = ethers.utils.formatBytes32String("Store");
    const mockStoreAddress = ethers.Wallet.createRandom().address;
    
    console.log("\n註冊 Store 介面...");
    const tx = await finder.changeImplementationAddress(
        storeInterface, 
        mockStoreAddress
    );
    await tx.wait();
    
    console.log("Store 地址:", mockStoreAddress);
    
    // 驗證
    const retrievedStore = await finder.getImplementationAddress(storeInterface);
    console.log("驗證成功:", retrievedStore === mockStoreAddress);
}
```

### 驗證標準

✅ 合約部署成功  
✅ 能夠註冊新的介面實現  
✅ 能夠查詢已註冊的介面  
✅ 查詢不存在的介面時正確拋出錯誤  

### 挑戰任務

1. **批量註冊**：一次註冊 5 個介面
2. **事件監聽**：監聽 `InterfaceImplementationChanged` 事件
3. **權限測試**：嘗試用非 owner 賬戶修改介面（應該失敗）

---

## 練習 2：構建 FinderConsumer 應用

### 目標
學習如何在應用合約中使用 Finder 進行動態查找。

### 步驟

#### 2.1 部署 FinderConsumer

```javascript
// scripts/deploy-consumer.js
const { ethers } = require("hardhat");

async function main() {
    // 假設你已經部署了 Finder
    const finderAddress = "0x..."; // 替換為實際地址
    
    console.log("部署 FinderConsumer...");
    const FinderConsumer = await ethers.getContractFactory("FinderConsumer");
    const consumer = await FinderConsumer.deploy(finderAddress);
    await consumer.deployed();
    
    console.log("FinderConsumer 部署到:", consumer.address);
    
    // 測試查找 Store
    console.log("\n查找 Store 地址...");
    const tx = await consumer.getStoreAddress();
    const receipt = await tx.wait();
    
    // 解析事件
    const event = receipt.events.find(e => e.event === "ContractLookedUp");
    console.log("合約名稱:", event.args.contractName);
    console.log("合約地址:", event.args.contractAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

#### 2.2 編寫單元測試

創建 `test/FinderConsumer.test.js`：

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FinderConsumer", function () {
    let finder, consumer;
    let owner, addr1;
    
    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        
        // 部署 Finder
        const SimpleFinder = await ethers.getContractFactory("SimpleFinder");
        finder = await SimpleFinder.deploy();
        await finder.deployed();
        
        // 註冊 Store
        const storeInterface = ethers.utils.formatBytes32String("Store");
        await finder.changeImplementationAddress(storeInterface, addr1.address);
        
        // 部署 Consumer
        const FinderConsumer = await ethers.getContractFactory("FinderConsumer");
        consumer = await FinderConsumer.deploy(finder.address);
        await consumer.deployed();
    });
    
    it("應該正確查找 Store 地址", async function () {
        const tx = await consumer.getStoreAddress();
        const receipt = await tx.wait();
        
        const event = receipt.events.find(e => e.event === "ContractLookedUp");
        expect(event.args.contractAddress).to.equal(addr1.address);
    });
    
    it("應該在查找不存在的介面時拋出錯誤", async function () {
        await expect(
            consumer.lookupCustomInterface("NonExistent")
        ).to.be.revertedWith("Implementation not found");
    });
});
```

執行測試：

```bash
npx hardhat test test/FinderConsumer.test.js
```

### 驗證標準

✅ FinderConsumer 成功部署  
✅ 能夠通過 Consumer 查找 Store  
✅ 事件正確觸發  
✅ 單元測試全部通過  

### 挑戰任務

1. **模擬升級**：
   - 註冊 Store V1 地址
   - 通過 Consumer 查找
   - 更改為 Store V2 地址
   - 再次查找，驗證地址已更新

2. **Gas 優化**：
   - 比較每次調用時查找 vs 緩存地址的 gas 消耗
   - 分析何時應該緩存，何時應該動態查找

---

## 練習 3：實現 FeeCalculator

### 目標
理解 UMA 的費用計算機制，包括常規費用和延遲懲罰。

### 步驟

#### 3.1 運行測試腳本

```bash
# 確保本地節點正在運行
npx hardhat node

# 運行費用計算器測試
npx hardhat run module1/05-test-fee-calculator.js --network localhost
```

#### 3.2 實現自定義費率

修改 `FeeCalculator.sol`，添加動態費率功能：

```solidity
// 添加到 FeeCalculator.sol
mapping(address => uint256) public customOracleFeeRates;

function setCustomOracleFeeRate(address user, uint256 rate) external {
    require(rate < PRECISION, "Rate must be < 100%");
    customOracleFeeRates[user] = rate;
}

function computeRegularFeeForUser(
    address user,
    uint256 pfc,
    uint256 startTime,
    uint256 endTime,
    uint256 currentTime
) public view returns (uint256 regularFee, uint256 latePenalty) {
    uint256 userRate = customOracleFeeRates[user];
    if (userRate == 0) {
        userRate = fixedOracleFeePerSecondPerPfc;
    }
    
    uint256 timeDiff = endTime - startTime;
    regularFee = (pfc * timeDiff * userRate) / PRECISION;
    
    // ... 延遲懲罰計算（同原始實現）
}
```

#### 3.3 計算真實場景費用

編寫腳本計算不同場景的費用：

```javascript
// scripts/calculate-fees.js
const { ethers } = require("hardhat");

async function main() {
    const FeeCalculator = await ethers.getContractFactory("FeeCalculator");
    const feeCalculator = await FeeCalculator.deploy();
    await feeCalculator.deployed();
    
    // 場景：Sherlock 保險
    const sherlock = {
        pfc: ethers.utils.parseEther("5000000"), // $5M 保額
        duration: 365 * 24 * 60 * 60, // 1 年
        startTime: Math.floor(Date.now() / 1000),
    };
    sherlock.endTime = sherlock.startTime + sherlock.duration;
    
    const [regularFee, latePenalty] = await feeCalculator.computeRegularFee(
        sherlock.pfc,
        sherlock.startTime,
        sherlock.endTime,
        sherlock.startTime // 無延遲
    );
    
    console.log("Sherlock 保險年費用:");
    console.log("  PFC:", ethers.utils.formatEther(sherlock.pfc), "tokens");
    console.log("  常規費用:", ethers.utils.formatEther(regularFee), "tokens");
    console.log("  費用比例:", (Number(regularFee) / Number(sherlock.pfc) * 100).toFixed(4), "%");
}

main().catch(console.error);
```

### 驗證標準

✅ 能夠計算基本費用  
✅ 延遲懲罰計算正確  
✅ Final fee 設置和查詢正常  
✅ 理解不同參數對費用的影響  

### 挑戰任務

1. **折扣系統**：
   - 為長期用戶提供費率折扣
   - 根據質押的 UMA 代幣數量調整費率

2. **費用預測器**：
   - 構建一個前端工具，輸入 PFC 和持續時間，預測費用
   - 提供「最優支付時間」建議（避免延遲懲罰）

---

## 練習 4：與真實 UMA 合約交互

### 目標
學習如何與部署在測試網的真實 UMA 合約交互。

### 步驟

#### 4.1 查找 Sepolia 測試網上的 Finder

```javascript
// scripts/interact-with-uma.js
const { ethers } = require("hardhat");

async function main() {
    // Sepolia Finder 地址（實際地址請查閱 UMA 文檔）
    const FINDER_ADDRESS = "0x..."; 
    
    const finderABI = [
        "function getImplementationAddress(bytes32 interfaceName) view returns (address)"
    ];
    
    const provider = new ethers.providers.JsonRpcProvider(
        "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
    );
    
    const finder = new ethers.Contract(FINDER_ADDRESS, finderABI, provider);
    
    // 查找 OptimisticOracleV3
    const oov3Interface = ethers.utils.formatBytes32String("OptimisticOracleV3");
    const oov3Address = await finder.getImplementationAddress(oov3Interface);
    
    console.log("OptimisticOracleV3 地址:", oov3Address);
    
    // 查找 Store
    const storeInterface = ethers.utils.formatBytes32String("Store");
    const storeAddress = await finder.getImplementationAddress(storeInterface);
    
    console.log("Store 地址:", storeAddress);
}

main().catch(console.error);
```

#### 4.2 查詢 Final Fee

```javascript
async function queryFinalFees() {
    const STORE_ADDRESS = "0x..."; // 從上一步獲得
    
    const storeABI = [
        "function finalFees(address) view returns (uint256)"
    ];
    
    const store = new ethers.Contract(STORE_ADDRESS, storeABI, provider);
    
    // 查詢 WETH final fee
    const WETH = "0x..."; // Sepolia WETH 地址
    const wethFinalFee = await store.finalFees(WETH);
    
    console.log("WETH Final Fee:", ethers.utils.formatEther(wethFinalFee), "WETH");
}
```

### 驗證標準

✅ 成功連接到測試網 Finder  
✅ 能夠查找 OptimisticOracleV3 地址  
✅ 能夠查詢 final fees  
✅ 理解真實 UMA 部署的結構  

---

## 練習 5：構建完整的 Finder 生態

### 目標
部署一個完整的模擬 UMA 生態，包括 Finder、Store 和應用合約。

### 步驟

#### 5.1 部署生態

創建 `scripts/deploy-ecosystem.js`：

```javascript
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("部署者:", deployer.address);
    
    // 1. 部署 Finder
    console.log("\n1. 部署 Finder...");
    const SimpleFinder = await ethers.getContractFactory("SimpleFinder");
    const finder = await SimpleFinder.deploy();
    await finder.deployed();
    console.log("   Finder:", finder.address);
    
    // 2. 部署 FeeCalculator (模擬 Store)
    console.log("\n2. 部署 Store (FeeCalculator)...");
    const FeeCalculator = await ethers.getContractFactory("FeeCalculator");
    const store = await FeeCalculator.deploy();
    await store.deployed();
    console.log("   Store:", store.address);
    
    // 3. 註冊 Store 到 Finder
    console.log("\n3. 註冊 Store 到 Finder...");
    const storeInterface = ethers.utils.formatBytes32String("Store");
    await finder.changeImplementationAddress(storeInterface, store.address);
    console.log("   ✅ Store 已註冊");
    
    // 4. 部署應用合約
    console.log("\n4. 部署 FinderConsumer...");
    const FinderConsumer = await ethers.getContractFactory("FinderConsumer");
    const consumer = await FinderConsumer.deploy(finder.address);
    await consumer.deployed();
    console.log("   Consumer:", consumer.address);
    
    // 5. 測試生態
    console.log("\n5. 測試生態...");
    const retrievedStore = await consumer.getStoreAddress();
    console.log("   Consumer 查找到的 Store:", retrievedStore);
    console.log("   驗證:", retrievedStore === store.address ? "✅ 成功" : "❌ 失敗");
    
    // 6. 輸出部署摘要
    console.log("\n========================================");
    console.log("部署完成！");
    console.log("========================================");
    console.log("Finder:", finder.address);
    console.log("Store:", store.address);
    console.log("Consumer:", consumer.address);
    console.log("\n保存這些地址以供後續使用！");
}

main().catch(console.error);
```

#### 5.2 創建交互腳本

創建 `scripts/interact-ecosystem.js`：

```javascript
const { ethers } = require("hardhat");

async function main() {
    // 使用上一步部署的地址
    const FINDER_ADDRESS = "0x...";
    const STORE_ADDRESS = "0x...";
    const CONSUMER_ADDRESS = "0x...";
    
    // 連接到合約
    const finder = await ethers.getContractAt("SimpleFinder", FINDER_ADDRESS);
    const store = await ethers.getContractAt("FeeCalculator", STORE_ADDRESS);
    const consumer = await ethers.getContractAt("FinderConsumer", CONSUMER_ADDRESS);
    
    console.log("========================================");
    console.log("UMA 生態交互示例");
    console.log("========================================\n");
    
    // 1. 查詢 final fee
    console.log("1. 查詢 Final Fee");
    const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    await store.setFinalFee(usdcAddress, ethers.utils.parseUnits("150", 6));
    const finalFee = await consumer.queryFinalFee(usdcAddress);
    console.log("   USDC Final Fee:", ethers.utils.formatUnits(finalFee, 6), "USDC\n");
    
    // 2. 計算費用
    console.log("2. 計算 Oracle 費用");
    const pfc = ethers.utils.parseEther("1000000");
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + 30 * 24 * 60 * 60;
    
    const totalFee = await store.computeTotalFee(pfc, startTime, endTime, startTime);
    console.log("   30 天費用:", ethers.utils.formatEther(totalFee), "tokens\n");
    
    // 3. 升級 Store（模擬系統升級）
    console.log("3. 模擬系統升級");
    console.log("   當前 Store:", await finder.getImplementationAddress(
        ethers.utils.formatBytes32String("Store")
    ));
    
    // 部署新 Store
    const NewStore = await ethers.getContractFactory("FeeCalculator");
    const newStore = await NewStore.deploy();
    await newStore.deployed();
    
    // 更新 Finder
    await finder.changeImplementationAddress(
        ethers.utils.formatBytes32String("Store"),
        newStore.address
    );
    
    console.log("   新 Store:", await finder.getImplementationAddress(
        ethers.utils.formatBytes32String("Store")
    ));
    console.log("   ✅ 升級完成！\n");
    
    console.log("========================================");
    console.log("交互完成！");
    console.log("========================================");
}

main().catch(console.error);
```

### 驗證標準

✅ 完整生態部署成功  
✅ 應用合約能夠通過 Finder 查找 Store  
✅ 能夠模擬系統升級  
✅ 所有組件正確交互  

### 挑戰任務

**構建一個簡單的 DApp**：
- 前端：輸入 PFC 和持續時間，顯示估算費用
- 後端：使用 ethers.js 與你部署的合約交互
- 額外功能：顯示歷史費用計算記錄

---

## 總結與評估

完成以上練習後，你應該能夠：

✅ **理解 Finder 的設計模式**：服務定位器的優缺點  
✅ **使用 Finder 構建應用**：動態查找 vs 硬編碼地址  
✅ **計算 UMA 費用**：理解 PFC、常規費用、延遲懲罰  
✅ **與真實合約交互**：連接測試網，查詢數據  
✅ **構建完整生態**：部署和管理多個相互依賴的合約  

---

## 下一步

準備好進入**模組二**了嗎？在下一個模組中，我們將深入 `OptimisticOracleV3.sol`，學習：
- `assertTruth()` 的完整實現
- 爭議處理機制
- Escalation Managers
- Callback 機制

繼續前進，精通 UMA 核心合約！

