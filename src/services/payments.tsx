import { get, post, put } from '../utils/ApiService';

const PaymentService = {
  paymentAvailabeBalance: async (coin: any, id: any) => {
    return get(`/api/v1/Merchant/availablebalance/${coin}/${id}`);
  },
  paymentCoins: async (customerId: any, type: any) => {
    return get(`/api/v1/Merchant/GetMerchantDetails/${customerId}/${type}`);
  },
  getCoinsLookup: async () => {
    return get(`/api/v1/Merchant/coinslookup`)
  },
  getDaysLookUp: async () => {
    return get(`/api/v1/DashBoard/DaysLu/DashBoardGraph`)
  },
  getPaymentDashBoardGraph: async (customerId: any, days: any) => {
    return get(`/api/v1/DashBoard/PaymentDashBoardGraph/${customerId}/${days}`)
  },
  createMarchent: async (body: any) => {
    const data = await post('api/v1/Merchant/MerchantSave', body);
    return data;
  },
  getGenerateInvoiceDetails: async (id: any) => {
    return get(`/api/v1/Merchant/InvoiceDetails/${id}`);
  },
  getListOfCountries: async () => {
    return get('api/v1/Common/CountryLu');
  },
  getStateByCountryName: async (countryName: any) => {
    return get(`api/v1/Common/States/${countryName}`);
  },
  getInvoiceCoins: async () => {
    return get(`api/v1/Common/SupportedCurrencyLu`);
  },
  getAllPaymentLinks: async (customerId: any, type: any, search: any, fromDate?: any, endDate?: any, page: any, pageSize: any) => {
    let url = `/api/v1/Merchant/payments/${customerId}/${type}/${search}`;
    if (fromDate) {
      url += `/${fromDate}`;
    }
    if (endDate) {
      url += `/${endDate}`;
    }
    url += `?page=${page}&pageSize=${pageSize}`;
    return get(url);
  },
  getMerchantLu: async (customerId: any) => {
    return get(`/api/v1/Merchant/merchantslookup/${customerId}`);
  },
  getInvoiceFormVault: async (customerId: any) => {
    return get(`/api/v1/Merchant/VaultAccounts/${customerId}`);
  },
  updateInvoice: async (body: any) => {
    return put(`/api/v1/Merchant/updatepaymentlink`, body)
  },
  createInvoiceForm: async (body: any) => {
    return await post('api/v1/Merchant/CreateInvoice', body);
  },
  paymentLinkDetails: async (id: any) => {
    return get(`/api/v1/Merchant/paymentdetail/${id}`)
  },
  getMarchentsList: async (customerId: any) => {
    return get(`/api/v1/Merchant/GetMerchantDetails/${customerId}`)
  },
  getFiatCurrency: async (customerId: any, appName: any) => {
    return get(`/api/v1/ExchangeWallet/Exchange/FiatWallets/${customerId}/${appName}`)
  },
  postCryptoWithdraw: async (body: any) => {
    return post(`/api/v1/ExchangeTransaction/PaymentWithdraw/Crypto`, body)
  },
  postFiatWithdraw: async (body: any) => {
    return post(`/api/v1/ExchangeTransaction/PaymentWithdraw/Fiat`, body)
  },
  payOutCryptoSummery: async (body: any) => {
    return post(`api/v1/ExchangeWallet/PayOutCrypto/Summary`, body);
  },
  payOutFiatSummery: async (body: any) => {
    return post(`api/v1/ExchangeWallet/PayOutFiat/Summary`, body);
  },
  payOutTransactions: async (customerId: any, type: any, search: any, fromDate?: any, endDate?: any, page: any, pageSize: any) => {
    let url = `/api/v1/Merchant/PayOutTransactions/${customerId}/${type}/${search}`;
    if (fromDate) {
      url += `/${fromDate}`;
    }
    if (endDate) {
      url += `/${endDate}`;
    }
    url += `?page=${page}&pageSize=${pageSize}`;
    return get(url);
  },
  payOutPayeelu: async (customerId: any, type: any, currency: any, network: any, search: any, appName: any) => {
    return get(`/api/v1/ExchangeWallet/Payments/Payees/${customerId}/${type}/${currency}/${network}/${search}/${appName}`);
  },
  updatepaymentLinkDetails: async (body: any) => {
    return put(`/api/v1/Merchant/updatepaymentlinks`, body)
  },
  createPaymentSave: async (body: any) => {
    const data = await post('api/v1/Merchant/createpaymentlinks', body);
    return data;
  },
  getSendFiatPayees: async (customerId: string, currency: string) => {
    return get(`/api/v1/ExchangeWallet/Exchange/PayeeLu/${customerId}/${currency}`)
  },
  confirmFiatToCrypto: async (body: any) => {
    return post(`/api/v1/ExchangeWallet/PaymentCryptoToFiat/Confirm`, body);
  },
  paymentKpiDetails: async (customerId: any) => {
    return get(`api/v1/Dashboard//Payments/kpis/${customerId}`)
  },
  payOutList: async (customerId: any, type: any, date: any, page: any, pageSize: any) => {
    return get(`/api/v1/Merchant/PayOutTransactions/${customerId}/${type}/${date}?page=${page}&pageSize=${pageSize}`)
  },
  paymentDashBoadGraph: async (customerId: any, year: any) => {
    return get(`/api/v1/Dashboard/PaymentsDashboardGraph/${customerId}/${year}`)
  },
  getCryptoPayee: async (customerId: any, coin: any, network: any, type: any) => {
    return get(`/api/v1/Common/PayeeCryptoLU/${customerId}/${coin}/${network}/${type}`)
  },
  getVerificationCode: async (customerId: any, type: any) => {
    return get(`/api/v1/Security/SendOTP/${customerId}/${type}`)
  },
  getFiatCurrencyDetails: async (customerId: any, coin: any, network: any, type: any) => {
    return get(`/api/v1/ExchangeWallet/PayoutFiat/${customerId}/${coin}/${network}/${type}`)
  },
  getPayoutLimit: async () => {
    return get(`/api/v1/Common/PayOutLimit`)
  },
  fiatPayeeDetails: async (customerId: any, coin: any) => {
    return get(`/api/v1/ExchangeWallet/Exchange/PayeeLu/${customerId}/${coin}`)
  },
  stateChange: async (type: any, status: any) => {
    return get(`/api/v1/Common/StateChange/${type}/${status}`)
  },
  downloadInvoiceTemplete: async (txid: any) => {
    return get(`/api/v1/Merchant/InvoiceTemplateDownload/${txid}`)
  },
  downloadStatictemplete: async (txid: any) => {
    return get(`/api/v1/Merchant/StaticTemplateDownload/${txid}`)
  },
  invoiceStatusUpdate: async (id: any, body: any) => {
    return put(`/api/v1/Merchant/PayIn/StateChange/${id}`, body)
  },
  payInPreviewTemplates: async (type: any, body: any) => {
    return post(`/api/v1/Merchant/${type}`, body)
  },
  teamCount:async()=>{
    return get('/api/v1/Affiliate/m/referralKpi')
  },
  withdrawAmount:async()=>{
    return get('/api/v1/Affiliate/m/withdrawamountkpi')
  },
  totalAmount:async(id:string)=>{
    return get(`/api/v1/Affiliate/CashWallet/${id}`)
  }
}

export default PaymentService 
