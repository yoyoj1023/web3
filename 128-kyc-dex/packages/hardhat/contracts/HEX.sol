// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
@title IKYCRegistry Interface
@dev Defines the interface for the KYC verification contract.
*/
interface IKYCRegistry {
    function isVerified(address user) external view returns (bool);
}

/**
@title DEX (Refactored)
@author stevepham.eth, m00npapi.eth (Original), Refactored by AI
@notice A more secure and robust implementation of the DEX contract.
@dev This contract has been refactored to address potential security vulnerabilities including
reentrancy, centralization risks, and handling of non-standard ERC20 tokens.
Use code with caution.
It uses OpenZeppelin's ReentrancyGuard for enhanced security.
Use code with caution.
*/

contract HEX is Ownable, ReentrancyGuard {
    /* ========== STATE VARIABLES ========== */
    IERC20 public immutable token;
    IKYCRegistry public immutable kycRegistry;

    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    bool public isTradingBlocked = true;

    /* ========== EVENTS ========== */

    event EthToTokenSwap(address indexed swapper, uint256 tokenOutput, uint256 ethInput);
    event TokenToEthSwap(address indexed swapper, uint256 tokensInput, uint256 ethOutput);
    event LiquidityProvided(address indexed provider, uint256 liquidityMinted, uint256 ethInput, uint256 tokensInput);
    event LiquidityRemoved(
        address indexed remover,
        uint256 liquidityWithdrawn,
        uint256 tokensOutput,
        uint256 ethOutput
    );
    event SettlementExecuted(address indexed beneficiary, uint256 ethWithdrawn, uint256 tokenWithdrawn);
    event TradingBlockStatusChanged(address indexed owner, bool isBlocked);

    /* ========== MODIFIERS ========== */

    modifier tradingAllowed() {
        require(!isTradingBlocked, "DEX: Trading is currently blocked");
        _;
    }

    /* ========== CONSTRUCTOR ========== */
    /**
     * @dev Sets the addresses for the token and KYC registry.
     *      IMPORTANT: For production, the initial owner should be a Multi-Sig wallet to mitigate single-point-of-failure risk.
     */
    constructor(address tokenAddr, address kycRegistryAddr) Ownable(msg.sender) {
        require(tokenAddr != address(0) && kycRegistryAddr != address(0), "DEX: Zero address provided");
        token = IERC20(tokenAddr);
        kycRegistry = IKYCRegistry(kycRegistryAddr);
    }

    /* ========== INITIALIZATION ========== */

    /**
     * @notice Initializes the DEX with the first batch of liquidity. Can only be called once by the owner.
     * @param tokens The initial amount of tokens(wei) to seed the pool with.
     * @return The initial total liquidity minted.
     */
    function init(uint256 tokens) public payable onlyOwner returns (uint256) {
        require(totalLiquidity == 0, "DEX: Already initialized");
        require(msg.value > 0 && tokens > 0, "DEX: Initial liquidity cannot be zero");

        totalLiquidity = msg.value;
        liquidity[msg.sender] = totalLiquidity;

        require(token.transferFrom(msg.sender, address(this), tokens), "DEX: Initial token transfer failed");
        emit LiquidityProvided(msg.sender, totalLiquidity, msg.value, tokens);
        return totalLiquidity;
    }

    /* ========== READ-ONLY FUNCTIONS ========== */

    /**
     * @notice Calculates the output amount for a given input amount and reserve state.
     * @dev This is a pure function for price calculation based on the constant product formula.
     *      It includes a 0.3% trading fee.
     *      WARNING: This should NOT be used as a price oracle due to its susceptibility to manipulation.
     */
    function getAmountOut(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputAmount > 0, "DEX: Input amount must be positive");
        require(inputReserve > 0 && outputReserve > 0, "DEX: Reserves must be positive");

        uint256 fee = (inputAmount * 3) / 1000; // tax fee 0.3% from xInput
        uint256 inputAmountWithFee = inputAmount - fee;

        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = inputReserve + inputAmountWithFee;

        return numerator / denominator;
    }

    /**
     * @notice Returns the amount of liquidity tokens for a given address.
     */
    function getLiquidity(address lp) public view returns (uint256) {
        return liquidity[lp];
    }

    /* ========== SWAP FUNCTIONS ========== */

    /**
     * @notice Swaps ETH for Tokens. Requires KYC verification.
     * @param minTokensOut The minimum amount of tokens the user is willing to accept (slippage protection).
     */
    function ethToToken(uint256 minTokensOut) public payable nonReentrant tradingAllowed returns (uint256 tokenOutput) {
        require(kycRegistry.isVerified(msg.sender), "DEX: User not KYC verified");
        require(msg.value > 0, "DEX: Cannot swap 0 ETH");

        uint256 ethReserves = address(this).balance - msg.value;
        uint256 tokenReserves = token.balanceOf(address(this));

        tokenOutput = getAmountOut(msg.value, ethReserves, tokenReserves);
        require(tokenOutput >= minTokensOut, "DEX: Slippage tolerance not met");

        require(token.transfer(msg.sender, tokenOutput), "DEX: Token transfer failed");

        emit EthToTokenSwap(msg.sender, tokenOutput, msg.value);
        return tokenOutput;
    }

    /**
     * @notice Swaps Tokens for ETH. Requires KYC verification.
     * @dev This function is robust against fee-on-transfer tokens by checking the balance change.
     * @param tokensIn The amount of tokens the user wants to swap.
     * @param minEthOut The minimum amount of ETH the user is willing to accept (slippage protection).
     */
    function tokenToEth(
        uint256 tokensIn,
        uint256 minEthOut
    ) public nonReentrant tradingAllowed returns (uint256 ethOutput) {
        require(kycRegistry.isVerified(msg.sender), "DEX: User not KYC verified");
        require(tokensIn > 0, "DEX: Cannot swap 0 tokens");

        uint256 tokenReserves = token.balanceOf(address(this));
        uint256 ethReserves = address(this).balance;

        // Securely transfer tokens first and calculate based on actual amount received
        uint256 balanceBefore = token.balanceOf(address(this));
        require(token.transferFrom(msg.sender, address(this), tokensIn), "DEX: Token transferFrom failed");
        uint256 actualTokensIn = token.balanceOf(address(this)) - balanceBefore;

        ethOutput = getAmountOut(actualTokensIn, tokenReserves, ethReserves);
        require(ethOutput >= minEthOut, "DEX: Slippage tolerance not met");

        (bool sent, ) = msg.sender.call{ value: ethOutput }("");
        require(sent, "DEX: ETH transfer failed");

        emit TokenToEthSwap(msg.sender, actualTokensIn, ethOutput);
        return ethOutput;
    }

    /* ========== LIQUIDITY FUNCTIONS (OWNER ONLY) ========== */

    /**
     * @notice Adds liquidity to the pool. Can only be called by the owner.
     * @dev The amount of tokens to deposit is calculated based on the current pool ratio.
     *      Owner must approve the DEX to spend their tokens beforehand.
     */
    function deposit() public payable onlyOwner nonReentrant returns (uint256 tokensDeposited) {
        require(msg.value > 0, "DEX: Cannot deposit 0 ETH");

        uint256 ethReserves = address(this).balance - msg.value;
        uint256 tokenReserves = token.balanceOf(address(this));

        // Calculate token amount based on current ratio, add 1 for rounding
        uint256 tokenAmount = ((msg.value * tokenReserves) / ethReserves) + 1;
        uint256 liquidityMinted = (msg.value * totalLiquidity) / ethReserves;

        liquidity[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;

        require(token.transferFrom(msg.sender, address(this), tokenAmount), "DEX: Token deposit failed");

        emit LiquidityProvided(msg.sender, liquidityMinted, msg.value, tokenAmount);
        return tokenAmount;
    }

    /**
     * @notice Withdraws liquidity from the pool. Can only be called by the owner.
     * @param liquidityAmount The amount of liquidity pool tokens to burn.
     */
    function withdraw(
        uint256 liquidityAmount
    ) public onlyOwner nonReentrant returns (uint256 ethAmount, uint256 tokenAmount) {
        require(liquidityAmount > 0, "DEX: Cannot withdraw 0 liquidity");
        require(liquidity[msg.sender] >= liquidityAmount, "DEX: Insufficient liquidity tokens");

        uint256 ethReserves = address(this).balance;
        uint256 tokenReserves = token.balanceOf(address(this));

        ethAmount = (liquidityAmount * ethReserves) / totalLiquidity;
        tokenAmount = (liquidityAmount * tokenReserves) / totalLiquidity;

        liquidity[msg.sender] -= liquidityAmount;
        totalLiquidity -= liquidityAmount;

        require(token.transfer(msg.sender, tokenAmount), "DEX: Token withdrawal failed");
        (bool sent, ) = msg.sender.call{ value: ethAmount }("");
        require(sent, "DEX: ETH withdrawal failed");

        emit LiquidityRemoved(msg.sender, liquidityAmount, tokenAmount, ethAmount);
        return (ethAmount, tokenAmount);
    }

    /* ========== ADMIN FUNCTIONS ========== */

    /**
     * @notice Allows the owner to block or unblock trading functions.
     */
    function setTradingBlock(bool _isBlocked) public onlyOwner {
        isTradingBlocked = _isBlocked;
        emit TradingBlockStatusChanged(msg.sender, _isBlocked);
    }

    /**
     * @notice [DANGEROUS] Settles the contract and withdraws all remaining funds to the owner.
     * @dev This is a final, irreversible action intended for contract end-of-life or emergency situations.
     *      It permanently stops trading and drains all assets from the contract.
     *      MUST be controlled by a Multi-Sig wallet with a Timelock.
     */
    function settleAndClear() external onlyOwner nonReentrant {
        // 1. 結算前，必須先停止交易
        require(isTradingBlocked, "DEX: Trading is not blocked");

        // 2. 獲取合約中所有剩餘的 ETH 和 Token 餘額
        uint256 ethBalance = address(this).balance;
        uint256 tokenBalance = token.balanceOf(address(this));

        // 3. 提領所有資產到 owner 地址
        // 提領 Token
        if (tokenBalance > 0) {
            // 使用 require(token.transfer(...)) 而非 SafeERC20 在此處是可接受的，
            // 因為如果失敗，整個交易都會回滾，但強烈建議使用 SafeERC20。
            require(token.transfer(owner(), tokenBalance), "DEX: Final token withdrawal failed");
        }

        // 提領 ETH
        if (ethBalance > 0) {
            (bool sent, ) = owner().call{ value: ethBalance }("");
            require(sent, "DEX: Final ETH withdrawal failed");
        }

        // 4. 將流動性清零，使合約的流動性功能永久失效
        totalLiquidity = 0;

        // 5. 觸發事件，記錄操作
        emit SettlementExecuted(owner(), ethBalance, tokenBalance);
    }

    function getETHBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getTokenBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
