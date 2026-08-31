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
    computeCommitmentHash,
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

  // Live compute preview hash using Compact persistentHash
  useEffect(() => {
    let mounted = true;
    if (amount && nonce) {
      (async () => {
        try {
          const hash = await computeCommitmentHash(Number(amount), nonce);
          if (mounted) setPreviewHash(hash);
        } catch {
          if (mounted) setPreviewHash(null);
        }
      })();
    } else {
      setPreviewHash(null);
    }
    return () => {
      mounted = false;
    };
  }, [amount, nonce, computeCommitmentHash]);

  const handleGenerateNonce = () => {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    const hex = Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
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
    <div className="pt-28 pb-20 min-h-screen w-full">
      <TxToast loading={loading} txHash={txHash} error={error} onClose={clearError} />

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* Active Auction Selector Strip */}
          <div className="p-5 rounded-3xl liquid-glass mb-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white/70">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Active Auctions:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {auctions.map((a) => {
                const isSelected = a.id === selectedAuctionId;
                return (
                  <button
                    key={a.id}
                    onClick={() => selectAuction(a.id)}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black shadow-xl scale-102'
                        : 'liquid-glass text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl">{a.imageEmoji}</span>
                    <div className="text-left">
                      <div className="text-xs font-bold leading-tight">{a.title}</div>
                      <div className="text-[10px] opacity-70 font-normal mt-0.5">
                        {a.phase === 'bidding' ? '🟢 Bidding' : a.phase === 'reveal' ? '🔵 Reveal' : '✅ Finalized'} · {a.bidCount} Bids
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full-Width 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column: Asset Details & ZK Guarantees (xl:col-span-5) */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              
              {/* Asset Hero Card */}
              <div className="p-6 sm:p-8 rounded-3xl liquid-glass flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl shadow-inner">
                      {selectedAuction.imageEmoji}
                    </div>
                    <div
                      className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        selectedAuction.phase === 'bidding'
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                          : selectedAuction.phase === 'reveal'
                          ? 'bg-cyan-950/70 text-cyan-400 border border-cyan-500/30'
                          : 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {selectedAuction.phase === 'bidding' ? '● Bidding Open' : selectedAuction.phase === 'reveal' ? '● Reveal Active' : '✓ Auction Closed'}
                    </div>
                  </div>

                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">{selectedAuction.category}</div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">{selectedAuction.title}</h1>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-6">{selectedAuction.description}</p>
                </div>

                <div>
                  {/* Metrics 2x2 Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/10 mb-6">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-white/40">Total Sealed Bids</div>
                      <div className="text-base font-bold text-white mt-1">{selectedAuction.bidCount} Bids</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-white/40">Privacy Standard</div>
                      <div className="text-base font-bold text-emerald-400 mt-1">Zero-Knowledge</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-white/40">Your Status</div>
                      <div className={`text-base font-bold mt-1 ${selectedAuction.userHasBid ? 'text-emerald-400' : 'text-white/40'}`}>
                        {selectedAuction.userHasBid ? '✓ Bid Committed' : 'Not Bid Yet'}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-white/40">Network</div>
                      <div className="text-base font-bold text-cyan-400 mt-1">Preview Testnet</div>
                    </div>
                  </div>

                  {/* Contract Strip */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      <span className="text-white/60 font-medium hidden sm:inline">Compact Contract:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-cyan-300 text-xs">
                        {selectedAuction.contractAddress.slice(0, 10)}...{selectedAuction.contractAddress.slice(-6)}
                      </code>
                      <button onClick={handleCopyAddress} className="text-white/60 hover:text-white p-1 transition cursor-pointer">
                        {copiedAddr ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a
                        href={`https://explorer.midnight.network/contract/${selectedAuction.contractAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white/60 hover:text-white p-1 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* ZK Guarantees Card */}
              <div className="p-6 rounded-3xl liquid-glass">
                <div className="flex items-center gap-2 mb-3 text-sm font-bold text-white">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Midnight ZK Privacy Guarantees</span>
                </div>
                <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-white/60 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                    <span><strong>Full Bid Secrecy:</strong> No one, not even miners or the auctioneer, can see your bid amount during bidding.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                    <span><strong>1 Bid Per Wallet:</strong> Enforced by Midnight's private coin public key check on-chain.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                    <span><strong>Tamper-Proof Reveal:</strong> Circuit verifies <code className="text-cyan-300">persistentHash([bid, nonce])</code> matches your committed state.</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Bidding Console (xl:col-span-7) */}
            <div className="xl:col-span-7 flex flex-col gap-6">
              <div className="rounded-3xl liquid-glass overflow-hidden shadow-2xl flex flex-col justify-between h-full">
                
                {/* Console Navigation Tabs */}
                <div>
                  <div className="flex border-b border-white/10 bg-black/40">
                    <button
                      onClick={() => setActiveTab('bid')}
                      className={`flex-1 py-4 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                        activeTab === 'bid'
                          ? 'border-white text-white bg-white/10'
                          : 'border-transparent text-white/50 hover:text-white'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      <span>Place Sealed Bid</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('ledger')}
                      className={`flex-1 py-4 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                        activeTab === 'ledger'
                          ? 'border-white text-white bg-white/10'
                          : 'border-transparent text-white/50 hover:text-white'
                      }`}
                    >
                      <Database className="w-4 h-4" />
                      <span>Commitments ({selectedAuction.bids.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`flex-1 py-4 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                        activeTab === 'admin'
                          ? 'border-white text-white bg-white/10'
                          : 'border-transparent text-white/50 hover:text-white'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>Phase Controls</span>
                    </button>
                  </div>

                  {/* Tab 1: Place Bid Form */}
                  {activeTab === 'bid' && (
                    <div className="p-6 sm:p-10">
                      {!connected ? (
                        <div className="text-center py-10 px-4">
                          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 text-white">
                            <Wallet className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                          <p className="text-xs sm:text-sm text-white/60 max-w-sm mx-auto mb-6">
                            Connect your Lace wallet to construct a zero-knowledge commitment proof and bid privately.
                          </p>
                          <button
                            onClick={connect}
                            disabled={connecting}
                            className="px-7 py-3.5 rounded-full bg-white hover:bg-white/90 text-black font-bold text-xs sm:text-sm shadow-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 active:scale-[0.98]"
                          >
                            <Wallet className="w-4 h-4" />
                            <span>{connecting ? 'Connecting to Lace...' : 'Connect Lace Wallet'}</span>
                          </button>
                        </div>
                      ) : selectedAuction.userHasBid ? (
                        <div className="text-center py-10 px-4">
                          <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                            <CheckCircle className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold text-emerald-400 mb-2">Sealed Bid Submitted!</h3>
                          <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto mb-6">
                            Your 32-byte commitment hash is recorded on-chain. When bidding closes, proceed to the <strong>Reveal Bids</strong> tab to open your bid.
                          </p>
                          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 max-w-md mx-auto text-left">
                            <div className="text-[10px] uppercase font-bold text-white/40 mb-1">Your Committed Hash</div>
                            <code className="text-xs sm:text-sm font-mono text-cyan-300 break-all">{selectedAuction.userCommitment}</code>
                          </div>
                        </div>
                      ) : selectedAuction.phase !== 'bidding' ? (
                        <div className="text-center py-10 px-4">
                          <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
                            <Clock className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold text-amber-400 mb-2">Bidding Phase Closed</h3>
                          <p className="text-xs sm:text-sm text-white/60 max-w-sm mx-auto">
                            This auction is currently in the <strong>{selectedAuction.phase}</strong> phase. New commitments cannot be submitted.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                          {/* Amount Input */}
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                              <label className="font-bold text-white">Bid Amount (DUST)</label>
                              <span className="text-white/50">Balance: 1,250.00 DUST</span>
                            </div>
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full liquid-input pr-16 text-white font-semibold text-base"
                                required
                              />
                              <span className="absolute right-4 font-bold text-xs text-cyan-400">DUST</span>
                            </div>
                            {/* Quick Chips */}
                            <div className="flex gap-2 mt-1">
                              {[100, 250, 500, 1000].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleQuickAdd(val)}
                                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
                                >
                                  +{val} DUST
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Secret Salt / Nonce Input */}
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                              <label className="font-bold text-white">Secret Salt / Nonce</label>
                              <button
                                type="button"
                                onClick={handleGenerateNonce}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-bold transition cursor-pointer"
                              >
                                <Hash className="w-3.5 h-3.5" />
                                <span>Auto-Generate</span>
                              </button>
                            </div>
                            <div className="relative flex items-center">
                              <input
                                type={showNonce ? 'text' : 'password'}
                                value={nonce}
                                onChange={(e) => setNonce(e.target.value)}
                                placeholder="Cryptographic random secret"
                                className="w-full liquid-input pr-12 font-mono text-xs"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowNonce((v) => !v)}
                                className="absolute right-4 text-white/50 hover:text-white p-1 transition cursor-pointer"
                              >
                                {showNonce ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <div className="text-xs text-white/50">
                              🔒 Kept strictly off-chain. You will need this to open your bid during the reveal phase.
                            </div>
                          </div>

                          {/* Live ZK Proof Preview */}
                          <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/30 flex flex-col gap-2.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                              <Shield className="w-4 h-4" />
                              <span>Zero-Knowledge Proof Preview</span>
                            </div>
                            <div className="text-xs sm:text-sm flex justify-between items-center">
                              <span className="text-white/60">Formula:</span>
                              <code className="text-cyan-300 font-mono">persistentHash([amount, nonce])</code>
                            </div>
                            <div className="text-xs sm:text-sm flex justify-between items-center gap-2">
                              <span className="text-white/60">On-Chain Commitment:</span>
                              <code className={`font-mono truncate ${previewHash ? 'text-emerald-400' : 'text-white/40'}`}>
                                {previewHash ? `${previewHash.slice(0, 22)}...${previewHash.slice(-8)}` : 'Enter parameters'}
                              </code>
                            </div>
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={loading || !amount || !nonce}
                            className="w-full py-4 rounded-full bg-white hover:bg-white/90 text-black font-bold text-sm shadow-2xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                          >
                            <Lock className="w-4 h-4" />
                            <span>{loading ? 'Submitting Sealed Proof to Midnight...' : 'Submit Sealed Bid'}</span>
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Commitments Ledger */}
                  {activeTab === 'ledger' && (
                    <div className="p-6 sm:p-8 flex flex-col gap-3">
                      <div className="text-xs sm:text-sm text-white/60 mb-2">
                        All cryptographic commitments recorded on the Midnight ledger for this auction:
                      </div>
                      {selectedAuction.bids.map((b, i) => (
                        <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-black/60 border border-white/10 text-xs sm:text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-white/10 text-white/60 font-bold flex items-center justify-center text-xs">
                              #{i + 1}
                            </div>
                            <div>
                              <div className="font-bold text-white">{b.bidder}</div>
                              <code className="text-xs font-mono text-white/50">{b.commitment}</code>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${b.revealed ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'liquid-glass text-cyan-300'}`}>
                            {b.revealed ? `Revealed: ${b.revealedAmount?.toLocaleString()} DUST` : '🔒 Sealed'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab 3: Admin Controls */}
                  {activeTab === 'admin' && (
                    <div className="p-6 sm:p-8 flex flex-col gap-5">
                      <div className="text-xs sm:text-sm text-white/60 mb-2">Control the phased execution of the auction smart contract.</div>
                      
                      <div className="flex justify-between items-center p-5 rounded-2xl bg-black/60 border border-white/10">
                        <div>
                          <div className="font-bold text-sm text-white">Phase 1: Close Bidding</div>
                          <div className="text-xs text-white/50 mt-0.5">Locks new commitments and opens reveal phase.</div>
                        </div>
                        <button
                          onClick={closeAuction}
                          disabled={selectedAuction.phase !== 'bidding' || loading}
                          className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition cursor-pointer disabled:opacity-40"
                        >
                          Close Bidding
                        </button>
                      </div>

                      <div className="flex justify-between items-center p-5 rounded-2xl bg-black/60 border border-white/10">
                        <div>
                          <div className="font-bold text-sm text-white">Phase 2: Open Reveal</div>
                          <div className="text-xs text-white/50 mt-0.5">Bidders verify their bids on-chain.</div>
                        </div>
                        <a
                          href="/reveal"
                          className="px-5 py-2.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-bold transition"
                        >
                          Go to Reveal
                        </a>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
