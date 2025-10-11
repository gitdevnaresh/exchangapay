/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { createKeychainStorage } from "redux-persist-keychain-storage";
import auth from "./auth/slice";
import send from "./send/slice";
import sendcrypto from "./sendCrypto/slice";
import UserReducer from "../redux/Reducer/UserReducer";
import encryptTransform from "../utils/helpers/encryptionTransfermation";

const keychainStorage = createKeychainStorage();

// Persist configuration with encryption
const persistConfig = {
  key: "root",
  storage: keychainStorage,
  whitelist: ["auth", "UserReducer"], // Only persist these reducers
  blacklist: ["send", "sendcrypto"], // Don't persist these reducers
  // Temporarily disable encryption transform to debug redux-persist issue
  // transforms: [encryptTransform],
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

if (__DEV__) {
  const createDebugger = require("redux-flipper").default();
  middlewares.push(createDebugger);
}

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

// Create persistor
const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export { persistor };
export default store;
