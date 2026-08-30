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
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
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
        </AuctionProvider>
      </WalletProvider>
    </BrowserRouter>
  );
}
