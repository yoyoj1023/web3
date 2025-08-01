// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DEX Template
 * @author stevepham.eth and m00npapi.eth
 * @notice Empty DEX.sol that just outlines what features could be part of the challenge (up to you!)
 * @dev We want to create an automatic market where our contract will hold reserves of both ETH and 🎈 Balloons. These reserves will provide liquidity that allows anyone to swap between the assets.
 * NOTE: functions outlined here are what work with the front end of this challenge. Also return variable names need to be specified exactly may be referenced (It may be helpful to cross reference with front-end code function calls).
 */
interface IKYCRegistry {
    function isVerified(address user) external view returns (bool);
}

contract DEX is Ownable {
    /* ========== GLOBAL VARIABLES ========== */
    IERC20 token; //instantiates the imported contract
    IKYCRegistry public kycRegistry;

    uint256 public totalLiquidity;
    mapping (address => uint256) public liquidity;

    bool public isBlocked = true;

    /* ========== EVENTS ========== */

    /**
     * @notice Emitted when ethToToken() swap transacted
     */
    event EthToTokenSwap(address swapper, uint256 tokenOutput, uint256 ethInput);

    /**
     * @notice Emitted when tokenToEth() swap transacted
     */
    event TokenToEthSwap(address swapper, uint256 tokensInput, uint256 ethOutput);

    /**
     * @notice Emitted when liquidity provided to DEX and mints LPTs.
     */
    event LiquidityProvided(address liquidityProvider, uint256 liquidityMinted, uint256 ethInput, uint256 tokensInput);

    /**
     * @notice Emitted when liquidity removed from DEX and decreases LPT count within DEX.
     */
    event LiquidityRemoved(address liquidityRemover, uint256 liquidityWithdrawn, uint256 tokensOutput, uint256 ethOutput);

    /* ========== MODIFIERS ========== */
    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'DEX: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    modifier notBlocked() {
        require(!isBlocked, "DEX: DEX is blocked");
        _;
    }

    /* ========== CONSTRUCTOR ========== */
    constructor(address tokenAddr, address kycRegistryAddr) Ownable(msg.sender) {
        token = IERC20(tokenAddr); //specifies the token address that will hook into the interface and be used through the variable 'token'
        kycRegistry = IKYCRegistry(kycRegistryAddr);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * @notice initializes amount of tokens that will be transferred to the DEX itself from the erc20 contract mintee (and only them based on how Balloons.sol is written). Loads contract up with both ETH and Balloons.
     * @param tokens amount to be transferred to DEX
     * @return totalLiquidity is the number of LPTs minting as a result of deposits made to DEX contract
     * NOTE: since ratio is 1:1, this is fine to initialize the totalLiquidity (wrt to balloons) as equal to eth balance of contract.
     */
    function init(uint256 tokens) public payable onlyOwner returns (uint256) {
        require(totalLiquidity == 0, "DEX already initialized");
        require(address(this).balance == msg.value, "DEX: initial ETH balance mismatch");
        totalLiquidity = msg.value;
        liquidity[msg.sender] = msg.value;
        require(token.transferFrom(msg.sender, address(this), tokens), "DEX: init - transfer did not transact");
        return totalLiquidity;  
    }

    /**
     * @notice returns yOutput, or yDelta for xInput (or xDelta)
     * @dev Follow along with the [original tutorial](https://medium.com/@austin_48503/%EF%B8%8F-minimum-viable-exchange-d84f30bd0c90) Price section for an understanding of the DEX's pricing model and for a price function to add to your contract. You may need to update the Solidity syntax (e.g. use + instead of .add, * instead of .mul, etc). Deploy when you are done.
     */
    function price(uint256 xInput, uint256 xReserves, uint256 yReserves) public pure returns (uint256 yOutput) {
        require(xInput < xReserves, "DEX: INSUFFICIENT_LIQUIDITY");
        uint fee = (xInput * 3) / 1000;  // tax fee 0.03% from xInput
        uint xInputWithFee  = xInput - fee;  
        // k* 公式:  xReserves * yReserves == k == xReserves' * yReserves'
        // (xReserves + xInput) * (yReserves - yOutput) == k
        // xReserves * yReserves - xReserves * yOutput + xInput * yReserves - xInput * yOutput == k
        // k - xReserves * yOutput + xInput * yReserves - xInput * yOutput == k
        // xInput * yReserves == xReserves * yOutput + xInput * yOutput
        // xInput * yReserves == (xReserves + xInput) * yOutput
        // (xInput * yReserves) / (xReserves + xInput) == yOutput
        // (xInputWithFee * yReserves) / (xReserves + xInputWithFee) == yOutput
        yOutput = (xInputWithFee * yReserves) / (xReserves + xInputWithFee);
        return yOutput;
    }

    /**
     * @notice returns liquidity for a user.
     * NOTE: this is not needed typically due to the `liquidity()` mapping variable being public and having a getter as a result. This is left though as it is used within the front end code (App.jsx).
     * NOTE: if you are using a mapping liquidity, then you can use `return liquidity[lp]` to get the liquidity for a user.
     * NOTE: if you will be submitting the challenge make sure to implement this function as it is used in the tests.
     */
    function getLiquidity(address lp) public view returns (uint256) {
        return liquidity[lp];
    }

    /**
     * @notice sends Ether to DEX in exchange for $BAL
     */
    function ethToToken(uint256 minTokenOutput) public payable lock notBlocked returns (uint256 tokenOutput) {
        require(kycRegistry.isVerified(msg.sender), "DEX: ethToToken - user not verified");
        require(msg.value > 0, "cannot swap 0 ETH");
        uint256 ethInput = msg.value;
        uint256 ethReserves = address(this).balance - msg.value;
        uint256 tokenReserves = token.balanceOf(address(this));
        tokenOutput = price(ethInput, ethReserves, tokenReserves);

        require(tokenOutput >= minTokenOutput, "DEX: ethToToken - token output below minimum");
        require(token.transfer(msg.sender, tokenOutput), "DEX: ethToToken - transfer failed");
        
        emit EthToTokenSwap(msg.sender, tokenOutput, ethInput);
        return tokenOutput;
    }

    /**
     * @notice sends $BAL tokens to DEX in exchange for Ether
     */
    function tokenToEth(uint256 tokenInput, uint256 minEthOutput) public lock notBlocked returns (uint256 ethOutput) {
        require(kycRegistry.isVerified(msg.sender), "DEX: tokenToEth - user not verified");
        require(tokenInput > 0, "cannot swap 0 tokens");
        require(token.balanceOf(msg.sender) >= tokenInput, "insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= tokenInput, "insufficient allowance");
        uint256 tokenReserves = token.balanceOf(address(this));
        uint256 ethReserves = address(this).balance;
        ethOutput = price(tokenInput, tokenReserves, ethReserves);

        require(ethOutput >= minEthOutput, "DEX: tokenToEth - eth output below minimum");
        require(token.transferFrom(msg.sender, address(this), tokenInput), "DEX: tokenToEth - transfer failed");

        (bool sent, ) = msg.sender.call{ value: ethOutput }("");
        require(sent, "tokenToEth: revert in transferring eth to you!");
        emit TokenToEthSwap(msg.sender, tokenInput, ethOutput);
        return ethOutput;
    }

    /**
     * @notice allows deposits of $BAL and $ETH to liquidity pool
     * NOTE: parameter is the msg.value sent with this function call. That amount is used to determine the amount of $BAL needed as well and taken from the depositor.
     * NOTE: user has to make sure to give DEX approval to spend their tokens on their behalf by calling approve function prior to this function call.
     * NOTE: Equal parts of both assets will be removed from the user's wallet with respect to the price outlined by the AMM.
     */
    function deposit() public payable onlyOwner lock returns (uint256 tokensDeposited) {
        require(kycRegistry.isVerified(msg.sender), "DEX: deposit - owner not verified");
        require(msg.value > 0, "cannot deposit 0 ETH");
        uint256 ethReserves = address(this).balance - msg.value;
        uint256 tokenReserves = token.balanceOf(address(this));
        uint256 tokenDeposit;
        tokenDeposit = (msg.value * tokenReserves / ethReserves) + 1;
        // 💡 Discussion on adding 1 wei at end of calculation    ^
        // -> https://t.me/c/1655715571/106
        // 防止逼近零值存款、防止捨入誤差、維持流動性平衡，確保池子代幣略多於嚴格的數學比例要求，略為正向偏差的保守設計
        require(token.balanceOf(msg.sender) >= tokenDeposit, "insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= tokenDeposit, "insufficient allowance");

        uint256 liquidityMinted = msg.value * totalLiquidity / ethReserves;
        liquidity[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;

        require(token.transferFrom(msg.sender, address(this), tokenDeposit), "DEX: deposit - transfer failed");
        emit LiquidityProvided(msg.sender, liquidityMinted, msg.value, tokenDeposit);
        return tokenDeposit;
    }

    /**
     * @notice allows withdrawal of $BAL and $ETH from liquidity pool
     * NOTE: with this current code, the msg caller could end up getting very little back if the liquidity is super low in the pool. I guess they could see that with the UI.
     */
    function withdraw(uint256 amount) public onlyOwner lock returns (uint256 ethAmount, uint256 tokenAmount) {
        require(kycRegistry.isVerified(msg.sender), "DEX: deposit - owner not verified");
        require(amount > 0, "cannot withdraw 0 liquidity");
        require(liquidity[msg.sender] >= amount, "msg.sender insufficient liquidity");

        ethAmount = amount * address(this).balance / totalLiquidity;
        tokenAmount = amount * token.balanceOf(address(this)) / totalLiquidity;

        liquidity[msg.sender] -= amount;
        totalLiquidity -= amount;

        (bool sent, ) = payable(msg.sender).call{ value: ethAmount }("");
        require(sent, "withdraw: revert in transferring eth to you!");
        require(token.transfer(msg.sender, tokenAmount), "withdraw: revert in transferring tokens to you!");
        
        emit LiquidityRemoved(msg.sender, amount, tokenAmount, ethAmount);
        return (ethAmount, tokenAmount);
    }

    function setBlocked(bool _isBlocked) public onlyOwner {
        isBlocked = _isBlocked;
    }
}
