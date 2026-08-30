import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type AuctionResult = { hasWinner: boolean;
                              winningBidder: Uint8Array;
                              winningBid: bigint
                            };

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  submitBid(context: __compactRuntime.CircuitContext<PS>,
            commitment_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  closeAuction(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  revealBid(context: __compactRuntime.CircuitContext<PS>,
            bid_0: bigint,
            nonce_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  closeReveal(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  determineWinner(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  finalizeAuction(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  getAuctionResult(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, AuctionResult>>;
}

export type ProvableCircuits<PS> = {
  submitBid(context: __compactRuntime.CircuitContext<PS>,
            commitment_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  closeAuction(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  revealBid(context: __compactRuntime.CircuitContext<PS>,
            bid_0: bigint,
            nonce_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  closeReveal(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  determineWinner(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  finalizeAuction(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  getAuctionResult(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, AuctionResult>>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  submitBid(context: __compactRuntime.CircuitContext<PS>,
            commitment_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  closeAuction(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  revealBid(context: __compactRuntime.CircuitContext<PS>,
            bid_0: bigint,
            nonce_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  closeReveal(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  determineWinner(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  finalizeAuction(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, []>>;
  getAuctionResult(context: __compactRuntime.CircuitContext<PS>): Promise<__compactRuntime.CircuitResults<PS, AuctionResult>>;
}

export type Ledger = {
  readonly auctionActive: boolean;
  readonly revealActive: boolean;
  readonly winnerDetermined: boolean;
  readonly isFinalized: boolean;
  readonly hasWinner: boolean;
  readonly hasRevealedBids: boolean;
  readonly bidCount: bigint;
  bids: {
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
  readonly highestBid: bigint;
  readonly highestBidder: Uint8Array;
  readonly winningBid: bigint;
  readonly winningBidder: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
