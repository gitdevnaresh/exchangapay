/**
 * Idempotency Configuration
 *
 * Maps API paths to the payload fields used for generating X-Idempotency-Key.
 * Key composition: fastHash(userId + param values from payload)
 *
 * - `path`: Full request path (excluding origin). Matched against config.url in interceptor.
 * - `params`: Array of payload field names whose values form the idempotency key.
 *             Customisable per endpoint — change params to match what makes a request unique.
 *
 * To add a new endpoint:
 *   1. Add an entry below with the exact path and relevant payload fields.
 *   2. That's it — the interceptor handles the rest.
 */
/**
 * Idempotency Configuration
 *
 * Maps API paths to the payload fields used for generating X-Idempotency-Key.
 * Key composition: fastHash(userId + param values from payload)
 *
 * - `path`: Full request path (excluding origin). Matched against config.url in interceptor.
 * - `params`: Array of payload field names whose values form the idempotency key.
 *             Customisable per endpoint — change params to match what makes a request unique.
 *
 * To add a new endpoint:
 *   1. Add an entry below with the exact path and relevant payload fields.
 *   2. That's it — the interceptor handles the rest.
 */
const idempotencyConfig = [
  // Exchange
  {
    path: 'api/v1/buy',
    params: ['fromAsset', 'toAsset', 'fromValue'],
  },
  {
    path: 'api/v1/sell',
    params: ['fromAsset', 'toAsset', 'fromValue'],
  },
 
  // Crypto withdraw
  {
    path: 'api/v1/withdraw/crypto',
    params: ['payeeId', 'amount', 'cryptorWalletId'],
  },
 
  // Fiat withdraw
  {
    path: 'api/v1/withdraw/fiat',
    params: ['payeeId', 'amount', 'fiatWalletId'],
  },
 
  // Payout
  {
    path: 'api/v1/payments/payout/crypto?type=payoutcrypto',
    params: ['customerWalletId','payeeId', 'requestedAmount', 'fiatCurrency'],
  },
  {
    path: 'api/v1/payments/payout/fiat?type=payoutfiat',
    params: ['customerWalletId','payeeId', 'requestedAmount', 'fiatCurrency'],
  },
     // Bank withdraw
  {
    path: 'api/v1/accounts/withdraw',
    params: ['amount', 'accountId','currency'],
  },
 
  // AccountCreation
  {
    path: 'api/v1/banks/{bankId}/account',
    params: ['walletId', 'amount'],
  },
 
  // Cards
  {
    path: 'api/v1/cards/topup',
    params: ['programId', 'cryptoWalletId', 'amount'],
  },
  {
    path: 'api/v1/withdraw',
    params: ['cardId', 'amount'],
  },
  {
    path: 'api/v1/cards/virtual/apply',
    params: ['cardId','cryptoWalletId', 'amount'],
  },
  {
    path: 'api/v1/cards/customerphysical/apply',
    params: ['cardId', 'cryptoWalletId', 'amount'],
  },
  {
    path: 'api/v1/cards/virtual/applycard',
    params: ['cardId', 'cryptoWalletId', 'amount'],
  },
  {
    path: 'api/v1/cards/customer/holdercreation',
    params: ['cardId', 'cryptoWalletId', 'amount'],
  },
];
 
export default idempotencyConfig;

/**
 * Fast synchronous hash (FNV-1a 128-bit via dual 53-bit) — sub-microsecond.
 * Used for idempotency keys where speed matters and cryptographic strength is not required.
 */
export const fastHash = (str) => {
  let h1 = 0x811c9dc5 >>> 0;
  let h2 = 0x01000193 >>> 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x811c9dc5) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
};
