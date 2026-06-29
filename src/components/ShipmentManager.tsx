import React, { useState } from 'react';
import { ArrowLeft, Truck, Check, AlertTriangle, FileText, Upload, PlusCircle } from 'lucide-react';
import { Trade, Shipment } from '../types';

interface ShipmentManagerProps {
  onNavigate: (screen: string) => void;
  trades: Trade[];
  shipments: Shipment[];
  onDispatchTrade: (id: string, trackingNumber: string, carrier: string) => void;
  onDeliverShipment: (tradeId: string) => void;
}

export default function ShipmentManager({ onNavigate, trades, shipments, onDispatchTrade, onDeliverShipment }: ShipmentManagerProps) {
  const [selectedTradeId, setSelectedTradeId] = useState('');
  const [trackingNo, setTrackingNo] = useState('MAERSK-902241');
  const [carrier, setCarrier] = useState('Maersk Line');
  const [service, setService] = useState('Eco Sea Cargo');
  const [origin, setOrigin] = useState('Port of Shenzhen');
  const [destination, setDestination] = useState('Port of Hamburg');
  const [weight, setWeight] = useState(2500);

  // Filter trades eligible for dispatch (state is 'escrow_locked')
  const dispatchableTrades = trades.filter(t => t.status === 'escrow_locked');

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTradeId) {
      alert('Please select an escrow-locked trade to dispatch.');
      return;
    }

    onDispatchTrade(selectedTradeId, trackingNo, carrier);
    alert(`Cargo successfully dispatched under Tracking #${trackingNo}! Shipment is now in transit.`);
    setSelectedTradeId('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-lg animate-in fade-in duration-500" id="shipment-manager-screen">
      {/* Breadcrumb / Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
        <button
          onClick={() => onNavigate('supplier_dashboard')}
          className="flex items-center gap-xs text-[10px] font-black uppercase tracking-wider text-on-surface hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Supplier Hub</span>
        </button>

        <div className="flex items-center gap-xs text-[10px] font-bold text-[#A09E97] tracking-[0.2em] uppercase">
          <span>Supplier</span>
          <span>/</span>
          <span className="text-on-surface font-black">Cargo Dispatch</span>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-xs">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A09E97] block mb-1">Global Freight Operations</span>
        <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-[-0.04em] leading-none text-on-surface">
          Cargo <span className="font-serif italic font-bold">Dispatch</span>
        </h1>
        <p className="text-body-md text-on-surface-variant font-medium">
          Coordinate port transfers, upload maritime or air bills, and confirm secure escrow-locked delivery.
        </p>
      </div>

      {/* Dispatch form (shown only if there are dispatchable trades) */}
      <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
        <div className="flex items-center gap-sm pb-xs border-b-2 border-on-surface text-on-surface">
          <Truck className="w-5 h-5 shrink-0" />
          <h3 className="text-xs font-black uppercase tracking-[0.15em]">Dispatch Escrow-Locked Consignments</h3>
        </div>

        {dispatchableTrades.length > 0 ? (
          <form onSubmit={handleDispatch} className="space-y-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block" htmlFor="dispatch-trade">Select Trade Contract</label>
                <select
                  id="dispatch-trade"
                  className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-xs md:text-sm text-on-surface focus:bg-white outline-none font-medium transition-all"
                  value={selectedTradeId}
                  onChange={e => setSelectedTradeId(e.target.value)}
                >
                  <option value="">-- Choose Locked Contract --</option>
                  {dispatchableTrades.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id} - {t.title} (${t.valueUsdc.toLocaleString()} USDC)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-xs">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block" htmlFor="dispatch-carrier">Carrier</label>
                <select
                  id="dispatch-carrier"
                  className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-xs md:text-sm text-on-surface focus:bg-white outline-none font-medium transition-all"
                  value={carrier}
                  onChange={e => setCarrier(e.target.value)}
                >
                  <option value="Maersk Line">Maersk Line</option>
                  <option value="Global AeroLogix">Global AeroLogix</option>
                  <option value="DHL Global Forwarding">DHL Global Forwarding</option>
                  <option value="FedEx Express Cargo">FedEx Express Cargo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="space-y-xs">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block" htmlFor="dispatch-tracking">Tracking / B/L No.</label>
                <input
                  id="dispatch-tracking"
                  type="text"
                  className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-xs md:text-sm text-on-surface focus:bg-white outline-none font-mono font-bold transition-all"
                  value={trackingNo}
                  onChange={e => setTrackingNo(e.target.value)}
                />
              </div>

              <div className="space-y-xs">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block" htmlFor="dispatch-origin">Origin Port</label>
                <input
                  id="dispatch-origin"
                  type="text"
                  className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-xs md:text-sm text-on-surface focus:bg-white outline-none font-bold transition-all"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                />
              </div>

              <div className="space-y-xs">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block" htmlFor="dispatch-destination">Destination</label>
                <input
                  id="dispatch-destination"
                  type="text"
                  className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-xs md:text-sm text-on-surface focus:bg-white outline-none font-bold transition-all"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-on-surface text-background font-black text-xs uppercase tracking-widest border-2 border-on-surface hover:bg-on-surface/90 transition-all cursor-pointer flex items-center justify-center gap-xs shadow-md"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Confirm Freight Dispatch & Post B/L Hash</span>
            </button>
          </form>
        ) : (
          <div className="p-md bg-white border-2 border-dashed border-on-surface/35 text-center">
            <p className="text-xs md:text-sm text-on-surface-variant font-black uppercase tracking-wider">
              No cargo awaiting dispatch.
            </p>
            <p className="text-[10px] text-[#A09E97] mt-1 font-bold uppercase tracking-wider">
              Contracts must be "Escrow Locked" by buyers before freight shipping can be initiated.
            </p>
          </div>
        )}
      </div>

      {/* Active shipments overview & trigger delivery */}
      <div className="space-y-md">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97]">Active In-Transit Cargo</h3>

        <div className="space-y-md">
          {shipments.filter(s => s.status !== 'delivered').map((shipment) => (
            <div key={shipment.tradeId} className="bg-white border-2 border-on-surface p-lg flex flex-col md:flex-row md:items-center justify-between gap-md shadow-md">
              <div className="space-y-xs">
                <div className="flex items-center gap-sm">
                  <span className="font-mono text-xs font-black text-on-surface">{shipment.trackingNumber}</span>
                  <span className="text-[9px] border-2 border-on-surface bg-white text-on-surface px-2 py-0.5 font-black uppercase tracking-wider">
                    {shipment.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-on-surface">Route: {shipment.origin} &rarr; {shipment.destination}</h4>
                <p className="text-xs text-on-surface-variant font-medium">Carrier: {shipment.carrier} • Location: {shipment.currentLocation}</p>
              </div>

              {/* Action to confirm Delivery (triggers complete) */}
              <button
                onClick={() => {
                  onDeliverShipment(shipment.tradeId);
                  alert('Delivery reported to the Ledger! Settlement initiated.');
                }}
                className="px-md py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest border-2 border-emerald-600 flex items-center justify-center gap-xs cursor-pointer shrink-0"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>Confirm Delivery</span>
              </button>
            </div>
          ))}

          {shipments.filter(s => s.status !== 'delivered').length === 0 && (
            <div className="p-xl bg-white border-2 border-dashed border-on-surface/35 text-center text-on-surface-variant">
              <p className="text-sm font-black uppercase tracking-wider text-on-surface">No active in-transit shipments.</p>
              <p className="text-[10px] text-[#A09E97] font-bold uppercase tracking-wider mt-1">Dispatch fresh cargo to track real-time telemetry checkpoints.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
