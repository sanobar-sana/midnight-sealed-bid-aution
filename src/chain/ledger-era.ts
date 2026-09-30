import type { Configuration } from '@midnight-ntwrk/dapp-connector-api';

export type AuctionLedgerEra = 'ledger8' | 'ledger9';

const asSpecVersion = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^0x[\da-f]+$/i.test(value)) return Number.parseInt(value.slice(2), 16);
  return undefined;
};

async function runtimeSpecVersion(nodeUri: string): Promise<number> {
  if (nodeUri.startsWith('http://') || nodeUri.startsWith('https://')) {
    const response = await fetch(nodeUri, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'state_getRuntimeVersion', params: [] }),
    });
    if (!response.ok) throw new Error(`Midnight node runtime query failed (${response.status}).`);
    const payload = await response.json();
    if (payload.error) throw new Error(payload.error.message || 'Midnight node did not return its runtime version.');
    const version = asSpecVersion(payload.result?.specVersion);
    if (version === undefined) throw new Error('Midnight node returned an invalid runtime spec version.');
    return version;
  }

  if (!nodeUri.startsWith('ws://') && !nodeUri.startsWith('wss://')) {
    throw new Error('The connected wallet did not provide a usable Midnight node URI.');
  }
  return new Promise<number>((resolve, reject) => {
    const socket = new WebSocket(nodeUri);
    const timeout = window.setTimeout(() => finish(new Error('Timed out reading the connected Midnight node runtime.')), 10_000);
    const finish = (error?: Error, version?: number) => {
      window.clearTimeout(timeout);
      socket.close();
      if (error) reject(error);
      else if (version === undefined) reject(new Error('Midnight node returned an invalid runtime spec version.'));
      else resolve(version);
    };
    socket.addEventListener('open', () => socket.send(JSON.stringify({
      id: 1, jsonrpc: '2.0', method: 'state_getRuntimeVersion', params: [],
    })));
    socket.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(String(event.data));
        if (payload.id !== 1) return;
        if (payload.error) return finish(new Error(payload.error.message || 'Midnight node runtime query failed.'));
        const version = asSpecVersion(payload.result?.specVersion);
        finish(undefined, version);
      } catch (error) {
        finish(error instanceof Error ? error : new Error(String(error)));
      }
    });
    socket.addEventListener('error', () => finish(new Error('Could not read the connected Midnight node runtime.')));
  });
}

/**
 * The chain runtime identifies which era a new contract must use. Wallet proof-server ports provide
 * an explicit era hint where configured; otherwise inspect the wallet's own node without prompting
 * it to approve or balance a transaction.
 */
export async function getAuctionLedgerEra(config: Pick<Configuration, 'proverServerUri' | 'substrateNodeUri'>): Promise<AuctionLedgerEra> {
  if (!config.substrateNodeUri) {
    throw new Error('The wallet did not provide a Midnight node URI, so the contract ledger era cannot be determined safely.');
  }
  let runtimeFailure: unknown;
  try {
    const specVersion = await runtimeSpecVersion(config.substrateNodeUri);
    // The Midnight fork transition uses runtime spec versions 1,000,000 (pre-fork) and 2,000,000 (post-fork).
    if (specVersion >= 2_000_000) return 'ledger9';
    if (specVersion >= 1_000_000) return 'ledger8';
    runtimeFailure = new Error(`Unrecognized Midnight runtime spec version ${specVersion}.`);
  } catch (error) {
    runtimeFailure = error;
  }

  // Wallet proof-server ports are the standard explicit era setting; use them only if the node's
  // runtime endpoint is unavailable or reports a version outside the documented fork range.
  try {
    const port = config.proverServerUri ? new URL(config.proverServerUri).port : '';
    if (port === '6301') return 'ledger8';
    if (port === '6300') return 'ledger9';
  } catch {
    // The runtime error below is more useful than a URL parsing error for custom wallet endpoints.
  }
  throw new Error('Could not determine the connected Midnight ledger era before requesting wallet approval. Check the wallet node endpoint, or configure the standard era proof server (6301 for ledger-v8, 6300 for ledger-v9).', { cause: runtimeFailure });
}
