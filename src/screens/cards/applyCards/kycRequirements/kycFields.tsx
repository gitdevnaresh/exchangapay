import React, { memo, useEffect, useRef, useState } from 'react'
import { View, SafeAreaView, KeyboardAvoidingView, Keyboard } from "react-native"
import { Field } from 'formik';
import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { checkAppPermissions } from '../../../../services/mediaPermissionService';
import PermissionModel from '../../../commonScreens/permissionPopup';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import { isErrorDispaly } from '../../../../utils/helpers';
import FileUpload from '../../../../newComponents/fileUpload/fileUpload';
import { FORM_DATA_CONSTANTS, FORM_DATA_LABEL, FORM_DATA_PLACEHOLDER, PhoneCode, PLACEHOLDER_CONSTANTS, titleMapping } from './constants';
import FormikTextInput from '../../../../newComponents/textInputComponents/formik/textInput';
import FormikRadioButton from '../../../../newComponents/buttons/radioButtons/formik/radioButton';
import CustomPickerModal from '../../../../newComponents/pickerComponents/formik/customPicker';
import PhoneInputWithPicker from '../../../../newComponents/pickerComponents/formik/phonePickerInput';
import { cardsService } from '../../../../apiServices/cardsApis/cardsApiServices';
import ProfileService from '../../../../services/profile';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import LabelComponent from '../../../../newComponents/textComponets/lableComponent/lable';
import OnboardingService from '../../../../services/onboarding';
import SignatureDrawer from '../../../../newComponents/signature/signature';
import DatePickerComponent from '../../../../newComponents/datePickers/formik/datePickerWithFormik';
import { s } from '../../../../newComponents/theme/scale';



const KycAddress = memo(({
    handleBlur,
    values,
    setFieldValue,
    touched,
    errors,
    kycReqList,
    formData,
    cardId,
    keyRequirements,
    setError
}: any) => {
    const isFocused = useIsFocused();
    const [countryCodelist, setCountryCodelist] = useState<any>([]);
    const [fileNames, setFileNames] = useState({
        profilePicFront: "",
        handHoldingIDPhoto: "",
        biometric: "",
        faceImage: "",
        signature: "",
        profilePicBack: "",
        idImage: "",
        faceImage1: "",
        mixedPhoto: ""
    });
    const { t } = useLngTranslation();
    const ref = useRef<any>(null);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const [occupationList, setOccupationList] = useState<any[]>([]);
    const [countries, setCountries] = useState<any>([]);

    const [loadingState, setLoadingState] = useState<any>({
        profilePicFront: false,
        handHoldingIDPhoto: false,
        faceImage: false,
        signature: false,
        biometric: false,
        signModelVisible: false,
        drawSignModel: false,
        facePopup: false,
        idImage: false,
        faceImage1: false,
        profilePicBack: false,
        mixedPhoto: false
    });
    const [permissionModel, setPermissionModel] = useState<boolean>(false);
    const [permissionMessage, setPermissionMessage] = useState<string>("");
    const [isSignatureDrawerVisible, setIsSignatureDrawerVisible] = useState<boolean>(false);
    const [countryIdType, setCountryIdType] = useState<any[]>([]);
    const [cardDocType, setCardDocType] = useState([])

    const genderLookup = [
        { label: "Male", name: "male", value: "male" },
        { label: "Female", name: "female", value: "female" },
        { label: "Others", name: "others", value: "others" },
    ];
    useEffect(() => {
        getListOfCountryCodeDetails();
        occupationLookup();
        fetchCounriesLookup();
        fetchCardsDocTypes();
    }, [isFocused]);

    const fetchCardsDocTypes = async () => {
        try {
            const response: any = await cardsService.getCardDocTypes();
            if (response?.status == 200) {
                setCardDocType(response?.data);
                setError('');
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const occupationLookup = async () => {
        try {
            const response: any = await cardsService.getOccupationsList(cardId);
            if (response?.status === 200) {
                setOccupationList(response?.data);
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setError(isErrorDispaly(error));
        }
    };
    useEffect(() => {
        const getFileNameFromUrl = (url: string | null) => url ? url.split('/').pop() ?? "" : "";
        setFileNames({
            profilePicFront: getFileNameFromUrl(formData?.profilePicFront),
            profilePicBack: getFileNameFromUrl(formData?.profilePicBack),
            handHoldingIDPhoto: getFileNameFromUrl(formData?.handHoldingIDPhoto),
            biometric: getFileNameFromUrl(formData?.biometric),
            faceImage: getFileNameFromUrl(formData?.faceImage),
            signature: getFileNameFromUrl(formData?.signature),
            idImage: getFileNameFromUrl(formData?.idImage),
            faceImage1: getFileNameFromUrl(formData?.faceImage1),
            mixedPhoto: getFileNameFromUrl(formData?.mixedPhoto),
        });
    }, [formData, isFocused]);



    const fetchCounriesLookup = async () => {
        try {
            const response: any = await cardsService.getcountriesList();
            if (response?.status == 200) {
                setCountries(response?.data || []);
                if (values?.country || values?.addressCountry) {
                    const selectedCountry = response?.data?.find((c: any) => c?.name == values?.country);
                    fetchDocuments(selectedCountry?.code)
                }
                setError('');
            }
            else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setError(isErrorDispaly(error));
        }

    };
    const fetchDocuments = async (country?: string) => {
        try {
            const response: any = await cardsService.getIdTypesLu(country)
            if (response?.status == 200) {
                setCountryIdType(response?.data);
                setError('');
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));

        }
    }
    const getListOfCountryCodeDetails = async () => {
        const response: any = await OnboardingService.countriesList();
        if (response?.status === 200) {
            const codes: PhoneCode[] = response?.data ?? [];
            setCountryCodelist(codes);
            setError("");
        } else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setError(isErrorDispaly(response));
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


    const getFileExtension = (uri: string) => {
        return uri?.split('.')?.pop()?.toLowerCase() ?? 'jpg';
    };

    const uploadFileToServer = async (uri: string, type: string, fileName: string, fileExtension: string, item: string, setFeilds: (field: string, value: string) => void) => {
        setLoadingState(prev => ({ ...prev, [item]: false }));
        const formData = new FormData();
        formData.append('document', {
            uri: uri,
            type: `${type}/${fileExtension}`,
            name: fileName,
        } as any);
        const uploadRes = await ProfileService.UploadFile(formData);
        if (uploadRes.status === 200) {
            const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
            setFeilds(item, uploadedImage);
            setError("");
        } else {
            ref?.current?.scrollTo?.({ y: 0, animated: true });
            setError(isErrorDispaly(uploadRes));
        }
    };

    const closePermissionModel = () => {
        setPermissionModel(false);
    }

    const handleImageUpload = async (
        item: string,
        setFeilds: (field: string, value: string) => void,
        pickerOption?: 'camera' | 'library'
    ) => {
        setError("");
        setLoadingState(prev => ({ ...prev, [item]: true }));
        Keyboard.dismiss();

        try {
            let pickedAsset: { uri: string; mimeType?: string; fileSize?: number; fileName?: string; } | null = null;
            if (pickerOption === 'camera') {
                const res = await checkAppPermissions("camera");
                if (res.showPopup) {
                    setPermissionMessage(res.messageKey || "GLOBAL_CONSTANTS.COMMON_PERMISSION_DENIED_MESSAGE");
                    setPermissionModel(true);
                    return;
                }
                if (!res.allowed) return;

                await new Promise(resolve => setTimeout(resolve, 300));
                const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
                if (!result.canceled) {
                    const asset = result?.assets[0];
                    pickedAsset = {
                        uri: asset?.uri,
                        mimeType: asset?.mimeType || undefined,
                        fileSize: asset?.fileSize || undefined,
                        fileName: asset?.fileName || undefined,
                    };
                }
            } else if (pickerOption === 'library') {
                const permissionResult = await checkAppPermissions("library");
                if (permissionResult.showPopup) {
                    setPermissionMessage(permissionResult.messageKey || "GLOBAL_CONSTANTS.COMMON_PERMISSION_DENIED_MESSAGE");
                    setPermissionModel(true);
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, 300));
                const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
                if (!result.canceled) {
                    const asset = result?.assets[0];
                    pickedAsset = {
                        uri: asset?.uri,
                        mimeType: asset?.mimeType || undefined,
                        fileSize: asset?.fileSize || undefined,
                        fileName: asset?.fileName || undefined,
                    };
                }
            }

            if (pickedAsset) {
                const { uri, mimeType, fileSize } = pickedAsset;
                const fileName = pickedAsset.fileName ?? uri.split('/').pop();
                const maxSizeInBytes = 15 * 1024 * 1024; // 15MB
                if (fileSize && fileSize > maxSizeInBytes) {
                    setError(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                    return;
                }

                const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                if (mimeType && !allowedMimeTypes.includes(mimeType)) {
                    setError(t('GLOBAL_CONSTANTS.ONLY_JPG_JPEG_PNG_FILES_ARE_ALLOWED'));
                    return;
                }

                if (!verifyFileTypes(fileName || '')) {
                    setError(FORM_DATA_CONSTANTS.ACCEPT_IMG_MSG);
                    return;
                }

                setFileNames(prevState => ({ ...prevState, [item]: fileName || '' }));

                const fileExtension = getFileExtension(uri);
                await uploadFileToServer(uri, 'image', fileName || '', fileExtension, item, setFeilds);
            }
        } catch (err) {
            ref?.current?.scrollTo?.({ y: 0, animated: true });
            setError(isErrorDispaly(err));
        } finally {
            setLoadingState(prev => ({ ...prev, [item]: false }));
        }
    };
    const handleDrawnSignatureSaved = async (signatureBase64: string) => {
        setIsSignatureDrawerVisible(false);
        if (!signatureBase64) return;
        setFieldValue("signature", "");
        setError("");
        try {
            const fileName = `signature_${Date.now()}.png`;
            const filePath = FileSystem.documentDirectory + fileName;
            const base64Code = signatureBase64.split("data:image/png;base64,")[1];

            await FileSystem.writeAsStringAsync(filePath, base64Code, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const fileInfo = await FileSystem.getInfoAsync(filePath);
            if (!fileInfo.exists || fileInfo.size === undefined) {
                throw new Error("Failed to save signature image or get file info.");
            }
            if (!verifyFileSize(fileInfo.size)) {
                setError(PLACEHOLDER_CONSTANTS.FILE_SIZE_ERROR);
                ref?.current?.scrollTo({ y: 0, animated: true });
                setLoadingState(prev => ({ ...prev, signature: false }));
                return;
            }
            setFileNames(prevState => ({ ...prevState, signature: fileName }));
            const formDataInstance = new FormData();
            formDataInstance.append("document", { uri: filePath, type: 'image/png', name: fileName } as any);
            setLoadingState(prev => ({ ...prev, signature: true }));
            const uploadRes = await ProfileService.UploadFile(formDataInstance);

            if (uploadRes.status === 200) {
                const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                setFieldValue('signature', uploadedImage);
                setError("");
            } else {
                setError(isErrorDispaly(uploadRes));
                ref?.current?.scrollTo({ y: 0, animated: true });
            }
        } catch (err: any) {
            setError(isErrorDispaly(err.message ?? err));
            ref?.current?.scrollTo({ y: 0, animated: true });
        } finally {
            setLoadingState(prev => ({ ...prev, signature: false }));
        }
    };

    const verifyFileSize = (fileSize: any) => {
        const maxSizeInBytes = 15 * 1024 * 1024; // 15MB
        return fileSize <= maxSizeInBytes;
    };

    const deleteImages = (fieldName: any) => {
        setFieldValue(fieldName, "");
        setFileNames(prev => ({ ...prev, [fieldName]: "" }));
    };

    const deleteImageByType = (fieldName: any) => {
        setFieldValue(fieldName, "");
    }
    const handleAddressCountry = (e: any, setFieldValue: any) => {
        setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_COUNTRY, e.name);

    };



    const handleCountry = (country?: any, setFieldValue?: any) => {
        const reqList = keyRequirements?.split(",")?.map((item: any) => item?.trim()?.toLowerCase()) ?? [];
        setFieldValue(FORM_DATA_CONSTANTS.COUNTRY, country?.name);
        if (reqList?.includes("idtypes")) {
            setFieldValue(FORM_DATA_CONSTANTS.ID_TYPE, "");
        }
        fetchDocuments(country?.code);

    }

    const handleCoutryIdTypeChange = (documentType?: any, setFieldValue?: any) => {
        setFieldValue(FORM_DATA_CONSTANTS.ID_NUMBER, "");
        setFieldValue(FORM_DATA_CONSTANTS.DOC_EXPIRY_DATE, "");
        setFieldValue(FORM_DATA_CONSTANTS.PROFILE_PIC_FORNT, "")
        setFieldValue(FORM_DATA_CONSTANTS.PROFILE_PIC_BACK, "")
        setFieldValue(FORM_DATA_CONSTANTS.ISSUE_DATE, "");
        const filteredDocumenType = countryIdType?.filter(item => item.name === documentType?.name)
            .map(({ code, isDocumentsRequriedOrNot }) => ({ code, isDocumentsRequriedOrNot }))[0] || null;
        setFieldValue(FORM_DATA_CONSTANTS.ID_TYPE, documentType?.name);
        setFieldValue(FORM_DATA_CONSTANTS.IS_DOCUMENT_REQUIRED_OR_NOT, filteredDocumenType?.isDocumentsRequriedOrNot);
        setFieldValue(FORM_DATA_CONSTANTS.DOCUMENT_TYPE_CODE, filteredDocumenType?.code);


    };
    const isFieldDisabled = (fieldValue: any, isKycCompleted?: any, isSumsubKyc?: any) => {
        if (isKycCompleted === false) {
            return false

        }
        if (isSumsubKyc === false) {
            return false; // `false` means the field is NOT disabled.
        }
        return (fieldValue !== "" && fieldValue !== null) && (fieldValue !== undefined);
    };


    const kycRequirementsDetails: { [key: string]: JSX.Element | undefined } = {
        fullname: (
            <View style={[]}>
                <FormikTextInput
                    name={"firstName"}
                    label={"GLOBAL_CONSTANTS.FIRST_NAME"}
                    isRequired
                    placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"}

                />
                <View style={commonStyles.formItemSpace} />

                <FormikTextInput
                    name={FORM_DATA_CONSTANTS.LAST_NAME}
                    label={"GLOBAL_CONSTANTS.LAST_NAME"}
                    isRequired
                    maxLength={30}
                    placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"}
                />
                <View style={[commonStyles.formItemSpace]} />

                <DatePickerComponent name={FORM_DATA_CONSTANTS.DOB} label={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"} maximumDate={maxDate} />

                <View style={[commonStyles.formItemSpace]} />
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.GENDER"} style={commonStyles.mb10}> <LabelComponent text={"*"} style={commonStyles.textError} /></TextMultiLanguage>
                <FormikRadioButton
                    name={FORM_DATA_CONSTANTS.GENDER}
                    options={genderLookup}
                />
                <View style={[commonStyles.formItemSpace]} />

                <Field
                    label={"GLOBAL_CONSTANTS.COUNTRY"}
                    name={FORM_DATA_CONSTANTS.COUNTRY}
                    value={values?.country}
                    isRequired={true}
                    error={errors?.country}
                    onChange={(e: any) => handleCountry(e, setFieldValue)}
                    component={CustomPickerModal}
                    data={countries || []}
                    sheetHeight={s(600)}
                    placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                    modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                    searchPlaceholder={"GLOBAL_CONSTANTS.SEARCH_COUNTRY"}
                />


            </View>),
        fullnameonly: (<View style={[]}>
            <FormikTextInput
                name={"firstName"}
                label={"GLOBAL_CONSTANTS.FIRST_NAME"}
                isRequired
                placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"} />

            <View style={commonStyles.formItemSpace} />
            <FormikTextInput
                name={FORM_DATA_CONSTANTS.LAST_NAME}
                label={"GLOBAL_CONSTANTS.LAST_NAME"}
                isRequired
                maxLength={30}
                placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"} />

        </View>),

        comms: (<View style={[]}>
            <FormikTextInput
                name={FORM_DATA_CONSTANTS.EMAIL}
                label={"GLOBAL_CONSTANTS.E_MAIL"}
                isRequired
                maxLength={50}
                placeholder={"GLOBAL_CONSTANTS.ENTER_EMAIL"} />
            <View style={commonStyles.formItemSpace} />

            <PhoneInputWithPicker
                phoneFieldName="mobile"
                codeFieldName="mobileCode"
                placeholder={"GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER"}
                modalTitle="GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"
                searchPlaceholder={"Search Country Code"}
                customBind={["name", " (", "mobileCode", ")"]}
                data={countryCodelist || []}
                showCountryImages={true}
                label={"GLOBAL_CONSTANTS.MOBILE_NO"}
                maxLength={10}
            />

        </View>),
        passport: (<View style={[]}>
            <Field
                label={"GLOBAL_CONSTANTS.DOCUMENT_TYPE"}
                name={FORM_DATA_CONSTANTS.ID_TYPE}
                value={values?.idType}
                component={CustomPickerModal}
                modalTitle={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                data={[{ label: "Passport", name: "Passport" }]}
                isRequired={true}
                placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                searchPlaceholder={"GLOBAL_CONSTANTS.SEARCH_DOCUMENT_TYPE"}

            />
            <View style={commonStyles.formItemSpace} />
            <FormikTextInput
                name={FORM_DATA_CONSTANTS.ID_NUMBER}
                label={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"}
                isRequired
                maxLength={50}
                value={values?.idNumber}
                placeholder={"GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"} />

            <View style={commonStyles.formItemSpace} />
            <FileUpload
                fileLoader={loadingState.profilePicFront}
                onSelectImage={(source) => handleImageUpload(FORM_DATA_CONSTANTS.PROFILE_PIC_FORNT, setFieldValue, source)}
                uploadedImageUri={values?.profilePicFront}
                fileName={"profilePicFront"}
                errorMessage={touched?.profilePicFront && errors?.profilePicFront}
                deleteImage={() => deleteImages("profilePicFront")}
                label={"GLOBAL_CONSTANTS.UPLOAD_YOUR_FRONT_DOCUMET"}
                isRequired={true}
                showImageSourceSelector={true}
                subLabel='GLOBAL_CONSTANTS.PNG_JPG_JPEG_FILES_ONLY_ALLOWED'

            />
            <View style={commonStyles.formItemSpace} />
            {Array.isArray(kycReqList) && kycReqList?.includes("issuedate") && (<>
                <View style={commonStyles.formItemSpace} >
                    <DatePickerComponent
                        maximumDate={new Date()}
                        name={FORM_DATA_CONSTANTS.ISSUE_DATE}
                        label={FORM_DATA_LABEL.ISSUE_DATE}
                    />
                </View>
            </>)}
            <DatePickerComponent
                minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                name={FORM_DATA_CONSTANTS.DOC_EXPIRY_DATE}
                label={"GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE"} />


        </View>),
        passportonly: (<View style={[]}>

            <Field
                label={"GLOBAL_CONSTANTS.DOCUMENT_TYPE"}
                name={FORM_DATA_CONSTANTS.ID_TYPE}
                value={values?.idType}
                error={errors?.idType}
                component={CustomPickerModal}
                modalTitle={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                data={[{ label: "Passport", name: "Passport" }]}
                placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                searchPlaceholder={"GLOBAL_CONSTANTS.SEARCH_DOCUMENT_TYPE"}

            />
            <View style={commonStyles.formItemSpace} />
            <FormikTextInput
                name={FORM_DATA_CONSTANTS.ID_NUMBER}
                label={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"}
                isRequired
                maxLength={50}
                value={values?.idNumber}
                placeholder={"GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"} />

            <View style={commonStyles.formItemSpace} />
            <FileUpload
                fileLoader={loadingState.profilePicFront}
                onSelectImage={(source) => handleImageUpload(FORM_DATA_CONSTANTS.PROFILE_PIC_FORNT, setFieldValue, source)}
                uploadedImageUri={values?.profilePicFront}
                fileName={fileNames?.profilePicFront}
                errorMessage={touched?.profilePicFront && errors?.profilePicFront}
                deleteImage={() => deleteImages('profilePicFront')}
                label={"GLOBAL_CONSTANTS.UPLOAD_YOUR_FRONT_DOCUMET"}
                isRequired={true}
                showImageSourceSelector={true}
                subLabel='GLOBAL_CONSTANTS.PNG_JPG_JPEG_FILES_ONLY_ALLOWED'
            />

        </View>),
        emergencycontact: (<View style={[]}>
            <FormikTextInput
                name={FORM_DATA_CONSTANTS.EMERGENCY_CONTACT_NAME}
                label={"GLOBAL_CONSTANTS.EMERGENCY_CONTACT_NAME"}
                isRequired
                maxLength={50}
                placeholder={"GLOBAL_CONSTANTS.ENTER_EMERGENCY_CONTACT_NAME"} />
        </View>),
        fulladdress: (<View><View style={[]} />


            <FormikTextInput
                name={FORM_DATA_CONSTANTS.ADDRESS_LINE1}
                label={FORM_DATA_LABEL.ADDRESS_LINE1}
                isRequired
                placeholder={"GLOBAL_CONSTANTS.ENTER_ADDRESS_LINE1"} />
            <View style={commonStyles.formItemSpace} />
            <Field
                activeOpacity={0.9}
                style={{
                    backgroundColor: 'NEW_COLOR.SCREENBG_WHITE',
                    borderColor: 'NEW_COLOR.SEARCH_BORDER',
                }}
                label={FORM_DATA_LABEL.COUNTRY}
                touched={touched.addressCountry}
                customContainerStyle={{}}
                name={FORM_DATA_CONSTANTS.ADDRESS_COUNTRY}
                error={errors.addressCountry}
                value={values?.addressCountry}
                onChange={(e: any) => handleAddressCountry(e, setFieldValue)}
                handleBlur={handleBlur}
                modalTitle={FORM_DATA_PLACEHOLDER.SELECT_COUNTRY}
                data={countries}
                placeholder={FORM_DATA_PLACEHOLDER.SELECT_COUNTRY}
                placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                component={CustomPickerModal}
                searchPlaceholder={"GLOBAL_CONSTANTS.SEARCH_COUNTRY"}
                sheetHeight={s(600)}
                isRequired={true}

            />
            <View style={[commonStyles.mb28]} />
            <FormikTextInput
                name={FORM_DATA_CONSTANTS.STATE}
                label={FORM_DATA_LABEL.STATE}
                isRequired
                placeholder={FORM_DATA_PLACEHOLDER.ENTER_STATE} />
            <View style={commonStyles.formItemSpace} />


            <FormikTextInput
                name={FORM_DATA_CONSTANTS.CITY}
                label={FORM_DATA_LABEL.CITY}
                isRequired
                placeholder={FORM_DATA_PLACEHOLDER.ENTER_CITY} />
            <View style={commonStyles.formItemSpace} />
            <FormikTextInput
                name={FORM_DATA_CONSTANTS.POSTAL_CODE}
                label={FORM_DATA_LABEL.POSTAL_CODE}
                isRequired
                placeholder={FORM_DATA_PLACEHOLDER.ENTER_POSTAL_CODE} />


        </View>),
        address: (<View>
            <FormikTextInput
                name={FORM_DATA_CONSTANTS.ADDRESS_LINE1}
                label={FORM_DATA_LABEL.ADDRESS_LINE1}
                isRequired
                placeholder={FORM_DATA_PLACEHOLDER.ADDRESS_LINE1} />
            <View style={commonStyles.formItemSpace} />

        </View>),


        financialprofile: (
            <View style={[]}>
                <Field
                    touched={touched.occupation}
                    customContainerStyle={{}}
                    error={errors.occupation}
                    handleBlur={handleBlur}
                    value={values?.occupation}
                    isRequired={true}
                    name={FORM_DATA_CONSTANTS.OCCUPATION}
                    label={FORM_DATA_LABEL.OCCUPATION}
                    component={CustomPickerModal}
                    modalTitle={FORM_DATA_PLACEHOLDER.SELECT_OCCUPATION}
                    data={occupationList}
                    placeholder={FORM_DATA_PLACEHOLDER.SELECT_OCCUPATION}
                    sheetHeight={s(600)}
                    searchPlaceholder={FORM_DATA_PLACEHOLDER.SEARCH_OCCUPATION}
                />
                <View style={[commonStyles.formItemSpace]} />
                <FormikTextInput
                    name={FORM_DATA_CONSTANTS.ANNUAL_SALARY}
                    label={FORM_DATA_LABEL.ANNUAL_SALARY}
                    isRequired
                    keyboardType={"numeric"}
                    maxLength={10}
                    placeholder={FORM_DATA_PLACEHOLDER.ENTER_ANNUAL_SALARY} />

                <View style={[commonStyles.formItemSpace]} />
                <FormikTextInput
                    name={FORM_DATA_CONSTANTS.ACCOUNT_PURPOSE}
                    label={FORM_DATA_LABEL.ACCOUNT_PURPOSE}
                    isRequired
                    placeholder={FORM_DATA_PLACEHOLDER.ENTER_ACCOUNT_PURPOSE} />
                <View style={[commonStyles.formItemSpace]} />
                <FormikTextInput
                    name={FORM_DATA_CONSTANTS.EXPECTED_MONTHLY_VOLUME}
                    label={FORM_DATA_LABEL.EXPECTED_MONTHLY_VOLUME}
                    isRequired
                    keyboardType={"numeric"}
                    placeholder={FORM_DATA_PLACEHOLDER.ENTER_EXCEPTED_MONTHLY_VOLUME}
                    maxLength={10} />
            </View>),
        face: (<>
            <View style={[]} />
            <FileUpload
                fileLoader={loadingState.faceImage}
                onSelectImage={(source) => handleImageUpload(FORM_DATA_CONSTANTS.FACE_IMAGE, setFieldValue, source)}
                uploadedImageUri={values?.faceImage}
                fileName={fileNames?.faceImage}
                errorMessage={touched?.faceImage && errors?.faceImage}
                deleteImage={() => deleteImages("faceImage")}
                label={"GLOBAL_CONSTANTS.FACE_IMAGE"}
                isRequired={true}
                showImageSourceSelector={true}
                subLabel='GLOBAL_CONSTANTS.PNG_JPG_JPEG_FILES_ONLY_ALLOWED'

            />
        </>),
        handedpassport: (<>
            <View style={commonStyles.formItemSpace} />
            <FileUpload
                fileLoader={loadingState?.handHoldingIDPhoto}
                onSelectImage={(source) => handleImageUpload("handHoldingIDPhoto", setFieldValue, source)}
                uploadedImageUri={values?.handHoldingIDPhoto}
                fileName={fileNames?.handHoldingIDPhoto}
                errorMessage={touched?.handHoldingIDPhoto && errors?.handHoldingIDPhoto}
                deleteImage={() => deleteImages('handHoldingIDPhoto')}
                label={"GLOBAL_CONSTANTS.UPLOAD_YOUR_HAND_HOLD_PHOTO_ID_20MB"}
                isRequired={true}
                showImageSourceSelector={true}
                subLabel='GLOBAL_CONSTANTS.PNG_JPG_JPEG_FILES_ONLY_ALLOWED'

            />
        </>),

        sign: (<View style={[]}>
            <FileUpload
                onSelectImage={() => setIsSignatureDrawerVisible(true)}
                uploadedImageUri={values?.signature}
                errorMessage={errors?.signature && touched?.signature ? errors?.signature : ''}
                fileName={fileNames.signature}
                deleteImage={() => {
                    deleteImageByType('signature');
                    setFieldValue(FORM_DATA_CONSTANTS.SIGNATURE, '');
                }}
                label="GLOBAL_CONSTANTS.SIGNATURE"
                isRequired={true}
                subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
            />
        </View>),

        idtypes: (<View style={[]}>

            <Field
                label={"GLOBAL_CONSTANTS.DOCUMENT_TYPE"}
                name={FORM_DATA_CONSTANTS.ID_TYPE}
                value={values?.idType || " "}
                error={errors?.idType}
                onChange={(item: any) => handleCoutryIdTypeChange(item, setFieldValue)}
                component={CustomPickerModal}
                modalTitle={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                data={values?.isdocTypeBasedOnCountry ? countryIdType : cardDocType}
                placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                searchPlaceholder={"GLOBAL_CONSTANTS.SEARCH_DOCUMENT_TYPE"}

            />



            {["passport", "driverslicense", "nationalid", "hongkongid"].includes(
                values?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim()) && (<>
                    <View style={commonStyles.formItemSpace} />
                    <FormikTextInput
                        name={FORM_DATA_CONSTANTS.ID_NUMBER}
                        label={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"}
                        value={values?.idNumber}
                        placeholder={"GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"}
                        maxLength={16}
                        isRequired
                    />

                </>)}

            {["passport", "driverslicense", "nationalid", "hongkongid"].includes(
                values?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim()) && (<><View style={commonStyles.formItemSpace} />
                    <FileUpload
                        fileLoader={loadingState.profilePicFront}
                        onSelectImage={(source) => handleImageUpload(FORM_DATA_CONSTANTS.PROFILE_PIC_FORNT, setFieldValue, source)}
                        uploadedImageUri={values?.profilePicFront}
                        fileName={FORM_DATA_CONSTANTS.PROFILE_PIC_FORNT}
                        errorMessage={touched?.profilePicFront && errors?.profilePicFront}
                        deleteImage={() => deleteImages('profilePicFront')}
                        label={"GLOBAL_CONSTANTS.UPLOAD_YOUR_FRONT_DOCUMET"}
                        isRequired={true}
                        showImageSourceSelector={true}
                        subLabel='GLOBAL_CONSTANTS.PNG_JPG_JPEG_FILES_ONLY_ALLOWED'

                    /></>)}



            {["passport", "driverslicense"].includes(
                values?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim()) && (<><View style={commonStyles.formItemSpace} />
                    <DatePickerComponent
                        minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                        name={FORM_DATA_CONSTANTS.DOC_EXPIRY_DATE}
                        label={"GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE"} /></>
                )}

            {["passport", "driverslicense"].includes(
                values?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim()) && (<><View style={commonStyles.formItemSpace} />

                    <View>
                        <DatePickerComponent
                            maximumDate={new Date()}
                            name={FORM_DATA_CONSTANTS.ISSUE_DATE}
                            label={FORM_DATA_LABEL.ISSUE_DATE} />
                    </View>
                </>)}

        </View>),

    };

    return (
        <SafeAreaView>
            <KeyboardAvoidingView>
                <View>
                    <View style={[]}>
                        {kycReqList?.map((kycKey: any) => {
                            const label = titleMapping[kycKey];
                            return (
                                <View key={kycKey} style={[commonStyles.formItemSpace]}>
                                    {label && (<TextMultiLanguage text={`${label}`} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                                    )}
                                    {kycRequirementsDetails[kycKey]}
                                </View>
                            );
                        })}
                    </View>
                </View>
                <SignatureDrawer
                    isVisible={isSignatureDrawerVisible}
                    onClose={() => setIsSignatureDrawerVisible(false)}
                    onSaveDrawnSignature={handleDrawnSignatureSaved}
                    onRequestUpload={() => {
                        setIsSignatureDrawerVisible(false);
                        handleImageUpload(FORM_DATA_CONSTANTS.SIGNATURE, setFieldValue, 'library');
                    }}

                    drawOptionTextStyle={{ color: NEW_COLOR.TEXT_WHITE ?? 'white' }}
                    drawingSaveButtonText={t("GLOBAL_CONSTANTS.SAVE")}
                    drawingCancelButtonText={t("GLOBAL_CONSTANTS.CANCEL")}
                />
                <PermissionModel permissionDeniedContent={permissionMessage} closeModel={closePermissionModel} addModelVisible={permissionModel} />

            </KeyboardAvoidingView>
        </SafeAreaView>
    )
});

export default KycAddress;