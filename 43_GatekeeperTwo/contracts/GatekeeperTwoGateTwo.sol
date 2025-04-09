// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract GatekeeperTwoGateTwo {
    address public entrant;

    modifier gateOne() {
        require(msg.sender != tx.origin);
        _;
    }

    modifier gateTwo() {
        uint256 x;
        console.log("x: ", x);
        assembly {
            x := extcodesize(caller())
        }
        console.log("x := extcodesize(caller())", x);
        require(x == 0);
        _;
    }

    modifier gateThree(bytes8 _gateKey) {
        _;
    }

    function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
        entrant = tx.origin;
        return true;
    }
}