import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { createMidnightProviderFromHandlers, createWalletProviderFromHandlers, type MidnightProviders, type UnboundTransaction } from '@midnight-ntwrk/midnight-js/types';
import { Transaction, type Binding, type FinalizedTransaction, type Proof, type SignatureEnabled } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { getAuctionLedgerEra, type AuctionLedgerEra } from './ledger-era';

const hex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
const bytes = (value: string) => {
  const normalized = value.replace(/^0x/i, '');
  if (!/^(?:[0-9a-f]{2})*$/i.test(normalized)) throw new Error('The wallet returned malformed transaction bytes.');
  return Uint8Array.from(normalized.match(/.{2}/g) ?? [], (part) => Number.parseInt(part, 16));
};

function describeWalletEraMismatch(cause: unknown): Error | undefined {
  const message = cause instanceof Error ? cause.message : String(cause);
  const expected = message.match(/expected header tag ['"]midnight:transaction\[v(\d+)\]/i)?.[1];
  const received = message.match(/got ['"]midnight:transaction\[v(\d+)\]/i)?.[1];
  if (!expected || !received) return undefined;
  return new Error(
    `Wallet transaction format mismatch: the connected wallet expects transaction v${expected}, ` +
    `but this app's compiled contract creates transaction v${received}. The wallet rejected it before ` +
    `deployment. Use a wallet that supports this contract's ledger era, or rebuild and deploy the ` +
    `contract for the wallet's era; these transaction formats cannot be converted during signing.`,
    { cause },
  );
}

const storagePasswordKey = 'sealed-auction-storage-password-v1';
const passwordAlphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*()-_=+';

function generateStoragePassword() {
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '!@#$%^&*()-_=+';
  const categories = [lower, upper, digits, symbols];

  while (true) {
    const random = crypto.getRandomValues(new Uint8Array(32));
    const chars = categories.map((category, index) => category[random[index] % category.length]);
    for (const byte of random.slice(4)) chars.push(passwordAlphabet[byte % passwordAlphabet.length]);
    for (let i = chars.length - 1; i > 0; i--) {
      const j = crypto.getRandomValues(new Uint8Array(1))[0] % (i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    const password = chars.join('');
    const normalized = password.toLowerCase();
    const hasSequence = Array.from({ length: normalized.length - 3 }, (_, start) => {
      const codes = Array.from(normalized.slice(start, start + 4), (char) => char.charCodeAt(0));
      return codes.every((code, index) => index === 0 || code === codes[index - 1] + 1)
        || codes.every((code, index) => index === 0 || code === codes[index - 1] - 1);
    }).some(Boolean);
    if (!/(.)\1{3}/.test(password) && !hasSequence) {
      return password;
    }
  }
}

function getStoragePassword() {
  const saved = window.localStorage.getItem(storagePasswordKey);
  if (saved) return saved;
  const generated = generateStoragePassword();
  window.localStorage.setItem(storagePasswordKey, generated);
  return generated;
}

export async function createAuctionProviders(api: ConnectedAPI, accountId: string, onTransactionSubmitted?: (id: string) => void, contractEra?: AuctionLedgerEra) {
  setNetworkId('preprod');
  await api.hintUsage(['getConfiguration', 'getShieldedAddresses', 'getUnshieldedAddress', 'balanceUnsealedTransaction', 'submitTransaction']);
  const config = await api.getConfiguration();
  if (config.networkId !== 'preprod') throw new Error(`Switch the connected wallet to Preprod. Current network: ${config.networkId}.`);
  const chainEra = await getAuctionLedgerEra(config);
  const ledgerEra = contractEra ?? chainEra;
  const proverUrl = config.proverServerUri;
  if (!proverUrl) throw new Error('Set a proof server in the connected wallet and reconnect before using contracts.');
  try {
    const proofPort = new URL(proverUrl).port;
    const proofEra = proofPort === '6301' ? 'ledger8' : proofPort === '6300' ? 'ledger9' : undefined;
    if (proofEra && proofEra !== ledgerEra) {
      throw new Error(`The connected wallet's proof server is configured for ${proofEra}, but the auction contract uses ${ledgerEra}. Set the wallet proof server to ${ledgerEra === 'ledger8' ? 'port 6301' : 'port 6300'} and reconnect.`);
    }
  } catch (cause) {
    if (cause instanceof Error && cause.message.startsWith('The connected wallet')) throw cause;
    // Nonstandard wallet URLs do not encode their era in a port; the chain runtime and artifact stay authoritative.
  }

  // Pass the browser's bound fetch explicitly. The provider's cross-fetch
  // default loses the Window receiver in the Vite browser bundle and throws
  // "Illegal invocation" while loading verifier keys.
  const zkConfigProvider = new FetchZkConfigProvider(
    `${window.location.origin}/contract/${ledgerEra === 'ledger8' ? 'auction-v8' : 'auction'}`,
    { fetchFunc: window.fetch.bind(window), ...(ledgerEra === 'ledger8' ? { verify: 'require-if-present' as const } : {}) },
  );
  const publicDataProvider = indexerPublicDataProvider(config.indexerUri, config.indexerWsUri, window.WebSocket as any);
  const shielded = await api.getShieldedAddresses();

  // Generate a strong local key once so connecting never interrupts the wallet flow.
  const password = getStoragePassword();
  const privateStateProvider = levelPrivateStateProvider({
    privateStateStoreName: 'sealed-auction-private-state',
    signingKeyStoreName: 'sealed-auction-signing-keys',
    privateStoragePasswordProvider: () => password,
    accountId,
  });

  const walletProvider = createWalletProviderFromHandlers({
    getCoinPublicKey: () => shielded.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shielded.shieldedEncryptionPublicKey,
    async currentEra(tx: UnboundTransaction): Promise<FinalizedTransaction> {
      try {
        const balanced = await api.balanceUnsealedTransaction(hex(tx.serialize()));
        return Transaction.deserialize<SignatureEnabled, Proof, Binding>('signature', 'proof', 'binding', bytes(balanced.tx));
      } catch (cause) {
        throw describeWalletEraMismatch(cause) ?? cause;
      }
    },
    retainedEras: {
      async v8(txBytes: Uint8Array): Promise<Uint8Array> {
        try {
          const balanced = await api.balanceUnsealedTransaction(hex(txBytes));
          return bytes(balanced.tx);
        } catch (cause) {
          throw describeWalletEraMismatch(cause) ?? cause;
        }
      },
    },
  });
  const midnightProvider = createMidnightProviderFromHandlers({
    async currentEra(tx: FinalizedTransaction) {
      const [txId] = tx.identifiers();
      if (!txId) throw new Error('The wallet returned a transaction without an identifier.');
      await api.submitTransaction(hex(tx.serialize()));
      onTransactionSubmitted?.(txId);
      return txId;
    },
    retainedEras: {
      async v8(txBytes: Uint8Array) {
        const { Transaction: V8Transaction } = await import('@midnight-ntwrk/midnight-js-protocol/v8');
        const [txId] = V8Transaction.deserialize('signature', 'proof', 'binding', txBytes).identifiers();
        if (!txId) throw new Error('The retained-era transaction has no identifier.');
        await api.submitTransaction(hex(txBytes));
        onTransactionSubmitted?.(txId);
        return txId;
      },
    },
  });

  const providers: MidnightProviders = {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider: httpClientProofProvider(proverUrl, zkConfigProvider),
    walletProvider,
    midnightProvider,
  };
  const shieldedCoinPublicKey = typeof shielded.shieldedCoinPublicKey === 'string'
    ? shielded.shieldedCoinPublicKey.replace(/^0x/, '').toLowerCase()
    : hex(shielded.shieldedCoinPublicKey).toLowerCase();
  return { providers, publicDataProvider, shieldedCoinPublicKey, ledgerEra, chainEra };
}
