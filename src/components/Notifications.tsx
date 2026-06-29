import React, { useState } from 'react';
import { Bell, Clock, Truck, ShieldAlert, Check, CheckCircle2 } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsProps {
  onNavigate: (screen: string) => void;
  onSelectTrade: (id: string) => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function Notifications({ onNavigate, onSelectTrade, notifications, onMarkRead, onMarkAllRead }: NotificationsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'trades' | 'shipments' | 'escrow'>('all');

  const filtered = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  const handleAction = (n: Notification) => {
    onMarkRead(n.id);
    if (n.actionScreen) {
      if (n.actionScreen === 'incoming_orders') {
        onNavigate('incoming_orders');
      } else if (n.actionScreen === 'shipment_tracker') {
        onSelectTrade('TRD-8829-QX');
        onNavigate('shipment_tracker');
      } else if (n.actionScreen === 'wallet') {
        onNavigate('settings');
      } else if (n.actionScreen === 'settings') {
        onNavigate('settings');
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-lg animate-in fade-in duration-500" id="notifications-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div className="space-y-xs">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A09E97] block mb-1">Ledger Alerts</span>
          <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-[-0.04em] leading-none text-on-surface">
            Notifications <span className="font-serif italic font-bold">Hub</span>
          </h1>
          <p className="text-body-md text-on-surface-variant font-medium">
            Stay informed of settlement releases, trade approvals, and compliance flags.
          </p>
        </div>
        <button
          onClick={onMarkAllRead}
          className="px-md py-2.5 bg-white hover:bg-surface-container-low text-on-surface border-2 border-on-surface text-xs font-black uppercase tracking-wider flex items-center gap-xs cursor-pointer transition-colors self-start md:self-center shadow-sm shrink-0"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-on-surface text-xs font-black uppercase tracking-widest select-none mt-md">
        {(['all', 'trades', 'shipments', 'escrow'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-md py-3.5 border-b-4 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-on-surface text-on-surface'
                : 'border-transparent text-[#A09E97] hover:text-on-surface'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border-2 border-on-surface overflow-hidden shadow-md">
        <div className="divide-y-2 divide-on-surface">
          {filtered.map(notif => {
            let icon = <Bell className="w-5 h-5 text-on-surface" />;

            if (notif.type === 'shipments') {
              icon = <Truck className="w-5 h-5 text-on-surface" />;
            } else if (notif.type === 'escrow') {
              icon = <ShieldAlert className="w-5 h-5 text-on-surface" />;
            }

            return (
              <div
                key={notif.id}
                className={`p-lg flex items-start justify-between gap-md hover:bg-surface-container-low transition-colors ${
                  !notif.read ? 'bg-white border-l-[8px] border-on-surface' : ''
                }`}
              >
                <div className="flex items-start gap-md min-w-0">
                  <div className="w-10 h-10 border-2 border-on-surface bg-white flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                  <div className="space-y-xs min-w-0">
                    <div className="flex items-center gap-sm">
                      <h4 className="font-black text-sm uppercase tracking-wide text-on-surface truncate leading-none">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-on-surface shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-on-surface-variant font-medium leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.actionLabel && (
                      <button
                        onClick={() => handleAction(notif)}
                        className="text-xs text-on-surface font-black uppercase tracking-wider underline hover:opacity-85 cursor-pointer inline-flex items-center gap-xs pt-xs"
                      >
                        <span>{notif.actionLabel}</span>
                        <span>&rarr;</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 ml-sm font-bold uppercase tracking-wider">
                  <span className="text-[9px] text-[#A09E97] flex items-center gap-xs justify-end">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{notif.timestamp}</span>
                  </span>
                  {!notif.read && (
                    <button
                      onClick={() => onMarkRead(notif.id)}
                      className="text-[9px] text-on-surface font-black hover:underline mt-xs block cursor-pointer text-right w-full"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-xl text-center space-y-sm text-on-surface-variant">
              <p className="text-sm font-black uppercase tracking-wider text-on-surface">No alerts available in this filter.</p>
              <p className="text-[10px] text-[#A09E97] font-bold uppercase tracking-wider">Any trade actions or shipment milestones will trigger notices here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
