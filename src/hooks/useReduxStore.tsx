import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { log } from "../utils/logger";

// Typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T,>(selector: (state: RootState) => T) =>
  useSelector(selector);

// Helper hook to access both old and new Redux state
export const useReduxState = () => {
  const dispatch = useAppDispatch();

  // Access new RTK slices
  const authState = useAppSelector((state) => state.auth);
  const sendState = useAppSelector((state) => state.send);
  const sendCryptoState = useAppSelector((state) => state.sendcrypto);

  // Access legacy Redux state
  const userState = useAppSelector((state) => state.UserReducer);

  return {
    dispatch,
    // New RTK state
    auth: authState,
    send: sendState,
    sendCrypto: sendCryptoState,
    // Legacy state
    user: userState,
  };
};

// Helper hook for debugging Redux state
export const useReduxDebug = () => {
  const state = useAppSelector((state) => state);

  // M-16: Redux state holds the access token, KYC payload and card details.
  // log.debug compiles to nothing outside __DEV__, so this cannot dump the
  // store to logcat even if a call to it is left behind in a release build.
 

  return {  state };
};
