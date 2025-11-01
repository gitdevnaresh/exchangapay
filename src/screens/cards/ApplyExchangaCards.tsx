import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  BackHandler,
  KeyboardAvoidingView,
  Dimensions,
  Keyboard,
  KeyboardEvent,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Container } from "../../components";
import DefaultButton from "../../components/DefaultButton";
import AntDesign from "react-native-vector-icons/AntDesign";
import Loadding from "../../components/skeleton";
import { NEW_COLOR } from "../../constants/theme/variables";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { ms, s } from "../../constants/theme/scale";
import StepComponent from "../../components/steps/Steps";
import { commonStyles } from "../../components/CommonStyles";
import {
  formatDateTimeAPI,
  formateExpiryValidationDate,
  isErrorDispaly,
} from "../../utils/helpers";
import CardsModuleService from "../../services/card";
import { ExchangeCardViewLoader } from "./CardsSkeleton_views";
import NoDataComponent from "../../components/nodata";
import ErrorComponent from "../../components/Error";
import { useIsFocused } from "@react-navigation/native";
import { Formik } from "formik";
import { FormData, generateValidationSchema } from "./constant";
import KycAddress from "./kycAddress";
import moment from "moment";
import useMemberLogin from "../../hooks/useMemberLogin";
import { ReviewImage } from "../../assets/svg/";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";

const { width } = Dimensions.get("window");
const isPad = width > 600;
interface ApplyCardDetails {
  name: string;
  value: string;
}

interface PersonalInfo {
  address: string;
  city: string;
  country: string;
  customerId: string;
  fullName: string;
  isDefault: boolean;
  personalAddressId: string;
  phoneNo: string;
  state: string;
  town: string;
}

interface Profile {
  idNumber: string | null;
  idType: string | null;
  name: string;
  phoneNo: string;
  profileId: string;
}

interface ApplyCardInterface {
  applyCarddetails: ApplyCardDetails[];
  colorCode: string | null;
  cryptoWalletId: string | null;
  isDummyAddress: boolean;
  isKycRequired: boolean;
  kycRequiredWhileApplyCard: boolean;
  personalInfo: PersonalInfo | null | any;
  profile: Profile | any;
}

const ApplyExchangaCard = (props: any) => {
  const isFocus = useIsFocused();
  const ref = useRef<any>(null);
  const [applyCardsLoading, setApplyCardsLoading] = useState<boolean>(false);
  const [applyCardsInfo, setApplyCardsInfo] = useState<any>([]);
  const [errormsg, setErrormsg] = useState<string>("");
  const [personalInfoData, setPersonalInfoData] = useState<any>(null);
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [isKycRequired, setIsKycRequired] = useState<any>(false);
  const [cardDetails, setCardDetails] = useState<ApplyCardInterface>(null);
  const [kycRequiredWhileApplyCard, setkycRequiredWhileApplyCard] =
    useState<boolean>(false);
  const [cryptoWalletId, setCryptoWalletId] = useState<any>(null);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const personalInfo = useSelector(
    (state: any) => state.UserReducer?.personalInfo
  );
  const [kycReqList, setKycReqList] = useState([]);
  const [btnLoader, setBtnLoader] = useState(false);
  const { encryptAES, decryptAES } = useEncryptDecrypt();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const [initialValues, setIntialValues] = useState<any>({
    firstName: "",
    lastName: "",
    country: "",
    state: "",
    dob: "",
    gender: "",
    city: "",
    town: "",
    addressLine1: "",
    mobile: "",
    mobileCode: "",
    email: "",
    idType: "passport",
    idNumber: "",
    docExpiryDate: "",
    postalCode: "",
    faceImage: "",
    signature: "",
    profilePicBack: "",
    profilePicFront: "",
    handHoldingIDPhoto: "",
    biometric: "",
    emergencyContactName: "",
    kycRequirements: "",
    occupation: null,
    annualSalary: null,
    accountPurpose: null,
    expectedMonthlyVolume: null,
    docissueDate: null,
  });
  const isCardKYCCompleted = useSelector(
    (state: any) => state.UserReducer?.isCardKycComplete
  );
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    country: "",
    state: "",
    dob: "",
    gender: "",
    city: "",
    town: "",
    addressLine1: "",
    mobile: "",
    mobileCode: "",
    email: "",
    idType: "passport",
    idNumber: "",
    docExpiryDate: "",
    postalCode: "",
    faceImage: "",
    signature: "",
    profilePicBack: "",
    profilePicFront: "",
    handHoldingIDPhoto: "",
    biometric: "",
    emergencyContactName: "",
    kycRequirements: "",
    occupation: "",
    annualSalary: "",
    accountPurpose: "",
    expectedMonthlyVolume: "",
    docissueDate: "",
  });

  const ExchangeCardSkeleton = ExchangeCardViewLoader();
  const { getMemDetails } = useMemberLogin();
  const stepContents = [
    <ParagraphComponent
      style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw600]}
      text="Application information"
    />,
    <ParagraphComponent
      style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw600]}
      text="Fee "
    />,
    <ParagraphComponent
      style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw600]}
      text="To Be Reviewed"
    />,
  ];
  useEffect(() => {
    getApplyCardDeatilsInfo();
    getMemDetails({}, undefined, true);
    ref?.current?.scrollTo({ y: 0, animated: true });
  }, [isFocus]);

  const getApplyCardDeatilsInfo = async () => {
    const cardId = props?.route?.params?.cardId;
    try {
      setApplyCardsLoading(true);
      const response: any = await CardsModuleService?.getApplyCardsCustomerInfo(
        cardId
      );
      if (response?.status === 200) {
        setCardDetails(response?.data);
        setApplyCardsInfo(response?.data?.applyCarddetails);
        if (personalInfo) {
          setPersonalInfoData(personalInfo);
        } else {
          setPersonalInfoData(response?.data?.personalInfo);
        }
        setProfileInfo(response?.data?.profile);
        setIsKycRequired(response?.data?.isKycRequired);
        setkycRequiredWhileApplyCard(
          response?.data?.setkycRequiredWhileApplyCard
        );
        setCryptoWalletId(response?.data?.cryptoWalletId);
        setErrormsg("");
        setApplyCardsLoading(false);
        const kycRequirements = response?.data?.kycRequirements;
        const mappedKycRequirements = kycRequirements
          ? kycRequirements.split(",").map((req: any) => req.toLowerCase())
          : [];
        setKycReqList(mappedKycRequirements);

        if (props?.route?.params?.kycFormData) {
          setFormData((prevData) => ({
            ...prevData,
            ...props?.route?.params?.kycFormData,
            firstName: decryptAES(props?.route?.params?.kycFormData?.firstName),
            lastName: decryptAES(props?.route?.params?.kycFormData?.lastName),
            idNumber: decryptAES(props?.route?.params?.kycFormData?.idNumber),
            email: decryptAES(props?.route?.params?.kycFormData?.email),
            mobile: decryptAES(props?.route?.params?.kycFormData?.mobile),
            postalCode: decryptAES(
              props?.route?.params?.kycFormData?.postalCode
            ),
            mobileCode: decryptAES(
              props?.route?.params?.kycFormData?.mobileCode
            ),
            docExpiryDate:
              (decryptAES(props?.route?.params?.kycFormData?.docExpiryDate) &&
                new Date(
                  decryptAES(props?.route?.params?.kycFormData?.docExpiryDate)
                )) ||
              null,
            emergencyContactName:
              decryptAES(
                props?.route?.params?.kycFormData?.emergencyContactName
              ) || null,
            docissueDate:
              (decryptAES(props?.route?.params?.kycFormData?.docissueDate) &&
                new Date(
                  decryptAES(props?.route?.params?.kycFormData?.docissueDate)
                )) ||
              null,
            expectedMonthlyVolume: props?.route?.params?.kycFormData
              ?.expectedMonthlyVolume
              ? props?.route?.params?.kycFormData?.expectedMonthlyVolume?.toString()
              : "",
            annualSalary: props?.route?.params?.kycFormData?.annualSalary
              ? props?.route?.params?.kycFormData?.annualSalary?.toString()
              : "",
          }));
          setIntialValues((prevData) => ({
            ...prevData,
            ...props?.route?.params?.kycFormData,
            firstName: decryptAES(props?.route?.params?.kycFormData?.firstName),
            lastName: decryptAES(props?.route?.params?.kycFormData?.lastName),
            idNumber: decryptAES(props?.route?.params?.kycFormData?.idNumber),
            email: decryptAES(props?.route?.params?.kycFormData?.email),
            mobile: decryptAES(props?.route?.params?.kycFormData?.mobile),
            postalCode: decryptAES(
              props?.route?.params?.kycFormData?.postalCode
            ),
            mobileCode: decryptAES(
              props?.route?.params?.kycFormData?.mobileCode
            ),
            emergencyContactName:
              decryptAES(
                props?.route?.params?.kycFormData?.emergencyContactName
              ) || null,
            docissueDate:
              (decryptAES(props?.route?.params?.kycFormData?.docissueDate) &&
                new Date(
                  decryptAES(props?.route?.params?.kycFormData?.docissueDate)
                )) ||
              null,
            expectedMonthlyVolume: props?.route?.params?.kycFormData
              ?.expectedMonthlyVolume
              ? props?.route?.params?.kycFormData?.expectedMonthlyVolume?.toString()
              : "",
            annualSalary: props?.route?.params?.kycFormData?.annualSalary
              ? props?.route?.params?.kycFormData?.annualSalary?.toString()
              : "",
          }));
        } else {
          setFormData((prevData) => ({
            ...prevData,
            ...response?.data,
            firstName: decryptAES(response?.data?.firstName),
            lastName: decryptAES(response?.data?.lastName),
            idNumber: decryptAES(response?.data?.idNumber),
            email: decryptAES(response?.data?.email),
            mobile: decryptAES(response?.data?.mobile),
            postalCode: decryptAES(response?.data?.postalCode),
            mobileCode: decryptAES(response?.data?.mobileCode),
            dob: (response.data?.dob && new Date(response.data?.dob)) || null,
            emergencyContactName:
              decryptAES(response.data?.emergencyContactName) || null,
            docExpiryDate:
              (decryptAES(response.data?.docExpiryDate) &&
                formateExpiryValidationDate(
                  decryptAES(response.data?.docExpiryDate)
                )) ||
              null,
            idType:
              (response?.data?.idType === null && "passport") ||
              response?.data?.idType,
            docissueDate:
              (decryptAES(response?.data?.docissueDate) &&
                new Date(decryptAES(response.data?.docissueDate))) ||
              null,
            expectedMonthlyVolume: response?.data?.expectedMonthlyVolume
              ? response?.data?.expectedMonthlyVolume?.toString()
              : "",
            annualSalary: response?.data?.annualSalary
              ? response?.data?.annualSalary?.toString()
              : "",
            town: "",
          }));
          setIntialValues((prev: any) => ({
            ...prev,
            ...response?.data,
            firstName: decryptAES(response?.data?.firstName),
            lastName: decryptAES(response?.data?.lastName),
            idNumber: decryptAES(response?.data?.idNumber),
            email: decryptAES(response?.data?.email),
            mobile: decryptAES(response?.data?.mobile),
            postalCode: decryptAES(response?.data?.postalCode),
            mobileCode: decryptAES(response?.data?.mobileCode),
            dob: (response.data?.dob && new Date(response.data?.dob)) || null,
            emergencyContactName:
              decryptAES(response.data?.emergencyContactName) || null,
            docExpiryDate:
              (decryptAES(response.data?.docExpiryDate) &&
                formateExpiryValidationDate(
                  decryptAES(response.data?.docExpiryDate)
                )) ||
              null,
            idType:
              (response?.data?.idType === null && "passport") ||
              response?.data?.idType,
            docissueDate:
              (decryptAES(props?.route?.params?.kycFormData?.docissueDate) &&
                new Date(
                  decryptAES(props?.route?.params?.kycFormData?.docissueDate)
                )) ||
              null,
            expectedMonthlyVolume: response.data?.expectedMonthlyVolume
              ? response.data?.expectedMonthlyVolume?.toString()
              : "",
            annualSalary: response.data?.annualSalary
              ? response.data?.annualSalary?.toString()
              : "",
            town: "",
          }));
        }
      } else {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setApplyCardsLoading(false);
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
      setApplyCardsLoading(false);
    }
  };
  const handleRedirectToExchangeCard = async (values?: any) => {
    const formattedValues = {
      ...values,
      dob: (values?.dob !== null && moment(values?.dob).toISOString()) || null,
      docExpiryDate:
        (values?.docExpiryDate !== "" &&
          moment(values?.docExpiryDate).toISOString()) ||
        null,
      docissueDate:
        (values?.docissueDate !== "" &&
          moment(values?.docissueDate).toISOString()) ||
        null,
      faceImage: (values?.faceImage !== "" && values?.faceImage) || null,
      signature: (values?.signature !== "" && values?.signature) || null,
      profilePicBack:
        (values?.profilePicFront !== "" && values?.profilePicFront) || null,
      profilePicFront:
        (values?.profilePicFront !== "" && values?.profilePicFront) || null,
      handHoldingIDPhoto:
        (values?.handHoldingIDPhoto !== "" && values?.handHoldingIDPhoto) ||
        null,
      biometric: (values?.biometric !== "" && values?.biometric) || null,
    };
    const dateOfBirth = formatDateTimeAPI(formattedValues?.dob);
    const expiryDate = formatDateTimeAPI(formattedValues?.docExpiryDate);
    const docissueDate = formatDateTimeAPI(formattedValues?.docissueDate);
    let Obj = {
      cardId: props?.route?.params?.cardId,
      firstName: encryptAES(formattedValues?.firstName),
      lastName: encryptAES(formattedValues?.lastName),
      dob: dateOfBirth || null,
      gender: formattedValues?.gender || null,
      docExpiryDate: encryptAES(expiryDate) || null,
      handHoldingIDPhoto: formattedValues?.handHoldingIDPhoto,
      faceImage: formattedValues?.faceImage,
      profilePicFront: formattedValues?.profilePicFront || null,
      profilePicBack: formattedValues?.profilePicBack || null,
      backDocImage: formattedValues?.profilePicBack || null,
      signature: formattedValues?.signature || null,
      biometric: formattedValues?.biometric || null,
      addressLine1: formattedValues?.addressLine1,
      city: formattedValues?.city || null,
      country: formattedValues?.country || null,
      state: formattedValues?.state || null,
      town: formattedValues?.town || null,
      idNumber: encryptAES(formattedValues?.idNumber),
      idType: formattedValues?.idType,
      email: encryptAES(formattedValues?.email || null),
      mobile: encryptAES(formattedValues?.mobile || null),
      postalCode: encryptAES(formattedValues?.postalCode || null),
      mobileCode: encryptAES(formattedValues?.mobileCode || null),
      kycRequirements: formData.kycRequirements,
      emergencyContactName:
        encryptAES(formattedValues?.emergencyContactName) || null,
      docissueDate: docissueDate ? encryptAES(docissueDate) : null,
      occupation: formattedValues?.occupation || null,
      annualSalary: formattedValues?.annualSalary
        ? parseFloat(formattedValues?.annualSalary)
        : null,
      accountPurpose: formattedValues?.accountPurpose || null,
      expectedMonthlyVolume: formattedValues?.expectedMonthlyVolume
        ? parseFloat(formattedValues?.expectedMonthlyVolume)
        : null,
    };

    if (!isKycRequired) {
      props.navigation.push("FeeStep", {
        cardId: props?.route?.params?.cardId,
        profileId: profileInfo?.profileId,
        logo: props?.route?.params?.logo,
        cryptoWalletId: cryptoWalletId,
        personalAddressId: personalInfoData?.personalAddressId,
        cardType: props?.route?.params?.cardType,
        kycFormData: Obj,
      });
    } else {
      setBtnLoader(true);

      props.navigation.navigate("FeeStep", {
        cardId: props?.route?.params?.cardId,
        profileId: profileInfo?.profileId,
        logo: props?.route?.params?.logo,
        cryptoWalletId: cryptoWalletId,
        personalAddressId: personalInfoData?.personalAddressId,
        cardType: props?.route?.params?.cardType,
        kycFormData: Obj,
      });
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const handleKeyboardShow = (_event: KeyboardEvent) => {
      setIsKeyboardVisible(true);
      requestAnimationFrame(() => {
        ref?.current?.scrollToEnd?.({ animated: true });
      });
    };

    const handleKeyboardHide = () => {
      setIsKeyboardVisible(false);
    };

    const keyboardShowListener = Keyboard.addListener(
      showEvent,
      handleKeyboardShow
    );
    const keyboardHideListener = Keyboard.addListener(
      hideEvent,
      handleKeyboardHide
    );

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const handleBack = () => {
    props.navigation.navigate("ApplyCard", {
      cardId: props?.route?.params?.cardId,
      animation: "slide_from_left",
      logo: props?.route?.params?.logo,
      cardType: props?.route?.params?.cardType,
    });
  };

  const handleSumsub = () => {
    if (userInfo?.isSumsubKyc) {
      props.navigation.navigate("sumsubCompnent", {
        screenName: "ApplyCard",
        cardKycLevl: props?.route?.params?.cardKycLevl,
        cardId: props?.route?.params?.cardId,
        logo: props?.route?.params?.logo,
        cardType: props?.route?.params?.cardType,
      });
    } else {
      props.navigation.navigate("addKycInfomation", {
        screenName: "ApplyCard",
        cardKycLevl: props?.route?.params?.cardKycLevl,
        cardId: props?.route?.params?.cardId,
        logo: props?.route?.params?.logo,
        cardType: props?.route?.params?.cardType,
      });
    }
  };
  return (
    <SafeAreaView style={[commonStyles.screenBg, { flex: 1 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? ms(24) : ms(-55)}
        style={[commonStyles.screenBg, commonStyles.flex1]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          ref={ref}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: isKeyboardVisible
              ? insets.bottom + ms(6)
              : insets.bottom + ms(32),
          }}
        >
          <Container style={commonStyles.container}>
            {applyCardsLoading && (
              <View style={[commonStyles.flex1]}>
                <Loadding contenthtml={ExchangeCardSkeleton} />
              </View>
            )}
            {!applyCardsLoading && (
              <View>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.alignCenter,
                    commonStyles.mb32,
                    commonStyles.gap16,
                  ]}
                >
                  <TouchableOpacity style={[]} onPress={() => handleBack()}>
                    <View>
                      <AntDesign
                        name="arrowleft"
                        size={s(22)}
                        color={NEW_COLOR.TEXT_BLACK}
                        style={{ marginTop: 3 }}
                      />
                    </View>
                  </TouchableOpacity>
                  <ParagraphComponent
                    text="Apply For Exchanga Pay Card"
                    style={[
                      commonStyles.fs16,
                      commonStyles.textBlack,
                      commonStyles.fw700,
                    ]}
                  />
                </View>
                {errormsg && (
                  <>
                    <ErrorComponent
                      message={errormsg}
                      onClose={() => setErrormsg("")}
                    />
                    <View style={commonStyles.mt8} />
                  </>
                )}
                <View style={commonStyles.mt8} />
                <View>
                  <StepComponent
                    totalSteps={3}
                    currentStep={1}
                    stepContents={stepContents}
                  />
                </View>
                {isPad && <View style={[commonStyles.mb24]} />}
                <View
                  style={[styles.darkBg, commonStyles.p16, commonStyles.mb16]}
                >
                  {applyCardsInfo &&
                    applyCardsInfo?.map((item: any, index: any) => (
                      <>
                        <View
                          key={index}
                          style={[
                            commonStyles.dflex,
                            commonStyles.alignCenter,
                            commonStyles.justifyContent,
                          ]}
                        >
                          <ParagraphComponent
                            style={[
                              commonStyles.fs12,
                              commonStyles.fw400,
                              commonStyles.textGrey,
                              commonStyles.flex1,
                            ]}
                            text={`${item?.name}`}
                          />
                          <ParagraphComponent
                            style={[
                              commonStyles.fs14,
                              commonStyles.fw500,
                              commonStyles.textBlack,
                              commonStyles.textRight,
                              commonStyles.flex1,
                            ]}
                            text={`${item?.value}`}
                          />
                        </View>
                        {index !== applyCardsInfo.length - 1 && (
                          <View
                            style={[
                              commonStyles.dashedLine,
                              commonStyles.mt10,
                              commonStyles.mb10,
                              { opacity: 0.5 },
                            ]}
                          />
                        )}
                      </>
                    ))}
                  {!applyCardsLoading && applyCardsInfo.length < 1 && (
                    <>
                      <NoDataComponent />
                      <View style={[commonStyles.mb16]} />
                    </>
                  )}
                </View>

                <View>
                  <Formik
                    initialValues={formData}
                    enableReinitialize
                    validationSchema={generateValidationSchema(kycReqList)}
                    onSubmit={handleRedirectToExchangeCard}
                    validateOnBlur={true}
                    validateOnChange={false}
                  >
                    {(formikProps) => {
                      const {
                        touched,
                        errors,
                        handleBlur,
                        values,
                        setFieldValue,
                        handleChange,
                        handleSubmit,
                      } = formikProps;
                      useEffect(() => {
                        if (Object.keys(errors).length > 0) {
                          ref?.current?.scrollTo({ y: 0, animated: true });
                        }
                      }, [errors]);
                      return (
                        <>
                          {isKycRequired && userInfo?.isKYC && (
                            <>
                              <KycAddress
                                touched={touched}
                                errors={errors}
                                handleBlur={handleBlur}
                                values={values}
                                setFieldValue={setFieldValue}
                                handleChange={handleChange}
                                kycReqList={kycReqList}
                                formData={formData}
                                disableFields={initialValues}
                                cardId={props?.route?.params?.cardId}
                              />
                              <View style={[commonStyles.mb43]} />
                            </>
                          )}

                          {!isKycRequired && (
                            <>
                              <KycAddress
                                touched={touched}
                                errors={errors}
                                handleBlur={handleBlur}
                                values={values}
                                setFieldValue={setFieldValue}
                                handleChange={handleChange}
                                kycReqList={kycReqList}
                                formData={formData}
                                disableFields={initialValues}
                                cardId={props?.route?.params?.cardId}
                              />

                              <View style={[commonStyles.mb43]} />
                            </>
                          )}
                          {isKycRequired &&
                            !isCardKYCCompleted &&
                            !userInfo?.isKYC && (
                              <View>
                                <View style={[commonStyles.mb24]} />
                                <DefaultButton
                                  title={"Continue to Complete KYC"}
                                  customTitleStyle={styles.mr30}
                                  disable={undefined}
                                  loading={btnLoader}
                                  onPress={handleSumsub}
                                />
                              </View>
                            )}

                          {isKycRequired &&
                            isCardKYCCompleted &&
                            !userInfo?.isKYC && (
                              <View
                                style={[
                                  commonStyles.bgCard,
                                  commonStyles.mt14,
                                  commonStyles.rounded16,
                                  commonStyles.p16,
                                ]}
                              >
                                <ReviewImage
                                  width={80}
                                  height={80}
                                  style={{ alignSelf: "center" }}
                                />
                                <ParagraphComponent
                                  style={[
                                    commonStyles.textCenter,
                                    commonStyles.textBlack,
                                    commonStyles.fs18,
                                    commonStyles.fw500,
                                    commonStyles.mb16,
                                    commonStyles.mt10,
                                  ]}
                                  text={"Your KYC is under review."}
                                />
                              </View>
                            )}

                          <View
                            style={{
                              marginBottom: isKeyboardVisible ? ms(4) : ms(24),
                            }}
                          />
                          {(!isKycRequired ||
                            (isKycRequired && userInfo?.isKYC)) && (
                            <DefaultButton
                              title={"Next"}
                              style={undefined}
                              disable={undefined}
                              loading={btnLoader}
                              onPress={() => {
                                ref?.current?.scrollTo({
                                  y: 0,
                                  animated: true,
                                });
                                handleSubmit();
                              }}
                            />
                          )}
                          <View
                            style={{
                              marginBottom: isKeyboardVisible
                                ? insets.bottom
                                : ms(24),
                            }}
                          />
                        </>
                      );
                    }}
                  </Formik>
                </View>
              </View>
            )}
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ApplyExchangaCard;

const styles = StyleSheet.create({
  darkBg: {
    backgroundColor: NEW_COLOR.MENU_CARD_BG,
    borderRadius: 16,
  },
  contentBorder: {
    borderRadius: 16,
    backgroundColor: NEW_COLOR.MENU_CARD_BG,
    padding: 16,
  },
  opacity6: { opacity: 0.6 },
  bgpurple: {
    backgroundColor: NEW_COLOR.BG_ORANGE,
    paddingHorizontal: 12,
    paddingVertical: 4,
    position: "absolute",
    top: 0,
    left: "32%",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  circle: {
    borderRadius: 42 / 2,
    height: 42,
    width: 42,
    backgroundColor: NEW_COLOR.USER_ICON_BG,
  },
  pl12: { paddingLeft: 12 },
  mb28: { marginBottom: 28 },
  mr8: { marginRight: 8 },
  mt32: { marginTop: 32 },
  textNormal: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 19,
  },
  mr30: { marginRight: ms(30) },
  noData: {
    fontSize: ms(16),
    fontWeight: "400",
    color: NEW_COLOR.TEXT_GREY,
    marginTop: 22,
  },
  custNodata: {
    marginTop: 22,
    marginBottom: 80,
  },
  cAccount: {
    justifyContent: "center",
    alignItems: "center",
  },
});
