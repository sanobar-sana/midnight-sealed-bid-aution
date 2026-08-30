# Midnight Sealed-Bid Auction (Compact Smart Contract)

## Initial Product Idea

The **Midnight Sealed-Bid Auction** is a privacy-preserving decentralized auction platform built on the Midnight blockchain to guarantee fair, manipulation-free, and front-running-resistant bidding. Leveraging Midnight's zero-knowledge Compact smart contract language, participants submit cryptographic commitments of their secret bids during the active bidding window—ensuring that bid amounts remain entirely confidential from competitors, auctioneers, and the public. After bidding concludes, bidders open their commitments during the reveal phase with their original bid values and nonces, allowing the contract to verify integrity and deterministically declare the highest valid bidder as the winner without sacrificing privacy during the bidding period.

---

## Key Features

- **Sealed-Bid Commitments**: Bidders submit 32-byte cryptographic hashes (`persistentHash([bid, nonce])`) rather than plaintext values.
- **Single Bid Enforcement**: Each bidder public key is restricted to exactly one bid commitment per auction.
- **Phased Lifecycle Protection**:
  - **Bidding Phase**: Submits commitments; rejects premature reveals and winner determination.
  - **Reveal Phase**: Verifies `(bid, nonce)` against stored commitments; enforces single reveal per bidder; tracks highest valid bid.
  - **Finalization Phase**: Closes reveals, finalizes the winner, and exposes a read-only `getAuctionResult` circuit for client queries.
- **Robust Edge Case Handling**: Safely handles zero-bid auctions, invalid reveals, unauthorized reveals, and prevents duplicate state transitions.

---

## Public State vs. Private Witness in Midnight

In Midnight smart contracts written in Compact, data is bifurcated between on-chain **Public Ledger State** and off-chain **Private Witness State**:

```
+-------------------------------------------------------------------------+
|                              MIDNIGHT CONTRACT                          |
+------------------------------------+------------------------------------+
|       PUBLIC LEDGER STATE          |        PRIVATE WITNESS STATE       |
|    (Visible to all on-chain)       |   (Local to user / zero-knowledge) |
+------------------------------------+------------------------------------+
| • auctionActive (Boolean)          | • Unrevealed Bid Value (Uint<64>)  |
| • revealActive (Boolean)           | • Secret Nonce / Salt (Bytes<32>)  |
| • isFinalized (Boolean)            | • Private ZK Circuit Execution     |
| • bidCount (Counter)               | • ownPublicKey() Witness Binding   |
| • bids: Map<Bytes<32>, Bytes<32>>  | • Intermediate Zero-Knowledge      |
|   (Bidder -> Commitment Hash)      |   Proof Generation Data            |
| • revealedBids: Map<Bytes<32>, U64>|                                    |
| • winningBid & winningBidder       |                                    |
+------------------------------------+------------------------------------+
```

### 1. Public Ledger State
Public state is stored directly on the blockchain ledger and accessible by anyone:
- `auctionActive`, `revealActive`, `winnerDetermined`, `isFinalized`: Contract phase flags.
- `bids`: Maps each bidder's public key identifier to their 32-byte commitment hash. It reveals *who* placed a bid and *how many* bids exist, but zero information about the actual bid value.
- `revealedBids`: Stores opened valid bid values once the reveal phase commences.
- `winningBid` & `winningBidder`: The finalized auction outcome.

### 2. Private Witness State
Private witness data is processed purely off-chain on the user's local machine within the Compact Zero-Knowledge circuit:
- **Bid Amount & Nonce**: Kept private on the bidder's local device during bidding.
- **Commitment Computation**: `persistentHash([bid, nonce])` runs inside the client ZK prover, producing the public commitment before sending a transaction.
- **Reveal Circuit Verification**: During `revealBid`, the private values `(bid, nonce)` are supplied as witness inputs to prove on-chain that the hash matches the previously committed ledger value without exposing secret nonces.

---

## Contract Circuits Overview

| Circuit | Phase | Description |
| :--- | :--- | :--- |
| `submitBid(commitment)` | Bidding | Submits a 32-byte commitment hash. Fails if already bid or auction closed. |
| `closeAuction()` | Bidding -> Reveal | Closes the bidding window and transitions to reveal phase. |
| `revealBid(bid, nonce)` | Reveal | Verifies `persistentHash([bid, nonce]) == storedCommitment` and records the revealed bid. |
| `closeReveal()` | Reveal -> End | Concludes the reveal window. |
| `determineWinner()` | Finalization | Evaluates the highest valid revealed bid and sets the winner. |
| `finalizeAuction()` | Finalization | Locks in the final outcome and marks the auction finalized. |
| `getAuctionResult()` | Post-Finalization | Read-only query returning `AuctionResult { hasWinner, winningBidder, winningBid }`. |

---

## Local Setup & Development Instructions

### Prerequisites
- **Node.js**: `v20.0.0` or later (tested on Node.js `v26.5.1`)
- **Compact Toolchain**: Version `0.34.0` / compiler `0.5.2`

### 1. Install Dependencies
```bash
cd contract
npm install
```

### 2. Compile the Compact Contract
Compile the Compact contract to generate TypeScript bindings, circuit definitions, and runtime interfaces:
```bash
npm run build
```
*Or directly via the Compact CLI:*
```bash
compact compile --skip-zk src/auction.compact src/managed/auction
```

### 3. Run the Automated Test Suite
Run the 12-case comprehensive unit and integration test suite:
```bash
npm test
```

### 4. Deploy the Contract
Deploy the contract to Midnight Testnet (Preview/Preprod):
```bash
npm run deploy
```
*Deployment metadata is saved to `contract/deployed-contract.json`.*

---

## Deployment & Test Results

### Test Suite Output
```
▶ Sealed-Bid Auction Compact Contract Test Suite
  ✔ 1. Auction initializes correctly
  ✔ 2. Valid commitment can be submitted
  ✔ 3. A bidder cannot submit twice
  ✔ 4. Bids cannot be submitted after the auction closes
  ✔ 5. A valid reveal is accepted
  ✔ 6. An invalid reveal is rejected
  ✔ 7. A bidder who never committed cannot reveal
  ✔ 8. The same bid cannot be revealed twice
  ✔ 9. Highest valid bid is selected
  ✔ 10. No-bid auction is handled correctly
  ✔ 11. Winner cannot be determined before the reveal phase ends
  ✔ 12. Auction cannot be finalized twice
✔ Sealed-Bid Auction Compact Contract Test Suite

ℹ tests 12
ℹ suites 1
ℹ pass 12
ℹ fail 0
```

### Deployed Contract Details
- **Network**: `testnet-preview`
- **Contract Address**: `38f3fc0af57790ee51e7785526f7df3319908c386ff847f5c4688b5075b3ef16`
- **Deployer Key**: `0000000000000000000000000000000000000000000000000000000000000001`
- **Status**: `deployed`

---

## Screenshots

### 1. Successful Compile Output
![Successful Compile Output](docs/images/compile-output.png)

### 2. Contract Deployed with Address
![Contract Deployed](docs/images/deployment-address.png)
