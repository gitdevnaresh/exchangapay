import { createSlice } from "@reduxjs/toolkit";
import {
  getAccountInfo,
  getMemberInfo,
  clearAuth,
} from "../../store/auth/thunk";
import { RequestStatus } from "../../constants";

const slice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    member: null,
    loading: RequestStatus.idle,
  },
  reducers: {
    // Add manual reset action
    resetAuth: (state) => {
      state.user = null;
      state.member = null;
      state.loading = RequestStatus.idle;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAccountInfo.fulfilled, (state: any, payload: any) => {
        state.user = payload.payload;
      })
      .addCase(getMemberInfo.pending, (state: any) => {
        state.loading = RequestStatus.pending;
      })
      .addCase(getMemberInfo.fulfilled, (state: any, payload: any) => {
        state.member = payload.payload;
        state.loading = RequestStatus.fulfilled;
      })
      .addCase(clearAuth.fulfilled, (state: any) => {
        state.user = null;
        state.member = null;
        state.loading = RequestStatus.idle;
      });
  },
});

export const { resetAuth } = slice.actions;
export default slice.reducer;
