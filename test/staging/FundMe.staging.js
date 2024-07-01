const { network, ethers,getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

developmentChains.includes(network.name)? 
    describe.skip
    : describe("FundMe Staging Tests", async function(){
        let fundMe;
        let deployer;
        let mockV3Aggregator;
        const sendValue = ethers.parseEther("2");

        beforeEach(async  () => {
            deployer = (await getNamedAccounts()).deployer;
            fundMe = await ethers.getContract("FundMe", deployer);
        })

        it("allows people to fund and withdraw", async function(){
            await fundMe.fund({value: sendValue});
            await fundMe.withdraw();
            const endingBalance = await ethers.provider.getBalance(
                await fundMe.getAddress()
            );
            assert.equal(endingBalance.toString(), "0");

        })

    })