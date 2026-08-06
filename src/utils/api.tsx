/**
 * The legacy API layer — security findings H-01, N-01.
 *
 * ===========================================================================
 * WHAT THIS FILE WAS
 * ===========================================================================
 * Seven apisauce instances built from hardcoded host literals with no
 * interceptors of any kind: no Authorization header, no device-risk header, no
 * attestation, no idempotency key, no redacted error capture, and no way to
 * repoint a host per environment (H-01). H-01 attached the shared interceptor
 * stack and moved the hosts into configuration.
 *
 * ===========================================================================
 * N-01 — WHY THREE INSTANCES ARE GONE RATHER THAN FIXED
 * ===========================================================================
 * Moving the hosts into configuration surfaced something the literals had been
 * hiding: four of them did not exist.
 *
 *     neowalletgrid.azurewebsites.net   NXDOMAIN
 *     neowalletapi.azurewebsites.net    NXDOMAIN
 *     neobank.azurewebsites.net         NXDOMAIN
 *     tstlogin.suissebase.io            NXDOMAIN
 *
 * That is the finding recorded in the header of ./scripts/verify-hosts.sh, and
 * it re-verifies today. These hosts were dead BEFORE the migration — the app
 * had been calling them for as long as they were hardcoded here, and nothing
 * said a word, because a request to a host that does not resolve looks exactly
 * like a request to a host that is briefly down and until H-01 attached a
 * response interceptor there was no telemetry on these routes at all.
 *
 * So `transactionApi`, `api` and `authApi` were not carrying live traffic that
 * a config change broke. They were carrying nothing, in every build, for as
 * long as anyone can see in the history. Restoring the dead hosts to the .env
 * files would have restored a base URL that resolves to nothing — the calls
 * would fail exactly as they do now, just with a DNS error instead of an
 * invalid-URL error, and the dead hosts would be back in the pin inventory.
 *
 * Their call sites now go through ApiService.ts, which resolves to the live,
 * certificate-pinned first-party host. Evidence that this is the right target
 * rather than a guess: onBoardingservice.tsx already had two functions for the
 * SAME Sumsub endpoint — `sumsubToken` on the dead host and `sumsubAccessToken`
 * on ApiService — differing only in the casing of "SumSub". The migration had
 * started; it was simply never finished.
 *
 * ===========================================================================
 * WHAT REMAINS
 * ===========================================================================
 * `cardApi` and `marketApi`, both pointed at hosts that resolve, both covered
 * by the pin inventory (marketApi via a written exemption). `cardApi` is a
 * duplicate of the instance inside ApiService.ts and should be folded into it;
 * that is a mechanical change to its call sites, not a host question, so it is
 * left for the migration that finishes this file off.
 */

import { create } from "apisauce";
import {
  applyStandardInterceptors,
  applyThirdPartyInterceptors,
  getUrl,
} from "./apiInterceptors";

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

// Our own backend: bearer token, client IP, device posture, idempotency and
// redacted error capture.
applyStandardInterceptors(cardApi);

// CoinGecko. A third party gets neither our session credential nor our fraud
// signal — only the error interceptor, so a failed market-data call surfaces in
// telemetry instead of as a silent spinner.
applyThirdPartyInterceptors(marketApi);

// `setToken`/`access_token` used to live here. Nothing ever called setToken,
// and the token now comes from the single Keychain accessor inside the request
// interceptor (H-11) rather than a module-level variable that could go stale.

export { marketApi, cardApi };
