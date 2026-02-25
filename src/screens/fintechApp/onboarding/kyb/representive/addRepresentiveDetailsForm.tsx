import { StyleSheet, BackHandler, TextInput, Alert } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { Field, Formik } from "formik";
import InputDefault from '../../../../../components/textInputComponents/DefaultFiat';
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { formatDateTimeAPI, formatDateTimeDatePicker, isErrorDispaly } from "../../../../../utils/helpers";
import Container from "../../../../../components/container/container";
import { KybRepresentativeSchema } from "../../schema";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import { FORM_FIELD, KYB_INFO_CONSTANTS } from "../constants";
import CreateAccountService from "../../../../../apiServices/bank/createAccount";
import ProfileService from "../../../../../apiServices/profile";
import FileUpload from "../../../../../components/fileUpload/fileUpload";
import * as ImagePicker from 'expo-image-picker';
import { NAVIGATION_CONSTS, getFileExtension, verifyFileTypes } from "../../constants";
import CustomPicker from "../../../../../components/customPicker/CustomPicker";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import useEncryptDecrypt from "../../../../../hooks/encDecHook";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import ButtonComponent from "../../../../../components/buttons/button";
import DashboardLoader from "../../../../../components/loader";
import ViewComponent from "../../../../../components/view/view";
import PhoneCodePicker from "../../../../../components/phonePicker/phonePicker";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SafeAreaViewComponent from "../../../../../components/safeArea/safeArea";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import LabelComponent from "../../../../../components/textComponets/lableComponent/lable";
import DatePickerComponent from "../../../../../components/datePickers/formik/datePicker";


const RepresentiveDetailsForm = (props: any) => {
    const ref = useRef<any>(null);
    const [errormsg, setErrormsg] = useState<string>("");
    const [btnLoading, setBtnLoading] = useState(false);
    const isFocused = useIsFocused();
    const [loadingData, setLoadingData] = useState(false);
    const [countryCodelist, setCountryCodelist] = useState<any>([]);
    const [imagesLoader, setImgesLoader] = useState({ frontId: false, backImgId: false })
    const [fileNames, setFileNames] = useState({ frontId: null, backImgId: null });
    const [documentTypesLookUp, setDocumentTypesLookUp] = useState<any>([]);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const [countryList, setCountryList] = useState<any[]>([]);
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const [initValues, setInitValues] = useState<any>({
        firstName: "",
        lastName: "",
        middleName: '',
        uboPosition: "Individual",
        dob: '',
        phoneCode: '',
        phoneNumber: "",
        docType: '',
        frontId: '',
        backImgId: '',
        docDetailsid: '',
        docNumber: '',
        docExpireDate: '',
        country: '',
        email: '',
        shareHolderPercentage: ""

    });
    useEffect(() => {
        getListOfCountryCodeDetails();
        fetchLookUps()
        if (props?.route?.params?.id) {
            getPersionalDetails();
        }
    }, [isFocused, props?.route?.params?.id]);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleGoBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    const handleRefresh = () => {
        getPersionalDetails();
    }
    const fetchLookUps = async () => {
        setErrormsg('')
        try {
            const response: any = await ProfileService.getDocumentTypes();
            if (response?.ok) {
                setDocumentTypesLookUp(response?.data?.KycDocumentTypes)
                setCountryList(response?.data?.countryWithTowns || []);
                setErrormsg('');
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        }
    };
    const getPersionalDetails = async () => {
        setErrormsg('');
        setLoadingData(true)
        try {
            const res: any = await ProfileService.kybInfoDetails();
            if (res?.ok) {
                const data = res?.data?.representative?.find((item: any) => item?.id === props?.route?.params?.id);
                function isUSDateFormat(dateStr: any) {
                    const usDateFormatRegex = /^\d{1,2}\/\d{1,2}\/\d{4}/;
                    return usDateFormatRegex.test(dateStr);
                }
                const initialValues = {
                    firstName: data?.firstname || data?.firstName,
                    lastName: data?.lastname || data?.lastName,
                    middleName: data?.middleName,
                    uboPosition: data?.uboPosition,
                    dob: isUSDateFormat(data?.dob) ? formatDateTimeDatePicker(data?.dob) : data?.dob,
                    phoneCode: decryptAES(data?.phoneCode),
                    phoneNumber: decryptAES(data?.phoneNumber),
                    docType: data?.docDetails?.type,
                    frontId: data?.docDetails?.frontImage,
                    backImgId: data?.docDetails?.backImage,
                    docDetailsid: data?.docDetails?.id,
                    docNumber: decryptAES(data?.docDetails?.number),
                    docExpireDate: data?.docDetails?.expiryDate,
                    country: data?.country,
                    email: decryptAES(data?.email),
                    shareHolderPercentage: data?.shareHolderPercentage
                }
                setInitValues(initialValues);
                setFileNames(prevState => ({
                    ...prevState,
                    frontId: data?.docDetails?.frontImage?.split('/').pop() || `image_${Date.now()}.jpg`,
                    backImgId: data?.docDetails?.backImage?.split('/').pop() || `image_${Date.now()}.jpg`
                }));
                setLoadingData(false)
            }
            else {
                setErrormsg(isErrorDispaly(res));
                setLoadingData(false)
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setLoadingData(false)
        }
    };
    const getListOfCountryCodeDetails = async () => {
        setErrormsg("");
        const response: any = await CreateAccountService.getAddressLooupDetails();
        if (response?.ok) {
            setCountryCodelist(response?.data?.PhoneCodes);
            setErrormsg("")
        } else {
            setErrormsg(isErrorDispaly(response));
        }
    };
    const handleSave = async (values: any) => {
        setErrormsg("");
        setBtnLoading(true);
        let UpdateObj = [
            {
                id: props?.route?.params?.id ? props?.route?.params?.id : KYB_INFO_CONSTANTS.GUID_FORMATE,
                firstName: values?.firstName,
                lastName: values?.lastName,
                middleName: values?.middleName,
                uboPosition: values?.uboPosition,
                dob: formatDateTimeAPI(values?.dob),
                phoneCode: encryptAES(values?.phoneCode),
                phoneNumber: encryptAES(values?.phoneNumber),
                registrationNumber: "",
                recordStatus: props?.route?.params?.id ? KYB_INFO_CONSTANTS.MODIFIED : KYB_INFO_CONSTANTS.ADDED,
                country: values?.country,
                email: encryptAES(values?.email),
                shareHolderPercentage: values?.shareHolderPercentage,
                docDetails: {
                    id: values?.docDetailsid || KYB_INFO_CONSTANTS.GUID_FORMATE,
                    frontImage: values?.frontId || '',
                    backImage: values?.backImgId || '',
                    type: values?.docType || '',
                    number: encryptAES(values?.docNumber),
                    expiryDate: values?.docExpireDate
                }
            }
        ]
        if (props?.route?.params?.id || props?.route?.params?.addRepresentiveDetails) {
            try {
                let response;
                if (props?.route?.params?.addRepresentiveDetails) {
                    response = await ProfileService.postRepresentiveDetails(UpdateObj);
                } else {
                    response = await ProfileService.updateRepresentiveDetails(UpdateObj);
                }
                if (response?.ok) {
                    setBtnLoading(false);
                    setErrormsg('');
                    navigation.navigate(NAVIGATION_CONSTS.KYB_INFO_PREVIEW);
                } else {
                    setErrormsg(isErrorDispaly(response));
                    setBtnLoading(false);
                }
            } catch (error) {
                setErrormsg(isErrorDispaly(error));
                setBtnLoading(false);
            }
        } else {
            navigation.goBack();
        }
    }
    const handleGoBack = useCallback(() => {
        navigation.goBack();
    }, []);
    const handleBack = useCallback(() => {
        navigation?.goBack();
    }, []);
    const handleUploadImg = async (
        item: any,
        setFeilds: any,
        pickerOption?: 'camera' | 'library'
    ) => {
        try {
            const permissionResult =
                pickerOption === 'camera'
                    ? await ImagePicker.requestCameraPermissionsAsync()
                    : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", "You need to enable permissions to use this feature.");
                return;
            }
            const result =
                pickerOption === 'camera'
                    ? await ImagePicker.launchCameraAsync({ allowsEditing: false, aspect: [1, 1], quality: 0.5 })
                    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, aspect: [1, 1], quality: 0.5, cameraType: ImagePicker.CameraType.front });


            if (!result.canceled) {
                const selectedImage = result.assets[0];
                const { uri, type } = selectedImage;

                const fileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
                const fileExtension = getFileExtension(selectedImage.uri);
                const isValidFileType = verifyFileTypes(fileName);
                if (!isValidFileType) {
                    setErrormsg(KYB_INFO_CONSTANTS.ACCEPT_IMG_MSG);
                    ref?.current?.scrollTo({ y: 0, animated: true });
                    return;
                }
                setFileNames(prevState => ({
                    ...prevState,
                    [item]: fileName
                }));
                if (uri) {
                    setImgesLoader(prevState => ({
                        ...prevState,
                        [item]: true
                    }));
                    const formData: any = new FormData();
                    formData.append(KYB_INFO_CONSTANTS.DOCUMENT, {
                        uri: uri,
                        type: `${type}/${fileExtension}`,
                        name: fileName,
                    });
                    const uploadRes: any = await ProfileService.uploadFile(formData);
                    if (uploadRes.status === 200) {
                        const uploadedImage = uploadRes.data && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                        setFeilds(item, uploadedImage)
                        setErrormsg("");
                    } else {
                        ref?.current?.scrollTo({ y: 0, animated: true });
                        setErrormsg(isErrorDispaly(uploadRes));
                    }
                }
            }
        } catch (err) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(err));
        } finally {
            setImgesLoader(prevState => ({
                ...prevState,
                [item]: false
            }));
        }
    }
    const deleteImage = (fileName: any, setFieldValue: any) => {
        setFieldValue(fileName, '')
    }
    const handleError = useCallback(() => {
        setErrormsg("")
    }, []);
    const handleValidationSave = (validateForm: any) => {
        validateForm().then(async (a: any) => {
            if (Object.keys(a).length > 0) {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg('Please check and provide the valid information for all fields highlighted in red color.');
            }
        })
    }
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            {loadingData && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
            {!loadingData && <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                <Container style={commonStyles.container}>
                    <PageHeader title={props?.route?.params?.id ? "GLOBAL_CONSTANTS.EDIT_REPRESENTATIVE" : "GLOBAL_CONSTANTS.ADD_REPRESENTATIVE"} onBackPress={handleBack} isrefresh={Boolean(props?.route?.params?.id)} onRefresh={handleRefresh} />

                    {
                        <>
                            {errormsg && <ErrorComponent message={errormsg} onClose={handleError} />}
                            <ViewComponent>
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.ADD_DIRECTORS_PARAGRAPH"} />
                            </ViewComponent>
                            <ViewComponent style={commonStyles.titleSectionGap} />
                            {!loadingData && <Formik
                                initialValues={initValues}
                                onSubmit={handleSave}
                                validationSchema={KybRepresentativeSchema}
                                enableReinitialize
                            >
                                {(formik) => {
                                    const {
                                        touched,
                                        handleSubmit,
                                        errors,
                                        handleBlur,
                                        values, setFieldValue,
                                        handleChange,
                                        validateForm
                                    } = formik;
                                    return (
                                        <>
                                            <Field
                                                touched={touched?.firstName}
                                                name={FORM_FIELD.FIRST_NAME}
                                                label={"GLOBAL_CONSTANTS.FIRST_NAME"}
                                                error={errors?.firstName}
                                                handleBlur={handleBlur}
                                                customContainerStyle={{}}
                                                placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"}
                                                component={InputDefault}
                                                innerRef={ref}
                                                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />
                                            <Field
                                                touched={touched?.middleName}
                                                name={FORM_FIELD.MIDLE_NAME}
                                                label={"GLOBAL_CONSTANTS.MIDLE_NAME"}
                                                error={errors?.middleName}
                                                handleBlur={handleBlur}
                                                customContainerStyle={{}}
                                                placeholder={"GLOBAL_CONSTANTS.MIDLE_NAME_PLACEHOLDER"}
                                                component={InputDefault}
                                                innerRef={ref}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />
                                            <Field
                                                touched={touched?.lastName}
                                                name={FORM_FIELD.LAST_NAME}
                                                label={"GLOBAL_CONSTANTS.LAST_NAME"}
                                                error={errors?.lastName}
                                                handleBlur={handleBlur}
                                                customContainerStyle={{}}
                                                placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"}
                                                component={InputDefault}
                                                innerRef={ref}
                                                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />
                                            <Field
                                                touched={touched?.email}
                                                name={FORM_FIELD.EMAIL}
                                                label={"GLOBAL_CONSTANTS.EMAIL"}
                                                error={errors?.email}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.EMAIL_PLACEHOLDER"}
                                                component={InputDefault}
                                                innerRef={ref}
                                                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />
                                            <Field
                                                touched={touched?.country}
                                                name={FORM_FIELD.COUNTRY}
                                                label={"GLOBAL_CONSTANTS.COUNTRY"}
                                                error={errors?.country}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                                                component={CustomPicker}
                                                data={countryList}
                                                innerRef={ref}
                                                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />
                                            <Field
                                                activeOpacity={0.9}
                                                touched={touched?.shareHolderPercentage}
                                                name={FORM_FIELD.SHARE_HOLDER_PERCENTAGE}
                                                label={"GLOBAL_CONSTANTS.SHARE_HOLDER_PERCENTAGE"}
                                                error={errors?.shareHolderPercentage}
                                                handleBlur={handleBlur}
                                                customContainerStyle={{ height: 80 }}
                                                placeholder={"GLOBAL_CONSTANTS.SHARE_HOLDER_PERCENTAGE_PLACEHOLDER"}
                                                component={InputDefault}
                                                innerRef={ref}
                                                autoCapitalize="words"
                                                keyboardType={KYB_INFO_CONSTANTS.NUMURIC_KEYPAD}
                                                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            <DatePickerComponent name={FORM_FIELD.DATE_OF_BIRTH} label={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"} maximumDate={maxDate} />
                                            <ViewComponent style={commonStyles.formItemSpace} />
                                            <LabelComponent style={[commonStyles.inputLabel]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} children={<ParagraphComponent style={[commonStyles.textRed]} text={FORM_FIELD.START_REQUIRED} />} />
                                            <ViewComponent style={[commonStyles.relative, commonStyles.dflex]}>
                                                <PhoneCodePicker
                                                    inputStyle={{ borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderColor: touched?.phoneCode && errors?.phoneCode ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }}
                                                    modalTitle={"GLOBAL_CONSTANTS.SELECT_PHONE_CODE"}
                                                    customBind={['name', '(', 'code', ')']}
                                                    data={countryCodelist || []}
                                                    value={values.phoneCode}
                                                    placeholder={"GLOBAL_CONSTANTS.SELECT"}
                                                    onChange={(item) => setFieldValue(FORM_FIELD.PHONE_CODE, item.code)}
                                                    isOnlycountry={true}

                                                />
                                                <ViewComponent style={[commonStyles.flex1, commonStyles.pr2]}>
                                                    <TextInput style={[commonStyles.textInput, { borderBottomLeftRadius: 0, borderTopLeftRadius: 0, borderColor: touched?.phoneNumber && errors?.phoneNumber ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }]}
                                                        placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                                                        onChangeText={(text) => {
                                                            const formattedText = text.replace(/[^0-9]/g, "").slice(0, 13);
                                                            handleChange(FORM_FIELD.PHONE_NUMBER)(formattedText);
                                                        }}
                                                        onBlur={handleBlur(FORM_FIELD.PHONE_NUMBER)}
                                                        value={values.phoneNumber}
                                                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
                                                        keyboardType="phone-pad"
                                                    />
                                                </ViewComponent>
                                            </ViewComponent>
                                            {(touched.phoneCode && errors.phoneCode || touched.phoneNumber && errors.phoneNumber) && <ParagraphComponent style={[commonStyles.textRed]} text={errors.phoneCode || errors?.phoneNumber} />}
                                            <ViewComponent style={commonStyles.formItemSpace} />
                                            <ParagraphComponent style={[commonStyles.fs24, commonStyles.fw600, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.UPLOAD_THE_DOCUMENTS"} />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <Field
                                                activeOpacity={0.9}
                                                innerRef={ref}
                                                style={{ color: KYB_INFO_CONSTANTS.TRANSPARENT, backgroundColor: KYB_INFO_CONSTANTS.TRANSPARENT }}
                                                label={"GLOBAL_CONSTANTS.CHOOSE_DOCUMENT_TYPE"}
                                                touched={touched?.docType}
                                                name={FORM_FIELD.DOC_TYPE}
                                                error={errors?.docType}
                                                handleBlur={handleBlur}
                                                customContainerStyle={{ height: 80 }}
                                                data={documentTypesLookUp || []}
                                                placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                                                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                                                component={CustomPicker}
                                            />
                                            <ViewComponent style={[commonStyles.mb28]} />
                                            <Field
                                                activeOpacity={0.9}
                                                touched={touched?.docNumber}
                                                name="docNumber"
                                                label={"GLOBAL_CONSTANTS.DACUMENT_NUMBER"}
                                                error={errors?.docNumber}
                                                handleBlur={handleBlur}
                                                autoCapitalize="characters"
                                                customContainerStyle={{ height: 80 }}
                                                placeholder={"GLOBAL_CONSTANTS.DACUMENT_NUMBER_PLACEHOLDER"}
                                                component={InputDefault}
                                                maxLength={30}
                                                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                            />
                                            <ViewComponent style={[commonStyles.mb28]} />
                                            <DatePickerComponent name='docExpireDate' minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))} label="GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE" placeholder="GLOBAL_CONSTANTS.DATE_PLACEHOLDER" required={true} />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <FileUpload
                                                fileLoader={imagesLoader?.frontId}
                                                onSelectImage={(source) => handleUploadImg(FORM_FIELD.FRONT_ID, setFieldValue, source)}
                                                uploadedImageUri={values?.frontId}
                                                fileName={fileNames?.frontId}
                                                errorMessage={errors?.frontId}
                                                deleteImage={() => deleteImage(FORM_FIELD.FRONT_ID, setFieldValue)}
                                                label={"GLOBAL_CONSTANTS.FRONT_ID_PHOTO"}
                                                isRequired={false}
                                                showImageSourceSelector={true}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />
                                            <FileUpload
                                                fileLoader={imagesLoader?.backImgId}
                                                onSelectImage={(source) => handleUploadImg(FORM_FIELD.BACK_IMG_ID, setFieldValue, source)}
                                                uploadedImageUri={values?.backImgId}
                                                fileName={fileNames?.backImgId}
                                                errorMessage={errors?.backImgId}
                                                deleteImage={() => deleteImage(FORM_FIELD.BACK_IMG_ID, setFieldValue)}
                                                label={"GLOBAL_CONSTANTS.BACK_ID_PHOTO"}
                                                isRequired={false}
                                                showImageSourceSelector={true}
                                            />
                                            <ViewComponent style={[commonStyles.mb40]} />
                                            <ViewComponent style={[commonStyles.justify, styles.flexcol]}>
                                                <ButtonComponent
                                                    title={"GLOBAL_CONSTANTS.OK"}
                                                    loading={btnLoading}
                                                    onPress={() => {
                                                        handleValidationSave(validateForm);
                                                        handleSubmit();
                                                    }}
                                                />
                                                <ViewComponent style={[commonStyles.buttongap]} />
                                                <ButtonComponent
                                                    title={"GLOBAL_CONSTANTS.CANCEL"}
                                                    onPress={handleBack}
                                                    solidBackground={true}
                                                />

                                            </ViewComponent>

                                        </>
                                    );
                                }}
                            </Formik>}
                        </>
                    }

                </Container></KeyboardAwareScrollView>}
        </ViewComponent>

    );
};

export default RepresentiveDetailsForm;

const styles = StyleSheet.create({
    flexcol: { flexDirection: 'column', flex: 1 }
});

