import * as types from "../actionTypes/withdrawActionsType";

const initialState = {
  formData: {
    sendAmount: "",
    sendCurrency: "",
    receiveAmount: "",
    receiveCurrency: "",
    transferType: "",
    paymentMethod: "",
    beneficiary: "",
  },
  beneficiaryData: null,
  bankInfoData: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.SET_WITHDRAW_FORM_DATA:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };

    case types.CLEAR_WITHDRAW_FORM_DATA:
      return {
        ...state,
        formData: initialState.formData,
        beneficiaryData: null,
        bankInfoData: null,
      };

    case types.SET_BENEFICIARY_DATA:
      return {
        ...state,
        beneficiaryData: action.payload,
      };

    case types.SET_BANK_INFO_DATA:
      return {
        ...state,
        bankInfoData: action.payload,
      };

    default:
      return state;
  }
};
