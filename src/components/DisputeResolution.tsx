import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, ShieldCheck, FileText, CheckCircle2, User, Building, Trash } from 'lucide-react';
import { Dispute, Trade } from '../types';

interface DisputeResolutionProps {
  onNavigate: (screen: string) => void;
  dispute: Dispute;
  trade?: Trade;
  onResolveDispute: (id: string, resolution: 'resolved_refunded' | 'resolved_released') => void;
}

export default function DisputeResolution({ onNavigate, dispute, trade, onResolveDispute }: DisputeResolutionProps) {
  const [decisionNotes, setDecisionNotes] = useState('');

  const handleResolve = (action: 'resolved_refunded' | 'resolved_released') => {
    onResolveDispute(dispute.id, action);
    alert(`Dispute successfully resolved. Decision: ${action === 'resolved_refunded' ? 'REFUNDED TO BUYER' : 'RELEASED TO SUPPLIER'}`);
    onNavigate('dispute_resolver');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-lg animate-in fade-in duration-500" id="dispute-resolution-screen">
      {/* Back and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
        <button
          onClick={() => onNavigate('dispute_resolver')}
          className="flex items-center gap-xs text-[10px] font-black uppercase tracking-wider text-on-surface hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Claims Queue</span>
        </button>

        <div className="flex items-center gap-xs text-[10px] font-bold text-[#A09E97] tracking-[0.2em] uppercase">
          <span>Disputes</span>
          <span>/</span>
          <span className="text-on-surface font-black">{dispute.id}</span>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-xs">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A09E97] block mb-1">Mediation Tribunal</span>
        <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-[-0.04em] leading-none text-on-surface">
          Case <span className="font-serif italic font-bold">#{dispute.id}</span>
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant font-medium">
          Opened on {dispute.dateOpened} • Arbiter Consensus Committee • Value: ${dispute.settlementValue.toLocaleString()} USDC
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Left: Statements (8 cols) */}
        <div className="lg:col-span-8 space-y-lg">
          {/* Case Summary Card */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-on-surface border-b-2 border-on-surface pb-xs">Case Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-xs text-xs uppercase tracking-wider">
              <div>
                <span className="text-[#A09E97] font-black block">Claiming Parties</span>
                <span className="font-bold text-on-surface block leading-tight mt-1">
                  Global BioTech vs. Shenzhen Logisense
                </span>
              </div>
              <div>
                <span className="text-[#A09E97] font-black block">Dispute Reason</span>
                <span className="font-bold text-on-surface block leading-tight mt-1">{dispute.reason}</span>
              </div>
            </div>
          </div>

          {/* Buyer Claim Statement */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <div className="flex items-center gap-sm pb-xs border-b-2 border-on-surface">
              <User className="w-5 h-5 text-on-surface" />
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-on-surface">Buyer Claim Statement</h3>
            </div>
            
            <p className="text-xs md:text-sm text-on-surface-variant font-medium leading-relaxed">
              {dispute.buyerEvidenceText}
            </p>

            <div className="space-y-xs pt-sm">
              <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-wider block">Submitted Evidence (Buyer)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                {dispute.buyerEvidenceFiles.map((f, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-sm border border-on-surface text-xs cursor-pointer hover:bg-surface-container-low transition-colors" onClick={() => alert(`Reviewing file: ${f}`)}>
                    <div className="flex items-center gap-xs">
                      <FileText className="w-4 h-4 text-on-surface shrink-0" />
                      <span className="font-bold text-on-surface truncate max-w-[140px]">{f}</span>
                    </div>
                    <span className="text-[10px] text-on-surface font-black underline uppercase tracking-wider">VIEW</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supplier Rebuttal Statement */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <div className="flex items-center gap-sm pb-xs border-b-2 border-on-surface">
              <Building className="w-5 h-5 text-on-surface" />
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-on-surface">Supplier Rebuttal Statement</h3>
            </div>
            
            <p className="text-xs md:text-sm text-on-surface-variant font-medium leading-relaxed">
              {dispute.supplierEvidenceText || 'Supplier has not submitted a formal counter-statement yet.'}
            </p>

            {dispute.supplierEvidenceFiles && dispute.supplierEvidenceFiles.length > 0 && (
              <div className="space-y-xs pt-sm">
                <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-wider block">Submitted Evidence (Supplier)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  {dispute.supplierEvidenceFiles.map((f, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-sm border border-on-surface text-xs cursor-pointer hover:bg-surface-container-low transition-colors" onClick={() => alert(`Reviewing file: ${f}`)}>
                      <div className="flex items-center gap-xs">
                        <FileText className="w-4 h-4 text-on-surface shrink-0" />
                        <span className="font-bold text-on-surface truncate max-w-[140px]">{f}</span>
                      </div>
                      <span className="text-[10px] text-on-surface font-black underline uppercase tracking-wider">VIEW</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Arbiter panel */}
        <div className="lg:col-span-4 space-y-lg">
          {/* Dispute Action Form */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97] border-b-2 border-on-surface pb-xs">Tribunal Decision</h3>
            
            <div className="space-y-xs">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block" htmlFor="arbiter-notes">Decision Audit Notes</label>
              <textarea
                id="arbiter-notes"
                rows={3}
                className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-xs text-on-surface focus:bg-white outline-none font-medium transition-all resize-none"
                placeholder="Log reason for consensus release or refund..."
                value={decisionNotes}
                onChange={e => setDecisionNotes(e.target.value)}
              />
            </div>

            <div className="space-y-sm">
              <button
                type="button"
                onClick={() => handleResolve('resolved_refunded')}
                className="w-full py-3 bg-error text-white font-black text-xs uppercase tracking-widest border-2 border-error hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-xs"
              >
                <Trash className="w-4 h-4 shrink-0" />
                <span>Approve Refund to Buyer</span>
              </button>

              <button
                type="button"
                onClick={() => handleResolve('resolved_released')}
                className="w-full py-3 bg-on-surface text-background font-black text-xs uppercase tracking-widest border-2 border-on-surface hover:bg-on-surface/90 transition-all cursor-pointer flex items-center justify-center gap-xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Release Escrow to Supplier</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (decisionNotes) {
                    alert(`Additional evidence request broadcasted to counterparties with notes: ${decisionNotes}`);
                    setDecisionNotes('');
                  } else {
                    alert('Please log notes to request evidence.');
                  }
                }}
                className="w-full py-3 bg-white border-2 border-on-surface text-on-surface font-black text-xs uppercase tracking-widest hover:bg-surface-container-low transition-all cursor-pointer flex items-center justify-center gap-xs"
              >
                <span>Request Extra Evidence</span>
              </button>
            </div>
          </div>

          {/* Mediation Timeline visual info */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97] border-b-2 border-on-surface pb-xs">Case Timeline</h4>
            <div className="space-y-sm text-xs font-bold uppercase tracking-wider relative pt-xs">
              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-on-surface/20"></div>
              
              <div className="flex gap-sm relative z-10">
                <div className="w-4 h-4 rounded-full border-2 border-on-surface bg-white flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-on-surface"></div>
                </div>
                <div>
                  <p className="text-xs font-bold">Case Opened</p>
                  <p className="text-[9px] text-[#A09E97]">Oct 24, 14:02</p>
                </div>
              </div>

              <div className="flex gap-sm relative z-10">
                <div className="w-4 h-4 rounded-full border-2 border-on-surface bg-white flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-on-surface"></div>
                </div>
                <div>
                  <p className="text-xs font-bold">Evidence Filed</p>
                  <p className="text-[9px] text-[#A09E97]">Oct 25, 09:15</p>
                </div>
              </div>

              <div className="flex gap-sm relative z-10">
                <div className="w-4 h-4 rounded-full border-2 border-on-surface bg-white flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-on-surface animate-pulse"></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Awaiting Consensus</p>
                  <p className="text-[9px] text-[#A09E97]">In progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
