
import { get, post, cardsGet } from "../../ApiService";
import { EXCHANGE_ENDPOINTS, ACTION_TYPES } from '../constants/exchangeConstants';

const ExchangeWalletService = {
  getShowAssets: async () => {
    return get(EXCHANGE_ENDPOINTS.WALLET.ASSETS);
  },
  
  // getWalletRecieved: async (coinCode: any, actiontype: string) => {
  //   return get(`${EXCHANGE_ENDPOINTS.WALLET.VAULTS}/${coinCode}/crypto/${actiontype}`);
  // },
   getWalletRecieved: async (coinCode: any, actiontype:string) => {
    return get(`/api/v1/Vaults/wallets/${coinCode}/crypto/${actiontype}`)
  },
  // getCryptoPayees: async (network: any) => {
  //   return get(`${EXCHANGE_ENDPOINTS.WALLET.CRYPTO_PAYEES}?netWork=${network}&search=null`);
  // },
   getCryptoPayees: async (network: any) => {
    return get(`api/v1/payees/crypto?netWork=${network}&search=null`)
  },
  // gotoSummeryPage: async (obj: any) => {
  //   return post(EXCHANGE_ENDPOINTS.WALLET.WITHDRAW_FEE, obj);
  // },
  // gotoSummeryPage: async (obj: any) => {
  //   return post(`api/v1/withdraw/crypto/fee`, obj)
  // },
  gotoSummeryPage: async (obj: any) => {
    return post(`api/v1/withdraw/crypto/fee`, obj)
  },
  getCoins: async (cardId: any) => {
    return cardsGet(`api/v1/cards/walletcode/${cardId}`);
  },
    getNetWorkLookUp: async (coin: any) => {
    return get(`/api/v1/Common/Wallets/NetWorksLu/${coin}`)
  },
    getNetworkLookup: async (coin: any, cardId: any) => {
    return cardsGet(`api/v1/cards/networks/${coin}/Card/${cardId}`)
  },
    gotoExchangeSummeryPage: async (screenName: string, obj: any) => {
    if (screenName === "cardsCrypto") {
      return post(`/api/v1/ExchangeWallet/Wallets/Crypto/Confirm`, obj)
    }
    return post(`/api/v1/ExchangeWallet/Crypto/Confirm`, obj);
  },
   getAllCryptoPayees: async (customerId: any, walletCode: any) => {
    return get(`/api/v1/Common/PayeeCryptoLU/${customerId}/${walletCode}`)
  },
    saveCrptoWithdraw: async (body: any) => {
    return post(`api/v1/withdraw/crypto`, body)
  },
};

export default ExchangeWalletService;