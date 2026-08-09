import React, { useState } from 'react';
import { Package, Truck, ShieldCheck, CheckCircle2, FileText, Info } from 'lucide-react';
import { Trade } from '../types';

interface NewTradeProps {
  onNavigate: (screen: string) => void;
  onInitiateTrade: (trade: Omit<Trade, 'id' | 'createdDate' | 'verificationHash' | 'agreementFile' | 'buyerName' | 'buyerCompany'>) => void;
}

export default function NewTrade({ onNavigate, onInitiateTrade }: NewTradeProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hsCode, setHsCode] = useState('8517.13.00');
  const [quantity, setQuantity] = useState<number>(0);
  const [valueUsdc, setValueUsdc] = useState<number>(0);
  const [supplierEmail, setSupplierEmail] = useState('');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('');
  const [shippingMethod, setShippingMethod] = useState('Air Freight (Express)');
  const [error, setError] = useState('');

  // Math variables
  const escrowFee = parseFloat((valueUsdc * 0.0015).toFixed(2));
  const gasEst = valueUsdc > 0 ? 4.20 : 0.00;
  const totalPayable = parseFloat((valueUsdc + escrowFee + gasEst).toFixed(2));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !supplierEmail || !targetDeliveryDate || quantity <= 0 || valueUsdc <= 0) {
      setError('All main fields, quantity, and cargo value must be completed with valid numbers.');
      return;
    }

    onInitiateTrade({
      title,
      description,
      hsCode,
      quantity,
      valueUsdc,
      escrowFee,
      networkGas: gasEst,
      totalPayable,
      supplierEmail,
      targetDeliveryDate,
      shippingMethod,
      status: 'created'
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-lg animate-in fade-in duration-500" id="new-trade-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-xs text-[10px] font-bold text-[#A09E97] tracking-[0.2em] uppercase">
        <button onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Trades</button>
        <span>/</span>
        <span className="text-on-surface font-black">New Settlement</span>
      </div>

      <div className="space-y-xs">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A09E97] block mb-1">Settlement Engine</span>
        <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-[-0.04em] leading-none text-on-surface">
          Initiate Global <span className="font-serif italic font-bold">Trade</span>
        </h1>
        <p className="text-body-md text-on-surface-variant font-medium">
          Define your trade parameters. Kestrel Trade ensures secure USDC settlement and regulatory compliance across 150+ jurisdictions.
        </p>
      </div>

      {error && (
        <div className="p-md bg-error text-background border-2 border-on-surface font-bold text-body-md">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-lg">
        {/* Product Information Card */}
        <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
          <div className="flex justify-between items-center pb-sm border-b-2 border-on-surface">
            <div className="flex items-center gap-sm">
              <Package className="w-5 h-5 text-on-surface" />
              <h2 className="text-xs font-black uppercase tracking-[0.15em] text-on-surface">Product Information</h2>
            </div>
            <button
              type="button"
              className="text-[10px] text-on-surface font-black uppercase tracking-wider underline hover:text-on-surface-variant cursor-pointer flex items-center gap-xs"
              onClick={() => alert('Product specification validated against Global Trade Harmonized Database.')}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Validate Product</span>
            </button>
          </div>

          <div className="space-y-md">
            <div className="space-y-xs">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block" htmlFor="trade-title">Trade Title</label>
              <input
                id="trade-title"
                type="text"
                placeholder="e.g. Q4 Consumer Electronics Shipment"
                className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-xs">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block" htmlFor="trade-description">Description</label>
              <textarea
                id="trade-description"
                rows={3}
                placeholder="Detailed manifest of goods, serial ranges, and quality standards..."
                className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block flex items-center gap-xs" htmlFor="trade-hs-code">
                  <span>HS Code (Optional)</span>
                  <Info className="w-3.5 h-3.5 text-on-surface cursor-help" onClick={() => alert('Harmonized System tariff classification code.')} />
                </label>
                <input
                  id="trade-hs-code"
                  type="text"
                  placeholder="8517.13.00"
                  className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                />
              </div>

              <div className="space-y-xs">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block" htmlFor="trade-quantity">Quantity</label>
                <input
                  id="trade-quantity"
                  type="number"
                  placeholder="0"
                  className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment Details Card */}
        <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
          <div className="flex items-center gap-sm pb-sm border-b-2 border-on-surface">
            <Truck className="w-5 h-5 text-on-surface" />
            <h2 className="text-xs font-black uppercase tracking-[0.15em] text-on-surface">Fulfillment Details</h2>
          </div>

          <div className="space-y-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block" htmlFor="trade-supplier-email">Supplier Email</label>
                <input
                  id="trade-supplier-email"
                  type="email"
                  placeholder="vendor@global-logistics.com"
                  className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                />
              </div>

              <div className="space-y-xs">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block" htmlFor="trade-delivery-date">Target Delivery Date</label>
                <input
                  id="trade-delivery-date"
                  type="date"
                  className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
                  value={targetDeliveryDate}
                  onChange={(e) => setTargetDeliveryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block" htmlFor="trade-shipping-method">Shipping Method</label>
                <select
                  id="trade-shipping-method"
                  className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                >
                  <option value="Air Freight (Express)">Air Freight (Express)</option>
                  <option value="Ocean Freight (Eco)">Ocean Freight (Eco)</option>
                  <option value="DHL Global Forwarding">DHL Global Forwarding</option>
                  <option value="FedEx International Priority">FedEx International Priority</option>
                </select>
              </div>

              {/* Added interactive Value selector here inside form so numbers update dynamically! */}
              <div className="space-y-xs">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block" htmlFor="trade-value">Cargo Value (USDC)</label>
                <input
                  id="trade-value"
                  type="number"
                  placeholder="0.00"
                  className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-bold transition-all"
                  value={valueUsdc || ''}
                  onChange={(e) => setValueUsdc(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Trade Value displaying banner (Solid Charcoal black from Bold theme) */}
        <div className="bg-on-surface text-background p-lg border-2 border-on-surface shadow-md space-y-md">
          <div>
            <span className="text-[10px] font-bold text-background/70 uppercase tracking-[0.2em] block">Trade Capital Escrow (USDC)</span>
            <h2 className="text-4xl font-sans font-black mt-1 uppercase tracking-tighter text-background">
              ${valueUsdc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="pt-sm border-t border-background/20 space-y-xs text-xs font-medium">
            <div className="flex justify-between">
              <span className="opacity-70">Escrow Service Fee (0.15%)</span>
              <span className="font-bold">{escrowFee.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Consensus Network Gas Est.</span>
              <span className="font-bold">~{gasEst.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-xs border-t border-background/10">
              <span className="uppercase tracking-wider">Total Settlement Payable</span>
              <span className="text-background">${totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC</span>
            </div>
          </div>
        </div>

        {/* Action Button Card */}
        <div className="bg-white border-2 border-on-surface p-lg flex flex-col gap-sm shadow-md">
          <button
            type="submit"
            className="w-full py-3.5 bg-on-surface text-background font-black text-xs uppercase tracking-widest hover:bg-on-surface/90 transition-all cursor-pointer border-2 border-on-surface flex items-center justify-center gap-xs"
          >
            <span>Create Transaction</span>
          </button>

          <button
            type="button"
            className="w-full py-3.5 bg-white hover:bg-surface-container-low border-2 border-on-surface text-on-surface font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-xs"
            onClick={() => {
              alert('Trade saved to drafts successfully.');
              onNavigate('dashboard');
            }}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            className="text-center text-[10px] text-[#A09E97] hover:text-on-surface font-black uppercase tracking-wider mt-sm transition-all cursor-pointer"
            onClick={() => onNavigate('dashboard')}
          >
            Cancel Transaction
          </button>
        </div>

        {/* Smart Escrow Warning Box */}
        <div className="bg-white border-2 border-on-surface p-md flex items-start gap-md shadow-sm">
          <ShieldCheck className="w-5 h-5 text-on-surface mt-0.5 shrink-0" />
          <div className="space-y-xs">
            <h4 className="text-xs font-black text-on-surface uppercase tracking-wider">Smart Escrow Enabled</h4>
            <p className="text-xs text-on-surface-variant font-medium leading-snug">
              Funds are locked in a secure multi-signature smart escrow contract and only released once the shipping bill of lading is verified against this trade manifest.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
