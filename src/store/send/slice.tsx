import { createSlice } from "@reduxjs/toolkit";
import { saveTransfer, getSendListDetails } from "../../store/send/thunk";

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
      .addCase(saveTransfer.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(saveTransfer.fulfilled, (state, action) => {
        const { config, ...payloadWithoutNonSerializable } = action.payload;
        state.transferdetails = payloadWithoutNonSerializable;
        state.loading = "fulfilled";
      })
      .addCase(saveTransfer.rejected, (state) => {
        state.loading = "rejected";
      });
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
