import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.col}>
          <div style={styles.brand}>MidnightBid</div>
          <p style={styles.tagline}>Privacy-preserving sealed-bid auctions on Midnight blockchain.</p>
          <div style={styles.socials}>
            <a href="https://github.com/sanobar-sana/midnight-sealed-bid-aution" target="_blank" rel="noreferrer" style={styles.icon}><Globe size={18} /></a>
            <a href="https://midnight.network" target="_blank" rel="noreferrer" style={styles.icon}><ExternalLink size={18} /></a>
          </div>
        </div>

        <div style={styles.col}>
          <div style={styles.colTitle}>Contract</div>
          <div style={styles.info}>
            <span style={styles.label}>Network</span>
            <span style={styles.value}>Midnight Testnet Preview</span>
          </div>
          <div style={styles.info}>
            <span style={styles.label}>Address</span>
            <code style={styles.addr}>542035fc...27140a</code>
          </div>
          <div style={styles.info}>
            <span style={styles.label}>Compiler</span>
            <span style={styles.value}>Compact 0.5.2</span>
          </div>
        </div>

        <div style={styles.col}>
          <div style={styles.colTitle}>Links</div>
          <a href="https://midnight.network/developers" target="_blank" rel="noreferrer" style={styles.footLink}>Midnight Docs</a>
          <a href="https://docs.midnight.network" target="_blank" rel="noreferrer" style={styles.footLink}>Compact Lang</a>
          <a href="https://github.com/sanobar-sana/midnight-sealed-bid-aution" target="_blank" rel="noreferrer" style={styles.footLink}>GitHub Repo</a>
        </div>
      </div>

      <div style={styles.bottom}>
        <span>© 2026 MidnightBid · Built on Midnight Blockchain · Zero-Knowledge Privacy</span>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    marginTop: 80, borderTop: '1px solid #1a1a4e',
    background: '#0a0a1e',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem',
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40,
  },
  col: { display: 'flex', flexDirection: 'column', gap: 10 },
  brand: { fontSize: 20, fontWeight: 700, color: '#f1f0ff' },
  tagline: { fontSize: 13, color: '#9490c4', lineHeight: 1.6 },
  socials: { display: 'flex', gap: 12, marginTop: 4 },
  icon: { color: '#9490c4', textDecoration: 'none', transition: 'color 0.2s' },
  colTitle: { fontSize: 13, fontWeight: 700, color: '#f1f0ff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  info: { display: 'flex', flexDirection: 'column', gap: 2 },
  label: { fontSize: 11, color: '#5a587a', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 13, color: '#9490c4' },
  addr: { fontSize: 12, color: '#06b6d4', fontFamily: 'JetBrains Mono, monospace' },
  footLink: { fontSize: 13, color: '#9490c4', textDecoration: 'none', padding: '2px 0' },
  bottom: {
    borderTop: '1px solid #0d0d2b',
    padding: '1.5rem',
    textAlign: 'center',
    fontSize: 12, color: '#5a587a',
  },
};
