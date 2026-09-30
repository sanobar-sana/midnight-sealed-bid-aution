import { Link } from 'react-router-dom';
import { Mail, UserRound, Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function ProfilePage() {
  const { accountUser, databaseAuth, connected, address, walletName, openAccountAuth } = useWallet();
  return (
    <div className="min-h-[70vh] px-5 pb-20 pt-32 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Account</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Your profile</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">View the account details you use to sign in to MidnightBid.</p>

        {databaseAuth === 'checking' ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/60">Loading your account…</div>
        ) : accountUser ? (
          <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#111318]/90 shadow-2xl">
            <div className="flex items-center gap-4 border-b border-white/10 p-6 sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200"><UserRound className="h-7 w-7" /></div>
              <div><h2 className="text-xl font-semibold">{accountUser.name}</h2><p className="mt-1 text-xs text-emerald-300">Account active</p></div>
            </div>
            <dl className="grid gap-px bg-white/10 sm:grid-cols-2">
              <div className="bg-[#111318] p-6 sm:p-8"><dt className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40"><UserRound className="h-4 w-4" />Name</dt><dd className="mt-3 break-words text-base font-medium">{accountUser.name}</dd></div>
              <div className="bg-[#111318] p-6 sm:p-8"><dt className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40"><Mail className="h-4 w-4" />Email</dt><dd className="mt-3 break-all text-base font-medium">{accountUser.email}</dd></div>
            </dl>
            <div className="border-t border-white/10 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40"><Wallet className="h-4 w-4" />Wallet</div>
              {connected ? <><p className="mt-3 text-sm text-white/80">{walletName} · Midnight Preprod</p><p className="mt-2 break-all font-mono text-xs text-white/50">{address}</p></> : <p className="mt-3 text-sm text-white/55">No wallet connected. Account sign in does not require a wallet.</p>}
            </div>
          </section>
        ) : (
          <section className="mt-10 rounded-3xl border border-white/10 bg-[#111318]/90 p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Sign in to view your profile</h2>
            <p className="mt-2 text-sm text-white/55">Your account details will appear here after you sign in.</p>
            <div className="mt-6 flex gap-3"><button onClick={() => openAccountAuth('signin')} className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black">Sign in</button><button onClick={() => openAccountAuth('register')} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white">Register</button></div>
          </section>
        )}
        <Link to="/" className="mt-8 inline-block text-sm text-cyan-300 hover:text-cyan-100">← Back to overview</Link>
      </div>
    </div>
  );
}
