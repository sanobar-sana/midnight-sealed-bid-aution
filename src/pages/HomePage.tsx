import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, Award, Zap, Lock, ArrowRight, ExternalLink, Flame } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuction } from '../context/AuctionContext';

const features = [
  { icon: <Lock size={22} color="#7c3aed" />, title: 'Private Bids', desc: 'Submit cryptographic hash commitments. Bid amounts stay private until the reveal phase.' },
  { icon: <Eye size={22} color="#06b6d4" />, title: 'Transparent Verification', desc: 'On-chain commitment verification using zero-knowledge proofs. No trust required.' },
  { icon: <Shield size={22} color="#10b981" />, title: 'Anti-Collusion', desc: 'Sealed bids prevent front-running and bid manipulation during the auction window.' },
  { icon: <Award size={22} color="#f59e0b" />, title: 'Fair Winner', desc: 'Highest valid revealed bid wins. Smart contract enforces all rules automatically.' },
];

const stats = [
  { label: 'Contract Address', value: '542035fc…27140a', mono: true },
  { label: 'Network', value: 'Midnight Testnet' },
  { label: 'Circuits', value: '7 ZK Circuits' },
  { label: 'Tests Passing', value: '12 / 12' },
];

export default function HomePage() {
  const { connected, connect, connecting } = useWallet();
  const { auctions, selectAuction } = useAuction();

  return (
    <div style={styles.page}>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={styles.heroContent}
          >
            <div style={styles.heroBadge}>
              <Zap size={12} color="#7c3aed" />
              <span>Live on Midnight Testnet Preview</span>
            </div>
            <h1 style={styles.heroTitle}>
              Sealed-Bid Auctions<br />
              <span style={styles.heroGradient}>with Zero-Knowledge Privacy</span>
            </h1>
            <p style={styles.heroDesc}>
              Bid privately using cryptographic commitments. Your bid amount stays hidden until the reveal phase — no front-running, no manipulation, no trust required.
            </p>
            <div style={styles.heroCtas}>
              {connected ? (
                <Link to="/auction" style={styles.ctaPrimary}>
                  Explore Live Auctions <ArrowRight size={16} />
                </Link>
              ) : (
                <button onClick={connect} disabled={connecting} style={styles.ctaPrimary as React.CSSProperties}>
                  {connecting ? 'Connecting...' : 'Connect Lace Wallet'} <ArrowRight size={16} />
                </button>
              )}
              <Link to="/how-it-works" style={styles.ctaSecondary}>
                How it Works
              </Link>
            </div>

            {/* Stats Row */}
            <div style={styles.statsRow}>
              {stats.map(s => (
                <div key={s.label} style={styles.stat}>
                  <div style={s.mono ? { ...styles.statVal, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 } : styles.statVal}>
                    {s.value}
                  </div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Demo Auctions */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              <Flame size={14} /> Active Demo Auctions
            </div>
            <h2 style={styles.sectionTitle}>Participate in Live Auctions</h2>
            <p style={styles.sectionDesc}>Explore auctions in different phases — test bidding, revealing, and winner determination.</p>
          </div>

          <div style={styles.grid3}>
            {auctions.map((auc, i) => (
              <motion.div
                key={auc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                style={styles.auctionCard}
              >
                <div style={styles.auctionCardTop}>
                  <div style={styles.auctionEmoji}>{auc.imageEmoji}</div>
                  <div style={styles.phaseBadge(auc.phase)}>
                    {auc.phase === 'bidding' ? '🟢 Bidding Open' : auc.phase === 'reveal' ? '🔵 Reveal Phase' : '✅ Finalized'}
                  </div>
                </div>
                <div style={styles.auctionCategory}>{auc.category}</div>
                <h3 style={styles.auctionTitle}>{auc.title}</h3>
                <p style={styles.auctionDesc}>{auc.description}</p>
                <div style={styles.auctionMeta}>
                  <div>
                    <div style={styles.metaLabel}>Sealed Bids</div>
                    <div style={styles.metaVal}>{auc.bidCount} submitted</div>
                  </div>
                  <div>
                    <div style={styles.metaLabel}>Status</div>
                    <div style={styles.metaVal}>{auc.userHasBid ? '✓ You Bid' : 'Not Entered'}</div>
                  </div>
                </div>
                <Link
                  to={auc.phase === 'reveal' ? '/reveal' : auc.phase === 'finalized' ? '/results' : '/auction'}
                  onClick={() => selectAuction(auc.id)}
                  style={styles.cardActionBtn}
                >
                  {auc.phase === 'bidding' ? 'Place Sealed Bid' : auc.phase === 'reveal' ? 'Open & Reveal Bid' : 'View Winner Result'} <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Why Sealed-Bid on Midnight?</h2>
            <p style={styles.sectionDesc}>Zero-knowledge proofs make cryptographic guarantees without revealing secrets.</p>
          </div>
          <div style={styles.grid4}>
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                style={styles.card}
              >
                <div style={styles.cardIcon}>{f.icon}</div>
                <h3 style={styles.cardTitle}>{f.title}</h3>
                <p style={styles.cardDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.ctaBox}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#f1f0ff' }}>Ready to Place Your Sealed Bid?</h2>
            <p style={{ color: '#9490c4', marginTop: 8 }}>Connect your Lace wallet and participate in the on-chain auction.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
              {connected ? (
                <Link to="/auction" style={styles.ctaPrimary}>Go to Auction <ArrowRight size={16} /></Link>
              ) : (
                <button onClick={connect} style={styles.ctaPrimary as React.CSSProperties}>Connect Lace Wallet <ArrowRight size={16} /></button>
              )}
              <a
                href="https://github.com/sanobar-sana/midnight-sealed-bid-aution"
                target="_blank"
                rel="noreferrer"
                style={styles.ctaSecondary}
              >
                <ExternalLink size={15} /> View Source
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const phaseBadgeColors: Record<string, string> = {
  bidding: 'rgba(16,185,129,0.15)',
  reveal: 'rgba(6,182,212,0.15)',
  finalized: 'rgba(124,58,237,0.15)',
};

const styles: Record<string, React.CSSProperties | any> = {
  page: { paddingTop: 64 },
  hero: { position: 'relative', padding: '80px 0 40px', overflow: 'hidden' },
  heroBg: {
    position: 'absolute', inset: 0, zIndex: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.25) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 },
  heroContent: { maxWidth: 760, margin: '0 auto', textAlign: 'center' as const },
  heroBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
    color: '#8b5cf6', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, marginBottom: 24,
  },
  heroTitle: { fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 800, lineHeight: 1.1, color: '#f1f0ff', marginBottom: 20 },
  heroGradient: { background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroDesc: { fontSize: 18, color: '#9490c4', lineHeight: 1.7, marginBottom: 36, maxWidth: 600, margin: '0 auto 36px' },
  heroCtas: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 },
  ctaPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    color: '#fff', textDecoration: 'none', border: 'none',
    borderRadius: 12, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
  },
  ctaSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'transparent', color: '#9490c4', textDecoration: 'none',
    border: '1px solid #1a1a4e', borderRadius: 12, padding: '12px 24px', fontSize: 15, fontWeight: 500,
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: 16, marginTop: 32, borderTop: '1px solid #1a1a4e', paddingTop: 28,
  },
  stat: { textAlign: 'center' as const },
  statVal: { fontSize: 15, fontWeight: 700, color: '#f1f0ff' },
  statLabel: { fontSize: 11, color: '#5a587a', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { padding: '48px 0' },
  sectionHeader: { textAlign: 'center' as const, marginBottom: 36 },
  sectionTitle: { fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#f1f0ff' },
  sectionDesc: { fontSize: 15, color: '#9490c4', marginTop: 8 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 },
  auctionCard: {
    background: '#0d0d2b', border: '1px solid #1a1a4e', borderRadius: 18,
    padding: 24, display: 'flex', flexDirection: 'column' as const, gap: 12,
  },
  auctionCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  auctionEmoji: { fontSize: 32 },
  phaseBadge: (phase: string) => ({
    background: phaseBadgeColors[phase] || phaseBadgeColors.bidding,
    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, color: '#f1f0ff',
  }),
  auctionCategory: { fontSize: 11, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 },
  auctionTitle: { fontSize: 17, fontWeight: 700, color: '#f1f0ff' },
  auctionDesc: { fontSize: 13, color: '#9490c4', lineHeight: 1.5, flex: 1 },
  auctionMeta: {
    display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1a1a4e',
    paddingTop: 12, marginTop: 4,
  },
  metaLabel: { fontSize: 11, color: '#5a587a', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaVal: { fontSize: 13, color: '#f1f0ff', fontWeight: 600, marginTop: 2 },
  cardActionBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
    color: '#8b5cf6', textDecoration: 'none', borderRadius: 10, padding: '10px 16px',
    fontSize: 13, fontWeight: 600, marginTop: 8,
  },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 },
  card: { background: '#0d0d2b', border: '1px solid #1a1a4e', borderRadius: 16, padding: 24 },
  cardIcon: {
    width: 48, height: 48, borderRadius: 12, background: 'rgba(124,58,237,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#f1f0ff', marginBottom: 8 },
  cardDesc: { fontSize: 13, color: '#9490c4', lineHeight: 1.6 },
  ctaBox: {
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))',
    border: '1px solid rgba(124,58,237,0.25)', borderRadius: 24, padding: '56px 32px',
  },
};
