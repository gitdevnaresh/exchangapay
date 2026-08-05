/**
 * Which requests carry an attestation token (H-04).
 *
 * WHY THIS IS NOT "EVERY REQUEST": Play Integrity classic requests are quota'd
 * per app per day and rate-limited per device. Attesting every list refresh and
 * every lookup would exhaust the quota on real traffic — at which point the
 * requests that matter get no token either — and would add the round trip to
 * screens that gain nothing from it. Apple has no comparable quota, but the same
 * latency argument applies.
 *
 * So: the operations that move money, expose card credentials, change where money
 * can go, or change how the account is secured. Everything else sends only the
 * advisory X-Device-Risk header.
 *
 * MATCHING IS SUBSTRING, CASE-INSENSITIVE, ON THE PATH. Deliberately loose: these
 * paths are built with template literals full of ids, and a new endpoint under an
 * existing area (say another Cards/… mutation) should be covered by default
 * rather than silently missed. The cost of a false positive is one extra token
 * request; the cost of a false negative is an unattested withdrawal.
 */

/** Sensitive path fragments, lowercase. Grouped by what an attacker gains. */
const ATTESTED_PATH_FRAGMENTS: string[] = [
  // Moving money out.
  "withdraw",
  "/transfer",
  "topupcard",
  "deposit/topup",
  "receivefunds",

  // Card credentials — PAN, CVV and PIN are card-present credentials.
  "getcardpin",
  "setcardpin",
  "showpin",
  "fetchcvv",
  "getcardbyid",
  "createcards",
  "terminatecard",
  "freezecard",
  "unfreezecard",
  "reactivatecard",

  // Where money is allowed to go. Adding a payee is the step that precedes a
  // withdrawal, which is why it counts as high-risk in its own right.
  "addressbook",
  "payee",

  // How the account is secured. Compromise here converts device access into
  // durable account access.
  "/security/",
  "twofactor",
  "phoneverification",
  "customerphonenumberupdate",
  "verifyemail",
  "update/customerprofile",
];

/**
 * True when this request should carry X-Device-Attestation.
 *
 * Never throws — a malformed url means "not sensitive", because failing to attest
 * degrades a signal while throwing here would break the request itself.
 */
export const requiresAttestation = (url?: string): boolean => {
  if (!url) return false;
  const path = url.toLowerCase();
  return ATTESTED_PATH_FRAGMENTS.some((fragment) => path.includes(fragment));
};
