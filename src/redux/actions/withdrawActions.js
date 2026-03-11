import * as types from "../actionTypes/withdrawActionsType";

export const setBeneficiaryData = (beneficiaryData) => {
  return {
    type: types.SET_BENEFICIARY_DATA,
    payload: beneficiaryData,
  };
};

export const setBankInfoData = (bankInfoData) => {
  return {
    type: types.SET_BANK_INFO_DATA,
    payload: bankInfoData,
  };
};
