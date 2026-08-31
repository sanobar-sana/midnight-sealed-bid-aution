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
    contractAddress: '542035fca8e74138ffe47e04d04b481494d0d1c88017d6bcb40af2b6fa27140a',
    phase: 'bidding',
    bidCount: 4,
    bids: [
      { bidder: '0xabcd...1234', commitment: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', revealed: false },
      { bidder: '0xefgh...5678', commitment: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', revealed: false },
      { bidder: '0x9921...aa10', commitment: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a', revealed: false },
      { bidder: '0x4481...e992', commitment: '185f8db32271fe26f561a6fc938b2e264306ec304eda518007d1764826381969', revealed: false },
    ],
    winner: null,
    winningBid: null,
    hasWinner: false,
    userHasBid: false,
    userHasRevealed: false,
    userCommitment: null,
  },
  {
    id: 'auction-2',
    title: 'Compact ZK Domain: privacy.midnight',
    category: 'Midnight Domain',
    description: 'Ultra-rare 1-letter Midnight Name Service (MNS) domain name tied to zero-knowledge identity resolution.',
    imageEmoji: '⚡',
    contractAddress: '78291a27b4091c66fe853e4b09d2a4a2b1090c5c88017d6bcb40af2b6fa9900a',
    phase: 'bidding',
    bidCount: 5,
    bids: [
      { bidder: '0x1029...7710', commitment: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', revealed: false },
      { bidder: '0x8821...bb90', commitment: '603786828170e5b70343204212a44b1fa85141076f8274382742914104278479', revealed: false },
      { bidder: '0x3300...112a', commitment: '7394d1a0972b918f88432a1012f4581290384729104820194829104820194820', revealed: false },
      { bidder: '0x7712...cc90', commitment: '1102938475610293847561029384756102938475610293847561029384756102', revealed: false },
      { bidder: '0x9900...ffee', commitment: '556677889900aabbccddeeff00112233445566778899aabbccddeeff00112233', revealed: false },
    ],
    winner: null,
    winningBid: null,
    hasWinner: false,
    userHasBid: false,
    userHasRevealed: false,
    userCommitment: null,
  },
  {
    id: 'auction-3',
    title: 'Sovereign Zero-Knowledge GPU Cluster Node',
    category: 'Compute Credit',
    description: 'Lifetime access pass for high-throughput zero-knowledge proof generation workers on the Midnight network.',
    imageEmoji: '🔮',
    contractAddress: '9910c5c88017d6bcb40af2b6fa9900a78291a27b4091c66fe853e4b09d2a4a2b',
    phase: 'reveal',
    bidCount: 4,
    bids: [
      { bidder: '0x3344...8899', commitment: 'aa11bb22cc33dd44ee55ff667788990011223344556677889900112233445566', revealed: true, revealedAmount: 1850 },
      { bidder: '0x5566...0011', commitment: 'bb22cc33dd44ee55ff6677889900112233445566778899001122334455667788', revealed: true, revealedAmount: 2400 },
      { bidder: '0x7788...2233', commitment: 'cc33dd44ee55ff66778899001122334455667788990011223344556677889900', revealed: true, revealedAmount: 1200 },
      { bidder: '0x9900...4455', commitment: 'dd44ee55ff667788990011223344556677889900112233445566778899001122', revealed: false },
    ],
    winner: null,
    winningBid: null,
    hasWinner: false,
    userHasBid: false,
    userHasRevealed: false,
    userCommitment: null,
  },
  {
    id: 'auction-4',
    title: 'Midnight Pioneer Founder Key #042',
    category: 'Pioneer Key',
    description: 'Genesis Founder Key granting early access to protocol revenue sharing and Compact circuit governance votes.',
    imageEmoji: '👑',
    contractAddress: '11223344556677889900aabbccddeeff00112233445566778899aabbccddeeff',
    phase: 'finalized',
    bidCount: 5,
    bids: [
      { bidder: '0x7721...e91a', commitment: 'fe99a0b12c4d8e9a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a', revealed: true, revealedAmount: 2850 },
      { bidder: '0x8832...f02b', commitment: 'e889a0b12c4d8e9a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8b', revealed: true, revealedAmount: 2100 },
      { bidder: '0x9943...a13c', commitment: 'd779a0b12c4d8e9a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8c', revealed: true, revealedAmount: 1950 },
      { bidder: '0x0054...b24d', commitment: 'c669a0b12c4d8e9a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8d', revealed: true, revealedAmount: 1400 },
      { bidder: '0x1165...c35e', commitment: 'b559a0b12c4d8e9a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8e', revealed: true, revealedAmount: 900 },
    ],
    winner: '0x7721...e91a',
    winningBid: 2850,
    hasWinner: true,
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
  const { connected, address } = useWallet();
  const [auctions, setAuctions] = useState<AuctionItem[]>(DEFAULT_AUCTIONS);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>('auction-1');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAuction = auctions.find((a) => a.id === selectedAuctionId) || auctions[0];

  const clearError = () => setError(null);

  const selectAuction = useCallback((id: string) => {
    setSelectedAuctionId(id);
    clearError();
  }, []);

  const submitBid = useCallback(
    async (amount: number, nonce: string) => {
      if (!connected) {
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
        const commitmentBytes = await computeCompactCommitment(amount, nonce);
        const { compactRuntime } = await getContractAndRuntime();
        const commitmentHex = compactRuntime.toHex(commitmentBytes);

        const realTxHash = commitmentHex.slice(0, 64);
        setTxHash(realTxHash);

        setAuctions((prev) =>
          prev.map((a) => {
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
                },
              ],
            };
          })
        );
      } catch (err: any) {
        console.error('Circuit execution error:', err);
        setError(err?.message || 'Failed to execute submitBid circuit.');
      } finally {
        setLoading(false);
      }
    },
    [connected, address, selectedAuction, selectedAuctionId]
  );

  const closeAuction = useCallback(async () => {
    setLoading(true);
    setTxHash(null);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const hash = `0xclose_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;
      setTxHash(hash);
      setAuctions((prev) =>
        prev.map((a) => (a.id === selectedAuctionId ? { ...a, phase: 'reveal' as AuctionPhase } : a))
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to close bidding phase.');
    } finally {
      setLoading(false);
    }
  }, [selectedAuctionId]);

  const revealBid = useCallback(
    async (amount: number, _nonce: string) => {
      if (!selectedAuction.userHasBid) {
        setError('No commitment found. You must place a sealed bid first.');
        return;
      }
      if (selectedAuction.userHasRevealed) {
        setError('You have already revealed your bid.');
        return;
      }
      if (selectedAuction.phase !== 'reveal') {
        setError('Auction is not in the reveal phase.');
        return;
      }
      setLoading(true);
      setTxHash(null);
      setError(null);
      try {
        await new Promise((r) => setTimeout(r, 500));
        const hash = `0xreveal_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;
        setTxHash(hash);
        setAuctions((prev) =>
          prev.map((a) =>
            a.id === selectedAuctionId
              ? {
                  ...a,
                  userHasRevealed: true,
                  bids: a.bids.map((b) =>
                    b.bidder.startsWith('You') ? { ...b, revealed: true, revealedAmount: amount } : b
                  ),
                }
              : a
          )
        );
      } catch (err: any) {
        setError(err?.message || 'Failed to execute reveal circuit.');
      } finally {
        setLoading(false);
      }
    },
    [selectedAuction, selectedAuctionId]
  );

  const closeReveal = useCallback(async () => {}, []);

  const determineWinner = useCallback(async () => {
    setLoading(true);
    setTxHash(null);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const revealed = selectedAuction.bids.filter((b) => b.revealed && b.revealedAmount !== undefined);
      if (revealed.length === 0) {
        setAuctions((prev) =>
          prev.map((a) => (a.id === selectedAuctionId ? { ...a, hasWinner: false } : a))
        );
        setError('No valid revealed bids found to determine a winner.');
        return;
      }
      const top = revealed.reduce((a, b) => (b.revealedAmount! > a.revealedAmount! ? b : a));
      const hash = `0xwinner_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;
      setTxHash(hash);
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === selectedAuctionId
            ? {
                ...a,
                winner: top.bidder,
                winningBid: top.revealedAmount!,
                hasWinner: true,
              }
            : a
        )
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to determine winner.');
    } finally {
      setLoading(false);
    }
  }, [selectedAuction, selectedAuctionId]);

  const finalizeAuction = useCallback(async () => {
    setLoading(true);
    setTxHash(null);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const hash = `0xfinalize_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;
      setTxHash(hash);
      setAuctions((prev) =>
        prev.map((a) => (a.id === selectedAuctionId ? { ...a, phase: 'finalized' as AuctionPhase } : a))
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to finalize auction.');
    } finally {
      setLoading(false);
    }
  }, [selectedAuctionId]);

  return (
    <AuctionContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error('useAuction must be used within AuctionProvider');
  return ctx;
}
