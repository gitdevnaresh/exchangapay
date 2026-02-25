import { cardsGet, get, put, bankget } from '../ApiService';
import { transactionApi, transactionBankApi, cardApi } from '../../utils/api';

const TransactionService = {
    getTransactionDetails: async () => {
        const data = await transactionApi.get(`api/v1/Bank/AllBankTransactions/All/?page=1&pageSize=9`);
        return data;
    },

    getBankGraph: async (days: any) => {
        return bankget(`/api/v1/banks/summary/transactions?days=${days}`)
    },
    getTransactionPopupDetails: async () => {
        const data = await transactionBankApi.get(`/api/v1/Bank/AccountDetailsForBank`);
        return data;
    },
    getAccountViewData: async (currency: any) => {
        return bankget(`/api/v1/accounts/${currency}?type=All`);
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

    getNonCustodianTransactions: async (type: any, search?: any, cardId?: any,id?:string|null) => {
        const vaultId = "00000000-0000-0000-0000-000000000000"
        if (type == "HomeDashboard") {
            return get(`api/v1/transactions?module=All&search=null&startDate=&endDate=&status=All&page=${1}&pageSize=${5}`)
        }
        else if (type == "Cards") {
            return get(`api/v1/transactions?module=${"Cards"}&search=null&startDate=&endDate=&status=All&vaultId=${vaultId}&page=${1}&pageSize=${5}`)
        }
        else if (type == "Crypto") {
            return get(`api/v1/transactions?module=Vaults&search=null&startDate=&endDate=&status=All&page=${1}&pageSize=${5}`)
        }
        else if (type == "CardsInfo") {
            return cardsGet(`api/v1/cards/${cardId}/transactions?page=1&pageSize=5`)
        }
        else if (type == "Banks") {
            return get(`api/v1/transactions?module=${"Banks"}&search=${search}&startDate=${''}&endDate=${''}&status=${"All"}&vaultId=${vaultId}&page=${1}&pageSize=${5}`)
        }
           else if (type == "Fiat") {
            return get(`api/v1/deposit/fiat/transactions?page=${1}&pageSize=${5}`)
        }
         else if (type == "Exchange") {
            return get(`api/v1/transactions?module=Exchange&search=null&startDate=&endDate=&status=All&vaultId=${vaultId}&action=all&page=${1}&pageSize=${5}`)
        }
              else if (type == "Wallets") {
            return get(`api/v2/m/transactions?module=Wallets&search=null&startDate=&endDate=&status=All&page=${1}&pageSize=${5}`)
        }
            else if (type == "selectCurrenyDetail") {
                if (search=='IDR'||search=='BRL') {
                    return get(`api/v1/wallets/payments/transactions?page=${1}&pageSize=${5}&currency=${search}`)
                }else if(search=='USD'){
                return get(`api/v1/transactions?module=Banks&search=${search}&startDate=&endDate=&status=All&vaultId=00000000-0000-0000-0000-000000000000&action=all&page=${1}&pageSize=${5}`)
                }
                else{
                return get(`api/v1/m/wallet/transactions?page=${1}&pageSize=${5}&currency=${search}&search=null`)
                }
        }
        else if (type == "TeamCardDetail") {
            return get(`api/v1/teams/member/cards/${cardId}/transactions?page=1&pageSize=5`)
        }
              else if   (type == "SelectedBankTransactions"){  
                          return get(`api/v1/transactions?module=Banks&search=${search}&startDate=&endDate=&status=All&vaultId=00000000-0000-0000-0000-000000000000&action=all&page=${1}&pageSize=${5}`)
         
        }
        else {
            return get(`api/v1/transactions?module=${"All"}&search=${search}&startDate=${''}&endDate=${''}&status=${"All"}&vaultId=${vaultId}&page=${1}&pageSize=${5}`)
        }
    },

    getWalletTransactiondetails: async (cardId: any) => {
        const data = await cardApi.get(`api/v1/Cards/wallettransactiondetails/${cardId}/10/1`);
        return data;
    },
    getNeoCardsTansactionBasedOnId: async (transactionId: any) => {
        return get(`/api/v1/transactions/${transactionId}`);
    },
        getSelectedMemberCardTansactionBasedOnId: async (transactionId: any) => {
        return get(`/api/v1/teams/member/${transactionId}/transactions`);
    },
    getAllRecenetTransactions: async () => {
        const data = await transactionBankApi.get(`api/v1/Bank/CryptoAccountsTranscations`);
        return data;
    },
    getuserAccounts: async (customerId: any) => {
        return get(`api/v1/Customer/Home/DashBoard/${customerId}`)
    },

    getgraphBar: async () => {
        const data = await transactionBankApi.get(`api/v1/Bank/Graph`);
        return data;
    },
    //     getAccountViewData: async (currency: any, customerId: any) => {
    //     return get(`/api/v1/Customer/AccountDetails/${currency}/${customerId}`);
    // },
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

    }, putNote: async (obj: any) => {
        return put(`/api/v1/transaction/note`, obj)
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
    CardsSpendingChartGraphdetails: async (year: number | string) => {
        return cardsGet(`api/v1/summary/transactions?days=${year}`)
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
    getAllTransactionsList: async (module: any, search: any, status: any, page: any, pageSize: any, startDate?: any, endDate?: any, vaultId?: any, cardId?: any, currency?: any,id?:string|null) => {
        if (module == "CardsInfo" && cardId) {
            return cardsGet(`api/v1/cards/${cardId}/transactions?page=${page}&pageSize=${pageSize}`)
        }
            if (module == "TeamCardDetail" && cardId) {
            return get(`api/v1/teams/member/cards/${cardId}/transactions?page=${page}&pageSize=${pageSize}`)
        }
        
           if (module == "TeamMemberTransactions" ) {
            return get(`api/v1/teams/member/cards/${cardId}/transactions?page=${page}&pageSize=${pageSize}`)
        }
        
        if (module == "selectCurrenyDetail" && currency) {
            if (currency=='IDR'||currency=='BRL') {
                return get(`api/v1/wallets/payments/transactions?page=${page}&pageSize=${pageSize}&currency=${currency}&search=${search}`)
            }else if(currency=='USD'){
                return get(`api/v1/transactions?module=Banks&search=${search}&startDate=${startDate ?? ''}&endDate=${endDate ?? ''}&status=All&vaultId=00000000-0000-0000-0000-000000000000&action=all&page=${page}&pageSize=${pageSize}`)
            }
            else{
             return get(`api/v1/m/wallet/transactions?page=${page}&pageSize=${pageSize}&currency=${currency}&search=${search}`)
            }
        }
          else if   (module == "SelectedBankTransactions"&&id){
            return get(`api/v1/transactions?module=Banks&search=${search}&startDate=&endDate=&status=All&vaultId=00000000-0000-0000-0000-000000000000&action=all&page=${page}&pageSize=${pageSize}`)
        }
            else if   (module == "Wallets"){
          return get(`api/v2/m/transactions?module=Wallets&search=${search}&startDate=${startDate ?? ''}&endDate=${endDate ?? ''}&status=${status}&page=${page}&pageSize=${pageSize}`)
        }
        return get(`api/v1/transactions?module=${module}&search=${search}&startDate=${startDate ?? ''}&endDate=${endDate ?? ''}&status=${status}&vaultId=${vaultId}&page=${page}&pageSize=${pageSize}`)

    },
    memberShipLu: async () => {
        return get(`api/v1/Customer/MembershipLu`)
    },
    getTeamMemberTransactions: async (memberId: any, type: any, search: any, fromDate: any, toDate: any, page: any, pageSize: any) => {
        return get(`api/v1/teams/members/${memberId}/transactions?type=${type}&search=${search || 'null'}&fromdate=${fromDate}&todate=${toDate}&page=${page}&pageSize=${pageSize}`)
    },
}
export default TransactionService;
