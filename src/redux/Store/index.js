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

// M-16: two console.log calls fired here on import — an import-time side effect
// in a module that L-01 flags as dead anyway (superseded by src/store/index.tsx).
// They carried no diagnostic value beyond `typeof`, so they are simply gone.

export { store, persistor };
