// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CounterV1 is Initializable {
    uint256 private _count;

    // 採用 initialize() 取代建構子
    function initialize() public initializer {
        _count = 0;
    }

    // virtual 關鍵字用於函數宣告時，表示該函數可以在繼承的子合約中被重新覆寫（override）。
    function increment() public virtual {
        _count += 1;
    }

    function getCount() public view returns (uint256) {
        return _count;
    }
}