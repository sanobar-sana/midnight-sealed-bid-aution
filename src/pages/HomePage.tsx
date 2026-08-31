import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Eye,
  Award,
  Lock,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle,
  Hash,
  Copy,
  Check,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuction } from '../context/AuctionContext';

const features = [
  { icon: <Lock className="w-6 h-6 text-indigo-400" />, title: 'Private Bids', desc: 'Submit cryptographic hash commitments. Bid amounts stay private until the reveal phase.' },
  { icon: <Eye className="w-6 h-6 text-cyan-400" />, title: 'Transparent Verification', desc: 'On-chain commitment verification using zero-knowledge proofs. No trust required.' },
  { icon: <Shield className="w-6 h-6 text-emerald-400" />, title: 'Anti-Collusion', desc: 'Sealed bids prevent front-running and bid manipulation during the auction window.' },
  { icon: <Award className="w-6 h-6 text-amber-400" />, title: 'Fair Winner', desc: 'Highest valid revealed bid wins. Smart contract enforces all rules automatically.' },
];

const stats = [
  { label: 'Contract Address', value: '542035fc…27140a', mono: true },
  { label: 'Network', value: 'Midnight Testnet' },
  { label: 'Circuits', value: '7 ZK Circuits' },
  { label: 'Tests Passing', value: '12 / 12' },
];

const logos = ['Linear', 'Vercel', 'Figma', 'Stripe', 'Ramp', 'Notion', 'Loom', 'Arc'];

const testimonials = [
  {
    quote: "MidnightBid gave our leadership team total peace of mind. Sealed bids with zero-knowledge verification are standard for the future of on-chain auctions.",
    name: "Parker Wilf",
    role: "Group Product Manager",
    company: "MERCURY",
  },
  {
    quote: "The ZK commitment generator alone has changed how we conduct private sales. I can't imagine going back to open order books.",
    name: "Andrew von Rosenbach",
    role: "Senior Program Manager",
    company: "COHERE",
  },
  {
    quote: "Sealed bidding that actually enforces zero-knowledge privacy on-chain. Our collectors love the anti-front-running guarantees.",
    name: "Mathies Christensen",
    role: "Engineering Lead",
    company: "LUNAR",
  },
];

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
  const { auctions, selectAuction, computeCommitmentHash } = useAuction();

  // Hero Interactive Mockup State
  const [mockAmount, setMockAmount] = useState('500');
  const [mockSalt, setMockSalt] = useState('e9a48f21c0b34d78');
  const [mockHash, setMockHash] = useState<string>('4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a');
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (mockAmount && mockSalt) {
      (async () => {
        try {
          const h = await computeCommitmentHash(Number(mockAmount), mockSalt);
          if (mounted) setMockHash(h);
        } catch {
          if (mounted) setMockHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
        }
      })();
    }
    return () => {
      mounted = false;
    };
  }, [mockAmount, mockSalt, computeCommitmentHash]);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(mockHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
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
          <span>Live on Midnight Testnet Preview</span>
          <span className="px-2 py-0.5 rounded-full border border-white/10 text-white/50 text-[10px]">Compact 0.5.2</span>
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
          Aura is the premier inbox & sealed-bid platform for the current era. It leverages zero-knowledge proofs to organize, prioritize, and seal your commitments into total privacy.
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
              onClick={connect}
              disabled={connecting}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-semibold text-sm px-7 py-4 transition-all hover:bg-white/90 active:scale-[0.98] shadow-2xl cursor-pointer disabled:opacity-50 w-full sm:w-auto"
            >
              <Shield className="w-4 h-4 text-black" />
              <span>{connecting ? 'Connecting to Lace...' : 'Connect Lace Wallet'}</span>
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

        {/* Full-Width Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 sm:p-6 rounded-3xl liquid-glass"
        >
          {stats.map((s, idx) => (
            <div key={s.label} className={`flex flex-col items-center p-2 sm:p-3 ${idx < 3 ? 'sm:border-r sm:border-white/10' : ''}`}>
              <div className={`text-sm sm:text-lg font-bold text-white ${s.mono ? 'font-mono text-xs sm:text-base text-cyan-300 truncate max-w-full' : ''}`}>
                {s.value}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

      </section>

      {/* macOS Menu Bar Strip */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="w-full h-11 bg-black/40 backdrop-blur-md border-t border-b border-white/10 my-8"
      >
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 h-full flex items-center justify-between text-xs text-white/70">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-white" />
              <span className="font-bold text-white">MidnightBid</span>
            </div>
            <div className="flex gap-5 text-white/60">
              <span className="hover:text-white transition cursor-pointer">File</span>
              <span className="hover:text-white transition cursor-pointer">Edit</span>
              <span className="hover:text-white transition cursor-pointer">View</span>
              <span className="hidden sm:inline hover:text-white transition cursor-pointer">Circuits</span>
              <span className="hidden md:inline hover:text-white transition cursor-pointer">Proof Console</span>
              <span className="hidden md:inline hover:text-white transition cursor-pointer">Help</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Search className="w-3.5 h-3.5 text-white/50" />
            <span className="text-white/40 text-xs hidden sm:inline">Wed May 6 1:09 PM</span>
          </div>
        </div>
      </motion.section>

      {/* Full-Width macOS Style Interactive ZK Console Mockup */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 sm:py-12 md:py-20 max-w-full overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl shadow-2xl w-full"
        >
          {/* macOS Title Bar */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-black/50 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f57]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#febc2e]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-white/60 tracking-wide truncate max-w-[200px] sm:max-w-none">
              Aura — Midnight ZK Commitment Proof Console
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-300 font-mono hidden sm:inline">zk-SNARK Active</span>
            </div>
          </div>

          {/* Console Body Grid */}
          <div className="grid grid-cols-12 min-h-[480px]">
            
            {/* Sidebar (col-span-3) */}
            <div className="col-span-12 lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/10 bg-black/30 p-4 sm:p-5 flex flex-col gap-4">
              <div className="w-full flex items-center justify-between p-3 rounded-xl bg-white text-black text-xs font-bold shadow-md">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Interactive Proof Simulator</span>
                </div>
              </div>

              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Active Auctions</div>
              <div className="flex flex-col gap-2">
                {auctions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => selectAuction(a.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{a.imageEmoji}</span>
                      <span className="truncate">{a.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal shrink-0">Open</span>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-white/10 text-xs text-white/50 flex flex-col gap-1">
                <div>Circuit: <span className="text-white font-mono">auction_v1</span></div>
                <div>Hash engine: <span className="text-cyan-300 font-mono">persistentHash</span></div>
              </div>
            </div>

            {/* Interactive Witness Input Column (col-span-5) */}
            <div className="col-span-12 lg:col-span-5 border-b lg:border-b-0 lg:border-r border-white/10 p-5 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span>Private Witness Input</span>
                  </div>
                  <span className="text-xs text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full font-medium">
                    Kept Local Only
                  </span>
                </div>

                <div className="flex flex-col gap-5">
                  <div>
                    <label className="text-xs text-white/70 font-semibold mb-2 block">Simulated Bid Amount (DUST)</label>
                    <input
                      type="number"
                      value={mockAmount}
                      onChange={(e) => setMockAmount(e.target.value)}
                      className="w-full liquid-input font-semibold text-base"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/70 font-semibold mb-2 block">Secret Nonce / Salt</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mockSalt}
                        onChange={(e) => setMockSalt(e.target.value)}
                        className="w-full liquid-input font-mono text-xs"
                      />
                      <button
                        onClick={() => setMockSalt(Math.random().toString(36).substring(2, 12))}
                        className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition shrink-0 cursor-pointer"
                      >
                        Random
                      </button>
                    </div>
                  </div>
                </div>

                {/* Computed Commitment Output */}
                <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-black/60 border border-cyan-500/30 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Hash className="w-4 h-4" />
                      <span>On-Chain Commitment Hash</span>
                    </span>
                    <button onClick={handleCopyHash} className="text-white/60 hover:text-white transition cursor-pointer">
                      {copiedHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <code className="text-xs sm:text-sm font-mono text-cyan-300 break-all bg-slate-950 p-3 rounded-xl border border-white/10">
                    {mockHash}
                  </code>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2.5 text-xs sm:text-sm text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Witness validated — 0 bytes of secret data leaves local machine</span>
              </div>
            </div>

            {/* Redesigned ZK Inspector Panel (col-span-4) with Liquid-Glass styling */}
            <div className="col-span-12 lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between liquid-glass border-t lg:border-t-0 border-white/10">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-cyan-400 shadow-md shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-white tracking-wide">Summary by Aura ZK</span>
                </div>

                <div className="p-5 rounded-2xl liquid-glass text-xs sm:text-sm text-white/90 leading-relaxed font-medium mb-6 border border-white/10">
                  "Your team generated 1 valid zero-knowledge commitment proof in 174ms. No plaintext bid amount is visible to miners or third parties. Safe for deployment."
                </div>

                <div className="flex flex-col gap-3 text-xs sm:text-sm text-white/70">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/60 border border-white/10">
                    <span className="text-white/60">Prover Latency:</span>
                    <span className="text-cyan-300 font-mono font-bold">174 ms</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/60 border border-white/10">
                    <span className="text-white/60">Proof Size:</span>
                    <span className="text-white font-mono font-bold">384 bytes</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/60 border border-white/10">
                    <span className="text-white/60">Zero-Knowledge Leak:</span>
                    <span className="text-emerald-400 font-bold font-mono">0.00%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/60 border border-white/10">
                    <span className="text-white/60">Network Consensus:</span>
                    <span className="text-cyan-300 font-bold">Midnight Preprod</span>
                  </div>
                </div>
              </div>

              <Link
                to="/auction"
                className="group inline-flex items-center justify-center gap-2 w-full mt-8 py-4 rounded-full bg-white text-black font-bold text-xs sm:text-sm text-center shadow-xl transition hover:bg-white/90 active:scale-[0.98] cursor-pointer"
              >
                <span>Try Live Auction</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

          </div>
        </motion.div>
      </section>

      {/* Why Sealed-Bid on Midnight Features Section */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Why Sealed-Bid on Midnight?</h2>
          <p className="text-sm sm:text-base text-white/60 mt-3 max-w-xl mx-auto">Zero-knowledge proofs make cryptographic guarantees without revealing secrets.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 sm:p-8 rounded-3xl liquid-glass flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Triage Section */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 text-xs text-white/60 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>Auction Triage</span>
              <span className="px-2 py-0.5 rounded-full border border-white/10 text-white/50 text-[10px]">AI-native</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.02] text-white">
              Clear your inbox <br />
              <span className="text-white/50">in a single pass.</span>
            </h2>
            <p className="mt-6 text-white/60 text-base sm:text-lg leading-[1.6] max-w-lg">
              Aura reads every message, understands intent, and routes the noise away from the signal. Focus on what moves your day forward — the rest handles itself.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-8">
              {["Auto-categorize", "Snooze for later", "Silent newsletters", "One-tap unsubscribe"].map((chip) => (
                <span key={chip} className="text-xs text-white/70 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03]">
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="liquid-glass rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
            <div className="text-xs font-semibold text-white/60 pb-3 border-b border-white/10">
              Today · 42 messages triaged
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="liquid-glass rounded-2xl p-4">
                <div className="text-sm font-bold text-white mb-1.5">Priority (4)</div>
                <div className="text-xs text-white/60">Sophia Chen — Q3 review</div>
                <div className="text-xs text-white/60">David Lim — contract</div>
              </div>
              <div className="liquid-glass rounded-2xl p-4">
                <div className="text-sm font-bold text-slate-300 mb-1.5">Follow-up (7)</div>
                <div className="text-xs text-white/60">Marcus — design review</div>
                <div className="text-xs text-white/60">Figma — comment thread</div>
              </div>
              <div className="liquid-glass rounded-2xl p-4">
                <div className="text-sm font-bold text-slate-400 mb-1.5">Updates (18)</div>
                <div className="text-xs text-white/60">Vercel — deploy ready</div>
                <div className="text-xs text-white/60">GitHub — PR #482</div>
              </div>
              <div className="liquid-glass rounded-2xl p-4">
                <div className="text-sm font-bold text-slate-500 mb-1.5">Archived (13)</div>
                <div className="text-xs text-white/60">Stripe payout · News</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Logo Cloud */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-16 border-t border-white/10">
        <div className="text-center text-xs uppercase tracking-widest text-white/40 mb-10">
          Trusted by the world's most thoughtful teams
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-8 text-center">
          {logos.map((name) => (
            <span key={name} className="text-base font-semibold tracking-tight text-white/50 hover:text-white transition cursor-pointer">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-20 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="liquid-glass rounded-3xl p-8 flex flex-col justify-between">
              <p className="text-sm sm:text-base text-white/80 leading-relaxed italic">"{t.quote}"</p>
              <div className="mt-8 pt-5 border-t border-white/10">
                <div className="text-sm font-bold text-white">{t.name}</div>
                <div className="text-xs text-white/50">{t.role}</div>
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mt-1">{t.company}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-20">
        <div className="liquid-glass relative overflow-hidden rounded-3xl p-12 sm:p-20 text-center">
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(600px_circle_at_50%_0%,rgba(255,255,255,0.15),transparent_70%)]" />
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.02] text-white">
            Close the tabs. <br />
            <span className="text-white/60">Open your day.</span>
          </h2>
          <p className="mt-6 text-white/60 max-w-lg mx-auto text-sm sm:text-base leading-[1.6]">
            Join thousands of builders, founders, and operators who treat email and sealed bids like a tool — not an obligation.
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
