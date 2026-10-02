/**
 * Crypto address validation and payment-URI (QR) parsing — security finding M-10.
 *
 * The previous validator checked TRC-20 and Polygon against a regex and
 * returned `true` for every other network, so ERC-20, BEP-20, BTC and SOL
 * accepted any string. A regex also cannot catch a mistyped character: these
 * formats carry a checksum precisely so a typo is detectable, and funds sent to
 * a wrong address are gone. Every supported network is now checked, checksum
 * included, and an unknown network is rejected rather than waved through.
 *
 * QR codes used to be read with `data.split(":")[1]`, which ignored the
 * scheme (a `bitcoin:` code was accepted on an ERC-20 screen), kept `?amount=`
 * and `@chainId` glued to the address, and for an EIP-681 token transfer
 * returned the token CONTRACT instead of the recipient. parsePaymentUri()
 * reads BIP-21 / EIP-681 properly and refuses a network mismatch.
 *
 * Pure module (no React Native or env imports) so it is unit-testable; the
 * environment-dependent testnet switch is passed in by the caller.
 */

import { keccak_256 } from "@noble/hashes/sha3";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import { base58, bech32, bech32m, createBase58check } from "@scure/base";

export type NetworkFamily = "evm" | "btc" | "tron" | "sol";
export type EvmChain = "erc20" | "bep20" | "pol";

export type ResolvedNetwork = { family: NetworkFamily; chain?: EvmChain };

/**
 * Network codes as the API may spell them, compared after lower-casing and
 * stripping everything but letters and digits ("ERC-20" → "erc20").
 */
const NETWORK_ALIASES: Record<string, ResolvedNetwork> = {
  erc20: { family: "evm", chain: "erc20" },
  eth: { family: "evm", chain: "erc20" },
  ethereum: { family: "evm", chain: "erc20" },
  bep20: { family: "evm", chain: "bep20" },
  bsc: { family: "evm", chain: "bep20" },
  bnb: { family: "evm", chain: "bep20" },
  bnbsmartchain: { family: "evm", chain: "bep20" },
  binancesmartchain: { family: "evm", chain: "bep20" },
  pol: { family: "evm", chain: "pol" },
  polygon: { family: "evm", chain: "pol" },
  matic: { family: "evm", chain: "pol" },
  trc20: { family: "tron" },
  trx: { family: "tron" },
  tron: { family: "tron" },
  btc: { family: "btc" },
  bitcoin: { family: "btc" },
  sol: { family: "sol" },
  solana: { family: "sol" },
  spl: { family: "sol" },
};

export const resolveNetwork = (
  network: string | undefined | null
): ResolvedNetwork | null => {
  const key = String(network ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return NETWORK_ALIASES[key] ?? null;
};

// ---------------------------------------------------------------------------
// Per-network checks
// ---------------------------------------------------------------------------

const base58check = createBase58check(sha256);

/**
 * EVM (ERC-20, BEP-20, Polygon). An all-lower or all-upper address carries no
 * checksum and is accepted as-is; a mixed-case one must match EIP-55.
 */
export const isValidEvmAddress = (address: string): boolean => {
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return false;
  const body = address.slice(2);
  if (body === body.toLowerCase() || body === body.toUpperCase()) return true;

  const hash = bytesToHex(keccak_256(body.toLowerCase()));
  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (/[a-f]/i.test(char)) {
      const shouldBeUpper = parseInt(hash[i], 16) >= 8;
      if (shouldBeUpper !== (char === char.toUpperCase())) return false;
    }
  }
  return true;
};

const BTC_BASE58_VERSIONS = {
  mainnet: [0x00, 0x05], // P2PKH "1…", P2SH "3…"
  testnet: [0x6f, 0xc4], // P2PKH "m…/n…", P2SH "2…"
};

type Bech32Codec = typeof bech32;

const tryBech32Decode = (codec: Bech32Codec, value: string) => {
  try {
    return codec.decode(value as `${string}1${string}`);
  } catch {
    return null;
  }
};

/** SegWit v0 (bech32) and v1+ / Taproot (bech32m), per BIP-173 and BIP-350. */
const isValidSegwitAddress = (address: string, hrp: "bc" | "tb"): boolean => {
  // Mixed case is invalid by definition; all-upper is legal (QR alphanumeric).
  if (address !== address.toLowerCase() && address !== address.toUpperCase()) {
    return false;
  }
  const value = address.toLowerCase();

  const v0 = tryBech32Decode(bech32, value);
  const decoded = v0 ?? tryBech32Decode(bech32m as Bech32Codec, value);
  if (!decoded || decoded.prefix !== hrp || decoded.words.length === 0) {
    return false;
  }

  const [version, ...programWords] = decoded.words;
  // bech32 is only valid for v0, bech32m only for v1-16.
  if (v0 ? version !== 0 : version < 1 || version > 16) return false;

  let program: Uint8Array;
  try {
    program = bech32.fromWords(programWords);
  } catch {
    return false;
  }
  if (version === 0) return program.length === 20 || program.length === 32;
  if (version === 1) return program.length === 32;
  return program.length >= 2 && program.length <= 40;
};

export const isValidBtcAddress = (address: string, allowTestnet: boolean): boolean => {
  const lower = address.toLowerCase();
  if (lower.startsWith("bc1")) return isValidSegwitAddress(address, "bc");
  if (lower.startsWith("tb1")) {
    return allowTestnet && isValidSegwitAddress(address, "tb");
  }

  let payload: Uint8Array;
  try {
    payload = base58check.decode(address);
  } catch {
    return false;
  }
  if (payload.length !== 21) return false;
  const versions = allowTestnet
    ? [...BTC_BASE58_VERSIONS.mainnet, ...BTC_BASE58_VERSIONS.testnet]
    : BTC_BASE58_VERSIONS.mainnet;
  return versions.includes(payload[0]);
};

/**
 * TRON. The base58 "T…" form is checksum-verified. The raw hex form
 * ("41" + 20 bytes) has no checksum but was accepted before and is kept.
 */
export const isValidTronAddress = (address: string): boolean => {
  if (/^41[0-9a-fA-F]{40}$/.test(address)) return true;
  try {
    const payload = base58check.decode(address);
    return payload.length === 21 && payload[0] === 0x41;
  } catch {
    return false;
  }
};

/** Solana: base58 of a 32-byte public key. Solana addresses carry no checksum. */
export const isValidSolanaAddress = (address: string): boolean => {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return false;
  try {
    return base58.decode(address).length === 32;
  } catch {
    return false;
  }
};

export type AddressValidationOptions = {
  /** Also accept BTC testnet formats (tb1…, m/n/2…). Non-production only. */
  allowTestnet?: boolean;
};

export const isValidAddressForNetwork = (
  network: string | undefined | null,
  address: string | undefined | null,
  { allowTestnet = false }: AddressValidationOptions = {}
): boolean => {
  if (!network || !address) return false;
  const resolved = resolveNetwork(network);
  // Fail closed: a network this app does not know how to check is not "valid".
  if (!resolved) return false;

  const value = address.trim();
  switch (resolved.family) {
    case "evm":
      return isValidEvmAddress(value);
    case "btc":
      return isValidBtcAddress(value, allowTestnet);
    case "tron":
      return isValidTronAddress(value);
    case "sol":
      return isValidSolanaAddress(value);
    default:
      return false;
  }
};

// ---------------------------------------------------------------------------
// QR / payment URI parsing
// ---------------------------------------------------------------------------

const SCHEME_FAMILY: Record<string, NetworkFamily> = {
  bitcoin: "btc",
  ethereum: "evm",
  tron: "tron",
  solana: "sol",
};

/** EIP-155 chain IDs per EVM network, mainnet first, then testnets. */
const EVM_CHAIN_IDS: Record<EvmChain, number[]> = {
  erc20: [1, 11155111, 17000, 5],
  bep20: [56, 97],
  pol: [137, 80002, 80001],
};

export type PaymentUriError = "malformed" | "unsupported" | "network-mismatch";

export type ParsedPaymentUri =
  | { ok: true; address: string }
  | { ok: false; reason: PaymentUriError };

const parseQuery = (query: string): Record<string, string> => {
  const params: Record<string, string> = {};
  for (const pair of query.split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const key = eq < 0 ? pair : pair.slice(0, eq);
    const raw = eq < 0 ? "" : pair.slice(eq + 1);
    try {
      params[decodeURIComponent(key)] = decodeURIComponent(raw);
    } catch {
      params[key] = raw;
    }
  }
  return params;
};

/**
 * Pull the recipient address out of a scanned QR code.
 *
 * - A bare address is returned unchanged (as before).
 * - `bitcoin:`, `tron:`, `solana:` (BIP-21 style): the path is the address and
 *   the query (`?amount=…`) is dropped.
 * - `ethereum:` (EIP-681): `[pay-]<target>[@<chainId>][/<function>][?params]`.
 *   For `/transfer` the recipient is `?address=`, NOT the target (which is the
 *   token contract). A chain ID that does not belong to `network` is refused.
 *
 * When `network` is given, a URI for a different network family is refused.
 * The returned address still has to pass isValidAddressForNetwork().
 */
export const parsePaymentUri = (
  raw: string | undefined | null,
  network?: string | null
): ParsedPaymentUri => {
  const text = String(raw ?? "").trim();
  if (!text) return { ok: false, reason: "malformed" };

  const colon = text.indexOf(":");
  if (colon < 0) return { ok: true, address: text };

  const family = SCHEME_FAMILY[text.slice(0, colon).toLowerCase()];
  if (!family) return { ok: false, reason: "unsupported" };

  const target = network ? resolveNetwork(network) : null;
  if (target && target.family !== family) {
    return { ok: false, reason: "network-mismatch" };
  }

  const rest = text.slice(colon + 1).replace(/^\/\//, "");
  const queryStart = rest.indexOf("?");
  const path = queryStart < 0 ? rest : rest.slice(0, queryStart);
  const params = parseQuery(queryStart < 0 ? "" : rest.slice(queryStart + 1));

  if (family !== "evm") {
    return path ? { ok: true, address: path } : { ok: false, reason: "malformed" };
  }

  const match = /^(?:pay-)?([^@/]+)(?:@(\d+))?(?:\/([A-Za-z0-9_]+))?$/.exec(path);
  if (!match) return { ok: false, reason: "malformed" };
  const [, targetAddress, chainId, fn] = match;

  if (chainId && target?.chain && !EVM_CHAIN_IDS[target.chain].includes(Number(chainId))) {
    return { ok: false, reason: "network-mismatch" };
  }

  if (fn) {
    // Only an ERC-20 transfer names a recipient we can use.
    if (fn !== "transfer" || !params.address) return { ok: false, reason: "unsupported" };
    return { ok: true, address: params.address };
  }
  return { ok: true, address: targetAddress };
};

export const paymentUriErrorMessage = (reason: PaymentUriError): string => {
  switch (reason) {
    case "network-mismatch":
      return "This QR code is for a different network. Please scan an address for the selected network.";
    case "unsupported":
      return "This QR code is not supported. Please scan a wallet address QR code.";
    default:
      return "Could not read an address from this QR code.";
  }
};
