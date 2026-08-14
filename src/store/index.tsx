/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { createKeychainStorage } from "../utils/crypto/keychain";
import { loadOrCreatePersistKey } from "../utils/crypto/persistKey";
import { log } from "../utils/logger";
import auth from "./auth/slice";
import send from "./send/slice";
import sendcrypto from "./sendCrypto/slice";
import UserReducer from "../redux/Reducer/UserReducer";
import encryptTransform from "../utils/helpers/encryptionTransformation";

const keychainStorage = createKeychainStorage();

// Persist configuration with encryption (security finding H-05)
//
// The transform below was previously commented out with "temporarily disable to
// debug redux-persist issue". The issue was that the transform was `async`, and
// redux-persist applies transforms synchronously — see the header of
// encryptionTransformation.tsx. It is synchronous now, and re-enabled.
const persistConfig = {
  key: "root",
  storage: keychainStorage,
  whitelist: ["auth", "UserReducer"], // Only persist these reducers
  blacklist: ["send", "sendcrypto"], // Don't persist these reducers
  transforms: [encryptTransform],
};

const middlewares: any[] = [];

// Combine all reducers
const reducer = combineReducers({
  auth,
  send,
  sendcrypto,
  UserReducer, // Include the legacy reducer
});

// Root reducer with state reset functionality
const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/clearAuth/fulfilled" || action.type === "LOGOUT") {
    // Clear persisted state on logout - return undefined to reset state
    return reducer(undefined, action);
  }
  return reducer(state, action);
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with persistence
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
        ignoredActionsPaths: ["meta.arg", "payload.timestamp"],
        ignoredPaths: ["_persist"],
        warnAfter: 128,
      },
      immutableCheck: {
        warnAfter: 128,
        ignoredPaths: ["_persist"],
      },
    }).concat(middlewares),
});

// Create persistor.
//
// `manualPersist` holds rehydration until startPersistence() has loaded the
// at-rest key. Without it, redux-persist would read the stored blob during this
// module's evaluation — before any key exists — and the outbound transform would
// discard every slice as undecryptable, wiping state on each cold start.
const persistor = persistStore(store, { manualPersist: true } as any);

/**
 * Load the at-rest key, then let redux-persist rehydrate. Call once, early in
 * app startup; PersistGate shows its loading component until this resolves.
 *
 * Fails open. If the Keychain cannot produce a key, persistence still starts —
 * the transform declines to read or write anything, so the app runs with no
 * persisted state and the user signs in again. The alternative, leaving
 * `persist()` uncalled, would strand PersistGate on the loading screen forever.
 */
export const startPersistence = async (): Promise<void> => {
  try {
    await loadOrCreatePersistKey();
  } catch (error) {
    log.error("Persist key unavailable; continuing without persisted state", error);
  } finally {
    persistor.persist();
  }
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export { persistor };
export default store;
