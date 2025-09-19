import { createAsyncThunk } from '@reduxjs/toolkit';
import SendCryptoServices from "../../services/sendcrypto";
import crashlytics from '@react-native-firebase/crashlytics';

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
export const getSendCryptoWallets = async (crypto:any) => {
    try {
      const data = await SendCryptoServices.getSendCryptoWallets(crypto);
      return data;
    } catch (error:any) {
      crashlytics().recordError(error);
      return {
        status: false,
      };
    }
  };
  export const getSendCryptoWithdrawWallets = async (crypto:any) => {
    try {
      const data = await SendCryptoServices.getSendCryptoWithdrawWallets(crypto);
      return data;
    } catch (error:any) {
      crashlytics().recordError(error);
      return {
        status: false,
      };
    }
  };
  export const confirmSummarrySendCrypto = async (obj:any) => {
    try {
      const data = await SendCryptoServices.confirmSummarrySendCrypto(obj);
      return data;
    } catch (error:any) {
      crashlytics().recordError(error);
      return {
        status: false,
      };
    }
  };
  export const getCoinNetworkDropdown = async () => {
    try {
      const data = await SendCryptoServices.getCoinNetworkDropdown();
      return data;
    } catch (error:any) {
      crashlytics().recordError(error);
      return {
        status: false,
      };
    }
  };
  export const getWithdrawCryptoCoinList = async () => {
    try {
      const data = await SendCryptoServices.getWithdrawCryptoCoinList();
      return data;
    } catch (error:any) {
      crashlytics().recordError(error);
      return {
        status: false,
      };
    }
  };
  export const confirmSummarryFinalSendCrypto = async (obj:any) => {
    try {
      const data = await SendCryptoServices.confirmSummarryFinalSendCrypto(obj);
      return data;
    } catch (error:any) {
      crashlytics().recordError(error);
      return {
        status: false,
      };
    }
  };
  