import { get, post } from "../utils/ApiService";

// N-01: the `api` instance this module used pointed at
// neowalletapi.azurewebsites.net, which is NXDOMAIN. Every `api.*` call below
// is now the same path on the live, certificate-pinned first-party host.

const SendCryptoServices = {

  getSendCryptoWallets: async (crypto: any) => {
    return get(`api/v1/Wallets/${crypto}`);
  },
  getSendCryptoWithdrawWallets: async (crypto: any) => {
    return get(`api/v1/Wallets/${crypto}`);
  },
  getSendCryptoPayeeLu: async (coin: any) => {
    return get(`api/v1/addressbook/PayeeCryptoLu/${coin}`);
  },
  confirmSendCrypto: async (body: any) => {
    return post('api/v1/ExchangeTransaction/Withdraw/Crypto', body);
  },
  confirmSummarrySendCrypto: async (body: any) => {
    return post('api/v1/addressbook/Crypto', body);
  },
  getCoinNetworkDropdown: async () => {
    return get('api/v1/Markets/Coins/network');
  },
  getWithdrawCryptoCoinList: async () => {
    return get(`api/v1/ExchangeWallet/Deposit/CryptoWallets`);
  },
  confirmSummarryFinalSendCrypto: async (body: any) => {
    return post('api/v1/Withdraw/Withdraw/Crypto', body);
  },
  getSendCryptoHash: async (transId: any) => {
    return get(`api/v1/ExchangeTransaction/WithdrawCryptoHash/${transId}`);
  },
}
export default SendCryptoServices;