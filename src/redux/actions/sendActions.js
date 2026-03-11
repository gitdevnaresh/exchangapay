import * as types from "../actionTypes/sendActionsType";

export const setSendPhoneAddress = (phoneNumber) => {
  return {
    type: types.SET_SEND_PHONE_ADDRESS_ADDRESS,
    payload: phoneNumber,
  };
};
export const setSendPhoneCodeAddress = (phoneCode) => {
  return {
    type: types.SET_SEND_PHONE_CODE_ADDRESS_ADDRESS,
    payload: phoneCode,
  };
};

export const setSendEmailAddress = (email) => {
  return {
    type: types.SET_SEND_EMAIL_ADDRESS,
    payload: email,
  };
};
export const setBullSwipeIdAddress = (bullswipeId) => {
  return {
    type: types.SET_SEND_BULLSWIPE_ID,
    payload: bullswipeId,
  };
};
  export const setFromReceive = (toFromReceive) => {
  return {
    type: types.SET_FROM_RECEIVE,
    payload: toFromReceive,
  };
  };
    export const setHelightedWithdraw = (isHighlightedWithdraw) => {
  return {
    type: types.SET_HIGHLIGHTED_WITHDRAW,
    payload: isHighlightedWithdraw,
  };
  };
   export const setMyCardsInfo = (myCardsInfo) => {
  return {
    type: types.SET_MY_CARDS_INFO,
    payload: myCardsInfo,
  };
  };