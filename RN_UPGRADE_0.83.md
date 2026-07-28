# React Native 0.81.1 → 0.83.6 Upgrade Plan

**Project:** exchangapay · **Branch:** `exchangapayTst_Dec` → new branch `rn-0.83-upgrade`
**Prepared:** 2026-07-28

All version numbers, API removals and deprecations below were verified against the published
`react-native@0.83.6` tarball, `@react-native-community/template@0.83.6`, `@react-native/gradle-plugin@0.83.6`
and the project's installed `node_modules` — not from release notes.

---

## 1. Executive summary

| | |
|---|---|
| **Overall risk** | **Medium** — lower than a 2-minor jump normally implies |
| **Why lower** | The app is *already* on the New Architecture on both platforms, so 0.82's removal of the Legacy Architecture is a no-op |
| **Why not low** | Gradle 8.14 → 9.0, compileSdk 35 → 36, Reanimated worklets 0.5 → 0.11, and 4 unmaintained native modules |
| **Biggest build-time risk** | Gradle 9 + `firebase-crashlytics-gradle` 2.9.9 (2023) |
| **Biggest runtime risk** | `@ui-kitten/components` (79 files, unpublished since 2022) and `react-native-vector-icons` v10 (139 files) |
| **Hard blocker** | `react-native-worklets` must go 0.5.2 → 0.11.3 |

### Two findings that shape the whole plan

**1. You are already on the New Architecture — on both platforms.**

[ios/Podfile](ios/Podfile) says `:fabric_enabled => false, # Disable New Architecture`. That comment is wrong.
RN 0.81's `react_native_pods.rb:97` computes `fabric_enabled = fabric_enabled || NewArchitectureHelper.new_arch_enabled`,
and `new_arch_enabled` defaults to `true`. [ios/exchangapay/Info.plist](ios/exchangapay/Info.plist) confirms it:
`RCTNewArchEnabled = true`. Android has `newArchEnabled=true`.

Consequence: the headline breaking change of 0.82 (Legacy Architecture removal) costs you nothing.

**2. `node_modules` is already in an invalid state today.**

`react-native-reanimated` resolved to **4.5.3**, which declares:

```
"react-native": "0.83 - 0.86"
"react-native-worklets": "0.10.x - 0.11.x"
```

But [package.json](package.json) pins `react-native-worklets: ^0.5.1` → resolved 0.5.2. So the installed Reanimated
does not support RN 0.81 *and* is paired with the wrong worklets runtime. **The upgrade fixes this**, provided
worklets is bumped in the same commit.

---

## 2. Environment prerequisites

| Requirement | RN 0.83.6 needs | You have | Status |
|---|---|---|---|
| Node | `>= 20.19.4` | 22.0.0 | OK |
| Xcode | `>= 16.1` (hard `raise` in `check_minimum_required_xcode`) | 26.0.1 | OK |
| JDK | 17+ | 17.0.12 (Zulu) | OK |
| Ruby / CocoaPods | `>= 2.6.10` / `>= 1.13` | 3.3.1 | OK |
| iOS deployment target | 15.1 | verify in Xcode project | **Check** |
| Gradle wrapper | 9.0.0 | 8.14.3 | **Change** |
| AGP (resolved via RN gradle plugin) | 8.12.0 | 8.12.0 | No change |
| Kotlin | 2.1.20 | 2.1.20 | No change |
| NDK | 27.1.12297006 | 27.1.12297006 | No change |
| compileSdk / targetSdk / buildTools | 36 / 36 / 36.0.0 | 35 / 35 / 35.0.0 | **Change** |

No toolchain installs are required. Only project config changes.

---

## 3. Gaps found during audit (not in the initial plan)

These are the items the first pass missed. Each was verified against 0.83.6 sources.

### 3.1 `MainApplication.kt` uses a deprecated, assertion-guarded class — **must migrate**

[android/app/src/main/java/com/exchangapay/app/MainApplication.kt](android/app/src/main/java/com/exchangapay/app/MainApplication.kt)
overrides `reactNativeHost` with `DefaultReactNativeHost`. In 0.83.6:

- `ReactNativeHost.java:38` is annotated `@Deprecated(since = "This class is part of Legacy Architecture and will be removed in a future release")` **and** `@LegacyArchitecture(logLevel = LegacyArchitectureLogLevel.ERROR)`.
- Its static initialiser calls `LegacyArchitectureLogger.assertLegacyArchitecture("ReactNativeHost", ERROR)`, which **throws `AssertionException`** when `ReactBuildConfig.UNSTABLE_ENABLE_MINIFY_LEGACY_ARCHITECTURE` is enabled in a debug build. That flag is off by default today, so this is a *latent* crash, not an immediate one — but it is a one-way door.
- `override val isNewArchEnabled` — `DefaultReactNativeHost` now hard-`error()`s if this is ever false: *"Overriding isNewArchEnabled to false is not supported anymore since React Native 0.82. Please … remove the override for `isNewArchEnabled`."*
- `override val isHermesEnabled` — explicitly `@Deprecated` and **ignored**. Emits a Kotlin deprecation warning (a build failure if `allWarningsAsErrors` is ever turned on).

The 0.83 template dropped `ReactNativeHost` entirely. Migrate to the `reactHost by lazy { … }` form (§5.7).

### 3.2 `AndroidManifest.xml` still carries the removed `package=` attribute

[android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml) declares
`package="com.exchangapay.tst"`. This has been superseded by `namespace` in `app/build.gradle`
(which you already set). AGP 8 warns; AGP 9 removes it. Delete the attribute.

### 3.3 `ios/exchangapay/PrivacyInfo.xcprivacy` is missing

The 0.83.6 template ships `ios/HelloWorld/PrivacyInfo.xcprivacy`; your app has no privacy manifest at all.
This is an **App Store submission requirement**, independent of RN. Given the app uses Keychain, DeviceInfo,
file timestamps and crash reporting, several required-reason APIs apply. Add it and register it in the Xcode
project's Copy Bundle Resources.

### 3.4 `react-native-bootsplash` is never initialised on iOS

`RNBootSplash.init(...)` is present in [MainActivity.kt](android/app/src/main/java/com/exchangapay/app/MainActivity.kt),
but [ios/exchangapay/AppDelegate.swift](ios/exchangapay/AppDelegate.swift) has no bootsplash setup — so on iOS
the splash is the LaunchScreen storyboard only, and `BootSplash.hide()` has nothing to hide. Combined with §5.9
(migrating off `react-native-splash-screen`), fix this while you're in the file.

### 3.5 Three more unused dependencies

Beyond the nine in §4, a wider grep found:

- `react-native-haptic-feedback` — 0 references (installed 1.14.0, latest 3.0.0)
- `camelcase-keys` — 0 references
- `react-native-signature-capture` — 1 reference, but `react-native-signature-canvas` (2 references) already covers it

Note: `@react-native-masked-view/masked-view` and `react-native-pager-view` also show 0 direct references but are
**required peers** of `@react-navigation/drawer` and `react-native-tab-view`. **Keep both.**

### 3.6 `windowSoftInputMode` diverges from the template

Your manifest sets `adjustPan`; the 0.83 template uses `adjustResize`. Given commit `505e19a`
("ios camera and input keyboardavoidng issues resolved") and the unmaintained
`react-native-keyboard-aware-scroll-view` (6 files), this is worth revisiting — but **not during this upgrade**.
Change one variable at a time.

---

## 4. Phase 0 — Remove dead dependencies

Zero references across `src/`, `App.tsx`, `index.js`. Removing these deletes most of the upgrade's risk surface
before the upgrade even starts.

| Package | Installed | Why remove |
|---|---|---|
| `react-native-flipper` | 0.273.0 | Flipper removed from RN core; actively fights the build |
| `redux-flipper` | 2.0.3 | Used once — [src/store/index.tsx:48](src/store/index.tsx#L48); delete that block |
| `react-native-redash` | 18.1.5 | Reanimated 2/3 API, incompatible with Reanimated 4 |
| `victory-native` | 36.9.2 | 5 majors behind (latest 41.26.0) |
| `@gorhom/bottom-sheet` | 4.6.4 | v4 does not support Reanimated 4 |
| `react-native-wagmi-charts` | 2.10.0 | Depends on `react-native-redash` |
| `react-native-reanimated-carousel` | 3.5.1 | Pins `gesture-handler <3.0.0` |
| `rn-swipe-button` | 1.3.8 | Unused |
| `react-native-version-check` | 3.5.0 | Unused |
| `@gurukumparan/react-native-android-inapp-updates` | 2.0.2 | Unused |
| `react-native-haptic-feedback` | 1.14.0 | Unused |
| `camelcase-keys` | 7.0.2 | Unused |
| `hooks` | 0.3.2 | All 64 "hooks" hits are the babel `module-resolver` alias to `./src/hooks`. The npm package is unused — and a generic name like this is a dependency-confusion liability |

**13 packages removed. One code edit** (`src/store/index.tsx`). Commit separately, verify on 0.81, then proceed.

---

## 5. Phase 1–3 — File-by-file changes

### 5.1 `package.json` — version bumps

```diff
  "dependencies": {
-   "react": "19.1.0",
+   "react": "19.2.0",
-   "react-native": "0.81.1",
+   "react-native": "0.83.6",
-   "@react-native/new-app-screen": "0.81.1",
+   "@react-native/new-app-screen": "0.83.6",
-   "react-native-worklets": "^0.5.1",
+   "react-native-worklets": "0.11.3",
-   "react-native-reanimated": "^4.1.0",
+   "react-native-reanimated": "4.5.3",
-   "@sentry/react-native": "^7.4.0",
+   "@sentry/react-native": "^8.20.0",
-   "@react-native-firebase/app": "^23.3.1",
-   "@react-native-firebase/crashlytics": "^23.3.1",
-   "@react-native-firebase/messaging": "^23.3.1",
+   "@react-native-firebase/app": "^25.1.0",
+   "@react-native-firebase/crashlytics": "^25.1.0",
+   "@react-native-firebase/messaging": "^25.1.0",
  },
  "devDependencies": {
-   "@react-native/babel-preset": "0.81.1",
-   "@react-native/eslint-config": "0.81.1",
-   "@react-native/metro-config": "0.81.1",
-   "@react-native/typescript-config": "0.81.1",
+   "@react-native/babel-preset": "0.83.6",
+   "@react-native/eslint-config": "0.83.6",
+   "@react-native/metro-config": "0.83.6",
+   "@react-native/typescript-config": "0.83.6",
-   "@react-native-community/cli": "^20.0.0",
+   "@react-native-community/cli": "20.0.0",
-   "@types/react": "^19.1.0",
+   "@types/react": "^19.2.0",
-   "react-test-renderer": "19.1.0",
+   "react-test-renderer": "19.2.0",
  },
  "engines": {
-   "node": ">=20"
+   "node": ">=20.19.4"
  }
```

Also move `babel-plugin-module-resolver` from `dependencies` to `devDependencies` (it is build-time only).

**Pin exactly — drop the `^`** on `react-native`, `@react-native/*`, `@react-native-community/cli*`,
`react-native-reanimated` and `react-native-worklets`. Codegen output must match the runtime exactly; a silent
patch bump is how "it worked yesterday" happens.

### 5.2 `babel.config.js`

```diff
-   "react-native-reanimated/plugin",
+   "react-native-worklets/plugin",
```

In Reanimated 4 that file is now literally `module.exports = require('react-native-worklets/plugin')`.
It must remain **last** in the plugins array.

### 5.3 `android/build.gradle`

```diff
  ext {
-     buildToolsVersion = "35.0.0"
+     buildToolsVersion = "36.0.0"
      minSdkVersion = 24
-     compileSdkVersion = 35
+     compileSdkVersion = 36
-     targetSdkVersion = 35
+     targetSdkVersion = 35   // see §6 — deliberately NOT 36 in this upgrade
      ndkVersion = "27.1.12297006"
      kotlinVersion = "2.1.20"
-     FLIPPER_VERSION = "0.273.0"
  }
  dependencies {
      classpath("com.android.tools.build:gradle")
-     classpath('com.google.gms:google-services:4.4.0')
+     classpath('com.google.gms:google-services:4.4.4')
-     classpath('com.google.firebase:firebase-crashlytics-gradle:2.9.9')
+     classpath('com.google.firebase:firebase-crashlytics-gradle:3.0.6')
      classpath("com.facebook.react:react-native-gradle-plugin")
      classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
  }
```

`firebase-crashlytics-gradle` 2.9.9 dates from 2023 and uses Gradle APIs removed in Gradle 9. **This is the most
likely single cause of a first-build failure.**

### 5.4 `android/app/build.gradle`

This file **hardcodes** the SDK versions instead of reading `rootProject.ext`, so editing §5.3 alone is not enough:

```diff
  android {
      ndkVersion rootProject.ext.ndkVersion
-     buildToolsVersion "35.0.0"
+     buildToolsVersion rootProject.ext.buildToolsVersion
-     compileSdk 35
+     compileSdk rootProject.ext.compileSdkVersion
      namespace "com.exchangapay.tst"
      defaultConfig {
          applicationId "com.exchangapay.tst"
          minSdkVersion rootProject.ext.minSdkVersion
-         targetSdkVersion 35
+         targetSdkVersion rootProject.ext.targetSdkVersion
```

### 5.5 `android/gradle/wrapper/gradle-wrapper.properties`

```diff
- distributionUrl=https\://services.gradle.org/distributions/gradle-8.14.3-bin.zip
+ distributionUrl=https\://services.gradle.org/distributions/gradle-9.0.0-bin.zip
```

Gradle 9 removed several long-deprecated APIs. Any `.gradle` script in `node_modules` using them will fail.
Prime suspects: the Sentry gradle script, VisionCamera.

**`buildDir` is not one of them.** `react-native-vector-icons/fonts.gradle` uses `$buildDir`, which is
**deprecated but still present** in Gradle 9.0 — `Project.getBuildDir()` is declared in the
[9.0 javadoc](https://docs.gradle.org/9.0.0/javadoc/org/gradle/api/Project.html) and removal is milestoned for
Gradle 10 ([gradle/gradle#25661](https://github.com/gradle/gradle/issues/25661)). It warns; it does not fail.
Do not budget time for a vector-icons build failure on this upgrade.

### 5.6 `android/gradle.properties`

```diff
  android.useAndroidX=true
- android.enableJetifier=true
```

Jetifier is inert under AGP 8+ and adds measurable time to every build.

### 5.7 `android/app/src/main/java/com/exchangapay/app/MainApplication.kt` — rewrite

Replaces the deprecated `ReactNativeHost` path described in §3.1.

```kotlin
package com.exchangapay.tst

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here.
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
```

Dropped: `reactNativeHost`, `DefaultReactNativeHost`, `getJSMainModuleName()`, `isNewArchEnabled`, `isHermesEnabled`.
All are either deprecated, ignored, or now defaulted.

> Housekeeping: the file lives in `java/com/exchangapay/app/` but declares `package com.exchangapay.tst`.
> Legal in Kotlin, but confusing. Optional to fix — **not** during this upgrade.

### 5.8 `android/app/src/main/AndroidManifest.xml`

```diff
- <manifest xmlns:android="http://schemas.android.com/apk/res/android"
-  xmlns:tools="http://schemas.android.com/tools"
-  package="com.exchangapay.tst">
+ <manifest xmlns:android="http://schemas.android.com/apk/res/android"
+  xmlns:tools="http://schemas.android.com/tools">
```

`MainActivity.kt` needs **no changes** — it matches the 0.83 template apart from the `RNBootSplash.init` line.

### 5.9 `ios/Podfile`

```diff
    use_react_native!(
      :path => config[:reactNativePath],
-     :app_path => "#{Pod::Config.instance.installation_root}/..",
-     # Disable New Architecture
-     :fabric_enabled => false,
-     :hermes_enabled => true
+     :app_path => "#{Pod::Config.instance.installation_root}/.."
    )
```

In 0.83.6, `react_native_pods.rb` hardcodes `fabric_enabled = true`, `ENV['RCT_FABRIC_ENABLED'] = "1"` and
`ENV["RCT_NEW_ARCH_ENABLED"] = "1"` at lines 99–103. Passing these arguments does nothing except mislead the
next reader.

**Keep** `use_frameworks! :linkage => :static` — Firebase and Sumsub require it. Be aware this is the single most
common source of iOS pain on the New Architecture (duplicate symbols, Swift module maps, header visibility).
If pods fail to link, look here, not at RN.

**Keep** both `source` lines (CocoaPods CDN + Sumsub Specs) and the `setup_permissions([...])` block.

### 5.10 `ios/exchangapay/PrivacyInfo.xcprivacy` — new file

Copy from the 0.83.6 template as a base, then add required-reason declarations for the APIs your dependencies use
(UserDefaults, file timestamps, disk space, system boot time). **Must be added to the Xcode target's
Copy Bundle Resources** phase, not just dropped on disk.

### 5.11 `ios/exchangapay/AppDelegate.swift`

No changes required for RN 0.83 — it already matches the 0.83 template structure (`RCTReactNativeFactory` +
`RCTAppDependencyProvider`), plus your `FirebaseApp.configure()`.

Add bootsplash initialisation here as part of §3.4 / §6.4.

### 5.12 `react-native.config.js`

```diff
    dependencies: {
-     "react-native-flipper": {
-       platforms: {
-         ios: null,
-       },
-     },
      'react-native-permissions': { ... },
    },
```

Keep the `react-native-permissions` override and `assets: ["./src/assets/fonts"]`.

### 5.13 Files needing **no** changes

`metro.config.js` · `tsconfig.json` · `jest.config.js` · `app.json` · `index.js` ·
`ios/.xcode.env` · `ios/.xcode.env.local` · `Gemfile` (identical to the 0.83.6 template) ·
`android/settings.gradle` (identical apart from `rootProject.name`) ·
`android/app/src/main/java/.../MainActivity.kt`

---

## 6. Phase 4 — Replace unmaintained native modules

These are the real runtime-crash candidates under Fabric/TurboModules. **All four replacements are packages you
already have installed and already use elsewhere**, so each is a single-file change with no new dependency.

| Remove | Used at | Replace with |
|---|---|---|
| `react-native-signature-capture` 0.4.12 (2019, legacy ViewManager) | [src/screens/Profile/editprofile.tsx:26](src/screens/Profile/editprofile.tsx#L26) | `react-native-signature-canvas` — already a dep, already used in 2 files |
| `react-native-splash-screen` 3.3.0 | [src/screens/Crypto/cryptoCardTransations/DownloadBill.tsx:29](src/screens/Crypto/cryptoCardTransations/DownloadBill.tsx#L29) | `react-native-bootsplash` — already a dep, already wired on Android |
| `react-native-push-notification` 8.1.1 + `@react-native-community/push-notification-ios` 1.12.0 (both archived) | [src/utils/FCMNotification.js:2-3](src/utils/FCMNotification.js#L2-L3) | `@notifee/react-native` + `@react-native-firebase/messaging` — both already deps |
| `react-native-fs` 2.20.0 (unmaintained, no TurboModule) | [src/components/FileUpload/filePreviewWithId.tsx:14](src/components/FileUpload/filePreviewWithId.tsx#L14) | `react-native-blob-util` — already a dep, already used in 3 files |

Doing this **before** the RN bump means you upgrade a smaller, cleaner surface, and any breakage is unambiguously
attributable.

### 6.1 A note on `targetSdk 36`

`compileSdk 36` is what RN 0.83 requires. `targetSdk 36` is a **separate, Play-Store-driven decision** and carries
its own risk: on Android 16, edge-to-edge is mandatory and your `edgeToEdgeEnabled=false` opt-out is **ignored** —
content draws under the status and navigation bars app-wide.

**Recommendation: ship this upgrade with `compileSdk 36` / `targetSdk 35`**, then do edge-to-edge as a separate,
focused piece of work with its own QA pass. Mixing the two turns a build upgrade into a UI regression hunt.

---

## 7. Full dependency disposition

Every dependency, classified. Versions are what npm actually resolved in your current `node_modules`.

### Remove (13) — see §4

### Replace (5) — see §6

### Bump (9)

| Package | Installed | Target | Reason |
|---|---|---|---|
| `react-native` | 0.81.1 | 0.83.6 | the upgrade |
| `react` | 19.1.0 | 19.2.0 | RN 0.83 peer |
| `react-native-worklets` | 0.5.2 | 0.11.3 | **hard blocker** — Reanimated 4.5.3 requires `0.10.x - 0.11.x` |
| `react-native-reanimated` | 4.5.3 | 4.5.3 (pin) | already correct, just unpin |
| `@sentry/react-native` | 7.13.0 | ^8.20.0 | 7.x predates 0.83 |
| `@react-native-firebase/*` | 23.8.8 | ^25.1.0 | 2 majors behind |
| `@react-native/*` | 0.81.1 | 0.83.6 | must match RN |
| `react-test-renderer` | 19.1.0 | 19.2.0 | must match React |
| `@types/react` | ^19.1.0 | ^19.2.0 | must match React |

### Watch — works, but verify hands-on (7)

| Package | Installed | Concern |
|---|---|---|
| `@ui-kitten/components` | 5.3.1 | **79 files.** Unpublished since 2022. Largest single point of failure in the app |
| `react-native-vector-icons` | 10.3.0 | **139 files.** Verified compatible with 0.83.6 — ships `codegenConfig` + `src/newarch`, and RN's gradle plugin rewrites its legacy `com.facebook.react:react-native` dependency. But **deprecated on npm** in favour of `@react-native-vector-icons/*` (13.1.2), and its `fonts.gradle` + `android/build.gradle` rely on `buildDir`, `applicationVariants.all` and `compileSdkVersion` — all removed in **AGP 9**. Expires at the AGP 9 upgrade, not this one. All 6 families in use have scoped equivalents |
| `react-native-vision-camera` | 4.7.3 | v5.2.0 exists but adds `react-native-nitro-modules` + `react-native-nitro-image` peers — a real migration. Try 4.7.3 first. `VisionCamera_enableFrameProcessors=true` is the part most likely to fail |
| `react-native-elements` | 3.4.3 | **20 files.** Unmaintained since 2022. Mostly JS, so likely renders — but plan a migration independently |
| `react-native-keyboard-aware-scroll-view` | 0.9.5 | **6 files.** Unmaintained, known to misbehave on Fabric. `react-native-keyboard-controller` is the modern replacement. Related to commit `505e19a` |
| `@sumsub/react-native-mobilesdk-module` | 1.45.1 | Closed-source SDK behind a private pod source. You cannot patch it. Test the full KYC flow explicitly |
| `react-native-render-html` | 6.3.4 | **9 files.** Unmaintained but pure JS; likely fine |

### Deliberately not upgraded in this pass

Behind latest, but stable and unrelated to RN 0.83. Upgrading them here only adds variables:

`@react-native-async-storage/async-storage` 2.2.0 (→3.1.1) · `react-native-auth0` 4.6.0 (→5.10.0) ·
`react-native-bootsplash` 6.3.12 (→7.3.2) · `react-native-webview` 13.17.0 (→14.0.1) ·
`react-native-blob-util` 0.19.11 (→0.24.10) · `react-native-device-info` 14.1.1 (→15.0.2) ·
`@react-native-community/netinfo` 11.5.2 (→12.0.1) · `react-native-chart-kit` 6.12.3 (→7.0.2) ·
`react-native-pager-view` 6.9.1 (→8.0.4) · `react-native-gesture-handler` 2.32.0 (→3.1.0) ·
`react-native-modal` 14.0.0-**rc.1** (still an RC in production — worth revisiting later) ·
`redux-persist-keychain-storage` 0.1.1

`react-native-screens` 4.26.2, `react-native-safe-area-context` 5.8.0, `react-native-svg` 15.15.5,
`react-native-permissions` 5.6.1 and all `@react-navigation/*` are already at latest.

---

## 8. Execution order

Four commits. Each is independently verifiable and independently revertable.

```bash
git checkout -b rn-0.83-upgrade
```

**Commit 0 — baseline (do not skip).**
There is currently **no `ios/Podfile.lock` and no `ios/Pods/`**, so the iOS build state is unverified. Establish a
known-good build on 0.81 first, and commit the resulting `Podfile.lock` — otherwise you cannot tell which breakage
the upgrade caused.

```bash
cd ios && bundle install && bundle exec pod install && cd ..
npx react-native run-ios
npx react-native run-android
git add ios/Podfile.lock package-lock.json && git commit -m "chore: baseline lockfiles before RN upgrade"
```

**Commit 1 — Phase 0 removals (§4).** Build both platforms. Smoke test. Still on 0.81.

**Commit 2 — Phase 4 module replacements (§6).** Build both platforms. Smoke test. Still on 0.81.

**Commit 3 — the upgrade itself (§5).** All file changes together, then:

```bash
rm -rf node_modules package-lock.json ios/Pods ios/Podfile.lock
npm install
cd ios && bundle install && bundle exec pod install --repo-update && cd ..
cd android && ./gradlew clean && cd ..
npx react-native start --reset-cache
```

Use the [upgrade-helper diff](https://react-native-community.github.io/upgrade-helper/?from=0.81.1&to=0.83.6)
as a **cross-check only**. This project has diverged far enough from the template (Firebase, Sentry, permissions,
Sumsub, vector-icons, bootsplash) that native changes must be applied by hand, not by patch.

---

## 9. Verification checklist

### Architecture sanity (do this first)

- [ ] `global.nativeFabricUIManager` is truthy on **both** platforms
- [ ] Android logcat shows no `LegacyArchitecture` soft exceptions
- [ ] Pod install prints "Configuring the target with the New Architecture"

### Build-time

- [ ] Android debug + **release** (release is where Gradle 9 / crashlytics-gradle / ProGuard problems surface)
- [ ] iOS debug + **release** (release is where the static-frameworks + New Arch problems surface)
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] `npm test` — note `__tests__/App.test.tsx` uses `react-test-renderer`, which is deprecated in React 19

### Runtime — by feature

- [ ] **Auth** — Auth0 login/logout, token refresh, deep-link callback (13 files)
- [ ] **Security** — biometrics, Keychain read/write, `redux-persist` rehydration from keychain storage (13 files)
- [ ] **KYC** — full Sumsub flow end to end (closed-source; highest untestable risk)
- [ ] **Camera** — VisionCamera preview, QR/code scanner, frame processors
- [ ] **Notifications** — FCM foreground / background / killed-state; the `setBackgroundMessageHandler` in [index.js](index.js); Notifee display; badge count; **verify after the push-notification migration in §6**
- [ ] **Files** — upload, download, preview, share (post `react-native-fs` → `blob-util` migration)
- [ ] **Signature capture** — post `signature-capture` → `signature-canvas` migration
- [ ] **Splash** — bootsplash on Android *and* iOS (§3.4), no flash, hides correctly
- [ ] **UI shell** — UI Kitten screens (79 files), vector icons render (139 files), custom fonts load
- [ ] **Animation** — every Reanimated-driven screen. Reanimated 4 + worklets 0.11 is the largest single version jump here
- [ ] **Navigation** — drawer, bottom tabs, native stack, tab view, gesture-driven transitions
- [ ] **Charts** — chart-kit screens (3 files), `react-native-svg` rendering (17 files)
- [ ] **WebViews** — cookies, clipboard, HTML rendering (`render-html`, 9 files)
- [ ] **Keyboard** — `keyboard-aware-scroll-view` screens (6 files); regression-prone, see commit `505e19a`
- [ ] **Crash reporting** — force a test crash; confirm it lands in both Crashlytics and Sentry with symbolication

### Device matrix

- [ ] Android 16 device (edge-to-edge behaviour, even at targetSdk 35)
- [ ] Android 8 / API 24-ish device (`minSdk 24`)
- [ ] iOS 15.1 device or simulator (new minimum)
- [ ] Latest iOS device

---

## 10. Rollback

The branch plus the **Commit 0** lockfiles are the restore point:

```bash
git checkout exchangapayTst_Dec
rm -rf node_modules ios/Pods ios/Podfile.lock
git checkout -- package-lock.json ios/Podfile.lock
npm ci
cd ios && bundle exec pod install && cd ..
cd android && ./gradlew clean && cd ..
```

Because the upgrade is split into four commits, a partial rollback (`git revert` of Commit 3 only) keeps the Phase 0
and Phase 4 cleanups, which are valuable on 0.81 regardless of whether the RN bump ships.

---

## 11. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| 1 | 0.83.6 or **0.83.10**? | **0.83.10** — same minor, identical migration, 4 patch releases of fixes, zero extra work |
| 2 | `targetSdk` 35 or 36? | **35** for this upgrade; do edge-to-edge separately (§6.1) |
| 3 | VisionCamera 4.7.3 or 5.2.0? | **4.7.3 first.** Only migrate to v5 (nitro-modules) if 4.7.3 fails on 0.83 |
| 4 | `@ui-kitten/components` (79 files) | Out of scope here, but it is unmaintained and blocks future upgrades. Needs its own plan |
| 5 | `react-native-modal` `14.0.0-rc.1` | An RC in production. Worth resolving independently |
