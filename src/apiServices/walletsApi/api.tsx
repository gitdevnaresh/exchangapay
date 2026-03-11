import { get } from "../../utils/ApiService"
export const WalletsService = {
  getWalletsAmount: async (packageId: any) => {
    return await get(`/api/v1/Merchant//availablebalance/BTC/${packageId}`)
  },
  getShowAssets: async (customerId: any) => {
    return get(`api/v1/Merchant/Wallets/${customerId}/depositcrypto`)
  },
  getCouponBalance: async () => {
    return await get(`/api/v1/Affiliate/couponbalance`)
  },
  getWalletKpis: async () => {
    return await get(`/api/v1/Affiliate/customerwalletskpi`)
  },
  getBonusKpis: async () => {
    return await get(`api/v1/Affiliate/m/bonuskpi`)
  },
  getRefferalKpis: async () => {
    return await get(`api/v1/Affiliate/m/referralKpi`)
  },
  getwithdrawKpis: async () => {
    return await get(`api/v1/Affiliate/m/withdrawamountkpi`)
  },
  getBonusLevels: async () => {
    return await get(`api/v1/Affiliate/m/ReferralBonusData`)
  },
  getCashwalletBalance: async (customerId:any) => {
    return await get(`api/v1/Affiliate/CashWallet/${customerId}`)
  }
}