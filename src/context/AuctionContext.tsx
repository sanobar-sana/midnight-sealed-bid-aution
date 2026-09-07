import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useWallet } from './WalletContext';
import {
  CANONICAL_CONTRACT_ADDRESS,
  fetchContractStateFromIndexer,
  computeCompactCommitment,
  computeCommitmentHashString,
  callSubmitBidTx,
  callCloseAuctionTx,
  callRevealBidTx,
  callCloseRevealTx,
  callDetermineWinnerTx,
  callFinalizeAuctionTx,
} from '../services/midnightService';

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

export const INITIAL_AUCTION_CATALOG: AuctionItem[] = [
  {
    id: 'auction-1',
    title: 'Genesis Midnight Privacy Pass #001',
    category: 'Exclusive NFT',
    description: 'First generation commemorative zero-knowledge membership pass providing governance weight on Midnight testnet.',
    imageEmoji: '🛡️',
    contractAddress: CANONICAL_CONTRACT_ADDRESS,
    phase: 'bidding',
    bidCount: 0,
    bids: [],
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
  refreshAuctionState: () => Promise<void>;
  computeCommitmentHash: (amount: number, nonce: string) => Promise<string>;
  loading: boolean;
  txHash: string | null;
  error: string | null;
  clearError: () => void;
  indexerSyncing: boolean;
  lastSyncTime: Date | null;
}

const AuctionContext = createContext<AuctionContextValue | null>(null);

export { computeCompactCommitment, computeCommitmentHashString };

export function AuctionProvider({ children }: { children: ReactNode }) {
  const { connected, address, api } = useWallet();
  const [auctions, setAuctions] = useState<AuctionItem[]>(INITIAL_AUCTION_CATALOG);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>('auction-1');
  const [loading, setLoading] = useState(false);
  const [indexerSyncing, setIndexerSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAuction = auctions.find((a) => a.id === selectedAuctionId) || auctions[0];

  const clearError = () => setError(null);

  const selectAuction = useCallback((id: string) => {
    setSelectedAuctionId(id);
    clearError();
  }, []);

  /**
   * Sync auction state directly from the Midnight GraphQL Indexer
   */
  const refreshAuctionState = useCallback(async () => {
    setIndexerSyncing(true);
    try {
      const liveState = await fetchContractStateFromIndexer(selectedAuction.contractAddress);
      setLastSyncTime(new Date());

      if (liveState) {
        let phase: AuctionPhase = 'bidding';
        if (liveState.isFinalized) {
          phase = 'finalized';
        } else if (!liveState.auctionActive) {
          phase = 'reveal';
        }

        setAuctions((prev) =>
          prev.map((a) => {
            if (a.contractAddress.toLowerCase() !== selectedAuction.contractAddress.toLowerCase()) return a;

            // Check if connected wallet user is among bidders or revealed
            const userShort = address ? `0x${address.slice(0, 4)}...${address.slice(-4)}` : null;
            const userBid = userShort ? liveState.bids.find((b) => b.bidder.toLowerCase() === userShort.toLowerCase()) : null;

            return {
              ...a,
              phase,
              bidCount: liveState.bidCount,
              bids: liveState.bids,
              winner: liveState.winningBidder,
              winningBid: liveState.winningBid,
              hasWinner: liveState.hasWinner,
              userHasBid: a.userHasBid || Boolean(userBid),
              userHasRevealed: a.userHasRevealed || Boolean(userBid?.revealed),
              userCommitment: a.userCommitment || userBid?.commitment || null,
            };
          })
        );
      }
    } catch (err) {
      console.error('Error refreshing auction state from Midnight Indexer:', err);
    } finally {
      setIndexerSyncing(false);
    }
  }, [selectedAuction.contractAddress, address]);

  // Initial fetch and periodic background sync from Midnight indexer
  useEffect(() => {
    refreshAuctionState();
    const interval = setInterval(refreshAuctionState, 15000);
    return () => clearInterval(interval);
  }, [refreshAuctionState]);

  /**
   * Genuine callTx.submitBid() using Midnight connected wallet
   */
  const submitBid = useCallback(
    async (amount: number, nonce: string) => {
      if (!connected || !api || !address) {
        setError('Wallet disconnected. Please connect your Lace Wallet to Midnight Preprod first.');
        return;
      }
      if (selectedAuction.userHasBid) {
        setError('You have already submitted a sealed bid for this auction.');
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
        const commitmentHex = await computeCommitmentHashString(amount, nonce);

        // Execute genuine on-chain circuit call with connected wallet
        const { txHash: confirmedHash } = await callSubmitBidTx(
          api,
          address,
          amount,
          nonce,
          selectedAuction.contractAddress
        );

        setTxHash(confirmedHash);

        // Update local session state
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
                  bidder: `You (${address.slice(0, 6)}...${address.slice(-4)})`,
                  commitment: `${commitmentHex.slice(0, 10)}...${commitmentHex.slice(-6)}`,
                  revealed: false,
                },
              ],
            };
          })
        );

        // Refresh indexer state
        setTimeout(refreshAuctionState, 2500);
      } catch (err: any) {
        console.error('Circuit submitBid execution error:', err);
        setError(err?.message || 'Failed to submit sealed bid transaction.');
      } finally {
        setLoading(false);
      }
    },
    [connected, api, address, selectedAuction, selectedAuctionId, refreshAuctionState]
  );

  /**
   * Genuine callTx.closeAuction()
   */
  const closeAuction = useCallback(async () => {
    if (!connected || !api || !address) {
      setError('Please connect your Lace Wallet to Midnight Preprod.');
      return;
    }
    setLoading(true);
    setTxHash(null);
    setError(null);

    try {
      const { txHash: confirmedHash } = await callCloseAuctionTx(
        api,
        address,
        selectedAuction.contractAddress
      );

      setTxHash(confirmedHash);
      setAuctions((prev) =>
        prev.map((a) => (a.id === selectedAuctionId ? { ...a, phase: 'reveal' as AuctionPhase } : a))
      );
      setTimeout(refreshAuctionState, 2500);
    } catch (err: any) {
      console.error('closeAuction execution error:', err);
      setError(err?.message || 'Failed to close bidding phase on Midnight ledger.');
    } finally {
      setLoading(false);
    }
  }, [connected, api, address, selectedAuction, selectedAuctionId, refreshAuctionState]);

  /**
   * Genuine callTx.revealBid()
   */
  const revealBid = useCallback(
    async (amount: number, nonce: string) => {
      if (!connected || !api || !address) {
        setError('Please connect your Lace Wallet.');
        return;
      }
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
        const { txHash: confirmedHash } = await callRevealBidTx(
          api,
          address,
          amount,
          nonce,
          selectedAuction.contractAddress
        );

        setTxHash(confirmedHash);
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
        setTimeout(refreshAuctionState, 2500);
      } catch (err: any) {
        console.error('revealBid circuit execution error:', err);
        setError(err?.message || 'Failed to execute reveal circuit verification.');
      } finally {
        setLoading(false);
      }
    },
    [connected, api, address, selectedAuction, selectedAuctionId, refreshAuctionState]
  );

  /**
   * Genuine callTx.closeReveal()
   */
  const closeReveal = useCallback(async () => {
    if (!connected || !api || !address) {
      setError('Please connect your Lace Wallet.');
      return;
    }
    setLoading(true);
    setTxHash(null);
    setError(null);

    try {
      const { txHash: confirmedHash } = await callCloseRevealTx(
        api,
        address,
        selectedAuction.contractAddress
      );
      setTxHash(confirmedHash);
      setTimeout(refreshAuctionState, 2500);
    } catch (err: any) {
      console.error('closeReveal execution error:', err);
      setError(err?.message || 'Failed to close reveal phase on Midnight ledger.');
    } finally {
      setLoading(false);
    }
  }, [connected, api, address, selectedAuction, refreshAuctionState]);

  /**
   * Genuine callTx.determineWinner()
   */
  const determineWinner = useCallback(async () => {
    if (!connected || !api || !address) {
      setError('Please connect your Lace Wallet.');
      return;
    }
    setLoading(true);
    setTxHash(null);
    setError(null);

    try {
      const { txHash: confirmedHash } = await callDetermineWinnerTx(
        api,
        address,
        selectedAuction.contractAddress
      );

      setTxHash(confirmedHash);

      const revealed = selectedAuction.bids.filter((b) => b.revealed && b.revealedAmount !== undefined);
      if (revealed.length > 0) {
        const top = revealed.reduce((a, b) => (b.revealedAmount! > a.revealedAmount! ? b : a));
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
      }
      setTimeout(refreshAuctionState, 2500);
    } catch (err: any) {
      console.error('determineWinner execution error:', err);
      setError(err?.message || 'Failed to determine winner via Compact circuit.');
    } finally {
      setLoading(false);
    }
  }, [connected, api, address, selectedAuction, selectedAuctionId, refreshAuctionState]);

  /**
   * Genuine callTx.finalizeAuction()
   */
  const finalizeAuction = useCallback(async () => {
    if (!connected || !api || !address) {
      setError('Please connect your Lace Wallet.');
      return;
    }
    setLoading(true);
    setTxHash(null);
    setError(null);

    try {
      const { txHash: confirmedHash } = await callFinalizeAuctionTx(
        api,
        address,
        selectedAuction.contractAddress
      );

      setTxHash(confirmedHash);
      setAuctions((prev) =>
        prev.map((a) => (a.id === selectedAuctionId ? { ...a, phase: 'finalized' as AuctionPhase } : a))
      );
      setTimeout(refreshAuctionState, 2500);
    } catch (err: any) {
      console.error('finalizeAuction execution error:', err);
      setError(err?.message || 'Failed to finalize auction on Midnight ledger.');
    } finally {
      setLoading(false);
    }
  }, [connected, api, address, selectedAuction, selectedAuctionId, refreshAuctionState]);

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
        refreshAuctionState,
        computeCommitmentHash: computeCommitmentHashString,
        loading,
        txHash,
        error,
        clearError,
        indexerSyncing,
        lastSyncTime,
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
