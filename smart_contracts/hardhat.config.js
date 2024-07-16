// require("dotenv").config();
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

const SEPOLIA_RPC_URL =
  "https://eth-sepolia.g.alchemy.com/v2/AIjeurCVedrZLU2sSeJSrrsV_sC975tW";
const PRIVATE_KEY =
  "0x8c105d6f766052e234ea13f70c18819905c64b9a27daf0392580594f45842a94";

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
    // ganache: {
    //   chainId: 1337,
    //   url: "http://127.0.0.1:7545",
    //   accounts: [PRIVATE_KEY],
    // },
    sepolia: {
        url: SEPOLIA_RPC_URL,
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
