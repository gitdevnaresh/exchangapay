# ── Identity ────────────────────────────────────────────────────────────────
APP_ENV=tst

# ── Auth0 ────────────────────────────────────────────────────────────────────
AUTH0_ISSUER=exchangapay-tst.eu.auth0.com
AUTH0_CLIENT_ID=QN7NMqYHzengFUnmR0HCvenDCSOwGwNs
AUTH0_AUDIENCE=https://ExchangaTstApi.net
AUTH0_SCOPE=openid profile email enroll offline_access

# ── API hosts ────────────────────────────────────────────────────────────────
UPLOAD_URL=https://tstapi.exchangapay.com/
CARDS_URL=https://tstapi.exchangapay.com/
MARKET_URL=https://api.coingecko.com/

# ── Sentry ───────────────────────────────────────────────────────────────────
SENTRY_ENABLED=true
SENTRY_DSN=https://97c9602ff0c4f74c3f55743eace18039@o4510198382919680.ingest.us.sentry.io/4510198383902720
SENTRY_SEND_PII=false
SENTRY_ENABLE_LOGS=false
SENTRY_REPLAYS_SESSION_RATE=0
SENTRY_REPLAYS_ERROR_RATE=0

# ── Attestation ──────────────────────────────────────────────────────────────
PLAY_INTEGRITY_CLOUD_PROJECT=

# ── Native (Android build.gradle / iOS Xcode) ────────────────────────────────
ANDROID_APPLICATION_ID=com.exchangapay.tst
ANDROID_AUTH0_DOMAIN=exchangapay-tst.eu.auth0.com
IOS_BUNDLE_ID=com.exchangapay.tst
IOS_AUTH0_DOMAIN=exchangapay-tst.eu.auth0.com

# ── Localisation ─────────────────────────────────────────────────────────────
DEFAULT_RESOURCE_NAME=Exchanga Pay
