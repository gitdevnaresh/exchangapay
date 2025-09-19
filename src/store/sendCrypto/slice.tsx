import { createSlice } from '@reduxjs/toolkit';
import { getSendCryptoPayeeLu,confirmSendCrypto } from '../../store/sendCrypto/thunk';
import { RequestStatus } from '../../constants';

const slice = createSlice({
  name: 'sendcrypto',
  initialState: {
    sendcryptobenificiary: {},
    sendcryptocommissionamt:{},
    loading: RequestStatus.idle,
    navigationScreen: false,
  },

  reducers: {
  },

  extraReducers:(builder)=>{
      builder
        .addCase(getSendCryptoPayeeLu.pending, (state) => {
          state.loading = RequestStatus.pending;
        })
        .addCase(getSendCryptoPayeeLu.fulfilled, (state, action) => {
          const { config, ...payloadWithoutNonSerializable } = action.payload;
          state.sendcryptobenificiary = payloadWithoutNonSerializable;
          state.loading = RequestStatus.fulfilled;
        })
        .addCase(getSendCryptoPayeeLu.rejected, (state) => {
          state.loading = RequestStatus.rejected;
        })
        builder
        .addCase(confirmSendCrypto.pending, (state) => {
          state.loading = RequestStatus.pending;
        })
        .addCase(confirmSendCrypto.fulfilled, (state, action) => {
          const { config, ...payloadWithoutNonSerializable } = action.payload;
          state.sendcryptocommissionamt = payloadWithoutNonSerializable;
          state.loading = RequestStatus.fulfilled;
        })
        .addCase(confirmSendCrypto.rejected, (state) => {
          state.loading = RequestStatus.rejected;
        });
    },
});

export default slice.reducer;
