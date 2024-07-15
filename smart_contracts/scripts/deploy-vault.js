const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');
const fse = require("fs-extra");
const { verify } = require('../utils/verify');
const { getAmountInWei, developmentChains } = require('../utils/helper-scripts');

async function main() {
  // Compile the contracts
  await hre.run('compile');

  const deployNetwork = hre.network.name;

  // Test URI
  const baseURI = "ipfs://QmeHfivPyobBjSXtVUv2VHCMmugDRfZ7Qv7QfkrG4BWLQz";
  const maxSupply = 30;
  const mintCost = getAmountInWei(0.01);
  const maxMintAmount = 5;

  // Deploy KryptoPunks NFT contract 
  const NFTContract = await ethers.getContractFactory("KryptoPunks");
  const nftContract = await NFTContract.deploy(maxSupply, mintCost, maxMintAmount);
  await nftContract.deployed();

  const set_tx = await nftContract.setBaseURI(baseURI);
  await set_tx.wait();

  // Deploy KryptoPunks ERC20 token contract 
  const TokenContract = await ethers.getContractFactory("KryptoPunksToken");
  const tokenContract = await TokenContract.deploy();
  await tokenContract.deployed();

  // Deploy NFTStakingVault contract 
  const Vault = await ethers.getContractFactory("NFTStakingVault");
  const stakingVault = await Vault.deploy(nftContract.address, tokenContract.address);
  await stakingVault.deployed();

  const control_tx = await tokenContract.setController(stakingVault.address, true);
  await control_tx.wait();

  console.log("KryptoPunks NFT contract deployed at:\n", nftContract.address);
  console.log("KryptoPunks ERC20 token contract deployed at:\n", tokenContract.address);
  console.log("NFT Staking Vault deployed at:\n", stakingVault.address);
  console.log("Network deployed to:\n", deployNetwork);

  // Transfer contracts addresses & ABIs to the front-end
  const frontendPath = "/app/front-end/src";
  if (fs.existsSync(frontendPath)) {
    console.log("Frontend directory exists, proceeding with file operations.");

    const artifactsPath = `${frontendPath}/artifacts`;
    const contractsArtifactsPath = "./artifacts/contracts";
    const contractsConfigPath = `${frontendPath}/utils/contracts-config.js`;

    // Remove existing artifacts directory if it exists
    console.log("Removing existing artifacts directory...");
    fse.removeSync(artifactsPath);

    // Copy new artifacts
    console.log("Copying new artifacts...");
    fse.copySync(contractsArtifactsPath, artifactsPath);

    // Write contract addresses and ABIs
    console.log("Writing contract addresses and ABIs to contracts-config.js...");
    fs.writeFileSync(contractsConfigPath, `
      export const stakingContractAddress = "${stakingVault.address}";
      export const nftContractAddress = "${nftContract.address}";
      export const tokenContractAddress = "${tokenContract.address}";
      export const ownerAddress = "${stakingVault.signer.address}";
      export const networkDeployedTo = "${hre.network.config.chainId}";
    `);

    console.log("Contract addresses and ABIs written successfully.");
  } else {
    console.log("Frontend directory does not exist, skipping file operations.");
  }

  if (!developmentChains.includes(deployNetwork) && hre.config.etherscan.apiKey[deployNetwork]) {
    console.log("Waiting for 6 blocks verification ...");
    await stakingVault.deployTransaction.wait(6);

    // Args represent contract constructor arguments
    const args = [nftContract.address, tokenContract.address];
    await verify(stakingVault.address, args);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
