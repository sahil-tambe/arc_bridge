import React, { useState, useRef } from 'react';
import { ArrowLeft, AlertTriangle, ShieldCheck, Upload, FileText, X, Check } from 'lucide-react';
import { Trade, Dispute } from '../types';

interface DisputeCenterProps {
  onNavigate: (screen: string) => void;
  trade?: Trade;
  onRaiseDispute: (dispute: Omit<Dispute, 'id' | 'status' | 'dateOpened' | 'settlementValue' | 'verifiedParty'>) => void;
}

export default function DisputeCenter({ onNavigate, trade, onRaiseDispute }: DisputeCenterProps) {
  const [reason, setReason] = useState('Damaged Goods / QC Failure');
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>(['QC_Report_Draft.pdf']);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const names = Array.from(e.dataTransfer.files as FileList).map((f: File) => f.name);
      setEvidenceFiles(prev => [...prev, ...names]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files as FileList).map((f: File) => f.name);
      setEvidenceFiles(prev => [...prev, ...names]);
    }
  };

  const removeFile = (idx: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      alert('Please provide a detailed description of the dispute claim.');
      return;
    }

    onRaiseDispute({
      tradeId: trade?.id || 'TRD-8829-QX',
      reason,
      description,
      buyerEvidenceText: description,
      buyerEvidenceFiles: evidenceFiles,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-lg animate-in fade-in duration-500" id="dispute-center-screen">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
        <button
          onClick={() => onNavigate('trade_details')}
          className="flex items-center gap-xs text-[10px] font-black uppercase tracking-wider text-on-surface hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Trade Details</span>
        </button>

        <div className="flex items-center gap-xs text-[10px] font-bold text-[#A09E97] tracking-[0.2em] uppercase">
          <span>Trades</span>
          <span>/</span>
          <span>{trade?.id || 'TRD-8829-QX'}</span>
          <span>/</span>
          <span className="text-on-surface font-black">New Dispute</span>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-xs">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A09E97] block mb-1">Conflict Mediation</span>
        <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-[-0.04em] leading-none text-on-surface">
          Dispute <span className="font-serif italic font-bold text-on-surface">Center</span>
        </h1>
        <p className="text-body-md text-on-surface-variant font-medium">
          Submit a formal claim. Kestrel Trade mediation protocols resolve complex contractual disputes within 48 hours.
        </p>
      </div>

      {/* Linked Transaction Card */}
      <div className="bg-white border-2 border-on-surface p-lg flex flex-col sm:flex-row justify-between sm:items-center gap-md shadow-md">
        <div>
          <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-wider block">Linked Transaction</span>
          <h3 className="text-lg font-bold text-on-surface font-display mt-0.5">{trade?.title || 'Precision Medical Components (Lot A-12)'}</h3>
          <p className="text-xs text-on-surface-variant font-medium">Trade ID: {trade?.id || 'TRD-8829-QX'} • Supplier: Shenzhen Logisense Ltd</p>
        </div>
        <div className="sm:text-right shrink-0">
          <span className="text-[10px] font-black text-[#A09E97] uppercase tracking-wider block">Escrow Protected</span>
          <span className="text-2xl font-sans font-black text-on-surface uppercase tracking-tighter">
            ${trade?.valueUsdc.toLocaleString('en-US') || '124,500.00'} USDC
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="md:col-span-8 space-y-lg">
          {/* Dispute Form Card */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            {/* Primary Reason */}
            <div className="space-y-xs">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block" htmlFor="dispute-reason">Primary Dispute Reason</label>
              <select
                id="dispute-reason"
                className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="Damaged Goods / QC Failure">Damaged Goods / QC Failure</option>
                <option value="Late Delivery / Contract Breach">Late Delivery / Contract Breach</option>
                <option value="Deficient Quantity">Deficient Quantity</option>
                <option value="Counterfeit Assets / Fraud Alert">Counterfeit Assets / Fraud Alert</option>
              </select>
            </div>

            {/* Statement description */}
            <div className="space-y-xs">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block" htmlFor="dispute-description">Detailed Description</label>
              <textarea
                id="dispute-description"
                rows={5}
                placeholder="Provide a comprehensive statement detailing why the contract terms have not been fulfilled. Include specifics on damaged items, missing volumes, or deviation from agreed specs."
                className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* File Upload Usability Pattern */}
            <div className="space-y-xs">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Evidence Attachments</label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-lg text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-xs ${
                  isDragging
                    ? 'border-on-surface bg-surface-container'
                    : 'border-on-surface/25 bg-white hover:border-on-surface'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                />
                <Upload className="w-8 h-8 text-on-surface" />
                <p className="text-xs font-black text-on-surface uppercase tracking-wider">Drag & drop files here or click to upload</p>
                <p className="text-[10px] text-[#A09E97] font-bold uppercase tracking-wider">Supports PDF, PNG, JPG, CSV up to 10MB</p>
              </div>

              {/* Uploaded File list */}
              {evidenceFiles.length > 0 && (
                <div className="space-y-xs mt-sm">
                  {evidenceFiles.map((f, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-sm border border-on-surface text-xs">
                      <div className="flex items-center gap-sm">
                        <FileText className="w-4 h-4 text-on-surface shrink-0" />
                        <span className="font-bold text-on-surface truncate max-w-[200px]">{f}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="text-on-surface hover:text-error cursor-pointer p-0.5 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Action row */}
          <div className="flex flex-col gap-sm">
            <button
              type="submit"
              className="w-full py-3.5 bg-error text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer border-2 border-error flex items-center justify-center gap-xs"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Initiate Dispute Claim</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('trade_details')}
              className="w-full py-3.5 bg-white hover:bg-surface-container-low border-2 border-on-surface text-on-surface font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-xs"
            >
              <span>Return to Transaction</span>
            </button>
          </div>
        </form>

        {/* Side Panel */}
        <div className="md:col-span-4 space-y-md">
          {/* Dispute Mediation Guarantee banner */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <div className="flex items-center gap-sm text-on-surface border-b-2 border-on-surface pb-xs">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h4 className="text-[10px] font-black uppercase tracking-wider">Mediation Seal</h4>
            </div>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              Kestrel Trade secures 100% of the transaction escrow in locked vaults. Neither party can retrieve funds until verified by our multi-signature mediation committee.
            </p>
            
            <div className="pt-xs space-y-sm text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-sm">
                <div className="w-5 h-5 border-2 border-on-surface bg-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-on-surface" />
                </div>
                <span>Neutral Committee</span>
              </div>
              <div className="flex items-center gap-sm">
                <div className="w-5 h-5 border-2 border-on-surface bg-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-on-surface" />
                </div>
                <span>24.8hr Median Settle</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
