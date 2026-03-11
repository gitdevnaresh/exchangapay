import { get, post, put } from "../../utils/ApiService";

export const ReferralServices = {
  EarnList: async () => {
    return await get(`api/v1/CardsWallet/Referral/EarnList`);
  },
  ReferEarnDetails: async (id: any) => {
    return await get(`api/v1/CardsWallet/Referral/Earn/${id}`);
  },
referKpis: async () => {
    return await get(`api/v1/CardsWallet/ReferralCustomer`);
  },
  referralDetails: async () => {
    return await get(`api/v1/CardsWallet/ReferralDetails`);
  },
  getReferralTransactionList:async(state:any,fromDate:any,toDate:any,page:any,pageSize:any)=>{
        return get(`api/v1/CardsWallet/ReferralTranscation/${state}/${fromDate}/${toDate}?page=${page}&pageSize=${pageSize}`)
    },
      referralTransactionDetail: async (id:any) => {
return get(`api/v1/CardsWallet/GetReferralTransaction/${id}`);
  },
    ClimeReferralAmount: async () => {
return put(`api/v1/CardsWallet/Referral/Withdraw`,{});
  },
  socialMediaFlotformsList: async()=>{
    return get(`api/v1/Common/GetCommunications/Platforms`)
  },
  affiliateDetails:async()=>{
    return get(`api/v1/Customer/Affiliated/Customer`)
  }

}

