import * as types from "./ActionsTypes";
export const setUserInfo = (payload) => {
  return async (dispatch) => {
    dispatch({ type: types.USER_INFO, payload: payload });
  };
};
