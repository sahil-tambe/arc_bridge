import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Bolt } from 'lucide-react';
import { Role, User as UserType } from '../types';
import { authenticateUser } from '../utils/auth';

interface LoginProps {
  onNavigate: (screen: string) => void;
  onLogin: (user: UserType) => void;
}

export default function Login({ onNavigate, onLogin }: LoginProps) {
  const [email, setEmail] = useState('alex@globalbiotech.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('buyer');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide an email and access key.');
      return;
    }

    const authenticated = authenticateUser(email, password);
    if (!authenticated) {
      setError('Invalid email or access key. Please verify your credentials.');
      return;
    }

    onLogin(authenticated);
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-xl relative overflow-hidden" id="login-screen-container">
      {/* Left side Form (7 cols on desktop) */}
      <div className="lg:col-span-7 flex flex-col justify-center max-w-[480px] mx-auto w-full">
        <div className="mb-lg text-center md:text-left">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant mb-3 block">Powered by Arc</span>
          <h1 className="font-sans text-[48px] md:text-[56px] font-black uppercase tracking-[-0.04em] leading-[0.8] text-on-surface mb-2">Arc Bridge</h1>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-sans text-lg md:text-xl font-black uppercase tracking-wider text-on-surface">Programmable Trade Settlement</h2>
            <div className="h-[3px] bg-on-surface flex-grow"></div>
          </div>
          <p className="font-sans text-body-md text-on-surface-variant font-medium">Access your institutional capital portal with secure credentials.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-on-surface p-lg md:p-xl shadow-md">
          {error && (
            <div className="mb-md p-md bg-error-container text-on-error-container rounded-none text-body-md border-2 border-on-surface font-bold">
              {error}
            </div>
          )}

          <form className="space-y-lg" onSubmit={handleSubmit}>
            {/* Quick Demo Role Picker */}
            <div className="space-y-xs">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Institutional Role Mode</label>
              <div className="grid grid-cols-3 gap-xs">
                <button
                  type="button"
                  className={`py-2 px-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                    role === 'buyer' && !email.includes('hub') && !email.includes('compliance')
                      ? 'bg-on-surface text-background border-on-surface'
                      : 'bg-white border-on-surface/20 hover:border-on-surface text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => {
                    setRole('buyer');
                    setEmail('alex@globalbiotech.com');
                  }}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  className={`py-2 px-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                    role === 'supplier' || email.includes('hub')
                      ? 'bg-on-surface text-background border-on-surface'
                      : 'bg-white border-on-surface/20 hover:border-on-surface text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => {
                    setRole('supplier');
                    setEmail('logistics_hub_42@arcbridge.io');
                  }}
                >
                  Supplier
                </button>
                <button
                  type="button"
                  className={`py-2 px-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                    role === 'compliance' || email.includes('compliance')
                      ? 'bg-on-surface text-background border-on-surface'
                      : 'bg-white border-on-surface/20 hover:border-on-surface text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => {
                    setRole('compliance');
                    setEmail('compliance_officer@arcbridge.io');
                  }}
                >
                  Arbiter
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-sm">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider block font-bold" htmlFor="email">Institutional Email</label>
              <div className="relative group">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full pl-11 pr-4 py-3 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-sm">
              <div className="flex justify-between items-center">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider block font-bold" htmlFor="password">Access Key</label>
                <a className="text-xs text-on-surface font-bold underline hover:text-on-surface-variant transition-colors" href="#forgot">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-11 pr-11 py-3 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-on-surface text-background font-black text-xs uppercase tracking-[0.2em] hover:bg-on-surface/95 transition-all duration-150 flex items-center justify-center gap-sm cursor-pointer border-2 border-on-surface shadow-sm"
            >
              <span>Authenticate Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-xl">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-on-surface/25"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold">
              <span className="px-md bg-white text-on-surface-variant uppercase tracking-[0.2em]">OR SECURE TRANSFER</span>
            </div>
          </div>

          {/* Social Login Cluster */}
          <div className="grid grid-cols-2 gap-md">
            {/* Google */}
            <button
              onClick={() => {
                const user = authenticateUser('alex@globalbiotech.com', 'password123');
                if (user) onLogin(user);
              }}
              className="flex items-center justify-center gap-sm py-2.5 px-md border-2 border-on-surface bg-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#141414"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#141414"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#141414"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#141414"></path>
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">Google SSO</span>
            </button>
            {/* GitHub */}
            <button
              onClick={() => {
                const user = authenticateUser('alex@globalbiotech.com', 'password123');
                if (user) onLogin(user);
              }}
              className="flex items-center justify-center gap-sm py-2.5 px-md border-2 border-on-surface bg-surface hover:bg-surface-container-low transition-colors duration-150 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.403 22 12.017 22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">GitHub</span>
            </button>
          </div>

          {/* Wallet Login Shortcut */}
          <div className="mt-md">
            <button
              type="button"
              onClick={() => {
                const user = authenticateUser(email, 'password123');
                if (user) {
                  onLogin({
                    ...user,
                    walletBalance: 250000,
                    walletAddress: '0xArcB' + Math.random().toString(16).substring(2, 10).toUpperCase() + 'E492',
                    isLoggedIn: true
                  });
                }
              }}
              className="w-full flex items-center justify-center gap-sm py-2.5 px-md border-2 border-dashed border-on-surface bg-[#FAF8F5] hover:bg-on-surface hover:text-background transition-colors duration-150 cursor-pointer text-xs font-black uppercase tracking-widest"
            >
              <Bolt className="w-4 h-4 text-on-surface group-hover:text-background" />
              <span>Connect & Sign with Arc Wallet</span>
            </button>
          </div>

          {/* Footer Links */}
          <div className="mt-xl pt-lg border-t-2 border-on-surface/10 text-center">
            <p className="text-body-md text-on-surface-variant font-medium">
              New to the protocol?{' '}
              <button
                type="button"
                className="text-on-surface font-black underline hover:text-on-surface-variant cursor-pointer"
                onClick={() => onNavigate('create_account')}
              >
                Register Key
              </button>
            </p>
          </div>
        </div>

        {/* Legal/Trust Footer */}
        <div className="mt-lg flex justify-between items-center px-md text-on-surface-variant/60 text-[9px] font-bold uppercase tracking-widest">
          <span>SECURED BY SHIELD v4.2</span>
          <span className="flex items-center gap-xs">
            <ShieldCheck className="w-4 h-4 text-on-surface" />
            ISO 27001 PROVEN
          </span>
        </div>
      </div>

      {/* Right side Visual (5 cols on desktop, hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-5 flex-col gap-lg pointer-events-none self-center h-[540px]">
        {/* Editorial Feature block */}
        <div className="flex-grow border-2 border-on-surface bg-white shadow-md p-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#A09E97]">Institutional Series</span>
              <span className="text-lg font-serif italic text-on-surface">Issue No. 04</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#A09E97]">Archive Code</span>
              <div className="text-xs font-mono font-bold">2026—2027</div>
            </div>
          </div>

          <div className="my-auto py-md">
            <div className="text-[64px] font-black leading-[0.8] tracking-tighter uppercase text-on-surface select-none">
              BOLD
            </div>
            <div className="flex items-center gap-3">
              <div className="h-[2px] bg-on-surface flex-grow"></div>
              <div className="text-[64px] font-black leading-[0.8] tracking-tighter uppercase text-on-surface select-none">
                VISION
              </div>
            </div>
            <div className="text-[64px] font-black leading-[0.8] tracking-tighter uppercase text-on-surface/10 select-none">
              SECURE
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="max-w-xs">
              <p className="text-xs font-bold leading-tight uppercase tracking-wider text-on-surface-variant">
                Raw cryptographic settlement and high-contrast ledger workflows.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[48px] font-serif italic leading-none text-on-surface">04</span>
            </div>
          </div>
        </div>

        <div className="h-32 border-2 border-on-surface bg-on-surface p-lg flex items-center gap-md text-background">
          <div className="w-12 h-12 border-2 border-background bg-background flex items-center justify-center shrink-0">
            <Bolt className="w-6 h-6 text-on-surface" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-background/80 block">Escrow Ledger Protocol</span>
            <span className="font-sans font-black text-2xl uppercase tracking-tighter text-background">0.4ms Consensus</span>
          </div>
        </div>
      </div>
    </div>
  );
}
