import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

export interface WalletState {
  connected: boolean;
  address: string | null;
  coinPublicKey: string | null;
  encryptionPublicKey: string | null;
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
    coinPublicKey: null,
    encryptionPublicKey: null,
    balance: null,
    network: 'Midnight Preprod',
    connecting: false,
    error: null,
    api: null,
  });

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true, error: null }));

    try {
      // 1. Discover real Midnight wallet provider from window.midnight
      if (!window.midnight || Object.keys(window.midnight).length === 0) {
        throw new Error(
          'Midnight Lace Wallet extension not detected. Please install and unlock the Lace Wallet extension for Midnight.'
        );
      }

      const walletProviders = Object.values(window.midnight);
      // Select Lace wallet provider or first available injected provider
      const laceProvider =
        walletProviders.find(
          (w) => w.name?.toLowerCase().includes('lace') || w.rdns?.toLowerCase().includes('lace')
        ) || walletProviders[0];

      if (!laceProvider || typeof laceProvider.connect !== 'function') {
        throw new Error('No valid Midnight wallet provider interface found on window.midnight.');
      }

      // Request genuine connection to Midnight Preprod network
      const connectedApi = await laceProvider.connect('preprod');

      // Retrieve real shielded account address and keys
      const addresses = await connectedApi.getShieldedAddresses();
      let formattedBalance = '0.00 DUST';

      try {
        const dust = await connectedApi.getDustBalance();
        const dustAmount = Number(dust.balance) / 1_000_000;
        formattedBalance = `${dustAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DUST`;
      } catch (e) {
        console.warn('Could not fetch real DUST balance from wallet API:', e);
      }

      localStorage.setItem('midnight_wallet_auto_connect', 'true');
      setState({
        connected: true,
        address: addresses.shieldedAddress,
        coinPublicKey: addresses.shieldedCoinPublicKey,
        encryptionPublicKey: addresses.shieldedEncryptionPublicKey,
        balance: formattedBalance,
        network: 'Midnight Preprod',
        connecting: false,
        error: null,
        api: connectedApi,
      });
    } catch (err: any) {
      console.error('Midnight Wallet connection error:', err);
      localStorage.removeItem('midnight_wallet_auto_connect');
      setState({
        connected: false,
        address: null,
        coinPublicKey: null,
        encryptionPublicKey: null,
        balance: null,
        network: 'Midnight Preprod',
        connecting: false,
        error: err?.message || 'Failed to connect to Midnight Lace Wallet.',
        api: null,
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem('midnight_wallet_auto_connect');
    setState({
      connected: false,
      address: null,
      coinPublicKey: null,
      encryptionPublicKey: null,
      balance: null,
      network: 'Midnight Preprod',
      connecting: false,
      error: null,
      api: null,
    });
  }, []);

  // Auto reconnect on page refresh if previously connected
  useEffect(() => {
    const auto = localStorage.getItem('midnight_wallet_auto_connect');
    if (auto === 'true' && window.midnight && Object.keys(window.midnight).length > 0) {
      connect();
    }
  }, [connect]);

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

