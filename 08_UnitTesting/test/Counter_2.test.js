const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter #2", function () {
    let counter;
    let Counter;
    let owner;

    beforeEach(async function () {
        Counter = await ethers.getContractFactory("Counter");
        counter = await Counter.deploy();
        [owner] = await ethers.getSigners();
    });

    describe("Deployment", function () {
        it("Should initialize count to 0", async function () {
            expect(await counter.count()).to.equal(0);
        });
    });

    describe("Transactions", function () {
        it("Should increment count", async function () {
            await counter.increment();
            expect(await counter.count()).to.equal(1);
        });

        it("Should increment count multiple times", async function () {
            await counter.increment();
            await counter.increment();
            expect(await counter.count()).to.equal(2);
        });

        it("Should decrement count", async function () {
            await counter.increment();
            await counter.decrement();
            expect(await counter.count()).to.equal(0);
        });

        it("Should fail when decrementing at 0", async function () {
            await expect(counter.decrement()).to.be.revertedWith(
                "Count cannot be negative"
            );
        });
    });

    describe("Views", function () {
        it("Should return current count via getCount()", async function () {
            await counter.increment();
            expect(await counter.getCount()).to.equal(1);
        });
    });
});