import { createAsyncThunk } from '@reduxjs/toolkit';
import TransactionService from '../../services/transaction';
import { formatError } from '../../utils/helpers';
import TransactionsService from '../../services/transaction';
import crashlytics from '@react-native-firebase/crashlytics';
// export const getTransactionDetails = createAsyncThunk(
//   'transactions/getTransactionDetails',
//   async (transactionInfo, { rejectWithValue }) => {
//     try {
//       const params = {
//         page: transactionInfo?.currentPage,
//         limit: 10,
//       };

//       const { transactions} = await TransactionsService.getTransactionDetails(params);

//       return { transactions, page: transactionInfo?.currentPage };
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   },
// );

// export const getAllTransactions = async () => {
//   try {
//     const data = await TransactionsService.getAllTransactions();
//     return data;
//   } catch (error:any) {
//     crashlytics().recordError(error);
//     return {
//       status: false,
//       msg: formatError(error),
//       data: null,
//     };
//   }
// }
export const getAllTransactions = async (currency:any ,transactiontype:any,serach:any,pageSize:any,pageNo:number) => {
  try {
    const data = await TransactionService.getAllTransactions(currency,transactiontype,serach,pageSize,pageNo);
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
};
export const getTransactionDetails = async () => {
  try {
    const data = await TransactionsService.getTransactionDetails();
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
}

export const getRecentTransactions = async () => {
  try {
    const data = await TransactionsService.getRecentTransactions();
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
}

export const getTransactionPopupDetails = async () => {
  try {
    const data = await TransactionService.getTransactionPopupDetails();
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
};

export const getTransactionDetailsBasedOnId = async (id: any) => {
  try {
    const data = await TransactionService.getTransactionDetailsBasedOnId(id);
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
};
export const getTransactionsObjDataBasedOnId = async (id: any) => {
  try {
    const data = await TransactionService.getTransactionsObjDataBasedOnId(id);
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
};
export const  noteSave= async (obj: any) => {
  try {
   const data= await TransactionService.noteSave(obj);
   return data;
    
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
    };
  }
};
export const getTransactionsUpdates = async (id: any) => {
  try {
    const data = await TransactionService.getTransactionsUpdates(id);
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
};
export const getTransactionsDownload = async (id: any) => {
  try {
    const data = await TransactionService.getTransactionsDownload(id);
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
};
export const getCurrencyTransactions = async (code:any) => {
  try {
    const data = await TransactionService.getCurrencyTransactions(code);
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
};
export const getNeoRecentcardsTransactions = async (customerId:any) => {
  try {
    const data = await TransactionService.getNeoRecentcardsTransactions(customerId);
    return data;
  } catch (error:any) {
    // console.log('recent',error)
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
};
export const getNeoAllCardsTransactions = async (customerId:any,serach:any,page:any,pageNo:number) => {
  try {
    const data = await TransactionService.getNeoAllCardsTransactions(customerId,serach,page,pageNo);
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
};

export const getWalletTransactiondetails = async (cardId:any) => {
  try {
    const data = await TransactionService.getWalletTransactiondetails(cardId);
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
};
export const getNeoCardsTansactionBasedOnId = async (transId:any) => {
  try {
    const data = await TransactionService.getNeoCardsTansactionBasedOnId(transId);
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
};
export const getCryptoAccountsTranscations = async () => {
  try {
    const data = await TransactionService.getCryptoAccountsTranscations();
    return data;
  } catch (error:any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
      data: null,
    };
  }
};