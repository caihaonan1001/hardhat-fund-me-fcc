const { assert, expect } = require("chai")
const {deployments,ethers} = require("hardhat");
const {developmentChains} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)? 
    describe.skip
    : describe("FundMe", function() {
        let fundMe;
        let deployer;
        let mockV3Aggregator;
        const sendValue = ethers.parseEther("1");
        beforeEach(async  () => {
            await deployments.fixture(["all"]);
            deployer = (await getNamedAccounts()).deployer;
            fundMe = await ethers.getContract("FundMe", deployer);
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);

        })
        
        describe("constructor", async function(){
            it("sets the aggregator address correctly", async function(){
                const response = await fundMe.s_priceFeed();
                assert.equal(response, await mockV3Aggregator.getAddress());
            })
        })

        describe("fund", async function(){
            it("Fails if you don't send enough ETH", async () => {
                await expect(fundMe.fund()).to.be.revertedWith(
                    "You need to spend more ETH!"
                )
            })

            it("updated the amount funded data structure", async function(){
                await fundMe.fund({value: sendValue});
                const response = await fundMe.s_addressToAmountFunded(deployer);
                assert.equal(response.toString(), sendValue.toString());
            })

            it("Adds funder to array of s_funders", async function(){
                await fundMe.fund({value:sendValue});
                const response = await fundMe.s_funders(0);
                assert.equal(deployer, response);
            })
        })

        describe("Withdraw", async function(){
            beforeEach(async function(){
                await fundMe.fund({value:sendValue});
            }) 

            it("withdraw ETH from a singer founder", async function(){
                //Arrange
                const startingFundMeBalance = await ethers.provider.getBalance(
                    await fundMe.getAddress()
                );
                const startingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                );
                //Act
                const transactionResponse = await fundMe.withdraw();
                const transactionReceipt = await transactionResponse.wait(1);
                const {gasUsed, gasPrice} = transactionReceipt; 
                
                const endingFundMeBalance = await ethers.provider.getBalance(
                    await fundMe.getAddress()
                );
                const endingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                );
                //gasCost
                gasCost = gasUsed * gasPrice;
                //Assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingFundMeBalance + startingDeployerBalance, 
                    endingDeployerBalance + gasCost 
                )
            })

            it("allows us to withdraw with multiple funders", async function(){
                //Array
                const accounts = await ethers.getSigners();
                for(let i = 1; i < 6; i++){
                const fundMeConnectContract = await fundMe.connect(accounts[i]);
                await fundMeConnectContract.fund({value:sendValue});
                }
                const startingFundMeBalance = await ethers.provider.getBalance(
                    await fundMe.getAddress()
                );
                const startingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                );
                //Act
                const transactionResponse = await fundMe.withdraw();
                const transactionReceipt = await transactionResponse.wait(1);
                const {gasUsed, gasPrice} = transactionReceipt; 

                const endingFundMeBalance = await ethers.provider.getBalance(
                    await fundMe.getAddress()
                );
                const endingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                );
                //gasCost
                gasCost = gasUsed * gasPrice;
                //Assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingFundMeBalance + startingDeployerBalance, 
                    endingDeployerBalance + gasCost 
                );

                //Make sure that the funder are reset properly
                await expect(fundMe.s_funders(0)).to.be.reverted;

                for(let i = 1; i < 6; i++){
                    assert.equal(
                        await fundMe.s_addressToAmountFunded(await accounts[i].getAddress()),
                        0
                    )
                }
            })

        it("Only allows the owners to withdraw", async function(){
                const accounts = await ethers.getSigners();
                const fundMeConnectContract = await fundMe.connect(accounts[1]);
                await expect(fundMeConnectContract.withdraw()).to.be.reverted;
        })

        //    it("cheapingWithdraw testing", async function(){
        //     //Array
        //     const accounts = await ethers.getSigners();
        //     for(let i = 1; i < 6; i++){
        //        const fundMeConnectContract = await fundMe.connect(accounts[i]);
        //        await fundMeConnectContract.fund({value:sendValue});
        //     }
        //     const startingFundMeBalance = await ethers.provider.getBalance(
        //         await fundMe.getAddress()
        //     );
        //     const startingDeployerBalance = await ethers.provider.getBalance(
        //         deployer
        //     );
        //     //Act
        //     const transactionResponse = await fundMe.cheaperWithdraw();
        //     const transactionReceipt = await transactionResponse.wait(1);
        //     const {gasUsed, gasPrice} = transactionReceipt; 

        //     const endingFundMeBalance = await ethers.provider.getBalance(
        //         await fundMe.getAddress()
        //     );
        //     const endingDeployerBalance = await ethers.provider.getBalance(
        //         deployer
        //     );
        //     //gasCost
        //     gasCost = gasUsed * gasPrice;
        //     //Assert
        //     assert.equal(endingFundMeBalance, 0);
        //     assert.equal(
        //         startingFundMeBalance + startingDeployerBalance, 
        //         endingDeployerBalance + gasCost 
        //     );

        //     //Make sure that the funder are reset properly
        //     await expect(fundMe.s_funders(0)).to.be.reverted;

        //     for(let i = 1; i < 6; i++){
        //         assert.equal(
        //             await fundMe.s_addressToAmountFunded(await accounts[i].getAddress()),
        //             0
        //         )
        //     }
        //   })

        })
    })