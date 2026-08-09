/// Flutter Web Client Component Example for Kestrel Trade (Built on Arc) integration.
/// Demonstrates connecting to Metamask (web3), fetching ERC20 balances, 
/// calling methods on ArcTradeEscrow, and displaying transactions / explorer links.

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:web3dart/web3dart.dart';
import 'package:web3dart/browser.dart';

class ArcBridgeIntegrationPanel extends StatefulWidget {
  const ArcBridgeIntegrationPanel({Key? key}) : super(key: key);

  @override
  _ArcBridgeIntegrationPanelState createState() => _ArcBridgeIntegrationPanelState();
}

class _ArcBridgeIntegrationPanelState extends State<ArcBridgeIntegrationPanel> {
  // --- Constants ---
  final String _rpcUrl = "https://rpc.testnet.arc.network";
  final String _escrowContractAddress = "0x54668D64923C2e591781E83a8bE66D8EAc97E492";
  final String _usdcTokenAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  final int _chainId = 42198;

  // --- Web3 State Management ---
  Web3Client? _web3client;
  String? _walletAddress;
  double _walletBalanceUSDC = 0.0;
  bool _isConnected = false;
  bool _isLoading = false;

  // --- Active Trade Escrow Parameters ---
  final String _activeTradeId = "TRD-8829-QX";
  String _escrowStatus = "Unloaded";
  double _escrowDepositedAmount = 0.0;
  String? _lastTxHash;

  @override
  void initState() {
    super.initState();
    _web3client = Web3Client(_rpcUrl, http.Client());
    _queryEscrowStatus();
  }

  // --- Web3 Methods ---

  /// Triggers MetaMask/Injected browser wallet connection on Web platforms
  Future<void> _connectWallet() async {
    setState(() => _isLoading = true);
    try {
      final eth = window.ethereum;
      if (eth == null) {
        throw Exception("No Ethereum provider (e.g. MetaMask) detected in browser context.");
      }

      // Request accounts access
      final credentials = await eth.requestAccounts();
      final walletAddress = credentials.first.address.hex;

      // Ensure user is on the correct Arc Testnet Chain
      await eth.walletAddEthereumChain(
        chainId: '0x${_chainId.toRadixString(16)}',
        chainName: 'Arc Testnet',
        rpcUrls: [_rpcUrl],
        nativeCurrency: {
          'name': 'Arc Token',
          'symbol': 'ARC',
          'decimals': 18,
        },
        blockExplorerUrls: ['https://explorer.testnet.arc.network'],
      );

      setState(() {
        _walletAddress = walletAddress;
        _isConnected = true;
      });

      await _fetchWalletBalance(walletAddress);
    } catch (e) {
      _showErrorSnackBar("Wallet Connection Failed: ${e.toString()}");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  /// Queries the ERC20 (USDC) token balance directly from the on-chain ledger
  Future<void> _fetchWalletBalance(String ownerAddress) async {
    try {
      final tokenContract = DeployedContract(
        ContractAbi.fromJson(
          jsonEncode([
            {
              "inputs": [{"name": "account", "type": "address"}],
              "name": "balanceOf",
              "outputs": [{"name": "", "type": "uint256"}],
              "stateMutability": "view",
              "type": "function"
            }
          ]),
          "MockUSDC",
        ),
        EthereumAddress.fromHex(_usdcTokenAddress),
      );

      final result = await _web3client!.call(
        contract: tokenContract,
        function: tokenContract.function("balanceOf"),
        params: [EthereumAddress.fromHex(ownerAddress)],
      );

      final BigInt balanceWei = result.first as BigInt;
      // USDC uses 6 decimals
      setState(() {
        _walletBalanceUSDC = balanceWei.toDouble() / 1000000.0;
      });
    } catch (e) {
      print("Error fetching token balance: $e");
    }
  }

  /// Pulls real-time escrow contract struct variables using view-calls
  Future<void> _queryEscrowStatus() async {
    try {
      final escrowContract = DeployedContract(
        ContractAbi.fromJson(
          jsonEncode([
            {
              "inputs": [{"name": "tradeId", "type": "string"}],
              "name": "getTrade",
              "outputs": [
                {"name": "id", "type": "string"},
                {"name": "buyer", "type": "address"},
                {"name": "supplier", "type": "address"},
                {"name": "amount", "type": "uint256"},
                {"name": "depositedAmount", "type": "uint256"},
                {"name": "status", "type": "uint8"},
                {"name": "createdAt", "type": "uint256"},
                {"name": "lockedAt", "type": "uint256"},
                {"name": "completedAt", "type": "uint256"}
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]),
          "ArcTradeEscrow",
        ),
        EthereumAddress.fromHex(_escrowContractAddress),
      );

      final result = await _web3client!.call(
        contract: escrowContract,
        function: escrowContract.function("getTrade"),
        params: [_activeTradeId],
      );

      final BigInt depositedWei = result[4] as BigInt;
      final int statusCode = (result[5] as BigInt).toInt();

      final List<String> statusStrings = [
        "Pending Deposit",
        "Escrow Locked",
        "Funds Released",
        "Funds Refunded",
        "In Dispute Arbitration"
      ];

      setState(() {
        _escrowDepositedAmount = depositedWei.toDouble() / 1000000.0;
        _escrowStatus = statusCode < statusStrings.length 
            ? statusStrings[statusCode] 
            : "Unknown Status";
      });
    } catch (e) {
      setState(() {
        _escrowStatus = "Inactive / Uncreated";
      });
    }
  }

  /// Signs and broadcasts standard ERC20 Approval & deposit transaction to Arc Trade Escrow
  Future<void> _lockEscrowDeposit() async {
    if (!_isConnected || _walletAddress == null) return;
    setState(() => _isLoading = true);

    try {
      final eth = window.ethereum!;
      // 1. Send ERC20 'approve' Transaction
      final approveTxHash = await eth.sendTransaction(
        to: _usdcTokenAddress,
        data: '0x095ea7b3' // approve(address,uint256) signature hash
            '000000000000000000000000${_escrowContractAddress.replaceFirst('0x', '')}' // Spend target
            '00000000000000000000000000000000000000000000000000000002540BE400', // Big value to approve
      );

      // 2. Send Escrow 'deposit' Transaction
      final depositTxHash = await eth.sendTransaction(
        to: _escrowContractAddress,
        data: '0xde04ef24' // deposit(string) signature hash
            '0000000000000000000000000000000000000000000000000000000000000020' // string offset
            '000000000000000000000000000000000000000000000000000000000000000d' // length (13)
            '5452442d383832392d5158000000000000000000000000000000000000000000', // 'TRD-8829-QX' raw ascii bytes padded
      );

      setState(() {
        _lastTxHash = depositTxHash;
      });

      _showSuccessSnackBar("Funds Deposited & Escrow Locked successfully!");
      await _queryEscrowStatus();
    } catch (e) {
      _showErrorSnackBar("Escrow Lock Failed: ${e.toString()}");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // --- UI Helpers ---

  void _showErrorSnackBar(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.redAccent),
    );
  }

  void _showSuccessSnackBar(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.green),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        side: const BorderSide(color: Color(0xFF141414), width: 2),
        borderRadius: BorderRadius.circular(8),
      ),
      color: const Color(0xFFFAF8F5),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Section
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                const Text(
                  "ARC PROTOCOL BINDINGS",
                  style: TextStyle(
                    fontFamily: 'SpaceGrotesk',
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.5,
                    fontSize: 16,
                  ),
                ),
                _isLoading 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                    : const Icon(Icons.bolt, color: Colors.orangeAccent),
              ],
            ),
            const Divider(color: Color(0xFF141414), height: 32, thickness: 2),

            // Connection Panel
            if (!_isConnected) ...[
              const Text(
                "Establish real-time cryptographic handshaking using MetaMask to access institutional stablecoin reserves.",
                style: TextStyle(fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _connectWallet,
                  icon: const Icon(Icons.wallet, size: 16),
                  label: const Text("CONNECT INSTITUTIONAL WALLET"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF141414),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                  ),
                ),
              ),
            ] else ...[
              // Connected State Grid
              _buildDetailRow("Wallet Address", _walletAddress!),
              _buildDetailRow("USDC Balance", "\$${_walletBalanceUSDC.toStringAsFixed(2)} USDC"),
              _buildDetailRow("Target Contract", _escrowContractAddress),
              _buildDetailRow("Active Agreement ID", _activeTradeId),
              _buildDetailRow("On-Chain Escrow Status", _escrowStatus, isStatus: true),
              _buildDetailRow("Deposited Value", "\$${_escrowDepositedAmount.toStringAsFixed(2)} USDC"),

              if (_lastTxHash != null) ...[
                const SizedBox(height: 12),
                _buildTxLinkRow(_lastTxHash!),
              ],

              const SizedBox(height: 24),
              
              // Actions Row
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _queryEscrowStatus,
                      child: const Text("POLL STATUS"),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF141414), width: 2),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _lockEscrowDeposit,
                      child: const Text("DEPOSIT & LOCK FUNDS"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF141414),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      ),
                    ),
                  ),
                ],
              ),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isStatus = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black54),
          ),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'JetBrainsMono',
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: isStatus 
                  ? (value.contains("Locked") ? Colors.green : Colors.amber[800])
                  : Colors.black,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTxLinkRow(String hash) {
    final String url = "https://explorer.testnet.arc.network/tx/$hash";
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFEDE9E3),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("LAST BROADCAST TRANSACTION", style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black45)),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Expanded(
                child: Text(
                  hash,
                  style: const TextStyle(fontFamily: 'JetBrainsMono', fontSize: 10, overflow: TextOverflow.ellipsis),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.launch, size: 14),
                onPressed: () {
                  // Standard web window launch equivalent
                  print("Navigate to Explorer: $url");
                },
              )
            ],
          )
        ],
      ),
    );
  }
}

/// JS Injected Object Interop Stubs for compiling without compile errors
class Window {
  dynamic get ethereum => null;
}
final Window window = Window();
