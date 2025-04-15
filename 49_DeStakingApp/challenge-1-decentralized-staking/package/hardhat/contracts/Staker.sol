// SPDX-License-Identifier: MIT
pragma solidity 0.8.20; //Do not change the solidity version as it negatively impacts submission grading

import "hardhat/console.sol";
import "./ExampleExternalContract.sol";

contract Staker {
    ExampleExternalContract public exampleExternalContract;

    mapping ( address => uint256 ) public balances;

    event Stake(address staker, uint256 amount);

    uint256 public constant threshold = 1 ether;

    constructor(address exampleExternalContractAddress) {
        exampleExternalContract = ExampleExternalContract(exampleExternalContractAddress);
    }

    // Collect funds in a payable `stake()` function and track individual `balances` with a mapping:
    // (Make sure to add a `Stake(address,uint256)` event and emit it for the frontend `All Stakings` tab to display)
    function stake(address staker, uint256 amount) public payable {
        require(staker != address(0), "Invalid address.");
        require(msg.value > 0, "Invalid payment.");
        require(msg.value == amount, "msg.value != amount .");

        balances[staker] += amount;
        emit Stake(staker, amount);
    }

    // After some `deadline` allow anyone to call an `execute()` function
    // If the deadline has passed and the threshold is met, it should call `exampleExternalContract.complete{value: address(this).balance}()`

    // If the `threshold` was not met, allow everyone to call a `withdraw()` function to withdraw their balance

    // Add a `timeLeft()` view function that returns the time left before the deadline for the frontend

    // Add the `receive()` special function that receives eth and calls stake()
    receive() external payable {
        stake(msg.sender, msg.value);
    }

    function hello() public pure returns(uint) {
        return 374;
    }
}
