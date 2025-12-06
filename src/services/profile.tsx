
import axios from "axios";
import { fileget, filepost, get, post, put } from "../utils/ApiService";
import { api } from "../utils/api";
import crashlytics from "@react-native-firebase/crashlytics";
const WEBHOOK_URL = "https://hook.eu2.make.com/glekogomi355qvg7u888kc9rs6clvise";
const ProfileService = {
  uploadFile: async (imgdata: any) => {
    return filepost(`UploadFile`, imgdata);
  },
  uploadSingnitureFile: async (body: any) => {
    return post(`BytesToImageConveter`, body);
  },
  profileAvathar: async (imgdata: any) => {
    return await filepost(`UploadProfile`, imgdata);
  },
  partnerRefferel: async () => {
    try {
      const data: any = await api.get(
        `api/v1/Partner/getReferralDetails/customer`
      );
      return data;
    } catch (error: any) {
      crashlytics().recordError(error);
    }
  },
  updateSecurity: async (security: any) => {
    return put(`api/v1/Master/UpdateSecurity`, security);
  },
  getSeccurityInfo: async () => {
    return get(`api/v1/Security/SecurityInformation`);
  },
  varificationGoogleAuthenticate: async (code: number) => {
    return put(
      `api/v1/Security/VerifyGoogleAuthenticator/${code}`,
      null
    );
  },
  setGoogleAuthenticateSwitch: async () => {
    return put(`api/v1/Security/EnableGoogleAuth`, {});
  },
  setGoogleAuthenticateEnable: async (payload: object) => {
    return put(`api/v1/Security/GoogleAuthenticator`, payload);
  },

  setFaceRecognisationSwitch: async (body: any) => {
    return put(`/api/v1/Security/FaceRecognition`, body);
  },
  setSequrityQuationsSwitch: async (body: any) => {
    return put(`/api/v1/Security/SecurityQuestionsEnable`, body);
  },
  getSecurityQuestions: async () => {
    return get(`api/v1/Common/SecurityQuestionsLu`);
  },
  getProfileEditView: async () => {
    return get(`api/v1/Common/ProfileView`);
  },
  updateProfile: async (custmerId: any, Obj: any) => {
    return put(`api/v1/Common/UpdateProfile/${custmerId}`, Obj);
  },
  getprofileEditLookups: async () => {
    return get(`api/v1/Common/GetProfileControlCodes`);
  },
  getSecurityQuestionsdata: async () => {
    return get(`/api/v1/Security/SecurityQuestions`);
  },
  saveSecurityQuestionsdata: async (body: any) => {
    return post(`/api/v1/Security/SecurityQuestions`, body);
  },
  updateSecurityQuestionsdata: async (body: any) => {
    return put(`/api/v1/Security/UpdateSecurityQuestions`, body);
  },
  deleteAccount: async () => {
    return put(`api/v1/Customer/DeleteCustomer`, {});
  },
  getUserReferral: async () => {
    return get(`/api/v1/Security/getReferralDetails/customer`)
  },
  getAllReferrals: async (ReferralId: any, pageNo: number, pageSize: number) => {
    return get(`api/v1/Customer/referral?referralId=${ReferralId}&page=${pageNo}&pageSize=${pageSize}`)
  }, saveCustomerKycInformation: async (body: any) => {
    return put(`/api/v1/Common/Update/CustomerProfile`, body)
  },
  updateKycDocuments: async (data: any) => {
    return put(`api/v1/Common/CustomerKycUpdate`, data)
  }, updateGoogleAuthenticateSwitch: async (data: any) => {
    return get(`api/v1/Common/TwoFactorAuthentication/${data}`);
  },
  sendUserWebhook: async (userData: any) => {
    const response = await axios.post(WEBHOOK_URL, userData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response
  }, getCasesKPis: async () => {
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
};

export default ProfileService;