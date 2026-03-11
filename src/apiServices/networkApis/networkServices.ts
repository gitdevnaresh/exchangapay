import { get, post } from "../../utils/ApiService";

export const networkServices = {
  getNetworkKpis: async () => {
    return await get(`api/v1/Affiliate//networkkpi`);
  },
  getMemberList: async (status:any,search:any,page:any,pageSize:any) => {
    return await get(`api/v1/Affiliate/Referrals/${status}/${search}?page=${page}&pageSize=${pageSize}`);
  },
  getMemberStatusLu: async () => {
    return await get(`api/v1/Affiliate//ReferralsStatusLu`);
  },
  getMemberTransactions: async (id:any,page:any,pageSize:any) => {
    return await get(`api/v1/Affiliate/ReferrerTransactions/${id}?page=${page}&pageSize=${pageSize}`);
  },
  getBinaryGenealogyData: async () => {
    return await get(`api/v1/Affiliate/binary`);
  },
  getUniGenealogyData: async () => {
    return await get(`api/v1/Affiliate/uni`);
  },
}