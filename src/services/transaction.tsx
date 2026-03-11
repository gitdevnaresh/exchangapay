import { cardsGet, get, put } from '../utils/ApiService';
import { transactionApi, transactionBankApi, cardApi } from '../utils/api';

const TransactionService = {
    getTransactionDetails: async () => {
        const data = await transactionApi.get(`api/v1/Bank/AllBankTransactions/All/?page=1&pageSize=9`);
        return data;
    },

    getTransactionPopupDetails: async () => {
        const data = await transactionBankApi.get(`/api/v1/Bank/AccountDetailsForBank`);
        return data;
    },

    getTransactionDetailsBasedOnId: async (id: any) => {
        const data = await transactionBankApi.get(`api/v1/Bank/transactiondetailspreview/${id}/Digital%20Transfer`);
        return data;
    },
    getTransactionsObjDataBasedOnId: async (id: any) => {
        const { data } = await transactionBankApi.get(`api/v1/Bank/GetTransationDetails/${id}`)
        return data;
    },
    getCurrencyTransactions: async (currency: any) => {
        const data = await transactionBankApi.get(`api/v1/Bank/Transation/${currency}`)
        return data;
    },
    noteSave: async (body: any) => {
        const data = await transactionBankApi.put('api/v1/Bank/NoteSave', body);
        return data;
    },
    getTransactionsUpdates: async (id: any) => {
        const data = await transactionBankApi.get(`api/v1/Bank/StatusHistory/${id}`)
        return data;
    },
    getTransactionsDownload: async (id: any) => {
        const data = await transactionBankApi.get(`api/v1/Bank/TransationDetailsDownload/${id}`)
        return data;
    },
    //neobankapi.azurewebsites.net/api/v1/Bank/Transation/{currency}/{transactiontype}/{pageSize}/{pageNo}/{serach}
    ////https://digitalbankapi.azurewebsites.net/api/v1/ExchangeWallet/M/bank/Transactions/CE06AE8C-B79F-4CA0-88AC-6216A3C51D14
    getAllTransactions: async (customerId: any, page: any, pageSize: any) => {
        return get(`api/v1/ExchangeWallet/M/bank/Transactions/${customerId}?page=${page}&pageSize=${pageSize}`)

    },

    getNeoAllCardsTransactions: async (customerId: any, cardId: string, type: any, page: number, pageSize: number, transactionType: any, currency: any) => {
        if (transactionType === "Account") {
            if (currency) {
                return get(`/api/v1/ExchangeTransaction/M/bank/transaction/${customerId}/${currency}?page=${page}&pageSize=${pageSize}`)
            } else {
                return get(`/api/v1/ExchangeTransaction/M/bank/AccountsOrderHistory/${customerId}/${type}?page=${page}&pageSize=${pageSize}`)
            }
        }
        else if (transactionType === "Cards") {
            if (cardId) {
                return get(`api/v1/ExchangeTransaction/Customer/${customerId}/Card/${cardId}/Transactions/History/${type}?page=${page}&pageSize=${pageSize}`);
            } else {
                return get(`api/v1/ExchangeTransaction/Customer/${customerId}/Card/Transactions/History/${type}?page=${page}&pageSize=${pageSize}`);
            }
        } else if (transactionType === "Crypto") {
            return get(`/api/v1/DashBoard/M/CustomerCryptoTransactions/${customerId}/${type}?page=${page}&pageSize=${pageSize}`)
        } else if (transactionType === "Wallets") {
            return get(`/api/v1/ExchangeTransaction/wallets/transactions/${customerId}/${type}?page=${page}&pageSize=${pageSize}`)
        }
        else {
            return get(`/api/v1/ExchangeTransaction/M/home/transactions/${customerId}/${type}?page=${page}&pageSize=${pageSize}`);
        }
    },
    getRecentTransactions: async (customerId: any, type: any, page: any, pageSize: any, accountType: any, CardId: any, currency: any) => {
        if (accountType === "Account") {
            if (currency) {
                return get(`/api/v1/ExchangeTransaction/M/bank/transaction/${customerId}/${currency}?page=${page}&pageSize=${pageSize}`)
            }
            return get(`/api/v1/ExchangeTransaction/M/bank/AccountsOrderHistory/${customerId}/${type}?page=${page}&pageSize=${pageSize}`)

        } else if (accountType === "Cards") {
            if (CardId) {
                return get(`api/v1/ExchangeTransaction/Customer/${customerId}/Card/${CardId}/Transactions/History/${type}?page=${page}&pageSize=${pageSize}`);
            } else {
                return get(`api/v1/ExchangeTransaction/Customer/${customerId}/Card/Transactions/History/${type}?page=${page}&pageSize=${pageSize}`);
            }
        } else if (accountType === "Crypto") {
            return get(`/api/v1/DashBoard/M/CustomerCryptoTransactions/${customerId}/${type}?page=${page}&pageSize=${pageSize}`)
        } else if (accountType === "Wallets") {
            return get(`/api/v1/ExchangeTransaction/wallets/transactions/${customerId}/${type}?page=${page}&pageSize=${pageSize}`)

        }

        else {
            return get(`/api/v1/ExchangeTransaction/M/home/transactions/${customerId}/${type}?page=${page}&pageSize=${pageSize}`);
        }


    },


    getNonCustodianTransactions: async (type: any, search?: any, cardId?: any) => {

        if (type == "All") {
            // return get(`api/v1/ExchangeTransaction/Customer/Card/Transactions/History/All/null?page=${1}&pageSize=${5}`)
            return get(`api/v1/ExchangeTransaction/Customer/TransactionsHistory/All/All/${""}/${""}?page=${1}&pageSize=${5}`)

        }
        else if (type == "CardsDashboard") {
            return get(`api/v1/transactions?module=Cards&search=null&startDate=&endDate=&status=All&page=${1}&pageSize=${5}`)
        }
        else if (type == "Crypto") {
            return get(`api/v1/transactions?module=Vaults&search=null&startDate=&endDate=&status=All&page=${1}&pageSize=${5}`)
        }
        else if (type == "cards") {
            // return get(`api/v1/ExchangeTransaction/Customer/Card/${cardId}/Transactions/History/All?page=1&pageSize=5`)
            return get(`api/v1/ExchangeTransaction/Customer/CardTransactionsHistory/${cardId}/${"All"}/${""}/${""}?page=${1}&pageSize=${5}`)

        }
        else {
            return get(`api/v1/transactions?module=${type}&search=${search}&startDate=&endDate=&status=All&page=${1}&pageSize=${5}`)
        }
    },
    getWalletTransactiondetails: async (cardId: any) => {
        const data = await cardApi.get(`api/v1/Cards/wallettransactiondetails/${cardId}/10/1`);
        return data;
    },
    getNeoCardsTansactionBasedOnId: async (transactionId: any) => {
        return get(`/api/v1/ExchangeTransaction/M/trsansactionDetails/${transactionId}`);
    },
    getAllRecenetTransactions: async () => {
        const data = await transactionBankApi.get(`api/v1/Bank/CryptoAccountsTranscations`);
        return data;
    },
    getuserAccounts: async (customerId: any) => {
        return get(`api/v1/Customer/Home/DashBoard/${customerId}`)
    },
    getTransactionTypesIcons: async () => {
        // return get(`api/v1/Common/Customer/TransactionTypes`)
        return get(`api/v1/Common/transactionTypeLu`)
    },
    getgraphBar: async () => {
        const data = await transactionBankApi.get(`api/v1/Bank/Graph`);
        return data;
    },
    getAccountViewData: async (currency: any, customerId: any) => {
        return get(`/api/v1/Customer/AccountDetails/${currency}/${customerId}`);
    },
    getVerficationData: async () => {
        return get(`api/v1/security/settings`);
    },
    getDownloadTemplete: async (id: any, type: any) => {
        return get(`/api/v1/transaction/download?id=${id}`)

    },
    graphDetails: async (customerId: any, days: any) => {
        return get(`api/v1/DashBoard/ExchangeDashBoardGraph/${customerId}/${days}`)
    },
    getDaysLookUp: async () => {
        return get(`/api/v1/DashBoard/DaysLu/DashBoardGraph`)

    }, putNote: async (id: any, obj: any) => {
        return put(`/api/v1/ExchangeTransaction/M/Note/${id}`, obj)
    },
    //Bank Graph
    getBankGraph: async (customerId: any, days: any) => {
        return get(`/api/v1/Dashboard/BankDashBoardGraph/${customerId}/${days}`)
    },
    getCardsAllTransactions: async (type: any, currency: any, customerId: any, search: any, page: any, pageSize: any) => {
        return get(`/api/v1/CardsWallet/Cards/Transactions/${type}/${currency}/${customerId}/${search}?page=${page}&pageSize=${pageSize}`)
    },
    getBankAllTransactions: async (search: any, customerId: any, type: any, currency: any, page: any, pageSize: any) => {
        return get(`/api/v1/ExchangeTransaction/bank/transactions/${search}/${customerId}/${type}/${currency}?page=${page}&pageSize=${pageSize}`)
    },
    getAdvertisements: async (type: any) => {
        return get(`/api/v1/Dashboard/GetAdvertisements/${type}`)
    },
    recentPaymentTransctions: async (customerId: any, type: any, search: any, page: any, pageSize: any) => {
        return get(`/api/v1/Merchant/Payments/Transactions/${customerId}/${type}/${search}/?page=${page}&pageSize=${pageSize}`)
    },
    dashboardGraph: async (customerId: any, year: any) => {
        return get(`api/v1/Dashboard/MainDashboardGraph/${customerId}/${year}`)
    },
    getYearsLookUp: async () => {
        return get(`/api/v1/Common//yearsLookUp`)
    },
    cryptoGraph: async (year: any) => {
        return get(`api/v1/Dashboard/VaultsDashboardGraph/${year}`)
    },
    cardsGraph: async (customerId: any, year: any) => {
        return get(`api/v1/Dashboard/CardsDashboardGraph/${customerId}/${year}`)
    },
    getRecentInvoices: async (customerId: any, type: any, page: any, pageSize: any) => {
        return get(`/api/v1/Merchant/PayInPayOutTransaction/${customerId}/${type}?page=${page}&pageSize=${pageSize}`)
    },
    dashboardCustomerincomeGraph: async (selected: any) => {
        return get(`api/v1/Affiliate/customerincomegraph/${selected}`)
    },
    customerintroducerGraph: async (selected: any) => {
        return get(`api/v1/Affiliate/customerintroducer/1Week/${selected}`)
    },
    transactionStatusLu: async () => {
        return get(`api/v1/transactions/lookup`)
    },
    // getAllTransactionsList: async (module: any, search: any, page: any, pageSize: any,) => {
    //     return get(`api/v1/ExchangeTransaction/Customer/Card/Transactions/History/${module}/${search}?page=${page}&pageSize=${pageSize}`)
    // },
    getAllTransactionsList: async (txWallet: any, type: any, fromDate: any, toDate: any, page: any, pageSize: any, screename: any) => {
        if (screename == "MyCards") {
            return get(`api/v1/ExchangeTransaction/Customer/CardTransactionsHistory/${txWallet}/${type}/${fromDate}/${toDate}?page=${page}&pageSize=${pageSize}`)
        } else {
            return get(`api/v1/ExchangeTransaction/Customer/TransactionsHistory/${txWallet}/${type}/${fromDate}/${toDate}?page=${page}&pageSize=${pageSize}`)
        }
    },
   
    memberShipLu: async () => {
        return get(`api/v1/Customer/MembershipLu`)
    },
    cardTransactionTypeLu: async () => {
        return get(`api/v1/Common/cardTransactionTypeLu`)
    },
    getCardsInfo: async () => {
        return get(`api/v1/CardsWallet/CardsInfo`)
    },
    getGenerateTransaction: async (cardId: any, fromDate: any, toDate: any) => {
        return get(`api/v1/ExchangeTransaction/GenerateTransactions/${cardId}/${fromDate}/${toDate}`)
    }, updateConsumtionRating: async (body: any) => {
        return put(`/api/v1/Common/Transactionrating`, body)
    },
    getConsumtionRating: async (transactionId: any) => {
        return get(`/api/v1/Common/TransactionRating/${transactionId}`)
    },
     getCryptobackRewardsAllTransactions:async(state:any,fromDate:any,toDate:any,page:any,pageSize:any)=>{
        return get(`api/v1/CardsWallet/cryptobackTransaction/${state}/${fromDate}/${toDate}?page=${page}&pageSize=${pageSize}`)
    },
    getCashBackLu:async()=>{
        return get(`api/v1/Common/cashBackLu`)
    },
    getReferralTransactions:async(state:any,fromDate:any,toDate:any,page:any,pageSize:any)=>{
        return get(`api/v1/CardsWallet/ReferralTranscation/${state}/${fromDate}/${toDate}?page=${page}&pageSize=${pageSize}`)
    },
    getReferralLu:async()=>{
        return get(`api/v1/Common/referralLu`)
    }

}
export default TransactionService;