import { createAsyncThunk } from '@reduxjs/toolkit';
import SendCryptoServices from "../../services/sendcrypto";
import crashlytics from '@react-native-firebase/crashlytics';

// Only the two thunks below are referenced (by ./slice.tsx). The plain-async
// wrappers that used to sit alongside them duplicated SendCryptoServices
// methods the crypto screens already call directly, so nothing imported them.

export const getSendCryptoPayeeLu = createAsyncThunk(
    'sendcrypto/getAllSendCryptoDetails',
    async (coin: any, { rejectWithValue }) => {
      try {
        const data= await SendCryptoServices.getSendCryptoPayeeLu(coin);
        return data;
      } catch (error: any) {
        crashlytics().recordError(error);
        return rejectWithValue(error);
      }
    }
  );
  export const confirmSendCrypto = createAsyncThunk(
    'cryptosend/getSendCryptoCommissionDetails',
    async (obj: any, { rejectWithValue }) => {
      try {
        const data= await SendCryptoServices.confirmSendCrypto(obj);
        return data;
      } catch (error: any) {
        crashlytics().recordError(error);
        return rejectWithValue(error);
      }
    }
  );
