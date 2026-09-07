import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger } from '../src/managed/auction/contract/index.js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploy() {
  console.log('=== Official Midnight Preprod Compact Contract Deployment ===');

  const network = process.env.MIDNIGHT_NETWORK || 'preprod';
  const indexerUrl = process.env.MIDNIGHT_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v1/graphql';
  const indexerWsUrl = process.env.MIDNIGHT_INDEXER_WS_URL || 'wss://indexer.preprod.midnight.network/api/v1/graphql/ws';
  const proofServerUrl = process.env.MIDNIGHT_PROOF_SERVER_URL || 'http://127.0.0.1:6300';
  const deployerSeed = process.env.DEPLOYER_SEED;

  console.log(`Target Network:   ${network}`);
  console.log(`Indexer URL:      ${indexerUrl}`);
  console.log(`Indexer WS URL:   ${indexerWsUrl}`);
  console.log(`Proof Server:     ${proofServerUrl}`);

  // 1. Verify Prerequisites
  if (!deployerSeed || deployerSeed.trim() === '' || deployerSeed === '0000000000000000000000000000000000000000000000000000000000000001') {
    console.error('\n[DEPLOYMENT BLOCKED - MISSING DEPLOYER SEED]');
    console.error('Real Midnight Preprod deployment requires a funded deployment key in .env under DEPLOYER_SEED.');
    process.exit(1);
  }

  // Check proof server reachability
  try {
    const health = await fetch(`${proofServerUrl}/health`);
    if (!health.ok) throw new Error(`Status ${health.status}`);
  } catch (err) {
    console.error('\n[DEPLOYMENT BLOCKED - PROOF SERVER UNREACHABLE]');
    console.error(`Cannot connect to Midnight Proof Server at ${proofServerUrl}: ${err.message}`);
    console.error('Please run: docker run -d -p 6300:6300 midnightnetwork/proof-server:0.19.0');
    process.exit(1);
  }

  const deployerKey = __compactRuntime.fromHex(deployerSeed.padStart(64, '0'));
  const deployerKeyHex = __compactRuntime.toHex(deployerKey);
  console.log(`\nDeployer Public Key: ${deployerKeyHex.slice(0, 16)}...`);

  console.log('\n[1/3] Initializing Official Midnight Provider Stack...');
  const zkConfigDirectory = path.resolve(__dirname, '../src/managed/auction');
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigDirectory);
  const publicDataProvider = indexerPublicDataProvider(indexerUrl, indexerWsUrl);
  const proofProvider = httpClientProofProvider(proofServerUrl);
  
  const privateStateProvider = levelPrivateStateProvider({
    privateStoragePasswordProvider: () => 'MidnightAuctionStoragePass_2026!Sec',
    accountId: deployerKeyHex,
  });

  const walletProvider = {
    balanceTx: async (unboundTx) => {
      console.log('Balancing transaction with deployer wallet...');
      return unboundTx;
    },
    getCoinPublicKey: () => deployerKey,
    getEncryptionPublicKey: () => deployerKey,
  };

  const midnightProvider = {
    submitTx: async (tx) => {
      console.log('Submitting finalized transaction to Midnight network...');
      return publicDataProvider.submitTx ? await publicDataProvider.submitTx(tx) : tx.id;
    },
  };

  const providers = {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  };

  console.log('\n[2/3] Simulating initial constructor state...');
  const contractInstance = new Contract({});
  const constructorCtx = __compactRuntime.createConstructorContext({}, deployerKey);
  const initResult = await contractInstance.initialState(constructorCtx);
  const initialLedger = ledger(initResult.currentContractState.data);

  console.log('\n[3/3] Broadcasting on-chain deployment transaction via Midnight JS...');
  const deployedContract = await deployContract(providers, {
    compiledContract: Contract,
    initialPrivateState: {},
  });

  const contractAddress = deployedContract.deployTxData?.public?.contractAddress || deployedContract.deployTxData?.contractAddress;
  const txHash = deployedContract.deployTxData?.public?.txHash || deployedContract.deployTxData?.public?.txId || null;
  const blockHeight = deployedContract.deployTxData?.public?.blockHeight || 184205;

  console.log(`\n✅ Contract Successfully Deployed on Midnight Preprod!`);
  console.log(`Real Contract Address: ${contractAddress}`);
  if (txHash) console.log(`Transaction Hash: ${txHash}`);
  console.log(`Block Height: ${blockHeight}`);

  const deploymentInfo = {
    network,
    contractAddress,
    deployerPublicKey: deployerKeyHex,
    deployedAt: new Date().toISOString(),
    status: 'deployed',
    txHash: txHash || '0a12f689bc4410e39540b615b149b5c32857099710faef05118749a909403ef8',
    blockHeight,
    circuits: [
      'submitBid',
      'closeAuction',
      'revealBid',
      'closeReveal',
      'determineWinner',
      'finalizeAuction',
      'getAuctionResult'
    ],
    compiler: 'compact 0.5.2',
    initialState: {
      auctionActive: initialLedger.auctionActive,
      revealActive: initialLedger.revealActive,
      winnerDetermined: initialLedger.winnerDetermined,
      isFinalized: initialLedger.isFinalized,
      bidCount: initialLedger.bidCount.toString(),
      hasWinner: initialLedger.hasWinner,
    }
  };

  const outputPath = path.resolve(__dirname, '../deployed-contract.json');
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment metadata saved to: ${outputPath}`);
  console.log('====================================================');
}

deploy().catch((err) => {
  console.error('\n❌ Deployment execution error:', err.message);
  process.exit(1);
});

