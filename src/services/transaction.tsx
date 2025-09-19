import { get } from '../utils/ApiService';
import { transactionApi, transactionBankApi, cardApi } from '../utils/api';

const TransactionService = {
    getTransactionDetails: async () => {
        const params = {
            pageSize: 10,
            page: 1,
        };
        return transactionApi.get(`api/v1/Bank/AllBankTransactions/All/?page=1&pageSize=9`);
    },
    getTransactionPopupDetails: async () => {
        return transactionBankApi.get(`/api/v1/Bank/AccountDetailsForBank`);
    },
    getTransactionDetailsBasedOnId: async (id: any) => {
       return transactionBankApi.get(`api/v1/Bank/transactiondetailspreview/${id}/Digital%20Transfer`);
    },
    getRecentTransactions : async () =>{
        return transactionBankApi.get(`api/v1/Bank/RecentTransations`);
    },
    getTransactionsObjDataBasedOnId : async (id:any)=>{
        return transactionBankApi.get (`api/v1/Bank/GetTransationDetails/${id}`)
    },
    getCurrencyTransactions : async (currency:any)=>{
        return transactionBankApi.get (`api/v1/Bank/Transation/${currency}`)
    },
    noteSave: async (body: any) => {
        return transactionBankApi.put('api/v1/Bank/NoteSave', body);
    },
    getTransactionsUpdates: async (id: any) => {
       return transactionBankApi.get(`api/v1/Bank/StatusHistory/${id}`)
    },
    getTransactionsDownload: async (id: any) => {
       return transactionBankApi.get(`api/v1/Bank/TransationDetailsDownload/${id}`)
    },
//neobankapi.azurewebsites.net/api/v1/Bank/Transation/{currency}/{transactiontype}/{pageSize}/{pageNo}/{serach}
     getAllTransactions : async (currency:any ,transactiontype:any,serach:any,pageSize:any,pageNo:number) => {
        return transactionBankApi.get(`api/v1/Bank/Transation/${currency}/${transactiontype}/${pageSize}/${pageNo}/${serach ||'All'}`)
     },
     getNeoRecentcardsTransactions : async (customerId:any) =>{
        return get(`api/v1/Cards/RecentcardsTransactions/${customerId}/All`);
     },
     getNeoAllCardsTransactions : async (customerId:any ,serach:any,pageSize:any,pageNo:number) =>{
        return get(`api/v1/Cards/CardTransaction/${customerId}/${pageSize}/${pageNo}/${serach ||'All'}`);
     },
     getWalletTransactiondetails: async (cardId:any) =>{
        return get(`api/v1/Cards/wallettransactiondetails/${cardId}/10/1`);
     },
     getNeoCardsTansactionBasedOnId: async (transId:any) =>{
        return get(`api/v1/Cards/CardTransactionDetails/${transId}`);
     },
     getAllRecenetTransactions:async()=>{
        return transactionBankApi.get(`api/v1/Bank/CryptoAccountsTranscations`);
     },
     getuserAccounts:async()=>{
        return transactionBankApi.get(`api/v1/Bank/UserAccountBalances`);
     },
     getgraphBar:async()=>{
        return transactionBankApi.get(`api/v1/Bank/Graph`);
     },
     getCryptoAccountsTranscations:async()=>{
        return transactionBankApi.get(`api/v1/Bank/CryptoAccountsTranscations`);
     },
    
}
export default TransactionService;