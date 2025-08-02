// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PriceFeed
 * @dev 使用 Chainlink 預言機獲取 BTC 和 ETH 的價格資訊
 */
 
// Chainlink AggregatorV3Interface
interface AggregatorV3Interface {
  function decimals() external view returns (uint8);
  function description() external view returns (string memory);
  function version() external view returns (uint256);
  function getRoundData(uint80 _roundId)
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
}

contract PriceFeed {
    AggregatorV3Interface internal btcPriceFeed;
    AggregatorV3Interface internal ethPriceFeed;

    /**
     * 預設建構子設置不同網絡的 Chainlink 預言機地址
     * 使用 OP Sepolia 測試網的地址
     * BTC/USD: 0x3015aa11f5c2D4Bd0f891E708C8927961b38cE7D
     * ETH/USD: 0x61Ec26aA57019C486B10502285c5A3D4A4750AD7
     */
    constructor() {
        btcPriceFeed = AggregatorV3Interface(0x3015aa11f5c2D4Bd0f891E708C8927961b38cE7D);
        ethPriceFeed = AggregatorV3Interface(0x61Ec26aA57019C486B10502285c5A3D4A4750AD7);
    }

    /**
     * 返回最新的 BTC/USD 價格
     */
    function getBTCPrice() public view returns (int) {
        (, int price, , , ) = btcPriceFeed.latestRoundData();
        return price;
    }

    /**
     * 返回最新的 ETH/USD 價格
     */
    function getETHPrice() public view returns (int) {
        (, int price, , , ) = ethPriceFeed.latestRoundData();
        return price;
    }

    /**
     * 返回 BTC/USD 價格小數位數
     */
    function getBTCDecimals() public view returns (uint8) {
        return btcPriceFeed.decimals();
    }

    /**
     * 返回 ETH/USD 價格小數位數
     */
    function getETHDecimals() public view returns (uint8) {
        return ethPriceFeed.decimals();
    }
} 