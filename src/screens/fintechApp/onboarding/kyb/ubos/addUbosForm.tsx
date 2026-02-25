import { View, BackHandler, Alert } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { formatDateTimeAPI, formatDateTimeDatePicker, isErrorDispaly } from "../../../../../utils/helpers";
import { useSelector } from "react-redux";
import Container from "../../../../../components/container/container";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import { ADD_UBOS_DETAILS_CONSTANTS, FORM_FIELD, KYB_INFO_CONSTANTS } from "../constants";
import CreateAccountService from "../../../../../apiServices/bank/createAccount";
import ProfileService from "../../../../../apiServices/profile";
import { NAVIGATION_CONSTS, getFileExtension, verifyFileTypes } from "../../constants";
import * as ImagePicker from 'expo-image-picker';
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import useEncryptDecrypt from "../../../../../hooks/encDecHook";
import ButtonComponent from "../../../../../components/buttons/button";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import DashboardLoader from "../../../../../components/loader";
import ViewComponent from "../../../../../components/view/view";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SafeAreaViewComponent from "../../../../../components/safeArea/safeArea";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import UboFormComponent from "../../../../../components/common/UboFormFields";
const KybAddUbosDetailsForm = (props: any) => {
    const ref = useRef<any>(null);
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [btnLoading, setBtnLoading] = useState(false);
    const isFocused = useIsFocused();
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [countryCodelist, setCountryCodelist] = useState<any[]>([]);
    const [countryList, setCountryList] = useState<any[]>([]);
    const [imagesLoader, setImagesLoader] = useState<{ frontId: boolean; backImgId: boolean }>({ frontId: false, backImgId: false });
    const [fileNames, setFileNames] = useState<{ frontId: string | null; backImgId: string | null }>({ frontId: null, backImgId: null });
    const [documentTypesLookUp, setDocumentTypesLookUp] = useState<any[]>([]);
    const [formActions, setFormActions] = useState<{ validateForm: () => Promise<any>; setTouched: (touched: any) => void; handleSubmit: () => void } | null>(null);
    const { t } = useLngTranslation();
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const today = new Date();
    const scrollRef = useRef<any>()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const uuidv4 = () => {
        return ADD_UBOS_DETAILS_CONSTANTS.GUID_FORMATE.replace(/x/g, function () {
            const randumnumberval = Math.random() * 16 | 0;
            return randumnumberval.toString(16);
        });
    };
    const [initValues, setInitValues] = useState<any>({
        firstName: "",
        lastName: "",
        middleName: '',
        uboPosition: "Shareholder",
        dob: '',
        shareHolderPercentage: "",
        phoneCode: '',
        phoneNumber: "",
        note: "",
        frontId: '',
        backImgId: '',
        docType: '',
        docDetailsid: '',
        country: '',
        email: '',
        docNumber: '',
        docExpireDate: ''
    });

    useEffect(() => {
        getListOfCountryCodeDetails();
        fetchLookUps();
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
    };
    const fetchLookUps = async () => {
        setErrormsg(null);
        try {
            const response: any = await ProfileService.getDocumentTypes();
            if (response?.ok) {
                setDocumentTypesLookUp(response?.data?.KycDocumentTypes || []);
                setCountryList(response?.data?.countryWithTowns || []);
                setErrormsg(null);
            } else {
                ref?.current?.scrollTo?.({ y: 0, animated: true });
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo?.({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        }
    };
    const getPersionalDetails = async () => {
        setErrormsg(null);
        setLoadingData(true);
        try {
            const res: any = await ProfileService.kybInfoDetails();
            if (res?.ok) {
                const data = res?.data?.ubos?.find((item: any) => item?.id === props?.route?.params?.id);
                function isUSDateFormat(dateStr: string) {
                    const usDateFormatRegex = /^\d{1,2}\/\d{1,2}\/\d{4}/;
                    return usDateFormatRegex.test(dateStr);
                }
                const initialValues = {
                    firstName: data?.firstname ?? data?.firstName,
                    lastName: data?.lastname ?? data?.lastName,
                    middleName: data?.middleName,
                    uboPosition: data?.uboPosition,
                    dob: isUSDateFormat(data?.dob) ? formatDateTimeDatePicker(data?.dob) : data?.dob,
                    shareHolderPercentage: data?.shareHolderPercentage?.toString() ?? "",
                    phoneCode: decryptAES(data?.phoneCode),
                    phoneNumber: decryptAES(data?.phoneNumber),
                    note: data?.note,
                    docType: data?.docDetails?.type,
                    frontId: data?.docDetails?.frontImage,
                    backImgId: data?.docDetails?.backImage,
                    docDetailsid: data?.docDetails?.id,
                    country: data?.country,
                    email: decryptAES(data?.email)
                };
                setInitValues(initialValues);
                setFileNames(prevState => ({
                    ...prevState,
                    frontId: data?.docDetails?.frontImage?.split('/').pop() ?? `image_${Date.now()}.jpg`,
                    backImgId: data?.docDetails?.backImage?.split('/').pop() ?? `image_${Date.now()}.jpg`
                }));
                setLoadingData(false);
            } else {
                setErrormsg(isErrorDispaly(res));
                setLoadingData(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setLoadingData(false);
        }
    };

    const getListOfCountryCodeDetails = async () => {
        try {
            const response: any = await CreateAccountService.getAddressLooupDetails();
            if (response?.ok) {
                setCountryCodelist(response?.data?.PhoneCodes ?? []);
                setErrormsg(null);
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };

    const handleSave = async (values: any) => {
        setBtnLoading(true);
        setErrormsg("");
        const Obj = {
            customerId: props?.route?.params?.id ? props?.route?.params?.id : userinfo?.id,
            firstName: values?.firstName,
            lastName: values?.lastName,
            middleName: values?.middleName,
            uboPosition: values?.uboPosition,
            dob: formatDateTimeAPI(values?.dob),
            shareHolderPercentage: values?.shareHolderPercentage,
            positionWithCompany: "",
            phoneCode: encryptAES(values?.phoneCode),
            phoneNumber: encryptAES(values?.phoneNumber),
            note: values?.note,
            registrationNumber: encryptAES(uuidv4()),
            recordStatus: KYB_INFO_CONSTANTS.ADDED,
            id: KYB_INFO_CONSTANTS.GUID_FORMATE,
            country: values?.country,
            email: encryptAES(values?.email),
            docDetails: {
                id: KYB_INFO_CONSTANTS.GUID_FORMATE,
                frontImage: values?.frontId ?? '',
                backImage: values?.backImgId ?? '',
                type: values?.docType ?? '',
                docNumber: values?.docNumber ?? "",
                docExpiryDate: values?.docExpireDate ?? ""
            }
        };
        const updatedUbo = [{
            id: props?.route?.params?.id ? props?.route?.params?.id : KYB_INFO_CONSTANTS.GUID_FORMATE,
            uboPosition: values?.uboPosition,
            firstname: values?.firstName,
            lastname: values?.lastName,
            middleName: values?.middleName,
            dob: formatDateTimeAPI(values?.dob),
            phoneNumber: encryptAES(values?.phoneNumber),
            recordStatus: props?.route?.params?.id ? KYB_INFO_CONSTANTS.MODIFIED : KYB_INFO_CONSTANTS.ADDED,
            phoneCode: encryptAES(values?.phoneCode ?? null),
            positionWithCompany: null,
            companyName: values?.companyName || null,
            registrationNumber: "",
            country: values?.country,
            email: encryptAES(values?.email),
            dateOfRegistration: null,
            note: values?.note || null,
            shareHolderPercentage: values?.shareHolderPercentage || 0,
            docDetails: {
                id: values?.docDetailsid || KYB_INFO_CONSTANTS.GUID_FORMATE,
                frontImage: values?.frontId || '',
                backImage: values?.backImgId || '',
                type: values?.docType || '',
                docNumber: values?.docNumber || "",
                docExpiryDate: values?.docExpireDate || ""
            }
        }];
        try {
            if (props?.route?.params?.id || props?.route?.params?.ubosAdd) {
                let response;
                if (props?.route?.params?.ubosAdd) {
                    response = await ProfileService.postUbosDetails(updatedUbo);
                } else {
                    response = await ProfileService.updateKybUbos(updatedUbo);
                }
                if (response?.ok) {
                    setBtnLoading(false);
                    setErrormsg('');
                    props?.navigation.navigate(NAVIGATION_CONSTS.KYB_INFO_PREVIEW);
                } else {
                    setErrormsg(isErrorDispaly(response));
                    setBtnLoading(false);
                }
            } else {
                setBtnLoading(false);
                props?.route?.params?.onGoBack?.({ newUbosDetails: Obj });
                props?.navigation.goBack();
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setBtnLoading(false);
        }
    };

    const handleGoBack = useCallback(() => {
        props.navigation.goBack();
    }, [props.navigation]);

    const handleBack = useCallback(() => {
        props?.navigation?.goBack();
    }, [props?.navigation]);

    const handleUploadImg = async (
        item: string,
        setFeilds: (field: string, value: any) => void,
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
                    // ref?.current?.scrollTo?.({ y: 0, animated: true });
                    return;
                }
                setFileNames(prevState => ({
                    ...prevState,
                    [item]: fileName
                }));
                if (uri) {
                    setImagesLoader(prevState => ({
                        ...prevState,
                        [item]: true
                    }));
                    const formData = new FormData();
                    formData.append(KYB_INFO_CONSTANTS.DOCUMENT, {
                        uri: uri,
                        type: `${type}/${fileExtension}`,
                        name: fileName,
                    } as any);
                    const uploadRes = await ProfileService.uploadFile(formData);
                    if (uploadRes.status === 200) {
                        const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                        setFeilds(item, uploadedImage);
                        setErrormsg(null);
                    } else {
                        setErrormsg(isErrorDispaly(uploadRes));
                    }
                }
            }
        } catch (err) {
            setErrormsg(isErrorDispaly(err));
        } finally {
            setImagesLoader(prevState => ({
                ...prevState,
                [item]: false
            }));
        }
    };

    const deleteImage = (fileName: string, setFieldValue: (field: string, value: any) => void) => {
        setFieldValue(fileName, '');
    };

    const handleError = useCallback(() => {
        setErrormsg(null);
    }, []);

    const handleValidationSave = async () => {
        if (!formActions?.validateForm || !formActions?.handleSubmit) return;

        const errors = await formActions.validateForm();
        if (Object.keys(errors).length > 0) {
            const touchedFields = Object.keys(initValues).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {} as any);
            formActions.setTouched(touchedFields);
            setErrormsg('Please check and provide the valid information for all fields highlighted in red color.');
            setTimeout(() => {
                scrollRef?.current?.scrollToPosition(0, 0, true);
            }, 100);
        } else {
            // If validation passes, submit the form
            formActions.handleSubmit();
        }
    };


    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            {loadingData && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
            {!loadingData && <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                ref={scrollRef}
            >
                <Container style={commonStyles.container}>
                    <PageHeader title={props?.route?.params?.id ? "GLOBAL_CONSTANTS.EDIT_UBO" : "GLOBAL_CONSTANTS.ADD_UBO"} onBackPress={handleBack} isrefresh={Boolean(props?.route?.params?.id)} onRefresh={handleRefresh} />
                    {<>

                        {errormsg && <ErrorComponent message={errormsg} onClose={handleError} />}
                        <View style={commonStyles.titleSectionGap} />
                        {!loadingData && <>
                            <UboFormComponent
                                onSubmit={handleSave}
                                initialValues={initValues}
                                countryCodelist={countryCodelist}
                                countryList={countryList}
                                documentTypesLookUp={documentTypesLookUp}
                                imagesLoader={imagesLoader}
                                fileNames={fileNames}
                                onUploadImg={handleUploadImg}
                                deleteImage={deleteImage}
                                innerRef={ref}
                                maxDate={maxDate}
                                loading={btnLoading}
                                onValidationError={setErrormsg}
                                onFormReady={setFormActions}
                            />
                            <ViewComponent style={commonStyles.mb40} />
                            <ViewComponent>
                                <ButtonComponent
                                    title={"GLOBAL_CONSTANTS.OK"}
                                    loading={btnLoading}
                                    disable={btnLoading}
                                    onPress={() => {
                                        handleValidationSave();
                                    }}
                                />
                                <ViewComponent style={[commonStyles.buttongap]} />
                                <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={handleBack} solidBackground={true} />
                            </ViewComponent>
                            <View style={commonStyles.sectionGap} />
                        </>}
                    </>
                    }

                </Container>
            </KeyboardAwareScrollView>}
        </ViewComponent>

    );
};

export default KybAddUbosDetailsForm;


