import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, Award, Zap, Lock, ArrowRight, ExternalLink } from 'lucide-react';
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

const timeline = [
  { phase: '01', title: 'Bid Phase', desc: 'Submit a sealed commitment hash of your bid amount + secret nonce.', color: '#7c3aed' },
  { phase: '02', title: 'Reveal Phase', desc: 'Open your commitment by revealing bid + nonce. Contract verifies the hash.', color: '#06b6d4' },
  { phase: '03', title: 'Determination', desc: 'Highest valid revealed bid is selected as the winner on-chain.', color: '#10b981' },
  { phase: '04', title: 'Finalization', desc: 'Auction result is finalized and queryable by anyone.', color: '#f59e0b' },
];

export default function HomePage() {
  const { connected, connect, connecting } = useWallet();
  const { phase, bidCount } = useAuction();

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
                  Enter Auction <ArrowRight size={16} />
                </Link>
              ) : (
                <button onClick={connect} disabled={connecting} style={styles.ctaPrimary as React.CSSProperties}>
                  {connecting ? 'Connecting...' : 'Connect Wallet & Bid'} <ArrowRight size={16} />
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

      {/* Live Auction Banner */}
      <section style={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={styles.auctionBanner}
        >
          <div style={styles.bannerLeft}>
            <div style={styles.phaseBadge(phase)}>
              {phase === 'bidding' ? '🟢 Bidding Open' : phase === 'reveal' ? '🔵 Reveal Phase' : '✅ Finalized'}
            </div>
            <div>
              <div style={styles.bannerTitle}>Current Auction</div>
              <div style={styles.bannerSub}>{bidCount} sealed bids submitted</div>
            </div>
          </div>
          <Link to="/auction" style={styles.bannerCta}>
            View Auction <ArrowRight size={14} />
          </Link>
        </motion.div>
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

      {/* Timeline */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Auction Lifecycle</h2>
            <p style={styles.sectionDesc}>Four smart contract phases enforced entirely on-chain.</p>
          </div>
          <div style={styles.timeline}>
            {timeline.map((t, i) => (
              <motion.div
                key={t.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                style={styles.timelineItem}
              >
                <div style={{ ...styles.timelineNum, background: t.color }}>{t.phase}</div>
                <div>
                  <div style={styles.timelineTitle}>{t.title}</div>
                  <div style={styles.timelineDesc}>{t.desc}</div>
                </div>
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
  hero: { position: 'relative', padding: '80px 0 60px', overflow: 'hidden' },
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
    gap: 16, marginTop: 48,
    borderTop: '1px solid #1a1a4e', paddingTop: 32,
  },
  stat: { textAlign: 'center' as const },
  statVal: { fontSize: 15, fontWeight: 700, color: '#f1f0ff' },
  statLabel: { fontSize: 11, color: '#5a587a', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  auctionBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
    background: '#0d0d2b', border: '1px solid #1a1a4e', borderRadius: 16, padding: '20px 24px', marginTop: 32,
  },
  bannerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  phaseBadge: (phase: string) => ({
    background: phaseBadgeColors[phase] || phaseBadgeColors.bidding,
    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#f1f0ff',
  }),
  bannerTitle: { fontSize: 16, fontWeight: 700, color: '#f1f0ff' },
  bannerSub: { fontSize: 13, color: '#9490c4', marginTop: 2 },
  bannerCta: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
    color: '#8b5cf6', textDecoration: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600,
  },
  section: { padding: '64px 0' },
  sectionHeader: { textAlign: 'center' as const, marginBottom: 48 },
  sectionTitle: { fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#f1f0ff' },
  sectionDesc: { fontSize: 16, color: '#9490c4', marginTop: 10 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 },
  card: {
    background: '#0d0d2b', border: '1px solid #1a1a4e', borderRadius: 16,
    padding: 24, transition: 'border-color 0.2s',
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 12, background: 'rgba(124,58,237,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#f1f0ff', marginBottom: 8 },
  cardDesc: { fontSize: 13, color: '#9490c4', lineHeight: 1.6 },
  timeline: { display: 'flex', flexDirection: 'column' as const, gap: 20, maxWidth: 700, margin: '0 auto' },
  timelineItem: {
    display: 'flex', gap: 20, alignItems: 'flex-start',
    background: '#0d0d2b', border: '1px solid #1a1a4e', borderRadius: 14, padding: 24,
  },
  timelineNum: {
    minWidth: 40, height: 40, borderRadius: 10, fontSize: 12, fontWeight: 700,
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  timelineTitle: { fontSize: 16, fontWeight: 700, color: '#f1f0ff', marginBottom: 4 },
  timelineDesc: { fontSize: 13, color: '#9490c4', lineHeight: 1.6 },
  ctaBox: {
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))',
    border: '1px solid rgba(124,58,237,0.25)', borderRadius: 24, padding: '56px 32px',
  },
};
