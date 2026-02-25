import { bankget, get, post, put } from '../../ApiService';
import { BANK_ENDPOINTS, ACCOUNT_TYPES } from '../constants/bankConstants';

const BankCommonService = {
  getLookupData: async () => {
    return get(BANK_ENDPOINTS.COMMON.LOOKUP);
  },
  
  getAddressList: async () => {
    return get(BANK_ENDPOINTS.COMMON.ADDRESSES);
  },
  
  getAddressLooupDetails: async () => {
    return get(BANK_ENDPOINTS.COMMON.ADDRESS_LOOKUP);
  },
  
  getAllAdressTypes: async () => {
    return get(BANK_ENDPOINTS.COMMON.ADDRESS_TYPES);
  },
  
  getListOfCountries: async () => {
    return get(BANK_ENDPOINTS.COMMON.COUNTRIES);
  },
  
  getStateByCountryName: async (countryName: any) => {
    return get(`${BANK_ENDPOINTS.COMMON.STATES}/${countryName}`);
  },
  
  getSendListDetails: async (currency: any) => {
    return get(`${BANK_ENDPOINTS.COMMON.PAYEES_FIAT}?currency=${currency}&feature=Banks`);
  },
  
  getPayeesLookups: async () => {
    return get(BANK_ENDPOINTS.COMMON.PAYEES_LOOKUP);
  },
  
  getPaymentFieds: async (paymentType: any) => {
    return get(`${BANK_ENDPOINTS.COMMON.PAYMENT_TYPES}?currency=${paymentType}`);
  },
  
  getbranches: async (bank: any) => {
    return get(`${BANK_ENDPOINTS.COMMON.BRANCHES}?bankname=${bank}`);
  },
  
  getPaymentTypeFieds: async (value: any) => {
    const paymentType = typeof value === 'string' ? value : value?.paymentType;
    return get(`${BANK_ENDPOINTS.COMMON.PAYEES_PAYMENTS}?name=${paymentType}`);
  },
  
  updatePaymentFiat: async (body: any) => {
    return put(BANK_ENDPOINTS.COMMON.PAYEES_UPDATE, body);
  },
  
  savePaymentFiat: async (body: any) => {
    return post(BANK_ENDPOINTS.COMMON.PAYEES_SAVE, body);
  },
  
  getAllNotifications: async (pageSize: any, pageNo: any, search: any) => {
    return get(`${BANK_ENDPOINTS.COMMON.NOTIFICATIONS}?pageSize=${pageSize}&pageNo=${pageNo}&search=${search}`);
  },
  
  getAllNotificationCount: async () => {
    return get(BANK_ENDPOINTS.COMMON.UNREAD_COUNT);
  },
  
  putNotificationCount: async () => {
    return put(BANK_ENDPOINTS.COMMON.READ_NOTIFICATIONS, {});
  },
  
  getPhoneCode: async (body: any) => {
    return post(BANK_ENDPOINTS.COMMON.PHONE_SEND, body);
  },
  
  getPhoneVerify: async (body: any) => {
    return post(BANK_ENDPOINTS.COMMON.PHONE_RESEND, body);
  },
  
  getVerifyPhoneCode: async (body: any) => {
    return post(BANK_ENDPOINTS.COMMON.PHONE_VERIFY, body);
  },
  
  iBanVerification: async (number: any) => {
    return get(`${BANK_ENDPOINTS.COMMON.IBAN_VALIDATE}/${number}/validate`);
  },
  
  getCurrenicesLookup: async () => {
    return get(BANK_ENDPOINTS.COMMON.CURRENCY_COUNTRIES);
  },
  
  getproviderbanksLookup: async (country: any) => {
    return get(`${BANK_ENDPOINTS.COMMON.PROVIDER_BANKS}?country=${country}`);
  },
  
  getBankLu: async (currency: any) => {
    return get(`${BANK_ENDPOINTS.COMMON.BANKS_LOOKUP}?countryCode=${currency}`);
  },
  
  getDynamicLookup: async (url: string) => {
    return get(`${BANK_ENDPOINTS.COMMON.DYNAMIC_LOOKUP}/${url}`);
  },
  
  getProfileInfo: async (type: any) => {
    if (type?.toLowerCase() === ACCOUNT_TYPES.PERSONAL) {
      return get(BANK_ENDPOINTS.COMMON.PROFILE_PERSONAL);
    } else {
      return get(BANK_ENDPOINTS.COMMON.PROFILE_BUSINESS);
    }
  },
  
  getPrivatePolicyTemplate: async (type: any, accountType: any) => {
    return get(`${BANK_ENDPOINTS.COMMON.PRIVACY_POLICY}/${type}?Type=${accountType}`);
  },
  
  sumsubAccessToken: async (applicantId: string, levelName: string) => {
    return get(`${BANK_ENDPOINTS.COMMON.SUMSUB_TOKEN}?applicantId=${applicantId}&levelName=${levelName}`);
  },
  
  poacreation: async (payload: any) => {
    return post(BANK_ENDPOINTS.COMMON.POA_CREATION, payload);
  },
  
  getRecipientDynamicFeildsFiat: async () => {
    return get(BANK_ENDPOINTS.COMMON.RECIPIENT_FIAT);
  },
  
  getRecipientDynamicFeildsCrypto: async () => {
    return get(BANK_ENDPOINTS.COMMON.RECIPIENT_CRYPTO);
  },
  
  onboardingVerifyPhoneCode: async (body: any) => {
    return post(BANK_ENDPOINTS.COMMON.PHONE_VERIFY_ONBOARDING, body);
  },
};

export default BankCommonService;