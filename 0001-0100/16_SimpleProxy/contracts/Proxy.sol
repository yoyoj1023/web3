// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Proxy {
    address public implementation; // 當前邏輯合約的地址
    address public admin; // 管理員地址，用於升級

    // 部屬時設置初始邏輯合約地址
    constructor(address _implementation) {
        implementation = _implementation;
        admin = msg.sender;
    }

    // 升級邏輯合約的函數，只有 admin 可以調用
    function upgrade(address _newImplementation) public {
        require(msg.sender == admin, "Only admin can upgrade");
        implementation = _newImplementation;
    }

    // Fallback 函數，將所有調用轉發到邏輯合約
    // 這裡使用了 delegatecall，所以邏輯合約的 storage 會被修改
    // Solidity 0.6.0 版本之後，fallback 函數被拆分為 receive() 函數和 fallback() 函數
    // fallbck() 函數用於處理所有的調用，包括以太幣轉發
    fallback() external payable {
        address impl = implementation;
        require(impl != address(0), "Implementation not set");

        assembly {
            // 將調用數據複製到內存
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())

            // 使用 delegatecall 執行邏輯合約的代碼
            // 存儲的變量（如 value）會保存在代理合約中
            let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)

            // 根據執行結果返回或回退
            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }

    // 接收 ETH 的 payable 函數
    // receive() 函數用於接收以太幣轉帳，不能接收調用數據
    receive() external payable {}
}