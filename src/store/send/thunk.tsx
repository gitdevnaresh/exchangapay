import { createAsyncThunk } from '@reduxjs/toolkit';
import SendServices from "../../services/send";
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
