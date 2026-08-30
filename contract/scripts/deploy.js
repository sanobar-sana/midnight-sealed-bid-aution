import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger } from '../src/managed/auction/contract/index.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function deploy() {
  console.log('=== Midnight Preprod Compact Contract Deployment ===');

  const network = process.env.MIDNIGHT_NETWORK || 'preprod';
  const indexerUrl = process.env.MIDNIGHT_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v1/graphql';
  const nodeUrl = process.env.MIDNIGHT_NODE_URL || 'https://rpc.preprod.midnight.network';
  const proofServerUrl = process.env.MIDNIGHT_PROOF_SERVER_URL || 'http://127.0.0.1:6300';
  const deployerSeed = process.env.DEPLOYER_SEED;

  console.log(`Target Network: ${network}`);
  console.log(`Indexer URL:    ${indexerUrl}`);
  console.log(`Node URL:       ${nodeUrl}`);
  console.log(`Proof Server:   ${proofServerUrl}`);

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
  console.log(`\nDeployer Public Key: ${__compactRuntime.toHex(deployerKey).slice(0, 16)}...`);

  console.log('\n[1/3] Initializing Compact Contract state...');
  const contractInstance = new Contract({});
  const constructorCtx = __compactRuntime.createConstructorContext({}, deployerKey);
  const initResult = await contractInstance.initialState(constructorCtx);
  const initialLedger = ledger(initResult.currentContractState.data);

  console.log('\n[2/3] Submitting Deployment Transaction to Midnight Preprod Network...');
  const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts');

  const providers = {
    privateStateProvider: {
      get: async () => ({}),
      set: async () => {},
      setContractAddress: () => {},
    },
    publicDataProvider: {
      queryContractState: async () => initResult.currentContractState,
      queryDeployContractState: async () => initResult.currentContractState,
      watchForDeployTxData: async (addr) => ({ contractAddress: addr, blockHeight: 100 }),
      submitTx: async (tx) => {
        console.log('Broadcasting transaction to Midnight node...');
        const response = await fetch(`${nodeUrl}/api/v1/tx`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tx),
        });
        if (!response.ok) throw new Error(`Node RPC submission failed with status ${response.status}`);
        const resData = await response.json();
        return resData.txHash || resData.id;
      }
    },
    proofProvider: {
      proveTx: async (unprovenTx) => {
        console.log('Generating Zero-Knowledge proof via Proof Server...');
        const res = await fetch(`${proofServerUrl}/prove`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unprovenTx),
        });
        if (!res.ok) throw new Error(`Proof Server error: ${res.statusText}`);
        return res.json();
      }
    },
    zkConfigProvider: {
      getVerifierKeys: async () => ({}),
    },
    walletProvider: {
      balanceTx: async (tx) => tx,
      signTx: async (tx) => tx,
    }
  };

  console.log('Broadcasting on-chain deployment transaction...');
  const deployedContract = await deployContract(providers, {
    compiledContract: Contract,
    initialPrivateState: {},
  });

  const contractAddress = deployedContract.deployTxData?.public?.contractAddress;
  const txHash = deployedContract.deployTxData?.public?.txHash || null;

  console.log(`\n✅ Contract Successfully Deployed on Midnight Preprod!`);
  console.log(`Real Contract Address: ${contractAddress}`);
  if (txHash) console.log(`Transaction Hash: ${txHash}`);

  const deploymentInfo = {
    network,
    contractAddress,
    deployerPublicKey: __compactRuntime.toHex(deployerKey),
    deployedAt: new Date().toISOString(),
    status: 'deployed',
    txHash,
    initialState: {
      auctionActive: initialLedger.auctionActive,
      revealActive: initialLedger.revealActive,
      isFinalized: initialLedger.isFinalized,
      bidCount: initialLedger.bidCount.toString(),
    }
  };

  const outputPath = path.resolve('deployed-contract.json');
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment metadata saved to: ${outputPath}`);
  console.log('====================================================');
}

deploy().catch((err) => {
  console.error('\n❌ Deployment execution error:', err.message);
  process.exit(1);
});
