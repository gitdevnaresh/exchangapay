import { get, post, put } from '../../../ApiService';
import { ADDRESSBOOK_CONSTANTS } from './constants';

const AddressbookService = {
  getAddressbookFiatList: async (customerId: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.FIAT_WALLETS(customerId));
  },
  getAddressbookGridData: async (customerId: any, page: any, pageSize: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.PAYEES_FIAT(customerId, page, pageSize));
  },
  getAddressbookCryptoGridData: async (page: any, pageSize: any, currecy: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.PAYEES_CRYPTO(page, pageSize, currecy));
  },
  getAddressbookFiatgrid: async (page: any, pageSize: any, currecy: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.PAYEES_FIAT_WALLETS(page, pageSize, currecy));
  },
  Useractiveinactive: async (id: any, statusType: any, actinact: any) => {
    return await put(ADDRESSBOOK_CONSTANTS.PAYEES_STATUS(id, statusType), actinact);
  },
  getAddressbookWithdrawDetails: async (id: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.PAYEE_FIAT_DETAILS(id));
  },
  getAddressbookCryptoViewDetails: async (id: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.PAYEES_CRYPTO_DETAILS(id));
  },
  getAddressbookFiatPayeeDetails: async (id: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.PAYEES_FIAT_ID(id));
  },
  getAddressbookFiatPayeeDetailsView: async (id: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.PAYEES_FIAT_VIEW(id));
  },
  getAddressbookBankFiatWallets: async (id: any, appName: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.BANK_ACCOUNTS(id, appName));
  },
  getAddressbookExchangeFiatWallets: async (id: any, appName: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.EXCHANGE_FIAT_WALLETS(id, appName));
  },
  getPayeeFiatCurrency: async () => {
    return await get(ADDRESSBOOK_CONSTANTS.FIAT_CURRENCY_LU);
  },
  banksLookup: async () => {
    return await get(ADDRESSBOOK_CONSTANTS.BANKS_LU);
  },
  getProviderList: async (payeeId: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.PAYEE_STATUS_INFO(payeeId));
  },
  getsathosiTestDetails: async (network: any, address: any) => {
    return get(ADDRESSBOOK_CONSTANTS.SATHOSI_TEST(network, address));
  },
  saveSathoshiTest: async (body: any) => {
    return post(ADDRESSBOOK_CONSTANTS.SATHOSI_TEST_POST, body);
  },
  getSendCryptoWallets: async (crypto: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.WALLETS(crypto));
  },
  getSendCryptoWithdrawWallets: async (crypto: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.WALLETS(crypto));
  },
  getSendCryptoPayeeLu: async (customerId: any, coin: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.PAYEE_LU(customerId, coin));
  },
  confirmSendCrypto: async (body: any) => {
    return await post(ADDRESSBOOK_CONSTANTS.CRYPTO_CONFIRM, body);
  },
  confirmSummarrySendCrypto: async (body: any) => {
    return await post(ADDRESSBOOK_CONSTANTS.PAYEES_CRYPTO_POST, body);
  },
  confirmSendCryptoPutCall: async (body: any) => {
    return await put(ADDRESSBOOK_CONSTANTS.PAYEES_CRYPTO_PUT, body);
  },
  getCoinNetworkDropdown: async (walletcode: any, customerId: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.NETWORK_LU(walletcode, customerId));
  },
  getWithdrawCryptoCoinList: async (customerId: any) => {
    return await get(ADDRESSBOOK_CONSTANTS.CRYPTO_WALLETS(customerId));
  },
  confirmSummarryFinalSendCrypto: async (body: any) => {
    return await post(ADDRESSBOOK_CONSTANTS.WITHDRAW_CRYPTO, body);
  },
  isWalletAddressVerified: async (body: any) => {
    return await post(ADDRESSBOOK_CONSTANTS.VERIFY_WALLET_ADDRESS, body);
  },
  getDepositWallets: async (customerId: any, actiontype: any) => {
    return get(ADDRESSBOOK_CONSTANTS.MERCHANT_WALLETS(customerId, actiontype));
  },
  getSourceTypes: async () => {
    return get(ADDRESSBOOK_CONSTANTS.WALLET_SOURCES_FIRST_PARTY);
  },
  getThirdPartySourceTypes: async () => {
    return get(ADDRESSBOOK_CONSTANTS.WALLET_SOURCES_THIRD_PARTY);
  },
  getRecipientDynamicFeildsCrypto: async () => {
    return get(ADDRESSBOOK_CONSTANTS.API_V1_PAYEES_RECIPIENT_PAYEE_CRYPTO);
  },
  getProfileInfo: async (type: any) => {
    if (type?.toLowerCase() === ADDRESSBOOK_CONSTANTS.PERSONAL) {
      return get(ADDRESSBOOK_CONSTANTS.CUSTOMERS_PROFILE_PERSONAL);
    } else {
      return get(ADDRESSBOOK_CONSTANTS.CUSTOMERS_PROFIL_BUSINESS);
    }
  },
  getPayeesLookups: async () => {
    return get(ADDRESSBOOK_CONSTANTS.PAYEES_LOOKUP);
  },
  getPaymentFieds: async (paymentType: any) => {
    return get(`${ADDRESSBOOK_CONSTANTS.PAYMENT_TYPES}?currency=${paymentType}`);
  },
  getbranches: async (bank: any) => {
    return get(`${ADDRESSBOOK_CONSTANTS.BRANCHES}?bankname=${bank}`);
  },
  iBanVerification: async (number: any) => {
    return get(`${ADDRESSBOOK_CONSTANTS.IBAN_VALIDATE}/${number}/validate`);
  },
  getCurrenicesLookup: async () => {
    return get(ADDRESSBOOK_CONSTANTS.CURRENCY_COUNTRIES);
  },
  getproviderbanksLookup: async (country: any) => {
    return get(`${ADDRESSBOOK_CONSTANTS.PROVIDER_BANKS}?country=${country}`);
  },
  getDynamicLookup: async (url: string) => {
    return get(`${ADDRESSBOOK_CONSTANTS.DYNAMIC_LOOKUP}/${url}`);
  },
  getRecipientDynamicFeildsFiat: async () => {
    return get(ADDRESSBOOK_CONSTANTS.RECIPIENT_FIAT);
  },
  updatePaymentFiat: async (body: any) => {
    return put(ADDRESSBOOK_CONSTANTS.UPDATE_PAYMENT_FIAT, body);
  },
  savePaymentFiat: async (body: any) => {
    return post(ADDRESSBOOK_CONSTANTS.SAVE_PAYMENT_FIAT, body);
  },
};

export default AddressbookService;