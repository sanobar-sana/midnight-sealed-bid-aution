// Simulated Lace Wallet / Midnight wallet context
// In production, this would integrate with @midnight-ntwrk/midnight-js-browser-wallet-api

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface WalletState {
  connected: boolean;
  address: string | null;
  balance: string | null;
  network: string | null;
  connecting: boolean;
}

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const MOCK_ADDRESS = '0042ab7f3c9d1e5b8a4c2d6e0f9a3b5d7c1e4f8a2b6d9e3c5f0a4b8d2e6f1c';
const MOCK_BALANCE = '1,250.00 DUST';
const MOCK_NETWORK = 'Midnight Testnet Preview';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    balance: null,
    network: null,
    connecting: false,
  });

  const connect = useCallback(async () => {
    setState(s => ({ ...s, connecting: true }));
    // Simulate wallet handshake delay
    await new Promise(r => setTimeout(r, 1500));
    setState({
      connected: true,
      address: MOCK_ADDRESS,
      balance: MOCK_BALANCE,
      network: MOCK_NETWORK,
      connecting: false,
    });
  }, []);

  const disconnect = useCallback(() => {
    setState({
      connected: false,
      address: null,
      balance: null,
      network: null,
      connecting: false,
    });
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
