import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: string | null;
  network: string | null;
  connecting: boolean;
  error: string | null;
  api: ConnectedAPI | null;
}

export interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

declare global {
  interface Window {
    midnight?: Record<string, InitialAPI>;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    balance: null,
    network: 'Midnight Preprod',
    connecting: false,
    error: null,
    api: null,
  });

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  const connect = useCallback(async () => {
    setState(s => ({ ...s, connecting: true, error: null }));

    try {
      // 1. Discover Midnight wallet provider from window.midnight
      const walletProviders = window.midnight ? Object.values(window.midnight) : [];

      if (walletProviders.length === 0) {
        throw new Error('Lace Wallet extension for Midnight not found. Please install the extension and reload the page.');
      }

      // 2. Select Lace wallet provider or default to first available
      const laceProvider = walletProviders.find(
        w => w.name?.toLowerCase().includes('lace') || w.rdns?.toLowerCase().includes('lace')
      ) || walletProviders[0];

      // 3. Request connection to Midnight Preprod network
      const connectedApi = await laceProvider.connect('preprod');

      // 4. Retrieve real shielded account address and DUST balance
      const addresses = await connectedApi.getShieldedAddresses();
      let formattedBalance = '0.00 DUST';

      try {
        const dust = await connectedApi.getDustBalance();
        const dustAmount = Number(dust.balance) / 1_000_000;
        formattedBalance = `${dustAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DUST`;
      } catch (e) {
        console.warn('Could not fetch balance from wallet API:', e);
      }

      setState({
        connected: true,
        address: addresses.shieldedAddress,
        balance: formattedBalance,
        network: 'Midnight Preprod',
        connecting: false,
        error: null,
        api: connectedApi,
      });
    } catch (err: any) {
      const msg = err?.message || 'Failed to connect to Lace Wallet.';
      console.error('Wallet Connection Error:', err);
      setState(s => ({
        ...s,
        connected: false,
        address: null,
        balance: null,
        connecting: false,
        error: msg,
        api: null,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      connected: false,
      address: null,
      balance: null,
      network: 'Midnight Preprod',
      connecting: false,
      error: null,
      api: null,
    });
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, clearError }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
