import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Wallet, ChevronDown, Activity, Check, ExternalLink } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const navLinks = [
  { to: '/', label: 'Overview' },
  { to: '/auction', label: 'Auctions' },
  { to: '/reveal', label: 'Reveal Bids' },
  { to: '/results', label: 'Results & Ledger' },
  { to: '/how-it-works', label: 'ZK Architecture' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletDrop, setWalletDrop] = useState(false);
  const { connected, address, balance, connect, disconnect, connecting } = useWallet();
  const location = useLocation();

  const short = (addr: string) => addr.slice(0, 6) + '...' + addr.slice(-4);

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Brand */}
        <Link to="/" style={styles.logo} onClick={() => setMenuOpen(false)}>
          <div style={styles.logoIcon}>
            <Shield size={19} color="#fff" />
          </div>
          <div>
            <div style={styles.logoText}>Midnight<span style={{ color: '#818cf8' }}>Bid</span></div>
            <div style={styles.logoSub}>Sealed-Bid Protocol</div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={styles.desktopLinks}>
          {navLinks.map(l => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  ...styles.link,
                  ...(active ? styles.linkActive : {}),
                }}
              >
                {l.label}
                {active && <div style={styles.activeDot} />}
              </Link>
            );
          })}
        </div>

        {/* Network & Wallet Controls */}
        <div style={styles.walletWrap}>
          {/* Network Pill */}
          <div style={styles.networkPill}>
            <Activity size={12} color="#10b981" />
            <span>Testnet Preview</span>
          </div>

          {connected ? (
            <div style={{ position: 'relative' }}>
              <button
                style={styles.walletConnected}
                onClick={() => setWalletDrop(v => !v)}
              >
                <div style={styles.connectedDot} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{short(address!)}</span>
                <ChevronDown size={14} color="#94a3b8" />
              </button>

              {walletDrop && (
                <div style={styles.dropdown}>
                  <div style={styles.dropHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={styles.connectedDot} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>Connected via Lace</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Midnight Network</span>
                  </div>
                  
                  <div style={styles.dropSection}>
                    <div style={styles.dropLabel}>Balance</div>
                    <div style={styles.dropBalance}>{balance}</div>
                  </div>

                  <div style={styles.dropSection}>
                    <div style={styles.dropLabel}>Account Address</div>
                    <div style={styles.dropAddress}>{address}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <a
                      href={`https://explorer.midnight.network/address/${address}`}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.dropExplorerBtn}
                    >
                      <ExternalLink size={12} /> Explorer
                    </a>
                    <button style={styles.dropDisconnect} onClick={() => { disconnect(); setWalletDrop(false); }}>
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button style={styles.walletBtn} onClick={connect} disabled={connecting}>
              <Wallet size={15} />
              {connecting ? 'Connecting...' : 'Connect Lace'}
            </button>
          )}

          {/* Hamburger Menu Trigger */}
          <button style={styles.hamburger} onClick={() => setMenuOpen(v => !v)} aria-label="Toggle Navigation">
            {menuOpen ? <X size={22} color="#f8fafc" /> : <Menu size={22} color="#f8fafc" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {navLinks.map(l => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{
                    ...styles.mobileLink,
                    ...(active ? styles.mobileLinkActive : {}),
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{l.label}</span>
                  {active && <Check size={16} color="#818cf8" />}
                </Link>
              );
            })}
          </div>

          <div style={styles.mobileDivider} />

          {connected ? (
            <div style={styles.mobileWalletInfo}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Connected Wallet</span>
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>● Active</span>
              </div>
              <div style={styles.mobileBalance}>{balance}</div>
              <div style={styles.mobileAddress}>{address}</div>
              <button style={styles.mobileDisconnect} onClick={() => { disconnect(); setMenuOpen(false); }}>
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button style={styles.mobileConnectBtn} onClick={() => { connect(); setMenuOpen(false); }} disabled={connecting}>
              <Wallet size={16} />
              {connecting ? 'Connecting to Lace...' : 'Connect Lace Wallet'}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(4, 4, 12, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(38, 43, 94, 0.6)',
  },
  inner: {
    maxWidth: 1240, margin: '0 auto', padding: '0 1.5rem',
    height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
  },
  logoIcon: {
    width: 38, height: 38, borderRadius: 10,
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
  },
  logoText: { fontSize: 18, fontWeight: 800, color: '#f8fafc', letterSpacing: -0.5 },
  logoSub: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 },
  desktopLinks: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(13, 15, 38, 0.6)', border: '1px solid rgba(38, 43, 94, 0.5)',
    padding: '4px 8px', borderRadius: 14,
  },
  link: {
    position: 'relative', color: '#94a3b8', textDecoration: 'none',
    fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 10,
    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
  },
  linkActive: {
    color: '#f8fafc', background: 'rgba(99, 102, 241, 0.2)',
  },
  activeDot: {
    width: 4, height: 4, borderRadius: '50%', background: '#818cf8',
  },
  walletWrap: { display: 'flex', alignItems: 'center', gap: 12 },
  networkPill: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)',
    color: '#34d399', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
  },
  walletBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: '#fff', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 12,
    padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)', transition: 'all 0.2s',
  },
  walletConnected: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399', borderRadius: 12, padding: '8px 14px',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  connectedDot: { width: 8, height: 8, borderRadius: '50%', background: '#10b981' },
  dropdown: {
    position: 'absolute', right: 0, top: '120%', width: 280,
    background: '#0c0e24', border: '1px solid rgba(79, 70, 229, 0.3)', borderRadius: 16,
    padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
    boxShadow: '0 24px 64px rgba(0,0,0,0.7)', zIndex: 1000,
  },
  dropHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid rgba(38, 43, 94, 0.6)', paddingBottom: 10,
  },
  dropSection: { display: 'flex', flexDirection: 'column', gap: 3 },
  dropLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 },
  dropBalance: { fontSize: 18, fontWeight: 800, color: '#f8fafc' },
  dropAddress: { fontSize: 11, color: '#94a3b8', wordBreak: 'break-all', fontFamily: 'JetBrains Mono, monospace' },
  dropExplorerBtn: {
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)',
    color: '#22d3ee', borderRadius: 10, padding: '8px', fontSize: 12, fontWeight: 600, textDecoration: 'none',
  },
  dropDisconnect: {
    flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#f87171', borderRadius: 10, padding: '8px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  hamburger: {
    display: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(38,43,94,0.6)',
    borderRadius: 10, color: '#f8fafc', cursor: 'pointer', padding: 8,
  },
  mobileMenu: {
    background: '#080918', borderTop: '1px solid rgba(38, 43, 94, 0.6)',
    padding: '1.25rem 1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: 8,
  },
  mobileLink: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    color: '#94a3b8', textDecoration: 'none', fontSize: 15, fontWeight: 600,
    padding: '12px 14px', borderRadius: 12, background: 'rgba(13, 15, 38, 0.4)',
  },
  mobileLinkActive: { color: '#f8fafc', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)' },
  mobileDivider: { height: 1, background: 'rgba(38, 43, 94, 0.6)', margin: '8px 0' },
  mobileWalletInfo: { display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'rgba(13, 15, 38, 0.6)', borderRadius: 14 },
  mobileBalance: { fontSize: 20, fontWeight: 800, color: '#f8fafc' },
  mobileAddress: { fontSize: 11, color: '#94a3b8', wordBreak: 'break-all', fontFamily: 'JetBrains Mono, monospace' },
  mobileDisconnect: {
    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#f87171', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4,
  },
  mobileConnectBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
    border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
};
