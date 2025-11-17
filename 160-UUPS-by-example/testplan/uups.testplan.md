# UUPSUpgradeable.t.sol 測試計畫

## 測試檔案結構

建立 `test/UUPSUpgradeable.t.sol`，使用 Foundry 測試框架，包含以下測試套件：

## 1. 基礎設置 (setUp)

- 部署測試所需的合約實例
- 設置測試用戶（owner, user, attacker）
- 部署 CounterV1UUPS、CounterV2UUPS、CounterV1UUPSInitializable、CounterV2UUPSInitializable
- 部署 UUPSHelper 工具合約

## 2. UUPSProxy 代理合約測試

### 2.1 代理部署測試

- `test_ProxyDeployment()` - 測試使用有效實現地址部署代理
- `test_ProxyDeploymentWithInvalidImplementation()` - 測試使用無效地址（非合約）部署應失敗
- `test_ProxyDeploymentWithZeroAddress()` - 測試使用零地址部署應失敗

### 2.2 代理轉發測試

- `test_ProxyForwardsCalls()` - 測試代理正確轉發調用到實現合約
- `test_ProxyReceiveEther()` - 測試代理可以接收以太幣
- `test_ProxyFallback()` - 測試 fallback 函數正確工作

## 3. Proxiable 基類測試

### 3.1 UUID 驗證

- `test_ProxiableUUID()` - 測試 proxiableUUID() 返回正確的 EIP-1822 UUID
- `test_ProxiableUUIDMatchesStandard()` - 驗證 UUID 等於 `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`

## 4. CounterV1UUPS / CounterV2UUPS 測試（Constructor 版本）

### 4.1 基本功能測試

- `test_CounterV1UUPS_Inc()` - 測試 inc() 函數增加計數
- `test_CounterV2UUPS_Inc()` - 測試 V2 的 inc() 函數
- `test_CounterV2UUPS_Dec()` - 測試 V2 的 dec() 函數
- `test_CounterV2UUPS_IncAndDec()` - 測試 V2 的 inc 和 dec 組合

### 4.2 通過代理調用測試

- `test_Proxy_CounterV1UUPS_Inc()` - 通過代理調用 inc()
- `test_Proxy_CounterV1UUPS_Count()` - 通過代理讀取 count
- `test_Proxy_CounterV2UUPS_IncAndDec()` - 通過代理測試 V2 功能

### 4.3 升級測試

- `test_UpgradeFromV1ToV2()` - 測試從 V1 升級到 V2
- `test_UpgradePreservesState()` - 測試升級後狀態保持不變
- `test_UpgradeAddsNewFunction()` - 測試升級後可以使用新函數（dec）
- `test_UpgradeEventEmitted()` - 測試升級時發出 CodeUpdated 事件

### 4.4 權限控制測試

- `test_UpgradeOnlyOwner()` - 測試只有 owner 可以升級
- `test_UpgradeFailsIfNotOwner()` - 測試非 owner 升級應失敗
- `test_UpgradeFailsWithZeroAddress()` - 測試使用零地址升級應失敗
- `test_UpgradeFailsWithNonContract()` - 測試使用非合約地址升級應失敗
- `test_UpgradeFailsWithWrongUUID()` - 測試使用不符合 UUPS 標準的合約升級應失敗

## 5. CounterV1UUPSInitializable / CounterV2UUPSInitializable 測試

### 5.1 初始化測試

- `test_InitializeOnce()` - 測試可以成功初始化一次
- `test_InitializeFailsTwice()` - 測試初始化兩次應失敗
- `test_InitializeSetsOwner()` - 測試初始化正確設置 owner
- `test_InitializeCanBeCalledByAnyone()` - 測試任何人都可以調用 initialize（但只能一次）

### 5.2 通過代理初始化測試

- `test_Proxy_Initialize()` - 通過代理調用 initialize
- `test_Proxy_InitializeThenUse()` - 初始化後使用合約功能

### 5.3 可初始化版本的升級測試

- `test_Initializable_UpgradeFromV1ToV2()` - 測試可初始化版本的升級
- `test_Initializable_UpgradePreservesState()` - 測試升級後狀態保持

## 6. 完整升級流程測試

### 6.1 端到端測試

- `test_FullUpgradeFlow()` - 完整流程：部署 V1 → 使用 → 升級到 V2 → 使用新功能
- `test_MultipleUpgrades()` - 測試多次升級（V1 → V2 → 可能的 V3）
- `test_UpgradeMaintainsData()` - 測試升級後所有數據保持不變

### 6.2 狀態一致性測試

- `test_StateConsistencyAfterUpgrade()` - 驗證升級後 count 和 owner 保持一致
- `test_UpgradeDoesNotResetCount()` - 確保升級不會重置計數器

## 7. UUPSHelper 工具合約測試

- `test_Helper_GetImplementation()` - 測試獲取實現地址
- `test_Helper_IsProxiable()` - 測試檢查合約是否符合 UUPS 標準
- `test_Helper_IsProxiableReturnsFalseForNonProxiable()` - 測試非 UUPS 合約返回 false

## 8. 邊界情況和錯誤處理測試

### 8.1 錯誤情況

- `test_RevertWhenUpgradingToSameImplementation()` - 測試升級到相同實現（如果適用）
- `test_RevertWhenCallingUninitialized()` - 測試未初始化的可初始化合約（如果適用）

### 8.2 存儲槽測試

- `test_StorageSlotCorrect()` - 驗證存儲槽使用正確的 keccak256("PROXIABLE")
- `test_StorageSlotDoesNotCollide()` - 確保存儲槽不會與其他變量衝突

## 9. Gas 優化測試（可選）

- `test_GasUsageComparison()` - 比較不同操作的 gas 使用量（可選）

## 測試工具函數

- `_deployProxyWithImplementation()` - 輔助函數：部署代理和實現
- `_getImplementationAddress()` - 輔助函數：獲取當前實現地址
- `_assertImplementation()` - 輔助函數：斷言實現地址

## 測試覆蓋目標

- 所有公開函數
- 所有修飾符（onlyOwner, onlyOnce）
- 所有錯誤情況（require 語句）
- 所有事件發射
- 代理轉發機制
- 升級流程完整性