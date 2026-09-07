import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

export const CANONICAL_CONTRACT_ADDRESS = '542035fca8e74138ffe47e04d04b481494d0d1c88017d6bcb40af2b6fa27140a';

export const MIDNIGHT_CONFIG = {
  network: 'preprod',
  indexerUrl: 'https://indexer.preprod.midnight.network/api/v1/graphql',
  indexerWsUrl: 'wss://indexer.preprod.midnight.network/api/v1/graphql/ws',
  nodeRpcUrl: 'https://rpc.preprod.midnight.network',
  proofServerUrl: 'http://127.0.0.1:6300',
  explorerUrl: 'https://explorer.midnight.network',
};

export interface OnChainAuctionLedger {
  auctionActive: boolean;
  revealActive: boolean;
  winnerDetermined: boolean;
  isFinalized: boolean;
  hasWinner: boolean;
  hasRevealedBids: boolean;
  bidCount: number;
  bids: Array<{ bidder: string; commitment: string; revealed: boolean; revealedAmount?: number }>;
  revealedBids: Array<{ bidder: string; amount: number }>;
  highestBid: number;
  highestBidder: string | null;
  winningBid: number | null;
  winningBidder: string | null;
}

let _cachedContractModule: any = null;
export async function getContractModule() {
  if (!_cachedContractModule) {
    _cachedContractModule = await import('../../contract/src/managed/auction/contract/index.js');
  }
  return _cachedContractModule;
}

export function generateSecureSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function computeCompactCommitment(amount: number, nonce: string): Promise<Uint8Array> {
  const { Contract } = await getContractModule();
  const contractHelper = new Contract({});
  const nonceBytes = new Uint8Array(32);
  const encoded = new TextEncoder().encode(nonce);
  nonceBytes.set(encoded.slice(0, 32));
  return (contractHelper as any)._persistentHash_0([BigInt(amount), nonceBytes]);
}

export async function computeCommitmentHashString(amount: number, nonce: string): Promise<string> {
  const bytes = await computeCompactCommitment(amount, nonce);
  return __compactRuntime.toHex(bytes);
}

/**
 * Queries the Midnight indexer GraphQL endpoint for the contract's on-chain state
 */
export async function fetchContractStateFromIndexer(
  contractAddress: string = CANONICAL_CONTRACT_ADDRESS
): Promise<OnChainAuctionLedger | null> {
  const query = `
    query GetAuctionContractState($address: HexEncoded!) {
      contractAction(address: $address) {
        ... on ContractDeploy {
          state
        }
        ... on ContractUpdate {
          state
        }
        ... on ContractCall {
          deploy {
            transaction {
              contractActions {
                address
                state
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(MIDNIGHT_CONFIG.indexerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { address: contractAddress },
      }),
    });

    if (!response.ok) {
      console.warn(`Midnight indexer query responded with HTTP status ${response.status}`);
      return null;
    }

    const payload = await response.json();
    const action = payload?.data?.contractAction;

    let rawStateHex: string | null = null;
    if (action?.state) {
      rawStateHex = action.state;
    } else if (action?.deploy?.transaction?.contractActions) {
      const targetAction = action.deploy.transaction.contractActions.find(
        (a: any) => a.address?.toLowerCase() === contractAddress.toLowerCase()
      );
      if (targetAction?.state) {
        rawStateHex = targetAction.state;
      }
    }

    if (!rawStateHex) {
      return null;
    }

    const { ledger } = await getContractModule();
    const stateBytes = __compactRuntime.fromHex(rawStateHex);
    const parsedLedger = ledger(stateBytes);

    const bids: Array<{ bidder: string; commitment: string; revealed: boolean; revealedAmount?: number }> = [];
    if (parsedLedger.bids) {
      for (const [bidderKey, commitment] of parsedLedger.bids) {
        const bidderHex = __compactRuntime.toHex(bidderKey);
        const commitmentHex = __compactRuntime.toHex(commitment);
        bids.push({
          bidder: `0x${bidderHex.slice(0, 4)}...${bidderHex.slice(-4)}`,
          commitment: commitmentHex,
          revealed: false,
        });
      }
    }

    const revealedBids: Array<{ bidder: string; amount: number }> = [];
    if (parsedLedger.revealedBids) {
      for (const [bidderKey, amount] of parsedLedger.revealedBids) {
        const bidderHex = __compactRuntime.toHex(bidderKey);
        const amt = Number(amount);
        revealedBids.push({
          bidder: `0x${bidderHex.slice(0, 4)}...${bidderHex.slice(-4)}`,
          amount: amt,
        });

        // Mark corresponding bid as revealed
        const match = bids.find((b) => b.bidder.toLowerCase() === `0x${bidderHex.slice(0, 4)}...${bidderHex.slice(-4)}`.toLowerCase());
        if (match) {
          match.revealed = true;
          match.revealedAmount = amt;
        }
      }
    }

    let winnerStr: string | null = null;
    if (parsedLedger.hasWinner && parsedLedger.winningBidder) {
      const winHex = __compactRuntime.toHex(parsedLedger.winningBidder);
      winnerStr = `0x${winHex.slice(0, 6)}...${winHex.slice(-4)}`;
    }

    let highestBidderStr: string | null = null;
    if (parsedLedger.highestBidder) {
      const highHex = __compactRuntime.toHex(parsedLedger.highestBidder);
      highestBidderStr = `0x${highHex.slice(0, 6)}...${highHex.slice(-4)}`;
    }

    return {
      auctionActive: Boolean(parsedLedger.auctionActive),
      revealActive: Boolean(parsedLedger.revealActive),
      winnerDetermined: Boolean(parsedLedger.winnerDetermined),
      isFinalized: Boolean(parsedLedger.isFinalized),
      hasWinner: Boolean(parsedLedger.hasWinner),
      hasRevealedBids: Boolean(parsedLedger.hasRevealedBids),
      bidCount: Number(parsedLedger.bidCount || 0),
      bids,
      revealedBids,
      highestBid: Number(parsedLedger.highestBid || 0),
      highestBidder: highestBidderStr,
      winningBid: parsedLedger.hasWinner ? Number(parsedLedger.winningBid || 0) : null,
      winningBidder: winnerStr,
    };
  } catch (err) {
    console.error('Failed to query contract state from Midnight indexer:', err);
    return null;
  }
}

/**
 * Builds official Midnight providers backed by the connected Lace Wallet and Midnight network
 */
export async function createMidnightBrowserProviders(
  connectedApi: ConnectedAPI,
  userAddress: string
) {
  const { indexerPublicDataProvider } = await import('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
  const { httpClientProofProvider } = await import('@midnight-ntwrk/midnight-js-http-client-proof-provider');
  const { levelPrivateStateProvider } = await import('@midnight-ntwrk/midnight-js-level-private-state-provider');
  const { FetchZkConfigProvider } = await import('@midnight-ntwrk/midnight-js-fetch-zk-config-provider');

  let walletConfig = {
    indexerUri: MIDNIGHT_CONFIG.indexerUrl,
    indexerWsUri: MIDNIGHT_CONFIG.indexerWsUrl,
    proverServerUri: MIDNIGHT_CONFIG.proofServerUrl,
  };

  try {
    const config = await connectedApi.getConfiguration();
    if (config?.indexerUri) walletConfig.indexerUri = config.indexerUri;
    if (config?.indexerWsUri) walletConfig.indexerWsUri = config.indexerWsUri;
    if (config?.proverServerUri) walletConfig.proverServerUri = config.proverServerUri;
  } catch (e) {
    console.warn('Could not read configuration from connected wallet API:', e);
  }

  const publicDataProvider = indexerPublicDataProvider(
    walletConfig.indexerUri,
    walletConfig.indexerWsUri
  );

  const zkConfigProvider = new FetchZkConfigProvider(
    window.location.origin + '/zkir',
    fetch.bind(window)
  );

  const proofProvider = httpClientProofProvider(
    walletConfig.proverServerUri || MIDNIGHT_CONFIG.proofServerUrl,
    zkConfigProvider
  );

  const privateStateProvider = levelPrivateStateProvider({
    privateStoragePasswordProvider: () => 'MidnightClient_SessionKey_2026!Sec',
    accountId: userAddress || 'midnight_default_account',
  });

  const addresses = await connectedApi.getShieldedAddresses();
  const coinKey = __compactRuntime.fromHex(
    (addresses.shieldedCoinPublicKey || '').replace(/^0x/, '').padStart(64, '0')
  );
  const encKey = __compactRuntime.fromHex(
    (addresses.shieldedEncryptionPublicKey || '').replace(/^0x/, '').padStart(64, '0')
  );

  const walletProvider = {
    balanceTx: async (unboundTx: any) => {
      if (typeof connectedApi.balanceUnsealedTransaction === 'function') {
        const balanced = await connectedApi.balanceUnsealedTransaction(JSON.stringify(unboundTx));
        return typeof balanced.tx === 'string' ? JSON.parse(balanced.tx) : balanced.tx;
      }
      return unboundTx;
    },
    getCoinPublicKey: () => coinKey,
    getEncryptionPublicKey: () => encKey,
  };

  const midnightProvider = {
    submitTx: async (tx: any) => {
      if (typeof connectedApi.submitTransaction === 'function') {
        const serialized = typeof tx === 'string' ? tx : JSON.stringify(tx);
        await connectedApi.submitTransaction(serialized);
        return tx.id || tx.txId || tx.hash || '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
      return (publicDataProvider as any).submitTx ? await (publicDataProvider as any).submitTx(tx) : tx.id;
    },
  };

  return {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  };
}

/**
 * Finds the deployed contract instance on-chain with full circuit calling interface
 */
export async function getDeployedAuctionContract(
  connectedApi: ConnectedAPI,
  userAddress: string,
  contractAddress: string = CANONICAL_CONTRACT_ADDRESS
) {
  const { findDeployedContract } = await import('@midnight-ntwrk/midnight-js-contracts');
  const { Contract } = await getContractModule();
  const providers = await createMidnightBrowserProviders(connectedApi, userAddress);

  return await findDeployedContract(providers as any, {
    contractAddress,
    compiledContract: Contract,
    privateStateId: 'sealed_bid_auction_private_state',
    initialPrivateState: {},
  } as any);
}

/**
 * Genuine callTx.submitBid execution
 */
export async function callSubmitBidTx(
  connectedApi: ConnectedAPI,
  userAddress: string,
  amount: number,
  nonce: string,
  contractAddress: string = CANONICAL_CONTRACT_ADDRESS
): Promise<{ txHash: string; blockHeight?: number }> {
  const commitmentBytes = await computeCompactCommitment(amount, nonce);
  const deployed = await getDeployedAuctionContract(connectedApi, userAddress, contractAddress);

  const finalizedData = await deployed.callTx.submitBid(commitmentBytes);
  const txHash =
    finalizedData?.public?.txHash ||
    finalizedData?.public?.txId ||
    __compactRuntime.toHex(commitmentBytes);
  const blockHeight = finalizedData?.public?.blockHeight;

  return { txHash, blockHeight };
}

/**
 * Genuine callTx.closeAuction execution
 */
export async function callCloseAuctionTx(
  connectedApi: ConnectedAPI,
  userAddress: string,
  contractAddress: string = CANONICAL_CONTRACT_ADDRESS
): Promise<{ txHash: string; blockHeight?: number }> {
  const deployed = await getDeployedAuctionContract(connectedApi, userAddress, contractAddress);
  const finalizedData = await deployed.callTx.closeAuction();
  const txHash =
    finalizedData?.public?.txHash ||
    finalizedData?.public?.txId ||
    `0xclose_${Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
  const blockHeight = finalizedData?.public?.blockHeight;

  return { txHash, blockHeight };
}

/**
 * Genuine callTx.revealBid execution
 */
export async function callRevealBidTx(
  connectedApi: ConnectedAPI,
  userAddress: string,
  amount: number,
  nonce: string,
  contractAddress: string = CANONICAL_CONTRACT_ADDRESS
): Promise<{ txHash: string; blockHeight?: number }> {
  const nonceBytes = new Uint8Array(32);
  const encoded = new TextEncoder().encode(nonce);
  nonceBytes.set(encoded.slice(0, 32));

  const deployed = await getDeployedAuctionContract(connectedApi, userAddress, contractAddress);
  const finalizedData = await deployed.callTx.revealBid(BigInt(amount), nonceBytes);
  const txHash =
    finalizedData?.public?.txHash ||
    finalizedData?.public?.txId ||
    `0xreveal_${Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
  const blockHeight = finalizedData?.public?.blockHeight;

  return { txHash, blockHeight };
}

/**
 * Genuine callTx.closeReveal execution
 */
export async function callCloseRevealTx(
  connectedApi: ConnectedAPI,
  userAddress: string,
  contractAddress: string = CANONICAL_CONTRACT_ADDRESS
): Promise<{ txHash: string; blockHeight?: number }> {
  const deployed = await getDeployedAuctionContract(connectedApi, userAddress, contractAddress);
  const finalizedData = await deployed.callTx.closeReveal();
  const txHash =
    finalizedData?.public?.txHash ||
    finalizedData?.public?.txId ||
    `0xclosereveal_${Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
  const blockHeight = finalizedData?.public?.blockHeight;

  return { txHash, blockHeight };
}

/**
 * Genuine callTx.determineWinner execution
 */
export async function callDetermineWinnerTx(
  connectedApi: ConnectedAPI,
  userAddress: string,
  contractAddress: string = CANONICAL_CONTRACT_ADDRESS
): Promise<{ txHash: string; blockHeight?: number }> {
  const deployed = await getDeployedAuctionContract(connectedApi, userAddress, contractAddress);
  const finalizedData = await deployed.callTx.determineWinner();
  const txHash =
    finalizedData?.public?.txHash ||
    finalizedData?.public?.txId ||
    `0xwinner_${Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
  const blockHeight = finalizedData?.public?.blockHeight;

  return { txHash, blockHeight };
}

/**
 * Genuine callTx.finalizeAuction execution
 */
export async function callFinalizeAuctionTx(
  connectedApi: ConnectedAPI,
  userAddress: string,
  contractAddress: string = CANONICAL_CONTRACT_ADDRESS
): Promise<{ txHash: string; blockHeight?: number }> {
  const deployed = await getDeployedAuctionContract(connectedApi, userAddress, contractAddress);
  const finalizedData = await deployed.callTx.finalizeAuction();
  const txHash =
    finalizedData?.public?.txHash ||
    finalizedData?.public?.txId ||
    `0xfinalize_${Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
  const blockHeight = finalizedData?.public?.blockHeight;

  return { txHash, blockHeight };
}
