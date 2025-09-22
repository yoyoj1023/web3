# 單元三：前端基礎建設 - 打造查詢介面

## 第一課：Scaffold-Alchemy 前端元件介紹

### 🎯 學習目標

在這一課中，我們將：
- 深入了解 Scaffold-Alchemy 的內建元件庫
- 學習如何使用各種輸入和顯示元件
- 掌握元件的客製化和樣式設定
- 實作元件組合和最佳實踐

### 🧩 元件庫架構概覽

Scaffold-Alchemy 提供了豐富的內建元件，位於 `packages/nextjs/components/scaffold-alchemy/` 目錄：

```
scaffold-alchemy/
├── Address/              # 地址顯示元件
│   ├── Address.tsx
│   ├── AddressCopyIcon.tsx
│   └── AddressLinkWrapper.tsx
├── Input/                # 輸入元件系列
│   ├── AddressInput.tsx
│   ├── EtherInput.tsx
│   ├── IntegerInput.tsx
│   ├── BytesInput.tsx
│   └── InputBase.tsx
├── ConnectButton/        # 錢包連接元件
│   ├── index.tsx
│   ├── AddressInfoDropdown.tsx
│   └── NetworkOptions.tsx
├── Balance.tsx           # 餘額顯示元件
├── BlockieAvatar.tsx     # 頭像元件
└── index.tsx            # 統一導出
```

### 🔍 核心輸入元件詳解

#### 1. AddressInput - 地址輸入元件

**基本用法：**
```jsx
import { AddressInput } from "~~/components/scaffold-alchemy";

function MyComponent() {
  const [address, setAddress] = useState("");

  return (
    <AddressInput
      value={address}
      onChange={setAddress}
      placeholder="輸入 ERC20 代幣合約地址"
    />
  );
}
```

**進階功能：**
```jsx
<AddressInput
  value={tokenAddress}
  onChange={setTokenAddress}
  placeholder="0x1234..."
  // ENS 名稱解析
  name="tokenAddress"
  // 自定義樣式
  className="w-full"
  // 禁用狀態
  disabled={isLoading}
  // 錯誤狀態
  error={addressError}
  // 自動聚焦
  autoFocus
/>
```

**內建驗證功能：**
- ✅ 以太坊地址格式檢查
- ✅ Checksum 驗證
- ✅ ENS 名稱解析
- ✅ 即時驗證反饋

#### 2. IntegerInput - 整數輸入元件

**基本用法：**
```jsx
import { IntegerInput } from "~~/components/scaffold-alchemy";

function AmountInput() {
  const [amount, setAmount] = useState(BigInt(0));

  return (
    <IntegerInput
      value={amount}
      onChange={setAmount}
      placeholder="輸入數量"
    />
  );
}
```

**進階配置：**
```jsx
<IntegerInput
  value={pageSize}
  onChange={setPageSize}
  // 最小值和最大值
  min={BigInt(1)}
  max={BigInt(100)}
  // 單位顯示
  suffix="個項目"
  // 數字格式化
  variant="number" // 或 "bigint"
  // 步進值
  step={BigInt(10)}
/>
```

#### 3. EtherInput - 以太幣輸入元件

**基本用法：**
```jsx
import { EtherInput } from "~~/components/scaffold-alchemy";

function EthAmountInput() {
  const [ethAmount, setEthAmount] = useState("");

  return (
    <EtherInput
      value={ethAmount}
      onChange={setEthAmount}
      placeholder="0.0"
    />
  );
}
```

**特色功能：**
- 🔄 自動單位轉換 (ETH ↔ Wei)
- 💱 實時美元價值顯示
- ⚡ 智能小數點處理
- 🎨 美觀的數字格式化

### 🖼️ 顯示元件詳解

#### 1. Address - 地址顯示元件

**基本用法：**
```jsx
import { Address } from "~~/components/scaffold-alchemy";

function TokenHolder({ address, balance }) {
  return (
    <div className="flex items-center gap-4">
      <Address address={address} />
      <span>{balance} tokens</span>
    </div>
  );
}
```

**客製化選項：**
```jsx
<Address
  address={holderAddress}
  // 顯示格式
  format="short"     // "short" | "long" | "full"
  // 是否顯示複製按鈕
  disableCopy={false}
  // 是否顯示區塊鏈瀏覽器連結
  blockExplorerAddressLink={true}
  // 自定義大小
  size="base"        // "xs" | "sm" | "base" | "lg" | "xl"
  // 是否顯示頭像
  ensAvatar={true}
/>
```

#### 2. Balance - 餘額顯示元件

**基本用法：**
```jsx
import { Balance } from "~~/components/scaffold-alchemy";

function UserBalance({ address }) {
  return (
    <Balance
      address={address}
      className="text-xl font-bold"
    />
  );
}
```

**進階功能：**
```jsx
<Balance
  address={userAddress}
  // 顯示美元價值
  usdMode={true}
  // 自定義 className
  className="text-2xl text-green-600"
  // 載入時的佔位符
  placeholder="載入中..."
/>
```

### 🎨 樣式客製化

#### 1. Tailwind CSS 整合

所有元件都完美支援 Tailwind CSS：

```jsx
<AddressInput
  className="
    w-full 
    bg-gray-50 
    border-2 
    border-blue-300 
    rounded-lg 
    p-4 
    text-lg
    focus:border-blue-500 
    focus:ring-2 
    focus:ring-blue-200
    transition-all 
    duration-200
  "
/>
```

#### 2. 自定義主題

通過 CSS 變數自定義主題：

```css
/* styles/globals.css */
:root {
  --primary-color: #3B82F6;
  --secondary-color: #10B981;
  --accent-color: #F59E0B;
  --background-color: #F9FAFB;
  --text-color: #1F2937;
}

.custom-input {
  @apply bg-gray-50 border-2 border-primary-color/20 rounded-xl p-4;
  @apply focus:border-primary-color focus:ring-4 focus:ring-primary-color/10;
  @apply transition-all duration-300 ease-in-out;
}
```

#### 3. 暗色模式支援

```jsx
<div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
  <AddressInput
    className="
      bg-gray-50 dark:bg-gray-700
      border-gray-300 dark:border-gray-600
      text-gray-900 dark:text-gray-100
      placeholder-gray-500 dark:placeholder-gray-400
    "
  />
</div>
```

### 🔗 元件組合模式

#### 1. 搜尋表單組合

```jsx
import { AddressInput, IntegerInput } from "~~/components/scaffold-alchemy";

function TokenSearchForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [pageSize, setPageSize] = useState(BigInt(10));
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          代幣合約地址
        </label>
        <AddressInput
          value={tokenAddress}
          onChange={setTokenAddress}
          placeholder="輸入 ERC20 代幣合約地址"
          className="w-full"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          每頁顯示數量
        </label>
        <IntegerInput
          value={pageSize}
          onChange={setPageSize}
          placeholder="10"
          min={BigInt(5)}
          max={BigInt(50)}
          className="w-32"
        />
      </div>
      
      <button
        onClick={() => handleSearch(tokenAddress, pageSize)}
        disabled={!tokenAddress || isLoading}
        className="
          w-full bg-blue-600 hover:bg-blue-700 
          disabled:bg-gray-400 disabled:cursor-not-allowed
          text-white font-medium py-3 px-4 rounded-lg
          transition-colors duration-200
        "
      >
        {isLoading ? "搜尋中..." : "查詢富豪榜"}
      </button>
    </div>
  );
}
```

#### 2. 結果展示組合

```jsx
import { Address, Balance } from "~~/components/scaffold-alchemy";

function RichListItem({ holder, rank, balance, percentage }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className="
          w-8 h-8 bg-blue-600 text-white 
          rounded-full flex items-center justify-center
          font-bold text-sm
        ">
          {rank}
        </div>
        <Address 
          address={holder}
          format="short"
          size="base"
        />
      </div>
      
      <div className="text-right">
        <div className="font-semibold text-gray-900">
          {balance.toLocaleString()} tokens
        </div>
        <div className="text-sm text-gray-500">
          {percentage.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
```

### 🎯 實用工具函數

#### 1. 地址格式化

```typescript
// utils/address.ts
export function formatAddress(
  address: string, 
  format: "short" | "medium" | "long" = "short"
): string {
  if (!address) return "";
  
  switch (format) {
    case "short":
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    case "medium":
      return `${address.slice(0, 10)}...${address.slice(-6)}`;
    case "long":
      return `${address.slice(0, 16)}...${address.slice(-8)}`;
    default:
      return address;
  }
}
```

#### 2. 數字格式化

```typescript
// utils/format.ts
export function formatTokenAmount(
  amount: bigint | string | number,
  decimals: number = 18,
  displayDecimals: number = 2
): string {
  const value = typeof amount === 'bigint' 
    ? Number(amount) / Math.pow(10, decimals)
    : Number(amount);
    
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
```

#### 3. 驗證工具

```typescript
// utils/validation.ts
import { isAddress } from "viem";

export function validateAddress(address: string): {
  isValid: boolean;
  error?: string;
} {
  if (!address) {
    return { isValid: false, error: "地址不能為空" };
  }
  
  if (!isAddress(address)) {
    return { isValid: false, error: "無效的以太坊地址格式" };
  }
  
  return { isValid: true };
}

export function validateTokenAmount(amount: string): {
  isValid: boolean;
  error?: string;
} {
  if (!amount || amount === "0") {
    return { isValid: false, error: "數量必須大於 0" };
  }
  
  if (isNaN(Number(amount))) {
    return { isValid: false, error: "請輸入有效的數字" };
  }
  
  return { isValid: true };
}
```

### 🎨 客製化範例

#### 1. 自定義輸入元件

```jsx
// components/CustomTokenInput.tsx
import { AddressInput } from "~~/components/scaffold-alchemy";
import { useState } from "react";

export function CustomTokenInput({ onTokenSelect, className = "" }) {
  const [address, setAddress] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);

  const handleAddressChange = async (newAddress) => {
    setAddress(newAddress);
    
    if (isAddress(newAddress)) {
      setIsValidating(true);
      try {
        // 驗證是否為有效的 ERC20 合約
        const info = await validateERC20Contract(newAddress);
        setTokenInfo(info);
        onTokenSelect?.(newAddress, info);
      } catch (error) {
        setTokenInfo(null);
      } finally {
        setIsValidating(false);
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <AddressInput
          value={address}
          onChange={handleAddressChange}
          placeholder="輸入 ERC20 代幣合約地址"
          className="pr-10"
        />
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
      
      {tokenInfo && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">
              {tokenInfo.name} ({tokenInfo.symbol})
            </span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            總供應量: {formatTokenAmount(tokenInfo.totalSupply)} tokens
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 2. 響應式卡片元件

```jsx
// components/ResponsiveCard.tsx
export function ResponsiveCard({ children, className = "" }) {
  return (
    <div className={`
      bg-white dark:bg-gray-800 
      rounded-xl shadow-lg hover:shadow-xl
      border border-gray-200 dark:border-gray-700
      p-4 sm:p-6 lg:p-8
      transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  );
}
```

### 📱 響應式設計最佳實踐

#### 1. 移動端優化

```jsx
function MobileOptimizedForm() {
  return (
    <div className="
      w-full max-w-md mx-auto
      px-4 sm:px-0
      space-y-4 sm:space-y-6
    ">
      <AddressInput
        className="
          text-sm sm:text-base
          p-3 sm:p-4
          rounded-lg sm:rounded-xl
        "
        placeholder="代幣地址"
      />
      
      <button className="
        w-full 
        py-3 sm:py-4
        text-sm sm:text-base
        font-medium
        bg-blue-600 hover:bg-blue-700
        text-white rounded-lg sm:rounded-xl
        transition-colors duration-200
      ">
        查詢
      </button>
    </div>
  );
}
```

#### 2. 桌面端佈局

```jsx
function DesktopLayout() {
  return (
    <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
      <div className="lg:col-span-1">
        {/* 側邊欄 */}
      </div>
      <div className="lg:col-span-2">
        {/* 主要內容 */}
      </div>
    </div>
  );
}
```

### ✅ 小結

在這一課中，我們深入學習了 Scaffold-Alchemy 的前端元件系統：

✅ **掌握了核心元件**
- AddressInput, IntegerInput, EtherInput
- Address, Balance 顯示元件
- 內建驗證和格式化功能

✅ **學會了客製化技巧**
- Tailwind CSS 整合
- 自定義主題和樣式
- 響應式設計模式

✅ **理解了組合模式**
- 元件組合最佳實踐
- 實用工具函數
- 錯誤處理和用戶體驗

✅ **建立了開發基礎**
- 代碼結構和組織
- 型別安全和驗證
- 性能優化考量

在下一課中，我們將運用這些知識來建立我們的富豪榜查詢頁面！

---

**準備好建立你的第一個 DApp 頁面了嗎？** 🚀
