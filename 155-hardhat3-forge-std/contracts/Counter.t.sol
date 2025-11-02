// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Counter} from "./Counter.sol";
import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";

contract CounterTest is Test {
  Counter counter;

  function setUp() public {
    counter = new Counter();
    console.log("Counter deployed at", address(counter));
  }

  function test_InitialValue() public view {
    require(counter.x() == 0, "Initial value should be 0");
    console.log("Initial value is", counter.x());
  }

  function testFuzz_Inc(uint8 x) public {
    for (uint8 i = 0; i < x; i++) {
      counter.inc();
    }
    require(counter.x() == x, "Value after calling inc x times should be x");
  }

  function test_IncByZero() public {
    vm.expectRevert("incBy: increment should be positive");
    counter.incBy(0);
    console.log("IncByZero reverted");
  }
}
