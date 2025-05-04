// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/local/src/data-feeds/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

contract BTCPriceConsumer {
    AggregatorV3Interface internal priceFeed;

    /**
     * Network: OP Sepolia
     * Aggregator: BTC/USD
     * Address: 0x3015aa11f5c2D4Bd0f891E708C8927961b38cE7D
     *
     * 參考: https://docs.chain.link/data-feeds/price-feeds/addresses?page=1&network=optimism
     */
    constructor() {
        priceFeed = AggregatorV3Interface(0x3015aa11f5c2D4Bd0f891E708C8927961b38cE7D);
        console.log("BTCPriceConsumer deployed");
    }

    /**
     * Returns the latest BTC/USD price
     */
    function getLatestPrice() public view returns (int256) {
        (
            , // roundId
            int256 price,
            , // startedAt
            , // updatedAt
            // answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }
}