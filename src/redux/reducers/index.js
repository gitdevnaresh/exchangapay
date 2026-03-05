import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import encryptTransform from "../../utils/encryptionTransfor";
import userReducer from "./userReducer";
import { createKeychainStorage } from "redux-persist-keychain-storage";
import { Logger } from "../../utils/Logger";

const keychainStorage = createKeychainStorage();

const userPersistConfig = {
  key: "userReducer",
  storage: keychainStorage,
  whitelist: [
    "login",
    "userDetails",
    "userInfo",
    "showBiometricPrompt",
    "appTheme",
    "referralCode",
    "acceptedTerms",
    "shouldShowNotices",
    "personalInfo",
    "accountInfo",
    "isOnboardingSteps"
  ],
  transforms: [encryptTransform],
  writeFailHandler: (error) => {
    Logger.error('Redux persist write failed', { error: error.message });
  }
};

const rootReducer = combineReducers({
  userReducer: persistReducer(userPersistConfig, userReducer),
});

const persistConfig = {
  key: "root",
  storage: keychainStorage,
  whitelist: [],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});
export const persistor = persistStore(store);