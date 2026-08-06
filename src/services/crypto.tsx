
import { update } from 'lodash';
import { get, post, put } from '../utils/ApiService';
import { marketApi } from '../utils/api';

// N-01: `api` (neowalletapi.azurewebsites.net) and `transactionApi`
// (neowalletgrid.azurewebsites.net) both pointed at hosts that are NXDOMAIN,
// so every call through them failed. Same paths, live pinned host.
// marketApi (CoinGecko) resolves and stays where it is — it must keep its
// third-party interceptor stack, which withholds the bearer token.


const CryptoServices = {
    getMarketCoins: async () => {
        return marketApi.get(`api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=1000&page=1&sparkline=false%27`);
    },
    getCryptoTotalBalance: async () => {
        return get(`/api/v1/ExchangeWallet/DashBoard/M/WalletInfo`)
    },
    getCryptoCoinsData: async () => {
        return get(`api/v1/Wallets/CryptoPortFolio/Exchange`)
    },
    getAllCryptoTransactions: async () => {
        return get(`api/v1/Transaction/Customers/All/All/All/All/All//?page=1&pageSize=10`)
    },
    getCryptoTransactionsDetails: async (id: any, type: any) => {
        return get(`api/v1/Transactions/TemplatesTranction/${id}/${type}`)
    },
    getCryptoWallets: async () => {
        return get(`/api/v1/ExchangeWallet/CryptoWallets`)
    },
    getCryptoReceive: async () => {
        return get(`/api/v1/ExchangeWallet/Withdraw/CryptoWallets`)
    },
    getExchangaCards: async () => {
        return get(`api/v1/CardsWallet/CardsInfo`)
    },
    getCryptoDeposit: async (coinName: any, network: string) => {
        return get(`api/v1/ExchangeWallet/DepositCrypto/${coinName}/${network}`)
    },
    getCommonCryptoNetworks: async (coin: string) => {
        return get(`api/v1/Common/Wallets/NetWorksLU/${coin}`)

    },
    getCardNetworks: async (coinName: string, cardId: any) => {
        return get(`/api/v1/Common/Wallets/NetWorkLU/${coinName}/${cardId}`)

    },
    getCryptoGrphData: async (coinName: string, currency: string, days: number) => {
    },
    getCryptoTransactionsSearch: async (type: any) => {
        return get(`api/v1/Transactions/Crypto/Transation/${type}`)
    }, getCurrencyLookup: async () => {
        return get(`api/v1/CardsWallet/CurrencyLookUp`)
    }, putCurrency: async (currency: any) => {
        return put(`api/v1/Customer/CustomerCurrency/${currency}`)
    },
    saveFeedback: async (body: any) => {
        return post(`/api/v1/Common/Customer/Feedback`, body)
    },
    getCryptoWithdrawFee: async (netWorkId: any, sendAmount: any) => {
        return get(`/api/v1/ExchangeWallet/Customer/EstimateWithdrawFee/${netWorkId}/${sendAmount}`)
    },
    getCommonNetworks: async (coinName: string, customerId: any, cardId: any) => {
        return get(`api/v1/Common/Wallets/NetWorkLU/${coinName}/${customerId}/Card/${cardId}`);
    },
    isMFAVerified: async () => {
        return get(`/api/v1/Common/TwoFactorVerficationData`)
    }, getSecurityDetails: async () => {
        return get(`api/v1/Security/SecurityInfo`)
    },
    getTwoFactorAuthenticationURL: async () => {
        return get(`/api/v1/Common/TwoFactorAuthenticationCodeState`)
    }, updateTwoFactorAuthentication: async (body: any) => {
        return post(`api/v1/Common/TwoFactorAuthenticationURL`, body)
    },
    /**
     * H-10: read the 2FA challenge result.
     *
     * `query` is the query string the WebView callback landed with — validated by
     * matchTwoFactorCallback() in src/security/webViewUrlPolicy.ts, which returns
     * a query and never a URL. The host and path are fixed here, so the bearer
     * token can only ever go to this build's own API.
     *
     * This replaces makeAuthenticatedGetRequest(url) and getWithdrawStatus(url),
     * both of which took a caller-supplied URL: the first read the token out of
     * the Keychain and attached it to a raw axios GET against whatever it was
     * given. Do not reintroduce that shape — a URL argument is what turned a
     * redirect into an account takeover.
     */
    getTwoFactorAuthenticationCodeState: async (query: string = "") => {
        return get(`/api/v1/Common/TwoFactorAuthenticationCodeState${query}`)
    }

}
export default CryptoServices;



















