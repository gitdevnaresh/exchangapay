/**
 * The legacy API layer — security finding H-01.
 *
 * This file used to create seven apisauce instances from hardcoded host
 * literals with no interceptors of any kind: no Authorization header, no
 * device-risk header, no attestation, no idempotency key, no redacted error
 * capture, and no way to repoint a host per environment. It was not dead code
 * — nine service modules and the transaction/crypto thunks move bank
 * transfers, balances, account details and payee additions through it, on the
 * dashboard's primary render path.
 *
 * Two things changed and nothing else:
 *
 *   1. Every base URL is resolved from environments/*.js instead of a literal.
 *   2. Every instance runs the same interceptor stack as ApiService.ts, from
 *      the one place it is now defined (./apiInterceptors).
 *
 * The endpoints, methods and exported names are untouched, so no call site
 * needs to change. This file is still scheduled for deletion — every service
 * should migrate onto ApiService.ts — but until then it is no longer a hole in
 * the controls.
 *
 * NOTE for whoever migrates the services: the exchangapay hosts below now
 * resolve per environment (tst -> tstapi.exchangapay.com), where the literals
 * always pointed at the production host regardless of the build. That is the
 * intended fix for the cross-environment traffic in H-04 scenario C, and it is
 * the one behavioural change here.
 */

import { create } from "apisauce";
import {
  applyStandardInterceptors,
  applyThirdPartyInterceptors,
  getUrl,
} from "./apiInterceptors";

const transactionApi = create({
  baseURL: getUrl("walletGridUrl"),
});
const authApi = create({
  baseURL: getUrl("authUrl"),
});

const api = create({
  baseURL: getUrl("walletApiUrl"),
});

const marketApi = create({
  baseURL: getUrl("marketUrl"),
  headers: {},
});

const cardApi = create({
  baseURL: getUrl("cardsUrl"),
});

// `uploadapi`, `coingico` and `memberInfoAPI` used to be exported from here and
// had no callers anywhere in src/ — the upload instance duplicated the one in
// ApiService.ts, `coingico` was imported by crypto.tsx and never called, and
// memberInfoAPI was a bare URL string nothing read. Deleted rather than
// hardened: an instance with no callers is not a route to secure, it is three
// more base URLs to keep in the pin inventory.

// Our own backends: bearer token, client IP, device posture, idempotency and
// redacted error capture.
[transactionApi, authApi, api, cardApi].forEach((instance) =>
  applyStandardInterceptors(instance)
);

// CoinGecko. A third party gets neither our session credential nor our fraud
// signal — only the error interceptor, so a failed market-data call surfaces in
// telemetry instead of as a silent spinner.
applyThirdPartyInterceptors(marketApi);

// `setToken`/`access_token` used to live here. Nothing ever called setToken,
// and the token now comes from the single Keychain accessor inside the request
// interceptor (H-11) rather than a module-level variable that could go stale.

export { transactionApi, authApi, marketApi, api, cardApi };
