# 單元四：串接 Alchemy API - 獲取富豪榜數據

## 第一課：認識 Alchemy Token API

### 🎯 學習目標

在這一課中，我們將：
- 深入了解 Alchemy Token API 的功能和優勢
- 學習 `getOwnersForContract` API 端點的使用方法
- 理解 API 回傳的數據結構和格式
- 掌握 API 請求的最佳實踐和錯誤處理

### 🌐 Alchemy Token API 簡介

Alchemy 是領先的區塊鏈基礎設施提供商，其 Token API 為開發者提供了強大且可靠的代幣數據查詢服務。相比於直接與區塊鏈節點交互，Alchemy API 具有以下優勢：

#### 🚀 核心優勢

1. **高性能**：經過優化的查詢速度，比直接 RPC 調用快 10x
2. **高可靠性**：99.9% 的正常運行時間保證
3. **豐富功能**：提供多種代幣相關的查詢功能
4. **易於使用**：RESTful API 設計，簡單易懂
5. **免費額度**：每月提供大量免費請求額度

#### 📊 支援的功能

- 🔍 **代幣持有者查詢**：獲取特定代幣的所有持有者
- 💰 **餘額查詢**：查詢地址的代幣餘額
- 📈 **轉帳記錄**：獲取代幣轉帳歷史
- 🏷️ **代幣元數據**：獲取代幣名稱、符號、小數位等資訊
- 📋 **NFT 支援**：支援 ERC721 和 ERC1155 代幣

### 🔍 getOwnersForContract API 詳解

`getOwnersForContract` 是 Alchemy Token API 中最強大的端點之一，它可以一次性獲取指定 ERC20 代幣的所有持有者及其餘額。

#### API 基本資訊

```
端點: https://opt-sepolia.g.alchemy.com/v2/{apiKey}/getOwnersForContract
方法: GET
支援網路: Ethereum, Polygon, Optimism, Arbitrum 等
```

#### 請求參數

```javascript
{
  contractAddress: string,    // 必需：ERC20 代幣合約地址
  withTokenBalances: boolean, // 可選：是否包含餘額資訊 (預設: false)
  block: string,             // 可選：查詢特定區塊高度的數據
  pageKey: string,           // 可選：分頁查詢的鍵值
  pageSize: number           // 可選：每頁返回的項目數量 (最大 1000)
}
```

#### 完整請求範例

```javascript
// 使用 fetch API 的範例
const apiKey = "your-alchemy-api-key";
const contractAddress = "0x1234567890123456789012345678901234567890";

const response = await fetch(
  `https://opt-sepolia.g.alchemy.com/v2/${apiKey}/getOwnersForContract?` +
  new URLSearchParams({
    contractAddress: contractAddress,
    withTokenBalances: "true",
    pageSize: "100"
  })
);

const data = await response.json();
```

#### 使用 axios 的範例

```javascript
import axios from 'axios';

const getTokenHolders = async (contractAddress, apiKey) => {
  try {
    const response = await axios.get(
      `https://opt-sepolia.g.alchemy.com/v2/${apiKey}/getOwnersForContract`,
      {
        params: {
          contractAddress: contractAddress,
          withTokenBalances: true,
          pageSize: 1000
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('API 請求失敗:', error);
    throw error;
  }
};
```

### 📊 API 回傳數據結構

#### 成功回應格式

```json
{
  "owners": [
    "0x742d35Cc6634C0532925a3b8D238C1e8D8F6D9E8",
    "0x8ba1f109551bD432803012645Hac136c22C8C7c",
    "0xaB7C8803962c0f2F5BBBe3FA8bf41cd82d1b2B"
  ],
  "pageKey": "next-page-key-if-exists",
  "totalCount": 150
}
```

#### 包含餘額資訊的回應

```json
{
  "owners": [
    {
      "ownerAddress": "0x742d35Cc6634C0532925a3b8D238C1e8D8F6D9E8",
      "tokenBalances": [
        {
          "contractAddress": "0x1234567890123456789012345678901234567890",
          "tokenBalance": "0xad78ebc5ac6200000", // 50000 tokens in hex
          "error": null
        }
      ]
    },
    {
      "ownerAddress": "0x8ba1f109551bD432803012645Hac136c22C8C7c",
      "tokenBalances": [
        {
          "contractAddress": "0x1234567890123456789012345678901234567890",
          "tokenBalance": "0x6c6b935b8bbd400000", // 30000 tokens in hex
          "error": null
        }
      ]
    }
  ],
  "pageKey": null,
  "totalCount": 2
}
```

#### 數據欄位說明

| 欄位 | 型別 | 說明 |
|------|------|------|
| `owners` | Array | 持有者列表 |
| `ownerAddress` | String | 持有者的錢包地址 |
| `tokenBalances` | Array | 代幣餘額陣列 |
| `contractAddress` | String | 代幣合約地址 |
| `tokenBalance` | String | 代幣餘額（16進制格式） |
| `pageKey` | String/null | 下一頁的鍵值，null 表示最後一頁 |
| `totalCount` | Number | 總持有者數量 |
| `error` | String/null | 錯誤訊息（如果有） |

### 🔧 數據處理和格式化

#### 1. 十六進制轉換

API 回傳的餘額是十六進制格式，需要轉換為可讀的數字：

```typescript
import { formatUnits } from 'viem';

// 將十六進制餘額轉換為可讀格式
function formatTokenBalance(hexBalance: string, decimals: number = 18): string {
  const balance = BigInt(hexBalance);
  const formatted = formatUnits(balance, decimals);
  return formatted;
}

// 範例使用
const hexBalance = "0xad78ebc5ac6200000"; // 50000 tokens
const formattedBalance = formatTokenBalance(hexBalance, 18);
console.log(formattedBalance); // "50000.0"
```

#### 2. 數據排序

將持有者按餘額排序，建立富豪榜：

```typescript
interface TokenHolder {
  address: string;
  balance: string;
  balanceFormatted: string;
  percentage: number;
}

function processTokenHolders(
  apiResponse: any, 
  totalSupply: string,
  decimals: number = 18
): TokenHolder[] {
  const holders = apiResponse.owners.map((owner: any) => {
    const balance = owner.tokenBalances[0].tokenBalance;
    const balanceFormatted = formatTokenBalance(balance, decimals);
    const balanceNum = Number(balanceFormatted);
    const totalSupplyNum = Number(formatUnits(BigInt(totalSupply), decimals));
    const percentage = (balanceNum / totalSupplyNum) * 100;

    return {
      address: owner.ownerAddress,
      balance: balance,
      balanceFormatted: balanceFormatted,
      percentage: percentage
    };
  });

  // 按餘額排序（由高到低）
  return holders.sort((a, b) => 
    Number(b.balanceFormatted) - Number(a.balanceFormatted)
  );
}
```

#### 3. 分頁處理

處理大量持有者數據的分頁：

```typescript
async function getAllTokenHolders(
  contractAddress: string,
  apiKey: string
): Promise<TokenHolder[]> {
  let allHolders: any[] = [];
  let pageKey: string | null = null;
  
  do {
    const params = new URLSearchParams({
      contractAddress: contractAddress,
      withTokenBalances: "true",
      pageSize: "1000"
    });
    
    if (pageKey) {
      params.append('pageKey', pageKey);
    }
    
    const response = await fetch(
      `https://opt-sepolia.g.alchemy.com/v2/${apiKey}/getOwnersForContract?${params}`
    );
    
    const data = await response.json();
    allHolders = allHolders.concat(data.owners);
    pageKey = data.pageKey;
    
    // 避免請求過於頻繁
    if (pageKey) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } while (pageKey);
  
  return allHolders;
}
```

### 🚨 錯誤處理和最佳實踐

#### 1. 常見錯誤類型

```typescript
interface AlchemyError {
  code: number;
  message: string;
}

// 錯誤處理函數
function handleAlchemyError(error: any): string {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return "請求參數錯誤，請檢查代幣地址格式";
      case 401:
        return "API Key 無效或已過期";
      case 403:
        return "API 請求額度已用完";
      case 404:
        return "找不到指定的代幣合約";
      case 429:
        return "請求過於頻繁，請稍後再試";
      case 500:
        return "Alchemy 服務暫時不可用";
      default:
        return data?.message || "未知的 API 錯誤";
    }
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return "網路連接錯誤，請檢查網路設定";
  }
  
  return "發生未預期的錯誤";
}
```

#### 2. 請求重試機制

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }
      
      // 如果是 429 (Too Many Requests)，等待後重試
      if (response.status === 429 && i < maxRetries) {
        const waitTime = Math.pow(2, i) * 1000; // 指數退避
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (i === maxRetries) {
        throw error;
      }
      
      // 等待後重試
      const waitTime = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

#### 3. 快取機制

```typescript
interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

class TokenHoldersCache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: any): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + this.CACHE_DURATION
    };
    
    this.cache.set(key, entry);
  }

  clear(): void {
    this.cache.clear();
  }
}

// 使用快取的 API 調用
const cache = new TokenHoldersCache();

async function getCachedTokenHolders(contractAddress: string): Promise<any> {
  const cacheKey = `holders_${contractAddress}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('返回快取數據');
    return cached;
  }
  
  console.log('從 API 獲取新數據');
  const data = await fetchTokenHolders(contractAddress);
  cache.set(cacheKey, data);
  
  return data;
}
```

### 📈 API 使用監控

#### 1. 請求計數器

```typescript
class ApiUsageTracker {
  private requestCount = 0;
  private dailyLimit = 100000; // 假設每日限制
  private resetTime = new Date();

  constructor() {
    this.resetTime.setHours(24, 0, 0, 0); // 每日午夜重置
  }

  canMakeRequest(): boolean {
    if (Date.now() > this.resetTime.getTime()) {
      this.requestCount = 0;
      this.resetTime.setDate(this.resetTime.getDate() + 1);
    }
    
    return this.requestCount < this.dailyLimit;
  }

  recordRequest(): void {
    this.requestCount++;
  }

  getRemainingRequests(): number {
    return Math.max(0, this.dailyLimit - this.requestCount);
  }
}
```

#### 2. 性能監控

```typescript
class PerformanceTracker {
  private metrics: Array<{
    endpoint: string;
    duration: number;
    timestamp: number;
    success: boolean;
  }> = [];

  async trackRequest<T>(
    endpoint: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    let success = false;
    
    try {
      const result = await requestFn();
      success = true;
      return result;
    } catch (error) {
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.metrics.push({
        endpoint,
        duration,
        timestamp: startTime,
        success
      });
    }
  }

  getAverageResponseTime(endpoint: string): number {
    const endpointMetrics = this.metrics.filter(m => m.endpoint === endpoint);
    if (endpointMetrics.length === 0) return 0;
    
    const totalTime = endpointMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / endpointMetrics.length;
  }

  getSuccessRate(endpoint: string): number {
    const endpointMetrics = this.metrics.filter(m => m.endpoint === endpoint);
    if (endpointMetrics.length === 0) return 0;
    
    const successCount = endpointMetrics.filter(m => m.success).length;
    return (successCount / endpointMetrics.length) * 100;
  }
}
```

### 🔐 安全考量

#### 1. API Key 保護

```typescript
// ❌ 錯誤：在前端直接暴露 API Key
const apiKey = "your-secret-api-key";

// ✅ 正確：通過後端 API 路由保護
// /pages/api/token-holders.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.ALCHEMY_API_KEY; // 從環境變數讀取
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured' });
  }
  
  try {
    const response = await fetch(
      `https://opt-sepolia.g.alchemy.com/v2/${apiKey}/getOwnersForContract?${params}`
    );
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
```

#### 2. 輸入驗證

```typescript
import { isAddress } from 'viem';

function validateContractAddress(address: string): boolean {
  if (!address) {
    throw new Error('代幣地址不能為空');
  }
  
  if (!isAddress(address)) {
    throw new Error('無效的以太坊地址格式');
  }
  
  return true;
}

function validatePageSize(pageSize: number): boolean {
  if (pageSize < 1 || pageSize > 1000) {
    throw new Error('頁面大小必須在 1-1000 之間');
  }
  
  return true;
}
```

### 📊 API 測試工具

建立測試腳本來驗證 API 功能：

```typescript
// scripts/test-alchemy-api.ts
import { config } from 'dotenv';
config();

const API_KEY = process.env.ALCHEMY_API_KEY;
const TEST_CONTRACT = "0x1234567890123456789012345678901234567890"; // 你的測試合約

async function testAlchemyAPI() {
  console.log('🧪 開始測試 Alchemy Token API...');
  
  try {
    // 測試基本查詢
    console.log('\n1. 測試基本持有者查詢...');
    const response1 = await fetch(
      `https://opt-sepolia.g.alchemy.com/v2/${API_KEY}/getOwnersForContract?` +
      `contractAddress=${TEST_CONTRACT}`
    );
    const data1 = await response1.json();
    console.log(`✅ 找到 ${data1.totalCount} 個持有者`);
    
    // 測試包含餘額的查詢
    console.log('\n2. 測試包含餘額的查詢...');
    const response2 = await fetch(
      `https://opt-sepolia.g.alchemy.com/v2/${API_KEY}/getOwnersForContract?` +
      `contractAddress=${TEST_CONTRACT}&withTokenBalances=true&pageSize=10`
    );
    const data2 = await response2.json();
    console.log(`✅ 獲取前 10 名持有者的餘額資訊`);
    console.log('前 3 名持有者:');
    data2.owners.slice(0, 3).forEach((owner: any, index: number) => {
      const balance = owner.tokenBalances[0].tokenBalance;
      console.log(`  ${index + 1}. ${owner.ownerAddress}: ${balance}`);
    });
    
    console.log('\n🎉 API 測試完成！');
    
  } catch (error) {
    console.error('❌ API 測試失敗:', error);
  }
}

testAlchemyAPI();
```

### ✅ 小結

在這一課中，我們深入學習了 Alchemy Token API：

✅ **API 基礎知識**
- 了解 Alchemy Token API 的核心優勢
- 掌握 getOwnersForContract 端點的使用方法
- 理解請求參數和回應格式

✅ **數據處理技巧**
- 十六進制數值轉換
- 數據排序和格式化
- 分頁數據處理

✅ **錯誤處理和最佳實踐**
- 完善的錯誤處理機制
- 請求重試和快取策略
- API 使用監控和性能追蹤

✅ **安全性考量**
- API Key 保護策略
- 輸入驗證和安全檢查
- 測試工具和驗證方法

在下一課中，我們將把這些知識應用到實際的 React Hook 中，建立一個強大且可重用的 `useTokenHolders` Hook！

---

**準備好將 API 整合到我們的應用中了嗎？** 🚀
