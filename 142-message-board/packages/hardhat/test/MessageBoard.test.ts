import { expect } from "chai";
import { ethers } from "hardhat";
import { MessageBoard } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("MessageBoard", function () {
    let messageBoard: MessageBoard;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const MessageBoard = await ethers.getContractFactory("MessageBoard");
        messageBoard = await MessageBoard.deploy();
        await messageBoard.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await messageBoard.owner()).to.equal(owner.address);
        });

        it("Should start unpaused", async function () {
            expect(await messageBoard.isPaused()).to.equal(false);
        });
    });

    describe("Posting Messages", function () {
        it("Should post a message successfully", async function () {
            const testCid = "QmTestHash123";

            await expect(messageBoard.connect(user1).postMessage(testCid))
                .to.emit(messageBoard, "MessagePosted")
                .withArgs(0, user1.address, anyValue, testCid);

            expect(await messageBoard.getTotalMessages()).to.equal(1);
        });

        it("Should reject empty CID", async function () {
            await expect(messageBoard.postMessage(""))
                .to.be.revertedWith("MessageBoard: CID cannot be empty");
        });

        it("Should reject too long CID", async function () {
            const longCid = "Q".repeat(101);
            await expect(messageBoard.postMessage(longCid))
                .to.be.revertedWith("MessageBoard: CID too long");
        });
    });

    describe("Reading Messages", function () {
        beforeEach(async function () {
            await messageBoard.connect(user1).postMessage("QmHash1");
            await messageBoard.connect(user2).postMessage("QmHash2");
        });

        it("Should return all messages", async function () {
            const messages = await messageBoard.getAllMessages();
            expect(messages.length).to.equal(2);
            expect(messages[0].sender).to.equal(user1.address);
            expect(messages[1].sender).to.equal(user2.address);
        });

        it("Should return latest messages", async function () {
            const latest = await messageBoard.getLatestMessages(1);
            expect(latest.length).to.equal(1);
            expect(latest[0].sender).to.equal(user2.address); // 最新的
        });

        it("Should return user messages", async function () {
            const userMessages = await messageBoard.getUserMessages(user1.address);
            expect(userMessages.length).to.equal(1);
            expect(userMessages[0].sender).to.equal(user1.address);
        });
    });

    describe("Admin Functions", function () {
        it("Should pause and unpause", async function () {
            await messageBoard.setPaused(true);
            expect(await messageBoard.isPaused()).to.equal(true);

            await expect(messageBoard.connect(user1).postMessage("QmTest"))
                .to.be.revertedWith("MessageBoard: Contract is paused");
        });

        it("Should reject non-owner admin calls", async function () {
            await expect(messageBoard.connect(user1).setPaused(true))
                .to.be.revertedWith("MessageBoard: Not the owner");
        });
    });
});