// import {createStore, applyMiddleware} from 'redux';
// import {persistReducer, persistStore} from 'redux-persist';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import rootReducer from '../Reducer';

// const persistConfig = {
//   key: 'root',
//   storage: AsyncStorage,
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);
// const store = createStore(persistedReducer, applyMiddleware(thunk));
// const persistor = persistStore(store);

// export {store, persistor};
import { combineReducers } from "@reduxjs/toolkit";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import UserReducer from "../Reducer/UserReducer";

const rootReducer = combineReducers({
  UserReducer,
});

// Create store with redux-thunk middleware to handle async actions
const store = createStore(rootReducer, applyMiddleware(thunk));
const persistor = null;

console.log("Store with thunk middleware created successfully:", typeof store);
console.log("Thunk middleware:", typeof thunk);

export { store, persistor };
