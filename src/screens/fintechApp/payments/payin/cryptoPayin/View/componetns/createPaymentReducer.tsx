import { boolean } from "yup";

export const formState = {
    values: {
        merchantId: '',
        invoiceType: 'PaymentLink',
        orderId: '',
        amount: null,
        currency: '',
        networkName: '',
        dueDate:"",
        customerWalletId: "",
    },
    invoiceValues: {
        issuedDate: new Date(),

    },
    lookups: {
        merchantLookup: [],
        typeLookup: [],
        currencyLookup: [],
        networkLookup: []
    },
    isLoading: '',
    errors: null,
    dataLoading: false,
    showPicker: boolean,
    isPreviewModalVisable: boolean,
    isPreviewTemplateVisibile:boolean,
    isPreviewData: {
        invoiceType: "",
        orderId: "",
        amount: "",
        currency: "",
        networkName: "",
        valut: ""
    },
    paymentLinkData: {},
    staticPaymentLoader: boolean,
    isBtnLoading: false,
    templateLoading:false,
    previewTemplate:{}

}
export const CreatePaymentReducer = (state: any, action: any) => {
    state = state || formState;
    switch (action.type) {
      case "setValues":
        return { ...state, values: { ...state.values, ...action.payload } };
      case "setErrors":
        state = { ...state, errors: action.payload };
        return state;
      case "setLookups":
        state = { ...state, lookups: action.payload };
        return state;
      case "setIsLoading":
        state = { ...state, isLoading: action.payload };
        return state;
      case "setDataLoading":
        state = { ...state, dataLoading: action.payload };
        return state;
      case "setInvoiceValues":
        state = {
          ...state,
          invoiceValues: { ...state.invoiceValues, ...action.payload },
        };
        return state;
      case "setShowPicker":
        state = { ...state, showPicker: action.payload };
        return state;
      case "setPreviewModalVisable":
        state = { ...state, isPreviewModalVisable: action.payload };
        return state;
      case "setMerchantName":
        state = { ...state, merchantName: action.payload };
        return state;
      case "setPreviewData":
        return {
          ...state,
          isPreviewData: { ...state.isPreviewData, ...action.payload },
        };
      case "setPaymentLinkData":
        return { ...state, paymentLinkData: action.payload };
      case "setStaticPaymentLoader":
        return { ...state, staticPaymentLoader: action.payload };
      case "setIsBtnLoading":
        return { ...state, isBtnLoading: action.payload };
      case "templateLoading":
        return { ...state, templateLoading: action.payload };
      case "setPreviewTemplateVisibile":
        return { ...state, isPreviewTemplateVisibile: action.payload };
        case "setPreviewTemplate":
        return { ...state, previewTemplate: action.payload };
      default:
        return state;
    }
};