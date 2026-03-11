import { get } from "../../utils/ApiService";

export const homeServices = {
    getTotalBalance: async () => {
        return await get(`api/v1/vaults/kpi`);
      },
      getDashBalance: async (customerId:any) => {
        return await get(`api/v1/CardsWallet/CardsTotalBalance/${customerId}`);
      },
      getWalletsBalance: async (customerId:any) => {
        
        return await get(`api/v1/Dashboard/Vaults/CustomerBalances/${customerId}`);
      },
      getCardsBalance: async (customerId:any) => {
        return await get(`api/v1/CardsWallet/CardsTotalBalance/${customerId}`);
      },
      getCouponBalance: async () => {
        return await get(`api/v1/Affiliate/couponbalance`);
      },
      getShowAssets: async (customerId: any) => {
        return get(`/api/v1/Merchant/Wallets/${customerId}/depositcrypto`)
      },
      getCustomerBalances:async()=>{
        return await get(`/api/v1/Affiliate/customerbalances`);
      },
      getCustomerWalletKpi:async()=>{
        return await get(`/api/v1/Affiliate/customerwalletskpi`);
      },
      getCustomerBonusKpi:async()=>{
        return await get(`/api/v1/Affiliate/customerbonuskpi`);
      },
      getstoreOffersData:async()=>{
        return await get(`/api/v1/Affiliate/m/storeoffer`);
      }
    }
