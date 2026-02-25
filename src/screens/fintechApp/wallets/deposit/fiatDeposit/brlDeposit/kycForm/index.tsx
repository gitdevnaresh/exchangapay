import React, { useEffect, useState, useRef } from "react";
import { Modal, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Formik } from 'formik';
import DashboardLoader from "../../../../../../../components/loader"
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import PersonalKycFormFields from './formFields';
import CreateAccountService from "../../../../../../../apiServices/bank/createAccount";
import ScrollViewComponent from "../../../../../../../components/scrollView/scrollView";
import { s } from "../../../../../../../components/theme/scale";
import { getThemedCommonStyles } from "../../../../../../../components/CommonStyles";
import Container from "../../../../../../../components/container/container";
import { useThemeColors } from "../../../../../../../hooks/themedHook/useThemeColors";
import PageHeader from "../../../../../../../components/pageHeader/pageHeader";
import ViewComponent from "../../../../../../../components/view/view";
import PaymentService from "../../../../../../../apiServices/payments";
import { isErrorDispaly } from "../../../../../../../utils/helpers";
import useEncryptDecrypt from "../../../../../../../hooks/encDecHook";
import ButtonComponent from "../../../../../../../components/buttons/button";
import SafeAreaViewComponent from "../../../../../../../components/safeArea/safeArea";
import ErrorComponent from "../../../../../../../components/errorDisplay/errorDisplay";
import { useLngTranslation } from "../../../../../../../hooks/languagesHook/useLngTranslation";
import { showAppToast } from "../../../../../../../components/toasterMessages/ShowMessage";
import CardsModuleService from "../../../../../../../apiServices/cards";
import { KYB_INFO_CONSTANTS } from "../../../../../onboarding/kyb/constants";
import ProfileService from "../../../../../../../apiServices/profile";
import { getFileExtension, verifyFileTypes } from "../../../../../onboarding/constants";
import {
    KycFormData,
    KycRequirements,
    KycFormDetailsResponse,
    AddressItem,
    PhoneCodeItem,
    FileNames,
    ImagesLoader,
    ReduxState,
    PersonalKycFormProps,
    AddressObject,
    PhoneCodeData,
    AddressData,
    LookupData,
} from "./interface";
import PayoutAddressForm from "../../../../../payments/payout/crypto/kycKybRequirements/PayoutAddressForm";
import { createPersonalKycValidationSchema } from "./validationSchema";
import { getTabsConfigation } from '../../../../../../../../configuration';

interface ReactNativeFile {
    uri: string;
    type: string;
    name: string;
}

const BrlPersonalKycForm = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const scrollRef = useRef<any>(null);
    const { t } = useLngTranslation();
    const { encryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state: ReduxState) => state.userReducer?.userDetails);
    const [kycRequirements, setKycRequirements] = useState<KycRequirements>();
    const [Lookups, setLookups] = useState<LookupData>();
    const [error, setError] = useState<string | undefined>();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [addressesList, setAddressesList] = useState<AddressItem[]>([]);
    const [imagesLoader, setImagesLoader] = useState<ImagesLoader>({ frontId: false, backId: false, frontIdPhoto: false, backIdPhoto: false, selfie: false });
    const [fileNames, setFileNames] = useState<FileNames>({ frontId: null, backId: null, frontIdPhoto: null, backIdPhoto: null, selfie: null });
    const [countryCodelist, setCountryCodelist] = useState<PhoneCodeItem[]>([]);
    const today = new Date();
    const isFocused = useIsFocused();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const [formData, setFormData] = useState<KycFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        phoneCode: '',
        birthDate: '',
        occupation: '',
        country: '',
        address: '',
        docType: '',
        docNumber: '',
        expiryDate: '',
        frontId: '',
        backId: '',
        frontIdPhoto: '',
        backIdPhoto: '',
        taxIdNumber: '',
        selfie: '',
        productId: ''
    });
    const paymentsConfig = getTabsConfigation('PAYMENTS');
    const isTaxIdOnly = paymentsConfig?.TAX_ID_ONLY;
    const validationSchema = createPersonalKycValidationSchema(t, isTaxIdOnly);
    const [taxNumber, setTaxNumber] = useState<string>('');
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            try {
                // Load addresses first
                await Addresses();

                // Then load other data in parallel
                await Promise.all([
                    getLookups(),
                    getPhoneCodes(),
                    props?.route?.params?.VaultData?.productId ? PayoutKycRequirements() : Promise.resolve()
                ]);

                // Finally load and bind KYC data after addresses are available
                if (props?.route?.params?.VaultData?.productId) {
                    await getKycFormDetails();
                }
            } finally {
                setLoading(false);
            }
        };
        initializeData();
    }, [props?.route?.params?.VaultData?.productId, isFocused]);

    // Re-bind KYC data when addresses are loaded or when KYC requirements change
    useEffect(() => {
        // Bind data if we have KYC requirements, regardless of addresses
        if (kycRequirements?.kyc) {
            bindKycData(kycRequirements.kyc, kycRequirements.productId || props?.route?.params?.VaultData?.productId);
        }
    }, [addressesList, kycRequirements]);
    const handleBack = () => {
        if (props?.route?.params?.screenName === "WalletsDashboard") {
            props.navigation.reset({
                index: 0,
                routes: [{
                    name: 'Dashboard',
                    params: {
                        initialTab: "GLOBAL_CONSTANTS.WALLETS",
                        animation: "slide_from_left"
                    }
                }]
            });
        }
        else {
            navigation.goBack()
        }

    };
    const Addresses = async () => {
        try {
            const response = await PaymentService.kycAddresses();
            if (response.ok) {
                const filterData = (response.data as AddressData[]).map((item: AddressData) => ({
                    ...item,
                    name: item.favoriteName
                }));
                setAddressesList(filterData);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const PayoutKycRequirements = async () => {
        try {
            const response = await PaymentService.kycRequirements(props?.route?.params?.VaultData?.productId);
            if (response.ok) {
                setKycRequirements(response.data as KycRequirements);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const getKycFormDetails = async () => {
        try {
            const response: any = await PaymentService.kycRequirements(props?.route?.params?.VaultData?.productId);
            if (response.ok) {
                // Don't bind here, let the useEffect handle it when addresses are ready
                setKycRequirements(response.data);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const bindKycData = (kycData: any, productId: string) => {
        if (kycData) {
            const { fullName, basic, addressDto, documents } = kycData;

            const identificationDoc = documents?.find((doc: any) => doc.documentType !== 'SELFIE');
            const selfieDoc = documents?.find((doc: any) => doc.documentType === 'SELFIE');

            // Find address by ID from the loaded addresses list
            const initialAddress = addressesList?.find(item => item.id === addressDto?.addressId);
            const addressValue = initialAddress?.name || '';

            // Extract Tax ID from various possible locations
            const extractedTaxId = taxNumber ||
                identificationDoc?.taxIdNumber ||
                selfieDoc?.taxIdNumber ||
                documents?.find((doc: any) => doc.taxIdNumber)?.taxIdNumber ||
                '';

            const newFormData = {
                firstName: fullName?.firstName || '',
                lastName: fullName?.lastName || '',
                email: basic?.email || '',
                phoneNumber: basic?.phoneNo || '',
                phoneCode: basic?.phoneCode || '',
                birthDate: basic?.dob || '',
                occupation: '',
                country: '',
                address: addressValue || initialAddress?.favoriteName || '',
                docType: identificationDoc?.documentType || '',
                docNumber: identificationDoc?.documentNumber || '',
                expiryDate: '',
                frontId: identificationDoc?.documentFront || '',
                backId: identificationDoc?.documentBack || '',
                frontIdPhoto: identificationDoc?.documentFront || '',
                backIdPhoto: identificationDoc?.documentBack || '',
                taxIdNumber: extractedTaxId,
                selfie: selfieDoc?.selfieDocument || '',
                productId: productId
            };

            setFormData(newFormData);

            // Set file names for both field sets
            const fileNamesUpdate: any = {};

            if (identificationDoc?.documentFront) {
                const fileName = identificationDoc?.documentFront?.split('/')?.pop() || '';
                fileNamesUpdate.frontId = fileName;
                fileNamesUpdate.frontIdPhoto = fileName;
            }

            if (identificationDoc?.documentBack) {
                const fileName = identificationDoc?.documentBack?.split('/')?.pop() || '';
                fileNamesUpdate.backId = fileName;
                fileNamesUpdate.backIdPhoto = fileName;
            }

            if (selfieDoc?.selfieDocument) {
                const fileName = selfieDoc?.selfieDocument?.split('/')?.pop() || '';
                fileNamesUpdate.selfie = fileName;
            }

            setFileNames((prev: FileNames) => ({ ...prev, ...fileNamesUpdate }));
        }
    };
    const getLookups = async () => {
        try {
            const response = await PaymentService?.paymentsLookups();
            if (response.ok) {
                setLookups(response.data as LookupData);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const getPhoneCodes = async () => {
        try {
            const response = await PaymentService.getAddressLookUpDetails();
            if (response.ok && response.data) {
                setCountryCodelist((response.data as PhoneCodeData)?.PhoneCodes || []);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const handlePhoneCode = (item: PhoneCodeItem, setFieldValue: (field: string, value: string) => void) => {
        setFieldValue('phoneCode', item?.code);
    };
    const handleAddAddress = () => {
        setAddressModalVisible(true);
    };
    const handleCloseAddressModal = () => {
        setAddressModalVisible(false);
    };
    const handleAddressSubmit = async (addressObject: AddressObject, taxIdNumber?: string) => {
        setError('');
        try {
            const obj = {
                id: KYB_INFO_CONSTANTS.GUID_FORMATE,
                customerId: userInfo?.id,
                favoriteName: addressObject?.favoriteName?.trim(),
                addressType: addressObject?.addressType?.trim() || "",
                country: addressObject?.country,
                state: addressObject?.state?.trim() || "",
                city: addressObject?.city?.trim(),
                addressLine1: addressObject?.addressLine1?.trim(),
                addressLine2: addressObject?.addressLine2?.trim(),
                postalCode: encryptAES(addressObject?.postalCode),
                phoneNumber: encryptAES(addressObject?.phoneNumber),
                phoneCode: encryptAES(addressObject?.phoneCode),
                email: encryptAES(addressObject?.email),
                isDefault: addressObject?.isDefault || false,
                createdBy: userInfo?.userName,
                town: addressObject?.town,
                createdDate: new Date(),
            };
            const response = await PaymentService.brlAddressPost(obj);
            if (response.ok) {
                setError('')
                showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');
                setAddressModalVisible(false);
                // Update taxIdNumber in formData if provided
                if (taxIdNumber) {
                    setTaxNumber(taxIdNumber);
                }
                // Re-fetch addresses and then KYC requirements to ensure data is in sync
                await Addresses().then(() => {
                    if (props?.route?.params?.VaultData?.productId) getKycFormDetails();
                });
            } else {
                setError(isErrorDispaly(response));
            }
            return response;
        } catch (error) {
            setError(isErrorDispaly(error));
            return error;
        }
    };
    const uploadFileToServer = async (uri: string, type: string, fileName: string, fileExtension: string, item: string, setFieldValue: (field: string, value: string) => void) => {
        setImagesLoader((prevState: ImagesLoader) => ({ ...prevState, [item]: true }));
        try {
            const formData = new FormData();
            const fileObject: ReactNativeFile = {
                uri: uri,
                type: `${type}/${fileExtension}`,
                name: fileName,
            };
            formData.append('document', fileObject as unknown as Blob);

            const uploadRes = await ProfileService.uploadFile(formData);
            if (uploadRes.status === 200) {
                const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                setFieldValue(item, uploadedImage);
                setFileNames((prev: FileNames) => ({ ...prev, [item]: fileName }));
                setError(undefined);
            } else {
                setError(isErrorDispaly(uploadRes));
                scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
        } finally {
            setImagesLoader((prevState: ImagesLoader) => ({ ...prevState, [item]: false }));
        }
    };
    const handleUploadImg = async (
        item: string,
        setFeilds: (field: string, value: string) => void,
        pickerOption?: 'camera' | 'library' | 'documents'
    ) => {
        try {
            if (pickerOption === 'documents') {
                await new Promise(resolve => setTimeout(resolve, 200));
                const result = await DocumentPicker.getDocumentAsync({
                    type: ['image/*', 'application/pdf'],
                    copyToCacheDirectory: true,
                });
                if (result.canceled) return;
                const selectedFile = result.assets[0];
                const { uri, mimeType, name, size } = selectedFile;
                const fileName = name || uri?.split('/')?.pop() || `file_${Date.now()}`;
                // Check file size (15MB limit)
                const fileSizeMB = size ? size / (1024 * 1024) : 0;
                if (fileSizeMB > 15) {
                    setError(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                    requestAnimationFrame(() => {
                        scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
                    });
                    return;
                }
                // Validate file type
                const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
                const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);

                if (!isPdf && !isImage) {
                    setError(t('GLOBAL_CONSTANTS.ONLY_IMAGES_AND_PDF_FILES_ARE_ACCEPTED'));
                    requestAnimationFrame(() => {
                        scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
                    });
                    return;
                }

                setFileNames((prevState: FileNames) => ({ ...prevState, [item]: fileName }));

                const fileExtension = fileName?.split('.')?.pop()?.toLowerCase() || 'pdf';
                const type = isPdf ? 'application' : 'image';

                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
                return;
            }
            const permissionResult = pickerOption === 'camera'
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", "You need to enable permissions to use this feature.");
                return;
            }
            const result = pickerOption === 'camera'
                ? await ImagePicker.launchCameraAsync({ allowsEditing: false, aspect: [1, 1], quality: 0.5 })
                : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: false, aspect: [1, 1], quality: 0.5, cameraType: ImagePicker.CameraType.front });
            if (result.canceled) return;
            const selectedImage = result.assets[0];
            const { uri, type } = selectedImage;
            const fileName = selectedImage?.fileName || uri?.split('/')?.pop() || `image_${Date.now()}.jpg`;
            const fileExtension = getFileExtension(selectedImage?.uri);
            if (!verifyFileTypes(fileName)) {
                setError(KYB_INFO_CONSTANTS.ACCEPT_IMG_MSG);
                requestAnimationFrame(() => {
                    scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
                });
                return;
            }
            // Check file size (15MB limit)
            const fileSizeMB = selectedImage?.fileSize ? selectedImage?.fileSize / (1024 * 1024) : 0;
            if (fileSizeMB > 15) {
                setError(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                requestAnimationFrame(() => {
                    scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
                });
                return;
            }

            setFileNames((prevState: FileNames) => ({ ...prevState, [item]: fileName }));

            if (uri && type && fileExtension) {
                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
            }
        } catch (err) {
            scrollRef?.current?.scrollTo?.({ y: 0, animated: true });
            setError(isErrorDispaly(err));
        } finally {
            setImagesLoader((prevState: ImagesLoader) => ({ ...prevState, [item]: false }));
        }
    };

    const handleSubmit = async (values: KycFormData) => {
        setIsSubmitting(true);
        try {
            const paymentsConfig = getTabsConfigation('PAYMENTS');
            const isTaxIdOnly = paymentsConfig?.TAX_ID_ONLY;
            const isReApply = props?.route?.params?.isReApply || false;

            let kycObject;

            if (isTaxIdOnly) {
                // Tax ID only mode but pass all available data
                kycObject = {
                    kyc: {
                        requirement: "TaxIdOnly",
                        fullName: {
                            firstName: values.firstName ? encryptAES(values.firstName) : '',
                            lastName: values.lastName ? encryptAES(values.lastName) : ''
                        },
                        basic: {
                            dob: values.birthDate || '',
                            email: values.email ? encryptAES(values.email) : '',
                            phoneCode: values.phoneCode ? encryptAES(values.phoneCode) : '',
                            phoneNo: values.phoneNumber ? encryptAES(values.phoneNumber) : '',
                            occupation: values.occupation || ''
                        },
                        addressDto: {
                            addressId: values.address ? (addressesList?.find(addr => addr?.name === values?.address)?.id || values?.address) : ''
                        },
                        kycpfc: {
                            documentType: values.docType?.toLowerCase() || "passport",
                            documentNumber: values.docNumber || '',
                            documentFront: (values.frontIdPhoto && values.frontIdPhoto.trim()) ? values.frontIdPhoto : values.frontId || '',
                            documentBack: (values.backIdPhoto && values.backIdPhoto.trim()) ? values.backIdPhoto : values.backId || '',
                            selfieDocument: values.selfie || '',
                            taxIdNumber: values.taxIdNumber
                        }
                    },
                    productId: values?.productId,
                    IsReApply: isReApply
                };
            } else {
                // Full KYC object
                kycObject = {
                    kyc: {
                        requirement: kycRequirements?.kyc?.requirement || "",
                        fullName: {
                            firstName: encryptAES(values.firstName),
                            lastName: encryptAES(values.lastName)
                        },
                        basic: {
                            dob: values.birthDate,
                            email: encryptAES(values.email),
                            phoneCode: encryptAES(values.phoneCode),
                            phoneNo: encryptAES(values.phoneNumber),
                            occupation: values.occupation
                        },
                        addressDto: {
                            addressId: addressesList?.find(addr => addr?.name === values?.address)?.id || values?.address
                        },
                        kycpfc: {
                            documentType: values.docType?.toLowerCase() || "passport",
                            documentNumber: values.docNumber,
                            documentFront: values.frontId,
                            documentBack: values.backId,
                            selfieDocument: values.selfie,
                            taxIdNumber: values.taxIdNumber
                        },

                    },
                    productId: values?.productId,
                    IsReApply: isReApply
                };
            }

            const response = await PaymentService.saveKycDetails(kycObject);

            if (response.ok) {
                navigation.navigate("PaymentPending", { screenName: "Wallets" })
            } else {
                setError(isErrorDispaly(response));
                scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormSubmit = (values: KycFormData, setTouched: (touched: Record<string, boolean>) => void) => {
        validationSchema.validate(values,).then(() => {
            handleSubmit(values);
        }).catch(() => {
            setError(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
            // Mark all fields as touched to show errors
            const touchedFields = Object.keys(formData).reduce((acc: Record<string, boolean>, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setTouched(touchedFields);
            // Scroll to top to show error
            scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
        });
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader
                    title={"GLOBAL_CONSTANTS.CREATE_BRL_ACCOUNT"}
                    onBackPress={handleBack}
                />
                {loading && <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </SafeAreaViewComponent>}
                {!loading && <Formik
                    initialValues={formData}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                    validateOnChange={true}
                    validateOnBlur={true}
                >
                    {({ touched, errors, handleBlur, values, setFieldValue, setTouched }) => {
                        return (
                            <KeyboardAvoidingView
                                style={{ flex: 1 }}
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                keyboardVerticalOffset={s(64)}
                            >
                                <ScrollViewComponent
                                    ref={scrollRef}
                                    contentContainerStyle={{ flexGrow: 1 }}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        {error && <ErrorComponent message={error} onClose={() => setError(undefined)} />}
                                        <ViewComponent style={[commonStyles.titleSectionGap]} />

                                        <PersonalKycFormFields
                                            touched={touched}
                                            errors={errors}
                                            handleBlur={handleBlur}
                                            values={values}
                                            setFieldValue={setFieldValue}
                                            Lookups={Lookups}
                                            addressesList={addressesList}
                                            imagesLoader={imagesLoader}
                                            fileNames={fileNames}
                                            setFileNames={setFileNames}
                                            handleUploadImg={handleUploadImg}
                                            handleAddAddress={handleAddAddress}
                                            maxDate={maxDate}
                                            commonStyles={commonStyles}
                                            NEW_COLOR={NEW_COLOR}
                                            t={t}
                                            kycRequirements={kycRequirements}
                                            countryCodelist={countryCodelist}
                                            handlePhoneCode={handlePhoneCode}
                                        />

                                        <ViewComponent style={[commonStyles.sectionGap]} />
                                        <ViewComponent style={[commonStyles.flex1]} />
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.SUBMIT"}
                                            loading={isSubmitting}
                                            disable={isSubmitting}
                                            onPress={() => handleFormSubmit(values, setTouched)}
                                        />
                                        <ViewComponent style={[commonStyles.buttongap]} />
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.CANCEL"}
                                            solidBackground={true}
                                            onPress={handleBack}
                                        />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                </ScrollViewComponent>
                                <Modal
                                    animationType="slide"
                                    transparent={false}
                                    visible={addressModalVisible}
                                    onRequestClose={handleCloseAddressModal}
                                >
                                    <PayoutAddressForm
                                        onClose={handleCloseAddressModal}
                                        onSubmit={handleAddressSubmit}
                                        taxIdNumber={values.taxIdNumber}
                                    />
                                </Modal>
                            </KeyboardAvoidingView>
                        );
                    }}
                </Formik>}
            </Container>

        </ViewComponent>
    );
};
export default BrlPersonalKycForm;
