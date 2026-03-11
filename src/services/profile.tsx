

import { get, put, filepost, fileput, post, fileget } from "../utils/ApiService";
const ProfileService = {

  uploadProfile: async (imgdata: any) => {
    return await filepost(`UploadProfile`, imgdata);
  },
  profileAvathar: async (imgdata: any) => {
    try {
      const data: any = await fileput(`api/v1/Customer/Avatar`, imgdata);
      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  partnerRefferel: async (id: any) => {
    try {
      const data: any = await get(`/api/v1/Security/getReferralDetails/customer/${id}`);
      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  updateSecurity: async (security: any) => {
    try {
      const data: any = await put(`/api/v1/security/settings`, security);

      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  verificationFields: async () => {
    try {
      const data: any = await get(`/api/v1/security/settings`);
      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  ResetPassword: async (customerId: any) => {
    try {
      const data: any = await get(`/api/v1/Security/ResetPWD/${customerId}`);
      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  kycInfo: async (id: any) => {
    try {
      const data: any = await get(`/api/v1/Common/ProfileView/${id}`);
      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  changePassword: async (pass: any) => {
    try {
      const data: any = await put(`api/v1/Customer/ChangePWD`, pass);
      return data;
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  uploadFile: async (imgdata: any) => {
    return filepost(`api/v1/uploadfile`, imgdata);
  },
  UploadFile: async (imgdata: any) => {
    return filepost(`UploadFile`, imgdata);
  },


  getprofileEditLookups: async () => {
    return get(`api/v1/kyc/lookup`);
  },
  getKybDocuments: async () => {
    return get(`api/v1/Common/KybDocumentTypesLu`);
  },
  postKycPersonalInfo: async (obj: any) => {
    return post(`api/v1/kyc`, obj);
  },
  putKycPersonalInfo: async (obj: any) => {
    return post(`api/v1/kyc`, obj);
  },
  postKycProfile: async (obj: any) => {
    return post(`api/v1/kyc`, obj);
  },
  updateKycProfile: async (obj: any) => {
    return put(`api/v1/kyc`, obj);
  },
  identityDocumentsProfile: async (obj: any) => {
    return post(`api/v1/kyc/documents`, obj);
  },
  updateIdentityDocumentsProfile: async (obj: any) => {
    return put(`api/v1/kyc/documents`, obj);
  },
  identityDocumentsDetails: async () => {
    return get(`api/v1/kyc/documents`);
  },
  identityPersionalDetails: async () => {
    return get(`api/v1/kyc`);
  },
  uploadSingnitureFile: async (body: any) => {
    return post(`BytesToImageConveter`, body);
  },
  postKybComnyData: async (obj: any) => {
    return post(`api/v1/kyb`, obj);
  },
  updateKybComnyData: async (obj: any) => {
    return put(`api/v1/kyb/company`, obj);
  },
  kybUbosList: async () => {
    return get(`api/v1/kyb/ubos`);
  },
  kybDirectorsList: async () => {
    return get(`api/v1/kyb/directors`);
  },
  currencyLu: async () => {
    return get(`api/v1/Common/CurrencyLU`);
  },
  postUbosDetails: async (obj: any) => {
    return post(`api/v1/kyb/ubos`, obj);
  },
  postDirectorsDetails: async (obj: any) => {
    return post(`api/v1/kyb/directors`, obj);
  },
  kybkycInfoDetails: async () => {
    return get(`api/v1/kyc/details`);
  },
  kybInfoDetails: async () => {
    return get(`api/v1/kyb/company`);
  },
  KybCompanyDetails: async () => {
    return get(`api/v1/kyb`);
  },
  updateKybUbos: async (obj: any) => {
    return put(`api/v1/kyb/ubos`, obj);
  },
  updateKybDirectrs: async (obj: any) => {
    return put(`api/v1/kyb/directors`, obj);
  },
  updateKycStatus: async (obj: any) => {
    return put(`api/v1/kyc/state`, obj);
  },
  getDocumentTypes: async () => {
    return get(`api/v1/kyc/lookup`);
  },
  getReferralKPis: async () => {
    return get(`api/v1/referrals/kpi`);
  },
  getReferralDetails: async () => {
    return get(`api/v1/Security/getReferralDetails/customer`);
  },
  getsecurityLevelDetails: async () => {
    return get(`api/v1/Security/SecurityInfo`);
  },
  updateCurrencySelection: async (obj: {}) => {
    return put(`api/v1/Customer/customercurrency`, obj);
  },

  updateNickNameDetails: async (obj: {}) => {
    return put(`api/v1/Customer/NickName`, obj);
  },
  getReferralsList: async (type: any, search: any, page: any, pageSize: any) => {
    let url = `api/v1/referrals?status=${type}&search=${search}&startDate=${""}&endDate=${""}&page=${page}&pageSize=${pageSize}`;
    return get(url);
  },
  getStatusLu: async () => {
    return get(`api/v1/referrals/lookup`);
  },
  referralDetails: async (refID: any) => {
    return get(`api/v1/referrals/${refID}`);
  },
  referralTransactions: async (refID: any, page: any, pageSize: any) => {
    return get(`api/v1/referrals/${refID}/transactions/?page=${page}&pageSize=${pageSize}`);

  },
  getCardprivacyControll: async () => {
    return get(`api/v1/Common/CardprivacyControll`)
  },
  updateCardprivacyControllType: async (type: string) => {
    return post(`api/v1/Common/CardprivacyControll/${type}`, {});
  },

  EnableGoogleAuth: async (body: any) => {
    return put(`api/v1/settings/2fa/google/enable`, body)

  },
  kycKybStatus: async (custamerId: any) => {
    return get(`api/v1/Common/M/KycState/${custamerId}`);
  },
  resetPassword: async () => {
    return post(`api/v1/security/password/reset`);

  },
  verifyAuthenticatorCode: async (body: any) => {
    return put(`/api/v1/VerifyGoogleAuthenticator`, body);
  },
  changeEmail: async (body: any) => {
    return post(`api/v1/Customer/SendEmail`, body)
  },
  changePhoneNumber: async (body: any) => {
    return post(`api/v1/Security/Send/OTP`, body)
  },
  verifyPhoneCode: async (body: any) => {
    return post(`/api/v1/Security/VerifyOTP`, body);
  },
  getGoogleAuthentication: async () => {
    return get(`/api/v1/Security/SecurityInfo`);
  },
  enableGoogleAuthentication: async (body: any) => {
    return get(`/api/v1/Common/TwoFactorAuthentication/${body}`,);
  },
  getPaymentProirity: async () => {
    return get(`/api/v1/CardsWallet/GetPaymentPriorityCoins`)
  },
  savePaymentProirity: async (body: any) => {
    return post(`/api/v1/CardsWallet/SavePaymentPriorityCoins`, body)
  }, getSupportOptions: async () => {
    return get(`/api/v1/Common/SupportChatMenuOptions`);
  }, getSupportTopics: async (chatOption: string) => {
    return get(`api/v1/Common/SupportChatDetails/${chatOption}`);
  }, getSupportTopicDetails: async (topicId: string | number) => {
    return get(`api/v1/Common/SupportChatFullDetails/${topicId}`);
  },
  deleteAccount: async (body: any) => {
    return post(`api/v1/Customer/Customer/Delete`, body);
  },
  enableOrdisableAccount: async (body: any) => {
    return put(`api/v1/cardswallet/Account/StatusUpdate`, body);
  },
  ratingLu: async () => {
    return get(`/api/v1/Common/ratingLu`);
  },
  getRating: async () => {
    return get(`/api/v1/Common/rating`);
  },
  postRating: async (body: any) => {
    return put(`/api/v1/Common/rating`, body);
  },
  getApplock: async () => {
    return get(`/api/v1/Common/appLock`);

  },
  updateApplock: async (body: any) => {
    return put(`/api/v1/Common/appLock`, body);
  },
  getRewardsEarnList: async () => {
    return get(`/api/v1/CardsWallet/Cryptoback/EarnLst`);
  },
  getEarnDetails: async (topicId: string | number) => {
    return get(`api/v1/CardsWallet/Cryptoback/Earn/${topicId}`);
  },
  getCryptoBackDetails: async () => {
    return get(`api/v1/CardsWallet/CryptobackDetails`);
  },
  getKpiDetails: async () => {
    return get(`api/v1/CardsWallet/cryptoback`);
  },
  getCasesKPis: async () => {
    return get('api/v1/casemanagement/Customer/Cases/kpi')
  },
  getCasesList: async (page: any, pageSize: any) => {
    return get(`api/v1/casemanagement/Customer/cases?page=${page}&pageSize=${pageSize}`);
  },
  getCaseDetails: async (id: any) => {
    return get(`api/v1/casemanagement/CustomerCase/${id}`);
  },
  getCaseDetailsMessages: async (id: any) => {
    return get(`api/v1/casemanagement/cases/${id}/messages`)
  },
  sendCaseReply: async (id: any, body: any) => {
    return post(`api/v1/casemanagement/cases/${id}/message`, body)
  },
  getCasesUploadFiles: async (id: any) => {
    return fileget(`api/v1/casemanagement/filePreview/${id}`)
  },
  casesReplyUploadFile: async (body: any) => {
    return filepost(`v1/casesuploadfile`, body)
  },
  getAlertCasess: async () => {
    return get(`api/v1/casemanagement/Customercases/alerts`)
  },
   withDrawReward: async () => {
    return put(`api/v1/CardsWallet/withdrawCashBack`,{})
  },
  getPersonalInformation:async()=>{
    return get(`api/v1/Common/ProfileView`)
  },
  //security google athenticator apis
 enableAthenticator:async()=>{
    return post(`api/v1/Common/MFA/enable`,{})
  },
verifyAthenticatorCode:async(body:any)=>{
    return post(`api/v1/Common/Verfiy/MfaEnrollment`,body)
  },
getAthenticatorEnableOrNot:async()=>{
    return get(`api/v1/Common/MFA`)
  },
aathenticatorDisable:async( body:any)=>{
    return post(`api/v1/Common/Disable/Mfa/Authentication`,body)
  },
mfaDevices:async()=>{
    return get(`api/v1/Common/GetMfAResponse`)
  },
  // Low balance Alert apis
  getLowbalanceAlert: async () => {
    return get(`api/v1/Customer/GetLowbalancealert`)
  },
  saveLowbalanceAlert: async (body: any) => {
    return post(`api/v1/Customer/SaveLowbalancealert`, body)
  },

}
export default ProfileService;