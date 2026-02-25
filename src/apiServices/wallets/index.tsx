import { get, post } from '../ApiService';
import { WALLETS_ENDPOINTS } from './constants';

const WalletsService = {
  createMarchent: async (body: any) => {
    const data = await post(WALLETS_ENDPOINTS.CREATE_MERCHANT, body);
    return data;
  },
  kycAddresses: async () => {
    return get(WALLETS_ENDPOINTS.KYC_ADDRESSES);
  },
  kycRequirements: async (id: any) => {
    return get(WALLETS_ENDPOINTS.KYC_REQUIREMENTS(id));
  },
  saveKycDetails: async (body: any) => {
    return await post(WALLETS_ENDPOINTS.SAVE_KYC_DETAILS, body);
  },
  getWalletsAmount: async (packageId: any) => {
    return await get(WALLETS_ENDPOINTS.WALLETS_AMOUNT(packageId));
  },
  getCouponBalance: async () => {
    return await get(WALLETS_ENDPOINTS.COUPON_BALANCE);
  },
  getWalletKpis: async () => {
    return await get(WALLETS_ENDPOINTS.WALLET_KPIS);
  },
  getBonusKpis: async () => {
    return await get(WALLETS_ENDPOINTS.BONUS_KPIS);
  },
  getRefferalKpis: async () => {
    return await get(WALLETS_ENDPOINTS.REFFERAL_KPIS);
  },
  getwithdrawKpis: async () => {
    return await get(WALLETS_ENDPOINTS.WITHDRAW_KPIS);
  },
  getBonusLevels: async () => {
    return await get(WALLETS_ENDPOINTS.BONUS_LEVELS);
  },
  getCashwalletBalance: async (customerId: any) => {
    return await get(WALLETS_ENDPOINTS.CASHWALLET_BALANCE(customerId));
  },
  getShowVaults: async () => {
    return get(WALLETS_ENDPOINTS.SHOW_VAULTS);
  },
  getFiatVaultsList: async () => {
    return get(WALLETS_ENDPOINTS.FIAT_VAULTS_LIST);
  },
  getSelectedFiatDeposteDetails: async (currency: string) => {
    return get(WALLETS_ENDPOINTS.FIAT_DEPOSIT_DETAILS(currency));
  },
  withdrawFiatSummaryDetails: async (obj: {}) => {
    return post(WALLETS_ENDPOINTS.WITHDRAW_FIAT_FEE, obj);
  },
  withdrawFiatSucess: async (obj: {}) => {
    return post(WALLETS_ENDPOINTS.WITHDRAW_FIAT, obj);
  },
  withdrawFiatSelectCoinDetails: async (selectedCoinId: string) => {
    return get(WALLETS_ENDPOINTS.WITHDRAW_FIAT_COIN_DETAILS(selectedCoinId));
  },
  withdrawFiatSelectCoinPayees: async (selectedCoin: string) => {
    return get(WALLETS_ENDPOINTS.WITHDRAW_FIAT_PAYEES(selectedCoin));
  },
  getFiatCoinDetails: async (id: string) => {
    return get(WALLETS_ENDPOINTS.FIAT_COIN_DETAILS(id));
  },
  getFiatCoinListsList: async (action: any) => {
    return get(WALLETS_ENDPOINTS.FIAT_COINS_LIST(action));
  },
  getShowAssets: async () => {
    return get(WALLETS_ENDPOINTS.SHOW_ASSETS)
  },
  getWalletRecieved: async (coinCode: any, actiontype:string) => {
    return get(WALLETS_ENDPOINTS.WALLET_RECEIVED(coinCode, actiontype))
  },
  saveCrptoWithdraw: async (body: any) => {
    return post(WALLETS_ENDPOINTS.WITHDRAW_CRYPTO, body)
  },
   gotoSummeryPage: async (obj: any) => {
    return post(WALLETS_ENDPOINTS.WITHDRAW_CRYPTO_FEE, obj)
  },
   getCryptoPayees: async (network: any) => {
    return get(WALLETS_ENDPOINTS.CRYPTO_PAYEES(network))
  },
   getWalletsSpendingChartDashboard: async (days:number|string) => {
        return get(WALLETS_ENDPOINTS.SPENDING_CHART(days))
    },
};

export default WalletsService;