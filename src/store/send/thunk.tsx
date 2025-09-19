import { createAsyncThunk } from '@reduxjs/toolkit';
import SendServices from "../../services/send";
import { formatError } from '../../utils/helpers';
import crashlytics from '@react-native-firebase/crashlytics';

export const saveTransfer = createAsyncThunk(
  'send/getAllTransferDetails',
  async (obj: any, { rejectWithValue }) => {
    try {
      const data = await SendServices.saveTransfer(obj);
      return data;
    } catch (error: any) {
      crashlytics().recordError(error);
      return rejectWithValue(error);
    }
  }
);
export const getSendListDetails = createAsyncThunk(
  'sendlist/getParticulartListDetails',
  async (currency: any, { rejectWithValue }) => {
    try {
      const data = await SendServices.getSendListDetails(currency);
      return data;
    } catch (error: any) {
      crashlytics().recordError(error);
      return rejectWithValue(error);
    }
  }
);
export const confirmTransfer = async (obj: any) => {
  try {
    const data = await SendServices.confirmTransfer(obj);

    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
    };
  }
};
export const confirmAmountTransfer = async (obj: any) => {
  try {
    await SendServices.confirmAmountTransfer(obj);

    return { status: true };
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error)
    };
  }
};
export const saveAddressbookPayee = async (obj: any) => {
  try {
    const data = await SendServices.saveAddressbookPayee(obj);

    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error)
    };
  }
};
export const fetchIBANDetails = async (iban: any) => {
  try {
    const data = await SendServices.fetchIBANDetails(iban);

    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error)
    };
  }
};
