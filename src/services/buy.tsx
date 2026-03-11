import { get, paymentGet, post, put } from '../utils/ApiService';
import { CRYPTO_SERVICE_CONSTANTS } from './serviceConstants';
const BuyService = {
  getAvailableAssets: async (type: any) => {

    const { data } = await get(`api/v1/Markets/Coins/${type}`);

    return data
  },
  buyCrypto: async (body: any) => {

    return post('api/v1/Buysell/Buy', body);

  },
  getMemberCoinDetail: async (customerId: any, coin: any) => {
    const data = await get(`/api/v1/Common/Coins/${customerId}/${coin}`);

    return data;
  },
  convertUnit: async (customerId: any, coinId: any, currency: any, amount: any, isCrypto: any, screenName: any) => {

    return get(`api/v1/Common/CryptoFiatConverter/${customerId}/${coinId}/${currency}/${amount}/${isCrypto}/${screenName}`);

  },
  getMemberFiat: async (customerId: any, appName: any) => {
    return get(`/api/v1/ExchangeWallet/Exchange/FiatWallets/${customerId}/${appName}`);
  },
  getPreview: async (coin: any, currency: any, amount: any, isCrypto: any, customerId: any) => {
    return get(`/api/v1/Buysell/Buy/Coins/${coin}/${currency}/${amount}/${isCrypto}/${customerId}`);
  },
  getAvailableAsset: async (customerId: any) => {
    return get(`api/v1/ExchangeWallet/Coins/${customerId}`);

  }, getAllCoins: async (customerId: any) => {
    return get(`/api/v1/ExchangeWallet/Wallets/DepositCrypto/${customerId}`)
  },
  getCryptoTosell: async (customerId: any) => {
    return get(`api/v1/BuySell/sell/${customerId}`)
  },
  getNetWork: async (customerId: any, coin: any) => {
    return get(`api/v1/ExchangeWallet/Wallets/DepositCrypto/${customerId}/${coin}`)
  },
  saveWallet: async (body: any) => {
    return post(`/api/v1/ExchangeWallet/AddWallet/DepositCrypto`, body)
  },
  getProviders: async () => {
    return get(`/api/v1/BuySell/providers`)
  },
  getWithdrawCryptoCoinList: async (customerId: any) => {
    return get(`api/v1/ExchangeWallet/Exchange/CryptoWallets/${customerId}`);
  },
  confirmSummarrySendCrypto: async (body: any) => {
    return post('api/v1/Common/Payee/Crypto', body);
  },
  confirmSendCryptoPutCall: async (body: any) => {
    return put('api/v1/Common/Payee/Crypto', body);
  },
  isWalletAddressVerified: async (body: any) => {
    return await post(`/api/v1/Common/M/verifywalletaddress`, body)
  },
  getCoinNetworkDropdown: async (walletcode: any, customerId: any) => {
    return await get(`api/v1/Common/Wallets/NetWorkLU/${walletcode}/${customerId}`);

  }, getWeb3MemberInfo: async (address: any) => {
    return await get(`api/v1/Customer/customerCreation/${address}`);

  },
  getAvailableBalance: async (customerId: any, appName: string) => {
    return get(`${"api/v1/DashBoard/Crypto/"}${customerId}/${appName}`);
  },
  getCryptoCoins: async (customerId: any, appName: any) => {
    return get(`/api/v1/ExchangeWallet/Coins/${customerId}/${appName}`)
  }, getShowAssets: async () => {
    return get(`api/v1/vaults/crypto`)
  },
  getsellCoins: async (customerId: any, appName: any) => {
    return get(`${CRYPTO_SERVICE_CONSTANTS?.API_V1_BUYSELL_SELL}${customerId}/${appName}`)
  },
  getWithdrawCoins: async (customerId: any, appName: any) => {
    return get(`${CRYPTO_SERVICE_CONSTANTS?.API_V1_EXCHNAGE_WALLETE_WITHDRAW_CRYPTO_WALLETS}/${customerId}/${appName}`)
  },
  getBuyCoins: async (customerId: any) => {
    return get(`/api/v1/Buysell/Buy/${customerId}`)
  },
  getBuyConvertedCoins: async (customerId: any,coin:any) => {
    return get(`/api/v1/Buysell/buy/FiatWallets/${customerId}/${coin}`)
  },
  getSellCoins: async (customerId: any) => {
    return get(`/api/v1/Buysell/sell/${customerId}`)
  },
  getSellConvertedCoins: async (customerId: any,coin:any) => {
    return get(`/api/v1/Buysell/buy/FiatWallets/${customerId}/${coin}`)
  },
  getCurrencyWithNetwork: async (type:any) => {
    return paymentGet(`/api/v1/payouts/merchant?type=${type}`);
  }
};
export default BuyService;