/**
 * 模組一測試腳本：Finder 合約測試
 * 
 * 這個腳本展示如何：
 * 1. 部署 SimpleFinder 合約
 * 2. 註冊介面實現
 * 3. 查找介面地址
 * 4. 在應用合約中使用 Finder
 * 
 * 執行環境：Hardhat
 * 執行命令：npx hardhat run module1/04-test-finder.js --network localhost
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("========================================");
    console.log("模組一：Finder 合約測試");
    console.log("========================================\n");

    // 獲取簽名者
    const [deployer, user1, user2] = await ethers.getSigners();
    console.log("部署者地址:", deployer.address);
    console.log("部署者餘額:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

    // ========== 步驟 1：部署 SimpleFinder ==========
    console.log("步驟 1：部署 SimpleFinder 合約");
    console.log("------------------------------------------");
    
    const SimpleFinder = await ethers.getContractFactory("SimpleFinder");
    const finder = await SimpleFinder.deploy();
    await finder.deployed();
    
    console.log("✅ SimpleFinder 部署成功");
    console.log("   地址:", finder.address);
    console.log("   Owner:", await finder.owner());
    console.log();

    // ========== 步驟 2：註冊介面實現 ==========
    console.log("步驟 2：註冊介面實現");
    console.log("------------------------------------------");
    
    // 模擬 Store 和 OptimisticOracleV3 的地址
    const mockStoreAddress = user1.address;
    const mockOOv3Address = user2.address;
    
    // 將字符串轉換為 bytes32
    const storeInterface = ethers.utils.formatBytes32String("Store");
    const oov3Interface = ethers.utils.formatBytes32String("OptimisticOracleV3");
    
    console.log("註冊 Store 介面...");
    let tx = await finder.changeImplementationAddress(storeInterface, mockStoreAddress);
    await tx.wait();
    console.log("✅ Store 介面已註冊");
    console.log("   介面名稱:", ethers.utils.parseBytes32String(storeInterface));
    console.log("   實現地址:", mockStoreAddress);
    
    console.log("\n註冊 OptimisticOracleV3 介面...");
    tx = await finder.changeImplementationAddress(oov3Interface, mockOOv3Address);
    await tx.wait();
    console.log("✅ OptimisticOracleV3 介面已註冊");
    console.log("   介面名稱:", ethers.utils.parseBytes32String(oov3Interface));
    console.log("   實現地址:", mockOOv3Address);
    console.log();

    // ========== 步驟 3：查找介面地址 ==========
    console.log("步驟 3：查找介面地址");
    console.log("------------------------------------------");
    
    const retrievedStore = await finder.getImplementationAddress(storeInterface);
    const retrievedOOv3 = await finder.getImplementationAddress(oov3Interface);
    
    console.log("查找 Store 地址:", retrievedStore);
    console.log("驗證結果:", retrievedStore === mockStoreAddress ? "✅ 正確" : "❌ 錯誤");
    
    console.log("\n查找 OptimisticOracleV3 地址:", retrievedOOv3);
    console.log("驗證結果:", retrievedOOv3 === mockOOv3Address ? "✅ 正確" : "❌ 錯誤");
    console.log();

    // ========== 步驟 4：測試批量註冊 ==========
    console.log("步驟 4：測試批量註冊");
    console.log("------------------------------------------");
    
    const oracleInterface = ethers.utils.formatBytes32String("Oracle");
    const governorInterface = ethers.utils.formatBytes32String("Governor");
    
    const interfaceNames = [oracleInterface, governorInterface];
    const implementationAddresses = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address
    ];
    
    console.log("批量註冊 2 個介面...");
    tx = await finder.batchChangeImplementationAddresses(interfaceNames, implementationAddresses);
    await tx.wait();
    
    console.log("✅ 批量註冊成功");
    console.log("   Oracle:", implementationAddresses[0]);
    console.log("   Governor:", implementationAddresses[1]);
    console.log();

    // ========== 步驟 5：測試查找不存在的介面 ==========
    console.log("步驟 5：測試查找不存在的介面");
    console.log("------------------------------------------");
    
    const nonExistentInterface = ethers.utils.formatBytes32String("NonExistent");
    
    try {
        await finder.getImplementationAddress(nonExistentInterface);
        console.log("❌ 應該拋出錯誤但沒有");
    } catch (error) {
        console.log("✅ 正確拋出錯誤");
        console.log("   錯誤訊息:", error.message.split('\n')[0]);
    }
    console.log();

    // ========== 步驟 6：部署 FinderConsumer 並測試 ==========
    console.log("步驟 6：部署 FinderConsumer 並測試");
    console.log("------------------------------------------");
    
    const FinderConsumer = await ethers.getContractFactory("FinderConsumer");
    const consumer = await FinderConsumer.deploy(finder.address);
    await consumer.deployed();
    
    console.log("✅ FinderConsumer 部署成功");
    console.log("   地址:", consumer.address);
    
    console.log("\n通過 FinderConsumer 查找 Store 地址...");
    tx = await consumer.getStoreAddress();
    const receipt = await tx.wait();
    
    // 解析事件
    const event = receipt.events.find(e => e.event === "ContractLookedUp");
    console.log("✅ 查找成功");
    console.log("   合約名稱:", event.args.contractName);
    console.log("   合約地址:", event.args.contractAddress);
    console.log();

    // ========== 步驟 7：測試介面檢查 ==========
    console.log("步驟 7：測試介面檢查");
    console.log("------------------------------------------");
    
    const isStoreRegistered = await finder.isInterfaceRegistered(storeInterface);
    const isNonExistentRegistered = await finder.isInterfaceRegistered(nonExistentInterface);
    
    console.log("Store 是否已註冊:", isStoreRegistered ? "✅ 是" : "❌ 否");
    console.log("NonExistent 是否已註冊:", isNonExistentRegistered ? "❌ 是" : "✅ 否");
    console.log();

    // ========== 總結 ==========
    console.log("========================================");
    console.log("測試完成！");
    console.log("========================================");
    console.log("\n已部署的合約：");
    console.log("- SimpleFinder:", finder.address);
    console.log("- FinderConsumer:", consumer.address);
    console.log("\n已註冊的介面：");
    console.log("- Store:", mockStoreAddress);
    console.log("- OptimisticOracleV3:", mockOOv3Address);
    console.log("- Oracle:", implementationAddresses[0]);
    console.log("- Governor:", implementationAddresses[1]);
}

// 錯誤處理
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ 錯誤:", error);
        process.exit(1);
    });

/**
 * 預期輸出：
 * 
 * ========================================
 * 模組一：Finder 合約測試
 * ========================================
 * 
 * 部署者地址: 0x...
 * 部署者餘額: 10000.0 ETH
 * 
 * 步驟 1：部署 SimpleFinder 合約
 * ------------------------------------------
 * ✅ SimpleFinder 部署成功
 *    地址: 0x...
 *    Owner: 0x...
 * 
 * 步驟 2：註冊介面實現
 * ------------------------------------------
 * 註冊 Store 介面...
 * ✅ Store 介面已註冊
 *    介面名稱: Store
 *    實現地址: 0x...
 * 
 * [... 更多輸出 ...]
 * 
 * ========================================
 * 測試完成！
 * ========================================
 */

