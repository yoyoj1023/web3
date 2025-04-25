// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Delegate {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function pwn() public {
        owner = msg.sender;
    }
}

contract Delegation {
    address public owner;
    Delegate delegate;

    constructor(address _delegateAddress) {
        delegate = Delegate(_delegateAddress);
        owner = msg.sender;
    }

    function getData() public pure returns (bytes memory){
        return (msg.data);
    }

    /*
      this 本身代表當前合約的實例。單獨使用 this; 並不會改變合約的任何狀態變數，但它會消耗一些 gas。

      在早期的 Solidity 版本中，如果 fallback() 函式沒有消耗足夠的 gas，交易可能會被 revert。this; 可以確保消耗一定的 gas，避免這種情況。

      更重要的是，在某些情況下，如果 fallback() 函式沒有修改任何儲存（storage），Solidity 編譯器可能會優化掉某些必要的程式碼，導致意外的行為。this; 可以被視為一種簡單的狀態變更（雖然實際上沒有改變任何值），以防止編譯器過度優化。

      在現代 Solidity 版本中，編譯器優化和 gas 處理機制已經有所改進，this; 的必要性可能降低，但在一些舊的合約中仍然可以看到這種寫法。
    */
    fallback() external {
        (bool result,) = address(delegate).delegatecall(msg.data);
        if (result) {
            this;
        }
    }
}