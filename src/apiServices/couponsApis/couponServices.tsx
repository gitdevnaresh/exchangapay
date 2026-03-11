import { get, post } from "../../utils/ApiService";

export const couponServices = {
  getCouponAmountLu: async () => {
    return await get(`api/v1/Affiliate/customercouponslookup`);
  },
  getCurrencyLu: async (customerId: any, actiontype: any) => {
    return await get(`api/v1/Affiliate/Wallets/Fee/${customerId}/${actiontype}`);
  },
  getNetworkLu: async (coinCode: any, customerId: any, merchantId: any, actiontype: any) => {
    return await get(`api/v1/Affiliate/Vaults/NetWorkLU//api/v1/Affiliate/Vaults/NetWorkLU/${coinCode}/${customerId}/${merchantId}/${actiontype}`)
  },
  getVaults: async (customerId: any, actiontype: any) => {
    return await get(`api/v1/Affiliate/Wallets/Fee/${customerId}/${actiontype}`)
  },
  getDashBoardCouponBalance: async () => {
    return await get(`api/v1/Affiliate/couponbalance`)
  },
  getWallets: async () => {
    return await get(`api/v1/Affiliate/WalletNetworkLu`)
  },
  getCouponCode: async (couponName: any, amount: any, count: any) => {
    return await get(`api/v1/Affiliate/couponcode/${couponName}/${amount}/${count}`)
  },
  couponSummery: async (body: any) => {
    return await post(`api/v1/Affiliate/couponsummary`, body)
  },
  buyCoupons: async (body: any) => {
    return await post(`api/v1/Affiliate/buycoupons`, body)
  },
  getcouponsList: async (status: any, search: any,page: any, pageSize: any) => {
    return await get(`api/v1/Affiliate/customercouponsk/${status}/${search}?page=${page}&pageSize=${pageSize}`)
  },
  recentCouponTransactions: async (page: any, pageSize: any) => {
    return await get(`api/v1/Affiliate/coupon/recentTransaction?page=${page}&pageSize=${pageSize}`)
  },
  getCouponKpis: async () => {
    return await get(`api/v1/Affiliate/customer/couponskpi`)
  },
  getMemberLookUp: async () => {
    return await get(`api/v1/Affiliate/customer/membernetworklu`)
  },
  transferCouponSuccess: async (body: any) => {
    return await post(`api/v1/Affiliate/coupontransfer`, body)
  },
  getStatusLookUp: async () => {
    return await get(`api/v1/Common/CouponStatusLu`)
  },
}