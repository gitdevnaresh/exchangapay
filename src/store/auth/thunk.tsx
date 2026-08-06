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

// N-01: the `getAccountInfo` thunk was removed with the service method behind
// it. It fetched OIDC `/connect/userinfo` from tstlogin.suissebase.io, which is
// NXDOMAIN, and nothing in src/ ever dispatched it — the `auth.user` slice it
// filled was permanently null. See src/services/auth.tsx for where identity
// claims should come from instead.
