import React, { useState } from 'react';
import { Shield, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { Role, User as UserType } from '../types';
import { registerUser } from '../utils/auth';

interface CreateAccountProps {
  onNavigate: (screen: string) => void;
  onCreateAccount: (user: UserType) => void;
}

export default function CreateAccount({ onNavigate, onCreateAccount }: CreateAccountProps) {
  const [role, setRole] = useState<Role>('buyer');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !companyName || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    const registered = registerUser(fullName, companyName, email, role, password);
    if (!registered) {
      setError('Email is already registered. Please sign in or use a different email.');
      return;
    }

    onCreateAccount(registered);
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white border-2 border-on-surface shadow-md overflow-hidden" id="create-account-card">
      {/* Left Side: Visual/Context (Stark Modernist Sidebar) */}
      <div className="hidden lg:flex flex-col p-xl bg-on-surface text-background relative overflow-hidden justify-between">
        <div className="relative z-10 space-y-lg">
          <div className="inline-flex items-center gap-xs px-sm py-1 border border-background text-background text-[10px] font-black uppercase tracking-wider">
            <Shield className="w-4 h-4 text-background shrink-0" />
            <span>Institutional Grade Security</span>
          </div>
          <h1 className="font-sans text-4xl text-background font-black leading-tight uppercase tracking-tight">
            Empowering Global <span className="font-serif italic font-bold">Capital Flow</span>
          </h1>
          <p className="font-sans text-body-lg text-background/80 font-medium">
            Join the next generation of B2B financial settlement infrastructure. Register now to access high-speed cross-border trade rails.
          </p>
          
          <div className="pt-lg space-y-md border-t border-background/20">
            <div className="flex items-start gap-md">
              <Zap className="w-5 h-5 text-background shrink-0 mt-0.5" />
              <div>
                <h3 className="font-sans font-black text-xs uppercase tracking-wider text-background">Instant Settlement</h3>
                <p className="text-xs text-background/70 font-medium">Reduce T+3 cycles to minutes with our unified ledger system.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-md">
              <BarChart3 className="w-5 h-5 text-background shrink-0 mt-0.5" />
              <div>
                <h3 className="font-sans font-black text-xs uppercase tracking-wider text-background">Real-time Visibility</h3>
                <p className="text-xs text-background/70 font-medium">Track capital positions across all accounts with executive-level precision.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-[10px] font-bold text-background/60 uppercase tracking-widest flex items-center gap-xs">
          <span>Trusted by 500+ institutions worldwide</span>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="p-lg md:p-xl flex flex-col justify-center">
        <div className="mb-lg">
          <h2 className="font-sans text-3xl font-black uppercase tracking-tighter text-on-surface animate-in fade-in" id="form-heading">Create Account</h2>
          <p className="text-body-md text-on-surface-variant font-medium">Enter your credentials to begin onboarding.</p>
        </div>

        {error && (
          <div className="mb-md p-md bg-error text-background border-2 border-on-surface font-bold text-body-md">
            {error}
          </div>
        )}

        <form className="space-y-md" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="space-y-xs">
            <label className="text-[10px] font-black text-on-surface-variant block uppercase tracking-wider">Account Role</label>
            <div className="grid grid-cols-2 gap-sm">
              <button
                type="button"
                id="role-buyer"
                className={`flex flex-col items-center justify-center p-md border-2 transition-all cursor-pointer ${
                  role === 'buyer'
                    ? 'border-on-surface bg-on-surface text-background font-black'
                    : 'border-on-surface/20 bg-white hover:border-on-surface text-on-surface font-semibold'
                }`}
                onClick={() => setRole('buyer')}
              >
                <span className="material-symbols-outlined text-xl mb-1">shopping_cart</span>
                <span className="text-[10px] font-black uppercase tracking-wider">Buyer</span>
              </button>
              
              <button
                type="button"
                id="role-supplier"
                className={`flex flex-col items-center justify-center p-md border-2 transition-all cursor-pointer ${
                  role === 'supplier'
                    ? 'border-on-surface bg-on-surface text-background font-black'
                    : 'border-on-surface/20 bg-white hover:border-on-surface text-on-surface font-semibold'
                }`}
                onClick={() => setRole('supplier')}
              >
                <span className="material-symbols-outlined text-xl mb-1">factory</span>
                <span className="text-[10px] font-black uppercase tracking-wider">Supplier</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="text-[10px] font-black text-on-surface-variant block uppercase tracking-wider" htmlFor="full-name">Full Name</label>
              <input
                id="full-name"
                type="text"
                className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            <div className="space-y-xs">
              <label className="text-[10px] font-black text-on-surface-variant block uppercase tracking-wider" htmlFor="company-name">Company Name</label>
              <input
                id="company-name"
                type="text"
                className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
                placeholder="Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="text-[10px] font-black text-on-surface-variant block uppercase tracking-wider" htmlFor="email">Work Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
              placeholder="john@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="text-[10px] font-black text-on-surface-variant block uppercase tracking-wider" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-xs">
              <label className="text-[10px] font-black text-on-surface-variant block uppercase tracking-wider" htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                className="w-full px-md py-2.5 bg-surface border-2 border-on-surface text-body-md text-on-surface focus:bg-white outline-none font-medium transition-all"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-start gap-sm py-xs">
            <input
              id="terms"
              type="checkbox"
              className="w-4.5 h-4.5 mt-0.5 border-2 border-on-surface text-on-surface focus:ring-0 accent-on-surface"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label className="text-xs text-on-surface-variant font-medium leading-snug" htmlFor="terms">
              I agree to the <a className="text-on-surface hover:underline font-bold" href="#terms">Terms of Service</a> and <a className="text-on-surface hover:underline font-bold" href="#privacy">Privacy Policy</a>.
            </label>
          </div>

          <div className="pt-md space-y-md">
            <button
              type="submit"
              id="submit-register"
              className="w-full py-3.5 bg-on-surface text-background font-black text-xs uppercase tracking-widest hover:bg-on-surface/90 transition-all cursor-pointer border-2 border-on-surface flex items-center justify-center gap-xs"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            
            <div className="text-center">
              <span className="text-xs text-on-surface-variant font-medium">Already have an account?</span>
              <button
                type="button"
                className="text-on-surface font-black text-xs uppercase tracking-widest underline ml-xs hover:text-on-surface-variant cursor-pointer"
                onClick={() => onNavigate('login')}
              >
                Sign In
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
