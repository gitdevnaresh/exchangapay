import { View, BackHandler, Alert } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Field, Formik, FieldArray } from "formik"; // Import FieldArray
import * as ImagePicker from 'expo-image-picker';
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import CustomPicker from "../../../../../components/customPicker/CustomPicker";
import { formatDateTimeAPI, isErrorDispaly } from "../../../../../utils/helpers";
import Container from "../../../../../components/container/container";
import ProfileService from "../../../../../apiServices/profile";
import { FORM_FIELD, KYB_INFO_CONSTANTS, getFileExtension } from "../constants";
import InputDefault from '../../../../../components/textInputComponents/DefaultFiat';
import FileUpload from "../../../../../components/fileUpload/fileUpload";
import useEncryptDecrypt from "../../../../../hooks/encDecHook";
import ButtonComponent from "../../../../../components/buttons/button";
import { verifyFileTypes } from "../../constants";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../../components/loader";
import ViewComponent from "../../../../../components/view/view";
import { KybCompanyDataProps } from "../interface";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SafeAreaViewComponent from "../../../../../components/safeArea/safeArea";
import { KybCompanyDataSchema } from "../../schema";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import LabelComponent from "../../../../../components/textComponets/lableComponent/lable";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import DatePickerComponent from "../../../../../components/datePickers/formik/datePicker";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import useCountryData from "../../../../../hooks/countryDataHook/useCountryData";

const KybCompanyData = (props: KybCompanyDataProps) => {
    const ref = useRef<any>(null);
    const { decryptAES, encryptAES } = useEncryptDecrypt();
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [errormsg, setErrormsg] = useState<string>('');
    const isFocused = useIsFocused();
    const [imageLoaders, setImageLoaders] = useState<boolean[]>([]);
    const [idTypesLookUp, setIdTypesLookUp] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true); // Start with loading true
    const { countryPickerData, loading: countryLoading, error: countryError, clearCache } = useCountryData({
        loadCountries: true,
        loadPhoneCodes: true,
    });
    const [fileNames, setFileNames] = useState<string[]>([]);
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [buttonLoader, setButtonLoader] = useState<boolean>(false);
    const [initValues, setInitValues] = useState<any>({
        companyName: "",
        country: "",
        registrationNumber: "",
        dateOfRegistration: "",
        documents: [], // Changed to documents array
    });
    useEffect(() => {
        getListOfCountryDetails();
    }, [isFocused]);
    useEffect(() => {
        if (props.route.params?.customerId && idTypesLookUp.length != 0) {
            getPersionalDetails();
        }

    }, [isFocused, props.route.params?.customerId, idTypesLookUp]);

    const handleGoBackCb = useCallback(() => {
        if (props.route.params?.cardId) {
            navigation.navigate(KYB_INFO_CONSTANTS.APLY_CARD_NAV, {
                cardId: props.route.params?.cardId,
                logo: props.route.params?.logo,
            });
        } else {
            navigation.goBack();
        }
    }, [navigation, props.route.params?.cardId, props.route.params?.logo]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleGoBackCb(); return true; }
        );
        return () => backHandler.remove();
    }, [handleGoBackCb]);

    const getListOfCountryDetails = async () => {
        const response: any = await ProfileService.getDocumentTypes();
        if (response?.status === 200) {
            setIdTypesLookUp(response?.data?.KybDocumentTypes);
            setErrormsg("");
        } else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(response));
        }
    };
    const getPersionalDetails = async () => {
        setLoadingData(true);
        try {
            const res: any = await ProfileService.KybCompanyDetails();
            if (res?.ok) {
                const mappedDocuments = idTypesLookUp.map(lookupItem => {
                    const existingDoc = res.data.kybDocs.find(
                        (doc: any) => doc.docType === lookupItem.code || doc.docType === lookupItem.name
                    );
                    const fileName = existingDoc ? existingDoc.url?.split('/').pop() || `image_${Date.now()}.jpg` : '';
                    return {
                        id: existingDoc?.id || KYB_INFO_CONSTANTS.GUID_FORMATE,
                        docType: existingDoc ? lookupItem.code : '',
                        url: existingDoc?.url || '',
                        fileName: fileName
                    };
                });

                const initialValues = {
                    companyName: res.data.companyName,
                    country: res.data.country,
                    registrationNumber: decryptAES(res.data.registrationNumber),
                    dateOfRegistration: res.data.dateOfRegistration,
                    documents: mappedDocuments,
                }
                setInitValues(initialValues);
                setFileNames(mappedDocuments.map(doc => doc.fileName));
                setImageLoaders(new Array(mappedDocuments.length).fill(false));
            } else {
                setErrormsg(isErrorDispaly(res));
                setLoadingData(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setLoadingData(false);
        } finally {
            setLoadingData(false);
        }
    };

    const handleImageUpload = async (
        index: number,
        setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void,
        pickerOption?: 'camera' | 'library'
    ) => {
        const setLoaderState = (loading: boolean) => {
            setImageLoaders(loaders => loaders.map((l, i) => (i === index ? loading : l)));
        };

        try {
            const permissionResult = pickerOption === 'camera'
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", "You need to enable permissions to use this feature.");
                return;
            }

            const result = pickerOption === 'camera'
                ? await ImagePicker.launchCameraAsync({ allowsEditing: false, aspect: [1, 1], quality: 0.5 })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false, aspect: [1, 1], quality: 0.5,
                });

            if (!result.canceled) {
                const selectedImage = result.assets[0];
                const { uri, type } = selectedImage;
                const originalFileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;

                if (!verifyFileTypes(originalFileName)) {
                    setErrormsg(KYB_INFO_CONSTANTS.ACCEPT_IMG_MSG);
                    ref?.current?.scrollTo({ y: 0, animated: true });
                    return;
                }
                setFileNames(names => names.map((n, i) => (i === index ? originalFileName : n)));
                if (uri) {
                    setLoaderState(true);
                    const formData = new FormData();
                    formData.append(
                        KYB_INFO_CONSTANTS.DOCUMENT,
                        {
                            uri: uri,
                            type: selectedImage.mimeType || `${type}/${getFileExtension(selectedImage.uri)}`,
                            name: originalFileName,
                        } as any
                    );
                    const uploadRes = await ProfileService.uploadFile(formData);
                    if (uploadRes.status === 200) {
                        const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                        setFieldValue(`documents[${index}].url`, uploadedImage);
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
            setLoaderState(false);
        }
    };

    const handleSave = async (values: any, errors: any) => {
        setErrormsg("");
        setButtonLoader(true);
        const documentsPayload = values.documents.map((doc: any, index: number) => {
            const lookupItem = idTypesLookUp.find(item => item.code === doc.docType);
            return {
                id: doc.id || KYB_INFO_CONSTANTS.GUID_FORMATE,
                docType: doc.docType,
                url: doc.url,
                recordStatus: props.route.params?.customerId ? KYB_INFO_CONSTANTS.ADDED : null,
                recorder: lookupItem?.recorder || index + 1,
            };
        });

        let Obj = {
            id: props.route.params?.customerId || userinfo?.id,
            companyName: values?.companyName,
            country: values?.country,
            registrationNumber: encryptAES(values?.registrationNumber),
            dateOfRegistration: formatDateTimeAPI(values?.dateOfRegistration),
            documents: documentsPayload,
            addressDetails: {}
        };

        try {
            let response: any;
            if (props.route.params?.customerId) {
                response = await ProfileService.updateKybComnyData(Obj)
            } else {
                response = await ProfileService.postKybComnyData(Obj)
            }
            if (response.ok) {
                navigation.navigate(props.route.params?.customerId ? 'KybInfoPreview' : 'KybUboList')
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        }
    };

    const deleteImage = (index: number, setFieldValue: any) => {
        setFieldValue(`documents[${index}].url`, '');
        setFileNames(names => names.map((n, i) => (i === index ? '' : n)));
    }
    const handleError = useCallback(() => {
        setErrormsg("");
        if (countryError) {
            clearCache();
        }
    }, [countryError, clearCache]);

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            {(loadingData || countryLoading) && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
            {!loadingData && !countryLoading && <KeyboardAwareScrollView
                ref={ref}
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                <Container style={commonStyles.container}>
                    <PageHeader title={props.route.params?.customerId ? "GLOBAL_CONSTANTS.EDIT_KYB" : "GLOBAL_CONSTANTS.KYB"} onBackPress={handleGoBackCb} />
                    {(errormsg || countryError) && <><ErrorComponent message={errormsg || countryError || ''} onClose={handleError} /><View style={commonStyles.sectionGap} /></>}
                    <View style={[commonStyles.mt8]} />
                    <Formik
                        initialValues={initValues}
                        onSubmit={handleSave}
                        validationSchema={KybCompanyDataSchema}
                        enableReinitialize
                    >
                        {(formik) => {
                            const { touched, handleSubmit, errors, handleBlur, values, setFieldValue, handleChange } = formik;
                            return (
                                <>
                                    <Field
                                        touched={touched?.companyName}
                                        name={KYB_INFO_CONSTANTS.COMPANY_FORM_NAMES.COMPANY_NAME}
                                        label={"GLOBAL_CONSTANTS.COMAPANY_NAME"}
                                        error={errors?.companyName}
                                        handleBlur={handleBlur}
                                        customContainerStyle={{}}
                                        placeholder={"GLOBAL_CONSTANTS.COMAPANY_NAME_PLACEHOLDER"}
                                        component={InputDefault}
                                        innerRef={ref}
                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                    />
                                    <View style={[commonStyles.formItemSpace]} />
                                    <Field
                                        modalTitle={"GLOBAL_CONSTANTS.COUNTRY_PLACEHOLDER"}
                                        touched={touched?.country}
                                        name={KYB_INFO_CONSTANTS.COMPANY_FORM_NAMES.COUNTRY}
                                        label={"GLOBAL_CONSTANTS.COUNTRY"}
                                        error={errors?.country}
                                        handleBlur={handleBlur}
                                        customContainerStyle={{}}
                                        placeholder={"GLOBAL_CONSTANTS.COUNTRY_PLACEHOLDER"}
                                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                        component={CustomPicker}
                                        data={countryPickerData || []}
                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        isOnlycountry={true}
                                        sheetHeight={300}
                                    />
                                    <View style={[commonStyles.formItemSpace]} />
                                    <Field
                                        touched={touched?.registrationNumber}
                                        name={KYB_INFO_CONSTANTS.COMPANY_FORM_NAMES.REGISTER_NAME}
                                        label={"GLOBAL_CONSTANTS.REGISTRATION_NUMBER"}
                                        error={errors?.registrationNumber}
                                        handleBlur={handleBlur}
                                        onHandleChange={(text: any) => {
                                            const formattedText = text
                                                .replace(/[^a-zA-Z0-9]/g, "")
                                                .toUpperCase();
                                            handleChange('registrationNumber')(formattedText);
                                        }}
                                        placeholder={"GLOBAL_CONSTANTS.REGISTRATION_NUMBER_PLACEHOLDER"}
                                        component={InputDefault}
                                        innerRef={ref}
                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                    />
                                    <View style={[commonStyles.formItemSpace]} />
                                    <DatePickerComponent name={KYB_INFO_CONSTANTS.COMPANY_FORM_NAMES.DOF_REGISTER} label={"GLOBAL_CONSTANTS.DATE_OF_REGISTRATION"} />
                                    <View style={[commonStyles.formItemSpace]} />
                                    <ParagraphComponent style={[commonStyles.fs24, commonStyles.fw500, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.UPLOAD_THE_FOLLOWING"} />

                                    <View style={[commonStyles.titleSectionGap]} />
                                    <View style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap6]} >
                                        <ViewComponent style={[commonStyles.activeDot, commonStyles.mt4,]} />
                                        <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.FOLLOWING_RULES1"} />
                                    </View>

                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6, commonStyles.mt5]} >
                                        <ViewComponent style={[commonStyles.activeDot, commonStyles.mt4]} />
                                        <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.FOLLOWING_RULES2"} />
                                    </View>
                                    <View style={[commonStyles.formItemSpace]} />
                                    {errors.documents && typeof errors.documents === 'string' && (
                                        <View style={{ marginBottom: 10 }}>
                                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textError]}>
                                                {errors.documents}
                                            </ParagraphComponent>
                                        </View>)}
                                    {/* --- Dynamic Document Fields --- */}
                                    <FieldArray name="documents">
                                        {() => (
                                            values.documents.map((document: any, index: number) => {
                                                return (
                                                    <View key={index}>
                                                        <Field
                                                            label={"GLOBAL_CONSTANTS.CHOOSE_DOCUMENT_TYPE"}
                                                            touched={Array.isArray(touched.documents) ? touched.documents[index]?.docType : undefined}
                                                            name={`documents[${index}].docType`}
                                                            error={
                                                                Array.isArray(errors.documents) &&
                                                                    typeof errors.documents[index] === 'object' &&
                                                                    errors.documents[index] !== null &&
                                                                    'docType' in errors.documents[index]
                                                                    ? (errors.documents[index] as any).docType
                                                                    : undefined
                                                            }
                                                            handleBlur={handleBlur}
                                                            data={idTypesLookUp || []}
                                                            labelKey="name"
                                                            valueKey="code"
                                                            selectionType="code"
                                                            placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                                                            placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                                                            component={CustomPicker}
                                                            requiredMark={<LabelComponent text={"*"} style={commonStyles.textError} />}
                                                        />
                                                        <View style={[commonStyles.formItemSpace]} />
                                                        <FileUpload
                                                            fileLoader={imageLoaders[index]}
                                                            onSelectImage={(source) => handleImageUpload(index, setFieldValue, source)}
                                                            uploadedImageUri={values.documents?.[index]?.url}
                                                            fileName={fileNames[index]}
                                                            errorMessage={
                                                                Array.isArray(errors.documents) &&
                                                                    typeof errors.documents[index] === 'object' &&
                                                                    errors.documents[index] !== null &&
                                                                    'url' in errors.documents[index]
                                                                    ? (errors.documents[index] as any).url
                                                                    : ""
                                                            }
                                                            deleteImage={() => deleteImage(index, setFieldValue)}
                                                            label={"Upload Document"}
                                                            showImageSourceSelector={true}
                                                            isRequired={true}
                                                        />
                                                        <View style={[commonStyles.formItemSpace]} />
                                                    </View>
                                                )
                                            })
                                        )}
                                    </FieldArray>

                                    <ButtonComponent title={"GLOBAL_CONSTANTS.SAVE"} onPress={handleSubmit} loading={buttonLoader} />
                                    <View style={[commonStyles.buttongap]} />
                                    <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={handleGoBackCb} solidBackground={true} disable={buttonLoader} />
                                    <View style={[commonStyles.sectionGap]} />
                                </>
                            );
                        }}
                    </Formik>
                </Container>
            </KeyboardAwareScrollView>}
        </ViewComponent>
    );
};

export default KybCompanyData;

