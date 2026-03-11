import axios from 'axios';
import { get, post, put, remove } from '../utils/ApiService';
import { getAllEnvData } from '../../Environment';

const OnboardingService = {
  getToken: async (body: any) => {
    const data = await post(`/api/v1/Customer/Token`, body);
    return data
  },
  signupSendEmail: async (body: any) => {
    const data = await post(`/api/v1/Customer/SendEmail`, body);
    return data
  }, resendEmail: async (body: any) => {
    const data = await post(`/api/v1/Customer/ResendEmail`, body);
    return data

  },
  verifyEmailCode: async (body: any) => {
    const data = await post(`/api/v1/Customer/Customer/VerifyEmail`, body);
    return data;

  },
  verifyReferralCode: async (body: any, customerType: any) => {
    const data = post(`api/v1/Customer/CustomerReferral/${customerType}`, body);
    return data;
  },
  register: async (body: any) => {
    const data = await post(`/api/v1/Customer/Register`, body);
    return data

  },
  sendEmail: async (body: any) => {
    const data = post(`api/v1/Customer/SendEmail`, body);
    return data;
  }, getIsrefferalValid: async (body: any, customerType: any) => {
    const data = post(`api/v1/Customer/PersonalCustomerReferral/${customerType}`, body);
    return data;
  }, getCountriesCode: async () => {
    return get(`api/v1/Common/AddressLu`);
  },
  sumsubAccessToken: async (customerId: string, flow: string) => {
    return get(`api/v1/SumSub/AccessToken1?applicantId=${customerId}&levelName=${flow}`)
  },
  getPhoneNumberOtp: async (body: any) => {
    return post(`/api/v1/Customer/CustomerPhoneNumberUpdate`, body)
  },
  auth0SignIn: async (body: any) => {
    return post(`/api/v1/Customer/Token`, body)
  },
  verifyPhoneNumberOtp: async (body: any) => {
    return put(`/api/v1/Customer/OTPPhoneVerification`, body)
  }, loginWithMfa: async (body: any) => {
    return post(`/api/v1/Customer/mfa/Token`, body);
  }, getMfaEnrollment: async (body: any) => {
    return post(`/api/v1/Customer/mfa/associate`, body);
  }, getMfaEnrollmentData: async (mfaToken: string) => {
    const { oAuthConfig } = getAllEnvData();
    const body = { "authenticator_types": ["otp"] };
    try {
      const response = await axios.post(
        `https://${oAuthConfig?.issuer}/mfa/associate`,
        body,
        {
          headers: {
            Authorization: `Bearer ${mfaToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return {
        success: true,
        barcodeUri: response.data // Extract barcode_uri from the API response
      };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error_description || error.message || 'Failed to get MFA enrollment data' };
    }
  }, loginWithMFA: async (
    mfaToken: string,
    otpCode: string
  ) => {
    return await post(`api/v1/Customer/mfa/Token`, {
      mfa_token: mfaToken,
      otp: otpCode,
    });
  },
  countriesList: async () => {
    return get(`api/v1/Common/Countries`);
  },
  submitAffiliate: async (body: any) => {
    return post(`api/v1/Customer/Customer/Affiliate`, body);
  },
  notifyAlert: async () => {
    return get(`api/v1/Common/CustomerNotes`)
  },
  noticeViewed: async (notifyedObj: any) => {
    return post(`api/v1/Common/Notes/Viewed`, notifyedObj)
  },
  countryUpdate: async (country: any) => {
    return put(`api/v1/Customer/UpdateCountry/${country}`)
  },
  getAllConnectedDevices: async () => {
    return get(`/api/v1/Common/Customer/Sessions`)
  },
  changePassword: async (body: any) => {
    return post(`/api/v1/Common/Customer/ChangePassword`, body)
  }, removeDevice: async (id: string) => {
    return remove(`api/v1/Common/Delete/Single/Usersession/${id}`, {})
  },
  ForgetPassword: async (body: any) => {
    return post(`/api/v1/Common/Reset/Password`, body)
  },
  ath0ForgetPassword: async (body: any) => {
    return post(`/api/v1/Customer/Forgotpassword`, body)
  },
  refreshToken: async (body: any) => {
    return post(`/api/v1/Common/Customer/refresh/token`, body)
  }, auth0Signup: async (body: any) => {
    const data = post(`api/v1/Customer/SendEmail`, body);
    return data;
  },
  sumsubCompleted: async () => {
    return get(`api/v1/SumSub/SumsubRecheck`)
  }
}

export default OnboardingService