import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import encryptTransform from "../../utils/encryptionTransfor";
import userReducer from "./userReducer";
import cardsReducer from "./cardReducer";
import sendReducer from "./sendReducer";
import withdrawReducer from "./withdrawReducer";
import { createKeychainStorage } from "redux-persist-keychain-storage";
const keychainStorage = createKeychainStorage();
const persistConfig = {
  key: "root",
  storage:keychainStorage, 
  whitelist: ["userReducer", "cardsReducer","sendReducer","withdrawReducer"], 
  transforms: [encryptTransform],
};
const rootReducer = combineReducers({
  userReducer,
  cardsReducer,
  sendReducer,
  withdrawReducer
});
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