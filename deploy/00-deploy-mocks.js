const {networks} = require("hardhat");
//const {hre} = require("hardhat");
const {deploymentsChains, DECIMALS, INITRAL_ANSWER} = require("../helper-hardhat-config");

module.exports = async ({getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if(chainId == "31337"){
        log("Local network detected! Deploying moacks...");
        await deploy("MockV3Aggregator",{
            constract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITRAL_ANSWER],
        });
        log("Mock deployed!");
    }
}

module.exports.tags = ["all", "mocks"];