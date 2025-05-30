// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Counter is Ownable {
    uint256 public count;
    address public gelato;

    event CountIncreased(uint256 newCount);

    constructor() Ownable(msg.sender) {
        count = 0;
    }

    // 設置 Gelato 地址，只有合約擁有者可以調用
    function setGelato(address _gelato) external onlyOwner {
        gelato = _gelato;
    }

    // 增加計數，可以被 Gelato 或合約擁有者調用
    function increaseCount() external {
        require(msg.sender == owner() || msg.sender == gelato, "Not authorized");
        count += 1;
        emit CountIncreased(count);
    }
}