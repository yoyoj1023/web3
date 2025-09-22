# 第二課：打造自定義 Hook `useTokenHolders`

### 🎯 學習目標

在這一課中，我們將：
- 建立可重用的 `useTokenHolders` React Hook
- 實作完整的狀態管理（載入、錯誤、成功狀態）
- 整合 Alchemy API 進行數據獲取
- 實作數據處理、排序和快取功能
- 加入錯誤處理和重試機制

### 🏗️ Hook 架構設計

#### 核心功能需求

我們的 `useTokenHolders` Hook 需要提供：

1. **狀態管理**：載入中、錯誤、成功狀態
2. **數據獲取**：調用 Alchemy API 獲取持有者數據
3. **數據處理**：格式化和排序持有者資訊
4. **快取機制**：避免重複請求相同數據
5. **錯誤處理**：友善的錯誤訊息和重試功能

#### Hook 介面設計

```typescript
interface UseTokenHoldersReturn {
  // 數據狀態
  tokenData: TokenData | null;
  holders: TokenHolder[];
  totalHolders: number;
  
  // UI 狀態
  isLoading: boolean;
  error: string | null;
  
  // 操作方法
  fetchTokenHolders: (address: string, options?: FetchOptions) => Promise<void>;
  refetch: () => Promise<void>;
  clearData: () => void;
}
```

### 📁 建立 Hook 檔案結構

首先，讓我們建立必要的檔案結構：

```bash
packages/nextjs/hooks/
├── useTokenHolders.ts          # 主要 Hook
├── types/
│   └── tokenHolders.ts         # 型別定義
└── utils/
    ├── alchemyApi.ts           # API 調用工具
    ├── tokenDataProcessor.ts   # 數據處理工具
    └── cache.ts               # 快取工具
```

### 🔧 型別定義

建立 `hooks/types/tokenHolders.ts`：

```typescript
export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  contractAddress: string;
}

export interface TokenHolder {
  address: string;
  balance: string;
  balanceFormatted: string;
  balanceNumber: number;
  percentage: number;
  rank?: number;
}

export interface RawAlchemyOwner {
  ownerAddress: string;
  tokenBalances: Array<{
    contractAddress: string;
    tokenBalance: string;
    error: string | null;
  }>;
}

export interface AlchemyResponse {
  owners: RawAlchemyOwner[];
  pageKey: string | null;
  totalCount: number;
}

export interface FetchOptions {
  pageSize?: number;
  withCache?: boolean;
  forceRefresh?: boolean;
}

export interface UseTokenHoldersState {
  tokenData: TokenData | null;
  holders: TokenHolder[];
  totalHolders: number;
  isLoading: boolean;
  error: string | null;
  lastFetchedAddress: string | null;
  lastFetchedAt: number | null;
}
```

### 🌐 API 調用工具

建立 `hooks/utils/alchemyApi.ts`：

```typescript
import { AlchemyResponse, TokenData } from '../types/tokenHolders';

export class AlchemyApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AlchemyApiError';
  }
}

export class AlchemyApi {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(network: string = 'opt-sepolia') {
    this.apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '';
    this.baseUrl = `https://${network}.g.alchemy.com/v2/${this.apiKey}`;
    
    if (!this.apiKey) {
      throw new Error('NEXT_PUBLIC_ALCHEMY_API_KEY is not configured');
    }
  }

  /**
   * 獲取代幣持有者列表
   */
  async getTokenHolders(
    contractAddress: string,
    options: {
      pageSize?: number;
      pageKey?: string;
      withTokenBalances?: boolean;
    } = {}
  ): Promise<AlchemyResponse> {
    const {
      pageSize = 1000,
      pageKey,
      withTokenBalances = true
    } = options;

    const params = new URLSearchParams({
      contractAddress: contractAddress.toLowerCase(),
      withTokenBalances: withTokenBalances.toString(),
      pageSize: pageSize.toString(),
    });

    if (pageKey) {
      params.append('pageKey', pageKey);
    }

    const url = `${this.baseUrl}/getOwnersForContract?${params}`;

    try {
      const response = await this.fetchWithRetry(url);
      
      if (!response.ok) {
        throw new AlchemyApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      
      // 驗證回應格式
      if (!data.owners || !Array.isArray(data.owners)) {
        throw new AlchemyApiError('Invalid API response format');
      }

      return data;
    } catch (error) {
      if (error instanceof AlchemyApiError) {
        throw error;
      }
      
      throw new AlchemyApiError(
        'Failed to fetch token holders',
        undefined,
        error
      );
    }
  }

  /**
   * 獲取所有代幣持有者（處理分頁）
   */
  async getAllTokenHolders(contractAddress: string): Promise<AlchemyResponse> {
    let allOwners: any[] = [];
    let pageKey: string | null = null;
    let totalCount = 0;

    do {
      const response = await this.getTokenHolders(contractAddress, {
        pageKey: pageKey || undefined,
        pageSize: 1000,
        withTokenBalances: true
      });

      allOwners = allOwners.concat(response.owners);
      pageKey = response.pageKey;
      totalCount = response.totalCount;

      // 避免請求過於頻繁
      if (pageKey) {
        await this.delay(100);
      }

      // 安全檢查：避免無限循環
      if (allOwners.length > 10000) {
        console.warn('Token holders count exceeds 10,000, stopping pagination');
        break;
      }

    } while (pageKey);

    return {
      owners: allOwners,
      pageKey: null,
      totalCount: allOwners.length
    };
  }

  /**
   * 獲取代幣基本資訊
   */
  async getTokenMetadata(contractAddress: string): Promise<TokenData> {
    const params = new URLSearchParams({
      contractAddress: contractAddress.toLowerCase(),
    });

    const url = `${this.baseUrl}/getTokenMetadata?${params}`;

    try {
      const response = await this.fetchWithRetry(url);
      
      if (!response.ok) {
        throw new AlchemyApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();

      return {
        name: data.name || 'Unknown Token',
        symbol: data.symbol || 'UNKNOWN',
        decimals: data.decimals || 18,
        totalSupply: data.totalSupply || '0',
        contractAddress: contractAddress.toLowerCase()
      };
    } catch (error) {
      if (error instanceof AlchemyApiError) {
        throw error;
      }
      
      throw new AlchemyApiError(
        'Failed to fetch token metadata',
        undefined,
        error
      );
    }
  }

  /**
   * 帶重試機制的 fetch
   */
  private async fetchWithRetry(
    url: string,
    maxRetries: number = 3
  ): Promise<Response> {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });

        // 如果成功或是客戶端錯誤（4xx），直接返回
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }

        // 伺服器錯誤（5xx）或網路錯誤，進行重試
        if (i < maxRetries) {
          const waitTime = Math.pow(2, i) * 1000; // 指數退避
          await this.delay(waitTime);
          continue;
        }

        return response;
      } catch (error) {
        if (i === maxRetries) {
          throw error;
        }
        
        const waitTime = Math.pow(2, i) * 1000;
        await this.delay(waitTime);
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * 延遲工具函數
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 格式化 API 錯誤訊息
   */
  static formatError(error: any): string {
    if (error instanceof AlchemyApiError) {
      switch (error.statusCode) {
        case 400:
          return '請求參數錯誤，請檢查代幣地址格式';
        case 401:
          return 'API Key 無效或已過期';
        case 403:
          return 'API 請求額度已用完';
        case 404:
          return '找不到指定的代幣合約';
        case 429:
          return '請求過於頻繁，請稍後再試';
        case 500:
        case 502:
        case 503:
          return 'Alchemy 服務暫時不可用，請稍後再試';
        default:
          return error.message;
      }
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return '網路連接錯誤，請檢查網路設定';
    }

    return error.message || '發生未預期的錯誤';
  }
}

// 建立預設實例
export const alchemyApi = new AlchemyApi();
```

### 🔄 數據處理工具

建立 `hooks/utils/tokenDataProcessor.ts`：

```typescript
import { formatUnits } from 'viem';
import { TokenHolder, RawAlchemyOwner, TokenData } from '../types/tokenHolders';

export class TokenDataProcessor {
  /**
   * 處理原始 Alchemy 數據，轉換為應用程式格式
   */
  static processTokenHolders(
    rawOwners: RawAlchemyOwner[],
    tokenData: TokenData
  ): TokenHolder[] {
    const { decimals, totalSupply } = tokenData;
    const totalSupplyNumber = Number(formatUnits(BigInt(totalSupply), decimals));

    const holders = rawOwners
      .filter(owner => owner.tokenBalances.length > 0)
      .map(owner => {
        const tokenBalance = owner.tokenBalances[0];
        
        // 跳過有錯誤的記錄
        if (tokenBalance.error) {
          return null;
        }

        const balance = tokenBalance.tokenBalance;
        const balanceFormatted = formatUnits(BigInt(balance), decimals);
        const balanceNumber = Number(balanceFormatted);
        const percentage = totalSupplyNumber > 0 ? (balanceNumber / totalSupplyNumber) * 100 : 0;

        return {
          address: owner.ownerAddress.toLowerCase(),
          balance,
          balanceFormatted,
          balanceNumber,
          percentage
        };
      })
      .filter((holder): holder is TokenHolder => holder !== null);

    // 按餘額排序（由高到低）
    holders.sort((a, b) => b.balanceNumber - a.balanceNumber);

    // 添加排名
    holders.forEach((holder, index) => {
      holder.rank = index + 1;
    });

    return holders;
  }

  /**
   * 過濾掉餘額為零的持有者
   */
  static filterZeroBalances(holders: TokenHolder[]): TokenHolder[] {
    return holders.filter(holder => holder.balanceNumber > 0);
  }

  /**
   * 獲取前 N 名持有者
   */
  static getTopHolders(holders: TokenHolder[], count: number): TokenHolder[] {
    return holders.slice(0, count);
  }

  /**
   * 計算持有者統計資訊
   */
  static calculateStats(holders: TokenHolder[]): {
    totalHolders: number;
    totalBalance: number;
    averageBalance: number;
    medianBalance: number;
    top10Percentage: number;
  } {
    if (holders.length === 0) {
      return {
        totalHolders: 0,
        totalBalance: 0,
        averageBalance: 0,
        medianBalance: 0,
        top10Percentage: 0
      };
    }

    const totalBalance = holders.reduce((sum, holder) => sum + holder.balanceNumber, 0);
    const averageBalance = totalBalance / holders.length;
    
    // 計算中位數
    const sortedBalances = holders.map(h => h.balanceNumber).sort((a, b) => a - b);
    const mid = Math.floor(sortedBalances.length / 2);
    const medianBalance = sortedBalances.length % 2 === 0
      ? (sortedBalances[mid - 1] + sortedBalances[mid]) / 2
      : sortedBalances[mid];

    // 計算前10名持有的百分比
    const top10Count = Math.min(10, holders.length);
    const top10Balance = holders.slice(0, top10Count).reduce((sum, holder) => sum + holder.balanceNumber, 0);
    const top10Percentage = totalBalance > 0 ? (top10Balance / totalBalance) * 100 : 0;

    return {
      totalHolders: holders.length,
      totalBalance,
      averageBalance,
      medianBalance,
      top10Percentage
    };
  }

  /**
   * 搜尋特定地址的持有者
   */
  static findHolderByAddress(holders: TokenHolder[], address: string): TokenHolder | null {
    const normalizedAddress = address.toLowerCase();
    return holders.find(holder => holder.address === normalizedAddress) || null;
  }

  /**
   * 按餘額範圍過濾持有者
   */
  static filterByBalanceRange(
    holders: TokenHolder[],
    minBalance: number,
    maxBalance: number = Infinity
  ): TokenHolder[] {
    return holders.filter(holder => 
      holder.balanceNumber >= minBalance && holder.balanceNumber <= maxBalance
    );
  }

  /**
   * 格式化餘額顯示
   */
  static formatBalance(
    balance: number,
    options: {
      decimals?: number;
      compact?: boolean;
      currency?: string;
    } = {}
  ): string {
    const { decimals = 2, compact = false, currency } = options;

    let formatted: string;

    if (compact && balance >= 1000000) {
      formatted = `${(balance / 1000000).toFixed(decimals)}M`;
    } else if (compact && balance >= 1000) {
      formatted = `${(balance / 1000).toFixed(decimals)}K`;
    } else {
      formatted = balance.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
      });
    }

    return currency ? `${formatted} ${currency}` : formatted;
  }

  /**
   * 格式化百分比顯示
   */
  static formatPercentage(percentage: number, decimals: number = 2): string {
    if (percentage < 0.01 && percentage > 0) {
      return '<0.01%';
    }
    return `${percentage.toFixed(decimals)}%`;
  }
}
```

### 💾 快取工具

建立 `hooks/utils/cache.ts`：

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export class TokenHoldersCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTtl: number;

  constructor(defaultTtlMinutes: number = 5) {
    this.defaultTtl = defaultTtlMinutes * 60 * 1000;
  }

  /**
   * 獲取快取數據
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 檢查是否過期
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 設定快取數據
   */
  set<T>(key: string, data: T, ttlMinutes?: number): void {
    const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTtl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };

    this.cache.set(key, entry);
  }

  /**
   * 檢查是否有快取
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * 刪除特定快取
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有快取
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 獲取快取統計資訊
   */
  getStats(): {
    size: number;
    keys: string[];
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const keys = Array.from(this.cache.keys());
    const entries = Array.from(this.cache.values());

    return {
      size: this.cache.size,
      keys,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null
    };
  }

  /**
   * 清理過期的快取項目
   */
  cleanup(): number {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

// 建立全域快取實例
export const tokenHoldersCache = new TokenHoldersCache(5); // 5 分鐘 TTL
```

### 🎣 主要 Hook 實作

建立 `hooks/useTokenHolders.ts`：

```typescript
import { useState, useCallback, useRef } from 'react';
import { isAddress } from 'viem';
import { 
  UseTokenHoldersState, 
  TokenData, 
  TokenHolder, 
  FetchOptions 
} from './types/tokenHolders';
import { alchemyApi, AlchemyApi } from './utils/alchemyApi';
import { TokenDataProcessor } from './utils/tokenDataProcessor';
import { tokenHoldersCache } from './utils/cache';

export interface UseTokenHoldersReturn {
  // 數據狀態
  tokenData: TokenData | null;
  holders: TokenHolder[];
  totalHolders: number;
  
  // UI 狀態
  isLoading: boolean;
  error: string | null;
  
  // 統計資訊
  stats: {
    totalHolders: number;
    totalBalance: number;
    averageBalance: number;
    medianBalance: number;
    top10Percentage: number;
  };
  
  // 操作方法
  fetchTokenHolders: (address: string, options?: FetchOptions) => Promise<void>;
  refetch: () => Promise<void>;
  clearData: () => void;
  findHolder: (address: string) => TokenHolder | null;
}

export function useTokenHolders(): UseTokenHoldersReturn {
  // 狀態管理
  const [state, setState] = useState<UseTokenHoldersState>({
    tokenData: null,
    holders: [],
    totalHolders: 0,
    isLoading: false,
    error: null,
    lastFetchedAddress: null,
    lastFetchedAt: null,
  });

  // 使用 ref 來存儲取消請求的函數
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 更新狀態的輔助函數
   */
  const updateState = useCallback((updates: Partial<UseTokenHoldersState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * 清理數據
   */
  const clearData = useCallback(() => {
    // 取消進行中的請求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState({
      tokenData: null,
      holders: [],
      totalHolders: 0,
      isLoading: false,
      error: null,
      lastFetchedAddress: null,
      lastFetchedAt: null,
    });
  }, []);

  /**
   * 驗證輸入參數
   */
  const validateInputs = useCallback((address: string): string | null => {
    if (!address) {
      return '代幣地址不能為空';
    }

    if (!isAddress(address)) {
      return '請輸入有效的以太坊地址';
    }

    return null;
  }, []);

  /**
   * 主要的數據獲取函數
   */
  const fetchTokenHolders = useCallback(async (
    address: string,
    options: FetchOptions = {}
  ) => {
    const { withCache = true, forceRefresh = false } = options;

    // 驗證輸入
    const validationError = validateInputs(address);
    if (validationError) {
      updateState({ error: validationError });
      return;
    }

    const normalizedAddress = address.toLowerCase();

    // 檢查快取
    if (withCache && !forceRefresh) {
      const cacheKey = `token_holders_${normalizedAddress}`;
      const cached = tokenHoldersCache.get<{
        tokenData: TokenData;
        holders: TokenHolder[];
      }>(cacheKey);

      if (cached) {
        const stats = TokenDataProcessor.calculateStats(cached.holders);
        updateState({
          tokenData: cached.tokenData,
          holders: cached.holders,
          totalHolders: cached.holders.length,
          stats,
          isLoading: false,
          error: null,
          lastFetchedAddress: normalizedAddress,
          lastFetchedAt: Date.now(),
        });
        return;
      }
    }

    // 取消之前的請求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 建立新的 AbortController
    abortControllerRef.current = new AbortController();

    updateState({
      isLoading: true,
      error: null
    });

    try {
      // 並行獲取代幣元數據和持有者數據
      const [tokenMetadata, holdersResponse] = await Promise.all([
        alchemyApi.getTokenMetadata(normalizedAddress),
        alchemyApi.getAllTokenHolders(normalizedAddress)
      ]);

      // 檢查請求是否被取消
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // 處理數據
      const processedHolders = TokenDataProcessor.processTokenHolders(
        holdersResponse.owners,
        tokenMetadata
      );

      // 過濾零餘額持有者
      const filteredHolders = TokenDataProcessor.filterZeroBalances(processedHolders);

      // 計算統計資訊
      const stats = TokenDataProcessor.calculateStats(filteredHolders);

      // 更新狀態
      updateState({
        tokenData: tokenMetadata,
        holders: filteredHolders,
        totalHolders: filteredHolders.length,
        stats,
        isLoading: false,
        error: null,
        lastFetchedAddress: normalizedAddress,
        lastFetchedAt: Date.now(),
      });

      // 儲存到快取
      if (withCache) {
        const cacheKey = `token_holders_${normalizedAddress}`;
        tokenHoldersCache.set(cacheKey, {
          tokenData: tokenMetadata,
          holders: filteredHolders
        });
      }

    } catch (error: any) {
      // 如果請求被取消，不更新錯誤狀態
      if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        return;
      }

      console.error('Failed to fetch token holders:', error);
      
      const errorMessage = AlchemyApi.formatError(error);
      updateState({
        isLoading: false,
        error: errorMessage
      });
    } finally {
      abortControllerRef.current = null;
    }
  }, [validateInputs, updateState]);

  /**
   * 重新獲取數據
   */
  const refetch = useCallback(async () => {
    if (state.lastFetchedAddress) {
      await fetchTokenHolders(state.lastFetchedAddress, { forceRefresh: true });
    }
  }, [state.lastFetchedAddress, fetchTokenHolders]);

  /**
   * 查找特定地址的持有者
   */
  const findHolder = useCallback((address: string): TokenHolder | null => {
    return TokenDataProcessor.findHolderByAddress(state.holders, address);
  }, [state.holders]);

  /**
   * 計算統計資訊
   */
  const stats = TokenDataProcessor.calculateStats(state.holders);

  return {
    // 數據狀態
    tokenData: state.tokenData,
    holders: state.holders,
    totalHolders: state.totalHolders,
    
    // UI 狀態
    isLoading: state.isLoading,
    error: state.error,
    
    // 統計資訊
    stats,
    
    // 操作方法
    fetchTokenHolders,
    refetch,
    clearData,
    findHolder,
  };
}

// 導出相關型別
export type { TokenData, TokenHolder, FetchOptions } from './types/tokenHolders';
```

### 🧪 Hook 使用範例

建立測試組件來展示 Hook 的使用方法：

```typescript
// components/TokenHoldersExample.tsx
import React, { useState } from 'react';
import { useTokenHolders } from '~~/hooks/useTokenHolders';
import { AddressInput } from '~~/components/scaffold-alchemy';

export function TokenHoldersExample() {
  const [tokenAddress, setTokenAddress] = useState('');
  const {
    tokenData,
    holders,
    totalHolders,
    isLoading,
    error,
    stats,
    fetchTokenHolders,
    refetch,
    clearData,
    findHolder
  } = useTokenHolders();

  const handleSearch = async () => {
    if (tokenAddress) {
      await fetchTokenHolders(tokenAddress);
    }
  };

  const handleFindHolder = () => {
    const searchAddress = prompt('輸入要搜尋的地址:');
    if (searchAddress) {
      const holder = findHolder(searchAddress);
      if (holder) {
        alert(`找到持有者！排名: ${holder.rank}, 餘額: ${holder.balanceFormatted}`);
      } else {
        alert('未找到該地址的持有記錄');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Token Holders Hook 測試</h2>
      
      {/* 搜尋表單 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <AddressInput
              value={tokenAddress}
              onChange={setTokenAddress}
              placeholder="輸入代幣合約地址"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!tokenAddress || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
          >
            {isLoading ? '查詢中...' : '查詢'}
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={refetch}
            disabled={!tokenData || isLoading}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm"
          >
            重新整理
          </button>
          <button
            onClick={clearData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            清除數據
          </button>
          <button
            onClick={handleFindHolder}
            disabled={holders.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm"
          >
            搜尋持有者
          </button>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* 載入狀態 */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center mb-6">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-blue-800">正在獲取代幣持有者數據...</p>
        </div>
      )}

      {/* 代幣資訊 */}
      {tokenData && (
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white mb-6">
          <h3 className="text-xl font-bold mb-2">{tokenData.name} ({tokenData.symbol})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="opacity-80">合約地址</div>
              <div className="font-mono">{tokenData.contractAddress.slice(0, 10)}...</div>
            </div>
            <div>
              <div className="opacity-80">小數位數</div>
              <div>{tokenData.decimals}</div>
            </div>
            <div>
              <div className="opacity-80">總持有者</div>
              <div>{totalHolders.toLocaleString()}</div>
            </div>
            <div>
              <div className="opacity-80">前10名佔比</div>
              <div>{stats.top10Percentage.toFixed(2)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* 統計資訊 */}
      {holders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalHolders}</div>
            <div className="text-gray-600">總持有者</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.averageBalance.toFixed(2)}</div>
            <div className="text-gray-600">平均持有量</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.medianBalance.toFixed(2)}</div>
            <div className="text-gray-600">中位數持有量</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.top10Percentage.toFixed(1)}%</div>
            <div className="text-gray-600">前10名佔比</div>
          </div>
        </div>
      )}

      {/* 持有者列表 */}
      {holders.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h4 className="text-lg font-semibold">持有者排行榜 (前20名)</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {holders.slice(0, 20).map((holder, index) => (
              <div key={holder.address} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-mono text-sm">{holder.address}</div>
                      <div className="text-xs text-gray-500">持有者地址</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{holder.balanceFormatted} {tokenData?.symbol}</div>
                    <div className="text-sm text-gray-500">{holder.percentage.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 🧪 Hook 測試

建立測試檔案 `hooks/__tests__/useTokenHolders.test.ts`：

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTokenHolders } from '../useTokenHolders';
import { alchemyApi } from '../utils/alchemyApi';

// Mock Alchemy API
jest.mock('../utils/alchemyApi');
const mockAlchemyApi = alchemyApi as jest.Mocked<typeof alchemyApi>;

describe('useTokenHolders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useTokenHolders());

    expect(result.current.tokenData).toBeNull();
    expect(result.current.holders).toEqual([]);
    expect(result.current.totalHolders).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle invalid address', async () => {
    const { result } = renderHook(() => useTokenHolders());

    await act(async () => {
      await result.current.fetchTokenHolders('invalid-address');
    });

    expect(result.current.error).toBe('請輸入有效的以太坊地址');
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch token holders successfully', async () => {
    const mockTokenData = {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 18,
      totalSupply: '1000000000000000000000000',
      contractAddress: '0x1234567890123456789012345678901234567890'
    };

    const mockHoldersResponse = {
      owners: [
        {
          ownerAddress: '0xabcd1234567890123456789012345678901234abcd',
          tokenBalances: [{
            contractAddress: '0x1234567890123456789012345678901234567890',
            tokenBalance: '0xad78ebc5ac6200000', // 50000 tokens
            error: null
          }]
        }
      ],
      pageKey: null,
      totalCount: 1
    };

    mockAlchemyApi.getTokenMetadata.mockResolvedValue(mockTokenData);
    mockAlchemyApi.getAllTokenHolders.mockResolvedValue(mockHoldersResponse);

    const { result } = renderHook(() => useTokenHolders());

    await act(async () => {
      await result.current.fetchTokenHolders('0x1234567890123456789012345678901234567890');
    });

    expect(result.current.tokenData).toEqual(mockTokenData);
    expect(result.current.holders).toHaveLength(1);
    expect(result.current.totalHolders).toBe(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors', async () => {
    mockAlchemyApi.getTokenMetadata.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useTokenHolders());

    await act(async () => {
      await result.current.fetchTokenHolders('0x1234567890123456789012345678901234567890');
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear data', () => {
    const { result } = renderHook(() => useTokenHolders());

    act(() => {
      result.current.clearData();
    });

    expect(result.current.tokenData).toBeNull();
    expect(result.current.holders).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
```

### ✅ 小結

在這一課中，我們成功建立了功能完整的 `useTokenHolders` Hook：

✅ **完整的狀態管理**
- 載入、錯誤、成功狀態處理
- 取消請求和清理機制
- 統計資訊計算

✅ **強大的 API 整合**
- Alchemy API 封裝和錯誤處理
- 重試機制和請求優化
- 分頁數據處理

✅ **智能快取系統**
- 自動快取管理
- TTL 和過期處理
- 強制刷新選項

✅ **數據處理工具**
- 格式化和排序功能
- 統計資訊計算
- 搜尋和過濾功能

✅ **完整的測試覆蓋**
- 單元測試和錯誤場景
- Mock API 和狀態驗證
- 邊界條件測試

在下一課中，我們將把這個強大的 Hook 整合到前端頁面中，讓用戶能夠實際使用我們的富豪榜查詢功能！

---

**準備好看到我們的 Hook 在實際應用中發揮作用了嗎？** 🚀
