import { useState } from 'react';
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
    .filter((b) => b.revealed && b.revealedAmount !== undefined)
    .sort((a, b) => (b.revealedAmount || 0) - (a.revealedAmount || 0));

  const sealedBids = selectedAuction.bids.filter((b) => !b.revealed);

  return (
    <div className="pt-28 pb-20 min-h-screen w-full">
      <TxToast loading={loading} txHash={txHash} error={error} onClose={clearError} />

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* Active Auction Selector Strip */}
          <div className="p-5 rounded-3xl liquid-glass mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white/70">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Select Auction:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {auctions.map((a) => {
                const isSelected = a.id === selectedAuctionId;
                return (
                  <button
                    key={a.id}
                    onClick={() => {
                      selectAuction(a.id);
                      setAmount(a.userBidAmount ? String(a.userBidAmount) : '');
                      setNonce(a.userNonce || '');
                    }}
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
                        {a.phase === 'bidding' ? '🟢 Bidding' : a.phase === 'reveal' ? '🔵 Reveal Phase' : '✅ Finalized'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl liquid-glass mb-8">
            {[
              { num: '01', title: 'Commitment Phase', desc: 'Bidding Closed', done: selectedAuction.phase !== 'bidding', active: selectedAuction.phase === 'bidding' },
              { num: '02', title: 'Reveal Phase', desc: 'Verify On-Chain', done: selectedAuction.phase === 'finalized', active: selectedAuction.phase === 'reveal' },
              { num: '03', title: 'Winner Determination', desc: 'Highest Bid Wins', done: selectedAuction.hasWinner, active: selectedAuction.phase === 'reveal' && selectedAuction.bids.some((b) => b.revealed) },
              { num: '04', title: 'Finalization', desc: 'Result Locked', done: selectedAuction.phase === 'finalized', active: false },
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-3 p-3">
                <div
                  className={`w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 ${
                    step.done
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : step.active
                      ? 'bg-white text-black shadow-lg'
                      : 'liquid-glass text-white/40'
                  }`}
                >
                  {step.done ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <div>
                  <div className={`text-xs sm:text-sm font-bold ${step.active || step.done ? 'text-white' : 'text-white/40'}`}>{step.title}</div>
                  <div className="text-[10px] sm:text-xs text-white/50">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Full-Width 2-Column Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Reveal Form (lg:col-span-6) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="p-6 sm:p-10 rounded-3xl liquid-glass shadow-2xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-400">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">Open Sealed Commitment</h2>
                    <div className="text-xs sm:text-sm text-white/60 mt-0.5">Prove your bid on-chain without revealing secret salts beforehand</div>
                  </div>
                </div>

                {!connected ? (
                  <div className="text-center py-10">
                    <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">Wallet Required</h3>
                    <p className="text-xs sm:text-sm text-white/60 max-w-xs mx-auto mb-6">
                      Connect your wallet to supply your private witness to the Compact reveal circuit.
                    </p>
                    <button onClick={connect} disabled={connecting} className="px-7 py-3.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm shadow-xl transition cursor-pointer">
                      Connect Lace Wallet
                    </button>
                  </div>
                ) : !selectedAuction.userHasBid ? (
                  <div className="text-center py-10">
                    <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">No Commitment Found</h3>
                    <p className="text-xs sm:text-sm text-white/60 max-w-xs mx-auto mb-6">
                      You did not submit a sealed bid for this auction during the commitment window.
                    </p>
                  </div>
                ) : selectedAuction.userHasRevealed ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-400 mb-2">Bid Successfully Opened & Verified!</h3>
                    <p className="text-xs sm:text-sm text-white/60 max-w-sm mx-auto">
                      Your bid of <strong>{selectedAuction.userBidAmount?.toLocaleString()} DUST</strong> has been validated by the Compact zero-knowledge circuit.
                    </p>
                  </div>
                ) : selectedAuction.phase !== 'reveal' ? (
                  <div className="text-center py-10">
                    <Clock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-amber-400 mb-2">
                      {selectedAuction.phase === 'bidding' ? 'Reveal Phase Not Open Yet' : 'Auction Already Finalized'}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 max-w-xs mx-auto">
                      {selectedAuction.phase === 'bidding'
                        ? 'The bidding window is active. Once bidding closes, the reveal window will open.'
                        : 'This auction has concluded and results are recorded in the ledger.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReveal} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs sm:text-sm font-bold text-white">Original Bid Amount (DUST)</label>
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 1450"
                        className="w-full liquid-input font-semibold text-base"
                        required
                      />
                      <div className="text-xs text-white/50">Must exactly match your initial sealed amount.</div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <label className="font-bold text-white">Secret Salt / Nonce</label>
                        {selectedAuction.userNonce && (
                          <span className="text-xs font-bold text-cyan-400">● Autofilled from session</span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type={showNonce ? 'text' : 'password'}
                          value={nonce}
                          onChange={(e) => setNonce(e.target.value)}
                          placeholder="Enter secret salt"
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
                    </div>

                    <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/30 text-xs sm:text-sm flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 font-bold text-cyan-400">
                        <Shield className="w-4 h-4" />
                        <span>On-Chain Verification Circuit</span>
                      </div>
                      <p className="text-white/60 leading-relaxed text-xs">
                        The smart contract computes <code className="text-cyan-300">persistentHash([bid, nonce])</code> and asserts strict equality with your committed on-chain hash.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !amount || !nonce}
                      className="w-full py-4 rounded-full bg-white hover:bg-white/90 text-black font-bold text-sm shadow-2xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{loading ? 'Submitting ZK Reveal Proof...' : 'Reveal & Verify Bid'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column: Leaderboard & Controls (lg:col-span-6) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              {/* Revealed Leaderboard Card */}
              <div className="p-6 sm:p-10 rounded-3xl liquid-glass shadow-2xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">Revealed Leaderboard</h2>
                    <div className="text-xs text-white/60 mt-0.5">
                      {revealedBids.length} of {selectedAuction.bidCount} bids opened
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5">
                  {revealedBids.map((b, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center p-4 sm:p-5 rounded-2xl border ${
                        idx === 0
                          ? 'bg-gradient-to-r from-amber-950/40 to-black/60 border-amber-500/50 shadow-xl'
                          : 'bg-black/60 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center ${
                            idx === 0 ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/70'
                          }`}
                        >
                          {idx === 0 ? '👑' : `#${idx + 1}`}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-white">{b.bidder}</div>
                          <div className="text-[11px] text-emerald-400 font-semibold">Verified On-Chain</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-extrabold text-sm sm:text-base ${idx === 0 ? 'text-amber-400' : 'text-white'}`}>
                          {b.revealedAmount?.toLocaleString()} DUST
                        </div>
                        <div className="text-[10px] text-white/40">Valid Reveal</div>
                      </div>
                    </div>
                  ))}

                  {/* Sealed Bids Pending */}
                  {sealedBids.map((b, idx) => (
                    <div key={`sealed-${idx}`} className="flex justify-between items-center p-4 rounded-2xl bg-black/40 border border-dashed border-white/15 text-xs sm:text-sm">
                      <div className="flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-white/40" />
                        <div>
                          <div className="font-semibold text-white/70">{b.bidder}</div>
                          <code className="text-xs font-mono text-white/40">{b.commitment.slice(0, 18)}...</code>
                        </div>
                      </div>
                      <div className="text-xs text-white/40 font-semibold">🔒 Awaiting Reveal</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Actions */}
              <div className="p-6 rounded-3xl liquid-glass flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Finalization Controls</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={determineWinner}
                    disabled={selectedAuction.phase !== 'reveal' || loading}
                    className="p-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs sm:text-sm font-bold transition cursor-pointer disabled:opacity-40"
                  >
                    Determine Winner
                  </button>
                  <button
                    onClick={finalizeAuction}
                    disabled={loading}
                    className="p-4 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold transition cursor-pointer disabled:opacity-40"
                  >
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
