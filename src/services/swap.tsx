import { get, post } from '../utils/ApiService';
const SwapService = {
    getPreview: async (coin: any, currency: any, amount: any, isCrypto: any, customerId: any) => {
        return get(`/api/v1/Buysell/Buy/Coins/${coin}/${currency}/${amount}/${isCrypto}/${customerId}`);
    },
    getSwapCoins: async (customerId: any) => {
        return get(`/api/v1/ExchangeWallet/Coins/${customerId}`)
    },
    getToSwapCoinsList: async (coin: any) => {
        return get(`/api/v1/Buysell/SupportedCoinData/${coin}`)
    },
    getCryptoToCryptoCovert: async (fromCoin: any, toCoin: any, fromValue: any, customerId: any, productId: any) => {
        return get(`/api/v1/BuySell/CryptoToCrypto/${fromCoin}/${toCoin}/${fromValue}/${customerId}/${productId}`)
    },
    getSwapSummery: async (fromWalletCode: any, toWalletCode: any, amount: any, customerId: any) => {
        return get(`/api/v1/BuySell/SwapSummery/${fromWalletCode}/${toWalletCode}/${amount}/${customerId}`)
    },
    postSwapcoins:async(body:any)=>{
        return post('/api/v1/Buysell/swap',body)
        }
};

export default SwapService;