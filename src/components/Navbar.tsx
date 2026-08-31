import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Wallet, ChevronDown, Activity, ExternalLink } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const navLinks = [
  { to: '/', label: 'Overview' },
  { to: '/auction', label: 'Auctions' },
  { to: '/reveal', label: 'Reveal Bids' },
  { to: '/results', label: 'Results' },
  { to: '/how-it-works', label: 'ZK Architecture' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletDrop, setWalletDrop] = useState(false);
  const { connected, address, balance, connect, disconnect, connecting, isSimulated } = useWallet();
  const location = useLocation();

  const short = (addr: string) => addr.slice(0, 6) + '...' + addr.slice(-4);

  return (
    <>
      {/* Liquid-Glass Floating Pill Navbar */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-max max-w-[95vw] sm:max-w-max">
        <nav className="liquid-glass rounded-full p-1.5 sm:p-2 flex items-center gap-2 sm:gap-3 shadow-2xl">
          
          {/* Brand Mark */}
          <Link
            to="/"
            className="flex items-center gap-2 pl-3 pr-2 py-1 rounded-full hover:bg-white/5 transition group"
            onClick={() => setMenuOpen(false)}
          >
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white leading-none">
                Midnight<span className="text-cyan-400">Bid</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-semibold leading-tight">
                Sealed-Bid
              </span>
            </div>
          </Link>

          {/* Hairline Divider */}
          <div className="h-4 w-px bg-white/15 hidden md:block" />

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Hairline Divider */}
          <div className="h-4 w-px bg-white/15" />

          {/* Wallet CTA & Mobile Menu Button */}
          <div className="flex items-center gap-2 pr-1">
            {connected ? (
              <div className="relative">
                <button
                  onClick={() => setWalletDrop((v) => !v)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-white/10 transition cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs">{short(address!)}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                </button>

                {/* Wallet Dropdown */}
                {walletDrop && (
                  <div className="absolute right-0 top-full mt-3 w-72 rounded-2xl bg-[#121212]/95 backdrop-blur-2xl p-4 text-white border border-white/15 shadow-2xl z-50 flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">
                          {isSimulated ? 'Lace Wallet (Demo)' : 'Lace Wallet'}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40">Midnight Testnet</span>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Balance</div>
                      <div className="text-lg font-bold text-white mt-0.5">{balance}</div>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Account Address</div>
                      <div className="text-xs font-mono text-white/80 break-all bg-black/60 p-2.5 rounded-xl border border-white/10 mt-1">
                        {address}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <a
                        href={`https://explorer.midnight.network/address/${address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/15 text-cyan-300 rounded-xl text-xs font-semibold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Explorer
                      </a>
                      <button
                        onClick={() => {
                          disconnect();
                          setWalletDrop(false);
                        }}
                        className="flex-1 py-2 px-3 bg-rose-950/50 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs transition hover:bg-white/90 active:scale-[0.98] cursor-pointer disabled:opacity-50 shadow-md"
              >
                <Wallet className="w-3.5 h-3.5 text-black" />
                <span>{connecting ? 'Connecting...' : 'Connect Lace'}</span>
              </button>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-1.5 rounded-full bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 top-18 z-40 bg-[#0c0c0c]/95 backdrop-blur-2xl md:hidden p-6 flex flex-col gap-4 border-b border-white/10">
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest px-2">Navigation</div>
          <div className="flex flex-col gap-2">
            {navLinks.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={`p-3.5 rounded-2xl text-sm font-semibold flex items-center justify-between transition ${
                    active ? 'bg-white text-black' : 'liquid-glass text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span>{l.label}</span>
                  {active && <span className="w-2 h-2 rounded-full bg-black" />}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              <span>Midnight Testnet</span>
            </div>
            <span>Compact 0.5.2</span>
          </div>
        </div>
      )}
    </>
  );
}
