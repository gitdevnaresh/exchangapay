import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Switch,
  TextInput,
} from "react-native";
import { useSelector } from "react-redux";
import { isErrorDispaly } from "../../../../utils/helpers";
import CardsModuleService from "../../../../apiServices/cards";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import { Field, Formik, FormikErrors } from "formik";
import CustomPickerAcc from '../../../../components/customPicker/CustomPicker';
import InputDefault from '../../../../components/textInputComponents/DefaultFiat';
import Container from "../../../../components/container/container";
import PhoneCodePicker from "../../../../components/phonePicker/phonePicker";
import CreateAccountService from "../../../../apiServices/bank/createAccount";
import ProfileService from "../../../../apiServices/profile";
import ProgressHeader from "../../../../components/progressCircle/progressHeader";
import { useLngTranslation } from "../../../../hooks/languagesHook/useLngTranslation";
import ViewComponent from "../../../../components/view/view";
import { AddressInterface } from "./interface";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import { CreateAccSchema } from "./schema";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import ButtonComponent from "../../../../components/buttons/button";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { NavigationProp, ParamListBase, RouteProp, useIsFocused, useNavigation } from "@react-navigation/native";
import { s } from "../../../../constants/styels/scale";
import { showAppToast } from "../../../../components/toasterMessages/ShowMessage";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import LabelComponent from "../../../../components/textComponets/lableComponent/lable";

interface CountryPickerItem {
  name: string;
  code: string;
  towns?: string[];
}

interface AddressLookupDetailsResponse {
  countryWithTowns: CountryPickerItem[];
  PhoneCodes: PhoneCodeItem[];
}

interface PhoneCodeItem {
  name: string;
  code: string;
}

interface UpdateDetailsResponse {
  ok: boolean;
  data?: unknown;
  status?: number;
}

interface AddressFormValues {
  firstName: string;
  lastName: string;
  country: string;
  state: string;
  city: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  email: string;
  phoneCode: string;
  town: string;
  isDefault?: boolean;
}

interface KycInfoDataForSubmission {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string | Date;
  docExpireDate: string | Date;
  docNumber: string;
  idIssuingCountry: string;
}

interface KybCompanyInfoForSubmission {
  customerId: string;
  companyName: string;
  country: string;
  registrationNumber: string;
  dateOfRegistration: string | Date;
  documents: any;
}

interface SubmissionRouteParams {
  KycInformation?: boolean;
  kycInfoData?: KycInfoDataForSubmission;
  isKycEdit?: boolean;
  KybInformation?: boolean;
  KybCompanyInfo?: KybCompanyInfoForSubmission;
  isKybEdit?: boolean;
  cardId?: string;
}
interface TownsList {
  name: string; code: string
}

interface AddPersonalInfoRouteParams {
  KycInformation?: boolean;
  kycInfoData?: KycInfoDataForSubmission;
  isKycEdit?: boolean;
  KybInformation?: boolean;
  KybCompanyInfo?: KybCompanyInfoForSubmission;
  isKybEdit?: boolean;
  cardId?: string;
  id?: string;
  logo?: any;
  addressDetails?: AddressInterface;
  screenName?: string;
  returnScreen?: string;
  returnParams?: any;
}
type AddPersonalInfoRouteProp = RouteProp<ParamListBase, 'AddPersonalInfo'> & {
  params?: AddPersonalInfoRouteParams;
};

interface AddPersonalInfoProps {
  navigation: NavigationProp<ParamListBase>;
  route: AddPersonalInfoRouteProp;
}
const AddPersonalInfo = (props: AddPersonalInfoProps) => {
  const nameRef = useRef<TextInput>(null);
  const ref = useRef<any>(null);
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<string>("");
  const { encryptAES, decryptAES } = useEncryptDecrypt();
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [countries, setCountries] = useState<CountryPickerItem[]>([]);
  const [countryCodelist, setCountryCodelist] = useState<PhoneCodeItem[]>([]);
  const [townsList, setTownsList] = useState<TownsList[]>([]);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const isFocused = useIsFocused()
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [initValues, setInitValues] = useState<AddressFormValues>({
    firstName: (props?.route?.params?.KycInformation ? props.route.params.kycInfoData?.firstName : undefined) ?? "",
    lastName: (props?.route?.params?.KycInformation ? props.route.params.kycInfoData?.lastName : undefined) ?? "",
    country: (props?.route?.params?.KycInformation || props?.route?.params?.KybInformation ? userInfo?.country : undefined) ?? "",
    state: "",
    city: "",
    phoneNumber: (props?.route?.params?.KycInformation || props?.route?.params?.KybInformation ? userInfo?.phoneNo : undefined) ?? "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    email: (props?.route?.params?.KycInformation || props?.route?.params?.KybInformation ? (decryptAES(userInfo?.email) ?? undefined) : undefined) ?? "",
    phoneCode: (props?.route?.params?.KycInformation || props?.route?.params?.KybInformation ? userInfo?.phonecode : undefined) ?? "",
    town: "",
    isDefault: true,
  });
  useEffect(() => {
    getAddressLookup();
    if (!props?.route?.params?.screenName && (props?.route?.params?.id || props?.route?.params?.isKycEdit || props?.route?.params?.isKybEdit)) {
      getDatailsForUpdateTheRecords();
    }
    if (props?.route?.params?.screenName && props?.route?.params?.id) {
      setEditLoading(true);
      const initialVal = {
        firstName: props?.route?.params?.addressDetails?.firstName ?? "",
        lastName: props?.route?.params?.addressDetails?.lastName ?? "",
        country: props?.route?.params?.addressDetails?.country ?? "",
        state: props?.route?.params?.addressDetails?.state ?? "",
        city: props?.route?.params?.addressDetails?.city ?? "",
        phoneNumber: props?.route?.params?.addressDetails?.phoneNumber ?? "",
        phoneCode: props?.route?.params?.addressDetails?.phoneCode ?? "",
        addressLine1: props?.route?.params?.addressDetails?.addressLine1 ?? "",
        addressLine2: props?.route?.params?.addressDetails?.addressLine2 ?? "",
        postalCode: props?.route?.params?.addressDetails?.postalCode ?? "",
        town: props?.route?.params?.addressDetails?.town ?? "",
        email: props?.route?.params?.addressDetails?.email ?? "",
        isDefault: props?.route?.params?.addressDetails?.isDefault ?? false,
      };
      setInitValues(initialVal);
      setIsEnabled(props?.route?.params?.addressDetails?.isDefault ?? false);
      setEditLoading(false);
    }
  }, [isFocused, props?.route?.params?.cardId]);

  const getAddressLookup = async () => {
    setErrormsg("");
    const response: {
      ok: boolean;
      status?: number;
      data?: unknown;
    } = await CreateAccountService.getAddressLooupDetails();
    if (response.ok && response.data) {
      const successData = response.data as AddressLookupDetailsResponse;
      setCountries(successData.countryWithTowns);
      setCountryCodelist(successData.PhoneCodes);
    } else {
      ref?.current?.scrollToPosition(0, 0, true);
      setErrormsg(isErrorDispaly(response));
    }
  };

  const getDatailsForUpdateTheRecords = async () => {
    setEditLoading(true);
    setErrormsg("");
    const addressId = props?.route?.params?.id;
    try {
      let response: UpdateDetailsResponse;
      if (props?.route?.params?.isKycEdit) {
        response = await ProfileService.identityPersionalDetails();
      } else if (props?.route?.params?.isKybEdit) {
        response = await ProfileService.KybCompanyDetails() as { ok: boolean; data: AddressInterface };
      } else {
        response = await CardsModuleService?.getAddressDetails(addressId) as { ok: boolean; data: AddressInterface };
      }
      if (response?.ok && response.data) {
        const responseData = response.data as AddressInterface;
        const initialVal = {
          firstName: responseData?.firstname ?? responseData?.addressDetails?.firstName ?? "",
          lastName: (responseData?.lastname ?? responseData?.addressDetails?.lastName) ?? "",
          country: responseData?.country ?? responseData?.addressDetails?.country ?? "",
          state: responseData?.state ?? responseData?.addressDetails?.state ?? "",
          city: responseData?.city ?? responseData?.addressDetails?.city ?? "",
          phoneNumber: decryptAES(responseData?.phoneNumber ?? responseData?.addressDetails?.phoneNumber ?? ""),
          phoneCode: decryptAES(responseData?.phoneCode ?? responseData?.addressDetails?.phoneCode ?? ""),
          addressLine1: responseData?.addressLine1 ?? responseData?.addressDetails?.addressLine1 ?? responseData?.addressDetails?.line1 ?? "",
          addressLine2: responseData?.addressLine2 ?? responseData?.addressDetails?.addressLine2 ?? responseData?.addressDetails?.line2 ?? "",
          postalCode: decryptAES(responseData?.postalCode ?? responseData?.addressDetails?.postalCode ?? ""),
          town: responseData?.town ?? responseData?.addressDetails?.town ?? "",
          email: decryptAES(responseData?.email ?? responseData?.addressDetails?.email ?? ""),
          isDefault: responseData?.isDefault ?? false,
        };
        setInitValues(initialVal);
        setIsEnabled(responseData?.isDefault ?? false);
      } else {
        setErrormsg(isErrorDispaly(response));
        ref?.current?.scrollToPosition(0, 0, true);
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setEditLoading(false);
    }
  };

  const createAddressDetailsPayload = useCallback((values: AddressFormValues, isKyb = false) => ({
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    country: values.country,
    state: values.state.trim(),
    city: values.city.trim(),
    line1: values.addressLine1.trim(),
    line2: values.addressLine2.trim(),
    town: values.town,
    postalCode: encryptAES(isKyb ? (values.postalCode ?? "+91") : values.postalCode),
    phoneNumber: encryptAES(values.phoneNumber),
    phoneCode: encryptAES(values.phoneCode),
    email: encryptAES(values.email),
  }), [encryptAES]);

  const getSubmissionConfig = useCallback((routeParams: SubmissionRouteParams | undefined, values: AddressFormValues) => {
    const customerId = userInfo?.id;
    if (routeParams?.KycInformation) {
      const addressDetails = { ...createAddressDetailsPayload(values, false), id: routeParams?.kycInfoData?.id ?? "00000000-0000-0000-0000-000000000000" };
      const kycInfoObject = {
        id: routeParams?.kycInfoData?.id,
        firstName: routeParams?.kycInfoData?.firstName.trim(),
        lastName: routeParams?.kycInfoData?.lastName.trim(),
        gender: routeParams?.kycInfoData?.gender,
        dob: routeParams?.kycInfoData?.dob,
        docExpireDate: routeParams?.kycInfoData?.docExpireDate,
        docNumber: encryptAES(routeParams?.kycInfoData?.docNumber ?? ""),
        idIssuingCountry: routeParams?.kycInfoData?.idIssuingCountry,
        addressDetails: addressDetails,
      };
      return {
        serviceCall: routeParams?.isKycEdit ? ProfileService.updateKycProfile : ProfileService.postKycProfile,
        payload: kycInfoObject,
        successRoute: routeParams?.isKycEdit ? 'KycProfilePreview' : 'KycProfileStep2',
      };
    } else if (routeParams?.KybInformation) {
      const addressDetails = { ...createAddressDetailsPayload(values, true), id: routeParams?.KybCompanyInfo?.customerId ?? "00000000-0000-0000-0000-000000000000" };
      const kybInfoObject = {
        id: routeParams?.KybCompanyInfo?.customerId ?? customerId,
        companyName: routeParams?.KybCompanyInfo?.companyName,
        country: routeParams?.KybCompanyInfo?.country,
        registrationNumber: encryptAES(routeParams?.KybCompanyInfo?.registrationNumber ?? ""),
        dateOfRegistration: routeParams?.KybCompanyInfo?.dateOfRegistration,
        documents: routeParams?.KybCompanyInfo?.documents,
        addressDetails: addressDetails,
      };
      return {
        serviceCall: routeParams?.isKybEdit ? ProfileService.updateKybComnyData : ProfileService.postKybComnyData,
        payload: kybInfoObject,
        successRoute: routeParams?.isKybEdit ? 'KybInfoPreview' : 'KybUboList',
      };
    } else {
      const genericAddressObject = {
        id: routeParams?.cardId,
        customerId: customerId,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        country: values.country,
        state: values.state.trim(),
        city: values.city.trim(),
        addressLine1: values.addressLine1.trim(),
        addressLine2: values.addressLine2.trim(),
        postalCode: encryptAES(values.postalCode),
        phoneNumber: encryptAES(values.phoneNumber),
        phoneCode: encryptAES(values.phoneCode),
        email: encryptAES(values.email),
        isDefault: isEnabled,
        createdBy: userInfo.userName,
        town: values?.town,
        createdDate: new Date(),
      };
      return { serviceCall: CardsModuleService.cardsAddressPost, payload: genericAddressObject, successRoute: null };
    }
  }, [userInfo, createAddressDetailsPayload, encryptAES, isEnabled]);

  const handleSave = async (values: AddressFormValues) => {
    setBtnLoading(true);
    try {
      if (props?.route?.params?.id && !props?.route?.params?.KycInformation && !props?.route?.params?.KybInformation) {
        await handleUpdate(values);
      } else {
        const config = getSubmissionConfig(props.route.params, values);
        const res = await config.serviceCall(config.payload);
        if (res?.ok || res?.status === 200) {
          showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');
          if (config.successRoute) {
            navigation.navigate(config.successRoute as never);
          } else {
            navigation.goBack();
          }
        } else {
          setErrormsg(isErrorDispaly(res));
          ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
        }
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
      ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleUpdate = async (values: AddressFormValues) => {
    setBtnLoading(true);
    const updateObj = {
      "id": props?.route?.params?.id,
      "firstName": values.firstName.trim(),
      "lastName": values.lastName.trim(),
      "fullName": values.firstName.trim() + " " + values.lastName.trim(),
      "email": encryptAES(values.email),
      "country": values.country,
      "state": values.state.trim(),
      "phoneNumber": encryptAES(values.phoneNumber),
      "phoneCode": encryptAES(values.phoneCode),
      "isDefault": isEnabled,
      "addressLine1": values.addressLine1.trim(),
      "addressLine2": values.addressLine2.trim(),
      "city": values.city.trim(),
      "postalCode": encryptAES(values.postalCode),
      "createdBy": userInfo.userName,
      "modifiedBy": userInfo.userName,
      "createdDate": new Date(),
      "town": values?.town,
      "modifiedDate": new Date(),
      "metadata": null
    }
    try {
      const res = await CardsModuleService.cardsAddressPut(updateObj);
      if (res.ok) {
        showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_UPDATED"), 'success');
        props.navigation.goBack();
      } else {
        ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
        setErrormsg(isErrorDispaly(res));
      }
    } catch (error) {
      ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
    } finally {
      setBtnLoading(false);
    }
  };
  useHardwareBackHandler(() => {
    handleGoBack();
  })
  const handleGoBack = useCallback(() => { navigation.goBack(); }, []);

  const handleValidationSave = (validateForm: () => Promise<FormikErrors<AddressFormValues>>) => {
    validateForm().then(async (a: FormikErrors<AddressFormValues>) => {
      if (Object.keys(a).length > 0) {
        ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
        setErrormsg(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
      }
    })
  }

  const handleCloseError = useCallback(() => { setErrormsg("") }, []);

  const handleCountryChange = (country: string, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<AddressFormValues>>) => {
    setFieldValue('country', country)
    setFieldValue("town", "");
    const selectedCountry: any = countries?.find(c => c.name === country);
    setTownsList(selectedCountry?.details ?? []);
  };

  const handlePhoneCode = (item: PhoneCodeItem, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<AddressFormValues>>) => {
    setFieldValue("phoneCode", item?.code)
  }

  const { t } = useLngTranslation();

  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      {editLoading ? (
        <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </ViewComponent>
      ) : (

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={s(64)}
        >
          <ScrollViewComponent
            ref={ref}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Container style={commonStyles.container}>
              {((!props?.route?.params?.id && !props?.route?.params?.isKybEdit) && !props?.route?.params?.isKycEdit) && <PageHeader title={props?.route?.params?.KycInformation && "GLOBAL_CONSTANTS.KYC" || props?.route?.params?.KybInformation && "GLOBAL_CONSTANTS.KYB_INFORMATION" || "GLOBAL_CONSTANTS.ADD_ADDRESS"} onBackPress={handleGoBack} />}
              {((props?.route?.params?.id || props?.route?.params?.isKybEdit) || props?.route?.params?.isKycEdit) && <PageHeader title={props?.route?.params?.KycInformation && "GLOBAL_CONSTANTS.EDIT_KYC" || props?.route?.params?.KybInformation && "GLOBAL_CONSTANTS.EDIT_KYB_INFORMATION" || "GLOBAL_CONSTANTS.EDIT_ADDRESS"} onBackPress={handleGoBack} />}

              {errormsg !== "" && (<ErrorComponent message={errormsg} onClose={handleCloseError} />)}
              {props?.route?.params?.KycInformation &&
                <ProgressHeader title={"GLOBAL_CONSTANTS.PERSONAL_ADDRESS"} NextTitle={"GLOBAL_CONSTANTS.IDENTIFICATION_DOCUMNETS"} progress={2} total={4} />
              }
              {props?.route?.params?.KybInformation &&
                <ProgressHeader title={"GLOBAL_CONSTANTS.PERSONAL_ADDRESS"} NextTitle={"GLOBAL_CONSTANTS.UBO_DETAILS_TITLE"} progress={2} total={5} />
              }

              <Formik
                initialValues={initValues}
                onSubmit={handleSave}
                validationSchema={CreateAccSchema}
                enableReinitialize
                validateOnChange={true}
                validateOnBlur={true}
              >
                {(formik) => {
                  const { touched, handleSubmit, errors, handleChange, handleBlur, values, setFieldValue, validateForm } = formik;
                  return (
                    <ViewComponent>
                      {/* ... other fields ... */}
                      <Field
                        touched={touched.firstName}
                        name="firstName"
                        label={"GLOBAL_CONSTANTS.FIRST_NAME"}
                        error={errors.firstName}
                        handleBlur={handleBlur}

                        placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"}
                        component={InputDefault}
                        innerRef={nameRef}
                        editable={true}
                        requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                      />
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <Field
                        touched={touched.lastName}
                        name="lastName"
                        label={"GLOBAL_CONSTANTS.LAST_NAME"}
                        error={errors.lastName}
                        handleBlur={handleBlur}

                        placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"}
                        component={InputDefault}
                        innerRef={nameRef}
                        editable={true}
                        requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                      />
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <Field
                        touched={touched.email}
                        name="email"
                        label={"GLOBAL_CONSTANTS.EMAIL"}
                        error={errors.email}
                        handleBlur={handleBlur}

                        placeholder={"GLOBAL_CONSTANTS.EMAIL_PLACEHOLDER"}
                        component={InputDefault}
                        innerRef={nameRef}
                        requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                      />
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <LabelComponent text={"GLOBAL_CONSTANTS.COUNTRY"} style={[commonStyles.inputLabel]}><LabelComponent text={"*"} style={commonStyles.textError} /></LabelComponent>
                      <Field
                        activeOpacity={0.9}
                        touched={touched?.country}

                        name="country"
                        error={errors?.country}
                        handleBlur={handleBlur}
                        modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                        data={countries}
                        placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                        component={CustomPickerAcc}
                        onChange={(item: any) => handleCountryChange(item, setFieldValue)}
                        sheetHeight={s(600)}
                        isOnlycountry={true}
                      />
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <Field
                        touched={touched.state}
                        name="state"
                        label={"GLOBAL_CONSTANTS.STATE"}
                        error={errors.state}
                        handleBlur={handleBlur}

                        placeholder={"GLOBAL_CONSTANTS.STATE_PLACEHOLDER"}
                        component={InputDefault}
                        innerRef={nameRef}
                        requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                      />
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <LabelComponent text={"GLOBAL_CONSTANTS.TOWN"} style={[commonStyles.inputLabel]}><LabelComponent text={"*"} style={commonStyles.textError} /></LabelComponent>
                      <Field
                        activeOpacity={0.9}
                        touched={touched?.town}

                        name="town"
                        error={errors?.town}
                        handleBlur={handleBlur}
                        modalTitle={"GLOBAL_CONSTANTS.SELECT_TOWN"}
                        data={townsList}
                        placeholder={"GLOBAL_CONSTANTS.SELECT_TOWN"}
                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                        component={CustomPickerAcc}
                        onChange={(item: any) => setFieldValue("town", item)}
                        sheetHeight={s(600)}
                        isOnlycountry={true}
                      />
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <Field
                        touched={touched.city}
                        name="city"
                        label={"GLOBAL_CONSTANTS.CITY"}
                        error={errors.city}
                        handleBlur={handleBlur}

                        placeholder={"GLOBAL_CONSTANTS.CITY_PLACEHOLDER"}
                        component={InputDefault}
                        innerRef={nameRef}
                        requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                      />
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <Field
                        touched={touched.addressLine1}
                        name="addressLine1"
                        label={"GLOBAL_CONSTANTS.ADDRESS_LINE1"}
                        error={errors.addressLine1}
                        handleBlur={handleBlur}

                        placeholder={"GLOBAL_CONSTANTS.ADDRESS_LINE1_PLACEHOLDER"}
                        component={InputDefault}
                        innerRef={nameRef}
                        requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                      />
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <Field
                        touched={touched.addressLine2}
                        name="addressLine2"
                        label={"GLOBAL_CONSTANTS.ADDRESS_LINE2"}
                        error={errors.addressLine2}
                        handleBlur={handleBlur}

                        placeholder={"GLOBAL_CONSTANTS.ADDRESS_LINE2_PLACEHOLDER"}
                        component={InputDefault}
                        innerRef={nameRef}
                      />
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <Field
                        touched={touched.postalCode}
                        name="postalCode"
                        label={"GLOBAL_CONSTANTS.POSTAL_CODE"}
                        error={errors.postalCode}
                        handleBlur={handleBlur}
                        autoCapitalize="words"
                        placeholder={"GLOBAL_CONSTANTS.POSTAL_CODE_PLACEHOLDER"}
                        component={InputDefault}
                        innerRef={nameRef}
                        requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                      />
                      <ViewComponent style={[commonStyles.formItemSpace]} />
                      <LabelComponent text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} style={[commonStyles.inputLabel]}><LabelComponent text={"*"} style={commonStyles.textError} /></LabelComponent>
                      <ViewComponent style={[commonStyles.relative, commonStyles.dflex, commonStyles.pr2]}>
                        <PhoneCodePicker
                          key={values.phoneCode} // <-- THIS IS THE ONLY LINE ADDED
                          inputStyle={{ borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderColor: touched?.phoneCode && errors?.phoneCode ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }}
                          modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"}
                          customBind={["name", "(", "code", ")"]}
                          data={countryCodelist}
                          value={values?.phoneCode}
                          placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_SELECT")}
                          containerStyle={[]}
                          onChange={(item: PhoneCodeItem) => handlePhoneCode(item, setFieldValue)}
                          sheetHeight={s(500)}
                          isOnlycountry={true}
                        />
                        <TextInput
                          style={[commonStyles.flex1, commonStyles.textInput, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderColor: touched?.phoneNumber && errors?.phoneNumber ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }]}
                          placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                          onChangeText={(text) => {
                            const formattedText = text.replace(/\D/g, "").slice(0, 13);
                            handleChange('phoneNumber')(formattedText);
                          }}
                          onBlur={handleBlur("phoneNumber")}
                          value={values.phoneNumber}
                          keyboardType="phone-pad"
                          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                          multiline={false}
                        />
                      </ViewComponent>
                      {(touched.phoneCode || touched.phoneNumber) && (() => {
                        let errorText: string | undefined = undefined;
                        if (typeof errors.phoneNumber === 'string') {
                          errorText = errors.phoneNumber;
                        } else if (typeof errors.phoneCode === 'string') {
                          errorText = errors.phoneCode;
                        }
                        return (
                          <ParagraphComponent multiLanguageAllows={true} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textError, commonStyles.mt4]} text={errorText} />
                        );
                      })()}
                      {!(props?.route?.params?.KycInformation ?? props?.route?.params?.KybInformation) &&
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justify, commonStyles.gap10, commonStyles.mt20]}>
                          <ParagraphComponent text={"GLOBAL_CONSTANTS.SET_AS_DEFAULT"} style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textWhite]} multiLanguageAllows={true} />
                          <Switch trackColor={{ true: NEW_COLOR.TEXT_PRIMARY, false: NEW_COLOR.TEXT_link }} thumbColor={NEW_COLOR.THUMBTOGGLE_BG} ios_backgroundColor=""
                            onValueChange={toggleSwitch}
                            value={isEnabled} />


                          {/* <Switch  trackColor={{ false: NEW_COLOR.TEXT_PRIMARY, true: NEW_COLOR.TEXT_GREY }} thumbColor={NEW_COLOR.TOGLE_THUMB} ios_backgroundColor=" "  value={isEnabled} /> */}

                        </ViewComponent>}
                      <ViewComponent style={[commonStyles.sectionGap]} />
                      <ButtonComponent
                        title="GLOBAL_CONSTANTS.SAVE"
                        loading={btnLoading}
                        onPress={() => {
                          handleValidationSave(validateForm);
                          handleSubmit();
                        }}
                        icon={undefined}
                      />
                      <ViewComponent style={[commonStyles.sectionGap]} />
                      <ViewComponent style={[commonStyles.sectionGap]} />

                    </ViewComponent>
                  );
                }}
              </Formik>
            </Container>
          </ScrollViewComponent>
        </KeyboardAvoidingView>
      )}
    </ViewComponent>
  );
};

export default AddPersonalInfo;
