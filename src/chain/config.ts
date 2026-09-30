/** Set this to the deployed Preprod contract address before deploying the site. */
export const AUCTION_CONTRACT_ADDRESS = import.meta.env.VITE_AUCTION_CONTRACT_ADDRESS?.trim() ?? '';
export const AUCTION_CONTRACT_ERA = import.meta.env.VITE_AUCTION_CONTRACT_ERA === 'ledger8'
  ? 'ledger8'
  : import.meta.env.VITE_AUCTION_CONTRACT_ERA === 'ledger9'
    ? 'ledger9'
    : null;
