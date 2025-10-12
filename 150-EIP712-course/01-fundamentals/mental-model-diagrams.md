# EIP712 心智模型視覺化圖表

本文檔包含多個視覺化圖表，幫助你建立對 EIP712 的直觀理解。

## 📊 圖表目錄

1. [整體架構圖](#整體架構圖)
2. [編碼流程圖](#編碼流程圖)
3. [Domain Separator 概念圖](#domain-separator-概念圖)
4. [類型系統對比](#類型系統對比)
5. [安全性保護層](#安全性保護層)

---

## 整體架構圖

### EIP712 的三層結構

```mermaid
graph TD
    A[EIP712 簽名] --> B[第一層: Domain 應用身份]
    A --> C[第二層: Type 數據結構]
    A --> D[第三層: Value 實際數據]
    
    B --> B1[name: 應用名稱]
    B --> B2[version: 版本號]
    B --> B3[chainId: 鏈 ID]
    B --> B4[verifyingContract: 合約地址]
    
    C --> C1[類型名稱]
    C --> C2[字段定義]
    C --> C3[字段類型]
    
    D --> D1[字段值 1]
    D --> D2[字段值 2]
    D --> D3[字段值 N]
    
    style B fill:#ffebee
    style C fill:#e3f2fd
    style D fill:#f3e5f5
```

### 資料轉換流程

```mermaid
graph LR
    A[原始數據] -->|結構化| B[定義類型]
    B -->|實例化| C[填入數值]
    C -->|Type Hash| D[類型哈希]
    C -->|Struct Hash| E[數據哈希]
    D --> F[組合]
    E --> F
    G[Domain] -->|Domain Separator| F
    F -->|加前綴 0x1901| H[Digest]
    H -->|ECDSA 簽名| I[v, r, s]
    
    style A fill:#fff9c4
    style I fill:#c8e6c9
    style H fill:#ffccbc
```

---

## 編碼流程圖

### 完整的 EIP712 編碼步驟

```mermaid
sequenceDiagram
    autonumber
    participant App as 應用程式
    participant Lib as EIP712 庫
    participant Hash as 哈希函數
    participant Signer as 簽名器

    App->>Lib: 提供 domain 定義
    Lib->>Hash: 計算 DOMAIN_TYPEHASH
    Hash-->>Lib: 返回域類型哈希
    Lib->>Hash: 編碼並哈希 domain 數據
    Hash-->>Lib: 返回 domainSeparator
    
    App->>Lib: 提供 types 定義
    Lib->>Hash: 計算 TYPE_HASH
    Hash-->>Lib: 返回類型哈希
    
    App->>Lib: 提供 value 數據
    Lib->>Hash: abi.encode + keccak256
    Hash-->>Lib: 返回 structHash
    
    Lib->>Lib: 組合: 0x1901 + domainSeparator + structHash
    Lib->>Hash: keccak256(組合結果)
    Hash-->>Lib: 返回 digest
    
    Lib->>Signer: 請求簽名 digest
    Signer-->>Lib: 返回 (v, r, s)
    Lib-->>App: 返回完整簽名
```

### 哈希計算的嵌套結構

```mermaid
graph TB
    A[最終 Digest] --> B[keccak256]
    B --> C[0x19]
    B --> D[0x01]
    B --> E[domainSeparator]
    B --> F[structHash]
    
    E --> E1[keccak256 of domain]
    E1 --> E2[DOMAIN_TYPEHASH]
    E1 --> E3[name hash]
    E1 --> E4[version hash]
    E1 --> E5[chainId]
    E1 --> E6[verifyingContract]
    
    F --> F1[keccak256 of struct]
    F1 --> F2[TYPE_HASH]
    F1 --> F3[field value 1]
    F1 --> F4[field value 2]
    F1 --> F5[field value N]
    
    style A fill:#ff5722,color:#fff
    style E fill:#2196f3,color:#fff
    style F fill:#4caf50,color:#fff
```

---

## Domain Separator 概念圖

### Domain 作為命名空間

```mermaid
graph TD
    A[以太坊生態系統] --> B[DApp A<br/>Domain: name='A', contract=0x111]
    A --> C[DApp B<br/>Domain: name='B', contract=0x222]
    A --> D[DApp C<br/>Domain: name='C', contract=0x333]
    
    B --> B1[簽名只在此有效 ✅]
    B --> B2[不能用於 B 或 C ❌]
    
    C --> C1[簽名只在此有效 ✅]
    C --> C2[不能用於 A 或 C ❌]
    
    D --> D1[簽名只在此有效 ✅]
    D --> D2[不能用於 A 或 B ❌]
    
    style B fill:#e1f5fe
    style C fill:#f3e5f5
    style D fill:#fff3e0
```

### 跨鏈隔離

```mermaid
graph LR
    A[同一個 DApp] --> B[Ethereum Mainnet<br/>chainId: 1]
    A --> C[Polygon<br/>chainId: 137]
    A --> D[Arbitrum<br/>chainId: 42161]
    
    B --> B1[簽名 A]
    C --> C1[簽名 B]
    D --> D1[簽名 C]
    
    B1 -.不能用於.-> C
    B1 -.不能用於.-> D
    C1 -.不能用於.-> B
    C1 -.不能用於.-> D
    D1 -.不能用於.-> B
    D1 -.不能用於.-> C
    
    style B fill:#4caf50,color:#fff
    style C fill:#9c27b0,color:#fff
    style D fill:#2196f3,color:#fff
```

---

## 類型系統對比

### 傳統簽名 vs EIP712

```mermaid
graph TB
    subgraph Traditional [傳統簽名 - 無類型]
        T1[原始字串] --> T2[任意格式]
        T2 --> T3["to:0x123,amount:100"]
        T3 --> T4[簽名]
        T4 --> T5[無法驗證結構 ❌]
    end
    
    subgraph EIP712 [EIP712 - 強類型]
        E1[結構化數據] --> E2[明確類型定義]
        E2 --> E3["Transfer(address to, uint256 amount)"]
        E3 --> E4[類型安全的值]
        E4 --> E5["to: address(0x123)<br/>amount: uint256(100)"]
        E5 --> E6[簽名]
        E6 --> E7[可驗證結構 ✅]
    end
    
    style T5 fill:#ffcdd2
    style E7 fill:#c8e6c9
```

### 類型編碼示例

```mermaid
graph LR
    A[原始類型] --> B[Atomic Types]
    A --> C[Dynamic Types]
    A --> D[Complex Types]
    
    B --> B1[uint256]
    B --> B2[address]
    B --> B3[bool]
    B --> B4[bytes32]
    
    C --> C1[string]
    C --> C2[bytes]
    
    D --> D1[struct]
    D --> D2[array]
    
    B1 --> E[直接編碼]
    B2 --> E
    B3 --> E
    B4 --> E
    
    C1 --> F[先哈希再編碼]
    C2 --> F
    
    D1 --> G[遞歸編碼]
    D2 --> G
    
    style E fill:#c8e6c9
    style F fill:#fff9c4
    style G fill:#ffccbc
```

---

## 安全性保護層

### 多層防護機制

```mermaid
graph TD
    A[EIP712 簽名] --> B[防護層 1: 結構化顯示]
    B --> B1[錢包清楚顯示每個字段]
    B --> B2[使用者知道簽什麼]
    
    A --> C[防護層 2: Domain 隔離]
    C --> C1[綁定特定應用]
    C --> C2[防止跨應用重放]
    
    A --> D[防護層 3: ChainId 隔離]
    D --> D1[綁定特定鏈]
    D --> D2[防止跨鏈重放]
    
    A --> E[防護層 4: 合約綁定]
    E --> E1[綁定驗證合約]
    E --> E2[防止合約替換攻擊]
    
    A --> F[防護層 5: 類型驗證]
    F --> F1[強制類型檢查]
    F --> F2[防止類型混淆]
    
    style B fill:#c8e6c9
    style C fill:#c8e6c9
    style D fill:#c8e6c9
    style E fill:#c8e6c9
    style F fill:#c8e6c9
```

### 攻擊面對比

```mermaid
graph LR
    subgraph Old [傳統簽名攻擊面]
        O1[盲簽] --> O2[高風險 🔴]
        O3[重放攻擊] --> O4[高風險 🔴]
        O5[類型混淆] --> O6[高風險 🔴]
    end
    
    subgraph New [EIP712 攻擊面]
        N1[盲簽] --> N2[低風險 🟢]
        N3[重放攻擊] --> N4[低風險 🟢]
        N5[類型混淆] --> N6[低風險 🟢]
    end
    
    style O2 fill:#ff5252,color:#fff
    style O4 fill:#ff5252,color:#fff
    style O6 fill:#ff5252,color:#fff
    style N2 fill:#4caf50,color:#fff
    style N4 fill:#4caf50,color:#fff
    style N6 fill:#4caf50,color:#fff
```

---

## 心智模型：洋蔥結構

### 層層包裹的數據

```
┌─────────────────────────────────────────────────────┐
│  最外層：EIP191 前綴 (0x19 0x01)                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  第二層：Domain Separator                      │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  第三層：Type Hash                       │  │  │
│  │  │  ┌───────────────────────────────────┐  │  │  │
│  │  │  │  最內層：實際數據 Value           │  │  │  │
│  │  │  │                                   │  │  │  │
│  │  │  │  to: 0x742d35Cc...                │  │  │  │
│  │  │  │  amount: 100                      │  │  │  │
│  │  │  │  deadline: 1234567890             │  │  │  │
│  │  │  └───────────────────────────────────┘  │  │  │
│  │  │  Transfer(address,uint256,uint256)     │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │  MyToken, v1, chainId=1, contract=0x...      │  │
│  └───────────────────────────────────────────────┘  │
│  EIP712 標識                                        │
└─────────────────────────────────────────────────────┘
                       ↓
                [全部哈希]
                       ↓
                   Digest
                       ↓
                [ECDSA 簽名]
                       ↓
                  (v, r, s)
```

---

## 數據流動畫

### 從使用者操作到簽名驗證

```mermaid
stateDiagram-v2
    [*] --> UserIntent: 使用者意圖
    UserIntent --> StructuredData: 轉換為結構化數據
    
    StructuredData --> TypeDef: 定義類型
    StructuredData --> ValueFill: 填入值
    StructuredData --> DomainDef: 定義域
    
    TypeDef --> TypeHash: keccak256(類型字串)
    ValueFill --> StructHash: keccak256(編碼值)
    DomainDef --> DomainSep: keccak256(編碼域)
    
    TypeHash --> StructHash
    StructHash --> Combine
    DomainSep --> Combine
    
    Combine --> Digest: 0x1901 + domain + struct
    Digest --> Sign: ECDSA 簽名
    Sign --> Signature: (v, r, s)
    
    Signature --> SendToContract: 提交到合約
    SendToContract --> Verify: 重新計算 digest
    Verify --> Recover: ecrecover 恢復地址
    Recover --> Check: 比對地址
    Check --> [*]: 驗證完成
```

---

## 概念關係圖

### EIP712 核心概念的相互關係

```mermaid
mindmap
  root((EIP712))
    Domain
      name
      version
      chainId
      verifyingContract
      作用：命名空間隔離
    Types
      類型定義
      字段名稱
      字段類型
      作用：結構化約束
    Value
      實際數據
      類型化值
      作用：要簽名的內容
    Encoding
      Type Hash
      Struct Hash
      Domain Separator
      Digest
      作用：標準化編碼
    Security
      防盲簽
      防重放
      類型安全
      作用：安全保障
    Standards
      EIP-191
      EIP-2612
      EIP-2771
      作用：生態整合
```

---

## 記憶輔助

### 記住 EIP712 的關鍵

使用縮寫 **D-T-V-E-S**：

```
D - Domain (域)       → 應用身份證
T - Types (類型)      → 數據藍圖
V - Value (值)        → 實際內容
E - Encoding (編碼)   → 標準化處理
S - Signature (簽名)  → 密碼學證明
```

### 編碼步驟記憶法

**「域型結，前簽驗」** (Domain-Type-Struct, Prefix-Sign-Verify)

1. **域** - 計算 Domain Separator
2. **型** - 計算 Type Hash
3. **結** - 計算 Struct Hash
4. **前** - 加 0x1901 前綴組合成 Digest
5. **簽** - ECDSA 簽名得到 (v,r,s)
6. **驗** - 合約驗證簽名

---

## 總結

這些圖表從不同角度展示 EIP712 的核心概念：

- 🏗️ **架構圖**：理解整體結構
- 🔄 **流程圖**：理解數據轉換
- 🛡️ **安全圖**：理解保護機制
- 🧠 **心智圖**：建立直觀理解

建議多次查看這些圖表，並嘗試自己畫出來，這將大大幫助理解！

---

[返回第一章主頁](./README.md) | [下一章：編碼流程](../02-encoding-flow/README.md)

