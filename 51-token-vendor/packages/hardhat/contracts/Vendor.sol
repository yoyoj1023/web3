pragma solidity 0.8.20; //Do not change the solidity version as it negatively impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor is Ownable {
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
    event SellTokens(address seller, uint256  amountOfTokens, uint256 amountOfETH);

    YourToken public yourToken;

    uint256 public constant tokensPerEth = 100;

    constructor(address tokenAddress) Ownable(msg.sender){
        yourToken = YourToken(tokenAddress);
    }

    // ToDo: create a payable buyTokens() function:
    function buyTokens() public payable {
        require(msg.value > 0, "Amount of ETH must be greater than 0");
        uint256 amountOfTokens = msg.value * tokensPerEth;
        require(yourToken.balanceOf(address(this)) >= amountOfTokens, "Vendor does not have enough tokens");
        (bool success, ) = address(yourToken).call{value: 0}(
            abi.encodeWithSignature("transfer(address,uint256)", msg.sender, amountOfTokens)
        );
        require(success, "Token transfer failed");
        emit BuyTokens(msg.sender, msg.value, amountOfTokens);
    }

    // ToDo: create a withdraw() function that lets the owner withdraw ETH
    function withdraw() public onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // ToDo: create a sellTokens(uint256 _amount) function:
    function sellTokens(uint256 _amount) public {
        require(_amount > 0, "Amount of tokens must be greater than 0");
        require(yourToken.balanceOf(msg.sender) >= _amount, "Sender does not have enough tokens");
        require(yourToken.allowance(msg.sender, address(this)) >= _amount, "Sender has not approved enough tokens");
        (bool success, ) = address(yourToken).call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), _amount)
        );
        require(success, "Token transfer failed");

        (bool success2, ) = msg.sender.call{value: _amount / tokensPerEth}("");
        require(success2, "ETH transfer failed");

        emit SellTokens(msg.sender, _amount, _amount / tokensPerEth);
    }
}
