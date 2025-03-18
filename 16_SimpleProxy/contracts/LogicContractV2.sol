// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LogicContractV2 {
    uint256 public value;

    function setValue(uint256 _value) public {
        value = _value * 2; // 新邏輯：值翻倍
    }

    function getValue() public view returns (uint256) {
        return value;
    }
}