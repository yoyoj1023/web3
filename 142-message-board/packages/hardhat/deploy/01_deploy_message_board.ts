import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * 部署 MessageBoard 合約
 * 這是一個基於 IPFS 的去中心化留言板智能合約
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMessageBoard: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    在本地環境中，部署者帳戶是 Hardhat 預設提供的，已經有足夠的資金。

    當部署到實際網路時（例如 `yarn deploy --network sepolia`），部署者帳戶
    應該有足夠的餘額來支付合約創建的 gas 費用。

    您可以使用 `yarn generate` 生成隨機帳戶，或使用 `yarn account:import` 
    匯入您現有的私鑰，這將在 .env 文件中填入 DEPLOYER_PRIVATE_KEY_ENCRYPTED
    （然後在 hardhat.config.ts 中使用）
    您可以運行 `yarn account` 命令來檢查您在每個網路中的餘額。
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 開始部署 MessageBoard 合約...");
  console.log("📍 部署者地址:", deployer);

  const deployResult = await deploy("MessageBoard", {
    from: deployer,
    // MessageBoard 合約的構造函數不需要任何參數
    args: [],
    log: true,
    // autoMine: 可以傳遞給 deploy 函數，通過自動挖掘合約部署交易
    // 使本地網路上的部署過程更快。對實際網路沒有影響。
    autoMine: true,
  });

  // 獲取已部署的合約以便在部署後與其互動
  const messageBoard = await hre.ethers.getContract<Contract>("MessageBoard", deployer);
  
  console.log("✅ MessageBoard 合約部署成功！");
  console.log("📝 合約地址:", deployResult.address);
  console.log("👤 合約擁有者:", await messageBoard.owner());
  console.log("⏸️  合約狀態 (isPaused):", await messageBoard.isPaused());
  console.log("📊 目前留言總數:", await messageBoard.getTotalMessages());

  // 如果是在本地網路，可以發布一則測試留言
  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    console.log("🧪 在本地網路中發布測試留言...");
    try {
      const testCid = "QmTestCID123456789"; // 測試用的 IPFS CID
      const tx = await messageBoard.postMessage(testCid);
      await tx.wait();
      console.log("✅ 測試留言發布成功！");
      console.log("📊 更新後留言總數:", await messageBoard.getTotalMessages());
    } catch (error) {
      console.log("❌ 測試留言發布失敗:", error);
    }
  }
};

export default deployMessageBoard;

// Tags 在您有多個部署文件且只想運行其中一個時很有用。
// 例如：yarn deploy --tags MessageBoard
deployMessageBoard.tags = ["MessageBoard"];
