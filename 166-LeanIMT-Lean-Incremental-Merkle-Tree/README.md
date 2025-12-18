**LeanIMT (Lean Incremental Merkle Tree)** 是一種經過優化的「增量默克爾樹」（Incremental Merkle Tree, IMT），專門為了提高區塊鏈與零知識證明（Zero-Knowledge Proofs, ZKPs）應用的效率而設計。

它最著名的應用場景是在 **Semaphore V4** 協議中，由 Privacy & Scaling Explorations (PSE) 團隊開發並推廣。

以下是 LeanIMT 的核心概念、與傳統 IMT 的差異、運作原理及其實作概念。

---

### 1. 核心概念：為什麼需要 LeanIMT？

傳統的 **默克爾樹 (Merkle Tree)** 通常是「滿二元樹」（Full Binary Tree），這意味著即使某些節點沒有資料，也必須用「零值雜湊」（Zero Hashes）來填充，以維持樹的完整高度。

**傳統 IMT 的缺點：**
*   **計算浪費：** 當樹很大但資料很稀疏時，你需要花費大量的計算資源去雜湊那些「零值」（Zero values）。
*   **結構僵化：** 通常需要預先定義樹的深度（例如深度 20 或 32），這限制了靈活性。

**LeanIMT 的改進：**
LeanIMT 去除了這些「零值雜湊」。它的核心哲學是：**如果一個節點沒有右邊的兄弟節點（Right Sibling），那麼這個節點的值就不需要進行雜湊計算，直接「繼承」左邊子節點的值作為父節點的值。**

### 2. LeanIMT vs. 傳統 IMT

| 特性 | 傳統 IMT (Standard IMT) | LeanIMT (Lean Incremental Merkle Tree) |
| :--- | :--- | :--- |
| **空節點處理** | 使用預定義的「零值」(Zero Hashes) 填充並參與雜湊運算。 | **不使用零值**。若無右兄弟，直接將左節點值「往上搬」。 |
| **雜湊次數** | 每次插入都需要計算從葉子到根的所有雜湊（包括與零值的雜湊）。 | **顯著減少**。只有當「左右節點都存在」時才進行雜湊。 |
| **樹的深度** | 通常是固定的（Fixed Depth）。 | 可以是 **動態的**，隨葉子數量增長。 |
| **效率** | 隨著深度增加，插入成本固定且較高。 | 插入成本較低，證明生成（Proof Generation）更快。 |

### 3. 運作原理圖解

假設我們要建立一個簡單的樹，目前有兩個葉子節點 `L1`, `L2`。我們現在要插入 `L3`。

#### 傳統 IMT (假設深度為 2)
```text
      Root
     /    \
   H1      H2
  /  \    /  \
L1   L2  L3  Zero (需要與零值雜湊!)
```
*   `H2 = Hash(L3, Zero)` <- 這裡多了一次計算

#### LeanIMT
```text
      Root
     /    \
   H1      L3  <-- 注意這裡！
  /  \
L1   L2
```
*   當插入 `L3` 時，因為它還沒有右邊的兄弟（L4 還沒出現），LeanIMT **不會** 去找一個零值來跟它 Hash。
*   `L3` 直接「晉升」到上一層。
*   Root 的計算變成：`Hash(H1, L3)`。
*   **優點：** 省略了 `Hash(L3, Zero)` 這個步驟。當樹很深時，這種「省略」能節省大量 Gas (在 Solidity 中) 和證明生成時間 (在 Circom/ZK 中)。

### 4. 關鍵演算法邏輯

在 LeanIMT 中，計算路徑（Path）和根（Root）的邏輯如下：

1.  **插入 (Insert):**
    *   將新葉子加入最右側。
    *   更新路徑上的節點。
2.  **雜湊規則 (Hashing Rule):**
    *   對於每一層（Level）：
        *   如果有 **一對** 節點 (左, 右) -> 計算 `Hash(Left, Right)` 傳給上一層。
        *   如果是 **單個** 節點 (只有左) -> **不進行 Hash**，直接將該節點值傳給上一層。

### 5. 實作參考 (概念程式碼)

目前 LeanIMT 主要在 TypeScript (`@zk-kit/lean-imt`) 和 Solidity (`@zk-kit/incremental-merkle-tree.sol`) 中有實作。

如果你想用 TypeScript 體驗它的邏輯：

```typescript
import { LeanIMT } from "@zk-kit/lean-imt"
import { poseidon } from "circomlibjs" // 假設使用 Poseidon Hash

// 1. 初始化一個 LeanIMT，傳入雜湊函數
const tree = new LeanIMT(poseidon)

// 2. 插入葉子
tree.insert(BigInt(1))
tree.insert(BigInt(2))

// 此時樹有兩個葉子，Root = Hash(1, 2)

tree.insert(BigInt(3))
// 插入第三個葉子。
// 在傳統 IMT，這會涉及 3 與 Zero 的 Hash。
// 在 LeanIMT，3 直接被提升，Root = Hash(Hash(1, 2), 3)

// 3. 生成默克爾證明 (Merkle Proof)
const proof = tree.generateProof(0) // 證明索引 0 的葉子存在
```

### 6. 應用場景

LeanIMT 特別適合以下場景：
1.  **鏈上隱私應用 (On-chain Privacy):** 如 Semaphore V4，因為減少了雜湊計算，驗證證明的 Gas 費用會降低。
2.  **大型匿名群體 (Large Anonymity Sets):** 當群體人數增長時，樹可以動態擴展，不需要一開始就預留巨大的深度（節省儲存空間）。
3.  **ZK-Rollups:** 用於狀態樹的維護，減少電路（Circuit）中的約束數量（Constraints）。

### 總結
**LeanIMT** 就是一個「去除了冗餘零值計算」的默克爾樹。它更「瘦」（Lean），在葉子節點數量不是 2 的冪次時，它比傳統 IMT 更快、更省空間，是現代 ZK 協議中的主流數據結構選擇之一。