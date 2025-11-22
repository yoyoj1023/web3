# Ethernaut Motorbike Challenge

這是 Ethernaut 的 Motorbike 挑戰解決方案，使用 Hardhat 3 Beta 和 viem 庫。

## 挑戰概述

Motorbike 是一個 UUPS (Universal Upgradeable Proxy Standard) 代理合約挑戰。目標是破壞邏輯合約（Engine）。

## 攻擊策略

1. **發現邏輯合約地址**：通過讀取代理合約的 EIP-1967 implementation slot 來找到邏輯合約地址
2. **初始化邏輯合約**：直接呼叫邏輯合約的 `initialize()` 函數，使自己成為 `upgrader`
3. **部署惡意合約**：部署包含 `destroy()` 函數的 `MaliciousEngine` 合約
4. **執行升級並自毀**：直接呼叫邏輯合約的 `upgradeToAndCall()`，升級為 `MaliciousEngine` 並執行 `destroy()`

## 重要發現：EIP-6780 的影響

### 問題描述

在執行攻擊後，雖然交易成功且 `selfdestruct` 被調用，但邏輯合約的代碼並未被永久刪除。區塊鏈瀏覽器顯示：
- "Contract Self Destruct called" - 確認 `selfdestruct` 被執行
- "Contract Self Destructed, but was later reinitalized with new Bytecode" - 合約被重新初始化

### EIP-6780 (Cancun 硬分叉) 的改變

從 Cancun 硬分叉開始，`selfdestruct` 操作碼的行為發生了根本性改變：

> "starting from the Cancun hard fork, the underlying opcode no longer deletes the code and data associated with an account and only transfers its Ether to the beneficiary, **unless executed in the same transaction in which the contract was created**"

**Cancun 之後的行為：**
- ❌ `selfdestruct` **不會刪除合約代碼**（除非在創建合約的同一筆交易中執行）
- ✅ 只會轉移 ETH 餘額給受益人
- ✅ 合約代碼仍然存在於區塊鏈上

### 影響

1. **攻擊邏輯正確**：透過 `delegatecall` 執行 `selfdestruct` 的攻擊邏輯是正確的
2. **實際效果受限**：由於 EIP-6780，合約代碼無法被永久刪除
3. **挑戰完成狀態**：在 Ethernaut 平台上可能顯示為失敗，因為合約代碼仍然存在

### 技術細節

- **執行流程**：
  1. 直接呼叫 `ENGINE_ADDRESS` 的 `upgradeToAndCall()`
  2. `_upgradeToAndCall()` 先更新 storage slot，然後透過 `delegatecall` 呼叫 `MaliciousEngine.destroy()`
  3. `selfdestruct` 在 `ENGINE_ADDRESS` 的上下文中執行
  4. 由於 EIP-6780，代碼未被刪除

- **在舊版本 EVM 中**：此攻擊會成功刪除合約代碼
- **在 Cancun 之後**：攻擊邏輯正確，但無法達到永久刪除代碼的效果

## 項目結構

```
162-ethernaut-motorbike/
├── contracts/
│   ├── Motorbike.sol          # 代理合約和邏輯合約
│   ├── MaliciousEngine.sol    # 惡意合約，包含 destroy() 函數
│   ├── Initializable.sol     # 初始化保護
│   └── Address.sol           # 地址工具函數
├── scripts/
│   └── interact.ts            # 攻擊腳本
├── ignition/
│   └── modules/
│       └── MaliciousEngine.ts # 部署腳本
└── README.md
```

## 使用方法

### 部署 MaliciousEngine 合約

```shell
npx hardhat ignition deploy ignition/modules/MaliciousEngine.ts --network optimismSepolia
```

### 執行攻擊腳本

```shell
npx hardhat run scripts/interact.ts --network optimismSepolia
```

### 環境變數配置

確保 `.env` 文件中包含：
- `OP_SEPOLIA_RPC_URL_API_KEY` - Optimism Sepolia RPC URL
- `PRIVATE_KEY` - 用於發送交易的私鑰

## 合約地址

- **代理合約 (Motorbike)**: `0x34D6eF31626fc904d4aE134C79F36aF3693d5473`
- **邏輯合約 (Engine)**: `0xade0bdEcA29eA8Ae377ea5052390c37A2e979DD0`
- **MaliciousEngine**: 部署後更新 `scripts/interact.ts` 中的地址

## 參考資料

- [EIP-6780: SELFDESTRUCT only in same transaction](https://eips.ethereum.org/EIPS/eip-6780)
- [EIP-1967: Proxy Storage Slots](https://eips.ethereum.org/EIPS/eip-1967)
- [UUPS Proxies](https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies#uups-proxies)

## 注意事項

⚠️ **重要**：由於 EIP-6780 的影響，此攻擊在 Cancun 硬分叉後的網路（包括 Optimism Sepolia）上無法達到永久刪除合約代碼的效果。攻擊邏輯本身是正確的，但受到 EVM 升級的限制。

---

## 原始項目說明

This project showcases a Hardhat 3 Beta project using the native Node.js test runner (`node:test`) and the `viem` library for Ethereum interactions.

To learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
npx hardhat test solidity
npx hardhat test nodejs
```
