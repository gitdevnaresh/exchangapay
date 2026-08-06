import { createSlice } from "@reduxjs/toolkit";
import { getSendListDetails } from "../../store/send/thunk";

const slice = createSlice({
  name: "send",
  initialState: {
    transferdetails: {},
    cryptoonerecordlist: {},
    loading: "idle",
    navigationScreen: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSendListDetails.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getSendListDetails.fulfilled, (state, action) => {
        const { config, ...payloadWithoutNonSerializable } = action.payload;
        state.cryptoonerecordlist = payloadWithoutNonSerializable;
        state.loading = "fulfilled";
      })
      .addCase(getSendListDetails.rejected, (state) => {
        state.loading = "rejected";
      });
  },
});

export default slice.reducer;
