import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { findDeployedContract, deployContract } from '@midnight-ntwrk/midnight-js/contracts';
import { Contract, ledger } from '../../contract/src/managed/auction/contract/index.js';
import { Contract as ContractV8, ledger as ledgerV8 } from '../contract/auction-v8';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { toHex } from '@midnight-ntwrk/compact-runtime';
import { useWallet } from './WalletContext';
import { createAuctionProviders } from '../chain/providers';
import { AUCTION_CONTRACT_ADDRESS, AUCTION_CONTRACT_ERA } from '../chain/config';

export type AuctionPhase = 'bidding' | 'reveal' | 'settlement' | 'finalized';
export interface BidEntry { bidder: string; commitment: string; revealed?: boolean; revealedAmount?: number }
export interface AuctionItem {
  id: string; title: string; category: string; description: string; imageEmoji: string;
  contractAddress: string; phase: AuctionPhase; bidCount: number; bids: BidEntry[];
  winner: string | null; winningBid: number | null; hasWinner: boolean; winnerDetermined: boolean;
  userHasBid: boolean; userHasRevealed: boolean; userCommitment: string | null;
  userBidAmount?: number; userNonce?: string; creator: string; isCreator: boolean;
}
type TxStatus = 'idle' | 'submitting' | 'submitted' | 'confirmed';
interface AuctionContextValue {
  auctions: AuctionItem[]; selectedAuctionId: string; selectedAuction: AuctionItem;
  selectAuction: (id: string) => void; createAuction: (name: string) => Promise<void>;
  submitBid: (amount: number, nonce: string) => Promise<void>;
  closeAuction: () => Promise<void>; revealBid: (amount: number, nonce: string) => Promise<void>;
  closeReveal: () => Promise<void>; determineWinner: () => Promise<void>; finalizeAuction: () => Promise<void>;
  computeCommitmentHash: (amount: number, nonce: string) => Promise<string>;
  loading: boolean; txHash: string | null; txStatus: TxStatus; error: string | null; clearError: () => void;
}
const AuctionContext = createContext<AuctionContextValue | null>(null);
const EMPTY_AUCTION: AuctionItem = {
  id: '', title: 'No shared auction', category: 'Midnight Compact contract',
  description: 'Connect a Midnight wallet to load the shared auction contract state.',
  imageEmoji: '🔐', contractAddress: '', phase: 'bidding', bidCount: 0, bids: [], winner: null,
  winningBid: null, hasWinner: false, winnerDetermined: false, userHasBid: false, userHasRevealed: false, userCommitment: null, creator: '', isCreator: false,
};
const contractInstance = new Contract({});
const compiledContract = CompiledContract.make('SealedBidAuction', Contract as unknown as typeof Contract<undefined>)
  .pipe(CompiledContract.withVacantWitnesses, CompiledContract.withCompiledFileAssets('/contract/auction'));
const retainedContract = new ContractV8({});
const contractAddress = AUCTION_CONTRACT_ADDRESS.trim().replace(/^0x/, '').toLowerCase();
const nonceToBytes = (nonce: string) => {
  const cleaned = nonce.startsWith('0x') ? nonce.slice(2) : nonce;
  if (/^[0-9a-fA-F]{64}$/.test(cleaned)) return Uint8Array.from(cleaned.match(/.{2}/g)!, (byte) => Number.parseInt(byte, 16));
  const encoded = new TextEncoder().encode(nonce);
  if (encoded.length > 32) throw new Error('Nonce must be at most 32 UTF-8 bytes, or exactly 32 bytes of hex.');
  const result = new Uint8Array(32); result.set(encoded); return result;
};
const idToBytes = (id: string) => Uint8Array.from(id.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
const toFixedName = (name: string) => {
  const encoded = new TextEncoder().encode(name.trim());
  if (!encoded.length || encoded.length > 64) throw new Error('Auction name must be between 1 and 64 UTF-8 bytes.');
  const padded = new Uint8Array(64); padded.set(encoded); return padded;
};
const decodeName = (value: Uint8Array) => new TextDecoder().decode(value).replace(/\0+$/, '') || 'Untitled auction';
type PendingTransaction = { id: string; accountId: string; submittedAt: number; kind: string; auctionId: string | null };

async function saveTransactionHistory(record: PendingTransaction) {
  const key = 'midnight_transaction_history_queue';
  let queue: PendingTransaction[] = [];
  try { queue = JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { /* reset malformed local queue */ }
  if (!queue.some((entry) => entry.id === record.id)) queue.push(record);
  localStorage.setItem(key, JSON.stringify(queue));
  const remaining: PendingTransaction[] = [];
  for (const entry of queue) {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId: entry.id, kind: entry.kind, auctionId: entry.auctionId }),
      });
      if (!response.ok) remaining.push(entry);
    } catch { remaining.push(entry); }
  }
  localStorage.setItem(key, JSON.stringify(remaining));
}

export async function computeCompactCommitment(amount: number, nonce: string): Promise<Uint8Array> {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error('Bid must be a non-negative integer.');
  return (contractInstance as any)._persistentHash_0([BigInt(amount), nonceToBytes(nonce)]);
}
export async function computeCommitmentHashString(amount: number, nonce: string): Promise<string> {
  return toHex(await computeCompactCommitment(amount, nonce));
}

declare global { interface Window { midnightAuction?: { deploy: () => Promise<string> } } }

export function AuctionProvider({ children }: { children: ReactNode }) {
  const { connected, address, api, refreshBalance } = useWallet();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const session = useRef<Awaited<ReturnType<typeof createAuctionProviders>> | null>(null);
  const contract = useRef<any>(null);
  const resumingTx = useRef<string | null>(null);
  const txMetadata = useRef<{ kind: string; auctionId: string | null }>({ kind: 'createAuction', auctionId: null });
  const clearError = useCallback(() => setError(null), []);
  const selectedAuction = useMemo(() => auctions.find((item) => item.id === selectedAuctionId) ?? auctions[0] ?? EMPTY_AUCTION, [auctions, selectedAuctionId]);

  const onTransactionSubmitted = useCallback((id: string) => {
    setTxHash(id);
    setTxStatus('submitted');
    const record: PendingTransaction = { id, accountId: address ?? '', submittedAt: Date.now(), ...txMetadata.current };
    localStorage.setItem('midnight_pending_transaction', JSON.stringify(record));
  }, [address]);

  const ensureProvider = useCallback(async (forDeployment = false) => {
    if (!connected || !api || !address) throw new Error('Connect a Midnight wallet first.');
    const configuredEra = forDeployment ? undefined : AUCTION_CONTRACT_ERA ?? undefined;
    if (!forDeployment && contractAddress && !configuredEra) {
      throw new Error('Set VITE_AUCTION_CONTRACT_ERA to ledger8 or ledger9 alongside the shared contract address. Contract era is fixed when it is deployed.');
    }
    if (!session.current || (forDeployment && session.current.ledgerEra !== session.current.chainEra) || (!forDeployment && session.current.ledgerEra !== configuredEra)) {
      session.current = await createAuctionProviders(api, address, onTransactionSubmitted, configuredEra);
    }
    return session.current;
  }, [connected, api, address, onTransactionSubmitted]);

  useEffect(() => {
    contract.current = null;
    session.current = null;
  }, [api, address]);

  const hydrateAuctions = useCallback(async (state: any) => {
    const data = (session.current?.ledgerEra === 'ledger8' ? ledgerV8 : ledger)(state.data);
    const privateState = await session.current!.providers.privateStateProvider;
    privateState.setContractAddress(contractAddress);
    const savedBids = (await privateState.get('sealedAuctionBids') as Record<string, { amount: number; nonce: string; commitment: string }> | null) ?? {};
    const entries: AuctionItem[] = Array.from(data.auctionCreators, ([idBytes, creatorBytes]) => {
      const id = toHex(idBytes).toLowerCase();
      const bidRows: BidEntry[] = Array.from(data.bids).flatMap(([bidId, commitment]) => {
        if (toHex(data.bidAuctionIds.lookup(bidId)).toLowerCase() !== id) return [];
        const revealed = data.revealedBids.member(bidId);
        return [{
          bidder: toHex(data.bidders.lookup(bidId)), commitment: toHex(commitment), revealed,
          revealedAmount: revealed ? Number(data.revealedBids.lookup(bidId)) : undefined,
        }];
      });
      const saved = savedBids[id];
      const ownBid = saved && bidRows.find((bid) => bid.commitment === saved.commitment);
      const active = data.auctionActive.lookup(idBytes);
      const revealOpen = data.revealActive.lookup(idBytes);
      const finalized = data.isFinalized.lookup(idBytes);
      const winnerExists = data.hasWinner.lookup(idBytes);
      return {
        ...EMPTY_AUCTION,
        id,
        title: decodeName(data.auctionNames.lookup(idBytes)),
        description: 'Auction state read from the shared Midnight Preprod contract.',
        contractAddress,
        creator: toHex(creatorBytes),
        isCreator: toHex(creatorBytes).toLowerCase() === session.current!.shieldedCoinPublicKey,
        phase: finalized ? 'finalized' : active ? 'bidding' : revealOpen ? 'reveal' : 'settlement',
        bidCount: bidRows.length,
        bids: bidRows,
        hasWinner: winnerExists,
        winnerDetermined: data.winnerDetermined.lookup(idBytes),
        winner: winnerExists ? toHex(data.winningBidders.lookup(idBytes)) : null,
        winningBid: winnerExists ? Number(data.winningBids.lookup(idBytes)) : null,
        userHasBid: !!ownBid,
        userHasRevealed: !!ownBid?.revealed,
        userCommitment: ownBid?.commitment ?? null,
        userBidAmount: saved?.amount,
        userNonce: saved?.nonce,
      };
    });
    setAuctions(entries);
    if (!entries.some((item) => item.id === selectedAuctionId)) setSelectedAuctionId(entries[0]?.id ?? '');
  }, [selectedAuctionId]);

  const refresh = useCallback(async () => {
    if (!contractAddress) { setAuctions([]); return; }
    const bundle = await ensureProvider();
    if (!contract.current) {
      contract.current = bundle.ledgerEra === 'ledger8'
        ? await findDeployedContract(bundle.providers as any, { compiledContract: retainedContract, contractAddress } as any)
        : await findDeployedContract(bundle.providers as any, { compiledContract, contractAddress });
    }
    const state = await bundle.publicDataProvider.queryContractState(contractAddress);
    if (!state) throw new Error(`Shared auction contract ${contractAddress} was not found by the connected wallet's indexer.`);
    await hydrateAuctions(state);
  }, [contractAddress, ensureProvider, hydrateAuctions]);

  useEffect(() => {
    if (!contractAddress || !connected) { setAuctions([]); return; }
    let stopped = false;
    let subscription: { unsubscribe: () => void } | undefined;
    let retryTimer = 0;
    let refreshTimer = 0;
    const connectIndexer = async () => {
      try {
        const bundle = await ensureProvider();
        await refresh();
        if (stopped) return;
        subscription = bundle.publicDataProvider.contractStateObservable(contractAddress, { type: 'latest' }).subscribe({
          next: (state) => { void hydrateAuctions(state).catch((cause) => setError(cause instanceof Error ? cause.message : String(cause))); },
          error: (cause) => {
            if (stopped) return;
            setError(cause instanceof Error ? `Indexer stream interrupted; reconnecting: ${cause.message}` : 'Indexer stream interrupted; reconnecting.');
            retryTimer = window.setTimeout(() => { void connectIndexer(); }, 5_000);
          },
          complete: () => {
            if (!stopped) retryTimer = window.setTimeout(() => { void connectIndexer(); }, 5_000);
          },
        });
        refreshTimer = window.setInterval(() => { void refresh().catch((cause) => setError(cause instanceof Error ? cause.message : String(cause))); }, 30_000);
      } catch (cause) {
        if (!stopped) {
          setError(cause instanceof Error ? cause.message : String(cause));
          retryTimer = window.setTimeout(() => { void connectIndexer(); }, 5_000);
        }
      }
    };
    void connectIndexer();
    return () => {
      stopped = true;
      subscription?.unsubscribe();
      window.clearTimeout(retryTimer);
      window.clearInterval(refreshTimer);
    };
  }, [contractAddress, connected, ensureProvider, hydrateAuctions, refresh]);

  useEffect(() => {
    if (!connected || !address) return;
    let active = true;
    let retryTimer = 0;
    const resume = () => {
      const pending = localStorage.getItem('midnight_pending_transaction');
      if (!pending) return;
      try {
        const record = JSON.parse(pending) as PendingTransaction;
        if (!record.id || record.accountId !== address || resumingTx.current === record.id) return;
      resumingTx.current = record.id;
      setTxHash(record.id);
      setTxStatus('submitted');
      void ensureProvider().then(({ publicDataProvider }) => publicDataProvider.watchForTxData(record.id)).then(() => {
        if (!active) return;
        localStorage.removeItem('midnight_pending_transaction');
        setTxStatus('confirmed');
        void saveTransactionHistory(record);
        void refresh();
      }).catch(() => {
        if (active) {
          setError('Still waiting for the submitted transaction to be indexed. Tracking will retry automatically.');
          retryTimer = window.setTimeout(() => { retryTimer = 0; resumingTx.current = null; resume(); }, 5_000);
        }
      }).finally(() => { if (!retryTimer) resumingTx.current = null; });
      } catch { localStorage.removeItem('midnight_pending_transaction'); }
    };
    const onResumeRequest = () => resume();
    window.addEventListener('midnight-resume-transaction', onResumeRequest);
    resume();
    return () => { active = false; window.clearTimeout(retryTimer); window.removeEventListener('midnight-resume-transaction', onResumeRequest); };
  }, [connected, address, ensureProvider, refresh]);

  useEffect(() => {
    const flush = () => {
      let queue: PendingTransaction[] = [];
      try { queue = JSON.parse(localStorage.getItem('midnight_transaction_history_queue') ?? '[]'); } catch { return; }
      for (const record of queue) void saveTransactionHistory(record);
    };
    window.addEventListener('midnight-authenticated', flush);
    window.addEventListener('online', flush);
    flush();
    return () => {
      window.removeEventListener('midnight-authenticated', flush);
      window.removeEventListener('online', flush);
    };
  }, []);

  const runTx = useCallback(async (name: string, args: unknown[], scoped = true) => {
    setLoading(true); setTxHash(null); setTxStatus('submitting'); setError(null);
    txMetadata.current = { kind: name, auctionId: scoped ? selectedAuction.id : null };
    try {
      if (!contractAddress) throw new Error('No shared auction contract address is configured in src/chain/config.ts.');
      await ensureProvider();
      if (!contract.current) await refresh();
      const callArgs = scoped ? [idToBytes(selectedAuction.id), ...args] : args;
      const data = await contract.current.callTx[name](...callArgs);
      setTxHash(data.public.txId);
      setTxStatus('submitted');
      const pendingRecord = JSON.parse(localStorage.getItem('midnight_pending_transaction') ?? 'null') as PendingTransaction | null;
      const record: PendingTransaction = pendingRecord && pendingRecord.id === data.public.txId ? pendingRecord : {
        id: data.public.txId, accountId: address ?? '', submittedAt: Date.now(), ...txMetadata.current,
      };
      localStorage.setItem('midnight_pending_transaction', JSON.stringify(record));
      await session.current!.publicDataProvider.watchForTxData(data.public.txId);
      localStorage.removeItem('midnight_pending_transaction');
      setTxStatus('confirmed');
      await saveTransactionHistory(record);
      await refresh();
      await refreshBalance();
      return true;
    } catch (cause) {
      const pending = localStorage.getItem('midnight_pending_transaction');
      if (pending) {
        setTxStatus('submitted');
        window.dispatchEvent(new Event('midnight-resume-transaction'));
      } else setTxStatus('idle');
      setError(cause instanceof Error ? cause.message : String(cause));
      return false;
    } finally { setLoading(false); }
  }, [address, contractAddress, ensureProvider, refresh, refreshBalance, selectedAuction.id]);

  const createAuction = useCallback(async (name: string) => {
    const id = crypto.getRandomValues(new Uint8Array(32));
    const idHex = toHex(id).toLowerCase();
    const ok = await runTx('createAuction', [id, toFixedName(name)], false);
    if (ok) setSelectedAuctionId(idHex);
  }, [runTx]);

  const submitBid = useCallback(async (amount: number, nonce: string) => {
    if (!Number.isSafeInteger(amount) || amount <= 0) { setError('Bid must be a positive integer number of DUST.'); return; }
    try {
      const commitment = await computeCompactCommitment(amount, nonce);
      const commitmentHex = toHex(commitment);
      const bundle = await ensureProvider();
      bundle.providers.privateStateProvider.setContractAddress(contractAddress);
      const saved = (await bundle.providers.privateStateProvider.get('sealedAuctionBids') as Record<string, { amount: number; nonce: string; commitment: string }> | null) ?? {};
      await bundle.providers.privateStateProvider.set('sealedAuctionBids', { ...saved, [selectedAuction.id]: { amount, nonce, commitment: commitmentHex } });
      await runTx('submitBid', [commitment]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
  }, [runTx, ensureProvider, selectedAuction.id]);

  const revealBid = useCallback(async (amount: number, nonce: string) => { await runTx('revealBid', [BigInt(amount), nonceToBytes(nonce)]); }, [runTx]);
  const action = useCallback((name: string) => async () => { await runTx(name, []); }, [runTx]);
  const deploy = useCallback(async () => {
    if (!connected || !api || !address) throw new Error('Connect a Midnight wallet before deploying.');
    setLoading(true); setError(null); setTxHash(null); setTxStatus('submitting');
    try {
      const bundle = await ensureProvider(true);
      const deployed = bundle.ledgerEra === 'ledger8'
        ? await deployContract(bundle.providers as any, { compiledContract: retainedContract } as any) as any
        : await deployContract(bundle.providers as any, { compiledContract }) as any;
      const deployedAddress: string = deployed.contractAddress;
      const deployTxId: string | undefined = deployed.deployTxData?.public?.txId;
      localStorage.removeItem('midnight_pending_transaction');
      if (deployTxId) setTxHash(deployTxId);
      setTxStatus('confirmed');
      contract.current = deployed;
      localStorage.setItem('midnight_shared_auction_deployment', JSON.stringify({ address: deployedAddress, ledgerEra: bundle.ledgerEra }));
      setAuctions([]);
      console.info(`Shared auction deployed in ${bundle.ledgerEra}. Add VITE_AUCTION_CONTRACT_ADDRESS=${deployedAddress} and VITE_AUCTION_CONTRACT_ERA=${bundle.ledgerEra} to the Vercel project and redeploy the frontend.`);
      return deployedAddress;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      throw cause;
    } finally { setLoading(false); }
  }, [connected, api, address, ensureProvider]);

  useEffect(() => {
    window.midnightAuction = { deploy: async () => {
      try { const result = await deploy(); console.info('Shared auction contract deployed:', result); return result; }
      catch (cause) { const message = cause instanceof Error ? cause.message : String(cause); setError(message); throw cause; }
    } };
    return () => { delete window.midnightAuction; };
  }, [deploy]);

  const selectAuction = useCallback((id: string) => { setSelectedAuctionId(id); setError(null); }, []);
  return <AuctionContext.Provider value={{
    auctions, selectedAuctionId, selectedAuction, selectAuction, createAuction,
    submitBid, closeAuction: action('closeAuction'), revealBid, closeReveal: action('closeReveal'),
    determineWinner: action('determineWinner'), finalizeAuction: action('finalizeAuction'),
    computeCommitmentHash: computeCommitmentHashString, loading, txHash, txStatus, error, clearError,
  }}>{children}</AuctionContext.Provider>;
}
export function useAuction() {
  const context = useContext(AuctionContext);
  if (!context) throw new Error('useAuction must be used within AuctionProvider');
  return context;
}
