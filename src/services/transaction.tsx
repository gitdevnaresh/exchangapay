import { get } from '../utils/ApiService';

const TransactionService = {
  
    
   
    
     getNeoCardsTansactionBasedOnId: async (transId:any) =>{
        return get(`api/v1/Cards/CardTransactionDetails/${transId}`);
     },
    
}
export default TransactionService;
