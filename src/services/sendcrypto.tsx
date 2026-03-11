import { get, post, put } from "../utils/ApiService";
const SendCryptoServices = {

  getSendCryptoWallets: async (crypto: any) => {
    const data = await get(`api/v1/Wallets/${crypto}`);
    return data;
  },
  getSendCryptoWithdrawWallets: async (crypto: any) => {
    const data = await get(`api/v1/Wallets/${crypto}`);
    return data;
  },
  getSendCryptoPayeeLu: async (customerId: any, coin: any) => {
    const data = await get(`api/v1/ExchangeWallet/Exchange/PayeeLu/${customerId}/${coin}`);
    return data;
  },
  confirmSendCrypto: async (body: any) => {
    const data = await post('api/v1/ExchangeWallet/Crypto/Confirm', body);

    return data;
  },
  confirmSummarrySendCrypto: async (body: any) => {
    const data = await post('api/v1/payees/crypto', body);
    return data;
  },
  confirmSendCryptoPutCall: async (body: any) => {
    const data = await put('api/v1/Common/Payee/Crypto', body);
    return data;
  },
  getCoinNetworkDropdown: async (walletcode: any, customerId: any) => {
    const data = await get(`api/v1/Common/Wallets/NetWorkLU/${walletcode}/${customerId}`);
    return data;
  },
  getWithdrawCryptoCoinList: async (customerId: any) => {
    const data = await get(`api/v1/ExchangeWallet/Exchange/CryptoWallets/${customerId}`);
    return data;
  },
  confirmSummarryFinalSendCrypto: async (body: any) => {
    const data = await post('api/v1/ExchangeTransaction/Withdraw/Crypto', body);
    return data;
  }, isWalletAddressVerified: async ( body: any) => {
    return await post(`/api/v1/Common/M/verifywalletaddress`,body)
  },
  getDepositWallets: async (customerId: any, actiontype: any) => {
    return get(`api/v1/Merchant/Wallets/${customerId}/${actiontype}`)
  },
  getSourceTypes: async () => {
    return get(`api/v1/Common/WalletSources/FirstParty-WalletSource`)
  },
  getThirdPartySourceTypes: async () => {
    return get(`api/v1/Common/WalletSources/ThirdParty-WalletSource`)
  }
}
export default SendCryptoServices;