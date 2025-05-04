// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract GatekeeperOneTest {
    address public entrant;
    bool public successTwo = false;

    modifier gateOne() {
        require(msg.sender != tx.origin);
        _;
    }

    modifier gateTwo() {
        require(gasleft() % 8191 == 0);
        successTwo = true;
        _;
    }

    modifier gateThree(bytes8 _gateKey) {
        console.log("uint32(uint64(_gateKey)) : ", uint32(uint64(_gateKey)));
        console.log("check conditions...");
        console.log("uint16(uint64(_gateKey)) : ", uint16(uint64(_gateKey)));
        console.log("uint64(_gateKey) : ", uint64(_gateKey));
        console.log("uint16(uint160(tx.origin)) : ", uint16(uint160(tx.origin)));

        require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)), "GatekeeperOne: invalid gateThree part one");
        console.log("PASS GATE THREE PART ONE");
        require(uint32(uint64(_gateKey)) != uint64(_gateKey), "GatekeeperOne: invalid gateThree part two");
        console.log("PASS GATE THREE PART TWO");
        console.log("  ");
        console.log("(tx.origin) : ", (tx.origin));
        console.log("uint160(tx.origin) : ", uint160(tx.origin));
        console.log("uint16(uint160(tx.origin)) : ", uint16(uint160(tx.origin)));
        require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)), "GatekeeperOne: invalid gateThree part three");
        console.log("PASS GATE THREE PART THREE");
        _;
    }

    function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
        entrant = tx.origin;
        return true;
    }

    function getSuccessTwo() public view returns (bool) {
        return successTwo;
    }
}