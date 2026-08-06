/**
 * Idempotency Configuration
 *
 * Maps the money-moving API paths which require X-Idempotency-Key.
 *
 * Keys are deliberately random, never derived from user or transaction data.
 * A key identifies one attempted operation; callers/retry middleware must reuse
 * the key already attached to that attempt rather than minting a new one.
 */
export interface IdempotencyEntry {
    path: string;
}

const idempotencyConfig: IdempotencyEntry[] = [
    // Fiat bank transfer.
    {
        path: "api/v1/Bank/Transfer",
    },
    // Card top-up.
    {
        path: "api/v1/Cards/TopupCard",
    },
    // Exchange transaction (cards deposit)
    {
        path: "api/v1/ExchangeTransaction/Deposit/TopUp",
    },
    // Exchange transaction (crypto withdraw)
    {
        path: "api/v1/ExchangeTransaction/Withdraw/Crypto",
    },
    // Final crypto withdrawal confirmation. This route is served by the wallet
    // API rather than the ExchangeTransaction API, but it is still a
    // money-moving operation and must be safe to retry.
    {
        path: "api/v1/Withdraw/Withdraw/Crypto",
    },
    {
        path: "api/v1/Common/TwoFactorAuthenticationURL",
    }
];

export default idempotencyConfig;
