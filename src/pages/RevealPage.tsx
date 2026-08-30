import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuction } from '../context/AuctionContext';
import TxToast from '../components/TxToast';

export default function RevealPage() {
  const { connected, connect, connecting } = useWallet();
  const { phase, bids, revealBid, closeReveal, determineWinner, finalizeAuction, userHasBid, userHasRevealed, loading, txHash, error, clearError } = useAuction();

  const [amount, setAmount] = useState('');
  const [nonce, setNonce] = useState('');
  const [showNonce, setShowNonce] = useState(false);

  const handleReveal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !nonce) return;
    await revealBid(Number(amount), nonce);
    setAmount('');
    setNonce('');
  };

  return (
    <div style={styles.page}>
      <TxToast loading={loading} txHash={txHash} error={error} onClose={clearError} />

      <div style={styles.container}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={styles.header}>
            <h1 style={styles.title}>Reveal Phase</h1>
            <p style={styles.subtitle}>Open your commitment by revealing your original bid amount and secret nonce.</p>
          </div>

          {/* Info Banner */}
          <div style={styles.infoBanner}>
            <Info size={16} color="#06b6d4" />
            <p style={styles.infoText}>
              The contract verifies: <code style={styles.code}>persistentHash([bidAmount, nonce]) == storedCommitment</code>
              <br />Invalid reveals are automatically rejected on-chain.
            </p>
          </div>

          <div style={styles.grid}>
            {/* Reveal Form */}
            <div style={styles.card}>
              <div style={styles.cardHead}>
                <Eye size={20} color="#06b6d4" />
                <h2 style={styles.cardTitle}>Reveal Your Bid</h2>
              </div>

              {!connected ? (
                <div style={styles.centeredPrompt}>
                  <AlertCircle size={40} color="#f59e0b" />
                  <p style={{ color: '#9490c4' }}>Connect your wallet to reveal your bid</p>
                  <button style={styles.connectBtn} onClick={connect} disabled={connecting}>Connect Lace Wallet</button>
                </div>
              ) : !userHasBid ? (
                <div style={styles.centeredPrompt}>
                  <AlertCircle size={40} color="#5a587a" />
                  <p style={{ color: '#9490c4', fontSize: 14 }}>You have no sealed commitment on-chain. Visit the Auction page to place a bid first.</p>
                </div>
              ) : userHasRevealed ? (
                <div style={styles.centeredPrompt}>
                  <CheckCircle size={40} color="#10b981" />
                  <p style={{ color: '#10b981', fontWeight: 600 }}>Bid Successfully Revealed!</p>
                  <p style={{ color: '#9490c4', fontSize: 13, textAlign: 'center' }}>Your bid is now part of the winner determination. Wait for the auction to close.</p>
                </div>
              ) : phase !== 'reveal' ? (
                <div style={styles.centeredPrompt}>
                  <AlertCircle size={40} color="#5a587a" />
                  <p style={{ color: '#9490c4', fontSize: 14 }}>
                    {phase === 'bidding' ? 'Reveal phase has not started yet. Wait for bidding to close.' : 'Auction is finalized.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReveal} style={styles.form}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Your Original Bid Amount (DUST)</label>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="Enter the exact bid amount you committed"
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Your Secret Nonce</label>
                    <div style={styles.inputWrap}>
                      <input
                        type={showNonce ? 'text' : 'password'}
                        value={nonce}
                        onChange={e => setNonce(e.target.value)}
                        placeholder="The nonce you used when bidding"
                        style={{ ...styles.input, paddingRight: 44 }}
                        required
                      />
                      <button type="button" style={styles.eyeBtn} onClick={() => setShowNonce(v => !v)}>
                        {showNonce ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={styles.verifyBox}>
                    <div style={styles.verifyTitle}>What gets verified on-chain</div>
                    <div style={styles.verifyRow}>
                      <span style={{ color: '#9490c4', fontSize: 13 }}>Step 1</span>
                      <span style={{ color: '#f1f0ff', fontSize: 13 }}>Hash(amount + nonce) is recomputed in the circuit</span>
                    </div>
                    <div style={styles.verifyRow}>
                      <span style={{ color: '#9490c4', fontSize: 13 }}>Step 2</span>
                      <span style={{ color: '#f1f0ff', fontSize: 13 }}>Compared against your stored commitment</span>
                    </div>
                    <div style={styles.verifyRow}>
                      <span style={{ color: '#9490c4', fontSize: 13 }}>Step 3</span>
                      <span style={{ color: '#f1f0ff', fontSize: 13 }}>If match, bid is accepted and tracked</span>
                    </div>
                  </div>

                  <button type="submit" style={styles.revealBtn} disabled={loading || !amount || !nonce}>
                    {loading ? 'Verifying...' : '👁 Reveal My Bid'}
                  </button>
                </form>
              )}
            </div>

            {/* Bid status panel */}
            <div style={styles.card}>
              <div style={styles.cardHead}>
                <CheckCircle size={20} color="#10b981" />
                <h2 style={styles.cardTitle}>Reveal Status</h2>
              </div>
              <div style={styles.bidList}>
                {bids.map((b, i) => (
                  <div key={i} style={styles.bidRow}>
                    <div>
                      <div style={styles.bidder}>{b.bidder}</div>
                      {b.revealed && b.revealedAmount !== undefined
                        ? <div style={{ color: '#10b981', fontSize: 13, marginTop: 2 }}>{b.revealedAmount} DUST</div>
                        : <div style={{ color: '#5a587a', fontSize: 12, marginTop: 2 }}>Sealed</div>
                      }
                    </div>
                    <div style={b.revealed ? styles.badgeGreen : styles.badgeGray}>
                      {b.revealed ? '✓ Revealed' : '🔒 Sealed'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Admin controls */}
              <div style={styles.adminSection}>
                <div style={styles.adminTitle}>Auction Admin Controls</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={closeReveal} disabled={phase !== 'reveal' || loading} style={phase === 'reveal' ? styles.adminBtn : styles.adminBtnDisabled}>
                    Close Reveal Phase
                  </button>
                  <button onClick={determineWinner} disabled={phase !== 'reveal' || loading} style={phase === 'reveal' ? styles.adminBtnPurple : styles.adminBtnDisabled}>
                    Determine Winner
                  </button>
                  <button onClick={finalizeAuction} disabled={loading} style={styles.adminBtnGold}>
                    Finalize Auction
                  </button>
                </div>
              </div>
            </div>
          </div>
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
  infoBanner: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
    borderRadius: 12, padding: '14px 18px', marginBottom: 28,
  },
  infoText: { fontSize: 13, color: '#9490c4', lineHeight: 1.6 },
  code: { fontFamily: 'JetBrains Mono, monospace', color: '#06b6d4', fontSize: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 },
  card: { background: '#0d0d2b', border: '1px solid #1a1a4e', borderRadius: 18, padding: 28 },
  cardHead: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: 700, color: '#f1f0ff' },
  centeredPrompt: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '28px 0', textAlign: 'center' },
  connectBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff',
    border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#f1f0ff' },
  input: {
    background: '#050510', border: '1px solid #1a1a4e', borderRadius: 10,
    padding: '12px 14px', fontSize: 14, color: '#f1f0ff', width: '100%', outline: 'none', fontFamily: 'inherit',
  },
  inputWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: '#9490c4', cursor: 'pointer', padding: 4,
  },
  verifyBox: {
    background: '#050510', border: '1px solid #1a1a4e', borderRadius: 10, padding: 16,
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  verifyTitle: { fontSize: 11, fontWeight: 700, color: '#5a587a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  verifyRow: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  revealBtn: {
    background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: '#fff', border: 'none',
    borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(6,182,212,0.3)',
  },
  bidList: { display: 'flex', flexDirection: 'column', gap: 12 },
  bidRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#050510', border: '1px solid #1a1a4e', borderRadius: 10, padding: '12px 14px',
  },
  bidder: { fontSize: 13, fontWeight: 600, color: '#f1f0ff' },
  badgeGreen: {
    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
    color: '#10b981', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
  },
  badgeGray: {
    background: 'rgba(90,88,122,0.2)', border: '1px solid rgba(90,88,122,0.3)',
    color: '#5a587a', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
  },
  adminSection: { marginTop: 24, paddingTop: 20, borderTop: '1px solid #1a1a4e' },
  adminTitle: { fontSize: 11, fontWeight: 700, color: '#5a587a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  adminBtn: {
    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
    color: '#06b6d4', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  adminBtnPurple: {
    background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
    color: '#8b5cf6', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  adminBtnGold: {
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
    color: '#f59e0b', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  adminBtnDisabled: {
    background: 'rgba(26,26,78,0.5)', border: '1px solid #1a1a4e',
    color: '#5a587a', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'not-allowed',
  },
};
