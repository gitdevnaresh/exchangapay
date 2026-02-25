import { getAppName } from "../../../Environment";
import { get } from "../ApiService";
import { HOME_DASHBOARD_ENDPOINTS } from './constants';

const appName = getAppName();

export const homeServices = {
  getTotalBalance: async () => {
    return await get(HOME_DASHBOARD_ENDPOINTS.TOTAL_BALANCE(appName));
  },
  getDashBalance: async (customerId: any) => {
    return await get(HOME_DASHBOARD_ENDPOINTS.DASH_BALANCE(customerId));
  },
  getWalletsBalance: async (customerId: any) => {
    return await get(HOME_DASHBOARD_ENDPOINTS.WALLETS_BALANCE(customerId));
  },
  getCardsBalance: async (customerId: any) => {
    return await get(HOME_DASHBOARD_ENDPOINTS.CARDS_BALANCE(customerId));
  },
  getCouponBalance: async () => {
    return await get(HOME_DASHBOARD_ENDPOINTS.COUPON_BALANCE);
  },
  getShowAssets: async (customerId: any) => {
    return get(HOME_DASHBOARD_ENDPOINTS.SHOW_ASSETS(customerId));
  },
  getCustomerBalances: async () => {
    return await get(HOME_DASHBOARD_ENDPOINTS.CUSTOMER_BALANCES);
  },
  getCustomerWalletKpi: async () => {
    return await get(HOME_DASHBOARD_ENDPOINTS.CUSTOMER_WALLET_KPI);
  },
  getCustomerBonusKpi: async () => {
    return await get(HOME_DASHBOARD_ENDPOINTS.CUSTOMER_BONUS_KPI);
  },
  getstoreOffersData: async () => {
    return await get(HOME_DASHBOARD_ENDPOINTS.STORE_OFFERS);
  }
};
