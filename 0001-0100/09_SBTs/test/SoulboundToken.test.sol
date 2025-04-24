// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/SoulboundToken.sol";

contract SoulboundTokenTest is Test {
    SoulboundToken private sbt;
    address private owner;
    address private user1;
    address private user2;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        sbt = new SoulboundToken();
    }

    function testDeployment() public {
        assertEq(sbt.name(), "SoulboundToken");
        assertEq(sbt.symbol(), "SBT");
    }

    function testMinting() public {
        sbt.mint(user1);
        assertEq(sbt.balanceOf(user1), 1);
    }

    function testPreventDoubleMinting() public {
        sbt.mint(user1);
        vm.expectRevert("Address already owns a token");
        sbt.mint(user1);
    }

    function testPreventTransfer() public {
        sbt.mint(user1);
        uint256 tokenId = 1;
        
        vm.startPrank(user1);
        vm.expectRevert("Soulbound tokens cannot be transferred");
        sbt.transferFrom(user1, user2, tokenId);
        vm.stopPrank();
    }

    function testBurning() public {
        sbt.mint(user1);
        uint256 tokenId = 1;
        
        vm.startPrank(user1);
        sbt.burn(tokenId);
        vm.stopPrank();
        
        assertEq(sbt.balanceOf(user1), 0);
    }

    function testPreventUnauthorizedBurning() public {
        sbt.mint(user1);
        uint256 tokenId = 1;
        
        vm.startPrank(user2);
        vm.expectRevert("You are not the owner");
        sbt.burn(tokenId);
        vm.stopPrank();
    }

    function testOnlyOwnerCanMint() public {
        vm.startPrank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        sbt.mint(user2);
        vm.stopPrank();
    }
}