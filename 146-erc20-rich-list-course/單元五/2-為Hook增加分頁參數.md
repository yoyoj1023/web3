# 第二課：為 `useTokenHolders` Hook 增加分頁參數

### 🎯 學習目標

在這一課中，我們將：
- 擴展 `useTokenHolders` Hook 以支援分頁功能
- 實作智能分頁狀態管理
- 加入搜尋、排序和過濾功能
- 優化效能和用戶體驗
- 建立完整的分頁 API 介面

### 🔧 Hook 架構升級

#### 新增分頁相關型別定義

更新 `hooks/types/tokenHolders.ts`：

```typescript
// 原有型別保持不變，新增以下型別

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SearchAndFilterState {
  searchQuery: string;
  sortField: keyof TokenHolder;
  sortDirection: 'asc' | 'desc';
  balanceFilter: {
    min: number;
    max: number;
  } | null;
}

export interface PaginationOptions {
  initialPage?: number;
  initialItemsPerPage?: number;
  enableSearch?: boolean;
  enableSort?: boolean;
  enableFilter?: boolean;
  maxItemsPerPage?: number;
}

export interface UseTokenHoldersWithPaginationReturn extends UseTokenHoldersReturn {
  // 分頁狀態
  pagination: PaginationState;
  
  // 搜尋和過濾狀態
  searchAndFilter: SearchAndFilterState;
  
  // 當前頁面數據
  currentPageHolders: TokenHolder[];
  
  // 分頁操作方法
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setItemsPerPage: (count: number) => void;
  
  // 搜尋和過濾操作
  searchHolders: (query: string) => void;
  sortHolders: (field: keyof TokenHolder, direction?: 'asc' | 'desc') => void;
  filterByBalance: (min: number, max?: number) => void;
  clearFilters: () => void;
  
  // 工具方法
  findHolderPage: (address: string) => { page: number; indexInPage: number } | null;
  getPageRange: (maxVisible?: number) => number[];
  exportCurrentPage: () => string;
}
```

#### 更新 Hook 狀態結構

```typescript
interface UseTokenHoldersWithPaginationState extends UseTokenHoldersState {
  // 分頁狀態
  pagination: PaginationState;
  
  // 搜尋和過濾狀態
  searchAndFilter: SearchAndFilterState;
  
  // 處理後的數據
  filteredHolders: TokenHolder[];
  
  // 分頁管理器實例
  paginationManager: TokenHoldersPagination | null;
}
```

### 🎣 升級後的 Hook 實作

建立新的 Hook 檔案 `hooks/useTokenHoldersWithPagination.ts`：

```typescript
import { useState, useCallback, useMemo, useEffect } from 'react';
import { isAddress } from 'viem';
import { 
  UseTokenHoldersState, 
  TokenData, 
  TokenHolder, 
  FetchOptions,
  PaginationState,
  SearchAndFilterState,
  PaginationOptions,
  UseTokenHoldersWithPaginationReturn,
  UseTokenHoldersWithPaginationState
} from './types/tokenHolders';
import { alchemyApi, AlchemyApi } from './utils/alchemyApi';
import { TokenDataProcessor } from './utils/tokenDataProcessor';
import { tokenHoldersCache } from './utils/cache';
import { TokenHoldersPagination } from './utils/pagination';

const DEFAULT_PAGINATION_OPTIONS: Required<PaginationOptions> = {
  initialPage: 1,
  initialItemsPerPage: 20,
  enableSearch: true,
  enableSort: true,
  enableFilter: true,
  maxItemsPerPage: 100,
};

export function useTokenHoldersWithPagination(
  options: PaginationOptions = {}
): UseTokenHoldersWithPaginationReturn {
  
  const config = { ...DEFAULT_PAGINATION_OPTIONS, ...options };
  
  // 初始化狀態
  const [state, setState] = useState<UseTokenHoldersWithPaginationState>({
    // 原有狀態
    tokenData: null,
    holders: [],
    totalHolders: 0,
    isLoading: false,
    error: null,
    lastFetchedAddress: null,
    lastFetchedAt: null,
    
    // 新增分頁狀態
    pagination: {
      currentPage: config.initialPage,
      itemsPerPage: config.initialItemsPerPage,
      totalPages: 0,
      totalItems: 0,
      startItem: 0,
      endItem: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    
    // 搜尋和過濾狀態
    searchAndFilter: {
      searchQuery: '',
      sortField: 'balanceNumber',
      sortDirection: 'desc',
      balanceFilter: null,
    },
    
    // 處理後的數據
    filteredHolders: [],
    
    // 分頁管理器
    paginationManager: null,
  });

  // 建立分頁管理器
  const paginationManager = useMemo(() => {
    const manager = new TokenHoldersPagination(state.pagination.itemsPerPage);
    return manager;
  }, []);

  // 更新狀態的輔助函數
  const updateState = useCallback((updates: Partial<UseTokenHoldersWithPaginationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 更新分頁資訊
  const updatePaginationInfo = useCallback(() => {
    const paginationInfo = paginationManager.getPaginationInfo();
    updateState({ 
      pagination: paginationInfo,
      paginationManager 
    });
  }, [paginationManager, updateState]);

  // 應用搜尋和過濾
  const applySearchAndFilter = useCallback(() => {
    const { searchQuery, sortField, sortDirection, balanceFilter } = state.searchAndFilter;
    
    // 應用搜尋
    if (searchQuery) {
      paginationManager.searchHolders(searchQuery);
    }
    
    // 應用排序
    paginationManager.sortHolders(sortField, sortDirection);
    
    // 應用餘額過濾
    if (balanceFilter) {
      paginationManager.filterByBalance(balanceFilter.min, balanceFilter.max);
    }
    
    // 更新過濾後的數據
    const filteredHolders = paginationManager.getCurrentPageData();
    updateState({ filteredHolders });
    
    // 更新分頁資訊
    updatePaginationInfo();
  }, [state.searchAndFilter, paginationManager, updateState, updatePaginationInfo]);

  // 主要的數據獲取函數
  const fetchTokenHolders = useCallback(async (
    address: string,
    options: FetchOptions = {}
  ) => {
    const { withCache = true, forceRefresh = false } = options;

    // 驗證輸入
    if (!address || !isAddress(address)) {
      updateState({ error: '請輸入有效的以太坊地址' });
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
        // 設定數據到分頁管理器
        paginationManager.setHolders(cached.holders);
        
        const stats = TokenDataProcessor.calculateStats(cached.holders);
        updateState({
          tokenData: cached.tokenData,
          holders: cached.holders,
          totalHolders: cached.holders.length,
          filteredHolders: cached.holders,
          isLoading: false,
          error: null,
          lastFetchedAddress: normalizedAddress,
          lastFetchedAt: Date.now(),
        });
        
        updatePaginationInfo();
        return;
      }
    }

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

      // 處理數據
      const processedHolders = TokenDataProcessor.processTokenHolders(
        holdersResponse.owners,
        tokenMetadata
      );

      // 過濾零餘額持有者
      const filteredHolders = TokenDataProcessor.filterZeroBalances(processedHolders);

      // 設定數據到分頁管理器
      paginationManager.setHolders(filteredHolders);

      // 更新狀態
      updateState({
        tokenData: tokenMetadata,
        holders: filteredHolders,
        totalHolders: filteredHolders.length,
        filteredHolders: filteredHolders,
        isLoading: false,
        error: null,
        lastFetchedAddress: normalizedAddress,
        lastFetchedAt: Date.now(),
      });

      // 更新分頁資訊
      updatePaginationInfo();

      // 儲存到快取
      if (withCache) {
        const cacheKey = `token_holders_${normalizedAddress}`;
        tokenHoldersCache.set(cacheKey, {
          tokenData: tokenMetadata,
          holders: filteredHolders
        });
      }

    } catch (error: any) {
      console.error('Failed to fetch token holders:', error);
      
      const errorMessage = AlchemyApi.formatError(error);
      updateState({
        isLoading: false,
        error: errorMessage
      });
    }
  }, [paginationManager, updateState, updatePaginationInfo]);

  // 分頁操作方法
  const goToPage = useCallback((page: number) => {
    if (paginationManager.goToPage(page)) {
      const currentPageData = paginationManager.getCurrentPageData();
      updateState({ filteredHolders: currentPageData });
      updatePaginationInfo();
    }
  }, [paginationManager, updateState, updatePaginationInfo]);

  const nextPage = useCallback(() => {
    if (paginationManager.nextPage()) {
      const currentPageData = paginationManager.getCurrentPageData();
      updateState({ filteredHolders: currentPageData });
      updatePaginationInfo();
    }
  }, [paginationManager, updateState, updatePaginationInfo]);

  const prevPage = useCallback(() => {
    if (paginationManager.prevPage()) {
      const currentPageData = paginationManager.getCurrentPageData();
      updateState({ filteredHolders: currentPageData });
      updatePaginationInfo();
    }
  }, [paginationManager, updateState, updatePaginationInfo]);

  const setItemsPerPage = useCallback((count: number) => {
    if (count < 1 || count > config.maxItemsPerPage) return;
    
    paginationManager.setItemsPerPage(count);
    const currentPageData = paginationManager.getCurrentPageData();
    
    updateState({ 
      filteredHolders: currentPageData,
      pagination: { ...state.pagination, itemsPerPage: count }
    });
    updatePaginationInfo();
  }, [paginationManager, updateState, updatePaginationInfo, config.maxItemsPerPage, state.pagination]);

  // 搜尋和過濾方法
  const searchHolders = useCallback((query: string) => {
    if (!config.enableSearch) return;
    
    updateState({
      searchAndFilter: { ...state.searchAndFilter, searchQuery: query }
    });
    
    paginationManager.searchHolders(query);
    const currentPageData = paginationManager.getCurrentPageData();
    updateState({ filteredHolders: currentPageData });
    updatePaginationInfo();
  }, [config.enableSearch, state.searchAndFilter, paginationManager, updateState, updatePaginationInfo]);

  const sortHolders = useCallback((
    field: keyof TokenHolder, 
    direction: 'asc' | 'desc' = 'desc'
  ) => {
    if (!config.enableSort) return;
    
    updateState({
      searchAndFilter: { 
        ...state.searchAndFilter, 
        sortField: field, 
        sortDirection: direction 
      }
    });
    
    paginationManager.sortHolders(field, direction);
    const currentPageData = paginationManager.getCurrentPageData();
    updateState({ filteredHolders: currentPageData });
    updatePaginationInfo();
  }, [config.enableSort, state.searchAndFilter, paginationManager, updateState, updatePaginationInfo]);

  const filterByBalance = useCallback((min: number, max: number = Infinity) => {
    if (!config.enableFilter) return;
    
    updateState({
      searchAndFilter: { 
        ...state.searchAndFilter, 
        balanceFilter: { min, max } 
      }
    });
    
    paginationManager.filterByBalance(min, max);
    const currentPageData = paginationManager.getCurrentPageData();
    updateState({ filteredHolders: currentPageData });
    updatePaginationInfo();
  }, [config.enableFilter, state.searchAndFilter, paginationManager, updateState, updatePaginationInfo]);

  const clearFilters = useCallback(() => {
    updateState({
      searchAndFilter: {
        searchQuery: '',
        sortField: 'balanceNumber',
        sortDirection: 'desc',
        balanceFilter: null,
      }
    });
    
    // 重置分頁管理器
    paginationManager.setHolders(state.holders);
    paginationManager.sortHolders('balanceNumber', 'desc');
    
    const currentPageData = paginationManager.getCurrentPageData();
    updateState({ filteredHolders: currentPageData });
    updatePaginationInfo();
  }, [state.holders, paginationManager, updateState, updatePaginationInfo]);

  // 工具方法
  const findHolderPage = useCallback((address: string) => {
    const result = paginationManager.findHolder(address);
    return result.holder ? { page: result.page, indexInPage: result.indexInPage } : null;
  }, [paginationManager]);

  const getPageRange = useCallback((maxVisible: number = 5) => {
    return paginationManager.getPageRange(maxVisible);
  }, [paginationManager]);

  const exportCurrentPage = useCallback(() => {
    return paginationManager.exportCurrentPage();
  }, [paginationManager]);

  // 重新獲取數據
  const refetch = useCallback(async () => {
    if (state.lastFetchedAddress) {
      await fetchTokenHolders(state.lastFetchedAddress, { forceRefresh: true });
    }
  }, [state.lastFetchedAddress, fetchTokenHolders]);

  // 清理數據
  const clearData = useCallback(() => {
    paginationManager.setHolders([]);
    setState({
      tokenData: null,
      holders: [],
      totalHolders: 0,
      isLoading: false,
      error: null,
      lastFetchedAddress: null,
      lastFetchedAt: null,
      pagination: {
        currentPage: config.initialPage,
        itemsPerPage: config.initialItemsPerPage,
        totalPages: 0,
        totalItems: 0,
        startItem: 0,
        endItem: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      searchAndFilter: {
        searchQuery: '',
        sortField: 'balanceNumber',
        sortDirection: 'desc',
        balanceFilter: null,
      },
      filteredHolders: [],
      paginationManager: null,
    });
  }, [paginationManager, config]);

  // 查找特定持有者
  const findHolder = useCallback((address: string): TokenHolder | null => {
    return TokenDataProcessor.findHolderByAddress(state.holders, address);
  }, [state.holders]);

  // 計算統計資訊
  const stats = useMemo(() => {
    return TokenDataProcessor.calculateStats(state.holders);
  }, [state.holders]);

  // 當前頁面的持有者數據
  const currentPageHolders = useMemo(() => {
    return state.filteredHolders;
  }, [state.filteredHolders]);

  return {
    // 原有 Hook 的返回值
    tokenData: state.tokenData,
    holders: state.holders,
    totalHolders: state.totalHolders,
    isLoading: state.isLoading,
    error: state.error,
    stats,
    fetchTokenHolders,
    refetch,
    clearData,
    findHolder,
    
    // 新增的分頁功能
    pagination: state.pagination,
    searchAndFilter: state.searchAndFilter,
    currentPageHolders,
    
    // 分頁操作方法
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    
    // 搜尋和過濾操作
    searchHolders,
    sortHolders,
    filterByBalance,
    clearFilters,
    
    // 工具方法
    findHolderPage,
    getPageRange,
    exportCurrentPage,
  };
}

// 導出型別
export type { 
  PaginationState, 
  SearchAndFilterState, 
  PaginationOptions,
  UseTokenHoldersWithPaginationReturn 
} from './types/tokenHolders';
```

### 🔧 更新分頁管理器

更新 `hooks/utils/pagination.ts` 以支援更多功能：

```typescript
// 在原有 TokenHoldersPagination 類別中添加以下方法

export class TokenHoldersPagination extends PaginationManager<TokenHolder> {
  // ... 原有方法保持不變

  /**
   * 獲取分頁導航資訊（包含省略號）
   */
  getAdvancedPageRange(maxVisible: number = 7): (number | 'ellipsis')[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const result: (number | 'ellipsis')[] = [];
    const current = this.currentPage;
    
    // 總是顯示第一頁
    result.push(1);
    
    if (current > 4) {
      result.push('ellipsis');
    }
    
    // 顯示當前頁面附近的頁面
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);
    
    for (let i = start; i <= end; i++) {
      if (!result.includes(i)) {
        result.push(i);
      }
    }
    
    if (current < totalPages - 3) {
      result.push('ellipsis');
    }
    
    // 總是顯示最後一頁
    if (totalPages > 1 && !result.includes(totalPages)) {
      result.push(totalPages);
    }
    
    return result;
  }

  /**
   * 獲取快速跳轉頁面建議
   */
  getQuickJumpSuggestions(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    const suggestions: number[] = [];
    
    // 添加一些有意義的頁面
    if (totalPages >= 10) {
      suggestions.push(Math.ceil(totalPages * 0.25)); // 25%
      suggestions.push(Math.ceil(totalPages * 0.5));  // 50%
      suggestions.push(Math.ceil(totalPages * 0.75)); // 75%
    }
    
    return suggestions.filter(page => page > 0 && page <= totalPages);
  }

  /**
   * 批次操作：獲取多頁數據
   */
  getMultiplePages(startPage: number, endPage: number): TokenHolder[][] {
    const result: TokenHolder[][] = [];
    const originalPage = this.currentPage;
    
    for (let page = startPage; page <= endPage; page++) {
      if (this.goToPage(page)) {
        result.push([...this.getCurrentPageData()]);
      }
    }
    
    // 恢復原來的頁面
    this.goToPage(originalPage);
    
    return result;
  }

  /**
   * 獲取指定範圍的所有數據
   */
  getDataRange(startIndex: number, endIndex: number): TokenHolder[] {
    return this.filteredData.slice(startIndex, endIndex);
  }

  /**
   * 預測搜尋結果數量（不實際執行搜尋）
   */
  predictSearchResults(query: string): number {
    if (!query.trim()) return this.originalData.length;
    
    const searchQuery = query.toLowerCase();
    return this.originalData.filter(holder =>
      holder.address.toLowerCase().includes(searchQuery) ||
      holder.balanceFormatted.toLowerCase().includes(searchQuery)
    ).length;
  }

  /**
   * 獲取搜尋建議
   */
  getSearchSuggestions(query: string, maxSuggestions: number = 5): string[] {
    if (!query.trim()) return [];
    
    const searchQuery = query.toLowerCase();
    const suggestions = new Set<string>();
    
    this.originalData.forEach(holder => {
      // 地址建議
      if (holder.address.toLowerCase().includes(searchQuery)) {
        suggestions.add(holder.address);
      }
      
      // 餘額建議
      if (holder.balanceFormatted.includes(query)) {
        suggestions.add(holder.balanceFormatted);
      }
    });
    
    return Array.from(suggestions).slice(0, maxSuggestions);
  }
}
```

### 🧪 Hook 使用範例

建立範例組件展示新功能：

```typescript
// components/AdvancedTokenHoldersExample.tsx
import React, { useState } from 'react';
import { useTokenHoldersWithPagination } from '~~/hooks/useTokenHoldersWithPagination';
import { AddressInput } from '~~/components/scaffold-alchemy';

export function AdvancedTokenHoldersExample() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    // 數據狀態
    tokenData,
    holders,
    totalHolders,
    isLoading,
    error,
    stats,
    currentPageHolders,
    
    // 分頁狀態
    pagination,
    searchAndFilter,
    
    // 操作方法
    fetchTokenHolders,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    searchHolders,
    sortHolders,
    filterByBalance,
    clearFilters,
    
    // 工具方法
    findHolderPage,
    getPageRange,
    exportCurrentPage,
  } = useTokenHoldersWithPagination({
    initialItemsPerPage: 10,
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
  });

  const handleSearch = async () => {
    if (tokenAddress) {
      await fetchTokenHolders(tokenAddress);
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    searchHolders(query);
  };

  const handleSortChange = (field: string) => {
    const direction = searchAndFilter.sortDirection === 'desc' ? 'asc' : 'desc';
    sortHolders(field as keyof TokenHolder, direction);
  };

  const handleExport = () => {
    const csvData = exportCurrentPage();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-holders-page-${pagination.currentPage}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 搜尋表單 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <AddressInput
            value={tokenAddress}
            onChange={setTokenAddress}
            placeholder="輸入代幣合約地址"
          />
          <button
            onClick={handleSearch}
            disabled={!tokenAddress || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
          >
            {isLoading ? '查詢中...' : '查詢'}
          </button>
        </div>
      </div>

      {/* 控制面板 */}
      {tokenData && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* 搜尋框 */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch(searchQuery)}
                placeholder="搜尋地址或餘額..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* 搜尋按鈕 */}
            <button
              onClick={() => handleQuickSearch(searchQuery)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              搜尋
            </button>
            
            {/* 清除過濾器 */}
            <button
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              清除過濾器
            </button>
            
            {/* 匯出按鈕 */}
            <button
              onClick={handleExport}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              匯出當前頁
            </button>
          </div>

          {/* 排序和過濾選項 */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">排序：</label>
              <select
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="balanceNumber">餘額</option>
                <option value="percentage">佔比</option>
                <option value="address">地址</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">每頁：</label>
              <select
                value={pagination.itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 統計資訊 */}
      {tokenData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{totalHolders}</div>
            <div className="text-blue-600">總持有者</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{pagination.totalItems}</div>
            <div className="text-green-600">篩選後</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{pagination.currentPage}</div>
            <div className="text-purple-600">當前頁</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{pagination.totalPages}</div>
            <div className="text-orange-600">總頁數</div>
          </div>
        </div>
      )}

      {/* 持有者列表 */}
      {currentPageHolders.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">
                持有者列表 ({pagination.startItem}-{pagination.endItem} / {pagination.totalItems})
              </h4>
              <div className="text-sm text-gray-500">
                排序：{searchAndFilter.sortField} ({searchAndFilter.sortDirection})
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {currentPageHolders.map((holder, index) => (
              <div key={holder.address} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {holder.rank}
                    </div>
                    <div>
                      <div className="font-mono text-sm">{holder.address}</div>
                      <div className="text-xs text-gray-500">
                        頁面內排名: #{index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {holder.balanceFormatted} {tokenData?.symbol}
                    </div>
                    <div className="text-sm text-gray-500">
                      {holder.percentage.toFixed(4)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 分頁控制 */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* 頁面資訊 */}
            <div className="text-sm text-gray-600">
              顯示第 {pagination.startItem} 至 {pagination.endItem} 項，
              共 {pagination.totalItems} 項
            </div>

            {/* 分頁按鈕 */}
            <div className="flex items-center gap-1">
              <button
                onClick={prevPage}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一頁
              </button>

              {getPageRange(7).map((page, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(page)}
                  disabled={page === pagination.currentPage}
                  className={`px-3 py-2 text-sm border-t border-b border-r border-gray-300 ${
                    page === pagination.currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={nextPage}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一頁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 🧪 單元測試

建立測試檔案 `hooks/__tests__/useTokenHoldersWithPagination.test.ts`：

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTokenHoldersWithPagination } from '../useTokenHoldersWithPagination';

// Mock 數據
const mockTokenHolders = Array.from({ length: 100 }, (_, i) => ({
  address: `0x${i.toString().padStart(40, '0')}`,
  balance: `0x${(1000000 - i * 1000).toString(16)}`,
  balanceFormatted: (1000000 - i * 1000).toString(),
  balanceNumber: 1000000 - i * 1000,
  percentage: (100 - i).toFixed(2),
  rank: i + 1,
}));

describe('useTokenHoldersWithPagination', () => {
  it('should initialize with correct default pagination state', () => {
    const { result } = renderHook(() => useTokenHoldersWithPagination());

    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.pagination.itemsPerPage).toBe(20);
    expect(result.current.pagination.totalPages).toBe(0);
  });

  it('should handle page navigation', () => {
    const { result } = renderHook(() => useTokenHoldersWithPagination());

    // 模擬設定數據
    act(() => {
      // 這裡需要設定 mock 數據
    });

    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.pagination.currentPage).toBe(2);
  });

  it('should handle search functionality', () => {
    const { result } = renderHook(() => useTokenHoldersWithPagination());

    act(() => {
      result.current.searchHolders('0x123');
    });

    expect(result.current.searchAndFilter.searchQuery).toBe('0x123');
  });

  it('should handle sorting', () => {
    const { result } = renderHook(() => useTokenHoldersWithPagination());

    act(() => {
      result.current.sortHolders('address', 'asc');
    });

    expect(result.current.searchAndFilter.sortField).toBe('address');
    expect(result.current.searchAndFilter.sortDirection).toBe('asc');
  });
});
```

### ✅ 小結

在這一課中，我們成功為 Hook 增加了完整的分頁功能：

✅ **完整的分頁狀態管理**
- 當前頁面、總頁數、項目數量等資訊
- 頁面導航和跳轉功能
- 每頁項目數量調整

✅ **強大的搜尋和過濾功能**
- 即時搜尋持有者地址和餘額
- 多欄位排序支援
- 餘額範圍過濾

✅ **進階分頁管理器**
- 智能頁面範圍計算
- 批次數據操作
- 搜尋建議和預測

✅ **完整的 API 介面**
- 易於使用的 Hook 介面
- 豐富的工具方法
- 完整的型別定義

在下一課中，我們將建立美觀且功能完整的分頁 UI 元件，讓用戶能夠直觀地使用這些強大的分頁功能！

---

**準備好建立令人驚豔的分頁 UI 了嗎？** 🎨
