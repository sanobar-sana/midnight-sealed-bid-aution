import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  ChevronDown,
  ExternalLink,
  Menu,
  X,
  Wallet,
  Lock,
  Eye,
  Trophy,
  BookOpen,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const navLinks = [
  { to: '/', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
  { to: '/auction', label: 'Auctions', icon: <Lock className="w-4 h-4" /> },
  { to: '/reveal', label: 'Reveal', icon: <Eye className="w-4 h-4" /> },
  { to: '/results', label: 'Results', icon: <Trophy className="w-4 h-4" /> },
  { to: '/how-it-works', label: 'ZK Tech', icon: <BookOpen className="w-4 h-4" /> },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletDrop, setWalletDrop] = useState(false);
  const { connected, address, balance, connect, disconnect, connecting, isSimulated } = useWallet();
  const location = useLocation();
  const dropRef = useRef<HTMLDivElement>(null);

  const short = (addr: string) => addr.slice(0, 6) + '...' + addr.slice(-4);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setWalletDrop(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    disconnect();
    setWalletDrop(false);
  };

  return (
    <>
      {/* Floating Pill Navbar without overflow clipping */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] w-max max-w-[95vw] sm:max-w-max">
        <nav className="rounded-full px-3 py-2 flex items-center gap-2 sm:gap-3 bg-[#121214]/90 backdrop-blur-2xl border border-white/20 shadow-2xl relative">
          
          {/* Brand Mark */}
          <Link
            to="/"
            className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-full hover:bg-white/5 transition group"
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
          <div className="h-4 w-px bg-white/15" />

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
              <div className="relative" ref={dropRef}>
                <button
                  type="button"
                  onClick={() => setWalletDrop((v) => !v)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-medium hover:bg-emerald-900/50 transition cursor-pointer active:scale-[0.98]"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs">{short(address!)}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-emerald-400 transition-transform ${walletDrop ? 'rotate-180' : ''}`} />
                </button>

                {/* Wallet Dropdown with High Z-Index */}
                {walletDrop && (
                  <div className="absolute right-0 top-full mt-3 w-72 rounded-2xl bg-[#0e1014] p-4 text-white border border-white/20 shadow-2xl z-[9999] flex flex-col gap-3">
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
                      <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Shielded Address</div>
                      <div className="text-xs font-mono text-white/80 break-all bg-black/80 p-2.5 rounded-xl border border-white/10 mt-1">
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
                        type="button"
                        onClick={handleDisconnect}
                        className="flex-1 py-2 px-3 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 rounded-xl text-xs font-bold transition cursor-pointer active:scale-[0.98]"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={connect}
                disabled={connecting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <Wallet className="w-3.5 h-3.5 text-black" />
                <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </nav>
      </header>

      {/* Mobile Drawer Navigation */}
      {menuOpen && (
        <div className="fixed inset-0 z-[998] bg-black/80 backdrop-blur-xl md:hidden pt-24 px-6 flex flex-col gap-3">
          <div className="text-xs uppercase tracking-widest font-bold text-white/40 mb-2">Navigation</div>
          {navLinks.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl text-sm font-semibold transition ${
                  active ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                {l.icon}
                <span>{l.label}</span>
              </Link>
            );
          })}

          <div className="mt-auto pb-10 flex flex-col gap-3 text-center border-t border-white/10 pt-6">
            <div className="text-xs text-white/40">Midnight Testnet Preview · Compact ZK v0.5.2</div>
          </div>
        </div>
      )}
    </>
  );
}
