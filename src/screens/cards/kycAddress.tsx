import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
  Text,
  ActivityIndicator,
  Modal,
  Platform,
  Alert,
  Keyboard,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { Field } from "formik";
import LabelComponent from "../../components/Paragraph/label";
import { commonStyles } from "../../components/CommonStyles";
import RadioButton from "../../components/Button/RadioButton";
import DatePickers from "react-native-date-picker";
import Feather from "react-native-vector-icons/Feather";
import InputDefault from "../../components/DefaultFiat";
import {
  CREATE_KYC_ADDRESS_CONST,
  FORM_DATA_CONSTANTS,
  FORM_DATA_LABEL,
  FORM_DATA_PLACEHOLDER,
  KycAddressProps,
  LoadingState,
  refKycDetailsInterface,
} from "./constant";
import {
  NEW_COLOR,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "../../constants/theme/variables";
import ProfileService from "../../services/profile";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { formatDateMonth, isErrorDispaly } from "../../utils/helpers";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomPicker from "../../components/CustomPicker";
import CustomPickerAcc from "../../components/CustomPicker";
import PhoneCodePicker from "../../components/PhoneCodeSelect";
import CardsModuleService from "../../services/card";
import ErrorComponent from "../../components/Error";
import { ms, s } from "../../constants/theme/scale";
import { useIsFocused } from "@react-navigation/native";
import DefaultButton from "../../components/DefaultButton";
import AntDesign from "react-native-vector-icons/AntDesign";
import SignatureScreen, {
  SignatureViewRef,
} from "react-native-signature-canvas";
import { PLACEHOLDER_CONSTANTS, PROFILE_CONSTANTS } from "../Profile/constants";
import { PERMISSIONS, request, RESULTS } from "react-native-permissions";
import OverlayPopup from "./SelectPopup";
import { useSelector } from "react-redux";
import CommonOverlay from "../../components/commonOverlyPopup";

const KycAddress: React.FC<KycAddressProps> = ({
  handleBlur,
  values,
  setFieldValue,
  handleChange,
  touched,
  errors,
  kycReqList,
  formData,
  disableFields,
  cardId,
}) => {
  const ref = useRef<any>(null);
  const kycDetailsRef = useRef<refKycDetailsInterface>({
    firstName: null,
    lastName: null,
    country: null,
    state: null,
    dob: null,
    gender: null,
    city: null,
    town: null,
    addressLine1: null,
    mobile: null,
    mobileCode: null,
    email: null,
    idType: null,
    idNumber: null,
    docExpiryDate: null,
    postalCode: null,
    faceImage: null,
    signature: null,
    profilePicBack: null,
    profilePicFront: null,
    handHoldingIDPhoto: null,
    biometric: null,
    emergencyContactName: null,
    kycRequirements: null,
    occupation: null,
    annualSalary: null,
    accountPurpose: null,
    expectedMonthlyVolume: null,
    docissueDate: null,
  });
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [genderLookUp, setGenderLookUp] = useState<any>([]);
  const [errormsg, setErrormsg] = useState<string>("");
  const [passportImg, setPassportImg] = useState<any>("");
  const isFocused = useIsFocused();
  const [idTypesLookUp, setIdTypesLookUp] = useState<any>([]);
  const [expirydate, setExpirydate] = useState<Date | null>(null);
  const [expiryDatePicker, setExpiryDatePicker] = useState<boolean>(false);
  const [countries, setCountries] = useState<any>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [countryCodelist, setCountryCodelist] = useState<any>([]);
  const [townsLookup, setTownsLookUp] = useState<any>([]);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const [docissueDate, setDocissueDate] = useState<Date | null>(null);
  const [issueDatePicker, setIssueDatePicker] = useState<boolean>(false);
  const [occupationList, setOccupationList] = useState<any>([]);
  const [isTownsDataLoading, setIsTownsDataLoading] = useState<boolean>(false);
  const [signSaveLoader, setSignSaveLoader] = useState<boolean>(false);

  const [loadingState, setLoadingState] = useState<LoadingState>({
    profilePicFront: false,
    handHoldingIDPhoto: false,
    faceImage: false,
    signature: false,
    biometric: false,
    signModelVisible: false,
    drawSignModel: false,
    facePopup: false,
    loadingType: ""
  });
  const [uploadValidation, setUploadValidation] = useState({
    handHoldingIDPhoto: null,
  });

  const signatureRef = useRef<SignatureViewRef>(null);
  useEffect(() => {
    fetchLookUps();
    getOccupationList();
    if (values?.country) {
      getListOfCountryCodeDetails();
    } else {
      getListOfCountryCodeDetails();
    }
    getListOfCountryDetails();
  }, [isFocused, values?.country]);

  const getOccupationList = async () => {
    try {
      const response: any = await CardsModuleService.getOccupationLookup();
      setOccupationList(response.data);
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
    }
  };

  const handleSaveSignature = async (event: any) => {
    setSignSaveLoader(true);
    if (event) {
      await handleDrawSign(event, FORM_DATA_CONSTANTS?.SIGNATURE);

      togglePopup();
    }
    setSignSaveLoader(false);
  };
  const handleIssueDateModel = () => {
    setIssueDatePicker(!issueDatePicker);
  };

  const handleClear = () => {
    signatureRef?.current?.clearSignature();
  };

  const handleConfirm = () => {
    signatureRef?.current?.readSignature();
  };

  const signatureStyle = `.m-signature-pad {box-shadow: none; border: none; } 
                    .m-signature-pad--body {border: none;}
                    .m-signature-pad--footer {display: none; margin: 0px;}
                    body,html {width: 100%; height: 100%;}`;

  const SignatureContext = (
    <View style={styles.popupContent}>
      <View
        style={[
          commonStyles.dflex,
          commonStyles.justifyContent,
          commonStyles.alignCenter,
          commonStyles.mb30,
        ]}
      >
        <ParagraphComponent
          text={PROFILE_CONSTANTS.SIGN_HERE}
          style={[
            commonStyles.textBlack,
            commonStyles.fs16,
            commonStyles.fw700,
          ]}
        />
        <TouchableOpacity onPress={togglePopup}>
          <AntDesign
            name={PROFILE_CONSTANTS.CLOSE}
            size={s(22)}
            color={NEW_COLOR.TEXT_BLACK}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.signatureCaptureContainer}>
        <SignatureScreen
          ref={signatureRef}
          onOK={handleSaveSignature}
          onEmpty={() => { }}
          descriptionText="Sign here"
          clearText="Clear"
          confirmText="Save"
          penColor="#000000"
          backgroundColor="#ffffff"
          webStyle={signatureStyle}
        />
      </View>
      <View style={[commonStyles.mb24]} />

      <DefaultButton
        title={PROFILE_CONSTANTS.SAVE}
        style={undefined}
        loading={signSaveLoader}
        disable={undefined}
        onPress={handleConfirm}
      />
      <View style={[commonStyles.mb16]} />
      <DefaultButton
        title={PROFILE_CONSTANTS.RESET}
        style={undefined}
        backgroundColors={undefined}
        colorful={undefined}
        loading={undefined}
        disable={undefined}
        onPress={handleClear}
        transparent={true}
        iconArrowRight={false}
        closeIcon={true}
      />
    </View>
  );

  const togglePopup = () => {
    setLoadingState((prev: any) => ({
      ...prev,
      signModelVisible: !loadingState?.signModelVisible,
    }));
    setLoadingState((prev) => ({ ...prev, drawSignModel: false }));
  };

  const handleDrawSign = async (event: any, fieldName: string) => {
    setLoadingState((prev) => ({ ...prev, drawSignModel: false }));

    try {
      const cleanBase64 = event?.replace(/^data:image\/\w+;base64,/, "");
      let Obj = {
        imageBytes: cleanBase64,
      };
      const uploadRes: any = await ProfileService.uploadSingnitureFile(Obj);
      if (uploadRes.status === 200) {
        const imageUrl = uploadRes?.data?.[0] || "";
        setFieldValue(fieldName, imageUrl);
        setErrormsg("");
      } else {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrormsg(isErrorDispaly(uploadRes));
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(err));
    }
  };

  const handleExpiryDateModel = () => {
    setExpiryDatePicker(!expiryDatePicker);
  };
  const fetchLookUps = async () => {
    try {
      const response: any = await ProfileService.getprofileEditLookups();
      setGenderLookUp(response.data.Gender);
      setIdTypesLookUp(response.data.IdTypes);
      if (response.data.IdTypes.length === 1) {
        setFieldValue(
          FORM_DATA_CONSTANTS?.ID_TYPE,
          response.data.IdTypes[0].name
        );
      }
      setErrormsg("");
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
    }
  };
  const getCardTowns = async (countyCode: any) => {
    setIsTownsDataLoading(true);
    try {
      const response: any = await CardsModuleService.getTownsLookup(
        cardId,
        countyCode
      );
      if (response?.ok) {
        setIsTownsDataLoading(false);
        setTownsLookUp(response?.data);
      } else {
        setIsTownsDataLoading(false);
      }
    } catch (error) {
      setIsTownsDataLoading(false);
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
    }
  };

  const getListOfCountryDetails = async () => {
    const response: any = await CardsModuleService.getTowns();
    if (response?.ok) {
      setCountries(response?.data);
      const countryName = values?.country || formData?.country;
      if (countryName && response?.data.length >= 1) {
        const _country = response.data?.find(
          (item: any) => item?.name === values?.country
        );
        getCardTowns(_country?.code);
      }
      setErrormsg("");
    } else {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(response));
    }
  };
  const getListOfCountryCodeDetails = async () => {
    const response: any = await CardsModuleService.getPersonalAddressLu();
    if (response?.status === 200) {
      setCountryCodelist(response?.data?.PhoneCodes);
      setErrormsg("");
    } else {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(response));
    }
  };
  const acceptedExtensions = [".jpg", ".jpeg", ".png"];
  const verifyFileTypes = (fileList) => {
    const fileName = fileList;
    if (!hasAcceptedExtension(fileName)) {
      return false;
    }

    return true;
  };
  const hasAcceptedExtension = (fileName: string) => {
    const extension = fileName
      .substring(fileName.lastIndexOf("."))
      .toLowerCase();
    return acceptedExtensions.includes(extension);
  };
  const verifyFileSize = (fileSize: any) => {
    const maxSizeInBytes = 20 * 1024 * 1024;
    return fileSize <= maxSizeInBytes;
  };

  const handleDateOfBirthModel = () => {
    setShowPicker(!showPicker);
  };

  const handlePopup = () => {
    setLoadingState((prev) => ({
      ...prev,
      drawSignModel: !loadingState?.drawSignModel,
    }));
  };

  const selectImage = async (fieldName: string, isCamera?: boolean) => {
    Keyboard.dismiss();
    setLoadingState((prev) => ({
      ...prev,
      drawSignModel: false,
      loadingType: isCamera ? 'methodOne' : 'methodTwo', // 👈 track type
    }));

    try {
      setErrormsg("");
      setLoadingState((prevState) => ({
        ...prevState,
        [fieldName]: true,
      }));
      let result;
      if (isCamera === true) {
        const hasPermission = await requestCameraPermission();

        if (!hasPermission) {
          return;
        } else {
          result = await launchCamera({ mediaType: FORM_DATA_CONSTANTS?.PHOTO, cameraType: FORM_DATA_CONSTANTS?.FRONT });

        };
      } else {
        result = await launchImageLibrary({ mediaType: "photo" });

      };


      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const isValid = verifyFileTypes(result.assets[0].fileName);
        const isValidSize = verifyFileSize(result.assets[0].fileSize);
        if (isValid && isValidSize) {
          let formData = new FormData();
          formData.append(FORM_DATA_CONSTANTS?.DOCUMENT, {
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          });

          const uploadRes = await ProfileService.uploadFile(formData);
          if (uploadRes.status === 200) {
            const imageUrl = uploadRes?.data?.[0] || "";
            setFieldValue(fieldName, imageUrl);
            setErrormsg("");
            setLoadingState((prev) => ({ ...prev, facePopup: false }));

          } else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(uploadRes));
            setLoadingState((prev) => ({ ...prev, facePopup: false }));

          }
        } else {
          if (!isValid) {
            setErrormsg(CREATE_KYC_ADDRESS_CONST.ACCEPTS_ONLY_JPG_OR_PNG_FORMATE);
          } else if (!isValidSize) {
            setErrormsg(CREATE_KYC_ADDRESS_CONST.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB);
          }
          ref?.current?.scrollTo({ y: 0, animated: true });

        }
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(err));
    } finally {

      setLoadingState((prevState) => ({
        ...prevState,
        [fieldName]: false,
        facePopup: false,
        loadingType: ''
      }));
    }
  };


  const handleErrorComonent = () => {
    setErrormsg("");
  };

  const handleOpenFacePopup = () => {
    setLoadingState((prev) => ({
      ...prev,
      facePopup: !loadingState?.facePopup,
    }));
  };

  const titleMapping = {
    fullname: CREATE_KYC_ADDRESS_CONST.TITTLE_FULL_NAME,
    fullnameonly: CREATE_KYC_ADDRESS_CONST.TITTLE_FULL_NAME,
    comms: CREATE_KYC_ADDRESS_CONST.TITTLE_CONTACT_INFORMATION,
    passportonly: CREATE_KYC_ADDRESS_CONST.TITTLE_ID_PROOFS,
    passport: CREATE_KYC_ADDRESS_CONST.TITTLE_ID_PROOFS,
    address: CREATE_KYC_ADDRESS_CONST.TITTLE_ADDRESS_INFORMATION,
    fulladdress: CREATE_KYC_ADDRESS_CONST.TITTLE_ADDRESS_INFORMATION,
    emergencycontact: CREATE_KYC_ADDRESS_CONST.TITTLE_EMERGENCY_CONTACT,
    financialprofile: CREATE_KYC_ADDRESS_CONST.TITTLE_FINANCIAL_PROFILE,
    // issueDate: CREATE_KYC_ADDRESS_CONST.TITTLE_ISSUE_DATE
  };

  const isFieldDisabled = (
    fieldValue: any,
    isKycCompleted?: any,
    isSumsubKyc?: any
  ) => {
    if (isKycCompleted === false) {
      return false;
    }
    if (isSumsubKyc === false) {
      return false; // `false` means the field is NOT disabled.
    }
    return fieldValue !== "" && fieldValue !== null && fieldValue !== undefined;
  };

  const getYesterday = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday;
  };
  const handleDocNumber = (value: any, setFieldValue: any) => {
    const formattedText = value?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setFieldValue("idNumber", formattedText);
  };

  const kycRequirementsDetails = {
    fullname: (
      <View>
        <Field
          touched={touched.firstName}
          name={FORM_DATA_CONSTANTS.FIRST_NAME}
          label={FORM_DATA_LABEL.FIRST_NAME}
          error={errors.firstName}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_FIRST_NAME}
          component={InputDefault}
          innerRef={kycDetailsRef.firstName}
          maxLength={20}
          editable={!isFieldDisabled(disableFields?.firstName, userInfo?.isKYC)}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb24]} />
        <Field
          touched={touched.lastName}
          name={FORM_DATA_CONSTANTS.LAST_NAME}
          label={FORM_DATA_LABEL.LAST_NAME}
          error={errors.lastName}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_LAST_NAME}
          component={InputDefault}
          innerRef={kycDetailsRef?.lastName}
          editable={!isFieldDisabled(disableFields?.lastName, userInfo?.isKYC)}
          maxLength={20}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />

        <View style={[commonStyles.mb16]} />
        <LabelComponent
          text={FORM_DATA_LABEL.GENDER}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
          style={[commonStyles.mb10]}
        />

        <RadioButton
          options={genderLookUp}
          selectedOption={values.gender || formData?.gender}
          onSelect={(val: any) => setFieldValue("gender", val)}
          nameField="name"
          valueField="name"
          innerRef={kycDetailsRef.gender}
          disabled={isFieldDisabled(disableFields?.gender, userInfo?.isKYC)}
        />
        {errors.gender && (
          <ParagraphComponent
            style={[
              styles.ml12,
              commonStyles.fs12,
              commonStyles.fw400,
              commonStyles.textError,
              { marginLeft: 0 },
            ]}
            text={errors.gender}
          />
        )}
        <View style={[commonStyles.mb16]} />
        <LabelComponent
          text={FORM_DATA_LABEL.DATE_OF_BIRTH}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
          style={[commonStyles.mb10]}
        />
        <View
          style={[
            styles.input,
            {
              justifyContent: "space-between",
              alignItems: "center",
            },
            isFieldDisabled(disableFields?.dob, userInfo?.isKYC)
              ? commonStyles?.disabledBg
              : null,
          ]}
        >
          {values.dob ? (
            <ParagraphComponent
              style={[commonStyles.fs14, commonStyles.textBlack]}
              text={formatDateMonth(values?.dob)}
            />
          ) : (
            <ParagraphComponent
              style={[commonStyles.fs14, commonStyles.textGrey]}
              text={PROFILE_CONSTANTS?.DD_MM_YYYY}
            />
          )}
          {showPicker && (
            <DatePickers
              modal
              mode="date"
              name="dob"
              open={showPicker}
              date={date || new Date()}
              onConfirm={(date) => {
                setShowPicker(false);
                setDate(date);
                setFieldValue("dob", date);
              }}
              onCancel={() => {
                setShowPicker(false);
                if (
                  selectedDate &&
                  selectedDate instanceof Date &&
                  !isNaN(selectedDate.getTime())
                ) {
                  setDate(selectedDate);
                }
              }}
              theme="dark"
              maximumDate={new Date()}
              ref={kycDetailsRef.dob}
              title={"Select Date Of Birth"}
            />
          )}
          <View style={[styles.leftAuto]}>
            <Feather
              name="calendar"
              size={s(22)}
              color="#FFF"
              onPress={handleDateOfBirthModel}
              disabled={isFieldDisabled(disableFields?.dob, userInfo?.isKYC)}
            />
          </View>
        </View>
        {errors.dob && (
          <ParagraphComponent
            style={[
              styles.ml12,
              commonStyles.fs12,
              commonStyles.fw400,
              commonStyles.textError,
              { marginTop: -4 },
            ]}
            text={errors.dob}
          />
        )}

        <View style={[commonStyles.mb8]} />
      </View>
    ),
    fullnameonly: (
      <View>
        <Field
          touched={touched.firstName}
          name={FORM_DATA_CONSTANTS.FIRST_NAME}
          label={FORM_DATA_LABEL.FIRST_NAME}
          error={errors.firstName}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_FIRST_NAME}
          component={InputDefault}
          innerRef={kycDetailsRef.firstName}
          editable={!isFieldDisabled(disableFields?.firstName, userInfo?.isKYC)}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb24]} />
        <Field
          touched={touched.lastName}
          name={FORM_DATA_CONSTANTS.LAST_NAME}
          label={FORM_DATA_LABEL.LAST_NAME}
          error={errors.lastName}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_LAST_NAME}
          component={InputDefault}
          innerRef={kycDetailsRef.lastName}
          editable={!isFieldDisabled(disableFields?.lastName, userInfo?.isKYC)}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />

        <View style={[commonStyles.mb24]} />
      </View>
    ),
    comms: (
      <View>
        <LabelComponent
          text={FORM_DATA_LABEL.PHONE_NUMBER}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
          style={[commonStyles.fs12, commonStyles.fw500, NEW_COLOR.TEXT_LABEL]}
        />
        <View
          style={[commonStyles.relative, commonStyles.dflex, commonStyles.gap8]}
        >
          <PhoneCodePicker
            modalTitle={FORM_DATA_LABEL.COUNTRY_CODE}
            style={undefined}
            customBind={["name", "(", "code", ")"]}
            data={countryCodelist}
            value={values.mobileCode}
            placeholder={FORM_DATA_PLACEHOLDER.SELECT}
            containerStyle={[
              isFieldDisabled(disableFields?.mobileCode)
                ? commonStyles?.disabledBg
                : null,
            ]}
            onChange={(item: any) => setFieldValue("mobileCode", item?.code)}
            innerRef={kycDetailsRef.mobileCode}
            disable={isFieldDisabled(disableFields?.mobileCode)}
          />
          <TextInput
            style={[
              styles.inputStyle,
              commonStyles.flex1,
              isFieldDisabled(disableFields?.mobile)
                ? commonStyles?.disabledBg
                : null,
            ]}
            placeholder={FORM_DATA_PLACEHOLDER.ENTER_PHONE_NUMBER}
            onChangeText={handleChange("mobile")}
            onBlur={handleBlur("mobile")}
            value={values.mobile}
            keyboardType={"phone-pad"}
            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
            multiline={false}
            editable={!isFieldDisabled(disableFields?.mobile)}
            ref={kycDetailsRef.mobile}
          />
        </View>
        {(errors.mobileCode || errors.mobile) && (
          <ParagraphComponent
            style={[
              commonStyles.fs12,
              commonStyles.fw400,
              commonStyles.textError,
              { marginTop: 4 },
            ]}
            text={errors.mobile || errors.mobileCode}
          />
        )}

        <View style={[commonStyles.mb24]} />
        <Field
          touched={touched.email}
          name={FORM_DATA_CONSTANTS.EMAIL}
          label={FORM_DATA_LABEL.EMAIL}
          error={errors.email}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_EMAIL}
          component={InputDefault}
          editable={!isFieldDisabled(values?.email)}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb8]} />
      </View>
    ),
    passport: (
      <View>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => selectImage("profilePicFront")}
          disabled={false}
        >
          <View>
            <LabelComponent
              text={FORM_DATA_LABEL.UPLOAD_YOUR_FRONT_PHOTO_ID_20MB}
              Children={
                <LabelComponent text=" *" style={commonStyles.textError} />
              }
            />
            <View style={[styles.SelectStyle]}>
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color={NEW_COLOR.TEXT_BLACK}
              />
              <ParagraphComponent
                style={[
                  commonStyles.fs16,
                  commonStyles.textBlack,
                  commonStyles.fw500,
                ]}
                text={FORM_DATA_LABEL.UPLOAD_YOUR_FRONT_PHOTO_ID}
                numberOfLines={1}
              />
            </View>
            {passportImg && <Text style={{ color: "red" }}>{passportImg}</Text>}
          </View>
        </TouchableOpacity>
        <View style={[commonStyles.mb16]} />

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loadingState.profilePicFront && (
            <View
              style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.justifyCenter,
                { minHeight: 150 },
              ]}
            >
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
          {values?.profilePicFront && !loadingState.profilePicFront && (
            <View style={[styles.passport]}>
              <Image
                ref={kycDetailsRef.profilePicFront}
                style={{ borderRadius: 16, flex: 1 }}
                overlayColor="#fff"
                resizeMode="contain"
                source={{ uri: values?.profilePicFront }}
              />
            </View>
          )}
          {!values.profilePicFront && !loadingState.profilePicFront && (
            <View style={[styles.passport, { backgroundColor: "#F6FCFE" }]}>
              <Image
                style={[
                  commonStyles.mxAuto,
                  { borderRadius: 16, flex: 1, width: "100%" },
                ]}
                overlayColor="transparent"
                resizeMode="contain"
                source={require("../../assets/images/cards/passport.png")}
              />
            </View>
          )}
        </View>
        {errors.profilePicFront && (
          <ParagraphComponent
            style={[
              commonStyles.fs14,
              commonStyles.fw400,
              commonStyles.textError,
              { marginTop: 4 },
            ]}
            text={errors.profilePicFront}
          />
        )}
        <View style={[commonStyles.mb24]} />
        <View style={[commonStyles.sectionStyle, commonStyles.flex1]}>
          <View
            style={[
              commonStyles.dflex,
              commonStyles.gap8,
              commonStyles.mb8,
              commonStyles.flex1,
            ]}
          >
            <Feather
              name="info"
              size={14}
              style={{ marginTop: 4 }}
              color={NEW_COLOR.TEXT_GREY}
            />
            <View style={[commonStyles.flex1]}>
              <ParagraphComponent
                style={[
                  commonStyles.fs12,
                  commonStyles.textGrey,
                  commonStyles.fw400,
                  commonStyles.mb4,
                ]}
                text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE1}
              />
              <ParagraphComponent
                style={[
                  commonStyles.fs12,
                  commonStyles.textGrey,
                  commonStyles.fw400,
                ]}
                text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE2}
              />
            </View>
          </View>
        </View>

        <View style={[commonStyles.mb24]} />
        <Field
          activeOpacity={0.9}
          innerRef={kycDetailsRef.idType}
          style={{
            color: "transparent",
            backgroundColor: "transparent",
          }}
          label={FORM_DATA_LABEL.DOCUMENT_TYPE}
          touched={touched.idType}
          name={FORM_DATA_CONSTANTS.ID_TYPE}
          error={errors.idType}
          handleBlur={handleBlur}
          customContainerStyle={{
            height: 80,
          }}
          value={values.idType || "passport"}
          data={idTypesLookUp}
          placeholder={FORM_DATA_PLACEHOLDER.SELECT_DOCUMENT_TYPE}
          placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
          modalTitle={FORM_DATA_PLACEHOLDER.SELECT_DOCUMENT_TYPE}
          component={CustomPicker}
          disable={false}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb24]} />
        <Field
          activeOpacity={0.9}
          touched={touched.idNumber}
          name={FORM_DATA_CONSTANTS.ID_NUMBER}
          label={FORM_DATA_LABEL.DOCUMENT_NUMBER}
          error={errors.idNumber}
          handleBlur={handleBlur}
          customContainerStyle={{
            height: 80,
          }}
          onChangeText={(value: any) => handleDocNumber(value, setFieldValue)}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_DOCUMENT_NUMBER}
          component={InputDefault}
          innerRef={kycDetailsRef.idNumber}
          editable={true}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb24]} />

        <LabelComponent
          text={FORM_DATA_LABEL.DOCUMENT_EXPIRY_DATE}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
          style={[commonStyles.mb10]}
        />
        <View
          style={[
            styles.input,
            commonStyles.justifyContent,
            commonStyles.alignCenter,
          ]}
        >
          {values.docExpiryDate ? (
            <ParagraphComponent
              style={[commonStyles.fs14, commonStyles.textBlack]}
              text={formatDateMonth(values.docExpiryDate)}
            />
          ) : (
            <ParagraphComponent
              style={[commonStyles.fs14, commonStyles.textGrey]}
              text={PROFILE_CONSTANTS?.DD_MM_YYYY}
            />
          )}
          {expiryDatePicker && (
            <DatePickers
              modal
              mode="date"
              name="docExpiryDate"
              open={expiryDatePicker}
              date={expirydate || new Date()}
              onConfirm={(date) => {
                setExpiryDatePicker(false);
                setExpirydate(date);
                setFieldValue("docExpiryDate", date);
              }}
              onCancel={() => {
                setExpiryDatePicker(false);
              }}
              theme="dark"
              ref={kycDetailsRef.docExpiryDate}
              minimumDate={new Date()}
              title={"Select Document Expiry Date"}
            />
          )}
          <View style={[styles.leftAuto]}>
            <Feather
              name="calendar"
              size={22}
              color="#FFF"
              onPress={handleExpiryDateModel}
              disabled={false}
            />
          </View>
        </View>

        {errors.docExpiryDate && (
          <ParagraphComponent
            style={[
              commonStyles.fs12,
              commonStyles.fw400,
              commonStyles.textError,
              { marginTop: 4 },
            ]}
            text={errors.docExpiryDate}
          />
        )}
      </View>
    ),
    issuedate: (
      <View style={[commonStyles.mt16]}>
        <LabelComponent
          text={FORM_DATA_LABEL.ISSUE_DATE}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
          style={[commonStyles.mb10]}
        />
        <View
          style={[
            styles.input,
            commonStyles.justifyContent,
            commonStyles.alignCenter,
          ]}
        >
          {values.docissueDate ? (
            <ParagraphComponent
              style={[commonStyles.fs14, commonStyles.textBlack]}
              text={formatDateMonth(values?.docissueDate)}
            />
          ) : (
            <ParagraphComponent
              style={[commonStyles.fs14, commonStyles.textGrey]}
              text={PROFILE_CONSTANTS?.DD_MM_YYYY}
            />
          )}
          {issueDatePicker && (
            <DatePickers
              modal
              mode="date"
              name="docissueDate"
              open={issueDatePicker}
              date={docissueDate || new Date()}
              onConfirm={(date) => {
                setIssueDatePicker(false);
                setDocissueDate(date);
                setFieldValue("docissueDate", date);
              }}
              onCancel={() => {
                setIssueDatePicker(false);
              }}
              theme="dark"
              ref={kycDetailsRef.docissueDate}
              minimumDate={new Date("1900-01-01")}
              maximumDate={getYesterday()}
              title={"Select Document Issue Date"}
            />
          )}
          <View style={[styles.leftAuto]}>
            <Feather
              name="calendar"
              size={s(22)}
              color="#FFF"
              onPress={handleIssueDateModel}
              disabled={false}
            />
          </View>
        </View>
        {errors.docissueDate && (
          <ParagraphComponent
            style={[
              commonStyles.fs12,
              commonStyles.fw400,
              commonStyles.textError,
              { marginTop: 4 },
            ]}
            text={errors.docissueDate}
          />
        )}
      </View>
    ),
    passportonly: (
      <View>
        <View style={[commonStyles.mb10]} />
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => selectImage("profilePicFront")}
          disabled={false}
        >
          <View>
            <LabelComponent
              text={FORM_DATA_LABEL.UPLOAD_YOUR_FRONT_PHOTO_ID_20MB}
              Children={
                <LabelComponent text=" *" style={commonStyles.textError} />
              }
            />
            <View style={[styles.SelectStyle]}>
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color={NEW_COLOR.TEXT_BLACK}
              />
              <ParagraphComponent
                style={[
                  commonStyles.fs16,
                  commonStyles.textBlack,
                  commonStyles.fw500,
                ]}
                text={FORM_DATA_LABEL.UPLOAD_YOUR_FRONT_PHOTO_ID}
                numberOfLines={1}
              />
            </View>
            {passportImg && <Text style={{ color: "red" }}>{passportImg}</Text>}
          </View>
        </TouchableOpacity>
        <View style={[commonStyles.mb16]} />

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loadingState.profilePicFront && (
            <View
              style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.justifyCenter,
                { minHeight: 150 },
              ]}
            >
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
          {values?.profilePicFront && !loadingState.profilePicFront && (
            <View style={[styles.passport]}>
              <Image
                ref={kycDetailsRef.profilePicFront}
                style={{ borderRadius: 16, flex: 1 }}
                overlayColor="#fff"
                resizeMode="contain"
                source={{ uri: values?.profilePicFront }}
              />
            </View>
          )}
          {!values.profilePicFront && !loadingState.profilePicFront && (
            <View style={[styles.passport, { backgroundColor: "#F6FCFE" }]}>
              <Image
                style={[
                  commonStyles.mxAuto,
                  { borderRadius: 16, flex: 1, width: "100%" },
                ]}
                overlayColor="transparent"
                resizeMode="contain"
                source={require("../../assets/images/cards/passport.png")}
              />
            </View>
          )}
        </View>
        {errors.profilePicFront && (
          <ParagraphComponent
            style={[
              commonStyles.fs14,
              commonStyles.fw400,
              commonStyles.textError,
              { marginTop: 4 },
            ]}
            text={errors.profilePicFront}
          />
        )}
        <View style={[commonStyles.mb24]} />
        <View style={[commonStyles.sectionStyle]}>
          <View
            style={[
              commonStyles.dflex,
              commonStyles.gap8,
              commonStyles.mb8,
              commonStyles.flex1,
            ]}
          >
            <Feather
              name="info"
              size={14}
              style={{ marginTop: 4 }}
              color={NEW_COLOR.TEXT_GREY}
            />
            <View style={[commonStyles.flex1]}>
              <ParagraphComponent
                style={[
                  commonStyles.fs12,
                  commonStyles.textGrey,
                  commonStyles.fw400,
                  commonStyles.mb4,
                  commonStyles.flex1,
                ]}
                text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE1}
              />
              <ParagraphComponent
                style={[
                  commonStyles.fs12,
                  commonStyles.textGrey,
                  commonStyles.fw400,
                  commonStyles.flex1,
                ]}
                text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE2}
              />
            </View>
          </View>
        </View>

        <View style={[commonStyles.mb24]} />
        <Field
          activeOpacity={0.9}
          innerRef={kycDetailsRef.idType}
          style={{
            color: "transparent",
            backgroundColor: "transparent",
          }}
          label={FORM_DATA_LABEL.DOCUMENT_TYPE}
          touched={touched.idType}
          name={FORM_DATA_CONSTANTS.ID_TYPE}
          error={errors.idType}
          handleBlur={handleBlur}
          customContainerStyle={{
            height: 80,
          }}
          value={values.idType || "passport"}
          data={idTypesLookUp}
          placeholder={FORM_DATA_PLACEHOLDER.SELECT_DOCUMENT_TYPE}
          placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
          modalTitle={FORM_DATA_PLACEHOLDER.SELECT_DOCUMENT_TYPE}
          component={CustomPicker}
          disable={false}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb24]} />
        <Field
          activeOpacity={0.9}
          touched={touched.idNumber}
          name={FORM_DATA_CONSTANTS.ID_NUMBER}
          label={FORM_DATA_LABEL.DOCUMENT_NUMBER}
          error={errors.idNumber}
          handleBlur={handleBlur}
          customContainerStyle={{
            height: 80,
          }}
          onChangeText={(value: any) => handleDocNumber(value, setFieldValue)}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_DOCUMENT_NUMBER}
          component={InputDefault}
          disabled={false}
          innerRef={kycDetailsRef.idNumber}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
      </View>
    ),
    handedpassport: (
      <>
        <View style={[commonStyles.mb16]} />
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => selectImage("handHoldingIDPhoto")}
          disabled={false}
        >
          <View>
            <LabelComponent
              text={FORM_DATA_LABEL.UPLOAD_YOUR_HAND_HOLD_PHOTO_ID_20MB}
              Children={
                <LabelComponent text=" *" style={commonStyles.textError} />
              }
            />
            <View style={[styles.SelectStyle]}>
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color={NEW_COLOR.TEXT_BLACK}
              />
              <ParagraphComponent
                style={[
                  commonStyles.fs16,
                  commonStyles.textBlack,
                  commonStyles.fw500,
                ]}
                text={FORM_DATA_LABEL.UPLOAD_YOUR_HAND_HOLD_ID_PHOTO}
                numberOfLines={1}
              />
            </View>
            {uploadValidation?.handHoldingIDPhoto && (
              <Text style={{ color: "red" }}>
                {uploadValidation?.handHoldingIDPhoto}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={[commonStyles.mb16]} />

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loadingState?.handHoldingIDPhoto && (
            <View
              style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.justifyCenter,
                { minHeight: 150 },
              ]}
            >
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
          {values.handHoldingIDPhoto && !loadingState?.handHoldingIDPhoto && (
            <View style={[styles.passport]}>
              <Image
                ref={kycDetailsRef.handHoldingIDPhoto}
                style={{ borderRadius: 16, flex: 1 }}
                overlayColor="#fff"
                resizeMode="contain"
                source={{ uri: values.handHoldingIDPhoto }}
              />
            </View>
          )}
          {!values.handHoldingIDPhoto && !loadingState?.handHoldingIDPhoto && (
            <View style={[styles.passport, { backgroundColor: "#F6FCFE" }]}>
              <Image
                style={[
                  commonStyles.mxAuto,
                  { borderRadius: 16, flex: 1, width: "100%" },
                ]}
                overlayColor="transparent"
                resizeMode="contain"
                source={require("../../assets/images/cards/passportholding.png")}
              />
            </View>
          )}
        </View>
        {errors.handHoldingIDPhoto && (
          <ParagraphComponent
            style={[
              commonStyles.fs14,
              commonStyles.fw400,
              commonStyles.textError,
              { marginTop: 4 },
            ]}
            text={errors.handHoldingIDPhoto}
          />
        )}
        <View style={[commonStyles.mb24]} />
        <View style={[commonStyles.sectionStyle]}>
          <View
            style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb8]}
          >
            <Feather
              name="info"
              size={14}
              style={{ marginTop: 4 }}
              color={NEW_COLOR.TEXT_GREY}
            />
            <View style={[commonStyles.flex1]}>
              <ParagraphComponent
                style={[
                  commonStyles.fs12,
                  commonStyles.textGrey,
                  commonStyles.fw400,
                  commonStyles.mb4,
                ]}
                text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE1}
              />
              <ParagraphComponent
                style={[
                  commonStyles.fs12,
                  commonStyles.textGrey,
                  commonStyles.fw400,
                ]}
                text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE2}
              />
            </View>
          </View>
        </View>
      </>
    ),
    face: (
      <View>
        <>
          <View style={[commonStyles.mb16]} />
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleOpenFacePopup}
            disabled={false}
          >
            <View>
              <LabelComponent
                text={FORM_DATA_LABEL.UPLOAD_YOUR_FACE_PHOTO_20MB}
                Children={
                  <LabelComponent text=" *" style={commonStyles.textError} />
                }
              />
              <View style={[styles.SelectStyle]}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={22}
                  color={NEW_COLOR.TEXT_BLACK}
                />
                <ParagraphComponent
                  style={[
                    commonStyles.fs16,
                    commonStyles.textBlack,
                    commonStyles.fw500,
                  ]}
                  text={FORM_DATA_LABEL.UPLOAD_YOUR_FACE_PHOTO}
                  numberOfLines={1}
                />
              </View>
              {passportImg && (
                <Text style={{ color: "red" }}>{passportImg}</Text>
              )}
            </View>
          </TouchableOpacity>
          <View style={[commonStyles.mb16]} />

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loadingState?.faceImage && (
              <View
                style={[
                  commonStyles.dflex,
                  commonStyles.alignCenter,
                  commonStyles.justifyCenter,
                  { minHeight: 150 },
                ]}
              >
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
            {values.faceImage && !loadingState?.faceImage && (
              <View style={[styles.passport]}>
                <Image
                  ref={kycDetailsRef.faceImage}
                  style={{ borderRadius: 16, flex: 1 }}
                  overlayColor="#fff"
                  resizeMode="contain"
                  source={{ uri: values.faceImage }}
                />
              </View>
            )}
            {!values.faceImage && !loadingState?.faceImage && (
              <View style={[styles.passport, { backgroundColor: "#F6FCFE" }]}>
                <Image
                  style={[
                    commonStyles.mxAuto,
                    { borderRadius: 16, flex: 1, width: "100%" },
                  ]}
                  overlayColor="transparent"
                  resizeMode="contain"
                  source={require("../../assets/images/userface.jpg")}
                />
              </View>
            )}
          </View>
          {errors.faceImage && (
            <ParagraphComponent
              style={[
                commonStyles.fs14,
                commonStyles.fw400,
                commonStyles.textError,
                { marginTop: 4 },
              ]}
              text={errors.faceImage}
            />
          )}
          <View style={[commonStyles.mb24]} />
          <View style={[commonStyles.sectionStyle]}>
            <View
              style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb8]}
            >
              <Feather
                name="info"
                size={14}
                style={{ marginTop: 4 }}
                color={NEW_COLOR.TEXT_GREY}
              />
              <View style={[commonStyles.flex1]}>
                <ParagraphComponent
                  style={[
                    commonStyles.fs12,
                    commonStyles.textGrey,
                    commonStyles.fw400,
                    commonStyles.mb4,
                  ]}
                  text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE1}
                />
                <ParagraphComponent
                  style={[
                    commonStyles.fs12,
                    commonStyles.textGrey,
                    commonStyles.fw400,
                  ]}
                  text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE2}
                />
              </View>
            </View>
          </View>
        </>
      </View>
    ),
    sign: (
      <View>
        <>
          <View style={[commonStyles.mb16]} />
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handlePopup}
            disabled={false}
          >
            <View>
              <LabelComponent
                text={FORM_DATA_LABEL.UPLOAD_YOUR_SIGNATURE_PHOTO_ID_20MB}
                Children={
                  <LabelComponent text=" *" style={commonStyles.textError} />
                }
              />
              <View style={[styles.SelectStyle]}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={22}
                  color={NEW_COLOR.TEXT_BLACK}
                />
                <ParagraphComponent
                  style={[
                    commonStyles.fs16,
                    commonStyles.textBlack,
                    commonStyles.fw500,
                  ]}
                  text={FORM_DATA_LABEL.ADD_YOUR_SIGNATURE}
                  numberOfLines={1}
                />
              </View>
              {passportImg && (
                <Text style={{ color: "red" }}>{passportImg}</Text>
              )}
            </View>
          </TouchableOpacity>
          <View style={[commonStyles.mb16]} />

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loadingState?.signature && (
              <View
                style={[
                  commonStyles.dflex,
                  commonStyles.alignCenter,
                  commonStyles.justifyCenter,
                  { minHeight: 150 },
                ]}
              >
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
            {values.signature && !loadingState?.signature && (
              <View style={[styles.passport, { backgroundColor: "#fff" }]}>
                <Image
                  ref={kycDetailsRef.signature}
                  style={{ borderRadius: 16, flex: 1 }}
                  overlayColor="#fff"
                  resizeMode="contain"
                  source={{ uri: values.signature }}
                />
              </View>
            )}
            {!values.signature && !loadingState?.signature && (
              <View style={[styles.passport, { backgroundColor: "#F6FCFE" }]}>
                <Image
                  style={[
                    commonStyles.mxAuto,
                    { borderRadius: 16, flex: 1, width: "100%" },
                  ]}
                  overlayColor="transparent"
                  resizeMode="contain"
                  source={require("../../assets/images/cards/default-sign.png")}
                />
              </View>
            )}
          </View>
          {errors.signature && (
            <ParagraphComponent
              style={[
                commonStyles.fs14,
                commonStyles.fw400,
                commonStyles.textError,
                { marginTop: 4 },
              ]}
              text={errors.signature}
            />
          )}
          <View style={[commonStyles.mb24]} />
          <View style={[commonStyles.sectionStyle]}>
            <View
              style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb8]}
            >
              <Feather
                name="info"
                size={14}
                style={{ marginTop: 4 }}
                color={NEW_COLOR.TEXT_GREY}
              />
              <View style={[commonStyles.flex1]}>
                <ParagraphComponent
                  style={[
                    commonStyles.fs12,
                    commonStyles.textGrey,
                    commonStyles.fw400,
                    commonStyles.mb4,
                  ]}
                  text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE1}
                />
                <ParagraphComponent
                  style={[
                    commonStyles.fs12,
                    commonStyles.textGrey,
                    commonStyles.fw400,
                  ]}
                  text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE2}
                />
              </View>
            </View>
          </View>
        </>
      </View>
    ),
    biometric: (
      <View>
        <>
          <View style={[commonStyles.mb10]} />
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => selectImage("biometric")}
          >
            <View>
              <LabelComponent
                text={FORM_DATA_LABEL.UPLOAD_YOUR_BIOMETRIC_PHOTO_ID_20MB}
                Children={
                  <LabelComponent text=" *" style={commonStyles.textError} />
                }
              />
              <View style={styles.SelectStyle}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={22}
                  color={NEW_COLOR.TEXT_BLACK}
                />
                <ParagraphComponent
                  style={[
                    commonStyles.fs16,
                    commonStyles.textBlack,
                    commonStyles.fw500,
                  ]}
                  text={FORM_DATA_LABEL.UPLOAD_YOUR_BIOMETRIC_PHOTO}
                  numberOfLines={1}
                />
              </View>
              {passportImg && (
                <Text style={{ color: "red" }}>{passportImg}</Text>
              )}
            </View>
          </TouchableOpacity>
          <View style={[commonStyles.mb16]} />

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loadingState?.biometric && (
              <View
                style={[
                  commonStyles.dflex,
                  commonStyles.alignCenter,
                  commonStyles.justifyCenter,
                  { minHeight: 150 },
                ]}
              >
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
            {values.biometric && !loadingState?.biometric && (
              <View style={[styles.passport]}>
                <Image
                  ref={kycDetailsRef.biometric}
                  style={{ borderRadius: 16, flex: 1 }}
                  overlayColor="#fff"
                  resizeMode="contain"
                  source={{ uri: values.biometric }}
                />
              </View>
            )}
            {!values.biometric && !loadingState?.biometric && (
              <View style={[styles.passport, { backgroundColor: "#F6FCFE" }]}>
                <Image
                  style={[
                    commonStyles.mxAuto,
                    { borderRadius: 16, flex: 1, width: "100%" },
                  ]}
                  overlayColor="transparent"
                  resizeMode="contain"
                  source={require("../../assets/images/cards/passport.png")}
                />
              </View>
            )}
          </View>
          {errors.biometric && (
            <ParagraphComponent
              style={[
                commonStyles.fs14,
                commonStyles.fw400,
                commonStyles.textError,
                { marginTop: 4 },
              ]}
              text={errors.biometric}
            />
          )}
          <View style={[commonStyles.mb24]} />
          <View style={[commonStyles.sectionStyle]}>
            <View
              style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb8]}
            >
              <Feather
                name="info"
                size={14}
                style={{ marginTop: 4 }}
                color={NEW_COLOR.TEXT_GREY}
              />
              <View style={[commonStyles.flex1]}>
                <ParagraphComponent
                  style={[
                    commonStyles.fs12,
                    commonStyles.textGrey,
                    commonStyles.fw400,
                    commonStyles.mb4,
                  ]}
                  text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE1}
                />
                <ParagraphComponent
                  style={[
                    commonStyles.fs12,
                    commonStyles.textGrey,
                    commonStyles.fw400,
                  ]}
                  text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE2}
                />
              </View>
            </View>
          </View>
        </>
      </View>
    ),
    fulladdress: (
      <View>
        <View style={[commonStyles.mb8]} />
        <Field
          touched={touched.addressLine1}
          name={FORM_DATA_CONSTANTS.ADDRESS_LINE1}
          label={FORM_DATA_LABEL.ADDRESS_LINE1}
          error={errors.addressLine1}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ADDRESS_LINE1}
          component={InputDefault}
          innerRef={kycDetailsRef.addressLine1}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb24]} />
        <Field
          activeOpacity={0.9}
          style={{
            backgroundColor: "NEW_COLOR.SCREENBG_WHITE",
            borderColor: "NEW_COLOR.SEARCH_BORDER",
          }}
          label={FORM_DATA_LABEL.COUNTRY}
          touched={touched.country}
          customContainerStyle={{}}
          name={FORM_DATA_CONSTANTS.COUNTRY}
          error={errors.country}
          onChange={(e: any) => handleCountry(e)}
          handleBlur={handleBlur}
          modalTitle={FORM_DATA_PLACEHOLDER.SELECT_COUNTRY}
          data={countries}
          placeholder={FORM_DATA_PLACEHOLDER.SELECT_COUNTRY}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
          component={CustomPickerAcc}
          innerRef={kycDetailsRef.country}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb28]} />
        <Field
          touched={touched.state}
          name={FORM_DATA_CONSTANTS.STATE}
          label={FORM_DATA_LABEL.STATE}
          error={errors.state}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_STATE}
          innerRef={kycDetailsRef.state}
          component={InputDefault}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb24]} />
        <Field
          activeOpacity={0.9}
          style={{
            backgroundColor: "NEW_COLOR.SCREENBG_WHITE",
            borderColor: "NEW_COLOR.SEARCH_BORDER",
          }}
          label={FORM_DATA_LABEL.TOWN}
          touched={touched.town}
          customContainerStyle={{}}
          name={FORM_DATA_CONSTANTS.TOWN}
          error={errors.town}
          handleBlur={handleBlur}
          value={values?.town}
          modalTitle={FORM_DATA_PLACEHOLDER.SELECT_TOWN}
          data={townsLookup}
          placeholder={FORM_DATA_PLACEHOLDER.SELECT_TOWN}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
          innerRef={kycDetailsRef.town}
          component={CustomPickerAcc}
          isLoading={isTownsDataLoading}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />

        <View style={[commonStyles.mb24]} />
        <Field
          touched={touched.city}
          name={FORM_DATA_CONSTANTS.CITY}
          label={FORM_DATA_LABEL.CITY}
          error={errors.city}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_CITY}
          component={InputDefault}
          innerRef={kycDetailsRef.city}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb24]} />
        <Field
          touched={touched.postalCode}
          name={FORM_DATA_CONSTANTS.POSTAL_CODE}
          label={FORM_DATA_LABEL.POSTAL_CODE}
          error={errors.postalCode}
          handleBlur={handleBlur}
          // keyboardType={FORM_DATA_PLACEHOLDER.NUMERIC}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_POSTAL_CODE}
          maxLength={10}
          component={InputDefault}
          innerRef={kycDetailsRef.postalCode}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb8]} />
      </View>
    ),
    address: (
      <View>
        <Field
          touched={touched.addressLine1}
          name={FORM_DATA_CONSTANTS.ADDRESS_LINE1}
          label={FORM_DATA_LABEL.ADDRESS_LINE1}
          error={errors.addressLine1}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ADDRESS_LINE1}
          component={InputDefault}
          innerRef={kycDetailsRef.addressLine1}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
      </View>
    ),

    emergencycontact: (
      <View>
        <Field
          touched={touched.emergencyContactName}
          name={FORM_DATA_CONSTANTS.EMERGENCY_CONTACT_NAME}
          label={FORM_DATA_LABEL.EMERGENCY_CONTACT_NAME}
          error={errors.emergencyContactName}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.EMERGENCY_CONTACT_NAME}
          component={InputDefault}
          innerRef={kycDetailsRef.emergencyContactName}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb8]} />
      </View>
    ),
    financialprofile: (
      <View style={[commonStyles.mt16]}>
        <Field
          activeOpacity={0.9}
          style={{
            backgroundColor: "NEW_COLOR.SCREENBG_WHITE",
            borderColor: "NEW_COLOR.SEARCH_BORDER",
          }}
          label={FORM_DATA_LABEL.OCCUPATION}
          touched={touched.occupation}
          customContainerStyle={{}}
          name={FORM_DATA_CONSTANTS.OCCUPATION}
          error={errors.occupation}
          handleBlur={handleBlur}
          modalTitle={FORM_DATA_PLACEHOLDER.SELECT_OCCUPATION}
          data={occupationList}
          placeholder={FORM_DATA_PLACEHOLDER.SELECT_OCCUPATION}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
          component={CustomPickerAcc}
          innerRef={kycDetailsRef.occupation}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb24]} />
        <Field
          touched={touched.annualSalary}
          name={FORM_DATA_CONSTANTS.ANNUAL_SALARY}
          label={FORM_DATA_LABEL.ANNUAL_SALARY}
          error={errors.annualSalary}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_ANNUAL_SALARY}
          component={InputDefault}
          onChangeText={(value: any) =>
            handleChangeAnnualSalary(value, setFieldValue)
          }
          innerRef={kycDetailsRef.annualSalary}
          maxLength={10}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb24]} />
        <Field
          touched={touched.accountPurpose}
          name={FORM_DATA_CONSTANTS.ACCOUNT_PURPOSE}
          label={FORM_DATA_LABEL.ACCOUNT_PURPOSE}
          error={errors.accountPurpose}
          maxLength={50}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_ACCOUNT_PURPOSE}
          component={InputDefault}
          innerRef={kycDetailsRef.accountPurpose}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb24]} />
        <Field
          touched={touched.expectedMonthlyVolume}
          name={FORM_DATA_CONSTANTS.EXPECTED_MONTHLY_VOLUME}
          label={FORM_DATA_LABEL.EXPECTED_MONTHLY_VOLUME}
          error={errors.expectedMonthlyVolume}
          handleBlur={handleBlur}
          customContainerStyle={{}}
          placeholder={FORM_DATA_PLACEHOLDER.ENTER_EXPECTED_MONTHLY_VOLUME}
          component={InputDefault}
          maxLength={10}
          onChangeText={(value: any) =>
            handleChangeExpectedMonthlyVolume(value, setFieldValue)
          }
          innerRef={kycDetailsRef.expectedMonthlyVolume}
          Children={<LabelComponent text=" *" style={commonStyles.textError} />}
        />
        <View style={[commonStyles.mb8]} />
      </View>
    ),
  };

  const handleCountry = (e: any) => {
    setFieldValue("country", e);
    setFieldValue({ country: e });
    setTownsLookUp([]);
    setFieldValue("town", "");
    let _country = countries.find((country: any) => country.name === e);
    getCardTowns(_country?.code);
  };
  const handleChangeAnnualSalary = (
    text: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const numericText = text?.replace(/[^0-9.]/g, "");
    const parts = numericText.split(".");
    let cleanedText = parts[0];
    if (parts.length > 1) {
      cleanedText += "." + parts.slice(1).join("");
    }
    setFieldValue("annualSalary", cleanedText);
  };

  const handleChangeExpectedMonthlyVolume = (text: any, setFieldValue: any) => {
    const numericText = text?.replace(/[^0-9.]/g, "");
    const parts = numericText.split(".");
    let cleanedText = parts[0];
    if (parts.length > 1) {
      cleanedText += "." + parts.slice(1).join("");
    }
    setFieldValue("expectedMonthlyVolume", cleanedText);
  };
  const requestCameraPermission = async () => {
    try {
      const permission =
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        Alert.alert(
          "Permission Denied",
          "Camera access is needed to take a selfie."
        );
        return false;
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          "Permission Blocked",
          "Please enable camera access in your device settings."
        );
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  return (
    <SafeAreaView>
      <KeyboardAwareScrollView
        ref={ref}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {errormsg && (
            <ErrorComponent message={errormsg} onClose={handleErrorComonent} />
          )}
          <View>
            {kycReqList?.map((kycKey) => {
              const label = titleMapping[kycKey];
              return (
                <View key={kycKey}>
                  {label && (
                    <LabelComponent
                      text={`${label}`}
                      style={[
                        commonStyles.textAlwaysWhite,
                        commonStyles.fs16,
                        commonStyles.mt16,
                      ]}
                    />
                  )}
                  {kycRequirementsDetails[kycKey]}
                </View>
              );
            })}
          </View>
        </View>
      </KeyboardAwareScrollView>

      <OverlayPopup
        title={PLACEHOLDER_CONSTANTS.UPLOAD_YOUR_FACE_PHOTO}
        isVisible={loadingState?.facePopup}
        handleClose={handleOpenFacePopup}
        methodOne={() => selectImage(FORM_DATA_CONSTANTS?.FACE_IMAGE, true)}
        methodTwo={() => selectImage(FORM_DATA_CONSTANTS?.FACE_IMAGE)}
        lable1={FORM_DATA_CONSTANTS.TAKE_SELFIE}
        lable2={FORM_DATA_CONSTANTS.UPLOAD_FROM_GALLERY}
        colors={NEW_COLOR}
        windowWidth={WINDOW_WIDTH}
        windowHeight={WINDOW_HEIGHT}
        isLoading={loadingState?.faceImage} // optional boolean
        loadingType={loadingState?.loadingType}
      />

      <OverlayPopup
        title={PROFILE_CONSTANTS.ADD_YOUR_SIGNATURE}
        isVisible={loadingState?.drawSignModel}
        handleClose={handlePopup}
        methodOne={() => selectImage(FORM_DATA_CONSTANTS?.SIGNATURE)}
        methodTwo={togglePopup}
        lable1={PROFILE_CONSTANTS?.UPLOAD_YOUR_SIGNATURE}
        lable2={PROFILE_CONSTANTS?.DRAW_YOUR_SIGNATURE}
        colors={NEW_COLOR}
        windowWidth={WINDOW_WIDTH}
        windowHeight={WINDOW_HEIGHT}
      />
      <CommonOverlay
        isVisible={loadingState?.signModelVisible}
        onClose={togglePopup}
        windowWidth={WINDOW_WIDTH}
        windowHeight={WINDOW_HEIGHT}
        children={SignatureContext}
      />
    </SafeAreaView>
  );
};

export default KycAddress;
const styles = StyleSheet.create({
  SelectStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
    marginBottom: 6,
    gap: 9,
    minHeight: 54,
    backgroundColor: NEW_COLOR.BG_BLACK,
    borderStyle: "dashed",
  },
  passport: {
    width: "100%",
    borderRadius: 16,
    height: 250,
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_LIGHT,
    overflow: "hidden",
  },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupContent: {
    // backgroundColor: NEW_COLOR.DARK_BG,
    // padding: 20,
    // borderRadius: 10,
    // width: '90%',
  },
  signatureCaptureContainer: {
    height: (WINDOW_HEIGHT * 40) / 100,
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_GREY,
    borderRadius: 0,
    overflow: "hidden",
  },
  signatureCapture: {
    width: "100%",
    height: (WINDOW_HEIGHT * 50) / 100,
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_GREY,
    borderRadius: 16,
  },
  input: {
    color: NEW_COLOR.TEXT_WHITE,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 8,
    borderColor: NEW_COLOR.SEARCH_BORDER,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  inputStyle: {
    borderColor: NEW_COLOR.SEARCH_BORDER,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
    borderWidth: 1,
    borderRadius: 8,
    height: 46,
    fontSize: ms(14),
    fontWeight: "400",
    color: NEW_COLOR.TEXT_BLACK,
    paddingLeft: 14,
    paddingRight: 16,
    flex: 1,
    multiline: false,
    textAlignVertical: "center",
  },
  overlayContent: {
    paddingHorizontal: s(28),
    paddingVertical: s(24),
    borderRadius: 25,
    backgroundColor: NEW_COLOR.DARK_BG,
  },
});
