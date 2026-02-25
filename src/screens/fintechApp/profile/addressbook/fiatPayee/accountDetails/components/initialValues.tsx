import { useState } from 'react';
import { SEND_CONST } from '../../../crytoPayee/sendConstant';
import { useSelector } from 'react-redux';
import { ADD_RECIPIENT } from '../../../crytoPayee/constant';

export const useAccountLocalState = (props: any) => {
    const [errormsg, setErrormsg] = useState<any>("");
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [createAddressbookListLoading, setAddressbookListLoading] = useState<boolean>(false);
    const [initialDataLoading, setInitialDataLoading] = useState<boolean>(false);
    const [countries, setCountries] = useState([]);
    const [currentCountry, setCurrentCountry] = useState();
    const [countryStates, setCountryStates] = useState();
    const [documentType, setDocumentType] = useState();
    const [walletCode, setWalletCode] = useState([]);
    const [paymentFields, setPaymentFields] = useState<any>([]);
    const [countryCodelist, setCountryCodelist] = useState<any>([]);
    const [payeeEditData, setPayeeEditData] = useState({});
    const [paymentFeildInfo, setPaymentFeildInfo] = useState<any>({});
    const [accountTypesLu, setAccountTypesLu] = useState([]);
    const [paymentFeildsLoader, setPaymentFeildsLoader] = useState<boolean>(false);
    const [fieldsForSelectedCurrency, setFieldsForSelectedCurrency] = useState<any[]>([]);
    const [fieldsForSelectedPaymentType, setFieldsForSelectedPaymentType] = useState<any[]>([]);
    const [bankLookupData, setBankLookupData] = useState([]);
    const [businessType, setBusinessType] = useState<any>();
    const [relationTypes, setRelationTypes] = useState<any>([]);
    const [serviceProviders, setServiceProviders] = useState<any>([]);
    const [dynamicLookupData, setDynamicLookupData] = useState<any>({});
    const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set());
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);

    const [lookUpData, setLookUpData] = useState<any>({});
        const isFirstPartyDisable =
            (userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL && props?.accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS) ||
            (userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS && props?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL);
    const [initValues, setInitValues] = useState({
        favouriteName: "",
        country: "",
        state: "",
        city: "",
        postalCode: "",
        address: "",
        firstName: "",
        lastName: "",
        birthDate: "",
        email: "",
        phoneNumber: "",
        documentType: "",
        currency: "",
        documentNumber: "",
        paymentAccountType: "",
        recipientAccountNumber: "",
        serviceProvider: '',
        recipientEmail: "",
        recipientMobile: "",
        recipientName: "",
        recipientAddress: "",
        recipientLastName: "",
        recipientMiddleName: "",
        recipientFirstName: "",
        remarks: "",
        appName: "Payments",
        pixKeyId: "",
        taxId: "",
        targetName: "",
        targetLastName: "",
        targetEmail: "",
        targetDocument: "",
        targetBankName: "",
        targetBankCode: "",
        targetBankBranchId: "",
        targetBankAccountId: "",
        targetBankId: "",
        accountName: "",
        accountNumber: "",
        accountType: "",
        bankDocumentNumber: "",
        bankTransferCode: "",
        branchId: "",
        bankName: "",
        bankAddress: "",
        bankCountry: "",
        swiftBIC: "",
        branchCode: "",
        localTransferCode: "",
        ibanNumber: "",
        iban:"",
        phoneCode: "",
        dob: "",
        relation: "",
        ukShortCode: "",
        stableCoinPayout:props?.isStableCoinPayout?props?.isStableCoinPayout: false,
        bankBranch: "",
        paymentType: "",
        businessType: "",
        businessRegistrationNo: "",
        frontId: "",
        backId: "",
        addressType: !isFirstPartyDisable ? SEND_CONST.FIRST_PARTY: SEND_CONST.THIRD_PARTY,
        bankcountry: "",
        businessName:"",
        street:"",
        line1:"",
    });
    return {
        errormsg,
        setErrormsg,
        btnDisabled,
        setBtnDisabled,
        loading,
        setLoading,
        createAddressbookListLoading,
        setAddressbookListLoading,
        initialDataLoading,
        setInitialDataLoading,
        countries,
        setCountries,
        currentCountry,
        setCurrentCountry,
        countryStates,
        setCountryStates,
        documentType,
        setDocumentType,
        walletCode,
        setWalletCode,
        paymentFields,
        setPaymentFields,
        fieldsForSelectedCurrency,
        setFieldsForSelectedCurrency,
        fieldsForSelectedPaymentType,
        setFieldsForSelectedPaymentType,
        paymentFeildsLoader,
        setPaymentFeildsLoader,
        countryCodelist,
        setCountryCodelist,
        payeeEditData,
        setPayeeEditData,
        paymentFeildInfo,
        setPaymentFeildInfo,
        accountTypesLu,
        setAccountTypesLu,
        bankLookupData,
        setBankLookupData,
        businessType,
        setBusinessType,
        relationTypes,
        setRelationTypes,
        serviceProviders,
        setServiceProviders,
        dynamicLookupData,
        setDynamicLookupData,
        loadedUrls,
        setLoadedUrls,
        initValues,
        setInitValues,
        lookUpData,
        setLookUpData
    };
};