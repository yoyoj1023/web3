// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@account-abstraction/contracts/interfaces/UserOperation.sol";

contract SimpleEntryPoint {
    mapping(address => mapping(uint192 => uint256)) public nonceSequenceNumber;
    mapping(address => uint256) public balanceOf;
    
    function getNonce(address sender, uint192 key) public view returns (uint256 nonce) {
        return nonceSequenceNumber[sender][key] | (uint256(key) << 64);
    }
    
    function depositTo(address account) public payable {
        balanceOf[account] += msg.value;
    }
    
    function handleOps(UserOperation[] calldata ops, address payable beneficiary) external {
        // 簡化的實現
        for (uint256 i = 0; i < ops.length; i++) {
            UserOperation calldata op = ops[i];
            
            // 檢查帳戶是否需要創建
            if (op.initCode.length > 0) {
                _createAccount(op);
            }
            
            // 增加 nonce
            nonceSequenceNumber[op.sender][0]++;
            
            // 執行調用
            if (op.callData.length > 0) {
                (bool success,) = op.sender.call(op.callData);
                require(success, "call failed");
            }
        }
    }
    
    function _createAccount(UserOperation calldata op) internal {
        address factory = address(bytes20(op.initCode[0:20]));
        bytes memory initCallData = op.initCode[20:];
        
        (bool success,) = factory.call(initCallData);
        require(success, "account creation failed");
    }
} 