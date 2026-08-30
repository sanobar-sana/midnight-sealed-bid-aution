import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuction } from '../context/AuctionContext';

const CONTRACT_ADDRESS = '542035fca8e74138ffe47e04d04b481494d0d1c88017d6bcb40af2b6fa27140a';

export default function ResultsPage() {
  const { phase, hasWinner, winner, winningBid, bids, bidCount } = useAuction();

  const revealedCount = bids.filter(b => b.revealed).length;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={styles.header}>
            <h1 style={styles.title}>Auction Results</h1>
            <p style={styles.subtitle}>On-chain results queryable via the <code style={styles.code}>getAuctionResult()</code> circuit.</p>
          </div>

          {/* Status */}
          <div style={phase === 'finalized' ? styles.bannerFinalized : styles.bannerPending}>
            {phase === 'finalized' ? '✅ Auction Finalized' : phase === 'reveal' ? '🔵 Reveal in Progress' : '🟢 Bidding Open'}
            <span style={{ fontSize: 13, color: '#9490c4' }}>
              {phase !== 'finalized' && ' — Results available after finalization'}
            </span>
          </div>

          <div style={styles.grid}>
            {/* Winner Card */}
            <div style={hasWinner ? styles.winnerCard : styles.card}>
              {phase !== 'finalized' ? (
                <div style={styles.centeredPrompt}>
                  <AlertCircle size={44} color="#f59e0b" />
                  <p style={{ color: '#f59e0b', fontWeight: 600, fontSize: 16 }}>Results Pending</p>
                  <p style={{ color: '#9490c4', fontSize: 13, textAlign: 'center', maxWidth: 280 }}>
                    The auction must be finalized before results are available. Complete the reveal phase and run determineWinner().
                  </p>
                </div>
              ) : hasWinner ? (
                <div style={styles.winnerContent}>
                  <div style={styles.trophyWrap}>
                    <Trophy size={48} color="#f59e0b" />
                  </div>
                  <div style={styles.winnerBadge}>🏆 Winner Determined</div>
                  <div style={styles.winnerAddress}>{winner}</div>
                  <div style={styles.winnerAmount}>{winningBid?.toLocaleString()} DUST</div>
                  <div style={{ color: '#9490c4', fontSize: 13 }}>Highest Valid Revealed Bid</div>
                </div>
              ) : (
                <div style={styles.centeredPrompt}>
                  <Award size={44} color="#5a587a" />
                  <p style={{ color: '#9490c4', fontWeight: 600 }}>No Valid Bids</p>
                  <p style={{ color: '#5a587a', fontSize: 13, textAlign: 'center' }}>No valid bids were revealed during the reveal phase.</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Auction Statistics</div>
                <div style={styles.statsList}>
                  {[
                    { label: 'Total Bids', value: String(bidCount) },
                    { label: 'Revealed Bids', value: String(revealedCount) },
                    { label: 'Phase', value: phase.charAt(0).toUpperCase() + phase.slice(1) },
                    { label: 'Network', value: 'Midnight Testnet Preview' },
                    { label: 'Has Winner', value: hasWinner ? 'Yes' : phase === 'finalized' ? 'No' : 'TBD' },
                  ].map(s => (
                    <div key={s.label} style={styles.statRow}>
                      <span style={styles.statLabel}>{s.label}</span>
                      <span style={styles.statValue}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.cardTitle}>Contract Details</div>
                <div style={styles.statsList}>
                  <div style={styles.statRow}>
                    <span style={styles.statLabel}>Address</span>
                    <code style={{ fontSize: 11, color: '#06b6d4', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>
                      {CONTRACT_ADDRESS.slice(0, 20)}…
                    </code>
                  </div>
                  <div style={styles.statRow}>
                    <span style={styles.statLabel}>Read Circuit</span>
                    <code style={{ fontSize: 11, color: '#8b5cf6', fontFamily: 'JetBrains Mono, monospace' }}>getAuctionResult()</code>
                  </div>
                  <div style={styles.statRow}>
                    <span style={styles.statLabel}>Returns</span>
                    <code style={{ fontSize: 11, color: '#9490c4', fontFamily: 'JetBrains Mono, monospace' }}>AuctionResult</code>
                  </div>
                </div>
                <a
                  href={`https://explorer.midnight.network/contract/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.explorerLink}
                >
                  <ExternalLink size={12} /> View on Midnight Explorer
                </a>
              </div>
            </div>
          </div>

          {/* Revealed Bids Table */}
          {bids.some(b => b.revealed) && (
            <div style={{ ...styles.card, marginTop: 24 }}>
              <div style={styles.cardTitle}>Revealed Bids</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Bidder</th>
                      <th style={styles.th}>Amount (DUST)</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.filter(b => b.revealed).map((b, i) => (
                      <tr key={i} style={b.bidder === winner ? styles.trWinner : styles.tr}>
                        <td style={styles.td}>
                          <code style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#9490c4' }}>{b.bidder}</code>
                        </td>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#f1f0ff' }}>{b.revealedAmount?.toLocaleString()}</td>
                        <td style={styles.td}>
                          {b.bidder === winner
                            ? <span style={styles.badgeGold}>🏆 Winner</span>
                            : <span style={styles.badgeGray}>Valid</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { paddingTop: 80, minHeight: '100vh' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' },
  header: { marginBottom: 24 },
  title: { fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#f1f0ff' },
  subtitle: { fontSize: 15, color: '#9490c4', marginTop: 8 },
  code: { fontFamily: 'JetBrains Mono, monospace', color: '#8b5cf6', fontSize: 13 },
  bannerFinalized: {
    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 12, padding: '14px 20px', marginBottom: 28,
    color: '#10b981', fontWeight: 600, fontSize: 14,
    display: 'flex', alignItems: 'center', gap: 12,
  },
  bannerPending: {
    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
    borderRadius: 12, padding: '14px 20px', marginBottom: 28,
    color: '#f59e0b', fontWeight: 600, fontSize: 14,
    display: 'flex', alignItems: 'center', gap: 12,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 },
  card: { background: '#0d0d2b', border: '1px solid #1a1a4e', borderRadius: 18, padding: 28 },
  winnerCard: {
    background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(124,58,237,0.08))',
    border: '1px solid rgba(245,158,11,0.3)', borderRadius: 18, padding: 28,
  },
  centeredPrompt: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0', textAlign: 'center' },
  winnerContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', padding: '16px 0' },
  trophyWrap: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'rgba(245,158,11,0.15)', border: '2px solid rgba(245,158,11,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  winnerBadge: {
    background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
    color: '#f59e0b', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 700,
  },
  winnerAddress: { fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9490c4', wordBreak: 'break-all' },
  winnerAmount: { fontSize: 36, fontWeight: 800, color: '#f1f0ff' },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#f1f0ff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  statsList: { display: 'flex', flexDirection: 'column', gap: 12 },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0d0d2b', paddingBottom: 10 },
  statLabel: { fontSize: 13, color: '#9490c4' },
  statValue: { fontSize: 13, fontWeight: 600, color: '#f1f0ff' },
  explorerLink: {
    display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16,
    color: '#06b6d4', textDecoration: 'none', fontSize: 12,
  },
  table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: 16 },
  th: { textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: '#5a587a', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px', borderBottom: '1px solid #1a1a4e' },
  td: { padding: '12px', fontSize: 13, color: '#f1f0ff', borderBottom: '1px solid #0d0d2b' },
  tr: {},
  trWinner: { background: 'rgba(245,158,11,0.05)' },
  badgeGold: {
    background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
    color: '#f59e0b', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 600,
  },
  badgeGray: {
    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
    color: '#10b981', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 600,
  },
};
