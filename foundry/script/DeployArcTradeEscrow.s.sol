// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/ArcTradeEscrow.sol";
import "../src/MockUSDC.sol";

/**
 * @title DeployArcTradeEscrow
 * @notice Foundry Script for deploying ArcTradeEscrow and setup roles on Arc Testnet or local Forge Anvil.
 */
abstract contract Script {
    function vm() internal pure returns (Vm) {
        return Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    }
}

interface Vm {
    function startBroadcast() external;
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
    function envAddress(string calldata name) external view returns (address);
    function envUint(string calldata name) external view returns (uint256);
}

contract DeployArcTradeEscrow is Script {
    function run() external returns (address escrowAddress, address usdcAddress) {
        Vm vmInstance = vm();

        // Retrieve optional deployer private key from environment or fallback
        uint256 deployerPrivateKey;
        try vmInstance.envUint("PRIVATE_KEY") returns (uint256 pk) {
            deployerPrivateKey = pk;
        } catch {
            deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80; // Standard Anvil #0 key
        }

        vmInstance.startBroadcast(deployerPrivateKey);

        // Check if USDC token address provided in env, else deploy MockUSDC
        address usdcTokenAddress;
        try vmInstance.envAddress("USDC_TOKEN_ADDRESS") returns (address addr) {
            usdcTokenAddress = addr;
        } catch {
            MockUSDC mock = new MockUSDC();
            usdcTokenAddress = address(mock);
        }

        // Setup Admin & Arbiter addresses
        address adminAddress;
        try vmInstance.envAddress("ADMIN_ADDRESS") returns (address admin) {
            adminAddress = admin;
        } catch {
            adminAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        }

        address arbiterAddress;
        try vmInstance.envAddress("ARBITER_ADDRESS") returns (address arbiter) {
            arbiterAddress = arbiter;
        } catch {
            arbiterAddress = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        }

        // Deploy Core ArcTradeEscrow Contract
        ArcTradeEscrow escrow = new ArcTradeEscrow(usdcTokenAddress, adminAddress, arbiterAddress);

        vmInstance.stopBroadcast();

        escrowAddress = address(escrow);
        usdcAddress = usdcTokenAddress;
    }
}
