import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger } from '../src/managed/auction/contract/index.js';

function createBidderKey(id) {
  const key = new Uint8Array(32);
  key[0] = id;
  return key;
}

function createNonce(id) {
  const nonce = new Uint8Array(32);
  nonce.fill(id);
  return nonce;
}

class AuctionHarness {
  constructor() {
    this.contract = new Contract({});
    this.contractAddress = __compactRuntime.dummyContractAddress();
    this.chargedState = null;
  }

  async init(deployerKey = createBidderKey(1)) {
    const constructorCtx = __compactRuntime.createConstructorContext({}, deployerKey);
    const initRes = await this.contract.initialState(constructorCtx);
    this.chargedState = initRes.currentContractState.data;
  }

  computeCommitment(bidAmount, nonce) {
    return this.contract._persistentHash_0([BigInt(bidAmount), nonce]);
  }

  async callCircuit(circuitName, callerKey, ...args) {
    const ctx = __compactRuntime.createCircuitContext(
      circuitName,
      this.contractAddress,
      { bytes: callerKey },
      this.chargedState,
      {}
    );
    const res = await this.contract.circuits[circuitName](ctx, ...args);
    this.chargedState = res.context.callContext.currentQueryContext.state;
    return res.result;
  }

  getLedger() {
    return ledger(this.chargedState);
  }
}

describe('Sealed-Bid Auction Compact Contract Test Suite', () => {
  it('1. Auction initializes correctly', async () => {
    const harness = new AuctionHarness();
    await harness.init();
    const l = harness.getLedger();

    assert.equal(l.auctionActive, true);
    assert.equal(l.revealActive, true);
    assert.equal(l.winnerDetermined, false);
    assert.equal(l.isFinalized, false);
    assert.equal(l.hasWinner, false);
    assert.equal(l.hasRevealedBids, false);
    assert.equal(l.bidCount, 0n);
    assert.equal(l.highestBid, 0n);
    assert.equal(l.winningBid, 0n);
    assert.equal(l.bids.isEmpty(), true);
    assert.equal(l.revealedBids.isEmpty(), true);
  });

  it('2. Valid commitment can be submitted', async () => {
    const harness = new AuctionHarness();
    await harness.init();

    const bidder = createBidderKey(10);
    const nonce = createNonce(1);
    const commitment = harness.computeCommitment(100n, nonce);

    await harness.callCircuit('submitBid', bidder, commitment);
    const l = harness.getLedger();

    assert.equal(l.bidCount, 1n);
    assert.equal(l.bids.member(bidder), true);
    assert.deepEqual(l.bids.lookup(bidder), commitment);
  });

  it('3. A bidder cannot submit twice', async () => {
    const harness = new AuctionHarness();
    await harness.init();

    const bidder = createBidderKey(10);
    const commitment1 = harness.computeCommitment(100n, createNonce(1));
    const commitment2 = harness.computeCommitment(200n, createNonce(2));

    await harness.callCircuit('submitBid', bidder, commitment1);

    await assert.rejects(
      async () => {
        await harness.callCircuit('submitBid', bidder, commitment2);
      },
      (err) => {
        assert.match(err.message, /Bidder already submitted a bid/);
        return true;
      }
    );
  });

  it('4. Bids cannot be submitted after the auction closes', async () => {
    const harness = new AuctionHarness();
    await harness.init();

    const bidder1 = createBidderKey(1);
    const bidder2 = createBidderKey(2);
    const commitment1 = harness.computeCommitment(100n, createNonce(1));
    const commitment2 = harness.computeCommitment(200n, createNonce(2));

    await harness.callCircuit('submitBid', bidder1, commitment1);
    await harness.callCircuit('closeAuction', bidder1);

    const l = harness.getLedger();
    assert.equal(l.auctionActive, false);

    await assert.rejects(
      async () => {
        await harness.callCircuit('submitBid', bidder2, commitment2);
      },
      (err) => {
        assert.match(err.message, /Auction is closed/);
        return true;
      }
    );
  });

  it('5. A valid reveal is accepted', async () => {
    const harness = new AuctionHarness();
    await harness.init();

    const bidder = createBidderKey(1);
    const nonce = createNonce(5);
    const bidAmount = 150n;
    const commitment = harness.computeCommitment(bidAmount, nonce);

    await harness.callCircuit('submitBid', bidder, commitment);
    await harness.callCircuit('closeAuction', bidder);
    await harness.callCircuit('revealBid', bidder, bidAmount, nonce);

    const l = harness.getLedger();
    assert.equal(l.revealedBids.member(bidder), true);
    assert.equal(l.revealedBids.lookup(bidder), bidAmount);
    assert.equal(l.highestBid, bidAmount);
    assert.deepEqual(l.highestBidder, bidder);
    assert.equal(l.hasRevealedBids, true);
  });

  it('6. An invalid reveal is rejected', async () => {
    const harness = new AuctionHarness();
    await harness.init();

    const bidder = createBidderKey(1);
    const trueNonce = createNonce(5);
    const fakeNonce = createNonce(9);
    const trueBid = 150n;
    const fakeBid = 200n;
    const commitment = harness.computeCommitment(trueBid, trueNonce);

    await harness.callCircuit('submitBid', bidder, commitment);
    await harness.callCircuit('closeAuction', bidder);

    // Mismatched bid amount
    await assert.rejects(
      async () => {
        await harness.callCircuit('revealBid', bidder, fakeBid, trueNonce);
      },
      (err) => {
        assert.match(err.message, /Commitment mismatch/);
        return true;
      }
    );

    // Mismatched nonce
    await assert.rejects(
      async () => {
        await harness.callCircuit('revealBid', bidder, trueBid, fakeNonce);
      },
      (err) => {
        assert.match(err.message, /Commitment mismatch/);
        return true;
      }
    );
  });

  it('7. A bidder who never committed cannot reveal', async () => {
    const harness = new AuctionHarness();
    await harness.init();

    const bidder1 = createBidderKey(1);
    const uncommittedBidder = createBidderKey(99);
    const nonce = createNonce(1);
    const commitment1 = harness.computeCommitment(100n, nonce);

    await harness.callCircuit('submitBid', bidder1, commitment1);
    await harness.callCircuit('closeAuction', bidder1);

    await assert.rejects(
      async () => {
        await harness.callCircuit('revealBid', uncommittedBidder, 100n, nonce);
      },
      (err) => {
        assert.match(err.message, /Bidder has not submitted a bid/);
        return true;
      }
    );
  });

  it('8. The same bid cannot be revealed twice', async () => {
    const harness = new AuctionHarness();
    await harness.init();

    const bidder = createBidderKey(1);
    const nonce = createNonce(1);
    const bidAmount = 100n;
    const commitment = harness.computeCommitment(bidAmount, nonce);

    await harness.callCircuit('submitBid', bidder, commitment);
    await harness.callCircuit('closeAuction', bidder);
    await harness.callCircuit('revealBid', bidder, bidAmount, nonce);

    await assert.rejects(
      async () => {
        await harness.callCircuit('revealBid', bidder, bidAmount, nonce);
      },
      (err) => {
        assert.match(err.message, /Bid already revealed/);
        return true;
      }
    );
  });

  it('9. Highest valid bid is selected', async () => {
    const harness = new AuctionHarness();
    await harness.init();

    const bidder1 = createBidderKey(1);
    const bidder2 = createBidderKey(2);
    const bidder3 = createBidderKey(3);

    const nonce1 = createNonce(1);
    const nonce2 = createNonce(2);
    const nonce3 = createNonce(3);

    const bid1 = 100n;
    const bid2 = 350n;
    const bid3 = 220n;

    await harness.callCircuit('submitBid', bidder1, harness.computeCommitment(bid1, nonce1));
    await harness.callCircuit('submitBid', bidder2, harness.computeCommitment(bid2, nonce2));
    await harness.callCircuit('submitBid', bidder3, harness.computeCommitment(bid3, nonce3));

    await harness.callCircuit('closeAuction', bidder1);

    await harness.callCircuit('revealBid', bidder1, bid1, nonce1);
    await harness.callCircuit('revealBid', bidder2, bid2, nonce2);
    await harness.callCircuit('revealBid', bidder3, bid3, nonce3);

    await harness.callCircuit('closeReveal', bidder1);
    await harness.callCircuit('finalizeAuction', bidder1);

    const result = await harness.callCircuit('getAuctionResult', bidder1);
    assert.equal(result.hasWinner, true);
    assert.equal(result.winningBid, 350n);
    assert.deepEqual(result.winningBidder, bidder2);
  });

  it('10. No-bid auction is handled correctly', async () => {
    const harness = new AuctionHarness();
    await harness.init();

    const deployer = createBidderKey(1);

    await harness.callCircuit('closeAuction', deployer);
    await harness.callCircuit('closeReveal', deployer);
    await harness.callCircuit('finalizeAuction', deployer);

    const result = await harness.callCircuit('getAuctionResult', deployer);
    assert.equal(result.hasWinner, false);
    assert.equal(result.winningBid, 0n);
    assert.deepEqual(result.winningBidder, new Uint8Array(32));

    const l = harness.getLedger();
    assert.equal(l.isFinalized, true);
    assert.equal(l.hasWinner, false);
  });

  it('11. Winner cannot be determined before the reveal phase ends', async () => {
    const harness = new AuctionHarness();
    await harness.init();

    const bidder = createBidderKey(1);
    const nonce = createNonce(1);
    const bid = 100n;

    // While bidding is active
    await harness.callCircuit('submitBid', bidder, harness.computeCommitment(bid, nonce));
    await assert.rejects(
      async () => {
        await harness.callCircuit('determineWinner', bidder);
      },
      (err) => {
        assert.match(err.message, /Auction is still active/);
        return true;
      }
    );

    // While reveal is active
    await harness.callCircuit('closeAuction', bidder);
    await harness.callCircuit('revealBid', bidder, bid, nonce);

    await assert.rejects(
      async () => {
        await harness.callCircuit('determineWinner', bidder);
      },
      (err) => {
        assert.match(err.message, /Reveal phase is not complete/);
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await harness.callCircuit('finalizeAuction', bidder);
      },
      (err) => {
        assert.match(err.message, /Reveal phase is not complete/);
        return true;
      }
    );
  });

  it('12. Auction cannot be finalized twice', async () => {
    const harness = new AuctionHarness();
    await harness.init();

    const bidder = createBidderKey(1);
    const nonce = createNonce(1);
    const bid = 100n;

    await harness.callCircuit('submitBid', bidder, harness.computeCommitment(bid, nonce));
    await harness.callCircuit('closeAuction', bidder);
    await harness.callCircuit('revealBid', bidder, bid, nonce);
    await harness.callCircuit('closeReveal', bidder);

    await harness.callCircuit('finalizeAuction', bidder);

    await assert.rejects(
      async () => {
        await harness.callCircuit('finalizeAuction', bidder);
      },
      (err) => {
        assert.match(err.message, /Auction already finalized/);
        return true;
      }
    );
  });
});
