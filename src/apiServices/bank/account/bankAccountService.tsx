import { bankget, bankpost } from '../../ApiService';
import { transactionBankApi } from '../../../utils/api';
import { BANK_ENDPOINTS } from '../constants/bankConstants';

const BankAccountService = {
  bankKpis: async () => {
    return bankget(BANK_ENDPOINTS.ACCOUNT.KPI);
  },
  
  getAccountDetailsOfMobileBank: async () => {
    return bankget(BANK_ENDPOINTS.ACCOUNT.DETAILS);
  },
  
  getAccountCreation: async (currency: any) => {
    return transactionBankApi.get(`${BANK_ENDPOINTS.ACCOUNT.CREATION}/${currency}`);
  },
  
  postBanksFiatWithdraw: async (body: any) => {
    return bankpost(BANK_ENDPOINTS.ACCOUNT.WITHDRAW_FEE, body);
  },
  
  banksWithdrawSave: async (body: any) => {
    return bankpost(BANK_ENDPOINTS.ACCOUNT.WITHDRAW, body);
  },
  
  getAllCurrencies: async () => {
    return bankget(BANK_ENDPOINTS.ACCOUNT.SUMMARY);
  },
  
  getBakWithDrawDetails: async (selectCurrency: any) => {
    return bankget(`${BANK_ENDPOINTS.ACCOUNT.DETAILS}/${selectCurrency}?type=withdraw`);
  },
  
  confirmPayWithFiat: async (currencyId: string, body: any) => {
    return bankpost(`${BANK_ENDPOINTS.ACCOUNT.PAYMENT_FIAT_FEE}/${currencyId}/fiat/fee`, body);
  },
  
  getVaultList: async () => {
    return bankget(`${BANK_ENDPOINTS.ACCOUNT.PAYMENT_CRYPTO_FEE}/crypto`);
  },
  
  summaryAccountCreation: async (bankId: any, body: any) => {
    return bankpost(`${BANK_ENDPOINTS.ACCOUNT.ACCOUNT_CREATION}/${bankId}/account`, body);
  },
  
  confirmPayWithWalleteCrypto: async (bankId: string, body: any) => {
    return bankpost(`${BANK_ENDPOINTS.ACCOUNT.PAYMENT_CRYPTO_FEE}/${bankId}/crypto/fee`, body);
  },
  
  getVaultFiatCurrencies: async () => {
    return bankget(`${BANK_ENDPOINTS.ACCOUNT.PAYMENT_FIAT_FEE}/fiat`);
  }
};

export default BankAccountService;