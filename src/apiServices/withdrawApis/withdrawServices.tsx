import { get, post, put } from "../../utils/ApiService";

export const WithDrawServices = {
  payeesLu: async (customerId: any, currency: any) => {
    return await get(`api/v1/ExchangeWallet/Bank/TransferPayeeLu/${customerId}/${currency}`);
  },
  getWithdrawFiatWallets: async (customerId: any) => {
    return get(`/api/v1/Merchant/Vaults/Fiat/${customerId}/withdrawfiat`)
  },
  withdrawSummary: async (walleteId: any, sendAmount: any, network: any) => {
    return await get(`api/v1/ExchangeWallet/Customer/WithdrawFee/${walleteId}/${sendAmount}/${network}`)
  },
  withdrawSave: async (body: any) => {
    return await post(`/api/v1/ExchangeTransaction/Exchange/Withdraw/Fiat`, body)
  },
  getWalletCurrencies: async () => {
    return await get(`/api/v1/ExchangeWallet/Withdraw/CryptoWallets`)
  },
  getWalletNetwork: async (coinCode: any) => {
    return await get(`api/v1/Common/Wallets/NetWorkLUMaster/${coinCode}`)
  },
  savePayee: async (body: any) => {
    return post(`api/v1/Common/SavePayee/Crypto`, body)
  },
  payeesLIst: async (currency: any, network: any) => {
    return get(`api/v1/Common/GetCryptoPayees?coin=${currency}&network=${network}`)
  },
  Withdrawsave: async (body: any) => {
    return post('api/v1/ExchangeTransaction/CustomerWithdraw/Crypto', body);
  },
  getAllPayeesList: async (searchQuery: any, page: any, pageSize: any) => {
    return get(`api/v1/Common/Payees/Crypto?favoriteName=${searchQuery}&page=${page}&pageSize=${pageSize}`);
  },
  PayeesList: async (searchQuery?: any, currency?: any, network?: any) => {
    return get(`api/v1/Common/Payees/Crypto?favoriteName=${searchQuery}&currency=${currency}&network=${network}`);
  }, withdraTransferDetails: async (transactionId: any) => {
    return get(`/api/v1/ExchangeTransaction/M/trsansactionDetails/${transactionId}`)
  }, cancelWithdraw: async (transactionId: any) => {
    return put(`/api/v1/ExchangeTransaction/Customer/CancelWithdraw/${transactionId}`, {})
  }, withdrawTransactionDetails: async (transactionId: any) => {
    return get(`api/v1/ExchangeTransaction/Customer/WithdrawDetails/${transactionId}`)
  },
   WhiteListAddressList: async (favoriteName?: any, currency?: any, network?: any, page?: any, pageSize?: any) => {
    return get(`/api/v1/Common/Payees/Crypto?favoriteName=${favoriteName}&currency=${currency}&network=${network}&page=${page}&pageSize=${pageSize}`)
  },
   DeleteAddress: async (body?: any) => {
    return put(`api/v1/Common/DeletePayee`,body)
  },
   EditWalletAddressNickname:  async (body?: any) => {
    return put(`/api/v1/Common/UpdatePayee`,body)
  },
   ResendWhiteListEmail: async (id:any,body:any) => {
    return post(`/api/v1/Common/Payee/ResendMail/${id}`,body)
  },
  whiteListDetails: async (id:any) => {
    return get(`/api/v1/Common/Payees/Crypto/${id}`)
  },
  fetchStableCoinLu:async()=>{
    return get(`/api/v1/ExchangeWallet/Withdraw/Fait/stablecoin/Lookup`)
  },
  fetchFiatCurrencyLu:async()=>{
    return get(`/api/v1/ExchangeWallet/Withdraw/Fait/Currency/Lookup`)
  },
  fetchPaymentMethods:async(currency:any)=>{
return get(`/api/v1/ExchangeWallet/PaymentMethods/${currency}`)
  },
  fetchDocumentRequirements:async()=>{
return get(`/api/v1/ExchangeWallet/Document/Requirements`)
  },
  fetchBeneficiaries:async(currency:any,type:any)=>{
return get(`/api/v1/ExchangeWallet/Get/Payee/${currency}/${type}`)
  },
  getExchangeRate: async (fromCurrency: string, toCurrency: string) => {
    return get(`/api/v1/exchangeRate?fromAsset=${fromCurrency}&toAsset=${toCurrency}&amount=1`);
  }

}