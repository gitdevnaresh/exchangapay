import { StyleSheet, TouchableOpacity, View, Image, ScrollView, SafeAreaView, BackHandler, ActivityIndicator, Modal, Platform, Alert, TextInput, Keyboard } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Container } from '../../components';
import { useDispatch, useSelector } from "react-redux";
import { ms, s } from "../../constants/theme/scale";
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from "../../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import Feather from 'react-native-vector-icons/Feather';
import DefaultButton from "../../components/DefaultButton";
import LabelComponent from "../../components/Paragraph/label";
import { commonStyles } from "../../components/CommonStyles";
import { Field, Formik } from "formik";
import CustomPickerAcc from "../../components/CustomPicker";
import InputDefault from '../../components/DefaultFiat';
import { EditProfileSchema } from "./EditProfileInfoSchema";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import ProfileService from "../../services/profile";
import DatePickers from "react-native-date-picker";
import { formatDateMonth, formatDateTimeAPI, formateExpiryValidationDate, isErrorDispaly, trimValues } from "../../utils/helpers";
import Loadding from "../../components/skeleton";
import ErrorComponent from "../../components/Error";
import { personalInfoLoader } from "./skeleton_views";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";
import RadioButton from "../../components/Button/RadioButton";
import { PERMISSIONS, request, RESULTS } from "react-native-permissions";
import { FIELD_CONSTANTS, FORMIK_CONSTANTS, PLACEHOLDER_CONSTANTS, PROFILE_CONSTANTS } from "./constants";
import OverlayPopup from "../cards/SelectPopup";
import PhoneCodePicker from "../../components/PhoneCodeSelect";
import CardsModuleService from "../../services/card";
import moment from "moment";
import { CREATE_KYC_ADDRESS_CONST } from "../cards/constant";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";
import useMemberLogin from "../../hooks/useMemberLogin";
import { USER_CONSTANTS } from "../onBoarding/constants";
import { isCardKycCompleted } from "../../redux/Actions/UserActions";
import { CommonActions, useIsFocused } from "@react-navigation/native";
import useSendUserWebhook from "../../hooks/useSendUserWebhook";
import CommonOverlay from "../../components/commonOverlyPopup";



const AddKycInfomation = (props: any) => {
  const ref = useRef<any>(null);
  const emergencyEmail = useRef(null);
  const doctype = useRef(null);
  const docno = useRef(null);
  const { decryptAES, encryptAES } = useEncryptDecrypt();
  const signatureRef = useRef<SignatureViewRef>(null);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const [editDataLoading, setEditDataLoading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [idPhotoLoading, setIdPhotoLoading] = useState<boolean>(false);
  const [signPhotoLoading, setSignPhotoLoading] = useState<boolean>(false);
  const EditInfoLoader = personalInfoLoader(10);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [date, setDate] = useState<any>(null);
  const [expirydate, setExpirydate] = useState<any>(null);
  const [expiryDatePicker, setExpiryDatePicker] = useState<boolean>(false);
  const [isSelfieLoading, setIsSelfieLoading] = useState<boolean>(false);
  const [isBackLoading, setBackLoading] = useState<boolean>(false)
  const [signModelVisible, setSignModelVisible] = useState<boolean>(false);
  const [openSelfiePopup, setOpenSelfiePopup] = useState<boolean>(false);
  const [lists, setLists] = useState<any>({ countryLookUp: [], genderLookUp: [], idTypesLookUp: [], countryCodelist: [] });
  const [errorMsgs, setErrorMsgs] = useState<any>({ frontPhotoIdError: "", backPhotoIdError: "", handHoldingPhotoError: "", selfieError: "", signatureError: "", dateOfBirthError: "", errorMsg: null });
  const [uploadImgs, setUploadImgs] = useState<any>({ frontIdPhoto: "", handHoldingPhoto: "", selfie: "", signImage: "", backIdPhoto: "" });
  const { getMemDetails } = useMemberLogin();
  const { screenName } = props.route.params || {};
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const isFormLocked = !screenName;
  const { sendWebhook } = useSendUserWebhook();
  const [signSaveLoader, setSignSaveLoader] = useState<boolean>(false)
  const [initValues, setInitValues] = useState<any>({
    phoneCode: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: null,
    idIssuranceCountry: "",
    documentType: "passport",
    documentNumber: "",
    expireyDate: null,
    emergencyContactName: "",
    emergencyContactEmail: "",
    emergencyContactPhoneCode: "",
    emergencyContactPhoneNumber: "",
    lastName: "",
    firstName: ""
  });

  useEffect(() => {
    fetchProfileEditView();
    fetchLookUps();
    getListOfCountryCodeDetails();
    setErrorMsgs((prev: any) => ({
      ...prev,
      frontPhotoIdError: "",
      selfieError: ""
    }))
  }, [isFocused]);

  const handleUpdateDocuments = async (data: any) => {
    try {
      const response = await ProfileService.updateKycDocuments(data);
      if (response?.ok) {
      } else {
        setErrorMsgs(isErrorDispaly(response))
      }
    } catch (error) {
      setErrorMsgs(isErrorDispaly(error))
    }
  }

  const fetchLookUps = async () => {
    try {
      const response: any = await ProfileService.getprofileEditLookups();
      setLists((prev: any) => ({ ...prev, countryLookUp: response?.data?.Country, genderLookUp: response?.data?.Gender, idTypesLookUp: response?.data?.IdTypes }));
      setErrorMsgs((prev: any) => ({ ...prev, errorMsg: "" }));
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(error) }))
    }
  };

  const handleSaveSignature = async (event: any) => {
    setSignSaveLoader(true);
    if (event) {
      await selectSignPhoto(event)
      togglePopup();
    };
    setSignSaveLoader(false);
  };

  const handleOpenSelfiePopup = () => {
    setOpenSelfiePopup(!openSelfiePopup)
  };

  const handleClear = () => {
    signatureRef?.current?.clearSignature();
  };

  const handleConfirm = () => {
    signatureRef?.current?.readSignature();

  };
  const togglePopup = () => {
    setPopupVisible(!popupVisible);
    setSignModelVisible(false);
  };

  const fetchProfileEditView = async () => {
    try {
      setEditDataLoading(true);
      const response: any = await ProfileService.getProfileEditView();
      if (response?.ok) {
        const decryptedDob = response.data?.dob ? response.data.dob : null;
        const decryptedExpirationDate = decryptAES(response.data?.expirationDate) ? formateExpiryValidationDate(decryptAES(response.data.expirationDate)) : null;
        const apiDate = decryptedDob ? new Date(decryptedDob) : null;
        const apiExpireyDate = decryptedExpirationDate ? new Date(decryptedExpirationDate) : null;
        setExpirydate(apiExpireyDate);
        setDate(apiDate);
        setUploadImgs((prev: any) => ({
          ...prev,
          signImage: response.data?.singaturePhoto,
          frontIdPhoto: response?.data?.frontIdPhoto,
          handHoldingPhoto: response?.data?.handHoldingPhoto,
          selfie: response?.data?.profileImage,
          backIdPhoto: response?.data?.backDocImage
        }));
        const decryptedFirstName = response.data?.firstName ? decryptAES(response.data.firstName) : "";
        const decryptedLastName = response.data?.lastName ? decryptAES(response.data.lastName) : "";
        const decryptedDocumentNumber = response.data?.documentNumber ? decryptAES(response.data.documentNumber) : "";
        const decryptedEmergencyContactName = response.data?.emergencyContactName ? decryptAES(response.data.emergencyContactName) : "";
        const decryptedEmergencyContact = response.data?.emergencyContact ? decryptAES(response.data.emergencyContact) : "";
        const decryptedEmergencyContactEmail = response.data?.emergencyContactEmail ? decryptAES(response.data.emergencyContactEmail) : "";
        const decryptedMobileCode = response.data?.mobileCode ? decryptAES(response.data.mobileCode) : "";
        const decryptedEmergencyContactMobileCode = response.data?.emergencyContactMobileCode ? decryptAES(response.data.emergencyContactMobileCode) : "";
        const intialValue = {
          firstName: decryptedFirstName,
          lastName: decryptedLastName,
          gender: response?.data?.gender,
          dateOfBirth: decryptedDob,
          idIssuranceCountry: response?.data?.idIssuranceCountry || "",
          documentType: response?.data?.documentType || "passport",
          documentNumber: decryptedDocumentNumber || "",
          emergencyContactName: decryptedEmergencyContactName,
          expireyDate: decryptedExpirationDate || "",
          phoneNumber: decryptedEmergencyContact,
          emergencyContactEmail: decryptedEmergencyContactEmail,
          phoneCode: decryptedMobileCode,
          emergencyContactPhoneCode: decryptedEmergencyContactMobileCode,
          emergencyContactPhoneNumber: decryptedEmergencyContact
        };
        setInitValues(intialValue);
        setErrorMsgs((prev: any) => ({ ...prev, errorMsg: "" }));
        setEditDataLoading(false);
        ref?.current?.scrollTo({ y: 0, animated: true });
      } else {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(error) }));
        setEditDataLoading(false);
      }

    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(error) }));
      setEditDataLoading(false);
    };
  };


  const handleUpdate = async (values: any) => {
    setBtnLoading(true)
    const formteddateOfBirth = formatDateTimeAPI(date);
    const formatedexpityDate = formatDateTimeAPI(expirydate)
    const updateValues = trimValues(values);
    let Obj = {
      "idIssuranceCountry": updateValues.idIssuranceCountry || "",
      "documentCountry": "",
      "firstName": encryptAES(updateValues.firstName) || "",
      "lastName": encryptAES(updateValues.lastName) || "",
      "documentType": updateValues.documentType || "",
      "documentNumber": encryptAES(updateValues.documentNumber) || "",
      "expirationDate": encryptAES(formatedexpityDate) || "",
      "dob": formteddateOfBirth || "",
      "gender": updateValues.gender || "",
      "frontIdPhoto": uploadImgs?.frontIdPhoto || "",
      "backDocImage": uploadImgs?.backIdPhoto || "",
      "handHoldingIdPhoto": uploadImgs?.handHoldingPhoto || "",
      "faceImage": uploadImgs?.selfie || "",
      "singaturePhoto": uploadImgs.signImage || "",
      "emergencyContact": updateValues?.emergencyContactPhoneNumber || "",
      "emergencyContactName": updateValues.emergencyContactName || "",
      "emergencyContactEmail": updateValues.emergencyContactEmail || "",
      "emergencyContactMobileCode": updateValues?.emergencyContactPhoneCode || "",
    };

    try {
      const res: any = await ProfileService?.saveCustomerKycInformation(Obj);
      if (res.status === 200) {
        getMemDetails({}, false, true);
        await sendWebhook("Update");
        dispatch(isCardKycCompleted(true))
        if (props?.route?.params?.screenName === "splash_Screen") {
          props?.navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [{ name: "underReview" }],
            })
          );
          setBtnLoading(false)
          setErrorMsgs((prev: any) => ({ ...prev, errorMsg: "" }));
        } else {
          props?.navigation?.goBack();
        }

      } else {
        setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(res) }))

        ref?.current?.scrollTo({ y: 0, animated: true });
        setBtnLoading(false)
      }
      setErrorMsgs((prev: any) => ({ ...prev, handHoldingPhotoError: "", frontPhotoIdError: "" }))
    }
    catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(error) }))

      setBtnLoading(false)
    }
  };



  const acceptedExtensions = ['.jpg', '.jpeg', '.png'];
  const verifyFileTypes = (fileList: any) => {
    const fileName = fileList;
    if (!hasAcceptedExtension(fileName)) {
      return false;
    }

    return true;
  };
  const hasAcceptedExtension = (fileName: string) => {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    return acceptedExtensions.includes(extension);
  };

  const uploadFrontPhotoId = async () => {
    Keyboard.dismiss();
    try {
      const result = await launchImageLibrary({ mediaType: PROFILE_CONSTANTS.PHOTO });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const isValid = verifyFileTypes(result.assets[0].fileName);
        const isValidSize = verifyFileSize(result.assets[0].fileSize);
        if (isValid && isValidSize) {
          setUploading(true);
          let formData = new FormData();
          formData.append(PROFILE_CONSTANTS.DOCUMENT, {
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          });
          const uploadRes = await ProfileService.uploadFile(formData);
          if (uploadRes.status === 200) {
            setUploadImgs((prev: any) => ({ ...prev, frontIdPhoto: (uploadRes?.data && uploadRes.data?.length > 0) ? uploadRes.data[0] : "" }));
            handleUpdateDocuments({
              url: uploadRes.data[0],
              docType: "frontIdPhoto"
            })
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: "" }));
          }
          else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(uploadRes) }));
          }
        } else {
          if (!isValid) {
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT }));
            ref?.current?.scrollTo({ y: 0, animated: true });
          } else if (!isValidSize) {
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: PROFILE_CONSTANTS.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB }));
            ref?.current?.scrollTo({ y: 0, animated: true });
          }
        }
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(err) }));
    }
    finally {
      setUploading(false);
    };
  };

  const handleSelectSignPhoto = async () => {
    Keyboard.dismiss();
    try {
      const result = await launchImageLibrary({ mediaType: PROFILE_CONSTANTS.PHOTO });
      setSignModelVisible(false);
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const isValid = verifyFileTypes(result.assets[0].fileName);
        const isValidSize = verifyFileSize(result.assets[0].fileSize);
        if (isValid && isValidSize) {
          let formData = new FormData();
          formData.append(PROFILE_CONSTANTS.DOCUMENT, {
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          });
          const uploadRes = await ProfileService.uploadFile(formData);
          if (uploadRes.status === 200) {
            setUploadImgs((prev: any) => ({ ...prev, signImage: (uploadRes?.data && uploadRes.data?.length > 0) ? uploadRes.data[0] : "" }))
            handleUpdateDocuments({
              url: uploadRes.data[0],
              docType: "singaturePhoto"
            })
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: "" }));
          }
          else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(uploadRes) }));

          }
        } else {

          if (!isValid) {
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT }));;
            ref?.current?.scrollTo({ y: 0, animated: true });
          } else if (!isValidSize) {
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT }));
            ref?.current?.scrollTo({ y: 0, animated: true });
          }
        }
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(err) }));
    }
    finally {
      setUploading(false);
    };

  };

  const verifyFileSize = (fileSize: any) => {
    const maxSizeInBytes = 20 * 1024 * 1024;
    return fileSize <= maxSizeInBytes;
  };
  const uploadHandHoldingPhotoID = async () => {
    Keyboard.dismiss();
    try {
      const result = await launchImageLibrary({ mediaType: PROFILE_CONSTANTS.PHOTO });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const isValidType = verifyFileTypes(result.assets[0].fileName);
        const isValidSize = verifyFileSize(result.assets[0].fileSize);
        if (isValidType && isValidSize) {
          setIdPhotoLoading(true);
          let formData = new FormData();
          formData.append(PROFILE_CONSTANTS.DOCUMENT, {
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          });
          const uploadRes = await ProfileService.uploadFile(formData);
          if (uploadRes.status === 200) {
            setUploadImgs((prev: any) => ({ ...prev, handHoldingPhoto: (uploadRes?.data && uploadRes.data?.length > 0) ? uploadRes.data[0] : "" }));
            handleUpdateDocuments({
              url: uploadRes.data[0],
              docType: "handHoldingPhoto"
            })
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: "" }));
          }
          else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(uploadRes) }));
          }
        } else {
          if (!isValidType) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT }));
          } else if (!isValidSize) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: PROFILE_CONSTANTS.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB }));
          }
        }
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(err) }));
    } finally {
      setIdPhotoLoading(false);
    };
  };


  const selectSignPhoto = async (event: any) => {
    Keyboard.dismiss();
    try {
      setSignPhotoLoading(true);
      const cleanBase64 = event?.replace(/^data:image\/\w+;base64,/, "");
      let Obj = {
        "imageBytes": cleanBase64
      }
      const uploadRes = await ProfileService.uploadSingnitureFile(Obj);
      if (uploadRes.status === 200) {
        setUploadImgs((prev: any) => ({ ...prev, signImage: (uploadRes?.data && uploadRes.data?.length > 0) ? uploadRes.data[0] : "" }));
        handleUpdateDocuments({
          url: uploadRes.data[0],
          docType: "singaturePhoto"
        })
        setErrorMsgs((prev: any) => ({ ...prev, errorMsg: "" }));

      }
      else {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(uploadRes) }));

      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(err) }));
    }
    finally {
      setSignPhotoLoading(false);
    };
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      PROFILE_CONSTANTS.HARDWARE_BACK_PRESSS,
      () => {
        if (signModelVisible) {
          handleCloseSignModel();
        } else {
          handleGoBack();
        }

        return true;
      }
    );
    return () => backHandler.remove();
  }, [signModelVisible]);

  const handleGoBack = () => {
    if (props?.route?.params?.screenName === "splash_Screen") {
      props?.navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: "completeKyc" }],
        })
      );
    } else {
      props.navigation.goBack();
    }
  };

  const validateAge = (value: any) => {
    if (!value) {
      return false;
    } else {
      const today = moment();
      const birthDate = moment(value);
      return today.diff(birthDate, 'years') >= 18;
    }

  };

  const validate = async (values: any) => {
    const errors: any = {};
    const newDate = new Date();
    try {
      await EditProfileSchema.validate(values, { abortEarly: false });
    } catch (validationErrors: any) {
      validationErrors.inner.forEach((error: any) => {
        errors[error.path] = error.message;
      });
    }
    if (!uploadImgs?.frontIdPhoto) {
      errors.frontIdPhoto = PROFILE_CONSTANTS.IS_REQUIRED;
    }
    if (!date) {
      errors.dateOfBirth = PROFILE_CONSTANTS.IS_REQUIRED;
    } else if (!validateAge(date)) {
      errors.dateOfBirth = 'You must be at least 18 years old';
    }
    if (!uploadImgs?.selfie) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      errors.selfie = PROFILE_CONSTANTS.IS_REQUIRED;
    }
    if (!expirydate) {
      errors.expireyDate = PROFILE_CONSTANTS.IS_REQUIRED;
    }
    else if (expirydate <= newDate) {
      errors.expireyDate = CREATE_KYC_ADDRESS_CONST.EXPIRY_DATE_VALIDATION_VALIDATION;
    }

    // Update manual UI errors (if needed)
    setErrorMsgs((prev: any) => ({
      ...prev,
      frontPhotoIdError: errors.frontIdPhoto || '',
      handHoldingPhotoError: errors.handHoldingPhoto || '',
      selfieError: errors.selfie || '',
      signImageError: errors.signImage || '',
    }));

    // Scroll to top if any error exists
    if (Object.keys(errors).length > 0) {
      ref?.current?.scrollTo({ y: 0, animated: true });
    }

    return errors;
  };


  const handleExpiryDateModel = () => {
    setExpiryDatePicker(!expiryDatePicker)
  };

  const handleDateOfBirthModel = () => {
    setShowPicker(!showPicker)
  };


  const requestCameraPermission = async () => {
    try {
      const permission =
        Platform.OS === PROFILE_CONSTANTS.IOS
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        Alert.alert(PROFILE_CONSTANTS.PERMISSION, PROFILE_CONSTANTS.CAMERA_ACCESS_IS_NEEDED_TO_TAKE_A_SELFIE);
        return false;
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          PROFILE_CONSTANTS.PERMISSION_BLOCKED,
          PROFILE_CONSTANTS.PLEASE_ENABLE_CAMERA_ACCESS_IN_YOUR_DEVICE_SETTINGS
        );
        return false;
      }
    } catch (err) {
      return false;
    }
  };


  const selectSelfie = async () => {
    Keyboard.dismiss();
    setOpenSelfiePopup(false);
    // setUploadImgs((prev: any) => ({ ...prev, selfie: "" }))
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }
    try {
      const result = await launchCamera({ mediaType: 'photo', cameraType: "front" });
      setOpenSelfiePopup(false)
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const isValid = verifyFileTypes(result.assets[0].fileName);
        const isValidSize = verifyFileSize(result.assets[0].fileSize);
        if (isValid && isValidSize) {
          setIsSelfieLoading(true);
          let formData = new FormData();
          formData.append('document', {
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          });
          const uploadRes = await ProfileService.uploadFile(formData);

          setOpenSelfiePopup(false)
          if (uploadRes.status === 200) {
            setUploadImgs((prev: any) => ({ ...prev, selfie: (uploadRes?.data && uploadRes.data?.length > 0) ? uploadRes.data[0] : "" }));
            handleUpdateDocuments({
              url: uploadRes.data[0],
              docType: "profileImage"
            })
          } else {
            setOpenSelfiePopup(false)
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(uploadRes) }));
          }
        } else {
          if (!isValid) {
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT }));
            ref?.current?.scrollTo({ y: 0, animated: true });
          } else if (!isValidSize) {
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: PROFILE_CONSTANTS.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB }));
            ref?.current?.scrollTo({ y: 0, animated: true });
          }
        }
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(err) }));
    } finally {
      setIsSelfieLoading(false);
    }
  };

  const selectBackPhoto = async () => {
    Keyboard.dismiss();
    try {
      const result = await launchImageLibrary({ mediaType: PROFILE_CONSTANTS.PHOTO });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const isValid = verifyFileTypes(result.assets[0].fileName);
        const isValidSize = verifyFileSize(result.assets[0].fileSize);
        if (isValid && isValidSize) {
          setBackLoading(true);
          let formData = new FormData();
          formData.append(PROFILE_CONSTANTS.DOCUMENT, {
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          });
          const uploadRes = await ProfileService.uploadFile(formData);
          if (uploadRes.status === 200) {
            setUploadImgs((prev: any) => ({ ...prev, backIdPhoto: (uploadRes?.data && uploadRes.data?.length > 0) ? uploadRes.data[0] : "" }));
            handleUpdateDocuments({
              url: uploadRes.data[0],
              docType: "backDocImage"
            })
          }
          else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(uploadRes) }));
          }
        } else {
          if (!isValid) {
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT }));
            ref?.current?.scrollTo({ y: 0, animated: true });
          } else if (!isValidSize) {
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(PROFILE_CONSTANTS.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB) }));
            ref?.current?.scrollTo({ y: 0, animated: true });
          }
        }
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(err) }));
    }
    finally {
      setBackLoading(false);
    };
  };

  const handleVisibleSignModel = () => {
    setSignModelVisible(!signModelVisible)
  };

  const handleCloseSignModel = () => {
    setSignModelVisible(false)
  };

  const selectFacePhoto = async () => {
    setOpenSelfiePopup(false)
    try {

      const result = await launchImageLibrary({ mediaType: PROFILE_CONSTANTS.PHOTO });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const isValidType = verifyFileTypes(result.assets[0].fileName);
        const isValidSize = verifyFileSize(result.assets[0].fileSize);
        if (isValidType && isValidSize) {
          setIsSelfieLoading(true);
          let formData = new FormData();
          formData.append(PROFILE_CONSTANTS.DOCUMENT, {
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          });
          setOpenSelfiePopup(false)
          const uploadRes = await ProfileService.uploadFile(formData);

          if (uploadRes.status === 200) {
            setUploadImgs((prev: any) => ({ ...prev, selfie: (uploadRes?.data && uploadRes.data?.length > 0) ? uploadRes.data[0] : "" }));
            handleUpdateDocuments({
              url: uploadRes.data[0],
              docType: "profileImage"
            })
            setIsSelfieLoading(false);
          }
          else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setOpenSelfiePopup(false)
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(uploadRes) }));
          }
        } else {
          if (!isValidType) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT }));

          } else if (!isValidSize) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrorMsgs((prev: any) => ({ ...prev, errorMsg: PROFILE_CONSTANTS.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB }));

          }
        }
      }
    } catch (err) {
      setOpenSelfiePopup(false)
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(err) }));
    } finally {
      setIsSelfieLoading(false);
      setOpenSelfiePopup(false)
    };
  };
  const handleCloseError = () => {
    setErrorMsgs((prev: any) => ({ ...prev, errorMsg: "" }));
  };


  const getListOfCountryCodeDetails = async () => {
    try {
      const response: any = await CardsModuleService.getPersonalAddressLu();
      if (response?.status === 200) {
        setLists((prev: any) => ({ ...prev, countryCodelist: response?.data?.PhoneCodes }));
        setErrorMsgs((prev: any) => ({ ...prev, errorMsg: "" }));

      } else {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(response) }));
      }
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrorMsgs((prev: any) => ({ ...prev, errorMsg: isErrorDispaly(error) }));
    }
  };

  const isHideField = (value: any, isNotRequiredFiled?: boolean) => {
    if (userInfo?.isSumsubKyc && !isNotRequiredFiled) {
      return true;
    } else if (!userInfo?.isSumsubKyc && !isNotRequiredFiled) {
      return true;
    }
    return false;
  };

  const handleDocNumber = (value: any, setFieldValue: any) => {
    const formattedText = value?.replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
    setFieldValue("documentNumber", formattedText);
  };
  const signatureStyle = `.m-signature-pad {box-shadow: none; border: none; } 
                    .m-signature-pad--body {border: none;}
                    .m-signature-pad--footer {display: none; margin: 0px;}
                    body,html {width: 100%; height: 100%;}`;

  const SignatureContext = (<View>
    <View
      style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb30]} >
      <ParagraphComponent text={PROFILE_CONSTANTS.SIGN_HERE} style={[commonStyles.textBlack, commonStyles.fs16, commonStyles.fw700]} />
      <TouchableOpacity onPress={togglePopup}>
        <AntDesign name={PROFILE_CONSTANTS.CLOSE} size={s(22)} color={NEW_COLOR.TEXT_BLACK} />
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
      loading={btnLoading}
      disable={undefined}
      onPress={handleClear}
      transparent={true}
      iconArrowRight={false}
      closeIcon={true}
    />

  </View>)

  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <ScrollView
        keyboardShouldPersistTaps={PROFILE_CONSTANTS?.HANDLED}
        showsVerticalScrollIndicator={false}
        ref={ref}
      >
        <Container style={commonStyles.container}>
          {editDataLoading && (
            <View style={[commonStyles.flex1]}>
              <Loadding contenthtml={EditInfoLoader} />
            </View>
          )}
          {!editDataLoading && (
            <>
              <View style={[commonStyles.dflex, commonStyles.mb43, commonStyles.alignCenter]}
              >
                <TouchableOpacity style={[styles.pr16, styles.px8]} onPress={handleGoBack}>
                  <View>
                    <View>
                      <AntDesign name={PROFILE_CONSTANTS?.ARROW_LEFT} size={s(22)} color={NEW_COLOR.TEXT_BLACK} />
                    </View>
                  </View>
                </TouchableOpacity>
                <View>
                  <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw700]} text={isFormLocked ? PROFILE_CONSTANTS?.EDIT_KYC_INFORMATION : PROFILE_CONSTANTS?.ADD_KYC_INFORMATION} />
                  <ParagraphComponent text={PROFILE_CONSTANTS?.NOTE_PLEASE_WRITE_IN_ENGLISH} style={[commonStyles.fs10, commonStyles.textBlack, commonStyles.fw300, { fontStyle: "italic" }]} />
                </View>
              </View>
              {errorMsgs?.errorMsg && (
                <ErrorComponent message={errorMsgs?.errorMsg} onClose={handleCloseError}
                />
              )}
              <Formik
                initialValues={initValues}
                onSubmit={handleUpdate}
                validate={validate}
                validateOnBlur={false}
                validateOnChange={false}
                enableReinitialize
              >
                {(formik) => {
                  const { touched, handleSubmit, errors, handleBlur, handleChange, values, setFieldValue } = formik;
                  return (
                    <>
                      <View>
                        <Field
                          name="firstName"
                          placeholder={USER_CONSTANTS?.ENTER_FIRST_NAME}
                          label={USER_CONSTANTS?.FIRST_NAME_LABEL}
                          component={InputDefault}
                          error={errors.firstName}
                          editable={!isFormLocked}
                          Children={<LabelComponent text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR} style={commonStyles.textError} />}
                        />
                        <View style={[commonStyles.mb24]} />
                        <Field
                          name="lastName"
                          label={USER_CONSTANTS?.LAST_NAME_LABEL}
                          Children={<LabelComponent text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR} style={commonStyles.textError} />}
                          placeholder={USER_CONSTANTS?.ENTER_LAST_NAME}
                          component={InputDefault}
                          error={errors.lastName}
                          editable={!isFormLocked}
                        />
                        <View style={[commonStyles.mb24]} />
                        <Field
                          touched={touched.idIssuranceCountry}
                          name={FORMIK_CONSTANTS?.ID_ISSURANCE_COUNTRY}
                          label={FIELD_CONSTANTS?.ID_ISSUEANCE_COUNTRY}
                          value={initValues.idIssuranceCountry}
                          error={errors.idIssuranceCountry}
                          editable={false}
                          handleBlur={handleBlur}
                          placeholder={PLACEHOLDER_CONSTANTS?.SELECT_COUNRY}
                          data={lists?.countryLookUp}
                          modalTitle={PLACEHOLDER_CONSTANTS.SELECT_COUNRY}
                          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                          component={CustomPickerAcc}
                          disable={isFormLocked && userInfo?.isSumsubKyc}
                          Children={
                            <LabelComponent text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR} style={commonStyles.textError} />
                          }
                        />
                        <View style={[commonStyles.mb26]} />
                      </View>
                      <View>
                        <Field
                          activeOpacity={0.9}
                          innerRef={doctype}
                          style={{ color: PROFILE_CONSTANTS.TRANSPARENT, backgroundColor: PROFILE_CONSTANTS.TRANSPARENT }}
                          label={FIELD_CONSTANTS.DOCUMENT_TYPE}
                          touched={touched.documentType}
                          name={FORMIK_CONSTANTS.DOCUMENT_TYPE}
                          error={errors.documentType}
                          handleBlur={handleBlur}
                          customContainerStyle={{ height: 80 }}
                          data={lists?.idTypesLookUp}
                          placeholder={PLACEHOLDER_CONSTANTS.SELECT_DOCUMENT_TYPE}
                          modalTitle={PLACEHOLDER_CONSTANTS.SELECT_DOCUMENT_TYPE}
                          placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                          disable={isFormLocked && userInfo?.isSumsubKyc}
                          component={CustomPickerAcc}
                          Children={<LabelComponent text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR} style={commonStyles.textError} />} />
                        <View style={[commonStyles.mb26]} />
                      </View>
                      <View>
                        <Field
                          activeOpacity={0.9}
                          touched={touched.documentNumber}
                          name={FORMIK_CONSTANTS.DOCUMENT_NUMBER}
                          label={FIELD_CONSTANTS.DOCUMNET_NUMBER}
                          error={errors.documentNumber}
                          onChangeText={(value: any) => { handleDocNumber(value, setFieldValue) }}
                          handleBlur={handleBlur}
                          customContainerStyle={{ height: 80 }}
                          placeholder={PLACEHOLDER_CONSTANTS.ENTER_DOCUMENT_NUMBER}
                          component={InputDefault}
                          editable={!isFormLocked || !userInfo?.isSumsubKyc}
                          innerRef={docno}
                          Children={<LabelComponent text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR} style={commonStyles.textError} />} />
                        <View style={[commonStyles.mb26]} />
                      </View>
                      <View>
                        <LabelComponent text={FIELD_CONSTANTS.DOCUMNET_EXPIRY_DATE} Children={<LabelComponent text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR} style={commonStyles.textError} />} style={[commonStyles.mb10]} />
                        <View style={[styles.input, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, (isFormLocked && userInfo?.isSumsubKyc) ? commonStyles?.disabledBg : null]} >
                          {expirydate !== null && (
                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.textBlack]} text={formatDateMonth(expirydate)} />
                          ) || (
                              <ParagraphComponent style={[commonStyles.fs14, commonStyles.textGrey]} text={PROFILE_CONSTANTS?.DD_MM_YYYY} />
                            )}
                          {expiryDatePicker && (
                            <DatePickers
                              title={"Select Document Expiry Date"}
                              modal
                              mode={PROFILE_CONSTANTS.DATE}
                              open={expiryDatePicker}
                              date={expirydate || new Date()}
                              onConfirm={(date) => {
                                setExpiryDatePicker(false);
                                setExpirydate(date);
                              }}
                              onCancel={() => {
                                setExpiryDatePicker(false);
                              }}
                              theme={PROFILE_CONSTANTS.DARK}
                              minimumDate={new Date()}
                            />

                          )}
                          <View>
                            <Feather name={PROFILE_CONSTANTS.CALENDER} size={22} color={PROFILE_CONSTANTS.WHITE_COLOR} onPress={handleExpiryDateModel} disabled={isFormLocked && userInfo?.isSumsubKyc} />
                          </View>
                        </View>
                      </View>

                      <View>
                        {errors.expireyDate && (
                          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, commonStyles.mt4]} text={errors.expireyDate} />)}
                        <View style={[commonStyles.mb26]} />
                      </View>
                      <View>
                        <LabelComponent text={FIELD_CONSTANTS?.DATE_OF_BIRTH} Children={<LabelComponent
                          text={PLACEHOLDER_CONSTANTS?.REQUIRED_STAR}
                          style={commonStyles.textError}
                        />} style={[commonStyles.mb10]} />
                        <View style={[styles.input, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, isFormLocked ? commonStyles.disabledBg : null]}>
                          {date !== null && (
                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.textBlack]} text={formatDateMonth(date)} />
                          ) || (
                              <ParagraphComponent style={[commonStyles.fs14, commonStyles.textGrey]} text={PROFILE_CONSTANTS?.DD_MM_YYYY} />
                            )}
                          {showPicker && (
                            <DatePickers
                              modal
                              title={"Select Date Of Birth"}
                              mode={PROFILE_CONSTANTS?.DATE}
                              open={showPicker}
                              date={date || new Date()}
                              onConfirm={(date) => {
                                setShowPicker(false)
                                setDate(date);
                              }}
                              onCancel={() => {
                                setShowPicker(false);
                              }}
                              theme={PROFILE_CONSTANTS?.DARK}
                              maximumDate={new Date()}
                            />

                          )}
                          <View>
                            <Feather name={PROFILE_CONSTANTS.CALENDER} size={22} color={PROFILE_CONSTANTS.WHITE_COLOR} onPress={handleDateOfBirthModel} disabled={isFormLocked} />
                          </View>
                        </View>
                      </View>
                      <View>
                        {(errors?.dateOfBirth || errorMsgs?.dateOfBirthError) && (
                          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, commonStyles.mt4]}
                            text={errors.dateOfBirth || errorMsgs?.dateOfBirthError} />
                        )}
                        <View style={[commonStyles.mb26]} />
                      </View>
                      <View>
                        <LabelComponent text={FIELD_CONSTANTS.GENDER} Children={<LabelComponent
                          text={PLACEHOLDER_CONSTANTS?.REQUIRED_STAR}
                          style={commonStyles.textError}
                        />} style={[commonStyles.mb10]} />
                        <RadioButton
                          options={lists?.genderLookUp}
                          selectedOption={values?.gender}
                          onSelect={(val: any) => setFieldValue(PLACEHOLDER_CONSTANTS.GENDER, val)}
                          nameField={FIELD_CONSTANTS?.NAME}
                          valueField={FIELD_CONSTANTS?.NAME}
                          disabled={(isFormLocked && userInfo?.isSumsubKyc)}
                        />
                      </View>
                      <View>
                        {errors?.gender && (
                          <ParagraphComponent style={[styles.ml12, commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginLeft: 0 }]} text={errors?.gender} />
                        )}
                        <View style={[commonStyles.mb26]} />
                      </View>
                      <View>
                        <TouchableOpacity onPress={uploadFrontPhotoId} activeOpacity={0.6} disabled={isFormLocked && userInfo?.isSumsubKyc}>
                          <View >
                            <LabelComponent
                              text={FIELD_CONSTANTS.UPLOAD_YOUR_FORNT_PHOTO_ID_20MB}
                              Children={<LabelComponent text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR} style={commonStyles.textError} />} />
                            <View style={[styles.SelectStyle, (isFormLocked && userInfo?.isSumsubKyc) ? commonStyles.disabledBg : null]}>
                              <Ionicons name={PROFILE_CONSTANTS.CLOUD_UPLOAD_OUTLINE} size={22} color={(isFormLocked && userInfo?.isSumsubKyc) ? 'rgba(175, 175, 175, 0.50)' : NEW_COLOR.TEXT_BLACK} />
                              <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw500, { color: (isFormLocked && userInfo?.isSumsubKyc) ? 'rgba(175, 175, 175, 0.50)' : NEW_COLOR.TEXT_BLACK }]} text={PLACEHOLDER_CONSTANTS.UPLOAD_YOUR_FRONT_PHOTO_ID} numberOfLines={1} />
                            </View>
                            {errorMsgs.frontPhotoIdError && <ParagraphComponent style={[commonStyles.textError]} text={errorMsgs.frontPhotoIdError} />}
                          </View>
                        </TouchableOpacity>
                        <View style={[commonStyles.mb16]} />
                        <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]} >
                          {uploading && (
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { minHeight: 150 }]}>
                              <ActivityIndicator size={PROFILE_CONSTANTS.LARGE} color={NEW_COLOR.TEXT_GREY} />
                            </View>
                          )}
                          {(uploadImgs?.frontIdPhoto) && !uploading && (
                            <View style={[styles.passport]}>
                              <Image
                                style={[commonStyles.rounded16, commonStyles.flex1]}
                                overlayColor="#fff"
                                resizeMode="contain"
                                source={{ uri: uploadImgs?.frontIdPhoto }}
                              />
                            </View>
                          )}
                          {(!uploadImgs?.frontIdPhoto && !uploading) && (
                            <View style={[styles.passport, commonStyles.image_Bg]}>
                              <Image
                                style={[commonStyles.mxAuto, commonStyles.rounded16, commonStyles.flex1]}
                                overlayColor={PROFILE_CONSTANTS.TRANSPARENT}
                                resizeMode="contain"
                                source={require("../../assets/images/cards/passport.png")}
                              />
                            </View>
                          )}
                        </View>
                        <View style={[commonStyles.mb26]} />
                        <View style={[styles.bgorange]}>
                          <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb8, commonStyles.mr8]}>
                            <Feather name={PROFILE_CONSTANTS.INFO} size={14} style={{ marginTop: 4 }} color={NEW_COLOR.TEXT_GREY} />
                            <View>
                              <ParagraphComponent style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw400, commonStyles.mb4]}
                                text={PLACEHOLDER_CONSTANTS.PLEASE_UPLOAD_THE_A_PHOTO_OF_THE_INFORMATION_PAGE_ALONG_WITH_YOUR_PRIFILE_PICTURE} />
                              <ParagraphComponent style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw400]}
                                text={PLACEHOLDER_CONSTANTS.ENSURE_THAT_THE_ID_FRAME_IS_FULLY_VISIBLE_THE_FRONT_IS_CLEAR_AND_THE_BRIGHTNESS_IS_UNIFORM} />
                            </View>
                          </View>
                        </View>
                        <View style={[commonStyles.mb26]} />
                      </View>

                      {isHideField(values.backDocImage, !isFormLocked) && <View>
                        <TouchableOpacity onPress={selectBackPhoto} activeOpacity={0.6} disabled={false}>
                          <View >
                            <LabelComponent
                              text={FIELD_CONSTANTS.UPLOAD_YOUR_BACK_PHOTO_ID} />
                            <View style={[styles.SelectStyle]}>
                              <Ionicons name={PROFILE_CONSTANTS.CLOUD_UPLOAD_OUTLINE} size={22} color={NEW_COLOR.TEXT_BLACK} />
                              <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw500, { color: NEW_COLOR.TEXT_BLACK }]} text={PLACEHOLDER_CONSTANTS.UPLOAD_YOUR_BACK_PHOTO_ID} numberOfLines={1} />
                            </View>
                          </View>
                        </TouchableOpacity>
                        <View style={[commonStyles.mb16]} />
                        <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]} >
                          {isBackLoading && (
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { minHeight: 150 }]}>
                              <ActivityIndicator size={PROFILE_CONSTANTS.LARGE} color={NEW_COLOR.TEXT_GREY} />
                            </View>
                          )}
                          {uploadImgs?.backIdPhoto && !isBackLoading && (
                            <View style={[styles.passport]}>
                              <Image
                                style={[commonStyles.rounded16, commonStyles.flex1]}
                                overlayColor="#fff"
                                resizeMode="contain"
                                source={{ uri: uploadImgs?.backIdPhoto }}
                              />
                            </View>
                          )}
                          {!uploadImgs?.backIdPhoto && !isBackLoading && (
                            <View style={[styles.passport, commonStyles.image_Bg]}>
                              <Image
                                style={[commonStyles.mxAuto, commonStyles.rounded16, commonStyles.flex1]}
                                overlayColor={PROFILE_CONSTANTS.TRANSPARENT}
                                resizeMode="contain"
                                source={require("../../assets/images/cards/passport.png")}
                              />
                            </View>
                          )}
                        </View>
                        <View style={[commonStyles.mb26]} />
                      </View>}


                      <View>
                        <TouchableOpacity onPress={handleOpenSelfiePopup} activeOpacity={0.6} >
                          <View >
                            <LabelComponent text={FIELD_CONSTANTS.UPLOAD_YOUR_FACE_PHOTO_20MB}
                              Children={<LabelComponent text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR} style={commonStyles.textError} />} />
                            <View style={[styles.SelectStyle]}>
                              <Ionicons name={PROFILE_CONSTANTS.CLOUD_UPLOAD_OUTLINE} size={22} color={NEW_COLOR.TEXT_BLACK} />
                              <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw500]} text={PLACEHOLDER_CONSTANTS.UPLOAD_YOUR_FACE_PHOTO} numberOfLines={1} />
                            </View>
                          </View>
                        </TouchableOpacity>
                        {errorMsgs.selfieError && <ParagraphComponent style={commonStyles.textError} text={errorMsgs.selfieError} />}
                        <View style={[commonStyles.mb16]} />

                        <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                          {isSelfieLoading && (
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { minHeight: 150 }]}>
                              <ActivityIndicator size={PROFILE_CONSTANTS.LARGE} color={NEW_COLOR.TEXT_GREY} />
                            </View>
                          )}
                          {uploadImgs?.selfie && !isSelfieLoading && (
                            <View style={[styles.passport,]}>
                              <Image
                                style={[commonStyles.rounded16, commonStyles.flex1]}
                                overlayColor="#fff"
                                resizeMode="contain"
                                source={{ uri: uploadImgs?.selfie }}
                              />
                            </View>
                          )}
                          {(!uploadImgs?.selfie && !isSelfieLoading) && (

                            <View style={[styles.passport, { backgroundColor: "#928781" }]}>
                              <Image
                                style={[commonStyles.mxAuto, { width: "100%", flex: 1 }]}
                                overlayColor={PROFILE_CONSTANTS.TRANSPARENT}
                                resizeMode="contain"
                                source={require("../../assets/images/userface.jpg")}
                              />
                            </View>
                          )}
                        </View>
                        <View style={[commonStyles.mb24]} />
                      </View>

                      {isHideField(values.handHoldingIDPhoto, !isFormLocked) && <View>
                        <TouchableOpacity onPress={uploadHandHoldingPhotoID} activeOpacity={0.6}>
                          <LabelComponent text={PLACEHOLDER_CONSTANTS.UPLOAD_YOUR_HAND_HOLDING_PHOTO_ID_20MB}
                            Children={
                              <LabelComponent
                                text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR}
                                style={commonStyles.textError}
                              />
                            }
                          />
                          <View style={[styles.SelectStyle]}>
                            <Ionicons name={PROFILE_CONSTANTS.CLOUD_UPLOAD_OUTLINE} size={22} color={NEW_COLOR.TEXT_BLACK} />
                            <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw500]} text={FIELD_CONSTANTS.UPLOAD_YOUR_HAND_HOLDING_PHOTO_ID} numberOfLines={1} />
                          </View>
                        </TouchableOpacity>
                        {errorMsgs.handHoldingPhotoError && <ParagraphComponent style={[commonStyles.textError]} text={errorMsgs.handHoldingPhotoError} />}
                        <View style={[commonStyles.mb16]} />
                        <View style={[commonStyles.mb16]} />
                        <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                          {idPhotoLoading && (
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { minHeight: 150 }]}>
                              <ActivityIndicator size={PROFILE_CONSTANTS.LARGE} color={NEW_COLOR.TEXT_GREY} />
                            </View>
                          )}
                          {(uploadImgs?.handHoldingPhoto) &&
                            !idPhotoLoading && (
                              <View style={[styles.passport,]}>
                                <Image
                                  style={[commonStyles.rounded16, commonStyles.flex1]}
                                  overlayColor="#fff"
                                  resizeMode="contain"
                                  source={{ uri: uploadImgs?.handHoldingPhoto }}
                                />
                              </View>
                            )}
                          {!(uploadImgs?.handHoldingPhoto) &&
                            !idPhotoLoading && (
                              <View style={[styles.passport, { backgroundColor: "#F5F8FF" }]}>
                                <Image
                                  style={{ borderRadius: 12, flex: 1, width: "100%" }}
                                  overlayColor="#fff"
                                  resizeMode="contain"
                                  source={require("../../assets/images/cards/passportholding.png")}
                                />
                              </View>
                            )}
                        </View>
                        <View style={[commonStyles.mb24]} />
                      </View>}


                      {isHideField(values.signature, !isFormLocked) && <View>
                        <TouchableOpacity onPress={handleVisibleSignModel} activeOpacity={0.6} >
                          <View>
                            <LabelComponent text={FIELD_CONSTANTS.SIGNATURE_PHOTO_20MB} />
                            <View style={[styles.SelectStyle]}>
                              <Ionicons name={PROFILE_CONSTANTS.CLOUD_UPLOAD_OUTLINE} size={22} color={NEW_COLOR.TEXT_BLACK} />
                              <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw500]} text={PROFILE_CONSTANTS?.ADD_YOUR_SIGNATURE} />
                            </View>
                            {errorMsgs.signImageError && <ParagraphComponent style={[commonStyles.textError]} text={errorMsgs.signImageError} />}
                          </View>
                        </TouchableOpacity>
                        <View style={[commonStyles.mb16]} />
                        <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]} >
                          {signPhotoLoading && (
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { minHeight: 150 }]}>
                              <ActivityIndicator size={PROFILE_CONSTANTS.LARGE} color={NEW_COLOR.TEXT_GREY} />
                            </View>
                          )}
                          {uploadImgs.signImage &&
                            !signPhotoLoading && (
                              <View style={[styles.passport, { backgroundColor: "#fff" }]}>
                                <Image
                                  style={[commonStyles.rounded16, commonStyles.flex1]}
                                  resizeMode="contain"
                                  overlayColor="#fff"
                                  source={{ uri: uploadImgs.signImage }}
                                />
                              </View>
                            )}
                          {!(uploadImgs.signImage) &&
                            !signPhotoLoading && (
                              <View style={[styles.passport,]}>
                                <Image
                                  style={{ borderRadius: 16, flex: 1, width: "100%" }}
                                  resizeMode="cover"
                                  source={require("../../assets/images/cards/default-sign.png")}
                                />
                              </View>
                            )}
                        </View>
                        <View style={[commonStyles.mb24]} />
      
                      </View>}

                      {isHideField(values?.emergencyContactName, true) &&
                        <View>
                          <Field
                            touched={touched.emergencyContactName}
                            name={FORMIK_CONSTANTS.EMERGENCY_CONTACT_NAME}
                            label={FIELD_CONSTANTS.EMERGENCY_CONTACT_NAME}
                            error={errors.emergencyContactName}
                            handleBlur={handleBlur}
                            placeholder={PLACEHOLDER_CONSTANTS.ENTER_EMERGENCY_CONTACT_NAME}
                            component={InputDefault}
                            editable={!isFormLocked}
                          />

                          <View style={[commonStyles.mb32]} />
                        </View>}
                      {isHideField(values?.emergencyContactPhoneNumber, true) &&
                        <View>
                          <LabelComponent
                            text={" Emergency Contact Number "}
                            style={[commonStyles.fs12, commonStyles.fw500, NEW_COLOR.TEXT_LABEL]} />
                          <View style={[commonStyles.relative, commonStyles.dflex, commonStyles.gap8]}>
                            <PhoneCodePicker
                              modalTitle={"Select Country Code"}
                              style={undefined}
                              customBind={["name", "(", "code", ")"]}
                              data={lists?.countryCodelist}
                              value={values.emergencyContactPhoneCode}
                              placeholder="Select"
                              containerStyle={[]}
                              onChange={(item) =>
                                setFieldValue("emergencyContactPhoneCode", item.code)
                              }
                              disable={isFormLocked}
                            />
                            <TextInput
                              style={[styles.inputStyle, commonStyles.mb4]}
                              placeholder="Enter  Emergency Contact Number"
                              onChangeText={(text) => handleChange("emergencyContactPhoneNumber")(text.replace(/[^0-9]/g, ""))}
                              onBlur={handleBlur("emergencyContactPhoneNumber")}
                              value={values.emergencyContactPhoneNumber}
                              keyboardType="phone-pad"
                              placeholderTextColor={NEW_COLOR.PLACEHOLDER_STYLE}
                              multiline={false}
                              editable={!isFormLocked}
                            />
                          </View>
                          <View style={[commonStyles.mb24]} />
                        </View>}
                      {isHideField(values?.emergencyContactEmail, true) &&
                        <View>
                          <Field
                            touched={touched.emergencyContactEmail}
                            name="emergencyContactEmail"
                            label={"Emergency Contact Email "}
                            error={errors.emergencyContactEmail}
                            handleBlur={handleBlur}
                            customContainerStyle={{}}
                            placeholder={"Emergency Contact Email"}
                            component={InputDefault}
                            editable={!isFormLocked}
                            innerRef={emergencyEmail} />

                          <View style={[commonStyles.mb32]} />
                        </View>
                      }
                      {!userInfo?.isSumsubKyc && <View style={[commonStyles.justify, commonStyles.flexColumn, commonStyles.f]}>
                        <DefaultButton
                          title={PROFILE_CONSTANTS.SAVE}
                          style={undefined}
                          iconArrowRight={false}
                          iconCheck={true}
                          loading={btnLoading}
                          disable={undefined}
                          onPress={handleSubmit}
                        />
                      </View>}
                      <View style={commonStyles.mb32} />
                    </>
                  );
                }}
              </Formik>
            </>
          )}
        </Container>
      </ScrollView>
      <OverlayPopup
        title={PLACEHOLDER_CONSTANTS.UPLOAD_YOUR_FACE_PHOTO}
        isVisible={openSelfiePopup}
        handleClose={handleOpenSelfiePopup}
        methodOne={selectSelfie}
        methodTwo={selectFacePhoto}
        lable1={PLACEHOLDER_CONSTANTS.TAKE_SELFIE}
        lable2={PLACEHOLDER_CONSTANTS.UPLOAD_FROM_GALLERY}
        colors={NEW_COLOR}
        windowWidth={WINDOW_WIDTH}
        windowHeight={WINDOW_HEIGHT}
      />

      <OverlayPopup
        title={PROFILE_CONSTANTS.ADD_YOUR_SIGNATURE}
        isVisible={signModelVisible}
        handleClose={handleCloseSignModel}
        methodOne={handleSelectSignPhoto}
        methodTwo={togglePopup}
        lable1={PROFILE_CONSTANTS?.UPLOAD_YOUR_SIGNATURE}
        lable2={PROFILE_CONSTANTS?.DRAW_YOUR_SIGNATURE}
        colors={NEW_COLOR}
        windowWidth={WINDOW_WIDTH}
        windowHeight={WINDOW_HEIGHT}
      />
      <CommonOverlay
        isVisible={popupVisible}
        onClose={togglePopup}
        windowWidth={WINDOW_WIDTH}
        windowHeight={WINDOW_HEIGHT}
        children={SignatureContext}
      />
    </SafeAreaView>

  );
};

export default AddKycInfomation;
const styles = StyleSheet.create({
  ml12: { marginLeft: 12 },
  px8: { paddingVertical: 8 },
  wauto: { alignSelf: 'flex-start', },
  SelectStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
    marginBottom: 6,
    gap: 9, minHeight: 54, backgroundColor: NEW_COLOR.BG_BLACK,
    borderStyle: "dashed",
  },
  bgorange: { backgroundColor: NEW_COLOR.MENU_CARD_BG, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, },
  passport: { width: '100%', borderRadius: 16, height: 250, borderWidth: 1, borderColor: NEW_COLOR.BORDER_LIGHT, overflow: "hidden" },
  pr16: { paddingRight: 16, },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NEW_COLOR.SECTION_BG,
  },
  signatureCaptureContainer: {
    height: (WINDOW_HEIGHT * 40) / 100,
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_GREY,
    borderRadius: 0,
    overflow: 'hidden',
  },
  signatureCapture: {
    width: '100%',
    height: (WINDOW_HEIGHT * 50) / 100,
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_GREY,
    borderRadius: 16,
  },
  input: {
    borderRadius: 8,
    borderColor: NEW_COLOR.SEARCH_BORDER,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
    borderWidth: 1,
    color: NEW_COLOR.TEXT_WHITE,
    paddingVertical: 8,
    paddingHorizontal: 14, height: 46
  }, inputStyle: {
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
    textAlignVertical: 'center',
  },
});
