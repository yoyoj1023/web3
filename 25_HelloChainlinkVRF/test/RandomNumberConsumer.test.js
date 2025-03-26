const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RandomNumberConsumer", function () {
    let randomNumberConsumer;
    let vrfCoordinatorMock;
    let subscriptionId;

    before(async function () {
        const VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        vrfCoordinatorMock = await VRFCoordinatorV2Mock.deploy();
        await vrfCoordinatorMock.deployed();

        const RandomNumberConsumer = await ethers.getContractFactory("RandomNumberConsumer");
        subscriptionId = 1; // Example subscription ID
        randomNumberConsumer = await RandomNumberConsumer.deploy(subscriptionId);
        await randomNumberConsumer.deployed();
    });

    it("should request a random number", async function () {
        const requestId = await randomNumberConsumer.requestRandomNumber();
        expect(requestId).to.be.a("number");
    });

    it("should fulfill the random number request", async function () {
        const requestId = await randomNumberConsumer.requestRandomNumber();
        await vrfCoordinatorMock.fulfillRandomWords(requestId, [42], randomNumberConsumer.address);

        const randomNumber = await randomNumberConsumer.getRandomNumber(requestId);
        expect(randomNumber).to.equal(42);
    });
});