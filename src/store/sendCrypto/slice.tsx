import { createSlice } from "@reduxjs/toolkit";
import {
  getSendCryptoPayeeLu,
  confirmSendCrypto,
} from "../../store/sendCrypto/thunk";

const slice = createSlice({
  name: "sendcrypto",
  initialState: {
    sendcryptobenificiary: {},
    sendcryptocommissionamt: {},
    loading: "idle",
    navigationScreen: false,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getSendCryptoPayeeLu.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getSendCryptoPayeeLu.fulfilled, (state, action) => {
        const { config, ...payloadWithoutNonSerializable } = action.payload;
        state.sendcryptobenificiary = payloadWithoutNonSerializable;
        state.loading = "fulfilled";
      })
      .addCase(getSendCryptoPayeeLu.rejected, (state) => {
        state.loading = "rejected";
      });
    builder
      .addCase(confirmSendCrypto.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(confirmSendCrypto.fulfilled, (state, action) => {
        const { config, ...payloadWithoutNonSerializable } = action.payload;
        state.sendcryptocommissionamt = payloadWithoutNonSerializable;
        state.loading = "fulfilled";
      })
      .addCase(confirmSendCrypto.rejected, (state) => {
        state.loading = "rejected";
      });
  },
});

export default slice.reducer;
