# Exchanga Pay — Mobile Application Security, VAPT & Performance Audit

**Report version:** **3.0 — Second Remediation Verification Pass**
**Application:** Exchanga Pay (React Native fintech / crypto-card app)
**Repository:** `exchangapay_new_dev`
**Branch:** `rn-0.83-upgrade`
**Baseline audited (v1.0):** `c503d94` @ 2026-08-05
**First verification pass (v2.0):** `608267d` + working tree @ 2026-08-06
**Re-audited (v3.0):** `b86c318` + uncommitted working tree @ 2026-08-07
**Platform stack:** React Native 0.83.6 · React 19.2.0 · Hermes · New Architecture (Fabric)
**Audit type:** White-box source review — Mobile Security Architecture, VAPT, API Security, RN Performance
**Standards applied:** OWASP MASVS v2.1 · OWASP Mobile Top 10 (2024) · PCI-DSS v4.0 (mobile scope) · NIST SP 800-63B

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Remediation Verification Matrix](#2-remediation-verification-matrix)
3. [Verified Fixes — What Closed This Pass](#3-verified-fixes--what-closed-this-pass)
4. [Newly Identified Findings](#4-newly-identified-findings)
5. [Still-Open Findings & Fix Recommendations](#5-still-open-findings--fix-recommendations)
6. [VAPT Assessment](#6-vapt-assessment)
7. [API Security Audit](#7-api-security-audit)
8. [Android Security Review](#8-android-security-review)
9. [iOS Security Review](#9-ios-security-review)
10. [React Native Performance Audit](#10-react-native-performance-audit)
11. [Architecture & Code Quality](#11-architecture--code-quality)
12. [Dependency Audit](#12-dependency-audit)
13. [Compliance Mapping](#13-compliance-mapping)
14. [Recommendations & Roadmap](#14-recommendations--roadmap)
15. [Production Hardening Checklist](#15-production-hardening-checklist)
16. [Final Scoring](#16-final-scoring)

---

## 1. Executive Summary

### 1.1 What Changed Since v2.0

Two commits plus an uncommitted working tree landed between the v2.0 verification pass and this one:

| Commit | Date | Scope |
|---|---|---|
| `57fb43e` | 2026-08-06 | **The bulk of the v2.0 remediation** — N-01 API-layer resolution, M-02 OTP transport shim, M-03 pin-expiry telemetry, M-07 iOS entitlements, H-07 release guards, `redact.ts` |
| `b86c318` | 2026-08-06 | M-02 follow-through on the KYC screens; idempotency keys de-derived from payload data |
| *working tree* | 2026-08-07 | 2FA verification **fail-open** fix, `profile.tsx` migrated off the dead `api` instance |

**This pass is a materially better outcome than v2.0.** Every one of the three release-blocking defects v2.0 raised has been addressed, and two of them were addressed by fixing the *class* of problem rather than the instance:

- **N-01 (Critical)** is closed, and closed the right way. Rather than restoring three configuration keys, the team resolved *why* they were missing — the hosts behind them (`neowalletgrid`, `neowalletapi`, `neobank`.azurewebsites.net, `tstlogin.suissebase.io`) return NXDOMAIN and had been dead for the entire visible history. The three instances were deleted and their call sites migrated onto `ApiService.ts`. `getUrl()` now **throws** on an unknown key, so the failure mode that produced N-01 is now a build-time error rather than a silent empty base URL, and `__tests__/envContract.test.ts` asserts it.
- **N-02 (High)** no longer blocks release builds.
- **M-03 (Medium)** is fully closed with a design improvement: `security/pinning-policy.json` is now the single source of truth for pin expiry, read by the Gradle guard, the Xcode release phase, *and* runtime telemetry (`src/security/pinExpiry.ts`, wired at [App.tsx:108](App.tsx#L108)). What was a date duplicated in five places is now derived in three.
- **M-02 (Medium)** is closed on the client side by a shim (`src/security/otpTransport.ts`) that calls the body-based route first and falls back to the legacy path form only on 404/405/501 — so the finding closes with a *backend deploy* rather than a coordinated app release. Paired with `redactUrl()`, the client-side half of the exposure (OTP codes reaching Crashlytics and Sentry via `config.url`) is closed today.

### 1.2 The Headline

**The app is functional again and buildable again. The remaining blockers are all in release engineering, not in application security.**

Of the three v2.0 blockers, one is fully closed (N-01), one is worked around rather than fixed (N-02 — see **N-06**), and one is two-thirds done (N-03 — 40 tests now pass, one suite still cannot execute).

Three things still stand between this build and a shippable release, and none of them is a code change:

1. **iOS Release still signs with `CODE_SIGN_IDENTITY = "Apple Development"`** and ships `PRODUCT_BUNDLE_IDENTIFIER = com.exchangapay.tst` ([project.pbxproj:383, 401](ios/exchangapay.xcodeproj/project.pbxproj#L383)). An archive produced from this configuration is not distributable, and if it were, it would carry the test bundle identity. **This is now the single largest blocker** — the entitlements work that landed this pass is correct and complete, and it is gated behind a signing configuration that has not moved since v1.0.
2. **The Sentry organisation token is still live in git history** (`sntrys_eyJpYXQiOjE3NjEzNzQ3NDku…`, recoverable from the `sentry.properties` deletion diff). Removing it from the tree was necessary and is done; rotating it is the part that actually revokes access, and there is no evidence it has happened.
3. **`versionCode` is still `1`** on both platforms, which — as v2.0 recorded — neuters the force-update control rather than merely deferring a chore.

### 1.3 A Real Authentication Bypass Was Found and Fixed This Pass

Worth calling out separately, because it is the most consequential *security* change in the window and it is currently **uncommitted**:

```typescript
// src/screens/Profile/authentication.tsx — before
if (verifedRes?.data) { onSuccess() }        // apisauce resolves rejections too
// after
if (verifedRes?.ok && verifedRes?.data) { onSuccess() }
```

apisauce resolves on non-2xx responses. A `400 { "message": "invalid code" }` made `data` truthy, so **an incorrect Google Authenticator code took the success branch** — on [authentication.tsx](src/screens/Profile/authentication.tsx#L42) (2FA step-up verification) and on [verifyCode.tsx](src/screens/Profile/verifyCode.tsx#L83) (2FA enrolment confirmation). That is a client-side second-factor bypass on the step-up path. Whether it was exploitable end-to-end depends on whether the backend independently re-validates the factor on the *next* request; the client gate itself was open.

The fix is correct and matches the fail-closed pattern used in `guard.ts`. **Commit it.** An uncommitted security fix is one `git checkout` from being un-fixed, and it is not in any build.

This finding is recorded as **V-01** and it raises a question the audit cannot answer from source: `verifedRes?.data` as a success test is an *idiom* in this codebase. It should be grepped for and audited across every verification, payment-confirmation and permission-check path.

### 1.4 Overall App Health

| Dimension | v1.0 | v2.0 | v3.0 | Commentary |
|---|---|---|---|---|
| Security posture | Good, with critical gaps | Good | **Strong** | Network, storage, crypto, auth all pass; a genuine 2FA bypass caught and fixed |
| Functional integrity | Not assessed | Broken | **Restored** | N-01 closed; dead hosts retired rather than resurrected |
| Release engineering | Poor | Blocked | **Blocked (iOS only)** | Android release path is clean; iOS signing identity and bundle ID are wrong |
| Control assurance | Narrow but deep | Absent | **Partial** | 40 tests execute and pass; 1 suite cannot run; 4 cited suites still absent |
| Performance maturity | Below average | Below average | **Below average** | No performance work in either pass |
| Architecture maturity | Transitional | Transitional | **Improving** | Legacy API layer down from 7 instances to 2; both behind one chokepoint |
| Supply-chain health | Good | Good | **Fair** | New: `js-yaml` high-severity CVE (build-time only) |

### 1.5 Risk Summary

```
     Critical  0  —                 C-01 partial (history), N-01 CLOSED
     High      2  ████              H-07 (iOS signing), N-08 (js-yaml CVE, build-time)
     Medium    7  ██████████████    N-03(p), N-04, N-05, N-06, M-01(p), M-02(p), M-07(p), 9.1
     Low       9  ██████████████████
     Perf      8  ████████████████
     Arch      4  ████████
     Total    30
```

**Overall Risk Rating: MEDIUM** *(lowered from High)*

The Critical band is empty. The two High findings are both narrow and both have a known, mechanical fix. What remains is a long tail of Medium/Low items — the normal shape of a fintech app approaching release, rather than the shape of one with structural defects.

**Not yet production-ready**, but the gap is now measured in hours of release-engineering work rather than in remediation.

### 1.6 What To Do Before The Next Build

1. **Commit the 2FA fail-open fix.** It is uncommitted. **(V-01)**
2. Set iOS Release `CODE_SIGN_IDENTITY = "Apple Distribution"`, `CODE_SIGN_STYLE = Manual`, a real `PROVISIONING_PROFILE_SPECIFIER`, and `PRODUCT_BUNDLE_IDENTIFIER = com.exchangapay`. **(H-07)**
3. **Rotate the Sentry token** and confirm revocation in the Sentry audit log. **(C-01)**
4. Add `transformIgnorePatterns` to `jest.config.js` so `securityInvariants.test.ts` executes. **(N-03)**
5. Repoint `scripts/verify-hosts.sh` and `scripts/compute-spki-pins.sh` at `.env` — both still read the deleted `environments/*.js`. **(N-04)**

---

## 2. Remediation Verification Matrix

Every finding from v1.0 and v2.0, re-tested against `b86c318` + working tree.

| ID | Severity | Title | v2.0 | v3.0 Status | Evidence |
|---|---|---|---|---|---|
| **C-01** | Critical | Sentry org auth token in tree & history | 🟡 Partial | 🟡 **Partial — unchanged** | Token absent from both `sentry.properties`; `sntrys_eyJ…` still recoverable from the `git log -p` deletion diff |
| **H-01** | High | Legacy API layer bypasses all controls | 🟡 Broken in delivery | ✅ **Fixed** | [api.tsx](src/utils/api.tsx) now exports 2 instances, both intercepted; 5 dead instances deleted |
| **H-02** | High | Pinning covers 2 of 8 hosts | ✅ Fixed | ✅ **Fixed** | Inventory is 3 live hosts; Gradle + Xcode parity guards; see **N-06** for a modelling defect |
| **H-03** | High | Backend HTML in card-PIN WebView | ✅ Fixed | ✅ **Fixed** | [showPin.tsx](src/screens/Tlv_Cards/showPin.tsx) — sanitised, CSP, nav-gated |
| **H-04** | High | Test build calls production hosts | ✅ Fixed | ✅ **Fixed** | Single `.env` source; H-13 guard now actually executes and compares `APP_ENV` vs resolved bundle ID |
| **H-05** | High | Force-update path disabled | 🟡 Partial | 🟡 **Partial** | `<ForceUpdate>` mounted; still neutered by **L-05** (`versionCode 1`) |
| **H-07** | High | iOS release signing / hardening | 🟡 Partial | 🟡 **Partial — major progress** | Entitlements now applied on both configs; `aps-environment` asserted; **signing identity + bundle ID still wrong** |
| **M-01** | Medium | Attestation not enforced server-side | 🟡 Partial | 🟡 **Partial** | `ATTESTATION_ENFORCEMENT_ENABLED=false` now **explicit** in all 4 `.env` files; `PLAY_INTEGRITY_CLOUD_PROJECT` still empty in all 4 |
| **M-02** | Medium | OTP codes in the URL path via GET | ❌ Open | 🟡 **Client-side closed** | [otpTransport.ts](src/security/otpTransport.ts) dual-route shim + `redactUrl` + `silentStatuses` + contract doc + 12 passing tests |
| **M-03** | Medium | Pin expiry fails open on Android | 🟡 Partial | ✅ **Fixed** | [pinExpiry.ts](src/security/pinExpiry.ts) wired at [App.tsx:108](App.tsx#L108); `pinning-policy.json` is now the single source for Gradle, Xcode and runtime |
| **M-04** | Medium | Over-broad Android permissions | ✅ Fixed | ✅ **Fixed** | 8 permissions removed; policy enforced against the merged manifest |
| **M-05** | Medium | Clipboard, no expiry | 🟡 Partial | 🟡 **Partial** | `copyEphemeral` on 4 screens; **2FA seed still uncleared** — **N-05** |
| **M-06** | Medium | Persisted-state secret stripping | ✅ Fixed | ✅ **Fixed** | `SENSITIVE_KEY` regex + deny-list |
| **M-07** | Medium | OAuth callback custom scheme | 🟡 Partial | 🟡 **Partial — major progress** | [M07_APPLINKS_SETUP.md](security/M07_APPLINKS_SETUP.md) **now exists** (12 KB); iOS `associated-domains` wired on **both** configs; external hosting unverified |
| **M-08** | Medium | Legacy zero-IV crypto format | ❌ Open (by design) | ❌ **Open (by design)** | `LEGACY_FORMATS_ENABLED = true`; Gradle-enforced deadline 2026-11-01; telemetry live |
| **M-09** | Medium | Unauthenticated security endpoints | ✅ Fixed | ✅ **Fixed** | Routed through hardened `get()` |
| **M-10** | Medium | Zero test coverage | 🔴 Regressed | 🟡 **Recovering** | 4 suites, 40 tests pass; 1 suite cannot execute — **N-03** |
| **N-01** | Critical | 3 API instances with no base URL | 🔴 Open | ✅ **Fixed** | Instances deleted, call sites migrated, `getUrl()` throws, `envContract.test.ts` passes |
| **N-02** | High | Pinning guard fails every release build | 🔴 Open | ✅ **Fixed (workaround)** | 3 exemptions added to `pinning-policy.json`; regex unchanged — see **N-06** |
| **N-03** | High | Test suite deleted; comments cite it | 🔴 Open | 🟡 **Partial** | 4 suites restored (40 tests pass); `securityInvariants.test.ts` **still fails**; 4 cited suites still absent |
| **N-04** | Medium | Host scripts read a deleted directory | 🔴 Open | ❌ **Open — comments only** | [verify-hosts.sh:41-42](scripts/verify-hosts.sh#L41), [compute-spki-pins.sh:45-46](scripts/compute-spki-pins.sh#L45) still parse `environments/*.js` |
| **N-05** | Medium | TOTP seed to clipboard, no expiry | 🔴 Open | ❌ **Open** | [verifyCode.tsx:118-125](src/screens/Profile/verifyCode.tsx#L118) — core RN `Clipboard`, no TTL |
| **N-06** | Medium | *(new)* Pin inventory mis-modelled; DSN key committed | — | 🔴 **New** | See §4 |
| **N-07** | Low | *(new)* Orphan `exchangapay-release.entitlements` | — | 🔴 **New** | See §4 |
| **N-08** | High | *(new)* `js-yaml` CVE-2026-59870 | — | 🔴 **New** | `npm audit`: 1 high (build-time chain) |
| **V-01** | Critical | *(new, fixed)* 2FA verification fails open | — | ✅ **Fixed — uncommitted** | See §1.3 |
| **9.1** | Medium | No request timeout | ❌ Open | ❌ **Open** | Zero `timeout` in `ApiService.ts`, `apiInterceptors.ts`, `api.tsx` |
| **L-01** | Low | Dead code / phantom dependencies | 🟡 Improved | ✅ **Fixed** | 5 dead API instances + `environments/` gone; `src/redux/` remains (A-02) |
| **L-02** | Low | Empty catch blocks | ✅ Fixed | ✅ **Fixed** | — |
| **L-03** | Low | `NSAllowsLocalNetworking` | ✅ Fixed | ✅ **Fixed** | Debug-only injection, asserted in the built product |
| **L-04** | Low | `any` annotations | ❌ Open | 🟡 **Improved** | 1,086 → 1,045 → **992**; still no `tsc --noEmit` in any workflow |
| **L-05** | Low | `versionCode` never incremented | ❌ Open | ❌ **Open** | [build.gradle:804-805](android/app/build.gradle#L804); iOS `CURRENT_PROJECT_VERSION = 1` |
| **L-06** | Low | Residual `console.log` | ✅ Fixed | ✅ **Fixed** | Remaining hits are commented-out or inside `logger.ts`; `transform-remove-console` strips release |
| **L-07** | Low | No screenshot-detection telemetry | ❌ Open | ❌ **Open** | Unchanged |
| **L-08** | Low | Naming inconsistencies | ❌ Open | ❌ **Open** | `Tlv_Cards`, `cryptoCardTransations`, `encryptionTransfermation` |
| **L-09** | Low | Two parallel push stacks | ❌ Open | ❌ **Open** | 4 notification packages |
| **L-10** | Low | `google-services.json` placeholder undocumented | 🟡 | 🟡 **Open** | Retrieval path still unrecorded |
| **L-11** | Low | Unenforced coverage threshold | 🟡 | 🟡 **Open** | 40 %/30 % threshold; no run satisfies it |

**Closure movement this pass:** N-01 ✅ · N-02 ✅ · M-03 ✅ · H-01 ✅ · L-01 ✅ · M-02 🟡→client-closed · M-07 🟡→major · H-07 🟡→major · N-03 🟡 · L-04 🟡
**Net:** 16 fully closed · 8 partially closed · 9 open · 0 regressed · 3 newly introduced

---

## 3. Verified Fixes — What Closed This Pass

### N-01 — API Base URL Resolution · ✅ Fixed

The v2.0 report offered two remediation options. The team took a third and better one.

Rather than adding `WALLET_GRID_URL`, `WALLET_API_URL` and `AUTH_URL` back to the `.env` files, [api.tsx](src/utils/api.tsx) now documents — and DNS re-verifies — that the hosts behind those keys do not exist:

```
neowalletgrid.azurewebsites.net   NXDOMAIN
neowalletapi.azurewebsites.net    NXDOMAIN
neobank.azurewebsites.net         NXDOMAIN
tstlogin.suissebase.io            NXDOMAIN
```

Restoring the keys would have restored a base URL resolving to nothing and put four dead hosts back into the pin inventory. Instead the three instances were deleted and their call sites migrated onto `ApiService.ts`, which resolves to the live, pinned first-party host. The corroborating evidence cited in the file is convincing: `onBoardingservice.tsx` already had two functions for the *same* Sumsub endpoint — one on the dead host, one on `ApiService` — differing only in the casing of "SumSub". The migration had been started years ago and abandoned.

**The class fix matters more than the instance fix.** `getUrl()` at [apiInterceptors.ts:168-187](src/utils/apiInterceptors.ts#L168) now throws with an actionable message naming the finding, the file to edit, and the defined keys:

```typescript
if (!value) {
  throw new Error(
    `[Environment] apiUrls.${path} is not defined (security finding N-01). ` +
    `Add it to the apiUrls block in Environment.js and to every .env file, ` +
    `then add the host to security/pinning-policy.json or the Android pin-set. ` +
    `Defined keys: ${Object.keys(apiUrls).join(", ") || "(none)"}.`
  );
}
```

Because the instances are created at module load, an undefined key now fails on the first `jest` run and the first debug launch. `__tests__/envContract.test.ts` (184 lines) asserts the contract independently. This is exactly the "make the failure mode impossible, not just absent" move the v2.0 report asked for.

**Residual:** `cardApi` in `api.tsx` remains a duplicate of the instance inside `ApiService.ts`. The file itself says so. Folding it in is mechanical and is tracked as A-01.

### M-03 — Pin Expiry · ✅ Fixed

Three changes, each addressing a distinct half of the finding:

1. **Single source of truth.** `security/pinning-policy.json` now carries `pinSet.androidExpiration`, `pinSet.iosExpiration` and `buildWarnWithinDays`. The Gradle guard reads it and **fails the build on drift** between the JSON and the `<pin-set expiration>` attribute ([build.gradle:288-347](android/app/build.gradle#L288)). The Xcode release phase reads the same file — and, notably, **fails rather than skips** if it cannot: *"a guard that silently no-ops when it loses its input reports success either way, which is worse than having no guard at all."* That is the correct lesson drawn from N-04, applied prospectively.
2. **Runtime telemetry.** [src/security/pinExpiry.ts](src/security/pinExpiry.ts) computes days-to-expiry per platform and classifies it; `reportPinExpiry()` is called at [App.tsx:108](App.tsx#L108). The fleet's pin state is now observable rather than inferred — which was the specific ask, since the residual risk is an *installed* app crossing the date without a release.
3. **Fail-open made visible.** Android's `<pin-set>` still fails open at the expiry date (that is Android's behaviour, not a code choice), but it can no longer do so silently.

### M-02 — OTP Transport · 🟡 Client-Side Closed

[src/security/otpTransport.ts](src/security/otpTransport.ts) is the best-reasoned module added in either remediation pass. `verifyOneTimeCode()` calls the body-based route first and falls back to the legacy path form **only** on 404/405/501, caching the verdict per channel per session, in memory.

The narrowness of the fallback set is the load-bearing decision, and the file explains it correctly: 400/401/409 mean the backend *read* the code and rejected it, so a retry burns an attempt and may consume a single-use code; 429 means retrying is precisely wrong; 5xx may mean the code was consumed before the failure; and a network error is no evidence the route is missing, so falling back would convert every flaky connection into a permanent downgrade to the leaky path.

Applied at both call sites:

- [auth.tsx:60-72](src/services/auth.tsx#L60) — phone verification
- [profile.tsx:34-52](src/services/profile.tsx#L34) — Google Authenticator verification (the higher-value one: the path segment there was a **live second factor**)

Supporting work: `silentStatuses` added to the axios config type and honoured by `handleErrorCapture()` so the probe does not manufacture one crash report per session; `redactUrl()` applied to every Crashlytics attribute and Sentry tag, closing the client-side half of the exposure today; `security/M02_OTP_TRANSPORT_CONTRACT.md` specifies the backend contract; `__tests__/otpTransport.test.ts` passes.

**Closes fully when:** the backend ships `POST /api/v1/Security/PhoneVerification` and `PUT /api/v1/Security/VerifyGoogleAuthenticator` with the code in the body. No app release is required.

### M-07 — App Links · 🟡 Major Progress

`security/M07_APPLINKS_SETUP.md` — flagged in v2.0 as referenced from three places and non-existent — now exists at 12 KB. The iOS half is wired: `com.apple.developer.associated-domains` with both Auth0 tenants is present in **both** `exchangapay.entitlements` (Debug) and `exchangapayRelease.entitlements` (Release), and both are now actually applied (see H-07).

**Closes when:** `assetlinks.json` is served from `https://exchangapay.eu.auth0.com/.well-known/` and the Apple App Site Association file is served for the iOS half — both external to this repository — and the legacy custom-scheme intent filters carry a removal date.

### H-07 — iOS Entitlements · 🟡 Major Progress

The entitlements defect v2.0 called out as *"the app ships with no `aps-environment`, so push notifications do not work"* is fixed, and fixed with an assertion rather than a setting:

- `CODE_SIGN_ENTITLEMENTS` is now set on **both** configurations ([project.pbxproj:351, 382](ios/exchangapay.xcodeproj/project.pbxproj#L351))
- The `[H-07]` release build phase now **fails** if `CODE_SIGN_ENTITLEMENTS` is empty, if the file is missing, if `aps-environment != production`, or if the *signed product* carries a non-production APNs environment
- The **H-13 tenant guard now actually runs.** v2.0 found it reading `environments/active.js` (deleted) behind an `if [ -f ]`, and additionally reading `CFBundleIdentifier` from the source plist where it is the literal string `$(PRODUCT_BUNDLE_IDENTIFIER)`. Both defects are fixed: it reads `.env` via `${ENVFILE:-.env}`, uses the Xcode-resolved `$PRODUCT_BUNDLE_IDENTIFIER`, and now actually compares `AUTH0_ISSUER` against `IOS_AUTH0_DOMAIN` (v2.0 noted it computed `JS_ISSUER` and never used it)

**Still open — see §5.**

### Other Confirmed Fixes

| ID | Verification |
|---|---|
| **H-01** | `api.tsx` exports `marketApi` (third-party interceptors only) and `cardApi` (full stack). No unintercepted instance remains |
| **L-01** | `uploadapi`, `coingico`, `memberInfoAPI`, `transactionApi`, `api`, `authApi`, `services/transfer.tsx`, `environments/` all deleted |
| **L-06** | 11 `console.log` matches remain; all are commented-out lines in `FCMNotification.js` or the internals of `logger.ts`. `babel.config.js` applies `transform-remove-console` under `env.production` with no `exclude` list |
| **M-01** *(partial)* | `ATTESTATION_ENFORCEMENT_ENABLED=false` is now **explicitly declared** in `.env`, `.env.dev`, `.env.tst`, `.env.prod` — the v2.0 ask. State is declared rather than inferred from absence |
| **Idempotency** | `b86c318` removed payload-derived key composition (`fastHash(userId + values)`) in favour of the random UUID minted at the chokepoint, and added `Bank/Transfer`, `Cards/TopupCard` and `Withdraw/Withdraw/Crypto` to the covered paths. Correct: a derived key makes two legitimately-identical transfers collide |

---

## 4. Newly Identified Findings

### N-06 — Pinning Inventory Mis-Modelled; Sentry DSN Key Committed as a "Host"

**Severity:** Medium
**Files:** [security/pinning-policy.json](security/pinning-policy.json), [android/app/build.gradle:380-392](android/app/build.gradle#L380)

#### Technical Explanation

N-02 was that the Gradle host-inventory scanner treats *every* `https://` value in every `.env` file as a host the app contacts, so the Auth0 **audience identifier** and the Sentry **DSN** were flagged as unpinned hosts and failed the build.

The fix applied was to add three exemptions rather than to constrain the regex. The regex at [build.gradle:389](android/app/build.gradle#L389) is unchanged:

```groovy
def m = (trimmed =~ /=\s*https?:\/\/([^\/\s]+)/)
if (m) recordHost(m[0][1], envFile.name)
```

The build passes. Three consequences follow:

1. **The inventory now conflates two different things.** `security/pinning-policy.json` is the record of *which hosts the app talks to and why they are or are not pinned*. It now contains three entries that are not hosts the app talks to at all — two Auth0 audience strings (opaque identifiers, never resolved) and one Sentry DSN fragment. A reviewer reading the file to answer "what does this app connect to?" gets a wrong answer, and the exemption mechanism — whose entire purpose is to make an *omission* and a *decision* look different — now contains three entries that are neither.

2. **A Sentry DSN public key is committed in a security policy file:**

```json
{
  "host": "97c9602ff0c4f74c3f55743eace18039@o4510198382919680.ingest.us.sentry.io",
  "risk": "low",
  "traffic": "Sentry DSN userinfo host string in .env files"
}
```

The `97c9…` segment is the DSN public key. A Sentry DSN is designed to be public — it is embedded in every shipped client and grants only event-submission rights — so this is **not** a credential leak. It is, however, a project-identifying value now duplicated outside `.env` into a file whose stated purpose is unrelated, where nobody will think to rotate it if the project is ever re-keyed. It is also, plainly, a parsing artefact recorded as a security decision.

3. **The next `SENTRY_DSN` or `AUTH0_AUDIENCE` change silently re-breaks the build**, because the exemption is keyed on the exact string.

#### Attack Scenario

Not directly exploitable. The risk is control degradation: an inventory that contains non-hosts trains reviewers to skim the exemption list, which is the precondition for a genuinely unpinned host slipping through it. This is the same failure mode as v1.0's C-01 (`# NO SECRETS IN THIS FILE` above a secret) and v2.0's N-03 (comments citing tests that do not exist) — the third instance in this repository of a control asserting something that is not true.

#### Recommended Remediation

Constrain the scanner to keys that actually name a network host, and strip DSN userinfo:

```groovy
// Only URL-valued keys. AUTH0_AUDIENCE is an opaque identifier and SENTRY_DSN
// carries a userinfo segment; neither is a host this app resolves.
def m = (trimmed =~ /^([A-Z0-9_]+)\s*=\s*https?:\/\/(?:[^@\/\s]*@)?([^\/\s:]+)/)
if (m && m[0][1] ==~ /.*(_URL|_HOST|_ENDPOINT|_BASE)$/) {
    recordHost(m[0][2], envFile.name)
}
```

Then delete the three artefact exemptions from `pinning-policy.json`. Verify with `./gradlew :app:assembleRelease` and confirm the inventory reports exactly `api.exchangapay.com`, `tstapi.exchangapay.com`, `api.coingecko.com`.

#### Best Practice

An exemption list should only ever contain entries a human decided about. If a guard produces entries a human would not have written, fix the guard — an exemption added to silence a false positive is indistinguishable, six months later, from an exemption added to silence a true one.

---

### N-07 — Orphan Entitlements File With a Near-Identical Name

**Severity:** Low
**Files:** `ios/exchangapay/exchangapay-release.entitlements` (orphan), `ios/exchangapay/exchangapayRelease.entitlements` (live)

#### Technical Explanation

Three entitlements files exist:

| File | Referenced by | Contents |
|---|---|---|
| `exchangapay.entitlements` | Debug config | `aps-environment=development` + associated-domains |
| `exchangapayRelease.entitlements` | Release config | `aps-environment=production` + associated-domains |
| `exchangapay-release.entitlements` | **nothing** | `aps-environment=production`, **no associated-domains** |

The hyphenated file was created during the `ff2959d` remediation, superseded by the camel-case one in `57fb43e`, and never deleted. The two names differ by one hyphen, and the orphan is **missing `associated-domains`** — so a well-intentioned "fix the inconsistent naming" commit that repoints `CODE_SIGN_ENTITLEMENTS` at the hyphenated file would silently disable Universal Links on iOS while passing every existing guard (the `[H-07]` phase checks `aps-environment`, which the orphan has, but does not check `associated-domains`).

#### Recommended Remediation

```bash
git rm ios/exchangapay/exchangapay-release.entitlements
```

And extend the `[H-07]` build phase to assert the entitlement that is currently unchecked:

```bash
DOMAINS=$(plutil -extract com.apple.developer.associated-domains json -o - "$ENTITLEMENTS_SRC" 2>/dev/null) || DOMAINS=""
if ! echo "$DOMAINS" | grep -q "applinks:"; then
  echo "error: [H-07/M-07] $CODE_SIGN_ENTITLEMENTS declares no applinks: associated domain. The Universal Links OAuth callback (M-07) will not work and the custom scheme remains the only path."
  exit 1
fi
```

---

### N-08 — `js-yaml` High-Severity CVE in the Build Chain

**Severity:** High (build-time) / Low (runtime)
**Advisory:** GHSA-5p4m-2wfm-xmqj — CVE-2026-59870, quadratic CPU consumption in `!!omap` resolution

#### Technical Explanation

`npm audit` reported **0 vulnerabilities** at `608267d`. It now reports **1 high**:

```
js-yaml  3.0.0 - 3.15.0 || 4.0.0 - 4.3.0   High
node_modules/@istanbuljs/load-nyc-config/node_modules/js-yaml
node_modules/js-yaml
```

Both paths are build/test tooling (Babel config loading, Istanbul coverage). `js-yaml` is not reachable from the shipped Hermes bundle — no application code imports it, and neither entry point is bundled by Metro. The runtime exposure is nil.

The **build-time** exposure is real but narrow: a malicious YAML document processed by the toolchain causes quadratic CPU consumption. That requires an attacker-supplied YAML file entering the build, which in practice means a compromised dependency or a hostile PR — a scenario that has worse consequences than a CPU stall.

#### Recommended Remediation

```bash
npm audit fix          # non-breaking; both paths are transitive dev deps
npm audit --audit-level=high   # confirm clean
```

Then commit the resulting `package-lock.json`. Note this finding appeared **within one day** of a clean audit — which is the argument for the scheduled dependency review recommended in §12, and for adding `npm audit --audit-level=high` to the release checklist as a hard stop rather than an informational step.

---

### V-01 — Two-Factor Verification Fails Open *(found and fixed this pass — uncommitted)*

**Severity:** Critical (as it existed) · ✅ Fixed in the working tree
**Files:** [src/screens/Profile/authentication.tsx:42](src/screens/Profile/authentication.tsx#L42), [src/screens/Profile/verifyCode.tsx:83](src/screens/Profile/verifyCode.tsx#L83)

#### Technical Explanation

apisauce **resolves** on non-2xx responses rather than rejecting — the response object carries `ok: false` and a `data` payload holding the error body. Both 2FA screens gated success on `data` alone:

```typescript
const verifedRes = await ProfileService.varificationGoogleAuthenticate(value.code);
if (verifedRes?.data) { onSuccess() }
```

A `400 { "message": "Invalid code" }` produced a truthy `data`, so the success branch ran. On `authentication.tsx` that is the **2FA step-up verification** used to gate sensitive profile operations; on `verifyCode.tsx` it is 2FA **enrolment confirmation**, so enrolment could complete without the user ever proving they had successfully configured their authenticator app — leaving an account with 2FA marked enabled and a seed the user cannot produce codes for.

#### Attack Scenario

An attacker with a session but not the second factor (stolen unlocked device, hijacked session, shoulder-surfed password on a shared handset) enters any six digits at the step-up prompt. The backend rejects; the client accepts; the guarded operation proceeds. Whether the operation itself then succeeds depends entirely on whether the backend independently re-checks the factor on the follow-up request — which this audit cannot determine from source and which **must be confirmed**.

#### Exploitation Possibility

**High**, and requiring no tooling — the bypass is reachable from the app's own UI by typing a wrong code.

#### Risk Impact

Second-factor bypass on the step-up path; false-positive 2FA enrolment leaving accounts in a state where the recorded second factor does not work.

#### Remediation Applied

```typescript
if (verifedRes?.ok && verifedRes?.data) { onSuccess() }
```

Correct, and consistent with `guard.ts`, which fails closed on every high-risk path.

#### Required Follow-Up

1. **Commit this.** It is uncommitted and therefore in no build.
2. **Audit the idiom repository-wide.** `res.data` as a success predicate is a pattern here, not a one-off. Grep every verification, payment-confirmation and permission-check path:

```bash
grep -rn "Res\?\.data\|res\?\.data" src/screens src/store --include="*.tsx" | grep -v "\.ok"
```

3. **Add a lint rule or a test** asserting that any branch gated on an apisauce response also tests `ok`. This is the third distinct fail-open defect found across three audits (app-lock field name in v1.0, attestation advisory mode in v2.0, this one) — the pattern is worth a mechanical check.
4. **Confirm with the backend** that `VerifyGoogleAuthenticator` and every step-up-gated operation re-validate the factor server-side. If they do, this was defence-in-depth failing; if they do not, it was an exploitable authentication bypass.

---

## 5. Still-Open Findings & Fix Recommendations

### H-07 — iOS Release Signing · 🟡 Partially Fixed · **Top Blocker**

**Fixed this pass:** entitlements applied on both configs, `aps-environment` asserted in both the source file and the signed product, H-13 tenant guard repointed at `.env` and now genuinely executing, `associated-domains` present.

**Still open — four items, all in the Release build configuration:**

| Issue | Evidence | Impact |
|---|---|---|
| Release signs with a **development** identity | [project.pbxproj:383](ios/exchangapay.xcodeproj/project.pbxproj#L383) — `CODE_SIGN_IDENTITY = "Apple Development"` at target level, overriding the project-level `"iPhone Distribution"` at line 529 | Cannot produce a distributable archive. A build that "succeeds" is not shippable |
| `CODE_SIGN_STYLE = Automatic`, `PROVISIONING_PROFILE_SPECIFIER = ""` | [project.pbxproj:384, 403](ios/exchangapay.xcodeproj/project.pbxproj#L384) | Automatic signing selects whatever profile the signing machine happens to hold — the release identity becomes a property of the laptop, not the repository |
| **Release ships the test bundle ID** | [project.pbxproj:401](ios/exchangapay.xcodeproj/project.pbxproj#L401) — `PRODUCT_BUNDLE_IDENTIFIER = com.exchangapay.tst` | iOS release builds carry the test identity. `IOS_BUNDLE_ID` in `.env` drives nothing on iOS. Note the H-13 guard *will* now catch this — it compares `APP_ENV` against the bundle ID — so a prod build fails loudly rather than shipping wrong. The guard works; the setting is still wrong |
| `CURRENT_PROJECT_VERSION = 1` | [project.pbxproj:352, 385](ios/exchangapay.xcodeproj/project.pbxproj#L352) | L-05; blocks App Store upload after the first submission and neuters force-update |

#### Recommended Fix

```
# Target → Build Settings → Release
CODE_SIGN_IDENTITY[sdk=iphoneos*] = "Apple Distribution"
CODE_SIGN_STYLE                   = Manual
PROVISIONING_PROFILE_SPECIFIER    = "Exchanga Pay App Store"
PRODUCT_BUNDLE_IDENTIFIER         = $(EXCHANGA_BUNDLE_ID)   # from an xcconfig fed by .env
CURRENT_PROJECT_VERSION           = $(BUILD_NUMBER)         # from CI

# Target → Build Settings → Debug  (already correct)
CODE_SIGN_ENTITLEMENTS            = exchangapay/exchangapay.entitlements
```

Then extend the `[H-07]` phase with the assertion that would have caught this — the same "assert the control" pattern used for entitlements and APNs:

```bash
if [ "$CONFIGURATION" = "Release" ]; then
  case "$CODE_SIGN_IDENTITY" in
    *Distribution*) ;;
    *) echo "error: [H-07] Release CODE_SIGN_IDENTITY is '$CODE_SIGN_IDENTITY'; a distributable archive requires an Apple Distribution identity."; exit 1 ;;
  esac
fi
```

**Best practice:** every setting the release depends on should be asserted by the release itself. This repository does that well for ATS, pinning, entitlements and APNs; signing identity is the one remaining setting where a wrong value produces a green build.

---

### N-03 — Test Suite Partially Restored · 🟡 Partially Fixed

**Fixed:** four suites exist and 40 tests pass —

```
__tests__/envContract.test.ts          184 lines   ✅ pass
__tests__/legacyCryptoTelemetry.test.ts 155 lines  ✅ pass
__tests__/otpTransport.test.ts         141 lines   ✅ pass
__tests__/securityInvariants.test.ts   171 lines   ❌ FAILS TO EXECUTE

Test Suites: 1 failed, 3 passed, 4 total
Tests:       40 passed, 40 total
```

**Still open — two items:**

1. **`securityInvariants.test.ts` cannot run.** The exact `transformIgnorePatterns` defect v2.0 recorded:

```
SyntaxError: Unexpected token 'export'
  node_modules/@sentry/react-native/dist/js/index.js:1
  at src/utils/logger.ts:24 → storage/keychainPolicy.ts:45 → crypto/persistKey.ts:42
     → helpers/encryptionTransfermation.tsx:29 → __tests__/securityInvariants.test.ts:15
```

This is the suite covering the persisted-state secret stripping (M-06) and keychain policy — the storage controls. **A suite that does not execute is indistinguishable from a suite that does not exist**, and `jest` exits non-zero, so any future CI gate will red on this.

2. **Four cited suites still do not exist.** Source comments and policy files still name them as the enforcement mechanism for controls:

| Cited file | Cited from | Control it claims to enforce |
|---|---|---|
| `__tests__/apiLayerHardening.test.ts` | 5 places incl. [apiInterceptors.ts:13](src/utils/apiInterceptors.ts#L13) | "every exported instance went through `applyStandardInterceptors()`" |
| `__tests__/pinningCoverage.test.ts` | 6 places | Pin inventory coverage |
| `__tests__/keychainPolicy.test.ts` | 3 places | Keychain accessibility invariants |
| `__tests__/storagePolicy.test.ts` | 3 places | Storage policy |

The comment in `apiInterceptors.ts` is the sharpest example: *"`__tests__/apiLayerHardening.test.ts` asserts that every exported instance actually went through `applyStandardInterceptors()`, so a new instance cannot quietly opt out."* Nothing asserts that. A new instance can quietly opt out, and the comment stops the next reviewer from checking.

#### Recommended Fix

```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|@sentry/react-native|' +
    '@react-native-firebase|react-native-.*|@react-navigation)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/assets/**'],
  coverageThreshold: { global: { lines: 40, branches: 30 } },
};
```

Then write the four cited suites — `apiLayerHardening` first, since it is the one guarding the chokepoint that H-01 exists to create. Each is a source-shape assertion, not a behavioural test; they are short:

```typescript
// __tests__/apiLayerHardening.test.ts — sketch
it("every apisauce instance passes through an interceptor applier", () => {
  const src = fs.readFileSync("src/utils/api.tsx", "utf8");
  const created = [...src.matchAll(/const (\w+) = create\(/g)].map(m => m[1]);
  created.forEach(name => {
    expect(src).toMatch(
      new RegExp(`apply(Standard|ThirdParty)Interceptors\\(${name}`)
    );
  });
});
```

And add the meta-test v2.0 recommended, which closes the whole class:

```typescript
it("every __tests__/ reference in a source comment resolves to a real file", () => {
  const refs = execSync(
    "grep -rhoE '__tests__/[A-Za-z0-9._]+' src android ios security || true"
  ).toString().split("\n").filter(Boolean).map(s => s.replace(/\.$/, ""));
  [...new Set(refs)].forEach(ref => expect(fs.existsSync(ref)).toBe(true));
});
```

Twenty lines. It converts a documentation claim into a checkable one, and it would have caught this finding in both v2.0 and v3.0.

---

### N-04 — Host-Verification Scripts Still Read a Deleted Directory · ❌ Open

Both scripts had their **header comments** updated in the working tree; neither had its **body** changed.

```bash
# scripts/verify-hosts.sh:41-42
' "$REPO_ROOT"/environments/dev.js "$REPO_ROOT"/environments/tst.js \
  "$REPO_ROOT"/environments/prod.js 2>/dev/null | sort -u

# scripts/compute-spki-pins.sh:45-46
' "$REPO_ROOT"/environments/dev.js "$REPO_ROOT"/environments/tst.js \
  "$REPO_ROOT"/environments/prod.js 2>/dev/null
```

`environments/` was deleted in `ff2959d`. The `2>/dev/null` swallows the missing-file error, the awk block matches nothing, and both scripts **exit 0 having verified nothing**. `verify-hosts.sh` is on the production hardening checklist as the control that proves every configured host resolves; it currently proves nothing and says so with a zero exit code.

This is the same failure mode as the pre-fix H-13 guard, and it is worth noting the Xcode release phase learned the lesson explicitly this pass (*"a build that cannot read it FAILS rather than skipping the check"*) while these two scripts did not.

#### Recommended Fix

```bash
# scripts/verify-hosts.sh — replace the awk-over-environments block
collect_hosts() {
  local found
  found=$(grep -hoE '^[A-Z0-9_]+(_URL|_HOST|_ENDPOINT|_BASE)\s*=\s*https?://[^/[:space:]]+' \
            "$REPO_ROOT"/.env "$REPO_ROOT"/.env.dev "$REPO_ROOT"/.env.tst "$REPO_ROOT"/.env.prod 2>/dev/null \
          | sed -E 's|.*https?://||' | sort -u)
  if [ -z "$found" ]; then
    echo "error: host inventory is empty. Expected *_URL keys in .env* — has the" >&2
    echo "       environment source of truth moved again? Refusing to report success." >&2
    exit 1
  fi
  printf '%s\n' "$found"
}
```

Apply the same non-empty guard to `compute-spki-pins.sh` (which already has the *message* at line 113 — `"No hosts found. Is environments/*.js missing its apiUrls block?"` — but reaches it only after the same silent-empty path, and the message names the wrong file).

**Best practice:** any script whose job is to enumerate something must treat an empty enumeration as an error. "Found nothing" and "verified everything" must never share an exit code.

---

### N-05 — TOTP Seed Copied to the Clipboard With No Expiry · ❌ Open

```typescript
// src/screens/Profile/verifyCode.tsx:118-125
const copyToClipboard = async () => {
  const text: string = extractSecretFromOTPAuthURI(data);   // the raw TOTP seed
  try {
    await Clipboard.setString(text);                        // core RN Clipboard, no TTL
  } catch (error: any) { … }
};
```

Two problems, both unchanged since v2.0:

1. **It uses core React Native's `Clipboard`** (imported from `react-native` at line 10) rather than the project's own [`copyEphemeral`](src/utils/clipboard.ts) helper. Four other screens use `copyEphemeral` correctly; this one — the single most sensitive value the app ever places on the clipboard — does not.
2. **The value is a TOTP shared secret**, not a wallet address. A wallet address on the clipboard risks a swap attack; a TOTP seed on the clipboard risks *permanent second-factor compromise*, because it does not expire, cannot be rotated without re-enrolment, and generates valid codes forever. On Android 10+ any foreground app can read the clipboard; on iOS the general pasteboard is readable by any app the user foregrounds, and Universal Clipboard syncs it to every device on the same Apple ID.

`myReferral.tsx` also uses core `Clipboard` — low sensitivity (a referral code), but the same import should be banned uniformly rather than case-by-case.

#### Recommended Fix

```typescript
import { copyEphemeral } from "../../utils/clipboard";

const copyToClipboard = () => {
  const text = extractSecretFromOTPAuthURI(data);
  // 30 s, not the 60 s default: a TOTP seed does not expire and cannot be
  // rotated without re-enrolment, so the exposure window should be the
  // shortest one that still lets a user paste into an authenticator app.
  copyEphemeral(text, "Authenticator secret", 30_000);
};
```

Then ban the core import so this cannot recur:

```javascript
// .eslintrc.js
rules: {
  "no-restricted-imports": ["error", {
    paths: [{
      name: "react-native",
      importNames: ["Clipboard"],
      message: "Use copyEphemeral from src/utils/clipboard.ts — clipboard writes must auto-clear (M-05, N-05).",
    }],
  }],
}
```

**Best practice:** prefer offering the QR code alone and removing the copy affordance entirely for the seed. If a user can scan it, they never need it on the clipboard; if they cannot scan it (same-device enrolment), a 30-second window is the compromise.

---

### 9.1 — No Request Timeout · ❌ Open

Re-verified: **zero** `timeout` configuration anywhere in `ApiService.ts`, `apiInterceptors.ts` or `api.tsx`. Axios defaults to no timeout, so a hung TCP connection blocks indefinitely.

The workaround still exists and still documents the gap: [appLock.ts:48](src/security/appLock.ts#L48) — *"ApiService sets no timeout on anything (audit finding M-03, still open)"*. That comment now also carries a stale finding ID (it is 9.1, not M-03, and M-03 is closed).

This interacts with the startup path: `checkVersionUpdate()` runs before the dashboard renders and has no timeout, so a network black-hole stalls first paint indefinitely.

#### Recommended Fix — one line at the chokepoint

```typescript
// src/utils/apiInterceptors.ts — inside applyStandardInterceptors
instance.axiosInstance.defaults.timeout = 30_000;

// and per-request for interactive paths, inside the request interceptor:
config.timeout ??= /Login|Dashboard|SecurityInformation|VersionCheck/.test(config.url ?? "")
  ? 10_000
  : 30_000;
```

Pair with `429` / `Retry-After` handling, which is also absent at the interceptor. `helpers/index.tsx:255` maps 429 to a *user message* — good — but nothing enforces a backoff, so the UI is free to let the user retry immediately and turn a soft limit into an incident:

```typescript
instance.axiosInstance.interceptors.response.use(undefined, async (error) => {
  if (error?.response?.status === 429) {
    const retryAfter = Number(error.response.headers?.["retry-after"]) || 0;
    error.retryAfterMs = Math.min(retryAfter * 1000 || 5_000, 60_000);
    error.isRateLimited = true;      // let the UI disable the submit button
  }
  return handleErrorCapture()(error);
});
```

Add bounded retry (2 attempts, exponential backoff + jitter) on **idempotent GETs only** — never on money-movement POSTs. Their idempotency keys make a retry safe server-side, but whether to submit twice should remain the backend's decision, not a client-side default.

---

### M-01 — Device Attestation Not Enforced Server-Side · 🟡 Partially Fixed

**Fixed this pass:** `ATTESTATION_ENFORCEMENT_ENABLED=false` is now explicitly declared in all four `.env` files with an explanatory comment referencing `security/ATTESTATION_BACKEND_CONTRACT.md` — the v2.0 ask. The state is declared rather than inferred from absence.

**Still open — two items:**

1. **`PLAY_INTEGRITY_CLOUD_PROJECT` is empty in all four `.env` files.** Play Integrity cannot produce a verdict without a cloud project number, so on Android the attestation path is inert in every build — `getAttestationToken()` returns nothing and `X-Device-Attestation` is never attached. iOS App Attest is unaffected. **The single highest-value one-line change on this list:** set the project number and the Android half of the control starts producing data immediately, in advisory mode, at zero risk.
2. **The backend does not verify.** Until it rejects on a bad verdict, `X-Device-Attestation` is cargo. The client sequencing (client first, flag off, backend second) is correct.

#### Recommended Fix

```bash
# .env, .env.dev, .env.tst, .env.prod
PLAY_INTEGRITY_CLOUD_PROJECT=<GCP project number from Play Console → App integrity>
```

Then deploy the backend contract, watch the verdict distribution in advisory mode for one release cycle, and only then flip `ATTESTATION_ENFORCEMENT_ENABLED=true` — enabling enforcement before you know the false-positive rate locks out real users on the day of the deploy.

---

### M-02 — OTP Transport · 🟡 Client-Side Closed, Backend Pending

Client work is complete and well built (§3). The finding closes when the backend ships the two body-based routes specified in [security/M02_OTP_TRANSPORT_CONTRACT.md](security/M02_OTP_TRANSPORT_CONTRACT.md).

**Watch for the closure signal:** the shim emits a Sentry breadcrumb `security.m02` and a `log.warn` the first time per session it falls back. When that breadcrumb stops appearing across the fleet, the finding is closed in production — no app release needed. Add a Sentry alert on the *absence* of it after the backend deploy, and a dashboard on its rate before.

**Backend must also confirm:** single-use enforcement, ≤5-minute TTL, ~5 attempts per identity per 15 minutes, and that the request **body** is excluded from access logging (moving the code from the URL to the body accomplishes nothing if the gateway logs bodies).

---

### M-07 — OAuth Callback Custom Scheme · 🟡 Partially Fixed

Both in-repo halves are now done: the setup document exists, and the iOS `associated-domains` entitlement is present and applied on both configurations.

**Still open — external and unverifiable from source:**

1. `https://exchangapay.eu.auth0.com/.well-known/assetlinks.json` must serve the app's package name and signing-certificate SHA-256 fingerprint, or `android:autoVerify="true"` fails verification and the App Link intent filter is inert.
2. The Apple App Site Association file must be served for the iOS half.
3. The legacy custom-scheme intent filters (`$(PRODUCT_BUNDLE_IDENTIFIER).auth0`) are correctly retained during migration but carry **no removal date**.

Until (1) and (2) are verified live, the custom scheme is still the only working callback path and any app on the device can register it. PKCE (enforced by `react-native-auth0` v5) reduces this from account takeover to denial-of-login, since the intercepted code is useless without the verifier.

#### Recommended Fix

```bash
# Verify Android App Link association (must return the app's package + fingerprint)
curl -s https://exchangapay.eu.auth0.com/.well-known/assetlinks.json | jq
# Verify on-device after install
adb shell pm get-app-links com.exchangapay
# Expect: com.exchangapay.eu.auth0.com: verified
```

Record the verification date in `security/M07_APPLINKS_SETUP.md`, add a `removeBy` date for the custom-scheme filters, and add the `adb pm get-app-links` check to the release checklist — App Link verification can silently regress when the signing certificate changes.

---

### C-01 — Sentry Token · 🟡 Partially Fixed · Unchanged

Removal from the tree is confirmed and correct. The token remains recoverable:

```bash
$ git log --all -p -- android/sentry.properties ios/sentry.properties | grep '^-.*auth\.token'
-auth.token=sntrys_eyJpYXQiOjE3NjEzNzQ3NDkuOTE0MjI0LCJ1cmwiOiJodHRwczovL3NlbnRyeS5pbyIs…
```

The decoded payload names org `exchangapay` and region `us.sentry.io`. Anyone with repository access — including anyone who has ever cloned it — holds a live organisation token.

**Removing a secret from HEAD does not revoke it. Only rotation does.** There is no evidence of rotation in this window.

#### Recommended Fix, in order

1. **Rotate now.** Sentry → Settings → Auth Tokens → revoke, issue a new one. Confirm the old token's revocation in the Sentry audit log — that is the step that actually closes the finding.
2. Supply the new token via `SENTRY_AUTH_TOKEN` in the build environment (CI secret / `~/.sentryclirc`), never in a tracked file. `.gitignore:85` already documents this path.
3. Purge history with `git filter-repo --replace-text`, **including the tracked audit artefacts** — `SECURITY_AUDIT_REPORT.md` and `.html` quote the token verbatim, so a history purge that only targets `sentry.properties` leaves it in the tree.
4. Install a `gitleaks` pre-commit hook and add a `gitleaks detect` step to CI.

---

### M-08 — Legacy Zero-IV Crypto Format · ❌ Open (accepted, deadline-enforced)

`LEGACY_FORMATS_ENABLED = true` in [policy.ts:58](src/utils/crypto/policy.ts#L58). A deliberate migration trade with a Gradle-enforced hard deadline of **2026-11-01**, live telemetry via `legacyTelemetry.ts` (now 144 lines, expanded this pass), a documented three-step exit, and a passing test suite.

Well managed. The only action is to watch the `crypto.legacy_format` metric and hold the date. **Flip the flag once the metric reaches zero; do not wait for the deadline** — a deadline is a backstop, not a plan.

---

### Low-Severity Register

| ID | Status | Note & fix |
|---|---|---|
| **L-04** | 🟡 Improved | 1,045 → **992** `: any`. `tsc --noEmit` still runs nowhere. *Fix:* add it to the release procedure, enable `@typescript-eslint` type-aware rules, and start with a typed `ApiUrlKey` union — the change that would have made N-01 a compile error |
| **L-05** | ❌ Open | `versionCode 1` / `versionName "1.0"` / iOS `CURRENT_PROJECT_VERSION = 1`. **Still neuters H-05:** `checkAppVersion()` compares `DeviceInfo.getBuildNumber()` (always 1) against the remote build number, so once the remote value exceeds 1 *every* install is permanently flagged out-of-date. *Fix:* drive both from one incrementing CI variable |
| **L-07** | ❌ Open | No screenshot-detection telemetry on iOS. *Fix:* observe `UIApplication.userDidTakeScreenshotNotification` and emit a Sentry breadcrumb on the card-PIN and seed screens |
| **L-08** | ❌ Open | `Tlv_Cards`, `cryptoCardTransations`, `encryptionTransfermation`, `onBoardingservice`. *Fix:* rename in one mechanical commit, separate from any behavioural change |
| **L-09** | ❌ Open | Four notification packages: `react-native-push-notification` 8.1.1 (archived, locally patched), `@notifee/react-native`, `@react-native-firebase/messaging`, `@react-native-community/push-notification-ios`. *Fix:* consolidate on `@notifee` + `firebase/messaging`; removes an unmaintained dependency and a patch |
| **L-10** | 🟡 Open | `google-services.json` is a `REPLACE_WITH_*` placeholder and gitignored — correct hygiene, but no build succeeds without out-of-band injection and nothing documents the retrieval path. *Fix:* record it in the README and keep the real file in the team secret store |
| **L-11** | 🟡 Open | `jest.config.js` declares 40 %/30 % coverage thresholds. With 4 suites over 327 source files, no run satisfies them — a threshold nothing enforces is a claim, not a control. *Fix:* set the threshold to current measured coverage and ratchet upward, so it starts binding immediately |
| **L-12** *(new)* | 🟡 Open | Stale finding IDs in source comments — [appLock.ts:48](src/security/appLock.ts#L48) cites "audit finding M-03" for the missing timeout, which is finding 9.1; M-03 is now closed. *Fix:* correct the reference when the timeout lands |

---

## 6. VAPT Assessment

Re-tested against `b86c318` + working tree.

### 6.1 Authentication Bypass

| Vector | v2.0 | v3.0 | Notes |
|---|---|---|---|
| **2FA verification accepts a wrong code** | not detected | ✅ **Closed (uncommitted)** | **V-01** — apisauce resolves non-2xx; `data` alone was the success test |
| App-lock gate reads a non-existent field | ✅ Closed | ✅ Closed | `appLock.ts` — correct field, cached, fails safe |
| Biometric step-up fails open | ✅ Closed | ✅ Closed | `guard.ts` fails closed on high-risk operations |
| OAuth callback interception via claimable scheme | 🟡 Android only | 🟡 **Both mitigated in-app; unverified externally** | iOS entitlement now present; assetlinks/AASA hosting unconfirmed (M-07) |
| Unauthenticated security endpoints | ✅ Closed | ✅ Closed | M-09 |
| Legacy API layer with no bearer token | ✅ by design | ✅ **Closed in delivery** | N-01 resolved; all remaining instances intercepted |

**Residual:** until `assetlinks.json` and the AASA file are verified live, an app registering `com.exchangapay.tst.auth0` can still receive the authorization code. PKCE reduces this to denial-of-login rather than takeover. Severity: Medium, both platforms until verification is confirmed.

**Priority:** V-01's underlying idiom (`res.data` as a success predicate) must be audited across every gate in the app. One instance was found by inspection; the pattern is repository-wide.

### 6.2 Authorization

Unchanged in design and correct: client-side authorization is advisory by construction, and `X-Device-Risk` is explicitly documented as a fraud *signal*, never an authorization decision.

**Backend-dependent items this audit cannot resolve from source, in priority order:**

1. **Does the backend independently re-validate the second factor** on operations gated by the step-up prompt? (V-01 — this determines whether the client bypass was exploitable end-to-end.)
2. Does `PUT api/v1/Customer/ChangePWD` require authentication and step-up? (M-09.)
3. Does the backend enforce single-use + TTL + rate limiting on verification codes? (M-02.)
4. Will the backend reject on a bad attestation verdict? (M-01.)

### 6.3 API Abuse

| Control | v2.0 | v3.0 |
|---|---|---|
| Rate limiting | ❌ | 🟡 User-facing 429 message exists; **no client-side backoff enforcement** |
| Idempotency on money movement | ✅ | ✅ **Improved** — keys now random rather than payload-derived; 3 more paths covered |
| Request timeout | ❌ | ❌ Open (9.1) |
| Retry with backoff | ❌ | ❌ Not implemented |
| Attestation on high-risk paths | 🟡 | 🟡 Client complete; **inert on Android** (empty `PLAY_INTEGRITY_CLOUD_PROJECT`) |

The idempotency change in `b86c318` is a genuine correctness improvement, not just hygiene. Deriving the key from `userId + cardId + amount` meant two legitimately identical transfers — the same amount to the same payee twice, which users do — collided on one key and the second was silently swallowed by the backend as a duplicate. A random key per attempt, reused on retry but never on a new attempt, is the correct semantics.

### 6.4 Sensitive Data Exposure

| Vector | Status |
|---|---|
| Secrets in git | 🟡 Removed from tree, **still in history** (C-01) |
| Persisted Redux state | ✅ AES-GCM + regex-based secret strip (M-06) |
| Keychain accessibility | ✅ `_THIS_DEVICE_ONLY` on every write |
| Android backup / device transfer | ✅ `allowBackup="false"` + `data_extraction_rules.xml` |
| Clipboard — crypto addresses | ✅ 60 s auto-clear on 4 screens |
| Clipboard — **2FA seed** | ❌ **Open (N-05)** |
| **OTP codes in telemetry** | ✅ **Closed** — `redactUrl()` on every Crashlytics attribute and Sentry tag |
| Telemetry redaction | ✅ Allow-list based (`redact.ts`, 77 lines added this pass) |
| Screenshots | ✅ `FLAG_SECURE` + iOS snapshot overlay; ❌ no detection telemetry (L-07) |
| Logs | ✅ `console.*` stripped in release with no `exclude` list |

### 6.5 MITM Risk

**Materially strong.** The host inventory is three live hosts (`api.exchangapay.com`, `tstapi.exchangapay.com`, `api.coingecko.com`), both first-party hosts pinned on **both** platforms with a verified backup pin, a parity check preventing drift between the Android and iOS pin-sets, a build-time drift check against `pinning-policy.json`, and — new this pass — runtime expiry telemetry.

**Residual attack surface:**

- CoinGecko is unpinned and third-party. Compromise yields misstated coin prices only; no credential reaches it, enforced by `applyThirdPartyInterceptors`. Accepted, documented, correct.
- Auth0, Sentry and Sumsub carry their own transports. The Sumsub exemption is the most material — that path carries identity documents — and is correctly flagged Medium in the policy with "revisit if the SDK exposes a pinning hook".
- **N-06**: the exemption list now contains three parsing artefacts, which degrades the reviewability of exactly this control.
- Android's pin-set still fails open at expiry (platform behaviour), but is now observable at runtime.

### 6.6 Reverse Engineering

R8 with `proguard-android-optimize.txt`, `minifyEnabled = true`, `shrinkResources = true`, `-assumenosideeffects` Log stripping, 134 lines of keep rules appropriately scoped to reflection-dependent libraries. iOS strips symbols and enables hardened runtime.

**Residual:** no anti-tamper, no integrity self-check, no string obfuscation. For an app rendering card PINs, a commercial RASP layer is worth evaluating — and the architecture already anticipates it: `src/security/index.ts` documents that swapping the detection backend "stays a one-file change."

### 6.7 Device Compromise & Runtime Manipulation

Root/jailbreak detection via `deviceIntegrity.ts` with a signal taxonomy, re-evaluated on foreground. Play Integrity and App Attest are wired. The verdict is used only as a risk signal for high-risk operations — correct, since a compromised device controls the process producing the verdict.

**Residual:** without server-side enforcement (M-01), a modified app strips `X-Device-Risk` and the backend cannot tell. **And on Android the control is currently inert regardless**, because `PLAY_INTEGRITY_CLOUD_PROJECT` is empty in every environment — so even a cooperative client produces no attestation token. That one-line configuration change is the highest-value item in this section.

### 6.8 Token Replay & Session Hijacking

Access and refresh tokens split across Keychain entries with different accessibility, `_THIS_DEVICE_ONLY`, a transient-vs-absent failure taxonomy preventing spurious logout, `cleanupLegacyTokenStorage()` erasing plaintext tokens from earlier builds. Idempotency keys on money-moving POSTs, now randomly generated.

**Residual:** no token binding to device attestation (blocked on M-01); no anomaly signal on refresh; no client-side backoff on 429 during a refresh storm.

---

## 7. API Security Audit

| Control | v1.0 | v2.0 | v3.0 | Evidence |
|---|---|---|---|---|
| Single outbound chokepoint | ❌ Two layers | ✅ Design | ✅ **Design + delivery** | [apiInterceptors.ts](src/utils/apiInterceptors.ts); `api.tsx` down to 2 instances |
| `Authorization: Bearer` on first-party calls | ❌ | ✅ | ✅ | `applyStandardInterceptors` |
| Third-party credential withholding | ❌ | ✅ | ✅ | `applyThirdPartyInterceptors` — `marketApi` gets error capture only |
| Keychain-unavailable handling | 🟡 | ✅ | ✅ | `isTransientTokenFailure` |
| `X-Device-Risk` | 🟡 | ✅ | ✅ | Never sent to third parties |
| `X-Device-Attestation` + server nonce | 🟡 | ✅ client | 🟡 **inert on Android** | Empty `PLAY_INTEGRITY_CLOUD_PROJECT` |
| `X-Idempotency-Key` | 🟡 | ✅ | ✅ **Improved** | Random per attempt; 6 money-moving paths |
| Redacted error telemetry | 🟡 | ✅ | ✅ **Improved** | `redactUrl` added — closes the OTP-in-telemetry leak |
| HTTPS enforcement | ✅ | ✅ | ✅ | NSC + ATS, cleartext `false` on both |
| Base URL resolution | ❌ Hardcoded | 🔴 Broken | ✅ **Fixed + fails loudly** | `getUrl()` throws on unknown key |
| **Sensitive data in URL path** | ❌ | ❌ | 🟡 **Client-side closed** | `otpTransport.ts` dual-route shim |
| Request timeout | ❌ | ❌ | ❌ | §9.1 |
| Retry / backoff | ❌ | ❌ | ❌ | — |
| `429` / `Retry-After` handling | ❌ | ❌ | 🟡 Message only, no backoff | `helpers/index.tsx:255` |
| Response schema validation | ❌ | ❌ | ❌ | Untyped `res.data` throughout — **and V-01 shows the cost**: `data` truthiness was mistaken for success |

**The last row is no longer cosmetic.** V-01 is precisely what happens when an untyped `res.data` is the contract. A discriminated response type — `{ ok: true; data: T } | { ok: false; problem: string }` — makes `if (res.data)` a compile error and the bypass unwritable. That is the single highest-leverage type-safety investment available in this codebase, and it targets L-04 at the place where it has already caused a security defect.

---

## 8. Android Security Review

| Check | v2.0 | v3.0 | Evidence |
|---|---|---|---|
| `allowBackup="false"` | ✅ | ✅ | `<application>` |
| `dataExtractionRules` | ✅ | ✅ | Cloud backup + device transfer excluded |
| Cleartext traffic | ✅ | ✅ | `cleartextTrafficPermitted="false"` in `<base-config>` |
| User trust anchors | ✅ | ✅ | `system` only; Gradle guard rejects `src="user"` |
| Certificate pinning | ✅ | ✅ | Intermediate + root backup, `expiration` drift-checked against `pinning-policy.json` |
| Pin coverage enforcement | 🟡 False positives | ✅ **Build passes** | Via exemptions — modelling defect **N-06** |
| **Pin expiry** | 🟡 Fails open, unmonitored | ✅ **Fixed** | Build-time drift check + 90-day warning + runtime telemetry |
| Exported components | ✅ | ✅ | Only `MainActivity` (`exported="true"`, required for LAUNCHER) |
| Permissions | ✅ | ✅ | 8 removed via `tools:node="remove"`; policy enforced against the **merged** manifest |
| R8 / obfuscation | ✅ | ✅ | `minifyEnabled` + `shrinkResources` + 134 keep rules |
| Release signing enforcement | ✅ | ✅ | Fails the build rather than falling back to the debug keystore |
| Root detection | ✅ | ✅ | `deviceIntegrity.ts` + foreground re-check |
| **Play Integrity** | 🟡 | ❌ **Inert** | `PLAY_INTEGRITY_CLOUD_PROJECT` empty in **all four** `.env` files |
| Firebase config exposure | ✅ | ✅ | Gitignored; H-15 guard blocks a test project in prod builds |
| `FLAG_SECURE` | ✅ | ✅ | Set before `super.onCreate` |
| App Links | 🟡 | 🟡 | `autoVerify="true"` present; setup doc written; hosting unverified |
| `versionCode` increment | ❌ | ❌ | Stuck at 1 (L-05) |

**Android is now the stronger platform.** Its guards are wired into a build system that runs them, the pin-expiry loop is closed end-to-end, and the permission policy is enforced against the merged manifest rather than the source. Two gaps remain: `PLAY_INTEGRITY_CLOUD_PROJECT` (one line) and `versionCode` (one line).

---

## 9. iOS Security Review

| Check | v2.0 | v3.0 | Evidence |
|---|---|---|---|
| `NSAllowsArbitraryLoads` | ✅ | ✅ | `false`, asserted by the release phase |
| `NSAllowsLocalNetworking` | ✅ | ✅ | Debug-only injection; asserted absent in **both** the source and built plists |
| Certificate pinning (ATS) | ✅ | ✅ | `NSPinnedCAIdentities`, ≥2 SPKI hashes, mirrors Android |
| Pin expiry | 🟡 Date in 3 places | ✅ **Fixed** | Derived from `pinning-policy.json`; the guard **fails** if it cannot read it |
| Keychain | ✅ | ✅ | Single accessor, `_THIS_DEVICE_ONLY` |
| Jailbreak detection | ✅ | ✅ | Shared `deviceIntegrity.ts` |
| App Attest | ✅ | ✅ | Native module present and reachable |
| Snapshot / capture protection | ✅ | ✅ | Synchronous overlay on resign-active |
| **Code signing entitlements** | ❌ Unset | ✅ **Fixed** | Set on both configs; guard fails if empty, missing, or non-production APNs |
| **`associated-domains`** | ❌ Absent | ✅ **Fixed** | Both Auth0 tenants, both configs |
| **H-13 tenant guard** | ❌ Dead code | ✅ **Fixed** | Reads `.env`; uses the resolved bundle ID; now actually compares the issuer |
| **Release code-sign identity** | ❌ | ❌ **Open** | `"Apple Development"` at target level |
| **Release bundle ID** | ❌ | ❌ **Open** | `com.exchangapay.tst` in the Release config |
| Signing style / profile | not assessed | ❌ **Open** | `Automatic` + empty `PROVISIONING_PROFILE_SPECIFIER` |
| Orphan entitlements file | not assessed | 🔴 **New** | **N-07** |
| Usage descriptions | 🟡 | 🟡 | `NSMicrophoneUsageDescription` / `NSLocationWhenInUseUsageDescription` still declared although Android removed both as unused — verify Sumsub actually needs them |
| Hardened runtime / symbol stripping | ✅ | ✅ | `ENABLE_HARDENED_RUNTIME`, `STRIP_INSTALLED_PRODUCT`, `COPY_PHASE_STRIP` |
| `CURRENT_PROJECT_VERSION` | ❌ | ❌ | `1` (L-05) |

**iOS closed the harder half and left the easier half open.** Entitlements, APNs environment, associated domains and the tenant-consistency guard — the items requiring judgement — are all correct now, and each is asserted by a build phase that fails rather than warns. What remains is four build-setting values, none of which needs a decision, all of which block distribution.

---

## 10. React Native Performance Audit

No performance work landed in either remediation pass. All v1.0 findings stand; measurements re-taken at `b86c318`.

### P-01 — FlatList Virtualisation Untuned · High Impact

**14** `<FlatList>` usages; **1** virtualisation prop across the entire codebase. No `removeClippedSubviews`, `initialNumToRender`, `maxToRenderPerBatch`, `windowSize` or `getItemLayout` on the transaction lists — the longest lists in the app.

```tsx
<FlatList
  data={transactions}
  keyExtractor={(item) => item.transactionId}
  renderItem={renderTransaction}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={7}
  removeClippedSubviews={Platform.OS === 'android'}
  getItemLayout={(_, index) => ({ length: ROW_H, offset: ROW_H * index, index })}
/>
```

`getItemLayout` is the highest-leverage single change for fixed-height rows — it removes layout measurement from the scroll path entirely.

### P-02 — 65 `.map()` Render Loops in Screens · High Impact

Unchanged. Each is an unvirtualised list rendering every element regardless of viewport. Convert any collection that can exceed ~20 items to `FlatList`.

### P-03 — Duplicate Libraries Inflating the Bundle · High Impact

| Overlap | Packages | Action |
|---|---|---|
| Date | `moment` + `moment-timezone` + `dayjs` | Standardise on `dayjs` (~2 KB vs ~290 KB) |
| UI kit | `@ui-kitten/components` + `react-native-elements` | Pick one |
| Signature | `react-native-signature-canvas` + `react-native-signature-capture` | Remove the unused one |
| Push | 4 packages (L-09) | Consolidate on `@notifee` + `firebase/messaging` |
| HTTP | `apisauce` + `axios` | `apisauce` wraps `axios`; direct `axios` use is redundant |

### P-04 — Image Assets Unoptimised · Medium Impact

`src/assets` is **12 MB** across 327 source files. Multiple onboarding PNGs exceed 200 KB at `@2x`/`@3x`. Run through `sharp`/`squoosh`, convert photographic assets to WebP (RN 0.83 supports it on both platforms), and lazy-load the onboarding carousel.

### P-05 — Metro / Bundle Configuration · Medium Impact

`metro.config.js` is 618 bytes — SVG transformer only. Enable inline-requires to defer module evaluation off the startup path:

```javascript
transformer: {
  getTransformOptions: async () => ({
    transform: { experimentalImportSupport: false, inlineRequires: true },
  }),
},
```

With 327 source files and a Redux store initialised at import time, inline-requires typically cuts 200–400 ms from TTI.

### P-06 — Startup Path Congestion · Medium Impact

`App.tsx` runs, before first paint: environment load, Sentry init, persistence bootstrap, legacy-token cleanup, device-integrity probe, version check, app-lock fetch, and — new this pass — `reportPinExpiry()`. The pin-expiry call is synchronous, local and cheap (it reads a bundled JSON date), so it adds no measurable cost.

The remaining risk is unchanged and is `checkVersionUpdate` — a network call with **no timeout** (9.1) on the pre-dashboard path. A network black-hole stalls first paint indefinitely. Fixing 9.1 fixes this too.

### P-07 — Memoisation Density Low · Medium Impact

**92** memoisation call sites across 327 files (98 at v2.0 — the drop reflects deleted dead code, not removed memoisation). `showPin.tsx` demonstrates the right pattern (`React.memo` + `useMemo` on the sanitised document, with a comment explaining why). Profile the dashboard and transaction list with the React DevTools profiler before broad application.

### P-08 — Excessive / Unbounded API Calls · Medium Impact

`getMarketCoins` requests `per_page=1000` from CoinGecko on the crypto screen — roughly 1 MB of JSON parsed on the JS thread to render maybe 20 visible rows. Reduce to `per_page=50` with pagination, and cache with a TTL.

### Performance Summary

| Area | Score | Trend |
|---|---|---|
| List virtualisation | 2/10 | → |
| Bundle composition | 4/10 | → |
| Asset pipeline | 3/10 | → |
| Startup path | 5/10 | → |
| Render optimisation | 5/10 | → |
| Network efficiency | 5/10 | ↑ (N-01 closed — requests now reach a live host; still no timeout) |

---

## 11. Architecture & Code Quality

| ID | Finding | v2.0 | v3.0 |
|---|---|---|---|
| A-01 | Two parallel API layers | 🟡 Shared interceptors | 🟡 **Improved** — `api.tsx` down from 7 instances to 2; `cardApi` duplicates `ApiService`, deletion is mechanical |
| A-02 | Two parallel state systems (`src/redux/` + `src/store/`) | ❌ | ❌ Unchanged |
| A-03 | Screens contain business logic | ❌ | ❌ Unchanged — and V-01 is a direct consequence: the 2FA success predicate lives in a screen |
| A-04 | Error handling | ✅ | ✅ Improved — `silentStatuses` adds a principled way to suppress a *report* without suppressing a *rejection* |
| A-05 | Logging strategy | ✅ | ✅ Centralised `log.*`; `redact.ts` and `redactUrl` extend it |
| A-06 | Type safety | ❌ 1,045 `any` | 🟡 **992** — but V-01 demonstrates the cost is now realised, not theoretical |
| A-07 | Documentation asserts controls that do not exist | 🔴 New | 🟡 **Improving** — `envContract`, `otpTransport`, `legacyCryptoTelemetry` now exist and pass; 4 cited suites still absent |
| A-08 *(new)* | **Guards that lose their input must fail, not skip** | — | 🟡 Learned in Xcode, **not applied to `scripts/`** — see N-04 |

**On A-07 and A-08 together.** This codebase's comments are unusually good — they explain *why*, name the finding, and record what was tried and rejected. That quality is exactly what makes an untrue comment dangerous: when `apiInterceptors.ts` says `__tests__/apiLayerHardening.test.ts` "asserts that every exported instance actually went through `applyStandardInterceptors()`", the comment does not merely fail to help, it stops the next reviewer from checking.

The encouraging signal is that the team drew the right general lesson this pass and wrote it down in the Xcode guard: *"a guard that silently no-ops when it loses its input reports success either way, which is worse than having no guard at all."* That is precisely right — and it is the exact defect still present in `verify-hosts.sh` and `compute-spki-pins.sh` (N-04), which had their comments corrected and their bodies left alone. The lesson was learned in one place and not propagated to the other.

**Recommendation, unchanged and now twice-justified:** add the meta-test that greps source comments for `__tests__/...` references and fails on any that do not resolve. Twenty lines; it converts a documentation claim into a checkable one and would have caught this finding in both passes.

---

## 12. Dependency Audit

`npm audit`: **1 high severity vulnerability** (`js-yaml`, CVE-2026-59870 — see **N-08**) across 796 installed packages, verified at `b86c318`. This was 0 at `608267d` — a one-day-old regression, and the argument for a scheduled review rather than an audit-triggered one.

### Unmaintained / High-Risk

| Package | Version | Concern |
|---|---|---|
| `js-yaml` (transitive) | ≤4.3.0 | **CVE-2026-59870, high.** Build-time only. `npm audit fix` |
| `react-native-push-notification` | 8.1.1 | Archived upstream; locally patched. Replace with `@notifee` (already present) |
| `react-native-signature-capture` | 0.4.12 | No release in 5+ years |
| `react-native-elements` | 3.4.3 | Superseded by `@rneui`; duplicated by `@ui-kitten` |
| `moment` / `moment-timezone` | 2.30.1 / 0.6.3 | Maintenance mode; `dayjs` already a dependency |
| `react-native-chart-kit` | 6.12.0 | Sparse maintenance |
| `babel-plugin-module-resolver` | 4.1.0 | Declared as a **runtime** dependency; belongs in `devDependencies` |

### High-Trust Dependencies (correctly pinned)

`react-native-keychain` 10, `react-native-quick-crypto` 1.1.6, `react-native-auth0` 5.10, `@sumsub/react-native-mobilesdk-module` 1.37.1, `react-native-biometrics` 3.0.1 (patched). Five local patches under `patches/` — each should carry a header comment stating what it changes and the upstream issue, so patch rebasing during the next RN upgrade is not archaeology.

The `overrides` block in `package.json` is well used — `brace-expansion`, `sharp`, `fast-xml-parser` and `uuid` are all pinned forward past known advisories. Add `js-yaml` to it if `npm audit fix` cannot resolve both paths cleanly.

### Recommendation

Add `npm audit --audit-level=high` to the release checklist as a **hard stop**, and schedule a monthly dependency review. With a near-clean baseline the marginal cost is minutes; N-08 appeared within 24 hours of a clean audit, which sets the detection lag at "next audit" today and "next review" with the change in place.

---

## 13. Compliance Mapping

### 13.1 OWASP Mobile Top 10 (2024)

| Risk | v1.0 | v2.0 | v3.0 | Note |
|---|---|---|---|---|
| M1 Improper Credential Usage | ⚠️ Fail | 🟡 | 🟡 **Partial** | Token removed from tree; **history + rotation outstanding** (C-01) |
| M2 Inadequate Supply Chain Security | 🟡 | 🟡 | 🟡 | 1 high CVE (build-time); no SBOM, no scheduled review |
| M3 Insecure Auth/Authz | 🟡 | ✅ | 🟡 → ✅ **on commit** | V-01 was a live 2FA bypass; fix is correct but **uncommitted** |
| M4 Insufficient Input/Output Validation | ⚠️ Fail | ✅ | ✅ Pass | H-03 closed |
| M5 Insecure Communication | ⚠️ Fail | ✅ | ✅ **Pass** | Pinning on all first-party hosts, both platforms, expiry closed-loop |
| M6 Inadequate Privacy Controls | 🟡 | 🟡 | 🟡 | Redaction now covers URLs; N-05 clipboard gap remains |
| M7 Insufficient Binary Protection | 🟡 | 🟡 | 🟡 | R8 + strip; no RASP/anti-tamper |
| M8 Security Misconfiguration | 🟡 | ⚠️ **Fail** | 🟡 **Partial** | N-01 and iOS entitlements closed; **iOS signing identity + bundle ID still wrong** |
| M9 Insecure Data Storage | ✅ | ✅ | ✅ Pass | Plus `data_extraction_rules.xml` |
| M10 Insufficient Cryptography | ✅ | ✅ | ✅ Pass | AES-GCM + AAD; legacy format deadline-enforced with live telemetry |

### 13.2 OWASP MASVS v2.1

| Control | v1.0 | v2.0 | v3.0 |
|---|---|---|---|
| MASVS-STORAGE-1 / -2 | ✅ / 🟡 | ✅ / 🟡 | ✅ / 🟡 (N-05) |
| MASVS-CRYPTO-1 / -2 | ✅ / 🟡 | ✅ / 🟡 | ✅ / 🟡 (M-08, deadline-managed) |
| MASVS-AUTH-1 / -2 / -3 | 🟡 | ✅ / ✅ / 🟡 | ✅ / ✅ / 🟡 (V-01 on commit) |
| MASVS-NETWORK-1 | ⚠️ | ✅ | ✅ |
| MASVS-NETWORK-2 | ⚠️ | ✅ | ✅ **(strengthened — expiry closed-loop)** |
| MASVS-PLATFORM-1 / -2 / -3 | 🟡 / ⚠️ / ✅ | ✅ / ✅ / ✅ | ✅ / ✅ / ✅ |
| MASVS-CODE-1 | 🟡 | ⚠️ **Fail** | 🟡 **Partial** (40 tests execute; 1 suite cannot) |
| MASVS-CODE-2 / -3 / -4 | ✅ / ✅ / 🟡 | ✅ / ✅ / ⚠️ | ✅ / ✅ / ✅ **(N-01 closed)** |
| MASVS-RESILIENCE-1 / -2 / -3 / -4 | ✅ / 🟡 / ✅ / 🟡 | ✅ / 🟡 / ✅ / 🟡 | ✅ / 🟡 / ✅ / 🟡 |
| MASVS-PRIVACY-1 / -2 / -3 | 🟡 | ✅ / ✅ / 🟡 | ✅ / ✅ / 🟡 |

### 13.3 PCI-DSS v4.0 (Mobile Scope)

| Req | v2.0 | v3.0 | Note |
|---|---|---|---|
| 3.2.1 — no sensitive auth data after authorization | ✅ | ✅ | PIN rendered in a CSP-locked WebView; nothing persisted |
| 3.5.1 — PAN rendered unreadable | ✅ | ✅ | `pan` caught by `SENSITIVE_KEY` (M-06) |
| 4.2.1 — strong cryptography in transit | ✅ | ✅ | TLS + pinning, both platforms, expiry monitored |
| 6.2.4 — secure development practices | ⚠️ | 🟡 | Test gate partially restored; build guards still manually triggered |
| 6.3.3 — patch management | 🟡 | 🟡 | 1 high CVE open; no scheduled review |
| 8.3.1 / 8.6.2 — no embedded credentials | 🟡 | 🟡 | Removed from tree; **present in git history and in tracked report artefacts** |
| 10.2 — audit logging | 🟡 | 🟡 | Client telemetry now redacts URLs; backend log hygiene still unverified (M-02) |
| 11.3.1 — internal vulnerability scanning | ❌ | ❌ | No SAST/DAST performed on the mobile codebase |

### 13.4 Fintech / Regulatory

**Strong:** at-rest encryption with AAD, device-bound keys, biometric step-up failing closed, screenshot prevention, backup/transfer exclusion, permission minimisation with an enforced policy, certificate pinning with a monitored expiry loop, redacted telemetry, idempotent money movement.

**Weak:** a second-factor bypass fixed but uncommitted, an unrotated credential in git history, incomplete automated verification (impairs demonstrable testing), and an iOS release configuration that cannot produce a distributable, correctly-identified build.

---

## 14. Recommendations & Roadmap

### 14.1 Immediate — Before The Next Build (P0)

| # | Action | Finding | Effort |
|---|---|---|---|
| 1 | **Commit the 2FA fail-open fix** in `authentication.tsx` and `verifyCode.tsx` | V-01 | 2 min |
| 2 | Grep the codebase for `res.data`-as-success on every verification / payment / permission gate | V-01 | 1 h |
| 3 | **Rotate the Sentry token**; confirm revocation in the Sentry audit log | C-01 | 15 min |
| 4 | iOS Release: `Apple Distribution` identity, `Manual` style, real provisioning profile, `com.exchangapay` bundle ID | H-07 | 30 min |
| 5 | Set `PLAY_INTEGRITY_CLOUD_PROJECT` in all four `.env` files | M-01 | 5 min |
| 6 | `npm audit fix`; commit the lockfile | N-08 | 10 min |
| 7 | Add `transformIgnorePatterns` to `jest.config.js` so `securityInvariants.test.ts` runs | N-03 | 15 min |

### 14.2 This Sprint (P1)

| # | Action | Finding |
|---|---|---|
| 8 | Repoint `verify-hosts.sh` + `compute-spki-pins.sh` at `.env`; **make an empty inventory exit non-zero** | N-04 |
| 9 | Route the 2FA seed through `copyEphemeral(…, 30_000)`; ban core `Clipboard` via `no-restricted-imports` | N-05 |
| 10 | Add a 30 s default request timeout + `429`/`Retry-After` backoff at the chokepoint | 9.1 |
| 11 | Constrain the Gradle host-inventory regex to `*_URL/_HOST/_ENDPOINT` keys; delete the 3 artefact exemptions | N-06 |
| 12 | Write `apiLayerHardening`, `pinningCoverage`, `keychainPolicy`, `storagePolicy` suites | N-03 |
| 13 | Add the meta-test asserting every `__tests__/…` comment reference resolves | A-07 |
| 14 | Delete the orphan `exchangapay-release.entitlements`; assert `associated-domains` in the `[H-07]` phase | N-07 |
| 15 | Drive `versionCode` / `CURRENT_PROJECT_VERSION` from one incrementing CI variable | L-05, H-05 |
| 16 | Make `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm audit --audit-level=high` mandatory release steps | N-03, L-04, N-08 |
| 17 | Add a `gitleaks` pre-commit hook; purge C-01 from history **and from the tracked report artefacts** | C-01 |
| 18 | Verify `assetlinks.json` + AASA hosting; record the date; set a `removeBy` for the custom-scheme filters | M-07 |

### 14.3 Next Sprint (P2)

19. Deploy the M-02 body-based routes; alert on the disappearance of the `security.m02` breadcrumb (M-02)
20. Deploy the backend attestation contract; watch verdicts in advisory mode for one release cycle before flipping enforcement (M-01)
21. Introduce a discriminated API response type; make `if (res.data)` a compile error (A-06, V-01)
22. Set iOS `PRODUCT_BUNDLE_IDENTIFIER` from `.env` via an xcconfig so the H-13 guard has nothing left to catch (H-07)
23. FlatList virtualisation props + `getItemLayout` on all transaction lists (P-01)
24. Metro `inlineRequires`; image pipeline through `sharp`/WebP (P-04, P-05)
25. Delete `src/utils/api.tsx` — fold `cardApi` into `ApiService.ts` (A-01)
26. Consolidate duplicate libraries: dates, UI kit, push, signature (P-03, L-09)
27. Reduce `getMarketCoins` from `per_page=1000` to 50 with pagination and a TTL cache (P-08)

### 14.4 Backlog (P3)

28. Retire `src/redux/` in favour of `src/store/` (A-02)
29. Enable `@typescript-eslint` type-aware rules; drive `any` down from 992 (L-04)
30. Screenshot-detection telemetry on iOS for the PIN and seed screens (L-07)
31. Rename `Tlv_Cards`, `cryptoCardTransations`, `encryptionTransfermation`, `onBoardingservice` (L-08)
32. Evaluate a commercial RASP layer (M7)
33. Flip `LEGACY_FORMATS_ENABLED=false` once the metric reaches zero — before 2026-11-01 (M-08)
34. Remove `NSMicrophoneUsageDescription` / `NSLocationWhenInUseUsageDescription` if Sumsub does not need them (iOS privacy labels)
35. SBOM generation + a scheduled monthly dependency review

---

## 15. Production Hardening Checklist

### Blocking

- [ ] **V-01** — the 2FA fail-open fix is committed and present in the build
- [ ] **V-01** — backend confirms it re-validates the second factor server-side on every step-up-gated operation
- [ ] **C-01** — Sentry token rotated (confirmed in the Sentry audit log)
- [ ] **H-07** — iOS Release signs with `Apple Distribution` and a real provisioning profile
- [ ] **H-07** — iOS Release `PRODUCT_BUNDLE_IDENTIFIER` is `com.exchangapay`
- [ ] **N-03** — `npx jest` exits 0; all four suites execute
- [ ] **N-08** — `npm audit --audit-level=high` is clean
- [ ] **L-05** — `versionCode` / `CURRENT_PROJECT_VERSION` incremented for this release

### Secrets & Credentials

- [x] No `auth.token` in either `sentry.properties` — verified
- [ ] `SENTRY_AUTH_TOKEN` supplied from the build environment (CI secret or gitignored `~/.sentryclirc`)
- [ ] Git history purged of the token, **including `SECURITY_AUDIT_REPORT.md` / `.html`**
- [ ] `gitleaks` pre-commit hook installed; `gitleaks detect` in CI
- [ ] `google-services.json` / `GoogleService-Info.plist` retrieved from the team secret store; retrieval path in the README

### Environment

- [ ] `npm run env:prod` executed; `.env` shows `APP_ENV=prod`
- [ ] Android `applicationId` = `com.exchangapay`; Auth0 domain = `exchangapay.eu.auth0.com`
- [ ] iOS `PRODUCT_BUNDLE_IDENTIFIER` = `com.exchangapay` in the **Release** config
- [ ] `PLAY_INTEGRITY_CLOUD_PROJECT` set in every `.env`
- [x] `ATTESTATION_ENFORCEMENT_ENABLED` present and explicit in every `.env` — verified
- [ ] Firebase production project wired (H-15 guard passes)

### Network

- [ ] `./scripts/verify-hosts.sh` (repointed) resolves every host and **exits non-zero on an empty inventory**
- [ ] Every `*_URL` host pinned on Android **and** iOS, or exempt with an unexpired `reviewBy`
- [ ] The exemption list contains only real hosts (N-06)
- [ ] Pins re-verified against live chains within 30 days of release
- [x] `cleartextTrafficPermitted="false"`; `NSAllowsArbitraryLoads=false`; no `NSAllowsLocalNetworking` in the built product — verified
- [ ] `adb shell pm get-app-links com.exchangapay` reports `verified`

### Application Security

- [x] `FLAG_SECURE` set before `super.onCreate`; iOS snapshot overlay present — verified in source
- [ ] Root/jailbreak detection verified on a rooted device and a jailbroken device
- [ ] Biometric step-up fails closed — verified by disabling biometrics mid-flow
- [ ] **2FA verification rejects a wrong code** — verified by typing one (V-01)
- [ ] Card-PIN WebView renders sanitised HTML — verified with a hostile payload
- [ ] Clipboard clears for addresses **and the 2FA seed** (N-05)
- [ ] Force-update verified end-to-end **with a real incrementing `versionCode`**
- [ ] Push notifications received on a TestFlight build (proves the entitlements fix end-to-end)

### Build & Release

- [ ] `versionCode` / `CURRENT_PROJECT_VERSION` incremented
- [x] R8 enabled (`minifyEnabled` + `shrinkResources`) — verified
- [ ] Mapping file uploaded to Crashlytics and Sentry
- [ ] iOS symbols stripped; dSYMs uploaded
- [ ] `./gradlew :app:assembleRelease` passes on a clean checkout
- [ ] All Xcode `[H-07]` release guards pass

### Verification

- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] `npm test` passes — all four suites execute
- [ ] `npm audit --audit-level=high` clean
- [ ] Backend confirms: second factor re-validated server-side; `ChangePWD` requires auth + step-up; verification codes single-use with TTL and rate limiting; request bodies excluded from access logs; attestation tokens verified and rejected on a bad verdict

---

## 16. Final Scoring

### 16.1 Security Score — **8.0 / 10** *(v2.0: 7.5 — ↑ 0.5 · v1.0: 7.0)*

| Dimension | Weight | v1.0 | v2.0 | v3.0 |
|---|---|---|---|---|
| Cryptography & storage | 20 % | 9.0 | 9.0 | 9.0 |
| Network security | 20 % | 5.0 | 9.0 | **9.5** |
| Authentication & session | 15 % | 7.5 | 8.5 | **8.0** |
| Platform hardening | 15 % | 8.0 | 8.5 | **8.5** |
| Secrets management | 10 % | 2.0 | 6.0 | 6.0 |
| API security | 10 % | 5.0 | 8.0 | **8.5** |
| Verification & assurance | 10 % | 6.0 | 2.0 | **5.5** |

**Network security** rises to 9.5: pinning coverage, cross-platform parity, build-time drift detection and runtime expiry telemetry now form a closed loop, and the host inventory is down to three live hosts.

**Authentication & session** *falls* 0.5 despite the fix. V-01 was a real, UI-reachable second-factor bypass that shipped and was not caught by any of the three audits until this one. The fix is correct — but it is uncommitted, and the underlying idiom (`res.data` as a success predicate) has not been audited elsewhere. The score returns to 8.5+ on commit plus a completed sweep.

**Verification & assurance** recovers from 2.0 to 5.5: 40 tests execute and pass, `getUrl()` fails loudly, the pin-expiry loop is closed, and the Xcode guards fail rather than skip. It is not higher because one suite still cannot run and four cited suites still do not exist.

**Secrets management** is unchanged at 6.0 and will not move until the token is rotated. Removing a secret from HEAD is hygiene; rotation is the control.

### 16.2 Performance Score — **5.5 / 10** *(unchanged)*

No performance work in either remediation pass. Virtualisation, bundle composition and the asset pipeline remain untuned. N-01's closure means requests now reach live hosts, which improves real-world responsiveness materially — but that is a correctness fix, not a performance one.

### 16.3 Maintainability Score — **5.5 / 10** *(v2.0: 4.5 — ↑ 1.0 · v1.0: 5.0)*

**Improved:** five dead API instances and the `environments/` directory deleted; one HTTP chokepoint that now genuinely serves everything; the pin-expiry date derived from one source instead of duplicated five ways; `any` down to 992; four test suites restored; and — most valuable — `getUrl()` converted from silent-empty to loud-throw, which is the difference between a codebase that hides mistakes and one that surfaces them.

**Still weak:** two state systems, business logic in screens (which is *where V-01 lived*), four test suites cited but absent, `tsc --noEmit` unrun, and two shell scripts whose comments were corrected while their bodies were not.

### 16.4 Mobile Security Score (MASVS-weighted) — **8.0 / 10** *(v2.0: 7.5 — ↑ 0.5 · v1.0: 6.5)*

MASVS-NETWORK-2 strengthened by the closed-loop expiry monitoring; MASVS-CODE-4 moves to passing with N-01 closed; MASVS-CODE-1 recovers from failing to partial; MASVS-PLATFORM fully passing on both platforms now that the iOS entitlements are applied. Held back by MASVS-AUTH-3 (V-01 uncommitted) and MASVS-STORAGE-2 (N-05).

### 16.5 Overall Risk Rating

```
Before remediation      (v1.0):   MEDIUM-HIGH
First verification      (v2.0):   HIGH
Second verification     (v3.0):   MEDIUM          ← current
```

The Critical band is empty for the first time across three audits. Both High findings are narrow: one is four build-setting values in an Xcode configuration, the other is a build-time-only dependency CVE with a one-command fix.

The trajectory is what matters. v2.0's rating rose because a good remediation was delivered badly — the fixes were sound and the delivery introduced a Critical regression, a build blocker and the loss of the test layer. **v3.0's rating falls because this pass fixed the delivery without weakening the fixes**, and in three cases (N-01, M-02, M-03) replaced a point fix with a structural one that makes the same class of defect harder to reintroduce.

### 16.6 Closing Assessment

The most useful thing to record about this pass is the pattern in *how* the findings were closed.

v2.0 asked for three things and got better than it asked for in each:

| v2.0 asked for | What was delivered |
|---|---|
| Restore three missing `apiUrls` keys | Investigated *why* they were missing, found the hosts were dead, deleted the instances, migrated the call sites — **and made `getUrl()` throw**, so the failure mode is now impossible rather than merely absent |
| Add pin-expiry telemetry | Made `pinning-policy.json` the single source of truth for Gradle, Xcode **and** runtime, eliminating a date duplicated five ways |
| Move OTP codes to the request body | Built a transport shim that closes the finding on a **backend deploy** rather than a coordinated release, plus `redactUrl` closing the client-side half immediately |

That is the difference between fixing findings and fixing the conditions that produce them, and it is a meaningful step up from the v2.0 pass.

The counter-pattern is equally instructive and is now the main thing holding the score down. Three defects in this pass share one shape — **the comment was updated and the code was not**:

| Defect | Comment says | Code does |
|---|---|---|
| N-04 | Header rewritten to drop the `environments/*.js` reference | Body still parses `environments/dev.js`, exits 0 having verified nothing |
| N-06 | Exemption entries claim a considered security decision | Three are parsing artefacts from an unfixed regex |
| N-03 | Five comments cite `apiLayerHardening.test.ts` as the enforcement mechanism | The file does not exist |

The Xcode guard added this pass states the correct principle explicitly — *"a guard that silently no-ops when it loses its input reports success either way, which is worse than having no guard at all"* — and that principle was not carried across to the two shell scripts sitting in the same repository with the same defect. The lesson is written down. It needs to be applied where it already applies.

**One structural change closes this class permanently:** the twenty-line meta-test that greps source comments for `__tests__/…` references and fails on any that do not resolve. Generalise it slightly — assert that every script named in the hardening checklist exits non-zero on empty output, and that every exemption in `pinning-policy.json` names a host that appears in a `*_URL` key — and every "the comment is true" claim in this repository becomes a checkable one.

**Recommended sequence:** commit V-01 and rotate the Sentry token today (both are minutes, both are currently exposed). Fix the four iOS signing values and set `PLAY_INTEGRITY_CLOUD_PROJECT` this week — that unblocks distribution and activates the Android attestation path. Restore the four cited test suites and add the meta-test before the next remediation pass. Then re-audit: on that trajectory the next pass should be scoring 8.5+ with an empty High band.
