import { get } from '../utils/ApiService';
import { transactionApi } from '../utils/api';

const TransactionService = {
    getTransactionDetails: async () => {
        const params = {
            pageSize: 10,
            page: 1,
        };
        return transactionApi.get(`api/v1/Bank/AllBankTransactions/All/?page=1&pageSize=9`);
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
    
}
export default TransactionService;
