import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Hash, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuction } from '../context/AuctionContext';
import TxToast from '../components/TxToast';

export default function AuctionPage() {
  const { connected, connect, connecting } = useWallet();
  const {
    auctions,
    selectedAuctionId,
    selectedAuction,
    selectAuction,
    submitBid,
    closeAuction,
    loading,
    txHash,
    error,
    clearError,
  } = useAuction();

  const [amount, setAmount] = useState('');
  const [nonce, setNonce] = useState('');
  const [showNonce, setShowNonce] = useState(false);

  const handleGenerateNonce = () => {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    setNonce(Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !nonce) return;
    await submitBid(Number(amount), nonce);
    setAmount('');
    setNonce('');
  };

  return (
    <div style={styles.page}>
      <TxToast loading={loading} txHash={txHash} error={error} onClose={clearError} />

      <div style={styles.container}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Auction Selector Bar */}
          <div style={styles.selectorBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={styles.selectorLabel}>Select Auction:</span>
              {auctions.map(a => (
                <button
                  key={a.id}
                  onClick={() => selectAuction(a.id)}
                  style={a.id === selectedAuctionId ? styles.tabActive : styles.tab}
                >
                  <span>{a.imageEmoji}</span>
                  <span>{a.title}</span>
                  <span style={a.phase === 'bidding' ? styles.tagGreen : a.phase === 'reveal' ? styles.tagBlue : styles.tagPurple}>
                    {a.phase}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Auction Header */}
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 32 }}>{selectedAuction.imageEmoji}</span>
              <div>
                <h1 style={styles.title}>{selectedAuction.title}</h1>
                <div style={{ color: '#06b6d4', fontSize: 13, fontWeight: 600 }}>{selectedAuction.category}</div>
              </div>
            </div>
            <p style={styles.subtitle}>{selectedAuction.description}</p>
          </div>

          {/* Phase Banner */}
          <div style={selectedAuction.phase === 'bidding' ? styles.phaseBannerGreen : styles.phaseBannerBlue}>
            <div style={styles.phaseLeft}>
              {selectedAuction.phase === 'bidding' ? '🟢' : selectedAuction.phase === 'reveal' ? '🔵' : '✅'}
              <span style={styles.phaseText}>
                {selectedAuction.phase === 'bidding' ? 'Bidding is Open' : selectedAuction.phase === 'reveal' ? 'Reveal Phase Active' : 'Auction Finalized'}
              </span>
            </div>
            <div style={styles.phaseStat}>
              <Users size={14} />
              <span>{selectedAuction.bidCount} bids submitted</span>
            </div>
          </div>

          <div style={styles.grid}>
            {/* Bid Form */}
            <div style={styles.card}>
              <div style={styles.cardHead}>
                <Lock size={20} color="#7c3aed" />
                <h2 style={styles.cardTitle}>Place Sealed Bid</h2>
              </div>

              {!connected ? (
                <div style={styles.connectPrompt}>
                  <AlertCircle size={40} color="#f59e0b" />
                  <p style={styles.connectText}>Connect your Lace wallet to place a private bid</p>
                  <button style={styles.connectBtn} onClick={connect} disabled={connecting}>
                    {connecting ? 'Connecting...' : 'Connect Lace Wallet'}
                  </button>
                </div>
              ) : selectedAuction.userHasBid ? (
                <div style={styles.alreadyBid}>
                  <CheckCircle size={40} color="#10b981" />
                  <p style={{ color: '#10b981', fontWeight: 600, fontSize: 16 }}>Bid Submitted!</p>
                  <p style={{ color: '#9490c4', fontSize: 13 }}>Your sealed commitment is recorded on-chain for this auction. Wait for the reveal phase to open your bid.</p>
                </div>
              ) : selectedAuction.phase !== 'bidding' ? (
                <div style={styles.closedPrompt}>
                  <AlertCircle size={40} color="#9490c4" />
                  <p style={{ color: '#9490c4', fontSize: 14 }}>Bidding phase has ended for this auction.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Bid Amount (DUST)</label>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="e.g. 1500"
                      style={styles.input}
                      required
                    />
                    <p style={styles.hint}>This value is kept private until you reveal it.</p>
                  </div>

                  <div style={styles.fieldGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={styles.label}>Secret Nonce</label>
                      <button type="button" style={styles.genBtn} onClick={handleGenerateNonce}>
                        <Hash size={12} /> Generate
                      </button>
                    </div>
                    <div style={styles.inputWrap}>
                      <input
                        type={showNonce ? 'text' : 'password'}
                        value={nonce}
                        onChange={e => setNonce(e.target.value)}
                        placeholder="Random secret salt"
                        style={{ ...styles.input, paddingRight: 44 }}
                        required
                      />
                      <button type="button" style={styles.eyeBtn} onClick={() => setShowNonce(v => !v)}>
                        {showNonce ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p style={styles.hint}>Save this! You need it to reveal your bid later.</p>
                  </div>

                  <div style={styles.commitInfo}>
                    <div style={styles.commitInfoRow}>
                      <span style={{ color: '#9490c4' }}>Commitment</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#06b6d4' }}>
                        {amount && nonce ? 'persistentHash([bid, nonce])' : '—'}
                      </span>
                    </div>
                    <div style={styles.commitInfoRow}>
                      <span style={{ color: '#9490c4' }}>Stored on-chain</span>
                      <span style={{ color: '#f1f0ff', fontSize: 13 }}>Hash only</span>
                    </div>
                    <div style={styles.commitInfoRow}>
                      <span style={{ color: '#9490c4' }}>Bid visible</span>
                      <span style={{ color: '#f59e0b', fontSize: 13 }}>After reveal phase</span>
                    </div>
                  </div>

                  <button type="submit" style={styles.submitBtn} disabled={loading || !amount || !nonce}>
                    {loading ? 'Submitting...' : '🔒 Submit Sealed Bid'}
                  </button>
                </form>
              )}
            </div>

            {/* Bids Panel */}
            <div style={styles.card}>
              <div style={styles.cardHead}>
                <Users size={20} color="#06b6d4" />
                <h2 style={styles.cardTitle}>Submitted Bids ({selectedAuction.bids.length})</h2>
              </div>
              <div style={styles.bidList}>
                {selectedAuction.bids.map((b, i) => (
                  <div key={i} style={styles.bidRow}>
                    <div>
                      <div style={styles.bidder}>{b.bidder}</div>
                      <code style={styles.bidCommitment}>{b.commitment}</code>
                    </div>
                    <div style={b.revealed ? styles.badgeGreen : styles.badgeGray}>
                      {b.revealed ? 'Revealed' : 'Sealed'}
                    </div>
                  </div>
                ))}
              </div>

              {connected && (
                <div style={styles.adminSection}>
                  <div style={styles.adminTitle}>Auction Phase Control</div>
                  <button
                    style={selectedAuction.phase === 'bidding' ? styles.closeBtn : styles.closeBtnDisabled}
                    onClick={closeAuction}
                    disabled={selectedAuction.phase !== 'bidding' || loading}
                  >
                    Close Bidding & Open Reveal Phase
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { paddingTop: 80, minHeight: '100vh' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '1.5rem' },
  selectorBar: {
    background: '#0a0a1e', border: '1px solid #1a1a4e', borderRadius: 14,
    padding: '12px 16px', marginBottom: 28,
  },
  selectorLabel: { fontSize: 13, fontWeight: 600, color: '#9490c4' },
  tab: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'transparent', border: '1px solid #1a1a4e', color: '#9490c4',
    borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
  tabActive: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)',
    color: '#f1f0ff', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  tagGreen: { fontSize: 10, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' },
  tagBlue: { fontSize: 10, fontWeight: 700, color: '#06b6d4', background: 'rgba(6,182,212,0.15)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' },
  tagPurple: { fontSize: 10, fontWeight: 700, color: '#8b5cf6', background: 'rgba(124,58,237,0.15)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' },
  header: { marginBottom: 24 },
  title: { fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800, color: '#f1f0ff' },
  subtitle: { fontSize: 14, color: '#9490c4', marginTop: 4 },
  phaseBannerGreen: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 12, padding: '14px 20px', marginBottom: 28,
  },
  phaseBannerBlue: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
    background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)',
    borderRadius: 12, padding: '14px 20px', marginBottom: 28,
  },
  phaseLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  phaseText: { fontWeight: 600, color: '#f1f0ff', fontSize: 14 },
  phaseStat: { display: 'flex', alignItems: 'center', gap: 6, color: '#9490c4', fontSize: 13 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 },
  card: { background: '#0d0d2b', border: '1px solid #1a1a4e', borderRadius: 18, padding: 28 },
  cardHead: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: 700, color: '#f1f0ff' },
  connectPrompt: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 0', textAlign: 'center' },
  connectText: { color: '#9490c4', fontSize: 14 },
  connectBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff',
    border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  alreadyBid: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0', textAlign: 'center' },
  closedPrompt: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 24, textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#f1f0ff' },
  input: {
    background: '#050510', border: '1px solid #1a1a4e', borderRadius: 10,
    padding: '12px 14px', fontSize: 14, color: '#f1f0ff', width: '100%',
    outline: 'none', fontFamily: 'inherit',
  },
  inputWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: '#9490c4', cursor: 'pointer', padding: 4,
  },
  genBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
    color: '#06b6d4', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
  },
  hint: { fontSize: 11, color: '#5a587a' },
  commitInfo: {
    background: '#050510', border: '1px solid #1a1a4e', borderRadius: 10, padding: 16,
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  commitInfoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 },
  submitBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff', border: 'none',
    borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
  },
  bidList: { display: 'flex', flexDirection: 'column', gap: 12, minHeight: 120 },
  bidRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#050510', border: '1px solid #1a1a4e', borderRadius: 10, padding: '12px 14px',
  },
  bidder: { fontSize: 13, fontWeight: 600, color: '#f1f0ff', marginBottom: 4 },
  bidCommitment: { fontSize: 11, color: '#9490c4', fontFamily: 'JetBrains Mono, monospace' },
  badgeGreen: {
    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
    color: '#10b981', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
  },
  badgeGray: {
    background: 'rgba(90,88,122,0.2)', border: '1px solid rgba(90,88,122,0.3)',
    color: '#5a587a', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
  },
  adminSection: { marginTop: 24, paddingTop: 20, borderTop: '1px solid #1a1a4e' },
  adminTitle: { fontSize: 11, fontWeight: 700, color: '#5a587a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  closeBtn: {
    width: '100%', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
    color: '#06b6d4', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  closeBtnDisabled: {
    width: '100%', background: 'rgba(26,26,78,0.5)', border: '1px solid #1a1a4e',
    color: '#5a587a', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 600, cursor: 'not-allowed',
  },
};
