import { filepost, get, post, put } from "../../ApiService";
import { PROFILE_PRIMARY_SERVICE_CONSTANTS } from "./constants";

export const ProfilePrimaryServices = {
  getReferralsList: async (type: any, search: any, page: any, pageSize: any) => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_REFERRALS_LIST(type, search, page, pageSize));
  },
  getStatusLu: async () => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_REFERRALS_LOOKUP);
  },
  getCasesKPis: async () => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_CASES_KPI);
  },
  getCasesList: async (page: any, pageSize: any) => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_CASES_LIST(page, pageSize));
  },
  getAlertCasess: async () => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_CASES_ALERTS);
  },
  getCaseDetails: async (id: any) => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_CASE_DETAILS(id));
  },
  getCaseDetailsMessages: async (id: any) => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_CASE_MESSAGES(id));
  },
  getReferralKPis: async () => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_REFERRALS_KPI);
  },
  getDetailReferralKPis: async (id: string) => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_REFERRERS_KPI(id));
  },
  referralDetails: async (refID: any) => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_REFERRAL_DETAILS(refID));
  },
  referralTransactions: async (refID: any, page: any, pageSize: any) => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_REFERRAL_CUSTOMER(refID, page, pageSize));
  },
  cardsAddressGet: async (page: any, pageSize: any) => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_CUSTOMER_ADDRESSES(page, pageSize));
  },
  cardsAddressPost: async (body: any) => {
    return post(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_CUSTOMER_ADDRESS, body);
  },
  cardsAddressPut: async (body: any) => {
    return put(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_CUSTOMER_ADDRESS, body);
  }, postCasesUploadFiles: async (body: any) => {
    return filepost(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_CASES_UPLOAD_FILE, body);
  }, sendCaseReply: async (id: any, body: any) => {
    return post(PROFILE_PRIMARY_SERVICE_CONSTANTS.API_V1_CASE(id), body);
  }, getGenerateshortlink: async () => {
    return get(PROFILE_PRIMARY_SERVICE_CONSTANTS.GENERATE_SHORT_LINK);
  },
}