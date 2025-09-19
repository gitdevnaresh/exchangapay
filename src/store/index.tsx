/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import auth from './auth/slice';
import send from './send/slice';
import sendcrypto from './sendCrypto/slice';


const middlewares: any[] = [];
const reducer = combineReducers({
  auth,
  send,
  sendcrypto
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'auth/clearAuth/fulfilled') {
    state = undefined;
  }
  return reducer(state, action);
};

if (__DEV__) {
  const createDebugger = require('redux-flipper').default();
  middlewares.push(createDebugger);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(middlewares)
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;
export default store;
