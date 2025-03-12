const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter", function () {
    let counter;
    let owner;

    // Deploy a new contract before each test
    beforeEach(async function () {
        const Counter = await ethers.getContractFactory("Counter");
        counter = await Counter.deploy();
        [owner] = await ethers.getSigners();
    });

    // Test initial state
    it("Should initialize with count of 0", async function () {
        expect(await counter.getCount()).to.equal(0);
    });

    // Test increment function
    it("Should increment counter", async function () {
        await counter.increment();
        expect(await counter.getCount()).to.equal(1);
    });

    // Test decrement function
    it("Should decrement counter", async function () {
        await counter.increment();
        await counter.decrement();
        expect(await counter.getCount()).to.equal(0);
    });

    // Test error cases
    it("Should revert when decrementing at zero", async function () {
        await expect(counter.decrement())
            .to.be.revertedWith("Count cannot be negative");
    });
});