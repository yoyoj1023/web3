const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LepusToken", function () {
  let LepusToken;
  let lepusToken;
  let owner;
  let addr1;
  let addr2;

  // 在每個測試用例執行前部署合約並設置環境
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    LepusToken = await ethers.getContractFactory("LepusToken");
    lepusToken = await LepusToken.deploy();
  });

  // 測試合約常數
  describe("Constants", function () {
    it("應該正確設定 TWD_TOTAL_SUPPLY", async function () {
      const twdTotalSupply = await lepusToken.TWD_TOTAL_SUPPLY();
      expect(twdTotalSupply).to.equal(64458727000000);
    });

    it("應該記錄部署時間戳", async function () {
      const deploymentTimestamp = await lepusToken.DEPLOYMENT_TIMESTAMP();
      expect(deploymentTimestamp).to.be.greaterThan(0);
      expect(deploymentTimestamp).to.be.at.most(Math.floor(Date.now() / 1000) + 10);
    });
  });

  // 測試 ERC20 功能
  describe("ERC20 Functionality", function () {
    it("應該正確設定代幣名稱和符號", async function () {
      expect(await lepusToken.name()).to.equal("LepusToken");
      expect(await lepusToken.symbol()).to.equal("LPT");
    });
    /*
    it("應該將初始供應量鑄造給部署者", async function () {
      const totalSupply = await lepusToken.totalSupply();
      const ownerBalance = await lepusToken.balanceOf(owner.address);
      expect(totalSupply).to.equal(ethers.BigNumber.from("64458727000000").mul(ethers.BigNumber.from("10").pow(18)));
      expect(ownerBalance).to.equal(totalSupply);
    });

    it("應該允許代幣轉帳", async function () {
      const amount = ethers.BigNumber.from("1000");
      await lepusToken.transfer(addr1.address, amount);
      const addr1Balance = await lepusToken.balanceOf(addr1.address);
      const ownerBalance = await lepusToken.balanceOf(owner.address);
      expect(addr1Balance).to.equal(amount);
      expect(ownerBalance).to.equal((await lepusToken.totalSupply()).sub(amount));
    });

    it("應該允許授權和從授權地址轉帳", async function () {
      const amount = ethers.BigNumber.from("1000");
      await lepusToken.approve(addr1.address, amount);
      const allowance = await lepusToken.allowance(owner.address, addr1.address);
      expect(allowance).to.equal(amount);

      const transferAmount = ethers.BigNumber.from("500");
      await lepusToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
      const addr2Balance = await lepusToken.balanceOf(addr2.address);
      const updatedAllowance = await lepusToken.allowance(owner.address, addr1.address);
      expect(addr2Balance).to.equal(transferAmount);
      expect(updatedAllowance).to.equal(amount.sub(transferAmount));
    });
    */
  });
});