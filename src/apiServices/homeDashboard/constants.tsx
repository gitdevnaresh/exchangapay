export const HOME_DASHBOARD_ENDPOINTS = {
  TOTAL_BALANCE: (appName: string) => `api/${appName === 'rapidz' ? 'v2' : 'v1'}/vaults/kpi`,
  DASH_BALANCE: (customerId: string) => `api/v1/CardsWallet/CardsTotalBalance/${customerId}`,
  WALLETS_BALANCE: (customerId: string) => `api/v1/Dashboard/Vaults/CustomerBalances/${customerId}`,
  CARDS_BALANCE: (customerId: string) => `api/v1/CardsWallet/CardsTotalBalance/${customerId}`,
  COUPON_BALANCE: 'api/v1/Affiliate/couponbalance',
  SHOW_ASSETS: (customerId: string) => `/api/v1/Merchant/Wallets/${customerId}/depositcrypto`,
  CUSTOMER_BALANCES: '/api/v1/Affiliate/customerbalances',
  CUSTOMER_WALLET_KPI: '/api/v1/Affiliate/customerwalletskpi',
  CUSTOMER_BONUS_KPI: '/api/v1/Affiliate/customerbonuskpi',
  STORE_OFFERS: '/api/v1/Affiliate/m/storeoffer',
};
