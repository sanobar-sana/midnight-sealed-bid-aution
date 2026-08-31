import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Zap } from 'lucide-react';

const sections = [
  {
    icon: <Lock className="w-6 h-6 text-indigo-400" />,
    title: 'What is a Sealed-Bid Auction?',
    content: `In a traditional auction, bids are visible to everyone — meaning bidders can adjust their bids based on what others submit, leading to unfair advantages and collusion. A sealed-bid auction solves this: every participant submits their bid privately, hidden from everyone else, until the reveal phase opens.

On Midnight, this is enforced cryptographically — not just by policy.`,
  },
  {
    icon: <Shield className="w-6 h-6 text-cyan-400" />,
    title: 'Zero-Knowledge Commitments',
    content: `When you place a bid, your actual amount is never sent to the blockchain. Instead, the Compact contract computes a cryptographic commitment:

commitment = persistentHash([bidAmount, secretNonce])

This 32-byte hash is stored publicly on-chain. It proves you committed to a specific bid without revealing what that bid is. Without knowing both the exact amount AND the nonce, nobody can reverse-engineer your bid.`,
    code: 'commitment = persistentHash([bidAmount, secretNonce])',
  },
  {
    icon: <Eye className="w-6 h-6 text-emerald-400" />,
    title: 'The Reveal Phase',
    content: `After bidding closes, each bidder opens their commitment by submitting their original bid amount and nonce to the contract. The contract runs:

persistentHash([submittedAmount, submittedNonce]) == storedCommitment

If they match — your bid is valid and accepted. If they don't match — the transaction is rejected on-chain. This ensures nobody can lie about their bid during the reveal.`,
    code: 'assert persistentHash([bid, nonce]) == bids.lookup(bidder)',
  },
  {
    icon: <Database className="w-6 h-6 text-amber-400" />,
    title: 'Public State vs. Private Witness',
    content: `Midnight contracts bifurcate data into two realms:

PUBLIC LEDGER STATE (visible to everyone on-chain):
• bids: Map<Bytes<32>, Bytes<32>> — commitments per bidder
• revealedBids: Map<Bytes<32>, Uint<64>> — amounts after reveal  
• Phase flags: auctionActive, revealActive, isFinalized
• winningBid, winningBidder

PRIVATE WITNESS STATE (stays on your device):
• Your actual bid amount before reveal
• Your secret nonce / salt
• ZK proof computation happens locally — private data never leaves your machine`,
  },
  {
    icon: <Zap className="w-6 h-6 text-purple-400" />,
    title: 'How to Participate',
    steps: [
      { num: '1', title: 'Connect Lace Wallet', desc: 'Install the Lace wallet browser extension and connect to Midnight Testnet Preview.' },
      { num: '2', title: 'Generate a Secret Nonce', desc: 'Use the built-in nonce generator to create a random 32-byte secret. Save it securely.' },
      { num: '3', title: 'Submit Your Sealed Bid', desc: 'Enter your bid amount and nonce. The app computes persistentHash([amount, nonce]) and submits the commitment on-chain.' },
      { num: '4', title: 'Wait for Reveal Phase', desc: 'Once the auction owner closes bidding, the reveal phase opens. Return to the Reveal page.' },
      { num: '5', title: 'Reveal Your Bid', desc: 'Submit your original amount and nonce. The contract verifies the hash matches on-chain.' },
      { num: '6', title: 'Check the Winner', desc: 'After the reveal phase closes and the winner is determined, view the results in the Results tab.' },
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen w-full">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-6xl font-extrabold text-white tracking-tight">How It Works</h1>
            <p className="text-base sm:text-lg text-white/60 mt-3 max-w-xl mx-auto">A deep dive into zero-knowledge sealed-bid auctions on Midnight.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sections.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className={`flex flex-col sm:flex-row gap-6 items-start p-6 sm:p-10 rounded-3xl liquid-glass ${i === sections.length - 1 ? 'lg:col-span-2' : ''}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{s.title}</h2>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed whitespace-pre-line">{s.content}</p>

                  {s.code && (
                    <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs sm:text-sm text-cyan-300 mt-5 overflow-x-auto">
                      <code>{s.code}</code>
                    </div>
                  )}

                  {s.steps && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      {s.steps.map((step) => (
                        <div key={step.num} className="flex gap-4 items-start p-4 rounded-2xl bg-black/40 border border-white/10">
                          <div className="w-9 h-9 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                            {step.num}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white mb-1">{step.title}</div>
                            <div className="text-xs text-white/60 leading-relaxed">{step.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
