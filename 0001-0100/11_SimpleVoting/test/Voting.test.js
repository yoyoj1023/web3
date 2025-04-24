const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting;
  let voting;
  // 定義候選人清單
  const candidates = ["Alice", "Bob", "Charlie"];

  beforeEach(async function () {
    // 取得合約工廠並部署合約
    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(candidates);
    await voting.waitForDeployment();
  });

  describe("Deployment", function () {
    it("應正確初始化候選人列表", async function () {
      for (let i = 0; i < candidates.length; i++) {
        expect(await voting.candidateList(i)).to.equal(candidates[i]);
      }
    });
  });

  describe("投票功能", function () {
    it("應允許為合法候選人投票", async function () {
      // 為候選人 "Alice" 投票
      await voting.voteForCandidate("Alice");
      expect(await voting.totalVotesFor("Alice")).to.equal(1);
    });

    it("應累計相同候選人的票數", async function () {
      // 為候選人 "Bob" 投票兩次
      await voting.voteForCandidate("Bob");
      await voting.voteForCandidate("Bob");
      expect(await voting.totalVotesFor("Bob")).to.equal(2);
    });

    it("投票不合法候選人時應 revert", async function () {
      await expect(voting.voteForCandidate("David")).to.be.revertedWith("候選人不存在");
    });

    it("查詢不合法候選人時應 revert", async function () {
      await expect(voting.totalVotesFor("David")).to.be.revertedWith("候選人不存在");
    });
  });
});
