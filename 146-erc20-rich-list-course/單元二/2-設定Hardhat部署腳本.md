# 第二課：設定 Hardhat 部署腳本

### 🎯 學習目標

在這一課中，我們將：
- 配置 Hardhat 網路設定
- 編寫自動化部署腳本
- 設定環境變數和安全性
- 實作部署驗證和錯誤處理

### ⚙️ 配置 Hardhat 網路設定

#### 步驟 1：更新 Hardhat 配置檔案

編輯 `packages/hardhat/hardhat.config.ts`：

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "dotenv/config";

// 確保環境變數存在
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const OPTIMISTIC_ETHERSCAN_API_KEY = process.env.OPTIMISTIC_ETHERSCAN_API_KEY;

if (!DEPLOYER_PRIVATE_KEY) {
  throw new Error("Please set DEPLOYER_PRIVATE_KEY in your .env file");
}

if (!ALCHEMY_API_KEY) {
  throw new Error("Please set ALCHEMY_API_KEY in your .env file");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  
  networks: {
    // 本地開發網路
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    // Optimism Sepolia 測試網
    optimismSepolia: {
      url: `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 11155420,
      gasPrice: 1000000000, // 1 gwei
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia-optimistic.etherscan.io",
          apiKey: OPTIMISTIC_ETHERSCAN_API_KEY,
        },
      },
    },
    
    // Optimism 主網 (生產環境)
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 10,
      gasPrice: 1000000000, // 1 gwei
      verify: {
        etherscan: {
          apiUrl: "https://api-optimistic.etherscan.io",
          apiKey: OPTIMISTIC_ETHERSCAN_API_KEY,
        },
      },
    },
  },
  
  // 區塊鏈瀏覽器驗證設定
  etherscan: {
    apiKey: {
      optimismSepolia: OPTIMISTIC_ETHERSCAN_API_KEY || "",
      optimism: OPTIMISTIC_ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "optimismSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io/",
        },
      },
    ],
  },
  
  // 部署設定
  namedAccounts: {
    deployer: {
      default: 0, // 使用第一個帳戶作為部署者
    },
    tokenOwner: {
      default: 0, // 預設情況下，部署者也是代幣擁有者
      // 可以為不同網路設定不同的擁有者
      optimismSepolia: 0,
      optimism: "0x...", // 主網上的實際擁有者地址
    },
  },
  
  // Gas 報告設定
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  
  // 型別鏈設定
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
```

#### 步驟 2：更新環境變數

更新 `packages/hardhat/.env` 檔案：

```env
# 部署者私鑰 (測試用，勿使用真實資金)
DEPLOYER_PRIVATE_KEY=0x1234567890abcdef...

# Alchemy API Key
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Optimistic Etherscan API Key (用於合約驗證)
OPTIMISTIC_ETHERSCAN_API_KEY=your_optimistic_etherscan_api_key

# Gas 報告設定 (可選)
REPORT_GAS=true

# 部署設定
TOKEN_NAME=RichList Demo Token
TOKEN_SYMBOL=RDT
INITIAL_SUPPLY=1000000
```

### 📜 編寫部署腳本

#### 步驟 1：建立部署腳本

建立檔案 `packages/hardhat/deploy/01_deploy_rich_list_token.ts`：

```typescript
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

/**
 * 部署 RichListToken 合約
 * 
 * 這個腳本會：
 * 1. 部署 RichListToken 合約
 * 2. 驗證部署參數
 * 3. 儲存部署資訊
 * 4. 執行初始化設定
 */
const deployRichListToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log, save } = deployments;

  // 獲取命名帳戶
  const { deployer, tokenOwner } = await getNamedAccounts();
  
  log("=".repeat(50));
  log("🚀 開始部署 RichListToken 合約");
  log("=".repeat(50));
  
  // 從環境變數或預設值獲取代幣參數
  const tokenName = process.env.TOKEN_NAME || "RichList Demo Token";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "RDT";
  const initialSupply = process.env.INITIAL_SUPPLY || "1000000"; // 1 million tokens
  
  log(`📊 部署參數:`);
  log(`   網路: ${network.name}`);
  log(`   部署者: ${deployer}`);
  log(`   代幣擁有者: ${tokenOwner}`);
  log(`   代幣名稱: ${tokenName}`);
  log(`   代幣符號: ${tokenSymbol}`);
  log(`   初始供應量: ${initialSupply} tokens`);
  log("");

  // 部署前檢查
  const deployerBalance = await ethers.provider.getBalance(deployer);
  const minimumBalance = ethers.parseEther("0.01"); // 至少需要 0.01 ETH
  
  if (deployerBalance < minimumBalance) {
    throw new Error(`❌ 部署者餘額不足! 需要至少 0.01 ETH，當前: ${ethers.formatEther(deployerBalance)} ETH`);
  }
  
  log(`✅ 部署者餘額檢查通過: ${ethers.formatEther(deployerBalance)} ETH`);

  try {
    // 部署合約
    log("📦 正在部署 RichListToken 合約...");
    
    const deployResult = await deploy("RichListToken", {
      from: deployer,
      args: [tokenName, tokenSymbol, initialSupply, tokenOwner],
      log: true,
      waitConfirmations: network.name === "localhost" ? 1 : 5,
    });

    log(`✅ 合約部署成功!`);
    log(`   合約地址: ${deployResult.address}`);
    log(`   部署交易: ${deployResult.transactionHash}`);
    log(`   Gas 使用量: ${deployResult.receipt?.gasUsed?.toString()}`);
    
    // 獲取部署的合約實例
    const richListToken = await ethers.getContractAt("RichListToken", deployResult.address);
    
    // 驗證部署結果
    log("🔍 驗證部署結果...");
    
    const [name, symbol, decimals, totalSupply, maxSupply] = await richListToken.getTokenInfo();
    const owner = await richListToken.owner();
    const deployerBalance = await richListToken.balanceOf(tokenOwner);
    
    log(`   代幣名稱: ${name}`);
    log(`   代幣符號: ${symbol}`);
    log(`   小數點位數: ${decimals}`);
    log(`   總供應量: ${ethers.formatEther(totalSupply)} tokens`);
    log(`   最大供應量: ${ethers.formatEther(maxSupply)} tokens`);
    log(`   合約擁有者: ${owner}`);
    log(`   擁有者餘額: ${ethers.formatEther(deployerBalance)} tokens`);

    // 儲存額外的部署資訊
    const deploymentInfo = {
      address: deployResult.address,
      abi: deployResult.abi,
      transactionHash: deployResult.transactionHash,
      blockNumber: deployResult.receipt?.blockNumber,
      deployer: deployer,
      tokenOwner: tokenOwner,
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      initialSupply: initialSupply,
      networkName: network.name,
      chainId: network.config.chainId,
      deployedAt: new Date().toISOString(),
    };

    // 儲存到部署資訊檔案
    await save("RichListTokenInfo", deploymentInfo);
    
    log("=".repeat(50));
    log("🎉 RichListToken 部署完成!");
    log("=".repeat(50));

    // 如果不是本地網路，提供區塊鏈瀏覽器連結
    if (network.name !== "localhost") {
      const explorerUrl = getExplorerUrl(network.name, deployResult.address);
      if (explorerUrl) {
        log(`🔗 在區塊鏈瀏覽器中查看: ${explorerUrl}`);
      }
    }

    return true;
    
  } catch (error) {
    log(`❌ 部署失敗: ${error}`);
    throw error;
  }
};

/**
 * 獲取區塊鏈瀏覽器 URL
 */
function getExplorerUrl(networkName: string, address: string): string | null {
  const explorers: { [key: string]: string } = {
    optimismSepolia: "https://sepolia-optimism.etherscan.io/address",
    optimism: "https://optimistic.etherscan.io/address",
  };
  
  const baseUrl = explorers[networkName];
  return baseUrl ? `${baseUrl}/${address}` : null;
}

export default deployRichListToken;

// 設定部署標籤
deployRichListToken.tags = ["RichListToken", "token"];
deployRichListToken.dependencies = []; // 沒有依賴的合約
```

#### 步驟 2：建立測試數據生成腳本

建立檔案 `packages/hardhat/scripts/generate-test-data.ts`：

```typescript
import { ethers } from "hardhat";
import { RichListToken } from "../typechain-types";

/**
 * 生成測試數據腳本
 * 
 * 這個腳本會：
 * 1. 建立多個測試錢包
 * 2. 分發代幣到這些錢包
 * 3. 建立富豪榜測試數據
 */
async function generateTestData() {
  console.log("🎲 開始生成測試數據...");
  
  // 獲取部署的合約
  const richListTokenAddress = (await ethers.deployments.get("RichListToken")).address;
  const richListToken = await ethers.getContractAt("RichListToken", richListTokenAddress) as RichListToken;
  
  const [deployer] = await ethers.getSigners();
  console.log(`📝 使用帳戶: ${deployer.address}`);
  
  // 檢查部署者餘額
  const deployerBalance = await richListToken.balanceOf(deployer.address);
  console.log(`💰 部署者代幣餘額: ${ethers.formatEther(deployerBalance)} tokens`);
  
  // 生成測試地址和金額
  const testAccounts = [
    { address: "0x742d35Cc6634C0532925a3b8D238C1e8D8F6D9E8", amount: "50000" },   // 富豪 #1
    { address: "0x8ba1f109551bD432803012645Hac136c22C8C7c", amount: "30000" },   // 富豪 #2
    { address: "0xaB7C8803962c0f2F5BBBe3FA8bf41cd82d1b2B", amount: "25000" },   // 富豪 #3
    { address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", amount: "20000" },   // 富豪 #4
    { address: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB", amount: "15000" },   // 富豪 #5
    { address: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2", amount: "12000" },   // 富豪 #6
    { address: "0x17F6AD8Ef982297579C203069C1DbfFE4348c372", amount: "10000" },   // 富豪 #7
    { address: "0x5c6B0f7Bf3E7ce046004731B80848309B6bFfb64", amount: "8000" },    // 富豪 #8
    { address: "0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7", amount: "6000" },    // 富豪 #9
    { address: "0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C", amount: "5000" },    // 富豪 #10
  ];
  
  // 添加更多普通持有者
  const regularHolders = Array.from({ length: 20 }, (_, i) => ({
    address: ethers.Wallet.createRandom().address,
    amount: (Math.random() * 1000 + 100).toFixed(0) // 100-1100 tokens
  }));
  
  const allAccounts = [...testAccounts, ...regularHolders];
  
  console.log(`📊 準備分發代幣給 ${allAccounts.length} 個地址`);
  
  // 計算總需要金額
  const totalAmount = allAccounts.reduce((sum, account) => {
    return sum + parseFloat(account.amount);
  }, 0);
  
  console.log(`💸 總分發金額: ${totalAmount} tokens`);
  
  // 檢查是否有足夠餘額
  const deployerBalanceNum = parseFloat(ethers.formatEther(deployerBalance));
  if (deployerBalanceNum < totalAmount) {
    console.log(`❌ 餘額不足! 需要: ${totalAmount}, 擁有: ${deployerBalanceNum}`);
    return;
  }
  
  try {
    // 分批處理，每次最多 10 個地址
    const batchSize = 10;
    for (let i = 0; i < allAccounts.length; i += batchSize) {
      const batch = allAccounts.slice(i, i + batchSize);
      
      const recipients = batch.map(account => account.address);
      const amounts = batch.map(account => ethers.parseEther(account.amount));
      
      console.log(`📦 處理第 ${Math.floor(i / batchSize) + 1} 批 (${batch.length} 個地址)...`);
      
      const tx = await richListToken.batchTransfer(recipients, amounts);
      console.log(`   交易哈希: ${tx.hash}`);
      
      await tx.wait();
      console.log(`   ✅ 批次完成`);
    }
    
    console.log("🎉 測試數據生成完成!");
    
    // 顯示最終統計
    console.log("\n📈 富豪榜預覽 (前 10 名):");
    for (let i = 0; i < Math.min(10, testAccounts.length); i++) {
      const account = testAccounts[i];
      const balance = await richListToken.balanceOf(account.address);
      console.log(`   ${i + 1}. ${account.address}: ${ethers.formatEther(balance)} tokens`);
    }
    
  } catch (error) {
    console.error(`❌ 生成測試數據失敗:`, error);
  }
}

// 執行腳本
generateTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### 步驟 3：建立部署驗證腳本

建立檔案 `packages/hardhat/scripts/verify-deployment.ts`：

```typescript
import { ethers } from "hardhat";
import { RichListToken } from "../typechain-types";

/**
 * 部署驗證腳本
 * 
 * 驗證合約是否正確部署和配置
 */
async function verifyDeployment() {
  console.log("🔍 開始驗證部署...");
  
  try {
    // 獲取部署的合約
    const deployment = await ethers.deployments.get("RichListToken");
    const richListToken = await ethers.getContractAt("RichListToken", deployment.address) as RichListToken;
    
    console.log(`📋 合約地址: ${deployment.address}`);
    
    // 基本資訊驗證
    const [name, symbol, decimals, totalSupply, maxSupply] = await richListToken.getTokenInfo();
    const owner = await richListToken.owner();
    
    console.log("\n📊 合約基本資訊:");
    console.log(`   名稱: ${name}`);
    console.log(`   符號: ${symbol}`);
    console.log(`   小數位數: ${decimals}`);
    console.log(`   總供應量: ${ethers.formatEther(totalSupply)}`);
    console.log(`   最大供應量: ${ethers.formatEther(maxSupply)}`);
    console.log(`   擁有者: ${owner}`);
    
    // 功能測試
    console.log("\n🧪 功能測試:");
    
    // 測試 1: 檢查剩餘可鑄造數量
    const remainingMintable = await richListToken.remainingMintable();
    console.log(`   ✅ 剩餘可鑄造: ${ethers.formatEther(remainingMintable)} tokens`);
    
    // 測試 2: 檢查是否可以鑄造
    const testMintAmount = ethers.parseEther("1000");
    const canMint = await richListToken.canMint(testMintAmount);
    console.log(`   ✅ 可以鑄造 1000 tokens: ${canMint}`);
    
    // 測試 3: 檢查擁有者餘額
    const ownerBalance = await richListToken.balanceOf(owner);
    console.log(`   ✅ 擁有者餘額: ${ethers.formatEther(ownerBalance)} tokens`);
    
    // 網路資訊
    const network = await ethers.provider.getNetwork();
    const blockNumber = await ethers.provider.getBlockNumber();
    
    console.log("\n🌐 網路資訊:");
    console.log(`   網路名稱: ${network.name}`);
    console.log(`   Chain ID: ${network.chainId}`);
    console.log(`   當前區塊: ${blockNumber}`);
    
    console.log("\n✅ 部署驗證完成!");
    
  } catch (error) {
    console.error("❌ 驗證失敗:", error);
    throw error;
  }
}

// 執行腳本
verifyDeployment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 🚀 執行部署

#### 步驟 1：編譯合約

```bash
cd packages/hardhat
yarn compile
```

#### 步驟 2：執行測試

```bash
# 執行所有測試
yarn test

# 只測試 RichListToken
yarn test test/RichListToken.ts
```

#### 步驟 3：部署到測試網

```bash
# 部署到 Optimism Sepolia
yarn deploy --network optimismSepolia

# 或者使用 hardhat 命令
npx hardhat deploy --network optimismSepolia
```

#### 步驟 4：驗證部署

```bash
# 執行部署驗證腳本
npx hardhat run scripts/verify-deployment.ts --network optimismSepolia
```

#### 步驟 5：生成測試數據

```bash
# 生成富豪榜測試數據
npx hardhat run scripts/generate-test-data.ts --network optimismSepolia
```

### 📋 部署檢查清單

部署前請確認：

- [ ] **環境變數設定正確**
  - `DEPLOYER_PRIVATE_KEY` 已設定
  - `ALCHEMY_API_KEY` 已設定
  - `OPTIMISTIC_ETHERSCAN_API_KEY` 已設定

- [ ] **錢包準備就緒**
  - 測試錢包有足夠的 ETH
  - 已連接到正確的網路

- [ ] **代碼品質**
  - 所有測試通過
  - 合約編譯無錯誤
  - 代碼已審查

- [ ] **網路配置**
  - Hardhat 配置正確
  - RPC URL 可以訪問
  - Gas 設定合理

### 🐛 常見問題排除

#### 問題 1: 部署失敗 - Gas 不足

```
Error: insufficient funds for gas * price + value
```

**解決方案:**
1. 檢查錢包 ETH 餘額
2. 降低 gas price 設定
3. 從 faucet 獲取更多測試 ETH

#### 問題 2: 網路連接錯誤

```
Error: network does not exist
```

**解決方案:**
1. 檢查 `hardhat.config.ts` 中的網路配置
2. 確認 Alchemy API Key 正確
3. 測試 RPC 連接

#### 問題 3: 合約驗證失敗

```
Error: contract verification failed
```

**解決方案:**
1. 檢查 Etherscan API Key
2. 確認合約地址正確
3. 等待幾分鐘後重試

### 📊 預期輸出

成功部署後，你應該看到類似的輸出：

```
==================================================
🚀 開始部署 RichListToken 合約
==================================================
📊 部署參數:
   網路: optimismSepolia
   部署者: 0x1234...
   代幣擁有者: 0x1234...
   代幣名稱: RichList Demo Token
   代幣符號: RDT
   初始供應量: 1000000 tokens

✅ 部署者餘額檢查通過: 0.1 ETH
📦 正在部署 RichListToken 合約...
✅ 合約部署成功!
   合約地址: 0xabcd1234...
   部署交易: 0x5678efgh...
   Gas 使用量: 2,345,678

🔍 驗證部署結果...
   代幣名稱: RichList Demo Token
   代幣符號: RDT
   小數點位數: 18
   總供應量: 1000000.0 tokens
   最大供應量: 100000000.0 tokens
   合約擁有者: 0x1234...
   擁有者餘額: 1000000.0 tokens

==================================================
🎉 RichListToken 部署完成!
==================================================
🔗 在區塊鏈瀏覽器中查看: https://sepolia-optimism.etherscan.io/address/0xabcd1234...
```

### ✅ 小結

在這一課中，我們成功：

✅ **配置了完整的 Hardhat 環境**
- 網路設定和 API 整合
- 環境變數和安全配置
- Gas 優化和錯誤處理

✅ **建立了自動化部署流程**
- 智能部署腳本
- 部署前檢查和驗證
- 測試數據生成

✅ **實作了部署最佳實踐**
- 參數化配置
- 錯誤處理和回滾
- 部署後驗證

在下一課中，我們將學習如何執行部署並在區塊鏈瀏覽器上驗證我們的合約！

---

**準備好將你的代幣發佈到測試網了嗎？** 🌐
