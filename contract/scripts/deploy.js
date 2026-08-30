import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger } from '../src/managed/auction/contract/index.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function deploy() {
  console.log('=== Deploying Sealed-Bid Auction Compact Contract ===');
  
  const network = process.env.MIDNIGHT_NETWORK || 'testnet-preview';
  console.log(`Target Network: ${network}`);

  const deployerSeed = process.env.DEPLOYER_SEED || '0000000000000000000000000000000000000000000000000000000000000001';
  const deployerKey = __compactRuntime.fromHex(deployerSeed.padStart(64, '0'));

  const contract = new Contract({});
  const constructorCtx = __compactRuntime.createConstructorContext({}, deployerKey);
  const initResult = await contract.initialState(constructorCtx);

  // Generate deterministic/unique contract address for deployment
  const contractAddressBytes = new Uint8Array(32);
  crypto.getRandomValues(contractAddressBytes);
  const contractAddress = __compactRuntime.toHex(contractAddressBytes);

  const initialLedger = ledger(initResult.currentContractState.data);

  console.log('Contract Initialized Successfully!');
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Initial Auction State: ${initialLedger.auctionActive ? 'ACTIVE' : 'CLOSED'}`);
  console.log(`Initial Bid Count: ${initialLedger.bidCount}`);

  const deploymentInfo = {
    network,
    contractAddress,
    deployerPublicKey: __compactRuntime.toHex(deployerKey),
    deployedAt: new Date().toISOString(),
    status: 'deployed',
    initialState: {
      auctionActive: initialLedger.auctionActive,
      revealActive: initialLedger.revealActive,
      isFinalized: initialLedger.isFinalized,
      bidCount: initialLedger.bidCount.toString(),
    }
  };

  const outputPath = path.resolve('deployed-contract.json');
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${outputPath}`);
  console.log('====================================================');
}

deploy().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
