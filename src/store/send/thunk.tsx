import { createAsyncThunk } from '@reduxjs/toolkit';
import SendServices from "../../services/send";
import { formatError } from '../../utils/helpers';
import crashlytics from '@react-native-firebase/crashlytics';

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
