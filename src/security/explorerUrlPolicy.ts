/**
 * Which block-explorer links the app will hand to the OS — security finding L-01.
 *
 * Transaction screens built the "view on explorer" link by concatenating two
 * server-supplied strings (`explorer` + `transactionHash`) and passed the result
 * straight to `Linking.openURL`. That call opens any scheme the OS knows —
 * `intent://`, `tel:`, another app's deep link, our own `exchangapay://` — so a
 * tampered response turned the link into a phishing page or an app launcher,
 * shown inside the official app right after a real transaction.
 *
 * Two checks, each sufficient on its own to keep the link on a real explorer:
 *
 *   1. The hash may contain only letters and digits (hex, with or without 0x,
 *      or base58). Nothing it carries can move the host or open a new path
 *      segment, so `@evil.com/` or `../` in it is refused, not interpreted.
 *   2. The combined URL is parsed with the same strict https parser the 2FA
 *      WebView uses, and its host must be a known explorer domain.
 *
 * A link that fails either check is not opened. The screens still show the hash
 * with its copy button, so the user loses a shortcut, not the information.
 */

import { Linking } from "react-native";
import { log } from "../utils/logger";
import { parseHttpsUrl } from "./webViewUrlPolicy";

/**
 * Explorer domains for the networks the app supports, mainnet and testnet.
 * A subdomain of one of these is allowed too (`nile.tronscan.org`,
 * `sepolia.etherscan.io`): a subdomain is controlled by the same operator, so
 * it cannot be registered by a third party the way a look-alike domain can.
 *
 * If the backend starts returning a new explorer, add its domain here; until
 * then its links fail closed and only the copy button works.
 */
const EXPLORER_DOMAINS = [
  // TRON (TRC-20)
  "tronscan.org",
  "tronscan.io",
  // Ethereum (ERC-20)
  "etherscan.io",
  // Polygon
  "polygonscan.com",
  // BNB Smart Chain (BEP-20)
  "bscscan.com",
  // Bitcoin
  "blockstream.info",
  "mempool.space",
  "blockchair.com",
  // Solana
  "solscan.io",
  "explorer.solana.com",
  // Multi-chain
  "oklink.com",
];

/** Hex (optionally 0x-prefixed) or base58: letters and digits only. */
const TRANSACTION_HASH = /^(0x)?[A-Za-z0-9]{16,128}$/;

const isExplorerHost = (host: string): boolean =>
  EXPLORER_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));

/**
 * The explorer link for a transaction, or null when either part fails
 * validation. Never returns anything that is not an https URL on a known
 * explorer host.
 */
export const buildExplorerUrl = (explorer: unknown, transactionHash: unknown): string | null => {
  if (typeof explorer !== "string" || typeof transactionHash !== "string") return null;

  const hash = transactionHash.trim();
  if (!TRANSACTION_HASH.test(hash)) return null;

  const url = `${explorer.trim()}${hash}`;
  const parsed = parseHttpsUrl(url);
  // A port means a non-default service on that host, which no explorer link uses.
  if (!parsed || parsed.port || !isExplorerHost(parsed.host)) return null;

  return url;
};

/**
 * Which check refused a link, for the log line only. Carries no part of the
 * hash or URL, so it is safe to leave in a breadcrumb.
 */
const refusalReason = (explorer: unknown, transactionHash: unknown): string => {
  if (typeof explorer !== "string" || !explorer.trim()) return "missing-explorer";
  if (typeof transactionHash !== "string" || !transactionHash.trim()) return "missing-hash";
  if (!TRANSACTION_HASH.test(transactionHash.trim())) return "hash-format";
  const parsed = parseHttpsUrl(`${explorer.trim()}${transactionHash.trim()}`);
  if (!parsed) return "not-https-or-malformed";
  if (parsed.port) return "port";
  return "host-not-allowed";
};

/**
 * Open the explorer link for a transaction. Returns false, without opening
 * anything, when the link fails validation.
 */
export const openExplorerLink = async (
  explorer: unknown,
  transactionHash: unknown
): Promise<boolean> => {
  const url = buildExplorerUrl(explorer, transactionHash);
  if (!url) {
    log.warn("[L-01] refused an explorer link outside the allow-list", {
      reason: refusalReason(explorer, transactionHash),
      host: parseHttpsUrl(typeof explorer === "string" ? explorer.trim() : "")?.host || "unparseable",
    });
    return false;
  }
  try {
    await Linking.openURL(url);
    return true;
  } catch (error) {
    log.error("[L-01] could not open explorer link", error);
    return false;
  }
};
