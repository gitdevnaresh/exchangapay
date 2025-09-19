import { transactionBankApi } from '../utils/api';

const TransferService = {
    getTransferDetails: async (id:any) => {
      return transactionBankApi.get(`api/v1/Bank/ReceiveFunds/${id}`);
      },  
}
export default TransferService;