 import { createSlice } from '@reduxjs/toolkit';
// import {getTransactionDetails } from '../../store/transaction/thunk';
// import { RequestStatus } from '../../constants';

// const slice = createSlice({
//   name: 'transactions',
//   initialState: {
//     transactionData: {
//       data: [],
//       page: 1,
//      // isLastPage: false,
//     },
//     loading: RequestStatus.idle,
//   },
//   reducers: {
//   },
//   extraReducers: {
//     [getTransactionDetails.fulfilled]: (state, { payload }) => {
//       let newData = [];
//       if (payload?.page === 1) {
//         newData = payload.transactions;
//       } else {
//         newData = [...state.transactionData.data, ...payload.transactions];
//       }

//       state.transactionData = {
//         data: newData,
//         page: payload.page,
//         //isLastPage: !(payload.total > newData.length),
//       };
//       state.loading = RequestStatus.fulfilled;
//     },
//   },
// });

// export default slice.reducer;
// //https://tstgrid.suissebase.io/api/v1/Bank/AllBankTransactions/All?params=%7B%22page%22:%7B%22page%22:1,%22limit%22:10%7D%7D
// //https://tstgrid.suissebase.io/api/v1/Bank/AllBankTransactions/All//?page=1&pageSize=10
//https://tstgrid.suissebase.io/api/v1/Bank/AllBankTransactions/All/?page=1&pageSize=10
