import { combineReducers } from "redux";
import UserReducer from "./UserReducer";
import auth from "../../store/auth/slice";
import send from "../../store/send/slice";
import sendcrypto from "../../store/sendCrypto/slice";
const Reducers = combineReducers({
  UserReducer,
  auth,
  send,
  sendcrypto
});

export default Reducers;
