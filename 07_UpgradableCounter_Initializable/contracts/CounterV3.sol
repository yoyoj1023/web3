// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CounterV2.sol";

contract CounterV3 is CounterV2 {
    // 重寫 increment 函數，每次增加2
    // 再添加一次 virtual，使得未來 CounterV4 可以再次複寫
    // 若複寫函數沒添加 override 關鍵字，編譯器會報錯
    function increment() public virtual override {
        _count += 2;
    }
}