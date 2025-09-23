import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";

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

  const logState = () => {
    console.log("=== REDUX STATE DEBUG ===");
    console.log("Auth State:", state.auth);
    console.log("User State:", state.UserReducer);
    console.log("Send State:", state.send);
    console.log("SendCrypto State:", state.sendcrypto);
    console.log("========================");
  };

  return { logState, state };
};
