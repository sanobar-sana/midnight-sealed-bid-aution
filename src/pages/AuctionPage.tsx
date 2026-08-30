import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Eye,
  EyeOff,
  Hash,
  CheckCircle,
  Shield,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Sparkles,
  Database,
  Wallet,
} from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'bid' | 'ledger' | 'admin'>('bid');
  const [amount, setAmount] = useState('');
  const [nonce, setNonce] = useState('');
  const [showNonce, setShowNonce] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [previewHash, setPreviewHash] = useState<string | null>(null);

  // Live compute preview hash
  useEffect(() => {
    if (amount && nonce) {
      const data = `${amount}:${nonce}`;
      const encoded = new TextEncoder().encode(data);
      crypto.subtle.digest('SHA-256', encoded).then(buf => {
        const hash = Array.from(new Uint8Array(buf))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        setPreviewHash(hash);
      });
    } else {
      setPreviewHash(null);
    }
  }, [amount, nonce]);

  const handleGenerateNonce = () => {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    setNonce(hex);
  };

  const handleQuickAdd = (val: number) => {
    const current = Number(amount) || 0;
    setAmount(String(current + val));
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(selectedAuction.contractAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
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

      <div className="container">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* Auction Selector Strip */}
          <div style={styles.selectorWrapper}>
            <div style={styles.selectorLabel}>
              <Sparkles size={14} color="#818cf8" />
              <span>Active Auctions:</span>
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
                        {a.phase === 'bidding' ? '🟢 Bidding Open' : a.phase === 'reveal' ? '🔵 Reveal Phase' : '✅ Finalized'} · {a.bidCount} Bids
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Layout */}
          <div style={styles.mainGrid}>
            
            {/* Left Column: Asset & Rules Showcase */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Asset Hero Card */}
              <div style={styles.heroCard}>
                <div style={styles.heroCardTop}>
                  <div style={styles.emojiBadge}>{selectedAuction.imageEmoji}</div>
                  <div style={styles.phaseBadge(selectedAuction.phase)}>
                    {selectedAuction.phase === 'bidding' ? '● Bidding Open' : selectedAuction.phase === 'reveal' ? '● Reveal Active' : '✓ Auction Closed'}
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={styles.categoryTag}>{selectedAuction.category}</div>
                  <h1 style={styles.assetTitle}>{selectedAuction.title}</h1>
                  <p style={styles.assetDesc}>{selectedAuction.description}</p>
                </div>

                {/* Key Metrics Grid */}
                <div style={styles.metricsGrid}>
                  <div style={styles.metricBox}>
                    <div style={styles.metricLabel}>Total Sealed Bids</div>
                    <div style={styles.metricValue}>{selectedAuction.bidCount} Bids</div>
                  </div>
                  <div style={styles.metricBox}>
                    <div style={styles.metricLabel}>Privacy Standard</div>
                    <div style={{ ...styles.metricValue, color: '#34d399' }}>Zero-Knowledge</div>
                  </div>
                  <div style={styles.metricBox}>
                    <div style={styles.metricLabel}>Your Status</div>
                    <div style={{ ...styles.metricValue, color: selectedAuction.userHasBid ? '#34d399' : '#94a3b8' }}>
                      {selectedAuction.userHasBid ? '✓ Bid Committed' : 'Not Bid Yet'}
                    </div>
                  </div>
                  <div style={styles.metricBox}>
                    <div style={styles.metricLabel}>Network</div>
                    <div style={{ ...styles.metricValue, color: '#22d3ee' }}>Preview Testnet</div>
                  </div>
                </div>

                {/* Contract Info Footer */}
                <div style={styles.contractStrip}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={14} color="#818cf8" />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Verified Compact Contract</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code style={styles.addrCode}>{selectedAuction.contractAddress.slice(0, 10)}...{selectedAuction.contractAddress.slice(-6)}</code>
                    <button onClick={handleCopyAddress} style={styles.copyBtn} title="Copy contract address">
                      {copiedAddr ? <Check size={13} color="#10b981" /> : <Copy size={13} color="#94a3b8" />}
                    </button>
                    <a
                      href={`https://explorer.midnight.network/contract/${selectedAuction.contractAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.extBtn}
                      title="View on Midnight Explorer"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>

              {/* ZK Privacy Guarantee Card */}
              <div style={styles.infoCard}>
                <div style={styles.infoCardHead}>
                  <Shield size={18} color="#818cf8" />
                  <span style={styles.infoCardTitle}>Midnight ZK Privacy Guarantees</span>
                </div>
                <div style={styles.infoCardBody}>
                  <div style={styles.infoRow}>
                    <div style={styles.infoDot} />
                    <span><strong>Full Bid Secrecy:</strong> No one, not even miners or the auctioneer, can see your bid amount during bidding.</span>
                  </div>
                  <div style={styles.infoRow}>
                    <div style={styles.infoDot} />
                    <span><strong>1 Bid Per Wallet:</strong> Enforced by Midnight's private coin public key check on-chain.</span>
                  </div>
                  <div style={styles.infoRow}>
                    <div style={styles.infoDot} />
                    <span><strong>Tamper-Proof Reveal:</strong> The circuit verifies <code>persistentHash([bid, nonce])</code> matches your committed state.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Bidding Console */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div style={styles.consoleCard}>
                {/* Console Navigation Tabs */}
                <div style={styles.consoleTabs}>
                  <button
                    onClick={() => setActiveTab('bid')}
                    style={{ ...styles.consoleTab, ...(activeTab === 'bid' ? styles.consoleTabActive : {}) }}
                  >
                    <Lock size={15} />
                    <span>Place Sealed Bid</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ledger')}
                    style={{ ...styles.consoleTab, ...(activeTab === 'ledger' ? styles.consoleTabActive : {}) }}
                  >
                    <Database size={15} />
                    <span>Bid Commitments ({selectedAuction.bids.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('admin')}
                    style={{ ...styles.consoleTab, ...(activeTab === 'admin' ? styles.consoleTabActive : {}) }}
                  >
                    <Zap size={15} />
                    <span>Phase Controls</span>
                  </button>
                </div>

                {/* Tab 1: Place Bid */}
                {activeTab === 'bid' && (
                  <div style={{ padding: '24px 28px' }}>
                    {!connected ? (
                      <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}><Wallet size={28} color="#818cf8" /></div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>Connect Your Wallet</h3>
                        <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 320, margin: '8px auto 20px' }}>
                          Connect your Lace wallet to construct a zero-knowledge commitment proof and bid privately.
                        </p>
                        <button onClick={connect} disabled={connecting} style={styles.mainActionBtn}>
                          <Wallet size={16} />
                          {connecting ? 'Connecting to Lace...' : 'Connect Lace Wallet'}
                        </button>
                      </div>
                    ) : selectedAuction.userHasBid ? (
                      <div style={styles.emptyState}>
                        <div style={{ ...styles.emptyIcon, background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                          <CheckCircle size={32} color="#10b981" />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>Sealed Bid Submitted!</h3>
                        <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 360, margin: '8px auto 20px' }}>
                          Your 32-byte commitment hash is recorded on-chain. When bidding closes, proceed to the <strong>Reveal Bids</strong> tab to open your bid.
                        </p>
                        <div style={styles.savedCommitmentBox}>
                          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Your Committed Hash</div>
                          <code style={{ fontSize: 12, color: '#22d3ee', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>
                            {selectedAuction.userCommitment}
                          </code>
                        </div>
                      </div>
                    ) : selectedAuction.phase !== 'bidding' ? (
                      <div style={styles.emptyState}>
                        <div style={{ ...styles.emptyIcon, background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                          <Clock size={32} color="#f59e0b" />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>Bidding Phase Closed</h3>
                        <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 340, margin: '8px auto 20px' }}>
                          This auction is currently in the <strong>{selectedAuction.phase}</strong> phase. New commitments cannot be submitted.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} style={styles.form}>
                        {/* Amount Input */}
                        <div style={styles.formGroup}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={styles.inputLabel}>Bid Amount (DUST)</label>
                            <span style={{ fontSize: 12, color: '#64748b' }}>Balance: 1,250.00 DUST</span>
                          </div>
                          <div style={styles.inputWrapper}>
                            <input
                              type="number"
                              min="1"
                              value={amount}
                              onChange={e => setAmount(e.target.value)}
                              placeholder="0.00"
                              style={styles.mainInput}
                              required
                            />
                            <span style={styles.currencyBadge}>DUST</span>
                          </div>
                          {/* Quick Chips */}
                          <div style={styles.quickChips}>
                            {[100, 250, 500, 1000].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleQuickAdd(val)}
                                style={styles.chipBtn}
                              >
                                +{val} DUST
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Secret Nonce */}
                        <div style={styles.formGroup}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={styles.inputLabel}>Secret Salt / Nonce</label>
                            <button type="button" onClick={handleGenerateNonce} style={styles.genNonceBtn}>
                              <Hash size={12} /> Auto-Generate
                            </button>
                          </div>
                          <div style={styles.inputWrapper}>
                            <input
                              type={showNonce ? 'text' : 'password'}
                              value={nonce}
                              onChange={e => setNonce(e.target.value)}
                              placeholder="Cryptographic random secret"
                              style={{ ...styles.mainInput, paddingRight: 44, fontFamily: 'JetBrains Mono, monospace' }}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowNonce(v => !v)}
                              style={styles.eyeBtn}
                              title={showNonce ? 'Hide nonce' : 'Show nonce'}
                            >
                              {showNonce ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                            </button>
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            🔒 Kept strictly off-chain. You will need this to open your bid during the reveal phase.
                          </div>
                        </div>

                        {/* Live Cryptographic Preview */}
                        <div style={styles.zkPreviewBox}>
                          <div style={styles.zkPreviewHead}>
                            <Shield size={13} color="#818cf8" />
                            <span>Zero-Knowledge Proof Construction Preview</span>
                          </div>
                          <div style={styles.zkPreviewBody}>
                            <div style={styles.previewRow}>
                              <span style={{ color: '#94a3b8' }}>Formula:</span>
                              <code style={{ color: '#818cf8' }}>persistentHash([amount, nonce])</code>
                            </div>
                            <div style={styles.previewRow}>
                              <span style={{ color: '#94a3b8' }}>On-Chain Commitment:</span>
                              <code style={{ color: previewHash ? '#34d399' : '#64748b', fontSize: 11, wordBreak: 'break-all' }}>
                                {previewHash ? `${previewHash.slice(0, 24)}...${previewHash.slice(-8)}` : 'Enter amount & salt to preview'}
                              </code>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={loading || !amount || !nonce}
                          style={styles.mainActionBtn}
                        >
                          <Lock size={16} />
                          {loading ? 'Submitting Sealed Proof to Midnight...' : 'Submit Sealed Bid'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Tab 2: Commitments Ledger */}
                {activeTab === 'ledger' && (
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                      All cryptographic commitments recorded on the Midnight ledger for this auction:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selectedAuction.bids.map((b, i) => (
                        <div key={i} style={styles.ledgerRow}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={styles.ledgerIndex}>#{i + 1}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>{b.bidder}</div>
                              <code style={styles.ledgerCommitment}>{b.commitment}</code>
                            </div>
                          </div>
                          <div style={b.revealed ? styles.badgeRevealed : styles.badgeSealed}>
                            {b.revealed ? `Revealed: ${b.revealedAmount?.toLocaleString()} DUST` : '🔒 Sealed'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: Admin Phase Controls */}
                {activeTab === 'admin' && (
                  <div style={{ padding: '24px 28px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                      Auction Lifecycle Transitions
                    </div>
                    <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
                      Control the phased execution of the auction smart contract.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={styles.adminStepBox}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc' }}>Phase 1: Close Bidding</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>Locks new bid commitments and opens the reveal phase.</div>
                        </div>
                        <button
                          onClick={closeAuction}
                          disabled={selectedAuction.phase !== 'bidding' || loading}
                          style={selectedAuction.phase === 'bidding' ? styles.adminActionBtn : styles.adminActionBtnDisabled}
                        >
                          Close Bidding
                        </button>
                      </div>

                      <div style={styles.adminStepBox}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc' }}>Phase 2: Open Reveal</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>Bidders verify their bids on-chain.</div>
                        </div>
                        <a
                          href="/reveal"
                          style={{
                            ...styles.adminActionBtn,
                            textDecoration: 'none',
                            background: 'rgba(6, 182, 212, 0.15)',
                            borderColor: 'rgba(6, 182, 212, 0.3)',
                            color: '#22d3ee',
                          }}
                        >
                          Go to Reveal
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const phaseBadgeColors: Record<string, { bg: string; color: string; border: string }> = {
  bidding: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  reveal: { bg: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' },
  finalized: { bg: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
};

const styles: Record<string, React.CSSProperties | any> = {
  page: { paddingTop: 90, paddingBottom: 60, minHeight: '100vh' },
  selectorWrapper: {
    background: 'rgba(13, 15, 38, 0.6)', border: '1px solid rgba(38, 43, 94, 0.6)',
    borderRadius: 16, padding: '14px 20px', marginBottom: 28,
    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
  },
  selectorLabel: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 13, fontWeight: 700, color: '#f8fafc',
  },
  auctionPills: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  pillBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(38, 43, 94, 0.5)',
    borderRadius: 12, padding: '8px 16px', color: '#94a3b8', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pillBtnActive: {
    background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.4)',
    color: '#f8fafc', boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
  },
  pillTitle: { fontSize: 13, fontWeight: 700, color: '#f8fafc' },
  pillSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  mainGrid: { display: 'grid', gridTemplateColumns: 'minmax(340px, 1.1fr) minmax(360px, 1.3fr)', gap: 24 },
  heroCard: {
    background: 'rgba(13, 15, 38, 0.75)', border: '1px solid rgba(38, 43, 94, 0.7)',
    borderRadius: 24, padding: 28, backdropFilter: 'blur(16px)',
  },
  heroCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  emojiBadge: {
    fontSize: 36, width: 64, height: 64, borderRadius: 16,
    background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  phaseBadge: (phase: string) => {
    const c = phaseBadgeColors[phase] || phaseBadgeColors.bidding;
    return {
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
    };
  },
  categoryTag: { fontSize: 12, color: '#22d3ee', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
  assetTitle: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: '#f8fafc', marginTop: 4 },
  assetDesc: { fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginTop: 8 },
  metricsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24,
    borderTop: '1px solid rgba(38, 43, 94, 0.6)', paddingTop: 20,
  },
  metricBox: {
    background: 'rgba(4, 4, 12, 0.5)', border: '1px solid rgba(38, 43, 94, 0.4)',
    borderRadius: 14, padding: '12px 16px',
  },
  metricLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 },
  metricValue: { fontSize: 15, fontWeight: 700, color: '#f8fafc', marginTop: 4 },
  contractStrip: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(4, 4, 12, 0.6)', border: '1px solid rgba(38, 43, 94, 0.6)',
    borderRadius: 14, padding: '10px 16px', marginTop: 20,
  },
  addrCode: { fontSize: 11, color: '#818cf8', fontFamily: 'JetBrains Mono, monospace' },
  copyBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  extBtn: { color: '#94a3b8', display: 'flex', alignItems: 'center' },
  infoCard: {
    background: 'rgba(13, 15, 38, 0.5)', border: '1px solid rgba(38, 43, 94, 0.5)',
    borderRadius: 20, padding: 22,
  },
  infoCardHead: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
  infoCardTitle: { fontSize: 14, fontWeight: 700, color: '#f8fafc' },
  infoCardBody: { display: 'flex', flexDirection: 'column', gap: 10 },
  infoRow: { display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 },
  infoDot: { width: 6, height: 6, borderRadius: '50%', background: '#6366f1', marginTop: 6, flexShrink: 0 },
  consoleCard: {
    background: 'rgba(13, 15, 38, 0.75)', border: '1px solid rgba(38, 43, 94, 0.7)',
    borderRadius: 24, overflow: 'hidden', backdropFilter: 'blur(16px)',
  },
  consoleTabs: {
    display: 'flex', borderBottom: '1px solid rgba(38, 43, 94, 0.7)',
    background: 'rgba(4, 4, 12, 0.4)',
  },
  consoleTab: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '16px 12px', background: 'none', border: 'none', color: '#94a3b8',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  },
  consoleTabActive: {
    color: '#f8fafc', borderBottomColor: '#6366f1', background: 'rgba(99, 102, 241, 0.08)',
  },
  emptyState: { textAlign: 'center', padding: '36px 16px' },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 20, background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 16px',
  },
  savedCommitmentBox: {
    background: 'rgba(4, 4, 12, 0.6)', border: '1px solid rgba(38, 43, 94, 0.6)',
    borderRadius: 14, padding: 14, textAlign: 'left', maxWidth: 360, margin: '0 auto',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: 700, color: '#f8fafc' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  mainInput: {
    width: '100%', background: '#04040c', border: '1px solid rgba(38, 43, 94, 0.7)',
    borderRadius: 14, padding: '14px 16px', fontSize: 15, color: '#f8fafc',
    outline: 'none', transition: 'border-color 0.2s',
  },
  currencyBadge: {
    position: 'absolute', right: 16, fontSize: 13, fontWeight: 700, color: '#818cf8',
  },
  quickChips: { display: 'flex', gap: 8, marginTop: 4 },
  chipBtn: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(38, 43, 94, 0.6)',
    borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#94a3b8',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  genNonceBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)',
    color: '#22d3ee', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
  },
  eyeBtn: {
    position: 'absolute', right: 14, background: 'none', border: 'none',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
  },
  zkPreviewBox: {
    background: 'rgba(4, 4, 12, 0.6)', border: '1px solid rgba(79, 70, 229, 0.25)',
    borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
  },
  zkPreviewHead: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 0.5,
  },
  zkPreviewBody: { display: 'flex', flexDirection: 'column', gap: 6 },
  previewRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 },
  mainActionBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 14,
    padding: '15px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.35)', transition: 'all 0.2s',
  },
  ledgerRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#04040c', border: '1px solid rgba(38, 43, 94, 0.6)',
    borderRadius: 14, padding: '12px 16px',
  },
  ledgerIndex: {
    width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#64748b', fontWeight: 700,
  },
  ledgerCommitment: { fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' },
  badgeRevealed: {
    background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600,
  },
  badgeSealed: {
    background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#818cf8', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600,
  },
  adminStepBox: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#04040c', border: '1px solid rgba(38, 43, 94, 0.6)',
    borderRadius: 14, padding: '16px 20px',
  },
  adminActionBtn: {
    background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#818cf8', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  adminActionBtnDisabled: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(38, 43, 94, 0.4)',
    color: '#64748b', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'not-allowed',
  },
};
