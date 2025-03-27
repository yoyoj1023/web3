import hre from "hardhat";
const { ethers } = hre;

async function deploy() {
    const SimpleContract = await ethers.getContractFactory("SimpleContract");
    const contract = await SimpleContract.deploy();
    await contract.waitForDeployment();
      
    console.log("Contract deployed to: ", await contract.getAddress());
    return contract; // return the deployed contract
}

async function main() {
    const contract = await deploy();

    const [signer] = await ethers.getSigners();
    console.log("我的帳戶地址: ", signer.address);

    const contract_address = await contract.getAddress();

    // 設置交易參數
    const txParams = {
        to: contract_address,                                                  // 交易目標地址（合約地址）
        gasPrice: ethers.parseUnits("20", "gwei"),                             // Gas 價格，單位 Gwei
        gasLimit: 100000,                                                      // Gas 上限
        nonce: await ethers.provider.getTransactionCount(signer.address),      // 交易序號，從簽署者獲取
        value: 0,                                                              // 發送的以太幣數量（這裡不發送）
        data: contract.interface.encodeFunctionData("setValue", [100])         // 函數數據
    };

    // 發送交易
    const tx = await signer.sendTransaction(txParams);

    console.log("交易哈希:", tx.hash);

    // 等待交易確認
    const receipt = await tx.wait();

    console.log("交易已確認");
    console.log("交易收據:", receipt);

    // 檢查合約中的 value 是否更新
    const newValue = await contract.value();
    console.log("更新後的 value:", newValue.toString());

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });