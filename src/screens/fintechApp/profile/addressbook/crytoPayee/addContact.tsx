
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { View, TouchableOpacity, Modal, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import Container from '../../../../../components/container/container';
import { s } from '../../../../../constants/styels/scale';
import { Field, Formik } from 'formik';
import { formatDateTimeAPI, isErrorDispaly } from '../../../../../utils/helpers';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import CustomPickerAcc from '../../../../../components/customPicker/CustomPicker';
import InputDefault from "../../../../../components/textInputComponents/DefaultFiat";
import AddressbookService from '../../../../../apiServices/profile/general/addressbook';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { setScreenInfo } from '../../../../../redux/actions/actions';
import TextInputWithChaild from "../../../../../components/textInputComponents/textInputWithChaild/textInputWithChaild";
import QrScanner from '../../../../../components/scanner/scanner';

import { SEND_CONST } from './sendConstant';
import { validationSchema } from './addContactSchema';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ButtonComponent from '../../../../../components/buttons/button';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import ViewComponent from '../../../../../components/view/view';
import { showAppToast } from '../../../../../components/toasterMessages/ShowMessage';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useHardwareBackHandler } from '../../../../../hooks/backHandleHook';
import ProofVerification from './sathoshiTest';
import DashboardLoader from '../../../../../components/loader';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import { logEvent } from '../../../../../hooks/loggingHook';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';
import ScannerIcon from '../../../../../components/svgIcons/mainmenuicons/scaner';
import RecipientDetails from './recipientsDetails';
import { ADD_RECIPIENT } from './constant';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import { AccountTypesLuInterface, CountriesInterface, CountryCodeList, CountryStatesInterface, CurrentCountryInterface, ListsInterface, LookUpDataInterface, PayeeDetailsInterface, SathosiTestDetailsInterface } from './interface';
import PermissionModel from '../../../../commonScreens/permissionPopup';
import { checkAppPermissions } from '../../../../../services/mediaPermissionService';
import useCountryData from '../../../../../hooks/countryDataHook/useCountryData';

const AddContact = React.memo((props: any) => {
  const nameRef = useRef();
  const networkRef = useRef<any>(null);
  const dispatch = useDispatch<any>();
  const styles = useStyleSheet(themedStyles);
  const [address, setAdress] = React.useState<any>("");
  const [errormsg, setErrormsg] = useState<string>("");
  const [btnDtlLoading, setBtnDtlLoading] = useState<boolean>(false);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [enableScanner, setEnableScanner] = useState<boolean>(false);
  const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
  const { decryptAES, encryptAES } = useEncryptDecrypt();
  const accountType = props?.route?.params?.accountType || props?.accountType;
  const isFirstPartyDisable =
    (userinfo?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL && accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS) ||
    (userinfo?.accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS && accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL);
  const [initValues, setInitValues] = useState(
    {
      saveWhiteListName: "", walletAddress: "", network: props.route?.params?.network, source: "", token: props.route?.params?.walletCode, addressType: !isFirstPartyDisable ? SEND_CONST.FIRST_PARTY : SEND_CONST.THIRD_PARTY, remarks: "", proofType: "",
      country: "", state: "", city: "", postalCode: "", firstName: "", lastName: "", email: "", phoneNumber: "", relation: "", street: "",
      accountType: accountType || "", businessName: "",
    }
  );
  const isFocused = useIsFocused();
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [lists, setLists] = useState<ListsInterface>({ coinsList: [], networksList: [], sourceList: [], proofTypesList: [] });
  const scrollRef = useRef<any>();
  const [sathosiTestDetails, setSathosiTestDetails] = useState<SathosiTestDetailsInterface>({})
  const [payeeDeatils, setPayeeDetails] = useState<PayeeDetailsInterface>({});
  const [isModelVisible, setIsModelVisible] = useState<boolean>(props?.route?.params?.isSathoshiTestModel || false);
  const [loader, setLoader] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const [countryCodelist, setCountryCodelist] = useState<CountryCodeList>([]);
  const [accountTypesLu, setAccountTypesLu] = useState<AccountTypesLuInterface>([]);
  const [countries, setCountries] = useState<CountriesInterface>([]);
  const [lookUpData, setLookUpData] = useState<LookUpDataInterface>({});
  const [countryStates, setCountryStates] = useState<CountryStatesInterface>();
  const [currentCountry, setCurrentCountry] = useState<CurrentCountryInterface>();
  const [permissionModel, setPermissionModel] = useState<boolean>(false);
  const [permissionTitle, setPermissionTitle] = useState<string>('');
  const [permissionMessage, setPermissionMessage] = useState<string>('');

  const ref = useRef<any>(null)
  const [recepientDynamicFeieldDetails, setRecepientDynamicFeieldDetails] = useState<any>({})

  // Use country data hook
  const {
    countryPickerData,
    phoneCodePickerData,
    loading: countryLoading,
    error: countryError,
    clearCache
  } = useCountryData({
    loadCountries: true,
    loadPhoneCodes: true,
  });
  useEffect(() => {
    if (props?.route?.params?.id && isFocused) {
      getAddressBookCryptoViewDetails();
    } else {
      if (props?.route?.params?.scannedAddress) {
        setAdress(props.route.params.scannedAddress);
        setInitValues(prev => ({ ...prev, walletAddress: props.route.params.scannedAddress }));
      }
      setAdress('');
    }
    getRecepientDynamicFeieldDetails();
  }, [isFocused]);
  useEffect(() => {
    if (props?.route?.params?.isSathoshiTestModel === "true" || props?.route?.params?.isSathoshiTestModel === true) {
      getTestDetails(props?.route?.params.walletCode, props?.route?.params.network, props?.route?.params?.walletAddress);
    }
  }, [isFocused, props?.route?.params?.isSathoshiTestModel]);
  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  })
  useEffect(() => {
    getCryptoCoins(initValues.addressType);
  }, [props.route?.params?.walletCode, initValues.addressType]);

  const handleSubmit = async (values: any, { resetForm }: any) => {
    Keyboard.dismiss();
    logEvent("Button Pressed", { action: "CryptoPayeeSaveCall", nextScreen: "SathoshiTest", currentScreen: "cryptoPayeeForm" })
    setBtnDtlLoading(true);
    setBtnDisabled(true);
    let response: any = null;

    // ?? Satoshi Test API call
    if (values?.proofType === "Sathoshi Test") {
      response = await AddressbookService.getsathosiTestDetails(
        // values.token,
        values.network,
        values.walletAddress
      );
    }
    if (props?.route?.params?.id) {
      return updateCrypto(values, response?.data);
    }

    const obj2 = {
      id: "00000000-0000-0000-0000-000000000000",
      customerId: userinfo?.id,
      favouriteName: values.saveWhiteListName,
      network: values.network,
      walletAddress: values?.walletAddress,
      accountType: props?.route?.params?.accountType,
      whiteListState: "Submitted",
      whiteilstRemarks: null,
      userCreated: userinfo?.name,
      walletType: values?.proofType || "",
      modifiedBy: null,
      rejectReason: null,
      status: "Active",
      walletSource: values.source,
      otherWallet: values?.remarks,
      addressType: values?.addressType,
      appName: null,
      // currency: values?.token,
      remarks: values?.remarks,
      amount: response?.data?.amount || null,
      businessName: (values?.firstName && encryptAES(values.firstName)) || (values?.businessName && encryptAES(values.businessName)) || "",
      firstName: values?.firstName ? encryptAES(values.firstName) : "",
      lastName: values?.lastName ? encryptAES(values.lastName) : "",
      email: values?.email ? encryptAES(values.email) : "",
      phoneCode: values?.phoneCode ? encryptAES(values.phoneCode) : "",
      phoneNumber: values?.phoneNumber ? encryptAES(values.phoneNumber) : "",
      postalCode: values?.postalCode || "",
      country: values?.country || "",
      state: values?.state || "",
      city: values?.city || "",
      line1: values?.street || "",
      IsOnTheGo: props?.route?.params?.screenName === "Withdraw" ? true : props?.route?.params?.screenName !== SEND_CONST.ADDRESS_BOOK ? false : true
    }
    try {
      const res: any = await AddressbookService.confirmSummarrySendCrypto(obj2);
      if (res?.ok) {
        setPayeeDetails(values);
        setBtnDtlLoading(false);
        setBtnDisabled(false);
        showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');
        setErrormsg("");
        if (values?.proofType === "Sathoshi Test") {
          await getTestDetails(values.token, values.network, values?.walletAddress);
        } else {
          if (props?.route?.params?.screenName === SEND_CONST.ADDRESS_BOOK || props?.route?.params?.screenName === "dynamicTabs") {
            dispatch(setScreenInfo(SEND_CONST.CRYPTO));
            navigation?.push(SEND_CONST.ADDRESS_BOOK, { screenName: props?.route?.params?.screenName });
            resetForm();
          } else if (props?.route?.params?.screenName === "Withdraw") {
            navigation?.goBack();
            resetForm();
          }
          else {
            navigation.navigate(SEND_CONST.CRYPTO_SEND, {
              walletCode: props.route?.params?.walletCode,
              coinBalance: props?.route?.params?.coinBalance,
              screenName: props?.route?.params?.screenName,
              merchantId: props?.route?.params?.merchantId,
              amount: props?.route?.params?.amount,
              networkId: props.route?.params?.networkId,
              network: props.route?.params?.network,
              coinCode: props.route?.params?.walletCode,
            })
          }
        }

      }
      else {
        try {
          if (scrollRef.current?.scrollToPosition) {
            scrollRef.current.scrollToPosition(0, 0, true);
          } else if (scrollRef.current?.scrollTo) {
            scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
          }
        } catch (e) {
          // Ignore scroll errors
        }
        setErrormsg(isErrorDispaly(res));
        ref?.current?.scrollTo({ y: 0, animated: true });
        setBtnDtlLoading(false);
        setBtnDisabled(false);
      }
    }
    catch (error) {
      try {
        if (scrollRef.current?.scrollToPosition) {
          scrollRef.current.scrollToPosition(0, 0, true);
        } else if (scrollRef.current?.scrollTo) {
          scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
        }
      } catch (e) {
        // Ignore scroll errors
      }
      setErrormsg(isErrorDispaly((error as any)?.response || error));
      ref?.current?.scrollTo({ y: 0, animated: true });
      setBtnDtlLoading(false);
      setBtnDisabled(false);
    }
  };
  const updateCrypto = async (val: any, sathoshiTestDetails?: any) => {
    let obj = {
      "id": props?.route?.params?.id,
      "favouriteName": val.saveWhiteListName,
      "currency": val?.token,
      "network": val?.network,
      "userCreated": userinfo?.name,
      "modifiedDate": formatDateTimeAPI(new Date()),
      "modifiedBy": userinfo?.name,
      "status": "Active",
      "adressstate": "",
      "currencyType": "Crypto",
      "walletType": val?.proofType,
      "walletAddress": val?.walletAddress,
      "addressType": val?.addressType,
      "customerId": userinfo?.id,
      "walletSource": val?.source,
      "otherWallet": val?.remarks,
      "createdBy": userinfo?.name,
      "AnalyticsId": props?.route?.params?.analyticsId || "",
      "proofType": val?.proofType,
      "whiteListState": "Draft",
      "firstName": val?.firstName ? encryptAES(val.firstName) : "",
      "lastName": val?.lastName ? encryptAES(val.lastName) : "",
      "email": val?.email ? encryptAES(val.email) : "",
      "phoneCode": val?.phoneCode ? encryptAES(val.phoneCode) : "",
      "phoneNumber": val?.phoneNumber ? encryptAES(val.phoneNumber) : "",
      "country": val?.country || "",
      "state": val?.state || "",
      "city": val?.city || "",
      "line1": val?.street || "",
      "postalCode": val?.postalCode,
      "accountType": props?.route?.params?.accountType,
      "businessName": (val?.firstName && encryptAES(val.firstName)) || (val?.businessName && encryptAES(val.businessName)) || "",
      "IsOnTheGo": props?.route?.params?.screenName === "Withdraw" ? true : props?.route?.params?.screenName !== SEND_CONST.ADDRESS_BOOK ? false : true,
      "amount": sathoshiTestDetails?.amount || null,

    }
    const res: any = await AddressbookService.confirmSendCryptoPutCall(obj);
    if (res?.ok) {
      setBtnDtlLoading(false);
      setBtnDisabled(false);
      setErrormsg("");
      if (val?.proofType === "Sathoshi Test") {
        getTestDetails(val.token, val.network, val?.walletAddress)
      } else {
        navigation?.push(SEND_CONST.ADDRESS_BOOK);

      }
    }
    else {
      try {
        if (scrollRef.current?.scrollToPosition) {
          scrollRef.current.scrollToPosition(0, 0, true);
        } else if (scrollRef.current?.scrollTo) {
          scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
        }
      } catch (e) {
        // Ignore scroll errors
      }
      setErrormsg(isErrorDispaly(res));
      setBtnDtlLoading(false);
      setBtnDisabled(false);
    }
  };
  const getAddressBookCryptoViewDetails = async () => {
    setLoader(true);
    setErrormsg('')
    try {
      const res: any = await AddressbookService?.getAddressbookCryptoViewDetails(props?.route?.params?.id);
      if (res?.ok) {
        setLoader(false);
        const initialFormValues: any = {
          saveWhiteListName: res?.data?.recipientDetailsData?.["Favorite Name"],
          walletAddress: res?.data?.walletDetails?.["Wallet Address"],
          network: res?.data?.walletDetails?.["Network"],
          // token: res?.data?.walletDetails?.["Token"],
          source: res?.data?.walletDetails?.["Wallet Source"],
          addressType: res?.data?.recipientDetailsData?.["Transfer"],
          proofType: res?.data?.walletType || res?.data?.walletDetails?.["Proof Type"],
          remarks: res?.data?.walletDetails?.["Remarks"] || res?.data?.otherWallet,
          lastName: res?.data?.recipientDetailsData?.["Last Name"] && decryptAES(res?.data?.recipientDetailsData?.["Last Name"]) || "",
          email: decryptAES(res?.data?.recipientDetailsData?.["Email"]) || "",
          phoneCode: decryptAES(res?.data?.recipientDetailsData?.["Phone Code"]) || "",
          phoneNumber: decryptAES(res?.data?.recipientDetailsData?.["Phone Number"]) || "",
          firstName: decryptAES(res?.data?.recipientDetailsData?.["First Name"]) || decryptAES(res?.data?.recipientDetailsData?.["Business Name"]) || "",
          businessName: decryptAES(res?.data?.recipientDetailsData?.["Business Name"]) || decryptAES(res?.data?.recipientDetailsData?.["First Name"]) || "",
          country: res?.data?.addressDetailsData?.["Country"] || "",
          state: res?.data?.addressDetailsData?.["State"] || "",
          city: res?.data?.addressDetailsData?.["City"] || "",
          street: res?.data?.addressDetailsData?.["Street"] || "",
          postalCode: res?.data?.addressDetailsData?.["Postal Code"] || "",
          relation: res?.data?.relation,
          accountType: res?.data?.recipientDetailsData?.["Account"],
        };
        setInitValues(initialFormValues);
        setAdress(res?.data?.walletaddress);
      }
      else {
        setLoader(false);
        setErrormsg(isErrorDispaly(res));
      }
    } catch (error) {
      try {
        if (scrollRef.current?.scrollToPosition) {
          scrollRef.current.scrollToPosition(0, 0, true);
        } else if (scrollRef.current?.scrollTo) {
          scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
        }
      } catch (e) {
        // Ignore scroll errors
      }
      setLoader(false);
      setErrormsg(isErrorDispaly(error));
    }
  };
  const getCryptoCoins = async (addressType?: any) => {
    const isFirstParty = addressType?.toLowerCase()?.replace(/\s+/g, '')?.trim() === ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.FIRST_PARTY;
    setErrormsg('')
    try {
      const response: any = await AddressbookService.getPayeesLookups();
      if (response?.ok) {
        setLists((prev: any) => ({
          ...prev,
          sourceList: isFirstParty ? response?.data?.['FirstParty-WalletSources'] : response?.data?.['WalletSources'],
          proofTypesList: response?.data?.['ProofTypes'] || [],
          networksList: response?.data?.['networks'] || [],
        }));
        let updatedCoinsList = response?.data?.cryptoCurrency?.map((data: any) => ({ ...data, name: data.code }));

        const accountTypesLuInfo = response?.data?.AccountTypes?.map((item: any) => ({ ...item, name: item?.code }))
        setAccountTypesLu(accountTypesLuInfo);
        setCountries(countryPickerData);
        setCountryCodelist(phoneCodePickerData);
        setLookUpData(response?.data);

        if (updatedCoinsList?.length > 0) {
          const networksList = updatedCoinsList.find(
            (item: any) => item.name === props.route?.params?.walletCode
          );

          if (networksList?.details?.length > 0) {
            setLists((prev: any) => ({ ...prev, networksList: networksList?.details || [] }))
            setInitValues((prev: any) => ({ ...prev, network: props?.route?.params?.network || networksList?.details[0].code }))

          } else {
            // setLists((prev: any) => ({ ...prev, networksList: [] }))
          }
        }
        setLists((prev: any) => ({ ...prev, coinsList: updatedCoinsList }))
        setErrormsg("");
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      try {
        if (scrollRef.current?.scrollToPosition) {
          scrollRef.current.scrollToPosition(0, 0, true);
        } else if (scrollRef.current?.scrollTo) {
          scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
        }
      } catch (e) {
        // Ignore scroll errors
      }
      setErrormsg(isErrorDispaly(error));
    }

  };
  const enableScannerModel = async () => {
    const res = await checkAppPermissions("camera"); // or "library"

    if (res.showPopup) {
      setPermissionTitle("GLOBAL_CONSTANTS.ALLOW_CAMERA_ACCESS_TO_SCAN_WALLET_QR_CODES");
      setPermissionMessage("GLOBAL_CONSTANTS.CAMERA_ACCESS_DENIED_MESSAGE");
      setPermissionModel(true);
      return;
    }

    if (res.allowed) {
      setEnableScanner(true);
    }
  };

  const backArrowButtonHandler = () => {
    navigation?.goBack();
  };
  const sanitizeText = (text: string): string => {
    return text.replace(/[^a-zA-Z0-9]/g, "");
  };

  const handleAddressChange = (text: string, setFieldValue: any) => {
    setFieldValue("walletAddress", "")
    if (text) {
      const sanitizedText = sanitizeText(text);
      setAdress(sanitizedText);
      setErrormsg("");
      setFieldValue("walletAddress", text)
    }
  };
  const handleNetworkChange = (setFieldValue: any) => {
    if (props?.route?.params?.screenName !== "dynamicTabs") {
      setFieldValue("walletAddress", "")
    }
  };
  const handleFetchNetworks = (val: any, setFieldValue: any) => {
    const selectedCoinNetworks = lists?.coinsList?.find(
      (item: any) => item.name === val
    );
    if (props?.route?.params?.screenName !== "dynamicTabs") {
      setFieldValue("network", "")
      setFieldValue("walletAddress", "")
    }
    if (selectedCoinNetworks) {
      setLists((prev: any) => ({ ...prev, networksList: selectedCoinNetworks?.details || [] }))
    } else {
      setLists((prev: any) => ({ ...prev, networksList: [] }))
    }
  };
  const handleCloseError = useCallback(() => {
    setErrormsg("")
  }, []);

  const handleCancel = useCallback(() => {
    navigation?.goBack()
  }, []);

  const handleCloseModel = () => {
    setEnableScanner(false);
  };
  const handlePhoneCode = (item: any, setFieldValue: any) => {
    setFieldValue("phoneCode", item?.code)
  };
  const getTestDetails = async (coin: any, network: any, address: any) => {
    setLoader(true);
    try {
      const response: any = await AddressbookService.getsathosiTestDetails(network, address);
      if (response?.ok) {
        setSathosiTestDetails(response?.data);
        setIsModelVisible(true);
      } else {
        setErrormsg(isErrorDispaly(response));
      }

    } catch (error) {
      try {
        if (scrollRef.current?.scrollToPosition) {
          scrollRef.current.scrollToPosition(0, 0, true);
        } else if (scrollRef.current?.scrollTo) {
          scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
        }
      } catch (e) {
        // Ignore scroll errors
      }
      setErrormsg(isErrorDispaly(error));

    }
    finally {
      setLoader(false);
    }
  };

  const onClose = () => {
    setIsModelVisible(false);
    navigation?.reset({
      index: 0,
      routes: [{ name: SEND_CONST.ADDRESS_BOOK, params: { screenName: "Addressbook" } }],
    });
  };

  const handleChangeSource = (value: any, setFieldValue: any) => {
    setFieldValue("source", value);
    setFieldValue("proofType", "");
  }
  const getUserProfile = async (type: any) => {
    setErrormsg('');
    try {
      const response: any = await AddressbookService.getProfileInfo(type);
      if (response?.data) {
        const profileData = response?.data;
        if (profileData) {
          return profileData;
        }
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };

  const formatState = (state: any) => {
    const formattedState: any = {};
    for (const key in state) {
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        const lowerCaseKey = key.toLowerCase();
        const value = state[key];
        if (lowerCaseKey === ADD_RECIPIENT.NAME && typeof value === ADD_RECIPIENT.STRING) {
          formattedState[lowerCaseKey] = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        } else {
          formattedState[lowerCaseKey] = value;
        }
      }
    }
    return formattedState;
  };


  const handleValidationSave = (validateForm: any) => {
    validateForm().then(async (a: any) => {
      if (Object.keys(a)?.length > 0) {
        setErrormsg(t("GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD"));
        ref?.current?.scrollTo({ y: 0, animated: true });
        return;
      }
    })
  };
  const getRecepientDynamicFeieldDetails = async () => {
    setErrormsg('');
    setLoader(true);

    try {
      const response: any = await AddressbookService?.getRecipientDynamicFeildsCrypto();
      if (response?.ok) {
        const parsedDetails =
          typeof response?.data === "string"
            ? JSON?.parse(response?.data)
            : response?.data;
        setRecepientDynamicFeieldDetails(parsedDetails);
        setLoader(false);

      } else {
        setErrormsg(isErrorDispaly(response));
        setLoader(false);

      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
      setLoader(false);

    }
  }
  const closePermissionModel = () => {
    setPermissionModel(false);
  };
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>


      <ScrollViewComponent
        ref={ref}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={[commonStyles.flex1, commonStyles.screenBg]}

      >
        <KeyboardAwareScrollView
          contentContainerStyle={[{ flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          ref={scrollRef}
          extraScrollHeight={Platform.OS === 'ios' ? 120 : 90}
        >

          {loader && <DashboardLoader />}
          {!loader && <Container style={commonStyles.container}>
            <PageHeader title={props?.route?.params?.id ? "GLOBAL_CONSTANTS.EDIT_CRYPTO_ADDRESS" : "GLOBAL_CONSTANTS.ADD_CRYPTO_ADDRESS"} onBackPress={backArrowButtonHandler} />
            {errormsg !== '' && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
            <View>

              <Formik
                initialValues={initValues}
                onSubmit={handleSubmit}
                validationSchema={(values: any) => validationSchema(props?.route?.params?.accountType || values?.accountType, values, userinfo?.payeeCompliance, recepientDynamicFeieldDetails, recepientDynamicFeieldDetails?.address, recepientDynamicFeieldDetails?.account)}
                enableReinitialize={true}
                validateOnChange={true}
                validateOnBlur={false}
              >
                {(formik) => {
                  const { touched, handleSubmit, setFieldValue, errors, handleBlur, values, handleChange, validateForm, setErrors } = formik;
                  return (
                    <View >
                      <Field
                        touched={touched.saveWhiteListName}
                        name="saveWhiteListName"
                        label={"GLOBAL_CONSTANTS.FAVORITE"}
                        error={errors.saveWhiteListName}
                        handleBlur={handleBlur}
                        customContainerStyle={{}}
                        placeholder={"GLOBAL_CONSTANTS.FAVORITE_PLACEHOLDER"}
                        component={InputDefault}
                        innerRef={nameRef}
                        maxLength={50}
                        onChange={(text: string) => {
                          setFieldValue("saveWhiteListName", text?.trim());
                        }}
                        requiredMark={<LabelComponent
                          text=" *"
                          style={commonStyles.textError}
                        />}
                      />
                      <View style={[commonStyles.formItemSpace]} />
                      {userinfo?.payeeCompliance?.toLowerCase() !== ADD_RECIPIENT.BASIC && <View>
                        <RecipientDetails
                          values={values}
                          touched={touched}
                          errors={errors}
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          setFieldValue={setFieldValue}
                          nameRef={nameRef}
                          countryCodelist={phoneCodePickerData}
                          NEW_COLOR={NEW_COLOR}
                          commonStyles={commonStyles}
                          t={t}
                          handlePhoneCode={handlePhoneCode}
                          props={props}
                          formik={formik}
                          currentCountry={currentCountry}
                          formatState={formatState}
                          userProfile={getUserProfile}
                          countries={countryPickerData}
                          countryStates={countryStates}
                          setCountryStates={setCountryStates}
                          propsUpdateId={props?.route?.params?.id}
                          screenName={props?.route?.params?.screenName?.toLowerCase()}
                          getCryptoCoins={getCryptoCoins}
                          accountType={props?.route?.params?.accountType}
                          recepientDynamicFeieldDetails={recepientDynamicFeieldDetails}
                          setErrors={setErrors}
                        />
                      </View>}
                      <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.mb24]} text={"Wallet Details"} />

                      {/* <Field
                        innerRef={networkRef}
                        activeOpacity={0.9}
                        label={"GLOBAL_CONSTANTS.TOKEN"}
                        touched={touched.token}
                        customContainerStyle={{}}
                        name="token"
                        error={errors.token}
                        handleBlur={handleBlur}
                        modalTitle={"GLOBAL_CONSTANTS.SELECT_TOKEN"}
                        data={lists?.coinsList}
                        placeholder={"GLOBAL_CONSTANTS.SELECT_TOKEN"}
                        placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                        component={CustomPickerAcc}
                        isIconsDisplay={true}
                        onChange={(selVal: any) => handleFetchNetworks(selVal, setFieldValue)}
                        requiredMark={
                          <LabelComponent
                            text=" *"
                            style={commonStyles.textError}
                          />
                        }
                      />
                      <View style={[commonStyles.formItemSpace]} /> */}
                      <Field
                        innerRef={networkRef}
                        activeOpacity={0.9}
                        label={"GLOBAL_CONSTANTS.NETWORK"}
                        touched={touched.network}
                        customContainerStyle={{}}
                        name="network"
                        value={values.network}
                        error={errors.network}
                        handleBlur={handleBlur}
                        modalTitle={"GLOBAL_CONSTANTS.SELECT_NETWORK"}
                        data={lists?.networksList}
                        placeholder={"GLOBAL_CONSTANTS.SELECT_NETWORK"}
                        placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                        component={CustomPickerAcc}
                        isIconsDisplay={true}
                        onChange={() => handleNetworkChange(setFieldValue)}
                        requiredMark={
                          <LabelComponent
                            text=" *"
                            style={commonStyles.textError}
                          />
                        }
                      />
                      <View style={[commonStyles.formItemSpace]} />

                      <View >
                        <LabelComponent
                          text={"GLOBAL_CONSTANTS.WALLET_ADDRESS"}
                          style={[
                            commonStyles.inputLabel,
                          ]}
                        ><LabelComponent text={" *"} style={commonStyles.textError} /></LabelComponent>
                        <TextInputWithChaild
                          style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}
                          placeholder={"GLOBAL_CONSTANTS.ENTER_WALLET_ADDRESS"}
                          name="walletAddress"
                          numberOfLines={1}
                          value={values.walletAddress}
                          maxLength={150}
                          touched={touched.walletAddress}
                          error={!!errors.walletAddress}
                          onHandleChange={(text: string) => {
                            setFieldValue("walletAddress", text);
                          }}
                          extraChildren={
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, styles.scannerIconContainer]}>
                              <TouchableOpacity
                                onPress={() => enableScannerModel()}
                              >
                                <View>
                                  <ScannerIcon width={s(24)} height={s(24)} />
                                </View>
                              </TouchableOpacity>
                            </View>
                          }
                        />
                      </View>

                      {userinfo?.payeeCompliance?.toLowerCase() !== ADD_RECIPIENT.BASIC && <View style={[commonStyles.formItemSpace]} />}
                      {userinfo?.payeeCompliance?.toLowerCase() !== ADD_RECIPIENT.BASIC && <Field
                        innerRef={networkRef}
                        activeOpacity={0.9}
                        label={"GLOBAL_CONSTANTS.SOURCE"}
                        touched={touched.source}
                        customContainerStyle={{}}
                        name="source"
                        error={errors.source}
                        handleBlur={handleBlur}
                        modalTitle={"GLOBAL_CONSTANTS.SELECT_SOURCE"}
                        data={lists?.sourceList}
                        placeholder={"GLOBAL_CONSTANTS.SELECT_SOURCE"}
                        placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                        component={CustomPickerAcc}
                        onChange={(value: any) => {
                          handleChangeSource(value, setFieldValue)
                        }}
                        requiredMark={
                          <LabelComponent
                            text=" *"
                            style={commonStyles.textError}
                          />
                        }
                      />}
                      {values?.source === "Self Hosted" && <View>
                        <View style={[commonStyles.formItemSpace]} />
                        <Field
                          innerRef={networkRef}
                          activeOpacity={0.9}
                          label={"GLOBAL_CONSTANTS.PROOF_TYPE"}
                          touched={touched.proofType}
                          customContainerStyle={{}}
                          name="proofType"
                          error={errors.proofType}
                          handleBlur={handleBlur}
                          modalTitle={"GLOBAL_CONSTANTS.SELECT_PROOF_TYPE"}
                          data={lists?.proofTypesList?.filter((item: any) => item?.name?.toLowerCase() !== 'self')}
                          placeholder={"GLOBAL_CONSTANTS.SELECT_PROOF_TYPE"}
                          placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                          component={CustomPickerAcc}
                          requiredMark={
                            <LabelComponent
                              text=" *"
                              style={commonStyles.textError}
                            />
                          }
                        />
                      </View>}
                      <View style={[commonStyles.formItemSpace]} />
                      <Field
                        touched={touched.remarks}
                        name="remarks"
                        label={"GLOBAL_CONSTANTS.REMARKS"}
                        error={errors.remarks}
                        handleBlur={handleBlur}
                        customContainerStyle={{}}
                        placeholder={"GLOBAL_CONSTANTS.ENTER_REMARKS"}
                        component={InputDefault}
                        innerRef={nameRef}
                        maxLength={100}
                      // requiredMark={<LabelComponent
                      //   text=" *"
                      //   style={commonStyles.textError}
                      // />}
                      />
                      <View style={[commonStyles.mb43]} />
                      <ButtonComponent
                        title={"GLOBAL_CONSTANTS.SAVE"}
                        customTitleStyle={undefined}
                        icon={undefined}
                        disable={btnDisabled}
                        loading={btnDtlLoading}
                        onPress={() => {
                          handleValidationSave(validateForm)
                          handleSubmit();
                        }}
                      />
                      <View style={[commonStyles.buttongap]} />
                      <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CANCEL"}
                        customTitleStyle={undefined}
                        icon={undefined}
                        disable={btnDtlLoading}
                        onPress={handleCancel}
                        solidBackground={true}

                      />
                      <View style={[commonStyles.mb43]} />
                      {enableScanner && (
                        <Modal
                          animationType="slide"
                          transparent={true}
                          visible={props.modalVisible}
                          onRequestClose={() => handleCloseModel()}
                        >
                          <Container style={[commonStyles.container,]}>

                            <QrScanner
                              onCaptureCode={(text: string) => {
                                const address = text?.includes(":") ? text.split(":")[1] : text;
                                setAdress(address);
                                handleAddressChange(address, setFieldValue)
                              }}
                              onClose={() => {
                                setEnableScanner(false);
                              }}
                            />
                          </Container>
                        </Modal>
                      )}
                    </View>
                  );
                }}
              </Formik>



            </View>
          </Container>

          }
        </KeyboardAwareScrollView >
      </ScrollViewComponent>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModelVisible}
        onRequestClose={() => onClose()}>

        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={s(64)}

          >
            {loader ? (
              <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                <DashboardLoader />
              </ViewComponent>
            ) : (
              <>
                <ViewComponent style={[commonStyles.px24, Platform.OS === 'ios' ? commonStyles.mt50 : null]}>
                  <PageHeader title={"Verify Proof"} onBackPress={onClose} />
                </ViewComponent>
                <ScrollViewComponent>
                  <Container style={[commonStyles.container]}>
                    <ProofVerification
                      sathosiTestDetails={sathosiTestDetails}
                      payeeDeatils={payeeDeatils}
                      onClose={onClose}
                      routeParams={props?.route?.params?.screenName}
                    />
                  </Container>
                </ScrollViewComponent>
              </>
            )}
          </KeyboardAvoidingView>

        </ViewComponent>

      </Modal>
      <PermissionModel permissionDeniedContent={permissionMessage} title={permissionTitle} closeModel={closePermissionModel} addModelVisible={permissionModel} />
    </ViewComponent >
  );
});

export default AddContact;

const themedStyles = StyleService.create({
  scan: { right: 14, },
  scannerIconContainer: {
    paddingHorizontal: s(8),
    height: '100%',
  }, stepIndicator: {
    width: s(24),
    height: s(24),
    borderRadius: s(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundcolor: "red"
  },
  proofCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Example background
    borderRadius: s(12),
    padding: s(12),
    // marginLeft: s(32), // Remove fixed left margin to center content, adjust as needed
  },
})