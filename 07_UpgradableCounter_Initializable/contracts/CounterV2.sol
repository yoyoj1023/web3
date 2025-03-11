// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CounterV1.sol";

contract CounterV2 is CounterV1 {
    // 新增一個減少計數的功能
    function decrement() public {
        require(_count > 0, "Counter: count cannot be negative");
        _count -= 1;
    }
}