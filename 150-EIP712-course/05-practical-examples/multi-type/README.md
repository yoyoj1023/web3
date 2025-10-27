# 複雜類型和嵌套結構

> 掌握 EIP-712 中的陣列、嵌套結構和動態類型處理

## 📖 為什麼需要複雜類型？

真實世界的區塊鏈應用通常需要處理複雜的數據結構：

- **電商平台**：訂單包含多個商品項目
- **NFT 市場**：NFT 包含多層屬性信息
- **DAO 治理**：提案包含多個操作步驟
- **DeFi 協議**：複雜的交易結構

簡單的基本類型無法滿足這些需求，我們需要：
- ✅ 陣列（多個相同類型的項目）
- ✅ 嵌套結構（結構包含結構）
- ✅ 動態類型（string、bytes）
- ✅ 混合類型（以上的組合）

## 🔤 類型編碼規則總覽

### 1. 基本類型

**類型：** `uint256`, `int256`, `address`, `bool`, `bytes32`

**編碼方式：** 直接編碼

```solidity
uint256 amount = 100;
→ abi.encode(amount)
```

### 2. 動態類型

**類型：** `string`, `bytes`

**編碼方式：** 先哈希

```solidity
string memory name = "Alice";
→ keccak256(bytes(name))
```

**為什麼？**
- 動態類型長度不固定
- 直接編碼會導致哈希結果不一致
- 先哈希確保固定長度

### 3. 靜態陣列

**類型：** `uint256[3]`, `address[2]`（固定長度）

**編碼方式：** 視為多個單獨字段

```solidity
uint256[3] memory values = [1, 2, 3];
→ abi.encode(TYPE_HASH, values[0], values[1], values[2])
```

### 4. 動態陣列

**類型：** `uint256[]`, `address[]`, `Item[]`

**編碼方式：** 先編碼每個元素，再哈希整體

```solidity
Item[] memory items;
→ bytes32[] memory hashes = new bytes32[](items.length);
→ for (uint i = 0; i < items.length; i++) {
      hashes[i] = _hashItem(items[i]);
  }
→ keccak256(abi.encodePacked(hashes))
```

**步驟：**
1. 計算每個元素的哈希
2. 使用 `abi.encodePacked` 打包所有哈希
3. 對整體再哈希一次

### 5. 結構類型

**類型：** `struct Person { ... }`

**編碼方式：** 遞歸計算結構哈希

```solidity
struct Person {
    string name;
    address wallet;
}

→ keccak256(abi.encode(
      PERSON_TYPEHASH,
      keccak256(bytes(person.name)),  // string 先哈希
      person.wallet                   // address 直接編碼
  ))
```

## 📦 範例詳解

### 範例 1：簡單結構（Person）

#### 結構定義

```solidity
struct Person {
    string name;      // 動態類型
    address wallet;   // 基本類型
}
```

#### 類型字串

```
Person(string name,address wallet)
```

**注意：**
- 沒有空格！
- 欄位順序與結構定義一致

#### 類型哈希

```solidity
bytes32 private constant PERSON_TYPEHASH =
    keccak256("Person(string name,address wallet)");
```

#### 結構哈希計算

```solidity
function _hashPerson(Person memory person) 
    internal pure returns (bytes32) 
{
    return keccak256(
        abi.encode(
            PERSON_TYPEHASH,
            keccak256(bytes(person.name)),  // ⚠️ string 要先哈希
            person.wallet                    // address 直接編碼
        )
    );
}
```

#### TypeScript 實現

```typescript
const domain = {
  name: "ComplexTypes",
  version: "1",
  chainId: 1,
  verifyingContract: "0x..."
};

const types = {
  Person: [
    { name: "name", type: "string" },
    { name: "wallet", type: "address" }
  ]
};

const person = {
  name: "Alice",
  wallet: "0x1234567890123456789012345678901234567890"
};

const signature = await signer.signTypedData(domain, types, person);
```

---

### 範例 2：包含陣列（Order with Items[]）

#### 結構定義

```solidity
struct Item {
    string name;
    uint256 price;
    uint256 quantity;
}

struct Order {
    address buyer;
    address seller;
    Item[] items;      // ⚠️ 動態陣列
    uint256 deadline;
    uint256 nonce;
}
```

#### 類型字串

```
Order(address buyer,address seller,Item[] items,uint256 deadline,uint256 nonce)Item(string name,uint256 price,uint256 quantity)
```

**重要規則：**
1. 主類型在前（`Order(...)`）
2. 引用類型在後（`Item(...)`）
3. 多個引用類型按字母順序排列
4. 沒有換行，是完整的一個字串

#### 類型哈希

```solidity
bytes32 private constant ITEM_TYPEHASH =
    keccak256("Item(string name,uint256 price,uint256 quantity)");

bytes32 private constant ORDER_TYPEHASH =
    keccak256(
        "Order(address buyer,address seller,Item[] items,uint256 deadline,uint256 nonce)"
        "Item(string name,uint256 price,uint256 quantity)"
    );
```

#### Item 哈希計算

```solidity
function _hashItem(Item memory item) 
    internal pure returns (bytes32) 
{
    return keccak256(
        abi.encode(
            ITEM_TYPEHASH,
            keccak256(bytes(item.name)),  // string 先哈希
            item.price,
            item.quantity
        )
    );
}
```

#### 陣列哈希計算（關鍵！）

```solidity
function _hashItems(Item[] memory items) 
    internal pure returns (bytes32) 
{
    // 1. 創建哈希陣列
    bytes32[] memory itemHashes = new bytes32[](items.length);
    
    // 2. 計算每個 item 的哈希
    for (uint256 i = 0; i < items.length; i++) {
        itemHashes[i] = _hashItem(items[i]);
    }
    
    // 3. 打包所有哈希並再次哈希
    return keccak256(abi.encodePacked(itemHashes));
}
```

**步驟解釋：**
- 不能直接 `abi.encode(items)`
- 必須先計算每個元素的哈希
- 使用 `abi.encodePacked` 打包（更緊湊）
- 最後再哈希整體

#### Order 哈希計算

```solidity
function _hashOrder(Order memory order) 
    internal pure returns (bytes32) 
{
    return keccak256(
        abi.encode(
            ORDER_TYPEHASH,
            order.buyer,
            order.seller,
            _hashItems(order.items),  // ⚠️ 陣列先計算哈希
            order.deadline,
            order.nonce
        )
    );
}
```

#### TypeScript 實現

```typescript
const types = {
  Order: [
    { name: "buyer", type: "address" },
    { name: "seller", type: "address" },
    { name: "items", type: "Item[]" },      // ⚠️ 注意類型
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" }
  ],
  Item: [                                   // ⚠️ 必須定義
    { name: "name", type: "string" },
    { name: "price", type: "uint256" },
    { name: "quantity", type: "uint256" }
  ]
};

const order = {
  buyer: "0x...",
  seller: "0x...",
  items: [
    { name: "Apple", price: 100n, quantity: 10n },
    { name: "Orange", price: 80n, quantity: 20n }
  ],
  deadline: Math.floor(Date.now() / 1000) + 3600,
  nonce: 0n
};

const signature = await signer.signTypedData(domain, types, order);
```

---

### 範例 3：嵌套結構（NFTAttributes）

#### 結構定義

```solidity
struct Person {
    string name;
    address wallet;
}

struct NFTAttributes {
    string name;
    string description;
    Person creator;        // ⚠️ 嵌套結構
    string[] tags;         // ⚠️ string 陣列
    uint256 timestamp;
}
```

#### 類型字串

```
NFTAttributes(string name,string description,Person creator,string[] tags,uint256 timestamp)Person(string name,address wallet)
```

**規則：**
- 主類型：`NFTAttributes(...)`
- 引用類型：`Person(...)`
- 按字母順序（這裡只有一個引用類型）

#### 類型哈希

```solidity
bytes32 private constant PERSON_TYPEHASH =
    keccak256("Person(string name,address wallet)");

bytes32 private constant NFT_ATTRIBUTES_TYPEHASH =
    keccak256(
        "NFTAttributes(string name,string description,Person creator,string[] tags,uint256 timestamp)"
        "Person(string name,address wallet)"
    );
```

#### String 陣列哈希計算

```solidity
function _hashTags(string[] memory tags) 
    internal pure returns (bytes32) 
{
    // 1. 創建哈希陣列
    bytes32[] memory tagHashes = new bytes32[](tags.length);
    
    // 2. 哈希每個 string
    for (uint256 i = 0; i < tags.length; i++) {
        tagHashes[i] = keccak256(bytes(tags[i]));
    }
    
    // 3. 打包並哈希
    return keccak256(abi.encodePacked(tagHashes));
}
```

#### NFTAttributes 哈希計算

```solidity
function _hashNFTAttributes(NFTAttributes memory attrs)
    internal pure returns (bytes32)
{
    return keccak256(
        abi.encode(
            NFT_ATTRIBUTES_TYPEHASH,
            keccak256(bytes(attrs.name)),           // string
            keccak256(bytes(attrs.description)),    // string
            _hashPerson(attrs.creator),             // ⚠️ 嵌套結構
            _hashTags(attrs.tags),                  // ⚠️ string[]
            attrs.timestamp
        )
    );
}
```

#### TypeScript 實現

```typescript
const types = {
  NFTAttributes: [
    { name: "name", type: "string" },
    { name: "description", type: "string" },
    { name: "creator", type: "Person" },        // ⚠️ 嵌套類型
    { name: "tags", type: "string[]" },
    { name: "timestamp", type: "uint256" }
  ],
  Person: [                                     // ⚠️ 必須定義
    { name: "name", type: "string" },
    { name: "wallet", type: "address" }
  ]
};

const nftAttrs = {
  name: "Cool NFT",
  description: "A very cool NFT",
  creator: {
    name: "Alice",
    wallet: "0x..."
  },
  tags: ["art", "collectible", "rare"],
  timestamp: Math.floor(Date.now() / 1000)
};

const signature = await signer.signTypedData(domain, types, nftAttrs);
```

## 💻 實作說明

查看 [ComplexTypes.sol](./ComplexTypes.sol) 和 [nested-demo.ts](./nested-demo.ts)

### 合約實現關鍵點

1. **為每個結構定義類型哈希**
```solidity
bytes32 private constant PERSON_TYPEHASH = keccak256("Person(...)");
bytes32 private constant ITEM_TYPEHASH = keccak256("Item(...)");
```

2. **實現各自的哈希函數**
```solidity
function _hashPerson(Person memory person) internal pure returns (bytes32);
function _hashItem(Item memory item) internal pure returns (bytes32);
```

3. **處理陣列**
```solidity
function _hashItems(Item[] memory items) internal pure returns (bytes32) {
    bytes32[] memory hashes = new bytes32[](items.length);
    for (uint i = 0; i < items.length; i++) {
        hashes[i] = _hashItem(items[i]);
    }
    return keccak256(abi.encodePacked(hashes));
}
```

4. **組合最終哈希**
```solidity
function _hashOrder(Order memory order) internal pure returns (bytes32) {
    return keccak256(abi.encode(
        ORDER_TYPEHASH,
        order.buyer,
        order.seller,
        _hashItems(order.items),  // 使用陣列哈希
        order.deadline,
        order.nonce
    ));
}
```

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install ethers @openzeppelin/contracts
```

### 2. 運行演示

```bash
# 啟動本地節點
npx hardhat node

# 運行演示
npx ts-node 05-practical-examples/multi-type/nested-demo.ts
```

### 3. 部署合約

```bash
npx hardhat run scripts/deploy-complex-types.ts --network localhost
```

## ⚠️ 常見錯誤

### 1. ❌ 類型字串有多餘空格

```
// ❌ 錯誤：逗號後有空格
"Person(string name, address wallet)"

// ✅ 正確：沒有空格
"Person(string name,address wallet)"
```

### 2. ❌ string/bytes 沒有先哈希

```solidity
// ❌ 錯誤
keccak256(abi.encode(TYPE_HASH, person.name, person.wallet))

// ✅ 正確
keccak256(abi.encode(TYPE_HASH, keccak256(bytes(person.name)), person.wallet))
```

### 3. ❌ 陣列處理錯誤

```solidity
// ❌ 錯誤：直接編碼
keccak256(abi.encode(items))

// ✅ 正確：先計算每個元素哈希
bytes32[] memory hashes = new bytes32[](items.length);
for (uint i = 0; i < items.length; i++) {
    hashes[i] = _hashItem(items[i]);
}
keccak256(abi.encodePacked(hashes))
```

### 4. ❌ 引用類型順序錯誤

```
// ❌ 錯誤：沒按字母順序
"Order(...)Person(...)Item(...)"

// ✅ 正確：Item 在 Person 前（字母順序）
"Order(...)Item(...)Person(...)"
```

### 5. ❌ 忘記定義引用類型

```typescript
// ❌ 錯誤：只定義了 Order
const types = {
  Order: [{ name: "items", type: "Item[]" }, ...]
};

// ✅ 正確：也要定義 Item
const types = {
  Order: [{ name: "items", type: "Item[]" }, ...],
  Item: [...]  // 必須定義
};
```

### 6. ❌ 嵌套結構沒有遞歸計算

```solidity
// ❌ 錯誤：直接編碼嵌套結構
abi.encode(TYPE_HASH, attrs.creator, ...)

// ✅ 正確：先計算嵌套結構的哈希
abi.encode(TYPE_HASH, _hashPerson(attrs.creator), ...)
```

## 🔧 調試技巧

### 1. 比對類型哈希

```typescript
// 前端計算
const typeHash = ethers.keccak256(
  ethers.toUtf8Bytes("Person(string name,address wallet)")
);

// 合約查詢
const contractTypeHash = await contract.PERSON_TYPEHASH();

// 應該相等
console.assert(typeHash === contractTypeHash, "Type hash mismatch!");
```

### 2. 比對 Domain Separator

```typescript
const domainSep = await contract.getDomainSeparator();
console.log("Domain Separator:", domainSep);

// 可以在區塊瀏覽器上比對
```

### 3. 測試簽名恢復

```typescript
const signature = await signer.signTypedData(domain, types, message);
const recoveredAddress = await contract.verifySignature(message, signature);

console.log("Expected:", await signer.getAddress());
console.log("Recovered:", recoveredAddress);
console.assert(recoveredAddress === await signer.getAddress(), "Signature verification failed!");
```

### 4. 逐步驗證哈希

```solidity
// 在合約中添加調試函數
function debugHashItem(Item memory item) external pure returns (bytes32) {
    return _hashItem(item);
}

function debugHashItems(Item[] memory items) external pure returns (bytes32) {
    return _hashItems(items);
}
```

```typescript
// 前端調用
const itemHash = await contract.debugHashItem(item);
console.log("Item hash:", itemHash);

const itemsHash = await contract.debugHashItems(items);
console.log("Items hash:", itemsHash);
```

## 💡 最佳實踐

### 1. 文檔化類型字串

```solidity
/**
 * @notice Order 的 EIP-712 類型字串
 * @dev "Order(address buyer,address seller,Item[] items,uint256 deadline,uint256 nonce)
 *       Item(string name,uint256 price,uint256 quantity)"
 */
bytes32 private constant ORDER_TYPEHASH = ...;
```

### 2. 提供驗證函數

```solidity
/**
 * @notice 驗證 Order 簽名並返回簽名者
 * @param order Order 結構
 * @param signature 簽名
 * @return 簽名者地址
 */
function verifyOrder(Order memory order, bytes memory signature)
    public view returns (address)
{
    bytes32 digest = _hashTypedDataV4(_hashOrder(order));
    return digest.recover(signature);
}
```

### 3. 測試邊界情況

```solidity
// 測試空陣列
function testEmptyArray() public {
    Item[] memory emptyItems;
    bytes32 hash = _hashItems(emptyItems);
    // 應該正常處理
}

// 測試大型陣列
function testLargeArray() public {
    Item[] memory items = new Item[](100);
    // ...
}

// 測試特殊字符
function testSpecialChars() public {
    Person memory person = Person({
        name: "Alice 👩‍💻 (CEO)",
        wallet: address(0x123)
    });
    // ...
}
```

### 4. 使用 OpenZeppelin 庫

```solidity
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ComplexTypes is EIP712 {
    using ECDSA for bytes32;
    
    constructor() EIP712("ComplexTypes", "1") {}
    
    function verify(bytes32 structHash, bytes memory signature)
        internal view returns (address)
    {
        bytes32 digest = _hashTypedDataV4(structHash);
        return digest.recover(signature);
    }
}
```

### 5. Gas 優化

```solidity
// ✅ 使用 calldata 而不是 memory（只讀）
function verifyOrder(Order calldata order, bytes calldata signature)
    public view returns (address)

// ✅ 避免重複計算
function processOrder(Order memory order) internal {
    bytes32 orderHash = _hashOrder(order);  // 只計算一次
    // 使用 orderHash...
}

// ✅ 批量處理
function processOrders(Order[] memory orders) external {
    for (uint i = 0; i < orders.length; i++) {
        _processOrder(orders[i]);
    }
}
```

## 🌍 實際應用案例

### 1. OpenSea Seaport

**複雜度：** ⭐⭐⭐⭐⭐

- 訂單包含多個 offer 和 consideration
- 支援 NFT、ERC20、ERC1155
- 批量交易和部分成交

**結構範例：**
```solidity
struct Order {
    address offerer;
    OfferItem[] offer;
    ConsiderationItem[] consideration;
    // ...
}
```

### 2. Uniswap Permit2

**複雜度：** ⭐⭐⭐⭐

- 批量代幣授權
- 複雜的許可結構
- 支援多種授權類型

**結構範例：**
```solidity
struct PermitBatch {
    PermitDetails[] details;
    address spender;
    uint256 sigDeadline;
}
```

### 3. Gnosis Safe

**複雜度：** ⭐⭐⭐

- 多簽交易結構
- 嵌套操作
- 靈活的執行邏輯

**結構範例：**
```solidity
struct Transaction {
    address to;
    uint256 value;
    bytes data;
    Operation operation;
    // ...
}
```

### 4. DAO 提案系統

**複雜度：** ⭐⭐⭐

- 提案包含多個操作
- 投票權重計算
- 執行邏輯

**結構範例：**
```solidity
struct Proposal {
    address proposer;
    ProposalAction[] actions;
    string description;
    uint256 deadline;
}
```

## 🧪 測試案例

### 基本測試

```typescript
describe("ComplexTypes", () => {
  it("should verify Person signature", async () => {
    const person = { name: "Alice", wallet: alice.address };
    const signature = await alice.signTypedData(domain, types, person);
    const recovered = await contract.verifyPerson(person, signature);
    expect(recovered).to.equal(alice.address);
  });

  it("should handle empty array", async () => {
    const order = { ...baseOrder, items: [] };
    const signature = await alice.signTypedData(domain, types, order);
    // 應該正常處理
  });

  it("should handle nested structures", async () => {
    const nftAttrs = {
      name: "Cool NFT",
      description: "Description",
      creator: { name: "Alice", wallet: alice.address },
      tags: ["art", "collectible"],
      timestamp: Date.now()
    };
    const signature = await alice.signTypedData(domain, types, nftAttrs);
    const recovered = await contract.verifyNFTAttributes(nftAttrs, signature);
    expect(recovered).to.equal(alice.address);
  });
});
```

## 📚 延伸閱讀

### 規範文檔
- [EIP-712 規範](https://eips.ethereum.org/EIPS/eip-712)
- [EIP-712 設計理念](https://medium.com/metamask/eip712-is-coming-what-to-expect-and-how-to-use-it-bb92fd1a7a26)

### 實作參考
- [OpenZeppelin EIP712](https://docs.openzeppelin.com/contracts/4.x/api/utils#EIP712)
- [eth-sig-util](https://github.com/MetaMask/eth-sig-util)
- [Seaport Protocol](https://github.com/ProjectOpenSea/seaport)

### 工具
- [EIP-712 Playground](https://eip712-playground.vercel.app/)
- [TypedDataUtils (eth-sig-util)](https://github.com/MetaMask/eth-sig-util)

## 🎓 練習題

### 初級

1. 實現一個包含 string 陣列的結構
2. 實現一個簡單的嵌套結構
3. 驗證類型哈希計算正確

### 中級

4. 實現 OpenSea 風格的訂單結構
5. 處理多層嵌套（3 層以上）
6. 優化陣列處理的 gas 消耗

### 高級

7. 實現通用的結構哈希計算庫
8. 支援動態添加結構類型
9. 實現鏈下驗證和批量處理

---

[返回第五章目錄](../README.md)

