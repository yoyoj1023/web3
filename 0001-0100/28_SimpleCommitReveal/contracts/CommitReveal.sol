// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
 
contract CommitReveal {
    mapping(address => bytes32) public commitments; // 記錄每個用戶提交的 hash
    mapping(address => string) public revealedValues; // 記錄揭示的值
 
    // 提交 (Commit)
    function commit(bytes32 _commitment) external {
        commitments[msg.sender] = _commitment;
    }
 
    // 揭示 (Reveal)
    function reveal(string calldata _value) external {
        require(commitments[msg.sender] != bytes32(0), "No commitment found");
 
        // 檢查 Hash 是否匹配
        require(commitments[msg.sender] == keccak256(abi.encodePacked(_value)), "Invalid reveal");
 
        // 記錄揭示的值
        revealedValues[msg.sender] = _value;
    }
}