import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  Sparkles,
  Trophy,
  Lock,
  Zap,
  Check,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuction } from '../context/AuctionContext';
import TxToast from '../components/TxToast';

export default function RevealPage() {
  const { connected, connect, connecting } = useWallet();
  const {
    auctions,
    selectedAuctionId,
    selectedAuction,
    selectAuction,
    revealBid,
    closeReveal,
    determineWinner,
    finalizeAuction,
    loading,
    txHash,
    error,
    clearError,
  } = useAuction();

  const [amount, setAmount] = useState(selectedAuction.userBidAmount ? String(selectedAuction.userBidAmount) : '');
  const [nonce, setNonce] = useState(selectedAuction.userNonce || '');
  const [showNonce, setShowNonce] = useState(false);

  const handleReveal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !nonce) return;
    await revealBid(Number(amount), nonce);
  };

  const revealedBids = selectedAuction.bids
    .filter(b => b.revealed && b.revealedAmount !== undefined)
    .sort((a, b) => (b.revealedAmount || 0) - (a.revealedAmount || 0));

  const sealedBids = selectedAuction.bids.filter(b => !b.revealed);

  return (
    <div style={styles.page}>
      <TxToast loading={loading} txHash={txHash} error={error} onClose={clearError} />

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
                    onClick={() => {
                      selectAuction(a.id);
                      setAmount(a.userBidAmount ? String(a.userBidAmount) : '');
                      setNonce(a.userNonce || '');
                    }}
                    style={{
                      ...styles.pillBtn,
                      ...(isSelected ? styles.pillBtnActive : {}),
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{a.imageEmoji}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={styles.pillTitle}>{a.title}</div>
                      <div style={styles.pillSub}>
                        {a.phase === 'bidding' ? '🟢 Bidding' : a.phase === 'reveal' ? '🔵 Reveal Phase' : '✅ Finalized'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lifecycle Progress Stepper */}
          <div style={styles.stepperWrapper}>
            {[
              { num: '01', title: 'Commitment Phase', desc: 'Bidding Closed', done: selectedAuction.phase !== 'bidding', active: selectedAuction.phase === 'bidding' },
              { num: '02', title: 'Reveal Phase', desc: 'Verify On-Chain', done: selectedAuction.phase === 'finalized', active: selectedAuction.phase === 'reveal' },
              { num: '03', title: 'Winner Determination', desc: 'Highest Bid Wins', done: selectedAuction.hasWinner, active: selectedAuction.phase === 'reveal' && selectedAuction.bids.some(b => b.revealed) },
              { num: '04', title: 'Finalization', desc: 'Result Queryable', done: selectedAuction.phase === 'finalized', active: false },
            ].map((step, idx) => (
              <div key={step.num} style={styles.stepItem}>
                <div style={{ ...styles.stepNum, ...(step.done ? styles.stepDone : step.active ? styles.stepActive : {}) }}>
                  {step.done ? <Check size={14} /> : step.num}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: step.active || step.done ? '#f8fafc' : '#64748b' }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{step.desc}</div>
                </div>
                {idx < 3 && <div style={styles.stepLine} />}
              </div>
            ))}
          </div>

          {/* Main 2-Column Grid */}
          <div style={styles.mainGrid}>
            
            {/* Left: Reveal Action Form */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIconWrap}>
                  <Eye size={20} color="#22d3ee" />
                </div>
                <div>
                  <h2 style={styles.cardTitle}>Open Sealed Commitment</h2>
                  <div style={styles.cardSub}>Prove your bid on-chain without revealing secret salts beforehand</div>
                </div>
              </div>

              {!connected ? (
                <div style={styles.emptyState}>
                  <AlertCircle size={36} color="#f59e0b" />
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc', marginTop: 12 }}>Wallet Required</h3>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '8px auto 20px', maxWidth: 300 }}>
                    Connect your wallet to supply your private witness to the Compact reveal circuit.
                  </p>
                  <button onClick={connect} disabled={connecting} style={styles.actionBtnBlue}>
                    Connect Lace Wallet
                  </button>
                </div>
              ) : !selectedAuction.userHasBid ? (
                <div style={styles.emptyState}>
                  <AlertCircle size={36} color="#64748b" />
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc', marginTop: 12 }}>No Commitment Found</h3>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '8px auto 20px', maxWidth: 320 }}>
                    You did not submit a sealed bid for this auction during the commitment window.
                  </p>
                  <a href="/auction" style={{ ...styles.actionBtnBlue, textDecoration: 'none', display: 'inline-flex' }}>
                    Go to Auctions
                  </a>
                </div>
              ) : selectedAuction.userHasRevealed ? (
                <div style={styles.emptyState}>
                  <div style={styles.revealedBadgeBig}>
                    <CheckCircle size={36} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#10b981', marginTop: 14 }}>Bid Successfully Opened & Verified!</h3>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '8px auto 20px', maxWidth: 340 }}>
                    Your bid of <strong>{selectedAuction.userBidAmount?.toLocaleString()} DUST</strong> has been validated by the Compact zero-knowledge circuit and added to the winner tally.
                  </p>
                </div>
              ) : selectedAuction.phase !== 'reveal' ? (
                <div style={styles.emptyState}>
                  <Clock size={36} color="#f59e0b" />
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f59e0b', marginTop: 12 }}>
                    {selectedAuction.phase === 'bidding' ? 'Reveal Phase Not Open Yet' : 'Auction Already Finalized'}
                  </h3>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '8px auto 20px', maxWidth: 320 }}>
                    {selectedAuction.phase === 'bidding'
                      ? 'The bidding window is still active. Once bidding closes, the reveal window will open.'
                      : 'This auction has concluded and results are recorded in the ledger.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReveal} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.inputLabel}>Original Bid Amount (DUST)</label>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="e.g. 1450"
                      style={styles.mainInput}
                      required
                    />
                    <div style={{ fontSize: 11, color: '#64748b' }}>Must exactly match your initial sealed amount.</div>
                  </div>

                  <div style={styles.formGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={styles.inputLabel}>Secret Salt / Nonce</label>
                      {selectedAuction.userNonce && (
                        <span style={{ fontSize: 11, color: '#22d3ee', fontWeight: 600 }}>● Autofilled from session</span>
                      )}
                    </div>
                    <div style={styles.inputWrapper}>
                      <input
                        type={showNonce ? 'text' : 'password'}
                        value={nonce}
                        onChange={e => setNonce(e.target.value)}
                        placeholder="Enter the secret nonce used when bidding"
                        style={{ ...styles.mainInput, paddingRight: 44, fontFamily: 'JetBrains Mono, monospace' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNonce(v => !v)}
                        style={styles.eyeBtn}
                      >
                        {showNonce ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                      </button>
                    </div>
                  </div>

                  {/* Cryptographic Verification Box */}
                  <div style={styles.verifyBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#22d3ee' }}>
                      <Shield size={14} />
                      <span>On-Chain Verification Circuit</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginTop: 4 }}>
                      The smart contract computes <code>persistentHash([bid, nonce])</code> and asserts strict equality with your committed on-chain hash. Invalid reveals are instantly rejected.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !amount || !nonce}
                    style={styles.actionBtnBlue}
                  >
                    <Eye size={16} />
                    {loading ? 'Submitting ZK Reveal Proof...' : 'Reveal & Verify Bid'}
                  </button>
                </form>
              )}
            </div>

            {/* Right: Live Revealed Leaderboard & Admin Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Leaderboard Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.cardIconWrap, background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.25)' }}>
                    <Trophy size={20} color="#f59e0b" />
                  </div>
                  <div>
                    <h2 style={styles.cardTitle}>Live Revealed Leaderboard</h2>
                    <div style={styles.cardSub}>
                      {revealedBids.length} of {selectedAuction.bidCount} bids opened
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  {revealedBids.map((b, idx) => (
                    <div key={idx} style={idx === 0 ? styles.leaderRowFirst : styles.leaderRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={idx === 0 ? styles.rankBadgeGold : styles.rankBadge}>
                          {idx === 0 ? '👑 1' : `#${idx + 1}`}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>{b.bidder}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>Verified On-Chain</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: idx === 0 ? '#f59e0b' : '#f8fafc' }}>
                          {b.revealedAmount?.toLocaleString()} DUST
                        </div>
                        <div style={{ fontSize: 10, color: '#34d399', fontWeight: 600 }}>Valid Reveal</div>
                      </div>
                    </div>
                  ))}

                  {/* Sealed Pending Bids */}
                  {sealedBids.map((b, idx) => (
                    <div key={`sealed-${idx}`} style={styles.sealedRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={styles.sealedIcon}><Lock size={12} color="#64748b" /></div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{b.bidder}</div>
                          <code style={{ fontSize: 10, color: '#64748b' }}>{b.commitment.slice(0, 16)}...</code>
                        </div>
                      </div>
                      <div style={styles.sealedTag}>🔒 Awaiting Reveal</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifecycle Admin Controls */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.cardIconWrap, background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.25)' }}>
                    <Zap size={20} color="#818cf8" />
                  </div>
                  <div>
                    <h2 style={styles.cardTitle}>Finalization Controls</h2>
                    <div style={styles.cardSub}>Determine highest valid bid & lock results</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  <div style={styles.actionRow}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>1. Close Reveal Phase</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Prevents further reveals</div>
                    </div>
                    <button
                      onClick={closeReveal}
                      disabled={selectedAuction.phase !== 'reveal' || loading}
                      style={selectedAuction.phase === 'reveal' ? styles.smallBtn : styles.smallBtnDisabled}
                    >
                      Close Reveal
                    </button>
                  </div>

                  <div style={styles.actionRow}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>2. Determine Winner</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Picks top valid revealed bid</div>
                    </div>
                    <button
                      onClick={determineWinner}
                      disabled={selectedAuction.phase !== 'reveal' || loading}
                      style={selectedAuction.phase === 'reveal' ? styles.smallBtnPurple : styles.smallBtnDisabled}
                    >
                      Determine Winner
                    </button>
                  </div>

                  <div style={styles.actionRow}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>3. Finalize Auction</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Permanently locks outcome</div>
                    </div>
                    <button
                      onClick={finalizeAuction}
                      disabled={loading}
                      style={styles.smallBtnGold}
                    >
                      Finalize Auction
                    </button>
                  </div>
                </div>
              </div>

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
  stepperWrapper: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16, background: 'rgba(13, 15, 38, 0.5)', border: '1px solid rgba(38, 43, 94, 0.6)',
    borderRadius: 18, padding: '18px 24px', marginBottom: 28,
  },
  stepItem: { display: 'flex', alignItems: 'center', gap: 12, position: 'relative' },
  stepNum: {
    width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
    fontWeight: 800, color: '#64748b', flexShrink: 0,
  },
  stepDone: { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' },
  stepActive: { background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.4)' },
  stepLine: { display: 'none' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(360px, 1.2fr)', gap: 24 },
  card: {
    background: 'rgba(13, 15, 38, 0.75)', border: '1px solid rgba(38, 43, 94, 0.7)',
    borderRadius: 24, padding: 28, backdropFilter: 'blur(16px)',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
  cardIconWrap: {
    width: 44, height: 44, borderRadius: 12, background: 'rgba(6, 182, 212, 0.1)',
    border: '1px solid rgba(6, 182, 212, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 17, fontWeight: 700, color: '#f8fafc' },
  cardSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  emptyState: { textAlign: 'center', padding: '36px 16px' },
  revealedBadgeBig: {
    width: 64, height: 64, borderRadius: 20, background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: 700, color: '#f8fafc' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  mainInput: {
    width: '100%', background: '#04040c', border: '1px solid rgba(38, 43, 94, 0.7)',
    borderRadius: 14, padding: '14px 16px', fontSize: 15, color: '#f8fafc', outline: 'none',
  },
  eyeBtn: { position: 'absolute', right: 14, background: 'none', border: 'none', cursor: 'pointer' },
  verifyBox: {
    background: 'rgba(4, 4, 12, 0.6)', border: '1px solid rgba(6, 182, 212, 0.25)',
    borderRadius: 14, padding: 16,
  },
  actionBtnBlue: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 14,
    padding: '15px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(6, 182, 212, 0.35)',
  },
  leaderRowFirst: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(99, 102, 241, 0.08))',
    border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: 14, padding: '14px 18px',
  },
  leaderRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#04040c', border: '1px solid rgba(38, 43, 94, 0.6)',
    borderRadius: 14, padding: '12px 18px',
  },
  rankBadgeGold: {
    background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)',
    color: '#f59e0b', borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 800,
  },
  rankBadge: {
    background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
    borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 700,
  },
  sealedRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(4, 4, 12, 0.4)', border: '1px dashed rgba(38, 43, 94, 0.6)',
    borderRadius: 12, padding: '10px 16px',
  },
  sealedIcon: { width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sealedTag: { fontSize: 11, color: '#64748b', fontWeight: 600 },
  actionRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#04040c', border: '1px solid rgba(38, 43, 94, 0.6)',
    borderRadius: 14, padding: '14px 18px',
  },
  smallBtn: {
    background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)',
    color: '#22d3ee', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
  },
  smallBtnPurple: {
    background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#818cf8', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
  },
  smallBtnGold: {
    background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)',
    color: '#f59e0b', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
  },
  smallBtnDisabled: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(38, 43, 94, 0.4)',
    color: '#64748b', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'not-allowed',
  },
};
