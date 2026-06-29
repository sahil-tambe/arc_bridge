import React from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, CloudRain, Clock, Plane, MapPin } from 'lucide-react';
import { Trade, Shipment } from '../types';

interface ShipmentTrackerProps {
  onNavigate: (screen: string) => void;
  trade?: Trade;
  shipment: Shipment;
}

export default function ShipmentTracker({ onNavigate, trade, shipment }: ShipmentTrackerProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-lg animate-in fade-in duration-500" id="shipment-tracker-screen">
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
          <span className="text-on-surface font-black">Tracking</span>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-xs">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A09E97] block mb-1">Logistics Engine</span>
        <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-[-0.04em] leading-none text-on-surface">
          Cargo <span className="font-serif italic font-bold">#{shipment.trackingNumber}</span>
        </h1>
        <p className="text-body-md text-on-surface-variant font-medium">
          Real-time carrier validation and customs checkpoint telemetry via {shipment.carrier}
        </p>
      </div>

      {/* Departure and Arrival Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Departure Card */}
        <div className="bg-white border-2 border-on-surface p-lg shadow-md flex items-start gap-md">
          <div className="w-10 h-10 border-2 border-on-surface bg-white flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-on-surface" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-wider block">Departure</span>
            <h3 className="text-xl font-bold text-on-surface leading-tight font-display">{shipment.origin}</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-1">Departed: {shipment.history.find(h => h.status === 'in_transit')?.date || 'Nov 24, 08:30 AM'}</p>
          </div>
        </div>

        {/* Arrival Card */}
        <div className="bg-white border-2 border-on-surface p-lg shadow-md flex items-start gap-md">
          <div className="w-10 h-10 border-2 border-on-surface bg-white flex items-center justify-center shrink-0">
            <Plane className="w-5 h-5 text-on-surface" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-wider block">Arrival</span>
            <h3 className="text-xl font-bold text-on-surface leading-tight font-display">{shipment.destination}</h3>
            <p className="text-xs text-on-surface font-black mt-1 uppercase tracking-wider">ETA: {shipment.eta}</p>
          </div>
        </div>
      </div>

      {/* Transit Map / Path Visualizer */}
      <div className="bg-[#141414] border-2 border-on-surface p-lg h-60 relative overflow-hidden flex flex-col justify-between shadow-md">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>

        <div className="relative z-10 flex justify-between items-start text-white">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 border border-white bg-white text-on-surface text-[9px] font-black uppercase tracking-widest mb-1">
              IN TRANSIT
            </span>
            <p className="text-xs font-bold text-white/70">Carrier Flight Code: AF-203</p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black block text-white/50 tracking-wider">SPEED</span>
            <span className="font-mono text-xs text-white uppercase font-bold">540 kt (998 km/h)</span>
          </div>
        </div>

        {/* Beautiful high-tech SVG mapping line */}
        <div className="relative h-24 w-full">
          <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
            {/* Base grey line */}
            <path d="M 50,50 Q 250,10 450,50" fill="none" stroke="#334155" strokeWidth="2" />
            {/* Active animated blue line */}
            <path
              d="M 50,50 Q 250,10 450,50"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeDasharray="10, 10"
              className="animate-[dash_30s_linear_infinite]"
            />
            {/* Origin Node */}
            <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
            <text x="35" y="70" fill="#94A3B8" className="text-[10px] font-bold">ORD</text>
            
            {/* Plane Icon location */}
            <g transform="translate(260, 24) rotate(5)">
              <circle cx="0" cy="0" r="10" fill="#FFFFFF" className="animate-ping absolute opacity-75" />
              <circle cx="0" cy="0" r="8" fill="#FFFFFF" />
              <Plane className="w-3.5 h-3.5 text-on-surface absolute left-0 top-0 -translate-x-1.5 -translate-y-1.5" />
            </g>

            {/* Destination Node */}
            <circle cx="450" cy="50" r="5" fill="#FFFFFF" />
            <text x="435" y="70" fill="#94A3B8" className="text-[10px] font-bold">LHR</text>
          </svg>
        </div>

        <div className="relative z-10 flex justify-between items-end text-xs text-white/60 font-mono font-bold">
          <span>Lat: 51.4700° N, Lon: 0.4543° W</span>
          <span>Altitude: 38,000 ft</span>
        </div>
      </div>

      {/* Detailed Technical Attributes Grid */}
      <div className="bg-white border-2 border-on-surface p-lg shadow-md">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97] mb-md pb-xs border-b-2 border-on-surface">Technical Specifications</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md uppercase tracking-wider">
          <div className="space-y-xs">
            <span className="text-[10px] font-bold text-[#A09E97] block">Weight & Class</span>
            <span className="text-sm font-black text-on-surface block leading-tight">{shipment.weightKg} kg</span>
            <span className="text-[10px] text-on-surface-variant font-bold block">Priority Air</span>
          </div>

          <div className="space-y-xs">
            <span className="text-[10px] font-bold text-[#A09E97] block">Carrier</span>
            <span className="text-sm font-black text-on-surface block leading-tight">{shipment.carrier}</span>
            <span className="text-[10px] text-on-surface-variant font-bold block">IATA Certified</span>
          </div>

          <div className="space-y-xs">
            <span className="text-[10px] font-bold text-[#A09E97] block">Service Tier</span>
            <span className="text-sm font-black text-on-surface block leading-tight">{shipment.service}</span>
            <span className="text-[10px] text-on-surface-variant font-bold block">Guaranteed Delivery</span>
          </div>

          <div className="space-y-xs">
            <span className="text-[10px] font-bold text-[#A09E97] block">Environmental Logs</span>
            <span className="text-sm font-black text-on-surface block leading-tight flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-on-surface animate-ping"></span>
              <span>18.2 °C</span>
            </span>
            <span className="text-[10px] text-on-surface-variant font-bold block">Container Sealed</span>
          </div>
        </div>
      </div>

      {/* Shipment Timeline Steps */}
      <div className="bg-white border-2 border-on-surface p-lg shadow-md">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A09E97] mb-lg border-b-2 border-on-surface pb-xs">Tracking Timeline</h3>

        <div className="space-y-lg relative pt-xs">
          {/* Vertical linking line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-on-surface/20 z-0"></div>

          {shipment.history.map((step, idx) => {
            const isActive = step.status === shipment.status;
            const isCompleted = step.status === 'order_created' || step.status === 'picked_up' || step.status === 'in_transit';
            const isDelivered = step.status === 'delivered';

            return (
              <div key={idx} className="flex gap-md relative z-10">
                {/* Circle step indicator */}
                <div className="shrink-0 mt-1">
                  {isDelivered ? (
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-on-surface flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-on-surface" />
                    </div>
                  ) : isActive ? (
                    <div className="w-6 h-6 rounded-full bg-on-surface text-background flex items-center justify-center border-2 border-on-surface animate-pulse">
                      <Plane className="w-3.5 h-3.5" />
                    </div>
                  ) : isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-on-surface text-background flex items-center justify-center border-2 border-on-surface">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-on-surface" />
                  )}
                </div>

                <div className="flex-1 pb-xs">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-xs font-black uppercase tracking-wider leading-tight ${isActive ? 'text-on-surface' : 'text-on-surface/70'}`}>
                      {step.title}
                    </h4>
                    <span className="text-[10px] text-[#A09E97] font-bold uppercase tracking-wider">{step.date}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">{step.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
