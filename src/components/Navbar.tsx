import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Gavel, Wallet, ChevronDown } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/auction', label: 'Auction' },
  { to: '/reveal', label: 'Reveal' },
  { to: '/results', label: 'Results' },
  { to: '/how-it-works', label: 'How it Works' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletDrop, setWalletDrop] = useState(false);
  const { connected, address, balance, network, connect, disconnect, connecting } = useWallet();
  const location = useLocation();

  const short = (addr: string) => addr.slice(0, 6) + '...' + addr.slice(-4);

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo} onClick={() => setMenuOpen(false)}>
          <div style={styles.logoIcon}><Gavel size={18} color="#fff" /></div>
          <span style={styles.logoText}>MidnightBid</span>
          <span style={styles.logoBadge}>Testnet</span>
        </Link>

        {/* Desktop Links */}
        <div style={styles.desktopLinks}>
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                ...styles.link,
                ...(location.pathname === l.to ? styles.linkActive : {}),
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Wallet Button */}
        <div style={styles.walletWrap}>
          {connected ? (
            <div style={{ position: 'relative' }}>
              <button
                style={styles.walletConnected}
                onClick={() => setWalletDrop(v => !v)}
              >
                <div style={styles.dot} />
                <span>{short(address!)}</span>
                <ChevronDown size={14} />
              </button>
              {walletDrop && (
                <div style={styles.dropdown}>
                  <div style={styles.dropNetwork}>{network}</div>
                  <div style={styles.dropBalance}>{balance}</div>
                  <div style={styles.dropAddress}>{address}</div>
                  <button style={styles.dropDisconnect} onClick={() => { disconnect(); setWalletDrop(false); }}>
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button style={styles.walletBtn} onClick={connect} disabled={connecting}>
              <Wallet size={15} />
              {connecting ? 'Connecting...' : 'Connect Lace'}
            </button>
          )}

          {/* Hamburger */}
          <button style={styles.hamburger} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                ...styles.mobileLink,
                ...(location.pathname === l.to ? styles.mobileLinkActive : {}),
              }}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div style={styles.mobileDivider} />
          {connected ? (
            <div style={styles.mobileWalletInfo}>
              <div style={styles.mobileWalletRow}>
                <div style={styles.dot} />
                <span style={{ color: '#10b981', fontSize: 13 }}>Connected</span>
              </div>
              <div style={{ fontSize: 12, color: '#9490c4', wordBreak: 'break-all' }}>{address}</div>
              <div style={{ fontSize: 13, color: '#f1f0ff', marginTop: 4 }}>{balance}</div>
              <button style={styles.mobileDisconnect} onClick={() => { disconnect(); setMenuOpen(false); }}>
                Disconnect
              </button>
            </div>
          ) : (
            <button style={styles.mobileConnectBtn} onClick={() => { connect(); setMenuOpen(false); }} disabled={connecting}>
              <Wallet size={15} />
              {connecting ? 'Connecting...' : 'Connect Lace Wallet'}
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
    background: 'rgba(5,5,16,0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid #1a1a4e',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
    height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0,
  },
  logoIcon: {
    width: 34, height: 34, borderRadius: 8,
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: 700, color: '#f1f0ff' },
  logoBadge: {
    fontSize: 10, fontWeight: 600, color: '#06b6d4',
    background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
    padding: '2px 6px', borderRadius: 4,
  },
  desktopLinks: {
    display: 'flex', gap: 4,
  },
  link: {
    color: '#9490c4', textDecoration: 'none', fontSize: 14, fontWeight: 500,
    padding: '6px 12px', borderRadius: 8, transition: 'all 0.2s',
  },
  linkActive: { color: '#f1f0ff', background: 'rgba(124,58,237,0.15)' },
  walletWrap: { display: 'flex', alignItems: 'center', gap: 12 },
  walletBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  walletConnected: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
    color: '#10b981', borderRadius: 10, padding: '8px 14px',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#10b981' },
  dropdown: {
    position: 'absolute', right: 0, top: '110%', minWidth: 260,
    background: '#0d0d2b', border: '1px solid #1a1a4e', borderRadius: 12,
    padding: 16, display: 'flex', flexDirection: 'column', gap: 8,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  dropNetwork: { fontSize: 11, color: '#06b6d4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
  dropBalance: { fontSize: 20, fontWeight: 700, color: '#f1f0ff' },
  dropAddress: { fontSize: 11, color: '#9490c4', wordBreak: 'break-all', fontFamily: 'JetBrains Mono, monospace' },
  dropDisconnect: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444', borderRadius: 8, padding: '8px 12px', fontSize: 13,
    fontWeight: 600, cursor: 'pointer', marginTop: 4,
  },
  hamburger: {
    display: 'none', background: 'none', border: 'none', color: '#9490c4', cursor: 'pointer',
    padding: 4,
    // shown via media query in App.css
  },
  mobileMenu: {
    background: '#0a0a1e', borderTop: '1px solid #1a1a4e',
    padding: '1rem 1.5rem 1.5rem',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  mobileLink: {
    color: '#9490c4', textDecoration: 'none', fontSize: 16, fontWeight: 500,
    padding: '12px 0', borderBottom: '1px solid #0d0d2b',
  },
  mobileLinkActive: { color: '#f1f0ff' },
  mobileDivider: { height: 1, background: '#1a1a4e', margin: '8px 0' },
  mobileWalletInfo: { display: 'flex', flexDirection: 'column', gap: 6 },
  mobileWalletRow: { display: 'flex', alignItems: 'center', gap: 8 },
  mobileDisconnect: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444', borderRadius: 8, padding: '10px', fontSize: 14,
    fontWeight: 600, cursor: 'pointer', marginTop: 8,
  },
  mobileConnectBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8,
  },
};
