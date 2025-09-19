import CryptoServices from "../../services/crypto";
import { formatError } from "../../utils/helpers";
import crashlytics from '@react-native-firebase/crashlytics';

export const getMarketCoins = async () => {
  try {
    const data = await CryptoServices.getMarketCoins();
    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
    };
  }
};
export const saveNotes = async (obj: any) => {
  try {
    const data = await CryptoServices.saveNotes(obj);
    return data;

  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
      msg: formatError(error),
    };
  }
};
export const getCryptoTotalBalance = async () => {
  try {
    const data = await CryptoServices.getCryptoTotalBalance();
    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
    };
  }
};
export const getCryptoCoinsData = async () => {
  try {
    const data = await CryptoServices.getCryptoCoinsData();
    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
    };
  }
};
export const getCryptoTransactions = async () => {
  try {
    const data = await CryptoServices.getCryptoTransactions();
    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
    };
  }
};
export const getAllCryptoTransactions = async () => {
  try {
    const data = await CryptoServices.getAllCryptoTransactions();
    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
    };
  }
};
export const getCryptoTransactionsDetails = async (id: any, type: any) => {
  try {
    const data = await CryptoServices.getCryptoTransactionsDetails(id, type);
    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
    };
  }
};

export const getCryptoDeposit = async (walletCode: any, network: any) => {
  try {
    const data = await CryptoServices.getCryptoDeposit(walletCode, network);
    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
    };
  }
};
export const getCommonCrypto = async (network: any) => {
  try {
    const data = await CryptoServices.getCommonCrypto(network);
    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
    };
  }
};
export const getCryptoTransactionsDownload = async (id: any, type: any) => {
  try {
    const data = await CryptoServices.getCryptoTransactionsDownload(id, type);
    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
    };
  }
};
export const getCryptoTransactionsUpdates = async (id: any) => {
  try {
    const data = await CryptoServices.getCryptoTransactionsUpdates(id);
    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
    };
  }
};
export const getCryptoTransactionsSearch = async (type: any) => {
  try {
    const data = await CryptoServices.getCryptoTransactionsSearch(type);
    return data;
  } catch (error: any) {
    crashlytics().recordError(error);
    return {
      status: false,
    };
  }
};