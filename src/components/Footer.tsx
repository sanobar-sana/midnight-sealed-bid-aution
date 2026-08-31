import { ArrowUp, Shield, ExternalLink, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const wordmarkStyle: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  filter: 'url(#c3-noise)',
};

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-white/10 bg-[#0c0c0c]/90 text-white/60 pt-16 pb-0 relative overflow-hidden max-w-full">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 max-w-full">
        
        {/* Compact Top Row: 4 Link Groups + Back to Top */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/10 w-full">
          
          {/* Group 1: Protocol */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wide">
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span>MidnightBid</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs">
              Privacy-preserving sealed-bid auctions engineered on Midnight zero-knowledge blockchain architecture.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a href="https://midnight.network" target="_blank" rel="noreferrer" className="text-white/50 hover:text-white transition" title="Midnight Network">
                <Globe className="w-4 h-4" />
              </a>
              <a href="https://github.com/sanobar-sana/midnight-sealed-bid-aution" target="_blank" rel="noreferrer" className="text-white/50 hover:text-cyan-400 transition" title="GitHub Repository">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Group 2: Quick Links */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Pages</span>
            <Link to="/" className="text-xs text-white/50 hover:text-white transition">Overview</Link>
            <Link to="/auction" className="text-xs text-white/50 hover:text-white transition">Live Auctions</Link>
            <Link to="/reveal" className="text-xs text-white/50 hover:text-white transition">Reveal Bids</Link>
            <Link to="/results" className="text-xs text-white/50 hover:text-white transition">Results Ledger</Link>
          </div>

          {/* Group 3: Architecture & Docs */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Resources</span>
            <Link to="/how-it-works" className="text-xs text-white/50 hover:text-white transition">ZK Architecture</Link>
            <a href="https://midnight.network/developers" target="_blank" rel="noreferrer" className="text-xs text-white/50 hover:text-white transition flex items-center gap-1">
              Midnight Docs <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a href="https://docs.midnight.network" target="_blank" rel="noreferrer" className="text-xs text-white/50 hover:text-white transition flex items-center gap-1">
              Compact Lang <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

          {/* Group 4: Network & Back to top */}
          <div className="flex flex-col justify-between items-start md:items-end gap-4">
            <div className="flex flex-col md:items-end gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Network Status</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Testnet Preview</span>
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 text-white text-xs font-medium px-4 py-2 hover:bg-white/10 transition cursor-pointer active:scale-[0.98]"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5 text-white/70 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Small Legal Line Above Big Wordmark */}
        <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40 border-b border-white/5 w-full">
          <div>© 2026 MidnightBid · Zero-Knowledge Sealed-Bid Protocol</div>
          <div className="font-mono text-[11px]">Contract: 542035fc...27140a</div>
        </div>

      </div>

      {/* Enormous Clipped Brand Wordmark taking 100% Edge-to-Edge Screen Width */}
      <div className="w-full max-w-full overflow-hidden flex justify-center items-end pt-6 pb-0 -mb-4 sm:-mb-8 pointer-events-none select-none">
        <span
          className="animate-shiny text-[16vw] sm:text-[18vw] font-black tracking-tighter uppercase leading-none whitespace-nowrap opacity-30 inline-block w-full text-center"
          style={wordmarkStyle}
        >
          MIDNIGHT
        </span>
      </div>
    </footer>
  );
}
