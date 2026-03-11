import { get, post } from '../utils/ApiService';

const SellService = {
    getAvailableAssets: async (type: any) => {
        const { data } = await get(`api/v1/Markets/Coins/${type}`);

        return data
    },
    sellCrypto: async (body: any) => {
        const data = await post('api/v1/Buysell/Sell', body);

        return data;
    },
    getSellMemberCoinDetail: async (coin: any) => {
        const data = await get(`api/v1/Buysell/Coins/${coin}`);

        return data;
    },
    convertUnit: async (customerId: any, coinId: any, currency: any, amount: any, isCrypto: any, screenName: any) => {
        // eslint-disable-next-line max-len
        return get(`api/v1/Common/CryptoFiatConverter/${customerId}/${coinId}/${currency}/${amount}/${isCrypto}/${screenName}`);

    },
    getSellMemberFiat: async () => {
        const data = await get(`/api/v1/Wallets/Fiat`);
        return data;
    },
    getSellWallet: async () => {
        const { data } = await get(`/api/v1/Wallets/`);
        return data;
    },
    getSellPreview: async (coin: any, currency = "USD", amount: any, isCrypto: any, customerId: any) => {
        return get(`/api/v1/BuySell/Sell/Coins/${coin}/${currency}/${amount}/${isCrypto}/${customerId}`);
    },
    getAvailableAsset: async (type: any) => {

        const data = await get(`api/v1/Markets/Coins/${type}`);
        return data
    },
    getAvailableSellWallets: async () => {

        const data = await get(`api/v1/Wallets/`);
        return data
    },

};

export default SellService;