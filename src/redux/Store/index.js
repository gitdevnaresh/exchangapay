
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

export { store, persistor };
