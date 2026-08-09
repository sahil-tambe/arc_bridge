# FastAPI Backend Service Integration Example for Kestrel Trade (Built on Arc)
# Demonstrates production integration with ArcTestnet using web3.py

import os
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from web3 import Web3
from web3.middleware import geth_poa_middleware

app = FastAPI(
    title="Kestrel Trade Smart Contract Settlement API",
    description="Backend FastAPI bridge to interact with ArcTradeEscrow on Arc Testnet",
    version="1.0.0"
)

# --- Configuration & Environment Setup ---
RPC_URL = os.getenv("ARC_TESTNET_RPC", "https://rpc.testnet.arc.network")
CONTRACT_ADDRESS = os.getenv("ESCROW_CONTRACT_ADDRESS", "0x54668D64923C2e591781E83a8bE66D8EAc97E492")
MANAGER_PRIVATE_KEY = os.getenv("MANAGER_PRIVATE_KEY", "0x0000000000000000000000000000000000000000000000000000000000000000")

# --- Web3 Connection ---
w3 = Web3(Web3.HTTPProvider(RPC_URL))
# For PoA consensus chains (like Arc Testnet), inject middleware
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

if not w3.is_connected():
    print("[WARNING] Could not establish connection to Arc Testnet RPC.")
else:
    manager_account = w3.eth.account.from_key(MANAGER_PRIVATE_KEY)
    print(f"[SUCCESS] Connected to Arc Testnet. Operating account: {manager_account.address}")

# --- Contract ABI (Subset of needed functions for backend) ---
CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "tradeId", "type": "string"},
            {"internalType": "address", "name": "buyer", "type": "address"},
            {"internalType": "address", "name": "supplier", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "createTrade",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "tradeId", "type": "string"}],
        "name": "lockFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "tradeId", "type": "string"}],
        "name": "releaseFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "tradeId", "type": "string"}],
        "name": "refundBuyer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "tradeId", "type": "string"}],
        "name": "getTrade",
        "outputs": [
            {"internalType": "string", "name": "id", "type": "string"},
            {"internalType": "address", "name": "buyer", "type": "address"},
            {"internalType": "address", "name": "supplier", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "uint256", "name": "depositedAmount", "type": "uint256"},
            {"internalType": "uint8", "name": "status", "type": "uint8"},
            {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
            {"internalType": "uint256", "name": "lockedAt", "type": "uint256"},
            {"internalType": "uint256", "name": "completedAt", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

# Instantiate contract object
escrow_contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=CONTRACT_ABI)


# --- Request/Response Models ---
class TradeCreateRequest(BaseModel):
    trade_id: str = Field(..., example="TRD-9038-AF")
    buyer_address: str = Field(..., example="0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    supplier_address: str = Field(..., example="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC")
    amount_usdc: float = Field(..., description="Trade value in USDC (decimal)", example=12500.50)


class ActionRequest(BaseModel):
    trade_id: str = Field(..., example="TRD-9038-AF")


# --- Helper to Sign & Broadcast Transactions ---
def send_signed_transaction(func_call) -> str:
    """Helper to generate gas, sign with HSM/Manager key, and broadcast on-chain."""
    try:
        manager_addr = w3.eth.account.from_key(MANAGER_PRIVATE_KEY).address
        nonce = w3.eth.get_transaction_count(manager_addr)
        
        # Build transaction details
        tx = func_call.build_transaction({
            'from': manager_addr,
            'nonce': nonce,
            'gas': 300000, # Manual override or estimate_gas
            'gasPrice': w3.eth.gas_price,
            'chainId': 42198 # Arc Testnet ChainID
        })
        
        # Sign transaction locally using Manager key
        signed_tx = w3.eth.account.sign_transaction(tx, private_key=MANAGER_PRIVATE_KEY)
        
        # Send raw transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        # Wait for block receipt (can be polled asynchronously)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        if receipt.status != 1:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"EVM Transaction failed on-chain. Hash: {tx_hash.hex()}"
            )
            
        return tx_hash.hex()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Transaction creation failed: {str(e)}")


# --- API Routes ---

@app.post("/api/trades/create", response_model=Dict[str, Any])
async def create_trade_on_chain(payload: TradeCreateRequest):
    """
    Instructs the platform Manager to register a trade agreement structure on-chain.
    """
    # Convert USDC amount to 6 decimals (standard USDC scaling)
    value_in_wei = int(payload.amount_usdc * 10**6)
    
    # Initialize function call interface
    func = escrow_contract.functions.createTrade(
        payload.trade_id,
        Web3.to_checksum_address(payload.buyer_address),
        Web3.to_checksum_address(payload.supplier_address),
        value_in_wei
    )
    
    tx_hash = send_signed_transaction(func)
    
    return {
        "status": "success",
        "message": "Trade structural sheet registered on-chain",
        "trade_id": payload.trade_id,
        "transaction_hash": tx_hash,
        "explorer_url": f"https://explorer.testnet.arc.network/tx/{tx_hash}"
    }


@app.post("/api/trades/lock", response_model=Dict[str, Any])
async def lock_escrow_funds(payload: ActionRequest):
    """
    Administrative trigger to lock the funded escrow parameters (if fully matching values are present).
    """
    func = escrow_contract.functions.lockFunds(payload.trade_id)
    tx_hash = send_signed_transaction(func)
    
    return {
        "status": "success",
        "message": "Trade escrow status locked",
        "trade_id": payload.trade_id,
        "transaction_hash": tx_hash,
        "explorer_url": f"https://explorer.testnet.arc.network/tx/{tx_hash}"
    }


@app.post("/api/trades/release", response_model=Dict[str, Any])
async def release_escrow_funds(payload: ActionRequest):
    """
    Allows the platform manager (or authorized backend handler) to push release settlements to the supplier.
    """
    func = escrow_contract.functions.releaseFunds(payload.trade_id)
    tx_hash = send_signed_transaction(func)
    
    return {
        "status": "success",
        "message": "Escrow released to supplier successfully",
        "trade_id": payload.trade_id,
        "transaction_hash": tx_hash,
        "explorer_url": f"https://explorer.testnet.arc.network/tx/{tx_hash}"
    }


@app.post("/api/trades/refund", response_model=Dict[str, Any])
async def refund_escrow_buyer(payload: ActionRequest):
    """
    Allows the platform manager to execute a safe refund from escrow custody back to the buyer address.
    """
    func = escrow_contract.functions.refundBuyer(payload.trade_id)
    tx_hash = send_signed_transaction(func)
    
    return {
        "status": "success",
        "message": "Escrow refunded to buyer successfully",
        "trade_id": payload.trade_id,
        "transaction_hash": tx_hash,
        "explorer_url": f"https://explorer.testnet.arc.network/tx/{tx_hash}"
    }


@app.get("/api/trades/{trade_id}", response_model=Dict[str, Any])
async def query_trade_status(trade_id: str):
    """
    Queries real-time on-chain parameters directly from the ArcTradeEscrow contract.
    """
    try:
        raw_trade = escrow_contract.functions.getTrade(trade_id).call()
        
        # Map enum index back to verbal status
        status_mapping = {
            0: "Pending / Waiting for Deposit",
            1: "Locked in Custody Vault",
            2: "Released / Completed",
            3: "Refunded to Buyer",
            4: "Disputed / Arbitration Lock"
        }
        
        return {
            "trade_id": raw_trade[0],
            "buyer": raw_trade[1],
            "supplier": raw_trade[2],
            "amount_usdc": float(raw_trade[3]) / 10**6,
            "deposited_amount_usdc": float(raw_trade[4]) / 10**6,
            "status_code": raw_trade[5],
            "status_label": status_mapping.get(raw_trade[5], "Unknown Status"),
            "created_at_timestamp": raw_trade[6],
            "locked_at_timestamp": raw_trade[7],
            "completed_at_timestamp": raw_trade[8]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failed to fetch trade '{trade_id}' on-chain. Error: {str(e)}"
        )
