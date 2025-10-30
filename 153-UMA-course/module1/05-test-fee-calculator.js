/**
 * 模組一測試腳本：費用計算器測試
 * 
 * 這個腳本展示如何：
 * 1. 部署 FeeCalculator 合約
 * 2. 計算不同場景下的 Oracle 費用
 * 3. 理解 PFC（Profit From Corruption）的影響
 * 4. 理解延遲支付的懲罰機制
 * 
 * 執行環境：Hardhat
 * 執行命令：npx hardhat run module1/05-test-fee-calculator.js --network localhost
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("========================================");
    console.log("模組一：費用計算器測試");
    console.log("========================================\n");

    // 獲取簽名者
    const [deployer] = await ethers.getSigners();
    console.log("部署者地址:", deployer.address);
    console.log();

    // ========== 步驟 1：部署 FeeCalculator ==========
    console.log("步驟 1：部署 FeeCalculator 合約");
    console.log("------------------------------------------");
    
    const FeeCalculator = await ethers.getContractFactory("FeeCalculator");
    const feeCalculator = await FeeCalculator.deploy();
    await feeCalculator.deployed();
    
    console.log("✅ FeeCalculator 部署成功");
    console.log("   地址:", feeCalculator.address);
    
    // 讀取預設費率
    const oracleFeeRate = await feeCalculator.fixedOracleFeePerSecondPerPfc();
    const delayFeeRate = await feeCalculator.weeklyDelayFeePerSecondPerPfc();
    
    console.log("\n預設費率：");
    console.log("   Oracle 費率:", oracleFeeRate.toString(), "wei");
    console.log("   延遲費率:", delayFeeRate.toString(), "wei");
    console.log("   Oracle 費率 (%):", Number(oracleFeeRate) / 1e18 * 100, "%");
    console.log("   延遲費率 (%):", Number(delayFeeRate) / 1e18 * 100, "%");
    console.log();

    // ========== 場景 1：基本費用計算（無延遲） ==========
    console.log("場景 1：基本費用計算（無延遲）");
    console.log("------------------------------------------");
    
    // 參數設定
    const pfc1 = ethers.utils.parseEther("1000000"); // 1M tokens
    const startTime1 = Math.floor(Date.now() / 1000);
    const duration1 = 30 * 24 * 60 * 60; // 30 天
    const endTime1 = startTime1 + duration1;
    const currentTime1 = startTime1; // 立即支付，無延遲
    
    console.log("參數：");
    console.log("   PFC:", ethers.utils.formatEther(pfc1), "tokens");
    console.log("   持續時間:", duration1 / (24 * 60 * 60), "天");
    console.log("   支付延遲: 0 天");
    
    const [regularFee1, latePenalty1] = await feeCalculator.computeRegularFee(
        pfc1,
        startTime1,
        endTime1,
        currentTime1
    );
    
    console.log("\n計算結果：");
    console.log("   常規費用:", ethers.utils.formatEther(regularFee1), "tokens");
    console.log("   延遲懲罰:", ethers.utils.formatEther(latePenalty1), "tokens");
    console.log("   總費用:", ethers.utils.formatEther(regularFee1.add(latePenalty1)), "tokens");
    console.log();

    // ========== 場景 2：有延遲的費用計算（2 週延遲） ==========
    console.log("場景 2：有延遲的費用計算（2 週延遲）");
    console.log("------------------------------------------");
    
    const pfc2 = ethers.utils.parseEther("1000000");
    const startTime2 = Math.floor(Date.now() / 1000);
    const duration2 = 30 * 24 * 60 * 60;
    const endTime2 = startTime2 + duration2;
    const delay2 = 14 * 24 * 60 * 60; // 2 週延遲
    const currentTime2 = startTime2 + delay2;
    
    console.log("參數：");
    console.log("   PFC:", ethers.utils.formatEther(pfc2), "tokens");
    console.log("   持續時間:", duration2 / (24 * 60 * 60), "天");
    console.log("   支付延遲:", delay2 / (24 * 60 * 60), "天 (2 週)");
    
    const weeksDelayed2 = await feeCalculator.calculateWeeksDelayed(startTime2, currentTime2);
    console.log("   延遲週數:", weeksDelayed2.toString());
    
    const [regularFee2, latePenalty2] = await feeCalculator.computeRegularFee(
        pfc2,
        startTime2,
        endTime2,
        currentTime2
    );
    
    console.log("\n計算結果：");
    console.log("   常規費用:", ethers.utils.formatEther(regularFee2), "tokens");
    console.log("   延遲懲罰:", ethers.utils.formatEther(latePenalty2), "tokens");
    console.log("   總費用:", ethers.utils.formatEther(regularFee2.add(latePenalty2)), "tokens");
    console.log("   懲罰比例:", (Number(latePenalty2) / Number(regularFee2) * 100).toFixed(2), "%");
    console.log();

    // ========== 場景 3：長時間延遲（4 週） ==========
    console.log("場景 3：長時間延遲（4 週）");
    console.log("------------------------------------------");
    
    const pfc3 = ethers.utils.parseEther("500000"); // 降低 PFC
    const startTime3 = Math.floor(Date.now() / 1000);
    const duration3 = 30 * 24 * 60 * 60;
    const endTime3 = startTime3 + duration3;
    const delay3 = 28 * 24 * 60 * 60; // 4 週延遲
    const currentTime3 = startTime3 + delay3;
    
    console.log("參數：");
    console.log("   PFC:", ethers.utils.formatEther(pfc3), "tokens");
    console.log("   持續時間:", duration3 / (24 * 60 * 60), "天");
    console.log("   支付延遲:", delay3 / (24 * 60 * 60), "天 (4 週)");
    
    const weeksDelayed3 = await feeCalculator.calculateWeeksDelayed(startTime3, currentTime3);
    console.log("   延遲週數:", weeksDelayed3.toString());
    
    const [regularFee3, latePenalty3] = await feeCalculator.computeRegularFee(
        pfc3,
        startTime3,
        endTime3,
        currentTime3
    );
    
    console.log("\n計算結果：");
    console.log("   常規費用:", ethers.utils.formatEther(regularFee3), "tokens");
    console.log("   延遲懲罰:", ethers.utils.formatEther(latePenalty3), "tokens");
    console.log("   總費用:", ethers.utils.formatEther(regularFee3.add(latePenalty3)), "tokens");
    console.log("   懲罰比例:", (Number(latePenalty3) / Number(regularFee3) * 100).toFixed(2), "%");
    console.log();

    // ========== 場景 4：短期合約（7 天） ==========
    console.log("場景 4：短期合約（7 天，無延遲）");
    console.log("------------------------------------------");
    
    const pfc4 = ethers.utils.parseEther("100000");
    const startTime4 = Math.floor(Date.now() / 1000);
    const duration4 = 7 * 24 * 60 * 60; // 7 天
    const endTime4 = startTime4 + duration4;
    const currentTime4 = startTime4;
    
    console.log("參數：");
    console.log("   PFC:", ethers.utils.formatEther(pfc4), "tokens");
    console.log("   持續時間:", duration4 / (24 * 60 * 60), "天");
    console.log("   支付延遲: 0 天");
    
    const [regularFee4, latePenalty4] = await feeCalculator.computeRegularFee(
        pfc4,
        startTime4,
        endTime4,
        currentTime4
    );
    
    console.log("\n計算結果：");
    console.log("   常規費用:", ethers.utils.formatEther(regularFee4), "tokens");
    console.log("   延遲懲罰:", ethers.utils.formatEther(latePenalty4), "tokens");
    console.log("   總費用:", ethers.utils.formatEther(regularFee4.add(latePenalty4)), "tokens");
    console.log();

    // ========== 場景 5：設定 Final Fee ==========
    console.log("場景 5：設定和查詢 Final Fee");
    console.log("------------------------------------------");
    
    // 模擬 USDC 和 WETH 地址
    const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    
    // 設定 final fee (USDC 使用 6 位小數)
    const usdcFinalFee = ethers.utils.parseUnits("150", 6); // 150 USDC
    const wethFinalFee = ethers.utils.parseEther("0.1"); // 0.1 ETH
    
    console.log("設定 Final Fee...");
    let tx = await feeCalculator.setFinalFee(usdcAddress, usdcFinalFee);
    await tx.wait();
    console.log("✅ USDC Final Fee 已設定:", ethers.utils.formatUnits(usdcFinalFee, 6), "USDC");
    
    tx = await feeCalculator.setFinalFee(wethAddress, wethFinalFee);
    await tx.wait();
    console.log("✅ WETH Final Fee 已設定:", ethers.utils.formatEther(wethFinalFee), "ETH");
    
    console.log("\n查詢 Final Fee...");
    const retrievedUsdcFee = await feeCalculator.computeFinalFee(usdcAddress);
    const retrievedWethFee = await feeCalculator.computeFinalFee(wethAddress);
    
    console.log("USDC Final Fee:", ethers.utils.formatUnits(retrievedUsdcFee, 6), "USDC");
    console.log("WETH Final Fee:", ethers.utils.formatEther(retrievedWethFee), "ETH");
    console.log();

    // ========== 比較表格 ==========
    console.log("========================================");
    console.log("費用比較表格");
    console.log("========================================");
    console.log();
    console.log("場景 | PFC (tokens) | 持續 | 延遲 | 常規費用 | 延遲懲罰 | 總費用");
    console.log("-----|-------------|------|------|---------|---------|--------");
    console.log(`  1  | ${ethers.utils.formatEther(pfc1).padEnd(11)} | 30d  | 0d   | ${ethers.utils.formatEther(regularFee1).padEnd(7)} | ${ethers.utils.formatEther(latePenalty1).padEnd(7)} | ${ethers.utils.formatEther(regularFee1.add(latePenalty1))}`);
    console.log(`  2  | ${ethers.utils.formatEther(pfc2).padEnd(11)} | 30d  | 14d  | ${ethers.utils.formatEther(regularFee2).padEnd(7)} | ${ethers.utils.formatEther(latePenalty2).padEnd(7)} | ${ethers.utils.formatEther(regularFee2.add(latePenalty2))}`);
    console.log(`  3  | ${ethers.utils.formatEther(pfc3).padEnd(11)} | 30d  | 28d  | ${ethers.utils.formatEther(regularFee3).padEnd(7)} | ${ethers.utils.formatEther(latePenalty3).padEnd(7)} | ${ethers.utils.formatEther(regularFee3.add(latePenalty3))}`);
    console.log(`  4  | ${ethers.utils.formatEther(pfc4).padEnd(11)} | 7d   | 0d   | ${ethers.utils.formatEther(regularFee4).padEnd(7)} | ${ethers.utils.formatEther(latePenalty4).padEnd(7)} | ${ethers.utils.formatEther(regularFee4.add(latePenalty4))}`);
    console.log();

    // ========== 關鍵洞察 ==========
    console.log("========================================");
    console.log("關鍵洞察");
    console.log("========================================");
    console.log();
    console.log("1. PFC 影響：");
    console.log("   - PFC 越高，費用越高（線性關係）");
    console.log("   - 場景 1 vs 場景 3：PFC 減半，費用也減半");
    console.log();
    console.log("2. 延遲懲罰：");
    console.log("   - 每延遲一週，懲罰率增加");
    console.log("   - 場景 2 (2週延遲)：懲罰約為常規費用的 10 倍");
    console.log("   - 場景 3 (4週延遲)：懲罰約為常規費用的 20 倍");
    console.log();
    console.log("3. 持續時間影響：");
    console.log("   - 持續時間越長，費用越高（線性關係）");
    console.log("   - 場景 1 (30天) vs 場景 4 (7天)：費用約為 4.3 倍");
    console.log();
    console.log("4. Final Fee 的作用：");
    console.log("   - 獨立於 PFC 和時間的固定費用");
    console.log("   - 用於補償投票者的 gas 成本");
    console.log("   - 當發生爭議時，雙方都需要支付");
    console.log();

    console.log("========================================");
    console.log("測試完成！");
    console.log("========================================");
}

// 錯誤處理
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ 錯誤:", error);
        process.exit(1);
    });

