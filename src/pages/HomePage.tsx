import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  ArrowRight,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuction } from '../context/AuctionContext';

const gradientStyle: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  filter: 'url(#c3-noise)',
};

export default function HomePage() {
  const { connected, connect, connecting } = useWallet();
  const { auctions, selectedAuction, computeCommitmentHash } = useAuction();
  const [bidAmount, setBidAmount] = useState('');
  const [nonce, setNonce] = useState('');
  const [commitment, setCommitment] = useState<string | null>(null);
  const [commitmentError, setCommitmentError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    let active = true;
    if (!bidAmount || !nonce) { setCommitment(null); return; }
    computeCommitmentHash(Number(bidAmount), nonce)
      .then((hash) => { if (active) { setCommitment(hash); setCommitmentError(null); } })
      .catch((error: unknown) => { if (active) { setCommitment(null); setCommitmentError(error instanceof Error ? error.message : String(error)); } });
    return () => { active = false; };
  }, [bidAmount, nonce, computeCommitmentHash]);

  const generateNonce = () => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    setNonce(Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join(''));
  };
  const handleCopyHash = async () => {
    if (!commitment) return;
    await navigator.clipboard.writeText(commitment);
    setCopiedHash(true);
    window.setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen w-full max-w-full overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="pt-8 sm:pt-12 md:pt-20 pb-16 text-center flex flex-col items-center w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 max-w-full overflow-x-hidden">
        
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-xs text-white/80 font-medium mb-6 sm:mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Midnight Preprod</span>
          <span className="px-2 py-0.5 rounded-full border border-white/10 text-white/50 text-[10px]">Compact contract</span>
        </motion.div>

        {/* Shiny Gradient Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] max-w-full break-words"
        >
          <span>Your bids.</span>
          <br />
          <span className="animate-shiny inline-block mt-2" style={gradientStyle}>
            Revitalized
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 sm:mt-8 text-white/60 max-w-xl text-base sm:text-lg leading-[1.6]"
        >
          Submit bid commitments to a Midnight Compact contract. Bid amounts stay private until bidders reveal them.
        </motion.p>

        {/* Apple Style Pill CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          {connected ? (
            <Link
              to="/auction"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-semibold text-sm px-7 py-4 transition-all hover:bg-white/90 active:scale-[0.98] shadow-2xl w-full sm:w-auto"
            >
              <span>Explore Live Auctions</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <button
              onClick={() => void connect()}
              disabled={connecting}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-semibold text-sm px-7 py-4 transition-all hover:bg-white/90 active:scale-[0.98] shadow-2xl cursor-pointer disabled:opacity-50 w-full sm:w-auto"
            >
              <Shield className="w-4 h-4 text-black" />
              <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}

          <Link
            to="/how-it-works"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 text-white text-sm font-medium px-7 py-4 hover:bg-white/5 transition w-full sm:w-auto"
          >
            <span>ZK Architecture</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/60" />
          </Link>
        </motion.div>

        <div className="mt-4 text-xs text-white/40">Powered by Midnight Blockchain & Compact ZK Engine</div>

        <div className="w-full mt-12 rounded-3xl liquid-glass p-5 text-sm text-white/70">
          {auctions.length ? <span>Connected contract: <code className="font-mono text-cyan-300">{selectedAuction.contractAddress}</code></span> : <span>No shared auction contract is configured yet.</span>}
        </div>

      </section>

      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#0e1014]/90 p-6 sm:p-10 shadow-2xl">
          <div className="mb-7"><h2 className="text-2xl font-bold text-white">Commitment hash</h2><p className="mt-2 text-sm text-white/60">Compute the Compact contract hash locally. Keep the bid and nonce private; you will need both to reveal.</p></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-semibold text-white/70">Bid amount (DUST)<input type="number" min="1" step="1" value={bidAmount} onChange={(event) => setBidAmount(event.target.value)} className="mt-2 w-full liquid-input" /></label>
            <label className="text-xs font-semibold text-white/70">Secret nonce<input type="text" value={nonce} onChange={(event) => setNonce(event.target.value)} className="mt-2 w-full liquid-input font-mono" /></label>
          </div>
          <button type="button" onClick={generateNonce} className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold text-white hover:bg-white/20">Generate secure 32-byte nonce</button>
          {commitmentError && <p role="alert" className="mt-4 text-sm text-rose-300">{commitmentError}</p>}
          <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-black/50 p-4">
            <div className="mb-3 flex items-center justify-between text-xs"><span className="font-bold text-cyan-300">Compact persistentHash</span><button type="button" onClick={() => void handleCopyHash()} disabled={!commitment} className="text-white/60 hover:text-white disabled:opacity-30">{copiedHash ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div>
            <code className="block break-all font-mono text-xs text-cyan-200">{commitment ?? 'Enter an amount and nonce to compute the commitment.'}</code>
          </div>
          <p className="mt-4 text-xs text-amber-200/80">Save the nonce securely. The application cannot recover it if it is lost.</p>
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-20">
        <div className="liquid-glass relative overflow-hidden rounded-3xl p-12 sm:p-20 text-center">
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(600px_circle_at_50%_0%,rgba(255,255,255,0.15),transparent_70%)]" />
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.02] text-white">
            Run a sealed auction. <br />
            <span className="text-white/60">Keep bids private.</span>
          </h2>
          <p className="mt-6 text-white/60 max-w-lg mx-auto text-sm sm:text-base leading-[1.6]">
            Connect to the shared auction contract on Midnight Preprod and submit a private bid.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link
              to="/auction"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-semibold text-sm px-8 py-4 hover:bg-white/90 transition shadow-2xl"
            >
              <span>Explore Auctions</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/how-it-works"
              className="rounded-full border border-white/15 text-white text-sm font-medium px-8 py-4 hover:bg-white/5 transition"
            >
              Learn ZK Tech
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
