import { createContext, useContext, useState, useCallback, useEffect, type FormEvent, type ReactNode } from 'react';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { Wallet, X } from 'lucide-react';

export interface WalletState {
  connected: boolean; address: string | null; balance: string | null; network: string | null;
  connecting: boolean; error: string | null; api: ConnectedAPI | null; walletName: string | null;
  databaseAuth: 'checking' | 'signed-out' | 'working' | 'authenticated'; databaseAuthError: string | null;
  accountUser: { name: string; email: string } | null;
}
export interface WalletContextValue extends WalletState {
  connect: (walletId?: 'lace' | '1am') => Promise<void>;
  openAccountAuth: (mode: 'register' | 'signin') => void;
  disconnect: () => void; refreshBalance: () => Promise<void>; clearError: () => void;
}
const WalletContext = createContext<WalletContextValue | null>(null);
const SPECKS_PER_DUST = 1_000_000_000_000_000n;
function formatDustBalance(specks: bigint) {
  const millionths = (specks * 1_000_000n + SPECKS_PER_DUST / 2n) / SPECKS_PER_DUST;
  const whole = millionths / 1_000_000n;
  const fraction = (millionths % 1_000_000n).toString().padStart(6, '0').replace(/0+$/, '') || '0';
  return `${whole.toLocaleString('en-US')}.${fraction} DUST`;
}
declare global { interface Window { midnight?: Record<string, InitialAPI> } }

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletChooserOpen, setWalletChooserOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'signin' | null>(null);
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [state, setState] = useState<WalletState>({ connected: false, address: null, balance: null, network: 'Midnight Preprod', connecting: false, error: null, api: null, walletName: null, databaseAuth: 'checking', databaseAuthError: null, accountUser: null });

  const clearError = useCallback(() => setState((s) => ({ ...s, error: null })), []);
  const refreshBalance = useCallback(async () => {
    if (!state.api) return;
    const dust = await state.api.getDustBalance(); const formattedBalance = formatDustBalance(dust.balance);
    setState((current) => current.api === state.api ? { ...current, balance: formattedBalance } : current);
  }, [state.api]);

  const openAccountAuth = useCallback((mode: 'register' | 'signin') => {
    setAuthMode(mode); setPassword(''); setState((s) => ({ ...s, databaseAuthError: null }));
  }, []);
  const submitAccountAuth = useCallback(async (event: FormEvent) => {
    event.preventDefault(); if (!authMode) return; setAuthBusy(true);
    setState((s) => ({ ...s, databaseAuth: 'working', databaseAuthError: null }));
    try {
      const response = await fetch('/api/auth/account', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: authMode, name, email, password }) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || 'Account authentication failed.');
      setState((s) => ({ ...s, databaseAuth: 'authenticated', databaseAuthError: null, accountUser: result.user }));
      setAuthMode(null); setPassword(''); window.dispatchEvent(new Event('midnight-authenticated'));
    } catch (error) {
      setState((s) => ({ ...s, databaseAuth: 'signed-out', databaseAuthError: error instanceof Error ? error.message : String(error) }));
    } finally { setAuthBusy(false); }
  }, [authMode, name, email, password]);

  const connect = useCallback(async (walletId?: 'lace' | '1am') => {
    if (state.databaseAuth !== 'authenticated') { openAccountAuth('signin'); return; }
    if (!walletId) { setWalletChooserOpen(true); return; }
    setWalletChooserOpen(false); setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const providers = Object.values(window.midnight ?? {});
      const wallet = providers.find((provider) => {
        const identity = `${provider.name} ${provider.rdns}`.toLowerCase();
        return walletId === 'lace' ? identity.includes('lace') : /1\s?am|one.?midnight/.test(identity);
      });
      const walletName = walletId === 'lace' ? 'Lace' : '1AM';
      if (!wallet) throw new Error(`${walletName} wallet was not found. Install and unlock the extension, then retry.`);
      const api = await wallet.connect('preprod'); await api.hintUsage(['getShieldedAddresses', 'getDustBalance']);
      const [addresses, dust] = await Promise.all([api.getShieldedAddresses(), api.getDustBalance()]);
      localStorage.removeItem('midnight_wallet_id');
      setState((s) => ({ ...s, connected: true, address: addresses.shieldedAddress, balance: formatDustBalance(dust.balance), network: 'Midnight Preprod', connecting: false, error: null, api, walletName }));
    } catch (error) {
      setWalletChooserOpen(true);
      setState((s) => ({ ...s, connected: false, address: null, balance: null, api: null, walletName: null, connecting: false, error: error instanceof Error ? error.message : 'Wallet connection failed.' }));
    }
  }, [state.databaseAuth, openAccountAuth]);

  useEffect(() => { localStorage.removeItem('midnight_wallet_id'); }, []);
  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'same-origin' }).then((r) => r.json()).then((result) => {
      if (result.authenticated) setState((s) => ({ ...s, databaseAuth: 'authenticated', accountUser: result.user }));
      else setState((s) => ({ ...s, databaseAuth: 'signed-out', accountUser: null }));
    }).catch(() => setState((s) => ({ ...s, databaseAuth: 'signed-out', accountUser: null })));
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem('midnight_wallet_id');
    setState((s) => ({ ...s, connected: false, address: null, balance: null, connecting: false, error: null, api: null, walletName: null }));
  }, []);

  return <WalletContext.Provider value={{ ...state, connect, openAccountAuth, disconnect, refreshBalance, clearError }}>
    {children}
    {authMode && <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setAuthMode(null); }}>
      <form onSubmit={submitAccountAuth} className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#101115] p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between"><div><h2 className="text-lg font-bold">{authMode === 'register' ? 'Create your account' : 'Sign in'}</h2><p className="mt-1 text-xs text-white/50">{authMode === 'register' ? 'Use your name, email, and password.' : 'Use your email and password.'}</p></div><button type="button" aria-label="Close" onClick={() => setAuthMode(null)} className="rounded-full p-2 text-white/60 hover:bg-white/10"><X className="h-4 w-4" /></button></div>
        {authMode === 'register' && <label className="mb-3 block text-xs text-white/70">Name<input autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" /></label>}
        <label className="mb-3 block text-xs text-white/70">Email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" /></label>
        <label className="mb-4 block text-xs text-white/70">Password<input type="password" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" /><span className="mt-1 block text-[10px] text-white/40">At least 10 characters</span></label>
        {state.databaseAuthError && <p role="alert" className="mb-3 text-sm text-rose-300">{state.databaseAuthError}</p>}
        <button disabled={authBusy} className="w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-black hover:bg-cyan-200 disabled:opacity-50">{authBusy ? 'Please wait…' : authMode === 'register' ? 'Create account' : 'Sign in'}</button>
        <button type="button" onClick={() => openAccountAuth(authMode === 'register' ? 'signin' : 'register')} className="mt-3 w-full text-center text-xs text-cyan-300">{authMode === 'register' ? 'Already have an account? Sign in' : 'Need an account? Register'}</button>
      </form>
    </div>}
    {walletChooserOpen && <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setWalletChooserOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="wallet-picker-title" className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#101115] p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-center justify-between"><div><h2 id="wallet-picker-title" className="text-lg font-bold">Connect a wallet</h2><p className="mt-1 text-xs text-white/50">Choose a Midnight wallet for Preprod.</p></div><button type="button" aria-label="Close" onClick={() => setWalletChooserOpen(false)} className="rounded-full p-2 text-white/60 hover:bg-white/10"><X className="h-4 w-4" /></button></div>
        {(['lace', '1am'] as const).map((id) => <button key={id} type="button" onClick={() => void connect(id)} className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:border-cyan-400/50"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><Wallet className="h-5 w-5" /></span><span><span className="block font-semibold">{id === 'lace' ? 'Lace' : '1AM'}</span><span className="mt-0.5 block text-xs text-white/50">Connect to Midnight Preprod</span></span></button>)}
        {state.error && <p role="alert" className="mt-3 text-sm text-rose-300">{state.error}</p>}
      </section>
    </div>}
  </WalletContext.Provider>;
}
export function useWallet() { const ctx = useContext(WalletContext); if (!ctx) throw new Error('useWallet must be used within WalletProvider'); return ctx; }
