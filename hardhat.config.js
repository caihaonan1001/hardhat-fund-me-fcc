//const { deployments } = require("hardhat");

require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");



const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL 
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY 

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  //solidity: "0.8.8",
  solidity: {
    compilers: [
      {version: "0.8.8"},
      {version: "0.6.6"},
    ]
  },
  defaultNetwork:"hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      // gasPrice: 130000000000,
    },
    sepolia:{
      url: SEPOLIA_RPC_URL,
      accounts:[PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    token: "MATIC",
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    customChains:[
      {
        network: "sepolia",
        chainId: 1115511,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",  // https => http
          browserURL: "https://sepolia.etherscan.io"
        }
      }
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};
