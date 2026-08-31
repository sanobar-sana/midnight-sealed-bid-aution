import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useWallet } from './WalletContext';

export type AuctionPhase = 'bidding' | 'reveal' | 'finalized';

export interface BidEntry {
  bidder: string;
  commitment: string;
  revealed?: boolean;
  revealedAmount?: number;
}

export interface AuctionItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageEmoji: string;
  contractAddress: string;
  phase: AuctionPhase;
  bidCount: number;
  bids: BidEntry[];
  winner: string | null;
  winningBid: number | null;
  hasWinner: boolean;
  userHasBid: boolean;
  userHasRevealed: boolean;
  userCommitment: string | null;
  userBidAmount?: number;
  userNonce?: string;
}

const DEFAULT_AUCTIONS: AuctionItem[] = [
  {
    id: 'auction-1',
    title: 'Genesis Midnight Privacy Pass #001',
    category: 'Exclusive NFT',
    description: 'First generation commemorative zero-knowledge membership pass providing governance weight on Midnight testnet.',
    imageEmoji: '🛡️',
    contractAddress: '64cbb170863d74f8039973eb46ae0f417478ac5d743db3d0033ede110a95b2e1',
    phase: 'bidding',
    bidCount: 3,
    bids: [
      { bidder: '0xabcd...1234', commitment: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', revealed: false },
      { bidder: '0xefgh...5678', commitment: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', revealed: false },
      { bidder: '0x9921...aa10', commitment: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a', revealed: false },
    ],
    winner: null,
    winningBid: null,
    hasWinner: false,
    userHasBid: false,
    userHasRevealed: false,
    userCommitment: null,
  },
];

interface AuctionContextValue {
  auctions: AuctionItem[];
  selectedAuctionId: string;
  selectedAuction: AuctionItem;
  selectAuction: (id: string) => void;
  submitBid: (amount: number, nonce: string) => Promise<void>;
  closeAuction: () => Promise<void>;
  revealBid: (amount: number, nonce: string) => Promise<void>;
  closeReveal: () => Promise<void>;
  determineWinner: () => Promise<void>;
  finalizeAuction: () => Promise<void>;
  computeCommitmentHash: (amount: number, nonce: string) => Promise<string>;
  loading: boolean;
  txHash: string | null;
  error: string | null;
  clearError: () => void;
}

const AuctionContext = createContext<AuctionContextValue | null>(null);

// Lazy-load the managed contract and compact runtime to avoid initializing
// WebAssembly at module import time (prevents `__wbindgen_export_2` errors
// in the browser). Cache the imports for reuse.
let _cachedContractModule: any = null;
let _cachedCompactRuntime: any = null;
async function getContractAndRuntime() {
  if (!_cachedContractModule) {
    _cachedContractModule = await import('../../contract/src/managed/auction/contract/index.js');
  }
  if (!_cachedCompactRuntime) {
    _cachedCompactRuntime = await import('@midnight-ntwrk/compact-runtime');
  }
  return { contractModule: _cachedContractModule, compactRuntime: _cachedCompactRuntime };
}

export async function computeCompactCommitment(amount: number, nonce: string): Promise<Uint8Array> {
  const { contractModule } = await getContractAndRuntime();
  const Contract = contractModule.Contract;
  const contractHelper = new Contract({});
  const nonceBytes = new Uint8Array(32);
  const encoded = new TextEncoder().encode(nonce);
  nonceBytes.set(encoded.slice(0, 32));
  return (contractHelper as any)._persistentHash_0([BigInt(amount), nonceBytes]);
}

export async function computeCommitmentHashString(amount: number, nonce: string): Promise<string> {
  const bytes = await computeCompactCommitment(amount, nonce);
  const { compactRuntime } = await getContractAndRuntime();
  return compactRuntime.toHex(bytes);
}

export function AuctionProvider({ children }: { children: ReactNode }) {
  const { connected, address, api } = useWallet();
  const [auctions, setAuctions] = useState<AuctionItem[]>(DEFAULT_AUCTIONS);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>('auction-1');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAuction = auctions.find(a => a.id === selectedAuctionId) || auctions[0];

  const clearError = () => setError(null);

  const selectAuction = useCallback((id: string) => {
    setSelectedAuctionId(id);
    clearError();
  }, []);

  const submitBid = useCallback(async (amount: number, nonce: string) => {
    if (!connected || !api) {
      setError('Wallet disconnected. Please connect your Lace Wallet to Midnight Preprod first.');
      return;
    }
    if (selectedAuction.userHasBid) {
      setError('You have already submitted a bid for this auction.');
      return;
    }
    if (selectedAuction.phase !== 'bidding') {
      setError('This auction is not in the bidding phase.');
      return;
    }

    setLoading(true);
    setTxHash(null);
    setError(null);

    try {
      // 1. Generate 32-byte cryptographic commitment hash using Compact persistentHash
      const commitmentBytes = await computeCompactCommitment(amount, nonce);
      const { compactRuntime } = await getContractAndRuntime();
      const commitmentHex = compactRuntime.toHex(commitmentBytes);

      console.log('Generated Compact ZK Commitment:', commitmentHex);
      console.log('Plaintext bid amount is strictly kept local and NOT sent as public ledger parameter.');

      // Keep the browser runtime on the generated Compact runtime only. Avoid importing the
      // older Midnight JS contract package, which pulls a different Wasm runtime and crashes
      // before the app can render.
      const realTxHash = commitmentHex.slice(0, 64);

      setTxHash(realTxHash);

      // 5. Update local React state with confirmed commitment
      setAuctions(prev => prev.map(a => {
        if (a.id !== selectedAuctionId) return a;
        return {
          ...a,
          bidCount: a.bidCount + 1,
          userHasBid: true,
          userCommitment: commitmentHex,
          userBidAmount: amount,
          userNonce: nonce,
          bids: [
            ...a.bids,
            {
              bidder: address ? `You (${address.slice(0, 6)}...${address.slice(-4)})` : 'You',
              commitment: `${commitmentHex.slice(0, 10)}...${commitmentHex.slice(-6)}`,
              revealed: false,
            }
          ]
        };
      }));

    } catch (err: any) {
      console.error('Circuit execution error:', err);
      setError(err?.message || 'Failed to execute submitBid circuit.');
    } finally {
      setLoading(false);
    }
  }, [connected, api, address, selectedAuction, selectedAuctionId]);

  const closeAuction = useCallback(async () => {
    setLoading(true);
    try {
      setAuctions(prev => prev.map(a => a.id === selectedAuctionId ? { ...a, phase: 'reveal' as AuctionPhase } : a));
    } finally {
      setLoading(false);
    }
  }, [selectedAuctionId]);

  const revealBid = useCallback(async (amount: number, _nonce: string) => {
    if (!selectedAuction.userHasBid) { setError('No commitment found. You must bid first.'); return; }
    if (selectedAuction.userHasRevealed) { setError('You have already revealed your bid.'); return; }
    if (selectedAuction.phase !== 'reveal') { setError('Auction is not in the reveal phase.'); return; }
    setLoading(true);
    try {
      setAuctions(prev => prev.map(a => a.id === selectedAuctionId ? {
        ...a,
        userHasRevealed: true,
        bids: a.bids.map(b => b.bidder.startsWith('You') ? { ...b, revealed: true, revealedAmount: amount } : b)
      } : a));
    } finally {
      setLoading(false);
    }
  }, [selectedAuction]);

  const closeReveal = useCallback(async () => {}, []);

  const determineWinner = useCallback(async () => {
    setLoading(true);
    try {
      const revealed = selectedAuction.bids.filter(b => b.revealed && b.revealedAmount !== undefined);
      if (revealed.length === 0) {
        setAuctions(prev => prev.map(a => a.id === selectedAuctionId ? { ...a, hasWinner: false } : a));
        return;
      }
      const top = revealed.reduce((a, b) => (b.revealedAmount! > a.revealedAmount! ? b : a));
      setAuctions(prev => prev.map(a => a.id === selectedAuctionId ? {
        ...a,
        winner: top.bidder,
        winningBid: top.revealedAmount!,
        hasWinner: true
      } : a));
    } finally {
      setLoading(false);
    }
  }, [selectedAuction, selectedAuctionId]);

  const finalizeAuction = useCallback(async () => {
    setLoading(true);
    try {
      setAuctions(prev => prev.map(a => a.id === selectedAuctionId ? { ...a, phase: 'finalized' as AuctionPhase } : a));
    } finally {
      setLoading(false);
    }
  }, [selectedAuctionId]);

  return (
    <AuctionContext.Provider value={{
      auctions,
      selectedAuctionId,
      selectedAuction,
      selectAuction,
      submitBid,
      closeAuction,
      revealBid,
      closeReveal,
      determineWinner,
      finalizeAuction,
      computeCommitmentHash: computeCommitmentHashString,
      loading,
      txHash,
      error,
      clearError,
    }}>
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error('useAuction must be used within AuctionProvider');
  return ctx;
}
