import React from 'react';
import { ArrowLeft, Lock, Check, Download, Copy, Truck, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { Trade, Shipment } from '../types';

interface TradeDetailsProps {
  onNavigate: (screen: string) => void;
  trade: Trade;
  shipment?: Shipment;
}

export default function TradeDetails({ onNavigate, trade, shipment }: TradeDetailsProps) {
  const handleCopyHash = () => {
    navigator.clipboard.writeText(trade.verificationHash);
    alert('Verification hash copied to clipboard!');
  };

  // Determine current stepper status
  const isCreated = true;
  const isLocked = trade.status !== 'created' && trade.status !== 'draft';
  const isShipped = trade.status === 'shipped' || trade.status === 'completed';
  const isSettled = trade.status === 'completed';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-lg animate-in fade-in duration-500" id="trade-details-screen">
      {/* Back to list & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-xs text-[10px] font-black uppercase tracking-wider text-on-surface hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-xs text-[10px] font-bold text-[#A09E97] tracking-[0.2em] uppercase">
          <span>Trades</span>
          <span>/</span>
          <span className="text-on-surface font-black">{trade.id}</span>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-sm">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A09E97] block mb-1">Audit Ledger Detail</span>
        <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-[-0.04em] leading-none text-on-surface">
          Trade <span className="font-serif italic font-bold">#{trade.id}</span>
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant font-medium">
          Created on {trade.createdDate} • International Logistics Settle
        </p>
      </div>

      {/* Status Banner */}
      <div className="bg-on-surface text-background border-2 border-on-surface p-lg flex items-center justify-between shadow-md">
        <div className="flex items-center gap-md">
          <div className="bg-white text-on-surface p-2 border-2 border-on-surface shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-background/70 uppercase tracking-widest block">Escrow Status</span>
            <span className="text-lg font-sans font-black uppercase tracking-wider text-background leading-none">
              {trade.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <span className="text-[10px] text-background/85 font-black uppercase tracking-wider">Awaiting carrier logs</span>
        </div>
      </div>

      {/* Trade Journey Stepper (Screen 5 Stepper) */}
      <div className="bg-white border-2 border-on-surface p-lg shadow-md">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97] mb-md pb-xs border-b-2 border-on-surface">Trade Journey</h3>
        
        <div className="relative flex items-center justify-between mt-sm pb-2">
          {/* Horizontal connecting line */}
          <div className="absolute left-6 right-6 top-[16px] h-[2px] bg-on-surface/20 z-0">
            <div
              className="h-full bg-on-surface transition-all duration-500"
              style={{
                width: isSettled ? '100%' : isShipped ? '66%' : isLocked ? '33%' : '0%'
              }}
            ></div>
          </div>

          {/* Step 1: Created */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-2 border-on-surface bg-on-surface text-background flex items-center justify-center font-bold text-sm shadow-sm">
              <Check className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-on-surface mt-sm">Created</span>
            <span className="text-[9px] text-[#A09E97] font-bold uppercase tracking-wider">{trade.createdDate}</span>
          </div>

          {/* Step 2: Locked */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full border-2 border-on-surface flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
              isLocked ? 'bg-on-surface text-background' : 'bg-white text-on-surface'
            }`}>
              {isLocked ? <Check className="w-4 h-4 shrink-0" /> : <Lock className="w-4 h-4 shrink-0" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-on-surface mt-sm">Locked</span>
            <span className="text-[9px] text-[#A09E97] font-bold uppercase tracking-wider">{trade.lockedDate || '---'}</span>
          </div>

          {/* Step 3: Shipped */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full border-2 border-on-surface flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
              isShipped ? 'bg-on-surface text-background' : 'bg-white text-on-surface'
            }`}>
              {isShipped ? <Check className="w-4 h-4 shrink-0" /> : <Truck className="w-4 h-4 shrink-0" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-on-surface mt-sm">Shipped</span>
            <span className="text-[9px] text-[#A09E97] font-bold uppercase tracking-wider">{isShipped ? 'In Route' : '---'}</span>
          </div>

          {/* Step 4: Settled */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full border-2 border-on-surface flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
              isSettled ? 'bg-on-surface text-background' : 'bg-white text-on-surface'
            }`}>
              {isSettled ? <Check className="w-4 h-4 shrink-0" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-on-surface mt-sm">Settled</span>
            <span className="text-[9px] text-[#A09E97] font-bold uppercase tracking-wider">{isSettled ? 'Settled' : '---'}</span>
          </div>
        </div>
      </div>

      {/* Cargo Details Card */}
      <div className="bg-white border-2 border-on-surface p-lg shadow-md space-y-md">
        <div className="flex justify-between items-center pb-sm border-b-2 border-on-surface">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97]">Cargo Details</h3>
          <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">HS Code: {trade.hsCode || 'N/A'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <div className="space-y-xs">
            <span className="text-[10px] text-[#A09E97] font-bold uppercase tracking-wider block">Capital Value</span>
            <span className="text-2xl font-sans font-black text-on-surface uppercase tracking-tighter block leading-none">
              ${trade.valueUsdc.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
            </span>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] text-[#A09E97] font-bold uppercase tracking-wider block">Manifest Description</span>
            <span className="text-sm text-on-surface font-bold block leading-tight">{trade.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-sm">
          <div className="space-y-xs">
            <span className="text-[10px] text-[#A09E97] font-bold uppercase tracking-wider block">Cryptographic ID</span>
            <div className="flex items-center gap-xs">
              <span className="font-mono text-[10px] text-on-surface bg-surface-container px-sm py-1.5 border-2 border-on-surface break-all font-black">
                {trade.verificationHash}
              </span>
              <button
                onClick={handleCopyHash}
                className="p-2 hover:bg-surface-container border-2 border-on-surface text-on-surface cursor-pointer transition-colors shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="space-y-xs">
            <span className="text-[10px] text-[#A09E97] font-bold uppercase tracking-wider block">Agreement Protocol</span>
            <span className="text-xs text-on-surface font-black block leading-tight">Net 30 Settlement, Smart-Contract Escrow Pool</span>
          </div>
        </div>

        {/* Attachment Card */}
        <div className="bg-white border-2 border-on-surface p-md flex flex-col sm:flex-row justify-between items-center gap-md">
          <div className="flex items-center gap-sm">
            <FileText className="w-8 h-8 text-on-surface shrink-0" />
            <div>
              <h4 className="text-xs font-black text-on-surface uppercase tracking-wide">{trade.agreementFile}</h4>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wide">Signed via Crypt-ID • 2.4 MB</p>
            </div>
          </div>
          <button
            onClick={() => alert(`Downloading ${trade.agreementFile}...`)}
            className="flex items-center gap-xs px-sm py-2 bg-on-surface text-background font-black text-[10px] uppercase tracking-wider cursor-pointer border-2 border-on-surface hover:bg-on-surface/90 transition-all shrink-0 w-full sm:w-auto justify-center"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Counterparties */}
      <div className="bg-white border-2 border-on-surface p-lg shadow-md space-y-md">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97] border-b-2 border-on-surface pb-xs">Counterparties</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-xs">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 border-2 border-on-surface overflow-hidden shrink-0 bg-slate-100">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuASOdZbR3jY_CpFY_OH-vJLulFRIBj7sBZTIml4SRX7G02fFLkYBKRztL1RqwFtq5A3NU-bqDlVofyvy3ds3AlXYqWsCyt8d-8d6XGNq0mCOQnFRxIcyUc05mhUNRWjgudT_vrjw9aUlkMZ6lJQFBJHCJAxP2BbYS4RnBePvNC63Bk3V4Kf_fnzXSjj-jQjoekap7imZBTlVcaVLYUmiqDPbbOTGfyWSk9PdKDbqAFwVl3nYWT8FoHA2jhC6QMVX37wCEcgFK-yfdI" alt="Buyer Portrait" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-widest block">Buyer Partner</span>
              <span className="text-sm font-bold text-on-surface block leading-tight">{trade.buyerCompany}</span>
              <span className="text-xs text-on-surface-variant font-medium">HQ: Frankfurt, Germany</span>
            </div>
          </div>

          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 border-2 border-on-surface bg-white text-on-surface flex items-center justify-center shrink-0">
              <span className="font-black text-xs">SL</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-widest block">Supplier Partner</span>
              <span className="text-sm font-bold text-on-surface block leading-tight">Shenzhen Logisense Ltd</span>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Tier-1 Verified Provider</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Actions Card (Screen 5 Next Actions) */}
      <div className="bg-white border-2 border-on-surface p-lg shadow-md space-y-md">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97] border-b-2 border-on-surface pb-xs">Next Operations</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
          <button
            onClick={() => onNavigate('shipment_tracker')}
            className="py-3.5 bg-on-surface text-background font-black text-xs uppercase tracking-widest hover:bg-on-surface/90 transition-all cursor-pointer border-2 border-on-surface flex items-center justify-center gap-xs"
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span>Track Cargo</span>
          </button>

          <button
            onClick={() => onNavigate('dispute_center')}
            className="py-3.5 bg-white hover:bg-surface-container-low border-2 border-on-surface text-on-surface font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-xs"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Raise Dispute</span>
          </button>
        </div>

        {/* Warning Warning Banner */}
        <div className="bg-white border-2 border-on-surface p-md flex items-start gap-md shadow-sm">
          <AlertTriangle className="w-5 h-5 text-on-surface mt-0.5 shrink-0" />
          <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
            The grace period for dispute ends in 4 days. After this, funds will auto-release to the supplier upon delivery proof.
          </p>
        </div>
      </div>

      {/* Map visual card */}
      <div className="relative border-2 border-on-surface shadow-md h-48 bg-[#141414] cursor-pointer" onClick={() => onNavigate('shipment_tracker')}>
        <div className="absolute inset-0 bg-primary-container/10">
          <div className="absolute w-full h-full opacity-40 mix-blend-overlay bg-gradient-to-t from-black via-transparent to-transparent"></div>
          {/* Subtle animated rendering representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 150">
              <path d="M 50,100 C 150,20 250,20 350,100" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="5,5" />
              <circle cx="50" cy="100" r="4" fill="#FFFFFF" />
              <circle cx="350" cy="100" r="4" fill="#FFFFFF" />
              <circle cx="200" cy="50" r="6" fill="#FFFFFF" className="animate-pulse" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-md left-md z-10 text-white">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">Current Location</span>
          <span className="text-sm font-bold uppercase tracking-wider">En route: Singapore Port Corridor</span>
        </div>
      </div>
    </div>
  );
}
