import React from 'react';
import { PlusCircle, Truck, AlertTriangle, Archive, HelpCircle, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Trade } from '../types';

interface BuyerDashboardProps {
  onNavigate: (screen: string) => void;
  onSelectTrade: (id: string) => void;
  trades: Trade[];
}

export default function BuyerDashboard({ onNavigate, onSelectTrade, trades }: BuyerDashboardProps) {
  // Compute metrics from state
  const activeCount = trades.filter(t => t.status !== 'completed' && t.status !== 'draft').length;
  const escrowLockedAmount = trades
    .filter(t => t.status === 'escrow_locked' || t.status === 'shipped')
    .reduce((sum, t) => sum + t.valueUsdc, 0);
  const pendingCount = trades.filter(t => t.status === 'created' || t.status === 'shipped').length;
  const completedCount = trades.filter(t => t.status === 'completed').length;

  const formatEscrowValue = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(1)}M`;
    }
    return `$${(val / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-xl w-full" id="buyer-dashboard">
      {/* Welcome Section */}
      <section className="space-y-xs animate-in fade-in duration-500">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A09E97] block mb-1">Buyer Desk Overview</span>
        <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-[-0.04em] leading-none text-on-surface">
          Good morning, <span className="font-serif italic font-bold text-on-surface">Alex Vance</span>
        </h1>
        <p className="text-body-md text-on-surface-variant font-medium">Here is your institutional trading overview for today.</p>
      </section>

      {/* Metric Grid: 4 Small Cards with stark modernist aesthetics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Active Trades */}
        <div className="bg-white p-lg border-2 border-on-surface shadow-md flex flex-col justify-between h-36 relative overflow-hidden">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Active Trades</span>
            <h2 className="text-4xl font-sans font-black text-on-surface mt-1">{activeCount}</h2>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#A09E97]">Escrow active</span>
            <div className="h-[2px] bg-on-surface flex-grow"></div>
          </div>
        </div>

        {/* Escrow Locked */}
        <div className="bg-white p-lg border-2 border-on-surface shadow-md flex flex-col justify-between h-36 relative overflow-hidden">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Escrow Locked</span>
            <h2 className="text-4xl font-sans font-black text-on-surface mt-1">{formatEscrowValue(escrowLockedAmount)}</h2>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#A09E97]">USDC safe</span>
            <div className="h-[2px] bg-on-surface flex-grow"></div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-lg border-2 border-on-surface shadow-md flex flex-col justify-between h-36 relative overflow-hidden">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Pending</span>
            <h2 className="text-4xl font-sans font-black text-on-surface mt-1">0{pendingCount}</h2>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#A09E97]">In transit</span>
            <div className="h-[2px] bg-on-surface flex-grow"></div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-lg border-2 border-on-surface shadow-md flex flex-col justify-between h-36 relative overflow-hidden">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Completed</span>
            <h2 className="text-4xl font-sans font-black text-on-surface mt-1">{142 + completedCount}</h2>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#A09E97]">Settled ops</span>
            <div className="h-[2px] bg-on-surface flex-grow"></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="space-y-md">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97]">Quick Desk Operations</h3>
        <div className="flex overflow-x-auto gap-md pb-md scrollbar-hide no-scrollbar select-none">
          <button
            onClick={() => onNavigate('new_trade')}
            className="flex-none flex flex-col items-center justify-center gap-sm bg-white border-2 border-on-surface text-on-surface p-lg w-28 shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            <PlusCircle className="w-7 h-7 text-on-surface" />
            <span className="text-[10px] font-black uppercase tracking-wider">New Trade</span>
          </button>
          
          <button
            onClick={() => {
              const activeShipment = trades.find(t => t.status === 'shipped' || t.status === 'escrow_locked');
              if (activeShipment) {
                onSelectTrade(activeShipment.id);
                onNavigate('shipment_tracker');
              } else {
                onNavigate('shipment_tracker');
              }
            }}
            className="flex-none flex flex-col items-center justify-center gap-sm bg-white border-2 border-on-surface text-on-surface p-lg w-28 shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            <Truck className="w-7 h-7 text-on-surface" />
            <span className="text-[10px] font-black uppercase tracking-wider">Track cargo</span>
          </button>

          <button
            onClick={() => onNavigate('dispute_center')}
            className="flex-none flex flex-col items-center justify-center gap-sm bg-white border-2 border-on-surface text-on-surface p-lg w-28 shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            <AlertTriangle className="w-7 h-7 text-on-surface" />
            <span className="text-[10px] font-black uppercase tracking-wider">Disputes</span>
          </button>

          <button
            onClick={() => alert('Archive is currently clear of completed operations.')}
            className="flex-none flex flex-col items-center justify-center gap-sm bg-white border-2 border-on-surface text-on-surface p-lg w-28 shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            <Archive className="w-7 h-7 text-on-surface" />
            <span className="text-[10px] font-black uppercase tracking-wider">Archive</span>
          </button>

          <button
            onClick={() => alert('Support representative is ready to help at support@arcbridge.io')}
            className="flex-none flex flex-col items-center justify-center gap-sm bg-white border-2 border-on-surface text-on-surface p-lg w-28 shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            <HelpCircle className="w-7 h-7 text-on-surface" />
            <span className="text-[10px] font-black uppercase tracking-wider">Support</span>
          </button>
        </div>
      </section>

      {/* Recent Activity List */}
      <section className="space-y-md">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97]">Recent Ledger Streams</h3>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-on-surface font-black text-xs uppercase tracking-widest underline hover:text-on-surface-variant cursor-pointer"
          >
            Refresh List
          </button>
        </div>

        <div className="bg-white border-2 border-on-surface shadow-md overflow-hidden">
          <div className="divide-y-2 divide-on-surface">
            {trades.map((trade) => {
              let icon = <PlusCircle className="w-5 h-5" />;
              let statusLabel = 'CREATED';
              let statusClass = 'bg-surface-container text-on-surface';
              let desc = `Shipment ID #${trade.id} details initialized`;

              if (trade.status === 'escrow_locked') {
                icon = <Clock className="w-5 h-5 text-on-surface" />;
                statusLabel = 'ESCROW LOCKED';
                statusClass = 'bg-on-surface text-background';
                desc = `Escrow established for ${trade.title}`;
              } else if (trade.status === 'shipped') {
                icon = <Truck className="w-5 h-5 text-on-surface" />;
                statusLabel = 'IN TRANSIT';
                statusClass = 'bg-white border border-on-surface text-on-surface';
                desc = `Shipment #${trade.id} confirmed with supplier`;
              } else if (trade.status === 'disputed') {
                icon = <AlertTriangle className="w-5 h-5 text-on-surface" />;
                statusLabel = 'ACTION REQ';
                statusClass = 'bg-error text-white';
                desc = `Dispute raised: Quality Assurance conflict`;
              } else if (trade.status === 'completed') {
                icon = <CheckCircle className="w-5 h-5 text-on-surface" />;
                statusLabel = 'COMPLETED';
                statusClass = 'bg-on-surface text-background';
                desc = `Trade successfully closed & funds released`;
              }

              return (
                <div
                  key={trade.id}
                  onClick={() => {
                    onSelectTrade(trade.id);
                    onNavigate('trade_details');
                  }}
                  className="p-lg flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 border-2 border-on-surface bg-white flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-body-lg text-on-surface leading-snug">{trade.buyerCompany}</h4>
                      <p className="text-body-md text-on-surface-variant font-medium">{desc}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className={`inline-flex items-center px-2.5 py-1 border border-on-surface text-[9px] font-black tracking-wider uppercase ${statusClass} mb-1`}>
                      {statusLabel}
                    </span>
                    <p className="text-[10px] text-[#A09E97] font-bold uppercase tracking-wider">Just now</p>
                  </div>
                </div>
              );
            })}

            {/* Static illustrative entries to make it identical to screenshot */}
            <div
              className="p-lg flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
              onClick={() => alert('Details of completed Agri-Bulk Inc trade are archived.')}
            >
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 border-2 border-on-surface bg-white flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-on-surface" />
                </div>
                <div>
                  <h4 className="font-bold text-body-lg text-on-surface leading-snug">Agri-Bulk Inc.</h4>
                  <p className="text-body-md text-on-surface-variant font-medium">Trade successfully closed</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="inline-flex items-center px-2.5 py-1 bg-on-surface text-background text-[9px] font-black tracking-wider uppercase mb-1">
                  COMPLETED
                </span>
                <p className="text-[10px] text-[#A09E97] font-bold uppercase tracking-wider">Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
