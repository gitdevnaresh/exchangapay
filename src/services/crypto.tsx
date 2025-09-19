
import { update } from 'lodash';
import { get, post, put } from '../utils/ApiService';
import { marketApi, api, transactionApi, transactionBankApi, coingico, cardApi } from '../utils/api';
import axios from 'axios';
import * as Keychain from "react-native-keychain";


const CryptoServices = {
    getMarketCoins: async () => {
        return marketApi.get(`api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=1000&page=1&sparkline=false%27`);
    },
    getCryptoTotalBalance: async () => {
        return get(`/api/v1/ExchangeWallet/DashBoard/M/WalletInfo`)
    },
    getCryptoCoinsData: async () => {
        return api.get(`api/v1/Wallets/CryptoPortFolio/Exchange`)
    },
    getCryptoTransactions: async () => {
        return transactionBankApi.get(`api/v1/Bank/CryptoTranscations`)
    },
    getAllCryptoTransactions: async () => {
        return transactionApi.get(`api/v1/Transaction/Customers/All/All/All/All/All//?page=1&pageSize=10`)
    },
    getCryptoTransactionsDetails: async (id: any, type: any) => {
        return api.get(`api/v1/Transactions/TemplatesTranction/${id}/${type}`)
    },
    getCryptoTransactionsUpdates: async (id: any) => {
        return transactionBankApi.get(`api/v1/Bank/StatusHistory/${id}`)
    },
    getCryptoTransactionsDownload: async (id: any, type: any) => {
        return transactionBankApi.get(`api/v1/Bank/TransationDetailsDownload/${id}/${type}`)
    },
    saveNotes: async (body: any) => {
        return transactionBankApi.put('api/v1/Bank/SaveNotes', body);
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
        return get(`api/v1/Common/Wallets/NetWorkLU/${coin}`)

    },
    getCardNetworks: async (coinName: string, cardId: any) => {
        return get(`/api/v1/Common/Wallets/NetWorkLU/${coinName}/${cardId}`)

    },
    getCryptoGrphData: async (coinName: string, currency: string, days: number) => {
    },
    getCryptoTransactionsSearch: async (type: any) => {
        return api.get(`api/v1/Transactions/Crypto/Transation/${type}`)
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
    getWithdrawStatus: async (url: string) => {
        return get(url);
    }, makeAuthenticatedGetRequest: async (url: string) => {
        const credentials = await Keychain.getGenericPassword({
            service: "authTokenService",
        });
        const { token } = JSON.parse(credentials.password);
        return axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

}
export default CryptoServices;




















