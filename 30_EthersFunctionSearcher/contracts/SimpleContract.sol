// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleContract {
    uint256 public value;

    event GasRemaining(uint256 gas);

    function setValue(uint256 _value) public {
        value = _value;
    }

    function checkGas() public {
        uint256 gasBefore = gasleft();
        emit GasRemaining(gasBefore); // 紀錄目前的剩餘 gas
    }
}