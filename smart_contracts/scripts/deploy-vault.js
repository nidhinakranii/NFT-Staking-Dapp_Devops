const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');
const fse = require("fs-extra");
const simpleGit = require('simple-git');
require('dotenv').config();

const { getAmountInWei, developmentChains } = require('../utils/helper-scripts');

async function main() {
  await hre.run('compile');

  const deployNetwork = hre.network.name;
  const baseURI = "ipfs://QmeHfivPyobBjSXtVUv2VHCMmugDRfZ7Qv7QfkrG4BWLQz";
  const maxSupply = 30;
  const mintCost = getAmountInWei(0.01);
  const maxMintAmount = 5;

  // Remove existing config if present
  const contractsConfigPath = "./contracts-config.js";
  if (fs.existsSync(contractsConfigPath)) {
    console.log("Removing existing contracts-config.js...");
    fs.unlinkSync(contractsConfigPath);
  }

  // Deploy new contracts
  console.log("Deploying KryptoPunks NFT contract...");
  const NFTContract = await ethers.getContractFactory("KryptoPunks");
  const nftContract = await NFTContract.deploy(maxSupply, mintCost, maxMintAmount);
  await nftContract.deployed();
  console.log("KryptoPunks NFT contract deployed at:", nftContract.address);

  console.log("Setting base URI...");
  await nftContract.setBaseURI(baseURI);

  console.log("Deploying KryptoPunks ERC20 token contract...");
  const TokenContract = await ethers.getContractFactory("KryptoPunksToken");
  const tokenContract = await TokenContract.deploy();
  await tokenContract.deployed();
  console.log("KryptoPunks ERC20 token contract deployed at:", tokenContract.address);

  console.log("Deploying NFT Staking Vault...");
  const Vault = await ethers.getContractFactory("NFTStakingVault");
  const stakingVault = await Vault.deploy(nftContract.address, tokenContract.address);
  await stakingVault.deployed();
  console.log("NFT Staking Vault deployed at:", stakingVault.address);

  console.log("Setting token controller...");
  await tokenContract.setController(stakingVault.address, true);

  console.log("Network deployed to:", deployNetwork);

  // Write new contract addresses to config
  console.log("Writing new contract addresses to config...");
  fs.writeFileSync(contractsConfigPath, `
    export const stakingContractAddress = "${stakingVault.address}";
    export const nftContractAddress = "${nftContract.address}";
    export const tokenContractAddress = "${tokenContract.address}";
    export const ownerAddress = "${stakingVault.signer.address}";
    export const networkDeployedTo = "${hre.network.config.chainId}";
  `);

  // Push to GitHub
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (GITHUB_TOKEN) {
    console.log("Pushing contracts-config.js to GitHub...");
    const git = simpleGit();

    // Clone or pull the repository
    const repoPath = 'kryptopunks-config';
    if (!fs.existsSync(repoPath)) {
      console.log("Cloning repository...");
      await git.clone(`https://${GITHUB_TOKEN}@github.com/nidhinakranii/kryptopunks_config.git`, repoPath);
    } else {
      console.log("Repository already exists. Pulling latest changes...");
      await git.cwd(repoPath).pull();
    }

    // Copy and push the new config
    console.log("Copying contracts-config.js to the repository...");
    await fse.copySync(contractsConfigPath, `${repoPath}/contracts-config.js`);
    await git.cwd(repoPath);
    await git.add('contracts-config.js');
    await git.commit('Update contracts-config.js');
    await git.push('origin', 'main');

    console.log('Contracts config pushed to GitHub successfully.');
  } else {
    console.log("GITHUB_TOKEN is not set. Skipping push to GitHub.");
  }

  // Verification
  if (!developmentChains.includes(deployNetwork) && hre.config.etherscan.apiKey[deployNetwork]) {
    console.log("Waiting for 6 blocks verification ...");
    await stakingVault.deployTransaction.wait(6);
    await verify(stakingVault.address, [nftContract.address, tokenContract.address]);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
