
import { get, marketsget, post,put } from '../utils/ApiService';
import { marketApi, transactionBankApi, coingico } from '../utils/api';

const CryptoServices = {
    getMarketCoins: async () => {
        const data = await marketApi.get(`api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=1000&page=1&sparkline=false%27`);
        return data;
    },
    getCryptoTotalBalance: async (customerId: any) => {
        return get(`/api/v1/DashBoard/Vaults/CustomerBalances/${customerId}`)

    },
      getTotalBalance: async () => {
        return get(`api/customers/dashBoard`)

    },
    getCurrencyTotalBalance:async(currency:string)=>{
        return get (`api/v1/ExchangeWallet/DashBoard/M/total?currency=${currency}`)
    },
    getCurrecncyList:async()=>{
        return get (`api/v1/Common/CurrencyLookUp`)
    },
    updateCustomerDefaultCurrency:async(body:any)=>{
        return put (`api/v1/Customer/customercurrency`,body)
    },
    getCryptoCoinsData: async () => {
        const data = await get(`api/v1/Wallets/CryptoPortFolio/Exchange`)
        return data;
    },
    getCryptoTransactions: async (customerId: any, type: any, page: any, pageSize: any) => {
        return get(`/api/v1/DashBoard/M/CustomerCryptoTransactions/${customerId}/${type}?page=${page}&pageSize=${pageSize}`)

    },
    getCryptoTransactionsDetails: async (id: any, type: any) => {
        const { data } = await get(`api/v1/Transactions/TemplatesTranction/${id}/${type}`)
        return data;
    },
    getCryptoTransactionsDetailsBy: async (customerId: any, TransactionId: any) => {
        return get(`​/api​/v1​/DashBoard​/M​/Customer​/TransactionsDetails​/${customerId}​/${TransactionId}`)
    },
    getCryptoTransactionsUpdates: async (customerId: any, TransactionId: any) => {
        return get(`api/v1/DashBoard/M/Customer/TransactionStatus/${customerId}/${TransactionId}`)

    },
    getCryptoTransactionsDownload: async (id: any, type: any) => {
        const data = await transactionBankApi.get(`api/v1/Bank/TransationDetailsDownload/${id}/${type}`)
        return data;
    },
    saveNotes: async (body: any) => {
        const data = await transactionBankApi.put('api/v1/Bank/SaveNotes', body);
        return data;
    },
    //tstbankapi.suissebase.io/api/v1/Bank/SaveNotes  
    getCryptoReceive: async () => {
        const data = await get(`api/v1/Wallets/Crypto`)
        return data;
    },//tstapi.suissebase.io/api/v1/Deposit/Deposit/Crypto/BTC/BTC

    getCryptoDeposit: async (customerId: any, walletCode: any, network: any) => {
        const data = await get(`api/v1/ExchangeWallet/DepositCrypto/${customerId}/${walletCode}/${network}`)
        return data;
    },
    getCommonCrypto: async (network: any) => {
        const data = await get(`api/v1/Common/NetWorkLU/${network}`)
        return data;
    },
    getCryptoGrphData: async (coinName: string, currency: string, days: number) => {
        const data = await coingico.get(`coins/${coinName}/market_chart?vs_currency=${currency}&days=${days}`)
        return data;
    },
    getCryptoTransactionsSearch: async (type: any) => {
        const data = await get(`api/v1/Transactions/Crypto/Transation/${type}`)
        return data;
    },
    getFeesInfo: async (customerId: string) => {
        return get(`/api/v1/Commissions/CustomerFee/${customerId}`);
    },
    getAllTotalBalance: async () => {
        return get(`api/v1/Customer/Home/DashBoard`)
    },
    getCryptoFiatTotalBalance: async (customerId: any) => {
        return get(`api/v1/Dashboard/Vaults/CustomerBalances/${customerId}`)
    },
    getDashBoardReferals: async (customerId: any) => {
        return get(`api/v1/Dashboard/Referrals/Kpis/${customerId}`)
    },
    getCardsKpis: async (customerId: any) => {
        return get(`api/v1/Dashboard/Cards/Kpis/${customerId}`)
    },
    getPaymentsKpis: async (customerId: any) => {
        return get(`api/v1/Dashboard/Payments/Kpis/${customerId}`)
    },
    getAdvertisements: async () => {
        return get(`api/v1/Dashboard/GetAdvertisements/DashBoard`)
    },
    getCryptoAdvertisements:async()=>{
        return get(`/api/v1/Dashboard/GetAdvertisements/vaults`)
    },
    getVaults:async(customerId: any)=>{
        return get(`/api/v1/Dashboard/vaults/${customerId}/depositcrypto`)
    },
    getMarketHighlights:async()=>{
        return get(`/api/v1/Dashboard/TopGainers`)
    },
    getDashBoardGraph: async (customerId: any) => {
        return get(`api/v1/Dashboard/DashBoardCustomerBalance/${customerId}`)
    },
    getAllmarkets: async () => {
        return marketsget(`/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&sparkline=true`)
    },
    getExchangeKpis: async (customerId: any) => {
        return get(`api/v1/Dashboard/Exchange/Kpis/${customerId}`)
    },
    getNetworksData: async (coinCode:any,customerId: any,merchantId:any) => {
        return get(`api/v1/Common/Vaults/NetworkLu/${coinCode}/${customerId}/${merchantId}/withdrawcrypto`)
    },
    getFeesData: async () => {
        return get(`/api/v1/fees`);
    },
     getUpgradeFeeChargesData: async (id:any,vaults:any) => {
        return get(`api/v1/upgrade/fees/${id}/details?module=${vaults}`)
    },
    getUpgradeFeesData: async () => {
        return get(`/api/v1/memberships/upgrade`);
    },
     getVaultsData: async () => {
        return get(`api/v1/memberships/upgrade/vaults`)
    },
      getMembershipConfirm: async (body:any) => {
        return post(`api/v1/memberships/upgrade/fee`,body)
    },
     getAmountData: async (fromCoin:any,toCoin:any,amount:any) => {
        return get(`api/v1/exchangeRate?fromAsset=${fromCoin}&toAsset=${toCoin}&amount=${amount}`)
    },
     getMembershipUpgrade: async (body:any) => {
        return post(`api/v1/memberships/upgrade/payment`,body)
    },
}
export default CryptoServices;






















