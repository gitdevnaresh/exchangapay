import * as types from "../actionTypes/cardActionsType";

const initialKycFormData = {
  // Screen 1: Personal & Address Information
  firstName: "",
  lastName: "",
  addressLine1: "",
  addressLine2: "",
  country: "",
  city: "",
  pincode: "",
  dob: null,
  
  // Screen 2: Contact Information
  phoneCode: "",
  phoneNumber: "",
  email: "",
  
  // Screen 3: Financial Information
  employmentStatus: "",
  occupation: "",
  annualSalary: "",
  estimatedMonthlyValue: "",
};

const initialKycApiResponseData = {
  // Screen 1: Personal & Address Information
  firstName: "",
  lastName: "",
  addressLine1: "",
  addressLine2: "",
  country: "",
  city: "",
  pincode: "",
  dob: null,
  
  // Screen 2: Contact Information
  phoneCode: "",
  phoneNumber: "",
  email: "",
  
  // Screen 3: Financial Information
  employmentStatus: "",
  occupation: "",
  annualSalary: "",
  estimatedMonthlyValue: "",
};

const initialState = {
  billingAddress: null,
  shippingAddress: null,
  // User-entered form data (across all 3 screens)
  kycFormData: initialKycFormData,
  // API response data (stores GET API response)
  kycApiResponseData: initialKycApiResponseData,
};

export default (state = initialState, action) => {
  switch (action.type) {  
    case types.SET_BILLING_ADDRESS:
      return {
        ...state,
        billingAddress: action.payload,
      };
    
    case types.SET_SHIPPING_ADDRESS:
      return {
        ...state,
        shippingAddress: action.payload,
      };

    // ===== KYC FORM DATA (User-entered data) =====
    case types.SET_KYC_FORM_DATA:
      const payload = { ...action.payload };
      if (payload.dob instanceof Date) {
        payload.dob = payload.dob.toISOString();
      }
      return {
        ...state,
        kycFormData: {
          ...state.kycFormData,
          ...payload,
        },
      };

    case types.SET_KYC_FORM_FIELD:
      const fieldPayload = { ...action.payload };
      if (fieldPayload.dob instanceof Date) {
        fieldPayload.dob = fieldPayload.dob.toISOString();
      }
      return {
        ...state,
        kycFormData: {
          ...state.kycFormData,
          ...fieldPayload,
        },
      };

    case types.RESET_KYC_FORM_DATA:
      return {
        ...state,
        kycFormData: initialKycFormData,
      };

    // ===== KYC API RESPONSE DATA (GET API response) =====
    case types.SET_KYC_API_RESPONSE_DATA:
      const apiPayload = { ...action.payload };
      if (apiPayload.dob instanceof Date) {
        apiPayload.dob = apiPayload.dob.toISOString();
      }
      return {
        ...state,
        kycApiResponseData: {
          ...state.kycApiResponseData,
          ...apiPayload,
        },
      };

    case types.RESET_KYC_API_RESPONSE_DATA:
      return {
        ...state,
        kycApiResponseData: initialKycApiResponseData,
      };

    default:
      return state;
  }
}; 