// Deployment script for ArcTradeEscrow on Arc Testnet / Mainnet
const hre = require("hardhat");

async function main() {
  console.log("=====================================================");
  console.log("ArcBridge Settlement Suite - Deploying Smart Contracts");
  console.log("=====================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} ARC`);

  // Define mock or target USDC address
  let usdcTokenAddress;
  
  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    // On local test network, deploy a Mock ERC20 Token first
    console.log("Local/Testnet environment detected. Deploying Mock USDC (6 Decimals)...");
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();
    usdcTokenAddress = await mockUsdc.getAddress();
    console.log(`Mock USDC deployed at: ${usdcTokenAddress}`);
  } else {
    // On active testnet/mainnet, specify official USDC contract address
    usdcTokenAddress = process.env.USDC_TOKEN_ADDRESS;
    if (!usdcTokenAddress) {
      // Fallback testnet placeholder address
      usdcTokenAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; 
      console.warn(`[WARNING] No USDC_TOKEN_ADDRESS found in .env. Falling back to testnet placeholder: ${usdcTokenAddress}`);
    } else {
      console.log(`Using configured USDC Token address: ${usdcTokenAddress}`);
    }
  }

  // Setup roles
  const adminAddress = process.env.ADMIN_ADDRESS || deployer.address;
  const arbiterAddress = process.env.ARBITER_ADDRESS || deployer.address;

  console.log(`Configuring Roles:`);
  console.log(` - Admin / Manager: ${adminAddress}`);
  console.log(` - Compliance Arbiter: ${arbiterAddress}`);

  console.log("\nDeploying ArcTradeEscrow core smart contract...");
  const ArcTradeEscrow = await hre.ethers.getContractFactory("ArcTradeEscrow");
  const escrow = await ArcTradeEscrow.deploy(usdcTokenAddress, adminAddress, arbiterAddress);
  
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();

  console.log("=====================================================");
  console.log("DEPLOIMENT SUCCESSFUL");
  console.log("=====================================================");
  console.log(`Contract Address:               ${escrowAddress}`);
  console.log(`USDC Settlement Address:        ${usdcTokenAddress}`);
  console.log(`Deployer Wallet:                ${deployer.address}`);
  console.log(`Deployment Transaction Hash:    ${escrow.deploymentTransaction().hash}`);
  console.log(`Network ID:                     ${hre.network.config.chainId || "31337"}`);
  console.log(`Block Number:                   ${await hre.ethers.provider.getBlockNumber()}`);
  console.log("=====================================================");

  console.log("\nTo verify the contract on ArcScan:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${escrowAddress} "${usdcTokenAddress}" "${adminAddress}" "${arbiterAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
