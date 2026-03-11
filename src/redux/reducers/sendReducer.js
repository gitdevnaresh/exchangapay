import * as types from "../actionTypes/sendActionsType";

const initialState = {
    email: "",
    phoneNumber: "",
    phoneCode: "",
    bullSwipeId: "",
    toFromReceive: false,
    isHighlightedWithdraw: false,
    myCardsInfo: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case types.SET_SEND_EMAIL_ADDRESS:
            return {
                ...state,
                email: action.payload,
            };

        case types.SET_SEND_PHONE_ADDRESS_ADDRESS:
            return {
                ...state,
                phoneNumber: action.payload,
            };
        case types.SET_SEND_PHONE_CODE_ADDRESS_ADDRESS:
            return {
                ...state,
                phoneCode: action.payload,
            };
        case types.SET_SEND_BULLSWIPE_ID:
            return {
                ...state,
                bullSwipeId: action.payload,
            };
        case types.SET_FROM_RECEIVE:
            return {
                ...state,
                toFromReceive: action.payload,
            };
        case types.SET_HIGHLIGHTED_WITHDRAW:
            return {
                ...state,
                isHighlightedWithdraw: action.payload,
            };
        case types.SET_MY_CARDS_INFO:
            return {
                ...state,
                myCardsInfo: action.payload,
            };
        default:
            return state;
    }
};