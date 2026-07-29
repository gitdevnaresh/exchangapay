/**
 * Idempotency Configuration
 *
 * Maps API paths to payload fields used for generating X-Idempotency-Key.
 * Key composition: fastHash(userId + selected payload values)
 */
export interface IdempotencyEntry {
    path: string;
    params: string[];
}

const idempotencyConfig: IdempotencyEntry[] = [
    // Exchange transaction (cards deposit)
    {
        path: "api/v1/ExchangeTransaction/Deposit/TopUp",
        params: ["cardId", "cardNumber", "amount"],
    },
    // Exchange transaction (crypto withdraw)
    {
        path: "api/v1/ExchangeTransaction/Withdraw/Crypto",
        params: ["payeeId", "amount", "walletAddress"],
    },
    {
        path: "api/v1/Common/TwoFactorAuthenticationURL",
        params: ["payeeId", "amount", "walletAddress"]
    }
];

export default idempotencyConfig;

/**
 * Fast synchronous non-cryptographic hash for idempotency key generation.
 */
export const fastHash = (str: string): string => {
    let h1 = 0x811c9dc5 >>> 0;
    let h2 = 0x01000193 >>> 0;

    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
        h2 = Math.imul(h2 ^ c, 0x811c9dc5) >>> 0;
    }

    return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
};
