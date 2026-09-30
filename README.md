# Midnight sealed bid auction

A React dApp for multiple Compact sealed-bid auctions held by one shared contract on Midnight Preprod. Each auction creation, commitment, phase transition, reveal, winner determination, and finalization is a chain transaction. The frontend connects through Lace or 1AM, follows indexer state changes, and resumes tracking a submitted transaction after reconnect or reload.

## What is on-chain

- `submitBid` records the bidder public key and commitment hash.
- `closeAuction` starts the reveal window.
- `revealBid` verifies the bid and nonce against the commitment.
- `closeReveal`, `determineWinner`, and `finalizeAuction` advance the contract lifecycle.
- The UI reads the current ledger; it does not seed sample auctions or fake transaction IDs.

Bidders and commitments are public. Bid amounts and nonces remain private until each bidder reveals them. Keep the nonce safe; the app cannot recover it.

## Requirements

- Node.js 20 or later and npm.
- Compact compiler 0.34.0 available as `compact` on `PATH`.
- Lace or 1AM browser wallet configured for Midnight Preprod, with DUST for transaction fees.
- A proof server configured in the wallet. The app uses the proof server URI and indexer endpoints supplied by the connected wallet.

## Run locally

```bash
npm install
npm run dev
```

Run `npm run dev:vercel` to use Vercel Dev, including the MongoDB-backed `/api` functions. `npm run dev` starts Vite only. MongoDB requests are handled by server code; the API stores wallet login sessions and confirmed transaction references, while the Midnight contract remains authoritative for auctions.

The `predev` and `prebuild` hooks compile the Compact contract with ZK artifacts and copy its proving keys, verifier keys, and ZKIR into the Vite public directory. To compile these artifacts directly:

```bash
npm run contract:build
```

Deploy the shared auction contract once from the browser console. Connect the deploying wallet to Preprod, open the site, and paste this command into DevTools:

```js
const auctionAddress = await window.midnightAuction.deploy();
console.log('Auction address:', auctionAddress);
console.log('Deployment era:', JSON.parse(localStorage.getItem('midnight_shared_auction_deployment')).ledgerEra);
```

The helper reads the connected node's runtime era before asking the wallet to balance a transaction, then uses the matching Compact build (ledger-v8 or ledger-v9). Approve the deployment and copy the address and era into `VITE_AUCTION_CONTRACT_ADDRESS` and `VITE_AUCTION_CONTRACT_ERA` in Vercel, then redeploy the frontend. The address and era are public configuration; everyone will connect to that same deployed contract. Deployment requires a configured proof server for the selected era and DUST.

Auction names and public commitments/reveals are on-chain. Bid amounts remain private until each bidder reveals them. The current auction flow records commitments and results but does not escrow or transfer bid funds.

The on-page deploy button has been removed. The deployment helper remains available in the browser console; visitors use the single address and era configured in Vercel.

## Build and contract tests

```bash
npm run build
npm test
```

`npm run build` includes Compact compilation so the deployed app has the ZK artifacts the proof provider needs. Contract unit tests execute the generated Compact contract in the local runtime; they do not submit network transactions.
