require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-gas-reporter");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
const Sepolia_RPC_URL = process.env.Sepolia_RPC_URL;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;
const PRIVATE_KEY = "153f2fcf6fd1d6dffb9a6b91241412adffd112bd5038ca7e540fc7a1609cdaad";

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.7",
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    ganache: {
      chainId: 1337,
      url: "http://127.0.0.1:7545",
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      url: Sepolia_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    // polygon: {
    //   url: POLYGON_RPC_URL,
    //   accounts: [process.env.PRIVATE_KEY],
    //   chainId: 137,
    // }
  },
  paths: {
    artifacts: "./artifacts",
  },
  gasReporter: {
    enabled: true,
  },
};
