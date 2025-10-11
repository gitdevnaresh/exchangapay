import { createAsyncThunk } from "@reduxjs/toolkit";
import AuthService from "../../services/auth";
import crashlytics from "@react-native-firebase/crashlytics";

// Helper function to extract serializable data from API responses
const extractSerializableData = (response: any) => {
  if (!response) return null;

  // If it's an axios response object, extract the data
  if (response.data !== undefined) {
    return response.data;
  }

  // If it's already the data object, return it
  return response;
};

export const getMemberInfo = createAsyncThunk(
  "auth/getMemberInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getMemberInfo();
      const memberData = extractSerializableData(response);

      // Ensure the data is serializable
      return JSON.parse(JSON.stringify(memberData));
    } catch (error: any) {
      crashlytics().recordError(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearAuth = createAsyncThunk("auth/clearAuth", () => {});

export const getAccountInfo = createAsyncThunk(
  "auth/getAccountInfo",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await AuthService.getAccountInfo();
      const userData = extractSerializableData(response);

      // Don't dispatch getMemberInfo here to avoid race conditions
      // Let the component handle this separately

      // Ensure the data is serializable
      return JSON.parse(JSON.stringify(userData));
    } catch (error: any) {
      crashlytics().recordError(error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
