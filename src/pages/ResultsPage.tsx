import { useState } from 'react';
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

  const revealedCount = selectedAuction.bids.filter((b) => b.revealed).length;
  const filteredBids = selectedAuction.bids.filter(
    (b) =>
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
    <div className="pt-28 pb-20 min-h-screen w-full">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* Active Auction Selector Strip */}
          <div className="p-5 rounded-3xl liquid-glass mb-8 flex flex-wrap items-center gap-4">
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
              className="p-8 sm:p-14 rounded-3xl liquid-glass border border-amber-500/40 text-center shadow-2xl mb-8 relative overflow-hidden w-full"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold mb-6">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Verified On-Chain Winner</span>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-5xl sm:text-6xl">{selectedAuction.imageEmoji}</span>
                <div className="text-left">
                  <h1 className="text-2xl sm:text-5xl font-extrabold text-white">{selectedAuction.title}</h1>
                  <div className="text-xs sm:text-sm text-white/60 mt-1">Finalized Auction Result</div>
                </div>
              </div>

              <div className="my-8">
                <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white/50 mb-2">Winning Sealed Bid</div>
                <div className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight">
                  {selectedAuction.winningBid?.toLocaleString()} <span className="text-3xl sm:text-5xl text-amber-400">DUST</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-3 p-4 px-6 rounded-2xl bg-black/60 border border-white/10 text-xs sm:text-sm max-w-full">
                <span className="text-white/60">Winning Bidder:</span>
                <code className="font-mono text-cyan-300 font-bold text-xs sm:text-sm">{selectedAuction.winner}</code>
                <button onClick={handleCopyWinner} className="text-white/60 hover:text-white transition cursor-pointer">
                  {copiedWinner ? <Check className="w-4.5 h-4.5 text-emerald-400" /> : <Copy className="w-4.5 h-4.5" />}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 mt-8 text-xs sm:text-sm text-white/60">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Determined deterministically via zero-knowledge circuit verification</span>
              </div>
            </motion.div>
          ) : selectedAuction.phase !== 'finalized' ? (
            <div className="p-10 sm:p-16 rounded-3xl liquid-glass text-center mb-8 w-full">
              <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Results Pending Finalization</h2>
              <p className="text-xs sm:text-base text-white/60 max-w-lg mx-auto mb-6">
                This auction is currently in the <strong>{selectedAuction.phase}</strong> phase. Bids are still sealed or being revealed. The official winning outcome will unlock once finalized.
              </p>
              <a
                href="/reveal"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm shadow-xl transition"
              >
                Go to Reveal Phase
              </a>
            </div>
          ) : (
            <div className="p-10 rounded-3xl liquid-glass text-center mb-8 w-full">
              <Award className="w-14 h-14 text-white/40 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white mb-1">No Valid Bids Revealed</h2>
              <p className="text-xs sm:text-sm text-white/60">The auction closed without any valid opened commitments.</p>
            </div>
          )}

          {/* Full-Width Stats Breakdown Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="p-5 sm:p-6 rounded-3xl liquid-glass">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Commitments</div>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">{selectedAuction.bidCount} Bids</div>
            </div>
            <div className="p-5 sm:p-6 rounded-3xl liquid-glass">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Revealed Rate</div>
              <div className="text-xl sm:text-2xl font-extrabold text-cyan-400 mt-1.5">
                {Math.round((revealedCount / (selectedAuction.bidCount || 1)) * 100)}%
              </div>
            </div>
            <div className="p-5 sm:p-6 rounded-3xl liquid-glass">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Top Revealed Bid</div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1.5">
                {selectedAuction.winningBid ? `${selectedAuction.winningBid.toLocaleString()} DUST` : 'Pending'}
              </div>
            </div>
            <div className="p-5 sm:p-6 rounded-3xl liquid-glass">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Circuit Verification</div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1.5">100% On-Chain</div>
            </div>
          </div>

          {/* Full-Width On-Chain Ledger & Proof Table */}
          <div className="rounded-3xl liquid-glass overflow-hidden shadow-2xl w-full">
            <div className="p-6 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base sm:text-lg font-bold text-white">On-Chain Ledger & Proof Records</h3>
              </div>

              {/* Search */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 w-full sm:w-80">
                <Search className="w-4 h-4 text-white/40 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter by bidder or hash..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-transparent border-none text-xs sm:text-sm text-white placeholder-white/40 outline-none w-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-black/50 text-white/50 text-xs font-bold uppercase tracking-wider border-b border-white/10">
                    <th className="py-4 px-6">Rank</th>
                    <th className="py-4 px-6">Bidder Public Key</th>
                    <th className="py-4 px-6">Commitment Hash</th>
                    <th className="py-4 px-6">Revealed Amount</th>
                    <th className="py-4 px-6">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredBids.map((b, i) => {
                    const isWinner = b.bidder === selectedAuction.winner;
                    return (
                      <tr key={i} className={`transition ${isWinner ? 'bg-amber-950/30' : 'hover:bg-white/5'}`}>
                        <td className="py-4 px-6 font-bold">
                          {isWinner ? (
                            <span className="text-amber-400 font-extrabold text-sm sm:text-base">👑 1</span>
                          ) : b.revealed ? (
                            <span className="text-white/60">#{i + 1}</span>
                          ) : (
                            <span className="text-white/30">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span>{b.bidder}</span>
                            {isWinner && (
                              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase">
                                Winner
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-white/60">
                          {b.commitment.slice(0, 22)}...{b.commitment.slice(-8)}
                        </td>
                        <td className="py-4 px-6 font-bold">
                          {b.revealed && b.revealedAmount !== undefined ? (
                            <span className={isWinner ? 'text-amber-400 text-sm sm:text-base' : 'text-white'}>
                              {b.revealedAmount.toLocaleString()} DUST
                            </span>
                          ) : (
                            <span className="text-white/40 font-normal">🔒 Sealed / Hidden</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {isWinner ? (
                            <span className="px-3 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/40 text-xs font-bold">
                              🏆 Declared Winner
                            </span>
                          ) : b.revealed ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-semibold">
                              ✓ Valid Bid
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full liquid-glass text-cyan-300 text-xs font-semibold">
                              🔒 Sealed
                            </span>
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
