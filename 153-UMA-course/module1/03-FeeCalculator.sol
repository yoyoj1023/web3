// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FeeCalculator
 * @notice 模擬 Store.sol 中的費用計算邏輯
 * @dev 這是一個教學範例，幫助理解 UMA 的經濟模型
 */
contract FeeCalculator {
    // ========== 常量 ==========
    
    /// @notice 每週的秒數
    uint256 public constant SECONDS_PER_WEEK = 604800;
    
    /// @notice 精度基數（18 位小數）
    uint256 public constant PRECISION = 1e18;
    
    // ========== 狀態變數 ==========
    
    /// @notice 固定的 Oracle 費用率（每秒每 PFC）
    /// @dev 預設值：0.0001% = 0.000001 = 1e12 / 1e18
    uint256 public fixedOracleFeePerSecondPerPfc;
    
    /// @notice 每週延遲費用率（每秒每 PFC）
    /// @dev 預設值：0.0005% = 0.000005 = 5e12 / 1e18
    uint256 public weeklyDelayFeePerSecondPerPfc;
    
    /// @notice 每種貨幣的 final fee
    mapping(address => uint256) public finalFees;
    
    // ========== 事件 ==========
    
    event FeeRateUpdated(uint256 oracleFeeRate, uint256 delayFeeRate);
    event FinalFeeSet(address indexed currency, uint256 finalFee);
    
    // ========== 構造函數 ==========
    
    constructor() {
        // 設定預設費用率
        fixedOracleFeePerSecondPerPfc = 1e12; // 0.0001%
        weeklyDelayFeePerSecondPerPfc = 5e12; // 0.0005%
    }
    
    // ========== 費用計算函數 ==========
    
    /**
     * @notice 計算常規 Oracle 費用和延遲懲罰
     * @dev 模擬 Store.sol 的 computeRegularFee 函數
     * @param pfc Profit From Corruption（最大潛在利潤）
     * @param startTime 開始時間（Unix 時間戳）
     * @param endTime 結束時間（Unix 時間戳）
     * @param currentTime 當前時間（用於計算延遲）
     * @return regularFee 常規費用
     * @return latePenalty 延遲懲罰費用
     */
    function computeRegularFee(
        uint256 pfc,
        uint256 startTime,
        uint256 endTime,
        uint256 currentTime
    ) 
        public 
        view 
        returns (uint256 regularFee, uint256 latePenalty) 
    {
        require(endTime >= startTime, "End time must be >= start time");
        require(currentTime >= startTime, "Current time must be >= start time");
        
        // 計算時間差
        uint256 timeDiff = endTime - startTime;
        
        // 常規費用 = PFC × 時間差 × 費用率
        regularFee = (pfc * timeDiff * fixedOracleFeePerSecondPerPfc) / PRECISION;
        
        // 計算支付延遲
        uint256 paymentDelay = currentTime - startTime;
        
        // 計算延遲週數（整數除法，不足一週視為 0）
        uint256 weeksDelayed = paymentDelay / SECONDS_PER_WEEK;
        
        // 延遲懲罰率 = 每週延遲費率 × 延遲週數
        uint256 penaltyPercentagePerSecond = weeklyDelayFeePerSecondPerPfc * weeksDelayed;
        
        // 延遲懲罰 = PFC × 時間差 × 懲罰率
        latePenalty = (pfc * timeDiff * penaltyPercentagePerSecond) / PRECISION;
    }
    
    /**
     * @notice 計算總費用（常規費用 + 延遲懲罰）
     * @param pfc Profit From Corruption
     * @param startTime 開始時間
     * @param endTime 結束時間
     * @param currentTime 當前時間
     * @return totalFee 總費用
     */
    function computeTotalFee(
        uint256 pfc,
        uint256 startTime,
        uint256 endTime,
        uint256 currentTime
    ) 
        external 
        view 
        returns (uint256 totalFee) 
    {
        (uint256 regularFee, uint256 latePenalty) = computeRegularFee(
            pfc, 
            startTime, 
            endTime, 
            currentTime
        );
        totalFee = regularFee + latePenalty;
    }
    
    /**
     * @notice 設定指定貨幣的 final fee
     * @param currency 貨幣地址
     * @param newFinalFee 新的 final fee 金額
     */
    function setFinalFee(address currency, uint256 newFinalFee) external {
        finalFees[currency] = newFinalFee;
        emit FinalFeeSet(currency, newFinalFee);
    }
    
    /**
     * @notice 獲取指定貨幣的 final fee
     * @param currency 貨幣地址
     * @return Final fee 金額
     */
    function computeFinalFee(address currency) external view returns (uint256) {
        return finalFees[currency];
    }
    
    // ========== 管理函數 ==========
    
    /**
     * @notice 更新費用率
     * @param newOracleFeeRate 新的 Oracle 費用率
     * @param newDelayFeeRate 新的延遲費用率
     */
    function setFeeRates(
        uint256 newOracleFeeRate, 
        uint256 newDelayFeeRate
    ) 
        external 
    {
        require(newOracleFeeRate < PRECISION, "Oracle fee rate must be < 100%");
        require(newDelayFeeRate < PRECISION, "Delay fee rate must be < 100%");
        
        fixedOracleFeePerSecondPerPfc = newOracleFeeRate;
        weeklyDelayFeePerSecondPerPfc = newDelayFeeRate;
        
        emit FeeRateUpdated(newOracleFeeRate, newDelayFeeRate);
    }
    
    // ========== 輔助函數 ==========
    
    /**
     * @notice 計算延遲週數
     * @param startTime 開始時間
     * @param currentTime 當前時間
     * @return 延遲的週數
     */
    function calculateWeeksDelayed(uint256 startTime, uint256 currentTime) 
        public 
        pure 
        returns (uint256) 
    {
        if (currentTime <= startTime) return 0;
        return (currentTime - startTime) / SECONDS_PER_WEEK;
    }
    
    /**
     * @notice 將天數轉換為秒數
     * @param days 天數
     * @return 秒數
     */
    function daysToSeconds(uint256 days) public pure returns (uint256) {
        return days * 24 * 60 * 60;
    }
}

/**
 * 使用範例和測試場景：
 * 
 * // 場景 1：計算 30 天的費用（無延遲）
 * // 假設：
 * // - PFC = 1,000,000 USDC (1e6 * 1e18 = 1e24 in wei)
 * // - 持續時間 = 30 天
 * // - 無延遲支付
 * 
 * const pfc = ethers.utils.parseEther("1000000");
 * const startTime = Math.floor(Date.now() / 1000);
 * const endTime = startTime + 30 * 24 * 60 * 60; // 30 days
 * const currentTime = startTime; // 立即支付
 * 
 * const [regularFee, latePenalty] = await feeCalculator.computeRegularFee(
 *     pfc, 
 *     startTime, 
 *     endTime, 
 *     currentTime
 * );
 * 
 * console.log("Regular fee:", ethers.utils.formatEther(regularFee));
 * console.log("Late penalty:", ethers.utils.formatEther(latePenalty));
 * 
 * // 預期結果：
 * // regularFee ≈ 2,592 tokens (1,000,000 × 2,592,000 seconds × 0.000001)
 * // latePenalty = 0 (無延遲)
 * 
 * // 場景 2：計算 30 天的費用（延遲 2 週支付）
 * const currentTime2 = startTime + 14 * 24 * 60 * 60; // 2 weeks delay
 * 
 * const [regularFee2, latePenalty2] = await feeCalculator.computeRegularFee(
 *     pfc, 
 *     startTime, 
 *     endTime, 
 *     currentTime2
 * );
 * 
 * console.log("Regular fee:", ethers.utils.formatEther(regularFee2));
 * console.log("Late penalty:", ethers.utils.formatEther(latePenalty2));
 * 
 * // 預期結果：
 * // regularFee ≈ 2,592 tokens (同上)
 * // latePenalty ≈ 25,920 tokens (1,000,000 × 2,592,000 × 0.000005 × 2)
 * // 總費用 ≈ 28,512 tokens
 */

