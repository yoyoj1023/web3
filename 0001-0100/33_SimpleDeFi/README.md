# SimpleDeFi - Simple Lending Contract

此專案包含一個簡單的 DeFi 合約範例，目的是幫助理解最基礎的 DeFi 邏輯，供學習與實驗使用。

## 合約概述

**合約名稱：** `SimpleLending`

此合約提供以下主要功能：
- **存款 (deposit):** 使用者可透過 `deposit()` 將以太幣存入合約。
- **借款 (borrow):** 使用者可以根據自己的存款金額申請借款，透過 `borrow(uint256 amount)` 函數借取指定數量的以太幣。
- **計算利息 (calculateInterest):** 根據借款金額與固定的利率 (此例中為 5%) 計算應繳的利息，函數 `calculateInterest(address user)` 為 view 函數。
- **還款 (repay):** 使用者可透過 `repay()` 還清借款與利息，若多付則退回多餘部分。

## 注意事項

- **安全性警告：**  
  此合約僅供練習與簡單邏輯演示，尚未考量重入攻擊等安全問題，請勿直接用於實際投資或生產環境。

- **基本邏輯：**  
  - 借款功能要求使用者擁有足夠存款作為擔保。  
  - 還款時，合約會首先確認支付的金額是否足夠（包含本金與利息），然後將借款清零並退回溢付金額。

## 如何使用

1. **編譯合約：**  
   使用 Hardhat 或其他 Solidity 編譯器進行編譯：
   ```bash
   npx hardhat compile