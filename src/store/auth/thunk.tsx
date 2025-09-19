import { createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../../services/auth';
import crashlytics from '@react-native-firebase/crashlytics';

export const getMemberInfo = createAsyncThunk(
  'auth/getMemberInfo',
  async (_, { rejectWithValue }) => {
    try {
      const member = await AuthService.getMemberInfo();
      return member;
    } catch (error:any) {
      crashlytics().recordError(error);
      return rejectWithValue(error.response?.data);
    }
  },
);
export const clearAuth = createAsyncThunk('auth/clearAuth', () => {});

export const getAccountInfo = createAsyncThunk(
  'auth/getAccountInfo',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const user = await AuthService.getAccountInfo();

      dispatch(getMemberInfo());

      return user;
    } catch (error:any) {
      crashlytics().recordError(error);
      return rejectWithValue(error.response?.data);
    }
  },
);
