// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
 
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
 
contract RandomNumberConsumer is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;
 
    // VRF Coordinator 地址 (請根據網絡選擇)
    // 在不同測試網上，VRF Coordinator 與 keyHash 會不同
    /*
        web3 (Optimism Sepolia)
        VRF Coordinator address: 0x02667f44a6a44e4bdddcf80e724512ad3426b17d
        Subscription ID: 2883917582138870724148744573916001241795738694772607471286142455946613596512
        Admin address：0x93Ab509e357EE9E969b7922cb01FFe68613a4e8F

        Key Hash: 0xc3d5bc4d5600fa71f7a50b9ad841f14f24f9ca4236fd00bdb5fda56b052b28a4
    */
    /*
        web3 op sepolia
        VRF Coordinator address: 0x02667f44a6a44E4BDddCF80e724512Ad3426B17d
        Subscription ID: 64961754151354309583369898804696992667570263189843848080297675318142668755054
        Admin address： 0xdb4101e7f5E2cC0e1A749092ff5287e3d36A5df6

        Key hash: 0xc3d5bc4d5600fa71f7a50b9ad841f14f24f9ca4236fd00bdb5fda56b052b28a4

    */
    address constant vrfCoordinator = 0x02667f44a6a44e4bdddcf80e724512ad3426b17d;
    
    // 訂閱 ID
    uint64 public subscriptionId;
 
    // Gas 限制
    uint32 callbackGasLimit = 100000;
 
    // 請求確認數
    uint16 requestConfirmations = 3;
 
    // 選擇的隨機數字
    uint32 numWords = 1; // 只請求 1 個隨機數
 
    // VRF 參數（Key Hash）
    bytes32 keyHash = 0xc3d5bc4d5600fa71f7a50b9ad841f14f24f9ca4236fd00bdb5fda56b052b28a4;
 
    // 存儲請求 ID 對應的隨機數
    mapping(uint256 => uint256) public requestIdToRandomNumber;
 
    constructor(uint64 _subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        subscriptionId = _subscriptionId;
    }
 
    // 發送隨機數請求
    function requestRandomNumber() external returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }
 
    // VRF 回調函數，處理隨機數
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        requestIdToRandomNumber[requestId] = randomWords[0];
    }
 
    // 獲取隨機數
    function getRandomNumber(uint256 requestId) external view returns (uint256) {
        return requestIdToRandomNumber[requestId];
    }
}