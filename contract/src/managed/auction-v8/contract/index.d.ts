import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type AuctionResult = { hasWinner: boolean;
                              winningBidder: Uint8Array;
                              winningBid: bigint
                            };

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  createAuction(context: __compactRuntime.CircuitContext<PS>,
                auctionId_0: Uint8Array,
                name_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitBid(context: __compactRuntime.CircuitContext<PS>,
            auctionId_0: Uint8Array,
            commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeAuction(context: __compactRuntime.CircuitContext<PS>,
               auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revealBid(context: __compactRuntime.CircuitContext<PS>,
            auctionId_0: Uint8Array,
            bid_0: bigint,
            nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeReveal(context: __compactRuntime.CircuitContext<PS>,
              auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  determineWinner(context: __compactRuntime.CircuitContext<PS>,
                  auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  finalizeAuction(context: __compactRuntime.CircuitContext<PS>,
                  auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  getAuctionResult(context: __compactRuntime.CircuitContext<PS>,
                   auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, AuctionResult>;
}

export type ProvableCircuits<PS> = {
  createAuction(context: __compactRuntime.CircuitContext<PS>,
                auctionId_0: Uint8Array,
                name_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitBid(context: __compactRuntime.CircuitContext<PS>,
            auctionId_0: Uint8Array,
            commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeAuction(context: __compactRuntime.CircuitContext<PS>,
               auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revealBid(context: __compactRuntime.CircuitContext<PS>,
            auctionId_0: Uint8Array,
            bid_0: bigint,
            nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeReveal(context: __compactRuntime.CircuitContext<PS>,
              auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  determineWinner(context: __compactRuntime.CircuitContext<PS>,
                  auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  finalizeAuction(context: __compactRuntime.CircuitContext<PS>,
                  auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  getAuctionResult(context: __compactRuntime.CircuitContext<PS>,
                   auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, AuctionResult>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  createAuction(context: __compactRuntime.CircuitContext<PS>,
                auctionId_0: Uint8Array,
                name_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  submitBid(context: __compactRuntime.CircuitContext<PS>,
            auctionId_0: Uint8Array,
            commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeAuction(context: __compactRuntime.CircuitContext<PS>,
               auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revealBid(context: __compactRuntime.CircuitContext<PS>,
            auctionId_0: Uint8Array,
            bid_0: bigint,
            nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeReveal(context: __compactRuntime.CircuitContext<PS>,
              auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  determineWinner(context: __compactRuntime.CircuitContext<PS>,
                  auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  finalizeAuction(context: __compactRuntime.CircuitContext<PS>,
                  auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  getAuctionResult(context: __compactRuntime.CircuitContext<PS>,
                   auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, AuctionResult>;
}

export type Ledger = {
  auctionNames: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  auctionCreators: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  auctionActive: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  revealActive: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  winnerDetermined: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  isFinalized: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  hasWinner: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  hasRevealedBids: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  bids: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  bidAuctionIds: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  bidders: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  revealedBids: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  highestBids: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  highestBidders: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  winningBids: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  winningBidders: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
