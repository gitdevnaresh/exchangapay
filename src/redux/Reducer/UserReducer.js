import * as types from "../Actions/ActionsTypes";

const initialState = {
  userInfo: "",
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.USER_INFO: {
      return {
        ...state,
        userInfo: action.payload
          ? JSON.parse(JSON.stringify(action.payload))
          : action.payload,
      };
    }
    default:
      return state;
  }
};
