import React, { useEffect, useRef, useState } from 'react'
import { View, SafeAreaView, TextInput, Alert, KeyboardAvoidingView, ScrollView } from "react-native"
import { Field } from 'formik';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import InputDefault from '../../../../../components/textInputComponents/DefaultFiat'
import { isErrorDispaly } from '../../../../../utils/helpers';
import ProfileService from '../../../../../apiServices/profile';
import CustomPicker from '../../../../../components/customPicker/CustomPicker';
import PhoneCodePicker from '../../../../../components/phonePicker/phonePicker';
import CardsModuleService from '../../../../../apiServices/cards';
import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { FORM_DATA_CONSTANTS, KycAddressProps, LoadingState, RefKycDetailsInterface, PLACEHOLDER_CONSTANTS, FORM_DATA_LABEL, FORM_DATA_PLACEHOLDER, CountryIdTypesInterface } from '../constants';
import FileUpload from '../../../../../components/fileUpload/fileUpload';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import { useSelector } from 'react-redux';
import { FORM_FIELD } from '../../../onboarding/kyb/constants';
import SignatureDrawer from '../../../../../components/signature/signature';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../components/view/view';
import AddCardsAddress from './addCardsKycAddress';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';
import DatePickerComponent from '../../../../../components/datePickers/formik/datePicker';
import RadioButton from '../../../../../components/radiobutton/RadioButton';
import * as DocumentPicker from 'expo-document-picker';
import { AddressDetail, AddressItem, ApiResponse, CountryCodeItem, CountryForTowns, CountryWithDetails, OccupationInterface, ReduxState, SelectedCountryForStates, StateList, TownsList } from '../interface';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import AddressFields from './addressFeilds';
import { s } from '../../../../../components/theme/scale';
import useCountryData from '../../../../../hooks/countryDataHook/useCountryData';
import { CountryWithStates } from '../../../../commonScreens/addUboForm/interface';




// Additional interfaces for type safety


type ImageFieldKey =
    | 'faceImage'
    | 'signature'
    | 'profilePicBack'
    | 'profilePicFront'
    | 'handHoldingIDPhoto'
    | 'biometric'
    | 'idImage'
    | 'faceImage1'
    | 'mixedPhoto';

const KycAddress: React.FC<KycAddressProps> = ({ handleBlur, values, setFieldValue, handleChange, touched, errors, kycReqList, formData, cardId, keyRequirements }) => {
    const kycDetailsRef = useRef<RefKycDetailsInterface>({
        firstName: null,
        lastName: null,
        middleName: null,
        country: null,
        addressCountry: null,
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
        idImage: null,
        address: null,
        addressId: null,
        docNumber: null,
        faceImage1: null,
        mixedPhoto: null,
        occupation: null,
        annualSalary: null,
        sourceOfIncome: null,
        accountPurpose: null,
        expectedMonthlyVolume: null,
        issueDate: null,
        addressLine2: null,
    })
    const [errormsg, setErrormsg] = useState<string>('');
    const isFocused = useIsFocused();
    const [idTypesLookUp, setIdTypesLookUp] = useState<DocumentType[]>();
    const [countryCodelist, setCountryCodelist] = useState<CountryCodeItem[]>([]);
    const { countryPickerData, phoneCodePickerData, countriesWithStates, genderPickerData, loading: countryLoading, error: countryError, clearCache } = useCountryData({ loadCountries: true, loadPhoneCodes: true, loadStates: true, loadGenders: true });
    const { decryptAES } = useEncryptDecrypt();
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
    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const userInfo = useSelector((state: ReduxState) => state?.userReducer?.userDetails)
    const ref = useRef<ScrollView>(null);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [isAddAddressModalVisible, setAddAddressModalVisible] = useState<boolean>(false);
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const [occupationList, setOccupationList] = useState<OccupationInterface[]>([]);
    const [townsList, setTownsList] = useState<TownsList[]>([]);
    const [statesList, setStatesList] = useState<StateList[]>([]);
    const [countries, setCountries] = useState<CountryForTowns[]>([]);
    const [countriesWithState, setCountriesWithStates] = useState<CountryWithDetails[]>([]);
    const [cardDocType, setCardDocType] = useState<DocumentType[]>([])
    const [statesListInfo, setStatesListInfo] = useState<StateList[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({
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
    const [isSignatureDrawerVisible, setIsSignatureDrawerVisible] = useState<boolean>(false);
    const [addressesDetails, setAddressesDetails] = useState<AddressDetail[]>([]);
    const [countryIdType, setCountryIdType] = useState<CountryIdTypesInterface[]>([]);

    useEffect(() => {
        fetchLookUps();
        getListOfCountryCodeDetails();
        getPersonlCustomerDetailsInfo();
        occupationLookup();
        fetchCounriesLookup();
        fetchCardsDocTypes();
    }, [isFocused])
    useEffect(() => {
        if (values.addressCountry && countriesWithStates.length > 0) {
            const selectedCountryForStates = countriesWithStates.find((country: CountryWithStates) => country?.name === values.addressCountry);
            if (selectedCountryForStates && selectedCountryForStates.details && selectedCountryForStates.details.length > 0) {
                setStatesListInfo(selectedCountryForStates.details);
            } else {
                setStatesListInfo([]);
            }
        }
    }, [values.addressCountry, countriesWithStates]);
    const fetchCardsDocTypes = async () => {
        try {
            const response = await CardsModuleService.getCardDocTypes() as ApiResponse<DocumentType[]>;
            if (response?.status == 200) {
                setCardDocType(response?.data || []);
                setErrormsg('');
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };
    const occupationLookup = async () => {
        try {
            const response = await CardsModuleService.getOccupationLookup(cardId) as ApiResponse<OccupationInterface[]>;
            if (response?.status === 200) {
                setOccupationList(response?.data || []);
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        }
    };
    const getPersonlCustomerDetailsInfo = async (screen?: string) => {
        const pageSize = 10;
        const pageNo = 1;
        try {
            const response = await CardsModuleService?.cardsAddressGet(pageNo, pageSize) as ApiResponse<{ data: AddressDetail[] }>;
            if (response?.ok) {
                const addressesList: AddressItem[] = response?.data?.data.map((item: AddressDetail) => ({
                    id: item?.id,
                    favoriteName: `${(item as AddressDetail & { favoriteName?: string; fullName?: string; addressType?: string })?.favoriteName || (item as AddressDetail & { fullName?: string })?.fullName || item?.id} (${(item as AddressDetail & { addressType?: string })?.addressType})`,
                    name: `${(item as AddressDetail & { favoriteName?: string; fullName?: string; addressType?: string })?.favoriteName || (item as AddressDetail & { fullName?: string })?.fullName || item?.id} (${(item as AddressDetail & { addressType?: string })?.addressType})`,
                    isDefault: (item as AddressDetail & { isDefault?: boolean })?.isDefault || false,
                })) || [];
                setAddresses(addressesList);
                // If matched, fallback to default
                const defaultAddress = addressesList.find((addr: AddressItem) => addr.isDefault);
                if (defaultAddress) {
                    setFieldValue(FORM_DATA_CONSTANTS.ADDRESS, defaultAddress?.name);
                    setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_ID, defaultAddress?.id);

                }
                if (screen == FORM_DATA_CONSTANTS?.PROFILE_ADDRESS_ADD) {
                    handleAddress(defaultAddress?.name || "", addressesList, response?.data?.data, FORM_DATA_CONSTANTS?.PROFILE_ADDRESS_ADD)
                }
                setAddressesDetails(response?.data?.data || []);
                setErrormsg("");
                setErrormsg('');
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
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
    const fetchLookUps = async () => {
        try {
            const response = await ProfileService.getprofileEditLookups() as ApiResponse<{ KycDocumentTypes: DocumentType[]; KybDocumentTypes: DocumentType[]; countryWithStates: SelectedCountryForStates[] }>;
            if (response?.status == 200) {
                const idTypes = userInfo?.accountType === "Personal" ? response?.data?.KycDocumentTypes : response?.data?.KybDocumentTypes;
                setIdTypesLookUp(idTypes || [])
                if (idTypes && idTypes.length === 1) {
                    setFieldValue(FORM_DATA_CONSTANTS?.ID_TYPE, idTypes[0].name);
                }
                const selectedCountryForStates: SelectedCountryForStates | undefined = response?.data?.countryWithStates?.find((c: SelectedCountryForStates) => c?.name == values?.addressCountry);
                if (selectedCountryForStates && selectedCountryForStates.details?.length && selectedCountryForStates.details.length > 0) {
                    setStatesList(selectedCountryForStates.details);
                } else {
                    setStatesList([]);
                }
                setCountriesWithStates(response?.data?.countryWithStates?.map(country => ({
                    ...country,
                    code: country.code || ""
                })) || []);
                setErrormsg('');
            }
            else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        }

    };

    const fetchCounriesLookup = async () => {
        try {
            const response= await CardsModuleService.getCardCountries() as ApiResponse<CountryForTowns[]> ;
            if (response?.status == 200) {
                setCountries(response?.data || []);
                if (values?.country || values?.addressCountry) {
                    const selectedAddressCountryForTowns = response?.data?.find((c: CountryForTowns) => c?.name == values?.addressCountry);
                    const selectedCountry = response?.data?.find((c: CountryForTowns) => c?.name == values?.country);
                    fetchTownList(selectedAddressCountryForTowns?.code);
                    fetchDocuments(selectedCountry?.name)
                }
                setErrormsg('');
            }
            else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        }

    };
    const fetchDocuments = async (country?: string) => {
        try {
            const response = await CardsModuleService.getDocuments(country) as  ApiResponse<CountryIdTypesInterface[]>;
            if (response?.status == 200) {
                setCountryIdType(response?.data || []);
                setErrormsg('');
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));

        }
    }
    const getListOfCountryCodeDetails = async () => {
        const response= await CardsModuleService.getAddressLu() as ApiResponse<{ PhoneCodes: CountryCodeItem[] }> ;
        if (response?.status === 200) {
            setCountryCodelist(response?.data?.PhoneCodes || []);
            setErrormsg("");
        } else {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(response));
        }
    };
    const acceptedExtensions = ['.jpg', '.jpeg', '.png'];
    const verifyFileTypes = (fileList: string) => {
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

    const handleErrorComonent = () => {
        setErrormsg("");
    };

    const handleError = () => {
        setErrormsg("");
        if (countryError) {
            clearCache();
        }
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
        } as unknown as Blob);
        const uploadRes = await ProfileService.uploadFile(formData);
        if (uploadRes.status === 200) {
            const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
            setFeilds(item, uploadedImage);
            setErrormsg("");
        } else {
            ref?.current?.scrollTo?.({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(uploadRes));
        }
    };

    const handleImageUpload = async (
        item: string,
        setFeilds: (field: string, value: string) => void,
        pickerOption?: 'camera' | 'library' | 'documents'
    ) => {
        setLoadingState(prev => ({ ...prev, [item]: true }));
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
                const fileName = name || uri.split('/').pop() || `file_${Date.now()}`;

                // Check file size (15MB limit)
                const fileSizeMB = size ? size / (1024 * 1024) : 0;
                if (fileSizeMB > 15) {
                    setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                    requestAnimationFrame(() => {
                        ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                    });
                    return;
                }

                // Validate file type
                const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
                const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);

                if (!isPdf && !isImage) {
                    setErrormsg(t('GLOBAL_CONSTANTS.ONLY_IMAGES_AND_PDF_FILES_ARE_ACCEPTED'));
                    requestAnimationFrame(() => {
                        ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                    });
                    return;
                }

                setFileNames(prevState => ({ ...prevState, [item]: fileName }));

                const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
                const type = isPdf ? 'application' : 'image';

                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
                return;
            }

            const permissionResult = pickerOption === 'camera'
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", FORM_DATA_CONSTANTS.ALRET_MSG);
                return;
            }

            const result = pickerOption === 'camera'
                ? await ImagePicker.launchCameraAsync({ allowsEditing: false, aspect: [1, 1], quality: 0.5 })
                : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: false, aspect: [1, 1], quality: 0.5, cameraType: ImagePicker.CameraType.front });

            if (result.canceled) return;

            const selectedImage = result.assets[0];
            const { uri, type } = selectedImage;
            const fileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
            const fileExtension = getFileExtension(selectedImage.uri);

            if (!verifyFileTypes(fileName)) {
                setErrormsg(FORM_DATA_CONSTANTS.ACCEPT_IMG_MSG);
                requestAnimationFrame(() => {
                    ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                });
                return;
            }
            // Check file size (15MB limit)
            const fileSizeMB = selectedImage.fileSize ? selectedImage.fileSize / (1024 * 1024) : 0;
            if (fileSizeMB > 15) {
                setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                requestAnimationFrame(() => {
                    ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                });
                return;
            }

            setFileNames(prevState => ({ ...prevState, [item]: fileName }));

            if (uri && type && fileExtension) {
                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
            }
        } catch (err) {
            ref?.current?.scrollTo?.({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(err));
        } finally {
            setLoadingState(prev => ({ ...prev, [item]: false }));
        }
    };
    const handleDrawnSignatureSaved = async (signatureBase64: string) => {
        setIsSignatureDrawerVisible(false);
        if (!signatureBase64) return;
        setFieldValue(FORM_DATA_CONSTANTS.SIGNATURE, "");
        setErrormsg("");
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
                setErrormsg(PLACEHOLDER_CONSTANTS.FILE_SIZE_ERROR);
                ref?.current?.scrollTo({ y: 0, animated: true });
                setLoadingState(prev => ({ ...prev, signature: false }));
                return;
            }
            setFileNames(prevState => ({ ...prevState, signature: fileName }));
            const formDataInstance = new FormData();
            formDataInstance.append("document", { uri: filePath, type: 'image/png', name: fileName } as unknown as Blob);
            setLoadingState(prev => ({ ...prev, signature: true }));
            const uploadRes = await ProfileService.uploadFile(formDataInstance);

            if (uploadRes.status === 200) {
                const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                setFieldValue('signature', uploadedImage);
                setErrormsg("");
            } else {
                setErrormsg(isErrorDispaly(uploadRes));
                ref?.current?.scrollTo({ y: 0, animated: true });
            }
        } catch (err: unknown) {
            setErrormsg(isErrorDispaly((err as Error).message ?? err));
            ref?.current?.scrollTo({ y: 0, animated: true });
        } finally {
            setLoadingState(prev => ({ ...prev, signature: false }));
        }
    };

    const verifyFileSize = (fileSize: number) => {
        const maxSizeInBytes = 15 * 1024 * 1024; // 15MB
        return fileSize <= maxSizeInBytes;
    };

    const deleteImages = (fieldName: ImageFieldKey) => {
        setFieldValue(fieldName, "");
        setFileNames(prev => ({ ...prev, [fieldName]: "" }));
    };
    const titleMapping: { [key: string]: string | undefined } = {
        fullname: "GLOBAL_CONSTANTS.PERSIONAL_INFORMATION",
        fullnameonly: "GLOBAL_CONSTANTS.PERSIONAL_INFORMATION",
        comms: "GLOBAL_CONSTANTS.CONTACT_INFORMATION",
        passport: "GLOBAL_CONSTANTS.ID_PROOFS",
        passportonly: "GLOBAL_CONSTANTS.ID_PROOFS",
        address: "GLOBAL_CONSTANTS.ADDRESS_INFO",
        fulladdress: "GLOBAL_CONSTANTS.ADDRESS_INFO",
        emergencycontact: "GLOBAL_CONSTANTS.EMERGENCY_CONTACT",
        financialprofile: "GLOBAL_CONSTANTS.FINANCIAL_PROFILE",
        idtypes: "GLOBAL_CONSTANTS.ID_TYPES",
        face: "GLOBAL_CONSTANTS.FACE_IMAGE_TITTLE"
    };
    const handleAddress = (e: string, addressList?: AddressItem[], addressesDetailsInfo?: AddressDetail[], screenName?: string) => {
        setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE1, "");
        setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE2, "");
        setFieldValue(FORM_DATA_CONSTANTS.CITY, "");
        setFieldValue(FORM_DATA_CONSTANTS.STATE, "");
        setFieldValue(FORM_DATA_CONSTANTS.POSTAL_CODE, "");
        setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_COUNTRY, "");
        setFieldValue(FORM_DATA_CONSTANTS.TOWN, "");
        const address = (screenName == FORM_DATA_CONSTANTS?.PROFILE_ADDRESS_ADD ? addressList : addresses)?.find((item: AddressItem) => item?.name == e)
        if (address) {
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_ID, address.id);
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS, `${address.name}`);
            setFieldValue(FORM_DATA_CONSTANTS.IS_DEFAULT, `${address.isDefault}`);
            const addressDetail:any = (screenName == FORM_DATA_CONSTANTS?.PROFILE_ADDRESS_ADD ? addressesDetailsInfo : addressesDetails)?.find((addr: AddressDetail) => addr?.id === address?.id);
            const selectedCountryForTowns = countries?.find((c: CountryForTowns) => c?.name === addressDetail?.country);
            fetchTownList(selectedCountryForTowns?.code)
            const selectedCountryForStates: SelectedCountryForStates | undefined = countriesWithState?.find(c => c?.name === selectedCountryForTowns?.name);
            if (selectedCountryForStates && selectedCountryForStates?.details?.length && selectedCountryForStates.details.length > 0) {
                setStatesList(selectedCountryForStates?.details);
            } else {
                setStatesList([]);
            }
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE1, addressDetail?.addressLine1 || "");
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE2, addressDetail?.addressLine2 || "");
            setFieldValue(FORM_DATA_CONSTANTS.CITY, addressDetail?.city || "");
            setFieldValue(FORM_DATA_CONSTANTS.STATE, addressDetail?.state || "");
            setFieldValue(FORM_DATA_CONSTANTS.POSTAL_CODE, decryptAES(addressDetail?.postalCode) || "");
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_COUNTRY, addressDetail?.country || "");
            setFieldValue(FORM_DATA_CONSTANTS.TOWN, addressDetail?.town || "");
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_ID, addressDetail.id);

        }
    }
    const handleAddAddress = () => {
        setAddAddressModalVisible(true);
    }
    const handleCloseAddAddressModal = () => {
        setAddAddressModalVisible(false);
    };
    const handleAddressSaveSuccess = () => {
        setAddAddressModalVisible(false);
        getPersonlCustomerDetailsInfo(FORM_DATA_CONSTANTS?.PROFILE_ADDRESS_ADD);
    };
    const deleteImageByType = (fieldName: ImageFieldKey) => {
        setFieldValue(fieldName, "");
    }
    const handleAddressCountry = (e: string, setFieldValue: (field: string, value: string) => void) => {
        setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_COUNTRY, e);
        setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_COUNTRY, e);
        if (e?.toLowerCase()?.replace(/\s+/g, '')?.trim() !== values?.addressCountry?.toLowerCase()?.replace(/\s+/g, '')?.trim()) {
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE1, "");
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE2, "");
            setFieldValue(FORM_DATA_CONSTANTS.CITY, "");
            setFieldValue(FORM_DATA_CONSTANTS.STATE, "");
            setFieldValue(FORM_DATA_CONSTANTS.POSTAL_CODE, "");
            setFieldValue(FORM_DATA_CONSTANTS.TOWN, "");
        }
        const selectedCountryForTowns = countries?.find((c: CountryForTowns) => c?.name === e);
        fetchTownList(selectedCountryForTowns?.code)

        const selectedCountryForStates: SelectedCountryForStates | undefined = countriesWithState?.find(c => c?.name === e);
        if (selectedCountryForStates && selectedCountryForStates.details?.length && selectedCountryForStates.details.length > 0) {
            setStatesList(selectedCountryForStates.details);
        } else {
            setStatesList([]);
        }

    };
    const fetchTownList = async (countryCode?: string) => {
        try {
            const response= await CardsModuleService.getCardCountriesTowns(cardId, countryCode) as ApiResponse<TownsList[]> ;
            if (response?.data) {
                setTownsList(response?.data)
            } else {
                setErrormsg(isErrorDispaly(response))
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error))
        }
    }
    const handleCountry = (country?: string, setFieldValue?: (field: string, value: string) => void) => {
        const reqList = keyRequirements?.split(",")?.map((item: string) => item?.trim()?.toLowerCase()) ?? [];
        if (setFieldValue && country) {
            setFieldValue(FORM_DATA_CONSTANTS.COUNTRY, country);
            if (reqList?.includes("idtypes")) {
                setFieldValue(FORM_DATA_CONSTANTS.ID_TYPE, "");
            }
        }
        fetchDocuments(country);

    }

    const handleCoutryIdTypeChange = (documentType?: string, setFieldValue?: (field: string, value: string | boolean) => void) => {
        if (setFieldValue) {
            setFieldValue(FORM_DATA_CONSTANTS.ID_NUMBER, "");
            setFieldValue(FORM_DATA_CONSTANTS.DOC_EXPIRY_DATE, "");
            setFieldValue(FORM_DATA_CONSTANTS.PROFILE_PIC_FORNT, "")
            setFieldValue(FORM_DATA_CONSTANTS.PROFILE_PIC_BACK, "")
            setFieldValue(FORM_DATA_CONSTANTS.ISSUE_DATE, "")
            const filteredDocumenType = countryIdType.filter(item => item.name === documentType)
                .map(({ code, isDocumentsRequriedOrNot }) => ({ code, isDocumentsRequriedOrNot }))[0] || null;
            if (documentType) {
                setFieldValue(FORM_DATA_CONSTANTS.ID_TYPE, documentType);
            }
            if (filteredDocumenType) {
                setFieldValue(FORM_DATA_CONSTANTS.IS_DOCUMENT_REQUIRED_OR_NOT, filteredDocumenType?.isDocumentsRequriedOrNot);
                setFieldValue(FORM_DATA_CONSTANTS.DOCUMENT_TYPE_CODE, filteredDocumenType?.code);
            }
        }
    }
    const kycRequirementsDetails: { [key: string]: JSX.Element | undefined } = {
        fullname: (
            <View>
                <Field
                    touched={touched.firstName}
                    name={FORM_DATA_CONSTANTS.FIRST_NAME}
                    label={"GLOBAL_CONSTANTS.FIRST_NAME"}
                    error={errors.firstName}
                    handleBlur={handleBlur}
                    customContainerStyle={{}}
                    placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"}
                    component={InputDefault}
                    maxLength={30}
                    innerRef={kycDetailsRef?.current?.firstName}
                    requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

                />
                <View style={commonStyles.formItemSpace} />
                <Field
                    touched={touched.lastName}
                    name={FORM_DATA_CONSTANTS.LAST_NAME}
                    label={"GLOBAL_CONSTANTS.LAST_NAME"}
                    error={errors.lastName}
                    handleBlur={handleBlur}
                    customContainerStyle={{}}
                    placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"}
                    component={InputDefault}
                    maxLength={30}
                    innerRef={kycDetailsRef?.current?.lastName}
                    requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

                />

                <View style={[commonStyles.formItemSpace]} />
                <DatePickerComponent name={FORM_DATA_CONSTANTS.DOB} label={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"} maximumDate={maxDate} />
                <View style={commonStyles.formItemSpace} />
                <LabelComponent text={"GLOBAL_CONSTANTS.GENDER"} style={[commonStyles.mb10, commonStyles.textWhite]}> <LabelComponent text={"*"} style={commonStyles.textError} /></LabelComponent>
                <RadioButton
                    options={genderPickerData}
                    selectedOption={values?.gender || formData?.gender}
                    onSelect={(val: string) => setFieldValue(FORM_DATA_CONSTANTS.GENDER, val)}
                    nameField='name'
                    valueField='name'
                    innerRef={kycDetailsRef?.current?.gender}
                    touched={touched?.gender}
                />
                {errors?.gender && touched?.gender && (
                    <ParagraphComponent
                        style={[
                            commonStyles.fs14,
                            commonStyles.fw400,
                            commonStyles.textError,
                            { marginLeft: 0 },
                        ]}
                        text={errors?.gender}
                    />
                )}
                <View style={[commonStyles.formItemSpace]} />

                <Field
                    label={"GLOBAL_CONSTANTS.COUNTRY"}
                    touched={touched.country}
                    name={FORM_DATA_CONSTANTS.COUNTRY}
                    value={values?.country}
                    error={errors?.country}
                    onChange={(e: string) => handleCountry(e, setFieldValue)}
                    component={CustomPicker}
                    data={countries}
                    placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                    innerRef={kycDetailsRef?.current?.country}
                    requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                />

            </View>),
        fullnameonly: (<View style={[]}>
            <Field
                touched={touched.firstName}
                name={FORM_DATA_CONSTANTS.FIRST_NAME}
                label={"GLOBAL_CONSTANTS.FIRST_NAME"}
                error={errors.firstName}
                handleBlur={handleBlur}
                customContainerStyle={{}}
                placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"}
                component={InputDefault}
                maxLength={30}
                innerRef={kycDetailsRef?.current?.firstName}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

            />
            <View style={commonStyles.formItemSpace} />
            <Field
                touched={touched.lastName}
                name={FORM_DATA_CONSTANTS.LAST_NAME}
                label={"GLOBAL_CONSTANTS.LAST_NAME"}
                error={errors.lastName}
                handleBlur={handleBlur}
                customContainerStyle={{}}
                placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"}
                component={InputDefault}
                maxLength={30}
                innerRef={kycDetailsRef?.current?.lastName}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

            />

        </View>),
        comms: (<View style={[]}>
            <Field
                touched={touched.email}
                name={FORM_DATA_CONSTANTS.EMAIL}
                label={"GLOBAL_CONSTANTS.E_MAIL"}
                error={errors?.email}
                handleBlur={handleBlur}
                customContainerStyle={{}}
                placeholder={"GLOBAL_CONSTANTS.ENTER_EMAIL"}
                component={InputDefault}
                maxLength={50}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

            />
            <View style={commonStyles.formItemSpace} />

            <LabelComponent
                text={"GLOBAL_CONSTANTS.MOBILE_NO"}
                style={[
                    commonStyles.inputLabel,
                ]}
            ><LabelComponent text={"*"} style={commonStyles.textError} /></LabelComponent>
            <View style={[commonStyles.relative, commonStyles.dflex]}>
                <PhoneCodePicker
                    inputStyle={{ borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderColor: touched?.phoneCode && errors?.phoneCode ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }}
                    modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"}

                    customBind={["name", "(", "code", ")"]}
                    data={phoneCodePickerData}
                    value={values.mobileCode}
                    placeholder={"GLOBAL_CONSTANTS.SELECT"}
                    containerStyle={[]}
                    isOnlycountry={true}

                    onChange={(item: string) =>
                        setFieldValue(FORM_DATA_CONSTANTS.MOBILE_CODE, item || "")
                    }
                />
                <TextInput
                    style={[commonStyles.flex1, commonStyles.input, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderColor: touched?.phoneNumber && errors?.phoneNumber ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }]}
                    placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                    onChangeText={handleChange(FORM_DATA_CONSTANTS.MOBILE)}
                    onBlur={handleBlur(FORM_DATA_CONSTANTS.MOBILE)}
                    value={values.mobile}
                    keyboardType={"phone-pad"}
                    maxLength={10}
                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                    multiline={false}
                    ref={kycDetailsRef?.current?.mobile}
                />


            </View>
            {(errors.mobileCode || errors.mobile) && <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginTop: 4 }]} text={(errors.mobile || errors.mobileCode)} />}

        </View>),
        passport: (<View style={[]}>
            <Field
                activeOpacity={0.9}
                innerRef={kycDetailsRef?.current?.idType}
                style={{
                    color: "transparent",
                    backgroundColor: "transparent",
                }}
                label={"GLOBAL_CONSTANTS.DOCUMENT_TYPE"}
                touched={touched.idType}
                name={FORM_DATA_CONSTANTS.ID_TYPE}
                error={errors.idType}
                handleBlur={handleBlur}
                customContainerStyle={{
                    height: s(80),
                }}
                value={values.idType || FORM_DATA_CONSTANTS.PASSPORT}
                data={[{ label: "Passport", name: "Passport" }]}
                placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                modalTitle={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                component={CustomPicker}
                disabled={true}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

            />
            <View style={commonStyles.formItemSpace} />
            <Field
                activeOpacity={0.9}
                touched={touched.idNumber}
                name={FORM_DATA_CONSTANTS.ID_NUMBER}
                label={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"}
                error={errors.idNumber}
                value={values?.idNumber}
                handleBlur={handleBlur}
                customContainerStyle={{
                    height: s(80),
                }}
                onHandleChange={(text: string) => {
                    const formattedText = text
                        ?.replace(/[^a-zA-Z0-9]/g, "")
                        ?.toUpperCase();
                    handleChange(FORM_DATA_CONSTANTS.ID_NUMBER)(formattedText);
                }}
                placeholder={"GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"}
                component={InputDefault}
                maxLength={16}
                innerRef={kycDetailsRef?.current?.docNumber}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

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
            <View style={commonStyles.formItemSpace} />

            <FileUpload
                fileLoader={loadingState.profilePicFront}
                onSelectImage={(source) => handleImageUpload(FORM_DATA_CONSTANTS.PROFILE_PIC_FORNT, setFieldValue, source)}
                uploadedImageUri={values?.profilePicFront}
                fileName={fileNames?.profilePicFront}
                errorMessage={touched?.profilePicFront && errors?.profilePicFront}
                deleteImage={() => deleteImages("profilePicFront")}
                label={"GLOBAL_CONSTANTS.UPLOAD_YOUR_FRONT_DOCUMET"}
                isRequired={true}
                showImageSourceSelector={true}

            />
            {/* <View style={commonStyles.formItemSpace} />
            <FileUpload
                fileLoader={loadingState.profilePicBack}
                onSelectImage={(source) => handleImageUpload(FORM_DATA_CONSTANTS.PROFILE_PIC_BACK, setFieldValue, source)}
                uploadedImageUri={values?.profilePicBack}
                fileName={fileNames?.profilePicBack}
                errorMessage={touched?.profilePicBack && errors?.profilePicBack}
                deleteImage={() => deleteImages('profilePicBack')}
                label={"GLOBAL_CONSTANTS.UPLOAD_BACK_DOCUMET"}
                isRequired={true}
                showImageSourceSelector={true}
            /> */}
            {/* <View style={commonStyles.formItemSpace} /> */}


            {/* <View style={commonStyles.formItemSpace} /> */}


        </View>),
        passportonly: (<View style={[]}>
            <Field
                activeOpacity={0.9}
                innerRef={kycDetailsRef?.current?.idType}
                style={{
                    color: "transparent",
                    backgroundColor: "transparent",
                }}
                label={"GLOBAL_CONSTANTS.DOCUMENT_TYPE"}
                touched={touched.idType}
                name={FORM_DATA_CONSTANTS.ID_TYPE}
                error={errors.idType}
                handleBlur={handleBlur}
                customContainerStyle={{
                    height: s(80),
                }}
                value={values.idType || FORM_DATA_CONSTANTS.PASSPORT}
                data={[{ label: "Passport", name: "Passport" }]}
                placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                modalTitle={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                component={CustomPicker}
                disabled={true}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

            />
            <View style={commonStyles.formItemSpace} />
            <Field
                activeOpacity={0.9}
                touched={touched.idNumber}
                name={FORM_DATA_CONSTANTS.ID_NUMBER}
                label={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"}
                error={errors.idNumber}
                value={values?.idNumber}
                handleBlur={handleBlur}
                customContainerStyle={{
                    height: s(80),
                }}
                onHandleChange={(text: string) => {
                    const formattedText = text
                        ?.replace(/[^a-zA-Z0-9]/g, "")
                        ?.toUpperCase();
                    handleChange('idNumber')(formattedText);
                }}
                placeholder={"GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"}
                component={InputDefault}
                maxLength={16}
                innerRef={kycDetailsRef?.current?.docNumber}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

            />

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

            />
            {/* <View style={commonStyles.formItemSpace} />

            <FileUpload
                fileLoader={loadingState.profilePicBack}
                onSelectImage={(source) => handleImageUpload(FORM_DATA_CONSTANTS.PROFILE_PIC_BACK, setFieldValue, source)}
                uploadedImageUri={values?.profilePicBack}
                fileName={fileNames?.profilePicBack}
                errorMessage={touched?.profilePicBack && errors?.profilePicBack}
                deleteImage={() => deleteImages('profilePicBack')}
                label={"GLOBAL_CONSTANTS.UPLOAD_BACK_DOCUMET"}
                isRequired={true}
                showImageSourceSelector={true}
            /> */}

        </View>),
        emergencycontact: (<View style={[]}>
            <Field
                touched={touched.emergencyContactName}
                name={FORM_DATA_CONSTANTS.EMERGENCY_CONTACT_NAME}
                label={"GLOBAL_CONSTANTS.EMERGENCY_CONTACT_NAME"}
                error={errors.emergencyContactName}
                handleBlur={handleBlur}
                customContainerStyle={{}}
                placeholder={"GLOBAL_CONSTANTS.ENTER_EMERGENCY_CONTACT_NAME"}
                component={InputDefault}
                maxLength={30}
                innerRef={kycDetailsRef?.current?.emergencyContactName}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

            />
        </View>),
        address: (<View style={[]}>
            <AddressFields
                t={t}
                values={values}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                handleBlur={handleBlur}
                handleAddAddress={handleAddAddress}
                addresses={addresses}
                countries={countryPickerData}
                statesList={statesListInfo}
                townsList={townsList}
                kycDetailsRef={kycDetailsRef}
                type="address"
                handleAddress={handleAddress}
                handleAddressCountry={handleAddressCountry}

            />
        </View>),
        fulladdress: (<View style={[]}>
            <AddressFields
                t={t}
                values={values}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                handleBlur={handleBlur}
                handleAddAddress={handleAddAddress}
                addresses={addresses}
                countries={countryPickerData}
                statesList={statesListInfo}
                townsList={townsList}
                kycDetailsRef={kycDetailsRef}
                type="fulladdress"
                handleAddress={handleAddress}
                handleAddressCountry={handleAddressCountry}

            />


        </View>
        ),
        financialprofile: (
            <View style={[]}>
                <Field
                    activeOpacity={0.9}
                    style={{
                        backgroundColor: 'NEW_COLOR.SCREENBG_WHITE',
                        borderColor: 'NEW_COLOR.SEARCH_BORDER',
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
                    component={CustomPicker}
                    innerRef={kycDetailsRef?.current?.occupation}
                    requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

                />
                <View style={[commonStyles.formItemSpace]} />
                <Field
                    touched={touched.annualSalary}
                    name={FORM_DATA_CONSTANTS.ANNUAL_SALARY}
                    label={FORM_DATA_LABEL.ANNUAL_SALARY}
                    error={errors.annualSalary}
                    handleBlur={handleBlur}
                    keyboardType={"numeric"}
                    customContainerStyle={{}}
                    placeholder={FORM_DATA_PLACEHOLDER.ENTER_ANNUAL_SALARY}
                    component={InputDefault}
                    innerRef={kycDetailsRef?.current?.annualSalary}
                    maxLength={10}

                    requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

                />
                <View style={[commonStyles.formItemSpace]} />
                <Field
                    touched={touched.accountPurpose}
                    name={FORM_DATA_CONSTANTS.ACCOUNT_PURPOSE}
                    label={FORM_DATA_LABEL.ACCOUNT_PURPOSE}
                    error={errors.accountPurpose}
                    handleBlur={handleBlur}
                    customContainerStyle={{}}
                    placeholder={FORM_DATA_PLACEHOLDER.ENTER_ACCOUNT_PURPOSE}
                    component={InputDefault}
                    innerRef={kycDetailsRef?.current?.accountPurpose}
                    requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

                />
                <View style={[commonStyles.formItemSpace]} />
                <Field
                    touched={touched.expectedMonthlyVolume}
                    name={FORM_DATA_CONSTANTS.EXPECTED_MONTHLY_VOLUME}
                    label={FORM_DATA_LABEL.EXPECTED_MONTHLY_VOLUME}
                    error={errors.expectedMonthlyVolume}
                    handleBlur={handleBlur}
                    customContainerStyle={{}}
                    keyboardType={"numeric"}
                    placeholder={FORM_DATA_PLACEHOLDER.ENTER_EXCEPTED_MONTHLY_VOLUME}
                    component={InputDefault}
                    maxLength={10}
                    innerRef={kycDetailsRef?.current?.expectedMonthlyVolume}
                    requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

                />
            </View>),
        face: (<>
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

            />
        </>),

        sign: (<View style={[]}>
            <FileUpload
                onSelectImage={() => setIsSignatureDrawerVisible(true)}
                uploadedImageUri={values?.signature}
                errorMessage={errors.signature && touched.signature ? errors.signature : ''}
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
                activeOpacity={0.9}
                innerRef={kycDetailsRef?.current?.idType}
                style={{
                    color: "transparent",
                    backgroundColor: "transparent",
                }}
                label={"GLOBAL_CONSTANTS.DOCUMENT_TYPE"}
                touched={touched.idType}
                name={FORM_DATA_CONSTANTS.ID_TYPE}
                error={errors.idType}
                handleBlur={handleBlur}
                customContainerStyle={{
                    height: s(80),
                }}
                value={values.idType || FORM_DATA_CONSTANTS.PASSPORT}
                data={values?.isdocTypeBasedOnCountry ? countryIdType : cardDocType}
                onChange={(item: string) => handleCoutryIdTypeChange(item, setFieldValue)}
                placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                modalTitle={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                component={CustomPicker}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

            />

            {["passport", "driverslicense", "nationalid", "hongkongid"].includes(
                values?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim()) && (<> <View style={commonStyles.formItemSpace} />
                    <Field
                        activeOpacity={0.9}
                        touched={touched.idNumber}
                        name={FORM_DATA_CONSTANTS.ID_NUMBER}
                        label={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"}
                        error={errors.idNumber}
                        value={values?.idNumber}
                        handleBlur={handleBlur}
                        customContainerStyle={{
                            height: s(80),
                        }}
                        onHandleChange={(text: string) => {
                            const formattedText = text
                                ?.replace(/[^a-zA-Z0-9]/g, "")
                                ?.toUpperCase();
                            handleChange('idNumber')(formattedText);
                        }}
                        placeholder={"GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"}
                        component={InputDefault}
                        maxLength={16}
                        innerRef={kycDetailsRef?.current?.docNumber}
                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

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

            {["passport", "driverslicense", "nationalid", "hongkongid"].includes(
                values?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim()) && (<><View style={commonStyles.formItemSpace} />
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

                    /></>)}
            {["driverslicense", "nationalid", "hongkongid"].includes(
                values?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim()) && (<> <View style={commonStyles.formItemSpace} />

                    <FileUpload
                        fileLoader={loadingState.profilePicBack}
                        onSelectImage={(source) => handleImageUpload(FORM_DATA_CONSTANTS.PROFILE_PIC_BACK, setFieldValue, source)}
                        uploadedImageUri={values?.profilePicBack}
                        fileName={fileNames?.profilePicBack}
                        errorMessage={touched?.profilePicBack && errors?.profilePicBack}
                        deleteImage={() => deleteImages('profilePicBack')}
                        label={"GLOBAL_CONSTANTS.UPLOAD_BACK_DOCUMET"}
                        isRequired={true}
                        showImageSourceSelector={true}
                    /></>)}




        </View>),

    }



    return (
        <SafeAreaView>
            <KeyboardAvoidingView>
                <View>
                    {errormsg && (<ErrorComponent message={errormsg} onClose={handleErrorComonent} />)}
                    <View style={[]}>
                        {kycReqList.map((kycKey) => {
                            const label = titleMapping[kycKey];
                            return (
                                <View key={kycKey} style={[commonStyles.sectionGap]}>
                                    {label && (<ParagraphComponent text={`${label}`} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
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
                <AddCardsAddress
                    isVisible={isAddAddressModalVisible}
                    onClose={handleCloseAddAddressModal}
                    onSaveSuccess={handleAddressSaveSuccess} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
};

export default KycAddress;