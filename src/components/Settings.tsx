import React, { useState } from 'react';
import { User, ShieldCheck, Mail, Wallet, Key, Globe, LogOut, Copy } from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsProps {
  user: UserType;
  onLogout: () => void;
  onUpdateLanguage: (lang: string) => void;
}

export default function Settings({ user, onLogout, onUpdateLanguage }: SettingsProps) {
  const [lang, setLang] = useState('English (US)');
  const [copied, setCopied] = useState(false);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(user.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-lg animate-in fade-in duration-500" id="settings-screen">
      <div className="space-y-xs">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A09E97] block mb-1">Identity & Wallets</span>
        <h1 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-[-0.04em] leading-none text-on-surface">
          Institutional <span className="font-serif italic font-bold">Settings</span>
        </h1>
        <p className="text-body-md text-on-surface-variant font-medium">
          Manage credentials, security protocols, API bridges, and wallet authorization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        {/* Left Side Settings Form */}
        <div className="md:col-span-8 space-y-lg">
          {/* Profile Card */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-on-surface border-b-2 border-on-surface pb-xs">Account Profile</h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-md pt-xs">
              <div className="w-16 h-16 border-2 border-on-surface overflow-hidden shrink-0 bg-slate-100">
                <img
                  src={user.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuASOdZbR3jY_CpFY_OH-vJLulFRIBj7sBZTIml4SRX7G02fFLkYBKRztL1RqwFtq5A3NU-bqDlVofyvy3ds3AlXYqWsCyt8d-8d6XGNq0mCOQnFRxIcyUc05mhUNRWjgudT_vrjw9aUlkMZ6lJQFBJHCJAxP2BbYS4RnBePvNC63Bk3V4Kf_fnzXSjj-jQjoekap7imZBTlVcaVLYUmiqDPbbOTGfyWSk9PdKDbqAFwVl3nYWT8FoHA2jhC6QMVX37wCEcgFK-yfdI'}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-xs">
                <h4 className="text-lg font-black text-on-surface leading-none uppercase tracking-wide">{user.fullName}</h4>
                <p className="text-xs text-on-surface-variant font-semibold flex items-center gap-xs">
                  <Mail className="w-3.5 h-3.5 text-on-surface shrink-0" />
                  <span>{user.email}</span>
                </p>
                <p className="text-[10px] font-black text-on-surface bg-surface border-2 border-on-surface px-sm py-1 inline-block uppercase tracking-wider">
                  {user.role} Role Authorization
                </p>
              </div>
            </div>
          </div>

          {/* Wallet and Settlement details */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-on-surface border-b-2 border-on-surface pb-xs">Ledger Wallet Integration</h3>
            
            <div className="space-y-md pt-xs">
              <div className="space-y-xs">
                <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-wider block">Escrow Authorized Wallet</span>
                <div className="flex items-center gap-xs">
                  <span className="font-mono text-xs text-on-surface bg-surface p-sm border-2 border-on-surface break-all flex-1 font-bold">
                    {user.walletAddress}
                  </span>
                  <button
                    onClick={handleCopyWallet}
                    className="p-2.5 hover:bg-surface-container border-2 border-on-surface text-on-surface cursor-pointer transition-colors shrink-0 flex items-center gap-xs text-xs font-black uppercase tracking-wider"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-md bg-white border-2 border-on-surface flex items-center justify-between">
                <div className="flex items-center gap-sm text-on-surface">
                  <Wallet className="w-5 h-5 text-on-surface shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-wider block">Wallet Balance</span>
                    <span className="text-lg font-sans font-black uppercase tracking-wider text-on-surface block leading-none mt-0.5">
                      ${user.walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => alert('Bridge protocol holds another $4M pending shipment clearance.')}
                  className="text-xs font-black text-on-surface uppercase tracking-wider underline hover:opacity-85 cursor-pointer"
                >
                  Manage Ledger
                </button>
              </div>
            </div>
          </div>

          {/* System configurations */}
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-on-surface border-b-2 border-on-surface pb-xs">System Language & Preferences</h3>
            
            <div className="space-y-sm">
              <div className="space-y-xs">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block" htmlFor="language-picker">Default Language</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-on-surface absolute left-md top-1/2 -translate-y-1/2" />
                  <select
                    id="language-picker"
                    className="w-full pl-xl pr-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
                    value={lang}
                    onChange={(e) => {
                      setLang(e.target.value);
                      onUpdateLanguage(e.target.value);
                    }}
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="Deutsch (Germany)">Deutsch (Germany)</option>
                    <option value="Mandarin (China)">中文 (Simplified Mandarin)</option>
                    <option value="Spanish (LATAM)">Español (Latin America)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full py-3.5 bg-error text-white font-black text-xs uppercase tracking-widest border-2 border-error hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-xs"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Terminate Current Session</span>
          </button>
        </div>

        {/* Right Side Security Banner */}
        <div className="md:col-span-4 space-y-md">
          <div className="bg-white border-2 border-on-surface p-lg space-y-md shadow-md">
            <div className="flex items-center gap-sm text-on-surface border-b-2 border-on-surface pb-xs">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h4 className="text-[10px] font-black uppercase tracking-wider">Security Seal</h4>
            </div>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              Your connection to the ArcBridge settlement ledger is securely encrypted via cryptographic TLS 1.3 tunnels and backed by our multi-sig smart escrow vault.
            </p>
          </div>

          <div className="bg-white border-2 border-on-surface p-lg space-y-sm text-xs font-bold uppercase tracking-wider shadow-md">
            <span className="text-[10px] text-[#A09E97] font-black uppercase tracking-wider block border-b-2 border-on-surface pb-xs">Integrations Info</span>
            <div className="flex items-center gap-sm pt-xs">
              <Key className="w-4 h-4 text-on-surface shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block truncate font-black text-on-surface">Sandbox: Connected</span>
              </div>
            </div>
            <div className="pt-xs space-y-1">
              <p className="text-[10px] text-[#A09E97] font-bold">Contract: 0x93FA...111E</p>
              <p className="text-[10px] text-[#A09E97] font-bold">Height: #884,921</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
