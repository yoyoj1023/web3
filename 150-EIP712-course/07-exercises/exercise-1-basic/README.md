# 練習 1：投票簽名系統（初級）

> 實現一個鏈下簽名、鏈上驗證的投票系統

## 📋 需求說明

你需要實現一個去中心化投票系統，具備以下功能：

### 功能需求

1. **創建提案**
   - 任何人都可以創建提案
   - 提案包含：ID、標題、描述、截止時間

2. **鏈下簽名投票**
   - 使用者使用 EIP712 簽署投票
   - 投票包含：提案 ID、支持/反對、投票者地址、nonce

3. **提交簽名**
   - 任何人都可以提交有效簽名到鏈上
   - 批量提交多個簽名（gas 優化）

4. **防護機制**
   - 每個地址只能對同一提案投一次票
   - 過期的投票無效
   - 重複的簽名無效

5. **結果統計**
   - 查詢提案的支持/反對票數
   - 查詢某地址是否已投票

## 🎯 學習目標

完成此練習後，你將能夠：

- [x] 定義和使用 EIP712 結構化數據
- [x] 在 Solidity 中驗證 EIP712 簽名
- [x] 使用 nonce 防止重放攻擊
- [x] 在前端生成和提交簽名
- [x] 處理批量操作以優化 gas

## 📐 數據結構

### Proposal（提案）

```solidity
struct Proposal {
    uint256 id;
    string title;
    string description;
    uint256 deadline;
    uint256 yesVotes;
    uint256 noVotes;
}
```

### Vote（投票）

```solidity
struct Vote {
    uint256 proposalId;  // 提案 ID
    bool support;        // true=支持, false=反對
    address voter;       // 投票者地址
    uint256 nonce;       // 防止重放
}
```

## 💡 提示

### 1. Domain Separator

```solidity
DOMAIN_SEPARATOR = keccak256(
    abi.encode(
        DOMAIN_TYPEHASH,
        keccak256(bytes("VotingSystem")),
        keccak256(bytes("1")),
        block.chainid,
        address(this)
    )
);
```

### 2. Type Hash

```solidity
VOTE_TYPEHASH = keccak256(
    "Vote(uint256 proposalId,bool support,address voter,uint256 nonce)"
);
```

### 3. 驗證邏輯

```solidity
function verify(Vote memory vote, bytes memory signature) {
    // 1. 檢查提案是否存在且未過期
    // 2. 檢查是否已投票
    // 3. 計算 struct hash
    // 4. 計算 digest
    // 5. 恢復簽名者地址
    // 6. 驗證地址匹配
}
```

### 4. Nonce 管理

```solidity
mapping(address => uint256) public nonces;

// 使用時
require(nonces[voter] == vote.nonce, "Invalid nonce");
nonces[voter]++;
```

## 🏁 起始代碼

請查看 [starter/VotingSystem.sol](./starter/VotingSystem.sol)

合約框架已經提供，你需要實現：

- [ ] `verifyVote()` - 驗證單個投票簽名
- [ ] `submitVote()` - 提交單個投票
- [ ] `submitVotes()` - 批量提交投票
- [ ] `_recordVote()` - 記錄投票內部邏輯

前端部分 [starter/vote-frontend.ts](./starter/vote-frontend.ts)：

- [ ] 生成投票簽名
- [ ] 提交簽名到合約
- [ ] 查詢投票結果

## ✅ 檢查清單

### 功能實現

- [ ] 可以創建提案
- [ ] 可以簽署投票
- [ ] 可以提交簽名
- [ ] 可以批量提交
- [ ] 可以查詢結果

### 安全性

- [ ] 防止重複投票
- [ ] 防止過期投票
- [ ] 防止重放攻擊（nonce）
- [ ] 簽名驗證正確
- [ ] 地址恢復正確

### 代碼質量

- [ ] 所有函數都有註釋
- [ ] 使用事件記錄重要操作
- [ ] 錯誤處理完善
- [ ] 變量命名清晰

### 測試

- [ ] 所有測試通過
- [ ] 邊界條件測試
- [ ] 負面測試（預期失敗的案例）

## 🧪 測試

運行測試：

```bash
cd 150-EIP712
npx hardhat test test/VotingSystem.test.ts
```

測試案例包括：

1. ✅ 創建提案
2. ✅ 生成有效簽名
3. ✅ 提交有效投票
4. ✅ 拒絕無效簽名
5. ✅ 拒絕重複投票
6. ✅ 拒絕過期投票
7. ✅ 批量提交投票
8. ✅ 正確統計結果

## 📊 評分標準

| 項目 | 分數 | 說明 |
|------|------|------|
| 基本功能 | 40 | 創建提案、簽名、提交、查詢 |
| 安全性 | 30 | 防重放、防過期、簽名驗證 |
| Gas 優化 | 15 | 批量操作、存儲優化 |
| 代碼質量 | 15 | 註釋、結構、可讀性 |
| **總分** | **100** | |

### 及格：60 分
### 良好：80 分
### 優秀：90 分

## 💪 挑戰

完成基本要求後，可以嘗試：

### 挑戰 1：委託投票

允許使用者委託投票權給其他地址。

```solidity
struct DelegatedVote {
    uint256 proposalId;
    bool support;
    address voter;        // 原始投票者
    address delegate;     // 委託人
    uint256 nonce;
}
```

### 挑戰 2：投票權重

根據代幣持有量設置投票權重。

```solidity
function getVotingPower(address voter) public view returns (uint256);
```

### 挑戰 3：提案狀態管理

實現提案的不同狀態：待定、活躍、通過、拒絕、執行。

```solidity
enum ProposalState {
    Pending,
    Active,
    Defeated,
    Succeeded,
    Executed
}
```

## 🔍 常見問題

### Q1: 如何調試簽名驗證失敗？

```solidity
// 添加調試函數
function getVoteDigest(Vote memory vote) public view returns (bytes32) {
    return keccak256(
        abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            getVoteStructHash(vote)
        )
    );
}
```

然後在前端對比：
```typescript
const contractDigest = await contract.getVoteDigest(vote);
const frontendDigest = ethers.TypedDataEncoder.hash(domain, types, vote);
console.log("一致？", contractDigest === frontendDigest);
```

### Q2: Nonce 應該在哪裡遞增？

```solidity
// ✅ 正確：在驗證成功後，記錄投票前
function submitVote(Vote memory vote, bytes memory signature) public {
    require(verifyVote(vote, signature), "Invalid signature");
    nonces[vote.voter]++;  // 驗證通過後立即遞增
    _recordVote(vote);
}
```

### Q3: 批量操作如何優化 gas？

```solidity
// 提示：
// 1. 使用 calldata 而不是 memory
// 2. 批量檢查，單次失敗不影響其他
// 3. 使用事件記錄，而不是返回值
function submitVotes(
    Vote[] calldata votes,
    bytes[] calldata signatures
) external {
    for (uint i = 0; i < votes.length; i++) {
        // 使用 try-catch 避免單個失敗影響整體
    }
}
```

## 📚 相關章節

如果遇到困難，複習這些章節：

- [第一章：概念與心智模型](../../01-fundamentals/README.md)
- [第二章：編碼流程](../../02-encoding-flow/README.md)
- [第三章：簽名組件](../../03-signature-components/README.md)
- [第四章：Hello World](../../04-hello-world/README.md)

## 🎓 學習建議

1. **先理解需求**：仔細閱讀需求，畫出數據流程圖
2. **分步實現**：不要想一次完成所有功能
3. **頻繁測試**：實現一個功能就測試一個
4. **參考範例**：第四章的 SimpleMessage 是很好的參考
5. **最後優化**：功能正確後再考慮 gas 優化

## ⏱️ 預估時間

- 理解需求：15 分鐘
- 實現合約：45 分鐘
- 實現前端：30 分鐘
- 測試調試：30 分鐘
- **總計：2 小時**

---

## 開始吧！ 🚀

```bash
cd starter/
# 閱讀起始代碼
# 實現 TODO 部分
# 運行測試
# 對比解答
```

祝你好運！如果遇到困難，記得查看提示和參考前面的章節。

---

[返回練習列表](../README.md) | [查看參考解答](./solution/README.md)

