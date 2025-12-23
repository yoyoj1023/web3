// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract KYCRegistry is Ownable {
    mapping(address => bool) public verifiedUsers;

    constructor() Ownable(msg.sender) {}

    event UserVerified(address indexed user);
    event UserVerificationRemoved(address indexed user);

    function addVerifiedUser(address user) external onlyOwner {
        require(user != address(0), "KYCRegistry: Invalid user address");
        require(!verifiedUsers[user], "KYCRegistry: User already verified. Do not add again.");
        verifiedUsers[user] = true;
        emit UserVerified(user);
    }

    function removeVerifiedUser(address user) external onlyOwner {
        require(user != address(0), "KYCRegistry: Invalid user address");
        require(verifiedUsers[user], "KYCRegistry: User not verified now. Do not remove again.");
        verifiedUsers[user] = false; // delete verifiedUsers[user];
        emit UserVerificationRemoved(user);
    }

    function isVerified(address user) external view returns (bool) {
        return verifiedUsers[user];
    }

    // 批量操作可以後續添加
}