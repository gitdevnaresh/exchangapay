import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  SafeAreaView,
  BackHandler,
  ActivityIndicator,
  Modal,
  Text,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/core";
import { Container } from "../../components";
import { useSelector } from "react-redux";
import { ms, s } from "../../constants/theme/scale";
import {
  NEW_COLOR,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "../../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import Feather from "react-native-vector-icons/Feather";
import DefaultButton from "../../components/DefaultButton";
import LabelComponent from "../../components/Paragraph/label";
import { commonStyles } from "../../components/CommonStyles";
import { Field, Formik } from "formik";
import CustomPickerAcc from "../../components/CustomPicker";
import InputDefault from "../../components/DefaultFiat";
import { EditProfileSchema } from "./EditProfileInfoSchema";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import ProfileService from "../../services/profile";
import DatePickers from "react-native-date-picker";
import {
  formatDate,
  formatDateMonth,
  formatDateTimeAPI,
  isErrorDispaly,
  trimValues,
} from "../../utils/helpers";
import Loadding from "../../components/skeleton";
import ErrorComponent from "../../components/Error";
import { personalInfoLoader } from "./skeleton_views";
import SignatureCanvas from "react-native-signature-canvas";
import RadioButton from "../../components/Button/RadioButton";
import { PERMISSIONS, request, RESULTS } from "react-native-permissions";
import {
  FIELD_CONSTANTS,
  FORMIK_CONSTANTS,
  PLACEHOLDER_CONSTANTS,
  PROFILE_CONSTANTS,
  UserDetails,
} from "./constants";
import OverlayPopup from "../cards/SelectPopup";
import { CREATE_KYC_ADDRESS_CONST } from "../cards/constant";
import moment from "moment";

const EditProfile = (props: any) => {
  const ref = useRef<any>(null);
  const fname = useRef(null);
  const lname = useRef(null);
  const doctype = useRef(null);
  const docno = useRef(null);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const [idPhoto, setIdPhoto] = useState<any>(null);
  const [passortImage, setPassortImage] = useState<any>(null);
  const [signImage, setSignImage] = useState<any>(null);
  const [editDataLoading, setEditDataLoading] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<string>("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [countryLookUp, setCountryLookUp] = useState<any>([]);
  const [genderLookUp, setGenderLookUp] = useState<any>([]);
  const [idTypesLookUp, setIdTypesLookUp] = useState<any>([]);
  const [frontIdPhoto, setFrontIdPhoto] = useState<string>("");
  const [singaturePhoto, setSingaturePhoto] = useState<string>("");
  const [handHoldingPhoto, setHandHoldingPhoto] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [idPhotoLoading, setIdPhotoLoading] = useState<boolean>(false);
  const [signPhotoLoading, setSignPhotoLoading] = useState<boolean>(false);
  const EditInfoLoader = personalInfoLoader(10);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const [passportImg, setPassportImg] = useState<any>("");
  const [selectIdPhoto, setSelectIdPhoto] = useState<any>("");
  const [signPhoto, setSignPhoto] = useState<any>("");
  const signatureRef = useRef(null);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [date, setDate] = useState<any>(null);
  const [expiryDatePicker, setExpiryDatePicker] = useState<boolean>(false);
  const [expirydate, setExpirydate] = useState<any>(null);
  const [selfie, setSelfie] = useState<any>("");
  const [isSelfieLoading, setIsSelfieLoading] = useState<boolean>(false);
  const [backPhoto, setBackPhoto] = useState<any>("");
  const [isBackLoading, setBackLoading] = useState<boolean>(false);
  const [selfieError, setSelfieError] = useState<any>("");
  const [backImagError, setBackImageError] = useState<any>("");
  const [signModelVisible, setSignModelVisible] = useState<boolean>(false);
  const [openSelfiePopup, setOpenSelfiePopup] = useState<boolean>(false);

  const [initValues, setInitValues] = useState<any>({
    realfirstName: "",
    reallastName: "",
    gender: "",
    dateOfBirth: date,
    idIssuranceCountry: "",
    documentType: "",
    documentNumber: "",
    expireyDate: expirydate,
    firstName: "",
    emergencyContactName: "",
  });
  useEffect(() => {
    fetchProfileEditView();
    fetchLookUps();
  }, []);
  const isFocused = useIsFocused();
  useEffect(() => {
    ref.current.scrollTo({ y: 0 });
  }, [isFocused]);
  const fetchLookUps = async () => {
    try {
      const response: any = await ProfileService.getprofileEditLookups();
      setCountryLookUp(response.data.Country);
      setGenderLookUp(response.data.Gender);
      setIdTypesLookUp(response.data.IdTypes);
      setErrormsg("");
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
    }
  };

  const handleSaveSignature = (event: any) => {
    const { pathName, encoded } = event;
    if (pathName || encoded) {
      selectSignPhoto(event);
      togglePopup();
    }
  };

  const handleOpenSelfiePopup = () => {
    setOpenSelfiePopup(!openSelfiePopup);
  };

  const saveSign = () => {
    try {
      signatureRef?.current?.saveImage();
    } catch (error) {}
  };

  const resetSign = () => {
    try {
      signatureRef?.current?.resetImage();
    } catch (error) {}
  };

  const togglePopup = () => {
    setPopupVisible(!popupVisible);
    setSignModelVisible(false);
  };

  const fetchProfileEditView = async () => {
    try {
      setEditDataLoading(true);
      const response: any = await ProfileService.getProfileEditView(
        userInfo.id
      );
      if (response?.ok) {
        const apiDate = response.data?.dob ? new Date(response.data.dob) : null;
        const apiExpireyDate = response.data?.expirationDate
          ? new Date(response.data?.expirationDate)
          : null;
        setFrontIdPhoto(response?.data?.frontIdPhoto);
        setHandHoldingPhoto(response?.data?.handHoldingPhoto);
        setSingaturePhoto(response.data?.singaturePhoto);
        setSelfie(response?.data?.profileImage);
        setBackPhoto(response?.data?.backDocImage);
        setExpirydate(apiExpireyDate);
        const intialValue = {
          realfirstName: response?.data?.firstName,
          reallastName: response?.data?.lastName,
          gender: response?.data?.gender,
          dateOfBirth: response?.data?.dob,
          idIssuranceCountry: response?.data?.idIssuranceCountry,
          documentType: response?.data?.documentType,
          documentNumber: response?.data?.documentNumber,
          emergencyContactName: response?.data?.emergencyContactName,
          expireyDate: response?.data?.expirationDate,
          firstName: response?.data?.fullName,
        };
        setDate(apiDate);
        setInitValues(intialValue);
        setErrormsg("");
        setEditDataLoading(false);
        ref?.current?.scrollTo({ y: 0, animated: true });
      } else {
        setErrormsg(isErrorDispaly(response));
        setEditDataLoading(false);
        ref?.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
      setEditDataLoading(false);
    }
  };

  const handleUpdate = async (values: any) => {
    if (!passortImage && !frontIdPhoto) {
      setPassportImg(PROFILE_CONSTANTS.IS_REQUIRED);
    }
    if (!idPhoto && !handHoldingPhoto) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setSelectIdPhoto(PROFILE_CONSTANTS.IS_REQUIRED);
    }
    if (!signImage && !singaturePhoto) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setSignPhoto(PROFILE_CONSTANTS.IS_REQUIRED);
    }
    if (!backPhoto) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setBackImageError(PROFILE_CONSTANTS.IS_REQUIRED);
    }
    if (!selfie) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setSelfieError(PROFILE_CONSTANTS.IS_REQUIRED);
    }
    if (
      !selfie ||
      (!signImage && !singaturePhoto) ||
      (!idPhoto && !handHoldingPhoto) ||
      !backPhoto ||
      (!signImage && !singaturePhoto) ||
      (!idPhoto && !handHoldingPhoto) ||
      (!passortImage && !frontIdPhoto)
    ) {
      return;
    }
    setBtnLoading(true);
    const trimedValues = trimValues(values);
    let Obj: UserDetails = {
      firstName: trimedValues.realfirstName,
      lastName: trimedValues.reallastName,
      gender: trimedValues.gender,
      dob: formatDateTimeAPI(date),
      idIssuranceCountry: trimedValues.idIssuranceCountry,
      documentType: trimedValues.documentType,
      documentNumber: trimedValues.documentNumber,
      frontIdPhoto: passortImage || frontIdPhoto,
      handHoldingIdPhoto: idPhoto || handHoldingPhoto,
      singaturePhoto: signImage || singaturePhoto,
      emergencyContactName: trimedValues.emergencyContactName,
      expirationDate: formatDateTimeAPI(expirydate),
      profileImage: selfie,
      backDocImage: backPhoto,
    };

    try {
      const res: any = await ProfileService?.updateProfile(userInfo.id, Obj);
      if (res.status === 200) {
        props?.navigation?.goBack();
        setBtnLoading(false);
        setErrormsg("");
      } else {
        setErrormsg(isErrorDispaly(res));
        ref?.current?.scrollTo({ y: 0, animated: true });
        setBtnLoading(false);
      }
      setPassportImg("");
      setSelectIdPhoto("");
      setSignPhoto("");
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
      setBtnLoading(false);
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
  const selectPassortImage = async () => {
    setPassportImg("");
    try {
      const result = await launchImageLibrary({
        mediaType: PROFILE_CONSTANTS.PHOTO,
      });
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
            setPassortImage(
              uploadRes?.data && uploadRes.data?.length > 0
                ? uploadRes.data[0]
                : ""
            );
            setErrormsg("");
          } else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(uploadRes));
          }
        } else {
          if (!isValid) {
            setErrormsg(PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT);
            ref?.current?.scrollTo({ y: 0, animated: true });
          } else if (!isValidSize) {
            setErrormsg(PROFILE_CONSTANTS.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB);
            ref?.current?.scrollTo({ y: 0, animated: true });
          }
        }
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(err));
    } finally {
      setUploading(false);
    }
  };

  const handleSelectSignPhoto = async () => {
    setPassportImg("");
    setSignModelVisible(false);
    try {
      const result = await launchImageLibrary({
        mediaType: PROFILE_CONSTANTS.PHOTO,
      });
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
            setSignImage(
              uploadRes?.data && uploadRes.data?.length > 0
                ? uploadRes.data[0]
                : ""
            );
            setErrormsg("");
          } else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(uploadRes));
          }
        } else {
          if (!isValid) {
            setErrormsg(PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT);
            ref?.current?.scrollTo({ y: 0, animated: true });
          } else if (!isValidSize) {
            setErrormsg(PROFILE_CONSTANTS.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB);
            ref?.current?.scrollTo({ y: 0, animated: true });
          }
        }
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(err));
    } finally {
      setUploading(false);
    }
  };

  const verifyFileSize = (fileSize: any) => {
    const maxSizeInBytes = 20 * 1024 * 1024;
    return fileSize <= maxSizeInBytes;
  };
  const selectsetIdPhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: PROFILE_CONSTANTS.PHOTO,
      });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const isValidType = verifyFileTypes(result.assets[0].fileName);
        const isValidSize = verifyFileSize(result.assets[0].fileSize);
        if (isValidType && isValidSize) {
          setIdPhotoLoading(true);
          setSelectIdPhoto("");
          let formData = new FormData();
          formData.append(PROFILE_CONSTANTS.DOCUMENT, {
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          });
          const uploadRes = await ProfileService.uploadFile(formData);
          if (uploadRes.status === 200) {
            setIdPhoto(
              uploadRes?.data && uploadRes.data?.length > 0
                ? uploadRes.data[0]
                : ""
            );
            setErrormsg("");
          } else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(uploadRes));
          }
        } else {
          if (!isValidType) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT);
          } else if (!isValidSize) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(PROFILE_CONSTANTS.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB);
          }
        }
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(err));
    } finally {
      setIdPhotoLoading(false);
    }
  };

  const selectSignPhoto = async (event: any) => {
    try {
      setSignPhotoLoading(true);

      let Obj = {
        imageBytes: event.encoded,
      };
      const uploadRes = await ProfileService.uploadSingnitureFile(Obj);
      if (uploadRes.status === 200) {
        setSignImage(
          uploadRes?.data && uploadRes.data?.length > 0 ? uploadRes.data[0] : ""
        );
        setErrormsg("");
      } else {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrormsg(isErrorDispaly(uploadRes));
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(err));
    } finally {
      setSignPhotoLoading(false);
    }
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
    if (props?.route?.params?.cardId) {
      props.navigation.push(PROFILE_CONSTANTS.APPLY_EXCHANGE_CARD, {
        cardId: props?.route?.params?.cardId,
        logo: props?.route?.params?.logo,
      });
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
      return today.diff(birthDate, "years") >= 18;
    }
  };

  const validate = async (values: any) => {
    let errors: any = {};
    try {
      await EditProfileSchema.validate(values, { abortEarly: false });
      return {};
    } catch (validationErrors: any) {
      validationErrors.inner.forEach((error: any) => {
        errors[error.path] = error.message;
        ref?.current?.scrollTo({ y: 0, animated: true });
      });
      if (!passortImage && !frontIdPhoto) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        errors.frontIdPhoto = PROFILE_CONSTANTS.IS_REQUIRED;
      }
      if (!idPhoto && !handHoldingPhoto) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        errors.handHoldingPhoto = PROFILE_CONSTANTS.IS_REQUIRED;
      }
      if (!backPhoto) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        errors.backPhoto = PROFILE_CONSTANTS.IS_REQUIRED;
      }
      if (!signImage && !singaturePhoto) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        errors.singaturePhoto = PROFILE_CONSTANTS.IS_REQUIRED;
      }
      if (!selfie) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        errors.selfie = PROFILE_CONSTANTS.IS_REQUIRED;
      }
      if (!values.documentNumber) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        errors.documentNumber = PROFILE_CONSTANTS.IS_REQUIRED;
      }
      if (!values.emergencyContactName) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        errors.emergencyContactName = PROFILE_CONSTANTS.IS_REQUIRED;
      }
      // if (!values.expireyDate) {
      //   ref?.current?.scrollTo({ y: 0, animated: true });
      //   errors.expireyDate = PROFILE_CONSTANTS.IS_REQUIRED;
      // }
      if (!values.realfirstName) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        errors.realfirstName = PROFILE_CONSTANTS.IS_REQUIRED;
      }
      if (!values.reallastName) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        errors.reallastName = PROFILE_CONSTANTS.IS_REQUIRED;
      }
      if (!date) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        errors.dateOfBirth = PROFILE_CONSTANTS.IS_REQUIRED;
      }
      if (date !== null && validateAge(date) === false) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        errors.dateOfBirth = "You must be at least 18 years old";
      }
      if (!expirydate) {
        errors.expireyDate = PROFILE_CONSTANTS.IS_REQUIRED;
        ref?.current?.scrollTo({ y: 0, animated: true });
      }
      if (values?.expireyDate < values?.dateOfBirth) {
        errors.expireyDate =
          CREATE_KYC_ADDRESS_CONST.EXPIRY_DATE_VALIDATION_VALIDATION;
        ref?.current?.scrollTo({ y: 0, animated: true });
        return;
      }
      setPassportImg(errors.frontIdPhoto || "");
      setSelectIdPhoto(errors.handHoldingPhoto || "");
      setSignPhoto(errors.singaturePhoto || "");
      setSelfieError(errors.selfie);
      setBackImageError(errors.backPhoto);
      return errors;
    }
  };

  const handleExpiryDateModel = () => {
    setExpiryDatePicker(!expiryDatePicker);
  };

  const handleDateOfBirthModel = () => {
    setShowPicker(!showPicker);
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
        Alert.alert(
          PROFILE_CONSTANTS.PERMISSION,
          PROFILE_CONSTANTS.CAMERA_ACCESS_IS_NEEDED_TO_TAKE_A_SELFIE
        );
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
    setSelfie("");
    setOpenSelfiePopup(false);
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }
    try {
      const result = await launchCamera({
        mediaType: "photo",
        cameraType: "front",
      });
      setOpenSelfiePopup(false);
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const isValid = verifyFileTypes(result.assets[0].fileName);
        const isValidSize = verifyFileSize(result.assets[0].fileSize);
        if (isValid && isValidSize) {
          setIsSelfieLoading(true);
          setSelfieError("");
          let formData = new FormData();
          formData.append("document", {
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          });
          const uploadRes = await ProfileService.uploadFile(formData);
          setOpenSelfiePopup(false);
          if (uploadRes.status === 200) {
            setSelfie(
              uploadRes?.data && uploadRes.data?.length > 0
                ? uploadRes.data[0]
                : ""
            );
            setErrormsg("");
          } else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setOpenSelfiePopup(false);
            setErrormsg(isErrorDispaly(uploadRes));
          }
        } else {
          if (!isValid) {
            setErrormsg(PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT);
            ref?.current?.scrollTo({ y: 0, animated: true });
          } else if (!isValidSize) {
            setErrormsg(PROFILE_CONSTANTS.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB);
            ref?.current?.scrollTo({ y: 0, animated: true });
          }
        }
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(err));
    } finally {
      setIsSelfieLoading(false);
    }
  };

  const selectBackPhoto = async () => {
    setBackPhoto("");
    try {
      const result = await launchImageLibrary({
        mediaType: PROFILE_CONSTANTS.PHOTO,
      });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const isValid = verifyFileTypes(result.assets[0].fileName);
        const isValidSize = verifyFileSize(result.assets[0].fileSize);
        if (isValid && isValidSize) {
          setBackLoading(true);
          setBackImageError("");
          let formData = new FormData();
          formData.append(PROFILE_CONSTANTS.DOCUMENT, {
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          });
          const uploadRes = await ProfileService.uploadFile(formData);
          if (uploadRes.status === 200) {
            setBackPhoto(
              uploadRes?.data && uploadRes.data?.length > 0
                ? uploadRes.data[0]
                : ""
            );
            setErrormsg("");
          } else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(uploadRes));
          }
        } else {
          if (!isValid) {
            setErrormsg(PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT);
            ref?.current?.scrollTo({ y: 0, animated: true });
          } else if (!isValidSize) {
            setErrormsg(PROFILE_CONSTANTS.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB);
            ref?.current?.scrollTo({ y: 0, animated: true });
          }
        }
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(err));
    } finally {
      setBackLoading(false);
    }
  };

  const handleVisibleSignModel = () => {
    setSignModelVisible(!signModelVisible);
  };

  const handleCloseSignModel = () => {
    setSignModelVisible(false);
  };

  const selectFacePhoto = async () => {
    setOpenSelfiePopup(false);
    try {
      const result = await launchImageLibrary({
        mediaType: PROFILE_CONSTANTS.PHOTO,
      });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const isValidType = verifyFileTypes(result.assets[0].fileName);
        const isValidSize = verifyFileSize(result.assets[0].fileSize);
        if (isValidType && isValidSize) {
          setIsSelfieLoading(true);
          setSelfieError("");
          let formData = new FormData();
          formData.append(PROFILE_CONSTANTS.DOCUMENT, {
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          });
          const uploadRes = await ProfileService.uploadFile(formData);
          if (uploadRes.status === 200) {
            setSelfie(
              uploadRes?.data && uploadRes.data?.length > 0
                ? uploadRes.data[0]
                : ""
            );
            setIsSelfieLoading(false);
            setOpenSelfiePopup(false);
            setSelfieError("");
          } else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(uploadRes));
          }
        } else {
          if (!isValidType) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT);
          } else if (!isValidSize) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(PROFILE_CONSTANTS.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB);
          }
        }
      }
    } catch (err) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(err));
    } finally {
      setIsSelfieLoading(false);
      setOpenSelfiePopup(false);
    }
  };
  const handleCloseError = () => {
    setErrormsg("");
  };

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
              <View
                style={[
                  commonStyles.dflex,
                  commonStyles.mb43,
                  commonStyles.alignCenter,
                ]}
              >
                <TouchableOpacity
                  style={[styles.pr16, styles.px8]}
                  onPress={handleGoBack}
                >
                  <View>
                    <View>
                      <AntDesign
                        name={PROFILE_CONSTANTS?.ARROW_LEFT}
                        size={s(22)}
                        color={NEW_COLOR.TEXT_BLACK}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
                <View>
                  <ParagraphComponent
                    style={[
                      commonStyles.fs16,
                      commonStyles.textBlack,
                      commonStyles.fw700,
                    ]}
                    text={
                      (props?.route?.params?.isQuickLink &&
                        PROFILE_CONSTANTS?.ADD_KYC_INFORMATION) ||
                      PROFILE_CONSTANTS?.EDIT_KYC_INFORMATION
                    }
                  />
                  <ParagraphComponent
                    text={PROFILE_CONSTANTS?.NOTE_PLEASE_WRITE_IN_ENGLISH}
                    style={[commonStyles.fs10, styles.note, commonStyles.fw300]}
                  />
                </View>
              </View>
              {errormsg && (
                <ErrorComponent message={errormsg} onClose={handleCloseError} />
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
                  const {
                    touched,
                    handleSubmit,
                    errors,
                    handleBlur,
                    values,
                    setFieldValue,
                  } = formik;
                  return (
                    <>
                      <Field
                        touched={touched.realfirstName}
                        name={FORMIK_CONSTANTS.REAL_FIRST_NAME}
                        label={FIELD_CONSTANTS.FIRST_NAME}
                        error={errors.realfirstName}
                        handleBlur={handleBlur}
                        placeholder={PLACEHOLDER_CONSTANTS.ENTER_FIRST_NAME}
                        component={InputDefault}
                        innerRef={fname}
                        Children={
                          <LabelComponent
                            text={PLACEHOLDER_CONSTANTS?.REQUIRED_STAR}
                            style={commonStyles.textError}
                          />
                        }
                      />
                      <View style={[commonStyles.mb26]} />
                      <Field
                        touched={touched.reallastName}
                        name={FORMIK_CONSTANTS.REAL_LAST_NAME}
                        label={FIELD_CONSTANTS.LAST_NAME}
                        error={errors.reallastName}
                        handleBlur={handleBlur}
                        customContainerStyle={{}}
                        placeholder={PLACEHOLDER_CONSTANTS.ENTER_LAST_NAME}
                        component={InputDefault}
                        innerRef={lname}
                        Children={
                          <LabelComponent
                            text={PLACEHOLDER_CONSTANTS?.REQUIRED_STAR}
                            style={commonStyles.textError}
                          />
                        }
                      />

                      <View style={[commonStyles.mb24]} />
                      <LabelComponent
                        text={FIELD_CONSTANTS.GENDER}
                        Children={
                          <LabelComponent
                            text={PLACEHOLDER_CONSTANTS?.REQUIRED_STAR}
                            style={commonStyles.textError}
                          />
                        }
                        style={[commonStyles.mb10]}
                      />
                      <RadioButton
                        options={genderLookUp}
                        selectedOption={values.gender}
                        onSelect={(val: any) =>
                          setFieldValue(PLACEHOLDER_CONSTANTS.GENDER, val)
                        }
                        nameField={FIELD_CONSTANTS?.NAME}
                        valueField={FIELD_CONSTANTS?.NAME}
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
                      <View style={[commonStyles.mb26]} />

                      <LabelComponent
                        text={FIELD_CONSTANTS?.DATE_OF_BIRTH}
                        Children={
                          <LabelComponent
                            text={PLACEHOLDER_CONSTANTS?.REQUIRED_STAR}
                            style={commonStyles.textError}
                          />
                        }
                        style={[commonStyles.mb10]}
                      />
                      <View
                        style={[
                          styles.input,
                          commonStyles.dflex,
                          commonStyles.alignCenter,
                          commonStyles.justifyContent,
                        ]}
                      >
                        {(date !== null && (
                          <ParagraphComponent
                            style={[commonStyles.fs14, commonStyles.textBlack]}
                            text={formatDateMonth(date)}
                          />
                        )) || (
                          <ParagraphComponent
                            style={[commonStyles.fs14, commonStyles.textGrey]}
                            text={PROFILE_CONSTANTS?.DD_MM_YYYY}
                          />
                        )}
                        {showPicker && (
                          <DatePickers
                            modal
                            mode={PROFILE_CONSTANTS?.DATE}
                            open={showPicker}
                            date={date || new Date()}
                            onConfirm={(date) => {
                              setShowPicker(false);
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
                          <Feather
                            name={PROFILE_CONSTANTS.CALENDER}
                            size={22}
                            color={PROFILE_CONSTANTS.WHITE_COLOR}
                            onPress={handleDateOfBirthModel}
                          />
                        </View>
                      </View>
                      {errors.dateOfBirth && (
                        <ParagraphComponent
                          style={[
                            styles.ml12,
                            commonStyles.fs12,
                            commonStyles.fw400,
                            commonStyles.textError,
                            { marginTop: 4 },
                          ]}
                          text={errors.dateOfBirth}
                        />
                      )}
                      <View style={[commonStyles.mb26]} />

                      <Field
                        touched={touched.idIssuranceCountry}
                        name={FORMIK_CONSTANTS?.ID_ISSURANCE_COUNTRY}
                        label={FIELD_CONSTANTS?.ID_ISSUEANCE_COUNTRY}
                        value={initValues.idIssuranceCountry}
                        error={errors.idIssuranceCountry}
                        handleBlur={handleBlur}
                        placeholder={PLACEHOLDER_CONSTANTS?.SELECT_COUNRY}
                        data={countryLookUp}
                        modalTitle={PLACEHOLDER_CONSTANTS.SELECT_COUNRY}
                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                        component={CustomPickerAcc}
                        Children={
                          <LabelComponent
                            text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR}
                            style={commonStyles.textError}
                          />
                        }
                      />
                      <View style={[commonStyles.mb26]} />
                      <Field
                        activeOpacity={0.9}
                        innerRef={doctype}
                        style={{
                          color: PROFILE_CONSTANTS.TRANSPARENT,
                          backgroundColor: PROFILE_CONSTANTS.TRANSPARENT,
                        }}
                        label={FIELD_CONSTANTS.DOCUMENT_TYPE}
                        touched={touched.documentType}
                        name={FORMIK_CONSTANTS.DOCUMENT_TYPE}
                        error={errors.documentType}
                        handleBlur={handleBlur}
                        customContainerStyle={{
                          height: 80,
                        }}
                        data={idTypesLookUp}
                        placeholder={PLACEHOLDER_CONSTANTS.SELECT_DOCUMENT_TYPE}
                        modalTitle={PLACEHOLDER_CONSTANTS.SELECT_DOCUMENT_TYPE}
                        placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                        component={CustomPickerAcc}
                        Children={
                          <LabelComponent
                            text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR}
                            style={commonStyles.textError}
                          />
                        }
                      />
                      <View style={[commonStyles.mb26]} />
                      <Field
                        activeOpacity={0.9}
                        touched={touched.documentNumber}
                        name={FORMIK_CONSTANTS.DOCUMENT_NUMBER}
                        label={FIELD_CONSTANTS.DOCUMNET_NUMBER}
                        error={errors.documentNumber}
                        handleBlur={handleBlur}
                        customContainerStyle={{
                          height: 80,
                        }}
                        placeholder={
                          PLACEHOLDER_CONSTANTS.ENTER_DOCUMENT_NUMBER
                        }
                        component={InputDefault}
                        innerRef={docno}
                        Children={
                          <LabelComponent
                            text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR}
                            style={commonStyles.textError}
                          />
                        }
                      />
                      <View style={[commonStyles.mb26]} />

                      <LabelComponent
                        text={FIELD_CONSTANTS.DOCUMNET_EXPIRY_DATE}
                        Children={
                          <LabelComponent
                            text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR}
                            style={commonStyles.textError}
                          />
                        }
                        style={[commonStyles.mb10]}
                      />
                      <View
                        style={[
                          styles.input,
                          commonStyles.dflex,
                          commonStyles.alignCenter,
                          commonStyles.justifyContent,
                        ]}
                      >
                        {(expirydate !== null && (
                          <ParagraphComponent
                            style={[commonStyles.fs14, commonStyles.textBlack]}
                            text={formatDateMonth(expirydate)}
                          />
                        )) || (
                          <ParagraphComponent
                            style={[commonStyles.fs14, commonStyles.textGrey]}
                            text={PROFILE_CONSTANTS?.DD_MM_YYYY}
                          />
                        )}
                        {expiryDatePicker && (
                          <DatePickers
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
                          />
                        )}
                        <View>
                          <Feather
                            name={PROFILE_CONSTANTS.CALENDER}
                            size={22}
                            color={PROFILE_CONSTANTS.WHITE_COLOR}
                            onPress={handleExpiryDateModel}
                          />
                        </View>
                      </View>

                      {errors.expireyDate && (
                        <ParagraphComponent
                          style={[
                            commonStyles.fs12,
                            commonStyles.fw400,
                            commonStyles.textError,
                            { marginTop: 4 },
                          ]}
                          text={errors.expireyDate}
                        />
                      )}
                      <View style={[commonStyles.mb26]} />
                      <TouchableOpacity
                        onPress={selectPassortImage}
                        activeOpacity={0.6}
                      >
                        <View>
                          <LabelComponent
                            text={
                              FIELD_CONSTANTS.UPLOAD_YOUR_FORNT_PHOTO_ID_20MB
                            }
                            Children={
                              <LabelComponent
                                text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR}
                                style={commonStyles.textError}
                              />
                            }
                          />
                          <View style={styles.SelectStyle}>
                            <Ionicons
                              name={PROFILE_CONSTANTS.CLOUD_UPLOAD_OUTLINE}
                              size={22}
                              color={NEW_COLOR.TEXT_BLACK}
                            />
                            <ParagraphComponent
                              style={[
                                commonStyles.fs16,
                                commonStyles.textBlack,
                                commonStyles.fw500,
                              ]}
                              text={
                                PLACEHOLDER_CONSTANTS.UPLOAD_YOUR_FRONT_PHOTO_ID
                              }
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
                          justifyContent: PROFILE_CONSTANTS.CENTER,
                          alignItems: PROFILE_CONSTANTS.CENTER,
                        }}
                      >
                        {uploading && (
                          <View
                            style={[
                              commonStyles.dflex,
                              commonStyles.alignCenter,
                              commonStyles.justifyCenter,
                              { minHeight: 150 },
                            ]}
                          >
                            <ActivityIndicator
                              size={PROFILE_CONSTANTS.LARGE}
                              color="#fff"
                            />
                          </View>
                        )}
                        {(passortImage || frontIdPhoto) && !uploading && (
                          <View style={[styles.passport]}>
                            <Image
                              style={{ borderRadius: 16, flex: 1 }}
                              overlayColor="#fff"
                              resizeMode="contain"
                              source={{ uri: passortImage || frontIdPhoto }}
                            />
                          </View>
                        )}
                        {!(passortImage || frontIdPhoto) && !uploading && (
                          <View
                            style={[
                              styles.passport,
                              { backgroundColor: "#F6FCFE" },
                            ]}
                          >
                            <Image
                              style={[
                                commonStyles.mxAuto,
                                { borderRadius: 16, flex: 1 },
                              ]}
                              overlayColor={PROFILE_CONSTANTS.TRANSPARENT}
                              resizeMode="contain"
                              source={require("../../assets/images/cards/passport.png")}
                            />
                          </View>
                        )}
                      </View>
                      <View style={[commonStyles.mb26]} />
                      <View style={[styles.bgorange]}>
                        <View
                          style={[
                            commonStyles.dflex,
                            commonStyles.gap8,
                            commonStyles.mb8,
                            styles.mr8,
                          ]}
                        >
                          <Feather
                            name={PROFILE_CONSTANTS.INFO}
                            size={14}
                            style={{ marginTop: 4 }}
                            color={NEW_COLOR.TEXT_GREY}
                          />
                          <View>
                            <ParagraphComponent
                              style={[
                                commonStyles.fs12,
                                commonStyles.textGrey,
                                commonStyles.fw400,
                                commonStyles.mb4,
                              ]}
                              text={
                                PLACEHOLDER_CONSTANTS.PLEASE_UPLOAD_THE_A_PHOTO_OF_THE_INFORMATION_PAGE_ALONG_WITH_YOUR_PRIFILE_PICTURE
                              }
                            />
                            <ParagraphComponent
                              style={[
                                commonStyles.fs12,
                                commonStyles.textGrey,
                                commonStyles.fw400,
                              ]}
                              text={
                                PLACEHOLDER_CONSTANTS.ENSURE_THAT_THE_ID_FRAME_IS_FULLY_VISIBLE_THE_FRONT_IS_CLEAR_AND_THE_BRIGHTNESS_IS_UNIFORM
                              }
                            />
                          </View>
                        </View>
                      </View>

                      <View style={[commonStyles.mb26]} />
                      <TouchableOpacity
                        onPress={selectBackPhoto}
                        activeOpacity={0.6}
                      >
                        <View>
                          <LabelComponent
                            text={FIELD_CONSTANTS.UPLOAD_YOUR_BACK_PHOTO_ID}
                            Children={
                              <LabelComponent
                                text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR}
                                style={commonStyles.textError}
                              />
                            }
                          />
                          <View style={styles.SelectStyle}>
                            <Ionicons
                              name={PROFILE_CONSTANTS.CLOUD_UPLOAD_OUTLINE}
                              size={22}
                              color={NEW_COLOR.TEXT_BLACK}
                            />
                            <ParagraphComponent
                              style={[
                                commonStyles.fs16,
                                commonStyles.textBlack,
                                commonStyles.fw500,
                              ]}
                              text={
                                PLACEHOLDER_CONSTANTS.UPLOAD_YOUR_BACK_PHOTO_ID
                              }
                              numberOfLines={1}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>

                      {backImagError && (
                        <Text style={{ color: "red" }}>{backImagError}</Text>
                      )}
                      <View style={[commonStyles.mb16]} />
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {isBackLoading && (
                          <View
                            style={[
                              commonStyles.dflex,
                              commonStyles.alignCenter,
                              commonStyles.justifyCenter,
                              { minHeight: 150 },
                            ]}
                          >
                            <ActivityIndicator
                              size={PROFILE_CONSTANTS.LARGE}
                              color="#fff"
                            />
                          </View>
                        )}
                        {backPhoto && !isBackLoading && (
                          <View style={[styles.passport]}>
                            <Image
                              style={{ borderRadius: 16, flex: 1 }}
                              overlayColor="#fff"
                              resizeMode="contain"
                              source={{ uri: backPhoto }}
                            />
                          </View>
                        )}
                        {!backPhoto && !isBackLoading && (
                          <View
                            style={[
                              styles.passport,
                              { backgroundColor: "#F6FCFE" },
                            ]}
                          >
                            <Image
                              style={[
                                commonStyles.mxAuto,
                                { borderRadius: 16, flex: 1 },
                              ]}
                              overlayColor={PROFILE_CONSTANTS.TRANSPARENT}
                              resizeMode="contain"
                              source={require("../../assets/images/cards/passport.png")}
                            />
                          </View>
                        )}
                      </View>
                      <View style={[commonStyles.mb26]} />

                      <View>
                        <TouchableOpacity
                          onPress={selectsetIdPhoto}
                          activeOpacity={0.6}
                        >
                          <LabelComponent
                            text={
                              PLACEHOLDER_CONSTANTS.UPLOAD_YOUR_HAND_HOLDING_PHOTO_ID_20MB
                            }
                            Children={
                              <LabelComponent
                                text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR}
                                style={commonStyles.textError}
                              />
                            }
                          />
                          <View style={styles.SelectStyle}>
                            <Ionicons
                              name={PROFILE_CONSTANTS.CLOUD_UPLOAD_OUTLINE}
                              size={22}
                              color={NEW_COLOR.TEXT_BLACK}
                            />
                            <ParagraphComponent
                              style={[
                                commonStyles.fs16,
                                commonStyles.textBlack,
                                commonStyles.fw500,
                              ]}
                              text={
                                FIELD_CONSTANTS.UPLOAD_YOUR_HAND_HOLDING_PHOTO_ID
                              }
                              numberOfLines={1}
                            />
                          </View>
                          {selectIdPhoto && (
                            <Text style={{ color: "red" }}>
                              {selectIdPhoto}
                            </Text>
                          )}
                        </TouchableOpacity>
                        <View style={[commonStyles.mb16]} />
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {idPhotoLoading && (
                            <View
                              style={[
                                commonStyles.dflex,
                                commonStyles.alignCenter,
                                commonStyles.justifyCenter,
                                { minHeight: 150 },
                              ]}
                            >
                              <ActivityIndicator size="large" color="#fff" />
                            </View>
                          )}
                          {(idPhoto || handHoldingPhoto) && !idPhotoLoading && (
                            <View style={[styles.passport]}>
                              <Image
                                style={{ borderRadius: 16, flex: 1 }}
                                overlayColor="#fff"
                                resizeMode="contain"
                                source={{
                                  uri: idPhoto || handHoldingPhoto,
                                }}
                              />
                            </View>
                          )}
                          {!(idPhoto || handHoldingPhoto) &&
                            !idPhotoLoading && (
                              <View
                                style={[
                                  styles.passport,
                                  { backgroundColor: "#F5F8FF" },
                                ]}
                              >
                                <Image
                                  style={{
                                    borderRadius: 12,
                                    flex: 1,
                                    width: "100%",
                                  }}
                                  overlayColor="#fff"
                                  resizeMode="contain"
                                  source={require("../../assets/images/cards/passportholding.png")}
                                />
                              </View>
                            )}
                        </View>

                        <View style={[commonStyles.mb24]} />
                        <TouchableOpacity
                          onPress={handleOpenSelfiePopup}
                          activeOpacity={0.6}
                        >
                          <View>
                            <LabelComponent
                              text={FIELD_CONSTANTS.UPLOAD_YOUR_FACE_PHOTO_20MB}
                              Children={
                                <LabelComponent
                                  text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR}
                                  style={commonStyles.textError}
                                />
                              }
                            />

                            <View style={styles.SelectStyle}>
                              <Ionicons
                                name={PROFILE_CONSTANTS.CLOUD_UPLOAD_OUTLINE}
                                size={22}
                                color={NEW_COLOR.TEXT_BLACK}
                              />
                              <ParagraphComponent
                                style={[
                                  commonStyles.fs16,
                                  commonStyles.textBlack,
                                  commonStyles.fw500,
                                ]}
                                text={
                                  PLACEHOLDER_CONSTANTS.UPLOAD_YOUR_FACE_PHOTO
                                }
                                numberOfLines={1}
                              />
                            </View>
                          </View>
                        </TouchableOpacity>
                        {selfieError && (
                          <Text style={{ color: "red" }}>{selfieError}</Text>
                        )}

                        <View style={[commonStyles.mb16]} />

                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {isSelfieLoading && (
                            <View
                              style={[
                                commonStyles.dflex,
                                commonStyles.alignCenter,
                                commonStyles.justifyCenter,
                                { minHeight: 150 },
                              ]}
                            >
                              <ActivityIndicator
                                size={PROFILE_CONSTANTS.LARGE}
                                color="#fff"
                              />
                            </View>
                          )}
                          {selfie && !isSelfieLoading && (
                            <View style={[styles.passport]}>
                              <Image
                                style={{ borderRadius: 16, flex: 1 }}
                                overlayColor="#fff"
                                resizeMode="contain"
                                source={{ uri: selfie }}
                              />
                            </View>
                          )}
                          {!selfie && !isSelfieLoading && (
                            <View
                              style={[
                                styles.passport,
                                { backgroundColor: "#928781" },
                              ]}
                            >
                              <Image
                                style={[
                                  commonStyles.mxAuto,
                                  { width: "100%", flex: 1 },
                                ]}
                                overlayColor={PROFILE_CONSTANTS.TRANSPARENT}
                                resizeMode="contain"
                                source={require("../../assets/images/userface.jpg")}
                              />
                            </View>
                          )}
                        </View>

                        <View style={[commonStyles.mb24]} />
                        <View>
                          <TouchableOpacity
                            onPress={handleVisibleSignModel}
                            activeOpacity={0.6}
                          >
                            <View>
                              <LabelComponent
                                text={FIELD_CONSTANTS.SIGNATURE_PHOTO_20MB}
                                Children={
                                  <LabelComponent
                                    text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR}
                                    style={commonStyles.textError}
                                  />
                                }
                              />
                              <View style={styles.SelectStyle}>
                                <Ionicons
                                  name={PROFILE_CONSTANTS.CLOUD_UPLOAD_OUTLINE}
                                  size={22}
                                  color={NEW_COLOR.TEXT_BLACK}
                                />

                                <ParagraphComponent
                                  style={[
                                    commonStyles.fs16,
                                    commonStyles.textBlack,
                                    commonStyles.fw500,
                                  ]}
                                  text={PROFILE_CONSTANTS?.ADD_YOUR_SIGNATURE}
                                />
                              </View>
                              {signPhoto && (
                                <Text style={{ color: "red" }}>
                                  {signPhoto}
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
                            {signPhotoLoading && (
                              <View
                                style={[
                                  commonStyles.dflex,
                                  commonStyles.alignCenter,
                                  commonStyles.justifyCenter,
                                  { minHeight: 150 },
                                ]}
                              >
                                <ActivityIndicator
                                  size={PROFILE_CONSTANTS.LARGE}
                                  color="#fff"
                                />
                              </View>
                            )}
                            {(signImage || singaturePhoto) &&
                              !signPhotoLoading && (
                                <View style={[styles.passport]}>
                                  <Image
                                    style={{ borderRadius: 16, flex: 1 }}
                                    resizeMode="contain"
                                    source={{
                                      uri: signImage || singaturePhoto,
                                    }}
                                  />
                                </View>
                              )}
                            {!(signImage || singaturePhoto) &&
                              !signPhotoLoading && (
                                <View style={[styles.passport]}>
                                  <Image
                                    style={{
                                      borderRadius: 16,
                                      flex: 1,
                                      width: "100%",
                                    }}
                                    resizeMode="cover"
                                    source={require("../../assets/images/cards/default-sign.png")}
                                  />
                                </View>
                              )}
                          </View>

                          <View style={[commonStyles.mb24]} />
                          <Modal
                            animationType={PROFILE_CONSTANTS.SLIDE}
                            transparent={true}
                            visible={popupVisible}
                            onRequestClose={togglePopup}
                          >
                            <View style={styles.popupContainer}>
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
                                      size={22}
                                      color={NEW_COLOR.TEXT_BLACK}
                                    />
                                  </TouchableOpacity>
                                </View>
                                <View style={styles.signatureCaptureContainer}>
                                  <SignatureCanvas
                                    ref={signatureRef}
                                    onOK={handleSaveSignature}
                                    onEmpty={() => {}}
                                    descriptionText="Sign here"
                                    clearText="Clear"
                                    confirmText="Save"
                                    penColor="#000000"
                                    backgroundColor="#ffffff"
                                    webStyle={`
                                        .m-signature-pad {box-shadow: none; border: none; } 
                                        .m-signature-pad--body {border: none;}
                                        .m-signature-pad--footer {display: none; margin: 0px;}
                                        body,html {
                                        width: 100%; height: 100%;}
                                    `}
                                  />
                                </View>
                                <View style={[commonStyles.mb24]} />

                                <DefaultButton
                                  title={PROFILE_CONSTANTS.SAVE}
                                  style={undefined}
                                  loading={btnLoading}
                                  disable={undefined}
                                  onPress={saveSign}
                                />
                                <View style={[commonStyles.mb16]} />
                                <DefaultButton
                                  title={PROFILE_CONSTANTS.RESET}
                                  style={undefined}
                                  backgroundColors={undefined}
                                  colorful={undefined}
                                  loading={btnLoading}
                                  disable={undefined}
                                  onPress={resetSign}
                                  transparent={true}
                                  iconArrowRight={false}
                                  closeIcon={true}
                                />
                              </View>
                            </View>
                          </Modal>
                        </View>

                        <Field
                          touched={touched.emergencyContactName}
                          name={FORMIK_CONSTANTS.EMERGENCY_CONTACT_NAME}
                          label={FIELD_CONSTANTS.EMERGENCY_CONTACT_NAME}
                          error={errors.emergencyContactName}
                          handleBlur={handleBlur}
                          placeholder={
                            PLACEHOLDER_CONSTANTS.ENTER_EMERGENCY_CONTACT_NAME
                          }
                          component={InputDefault}
                          Children={
                            <LabelComponent
                              text={PLACEHOLDER_CONSTANTS.REQUIRED_STAR}
                              style={commonStyles.textError}
                            />
                          }
                        />
                      </View>
                      <View style={[commonStyles.mb32]} />
                      <View style={[commonStyles.justify, styles.flexcol]}>
                        <DefaultButton
                          title={PROFILE_CONSTANTS.SAVE}
                          style={undefined}
                          iconArrowRight={false}
                          iconCheck={true}
                          loading={btnLoading}
                          disable={undefined}
                          onPress={handleSubmit}
                        />
                      </View>
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
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  savebtn: {
    padding: 13,
    backgroundColor: NEW_COLOR.BG_ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100 / 2,
  },
  resetbtn: {
    padding: 13,
    backgroundColor: NEW_COLOR.DARK_BG,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100 / 2,
    borderWidth: 1,
    borderColor: NEW_COLOR.TEXT_BLACK,
  },
  ml12: {
    marginLeft: 12,
  },
  px8: { paddingVertical: 8 },
  mb4: { marginBottom: 4 },
  nameTitle: { fontSize: 16, fontWeight: "600", lineHeight: 19 },
  wauto: { alignSelf: "flex-start" },
  camPosition: { position: "absolute", right: -4, bottom: 5 },
  defaultimg: {
    width: 78,
    height: 78,
    borderRadius: 100 / 2,
    overflow: "hidden",
  },
  note: { color: NEW_COLOR.TEXT_BLACK, fontStyle: "italic" },
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
  textLightorange: { color: NEW_COLOR.TEXT_LIGHTORANGE, marginRight: 12 },
  bgorange: {
    backgroundColor: NEW_COLOR.MENU_CARD_BG,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  passport: {
    width: "100%",
    borderRadius: 16,
    height: 250,
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_LIGHT,
    overflow: "hidden",
  },
  mb30: { marginBottom: 30 },
  pb26: { paddingBottom: 26 },
  textWhite: { color: "#fff" },
  textNormal: {
    color: NEW_COLOR.TEXT_GREY,
  },
  mb14: { marginBottom: 14 },
  mb24: { marginBottom: 24 },
  my24: { marginBottom: 24, marginTop: 24 },
  colorSecondary: { color: "#B1B1B1" },
  title: { fontSize: 18, fontWeight: "500", lineHeight: 21 },
  mb40: { marginBottom: 40 },
  ml20: { marginLeft: 20 },
  justify: { justifyContent: "space-between" },
  infoCard: {
    backgroundColor: "#1A171D",
    borderRadius: 15,
    marginBottom: 15,
    padding: 16,
  },
  pr16: { paddingRight: 16 },
  alignCenter: { alignItems: "center" },
  dflex: { flexDirection: "row" },
  pageTitle: {
    fontSize: 24,
    fontWeight: "500",
    lineHeight: 29,
    color: "#AAAAAC",
  },
  bgpurple: {
    backgroundColor: NEW_COLOR.BG_PURPLE,
    color: NEW_COLOR.TEXT_WHITE,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  textcenter: { textAlign: "center" },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  flexcol: { flexDirection: "column", flex: 1 },
  gap8: { gap: 8 },
  ml8: { marginLeft: 10 },
  mb8: { marginBottom: 8 },
  mb32: { marginBottom: 32 },
  circle: {
    borderColor: NEW_COLOR.BORDER_LIGHT,
    borderWidth: 1,
    borderRadius: 100,
  },
  p16: { padding: 16 },
  fw800: {
    fontWeight: "800",
  },
  mr8: { marginRight: 8 },
  fw600: {
    fontWeight: "600",
  },
  fw700: {
    fontWeight: "700",
  },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupContent: {
    backgroundColor: NEW_COLOR.DARK_BG,
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  popupHeaderText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  signatureCaptureContainer: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_GREY,
    borderRadius: 0,
  },
  signatureCapture: {
    width: "100%",
    height: (WINDOW_HEIGHT * 50) / 100,
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_GREY,
    borderRadius: 16,
  },
  fw400: {
    fontWeight: "400",
  },
  fw500: {
    fontWeight: "500",
  },
  mb28: { marginBottom: 28 },
  textBlack: {
    color: NEW_COLOR.TEXT_BLACK,
  },
  fs10: {
    fontSize: ms(10),
  },
  fs12: {
    fontSize: ms(12),
  },
  fs14: {
    fontSize: ms(14),
  },
  fs16: {
    fontSize: ms(16),
  },
  input: {
    borderRadius: 8,
    borderColor: NEW_COLOR.SEARCH_BORDER,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
    borderWidth: 1,
    color: NEW_COLOR.TEXT_WHITE,
    paddingVertical: 8,
    paddingHorizontal: 14,
    height: 46,
  },
  selfiePreview: {
    width: "100%",
    height: "100%",
  },
  overlayContent: {
    paddingHorizontal: s(28),
    paddingVertical: s(24),
    borderRadius: 25,
    backgroundColor: NEW_COLOR.DARK_BG,
  },
});
