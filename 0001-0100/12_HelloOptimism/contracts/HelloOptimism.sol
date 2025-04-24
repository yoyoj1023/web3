// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloOptimism {
    // 宣告一個公開字串變數
    string public message;

    // 建構子，部署時初始化 message
    constructor() {
        message = "Hello, Optimism!";
    }

    // 可供修改 message 的函式
    function setMessage(string memory _newMessage) public {
        message = _newMessage;
    }
}