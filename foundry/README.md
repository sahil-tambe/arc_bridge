# Kestrel Trade Escrow Protocol — Foundry Project Structure (Built on Arc)

This directory contains the complete **Foundry** smart contract development suite for **Kestrel Trade**, a Delivery-versus-Payment (DvP) trade settlement protocol built for the Arc ecosystem using stablecoins (USDC).

---

## 📁 Directory Structure

```text
foundry/
├── foundry.toml                  # Foundry configuration file (solc 0.8.20, optimizer, RPC settings)
├── remappings.txt                # OpenZeppelin & Forge-std path remappings
├── src/
│   ├── ArcTradeEscrow.sol        # Production DvP Escrow smart contract with OpenZeppelin modules
│   └── MockUSDC.sol              # Mock 6-decimal USDC token for local testing
├── script/
│   └── DeployArcTradeEscrow.s.sol# Forge Deployment Script with Arc Testnet support
├── test/
│   └── ArcTradeEscrow.t.sol      # Comprehensive Forge unit test suite
└── README.md                     # Project documentation & instructions
```

---

## 🔐 OpenZeppelin Security Modules

The `ArcTradeEscrow.sol` contract incorporates standard OpenZeppelin modular primitives:
* **`ReentrancyGuard`**: Protects all state-changing transfers (`deposit`, `releaseFunds`, `refundBuyer`, `resolveDispute`) against reentrancy vectors.
* **`AccessControl`**: Enforces strict granular roles:
  * `DEFAULT_ADMIN_ROLE` (System Admin)
  * `MANAGER_ROLE` (Platform Trade Creator)
  * `ARBITER_ROLE` (Independent Dispute Mediator)
* **`Pausable`**: Provides emergency pause triggers in the event of anomalies.
* **`SafeERC20`**: Ensures safe handling of non-standard ERC20 token implementations.

---

## 🛠️ Quickstart Guide

### 1. Install Foundry
If Foundry is not installed on your local system, run:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Compile Contracts
Compile all smart contracts using forge:

```bash
cd foundry
forge build
```

### 3. Run Unit & Integration Tests
Execute the comprehensive Forge test suite:

```bash
forge test -vvv
```

To run with gas reporting:

```bash
forge test --gas-report
```

---

## 🚀 Deployment to Arc Testnet

### Environment Setup
Copy `.env.example` or export required environment variables:

```bash
export ARC_TESTNET_RPC="https://rpc.testnet.arc.network"
export PRIVATE_KEY="0x..." # Deployment private key with ARC testnet gas tokens
export USDC_TOKEN_ADDRESS="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" # Target USDC
export ADMIN_ADDRESS="0x..."
export ARBITER_ADDRESS="0x..."
export ARCSCAN_API_KEY="your_arcscan_key"
```

### Deploying using Forge Script
Run the deployment script targeting Arc Testnet:

```bash
forge script script/DeployArcTradeEscrow.s.sol:DeployArcTradeEscrow \
  --rpc-url arcTestnet \
  --broadcast \
  --verify \
  -vvvv
```

---

## 🔍 Contract Verification on ArcScan

If auto-verification wasn't triggered during broadcast, run:

```bash
forge verify-contract \
  --chain-id 42198 \
  --num-of-optimizations 200 \
  --compiler-version v0.8.20+commit.a1b79de6 \
  <DEPLOYED_CONTRACT_ADDRESS> \
  src/ArcTradeEscrow.sol:ArcTradeEscrow \
  --constructor-args $(cast abi-encode "constructor(address,address,address)" "<USDC_ADDRESS>" "<ADMIN_ADDRESS>" "<ARBITER_ADDRESS>")
```

---

## 📊 Summary of Executable Test Scenarios

1. **Role Access Controls**: Verifies admin, manager, and arbiter authorization constraints.
2. **Trade Creation & Validation**: Ensures duplicate trade IDs and invalid zero addresses are rejected.
3. **Deposit & Escrow Lock**: Confirms balance transfer and state change to `Locked`.
4. **Buyer-Triggered Payout**: Tests automated release to supplier wallet.
5. **Supplier Refund**: Tests immediate refund return to buyer.
6. **Dispute & Split Resolution**: Tests arbiter-defined split percentages.
7. **Emergency Pause**: Verifies state blocking when paused by administrator.
