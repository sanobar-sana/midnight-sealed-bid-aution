import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Award,
  AlertCircle,
  Shield,
  Copy,
  Check,
  Sparkles,
  Database,
  Search,
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext';

export default function ResultsPage() {
  const { auctions, selectedAuctionId, selectedAuction, selectAuction } = useAuction();
  const [copiedWinner, setCopiedWinner] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const revealedCount = selectedAuction.bids.filter(b => b.revealed).length;
  const filteredBids = selectedAuction.bids.filter(b =>
    b.bidder.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.commitment.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleCopyWinner = () => {
    if (selectedAuction.winner) {
      navigator.clipboard.writeText(selectedAuction.winner);
      setCopiedWinner(true);
      setTimeout(() => setCopiedWinner(false), 2000);
    }
  };

  return (
    <div style={styles.page}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* Auction Selector Strip */}
          <div style={styles.selectorWrapper}>
            <div style={styles.selectorLabel}>
              <Sparkles size={14} color="#818cf8" />
              <span>Select Auction:</span>
            </div>
            <div style={styles.auctionPills}>
              {auctions.map(a => {
                const isSelected = a.id === selectedAuctionId;
                return (
                  <button
                    key={a.id}
                    onClick={() => selectAuction(a.id)}
                    style={{
                      ...styles.pillBtn,
                      ...(isSelected ? styles.pillBtnActive : {}),
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{a.imageEmoji}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={styles.pillTitle}>{a.title}</div>
                      <div style={styles.pillSub}>
                        {a.phase === 'finalized' ? '🏆 Finalized' : a.phase === 'reveal' ? '🔵 Reveal' : '🟢 Bidding'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Winner Celebration Card (if finalized) */}
          {selectedAuction.phase === 'finalized' && selectedAuction.hasWinner ? (
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={styles.winnerHeroCard}
            >
              <div style={styles.winnerBadgePill}>
                <Trophy size={14} color="#f59e0b" />
                <span>Verified On-Chain Winner</span>
              </div>

              <div style={styles.winnerAssetHeader}>
                <span style={{ fontSize: 40 }}>{selectedAuction.imageEmoji}</span>
                <div>
                  <h1 style={styles.winnerAssetTitle}>{selectedAuction.title}</h1>
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>Finalized Auction Result</div>
                </div>
              </div>

              <div style={styles.winnerAmountDisplay}>
                <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Winning Sealed Bid</div>
                <div style={styles.winnerBigNumber}>
                  {selectedAuction.winningBid?.toLocaleString()} <span style={{ fontSize: 24, color: '#f59e0b' }}>DUST</span>
                </div>
              </div>

              <div style={styles.winnerAddrBar}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Winning Bidder:</span>
                <code style={styles.winnerAddrText}>{selectedAuction.winner}</code>
                <button onClick={handleCopyWinner} style={styles.copyBtn} title="Copy winning address">
                  {copiedWinner ? <Check size={14} color="#10b981" /> : <Copy size={14} color="#94a3b8" />}
                </button>
              </div>

              <div style={styles.winnerCircuitFoot}>
                <Shield size={14} color="#34d399" />
                <span>Determined deterministically via <code>getAuctionResult()</code> circuit on Midnight testnet</span>
              </div>
            </motion.div>
          ) : selectedAuction.phase !== 'finalized' ? (
            <div style={styles.pendingHeroCard}>
              <div style={styles.pendingIconWrap}><AlertCircle size={36} color="#f59e0b" /></div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc' }}>Results Pending Finalization</h2>
              <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 460, margin: '8px auto 20px' }}>
                This auction is currently in the <strong>{selectedAuction.phase}</strong> phase. Bids are still sealed or being revealed. The official winning outcome will unlock once finalized.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <a href="/reveal" style={styles.pendingActionBtn}>
                  Go to Reveal Phase
                </a>
              </div>
            </div>
          ) : (
            <div style={styles.pendingHeroCard}>
              <Award size={40} color="#64748b" />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', marginTop: 12 }}>No Valid Bids Revealed</h2>
              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>The auction closed without any valid opened commitments.</p>
            </div>
          )}

          {/* Stats Breakdown Grid */}
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statBoxLabel}>Total Commitments</div>
              <div style={styles.statBoxVal}>{selectedAuction.bidCount} Bids</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statBoxLabel}>Revealed Rate</div>
              <div style={{ ...styles.statBoxVal, color: '#22d3ee' }}>
                {Math.round((revealedCount / (selectedAuction.bidCount || 1)) * 100)}%
              </div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statBoxLabel}>Top Revealed Bid</div>
              <div style={{ ...styles.statBoxVal, color: '#f59e0b' }}>
                {selectedAuction.winningBid ? `${selectedAuction.winningBid.toLocaleString()} DUST` : 'Pending'}
              </div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statBoxLabel}>Circuit Verification</div>
              <div style={{ ...styles.statBoxVal, color: '#34d399' }}>100% On-Chain</div>
            </div>
          </div>

          {/* Full On-Chain Ledger & Proof Table */}
          <div style={styles.ledgerCard}>
            <div style={styles.ledgerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={18} color="#818cf8" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
                  On-Chain Auction Ledger & Proof Records
                </h3>
              </div>
              
              {/* Search Bar */}
              <div style={styles.searchWrap}>
                <Search size={14} color="#64748b" />
                <input
                  type="text"
                  placeholder="Filter by bidder or hash..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Rank</th>
                    <th style={styles.th}>Bidder Public Key</th>
                    <th style={styles.th}>Commitment Hash</th>
                    <th style={styles.th}>Revealed Amount</th>
                    <th style={styles.th}>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBids.map((b, i) => {
                    const isWinner = b.bidder === selectedAuction.winner;
                    return (
                      <tr key={i} style={isWinner ? styles.trWinner : styles.tr}>
                        <td style={styles.td}>
                          {isWinner ? (
                            <span style={styles.crownRank}>👑 1</span>
                          ) : b.revealed ? (
                            <span style={styles.normalRank}>#{i + 1}</span>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600, color: '#f8fafc' }}>{b.bidder}</span>
                            {isWinner && <span style={styles.winnerBadgeMini}>Winner</span>}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <code style={styles.monoHash}>{b.commitment.slice(0, 18)}...{b.commitment.slice(-8)}</code>
                        </td>
                        <td style={styles.td}>
                          {b.revealed && b.revealedAmount !== undefined ? (
                            <span style={{ fontWeight: 700, color: isWinner ? '#f59e0b' : '#f8fafc', fontSize: 14 }}>
                              {b.revealedAmount.toLocaleString()} DUST
                            </span>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: 12 }}>🔒 Sealed / Hidden</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {isWinner ? (
                            <span style={styles.pillWinner}>🏆 Declared Winner</span>
                          ) : b.revealed ? (
                            <span style={styles.pillValid}>✓ Valid Bid</span>
                          ) : (
                            <span style={styles.pillSealed}>🔒 Sealed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties | any> = {
  page: { paddingTop: 90, paddingBottom: 60, minHeight: '100vh' },
  selectorWrapper: {
    background: 'rgba(13, 15, 38, 0.6)', border: '1px solid rgba(38, 43, 94, 0.6)',
    borderRadius: 16, padding: '14px 20px', marginBottom: 24,
    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
  },
  selectorLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#f8fafc' },
  auctionPills: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  pillBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(38, 43, 94, 0.5)',
    borderRadius: 12, padding: '8px 16px', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s',
  },
  pillBtnActive: {
    background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.4)',
    color: '#f8fafc', boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
  },
  pillTitle: { fontSize: 13, fontWeight: 700, color: '#f8fafc' },
  pillSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  winnerHeroCard: {
    background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(245, 158, 11, 0.2) 0%, rgba(13, 15, 38, 0.9) 70%)',
    border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: 24, padding: '36px 32px',
    textAlign: 'center' as const, boxShadow: '0 16px 48px rgba(245, 158, 11, 0.15)',
    position: 'relative' as const, overflow: 'hidden' as const, marginBottom: 28,
  },
  winnerBadgePill: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)',
    color: '#f59e0b', borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 700, marginBottom: 16,
  },
  winnerAssetHeader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 20 },
  winnerAssetTitle: { fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#f8fafc' },
  winnerAmountDisplay: { margin: '20px 0' },
  winnerBigNumber: { fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, color: '#f8fafc', letterSpacing: -1 },
  winnerAddrBar: {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    background: 'rgba(4, 4, 12, 0.6)', border: '1px solid rgba(38, 43, 94, 0.7)',
    borderRadius: 14, padding: '10px 20px', margin: '0 auto', maxWidth: '100%',
  },
  winnerAddrText: { fontSize: 13, color: '#22d3ee', fontFamily: 'JetBrains Mono, monospace' },
  copyBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  winnerCircuitFoot: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 24, fontSize: 12, color: '#94a3b8',
  },
  pendingHeroCard: {
    background: 'rgba(13, 15, 38, 0.75)', border: '1px solid rgba(38, 43, 94, 0.7)',
    borderRadius: 24, padding: '48px 32px', textAlign: 'center' as const, marginBottom: 28,
  },
  pendingIconWrap: {
    width: 64, height: 64, borderRadius: 20, background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 16px',
  },
  pendingActionBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
    borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16, marginBottom: 28,
  },
  statBox: {
    background: 'rgba(13, 15, 38, 0.6)', border: '1px solid rgba(38, 43, 94, 0.6)',
    borderRadius: 16, padding: '18px 20px',
  },
  statBoxLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 },
  statBoxVal: { fontSize: 20, fontWeight: 800, color: '#f8fafc', marginTop: 4 },
  ledgerCard: {
    background: 'rgba(13, 15, 38, 0.75)', border: '1px solid rgba(38, 43, 94, 0.7)',
    borderRadius: 24, overflow: 'hidden', backdropFilter: 'blur(16px)',
  },
  ledgerHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',
    gap: 14, padding: '20px 24px', borderBottom: '1px solid rgba(38, 43, 94, 0.7)',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#04040c', border: '1px solid rgba(38, 43, 94, 0.7)',
    borderRadius: 10, padding: '8px 14px', width: 260,
  },
  searchInput: {
    background: 'none', border: 'none', color: '#f8fafc',
    fontSize: 12, outline: 'none', width: '100%',
  },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: 1, padding: '14px 24px',
    background: 'rgba(4, 4, 12, 0.5)', borderBottom: '1px solid rgba(38, 43, 94, 0.6)',
  },
  td: { padding: '16px 24px', fontSize: 13, borderBottom: '1px solid rgba(38, 43, 94, 0.4)' },
  tr: { transition: 'background 0.15s' },
  trWinner: { background: 'rgba(245, 158, 11, 0.06)' },
  crownRank: { color: '#f59e0b', fontWeight: 800, fontSize: 13 },
  normalRank: { color: '#64748b', fontWeight: 700, fontSize: 12 },
  winnerBadgeMini: {
    background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b',
    borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
  },
  monoHash: { fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' },
  pillWinner: {
    background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)',
    color: '#f59e0b', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700,
  },
  pillValid: {
    background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600,
  },
  pillSealed: {
    background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#818cf8', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600,
  },
};
