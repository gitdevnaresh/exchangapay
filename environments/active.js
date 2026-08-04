/**
 * THE ONE LINE THAT DECIDES WHICH BACKEND AND WHICH AUTH0 TENANT THIS BUILD
 * TALKS TO — security finding H-13.
 *
 * ===========================================================================
 * WHY THIS FILE EXISTS
 * ===========================================================================
 * All three environments' Auth0 client IDs and API hosts used to sit in one
 * object literal in Environment.js, so every build shipped every tenant's
 * identifiers. For a PKCE public client those IDs are not secrets — but
 * publishing the full list hands an attacker the tenant layout, the naming
 * convention and the dev/test endpoints for free, and it makes a bundle from
 * one environment a map of all of them.
 *
 * A module that is never imported is never bundled. Because this file imports
 * exactly one environment, Metro's module graph reaches exactly one — the other
 * two are not in the shipped JavaScript at all. That is the mechanism; there is
 * no build-time flag or bundler plugin involved, which is why it works today
 * rather than after react-native-config is adopted.
 *
 * ===========================================================================
 * CHANGING ENVIRONMENT
 * ===========================================================================
 * Edit the import below — and nothing else in JavaScript. But note that JS
 * alone cannot move this app between environments; the native layer is pinned
 * to the test tenant (see DEFAULT_ENV in Environment.js, finding C-05):
 *
 *   android/app/build.gradle   applicationId  com.exchangapay.tst
 *   android/app/build.gradle   auth0Domain    exchangapay-tst.eu.auth0.com
 *   android/app/google-services.json          project exchangapay-tst-f570a
 *   ios/GoogleService-Info.plist              project exchangapay-tst-f570a
 *
 * The Auth0 callback scheme is registered natively against the *test* tenant,
 * so flipping this import on its own would point the API and Auth0 at another
 * environment while the OAuth redirect and Firebase config still belong to
 * test — login would fail outright, not degrade gracefully. Changing this is
 * the last step of an environment migration, not the first.
 */

import activeEnvironment from "./tst";

export default activeEnvironment;
