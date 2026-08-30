// Multi-Auction State & Operations Context
// Simulates live Midnight Compact smart contract interactions

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

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
  {
    id: 'auction-2',
    title: 'ZK Domain Name: privacy.midnight',
    category: 'Digital Identity',
    description: 'Decentralized anonymous identity domain for private messaging and stealth transactions on the Midnight network.',
    imageEmoji: '🌐',
    contractAddress: '782910fae829104b481494d0d1c88017d6bcb40af2b6fa27140a542035fca8e7',
    phase: 'reveal',
    bidCount: 4,
    bids: [
      { bidder: '0x1122...3344', commitment: '7d1a54127b222502f5b79b5fb0803061152a44f92b37e23c65dd0040dc615822', revealed: true, revealedAmount: 850 },
      { bidder: '0x5566...7788', commitment: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', revealed: true, revealedAmount: 1200 },
      { bidder: '0x99aa...bbcc', commitment: '3a52ce780950d4d969792a2559cd519d7ee8c727ea3a3cfac88e4d29d4f2da67', revealed: false },
      { bidder: 'You (0x0042...f1c)', commitment: 'b3f9...e2b1', revealed: false },
    ],
    winner: null,
    winningBid: null,
    hasWinner: false,
    userHasBid: true,
    userHasRevealed: false,
    userCommitment: 'b3f9...e2b1',
    userBidAmount: 1450,
    userNonce: 'a1b2c3d4e5f60718',
  },
  {
    id: 'auction-3',
    title: 'Midnight Private Compute Node Voucher',
    category: 'Infrastructure',
    description: '1-year sponsored zero-knowledge prover service voucher for high-throughput privacy computations.',
    imageEmoji: '⚡',
    contractAddress: '9a017d6bcb40af2b6fa27140a542035fca8e74138ffe47e04d04b481494d0d1c8',
    phase: 'finalized',
    bidCount: 3,
    bids: [
      { bidder: '0x7f88...9a01', commitment: '8f434346648f6b96df89dda901c5176b10e6d0ceec3e1662e008ce5f05244dc7', revealed: true, revealedAmount: 3200 },
      { bidder: '0x3322...1100', commitment: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', revealed: true, revealedAmount: 2800 },
      { bidder: '0x4455...6677', commitment: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', revealed: true, revealedAmount: 1950 },
    ],
    winner: '0x7f88...9a01',
    winningBid: 3200,
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
  loading: boolean;
  txHash: string | null;
  error: string | null;
  clearError: () => void;
}

const AuctionContext = createContext<AuctionContextValue | null>(null);

async function mockHash(amount: number, nonce: string): Promise<string> {
  const data = `${amount}:${nonce}`;
  const encoded = new TextEncoder().encode(data);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuctionProvider({ children }: { children: ReactNode }) {
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

  const simulateTx = async (fn: (current: AuctionItem) => AuctionItem) => {
    setLoading(true);
    setTxHash(null);
    try {
      await new Promise(r => setTimeout(r, 1400));
      setAuctions(prev => prev.map(a => a.id === selectedAuctionId ? fn(a) : a));
      const hash = await mockHash(Date.now(), Math.random().toString());
      setTxHash(hash.slice(0, 64));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const submitBid = useCallback(async (amount: number, nonce: string) => {
    if (selectedAuction.userHasBid) { setError('You have already submitted a bid for this auction.'); return; }
    if (selectedAuction.phase !== 'bidding') { setError('This auction is not in the bidding phase.'); return; }
    const commitment = await mockHash(amount, nonce);
    await simulateTx(curr => ({
      ...curr,
      bidCount: curr.bidCount + 1,
      userHasBid: true,
      userCommitment: commitment.slice(0, 32),
      userBidAmount: amount,
      userNonce: nonce,
      bids: [...curr.bids, { bidder: 'You (0x0042...f1c)', commitment: commitment.slice(0, 10) + '...' + commitment.slice(-6), revealed: false }],
    }));
  }, [selectedAuction]);

  const closeAuction = useCallback(async () => {
    await simulateTx(curr => ({ ...curr, phase: 'reveal' as AuctionPhase }));
  }, []);

  const revealBid = useCallback(async (amount: number, _nonce: string) => {
    if (!selectedAuction.userHasBid) { setError('No commitment found. You must bid in the bidding phase first.'); return; }
    if (selectedAuction.userHasRevealed) { setError('You have already revealed your bid.'); return; }
    if (selectedAuction.phase !== 'reveal') { setError('Auction is not currently in the reveal phase.'); return; }
    
    await simulateTx(curr => ({
      ...curr,
      userHasRevealed: true,
      bids: curr.bids.map(b => b.bidder.startsWith('You') ? { ...b, revealed: true, revealedAmount: amount } : b),
    }));
  }, [selectedAuction]);

  const closeReveal = useCallback(async () => {
    await simulateTx(curr => ({ ...curr }));
  }, []);

  const determineWinner = useCallback(async () => {
    const revealed = selectedAuction.bids.filter(b => b.revealed && b.revealedAmount !== undefined);
    if (revealed.length === 0) {
      await simulateTx(curr => ({ ...curr, hasWinner: false }));
      return;
    }
    const top = revealed.reduce((a, b) => (b.revealedAmount! > a.revealedAmount! ? b : a));
    await simulateTx(curr => ({
      ...curr,
      winner: top.bidder,
      winningBid: top.revealedAmount!,
      hasWinner: true,
    }));
  }, [selectedAuction]);

  const finalizeAuction = useCallback(async () => {
    await simulateTx(curr => ({ ...curr, phase: 'finalized' as AuctionPhase }));
  }, []);

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
