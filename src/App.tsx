import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { AuctionProvider } from './context/AuctionContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuctionPage from './pages/AuctionPage';
import RevealPage from './pages/RevealPage';
import ResultsPage from './pages/ResultsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <AuctionProvider>
          <div className="relative w-full max-w-full min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white selection:bg-indigo-500/30 selection:text-white">
            
            {/* SVG Noise Filter */}
            <svg className="pointer-events-none absolute w-0 h-0 overflow-hidden" aria-hidden="true">
              <defs>
                <filter id="c3-noise">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
                  <feComposite in2="SourceGraphic" operator="in" result="noise" />
                  <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
                </filter>
              </defs>
            </svg>

            {/* Global background video (fixed, behind everything) */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-30 w-full h-full max-w-full overflow-hidden">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover pointer-events-none"
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c]/80 via-[#0c0c0c]/60 to-[#0c0c0c]" />
            </div>

            {/* Main Application Routes */}
            <div className="relative z-10 flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
              <Navbar />
              <main className="flex-1 w-full max-w-full overflow-x-hidden">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auction" element={<AuctionPage />} />
                  <Route path="/reveal" element={<RevealPage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                </Routes>
              </main>
              <Footer />
            </div>

          </div>
        </AuctionProvider>
      </WalletProvider>
    </BrowserRouter>
  );
}
