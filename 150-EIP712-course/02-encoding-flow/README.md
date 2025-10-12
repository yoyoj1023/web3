# 第二章：編碼流程深度解析

> 深入理解 EIP712 的四個核心編碼步驟

## 🎯 本章目標

- 完全理解 EIP712 的編碼流程
- 掌握每個步驟的計算方法
- 能夠手動實現 EIP712 編碼
- 理解為什麼要這樣設計

## 📖 目錄

1. [編碼流程概覽](#編碼流程概覽)
2. [步驟 1: Domain Separator](#步驟-1-domain-separator)
3. [步驟 2: Type Hash](#步驟-2-type-hash)
4. [步驟 3: Struct Hash](#步驟-3-struct-hash)
5. [步驟 4: Final Digest](#步驟-4-final-digest)
6. [完整範例](#完整範例)

---

## 編碼流程概覽

EIP712 的編碼分為**四個核心步驟**：

```
輸入數據
    ↓
[步驟 1] 計算 Domain Separator
    ↓
[步驟 2] 計算 Type Hash
    ↓
[步驟 3] 計算 Struct Hash
    ↓
[步驟 4] 組合成 Final Digest
    ↓
    ↓ 送入 ECDSA 簽名
    ↓
  (v, r, s)
```

### 為什麼需要這四步？

| 步驟 | 目的 | 防護作用 |
|------|------|---------|
| Domain Separator | 確定應用身份 | 防止跨應用/跨鏈重放 |
| Type Hash | 確定數據結構 | 防止類型混淆 |
| Struct Hash | 編碼實際數據 | 標準化數據表示 |
| Final Digest | 組合所有信息 | 產生最終簽名訊息 |

---

## 步驟 1: Domain Separator

### 作用

Domain Separator 是應用程式的「指紋」，它確保簽名只在特定的應用、版本、鏈和合約上有效。

### 定義

```solidity
struct EIP712Domain {
    string  name;               // 應用名稱，如 "Uniswap V2"
    string  version;            // 版本號，如 "1"
    uint256 chainId;            // 鏈 ID，如 1 (Ethereum)
    address verifyingContract;  // 驗證合約地址
    bytes32 salt;               // 可選：額外的隨機值
}
```

### 計算步驟

#### 1.1 定義 DOMAIN_TYPEHASH

這是 EIP712Domain 結構的類型哈希：

```solidity
bytes32 constant DOMAIN_TYPEHASH = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
);
```

**注意事項：**
- 類型定義必須**完全一致**
- 字段順序按定義順序（不是字母順序）
- 如果包含 `salt` 字段，類型定義也要包含

#### 1.2 編碼並哈希 Domain 數據

```solidity
bytes32 domainSeparator = keccak256(
    abi.encode(
        DOMAIN_TYPEHASH,
        keccak256(bytes(name)),      // string 要先哈希
        keccak256(bytes(version)),   // string 要先哈希
        chainId,                     // uint256 直接編碼
        verifyingContract            // address 直接編碼
    )
);
```

### 完整範例

```typescript
// 使用 ethers.js
import { ethers } from "ethers";

const domain = {
  name: "MyToken",
  version: "1",
  chainId: 1,
  verifyingContract: "0x1111111111111111111111111111111111111111"
};

// 步驟 1: 計算 DOMAIN_TYPEHASH
const DOMAIN_TYPEHASH = ethers.id(
  "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
);
console.log("DOMAIN_TYPEHASH:", DOMAIN_TYPEHASH);

// 步驟 2: 編碼並哈希
const domainSeparator = ethers.keccak256(
  ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "bytes32", "bytes32", "uint256", "address"],
    [
      DOMAIN_TYPEHASH,
      ethers.id(domain.name),           // keccak256(bytes("MyToken"))
      ethers.id(domain.version),        // keccak256(bytes("1"))
      domain.chainId,
      domain.verifyingContract
    ]
  )
);

console.log("Domain Separator:", domainSeparator);
```

### 關鍵點

1. **string 類型要先哈希**：`keccak256(bytes(name))`
2. **bytes 類型也要先哈希**：`keccak256(data)`
3. **基本類型直接編碼**：uint256, address, bool 等
4. **順序必須一致**：與類型定義中的順序相同

---

## 步驟 2: Type Hash

### 作用

Type Hash 是數據結構定義的「指紋」，確保簽名者和驗證者對數據結構的理解完全一致。

### 計算方法

#### 2.1 構建類型字串

類型字串的格式：
```
TypeName(type1 field1,type2 field2,...)
```

**範例：**
```typescript
const typeString = "Transfer(address to,uint256 amount,uint256 deadline)";
```

**規則：**
- 類型名稱後直接跟括號（無空格）
- 字段之間用逗號分隔（無空格）
- 字段格式：`類型名 字段名`（中間有空格）
- 字段順序：按結構定義的順序

#### 2.2 計算哈希

```solidity
bytes32 TYPE_HASH = keccak256(
    "Transfer(address to,uint256 amount,uint256 deadline)"
);
```

或使用 ethers.js：

```typescript
const TYPE_HASH = ethers.id(
  "Transfer(address to,uint256 amount,uint256 deadline)"
);
```

### 嵌套類型的處理

如果結構中包含其他結構，需要遞歸定義：

```solidity
struct Person {
    string name;
    address wallet;
}

struct Mail {
    Person from;
    Person to;
    string content;
}
```

類型字串：
```
Mail(Person from,Person to,string content)Person(string name,address wallet)
```

**注意：** 依賴類型緊跟在主類型後面。

### 完整範例

```typescript
// 簡單類型
const simpleTypeString = "Transfer(address to,uint256 amount,uint256 deadline)";
const simpleTypeHash = ethers.id(simpleTypeString);

// 嵌套類型
const mailTypeString = 
  "Mail(Person from,Person to,string content)" +
  "Person(string name,address wallet)";
const mailTypeHash = ethers.id(mailTypeString);
```

---

## 步驟 3: Struct Hash

### 作用

Struct Hash 將實際的數據實例編碼並哈希。

### 計算方法

```solidity
bytes32 structHash = keccak256(
    abi.encode(
        TYPE_HASH,
        encodedField1,
        encodedField2,
        ...
    )
);
```

### 字段編碼規則

#### 原子類型（Atomic Types）

直接編碼：

```solidity
// address, uint256, int256, bool, bytes1-bytes32
abi.encode(value)
```

#### 動態類型（Dynamic Types）

先哈希再編碼：

```solidity
// string
keccak256(bytes(stringValue))

// bytes
keccak256(bytesValue)

// 陣列
keccak256(abi.encodePacked(item1Hash, item2Hash, ...))
```

#### 結構類型（Struct Types）

遞歸計算結構哈希：

```solidity
// 先計算內部結構的 structHash，再編碼
keccak256(abi.encode(innerTypeHash, ...innerFields))
```

### 完整範例

```typescript
import { ethers } from "ethers";

// 類型定義
const types = {
  Transfer: [
    { name: "to", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "deadline", type: "uint256" }
  ]
};

// 實際數據
const value = {
  to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  amount: 100n,
  deadline: 1234567890n
};

// 計算 TYPE_HASH
const TYPE_HASH = ethers.id(
  "Transfer(address to,uint256 amount,uint256 deadline)"
);

// 計算 structHash
const structHash = ethers.keccak256(
  ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "address", "uint256", "uint256"],
    [TYPE_HASH, value.to, value.amount, value.deadline]
  )
);

console.log("Struct Hash:", structHash);
```

### 包含動態類型的範例

```typescript
// 包含 string 類型
const types = {
  Message: [
    { name: "content", type: "string" },
    { name: "timestamp", type: "uint256" }
  ]
};

const value = {
  content: "Hello, EIP712!",
  timestamp: 1234567890n
};

const TYPE_HASH = ethers.id(
  "Message(string content,uint256 timestamp)"
);

// string 需要先哈希
const contentHash = ethers.id(value.content);

const structHash = ethers.keccak256(
  ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "bytes32", "uint256"],
    [TYPE_HASH, contentHash, value.timestamp]
  )
);
```

---

## 步驟 4: Final Digest

### 作用

將 Domain Separator 和 Struct Hash 組合成最終要簽署的 32 字節訊息。

### 計算方法

```solidity
bytes32 digest = keccak256(
    abi.encodePacked(
        "\x19\x01",           // EIP-191 prefix
        domainSeparator,      // 32 bytes
        structHash            // 32 bytes
    )
);
```

### 為什麼是 `\x19\x01`？

- `\x19`：EIP-191 的前綴，防止與以太坊交易混淆
- `\x01`：EIP-712 的版本號

這個前綴確保簽名數據永遠不會被誤認為是有效的以太坊交易。

### 完整範例

```typescript
import { ethers } from "ethers";

// 假設我們已經計算出：
const domainSeparator = "0x..."; // 從步驟 1
const structHash = "0x...";      // 從步驟 3

// 計算最終 digest
const digest = ethers.keccak256(
  ethers.concat([
    "0x1901",           // 固定前綴
    domainSeparator,    // 32 bytes
    structHash          // 32 bytes
  ])
);

console.log("Final Digest:", digest);

// 這個 digest 就是要簽署的訊息
const signature = await wallet.signMessage(ethers.getBytes(digest));
```

**注意：** 使用 `abi.encodePacked`（緊湊編碼），不是 `abi.encode`。

---

## 完整範例

### 手動實現完整流程

```typescript
import { ethers } from "ethers";

async function manualEIP712Encoding() {
  // ============================================
  // 輸入數據
  // ============================================
  
  const domain = {
    name: "MyToken",
    version: "1",
    chainId: 1,
    verifyingContract: "0x1111111111111111111111111111111111111111"
  };

  const value = {
    to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    amount: 100n,
    deadline: 1234567890n
  };

  console.log("輸入數據:");
  console.log("Domain:", domain);
  console.log("Value:", value);
  console.log("\n" + "=".repeat(50) + "\n");

  // ============================================
  // 步驟 1: 計算 Domain Separator
  // ============================================
  
  console.log("步驟 1: 計算 Domain Separator");
  console.log("-".repeat(50));

  const DOMAIN_TYPEHASH = ethers.id(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
  );
  console.log("DOMAIN_TYPEHASH:", DOMAIN_TYPEHASH);

  const domainSeparator = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        DOMAIN_TYPEHASH,
        ethers.id(domain.name),
        ethers.id(domain.version),
        domain.chainId,
        domain.verifyingContract
      ]
    )
  );
  console.log("Domain Separator:", domainSeparator);
  console.log("\n" + "=".repeat(50) + "\n");

  // ============================================
  // 步驟 2: 計算 Type Hash
  // ============================================
  
  console.log("步驟 2: 計算 Type Hash");
  console.log("-".repeat(50));

  const typeString = "Transfer(address to,uint256 amount,uint256 deadline)";
  console.log("Type String:", typeString);

  const TYPE_HASH = ethers.id(typeString);
  console.log("TYPE_HASH:", TYPE_HASH);
  console.log("\n" + "=".repeat(50) + "\n");

  // ============================================
  // 步驟 3: 計算 Struct Hash
  // ============================================
  
  console.log("步驟 3: 計算 Struct Hash");
  console.log("-".repeat(50));

  const structHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "address", "uint256", "uint256"],
      [TYPE_HASH, value.to, value.amount, value.deadline]
    )
  );
  console.log("Struct Hash:", structHash);
  console.log("\n" + "=".repeat(50) + "\n");

  // ============================================
  // 步驟 4: 計算 Final Digest
  // ============================================
  
  console.log("步驟 4: 計算 Final Digest");
  console.log("-".repeat(50));

  const digest = ethers.keccak256(
    ethers.concat([
      "0x1901",
      domainSeparator,
      structHash
    ])
  );
  console.log("Final Digest:", digest);
  console.log("\n" + "=".repeat(50) + "\n");

  // ============================================
  // 驗證：使用 ethers.js 內建方法對比
  // ============================================
  
  console.log("驗證：與 ethers.js 內建方法對比");
  console.log("-".repeat(50));

  const types = {
    Transfer: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ]
  };

  const computedDigest = ethers.TypedDataEncoder.hash(domain, types, value);
  console.log("ethers.js 計算的 Digest:", computedDigest);
  console.log("手動計算的 Digest:      ", digest);
  console.log("是否相同:", computedDigest === digest ? "✅" : "❌");

  return {
    domainSeparator,
    typeHash: TYPE_HASH,
    structHash,
    digest
  };
}

// 運行範例
if (require.main === module) {
  manualEIP712Encoding()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { manualEIP712Encoding };
```

---

## 🔑 關鍵要點總結

### 四步編碼流程

```
1️⃣ Domain Separator = keccak256(
     abi.encode(DOMAIN_TYPEHASH, nameHash, versionHash, chainId, contract)
   )

2️⃣ Type Hash = keccak256("TypeName(type1 field1,type2 field2,...)")

3️⃣ Struct Hash = keccak256(
     abi.encode(TYPE_HASH, field1, field2, ...)
   )

4️⃣ Digest = keccak256(
     abi.encodePacked("\x19\x01", domainSeparator, structHash)
   )
```

### 編碼規則記憶法

| 數據類型 | 編碼方式 | 範例 |
|---------|---------|------|
| 基本類型 | 直接編碼 | `uint256`, `address`, `bool` |
| 字串 | 先哈希 | `keccak256(bytes(str))` |
| 字節 | 先哈希 | `keccak256(data)` |
| 結構 | 遞歸計算 | 先算內部 structHash |
| 陣列 | 先編碼再哈希 | `keccak256(abi.encodePacked(...))` |

### 常見錯誤

❌ **錯誤 1：** 字串直接編碼而不是哈希
```typescript
// 錯誤
abi.encode(TYPE_HASH, value.name, ...)

// 正確
abi.encode(TYPE_HASH, keccak256(bytes(value.name)), ...)
```

❌ **錯誤 2：** 使用 `abi.encode` 而不是 `abi.encodePacked` 組合 digest
```typescript
// 錯誤
keccak256(abi.encode("\x19\x01", domainSeparator, structHash))

// 正確
keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash))
```

❌ **錯誤 3：** 類型字串格式錯誤
```typescript
// 錯誤
"Transfer (address to, uint256 amount)"  // 有多餘空格

// 正確
"Transfer(address to,uint256 amount)"
```

---

## 📝 動手實踐

查看本目錄下的腳本：

1. [step-by-step.ts](./step-by-step.ts) - 逐步演示每個階段
2. [encoding-playground.ts](./encoding-playground.ts) - 互動式編碼工具

運行方式：
```bash
npx ts-node 02-encoding-flow/step-by-step.ts
npx ts-node 02-encoding-flow/encoding-playground.ts
```

---

## 下一步

[第三章：簽名組件解密](../03-signature-components/README.md) - 理解 v, r, s 的意義

---

[返回主目錄](../README.md)

