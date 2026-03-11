import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, BackHandler, Platform, KeyboardAvoidingView } from 'react-native';
import { CommonActions, useIsFocused, useNavigation } from '@react-navigation/native';
import { formatYearMonthDate, formatDateTimeAPI, isErrorDispaly } from '../../../../../utils/helpers';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { s } from '../../../../../constants/styels/scale';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { allTransactionList } from '../../../../../skeletons/skeltonViews';
import Container from '../../../../../components/container/container';
import { useSelector, useDispatch } from 'react-redux';
import { setKybApplyCardData, setUboFormData } from '../../../../../redux/actions/actions';
import NoDataComponent from '../../../../../components/noData/noData';
import ProgressHeader from '../../../../../components/progressCircle/progressHeader';
import useMemberLogin from '../../../../../hooks/userInfoHook';
import ViewComponent from '../../../../../components/view/view';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ButtonComponent from '../../../../../components/buttons/button';
import UploadDeleteIcon from '../../../../../components/svgIcons/mainmenuicons/deleteicon';
import DashboardLoader from '../../../../../components/loader';
import Loadding from '../../../../../components/skelton/skeltons';
import EditIcon from '../../../../../components/svgIcons/mainmenuicons/edit';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import { Formik } from 'formik';
import { PersonalDetails, UboDirectorItem, ReduxState, Sector, Type, StateList, CountryWithDetails, } from '../interface';
import { AddressValidationSchema } from './constant'
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import CommonSuccess from '../../../../commonScreens/successPage/commonSucces';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import DeleteMembersIcon from '../../../../../components/svgIcons/mainmenuicons/deleteitems';
import InfoTooltip from '../../../../../components/tooltip/InfoTooltip';
import {
    fetchSectorsAndTypes, fetchDefaultAddresses, getPersionalDetails, getRequirements, getUboData, getDirectorData, getRepresentativeData, hasUbo,
    hasDirector, validateDocuments, validateUbos, validateDirectors, validateRepresentatives, validateAddresses, validateSharePercentages, validateFormFields, handleDirectSubmit,
    fetchCounriesLookup, fetchDocuments, getListOfCountryCodeDetails, fetchLookUps, fetchUBODeatilsLookup, fetchCardsDocTypes
} from './kybservice';
import KybAddressFeilds from './kybAddressFeilds';
import { CountryIdTypesInterface, FORM_DATA_CONSTANTS } from '../constants';
import PersonalFields from './personalFeilds';
import AddCardsAddress from '../apply_card_kyc/addCardsKycAddress';
import moment from 'moment';
import * as Yup from 'yup';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import { addressesDetailsInterface, addressesInterface, countriesInterface, CountryCodeInterface, CurrentFormValuesInterface, documentTypesInterface, payloadInterface } from './interface';
import CompanyFields from './companyFeilds';
import UboUploadDeleteIcon from '../../../../../components/svgIcons/mainmenuicons/ubopdelete';
import CardsModuleService from '../../../../../apiServices/cards';


const RequiredLabel = ({ text, style }: { text: string, style?: any, multiLanguageAllows?: boolean }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return (
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
            <TextMultiLanguage style={style} text={text} />
            <ParagraphComponent style={[commonStyles.textred, commonStyles.fs14]}>*</ParagraphComponent>
        </ViewComponent>
    );
};
const CardsKybInfoPreview = (props: any) => {
    const isFocused = useIsFocused();
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [persionalDetails, setPersionalDetails] = useState<PersonalDetails>({});
    const [selectedSector, setSelectedSector] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    const skeltons = allTransactionList(10);
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const userinfo = useSelector((state: ReduxState) => state.userReducer?.userDetails);
    const ref = useRef<any>(null);
    const navigation = useNavigation<any>();
    const { getMemDetails } = useMemberLogin();
    const { decryptAES, encryptAES } = useEncryptDecrypt();
    const { t } = useLngTranslation();
    const [countryCodelist, setCountryCodelist] = useState<CountryCodeInterface[]>([]);
    const [isAddAddressModalVisible, setIsAddAddressModalVisible] = useState(false);
    const [documentTypesLookUp, setDocumentTypesLookUp] = useState<documentTypesInterface[]>([]);
    const [countryIdType, setCountryIdType] = useState<CountryIdTypesInterface[]>([]);
    const formikRef = useRef<any>(null);

    const [formInitialValues, setFormInitialValues] = useState<any>({
        // Address fields
        state: "", postalCode: "", addressLine1: "", addressLine2: "", address: "", country: "", city: "", addressType: "", addressCountry: "",
        // Company fields
        companyName: "", type: "", description: "", industry: "", registrationNumber: "", taxId: "", website: "", shareholderRegistry: "", certificateofincorporation: "",
        // Company address fields
        companyAddress: "", companyAddressLine1: "", companyAddressLine2: "", companyAddressType: "", companyCity: "", companyState: "", companyAddressCountry: "", companyPostalCode: "",
        // Personal information fields
        firstName: "", lastName: "", dateOfBirth: null, phoneCode: "", phoneNumber: "", email: "", idType: "", docIssueDate: null,
        docExpireDate: null, idNumber: "", profilePicFront: null, profilePicBack: null, countryOfIssue: "", ubo: "", gender: null
    });

    const [KybFeildInitialValues, setKybFeildInitialValues] = useState<any>({
        // Address fields
        state: "", postalCode: "", addressLine1: "", addressLine2: "", address: "", country: "", city: "", addressType: "", addressCountry: "",
        // Company fields
        companyName: "", type: "", description: "", industry: "", registrationNumber: "", taxId: "", website: "", shareholderRegistry: "", certificateofincorporation: "",
        // Company address fields
        companyAddress: "", companyAddressLine1: "", companyAddressLine2: "", companyAddressType: "", companyCity: "", companyState: "", companyAddressCountry: "", companyPostalCode: "",
        // Personal information fields
        firstName: "", lastName: "", dateOfBirth: null, phoneCode: "", phoneNumber: "", email: "", idType: "", docIssueDate: null,
        docExpireDate: null, idNumber: "", profilePicFront: null, profilePicBack: null, countryOfIssue: "", ubo: "", gender: null
    });
    const safeDecrypt = (data: string | undefined): string => {
        if (!data) return '';
        return decryptAES(data);
    };
    const dispatch = useDispatch();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    // Redux selectors for UBO/Director/Representative form data
    const uboFormDataList = useSelector((state: ReduxState) => (state.userReducer as any)?.uboCardFormData || []);
    const directorFormDataList = useSelector((state: ReduxState) => (state.userReducer as any)?.directorCardFormData || []);
    const representativeFormDataList = useSelector((state: ReduxState) => (state.userReducer as any)?.representativeFormDataList || []);
    const { selectedBank, selectedAddresses, documentsData, hasAccountCreationFee, /* ipAddress: storedIpAddress - IP functionality disabled */ deletedCardsApiItems, sectors: storedSector, types: storedType } = useSelector((state: ReduxState) => state.userReducer);
    // Use correct field name for deleted items
    const deletedApiItems = deletedCardsApiItems || [];
    const isReapply = useSelector((state: ReduxState) => (state.userReducer as any)?.isReapply || false);
    // Selected item for edit/delete operations (UBO/Director/Representative)
    const [selectedItem, setSelectedItem] = useState<UboDirectorItem | null>(null);
    const actionSheetRef = useRef<any>(null);
    const deleteConfirmSheetRef = useRef<any>(null);
    const sectorTypeSheetRef = useRef<any>(null);
    const successSheetRef = useRef<any>(null);
    const [countries, setCountries] = useState<countriesInterface[]>([]);
    const [uboCountries, setUboCountries] = useState<any>([]);
    const [statesList, setStatesList] = useState<StateList[]>([]);
    const [addresses, setAddresses] = useState<addressesInterface[]>([]);
    const [countriesWithStates, setCountriesWithStates] = useState<CountryWithDetails[]>([]);
    const [addressesDetails, setAddressesDetails] = useState<addressesDetailsInterface[]>([]);
    const [currentFormValues, setCurrentFormValues] = useState<CurrentFormValuesInterface>({});
    const currentFormValuesRef = useRef<any>({});
    const kybRequriments = persionalDetails?.kyb?.kycRequirements
    const ACCORDION_KEYS = { UBO: 'UBO', DIRECTORS: 'DIRECTORS', REPRESENTATIVES: 'REPRESENTATIVES' };
    const [openAccordion, setOpenAccordion] = useState(ACCORDION_KEYS.UBO);
    const [cardDocTypes, setCardDocType] = useState<any>([])
    const [uboList, setUboList] = useState([]);
    const acceptedTerms = useSelector((state: any) => state.userReducer?.acceptedTerms);

    const handleToggleAccordion = (key: any) => {
        setOpenAccordion(prevKey => (prevKey === key ? null : key));
    };
    useEffect(() => {
        const apiSector = persionalDetails?.kyb?.company?.industry;
        const apiType = persionalDetails?.kyb?.company?.type;
        if (apiSector && !selectedSector) {
            setSelectedSector(apiSector);
            dispatch({ type: 'SET_CARDS_SECTORS', payload: apiSector });
        } else if (storedSector && !selectedSector) {
            setSelectedSector(storedSector);
        }
        if (apiType && !selectedType) {
            setSelectedType(apiType);
            dispatch({ type: 'SET_CARDS_TYPES', payload: apiType });
        } else if (storedType && !selectedType) {
            setSelectedType(storedType);
        }
    }, [persionalDetails, storedSector, storedType, selectedSector, selectedType, dispatch]);

    useEffect(() => {
        const resultUbo: any = getUboData(uboFormDataList, persionalDetails, deletedApiItems);
        setUboList(resultUbo);
        const matchUboDetails = resultUbo.find(
            (ubo: any) => ubo?.recordStatus?.toLowerCase() === "modified"
        );
        if (matchUboDetails?.firstName?.toLowerCase() === formikRef?.current?.values?.ubo?.toLowerCase()) {
            handleUboChange(matchUboDetails?.firstName, formikRef?.current?.setFieldValue);
        }

    }, [uboFormDataList, persionalDetails, deletedApiItems]);

    useEffect(() => {
        if (selectedType || selectedSector) {
            setFormInitialValues((prev: any) => ({
                ...prev,
                type: selectedType || prev.type || "",
                industry: selectedSector || prev.industry || ""
            }));
            setKybFeildInitialValues((prev: any) => ({
                ...prev,
                type: selectedType || prev.type || "",
                industry: selectedSector || prev.industry || ""
            }));
        }
    }, [selectedType, selectedSector]);

    useEffect(() => {
        if (Object.keys(formInitialValues).length > 0) {
            currentFormValuesRef.current = { ...formInitialValues };
            setCurrentFormValues({ ...formInitialValues });
        }
    }, [formInitialValues]);
    useEffect(() => {
        getPersionalDetails(selectedBank, setPersionalDetails, setErrormsg, setLoadingData, props.route.params.cardId);
        fetchSectorsAndTypes(setSectors, setTypes, setErrormsg, t);
        fetchDefaultAddresses(dispatch, setErrormsg, setAddresses, setAddressesDetails, (defaultAddress: any, addressesList?: any, addressesDetailsInfo?: any) => {
            if (defaultAddress) {
                // Set default addresses without calling handlers to avoid losing data
                const address = addressesList?.find((item: any) => item?.name === defaultAddress);
                const addressDetail = addressesDetailsInfo?.find((addr: any) => addr?.id === address?.id);
                if (addressDetail) {
                    setFormInitialValues((prev: any) => ({
                        ...prev,
                        // Personal address
                        city: addressDetail?.city || "",
                        state: addressDetail?.state || "",
                        addressCountry: addressDetail?.country || "",
                        postalCode: decryptAES(addressDetail?.postalCode) || "",
                        addressLine1: addressDetail?.addressLine1 || "",
                        addressLine2: addressDetail?.addressLine2 || "",
                        address: defaultAddress,
                        // Company address
                        companyCity: addressDetail?.city || "",
                        companyState: addressDetail?.state || "",
                        companyAddressCountry: addressDetail?.country || "",
                        companyPostalCode: decryptAES(addressDetail?.postalCode) || "",
                        companyAddressLine1: addressDetail?.addressLine1 || "",
                        companyAddressLine2: addressDetail?.addressLine2 || "",
                        companyAddress: defaultAddress,
                    }));
                }

                if (addressDetail) {
                    setKybFeildInitialValues((prev: any) => ({
                        ...prev,
                        // Personal address
                        city: addressDetail?.city || "",
                        state: addressDetail?.state || "",
                        addressCountry: addressDetail?.country || "",
                        postalCode: decryptAES(addressDetail?.postalCode) || "",
                        addressLine1: addressDetail?.addressLine1 || "",
                        addressLine2: addressDetail?.addressLine2 || "",
                        address: defaultAddress,
                        // Company address
                        companyCity: addressDetail?.city || "",
                        companyState: addressDetail?.state || "",
                        companyAddressCountry: addressDetail?.country || "",
                        companyPostalCode: decryptAES(addressDetail?.postalCode) || "",
                        companyAddressLine1: addressDetail?.addressLine1 || "",
                        companyAddressLine2: addressDetail?.addressLine2 || "",
                        companyAddress: defaultAddress,
                    }));
                }
            }
        });
        fetchLookUps(setDocumentTypesLookUp, setStatesList, setCountriesWithStates, setErrormsg, persionalDetails, ref);
        fetchCounriesLookup(setCountries, setErrormsg, (country: string) => fetchDocuments(setCountryIdType, setErrormsg, country), formInitialValues, ref);
        fetchUBODeatilsLookup(setUboCountries, setErrormsg, (country: string) => fetchDocuments(setCountryIdType, setErrormsg, country), formInitialValues, ref);
        getListOfCountryCodeDetails(setCountryCodelist, setErrormsg, ref);
        fetchCardsDocTypes(setCardDocType, setErrormsg)
    }, [isFocused, uboFormDataList, directorFormDataList]);

    useEffect(() => {
        if (persionalDetails && Object.keys(persionalDetails).length > 0) {
            const companyAddr = persionalDetails?.kyb?.company?.companyAddress;
            const kybPersonalDetails = persionalDetails?.kyb?.personaldetails;
            const personalAddr = kybPersonalDetails?.personalInfoAddress;
            const personalIdentification = kybPersonalDetails?.identification;
            setFormInitialValues((prev: any) => ({
                ...prev,
                companyName: persionalDetails?.kyb?.company?.companyName ? safeDecrypt(persionalDetails.kyb.company.companyName) : prev.companyName || "",
                registrationNumber: persionalDetails?.kyb?.company?.registrationNumber ? safeDecrypt(persionalDetails.kyb.company.registrationNumber) : prev.registrationNumber || "",
                taxId: persionalDetails?.kyb?.company?.taxId || prev.taxId || "",
                website: persionalDetails?.kyb?.company?.website || prev.website || "",
                description: persionalDetails?.kyb?.company?.description || prev.description || "",
                type: persionalDetails?.kyb?.company?.type || selectedType || prev.type || "",
                industry: persionalDetails?.kyb?.company?.industry || selectedSector || prev.industry || "",
                shareholderRegistry: persionalDetails?.kyb?.company?.shareholderregistry || documentsData?.shareholderregistry || prev.shareholderRegistry || "",
                certificateofincorporation: persionalDetails?.kyb?.company?.certificateofincorporation || documentsData?.certificateofincorporation || prev.certificateOfIncorporation || "",
                companyAddress: prev.companyAddress || companyAddr?.addressType || "",
                companyAddressLine1: prev.companyAddressLine1 || companyAddr?.line1 || "",
                companyAddressLine2: prev.companyAddressLine2 || companyAddr?.line2 || "",
                companyCity: prev.companyCity || companyAddr?.city || "",
                companyState: prev.companyState || companyAddr?.state || "",
                companyAddressCountry: prev.companyAddressCountry || companyAddr?.country || "",
                companyPostalCode: prev.companyPostalCode || companyAddr?.postalCode || "",
                country: kybPersonalDetails?.country || persionalDetails?.kyc?.basic?.country || prev.country || "",
                firstName: kybPersonalDetails?.firstName || (kybPersonalDetails?.firstName ? safeDecrypt(kybPersonalDetails?.firstName) : prev.firstName) || "",
                lastName: kybPersonalDetails?.lastName || (kybPersonalDetails?.lastName ? safeDecrypt(kybPersonalDetails?.lastName) : prev.lastName) || "",
                gender: kybPersonalDetails?.gender || prev.gender,
                dateOfBirth: kybPersonalDetails?.dateOfBirth || (kybPersonalDetails?.dateOfBirth ? moment(kybPersonalDetails?.dateOfBirth).format('YYYY-MM-DD') : prev.dateOfBirth) || "",
                email: kybPersonalDetails?.email || prev.email || "",
                phoneCode: kybPersonalDetails?.phoneCode || (kybPersonalDetails?.phoneCode ? safeDecrypt(kybPersonalDetails?.phoneCode) : prev.phoneCode) || "",
                phoneNumber: kybPersonalDetails?.phoneNumber || (kybPersonalDetails?.phoneNumber ? safeDecrypt(kybPersonalDetails?.phoneNumber) : prev.phoneNumber) || "",
                idType: personalIdentification?.idType || prev.idType || "",
                idNumber: personalIdentification?.idNumber || prev.idNumber || "",
                docIssueDate: personalIdentification?.docIssueDate || prev.docIssueDate || "",
                docExpireDate: personalIdentification?.docExpireDate || prev.docExpireDate || "",
                profilePicFront: personalIdentification?.frontDocument || prev.profilePicFront || "",
                profilePicBack: personalIdentification?.backDocument || prev.profilePicBack || "",
                countryOfIssue: personalIdentification?.countryOfIssue || prev.countryOfIssue || "",
                city: prev.city || personalAddr?.city || "",
                state: prev.state || personalAddr?.state || "",
                addressCountry: prev.addressCountry || personalAddr?.country || "",
                postalCode: prev.postalCode || (personalAddr?.postalCode ? safeDecrypt(personalAddr.postalCode) : ""),
                addressLine1: prev.addressLine1 || personalAddr?.line1 || "",
                addressLine2: prev.addressLine2 || personalAddr?.line2 || "",
                address: prev.address || (personalAddr ? prev.addresss : ""),
            }));
            setKybFeildInitialValues((prev: any) => ({
                ...prev,
                companyName: persionalDetails?.kyb?.company?.companyName ? safeDecrypt(persionalDetails.kyb.company.companyName) : prev.companyName || "",
                registrationNumber: persionalDetails?.kyb?.company?.registrationNumber ? safeDecrypt(persionalDetails.kyb.company.registrationNumber) : prev.registrationNumber || "",
                taxId: persionalDetails?.kyb?.company?.taxId || prev.taxId || "",
                website: persionalDetails?.kyb?.company?.website || prev.website || "",
                description: persionalDetails?.kyb?.company?.description || prev.description || "",
                type: persionalDetails?.kyb?.company?.type || selectedType || prev.type || "",
                industry: persionalDetails?.kyb?.company?.industry || selectedSector || prev.industry || "",
                shareholderRegistry: persionalDetails?.kyb?.company?.shareholderregistry || documentsData?.shareholderregistry || prev.shareholderRegistry || "",
                certificateofincorporation: persionalDetails?.kyb?.company?.certificateofincorporation || documentsData?.certificateofincorporation || prev.certificateOfIncorporation || "",
                companyAddress: prev.companyAddress || companyAddr?.addressType || "",
                companyAddressLine1: prev.companyAddressLine1 || companyAddr?.line1 || "",
                companyAddressLine2: prev.companyAddressLine2 || companyAddr?.line2 || "",
                companyCity: prev.companyCity || companyAddr?.city || "",
                companyState: prev.companyState || companyAddr?.state || "",
                companyAddressCountry: prev.companyAddressCountry || companyAddr?.country || "",
                companyPostalCode: prev.companyPostalCode || companyAddr?.postalCode || "",

            }));
        }
    }, [persionalDetails, selectedSector, selectedType, documentsData]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();

    }, [])
    /**
     * Navigate to UBO/Director/Representative form details screen
     * Handles all three entity types with appropriate mode flags
     */
    const navigateToUboFormDetails = ({
        isDirectorMode = false,
        isRepresentativeMode = false,
        isUboMode = false,
        editId,
        clearForm = false,
        title = '',
        extraProps = {}
    }: {
        isDirectorMode?: boolean;
        isRepresentativeMode?: boolean;
        editId?: string;
        clearForm?: boolean;
        title?: string;
        extraProps?: any;
        isUboMode: boolean,
    }) => {
        closeAllSheetsAndNavigate(() =>
            navigation.navigate('uboFormDetails', {
                isDirectorMode,
                isRepresentativeMode,
                isUboMode,
                editId,
                clearForm,
                animation: 'slide_from_right',
                title,
                ...props,
                ...props?.route?.params,
                ...extraProps
            })
        );
    };
    // --- UBO/Director/Representative Navigation Handlers ---

    /**
     * Navigate to edit Director form
     */
    const handleDirectorsEdit = (id: string): void => {
        navigateToUboFormDetails({
            isDirectorMode: true,
            isUboMode: false,
            editId: id,
            title: "GLOBAL_CONSTANTS.EDIT_DIRECTOR"
        });
    };

    /**
     * Navigate to add new UBO form
     */
    const handleAddUbos = () => {
        navigateToUboFormDetails({
            isUboMode: true,
            title: "GLOBAL_CONSTANTS.ADD_UBO"
        });
    };

    /**
     * Navigate to add new Director form
     */
    const handleAddDirectors = () => {
        navigateToUboFormDetails({
            isDirectorMode: true,
            clearForm: true,
            title: "GLOBAL_CONSTANTS.ADD_DIRECTOR",
            isUboMode: false
        });
    };

    /**
     * Navigate to edit UBO form
     */
    const handleUbosEdit = (id: string): void => {
        navigateToUboFormDetails({
            isUboMode: true,
            editId: id,
            title: "GLOBAL_CONSTANTS.EDIT_UBO"
        });
    };

    /**
     * Navigate to add new Representative form
     */
    const handleAddRepresentatives = () => {
        navigateToUboFormDetails({
            isRepresentativeMode: true,
            clearForm: true,
            title: 'Add Representative',
            isUboMode: false
        });
    };

    /**
     * Navigate to edit Representative form
     */
    const handleRepresentativesEdit = (id: string): void => {
        navigateToUboFormDetails({
            isRepresentativeMode: true,
            editId: id,
            title: 'Edit Representative',
            isUboMode: false
        });
    };
    /**
     * Refresh form data - clears all UBO/Director/Representative data and reloads
     */
    const handleRefresh = useCallback(() => {
        // Clear Redux state for all entity types
        dispatch({ type: 'SET_CARD_UBO_FORM_DATA', payload: [] });
        dispatch({ type: 'SET_CARDS_DIRECTOR_FORM_DATA', payload: [] });
        dispatch({ type: 'SET_CARDS_REPRESENTATIVE_FORM_DATA', payload: [] });
        dispatch({ type: 'SET_CARDS_DOCUMENTS_DATA', payload: null });
        dispatch({ type: 'SET_CARDS_SELECTED_ADDRESSES', payload: [] });
        dispatch({ type: 'SET_CARDS_DELETED_API_ITEMS', payload: [] });
        dispatch({ type: 'SET_CARDS_SECTORS', payload: '' });
        dispatch({ type: 'SET_CARDS_TYPES', payload: '' });
        // Clear local state variables
        setSelectedSector('');
        setSelectedType('');
        getPersionalDetails(selectedBank, setPersionalDetails, setErrormsg, setLoadingData, props.route.params.cardId);
        fetchSectorsAndTypes(setSectors, setTypes, setErrormsg, t);
        getMemDetails(true)
    }, [dispatch])

    /**
     * Handle back navigation - clears UBO/Director/Representative form data
     */
    const handleBack = useCallback(() => {
        // Clear Redux state for all entity types when going back
        dispatch({ type: 'SET_CARD_UBO_FORM_DATA', payload: [] });
        dispatch({ type: 'SET_CARDS_DIRECTOR_FORM_DATA', payload: [] });
        dispatch({ type: 'SET_CARDS_REPRESENTATIVE_FORM_DATA', payload: [] });
        props.navigation.goBack();
    }, [navigation, dispatch]);
    /**
     * Transform UBO/Director/Representative data to API payload format
     * Combines form data with API data for complete submission
     */
    const transformToPayloadFormat = (formValues?: any) => {

        const uboData = getUboData(uboFormDataList, persionalDetails, deletedApiItems);
        const directorData = getDirectorData(directorFormDataList, persionalDetails, deletedApiItems);

        // Use formValues parameter if provided, otherwise fall back to currentFormValues
        const values = formValues || currentFormValues;

        const payload: payloadInterface = {
            // Company object with all company-related information
            company: {
                companyName: values?.companyName || (persionalDetails?.kyb?.company?.companyName ? safeDecrypt(persionalDetails.kyb.company.companyName) : ""),
                type: values?.type || selectedType || (persionalDetails?.kyb?.company?.type || "Private Limited"),
                description: values?.description || (persionalDetails?.kyb?.company?.description || ""),
                industry: values?.industry || selectedSector || (persionalDetails?.kyb?.company?.industry || ""),
                registrationNumber: values?.registrationNumber || (persionalDetails?.kyb?.company?.registrationNumber ? safeDecrypt(persionalDetails.kyb.company.registrationNumber) : ""),
                taxId: values?.taxId || (persionalDetails?.kyb?.company?.taxId || ""),
                website: values?.website || (persionalDetails?.kyb?.company?.website || ""),
                certificateofincorporation: values?.certificateofincorporation || persionalDetails?.kyb?.company?.certificateofincorporation || documentsData?.certificateofincorporation || "",
                shareholderregistry: values?.shareholderRegistry || persionalDetails?.kyb?.company?.shareholderregistry || documentsData?.shareholderregistry || "",
                companyAddress: persionalDetails?.kyb?.company?.companyAddress || {
                    addressType: values?.companyAddress && values?.companyAddress?.match(/\((.*?)\)/)?.[1] || "",
                    line1: values?.companyAddressLine1 || "",
                    line2: values?.companyAddressLine2 || "",
                    city: values?.companyCity || "",
                    postalCode: values?.companyPostalCode || "",
                    country: values?.companyAddressCountry || ""
                }
            },
            // Personal details object
            personaldetails: {
                firstName: values?.firstName || "",
                lastName: values?.lastName || "",
                dateOfBirth: values?.dateOfBirth ? formatYearMonthDate(values?.dateOfBirth) : "",
                country: values?.country || "",
                email: values?.email || "",
                gender: values?.gender || "",
                phoneCode: values?.phoneCode || "",
                phoneNumber: values?.phoneNumber || "",
                identification: {
                    idType: values?.idType || "",
                    idNumber: values?.idNumber || "",
                    countryOfIssue: values?.country || "",
                    docExpireDate: values?.docExpireDate ? formatYearMonthDate(values?.docExpireDate) : "",
                    docIssueDate: values?.docIssueDate ? formatYearMonthDate(values?.docIssueDate) : "",
                    frontDocument: values?.profilePicFront || "",
                    backDocument: values?.profilePicBack || "",
                },
                personalInfoAddress: {
                    line1: values?.addressLine1 || "",
                    line2: values?.addressLine2 || "",
                    city: values?.city || "",
                    postalCode: values?.postalCode || "",
                    country: values?.addressCountry || "",
                    state: values?.state || "",
                    addressType: values?.addressType ? values?.addressType?.match(/\((.*?)\)/)?.[1] : "",

                }
            },
            // Representatives array with nested structure
            representatives: getRepresentativeData(representativeFormDataList, persionalDetails, deletedApiItems).map((rep: any) => ({
                id: rep?.recordStatus === "Added" ? "00000000-0000-0000-0000-000000000000" : (rep?.id || "00000000-0000-0000-0000-000000000000"),
                recordStatus: rep.recordStatus || "Added",
                personDetails: {
                    firstName: rep?.firstName ? safeDecrypt(rep?.firstName) : rep?.firstName || "",
                    lastName: rep?.lastName ? safeDecrypt(rep?.lastName) : rep?.lastName || "",
                    dateOfBirth: rep?.dob || "",
                    country: rep?.country || "",
                    gender: rep?.gender || "",
                    email: rep?.email ? safeDecrypt(rep?.email) : rep?.email || "",
                    phoneCode: rep?.phoneCode ? safeDecrypt(rep?.phoneCode) : rep?.phoneCode || "",
                    phoneNumber: rep?.phoneNumber ? safeDecrypt(rep?.phoneNumber) : rep?.phoneNumber || "",
                    shareHolderPercentage: rep?.shareHolderPercentage?.toString() || "0",
                },
                identification: {
                    id: rep?.docDetailsid || "00000000-0000-0000-0000-000000000000",
                    idType: rep?.docType || "",
                    idNumber: rep?.docNumber || "",
                    countryOfIssue: rep?.countryOfIssueDate || "",
                    docExpireDate: rep?.docExpiryDate || "",
                    docIssueDate: rep?.docIssueDate || "",
                    frontDocument: rep?.frontId || "",
                    backDocument: rep?.backImgId || ""
                },
                representativesAddress: {
                    addressType: rep?.addressType || "",
                    line1: rep?.addressLine1 || "",
                    line2: rep?.addressLine2 || "",
                    city: rep?.city || "",
                    postalCode: rep?.postalCode || "",
                    country: rep?.addressCountry || ""
                },
                selfie: rep.selfi || ""
            })),
            // Directors array with nested structure
            directors: directorData.map(director => ({
                id: director?.recordStatus === "Added" ? "00000000-0000-0000-0000-000000000000" : (director?.id || "00000000-0000-0000-0000-000000000000"),
                recordStatus: director.recordStatus || "Added",
                selfie: director.selfi || "",
                personDetails: {
                    firstName: director?.firstName ? safeDecrypt(director?.firstName) : director?.firstName || "",
                    lastName: director?.lastName ? safeDecrypt(director?.lastName) : director?.lastName || "",
                    gender: values?.gender || "",
                    dateOfBirth: director?.dob || "",
                    country: director?.country || "",
                    email: director?.email ? safeDecrypt(director?.email) : director?.email || "",
                    phoneCode: director?.phoneCode ? safeDecrypt(director?.phoneCode) : director?.phoneCode || "",
                    phoneNumber: director?.phoneNumber ? safeDecrypt(director?.phoneNumber) : director?.phoneNumber || "",
                    shareHolderPercentage: director?.shareHolderPercentage?.toString() || "0"
                },
                directorAddress: {
                    addressType: director?.addressType || "",
                    line1: director?.addressLine1 || "",
                    line2: director?.addressLine2 || "",
                    city: director?.city || "",
                    postalCode: director?.postalCode || "",
                    country: director?.addressCountry || ""
                },
                identification: {
                    id: director?.docDetailsid || "00000000-0000-0000-0000-000000000000",
                    idType: director?.docType || "",
                    idNumber: director?.docNumber || "",
                    docExpireDate: director?.docExpiryDate || "",
                    docIssueDate: director?.docIssueDate || "",
                    frontDocument: director?.frontId || "",
                    backDocument: director?.backImgId || ""
                }
            })),
            // UBOs array with nested structure
            ubos: uboData.map(ubo => ({
                id: ubo?.recordStatus === "Added" ? "00000000-0000-0000-0000-000000000000" : (ubo?.id || "00000000-0000-0000-0000-000000000000"),
                recordStatus: ubo?.recordStatus || "Added",
                personDetails: {
                    firstName: ubo.firstName ? safeDecrypt(ubo?.firstName) : ubo?.firstName || "",
                    lastName: ubo?.lastName ? safeDecrypt(ubo?.lastName) : ubo?.lastName || "",
                    gender: values?.gender || "",
                    dateOfBirth: ubo?.dob || "",
                    country: ubo?.country || "",
                    email: ubo?.email ? safeDecrypt(ubo?.email) : ubo?.email || "",
                    phoneCode: ubo?.phoneCode ? safeDecrypt(ubo?.phoneCode) : ubo?.phoneCode || "",
                    phoneNumber: ubo?.phoneNumber ? safeDecrypt(ubo?.phoneNumber) : ubo?.phoneNumber || "",
                    shareHolderPercentage: ubo?.shareHolderPercentage?.toString() || "0"
                },
                identification: {
                    idType: ubo?.docType || "",
                    idNumber: ubo?.docNumber || "",
                    countryOfIssue: ubo?.countryOfIssueDate || "",
                    docExpireDate: ubo?.docExpiryDate || "",
                    docIssueDate: ubo?.docIssueDate || "",
                    frontDocument: ubo?.frontId || "",
                    backDocument: ubo?.backImgId || ""
                },
                selfie: ubo?.selfi || "",
                ubosAddress: {
                    addressType: ubo?.addressType || "",
                    line1: ubo?.addressLine1 || "",
                    line2: ubo?.addressLine2 || "",
                    city: ubo?.city || "",
                    postalCode: ubo?.postalCode || "",
                    country: ubo?.addressCountry || ""
                }
            }))
        };

        return payload;
    };

    const handleFormSubmit = async (formValues?: any) => {
        setSubmitLoading(true);
        // Transform payload using current form values
        const kybPayload = transformToPayloadFormat(formValues);

        // Sequential validation: UBO, Director, and Representative
        const uboErrors = validateUbos(persionalDetails, uboFormDataList, deletedApiItems, safeDecrypt, t);
        const directorErrors = validateDirectors(persionalDetails, directorFormDataList, deletedApiItems, safeDecrypt, t, validateUbos);
        const representativeErrors = validateRepresentatives(persionalDetails, representativeFormDataList, deletedApiItems, safeDecrypt, t);

        // Form field validation for all UBO/Director/Representative data
        const formFieldErrors: any = [];
        [...uboFormDataList, ...directorFormDataList, ...representativeFormDataList].forEach(item => {
            const fieldErrors = validateFormFields(item, t);
            formFieldErrors.push(...fieldErrors);
        });

        const addressErrors = validateAddresses(persionalDetails, selectedAddresses, t, formInitialValues);

        const validationErrors = [
            ...validateDocuments(persionalDetails, documentsData, t),
            ...formFieldErrors,
            ...uboErrors,
            ...directorErrors,
            ...representativeErrors,
            ...addressErrors,
            ...validateSharePercentages(persionalDetails, uboFormDataList, directorFormDataList, deletedApiItems, t, representativeFormDataList),
        ];

        if (validationErrors.length > 0) {
            setErrormsg(validationErrors.join(', '));
            ref?.current?.scrollTo({ y: 0, animated: true });
            setSubmitLoading(false);
            return;
        }

        // Direct submit - call summaryAccountCreation API
        await handleDirectSubmit({
            userinfo,
            documentsData,
            getUboDataFn: () => getUboData(uboFormDataList, persionalDetails, deletedApiItems),
            getDirectorDataFn: () => getDirectorData(directorFormDataList, persionalDetails, deletedApiItems),
            getRepresentativeDataFn: () => getRepresentativeData(representativeFormDataList, persionalDetails, deletedApiItems),
            encryptAES,
            selectedAddresses,
            isReapply,
            selectedSector,
            selectedType,
            selectedBank,
            setSubmitLoading,
            successSheetRef,
            setErrormsg,
            ref
        });
        const navParams = {
            logo: props?.route?.params?.logo,
            cardName: props?.route?.params?.cardName,
            cardType: props?.route?.params?.cardType || props?.route?.params?.type,
            cardId: props?.route?.params?.cardId,
            cardPrice: props?.route?.params?.cardPrice,
            currency: props?.route?.params?.currency || props?.route?.params?.cardCurrency,
            supportedPlatforms: props?.route?.params?.supportedPlatforms,
            kycType: props?.route?.params?.kycType,
            isCustomerCreated: props?.route?.params?.isCustomerCreated
        };
        const obj = {
            companyApplicationModel: kybPayload,
            cardId: props?.route?.params?.cardId,
            name: props?.route?.params?.cardName,
            type: props?.route?.params?.cardType || props?.route?.params?.type,
            noteType: acceptedTerms?.noteType || "",
            note: acceptedTerms?.noteType?.toLowerCase() === 'dynamic' ? JSON.stringify(acceptedTerms?.note || []).toLowerCase() : ""

        }
        try {
            dispatch(setKybApplyCardData(kybPayload));
            if (props?.route?.params?.cardProcessType?.toLowerCase() === "doublestep") {
                const response = await CardsModuleService.postDoubleStepCardApply(obj);
                if (response?.status === 200) {
                    setSubmitLoading(false);
                    props.navigation.navigate("CardSetupStatus", {
                        ...navParams,
                        cardProcessType: props?.route?.params?.cardProcessType?.toLowerCase()
                    });
                }
                else {
                    setSubmitLoading(false);
                    setErrormsg(isErrorDispaly(response));
                    ref?.current?.scrollTo({ y: 0, animated: true });

                }
                return;
            }
            // props.navigation.goBack();
            else if (props?.route?.params?.cardProcessType?.toLowerCase() !== "doublestep") {
                props.navigation.navigate("ApplyCard", {
                    ...navParams,
                })
            }
            setSubmitLoading(false);
            return;
        } catch (error) {
            setSubmitLoading(false);
            setErrormsg(isErrorDispaly(error));
            ref?.current?.scrollTo({ y: 0, animated: true });
        }
    }

    const handleAddressCountry = (e: any, setFieldValue?: any) => {
        if (!setFieldValue) return;
        setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_COUNTRY, e);
        setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE1, "");
        setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE2, "");
        setFieldValue(FORM_DATA_CONSTANTS.CITY, "");
        setFieldValue(FORM_DATA_CONSTANTS.STATE, "");
        setFieldValue(FORM_DATA_CONSTANTS.POSTAL_CODE, "");
        setFieldValue(FORM_DATA_CONSTANTS.TOWN, "");

        const selectedCountryForStates: any = countriesWithStates?.find(c => c?.name === e);
        if (selectedCountryForStates && selectedCountryForStates.details?.length > 0) {
            setStatesList(selectedCountryForStates.details);
        } else {
            setStatesList([]);
        }
    };
    const handleAddress = (e: any, addressList?: any, addressesDetailsInfo?: any, setFieldValue?: any, currentValues?: any) => {
        dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: e });
        const address = (addressList || addresses)?.find((item: any) => item?.name === e);
        const addressDetail = (addressesDetailsInfo || addressesDetails)?.find((addr: any) => addr?.id === address?.id);

        if (addressDetail && setFieldValue) {
            const selectedCountryForTowns = countries?.find((c: any) => c?.name === addressDetail?.country);
            const selectedCountryForStates = countriesWithStates?.find(c => c?.name === selectedCountryForTowns?.name);
            setStatesList(selectedCountryForStates?.details || []);
            setFieldValue(FORM_DATA_CONSTANTS.CITY, addressDetail?.city || "");
            setFieldValue(FORM_DATA_CONSTANTS.STATE, addressDetail?.state || "");
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_COUNTRY, addressDetail?.country || "");
            setFieldValue(FORM_DATA_CONSTANTS.POSTAL_CODE, decryptAES(addressDetail?.postalCode) || "");
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE1, addressDetail?.addressLine1 || "");
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE2, addressDetail?.addressLine2 || "");
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS, e);
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_TYPE, addressDetail?.addressType || "");
        }
    };

    const handleCompanyAddress = (e: any, addressList?: any, addressesDetailsInfo?: any, setFieldValue?: any, currentValues?: any) => {
        const address = (addressList || addresses)?.find((item: any) => item?.name === e);
        const addressDetail = (addressesDetailsInfo || addressesDetails)?.find((addr: any) => addr?.id === address?.id);

        if (addressDetail && setFieldValue) {
            setFieldValue(FORM_DATA_CONSTANTS.COMPANY_CITY, addressDetail?.city || "");
            setFieldValue(FORM_DATA_CONSTANTS.COMPANY_STATE, addressDetail?.state || "");
            setFieldValue(FORM_DATA_CONSTANTS.COMPANY_ADDRESS_COUNTRY, addressDetail?.country || "");
            setFieldValue(FORM_DATA_CONSTANTS.COMPANY_POSTAL_CODE, decryptAES(addressDetail?.postalCode) || "");
            setFieldValue(FORM_DATA_CONSTANTS.COMPANY_ADDRESS_LINE1, addressDetail?.addressLine1 || "");
            setFieldValue(FORM_DATA_CONSTANTS.COMPANY_ADDRESS_LINE2, addressDetail?.addressLine2 || "");
            setFieldValue(FORM_DATA_CONSTANTS.COMPANY_ADDRESS, e);
        }
    };


    const handleUboChange = (selectedId: string, setFieldValue?: any) => {
        const selectedUbo: any = uboList.find((item: UboDirectorItem) => item?.firstName === selectedId);
        if (!selectedUbo) return;
        setFieldValue('firstName', selectedUbo?.firstName || "");
        setFieldValue('lastName', selectedUbo?.lastName || "");
        setFieldValue('dateOfBirth', selectedUbo?.dob || null);
        setFieldValue('phoneCode', selectedUbo?.phoneCode || "");
        setFieldValue('phoneNumber', selectedUbo?.phoneNumber || "");
        setFieldValue('email', selectedUbo?.email || "");
        setFieldValue('idType', selectedUbo?.docType || "");
        setFieldValue('docIssueDate', selectedUbo?.docIssueDate || null);
        setFieldValue('docExpireDate', selectedUbo?.docExpiryDate || null);
        setFieldValue('idNumber', selectedUbo?.docNumber || "");
        setFieldValue('profilePicFront', selectedUbo?.frontId || null);
        setFieldValue('profilePicBack', selectedUbo?.backImgId || null);
        setFieldValue('countryOfIssue', selectedUbo?.country || "");
        setFieldValue("gender", selectedUbo?.gender)

        // Address fields
        setFieldValue('addressLine1', selectedUbo?.addressLine1 || "");
        setFieldValue('addressLine2', selectedUbo?.addressLine2 || "");
        setFieldValue('address', selectedUbo?.address || "");
        setFieldValue('city', selectedUbo?.city || "");
        setFieldValue('state', selectedUbo?.state || "");
        setFieldValue('postalCode', selectedUbo?.postalCode || "");
        setFieldValue('country', selectedUbo?.country || "");
        setFieldValue('addressCountry', selectedUbo?.addressCountry || "");
        setFieldValue('addressType', selectedUbo?.addressType || "");

    };


    const handleUbosDelete = useCallback((id: string): void => {
        // Delete from Redux if exists in form data
        if (uboFormDataList.length > 0) {
            const updatedList = uboFormDataList.filter((item: UboDirectorItem) => item?.id !== id);
            dispatch(setUboFormData(updatedList));
        }
        // Always mark API item as deleted (handles both form and API cases)
        const newDeletedItems = [...(deletedApiItems || []), id];
        dispatch({ type: 'SET_CARDS_DELETED_API_ITEMS', payload: newDeletedItems });
        actionSheetRef.current?.close();
    }, [uboFormDataList, dispatch, deletedApiItems])

    /**
     * Handle Representative deletion - removes from Redux and marks as deleted
     */
    const handleRepresentativesDelete = useCallback((id: string): void => {
        // Remove from form data if exists
        if (representativeFormDataList.length > 0) {
            const updatedList = representativeFormDataList.filter((item: UboDirectorItem) => item?.id !== id);
            dispatch({ type: 'SET_CARDS_REPRESENTATIVE_FORM_DATA', payload: updatedList });
        }
        // Mark API item as deleted
        const newDeletedItems = [...(deletedApiItems || []), id];
        dispatch({ type: 'SET_CARDS_DELETED_API_ITEMS', payload: newDeletedItems });
        actionSheetRef.current?.close();
    }, [representativeFormDataList, dispatch, deletedApiItems]);

    /**
     * Handle Director deletion - removes from Redux and marks as deleted
     */
    const handleDirectorsDelete = useCallback((id: string): void => {
        // Delete from Redux form data if exists
        if (directorFormDataList.length > 0) {
            const updatedDirectorList = directorFormDataList.filter((item: UboDirectorItem) => item?.id !== id);
            dispatch({ type: 'SET_CARDS_DIRECTOR_FORM_DATA', payload: updatedDirectorList });
        }
        // Always mark API item as deleted (handles both form and API cases)
        const newDeletedItems = [...(deletedApiItems || []), id];
        dispatch({ type: 'SET_CARDS_DELETED_API_ITEMS', payload: newDeletedItems });
        actionSheetRef.current?.close();
    }, [directorFormDataList, dispatch, deletedApiItems])


    /**
     * Handle edit action - routes to appropriate edit handler based on item type
     */
    const handleEdit = () => {
        actionSheetRef.current?.close();
        if (selectedItem) {
            // Route to appropriate edit handler based on item type
            if (selectedItem.isDirector) {
                handleDirectorsEdit(selectedItem.id);
            } else if (selectedItem.isRepresentative) {
                handleRepresentativesEdit(selectedItem.id);
            } else {
                handleUbosEdit(selectedItem.id);
            }
        }
    };

    /**
     * Show delete confirmation modal
     */
    const handleDelete = () => {
        actionSheetRef.current?.close();
        deleteConfirmSheetRef.current?.open();
    };

    /**
     * Confirm delete action - routes to appropriate delete handler
     */
    const confirmDelete = () => {
        if (selectedItem) {
            // Route to appropriate delete handler based on item type
            if (selectedItem.isDirector) {
                handleDirectorsDelete(selectedItem.id);
            } else if (selectedItem.isRepresentative) {
                handleRepresentativesDelete(selectedItem.id);
            } else {
                handleUbosDelete(selectedItem.id);
            }
        }
        deleteConfirmSheetRef.current?.close();
    };

    /**
     * Render loading skeleton for lists
     */
    const renderFooter = () => {
        if (!loadingData) {
            return null;
        }
        return (
            <Loadding contenthtml={skeltons} />
        )
    }

    /**
     * Show no data component for UBO list when empty
     */
    const noData = () => {
        if (!loadingData && !hasUbo(persionalDetails, uboFormDataList, deletedApiItems)) {
            return <NoDataComponent />;
        }
        return null;
    }

    /**
     * Show no data component for Directors list when empty
     */
    const directorsNoData = () => {
        if (!loadingData && !hasDirector(persionalDetails, directorFormDataList, deletedApiItems)) {
            return <NoDataComponent />;
        }
        return null;
    }
    /**
     * Open add address modal and save current form values
     */
    const handleAddAddress = () => {
        dispatch({ type: 'SET_KYB_FORM_VALUES', payload: currentFormValuesRef.current });
        setIsAddAddressModalVisible(true);
    };

    /**
     * Close add address modal
     */
    const handleCloseAddAddressModal = () => {
        setIsAddAddressModalVisible(false);
    };

    /**
     * Handle successful address save - refresh address list
     */
    const handleAddressSaveSuccess = () => {
        setIsAddAddressModalVisible(false);
        fetchDefaultAddresses(dispatch, setErrormsg, setAddresses, setAddressesDetails, handleAddress);
    };

    /**
     * Clear error message
     */
    const handleError = useCallback(() => {
        setErrormsg(null)
    }, []);

    /**
     * Close all bottom sheets before navigation
     */
    const closeAllSheetsAndNavigate = useCallback((navigationFn: () => void) => {
        actionSheetRef.current?.close();
        deleteConfirmSheetRef.current?.close();
        sectorTypeSheetRef.current?.close();
        navigationFn();
    }, []);
    const editCodintion = userinfo?.kycStatus == null || userinfo?.kycStatus == "Draft" || userinfo?.kycStatus == "Submitted" || userinfo?.kycStatus == "Under Review";

    const handleValidationSave = (validateForm: any) => {
        validateForm().then(async (a: any) => {
            if (Object.keys(a)?.length > 0) {
                // Mark all fields as touched to show validation errors
                const touchedFields = Object.keys(formInitialValues).reduce((acc, key) => {
                    acc[key] = true;
                    return acc;
                }, {} as Record<string, boolean>);
                formikRef?.current?.setTouched(touchedFields);

                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(t("GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD"));
            }
        })
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loadingData && <DashboardLoader />}

            <Formik
                innerRef={formikRef}
                initialValues={formInitialValues}
                validationSchema={Yup.lazy((values) => AddressValidationSchema(kybRequriments, values))}
                onSubmit={(values) => handleFormSubmit(values)}
                enableReinitialize={true}
            >
                {({ touched, errors, handleBlur, handleSubmit, values, setFieldValue, handleChange, setFieldTouched, validateForm }) => {
                    useEffect(() => {
                        setCurrentFormValues(values);
                        currentFormValuesRef.current = { ...values }; // Create a copy to avoid reference issues
                    }, [values]);
                    return (<>

                        {!loadingData && (
                            <Container style={commonStyles.container}>
                                <PageHeader title={"GLOBAL_CONSTANTS.APPLICATION_INFO"} onBackPress={handleBack} isrefresh={true} onRefresh={handleRefresh} />
                                <KeyboardAvoidingView
                                    style={{ flex: 1 }}
                                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    keyboardVerticalOffset={s(64)}
                                >
                                    <ScrollViewComponent ref={ref} showsVerticalScrollIndicator={false}>
                                        {/* {editCodintion && (
                                            <ViewComponent>
                                                <ProgressHeader title={"GLOBAL_CONSTANTS.RIVIEW"} progress={5} total={5} showBadge={true} status={userinfo?.kycStatus ?? ''} />
                                            </ViewComponent>
                                        )} */}
                                        {errormsg && <ErrorComponent message={errormsg} onClose={handleError} />}
                                        {(persionalDetails && !loadingData) && (

                                            <ViewComponent>
                                                <ViewComponent>
                                                    <CompanyFields
                                                        touched={touched}
                                                        errors={errors}
                                                        handleBlur={handleBlur}
                                                        values={values}
                                                        handleChange={handleChange}
                                                        kybRequriments={kybRequriments}
                                                        setFieldValue={setFieldValue}
                                                        setFieldTouched={setFieldTouched}
                                                        sectors={sectors}
                                                        types={types}
                                                        KybFeildInitialValues={KybFeildInitialValues}
                                                    />

                                                    {kybRequriments?.toLowerCase()?.replace(/\s+/g, '')?.split(',')?.includes('companyaddress') && (<>
                                                        <KybAddressFeilds
                                                            t={t}
                                                            values={values}
                                                            touched={touched}
                                                            errors={errors}
                                                            setFieldValue={setFieldValue}
                                                            handleBlur={handleBlur}
                                                            handleAddAddress={handleAddAddress}
                                                            addresses={addresses}
                                                            countries={countries}
                                                            statesList={statesList}
                                                            type="fulladdress"
                                                            handleAddress={(e: any, addressList?: any, addressesDetailsInfo?: any) => handleCompanyAddress(e, addressList, addressesDetailsInfo, setFieldValue, values)}
                                                            handleAddressCountry={handleAddressCountry}
                                                            addressInitialValues={formInitialValues}
                                                            prefix="company"
                                                        />
                                                    </>)}

                                                </ViewComponent>
                                                {/* <ViewComponent style={[commonStyles.sectionGap]} /> */}

                                                {getRequirements(persionalDetails).showDirector && (
                                                    <ViewComponent style={[commonStyles.titleSectionGap, openAccordion === ACCORDION_KEYS.DIRECTORS ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.bgnote, openAccordion === ACCORDION_KEYS.DIRECTORS ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                                            <CommonTouchableOpacity onPress={() => handleToggleAccordion(ACCORDION_KEYS.DIRECTORS)} style={[commonStyles.flex1]}>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                                                                    <RequiredLabel text="GLOBAL_CONSTANTS.DIRECTORS_DETAILS" style={[commonStyles.secondsectiontitle]} />
                                                                    <InfoTooltip
                                                                        tooltipText="GLOBAL_CONSTANTS.TOOLTIP_DIRECTOR_MANDATORY"
                                                                        linkText=""
                                                                        linkUrl=""
                                                                        verticalGap={s(13)}
                                                                        arrowXPosition={s(0)}
                                                                        onError={(msg) => setErrormsg(msg)}
                                                                    />
                                                                </ViewComponent>
                                                            </CommonTouchableOpacity>
                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                                                <CommonTouchableOpacity activeOpacity={0.8} onPress={handleAddDirectors}>
                                                                    <MaterialIcons name="add-circle-outline" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                                                </CommonTouchableOpacity>
                                                                <CommonTouchableOpacity onPress={() => handleToggleAccordion(ACCORDION_KEYS.DIRECTORS)}>
                                                                    <MaterialIcons name={openAccordion === ACCORDION_KEYS.DIRECTORS ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                                                                </CommonTouchableOpacity>
                                                            </ViewComponent>
                                                        </ViewComponent>
                                                        {openAccordion === ACCORDION_KEYS.DIRECTORS && (
                                                            <ViewComponent style={[commonStyles.sectionGap]}>
                                                                <FlatList
                                                                    data={getDirectorData(directorFormDataList, persionalDetails, deletedApiItems)}
                                                                    renderItem={({ item, index }) => {
                                                                        return (
                                                                            <ViewComponent key={index} style={[commonStyles.px14]}>
                                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.gap12]}>
                                                                                    <ViewComponent style={[commonStyles.flex1]}>
                                                                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={item?.email || `${item?.firstName || ''} ${item?.lastName || ''}`} />
                                                                                    </ViewComponent>
                                                                                    <ViewComponent style={[commonStyles.flex1]}>
                                                                                        {item?.shareHolderPercentage && <ParagraphComponent text={`${item.shareHolderPercentage}%`} style={[commonStyles.listprimarytext]} />}
                                                                                        <ParagraphComponent text={(() => {
                                                                                            const phoneCode = item?.phoneCode ? safeDecrypt(item.phoneCode) : (item?.phoneCode || '');
                                                                                            const phoneNumber = item?.phoneNumber ? safeDecrypt(item.phoneNumber) : (item?.phoneNumber || '');
                                                                                            if (!phoneCode && !phoneNumber) return '--';
                                                                                            const formattedCode = phoneCode?.startsWith?.('+') ? phoneCode : `+${phoneCode}`;
                                                                                            return `${formattedCode} ${phoneNumber}`;
                                                                                        })()} style={[commonStyles.listprimarytext]} />
                                                                                    </ViewComponent>
                                                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap14, commonStyles.mt20, { width: s(60) }]}>
                                                                                        <CommonTouchableOpacity activeOpacity={0.8} onPress={() => { handleDirectorsEdit(item?.id); }}><EditIcon width={s(16)} height={s(20)} color={NEW_COLOR.TEXT_PRIMARY} /></CommonTouchableOpacity>
                                                                                        <CommonTouchableOpacity activeOpacity={0.8} onPress={() => { setSelectedItem({ ...item, isDirector: true }); deleteConfirmSheetRef.current?.open(); }}><UploadDeleteIcon width={s(16)} height={s(16)} /></CommonTouchableOpacity>
                                                                                    </ViewComponent>

                                                                                    <ViewComponent>
                                                                                    </ViewComponent>

                                                                                    <ViewComponent>
                                                                                        <ViewComponent style={[commonStyles.flex1, commonStyles.mt10,]}>
                                                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                                                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb2,]}>
                                                                                                    <ParagraphComponent
                                                                                                        style={[commonStyles.twolettertext, commonStyles.textCenter]}
                                                                                                        text={`${item?.addressType || ""} - ${item?.firstName?.length > 15
                                                                                                            ? `${item.firstName.slice(0, 4)}...${item.firstName.slice(-4)}`
                                                                                                            : item?.firstName || "--"
                                                                                                            }`}
                                                                                                    />

                                                                                                </ViewComponent>
                                                                                            </ViewComponent>

                                                                                            <ViewComponent>
                                                                                                <ParagraphComponent
                                                                                                    text={
                                                                                                        [
                                                                                                            item?.addressLine1,
                                                                                                            item?.addressLine2,
                                                                                                            // values?.town,
                                                                                                            item?.city,
                                                                                                            item?.state,
                                                                                                            item?.addressCountry?.length > 10
                                                                                                                ? `${item?.addressCountry?.slice(0, 8)}...${item?.addressCountry?.slice(-8)}`
                                                                                                                : item?.addressCountry,
                                                                                                            item?.postalCode

                                                                                                        ]
                                                                                                            ?.filter(Boolean)
                                                                                                            ?.join(", ") || "--"
                                                                                                    }
                                                                                                    style={[commonStyles.secondparatext]}
                                                                                                />
                                                                                            </ViewComponent>
                                                                                        </ViewComponent>
                                                                                    </ViewComponent>

                                                                                </ViewComponent>
                                                                            </ViewComponent>
                                                                        );
                                                                    }}
                                                                    keyExtractor={(item, index) => `director-${item.id || index}`}
                                                                    scrollEnabled={false}
                                                                    ListFooterComponent={renderFooter}
                                                                    ListEmptyComponent={directorsNoData}
                                                                    ItemSeparatorComponent={<ViewComponent style={[commonStyles.transactionsListGap]} />}

                                                                />
                                                            </ViewComponent>
                                                        )}
                                                    </ViewComponent>
                                                )}
                                                {getRequirements(persionalDetails).showRepresentative && (
                                                    <ViewComponent style={[commonStyles.titleSectionGap, openAccordion === ACCORDION_KEYS.REPRESENTATIVES ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.bgnote, openAccordion === ACCORDION_KEYS.REPRESENTATIVES ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                                            <CommonTouchableOpacity onPress={() => handleToggleAccordion(ACCORDION_KEYS.REPRESENTATIVES)} style={[commonStyles.flex1]}>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                                                                    <RequiredLabel text="GLOBAL_CONSTANTS.REPRESENTATIVE_DETAILS" style={[commonStyles.secondsectiontitle]} />
                                                                </ViewComponent>
                                                            </CommonTouchableOpacity>
                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                                                <CommonTouchableOpacity activeOpacity={0.8} onPress={handleAddRepresentatives}>
                                                                    <MaterialIcons name="add-circle-outline" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                                                </CommonTouchableOpacity>
                                                                <CommonTouchableOpacity onPress={() => handleToggleAccordion(ACCORDION_KEYS.REPRESENTATIVES)}>
                                                                    <MaterialIcons name={openAccordion === ACCORDION_KEYS.REPRESENTATIVES ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                                                                </CommonTouchableOpacity>
                                                            </ViewComponent>
                                                        </ViewComponent>
                                                        {openAccordion === ACCORDION_KEYS.REPRESENTATIVES && (
                                                            <ViewComponent style={[commonStyles.sectionGap]}>
                                                                <FlatList
                                                                    data={getRepresentativeData(representativeFormDataList, persionalDetails, deletedApiItems)}
                                                                    renderItem={({ item, index }) => {
                                                                        return (
                                                                            <ViewComponent key={index} style={[commonStyles.px14]}>
                                                                                <ViewComponent>
                                                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.gap12]}>
                                                                                        <ViewComponent style={[commonStyles.flex1]}>
                                                                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={item?.email || `${item?.firstName || ''} ${item?.lastName || ''}`} />
                                                                                        </ViewComponent>
                                                                                        <ViewComponent style={[commonStyles.flex1]}>
                                                                                            {item?.shareHolderPercentage && <ParagraphComponent text={`${item.shareHolderPercentage}%`} style={[commonStyles.listprimarytext]} />}
                                                                                            <ParagraphComponent text={(() => {
                                                                                                const phoneCode = item?.phoneCode ? safeDecrypt(item.phoneCode) : (item?.phoneCode || '');
                                                                                                const phoneNumber = item?.phoneNumber ? safeDecrypt(item.phoneNumber) : (item?.phoneNumber || '');
                                                                                                if (!phoneCode && !phoneNumber) return '--';
                                                                                                const formattedCode = phoneCode?.startsWith?.('+') ? phoneCode : `+${phoneCode}`;
                                                                                                return `${formattedCode} ${phoneNumber}`;
                                                                                            })()} style={[commonStyles.listprimarytext]} />
                                                                                        </ViewComponent>
                                                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap14, commonStyles.mt20, { width: s(60) }]}>
                                                                                            <CommonTouchableOpacity activeOpacity={0.8} onPress={() => { handleRepresentativesEdit(item?.id); }}><EditIcon width={s(16)} height={s(20)} color={NEW_COLOR.TEXT_PRIMARY} /></CommonTouchableOpacity>
                                                                                            <CommonTouchableOpacity activeOpacity={0.8} onPress={() => { setSelectedItem({ ...item, isRepresentative: true }); deleteConfirmSheetRef.current?.open(); }}><UploadDeleteIcon width={s(16)} height={s(16)} /></CommonTouchableOpacity>
                                                                                        </ViewComponent>
                                                                                    </ViewComponent>
                                                                                    <ViewComponent>
                                                                                        <ViewComponent style={[commonStyles.flex1, commonStyles.mt10,]}>
                                                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                                                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb2,]}>
                                                                                                    <ParagraphComponent
                                                                                                        style={[commonStyles.twolettertext, commonStyles.textCenter]}
                                                                                                        text={`${item?.addressType || ""} - ${item?.firstName?.length > 15
                                                                                                            ? `${item.firstName.slice(0, 4)}...${item.firstName.slice(-4)}`
                                                                                                            : item?.firstName || "--"
                                                                                                            }`}
                                                                                                    />

                                                                                                </ViewComponent>
                                                                                            </ViewComponent>

                                                                                            <ViewComponent>
                                                                                                <ParagraphComponent
                                                                                                    text={
                                                                                                        [
                                                                                                            item?.addressLine1,
                                                                                                            item?.addressLine2,
                                                                                                            // values?.town,
                                                                                                            item?.city,
                                                                                                            item?.state,
                                                                                                            item?.addressCountry?.length > 10
                                                                                                                ? `${item?.addressCountry?.slice(0, 8)}...${item?.addressCountry?.slice(-8)}`
                                                                                                                : item?.addressCountry,
                                                                                                            item?.postalCode

                                                                                                        ]
                                                                                                            ?.filter(Boolean)
                                                                                                            ?.join(", ") || "--"
                                                                                                    }
                                                                                                    style={[commonStyles.secondparatext]}
                                                                                                />
                                                                                            </ViewComponent>
                                                                                        </ViewComponent>
                                                                                    </ViewComponent>
                                                                                </ViewComponent>
                                                                            </ViewComponent>
                                                                        );
                                                                    }}
                                                                    keyExtractor={(item, index) => `representative-${item.id || index}`}
                                                                    scrollEnabled={false}
                                                                    ListEmptyComponent={<NoDataComponent />}
                                                                    ItemSeparatorComponent={<ViewComponent style={[commonStyles.transactionsListGap]} />}

                                                                />
                                                            </ViewComponent>
                                                        )}
                                                    </ViewComponent>
                                                )}

                                                {getRequirements(persionalDetails).showUBO && (
                                                    <ViewComponent style={[commonStyles.titleSectionGap, openAccordion === ACCORDION_KEYS.UBO ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.bgnote, openAccordion === ACCORDION_KEYS.UBO ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                                            <CommonTouchableOpacity onPress={() => handleToggleAccordion(ACCORDION_KEYS.UBO)} style={[commonStyles.flex1]}>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                                                                    <RequiredLabel text="GLOBAL_CONSTANTS.UBO_DETAILS_TITLE" style={[commonStyles.secondsectiontitle]} />
                                                                    <InfoTooltip
                                                                        tooltipText="GLOBAL_CONSTANTS.TOOLTIP_UBO_MANDATORY"
                                                                        linkText=""
                                                                        linkUrl=""
                                                                        verticalGap={s(15)}
                                                                        arrowXPosition={s(0)}
                                                                        onError={(msg) => setErrormsg(msg)}
                                                                    />
                                                                </ViewComponent>
                                                            </CommonTouchableOpacity>
                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                                                <CommonTouchableOpacity activeOpacity={0.8} onPress={handleAddUbos}>
                                                                    <MaterialIcons name="add-circle-outline" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                                                </CommonTouchableOpacity>
                                                                <CommonTouchableOpacity onPress={() => handleToggleAccordion(ACCORDION_KEYS.UBO)}>
                                                                    <MaterialIcons name={openAccordion === ACCORDION_KEYS.UBO ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                                                                </CommonTouchableOpacity>
                                                            </ViewComponent>
                                                        </ViewComponent>
                                                        {openAccordion === ACCORDION_KEYS.UBO && (
                                                            <ViewComponent style={[commonStyles.sectionGap]}>
                                                                <FlatList
                                                                    data={getUboData(uboFormDataList, persionalDetails, deletedApiItems)}
                                                                    renderItem={({ item, index }) => {
                                                                        return (
                                                                            <ViewComponent key={index} style={[commonStyles.px14]}>
                                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.gap17, commonStyles.mt10]}>
                                                                                    <ViewComponent style={[commonStyles.flex1]}>
                                                                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={item?.email || `${item?.firstName || ''} ${item?.lastName || ''}`} />
                                                                                    </ViewComponent>
                                                                                    <ViewComponent style={[commonStyles.flex1]}>
                                                                                        {item?.shareHolderPercentage && <ParagraphComponent text={`${item.shareHolderPercentage}%`} style={[commonStyles.listprimarytext]} />}
                                                                                        <ParagraphComponent text={(() => {
                                                                                            const phoneCode = item?.phoneCode ? safeDecrypt(item.phoneCode) : (item?.phoneCode || '');
                                                                                            const phoneNumber = item?.phoneNumber ? safeDecrypt(item.phoneNumber) : (item?.phoneNumber || '');
                                                                                            if (!phoneCode && !phoneNumber) return '--';
                                                                                            const formattedCode = phoneCode?.startsWith?.('+') ? phoneCode : `+${phoneCode}`;
                                                                                            return `${formattedCode} ${phoneNumber}`;
                                                                                        })()} style={[commonStyles.listprimarytext]} />
                                                                                    </ViewComponent>
                                                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap14, commonStyles.mt20,]}>
                                                                                        <CommonTouchableOpacity activeOpacity={0.8} onPress={() => { handleUbosEdit(item?.id); }}><EditIcon width={s(16)} height={s(20)} color={NEW_COLOR.TEXT_PRIMARY} /></CommonTouchableOpacity>
                                                                                        <CommonTouchableOpacity activeOpacity={0.8} onPress={() => { setSelectedItem({ ...item, isDirector: false }); deleteConfirmSheetRef.current?.open(); }}><UboUploadDeleteIcon width={s(16)} height={s(16)} /></CommonTouchableOpacity>
                                                                                    </ViewComponent>


                                                                                </ViewComponent>

                                                                                <ViewComponent>
                                                                                    <ViewComponent style={[commonStyles.flex1, commonStyles.mt10,]}>
                                                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                                                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb2,]}>
                                                                                                <ParagraphComponent
                                                                                                    style={[commonStyles.twolettertext, commonStyles.textCenter]}
                                                                                                    text={`${item?.addressType || ""} - ${item?.firstName?.length > 15
                                                                                                        ? `${item.firstName.slice(0, 4)}...${item.firstName.slice(-4)}`
                                                                                                        : item?.firstName || "--"
                                                                                                        }`}
                                                                                                />

                                                                                            </ViewComponent>
                                                                                        </ViewComponent>

                                                                                        <ViewComponent>
                                                                                            <ParagraphComponent
                                                                                                text={
                                                                                                    [
                                                                                                        item?.addressLine1,
                                                                                                        item?.addressLine2,
                                                                                                        // values?.town,
                                                                                                        item?.city,
                                                                                                        item?.state,
                                                                                                        item?.addressCountry?.length > 10
                                                                                                            ? `${item?.addressCountry?.slice(0, 8)}...${item?.addressCountry?.slice(-8)}`
                                                                                                            : item?.addressCountry,
                                                                                                        item?.postalCode

                                                                                                    ]
                                                                                                        ?.filter(Boolean)
                                                                                                        ?.join(", ") || "--"
                                                                                                }
                                                                                                style={[commonStyles.secondparatext]}
                                                                                            />
                                                                                        </ViewComponent>
                                                                                    </ViewComponent>
                                                                                </ViewComponent>
                                                                            </ViewComponent>
                                                                        );
                                                                    }}
                                                                    keyExtractor={(item, index) => `ubo-${item.id || index}`}
                                                                    scrollEnabled={false}
                                                                    ListFooterComponent={renderFooter}
                                                                    ListEmptyComponent={noData}
                                                                    ItemSeparatorComponent={<ViewComponent style={[commonStyles.transactionsListGap]} />}
                                                                />
                                                            </ViewComponent>
                                                        )}
                                                    </ViewComponent>
                                                )}

                                                <ViewComponent style={commonStyles.formItemSpace}>
                                                    {(
                                                        kybRequriments
                                                            ?.toLowerCase()
                                                            ?.replace(/\s+/g, '')
                                                            ?.split(',')
                                                            ?.some((item: any) =>
                                                                item === 'personalinformation' || item === 'personalinformationaddress'
                                                            )
                                                    ) && (<>
                                                        <PersonalFields
                                                            touched={touched}
                                                            errors={errors}
                                                            handleBlur={handleBlur}
                                                            values={values}
                                                            kybRequriments={kybRequriments}
                                                            handleChange={handleChange}
                                                            setFieldValue={setFieldValue}
                                                            setFieldTouched={setFieldTouched}
                                                            countries={countries}
                                                            countryCodelist={countryCodelist}
                                                            documentTypesLookUp={documentTypesLookUp}
                                                            countryIdType={countryIdType}
                                                            uboCountries={uboCountries}
                                                            handleUboChange={handleUboChange}
                                                            cardDocTypes={cardDocTypes}
                                                            isdocTypeBasedOnCountry={persionalDetails?.isdocTypeBasedOnCountry}
                                                            uboFormDataList={uboList}
                                                            fetchDocuments={(country: string) => fetchDocuments(setCountryIdType, setErrormsg, country)} /></>)}
                                                </ViewComponent>


                                            </ViewComponent>
                                        )}
                                        <ViewComponent style={[commonStyles.sectionGap]} />
                                        <ButtonComponent
                                            title={(hasAccountCreationFee === false || hasAccountCreationFee === "false" || hasAccountCreationFee === undefined || hasAccountCreationFee === null || parseFloat(String(hasAccountCreationFee)) <= 0) ? "GLOBAL_CONSTANTS.SUBMIT" : "GLOBAL_CONSTANTS.CONTINUE"}
                                            loading={submitLoading}
                                            disable={submitLoading}
                                            onPress={() => {
                                                handleValidationSave(validateForm)
                                                handleSubmit();
                                            }}

                                        />
                                        <ViewComponent style={commonStyles?.mb32} />
                                    </ScrollViewComponent>
                                </KeyboardAvoidingView>
                            </Container>
                        )}
                    </>);
                }}
            </Formik>
            <CustomRBSheet
                refRBSheet={actionSheetRef}
                height={"Small"}
            >
                <ViewComponent>
                    <CommonTouchableOpacity onPress={handleEdit} activeOpacity={0.7}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2 }]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb5, commonStyles.bottomsheeticonbg]}>
                                    <EditIcon width={s(18)} height={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.EDIT"} style={[commonStyles.fs14, commonStyles.fw500]} />
                            </ViewComponent>
                            <Entypo name="chevron-small-right" size={24} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                    <ViewComponent style={[commonStyles.listitemGap]} />

                    <CommonTouchableOpacity onPress={handleDelete} activeOpacity={0.7}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2 }]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb5, commonStyles.bottomsheeticonbg]}>
                                    <UploadDeleteIcon width={s(18)} height={s(18)} />
                                </ViewComponent>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.DELETE"} style={[commonStyles.fs14, commonStyles.fw500]} />
                            </ViewComponent>
                            <Entypo name="chevron-small-right" size={24} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                    <ViewComponent style={[commonStyles.mb16]} />
                </ViewComponent>
            </CustomRBSheet>
            <CustomRBSheet
                refRBSheet={deleteConfirmSheetRef}
                height={"Medium"}
                modeltitle={true}
                title={"GLOBAL_CONSTANTS.CONFIRM_DELETE"}
            >
                <ViewComponent>
                    <ViewComponent style={[commonStyles.mxAuto, commonStyles.titleSectionGap, { width: s(80), height: s(80) }]}>
                        <DeleteMembersIcon width={s(80)} height={s(80)} />
                    </ViewComponent>
                    <ParagraphComponent
                        text={"GLOBAL_CONSTANTS.CONFIRM_DELETE_MSG"}
                        style={[commonStyles.bottomsheetsectiontitle, commonStyles.textCenter, commonStyles.sectionGap]}
                    />
                    <ViewComponent style={[commonStyles.titleSectionGap]} />

                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap10]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.NO"}
                                onPress={() => deleteConfirmSheetRef.current?.close()}
                                solidBackground={true}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.YES"}
                                onPress={confirmDelete}
                            />
                        </ViewComponent>
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.mb16]} />
                </ViewComponent>
            </CustomRBSheet>

            <CustomRBSheet
                refRBSheet={successSheetRef}
                height={"Large"}
                onClose={() => {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Dashboard", params: { initialTab: "GLOBAL_CONSTANTS.BANK", animation: 'slide_from_left' } }],
                        })
                    );
                }}
                draggable={false}
                closeOnPressMask={false}
            >
                <ViewComponent>
                    <CommonSuccess
                        successMessage="GLOBAL_CONSTANTS.ACCOUNT_CREATION_REQUEST_SUBMITTED_SUCCESSFULLY"
                        note="GLOBAL_CONSTANTS.NOTE_YOU_WILL_BE_NOTIFIED_ONCE_YOUR_REQUEST_IS_PROCESSED_THIS_MAY_TAKE_FEW_MUNITES"
                        buttonText="GLOBAL_CONSTANTS.OK"
                        buttonAction={() => successSheetRef.current?.close()}
                        showDeductionMessage={false}
                        amountIsDisplay={false}

                    />
                </ViewComponent>
            </CustomRBSheet>

            <AddCardsAddress
                isVisible={isAddAddressModalVisible}
                onClose={handleCloseAddAddressModal}
                onSaveSuccess={handleAddressSaveSuccess}
            />
        </ViewComponent>
    );
};

export default CardsKybInfoPreview;