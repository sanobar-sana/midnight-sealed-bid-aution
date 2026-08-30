import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Zap } from 'lucide-react';

const sections = [
  {
    icon: <Lock size={24} color="#7c3aed" />,
    title: 'What is a Sealed-Bid Auction?',
    content: `In a traditional auction, bids are visible to everyone — meaning bidders can adjust their bids based on what others submit, leading to unfair advantages and collusion. A sealed-bid auction solves this: every participant submits their bid privately, hidden from everyone else, until the reveal phase opens.

On Midnight, this is enforced cryptographically — not just by policy.`,
  },
  {
    icon: <Shield size={24} color="#06b6d4" />,
    title: 'Zero-Knowledge Commitments',
    content: `When you place a bid, your actual amount is never sent to the blockchain. Instead, the Compact contract computes a cryptographic commitment:

commitment = persistentHash([bidAmount, secretNonce])

This 32-byte hash is stored publicly on-chain. It proves you committed to a specific bid without revealing what that bid is. Without knowing both the exact amount AND the nonce, nobody can reverse-engineer your bid.`,
    code: 'commitment = persistentHash([bidAmount, secretNonce])',
  },
  {
    icon: <Eye size={24} color="#10b981" />,
    title: 'The Reveal Phase',
    content: `After bidding closes, each bidder opens their commitment by submitting their original bid amount and nonce to the contract. The contract runs:

persistentHash([submittedAmount, submittedNonce]) == storedCommitment

If they match — your bid is valid and accepted. If they don't match — the transaction is rejected on-chain. This ensures nobody can lie about their bid during the reveal.`,
    code: 'assert persistentHash([bid, nonce]) == bids.lookup(bidder)',
  },
  {
    icon: <Database size={24} color="#f59e0b" />,
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
    icon: <Zap size={24} color="#8b5cf6" />,
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
    <div style={styles.page}>
      <div style={styles.container}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={styles.header}>
            <h1 style={styles.title}>How It Works</h1>
            <p style={styles.subtitle}>A deep dive into zero-knowledge sealed-bid auctions on Midnight.</p>
          </div>

          <div style={styles.sections}>
            {sections.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                style={styles.section}
              >
                <div style={styles.sectionIcon}>{s.icon}</div>
                <div style={styles.sectionBody}>
                  <h2 style={styles.sectionTitle}>{s.title}</h2>
                  <p style={styles.sectionText}>{s.content}</p>
                  {s.code && (
                    <div style={styles.codeBlock}>
                      <code>{s.code}</code>
                    </div>
                  )}
                  {s.steps && (
                    <div style={styles.steps}>
                      {s.steps.map(step => (
                        <div key={step.num} style={styles.step}>
                          <div style={styles.stepNum}>{step.num}</div>
                          <div>
                            <div style={styles.stepTitle}>{step.title}</div>
                            <div style={styles.stepDesc}>{step.desc}</div>
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

const styles: Record<string, React.CSSProperties> = {
  page: { paddingTop: 80, minHeight: '100vh' },
  container: { maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' },
  header: { marginBottom: 48, textAlign: 'center' as const },
  title: { fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#f1f0ff' },
  subtitle: { fontSize: 16, color: '#9490c4', marginTop: 10 },
  sections: { display: 'flex', flexDirection: 'column', gap: 24 },
  section: {
    display: 'flex', gap: 24, alignItems: 'flex-start',
    background: '#0d0d2b', border: '1px solid #1a1a4e', borderRadius: 18, padding: 28,
  },
  sectionIcon: {
    width: 52, height: 52, borderRadius: 14, background: '#050510',
    border: '1px solid #1a1a4e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sectionBody: { flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: '#f1f0ff', marginBottom: 12 },
  sectionText: { fontSize: 14, color: '#9490c4', lineHeight: 1.8, whiteSpace: 'pre-line' as const },
  codeBlock: {
    background: '#050510', border: '1px solid #1a1a4e', borderRadius: 10,
    padding: '12px 16px', marginTop: 16, overflowX: 'auto' as const,
    fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#06b6d4',
  },
  steps: { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 },
  step: { display: 'flex', gap: 16, alignItems: 'flex-start' },
  stepNum: {
    minWidth: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    color: '#fff', fontSize: 13, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepTitle: { fontSize: 15, fontWeight: 600, color: '#f1f0ff', marginBottom: 4 },
  stepDesc: { fontSize: 13, color: '#9490c4', lineHeight: 1.6 },
};
