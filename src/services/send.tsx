import { get, post, put, remove } from "../utils/ApiService";
import { transactionBankApi } from "../utils/api";

const SendServices = {
  emailVerification: async (email: any) => {
    return get(`api/v1/Customer/EmailExist/${email}`);
  },
  phoneVerification: async (body: any) => {
    return post(`api/v1/Customer/PhoneExist`, body);

  },
  bullSwipeIdVerification: async (bullswipeId: any) => {
    return get(`api/v1/Customer/CustomerIdExist/${bullswipeId}`);

  },
  getRelationShipLu: async () => {
    return get(`api/v1/Common/RelationshipWithRecipientLu`)
  },
  getPurposeOfTransferLu: async () => {
    return get(`api/v1/Common/PurposeOfTransferLu`)
  },
  sendFee: async (currency: any) => {
    return get(`api/v1/ExchangeTransaction/InternalTransferfee/${currency}`)
  },
  sendSave: async (body: any) => {
    return post(`api/v1/ExchangeTransaction/Send`, body)
  },
  postReceiveDetails: async (body: any)=>{
    return post(`api/v1/ExchangeTransaction/Send/ReceiverDetails`, body)
  },
  getSendListDetails: async (customerId: any, currency: any) => {
    const data = await get(`api/v1/ExchangeWallet/M/Bank/TransferPayeeLu/${customerId}/${currency}`);
    return data;
  },
  confirmAmountTransfer: async (body: any) => {
    const { data } = await transactionBankApi.post('api/v1/Bank/Account/AccountDetails', body);
    return data;
  },
  getRecentPayees: async () => {
    return get(`api/v1/ExchangeTransaction/SendPayees`);

  },
  sendTransactionStatus: async (id:any) => {
 return get(`api/v1/ExchangeTransaction/M/trsansactionDetails/${id}`);
  },
  removePayee: async (id: string) => {
    return remove(`/api/v1/ExchangeTransaction/DeletePayees/${id}`, {});
  },
  saveEmailVerification:async(body:any)=>{
    return post(`api/v1/Customer/EmailExist`,body);
  },
  rewardsTransactionDetail: async (id:any) => {
return get(`api/v1/CardsWallet/GetcryptobackTransaction/${id}`);
  },
}
export default SendServices;