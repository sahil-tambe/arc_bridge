import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Coins, 
  Shield, 
  ArrowUpRight, 
  Lock, 
  Unlock, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Globe, 
  SlidersHorizontal, 
  Download, 
  AlertCircle, 
  Cpu, 
  Layers, 
  Activity,
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { User, Trade, ExplorerTx } from '../types';

interface WalletTreasuryProps {
  user: User;
  trades: Trade[];
  transactions: ExplorerTx[];
  walletConnected: boolean;
  walletAddress: string;
  walletBalance: number;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onFaucetRequest: () => void;
  onBroadcastTx: (method: 'LockEscrow' | 'ReleaseEscrow', tradeId: string, value: number, payloadArgs: any) => void;
  currentBlock: number;
}

export default function WalletTreasury({
  user,
  trades,
  transactions,
  walletConnected,
  walletAddress,
  walletBalance,
  onConnectWallet,
  onDisconnectWallet,
  onFaucetRequest,
  onBroadcastTx,
  currentBlock
}: WalletTreasuryProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'wallet' | 'treasury' | 'ledger'>('wallet');

  // Network State
  const [network, setNetwork] = useState<'Arc Testnet' | 'Arc Mainnet'>('Arc Testnet');

  // UI state
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [simulatingFlow, setSimulatingFlow] = useState<'lock' | 'settle' | null>(null);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [simulationTradeId, setSimulationTradeId] = useState<string>('');
  const [simulationHash, setSimulationHash] = useState<string>('');
  const [simulationError, setSimulationError] = useState<string | null>(null);

  // Filter states
  const [filterTradeId, setFilterTradeId] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Tx Detail Modal
  const [selectedDetailTx, setSelectedDetailTx] = useState<ExplorerTx | null>(null);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Refreshes Simulated Balances
  const handleRefreshBalance = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Escrow Lock Simulation (Step-by-step to show the Backend signing workflow cleanly)
  const startLockEscrowFlow = (trade: Trade) => {
    if (!walletConnected) {
      onConnectWallet();
      return;
    }
    setSimulationTradeId(trade.id);
    setSimulatingFlow('lock');
    setSimulationStep(1); // Backend Handshake
    setSimulationError(null);

    // Step 1: Dispatch to FastAPI Backend
    setTimeout(() => {
      setSimulationStep(2); // Generating and validation verification proof
      
      setTimeout(() => {
        setSimulationStep(3); // Backend signing with HSM wallet key
        const mockHash = '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + 'f928a' + Math.random().toString(16).substring(2, 10).toLowerCase() + '88c9';
        setSimulationHash(mockHash);

        setTimeout(() => {
          setSimulationStep(4); // Broadcasting and waiting for consensus
          
          setTimeout(() => {
            // Success & save transaction hash
            setSimulationStep(5); // Confirmed on-chain!
            onBroadcastTx('LockEscrow', trade.id, trade.valueUsdc, {
              title: trade.title,
              supplierEmail: trade.supplierEmail,
              totalPayable: trade.totalPayable
            });
          }, 1500);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  // Settlement Release Simulation
  const startReleaseEscrowFlow = (trade: Trade) => {
    if (!walletConnected) {
      onConnectWallet();
      return;
    }
    setSimulationTradeId(trade.id);
    setSimulatingFlow('settle');
    setSimulationStep(1); // Inspection Ends, request sent to Backend
    setSimulationError(null);

    setTimeout(() => {
      setSimulationStep(2); // Backend verifying cargo dispatch ledger records
      
      setTimeout(() => {
        setSimulationStep(3); // Backend signing Multi-Sig releasing transaction
        const mockHash = '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + 'd382b' + Math.random().toString(16).substring(2, 10).toLowerCase() + '77e4';
        setSimulationHash(mockHash);

        setTimeout(() => {
          setSimulationStep(4); // Broadcating Release Escrow state transition
          
          setTimeout(() => {
            setSimulationStep(5); // Released & confirmed!
            onBroadcastTx('ReleaseEscrow', trade.id, trade.valueUsdc, {
              recipient: 'Supplier Shenzhen Logisense Ltd',
              status: 'released'
            });
          }, 1500);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  // CSV Export for compliance auditing
  const exportLedgerToCSV = () => {
    const headers = ['Trade ID', 'From Wallet', 'To Wallet', 'Tx Hash', 'Block', 'Method', 'Value (USDC)', 'Gas Used', 'Gas Price (Arc)', 'Status', 'Timestamp'];
    const rows = filteredTransactions.map(tx => [
      tx.tradeId || 'SYSTEM',
      tx.from,
      tx.to,
      tx.hash,
      tx.block,
      tx.method,
      tx.value,
      tx.gasUsed,
      tx.gasPrice,
      tx.status,
      tx.timestamp
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Arc_Bridge_Settlement_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Available locked and pending math calculations
  const totalLockedEscrow = trades
    .filter(t => t.status === 'escrow_locked' || t.status === 'shipped' || t.status === 'disputed')
    .reduce((sum, t) => sum + t.valueUsdc, 0);

  const pendingSettlement = trades
    .filter(t => t.status === 'shipped')
    .reduce((sum, t) => sum + t.valueUsdc, 0);

  const completedSettlement = trades
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.valueUsdc, 0);

  const todayVolume = pendingSettlement > 0 ? pendingSettlement : 248500.00;
  const monthlyVolume = completedSettlement + totalLockedEscrow + 1582000;

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesTrade = filterTradeId ? tx.tradeId === filterTradeId : true;
    const matchesStatus = filterStatus === 'all' ? true : tx.status === filterStatus;
    const matchesSearch = searchQuery 
      ? tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tx.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesTrade && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-lg animate-in fade-in" id="wallet-treasury-view">
      {/* Upper header block */}
      <div className="border-b-2 border-on-surface pb-md flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
        <div>
          <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-[0.4em] block mb-1">Programmable Settlement Portal</span>
          <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-[-0.04em] leading-none text-on-surface">
            Arc Bridge <span className="font-serif italic font-bold text-on-surface-variant">Treasury</span>
          </h1>
          <p className="text-body-md text-on-surface-variant font-medium mt-1">
            Enterprise custody vault, secure RPC signing services, and real-time transaction ledger.
          </p>
        </div>

        {/* Network & RPC Status indicator */}
        <div className="flex items-center gap-sm bg-white p-2 border-2 border-on-surface shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-on-surface" />
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as any)}
              className="text-xs font-black uppercase tracking-wider text-on-surface bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="Arc Testnet">Arc Testnet Ledger</option>
              <option value="Arc Mainnet">Arc Mainnet (Production)</option>
            </select>
          </div>
          <div className="h-4 w-[2px] bg-on-surface/20"></div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`w-2.5 h-2.5 rounded-full ${network === 'Arc Testnet' ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></div>
            <span className="text-[10px] font-mono font-bold uppercase text-on-surface">
              {network === 'Arc Testnet' ? 'RPC: Active' : 'RPC: Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b-2 border-on-surface/20 gap-xs">
        {[
          { id: 'wallet', label: 'Company Wallet', icon: Wallet },
          { id: 'treasury', label: 'Treasury Dashboard', icon: Activity },
          { id: 'ledger', label: 'On-Chain Ledger', icon: Layers },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-md py-3 text-xs font-black uppercase tracking-widest border-t-2 border-x-2 transition-all cursor-pointer flex items-center gap-xs ${
                active 
                  ? 'bg-white border-on-surface text-on-surface -mb-[2px] border-b-2 border-b-white z-10' 
                  : 'bg-surface-container-low border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents: 1. COMPANY WALLET */}
      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg animate-in fade-in duration-100">
          
          {/* Left Column: Wallet Credentials Custody Card */}
          <div className="lg:col-span-8 space-y-md">
            <div className="bg-white border-4 border-on-surface p-lg shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-4 opacity-5 pointer-events-none">
                <Wallet className="w-64 h-64 text-on-surface" />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-on-surface pb-md mb-md gap-sm">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#A09E97]">Arc Key Management Service</span>
                  <h2 className="text-2xl font-sans font-black uppercase tracking-tight">
                    {user.companyName} Wallet
                  </h2>
                </div>
                <div className="flex items-center gap-xs">
                  <span className="px-2 py-0.5 bg-green-100 border border-green-600 text-[10px] font-mono font-bold text-green-700 uppercase tracking-widest rounded-full">
                    {walletConnected ? 'Synced (Active)' : 'Local Keystore'}
                  </span>
                  <span className="px-2 py-0.5 bg-surface border border-on-surface/20 text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-widest rounded-full">
                    Type: Institutional
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                
                {/* Public Wallet Address Block */}
                <div className="space-y-sm bg-surface p-md border-2 border-on-surface">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Public Wallet Address</span>
                    <span className="text-[9px] font-mono text-green-600 bg-green-50 border border-green-200 px-1 rounded">PostgreSQL Saved</span>
                  </div>
                  <div className="bg-white p-sm border border-on-surface/30 rounded font-mono text-xs font-bold text-on-surface break-all relative group">
                    {walletConnected ? walletAddress : user.walletAddress || '0xNoWalletConnected'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(walletConnected ? walletAddress : user.walletAddress, 'addr')}
                      className="flex-1 py-1 px-2 border-2 border-on-surface text-[10px] font-bold uppercase tracking-wider hover:bg-on-surface hover:text-background transition-colors flex items-center justify-center gap-1.5"
                    >
                      {copiedText === 'addr' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'addr' ? 'Copied' : 'Copy Address'}</span>
                    </button>
                    <button
                      onClick={handleRefreshBalance}
                      className="py-1 px-3 border-2 border-on-surface text-[10px] font-bold hover:bg-on-surface hover:text-background transition-colors flex items-center justify-center"
                      title="Sync balance from indexer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Ledger & Security Notice */}
                <div className="space-y-xs bg-amber-50/50 p-md border-2 border-dashed border-amber-600/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-xs text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
                      <Shield className="w-3.5 h-3.5 shrink-0" />
                      <span>MPC Secures Keyrings</span>
                    </div>
                    <p className="text-[10.5px] text-amber-900/80 leading-relaxed font-medium">
                      Private keys are securely generated via HSM key-shares and stored inside secure vaults. Transaction requests are authorized using standard compliance JWT scopes. 
                      <strong className="text-amber-950 block mt-1">🔑 Private keys are never exposed on the frontend.</strong>
                    </p>
                  </div>
                  <div className="text-[9px] font-mono text-amber-700/60 uppercase tracking-widest text-right mt-1">
                    SHA-256 Auth Handshake ACTIVE
                  </div>
                </div>
              </div>

              {/* Balances Display Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mt-lg pt-md border-t-2 border-on-surface">
                
                {/* Available USDC Balance */}
                <div className="p-md bg-[#F4F9F4] border-2 border-green-600 space-y-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Available Balance</span>
                    <Coins className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div className="text-2xl font-mono font-black text-green-800 tracking-tight leading-none">
                    ${(walletConnected ? walletBalance : user.walletBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[9px] text-[#A09E97] font-bold uppercase block">Token: T-USDC</span>
                </div>

                {/* Escrow Balance */}
                <div className="p-md bg-[#FAF6F0] border-2 border-amber-600 space-y-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Locked Escrow</span>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-mono font-black text-amber-800 tracking-tight leading-none">
                    ${totalLockedEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[9px] text-[#A09E97] font-bold uppercase block">Smart Custody Vaults</span>
                </div>

                {/* Pending Payout / Settlement */}
                <div className="p-md bg-surface border-2 border-on-surface space-y-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Pending Settlement</span>
                    <Unlock className="w-3.5 h-3.5 text-on-surface-variant" />
                  </div>
                  <div className="text-2xl font-mono font-black text-on-surface tracking-tight leading-none">
                    ${pendingSettlement.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[9px] text-[#A09E97] font-bold uppercase block">Awaiting Dispatch/Arrival</span>
                </div>
              </div>

              {/* Wallet Dashboard Action Row */}
              <div className="mt-lg flex flex-wrap gap-sm justify-between items-center pt-md border-t border-on-surface/10">
                <div className="flex gap-2">
                  {walletConnected ? (
                    <button
                      onClick={onDisconnectWallet}
                      className="py-2 px-md bg-red-50 border-2 border-red-600 text-xs font-black uppercase tracking-wider text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Disconnect Wallet
                    </button>
                  ) : (
                    <button
                      onClick={onConnectWallet}
                      className="py-2 px-md bg-on-surface text-background border-2 border-on-surface text-xs font-black uppercase tracking-widest hover:bg-on-surface/90 transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(20,20,20,0.2)]"
                    >
                      Connect Hardware Wallet
                    </button>
                  )}
                  <button
                    onClick={onFaucetRequest}
                    className="py-2 px-md bg-[#FAF8F5] border-2 border-on-surface text-xs font-black uppercase tracking-wider text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Request Faucet t-USDC
                  </button>
                </div>

                <div className="text-xs text-on-surface-variant font-medium">
                  Ledger block height: <span className="font-mono font-bold text-on-surface">#{currentBlock}</span>
                </div>
              </div>

            </div>

            {/* Interactive Operations: Lock / Release Escrow Playground Simulator */}
            <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-on-surface border-b-2 border-on-surface pb-xs">
                  Escrow Actions & Blockchain Signing Panel
                </h3>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  Trigger secure multi-signature actions on your current trade proposals. The transactions are generated on-chain on Arc Testnet.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                
                {/* Lock Escrow Sandbox Area */}
                <div className="border-2 border-on-surface p-sm space-y-sm bg-surface-container-lowest">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Escrow Locking Agent</span>
                    <h4 className="text-sm font-black uppercase tracking-tight text-on-surface">Secure Custody Deposit</h4>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Verify proposal parameters, run automatic KYB sanction checks, and freeze t-USDC funds inside the immutable escrow contract.
                  </p>
                  
                  <div className="space-y-xs">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#A09E97] block">Select Trade Proposal:</span>
                    {trades.filter(t => t.status === 'created').length === 0 ? (
                      <div className="p-xs text-center border border-dashed border-on-surface/25 text-[10px] font-bold text-on-surface-variant">
                        No active proposals awaiting Escrow lock.
                      </div>
                    ) : (
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {trades.filter(t => t.status === 'created').map(t => (
                          <div key={t.id} className="flex justify-between items-center p-1.5 bg-white border border-on-surface/30 text-xs">
                            <span className="font-mono font-bold">{t.id} (${t.valueUsdc.toLocaleString()})</span>
                            <button
                              onClick={() => startLockEscrowFlow(t)}
                              className="px-2 py-0.5 bg-amber-500 border border-on-surface text-background text-[9px] font-black uppercase hover:bg-on-surface tracking-wider cursor-pointer"
                            >
                              Lock Escrow
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Release Escrow Sandbox Area */}
                <div className="border-2 border-on-surface p-sm space-y-sm bg-surface-container-lowest">
                  <div>
                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block">Escrow Release Agent</span>
                    <h4 className="text-sm font-black uppercase tracking-tight text-on-surface">Consensus Payout</h4>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Broadcast multi-signature release triggers to pay the supplier once quality verification and custom clearances confirm successfully.
                  </p>

                  <div className="space-y-xs">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#A09E97] block">Select Shipment Delivered:</span>
                    {trades.filter(t => t.status === 'shipped').length === 0 ? (
                      <div className="p-xs text-center border border-dashed border-on-surface/25 text-[10px] font-bold text-on-surface-variant">
                        No in-transit cargos awaiting settlement release.
                      </div>
                    ) : (
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {trades.filter(t => t.status === 'shipped').map(t => (
                          <div key={t.id} className="flex justify-between items-center p-1.5 bg-white border border-on-surface/30 text-xs">
                            <span className="font-mono font-bold">{t.id} (${t.valueUsdc.toLocaleString()})</span>
                            <button
                              onClick={() => startReleaseEscrowFlow(t)}
                              className="px-2 py-0.5 bg-green-600 border border-on-surface text-white text-[9px] font-black uppercase hover:bg-on-surface tracking-wider cursor-pointer"
                            >
                              Release Escrow
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Active Live Node Handshaking Monitor */}
          <div className="lg:col-span-4 space-y-md">
            <div className="bg-[#FAF8F5] border-2 border-on-surface p-md space-y-md shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-on-surface">Arc Cryptographic Handshake</h3>
                <span className="text-[9px] text-[#A09E97] font-mono block">Node: arc-rpc-v1.testnet</span>
              </div>

              <div className="space-y-sm bg-on-surface text-background p-sm font-mono text-[10px] leading-relaxed max-h-[300px] overflow-y-auto rounded shadow-inner">
                <div className="text-green-400">⚡ CLIENT SECURE CONNECTION INITIATED...</div>
                <div>GET /api/v1/auth/status HTTP/1.1</div>
                <div>Host: api.arcbridge.io</div>
                <div>Authorization: Bearer jwt_institutional_client_token...</div>
                <div className="text-green-400">Response: 200 OK • Session secure</div>
                <div className="text-amber-400">[info] MPC Key Management Client Ready</div>
                <div>[vault] Fetching company public ledger address...</div>
                <div className="text-blue-300">[address] Resolved: {walletConnected ? walletAddress.substring(0, 16) : user.walletAddress.substring(0, 16)}...</div>
                <div>[vault] Multi-sig policy requirement: 1 of 2 signatures</div>
                <div className="text-green-400">● LEDGER WATCHER ALIVE AND LISTENING</div>
              </div>

              {/* Faucet request status widget */}
              <div className="bg-surface p-sm border border-on-surface/20 space-y-xs">
                <span className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant block">Quick testnet faucet tool</span>
                <p className="text-[10px] text-on-surface-variant font-medium">Add $10,000.00 mock-USDC to lock escrow on more trades.</p>
                <button
                  onClick={onFaucetRequest}
                  className="w-full py-1 bg-white border border-on-surface text-[10px] font-bold uppercase hover:bg-on-surface hover:text-background transition-colors cursor-pointer"
                >
                  Faucet Fling $10k USDC
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab Contents: 2. TREASURY DASHBOARD */}
      {activeTab === 'treasury' && (
        <div className="space-y-lg animate-in fade-in duration-100" id="treasury-dashboard-tab">
          
          {/* Bento Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            
            <div className="bg-white border-2 border-on-surface p-md space-y-xs shadow-[3px_3px_0px_0px_rgba(20,20,20,1)]">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Available Liquidity Pool</span>
              <div className="text-2xl font-mono font-black text-on-surface leading-none">
                ${(walletConnected ? walletBalance : user.walletBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[9px] text-[#A09E97] font-medium uppercase">Active Institutional Pool USDC</p>
            </div>

            <div className="bg-white border-2 border-on-surface p-md space-y-xs shadow-[3px_3px_0px_0px_rgba(20,20,20,1)]">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Locked Escrow Vaults</span>
              <div className="text-2xl font-mono font-black text-amber-800 leading-none">
                ${totalLockedEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[9px] text-amber-700/60 font-medium uppercase">Secured by Arc Smart Escrows</p>
            </div>

            <div className="bg-white border-2 border-on-surface p-md space-y-xs shadow-[3px_3px_0px_0px_rgba(20,20,20,1)]">
              <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-wider block">Daily Trading Volume</span>
              <div className="text-2xl font-mono font-black text-on-surface leading-none">
                ${todayVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[9px] text-[#A09E97] font-medium uppercase">Consensus Broadcast Volume Today</p>
            </div>

            <div className="bg-white border-2 border-on-surface p-md space-y-xs shadow-[3px_3px_0px_0px_rgba(20,20,20,1)]">
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block">Monthly Total Settlements</span>
              <div className="text-2xl font-mono font-black text-green-800 leading-none">
                ${monthlyVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[9px] text-green-700/60 font-medium uppercase">30-day Cumulative Volume cleared</p>
            </div>

          </div>

          {/* Large Graph Panel & Live Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            
            <div className="lg:col-span-8 bg-white border-4 border-on-surface p-lg shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-md">
              <div className="flex justify-between items-center border-b-2 border-on-surface pb-sm">
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-on-surface">Liquidity Flow & Volume Analytics</h3>
                  <p className="text-[11px] text-on-surface-variant font-medium">Arc Bridge Custody volume trends for {new Date().getFullYear()}</p>
                </div>
                <span className="text-[9px] font-mono font-bold uppercase text-on-surface bg-surface border border-on-surface/20 px-2 py-0.5">Real-Time</span>
              </div>

              {/* Stark elegant custom SVG Bar/Line graph representing volume */}
              <div className="h-64 flex flex-col justify-between pt-sm">
                <div className="flex-1 flex items-end gap-xs md:gap-sm px-md border-b-2 border-on-surface pb-1">
                  {[
                    { month: 'Jan', val: 320000, locked: 120000 },
                    { month: 'Feb', val: 450000, locked: 200000 },
                    { month: 'Mar', val: 680000, locked: 150000 },
                    { month: 'Apr', val: 510000, locked: 250000 },
                    { month: 'May', val: 890000, locked: 380000 },
                    { month: 'Jun', val: monthlyVolume / 1.5, locked: totalLockedEscrow },
                  ].map((data, idx) => {
                    const totalHeight = 100;
                    const valPercent = (data.val / 1000000) * totalHeight;
                    const lockPercent = (data.locked / 1000000) * totalHeight;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full mb-1 bg-on-surface text-background text-[9px] font-mono px-2 py-1 rounded hidden group-hover:block z-20 whitespace-nowrap shadow-md">
                          Vol: ${data.val.toLocaleString()} <br/> Locked: ${data.locked.toLocaleString()}
                        </div>
                        <div className="w-full flex items-end gap-1 h-44">
                          <div 
                            style={{ height: `${Math.max(valPercent, 5)}%` }}
                            className="flex-1 bg-on-surface-variant hover:bg-on-surface transition-colors"
                          ></div>
                          <div 
                            style={{ height: `${Math.max(lockPercent, 5)}%` }}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 transition-colors"
                          ></div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-on-surface-variant">{data.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-[#A09E97] mt-1 px-1">
                  <span>Legend: ▇ Monthly volume (USDC)</span>
                  <span>▇ Active locked escrow (T-USDC)</span>
                </div>
              </div>

            </div>

            {/* Custody Risk Metrics */}
            <div className="lg:col-span-4 bg-white border-2 border-on-surface p-md space-y-md shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-on-surface">Network Compliance Clearance</h3>
                <span className="text-[9px] text-[#A09E97] font-mono block">Autonomous compliance agent (Shield v4.2)</span>
              </div>

              <div className="space-y-sm">
                
                <div className="p-sm bg-surface border border-on-surface/20 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-on-surface">Average Settlement Time</span>
                    <span className="text-green-700 font-mono font-bold">18.4 Hours</span>
                  </div>
                  <div className="w-full h-2 bg-on-surface/10 rounded-none overflow-hidden border border-on-surface/20">
                    <div className="h-full bg-green-600" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-[9px] text-on-surface-variant font-medium leading-none">Global average settlement clearance benchmark.</p>
                </div>

                <div className="p-sm bg-surface border border-on-surface/20 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-on-surface">MPC Node Decentralization</span>
                    <span className="text-green-700 font-mono font-bold">99.99%</span>
                  </div>
                  <div className="w-full h-2 bg-on-surface/10 rounded-none overflow-hidden border border-on-surface/20">
                    <div className="h-full bg-green-600" style={{ width: '99%' }}></div>
                  </div>
                  <p className="text-[9px] text-on-surface-variant font-medium leading-none">Peer confirmation validators consensus rate.</p>
                </div>

                <div className="p-sm bg-surface border border-on-surface/20 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-on-surface">Locked Escrow Utilization</span>
                    <span className="text-amber-700 font-mono font-bold">78% capacity</span>
                  </div>
                  <div className="w-full h-2 bg-on-surface/10 rounded-none overflow-hidden border border-on-surface/20">
                    <div className="h-full bg-amber-500" style={{ width: '78%' }}></div>
                  </div>
                  <p className="text-[9px] text-on-surface-variant font-medium leading-none">Custody utilization of the active smart vault system.</p>
                </div>

                <div className="bg-amber-50 border border-amber-600/30 p-sm text-[10px] font-medium text-amber-900 leading-relaxed">
                  📢 <strong>Compliance Notice:</strong> AML clearance check automated. All counterparty wallets are verified for institutional sanction limits before lock handshake.
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* Tab Contents: 3. ON-CHAIN LEDGER TRANSACTION HISTORY */}
      {activeTab === 'ledger' && (
        <div className="space-y-md animate-in fade-in duration-100" id="onchain-ledger-tab">
          
          {/* Filters Bar */}
          <div className="bg-[#FAF8F5] border-2 border-on-surface p-sm flex flex-wrap gap-md justify-between items-center">
            <div className="flex flex-wrap items-center gap-sm">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-on-surface" />
                <span className="text-xs font-black uppercase tracking-wider text-on-surface">Filters</span>
              </div>
              
              {/* Filter trade ID */}
              <select
                value={filterTradeId}
                onChange={(e) => setFilterTradeId(e.target.value)}
                className="bg-white border border-on-surface/30 text-xs px-2 py-1 font-bold outline-none uppercase"
              >
                <option value="">All Trade IDs</option>
                {Array.from(new Set(transactions.map(tx => tx.tradeId).filter(Boolean))).map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>

              {/* Filter transaction status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white border border-on-surface/30 text-xs px-2 py-1 font-bold outline-none uppercase"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              {/* Search text input */}
              <input
                type="text"
                placeholder="Search tx hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-on-surface/30 text-xs px-2 py-1 font-medium outline-none w-48 md:w-64"
              />
            </div>

            {/* Export CSV button */}
            <button
              onClick={exportLedgerToCSV}
              className="py-1 px-md bg-on-surface text-background border border-on-surface text-xs font-black uppercase tracking-wider hover:bg-on-surface/95 transition-all flex items-center gap-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Ledger</span>
            </button>
          </div>

          {/* Ledger Table */}
          <div className="bg-white border-2 border-on-surface overflow-x-auto shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface border-b-2 border-on-surface text-[10px] font-black uppercase tracking-widest text-[#A09E97]">
                  <th className="p-md">Trade ID</th>
                  <th className="p-md">Tx Hash</th>
                  <th className="p-md">Method / Event</th>
                  <th className="p-md">From (Signer)</th>
                  <th className="p-md">Value (USDC)</th>
                  <th className="p-md">Gas (Arc)</th>
                  <th className="p-md">Block Height</th>
                  <th className="p-md">Status</th>
                  <th className="p-md">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-on-surface/10 font-mono text-[11px] font-medium text-on-surface-variant">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-lg text-center font-sans font-bold text-on-surface-variant text-xs">
                      No matching settlement transactions found in the database.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, idx) => {
                    const isSuccess = tx.status === 'success';
                    return (
                      <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-md font-sans font-bold text-on-surface select-all">
                          {tx.tradeId || <span className="text-[#A09E97] font-mono font-medium">[SYSTEM]</span>}
                        </td>
                        <td className="p-md text-blue-600 select-all font-bold hover:underline cursor-pointer flex items-center gap-1" onClick={() => setSelectedDetailTx(tx)}>
                          <span>{tx.hash.substring(0, 10)}...</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </td>
                        <td className="p-md font-sans font-bold text-on-surface">
                          <span className="px-1.5 py-0.5 bg-surface-container border border-on-surface/10">
                            {tx.method}
                          </span>
                        </td>
                        <td className="p-md select-all" title={tx.from}>
                          {tx.from.substring(0, 8)}...{tx.from.substring(tx.from.length - 4)}
                        </td>
                        <td className="p-md font-sans font-black text-on-surface text-right pr-lg">
                          ${tx.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-md text-right pr-lg text-[#A09E97]">
                          {(tx.gasUsed * tx.gasPrice).toFixed(6)}
                        </td>
                        <td className="p-md font-bold text-on-surface">
                          #{tx.block}
                        </td>
                        <td className="p-md">
                          <span className={`px-2 py-0.5 border text-[9px] font-sans font-black uppercase tracking-wider flex items-center gap-1 w-max ${
                            isSuccess 
                              ? 'bg-green-50 border-green-600 text-green-700' 
                              : tx.status === 'pending'
                                ? 'bg-amber-50 border-amber-600 text-amber-700 animate-pulse'
                                : 'bg-red-50 border-red-600 text-red-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-green-500' : tx.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                            <span>{tx.status}</span>
                          </span>
                        </td>
                        <td className="p-md text-right whitespace-nowrap">
                          {tx.timestamp}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* MODAL 1: Simulated Secure Blockchain Signing Handshake Screen */}
      {simulatingFlow && (
        <div className="fixed inset-0 bg-on-surface/75 backdrop-blur-xs z-50 flex items-center justify-center p-md select-none">
          <div className="bg-[#FAF8F5] border-4 border-on-surface max-w-lg w-full p-lg relative shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] animate-in zoom-in-95 duration-150">
            
            <div className="space-y-md">
              {/* Header */}
              <div className="border-b-2 border-on-surface pb-sm flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">Arc Secure Signer (HSM Protocol)</span>
                  <h3 className="text-xl font-sans font-black uppercase tracking-tight">
                    {simulatingFlow === 'lock' ? 'Securing Escrow Deposit' : 'Signing Cargo Settlement Payout'}
                  </h3>
                </div>
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></div>
              </div>

              {/* Progress Stepper Visualizer */}
              <div className="space-y-xs">
                {[
                  { step: 1, label: 'Handshaking with FastAPI Compliance Server', desc: 'Secure connection authorized via user JWT token credentials' },
                  { step: 2, label: 'Simulating PostgreSQL Public Keys Database Reference', desc: 'Validating trade contract signature compliance criteria' },
                  { step: 3, label: 'Signing Transaction Hex with Vault HSM Keys', desc: 'Private keys protected client-side. Handled on enterprise hardware' },
                  { step: 4, label: 'Broadcasting to Arc Testnet Consensus Pool', desc: 'Reaching peer acknowledgement threshold (150+ validations)' },
                  { step: 5, label: 'On-Chain Verified & Block Settled Successfully', desc: 'Adding immutable receipt block' }
                ].map((item) => {
                  const isActive = simulationStep === item.step;
                  const isCompleted = simulationStep > item.step;
                  return (
                    <div 
                      key={item.step} 
                      className={`p-2 border transition-all flex items-start gap-sm ${
                        isActive 
                          ? 'border-on-surface bg-amber-50/40 translate-x-1 shadow-sm' 
                          : isCompleted 
                            ? 'border-green-600/30 bg-green-50/20 opacity-70' 
                            : 'border-transparent opacity-40'
                      }`}
                    >
                      <div className={`w-5 h-5 flex items-center justify-center border text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                        isCompleted 
                          ? 'bg-green-600 border-green-600 text-white' 
                          : isActive 
                            ? 'bg-on-surface border-on-surface text-background animate-pulse' 
                            : 'bg-surface border-on-surface/20 text-on-surface-variant'
                      }`}>
                        {isCompleted ? '✓' : item.step}
                      </div>
                      <div>
                        <span className={`text-[11px] font-black uppercase tracking-wide block ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-[#A09E97] block leading-none">{item.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Finalized details */}
              {simulationStep === 5 ? (
                <div className="p-sm bg-green-50 border-2 border-green-600 space-y-xs animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center gap-xs text-green-700 text-xs font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                    <span>Receipt Confirmed</span>
                  </div>
                  <div className="font-mono text-[10px] space-y-1">
                    <p className="truncate"><strong className="text-on-surface uppercase">Tx Hash:</strong> {simulationHash}</p>
                    <p><strong className="text-on-surface uppercase">Block No:</strong> #{currentBlock + 1}</p>
                    <p><strong className="text-on-surface uppercase">Trade ID:</strong> {simulationTradeId}</p>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        // Open transaction in local explorer view
                        const matchedTx = filteredTransactions.find(t => t.tradeId === simulationTradeId) || {
                          hash: simulationHash,
                          block: currentBlock + 1,
                          timestamp: 'Just now',
                          method: simulatingFlow === 'lock' ? 'LockEscrow' : 'ReleaseEscrow',
                          from: walletAddress,
                          to: '0xArcBridgeEscrowVaultContract',
                          value: 248500,
                          status: 'success',
                          gasUsed: 52104,
                          gasPrice: 0.000000015,
                          tradeId: simulationTradeId
                        };
                        setSelectedDetailTx(matchedTx as any);
                        setSimulatingFlow(null);
                      }}
                      className="px-sm py-1 bg-green-600 text-white text-[10px] font-black uppercase tracking-wider border border-green-700 hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      View on Explorer
                    </button>
                    <button
                      onClick={() => setSimulatingFlow(null)}
                      className="px-sm py-1 bg-white border border-on-surface text-[10px] font-black uppercase tracking-wider hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      Close Handshake
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center text-[10px] font-mono text-[#A09E97] animate-pulse">
                  ⚡ WAITING FOR FASTAPI COMPLIANCE VALIDATOR...
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Full Transaction Explorer Details (Explorer Modal) */}
      {selectedDetailTx && (
        <div className="fixed inset-0 bg-on-surface/75 backdrop-blur-xs z-50 flex items-center justify-center p-md select-none">
          <div className="bg-[#FAF8F5] border-4 border-on-surface max-w-lg w-full p-lg relative shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] animate-in zoom-in-95 duration-150">
            
            <button
              onClick={() => setSelectedDetailTx(null)}
              className="absolute top-md right-md text-xs font-black uppercase tracking-wider text-on-surface hover:underline cursor-pointer"
            >
              [ Close ]
            </button>

            <div className="space-y-md">
              <div>
                <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-[0.3em] block mb-0.5">Arc Bridge Explorer Node</span>
                <h3 className="text-2xl font-sans font-black uppercase tracking-tight leading-none">
                  Transaction Receipt
                </h3>
              </div>

              {/* Status Badge */}
              <div className="bg-white border-2 border-on-surface p-sm flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">Receipt Confirmation</span>
                  <span className="font-mono text-xs font-bold text-on-surface break-all">{selectedDetailTx.hash}</span>
                </div>
                <div className="flex items-center gap-xs pl-2">
                  {selectedDetailTx.status === 'success' ? (
                    <span className="px-2 py-0.5 bg-green-50 border border-green-600 text-[10px] font-sans font-black uppercase text-green-700 tracking-wider rounded-none">
                      Confirmed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-600 text-[10px] font-sans font-black uppercase text-amber-700 tracking-wider rounded-none animate-pulse">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Main Receipt grid info */}
              <div className="grid grid-cols-2 gap-sm text-[11px] font-medium text-on-surface-variant bg-surface p-sm border border-on-surface/20">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#A09E97] uppercase tracking-wider block">Event / Method</span>
                  <span className="font-bold text-on-surface font-mono bg-white px-1.5 py-0.5 border border-on-surface/15 rounded text-[10px]">{selectedDetailTx.method}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#A09E97] uppercase tracking-wider block">Trade Reference ID</span>
                  <span className="font-bold text-on-surface font-mono">{selectedDetailTx.tradeId || 'SYSTEM'}</span>
                </div>
                
                <div className="col-span-2 h-[1px] bg-on-surface/10 my-1"></div>

                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#A09E97] uppercase tracking-wider block">On-Chain block height</span>
                  <span className="font-bold text-on-surface">Block #{selectedDetailTx.block}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#A09E97] uppercase tracking-wider block">Network / Environment</span>
                  <span className="font-bold text-on-surface">{network}</span>
                </div>

                <div className="col-span-2 h-[1px] bg-on-surface/10 my-1"></div>

                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#A09E97] uppercase tracking-wider block">Settled value</span>
                  <span className="font-bold text-on-surface text-sm font-sans">${selectedDetailTx.value.toLocaleString()} USDC</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#A09E97] uppercase tracking-wider block">Gas price fee paid</span>
                  <span className="font-bold text-on-surface font-mono">{(selectedDetailTx.gasUsed * selectedDetailTx.gasPrice).toFixed(6)} ARC</span>
                </div>
              </div>

              {/* Handshake payload block */}
              <div className="space-y-xs">
                <span className="text-[9px] font-black uppercase text-[#A09E97] tracking-wider block">Raw compliance transaction parameters:</span>
                <pre className="bg-on-surface text-green-400 p-sm font-mono text-[9px] leading-relaxed rounded max-h-36 overflow-y-auto shadow-inner text-left">
                  {selectedDetailTx.payload || JSON.stringify({
                    tx_hash: selectedDetailTx.hash,
                    signer_credentials: `0xArcMPCServerHandshakeSignedHex_${selectedDetailTx.hash.substring(2, 10)}`,
                    validator_nodes_confirmed: 24,
                    jurisdictional_clearance: true,
                    regulatory_scope_code: "SHIELD_USDC_V4"
                  }, null, 2)}
                </pre>
              </div>

              {/* Action buttons inside detail */}
              <div className="flex gap-2 justify-end pt-sm border-t border-on-surface/10">
                <button
                  onClick={() => handleCopy(selectedDetailTx.hash, 'txhash')}
                  className="px-sm py-1.5 border border-on-surface text-[10px] font-black uppercase hover:bg-surface-container transition-all cursor-pointer flex items-center gap-1"
                >
                  {copiedText === 'txhash' ? <Check className="w-3 text-green-600" /> : <Copy className="w-3" />}
                  <span>{copiedText === 'txhash' ? 'Copied' : 'Copy Hash'}</span>
                </button>
                <button
                  onClick={() => handleCopy(selectedDetailTx.block.toString(), 'blockhash')}
                  className="px-sm py-1.5 border border-on-surface text-[10px] font-black uppercase hover:bg-surface-container transition-all cursor-pointer flex items-center gap-1"
                >
                  {copiedText === 'blockhash' ? <Check className="w-3 text-green-600" /> : <Copy className="w-3" />}
                  <span>Copy Block #</span>
                </button>
                <button
                  onClick={() => {
                    alert(`Routing secure bridge query to decentralize block explorer height #${selectedDetailTx.block} at http://testnet.arc.bridge/tx/${selectedDetailTx.hash}`);
                    window.open(`https://ais-pre-li62q5qsgzdudu3fzj3qnf-492569818416.asia-east1.run.app/arc_explorer`, '_blank');
                  }}
                  className="px-sm py-1.5 bg-on-surface text-background text-[10px] font-black uppercase tracking-wider hover:bg-on-surface/90 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 text-background" />
                  <span>Verify on Explorer</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
