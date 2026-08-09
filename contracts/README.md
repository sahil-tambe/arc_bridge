# Kestrel Trade — Smart Contract Escrow System & Integration Suite (Built on Arc)

This directory contains the production-grade decentralized escrow architecture for **Kestrel Trade**, a Delivery-versus-Payment (DvP) trade settlement protocol built on Arc. 

Using institutional stablecoins (USDC), this system replaces legacy paper-based letters of credit and high-fee correspondent bank transfers with programmatically guaranteed agreements.

---

## 📂 Directory Structure

```text
contracts/
├── ArcTradeEscrow.sol       # Core Solidity DvP smart contract using OpenZeppelin standards
├── MockERC20.sol            # Mock ERC20 and mock USDC token for local testing and deployments
├── hardhat.config.js        # Hardhat build, RPC networks and verification settings
├── deploy.js                # Full deployment pipeline script
├── test/
│   └── ArcTradeEscrow.js    # Comprehensive Chai/Hardhat test suite with 100% functional coverage
├── backend_service.py       # Production-ready Python FastAPI integration service using web3.py
└── frontend_flutter.dart    # Standard Dart/Flutter Web integration widget using web3dart
```

---

## ⚙️ How the Escrow Protocol Works

The smart contract coordinates a multi-party custody workflow for international cargo dispatches:

1. **Trade Structure Creation:** A platform manager initiates `createTrade` with parameters: unique `tradeId`, `buyer` address, `supplier` address, and the target settlement value (USDC, 6-decimals scale). The trade status is marked as `Pending`.
2. **Capital Deposit:** The authorized buyer calls `deposit` on-chain, transferring the required USDC value directly to the contract. Once fully funded, the state machine automatically transitions to `Locked` and captures the `lockedAt` timestamp.
3. **Dispatch & Tracking:** Funds are locked in the secure, non-reentrant contract vault. The supplier dispatches the physical shipment with real-time tracking.
4. **Verification & Settlement:** Upon cargo arrival at port-of-entry and visual inspection by the buyer, the buyer calls `releaseFunds` (or platform admins can trigger it based on validated documentation). The locked USDC is transferred instantly to the supplier, transitioning the trade status to `Released`.
5. **Refund Triggering:** If the supplier cannot dispatch the cargo or requests cancellation, they call `refundBuyer`. Funds return to the buyer, transitioning status to `Refunded`.
6. **Arbitration Center:** If shipping anomalies arise, either party can raise `raiseDispute`. An authorized legal `arbiter` resolves the dispute with `resolveDispute`, defining a custom splits parameters list (e.g. 40% buyer refund, 60% supplier payout) matching exactly the locked value.

---

## 🛠️ Installation & Setup

### Prerequisites
Make sure you have Node.js and npm installed. Initialize a project inside this directory or install the hardhat suite at the project root:

```bash
# Navigate to the contracts directory
cd contracts

# Install dependencies (Hardhat and OpenZeppelin contracts)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
```

---

## 🧪 Running Unit Tests

Our Hardhat unit tests cover:
* Access control levels (Manager vs. Arbiter vs. Unauthorized)
* Standard happy path escrow lifecycle (Deposit ➔ Lock ➔ Release)
* Disputes raising and dispute split arbitration
* Direct supplier-consented buyer refund loops
* Pausable emergency mechanisms

To run the full test suite with 100% coverage:

```bash
npx hardhat test
```

---

## 🚀 Deploiment on Arc Testnet

### 1. Configure Environment Variables
Create a `.env` file in the `contracts/` directory (never commit this to public version control):

```env
# RPC URL of Arc Network
ARC_TESTNET_RPC=https://rpc.testnet.arc.network

# Secret Key of your deployment wallet (must have testnet ARC tokens for gas)
PRIVATE_KEY=0x9f...a8

# Target Token settings (USDC address on Arc Network)
USDC_TOKEN_ADDRESS=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174

# Authorized Platform Addresses
ADMIN_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
ARBITER_ADDRESS=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

# ArcScan Explorer API Key for automatic verification
ARCSCAN_API_KEY=your_arcscan_api_key
```

### 2. Run the Compiler
Compile the smart contracts:
```bash
npx hardhat compile
```

### 3. Deploy to Arc Testnet
Deploy the contract using the provided deployment pipeline:
```bash
npx hardhat run deploy.js --network arcTestnet
```

---

## 🔍 Contract Verification

To verify your contract code directly on ArcScan, allowing developers to query status codes from the web block explorer:

```bash
npx hardhat verify --network arcTestnet <DEPLOIED_CONTRACT_ADDRESS> "<USDC_TOKEN_ADDRESS>" "<ADMIN_ADDRESS>" "<ARBITER_ADDRESS>"
```

---

## 🔗 Integrating with ArcBridge Applications

### 🐍 Backend Integration (Python FastAPI)
The included `backend_service.py` provides clean REST APIs linking FastAPI with Web3. Using `web3.py`, it signs transactions locally using standard private keys securely (simulating hardware HSM integration) and pushes confirmations:

* **Endpoint:** `POST /api/trades/create` - Configures structural details on-chain.
* **Endpoint:** `POST /api/trades/lock` - Confirms and locks active capital assets.
* **Endpoint:** `POST /api/trades/release` - Dispenses payouts instantly to supplier.
* **Endpoint:** `GET /api/trades/{trade_id}` - Reads real-time multi-sig statuses on-chain.

### 💙 Frontend Integration (Dart / Flutter Web)
The included `frontend_flutter.dart` offers a highly-optimized UI controller class demonstrating how a cross-platform Web app handshakes with browser wallets:

* Uses `BrowserProvier` to listen to Metamask events.
* Dynamically requests network shifts to `ChainID 42198` (Arc Testnet).
* Handles automated, low-friction cryptographic signatures for stablecoin approvals and deposit lockdowns.
* Listens to block confirmations and queries balances on the ledger.
