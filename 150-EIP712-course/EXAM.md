# EIP712 課程考卷

> **考試時間**：90 分鐘  
> **總分**：100 分  
> **及格標準**：70 分

---

## 📝 考試說明

- **選擇題**：共 25 題，每題 3 分，共 75 分
- **問答題**：共 5 題，每題 5 分，共 25 分
- 選擇題請選出最適當的答案
- 問答題請簡要回答，重點清晰即可

---

## 一、選擇題（每題 3 分，共 75 分）

### 第一部分：基礎概念（1-6 題）

**1. EIP712 的主要目的是什麼？**
   - A. 提高交易速度
   - B. 降低 Gas 費用
   - C. 提供結構化數據簽名，提升用戶體驗和安全性
   - D. 實現跨鏈通信

**2. 相比於傳統的 `eth_sign`，EIP712 的主要優勢是？**
   - A. 簽名速度更快
   - B. 用戶可以清楚看到簽名的結構化數據內容
   - C. 不需要私鑰
   - D. 可以在任何區塊鏈上使用

**3. EIP191 和 EIP712 的關係是？**
   - A. EIP712 完全取代了 EIP191
   - B. EIP712 是 EIP191 的一種特定應用，使用 `0x01` 作為版本前綴
   - C. 兩者完全無關
   - D. EIP191 只適用於合約，EIP712 只適用於 EOA

**4. 下列哪個不是使用 EIP712 的主要場景？**
   - A. Gasless 交易（Meta-transaction）
   - B. ERC20 Permit 授權
   - C. 智能合約部署
   - D. NFT 白名單簽名

**5. EIP712 簽名最終會形成一個什麼？**
   - A. 交易 Hash
   - B. 消息摘要（Digest）
   - C. 區塊 Hash
   - D. 合約地址

**6. Domain Separator 的主要作用是？**
   - A. 加快簽名速度
   - B. 防止簽名在不同 DApp 或鏈之間被重放
   - C. 降低 Gas 消耗
   - D. 加密私鑰

### 第二部分：編碼流程（7-12 題）

**7. EIP712 編碼流程的正確順序是？**
   - A. Type Hash → Domain Separator → Struct Hash → Digest
   - B. Domain Separator → Type Hash → Struct Hash → Digest
   - C. Struct Hash → Type Hash → Domain Separator → Digest
   - D. Digest → Domain Separator → Type Hash → Struct Hash

**8. Type Hash 是如何計算的？**
   - A. `keccak256(abi.encode(struct))`
   - B. `keccak256(abi.encodePacked(struct))`
   - C. `keccak256(typeString)`，其中 typeString 是結構的字符串表示
   - D. `sha256(typeString)`

**9. Domain Separator 通常包含以下哪些信息？（選擇最完整的答案）**
   - A. name, version
   - B. name, version, chainId
   - C. name, version, chainId, verifyingContract
   - D. name, version, chainId, verifyingContract, salt

**10. 計算最終 Digest 時使用的前綴是？**
   - A. `\x19\x00`
   - B. `\x19\x01`
   - C. `\x19Ethereum Signed Message:\n`
   - D. `\x19\x02`

**11. 對於嵌套結構（nested struct），Type Hash 的計算需要？**
   - A. 只計算頂層結構
   - B. 按照依賴順序遞迴計算所有結構
   - C. 忽略嵌套結構
   - D. 只計算最內層結構

**12. `hashStruct` 的計算公式是？**
   - A. `keccak256(typeHash)`
   - B. `keccak256(abi.encode(struct))`
   - C. `keccak256(abi.encode(typeHash, encodeData(struct)))`
   - D. `keccak256(abi.encodePacked(typeHash, struct))`

### 第三部分：簽名組件（13-17 題）

**13. ECDSA 簽名包含哪三個組件？**
   - A. x, y, z
   - B. v, r, s
   - C. a, b, c
   - D. hash, signature, address

**14. 簽名中的 `v` 值的主要作用是？**
   - A. 表示簽名的版本
   - B. 作為恢復公鑰時的恢復標識符
   - C. 簽名的校驗和
   - D. 表示使用的橢圓曲線類型

**15. 標準的 `v` 值通常是？**
   - A. 0 或 1
   - B. 27 或 28
   - C. 1 或 2
   - D. 0 或 255

**16. 什麼是簽名可塑性（Signature Malleability）問題？**
   - A. 簽名會隨時間改變
   - B. 對於同一個消息，可以構造出多個有效的簽名
   - C. 簽名無法被驗證
   - D. 簽名會洩漏私鑰

**17. Solidity 中，從簽名恢復地址使用哪個函數？**
   - A. `verify()`
   - B. `recover()`
   - C. `ecrecover()`
   - D. `getAddress()`

### 第四部分：實戰應用（18-21 題）

**18. ERC20 Permit（EIP-2612）的主要優勢是？**
   - A. 降低轉帳費用
   - B. 允許用戶在一筆交易中完成授權和轉帳，無需預先調用 `approve()`
   - C. 提高交易速度
   - D. 增加代幣供應量

**19. Meta-transaction（ERC-2771）允許？**
   - A. 免費發送任何交易
   - B. 用戶簽署交易意圖，由第三方代為支付 Gas 費
   - C. 跨鏈交易
   - D. 匿名交易

**20. 在 EIP712 中，`nonce` 欄位的主要作用是？**
   - A. 提高簽名安全性
   - B. 防止重放攻擊
   - C. 加快交易確認
   - D. 降低 Gas 費用

**21. 在 TypeScript 中使用 ethers.js 簽署 EIP712 消息時，應該使用？**
   - A. `signer.signMessage()`
   - B. `signer.signTransaction()`
   - C. `signer._signTypedData()`
   - D. `signer.sign()`

### 第五部分：安全性（22-25 題）

**22. 防止重放攻擊的最佳實踐包括？（選擇最完整的答案）**
   - A. 使用 nonce
   - B. 使用 chainId 和 verifyingContract
   - C. 使用 deadline（截止時間）
   - D. 以上皆是

**23. 以下哪種情況可能導致安全問題？**
   - A. 沒有在 Domain Separator 中包含 chainId
   - B. 沒有驗證簽名者地址
   - C. 沒有使用 nonce 或 deadline
   - D. 以上皆是

**24. 前端顯示 EIP712 簽名請求時，應該？**
   - A. 隱藏所有細節，讓用戶快速簽署
   - B. 清楚顯示所有字段的含義和值
   - C. 只顯示金額
   - D. 只顯示接收地址

**25. 以下哪個不是 EIP712 的安全優勢？**
   - A. 用戶可以看到結構化數據內容
   - B. 防止盲簽攻擊
   - C. 完全消除重放攻擊風險（無需其他措施）
   - D. 域分離防止跨 DApp 簽名重用

---

## 二、問答題（每題 5 分，共 25 分）

**1. 請簡要說明 EIP712 的四個核心編碼步驟是什麼？（列出名稱即可）**

```
你的答案：







```

**2. 為什麼需要 Domain Separator？它如何防止重放攻擊？**

```
你的答案：











```

**3. 請解釋什麼是「Gasless 交易」？EIP712 在其中扮演什麼角色？**

```
你的答案：











```

**4. 在實作 EIP712 簽名驗證的智能合約時，需要注意哪些安全要點？（至少列出 3 點）**

```
你的答案：











```

**5. 請描述一個真實的 DApp 場景，說明如何使用 EIP712 來改善用戶體驗。**

```
你的答案：











```

---

## 📊 評分標準

### 選擇題評分
- 答案完全正確：3 分
- 答案錯誤：0 分

### 問答題評分
- 第 1 題：正確列出四個步驟（5 分）
- 第 2-5 題：
  - 概念理解正確且完整：5 分
  - 概念理解正確但不夠完整：3-4 分
  - 概念部分正確：1-2 分
  - 答案錯誤或未作答：0 分

---

## ✅ 參考答案

<details>
<summary>點擊查看選擇題答案</summary>

1. C
2. B
3. B
4. C
5. B
6. B
7. B
8. C
9. C（D 也可接受，salt 是可選的）
10. B
11. B
12. C
13. B
14. B
15. B
16. B
17. C
18. B
19. B
20. B
21. C
22. D
23. D
24. B
25. C

</details>

<details>
<summary>點擊查看問答題參考答案</summary>

**問答題 1 參考答案：**
1. Domain Separator 構建
2. Type Hash 計算
3. Struct Hash 生成
4. Digest 最終計算

**問答題 2 參考答案：**
Domain Separator 包含了 DApp 名稱、版本、鏈 ID 和驗證合約地址等信息。它透過將簽名綁定到特定的 DApp 和區塊鏈網路，防止簽名在不同應用或不同鏈之間被重放使用。即使消息內容相同，不同的 Domain 會產生不同的最終簽名。

**問答題 3 參考答案：**
Gasless 交易（Meta-transaction）允許用戶簽署交易意圖，但無需自己支付 Gas 費。第三方（中繼者）代為提交交易並支付 Gas。EIP712 用於簽署結構化的交易意圖，讓用戶清楚知道自己授權了什麼操作，中繼者將簽名和參數提交給智能合約進行驗證和執行。

**問答題 4 參考答案：**
- 必須驗證簽名者地址是否符合預期
- 使用 nonce 或其他機制防止重放攻擊
- 設置 deadline（截止時間）防止舊簽名被使用
- 在 Domain Separator 中包含 chainId 和 verifyingContract
- 使用 `ecrecover` 時檢查返回地址不為零地址
- 考慮簽名可塑性問題，必要時檢查 s 值

**問答題 5 參考答案：**
範例：NFT 市場的白名單鑄造
- 場景：用戶需要在白名單期間鑄造 NFT
- 傳統方式：需要在合約中存儲所有白名單地址（高 Gas 成本）
- EIP712 方案：項目方用私鑰為每個白名單用戶簽署一個許可，用戶在鑄造時提交簽名
- 優勢：節省大量 Gas，用戶體驗更好，項目方可以靈活管理白名單

其他合理場景也可接受（如：投票系統、DAO 提案、鏈下訂單簿等）

</details>

---

**祝考試順利！** 🎓

