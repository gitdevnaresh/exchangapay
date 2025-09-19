import { createSlice } from '@reduxjs/toolkit';
import { saveTransfer,getSendListDetails} from '../../store/send/thunk';
import { RequestStatus } from '../../constants';

const slice = createSlice({
  name: 'send',
  initialState: {
    transferdetails: {},
    cryptoonerecordlist:{},
    loading: RequestStatus.idle,
    navigationScreen: false,
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveTransfer.pending, (state) => {
        state.loading = RequestStatus.pending;
      })
      .addCase(saveTransfer.fulfilled, (state, action) => {
        const { config, ...payloadWithoutNonSerializable } = action.payload;
        state.transferdetails = payloadWithoutNonSerializable;
        state.loading = RequestStatus.fulfilled;
      })
      .addCase(saveTransfer.rejected, (state) => {
        state.loading = RequestStatus.rejected;
      })
      builder
      .addCase(getSendListDetails.pending, (state) => {
        state.loading = RequestStatus.pending;
      })
      .addCase(getSendListDetails.fulfilled, (state, action) => {
        const { config, ...payloadWithoutNonSerializable } = action.payload;
        state.cryptoonerecordlist = payloadWithoutNonSerializable;
        state.loading = RequestStatus.fulfilled;
      })
      .addCase(getSendListDetails.rejected, (state) => {
        state.loading = RequestStatus.rejected;
      });
  },
});

export default slice.reducer;
