import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Cpu, 
  Layers, 
  Search, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Database, 
  FileText, 
  Share2, 
  Coins, 
  X, 
  HelpCircle,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { ExplorerTx } from '../types';

interface ArcExplorerProps {
  transactions: ExplorerTx[];
  walletConnected: boolean;
  walletAddress: string;
  walletBalance: number;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onFaucetRequest: () => void;
  currentBlock: number;
}

export default function ArcExplorer({
  transactions,
  walletConnected,
  walletAddress,
  walletBalance,
  onConnectWallet,
  onDisconnectWallet,
  onFaucetRequest,
  currentBlock
}: ArcExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<ExplorerTx | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<ExplorerTx[]>(transactions);
  const [searchError, setSearchError] = useState('');
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [copiedTxHash, setCopiedTxHash] = useState<string | null>(null);

  // Auto-update filter when transactions change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(transactions);
    } else {
      handleSearch(searchQuery);
    }
  }, [transactions]);

  const handleSearch = (query: string) => {
    setSearchError('');
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter(tx => 
      tx.hash.toLowerCase().includes(cleanQuery) ||
      tx.from.toLowerCase().includes(cleanQuery) ||
      tx.to.toLowerCase().includes(cleanQuery) ||
      tx.method.toLowerCase().includes(cleanQuery) ||
      (tx.tradeId && tx.tradeId.toLowerCase().includes(cleanQuery)) ||
      tx.block.toString() === cleanQuery
    );

    if (filtered.length === 0) {
      setSearchError(`No ledger records matched "${query}"`);
    }
    setFilteredTransactions(filtered);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTxHash(hash);
    setTimeout(() => setCopiedTxHash(null), 2000);
  };

  const triggerFaucet = () => {
    setFaucetLoading(true);
    setTimeout(() => {
      onFaucetRequest();
      setFaucetLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-lg animate-in fade-in" id="arc-explorer-container">
      {/* Title section */}
      <div className="border-b-2 border-on-surface pb-md flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant mb-1 block">Public Consensus Layer</span>
          <h1 className="text-4xl font-sans font-black uppercase tracking-tight text-on-surface flex items-center gap-xs">
            <Globe className="w-8 h-8 text-on-surface animate-spin-slow" />
            <span>Arc Testnet Explorer</span>
          </h1>
          <p className="text-body-md text-on-surface-variant font-medium mt-1">Verify real-time smart contracts, multi-sig locks, and trade settlement transactions.</p>
        </div>

        {/* Quick Faucet & Wallet Status Header Badge */}
        <div className="flex flex-wrap gap-xs">
          {walletConnected ? (
            <div className="flex items-center gap-xs">
              <div className="px-sm py-2 bg-white border-2 border-on-surface text-xs font-bold flex items-center gap-xs">
                <div className="w-2.5 h-2.5 bg-green-500 shrink-0"></div>
                <span className="font-mono text-on-surface-variant">Connected: {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 4)}</span>
              </div>
              <button
                onClick={triggerFaucet}
                disabled={faucetLoading}
                className="px-md py-2 bg-on-surface text-background text-xs font-black uppercase tracking-wider hover:bg-on-surface/90 transition-all cursor-pointer flex items-center gap-xs disabled:opacity-50 border-2 border-on-surface"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>{faucetLoading ? 'Minting...' : 'Request 10,000 T-USDC'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="px-md py-2 bg-[#E2DFD4] hover:bg-on-surface hover:text-background text-on-surface text-xs font-black uppercase tracking-wider transition-all border-2 border-on-surface cursor-pointer flex items-center gap-xs"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Connect Wallet to Arc Testnet</span>
            </button>
          )}
        </div>
      </div>

      {/* Network Health Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-xs md:gap-md">
        <div className="bg-white border-2 border-on-surface p-sm md:p-md shadow-sm">
          <div className="flex items-center gap-xs text-on-surface-variant mb-1">
            <Layers className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Block Height</span>
          </div>
          <div className="text-xl md:text-2xl font-mono font-black text-on-surface">
            #{currentBlock.toLocaleString()}
          </div>
          <div className="text-[10px] text-green-600 font-bold mt-1">● Just Mined (1.5s average)</div>
        </div>

        <div className="bg-white border-2 border-on-surface p-sm md:p-md shadow-sm">
          <div className="flex items-center gap-xs text-on-surface-variant mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Gas Price</span>
          </div>
          <div className="text-xl md:text-2xl font-mono font-black text-on-surface">
            15 Gwei
          </div>
          <div className="text-[10px] text-on-surface-variant font-medium mt-1">0.000021 ARC gas fee avg</div>
        </div>

        <div className="bg-white border-2 border-on-surface p-sm md:p-md shadow-sm">
          <div className="flex items-center gap-xs text-on-surface-variant mb-1">
            <Database className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Escrows Locked</span>
          </div>
          <div className="text-xl md:text-2xl font-mono font-black text-on-surface">
            {transactions.filter(t => t.method === 'LockEscrow').length + 8} Active
          </div>
          <div className="text-[10px] text-on-surface-variant font-medium mt-1">Security Collateral Vault</div>
        </div>

        <div className="bg-white border-2 border-on-surface p-sm md:p-md shadow-sm col-span-1">
          <div className="flex items-center gap-xs text-on-surface-variant mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Net TPS</span>
          </div>
          <div className="text-xl md:text-2xl font-mono font-black text-on-surface">
            242.8 TPS
          </div>
          <div className="text-[10px] text-on-surface-variant font-medium mt-1">High throughput ledger</div>
        </div>

        <div className="bg-white border-2 border-on-surface p-sm md:p-md shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center gap-xs text-on-surface-variant mb-1">
            <Coins className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Testnet Balance</span>
          </div>
          <div className="text-xl md:text-2xl font-mono font-black text-on-surface">
            ${walletBalance.toLocaleString()}
          </div>
          <div className="text-[10px] text-on-surface-variant font-bold truncate">T-USDC Liquidity Pool</div>
        </div>
      </div>

      {/* Search Ledger Bar */}
      <div className="bg-white border-2 border-on-surface p-sm md:p-md shadow-sm flex flex-col md:flex-row gap-xs items-stretch">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Tx Hash (0xarc...), Wallet Address, Block Number, or Trade ID (TRD-XXXX)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="w-full pl-xl pr-md py-3 bg-surface border-2 border-on-surface text-xs md:text-body-md text-on-surface outline-none focus:bg-white font-medium transition-all"
          />
          <Search className="w-5 h-5 absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
        </div>
        <button
          onClick={() => handleSearch(searchQuery)}
          className="px-lg py-3 bg-on-surface hover:bg-on-surface/90 text-background text-xs uppercase tracking-wider font-black border-2 border-on-surface cursor-pointer transition-colors shrink-0"
        >
          Query Ledger
        </button>
      </div>

      {/* Main Ledger Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start">
        {/* Left Side: Sandbox Guide & Wallet Connection Status */}
        <div className="lg:col-span-4 space-y-md">
          {/* Arc Testnet Gateway Node Status */}
          <div className="bg-[#E2DFD4] border-2 border-on-surface p-md space-y-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-on-surface">Consensus Client Status</h3>
            <div className="space-y-xs font-mono text-[10px] text-on-surface-variant">
              <div className="flex justify-between border-b border-on-surface/10 pb-1">
                <span>Network Name:</span>
                <span className="font-bold text-on-surface">arc_testnet_v2</span>
              </div>
              <div className="flex justify-between border-b border-on-surface/10 pb-1">
                <span>Standard Protocol:</span>
                <span className="font-bold text-on-surface">Tendermint Core v0.34</span>
              </div>
              <div className="flex justify-between border-b border-on-surface/10 pb-1">
                <span>Active Validators:</span>
                <span className="font-bold text-on-surface">74 Node Clusters</span>
              </div>
              <div className="flex justify-between border-b border-on-surface/10 pb-1">
                <span>Security Engine:</span>
                <span className="font-bold text-on-surface">Ed25519 Multisig Vaults</span>
              </div>
              <div className="flex justify-between">
                <span>Smart Contract Engine:</span>
                <span className="font-bold text-on-surface">ArcVM v1.4.2</span>
              </div>
            </div>
            
            <div className="pt-sm border-t border-on-surface/10 text-[10px] text-on-surface-variant font-medium">
              Every action taken within this Escrow Protocol app is cryptographically hashed and broadcast to the decentralised public nodes of the **Arc Testnet** for ledger settlement tracking.
            </div>
          </div>

          {/* Interactive Wallet Connector Panel */}
          <div className="bg-white border-2 border-on-surface p-md space-y-md shadow-sm">
            <div className="flex items-center gap-sm">
              <div className="p-2 bg-on-surface text-background">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-on-surface">Arc Wallet Integration</h3>
                <span className="text-[10px] text-on-surface-variant font-bold">Standard Cryptographic Access</span>
              </div>
            </div>

            {walletConnected ? (
              <div className="space-y-sm animate-in fade-in">
                <div className="p-sm bg-surface border-2 border-on-surface space-y-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-on-surface-variant">Active Wallet Session</span>
                    <span className="text-[9px] font-black text-green-600 bg-green-100 px-1 border border-green-600">CONNECTED</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-on-surface break-all bg-white p-1 border border-on-surface/20">
                    {walletAddress}
                  </div>
                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-on-surface-variant font-medium">Balance (T-USDC):</span>
                    <span className="font-bold text-on-surface">${walletBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-xs">
                  <button
                    onClick={triggerFaucet}
                    disabled={faucetLoading}
                    className="py-2 bg-on-surface hover:bg-on-surface/90 text-background text-[10px] font-black uppercase tracking-wider border-2 border-on-surface cursor-pointer disabled:opacity-50 text-center"
                  >
                    {faucetLoading ? 'Minting...' : 'Request Faucet'}
                  </button>
                  <button
                    onClick={onDisconnectWallet}
                    className="py-2 bg-white hover:bg-error-container hover:text-on-error-container text-on-surface text-[10px] font-black uppercase tracking-wider border-2 border-on-surface cursor-pointer text-center"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-sm">
                <p className="text-[11px] text-on-surface-variant font-medium">
                  Connect your decentralized credentials wallet to authorize secure escrow deposits, release trade settlements, or raise quality disputes.
                </p>
                <button
                  onClick={onConnectWallet}
                  className="w-full py-2.5 bg-on-surface text-background hover:bg-on-surface/90 transition-all text-xs font-black uppercase tracking-[0.1em] border-2 border-on-surface cursor-pointer flex items-center justify-center gap-xs"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Link Arc Testnet Wallet</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Ledger Transaction Feed */}
        <div className="lg:col-span-8 space-y-sm">
          <div className="flex items-center justify-between border-b border-on-surface/10 pb-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-xs">
              <Database className="w-4 h-4 text-on-surface-variant" />
              <span>Broadcast Transaction Ledger</span>
            </h2>
            <span className="text-[10px] font-bold text-on-surface-variant bg-white border border-on-surface/20 px-sm py-1 font-mono">
              Showing {filteredTransactions.length} Txs
            </span>
          </div>

          {searchError && (
            <div className="p-md bg-surface-container border-2 border-on-surface text-xs font-bold text-on-surface-variant text-center">
              {searchError}
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchError('');
                  setFilteredTransactions(transactions);
                }} 
                className="underline block mx-auto mt-2 hover:text-on-surface cursor-pointer"
              >
                Clear Search Filter
              </button>
            </div>
          )}

          <div className="space-y-xs max-h-[550px] overflow-y-auto pr-xs">
            {filteredTransactions.map((tx) => (
              <div 
                key={tx.hash} 
                onClick={() => setSelectedTx(tx)}
                className="bg-white border-2 border-on-surface p-md hover:bg-surface-container-low cursor-pointer transition-all hover:translate-x-1 duration-150 relative group"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
                  {/* Tx Method Badge */}
                  <div className="flex items-center gap-sm">
                    {tx.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-error shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-xs">
                        <span className="font-mono text-xs font-black text-on-surface uppercase tracking-tight">{tx.method}</span>
                        {tx.tradeId && (
                          <span className="text-[9px] font-black uppercase px-1 bg-surface-container border border-on-surface/20 text-on-surface-variant font-mono">{tx.tradeId}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-xs text-[10px] text-on-surface-variant font-mono mt-0.5">
                        <span className="font-bold">Tx:</span>
                        <span className="text-on-surface truncate max-w-[120px] md:max-w-none">{tx.hash.substring(0, 16)}...</span>
                        <span>•</span>
                        <span>Block #{tx.block}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Timestamp & Value */}
                  <div className="flex md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-auto pt-sm md:pt-0 border-t border-on-surface/5 md:border-none">
                    <div className="text-xs font-mono font-black text-on-surface">
                      {tx.value > 0 ? `$${tx.value.toLocaleString()} USDC` : '0.00 ARC'}
                    </div>
                    <span className="text-[10px] text-[#A09E97] font-medium flex items-center gap-xs mt-0.5">
                      <Clock className="w-3 h-3" />
                      {tx.timestamp}
                    </span>
                  </div>
                </div>

                {/* Micro hover feedback arrow */}
                <ArrowRight className="w-4 h-4 absolute right-md top-1/2 -translate-y-1/2 text-on-surface opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Receipt Modal Overlay */}
      {selectedTx && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-md" id="explorer-receipt-modal">
          <div className="bg-white border-4 border-on-surface shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-on-surface text-background p-md flex justify-between items-center">
              <div className="flex items-center gap-xs">
                <FileText className="w-5 h-5 text-background" />
                <span className="font-sans font-black uppercase text-xs tracking-wider">Arc Cryptographic Receipt</span>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-background hover:opacity-80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-md md:p-lg space-y-md overflow-y-auto max-h-[80vh]">
              {/* Receipt Visual Status */}
              <div className="text-center py-md bg-surface border-2 border-on-surface relative overflow-hidden">
                <div className="absolute right-xs top-xs text-[10px] font-mono text-on-surface-variant/20 font-black rotate-12">ARCV_CONSENSUS</div>
                {selectedTx.status === 'success' ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-sm" />
                    <span className="text-xs font-black uppercase text-green-600 tracking-widest bg-green-100 px-md py-1 border border-green-600 inline-block">TRANSACTION VERIFIED</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-12 h-12 text-error mx-auto mb-sm" />
                    <span className="text-xs font-black uppercase text-error tracking-widest bg-error-container px-md py-1 border border-error inline-block">TRANSACTION FAILED</span>
                  </>
                )}
                <div className="text-xs text-on-surface-variant font-mono mt-xs font-medium">Block Confirmation #{selectedTx.block}</div>
              </div>

              {/* Tx Details */}
              <div className="space-y-sm font-mono text-[11px] text-on-surface-variant">
                <div className="flex justify-between items-start border-b border-on-surface/10 pb-sm">
                  <span className="font-bold text-on-surface">Tx Hash:</span>
                  <div className="flex items-center gap-xs">
                    <span className="text-on-surface font-semibold text-right break-all max-w-[200px]">{selectedTx.hash}</span>
                    <button 
                      onClick={() => handleCopyHash(selectedTx.hash)}
                      className="text-on-surface underline hover:text-[#5C5A54] shrink-0"
                    >
                      {copiedTxHash === selectedTx.hash ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between border-b border-on-surface/10 pb-sm">
                  <span className="font-bold text-on-surface">Method Called:</span>
                  <span className="text-on-surface font-semibold uppercase">{selectedTx.method}</span>
                </div>

                {selectedTx.tradeId && (
                  <div className="flex justify-between border-b border-on-surface/10 pb-sm">
                    <span className="font-bold text-on-surface">Attached Trade ID:</span>
                    <span className="text-on-surface font-semibold">{selectedTx.tradeId}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-on-surface/10 pb-sm">
                  <span className="font-bold text-on-surface">Sender Wallet:</span>
                  <span className="text-on-surface break-all text-right max-w-[200px]">{selectedTx.from}</span>
                </div>

                <div className="flex justify-between border-b border-on-surface/10 pb-sm">
                  <span className="font-bold text-on-surface">Consensus Target:</span>
                  <span className="text-on-surface break-all text-right max-w-[200px]">{selectedTx.to}</span>
                </div>

                <div className="flex justify-between border-b border-on-surface/10 pb-sm">
                  <span className="font-bold text-on-surface">Transfer Value:</span>
                  <span className="text-on-surface font-semibold">{selectedTx.value > 0 ? `$${selectedTx.value.toLocaleString()} USDC` : '0.00 ARC'}</span>
                </div>

                <div className="flex justify-between border-b border-on-surface/10 pb-sm">
                  <span className="font-bold text-on-surface">Network Gas Used:</span>
                  <span className="text-on-surface">{selectedTx.gasUsed.toLocaleString()} units</span>
                </div>

                <div className="flex justify-between border-b border-on-surface/10 pb-sm">
                  <span className="font-bold text-on-surface">Gas Price (ARC):</span>
                  <span className="text-on-surface">{selectedTx.gasPrice} ARC</span>
                </div>

                <div className="flex justify-between pb-sm">
                  <span className="font-bold text-on-surface">Timestamp:</span>
                  <span className="text-on-surface">{selectedTx.timestamp}</span>
                </div>
              </div>

              {/* Decoded Payload */}
              <div className="bg-surface p-sm border-2 border-on-surface space-y-xs">
                <span className="text-[10px] font-black uppercase text-on-surface-variant block">Decoded Payload Input</span>
                <div className="font-mono text-[10px] text-on-surface bg-white p-2 border border-on-surface/20 whitespace-pre-wrap break-all">
                  {selectedTx.payload || `{\n  "method": "${selectedTx.method}",\n  "caller": "${selectedTx.from}",\n  "timestamp": "${selectedTx.timestamp}",\n  "args": {\n    "tradeId": "${selectedTx.tradeId || 'N/A'}",\n    "value": "${selectedTx.value}"\n  }\n}`}
                </div>
              </div>

              {/* Cryptographic ECDSA Signature Blocks */}
              <div className="bg-[#E2DFD4] p-sm border border-on-surface space-y-1">
                <span className="text-[9px] font-black uppercase text-on-surface-variant block">Secp256k1 Signature Block</span>
                <div className="font-mono text-[8px] text-on-surface-variant break-all">
                  r: <span className="text-on-surface">0x69f1bf2095b3d2a1c3e5f7b8a9d0c1b2a3f4e5d6c810a9f390022f48f2cbba05</span><br/>
                  s: <span className="text-on-surface">0x2d1c3a50d2cfb10293eb0415aefc00127e6dbff9a12bcde38ef50293fa910dcc</span><br/>
                  v: <span className="text-on-surface">27 (Network Chain ID: 1042)</span>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="bg-surface p-md border-t-2 border-on-surface flex gap-xs">
              <button
                onClick={() => handleCopyHash(selectedTx.hash)}
                className="flex-1 py-2 bg-white hover:bg-surface-container border-2 border-on-surface text-on-surface text-[11px] font-black uppercase tracking-wider cursor-pointer text-center"
              >
                Copy Tx Hash
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2 bg-on-surface text-background hover:bg-on-surface/90 border-2 border-on-surface text-[11px] font-black uppercase tracking-wider cursor-pointer text-center"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
