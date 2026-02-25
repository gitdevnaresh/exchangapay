import { get, put, filepost, fileput, post, bankget, cardsGet, rewardsget, rewardspost } from "../ApiService";
import { PROFILE_CONSTANTS } from "./constants";

const ProfileService = {
  uploadProfile: async (imgdata: any) => {
    return await filepost(PROFILE_CONSTANTS.UPLOAD_PROFILE, imgdata);
  },
  profileAvathar: async (imgdata: any) => {
    try {
      return await fileput(PROFILE_CONSTANTS.CUSTOMER_AVATAR, imgdata);
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },


  ResetPassword: async (customerId: any) => {
    try {
      return await get(PROFILE_CONSTANTS.SECURITY_RESET_PWD(customerId));
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  kycInfo: async (id: any) => {
    try {
      return await get(PROFILE_CONSTANTS.PROFILE_VIEW(id));
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  changePassword: async (pass: any) => {
    try {
      return await put(PROFILE_CONSTANTS.CUSTOMER_CHANGE_PWD, pass);
    } catch (error: any) {
      // crashlytics().recordError(error);
    }
  },
  uploadFile: async (imgdata: any) => {
    return filepost(PROFILE_CONSTANTS.UPLOAD_FILE, imgdata);
  },
  getprofileEditLookups: async () => {
    return get(PROFILE_CONSTANTS.KYC_LOOKUP);
  },
  getKybDocuments: async () => {
    return get(PROFILE_CONSTANTS.KYB_DOCUMENT_TYPES);
  },
  postKycPersonalInfo: async (obj: any) => {
    return post(PROFILE_CONSTANTS.KYC, obj);
  },
  putKycPersonalInfo: async (obj: any) => {
    return post(PROFILE_CONSTANTS.KYC, obj);
  },
  postKycProfile: async (obj: any) => {
    return post(PROFILE_CONSTANTS.KYC, obj);
  },
  postBankKycProfile: async (obj: any) => {
    return post(PROFILE_CONSTANTS.CUSTOMER_ADDRESS, obj);
  },
  updateKycProfile: async (obj: any) => {
    return put(PROFILE_CONSTANTS.KYC, obj);
  },
  identityDocumentsProfile: async (obj: any) => {
    return post(PROFILE_CONSTANTS.KYC_DOCUMENTS, obj);
  },
  updateIdentityDocumentsProfile: async (obj: any) => {
    return put(PROFILE_CONSTANTS.KYC_DOCUMENTS, obj);
  },
  identityDocumentsDetails: async () => {
    return get(PROFILE_CONSTANTS.KYC_DOCUMENTS);
  },
  identityPersionalDetails: async () => {
    return get(PROFILE_CONSTANTS.KYC);
  },
  uploadSingnitureFile: async (body: any) => {
    return post(PROFILE_CONSTANTS.BYTES_TO_IMAGE, body);
  },
  postKybComnyData: async (obj: any) => {
    return post(PROFILE_CONSTANTS.KYB, obj);
  },
  updateKybComnyData: async (obj: any) => {
    return put(PROFILE_CONSTANTS.KYB_COMPANY, obj);
  },
  kybUbosList: async () => {
    return get(PROFILE_CONSTANTS.KYB_UBOS);
  },
  kybDirectorsList: async () => {
    return get(PROFILE_CONSTANTS.KYB_DIRECTORS);
  },
  postUbosDetails: async (obj: any) => {
    return post(PROFILE_CONSTANTS.KYB_UBOS, obj);
  },
  postDirectorsDetails: async (obj: any) => {
    return post(PROFILE_CONSTANTS.KYB_DIRECTORS, obj);
  },
  postShareHoldersDetails: async (obj: any) => {
    return post(PROFILE_CONSTANTS.KYB_SHAREHOLDER, obj);
  },
  updateShareHoldersDetails: async (obj: any) => {
    return put(PROFILE_CONSTANTS.KYB_SHAREHOLDER, obj);
  },
  postRepresentiveDetails: async (obj: any) => {
    return post(PROFILE_CONSTANTS.KYB_REPRESENTATIVE, obj);
  },
  updateRepresentiveDetails: async (obj: any) => {
    return put(PROFILE_CONSTANTS.KYB_REPRESENTATIVE, obj);
  },
  kybkycInfoDetails: async () => {
    return get(PROFILE_CONSTANTS.KYC_DETAILS);
  },
  kycInfoDetails: async (programId: string) => {
    return bankget(PROFILE_CONSTANTS.BANKS_KYC_REQUIREMENTS(programId));
  },
  kycAddresses: async () => {
    return cardsGet(PROFILE_CONSTANTS.ADDRESSES);
  },
  kybInfoDetails: async () => {
    return get(PROFILE_CONSTANTS.KYB_COMPANY);
  },
  KybCompanyDetails: async () => {
    return get(PROFILE_CONSTANTS.KYB);
  },
  updateKybUbos: async (obj: any) => {
    return put(PROFILE_CONSTANTS.KYB_UBOS, obj);
  },
  updateKybDirectrs: async (obj: any) => {
    return put(PROFILE_CONSTANTS.KYB_DIRECTORS, obj);
  },
  updateKycStatus: async (obj: any) => {
    return put(PROFILE_CONSTANTS.KYC_STATE, obj);
  },
  getDocumentTypes: async () => {
    return get(PROFILE_CONSTANTS.KYC_LOOKUP);
  },
  EnableGoogleAuth: async (body: any) => {
    return put(PROFILE_CONSTANTS.SETTINGS_2FA_GOOGLE, body);
  },
  kycKybStatus: async (custamerId: any) => {
    return get(PROFILE_CONSTANTS.KYC_KYB_STATE(custamerId));
  },

  verifyAuthenticatorCode: async (body: any) => {
    return put(PROFILE_CONSTANTS.VERIFY_GOOGLE_AUTHENTICATOR, body);
  },

  getCasesUploadFiles: async (id: any) => {
    return get(PROFILE_CONSTANTS.FILE_PREVIEW(id));
  },
  postPushNotification: async (body: any) => {
    return post(PROFILE_CONSTANTS.PUSH_TOKEN, body);
  },
  deletePushNotifications: async (body: any) => {
    return post(PROFILE_CONSTANTS.DELETE_TOKEN, body);
  },
  signin: async (body: any) => {
    return post(PROFILE_CONSTANTS.TOKEN, body);
  },
  forgotPassword: async (body: any) => {
    return post(PROFILE_CONSTANTS.FORGOT_PASSWORD, body);
  },
  signup: async (body: any) => {
    return post(PROFILE_CONSTANTS.REGISTER, body);
  },

  getScreenPermissions: async (id: any) => {
    return get(PROFILE_CONSTANTS.API_V1_SECURITY_PERMISIIONS(id));
  },
}

export default ProfileService;