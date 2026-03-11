import * as types from "../actionTypes/cardActionsType";

// Set billing address
export const setBillingAddress = (address) => {
  return {
    type: types.SET_BILLING_ADDRESS,
    payload: address,
  };
};

// Set shipping address
export const setShippingAddress = (address) => {
  return {
    type: types.SET_SHIPPING_ADDRESS,
    payload: address,
  };
};

// ===== KYC FORM DATA (User-entered data) =====

// Set complete KYC form data
export const setKycFormData = (data) => {
  return {
    type: types.SET_KYC_FORM_DATA,
    payload: data,
  };
};

// Set individual KYC form field
export const setKycFormField = (fieldData) => {
  return {
    type: types.SET_KYC_FORM_FIELD,
    payload: fieldData,
  };
};

// Reset KYC form data
export const resetKycFormData = () => {
  return {
    type: types.RESET_KYC_FORM_DATA,
  };
};

// ===== KYC API RESPONSE DATA (GET API response) =====

// Set KYC API response data
export const setKycApiResponseData = (data) => {
  return {
    type: types.SET_KYC_API_RESPONSE_DATA,
    payload: data,
  };
};

// Reset KYC API response data
export const resetKycApiResponseData = () => {
  return {
    type: types.RESET_KYC_API_RESPONSE_DATA,
  };
};