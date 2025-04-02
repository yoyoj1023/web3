// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

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