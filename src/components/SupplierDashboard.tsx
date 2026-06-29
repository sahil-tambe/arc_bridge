import React from 'react';
import { Truck, AlertTriangle, FileText, Check, X, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Trade } from '../types';

interface SupplierDashboardProps {
  onNavigate: (screen: string) => void;
  incomingOrders: Array<{ id: string; buyer: string; country: string; valueUsdc: number; status: string }>;
  onOrderAction: (id: string, action: 'accept' | 'reject') => void;
  trades: Trade[];
}

export default function SupplierDashboard({ onNavigate, incomingOrders, onOrderAction, trades }: SupplierDashboardProps) {
  // Aggregate stats
  const activeOrdersCount = incomingOrders.filter(o => o.status === 'pending').length;
  const supplierTrades = trades.filter(t => t.supplierEmail.includes('shenzhen') || t.supplierEmail.includes('logistics') || t.supplierEmail.includes('sales'));
  const revenuePending = supplierTrades.reduce((sum, t) => sum + t.valueUsdc, 0);
  const activeDisputes = supplierTrades.filter(t => t.status === 'disputed').length;

  return (
    <div className="space-y-xl w-full animate-in fade-in duration-500" id="supplier-dashboard">
      {/* Welcome Heading */}
      <section className="space-y-xs">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A09E97] block mb-1">Supplier Operations Desk</span>
        <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-[-0.04em] leading-none text-on-surface">
          Good afternoon, <span className="font-serif italic font-bold text-on-surface">Shenzhen Logisense</span>
        </h1>
        <p className="text-body-md text-on-surface-variant font-medium">Manage global orders, coordinate cargo dispatch, and monitor secure escrow payments.</p>
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Active Orders */}
        <div className="bg-white p-lg border-2 border-on-surface shadow-md flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Incoming Offers</span>
            <h2 className="text-4xl font-sans font-black text-on-surface mt-1">0{activeOrdersCount}</h2>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#A09E97]">Awaiting sign</span>
            <div className="h-[2px] bg-on-surface flex-grow"></div>
          </div>
        </div>

        {/* Revenue Pending */}
        <div className="bg-white p-lg border-2 border-on-surface shadow-md flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Escrow Secured</span>
            <h2 className="text-4xl font-sans font-black text-on-surface mt-1">
              ${(revenuePending / 1000000).toFixed(2)}M
            </h2>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#A09E97]">USDC locked</span>
            <div className="h-[2px] bg-on-surface flex-grow"></div>
          </div>
        </div>

        {/* Inbound Disputes */}
        <div className="bg-white p-lg border-2 border-on-surface shadow-md flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Active Claims</span>
            <h2 className="text-4xl font-sans font-black text-on-surface mt-1">0{activeDisputes}</h2>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#A09E97]">Claims clear</span>
            <div className="h-[2px] bg-on-surface flex-grow"></div>
          </div>
        </div>

        {/* Success Ratio */}
        <div className="bg-white p-lg border-2 border-on-surface shadow-md flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Success Ratio</span>
            <h2 className="text-4xl font-sans font-black text-on-surface mt-1">98.4%</h2>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-[11px] font-serif italic text-[#A09E97]">Performance index</span>
            <div className="h-[2px] bg-on-surface flex-grow"></div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Incoming Orders Left, Quick Links & Analytics Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Incoming Orders Area (8 cols) */}
        <div className="lg:col-span-8 space-y-md">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97]">Active Client proposals</h3>
            <span className="text-xs font-bold text-on-surface underline uppercase tracking-wider">Action required</span>
          </div>

          <div className="space-y-md">
            {incomingOrders.filter(o => o.status === 'pending').map((order) => (
              <div key={order.id} className="bg-white border-2 border-on-surface p-lg flex flex-col md:flex-row md:items-center justify-between gap-md shadow-md">
                <div>
                  <div className="flex items-center gap-xs mb-1">
                    <h4 className="font-bold text-body-lg text-on-surface">{order.buyer}</h4>
                    <span className="text-xs text-on-surface-variant font-bold">({order.country})</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium">Contract ID: {order.id} • Smart Ledger Placement</p>
                  <p className="text-2xl font-sans font-black text-on-surface mt-xs">
                    ${order.valueUsdc.toLocaleString()} USDC
                  </p>
                </div>
                
                {/* Decision CTA Buttons */}
                <div className="flex gap-sm">
                  <button
                    onClick={() => onOrderAction(order.id, 'accept')}
                    className="flex-1 md:flex-none px-md py-3 bg-on-surface text-background font-black text-xs uppercase tracking-wider flex items-center justify-center gap-xs cursor-pointer border-2 border-on-surface hover:bg-on-surface/90 transition-all"
                  >
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Accept Offer</span>
                  </button>

                  <button
                    onClick={() => onOrderAction(order.id, 'reject')}
                    className="flex-1 md:flex-none px-md py-3 bg-white hover:bg-surface-container-low text-on-surface font-black text-xs uppercase tracking-wider flex items-center justify-center gap-xs cursor-pointer border-2 border-on-surface transition-all"
                  >
                    <X className="w-4 h-4 shrink-0" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}

            {incomingOrders.filter(o => o.status === 'pending').length === 0 && (
              <div className="p-xl bg-white border-2 border-on-surface shadow-sm text-center space-y-sm">
                <p className="text-sm font-bold text-on-surface">No pending incoming orders.</p>
                <p className="text-xs text-on-surface-variant font-medium">All client contract proposals have been successfully signed and cataloged.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links & Analytics Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-lg">
          {/* Quick Actions Card */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97] border-b-2 border-on-surface pb-xs">Operations Desk</h3>
            
            <div className="space-y-sm">
              <button
                onClick={() => onNavigate('shipment_manager')}
                className="w-full p-md bg-white border-2 border-on-surface/20 hover:border-on-surface text-left flex items-center gap-md transition-all cursor-pointer"
              >
                <div className="w-8 h-8 border-2 border-on-surface bg-white flex items-center justify-center text-on-surface shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs text-on-surface block uppercase tracking-wide">Shipment Manager</span>
                  <span className="text-[11px] text-on-surface-variant block font-medium truncate">Dispatch cargo & upload bills</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-on-surface shrink-0" />
              </button>

              <button
                onClick={() => alert('Dispute resolver is clear. No active buyer complaints against your account.')}
                className="w-full p-md bg-white border-2 border-on-surface/20 hover:border-on-surface text-left flex items-center gap-md transition-all cursor-pointer"
              >
                <div className="w-8 h-8 border-2 border-on-surface bg-white flex items-center justify-center text-on-surface shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs text-on-surface block uppercase tracking-wide">Claims Resolution</span>
                  <span className="text-[11px] text-on-surface-variant block font-medium truncate">View & contest chargebacks</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-on-surface shrink-0" />
              </button>

              <button
                onClick={() => alert('Warehouse Registry: ShenZhen Warehouse #A1 & Shanghai Cargo Dock listed.')}
                className="w-full p-md bg-white border-2 border-on-surface/20 hover:border-on-surface text-left flex items-center gap-md transition-all cursor-pointer"
              >
                <div className="w-8 h-8 border-2 border-on-surface bg-white flex items-center justify-center text-on-surface shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs text-on-surface block uppercase tracking-wide">Warehouse Registry</span>
                  <span className="text-[11px] text-on-surface-variant block font-medium truncate">Check real-time stock levels</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-on-surface shrink-0" />
              </button>
            </div>
          </div>

          {/* Revenue chart mockup - elegant bento card */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97] border-b-2 border-on-surface pb-xs">Monthly Settlement</h3>
            
            <div className="h-32 flex items-end justify-between gap-xs pt-md">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-on-surface-variant/35 border-2 border-on-surface h-[40%]" title="May: 420K"></div>
                <span className="text-[10px] text-on-surface-variant font-bold mt-1">May</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-on-surface-variant/35 border-2 border-on-surface h-[55%]" title="Jun: 580K"></div>
                <span className="text-[10px] text-on-surface-variant font-bold mt-1">Jun</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-on-surface h-[80%]" title="Jul (Current): 1.1M"></div>
                <span className="text-[10px] text-on-surface font-black mt-1">Jul</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-on-surface-variant/10 border border-on-surface/30 h-[15%]" title="Aug (Est): 120K"></div>
                <span className="text-[10px] text-on-surface-variant/60 font-bold mt-1">Aug</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
