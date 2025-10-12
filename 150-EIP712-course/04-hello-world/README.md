# 第四章：Hello World 範例

> 實作第一個完整的 EIP712 簽名和驗證系統

## 🎯 本章目標

- 實作最簡單的 EIP712 簽名範例
- 理解前端簽名和鏈上驗證的完整流程
- 學會使用 ethers.js 和 viem 兩種工具
- 掌握手動編碼的方法（深入理解）

## 📖 本章內容

1. [專案結構](#專案結構)
2. [智能合約實現](#智能合約實現)
3. [前端簽名（ethers.js）](#前端簽名-ethersjs)
4. [前端簽名（viem）](#前端簽名-viem)
5. [鏈上驗證](#鏈上驗證)
6. [手動編碼](#手動編碼)

---

## 專案結構

```
04-hello-world/
├── README.md                    # 本文檔
├── contracts/
│   └── SimpleMessage.sol        # 簡單的訊息簽名合約
├── scripts/
│   ├── sign-message-ethers.ts   # 使用 ethers.js 簽名
│   ├── sign-message-viem.ts     # 使用 viem 簽名
│   ├── verify-onchain.ts        # 部署合約並驗證
│   └── manual-encoding.ts       # 手動實現編碼
└── test/
    └── SimpleMessage.test.ts    # 合約測試
```

---

## 智能合約實現

我們將實作一個最簡單的訊息簽名驗證合約。

### SimpleMessage.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleMessage
 * @dev 最簡單的 EIP712 訊息簽名驗證合約
 * 
 * 這個合約演示了 EIP712 的核心概念：
 * 1. Domain Separator（域分隔符）
 * 2. Type Hash（類型哈希）
 * 3. Struct Hash（結構哈希）
 * 4. 簽名驗證
 */
contract SimpleMessage {
    
    // EIP712 Domain 的類型哈希
    bytes32 public constant DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    
    // Message 結構的類型哈希
    bytes32 public constant MESSAGE_TYPEHASH = keccak256(
        "Message(string content,address sender)"
    );
    
    // Domain Separator（在構造函數中計算）
    bytes32 public immutable DOMAIN_SEPARATOR;
    
    // 合約名稱和版本
    string public constant NAME = "SimpleMessage";
    string public constant VERSION = "1";
    
    /**
     * @dev 構造函數：計算 Domain Separator
     */
    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes(NAME)),
                keccak256(bytes(VERSION)),
                block.chainid,
                address(this)
            )
        );
    }
    
    /**
     * @dev 驗證訊息簽名
     * @param content 訊息內容
     * @param sender 聲稱的發送者
     * @param v 簽名的 v 值
     * @param r 簽名的 r 值
     * @param s 簽名的 s 值
     * @return 簽名是否有效
     */
    function verifyMessage(
        string memory content,
        address sender,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (bool) {
        // 計算 struct hash
        bytes32 structHash = keccak256(
            abi.encode(
                MESSAGE_TYPEHASH,
                keccak256(bytes(content)),  // string 需要先哈希
                sender
            )
        );
        
        // 計算最終的 digest
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                structHash
            )
        );
        
        // 使用 ecrecover 恢復簽名者地址
        address recoveredSigner = ecrecover(digest, v, r, s);
        
        // 比對恢復的地址和聲稱的發送者
        return recoveredSigner == sender && recoveredSigner != address(0);
    }
    
    /**
     * @dev 驗證簽名（使用 bytes 格式的簽名）
     * @param content 訊息內容
     * @param sender 聲稱的發送者
     * @param signature 完整的簽名（65 bytes）
     * @return 簽名是否有效
     */
    function verifyMessageWithSignature(
        string memory content,
        address sender,
        bytes memory signature
    ) public view returns (bool) {
        require(signature.length == 65, "Invalid signature length");
        
        // 分解簽名
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        return verifyMessage(content, sender, v, r, s);
    }
    
    /**
     * @dev 獲取訊息的 struct hash（用於調試）
     */
    function getStructHash(
        string memory content,
        address sender
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                MESSAGE_TYPEHASH,
                keccak256(bytes(content)),
                sender
            )
        );
    }
    
    /**
     * @dev 獲取訊息的 digest（用於調試）
     */
    function getDigest(
        string memory content,
        address sender
    ) public view returns (bytes32) {
        bytes32 structHash = getStructHash(content, sender);
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                structHash
            )
        );
    }
}
```

### 合約重點解析

1. **DOMAIN_TYPEHASH**：Domain 結構的類型哈希，固定值
2. **MESSAGE_TYPEHASH**：Message 結構的類型哈希，固定值
3. **DOMAIN_SEPARATOR**：在部署時計算，綁定到特定鏈和合約地址
4. **verifyMessage**：核心驗證函數
5. **getStructHash / getDigest**：調試輔助函數

---

## 前端簽名 (ethers.js)

### sign-message-ethers.ts

```typescript
import { ethers } from "ethers";

async function signMessageWithEthers() {
  console.log("使用 ethers.js 簽署 EIP712 訊息\n");
  console.log("=".repeat(60));
  
  // 1. 創建錢包
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wallet = new ethers.Wallet(privateKey);
  
  console.log("\n📝 簽名者信息:");
  console.log("  地址:", wallet.address);
  
  // 2. 定義 Domain
  const domain = {
    name: "SimpleMessage",
    version: "1",
    chainId: 31337,  // Hardhat 本地網路
    verifyingContract: "0x5FbDB2315678afecb367f032d93F642f64180aa3" // 部署後的合約地址
  };
  
  console.log("\n🌐 Domain:");
  console.log(JSON.stringify(domain, null, 2));
  
  // 3. 定義 Types
  const types = {
    Message: [
      { name: "content", type: "string" },
      { name: "sender", type: "address" }
    ]
  };
  
  console.log("\n📋 Types:");
  console.log(JSON.stringify(types, null, 2));
  
  // 4. 定義 Value
  const value = {
    content: "Hello, EIP712!",
    sender: wallet.address
  };
  
  console.log("\n📦 Value:");
  console.log(JSON.stringify(value, null, 2));
  
  // 5. 簽名
  console.log("\n✍️  簽名中...");
  const signature = await wallet.signTypedData(domain, types, value);
  
  console.log("\n✅ 簽名完成!");
  console.log("  簽名:", signature);
  console.log("  長度:", (signature.length - 2) / 2, "bytes");
  
  // 6. 分解簽名
  const sig = ethers.Signature.from(signature);
  console.log("\n🔍 簽名組件:");
  console.log("  r:", sig.r);
  console.log("  s:", sig.s);
  console.log("  v:", sig.v);
  
  // 7. 本地驗證
  console.log("\n🔐 本地驗證:");
  const recovered = ethers.verifyTypedData(domain, types, value, signature);
  console.log("  恢復的地址:", recovered);
  console.log("  匹配:", recovered === wallet.address ? "✅" : "❌");
  
  // 8. 輸出用於鏈上驗證的數據
  console.log("\n📤 用於鏈上驗證的數據:");
  console.log("─".repeat(60));
  console.log("content:", value.content);
  console.log("sender:", value.sender);
  console.log("v:", sig.v);
  console.log("r:", sig.r);
  console.log("s:", sig.s);
  console.log("signature:", signature);
  
  return { domain, types, value, signature, sig };
}

// 執行
if (require.main === module) {
  signMessageWithEthers()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { signMessageWithEthers };
```

---

## 前端簽名 (viem)

### sign-message-viem.ts

```typescript
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";

async function signMessageWithViem() {
  console.log("使用 viem 簽署 EIP712 訊息\n");
  console.log("=".repeat(60));
  
  // 1. 創建賬戶
  const account = privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  );
  
  console.log("\n📝 簽名者信息:");
  console.log("  地址:", account.address);
  
  // 2. 創建錢包客戶端
  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport: http()
  });
  
  // 3. 定義 EIP712 數據
  const domain = {
    name: "SimpleMessage",
    version: "1",
    chainId: 31337,
    verifyingContract: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  } as const;
  
  const types = {
    Message: [
      { name: "content", type: "string" },
      { name: "sender", type: "address" }
    ]
  } as const;
  
  const message = {
    content: "Hello, EIP712 from viem!",
    sender: account.address
  } as const;
  
  console.log("\n🌐 Domain:");
  console.log(JSON.stringify(domain, null, 2));
  console.log("\n📦 Message:");
  console.log(JSON.stringify(message, null, 2));
  
  // 4. 簽名
  console.log("\n✍️  簽名中...");
  const signature = await walletClient.signTypedData({
    domain,
    types,
    primaryType: "Message",
    message
  });
  
  console.log("\n✅ 簽名完成!");
  console.log("  簽名:", signature);
  console.log("  長度:", (signature.length - 2) / 2, "bytes");
  
  // 5. 分解簽名
  const r = signature.slice(0, 66);
  const s = "0x" + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);
  
  console.log("\n🔍 簽名組件:");
  console.log("  r:", r);
  console.log("  s:", s);
  console.log("  v:", v);
  
  console.log("\n📤 用於鏈上驗證的數據:");
  console.log("─".repeat(60));
  console.log("content:", message.content);
  console.log("sender:", message.sender);
  console.log("signature:", signature);
  
  return { domain, types, message, signature };
}

// 執行
if (require.main === module) {
  signMessageWithViem()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { signMessageWithViem };
```

---

## 鏈上驗證

### verify-onchain.ts

```typescript
import { ethers } from "ethers";

async function verifyOnChain() {
  console.log("\n部署合約並驗證簽名\n");
  console.log("=".repeat(60));
  
  // 連接到本地 Hardhat 節點
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const wallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );
  
  console.log("\n部署者地址:", wallet.address);
  
  // 部署合約（假設已編譯）
  // 這裡需要實際的合約 ABI 和 bytecode
  console.log("\n⚠️  請先運行 'npm run compile' 編譯合約");
  console.log("然後使用 Hardhat 部署腳本部署合約");
  
  // 假設合約已部署
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // 合約 ABI（簡化版）
  const abi = [
    "function verifyMessage(string content, address sender, uint8 v, bytes32 r, bytes32 s) view returns (bool)",
    "function verifyMessageWithSignature(string content, address sender, bytes signature) view returns (bool)",
    "function DOMAIN_SEPARATOR() view returns (bytes32)",
    "function getDigest(string content, address sender) view returns (bytes32)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  // 準備測試數據
  const content = "Hello, EIP712!";
  const sender = wallet.address;
  
  // 生成簽名
  const domain = {
    name: "SimpleMessage",
    version: "1",
    chainId: 31337,
    verifyingContract: contractAddress
  };
  
  const types = {
    Message: [
      { name: "content", type: "string" },
      { name: "sender", type: "address" }
    ]
  };
  
  const value = { content, sender };
  const signature = await wallet.signTypedData(domain, types, value);
  const sig = ethers.Signature.from(signature);
  
  console.log("\n測試數據:");
  console.log("  content:", content);
  console.log("  sender:", sender);
  console.log("  signature:", signature);
  
  // 驗證（方法 1：使用 v, r, s）
  console.log("\n驗證方法 1: 使用 v, r, s");
  const isValid1 = await contract.verifyMessage(
    content,
    sender,
    sig.v,
    sig.r,
    sig.s
  );
  console.log("  結果:", isValid1 ? "✅ 有效" : "❌ 無效");
  
  // 驗證（方法 2：使用完整簽名）
  console.log("\n驗證方法 2: 使用完整簽名");
  const isValid2 = await contract.verifyMessageWithSignature(
    content,
    sender,
    signature
  );
  console.log("  結果:", isValid2 ? "✅ 有效" : "❌ 無效");
  
  // 獲取 digest 進行對比
  console.log("\n調試信息:");
  const onChainDigest = await contract.getDigest(content, sender);
  const offChainDigest = ethers.TypedDataEncoder.hash(domain, types, value);
  console.log("  鏈上 digest: ", onChainDigest);
  console.log("  鏈下 digest: ", offChainDigest);
  console.log("  一致:", onChainDigest === offChainDigest ? "✅" : "❌");
}

if (require.main === module) {
  verifyOnChain()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { verifyOnChain };
```

---

## 手動編碼

為了更深入理解 EIP712，讓我們手動實現編碼過程：

### manual-encoding.ts

請查看 [simple-message/manual-encoding.ts](./simple-message/manual-encoding.ts)

---

## 🚀 快速開始

### 1. 編譯合約

```bash
cd 150-EIP712
npm run compile
```

### 2. 啟動本地節點

```bash
npm run node
```

### 3. 部署合約

```bash
npx hardhat run scripts/deploy-simple-message.ts --network localhost
```

### 4. 簽名並驗證

```bash
# 使用 ethers.js
npx ts-node 04-hello-world/scripts/sign-message-ethers.ts

# 使用 viem
npx ts-node 04-hello-world/scripts/sign-message-viem.ts

# 鏈上驗證
npx ts-node 04-hello-world/scripts/verify-onchain.ts
```

---

## 🔑 關鍵要點

### 前端簽名流程

```
1. 定義 Domain  → 應用身份
2. 定義 Types   → 數據結構
3. 定義 Value   → 實際數據
4. 調用 signTypedData → 獲得簽名
```

### 鏈上驗證流程

```
1. 重新計算 struct hash
2. 組合 domain separator 和 struct hash
3. 計算最終 digest
4. 使用 ecrecover 恢復地址
5. 比對地址
```

### ethers.js vs viem

| 特性 | ethers.js | viem |
|------|-----------|------|
| API 風格 | 面向對象 | 函數式 |
| TypeScript | 支持 | 原生支持 |
| 簽名方法 | `signTypedData` | `signTypedData` |
| 驗證方法 | `verifyTypedData` | 需手動實現 |
| 學習曲線 | 較平緩 | 稍陡峭 |

---

## 📝 練習

1. 修改 Message 結構，添加 `timestamp` 字段
2. 實現批量驗證多個簽名
3. 添加 nonce 防止重放攻擊
4. 實現簽名過期機制

---

## 下一步

[第五章：實戰應用範例](../05-practical-examples/README.md) - 學習真實世界的 EIP712 應用

---

[返回主目錄](../README.md)

