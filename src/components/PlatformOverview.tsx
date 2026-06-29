import React, { useState } from 'react';
import { Shield, FileText, AlertOctagon, Check, Slash, Lock, ArrowUpRight, Search } from 'lucide-react';
import { FlaggedTrade } from '../types';

interface PlatformOverviewProps {
  onNavigate: (screen: string) => void;
  flaggedTrades: FlaggedTrade[];
  onActionOnFlagged: (id: string, action: 'approve' | 'freeze') => void;
}

export default function PlatformOverview({ onNavigate, flaggedTrades, onActionOnFlagged }: PlatformOverviewProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  const filtered = flaggedTrades.filter(
    tx =>
      tx.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
      tx.userEntity.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-xl w-full animate-in fade-in duration-500" id="platform-overview">
      {/* Header */}
      <section className="space-y-xs">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A09E97] block mb-1">Compliance Ledger Guard</span>
        <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-[-0.04em] leading-none text-on-surface">
          Compliance <span className="font-serif italic font-bold">Queue</span>
        </h1>
        <p className="text-body-md text-on-surface-variant font-medium">ArcBridge Autonomous Compliance Engine (Shield v4.2) • Real-time KYB / AML monitoring</p>
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Total Active Audits */}
        <div className="bg-white p-lg border-2 border-on-surface shadow-md flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Active Audits</span>
            <h2 className="text-4xl font-sans font-black text-on-surface mt-1">04</h2>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#A09E97]">Continuous scan</span>
            <div className="h-[2px] bg-on-surface flex-grow"></div>
          </div>
        </div>

        {/* Overall Risk Level */}
        <div className="bg-white p-lg border-2 border-on-surface shadow-md flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Threat Level</span>
            <div className="flex items-center gap-sm mt-1">
              <h2 className="text-4xl font-sans font-black text-on-surface">LOW</h2>
              <span className="w-3 h-3 bg-on-surface shrink-0 animate-ping"></span>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#A09E97]">Shield v4.2 Active</span>
            <div className="h-[2px] bg-on-surface flex-grow"></div>
          </div>
        </div>

        {/* Flagged Incidents */}
        <div className="bg-white p-lg border-2 border-on-surface shadow-md flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Flagged Events</span>
            <h2 className="text-4xl font-sans font-black text-on-surface mt-1">02</h2>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#A09E97]">Awaiting review</span>
            <div className="h-[2px] bg-on-surface flex-grow"></div>
          </div>
        </div>

        {/* Escrow Pool Vault */}
        <div className="bg-white p-lg border-2 border-on-surface shadow-md flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Settlement Pool</span>
            <h2 className="text-4xl font-sans font-black text-on-surface mt-1">$8.4M</h2>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#A09E97]">USDC Total</span>
            <div className="h-[2px] bg-on-surface flex-grow"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Flagged Transactions Scanning Table */}
        <div className="lg:col-span-8 space-y-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97]">Compliance Scan Queue</h3>
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-md top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="w-full pl-xl pr-md py-2 bg-white border-2 border-on-surface text-xs outline-none font-medium"
                placeholder="Search entities or Tx IDs..."
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white border-2 border-on-surface shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white border-b-2 border-on-surface text-[10px] font-black text-on-surface uppercase tracking-wider">
                    <th className="p-md">TX ID</th>
                    <th className="p-md">Asset Pair</th>
                    <th className="p-md">Type</th>
                    <th className="p-md">Risk Level</th>
                    <th className="p-md">Amount</th>
                    <th className="p-md">Entity (KYB)</th>
                    <th className="p-md">Activity Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-t border-on-surface font-medium">
                  {filtered.map(tx => {
                    let riskBadge = 'bg-white border border-on-surface text-on-surface';
                    if (tx.riskLevel === 'HIGH') riskBadge = 'bg-error text-white font-bold border border-error';
                    if (tx.riskLevel === 'MEDIUM') riskBadge = 'bg-on-surface text-background font-bold';

                    const isSelected = selectedTx === tx.id;

                    return (
                      <tr
                        key={tx.id}
                        className={`hover:bg-surface-container-low cursor-pointer transition-colors ${
                          isSelected ? 'bg-surface-container font-bold border-l-4 border-on-surface' : ''
                        }`}
                        onClick={() => setSelectedTx(tx.id === selectedTx ? null : tx.id)}
                      >
                        <td className="p-md font-mono text-on-surface font-black">{tx.id}</td>
                        <td className="p-md font-bold">{tx.assetPair}</td>
                        <td className="p-md">{tx.type}</td>
                        <td className="p-md">
                          <span className={`inline-flex px-2 py-0.5 text-[9px] uppercase tracking-wide font-black ${riskBadge}`}>
                            {tx.riskLevel}
                          </span>
                        </td>
                        <td className="p-md font-black">{tx.amount}</td>
                        <td className="p-md font-bold">{tx.userEntity}</td>
                        <td className="p-md text-on-surface-variant font-medium">{tx.activityType}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Row Selection Details Panel */}
          {selectedTx && (
            <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md animate-in slide-in-from-bottom-3 duration-300">
              <div className="flex justify-between items-start pb-sm border-b-2 border-on-surface">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.1em] text-on-surface">Queue Management: Transaction {selectedTx}</h4>
                  <p className="text-xs text-on-surface-variant font-medium">Reviewing telemetry inputs and IP addresses metadata</p>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="text-xs text-on-surface font-black underline hover:text-on-surface-variant cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="flex gap-md">
                <button
                  onClick={() => {
                    onActionOnFlagged(selectedTx, 'approve');
                    setSelectedTx(null);
                  }}
                  className="px-md py-3 bg-on-surface text-background hover:bg-on-surface/90 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-xs cursor-pointer border-2 border-on-surface transition-all"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Verify & Release Hold</span>
                </button>

                <button
                  onClick={() => {
                    onActionOnFlagged(selectedTx, 'freeze');
                    setSelectedTx(null);
                  }}
                  className="px-md py-3 bg-white hover:bg-error-container hover:text-error text-on-surface font-black text-xs uppercase tracking-wider flex items-center justify-center gap-xs cursor-pointer border-2 border-on-surface hover:border-error transition-all"
                >
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  <span>Freeze Account Assets</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel: Quick Actions & Jurisdiction info (4 cols) */}
        <div className="lg:col-span-4 space-y-lg">
          {/* Quick Actions Panel */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97] border-b-2 border-on-surface pb-xs">Officer Toolkit</h3>
            
            <div className="space-y-sm">
              <button
                onClick={() => onNavigate('dispute_resolver')}
                className="w-full p-md bg-white border-2 border-on-surface/20 hover:border-on-surface text-left flex items-center gap-md transition-all cursor-pointer"
              >
                <div className="w-8 h-8 border-2 border-on-surface bg-white flex items-center justify-center text-on-surface shrink-0">
                  <Slash className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs text-on-surface block uppercase tracking-wide">Review Disputes</span>
                  <span className="text-[11px] text-on-surface-variant block font-medium truncate">Arbiter of active buyer claims</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-on-surface shrink-0" />
              </button>

              <button
                onClick={() => {
                  const addr = prompt("Enter wallet address or entity name to lock:");
                  if (addr) alert(`Security freeze successfully broadcast for address: ${addr}`);
                }}
                className="w-full p-md bg-white border-2 border-on-surface/20 hover:border-on-surface text-left flex items-center gap-md transition-all cursor-pointer"
              >
                <div className="w-8 h-8 border-2 border-on-surface bg-white flex items-center justify-center text-on-surface shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs text-on-surface block uppercase tracking-wide">Freeze Registry</span>
                  <span className="text-[11px] text-on-surface-variant block font-medium truncate">Broadcast blacklists to smart nodes</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-on-surface shrink-0" />
              </button>

              <button
                onClick={() => alert('Compiling global trade audit report in PDF... Success! Saved to your downloads.')}
                className="w-full p-md bg-white border-2 border-on-surface/20 hover:border-on-surface text-left flex items-center gap-md transition-all cursor-pointer"
              >
                <div className="w-8 h-8 border-2 border-on-surface bg-white flex items-center justify-center text-on-surface shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs text-on-surface block uppercase tracking-wide">Compile Audit Logs</span>
                  <span className="text-[11px] text-on-surface-variant block font-medium truncate">Request ISO crypt-signature trails</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-on-surface shrink-0" />
              </button>
            </div>
          </div>

          {/* Jurisdictions lists */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-sm shadow-md">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97] border-b-2 border-on-surface pb-xs">Monitored Jurisdictions</h3>
            <div className="space-y-sm pt-xs text-xs font-bold uppercase tracking-wider">
              <div className="flex justify-between items-center py-1 border-b border-on-surface/10">
                <span>United States (FinCEN)</span>
                <span className="px-1.5 py-0.5 border border-on-surface bg-on-surface text-background text-[9px] font-black">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-on-surface/10">
                <span>European Union (ESMA)</span>
                <span className="px-1.5 py-0.5 border border-on-surface bg-on-surface text-background text-[9px] font-black">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-on-surface/10">
                <span>Singapore (MAS)</span>
                <span className="px-1.5 py-0.5 border border-on-surface bg-on-surface text-background text-[9px] font-black">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-on-surface/10">
                <span>Hong Kong (SFC)</span>
                <span className="px-1.5 py-0.5 border border-on-surface bg-on-surface text-background text-[9px] font-black">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>United Kingdom (FCA)</span>
                <span className="px-1.5 py-0.5 border border-on-surface bg-on-surface text-background text-[9px] font-black">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
