// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title PermitToken
 * @notice 實現 EIP-2612 的 ERC20 代幣，支援 gasless 授權
 * @dev 繼承 OpenZeppelin 的 ERC20Permit 擴展
 */
contract PermitToken is ERC20, ERC20Permit {
    /**
     * @notice 建構子 - 初始化代幣並鑄造初始供應量
     * @param initialSupply 初始代幣供應量（最小單位）
     */
    constructor(uint256 initialSupply) 
        ERC20("PermitToken", "PMTK") 
        ERC20Permit("PermitToken") 
    {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @notice 鑄造新代幣（僅供示範）
     * @param to 接收者地址
     * @param amount 鑄造數量
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice 使用 permit 進行 gasless 轉帳
     * @dev 這是一個便利函數，結合了 permit 和 transferFrom
     * @param owner 代幣擁有者
     * @param spender 被授權者
     * @param value 授權金額
     * @param deadline 簽名過期時間
     * @param v 簽名 v 值
     * @param r 簽名 r 值  
     * @param s 簽名 s 值
     * @param to 接收者
     */
    function permitAndTransfer(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s,
        address to
    ) external {
        // 1. 執行 permit（驗證簽名並授權）
        permit(owner, spender, value, deadline, v, r, s);
        
        // 2. 使用授權進行轉帳
        transferFrom(owner, to, value);
    }

    /**
     * @notice 獲取使用者當前的 nonce
     * @param owner 使用者地址
     * @return 當前 nonce 值
     */
    function getNonce(address owner) external view returns (uint256) {
        return nonces(owner);
    }

    /**
     * @notice 獲取 DOMAIN_SEPARATOR
     * @return EIP-712 domain separator
     */
    function getDomainSeparator() external view returns (bytes32) {
        return DOMAIN_SEPARATOR();
    }
}

