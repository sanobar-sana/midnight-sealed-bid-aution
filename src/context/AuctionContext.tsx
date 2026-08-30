// Simulated Auction contract state & actions
// In production, connect to the compiled Compact contract via @midnight-ntwrk/compact-runtime

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type AuctionPhase = 'bidding' | 'reveal' | 'finalized';

export interface BidEntry {
  bidder: string;
  commitment: string;
  revealed?: boolean;
  revealedAmount?: number;
}

export interface AuctionState {
  phase: AuctionPhase;
  bidCount: number;
  bids: BidEntry[];
  winner: string | null;
  winningBid: number | null;
  hasWinner: boolean;
  contractAddress: string;
  userHasBid: boolean;
  userHasRevealed: boolean;
  userCommitment: string | null;
}

interface AuctionContextValue extends AuctionState {
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

const CONTRACT_ADDRESS = '542035fca8e74138ffe47e04d04b481494d0d1c88017d6bcb40af2b6fa27140a';

// Simple mock hash for demo
async function mockHash(amount: number, nonce: string): Promise<string> {
  const data = `${amount}:${nonce}`;
  const encoded = new TextEncoder().encode(data);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuctionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuctionState>({
    phase: 'bidding',
    bidCount: 2,
    bids: [
      { bidder: '0xabcd...1234', commitment: 'a3f9...e2b1', revealed: false },
      { bidder: '0xefgh...5678', commitment: 'b7c4...d8a2', revealed: false },
    ],
    winner: null,
    winningBid: null,
    hasWinner: false,
    contractAddress: CONTRACT_ADDRESS,
    userHasBid: false,
    userHasRevealed: false,
    userCommitment: null,
  });

  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const simulateTx = async (fn: () => void) => {
    setLoading(true);
    setTxHash(null);
    try {
      await new Promise(r => setTimeout(r, 1800));
      fn();
      const hash = await mockHash(Date.now(), Math.random().toString());
      setTxHash(hash.slice(0, 64));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const submitBid = useCallback(async (amount: number, nonce: string) => {
    if (state.userHasBid) { setError('You have already submitted a bid.'); return; }
    if (state.phase !== 'bidding') { setError('Auction is not in bidding phase.'); return; }
    const commitment = await mockHash(amount, nonce);
    await simulateTx(() => {
      setState(s => ({
        ...s,
        bidCount: s.bidCount + 1,
        userHasBid: true,
        userCommitment: commitment.slice(0, 32),
        bids: [...s.bids, { bidder: 'You (0x0042...f1c)', commitment: commitment.slice(0, 8) + '...' + commitment.slice(-4), revealed: false }],
      }));
    });
  }, [state.userHasBid, state.phase]);

  const closeAuction = useCallback(async () => {
    await simulateTx(() => setState(s => ({ ...s, phase: 'reveal' as AuctionPhase })));
  }, []);

  const revealBid = useCallback(async (amount: number, nonce: string) => {
    if (!state.userHasBid) { setError('No commitment found. You must bid first.'); return; }
    if (state.userHasRevealed) { setError('You have already revealed your bid.'); return; }
    if (state.phase !== 'reveal') { setError('Auction is not in reveal phase.'); return; }
    const expectedHash = await mockHash(amount, nonce);
    if (!state.userCommitment || !expectedHash.startsWith(state.userCommitment.slice(0, 8))) {
      setError('Invalid reveal: bid + nonce does not match your commitment.');
      return;
    }
    await simulateTx(() => {
      setState(s => ({
        ...s,
        userHasRevealed: true,
        bids: s.bids.map((b, i) =>
          i === s.bids.length - 1 ? { ...b, revealed: true, revealedAmount: amount } : b
        ),
      }));
    });
  }, [state.userHasBid, state.userHasRevealed, state.phase, state.userCommitment]);

  const closeReveal = useCallback(async () => {
    await simulateTx(() => setState(s => ({ ...s })));
  }, []);

  const determineWinner = useCallback(async () => {
    const revealed = state.bids.filter(b => b.revealed && b.revealedAmount !== undefined);
    if (revealed.length === 0) {
      await simulateTx(() => setState(s => ({ ...s, hasWinner: false })));
      return;
    }
    const top = revealed.reduce((a, b) => (b.revealedAmount! > a.revealedAmount! ? b : a));
    await simulateTx(() => setState(s => ({
      ...s,
      winner: top.bidder,
      winningBid: top.revealedAmount!,
      hasWinner: true,
    })));
  }, [state.bids]);

  const finalizeAuction = useCallback(async () => {
    await simulateTx(() => setState(s => ({ ...s, phase: 'finalized' as AuctionPhase })));
  }, []);

  return (
    <AuctionContext.Provider value={{ ...state, submitBid, closeAuction, revealBid, closeReveal, determineWinner, finalizeAuction, loading, txHash, error, clearError }}>
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error('useAuction must be used within AuctionProvider');
  return ctx;
}
