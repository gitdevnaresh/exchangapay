import { get, post } from "../../utils/ApiService";



export const PackagesApiService = {
  getPackages: async () => {
    return await get(`api/v1/Affiliate/customerpackages`);
  },
  getProducts: async (packageId: any) => {
    return await get(`/api/v1/Affiliate/products/${packageId}`)
  },
  getAddresses: async (customerId: any, pageNo: any, pageSize: any) => {
    return get(`/api/v1/Common/CustomerK/${customerId}/Address/?page=${pageNo}&pageSize=${pageSize}`)
  }, getDepositWallets: async (customerId: any, actiontype: any) => {
    return get(`/api/v1/Affiliate/Wallets/Fee/${customerId}/${actiontype}`)
  },
  getCoupons: async () => {
    return get(`/api/v1/Affiliate/customercoupons`)
  },
  getProductDetails: async (productId: any) => {
    return await get(`/api/v1/Affiliate/product/${productId}`)
  },
  getProductPackagesummary: async (body: any) => {
    return await post(`/api/v1/Affiliate/packagesummary`, body)
  },
  getWalletBalance: async (customerId: any) => {
    return await get(`/api/v1/Affiliate/Wallets/Fee/${customerId}/withdrawcrypto `)
  },
  getNetworkLu: async (coinCode: any, customerId: any, merchantId: any) => {
    return await get(`api/v1/Affiliate/Vaults/NetWorkLU/${coinCode}/${customerId}/${merchantId}/withdrawcrypto`)
  },
  postPackages: async (body: any) => {
    return await post(`/api/v1/Affiliate/packages`, body)
  },
  postProducts: async (body: any) => {
    return await post(`/api/v1/Affiliate/CreateOrder`, body)
  },
  getEwalletAccounts: async () => {
    return await get(`/api/v1/Customer/MembershipLu`)
  },
  getEWalletBalance: async (id: any) => {
    return await get(`/api/v1/Affiliate/CashWallet/${id}`)
  },
  getAccountsKpi: async (id: any) => {
    return await get(`/api/v1/Affiliate/accountskpi/${id}`)
  },
  getMeberships: async (pageNo: any, pageSize: any) => {
    return get(`/api/v1/Customer/Memberships?page=${pageNo}&pageSize=${pageSize}`)
  },
  getPaymentBalance: async () => {
    return await get(`/api/v1/Affiliate/paymentbalances`)
  },
  getAccountDetails:async(accountId:any)=>{
    return get(`/api/v1/Affiliate//MembershipView/${accountId}`)
  }
}
