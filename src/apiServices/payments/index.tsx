import { PAYMENTS_ENDPOINTS } from './constants';
import { get, paymentGet, paymentPost, paymentPut, post } from '../ApiService';

const PaymentService = {
  paymentDashBoadGraph: async (type: string | number) => {
    return paymentGet(PAYMENTS_ENDPOINTS.SUMMARY(type));
  },
  paymentCoins: async () => {
    return paymentGet(PAYMENTS_ENDPOINTS.MERCHANTS);
  },
  paymentKpiDetails: async () => {
    return paymentGet(PAYMENTS_ENDPOINTS.KPI);
  },
  paymentAvailabeBalance: async () => {
    return paymentGet(PAYMENTS_ENDPOINTS.BALANCE_PAYIN);
  },
  paymentPayoutBalance: async () => {
    return paymentGet(PAYMENTS_ENDPOINTS.BALANCE_PAYOUT);
  },
  getAllPaymentLinks: async (type: any, search: any, page: any, pageSize: any) => {
    return paymentGet(PAYMENTS_ENDPOINTS.PAYMENT_LINKS(type, page, pageSize, search));
  },
  getPayOutList: async (page: any, pageSize: any, search: any) => {
    return paymentGet(PAYMENTS_ENDPOINTS.PAYOUT_LIST(page, pageSize, search));
  },
  getMerchantLu: async () => {
    return paymentGet(PAYMENTS_ENDPOINTS.MERCHANTS);
  },
  getCurrencyLu: async (id:any,type:string) => {
    return get(PAYMENTS_ENDPOINTS.CURRENCIES(id, type));
  },
  stateChange: async (type: any, status: any) => {
    return get(PAYMENTS_ENDPOINTS.FEATURE_STATUS(type, status));
  },
  downloadInvoiceTemplete: async (txid: any, type: string) => {
    return paymentGet(PAYMENTS_ENDPOINTS.INVOICE_DOWNLOAD(txid, type));
  },
  downloadStatictemplete: async (txid: any, type: string) => {
    return paymentGet(PAYMENTS_ENDPOINTS.INVOICE_DOWNLOAD(txid, type));
  },
  invoiceStatusUpdate: async (id: any, body: any) => {
    return paymentPut(PAYMENTS_ENDPOINTS.PAYIN_STATE(id), body);
  },
  updateInvoice: async (body: any) => {
    return paymentPut(PAYMENTS_ENDPOINTS.PAYIN_INVOICE, body);
  },
  createInvoiceForm: async (body: any) => {
    return await paymentPost(PAYMENTS_ENDPOINTS.PAYIN_INVOICE, body);
  },
  saveKycDetails: async (body: any) => {
    return await paymentPost(PAYMENTS_ENDPOINTS.KYC_REQUIREMENTS_POST, body);
  },
  payInPreviewTemplates: async (type: any, body: any) => {
    return post(PAYMENTS_ENDPOINTS.MERCHANT_PREVIEW(type), body);
  },
  getGenerateInvoiceDetails: async (id: any) => {
    return paymentGet(PAYMENTS_ENDPOINTS.INVOICE_DETAILS(id));
  },
  getListOfCountries: async () => {
    return get(PAYMENTS_ENDPOINTS.LOOKUP);
  },
  paymentsLookups: async () => {
    return get(PAYMENTS_ENDPOINTS.LOOKUP);
  },  
  getStaicPayinCoins: async () => {
    return paymentGet(PAYMENTS_ENDPOINTS.FIAT_WALLETS_LOOKUP);
  },
  getStaicPayinView: async (Coin:string) => {
    return paymentGet(PAYMENTS_ENDPOINTS.FIAT_DEPOSIT(Coin));
  },
  getCryptoPayee: async (toCurrency: any,feature:any) => {
    return get(PAYMENTS_ENDPOINTS.PAYEES_FIAT(toCurrency, feature));
  },
  cryptoPayoutSave: async (body: any) => {
    return paymentPost(PAYMENTS_ENDPOINTS.PAYOUT_CRYPTO('payoutcrypto'), body);
  },
  fiatPayoutSave: async (body: any) => {
    return paymentPost(PAYMENTS_ENDPOINTS.PAYOUT_FIAT('payoutfiat'), body);
  },
  fiatpayinIdrList:async(page: any, pageSize: any)=>{
    return paymentGet(PAYMENTS_ENDPOINTS.PAYIN_FIAT_LIST(page, pageSize));
  },
  fiatPayinLists: async (coin: any) => {
    return paymentGet(PAYMENTS_ENDPOINTS.PAYIN_FIAT_DETAILS(coin));
  },
  walletsfiatpayinIdrList: async (search: any) => {
    return get(PAYMENTS_ENDPOINTS.WALLETS_FIAT_PAYMENT_LINKS(search));
  },
  payoutCoins: async (type: any) => {
    return paymentGet(PAYMENTS_ENDPOINTS.PAYOUT_MERCHANT(type));
  },
  paymentLinkDetails: async (type: string, id: any) => {
    return paymentGet(PAYMENTS_ENDPOINTS.PAYIN_DETAILS(type, id));
  },
  postCryptoWithdraw: async (body: any) => {
    return paymentPost(PAYMENTS_ENDPOINTS.PAYOUT_CRYPTO_FEE, body);
  },
  postFiatWithdraw: async (body: any) => {
    return paymentPost(PAYMENTS_ENDPOINTS.PAYOUT_FIAT_FEE, body);
  },
  payOutCryptoSummery: async (body: any) => {
    return paymentPost(PAYMENTS_ENDPOINTS.PAYOUT_FIAT_FEE, body);
  },
  payOutFiatSummery: async (body: any) => {
    return paymentPost(PAYMENTS_ENDPOINTS.PAYOUT_FIAT_FEE, body);
  },
  payOutTransactions: async (type: any, search: any, page: any, pageSize: any) => {
    return paymentGet(PAYMENTS_ENDPOINTS.PAYMENT_LINKS(type, page, pageSize, search));
  },
  createPaymentSave: async (body: any) => {
    const data = await paymentPost(PAYMENTS_ENDPOINTS.STATIC_INVOICE, body);
    return data;
  },
  createFiatPayinInvoice: async (body: any) => {
    return paymentPost(PAYMENTS_ENDPOINTS.STANDARD_INVOICE, body);
  },
  getFiatPayee: async (coin: any) => {
    return get(PAYMENTS_ENDPOINTS.PAYEES_FIAT_CURRENCY(coin));
  },
  getKycFormDetails: async () => {
    return paymentGet(PAYMENTS_ENDPOINTS.KYC_KYB_DETAILS);
  },
  fiatView: async (id:any)=>{
    return paymentGet(PAYMENTS_ENDPOINTS.FIAT_VIEW(id));
  },
  payOutCurrencies:async(type:any)=>{
    return paymentGet(PAYMENTS_ENDPOINTS.PAYOUT_CURRENCIES(type));
  },
  getPurpose:async(id:any)=>{
    return paymentGet(PAYMENTS_ENDPOINTS.PURPOSE(id));
  },
  getSourceFunds:async(id:any)=>{
    return paymentGet(PAYMENTS_ENDPOINTS.SOURCE_FUNDS(id));
  },
  kycRequirements:async(id:any)=>{
    return paymentGet(PAYMENTS_ENDPOINTS.KYC_REQUIREMENTS(id));
  },
  kycAddresses: async () => {
    return get(PAYMENTS_ENDPOINTS.ADDRESSES);
  },
  kycBenificiariesList:async()=>{
    return get(PAYMENTS_ENDPOINTS.BENEFICIARIES);
  },
  uboDetails:async(id:any)=>{
    return get(PAYMENTS_ENDPOINTS.UBO_DETAILS(id));
  },
  saveKybDetails:async(body:any)=>{
    return paymentPost(PAYMENTS_ENDPOINTS.KYC_REQUIREMENTS_POST,body);
  },
  selectedPayoutCryptokycrequirements:async(programId:string)=>{
    return paymentGet(PAYMENTS_ENDPOINTS.KYC_REQUIREMENTS(programId));
  },
  getDynamicLookup: async (url: string) => {
    return get(PAYMENTS_ENDPOINTS.DYNAMIC_LOOKUP(url));
  },
  getPaymentDataDownload:async(id:string,type:string)=>{
    return paymentGet(PAYMENTS_ENDPOINTS.INVOICE_DOWNLOAD(id, type));
  },
   getAddressLookUpDetails: async () => {
    return get(PAYMENTS_ENDPOINTS.KYC_LOOKUP);
  },
   brlAddressPost: async (body: any,) => {
        return post(PAYMENTS_ENDPOINTS.CUSTOMER_ADDRESS, body);
    },
    fiatDetails:async(currency:any,type:any)=>{
  return paymentGet(PAYMENTS_ENDPOINTS.FIAT_DETAILS(currency, type));
},
fiatTransactions:async(type:any,currency:any,page:any,pageSize:any)=>{
  return paymentGet(PAYMENTS_ENDPOINTS.FIAT_TRANSACTIONS(type, currency, page, pageSize));
},
  gotoExchangeSummeryPage: async (screenName: string, obj: any) => {
    if (screenName === "cardsCrypto") {
      return post(PAYMENTS_ENDPOINTS.EXCHANGE_CARDS_CRYPTO, obj);
    }
    return post(PAYMENTS_ENDPOINTS.EXCHANGE_CRYPTO, obj);
  },
   getAllCryptoPayees: async (customerId: any, walletCode: any) => {
    return get(PAYMENTS_ENDPOINTS.CRYPTO_PAYEES(customerId, walletCode));
  },
}
export default PaymentService;
