import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, FlatList, BackHandler, Text } from 'react-native';
import { CommonActions, useIsFocused, useNavigation } from '@react-navigation/native';
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import { BankAccountService, BankCommonService } from "../../../../../../apiServices/bank";
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Field } from 'formik';
import { FORM_FIELD } from './constants';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import ViewComponent from '../../../../../../components/view/view';
import TextMultiLanguage from '../../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { PersonalDetails, Sector, Type, UboDirectorItem } from '../types/interface';
import { ReduxState } from '../../../interface';
import useMemberLogin from '../../../../../../hooks/userInfoHook';
import useEncryptDecrypt from '../../../../../../hooks/encDecHook';
import { BankKybService } from '../../../../../../apiServices/bank';
import { dateFormates, formatDates, isErrorDispaly } from '../../../../../../utils/helpers';
import { AddIcon, EditIcon } from '../../../../../../assets/svg';
import { s } from '../../../../../../components/theme/scale';
import InfoTooltip from '../../../../../../components/tooltip/InfoTooltip';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import ButtonComponent from '../../../../../../components/buttons/button';
import DeleteMembersIcon from '../../../../../../components/svgIcons/mainmenuicons/deleteitems';
import CustomRBSheet from '../../../../../../components/models/commonBottomSheet';
import LabelComponent from '../../../../../../components/textComponets/lableComponent/lable';
import CustomPicker from '../../../../../../components/customPicker/CustomPicker';
import { KybSectorTypeSchema } from '../../PersonalKyc';
import UploadDeleteIcon from '../../../../../../components/svgIcons/mainmenuicons/deleteicon';
import CommonTouchableOpacity from '../../../../../../components/touchableComponents/touchableOpacity';
import CustomeditLink from '../../../../../../components/svgIcons/mainmenuicons/linkedit';
import NoDataComponent from '../../../../../../components/noData/noData';
import ProgressHeader from '../../../../../../components/progressCircle/progressHeader';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import Container from '../../../../../../components/container/container';
import FilePreview from '../../../../../../components/fileUpload/filePreview';
import { setUboFormData } from '../../../../../../redux/actions/actions';
import CommonSuccess from '../../../../../commonScreens/successPage/commonSucces';
import DashboardLoader from '../../../../../../components/loader';
import Loadding from '../../../../../../components/skelton/skeltons';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import { allTransactionList } from '../../../../../../skeletons/skeltonViews';
import { useLngTranslation } from '../../../../../../hooks/languagesHook/useLngTranslation';
import { getTabsConfigation } from '../../../../../../../configuration';

// Required Label Component
const RequiredLabel = ({ text, style }: { text: string, style?: any, multiLanguageAllows?: boolean }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    return (
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
            <TextMultiLanguage style={style} text={text} />
            <Text style={[commonStyles.textred, commonStyles.fs14]}>*</Text>
        </ViewComponent>
    );
};

const BankKybInfoPreview = (props: any) => {
    const isFocused = useIsFocused();
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [persionalDetails, setPersionalDetails] = useState<PersonalDetails>({});
    const [selectedSector, setSelectedSector] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    // IP Address functionality temporarily disabled - not required by current business requirements
    // const [ipAddress, setIpAddress] = useState<string>('');
    const skeltons = allTransactionList(10);
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const userinfo = useSelector((state: ReduxState) => state.userReducer?.userDetails);
    const ref = useRef<ScrollView>(null);
    const navigation = useNavigation<any>();
    const { getMemDetails } = useMemberLogin();
    const { decryptAES, encryptAES } = useEncryptDecrypt();
    const { t } = useLngTranslation();
    const CommonConfig = getTabsConfigation('COMMON');
    // Safe decrypt function to handle both encrypted API data and unencrypted form data
    const safeDecrypt = (data: string | undefined): string => {
        if (!data) return '';
        try {
            // Try to decrypt - if it fails, return original data (it's already unencrypted)
            return decryptAES(data);
        } catch {
            // If decryption fails, return original data (form data is unencrypted)
            return data;
        }
    };
    const dispatch = useDispatch();
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const uboFormDataList = useSelector((state: ReduxState) => state.userReducer?.uboFormDataList || []);
    const directorFormDataList = useSelector((state: ReduxState) => state.userReducer?.directorFormDataList || []);
    const hasAccountCreationFee = useSelector((state: ReduxState) => state.userReducer?.hasAccountCreationFee);
    const documentsData = useSelector((state: ReduxState) => state.userReducer?.documentsData);
    const { selectedBank, selectedAddresses, /* ipAddress: storedIpAddress - IP functionality disabled */ deletedApiItems, sectors: storedSector, types: storedType } = useSelector((state: ReduxState) => state.userReducer);
    const [selectedItem, setSelectedItem] = useState<UboDirectorItem | null>(null);
    const actionSheetRef = useRef<any>(null);
    // IP Address sheet ref - disabled as IP functionality is not currently required
    // const ipSheetRef = useRef<any>(null);
    const deleteConfirmSheetRef = useRef<any>(null);
    const sectorTypeSheetRef = useRef<any>(null);
    const successSheetRef = useRef<any>(null);
    const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
    const BanksPermission = menuItems?.find((item: any) => item?.featureName.toLowerCase() === 'banks')?.isEnabled;

    // --- Accordion State Management ---
    const ACCORDION_KEYS = {
        UBO: 'UBO',
        DIRECTORS: 'DIRECTORS'
    };
    const [openAccordion, setOpenAccordion] = useState(ACCORDION_KEYS.UBO);
    const handleToggleAccordion = (key: any) => {
        setOpenAccordion(prevKey => (prevKey === key ? null : key));
    };

    // Initialize sector and type from Redux state on mount
    useEffect(() => {
        if (storedSector) setSelectedSector(storedSector);
        if (storedType) setSelectedType(storedType);
    }, [storedSector, storedType]);

    useEffect(() => {
        getPersionalDetails();
        fetchSectorsAndTypes();
        // IP Address initialization - disabled as functionality is not currently required
        // setIpAddress(storedIpAddress || '');

        // Fetch default addresses if none selected
        if (!selectedAddresses || selectedAddresses.length === 0) {
            fetchDefaultAddresses();
        }
    }, [isFocused, uboFormDataList, directorFormDataList]);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();

    }, [])


    const handleRefresh = useCallback(() => {
        // Clear Redux state and local state
        dispatch({ type: 'SET_UBO_FORM_DATA', payload: [] });
        dispatch({ type: 'SET_DIRECTOR_FORM_DATA', payload: [] });
        dispatch({ type: 'SET_DOCUMENTS_DATA', payload: null });
        dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: [] });
        dispatch({ type: 'SET_DELETED_API_ITEMS', payload: [] });
        dispatch({ type: 'SET_SECTORS', payload: '' });
        dispatch({ type: 'SET_TYPES', payload: '' });
        // Clear local state variables
        setSelectedSector('');
        setSelectedType('');
        getPersionalDetails();
        fetchSectorsAndTypes();
        getMemDetails(true)
    }, [dispatch])
    const fetchSectorsAndTypes = async () => {
        try {
            const [sectorsRes, typesRes] = await Promise.all([
                BankKybService.getSectorsLu(),
                BankKybService.gettypesLu()
            ]);

            if (sectorsRes?.ok) {
                const sectorsData = Array.isArray(sectorsRes.data) ? sectorsRes.data as Sector[] : [];
                setSectors(sectorsData);
            } else {
                setErrormsg(t('GLOBAL_CONSTANTS.FAILED_TO_LOAD_SECTORS'));
            }

            if (typesRes?.ok) {
                const typesData = Array.isArray(typesRes.data) ? typesRes.data as Type[] : [];
                setTypes(typesData);
            } else {
                setErrormsg(t('GLOBAL_CONSTANTS.FAILED_TO_LOAD_TYPES'));
            }
        } catch (error) {
            setErrormsg(t('GLOBAL_CONSTANTS.FAILED_TO_LOAD_LOOKUPS'));
        }
    };

    const fetchDefaultAddresses = async () => {
        try {
            const response = await BankCommonService.getAddressList();
            if (response?.ok && response.data && Array.isArray(response.data) && response.data.length > 0) {
                const firstAddress = response.data[0];
                dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: [firstAddress] });
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };

    const getPersionalDetails = async (): Promise<void> => {
        setErrormsg('')
        setLoadingData(true);

        try {
            const res = await BankKybService.kybInfoDetails(selectedBank.productId);
            if (res?.ok) {
                setPersionalDetails(res?.data || {});
                setLoadingData(false);
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

    const handleBack = useCallback(() => {
        props.handleBack();
    }, [navigation, dispatch]);
    const validateDocuments = (): string[] => {
        const requirements = getRequirements();

        // Only validate documents if they are required
        if (!requirements.showPFC && !requirements.showPPHS && !requirements.showNationalId) {
            return [];
        }

        const errors: string[] = [];
        const hasApiDocs = persionalDetails?.businessCustomerDetails?.kybDocs && persionalDetails.businessCustomerDetails.kybDocs.length > 0;
        const hasPassport = documentsData?.passport;
        const hasNationalId = documentsData?.nationalId;

        if (!hasApiDocs && !hasPassport && !hasNationalId) {
            errors.push(t('GLOBAL_CONSTANTS.PLEASE_ADD_ONE_DOCUMENT'));
        }

        return errors;
    };

    const getRequirements = () => {
        const requirementString = (persionalDetails as any)?.kyc?.requirement;
        const requirements = requirementString ? requirementString.toLowerCase().split(',') : [];
        return {
            showFullName: requirements.includes('fullname'),
            showBasic: requirements.includes('basic'),
            showAddress: requirements.includes('address'),
            showUBO: requirements.includes('ubo'),
            showDirector: requirements.includes('director'),
            showPFC: requirements.includes('pfc'),
            showPPHS: requirements.includes('pphs'),
            showNationalId: requirements.includes('ni')
        };
    };

    const validateUbos = (): string[] => {
        const requirements = getRequirements();
        if (!requirements.showUBO) return [];

        // Priority 1: Check API data first
        const apiUbo = persionalDetails?.kyb?.ubo;
        const isApiUboDeleted = apiUbo?.id ? (deletedApiItems || []).includes(apiUbo?.id) : false;
        if (apiUbo && !isApiUboDeleted) {
            const isPassportDoc = apiUbo?.docDetails?.type?.toLowerCase() === 'passport';
            const hasCompleteApiUbo = (
                (apiUbo?.firstName?.trim?.() !== '') &&
                (apiUbo?.email?.trim?.() !== '') &&
                (apiUbo?.phoneNumber?.trim?.() !== '') &&
                (apiUbo?.dob?.trim?.() !== '') &&
                (apiUbo?.country?.trim?.() !== '') &&
                (apiUbo?.shareHolderPercentage !== null && apiUbo?.shareHolderPercentage !== undefined) &&
                (apiUbo?.docDetails?.type?.trim() !== '') &&
                (apiUbo?.docDetails?.frontImage?.trim() !== '') &&
                (isPassportDoc || apiUbo?.docDetails?.backImage?.trim() !== '')
            );
            if (hasCompleteApiUbo) {
                const shareHolderPercentage = parseFloat(String(apiUbo.shareHolderPercentage || 0));
                const email = apiUbo.email ? safeDecrypt(apiUbo.email) : '';

                if (shareHolderPercentage < 25) {
                    return [`${t('GLOBAL_CONSTANTS.UBO')} 1 (${email}): ${t('GLOBAL_CONSTANTS.VALUE_MUST_25_OR_MORE')} (${t('GLOBAL_CONSTANTS.CURRENTLY')} ${shareHolderPercentage}%)`];
                }
                return [];
            }
        }

        // Priority 2: Check Redux if API is incomplete or empty

        if (uboFormDataList.length > 0) {
            // Check if Redux data has all mandatory fields
            const hasCompleteReduxUbo = uboFormDataList.some(item => {
                const isPassportDoc = item.docType?.toLowerCase() === 'passport';
                const isComplete = item.firstName && item.lastName && item.email &&
                    item.phoneCode && item.phoneNumber && item.country &&
                    item.shareHolderPercentage && item.docType && item.docNumber &&
                    item.frontId && (isPassportDoc || item.backImgId);
                return isComplete;
            });
            if (hasCompleteReduxUbo) {
                // Check share percentage for complete Redux data
                const errors: string[] = [];
                uboFormDataList.forEach((ubo: any, index: number) => {
                    const shareHolderPercentage = parseFloat(ubo.shareHolderPercentage || 0);
                    const email = ubo.email ? safeDecrypt(ubo.email) : (ubo.email || '');

                    if (shareHolderPercentage < 25) {
                        errors.push(`${t('GLOBAL_CONSTANTS.UBO')} ${index + 1} (${email}): ${t('GLOBAL_CONSTANTS.VALUE_MUST_25_OR_MORE')} (${t('GLOBAL_CONSTANTS.CURRENTLY')} ${shareHolderPercentage}%)`);
                    }
                });
                return errors; // Return percentage errors or empty array
            }
            // Redux has data but incomplete
            return [t('GLOBAL_CONSTANTS.UBO_DETAILS_INCOMPLETE')];
        }

        // Neither API nor Redux has complete data
        return [t('GLOBAL_CONSTANTS.UBO_DETAILS_MANDTORY')];
    };

    const validateDirectors = (): string[] => {
        const requirements = getRequirements();
        if (!requirements.showDirector) return [];

        // Only validate Director if UBO validation passes
        const uboErrors = validateUbos();
        if (uboErrors.length > 0) return []; // Don't show Director errors until UBO is satisfied

        // Priority 1: Check API data first
        const apiDirector = persionalDetails?.kyb?.director;
        const isApiDirectorDeleted = apiDirector?.id ? (deletedApiItems || []).includes(apiDirector?.id) : false;
        if (apiDirector && !isApiDirectorDeleted) {
            const isPassportDoc = apiDirector?.docDetails?.type?.toLowerCase() === 'passport';
            const hasCompleteApiDirector = (
                (apiDirector?.firstName?.trim?.() !== '') &&
                (apiDirector?.email?.trim?.() !== '') &&
                (apiDirector?.phoneNumber?.trim?.() !== '') &&
                (apiDirector?.dob?.trim?.() !== '') &&
                (apiDirector?.country?.trim?.() !== '') &&
                (apiDirector?.shareHolderPercentage !== null && apiDirector?.shareHolderPercentage !== undefined) &&
                (apiDirector?.docDetails?.type?.trim() !== '') &&
                (apiDirector?.docDetails?.frontImage?.trim() !== '') &&
                (isPassportDoc || apiDirector?.docDetails?.backImage?.trim() !== '')
            );

            if (hasCompleteApiDirector) {
                const shareHolderPercentage = parseFloat(String(apiDirector.shareHolderPercentage || 0));
                const email = apiDirector.email ? safeDecrypt(apiDirector.email) : '';

                if (shareHolderPercentage < 25) {
                    return [`${t('GLOBAL_CONSTANTS.DIRECTOR')} 1 (${email}): ${t('GLOBAL_CONSTANTS.VALUE_MUST_25_OR_MORE')} (${t('GLOBAL_CONSTANTS.CURRENTLY')} ${shareHolderPercentage}%)`];
                }
                return [];
            }
        }

        // Priority 2: Check Redux if API is incomplete or empty
        if (directorFormDataList.length > 0) {
            const hasCompleteReduxDirector = directorFormDataList.some(item => {
                const isPassportDoc = item.docType?.toLowerCase() === 'passport';
                return item.firstName && item.lastName && item.email &&
                    item.phoneCode && item.phoneNumber && item.country &&
                    item.shareHolderPercentage && item.docType && item.docNumber &&
                    item.frontId && (isPassportDoc || item.backImgId);
            });
            if (hasCompleteReduxDirector) {
                // Check share percentage for complete Redux data
                const errors: string[] = [];
                directorFormDataList.forEach((director: any, index: number) => {
                    const shareHolderPercentage = parseFloat(director.shareHolderPercentage || 0);
                    const email = director.email ? safeDecrypt(director.email) : (director.email || '');

                    if (shareHolderPercentage < 25) {
                        errors.push(`${t('GLOBAL_CONSTANTS.DIRECTOR')} ${index + 1} (${email}): ${t('GLOBAL_CONSTANTS.VALUE_MUST_25_OR_MORE')} (${t('GLOBAL_CONSTANTS.CURRENTLY')} ${shareHolderPercentage}%)`);
                    }
                });
                return errors; // Return percentage errors or empty array
            }
            // Redux has data but incomplete
            return [t('GLOBAL_CONSTANTS.DIRECTOR_DETAILS_INCOMPLETE')];
        }

        // Neither API nor Redux has complete data
        return [t('GLOBAL_CONSTANTS.DIRECTOR_DETAILS_MANDTORY')];
    };

    const validateAddresses = (): string[] => {
        const requirements = getRequirements();
        if (!requirements.showAddress) return [];

        // Check both Redux addresses and if API call was successful
        const hasReduxAddresses = selectedAddresses && selectedAddresses.length >= 2;

        if (!hasReduxAddresses) {
            return [t('GLOBAL_CONSTANTS.PLEASE_SELECT_AT_LEAST_TWO_ADDRESSES')];
        }
        return [];
    };

    const validateSharePercentages = (): string[] => {
        const requirements = getRequirements();
        if (!requirements.showUBO && !requirements.showDirector) return [];

        let totalPercentage = 0;

        // Get UBO percentages
        const uboData = getUboData();
        uboData.forEach((ubo: any) => {
            const percentage = parseFloat(ubo.shareHolderPercentage || 0);
            if (!isNaN(percentage)) {
                totalPercentage += percentage;
            }
        });

        // Get Director percentages
        const directorData = getDirectorData();
        directorData.forEach((director: any) => {
            const percentage = parseFloat(director.shareHolderPercentage || 0);
            if (!isNaN(percentage)) {
                totalPercentage += percentage;
            }
        });

        if (totalPercentage > 100) {
            return [`${t('GLOBAL_CONSTANTS.TOTAL_SHARE_PERCENTAGE_EXCEEDS_100')} ${totalPercentage}%.`];
        }

        return [];
    };

    const validateSectorAndType = (): string[] => {
        const errors: string[] = [];

        // Check if lookups are loaded
        if (sectors.length === 0) {
            errors.push(`${t('GLOBAL_CONSTANTS.ADDITIONAL_INFORMATION')} ${t('GLOBAL_CONSTANTS.SECTORS_NOT_LOADED')}`);
        }
        if (types.length === 0) {
            errors.push(`${t('GLOBAL_CONSTANTS.ADDITIONAL_INFORMATION')} ${t('GLOBAL_CONSTANTS.TYPES_NOT_LOADED')}`);
        }

        // Check if values are selected
        if (!selectedSector) {
            errors.push(`${t('GLOBAL_CONSTANTS.ADDITIONAL_INFORMATION')} ${t('GLOBAL_CONSTANTS.SECTOR_REQUIRED')}`);
        }
        if (!selectedType) {
            errors.push(`${t('GLOBAL_CONSTANTS.ADDITIONAL_INFORMATION')} ${t('GLOBAL_CONSTANTS.TYPE_REQUIRED')}`);
        }

        return errors;
    };

    // IP Address validation - disabled as functionality is not currently required
    // Business decided IP address collection is not mandatory for KYB process
    // const validateIPAddress = (): string[] => {
    //     if (!ipAddress || ipAddress.trim() === '') {
    //         return [t('GLOBAL_CONSTANTS.IP_ADDRESS_REQUIRED')];
    //     }
    //     return [];
    // };

    const handleSubmit = async () => {
        setSubmitLoading(true);
        // Sequential validation: UBO first, then Director
        const uboErrors = validateUbos();
        const directorErrors = validateDirectors();

        const validationErrors = [
            ...validateSectorAndType(),
            ...validateDocuments(),
            // IP Address validation - disabled as functionality is not currently required
            // ...validateIPAddress(),
            ...uboErrors,
            ...directorErrors,
            ...validateAddresses(),
            ...validateSharePercentages(),

        ];

        if (validationErrors.length > 0) {
            setErrormsg(validationErrors.join(', '));
            ref?.current?.scrollTo({ y: 0, animated: true });
            setSubmitLoading(false);
            return;
        }

        if (hasAccountCreationFee === false || hasAccountCreationFee === "false" || hasAccountCreationFee === undefined || hasAccountCreationFee === null || parseFloat(String(hasAccountCreationFee)) <= 0) {
            // Direct submit - call summaryAccountCreation API
            await handleDirectSubmit();
            return;
        } else {
            // Normal flow - navigate to payment
            setSubmitLoading(false);
            navigation.navigate(props?.targetScreen, { ...props, ...props?.route?.params, animation: 'slide_from_right' });
        }
    }
    const handleDirectSubmit = async () => {
        const isPersonal = userinfo?.accountType?.toLowerCase() === "personal";

        // Convert documents object to array format for API
        const processedDocuments = [];
        if (documentsData?.passport) {
            processedDocuments.push({
                documentType: "Passport",
                frontImage: documentsData.passport.frontImage,
                backDocImage: documentsData.passport.backImage,
                handHoldingImage: documentsData.passport.handHoldingImage,
                singatureImage: documentsData.passport.signatureImage,
                selfieImage: documentsData.passport.selfieImage,
                docId: documentsData.passport.docNumber,
                docExpiryDate: documentsData.passport.docExpiryDate
            });
        }
        if (documentsData?.nationalId) {
            processedDocuments.push({
                documentType: "national Id",
                frontImage: documentsData.nationalId.frontImage,
                backDocImage: documentsData.nationalId.backImage,
                docId: documentsData.nationalId.docNumber,
                docExpiryDate: documentsData.nationalId.docExpiryDate
            });
        }

        // Transform UBO data to match target structure
        const transformedUboData = (getUboData() || []).map((ubo: any) => ({
            id: ubo.id,
            uboPosition: ubo.uboPosition,
            firstName: ubo.firstName,
            lastName: ubo.lastName,
            middleName: ubo.middleName || null,
            dob: ubo.dob,
            phoneCode: encryptAES(ubo.phoneCode),
            phoneNumber: encryptAES(ubo.phoneNumber),
            email: encryptAES(ubo.email),
            country: ubo.country,
            shareHolderPercentage: ubo.shareHolderPercentage,
            note: ubo.note || null,
            recordStatus: "Modified",
            docDetails: {
                id: ubo.docDetailsid || "00000000-0000-0000-0000-000000000000",
                frontImage: ubo.frontId,
                backImage: ubo.backImgId || null,
                type: ubo.docType,
                number: encryptAES(ubo.docNumber),
                expiryDate: ubo.docExpiryDate
            }
        }));

        // Transform Director data to match target structure
        const transformedDirectorData = (getDirectorData() || []).map((director: any) => ({
            id: director.id,
            uboPosition: director.uboPosition,
            firstName: director.firstName,
            lastName: director.lastName,
            middleName: director.middleName || null,
            dob: director.dob,
            phoneCode: encryptAES(director.phoneCode),
            phoneNumber: encryptAES(director.phoneNumber),
            email: encryptAES(director.email),
            country: director.country,
            shareHolderPercentage: director.shareHolderPercentage,
            note: director.note || null,
            recordStatus: "Modified",
            docDetails: {
                id: director.docDetailsid || "00000000-0000-0000-0000-000000000000",
                frontImage: director.frontId,
                backImage: director.backImgId || null,
                type: director.docType,
                number: encryptAES(director.docNumber),
                expiryDate: director.docExpiryDate
            }
        }));

        const payload = {
            walletId: null,
            amount: 0,
            documents: processedDocuments,
            address: selectedAddresses || [],
            ubo: transformedUboData,
            director: transformedDirectorData,
            isTradingAddress: !isPersonal,
            isReapply: false,
            sector: selectedSector,
            type: selectedType
        };

        try {
            const response = await BankAccountService.summaryAccountCreation(
                selectedBank?.productId,
                payload
            );

            if (response?.ok) {
                // Success - show success screen
                setSubmitLoading(false);
                successSheetRef.current?.open();
            } else {
                setErrormsg(isErrorDispaly(response));
                ref?.current?.scrollTo({ y: 0, animated: true });
                setSubmitLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            ref?.current?.scrollTo({ y: 0, animated: true });
            setSubmitLoading(false);
        }
    };
    const handleUbosEdit = (id: string): void => {
        closeAllSheetsAndNavigate(() =>
            navigation.navigate('BankKybAddUbosDetailsForm', {
                ...props,
                ...props?.route?.params,
                customerId: userinfo?.id,
                id: id,
                editUbo: true,
                isDirector: false,
                animation: 'slide_from_left'
            })
        );
    }
    const handleUbosDelete = useCallback((id: string): void => {
        // Delete from Redux if exists
        if (uboFormDataList.length > 0) {
            const updatedList = uboFormDataList.filter((item: UboDirectorItem) => item?.id !== id);
            dispatch(setUboFormData(updatedList));
        }
        // Always mark API item as deleted (handles both cases)
        const newDeletedItems = [...(deletedApiItems || []), id];
        dispatch({ type: 'SET_DELETED_API_ITEMS', payload: newDeletedItems });
        actionSheetRef.current?.close();
    }, [uboFormDataList, dispatch, deletedApiItems])

    const handleDirectorsEdit = (id: string): void => {
        closeAllSheetsAndNavigate(() =>
            navigation.navigate('BankKybAddUbosDetailsForm', {
                ...props,
                id: id,
                editDirector: true,
                isDirector: true,
                animation: 'slide_from_left'
            })
        );
    }
    const handleDirectorsDelete = useCallback((id: string): void => {
        // Delete from Redux if exists
        if (directorFormDataList.length > 0) {
            const updatedDirectorList = directorFormDataList.filter((item: UboDirectorItem) => item?.id !== id);
            dispatch({ type: 'SET_DIRECTOR_FORM_DATA', payload: updatedDirectorList });
        }
        // Always mark API item as deleted (handles both cases)
        const newDeletedItems = [...(deletedApiItems || []), id];
        dispatch({ type: 'SET_DELETED_API_ITEMS', payload: newDeletedItems });
        actionSheetRef.current?.close();
    }, [directorFormDataList, dispatch, deletedApiItems])

    const handleItemPress = (item: UboDirectorItem, isDirector: boolean = false) => {
        // Close all other sheets first
        // ipSheetRef.current?.close();
        deleteConfirmSheetRef.current?.close();

        setSelectedItem({ ...item, isDirector });
        actionSheetRef.current?.open();
    };

    const handleEdit = () => {
        actionSheetRef.current?.close();
        if (selectedItem) {
            if (selectedItem.isDirector) {
                handleDirectorsEdit(selectedItem.id);
            } else {
                handleUbosEdit(selectedItem.id);
            }
        }
    };

    const handleDelete = () => {
        actionSheetRef.current?.close();
        deleteConfirmSheetRef.current?.open();
    };

    const confirmDelete = () => {
        if (selectedItem) {
            if (selectedItem.isDirector) {
                handleDirectorsDelete(selectedItem.id);
            } else {
                handleUbosDelete(selectedItem.id);
            }
        }
        deleteConfirmSheetRef.current?.close();
    };

    const renderFooter = () => {
        if (!loadingData) {
            return null;
        }
        return (
            <Loadding contenthtml={skeltons} />
        )


    }
    const noData = () => {
        if (!loadingData && !hasUbo()) {
            return <NoDataComponent />;
        }
        return null;
    }
    const directorsNoData = () => {
        if (!loadingData && !hasDirector()) {
            return <NoDataComponent />;
        }
        return null;
    }
    const addressNoData = () => <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_ADDRESSES_SELECTED"} />
    const handleAddUbos = () => {
        closeAllSheetsAndNavigate(() =>
            navigation.navigate('BankKybAddUbosDetailsForm', { addDirector: false, animation: 'slide_from_left' })
        );
    };
    const handleAddDirectors = () => {
        closeAllSheetsAndNavigate(() =>
            navigation.navigate('BankKybAddUbosDetailsForm', { addDirector: true, clearForm: true, animation: 'slide_from_left' })
        );
    };

    // Check if UBO/Director already exists - prioritize Redux over API
    const hasUbo = () => {
        if (uboFormDataList.length > 0) return true;
        return persionalDetails?.kyb?.ubo &&
            !(deletedApiItems || []).includes(persionalDetails.kyb.ubo.id) && (
                (persionalDetails?.kyb?.ubo?.firstName && persionalDetails?.kyb?.ubo?.firstName?.trim?.() !== '') ||
                (persionalDetails?.kyb?.ubo?.email && persionalDetails?.kyb?.ubo?.email?.trim?.() !== '') ||
                (persionalDetails?.kyb?.ubo?.phoneNumber && persionalDetails?.kyb?.ubo?.phoneNumber?.trim?.() !== '')
            );
    };

    const hasDirector = () => {
        if (directorFormDataList.length > 0) return true;
        return persionalDetails?.kyb?.director &&
            !(deletedApiItems || []).includes(persionalDetails.kyb.director.id) && (
                (persionalDetails?.kyb?.director?.firstName && persionalDetails?.kyb?.director?.firstName?.trim?.() !== '') ||
                (persionalDetails?.kyb?.director?.email && persionalDetails?.kyb?.director?.email?.trim?.() !== '') ||
                (persionalDetails?.kyb?.director?.phoneNumber && persionalDetails?.kyb?.director?.phoneNumber?.trim?.() !== '')
            );
    };

    // Get UBO data - combine API and Redux data
    const getUboData = () => {
        const combinedData = [];
        const addedIds = new Set();
        const addedBeneficiaryIds = new Set();

        // Prioritize Redux data first (more complete)
        if (uboFormDataList.length > 0) {
            uboFormDataList.forEach(item => {
                if (!addedIds.has(item.id) && !addedBeneficiaryIds.has(item.beneficiaryId)) {
                    combinedData.push(item);
                    addedIds.add(item.id);
                    if (item.beneficiaryId) addedBeneficiaryIds.add(item.beneficiaryId);
                }
            });
        }

        // Add API data only if not already added and not deleted
        if (persionalDetails?.kyb?.ubo &&
            !(deletedApiItems || []).includes(persionalDetails.kyb.ubo.id) &&
            !addedIds.has(persionalDetails.kyb.ubo.id) &&
            !addedBeneficiaryIds.has(persionalDetails.kyb.ubo.beneficiaryId)) {
            combinedData.push(persionalDetails.kyb.ubo);
        }
        return combinedData;
    };

    // Get Director data - combine API and Redux data
    const getDirectorData = () => {
        const combinedData = [];
        const addedIds = new Set();
        const addedBeneficiaryIds = new Set();

        // Prioritize Redux data first (more complete)
        if (directorFormDataList.length > 0) {
            directorFormDataList.forEach(item => {
                if (!addedIds.has(item.id) && !addedBeneficiaryIds.has(item.beneficiaryId)) {
                    combinedData.push(item);
                    addedIds.add(item.id);
                    if (item.beneficiaryId) addedBeneficiaryIds.add(item.beneficiaryId);
                }
            });
        }

        // Add API data only if not already added and not deleted
        if (persionalDetails?.kyb?.director &&
            !(deletedApiItems || []).includes(persionalDetails.kyb.director.id) &&
            !addedIds.has(persionalDetails.kyb.director.id) &&
            !addedBeneficiaryIds.has(persionalDetails.kyb.director.beneficiaryId)) {
            combinedData.push(persionalDetails.kyb.director);
        }
        return combinedData;
    };
    const handleAddDocuments = () => {
        closeAllSheetsAndNavigate(() =>
            navigation.navigate('BankKybDocumentsStep', { animation: 'slide_from_left' })
        );
    };
    const handleAddAddress = () => {
        closeAllSheetsAndNavigate(() =>
            navigation.navigate('AddressListScreen', { ProgramID: userinfo?.id, animation: 'slide_from_left', ...props, ...props?.route?.params })
        );
    };
    const handleError = useCallback(() => {
        setErrormsg(null)
    }, []);

    const closeAllSheetsAndNavigate = useCallback((navigationFn: () => void) => {
        actionSheetRef.current?.close();
        // ipSheetRef.current?.close();
        deleteConfirmSheetRef.current?.close();
        sectorTypeSheetRef.current?.close();
        navigationFn();
    }, []);

    // Helper component for accordion headers
    type AccordionHeaderProps = {
        sectionKey: string;
        title: string;
        onAdd: () => void;
    };

    const handleSectorTypeEdit = () => {
        // Close all other sheets first
        actionSheetRef.current?.close();
        deleteConfirmSheetRef.current?.close();
        sectorTypeSheetRef.current?.open();
    };

    const renderDocumentSection = () => {
        const apiDocs = persionalDetails?.businessCustomerDetails?.kybDocs || [];
        const hasPassport = documentsData?.passport;
        const hasNationalId = documentsData?.nationalId;
        const hasApiDocs = apiDocs.length > 0;

        if (!hasPassport && !hasNationalId && !hasApiDocs) {
            return (
                <ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.PASSPORT" />
                        <ParagraphComponent style={[commonStyles.listprimarytext]} text="--" />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.listitemGap]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.NATIONAL_ID" />
                        <ParagraphComponent style={[commonStyles.listprimarytext]} text="--" />
                    </ViewComponent>
                </ViewComponent>
            );
        }

        return (
            <ViewComponent>
                {/* API Documents */}
                {hasApiDocs && (
                    <FlatList
                        data={apiDocs}
                        renderItem={({ item, index }) => (
                            <ViewComponent key={index}>
                                {item?.url && (
                                    <ViewComponent style={[commonStyles.formItemSpace]}>
                                        <FilePreview label={item?.docType || ''} uploadedImageUri={item?.url} />
                                    </ViewComponent>
                                )}
                            </ViewComponent>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                        scrollEnabled={false}
                    />
                )}

                {/* Passport Section */}
                {hasPassport && (
                    <ViewComponent>
                        <ParagraphComponent style={[commonStyles.fs18, commonStyles.fw600, commonStyles.textWhite, commonStyles.mb16]} text="Passport" />

                        {/* Document Details */}
                        {documentsData?.passport?.docNumber && (
                            <ViewComponent style={[]}>
                                <TextMultiLanguage style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.DOCUMENT_NUMBER" />
                                <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw500, commonStyles.mt8, commonStyles.textWhite]} text={documentsData.passport.docNumber} />
                            </ViewComponent>
                        )}
                        {documentsData?.passport?.docExpiryDate && (
                            <ViewComponent style={[commonStyles.mb16]}>
                                <TextMultiLanguage style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE" />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={formatDates(documentsData.passport.docExpiryDate, dateFormates?.date)} />
                            </ViewComponent>
                        )}
                        {documentsData?.passport?.dateOfBirth && (
                            <ViewComponent style={[commonStyles.mb16]}>
                                <TextMultiLanguage style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.DATE_OF_BIRTH" />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={formatDates(documentsData.passport.dateOfBirth, dateFormates?.date)} />
                            </ViewComponent>
                        )}

                        {/* Document Images */}
                        {documentsData?.passport?.frontImage && (
                            <ViewComponent style={[commonStyles.formItemSpace]}>
                                <FilePreview label="GLOBAL_CONSTANTS.FRONT_ID_PHOTO" uploadedImageUri={documentsData.passport.frontImage} />
                            </ViewComponent>
                        )}
                        {documentsData?.passport?.backImage && (
                            <ViewComponent style={[commonStyles.formItemSpace]}>
                                <FilePreview label="GLOBAL_CONSTANTS.BACK_ID_PHOTO" uploadedImageUri={documentsData.passport.backImage} />
                            </ViewComponent>
                        )}
                        {documentsData?.passport?.handHoldingImage && (
                            <ViewComponent style={[commonStyles.formItemSpace]}>
                                <FilePreview label="GLOBAL_CONSTANTS.HAND_HOLDING_ID" uploadedImageUri={documentsData.passport.handHoldingImage} />
                            </ViewComponent>
                        )}
                        {documentsData?.passport?.selfieImage && (
                            <ViewComponent style={[commonStyles.formItemSpace]}>
                                <FilePreview label="GLOBAL_CONSTANTS.SELFIE" uploadedImageUri={documentsData.passport.selfieImage} />
                            </ViewComponent>
                        )}
                        {documentsData?.passport?.signatureImage && (
                            <ViewComponent style={[commonStyles.formItemSpace]}>
                                <FilePreview label="GLOBAL_CONSTANTS.SIGNATURE" uploadedImageUri={documentsData.passport.signatureImage} />
                            </ViewComponent>
                        )}
                    </ViewComponent>
                )}

                {/* National ID Section */}
                {hasNationalId && (
                    <ViewComponent style={hasPassport ? [commonStyles.mt24] : {}}>
                        <TextMultiLanguage style={[commonStyles.fs18, commonStyles.fw600, commonStyles.textWhite, commonStyles.mb16]} text="GLOBAL_CONSTANTS.NATIONAL_ID" />

                        {/* Document Details */}
                        {documentsData?.nationalId?.docNumber && (
                            <ViewComponent style={[]}>
                                <TextMultiLanguage style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.DOCUMENT_NUMBER" />
                                <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw500, commonStyles.mt8, commonStyles.textWhite]} text={documentsData.nationalId.docNumber} />
                            </ViewComponent>
                        )}
                        {documentsData?.nationalId?.docExpiryDate && (
                            <ViewComponent style={[commonStyles.mb16]}>
                                <TextMultiLanguage style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE" />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={formatDates(documentsData.nationalId.docExpiryDate, dateFormates?.date)} />
                            </ViewComponent>
                        )}

                        {/* Document Images */}
                        {documentsData?.nationalId?.frontImage && (
                            <ViewComponent style={[commonStyles.formItemSpace]}>
                                <FilePreview label="GLOBAL_CONSTANTS.FRONT_ID_PHOTO" uploadedImageUri={documentsData.nationalId.frontImage} />
                            </ViewComponent>
                        )}
                        {documentsData?.nationalId?.backImage && (
                            <ViewComponent style={[commonStyles.formItemSpace]}>
                                <FilePreview label="GLOBAL_CONSTANTS.BACK_ID_PHOTO" uploadedImageUri={documentsData.nationalId.backImage} />
                            </ViewComponent>
                        )}
                    </ViewComponent>
                )}
            </ViewComponent>
        );
    };
    const editCodintion = userinfo?.kycStatus == null || userinfo?.kycStatus == "Draft" || userinfo?.kycStatus == "Submitted" || userinfo?.kycStatus == "Under Review";
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loadingData && <DashboardLoader />}
            {!loadingData && <Container style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.KYB_INFORMATION"} onBackPress={handleBack} isrefresh={true} onRefresh={handleRefresh} />
                <ScrollView ref={ref} showsVerticalScrollIndicator={false}>
                    <>
                        {editCodintion && <ViewComponent >
                            <ProgressHeader title={"GLOBAL_CONSTANTS.RIVIEW"} progress={5} total={5} showBadge={true} status={userinfo?.kycStatus ?? ''} />
                        </ViewComponent>}
                        {errormsg && <><ErrorComponent message={errormsg} onClose={handleError} />
                        </>}
                        {(persionalDetails && !loadingData) && <ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap, commonStyles.alignCenter]}>
                                <ParagraphComponent style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.COMPANY_INFORMATION"} />
                            </ViewComponent>
                            <ViewComponent style={[]}>

                                {(persionalDetails?.kyb || persionalDetails?.kyc?.basic) &&
                                    <>
                                        {persionalDetails?.kyb?.companyName && (
                                            <>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.COMAPANY_NAME"} />
                                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={safeDecrypt(persionalDetails?.kyb?.companyName) || "--"} />
                                                </ViewComponent>
                                                <ViewComponent style={[commonStyles.listitemGap]} />
                                            </>
                                        )}

                                        {persionalDetails?.kyb?.registrationNumber && (
                                            <>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.REGISTRATION_NUMBER"} />
                                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={safeDecrypt(persionalDetails?.kyb?.registrationNumber) || "--"} />
                                                </ViewComponent>
                                                <ViewComponent style={[commonStyles.listitemGap]} />
                                            </>
                                        )}
                                        {persionalDetails?.kyb?.incorporationDate && (
                                            <>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DATE_OF_REGISTRATION"} />
                                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={formatDates(persionalDetails.kyb.incorporationDate, dateFormates?.date)} />
                                                </ViewComponent>
                                                <ViewComponent style={[commonStyles.listitemGap]} />
                                            </>
                                        )}
                                        {persionalDetails?.kyc?.requirement?.toLowerCase()?.includes('basic') && (
                                            <>
                                                {persionalDetails?.kyc?.basic?.country && (
                                                    <>
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.COUNTRY"} />
                                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails.kyc.basic.country} />
                                                        </ViewComponent>
                                                        <ViewComponent style={[commonStyles.listitemGap]} />
                                                    </>
                                                )}
                                                {persionalDetails?.kyc?.basic?.phoneNo && (
                                                    <>
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} />
                                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={(() => {
                                                                const phoneCode = safeDecrypt(persionalDetails.kyc.basic.phoneCode);
                                                                const phoneNo = safeDecrypt(persionalDetails.kyc.basic.phoneNo);
                                                                const formattedCode = phoneCode?.startsWith?.('+') ? phoneCode : `+${phoneCode}`;
                                                                return `${formattedCode} ${phoneNo}`;
                                                            })()} />
                                                        </ViewComponent>
                                                        <ViewComponent style={[commonStyles.listitemGap]} />
                                                    </>
                                                )}
                                                {persionalDetails?.kyc?.basic?.email && (
                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.EMAIL"} />
                                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={safeDecrypt(persionalDetails.kyc.basic.email)} />
                                                    </ViewComponent>
                                                )}
                                            </>
                                        )}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.lastName && <ViewComponent style={[commonStyles.listitemGap]} />}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.lastName && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.LAST_NAME"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.businessCustomerDetails?.addressDetails?.lastName || "--"} />
                                        </ViewComponent>}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.country && <ViewComponent style={[commonStyles.listitemGap]} />}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.country && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.COUNTRY"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.businessCustomerDetails?.addressDetails?.country || "--"} />
                                        </ViewComponent>}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.state && <ViewComponent style={[commonStyles.listitemGap]} />}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.state && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.STATE"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.businessCustomerDetails?.addressDetails?.state || "--"} />
                                        </ViewComponent>}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.town && <ViewComponent style={[commonStyles.listitemGap]} />}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.town && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TOWN"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.businessCustomerDetails?.addressDetails?.town || "--"} />
                                        </ViewComponent>}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.city && <ViewComponent style={[commonStyles.listitemGap]} />}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.city && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.CITY"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.businessCustomerDetails?.addressDetails?.city || "--"} />
                                        </ViewComponent>}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.addressLine1 && <ViewComponent style={[commonStyles.listitemGap]} />}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.addressLine1 && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ADDRESS_LINE1"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.businessCustomerDetails?.addressDetails?.addressLine1 || "--"} />
                                        </ViewComponent>}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.addressLine2 && <ViewComponent style={[commonStyles.listitemGap]} />}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.addressLine2 && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ADDRESS_LINE2"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.businessCustomerDetails?.addressDetails?.addressLine2 || "--"} />
                                        </ViewComponent>}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.postalCode && <ViewComponent style={[commonStyles.listitemGap]} />}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.postalCode && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.POSTAL_CODE"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={safeDecrypt(persionalDetails?.businessCustomerDetails?.addressDetails?.postalCode) || "--"} />
                                        </ViewComponent>}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.phoneNumber && <ViewComponent style={[commonStyles.listitemGap]} />}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.phoneNumber && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={(() => {
                                                const phoneCode = safeDecrypt(persionalDetails?.businessCustomerDetails?.addressDetails?.phoneCode);
                                                const phoneNumber = safeDecrypt(persionalDetails?.businessCustomerDetails?.addressDetails?.phoneNumber);
                                                const formattedCode = phoneCode?.startsWith?.('+') ? phoneCode : `+${phoneCode}`;
                                                return `${formattedCode} ${phoneNumber}`;
                                            })()} />
                                        </ViewComponent>}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.email && <ViewComponent style={[commonStyles.listitemGap]} />}
                                        {persionalDetails?.businessCustomerDetails?.addressDetails?.email && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.EMAIL"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={safeDecrypt(persionalDetails?.businessCustomerDetails?.addressDetails?.email) || "--"} />
                                        </ViewComponent>}
                                    </>
                                }</ViewComponent>
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            {!persionalDetails?.kyb && !persionalDetails?.kyc?.basic && <NoDataComponent />}

                            {/* Additional Info Section */}
                            <ViewComponent>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap, commonStyles.alignCenter]}>
                                    <RequiredLabel text={"GLOBAL_CONSTANTS.ADDITIONAL_INFO"} style={[commonStyles.sectionTitle]} />
                                    <ViewComponent style={[commonStyles.mt6]}>
                                        {(storedSector && storedType) ? (
                                            <CommonTouchableOpacity onPress={handleSectorTypeEdit}>
                                                <ViewComponent >
                                                    <CustomeditLink />
                                                </ViewComponent>
                                            </CommonTouchableOpacity>
                                        ) : (
                                            <CommonTouchableOpacity onPress={handleSectorTypeEdit}>
                                                <ViewComponent style={[commonStyles.actioniconbg]}  >
                                                    <AddIcon />
                                                </ViewComponent>
                                            </CommonTouchableOpacity>
                                        )}
                                    </ViewComponent>
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.sectionGap]}>
                                    <ViewComponent>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.SECTOR"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={storedSector || "--"} />
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.listitemGap]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TYPE"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={storedType || "--"} />
                                        </ViewComponent>
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent>

                            {/* 
                            IP Address Section - Temporarily Disabled                            
                            Reason: Business requirements changed - IP address collection is no longer mandatory for KYB process
                            The IP address verification was initially planned for enhanced security but has been deprioritized                           
                            This section may be re-enabled in future versions if compliance requirements change                          
                            <ViewComponent>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap, commonStyles.alignCenter]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                        <TextMultiLanguage style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.IP_ADDRESS"}  />
                                        <InfoTooltip 
                       tooltipText="GLOBAL_CONSTANTS.VERIFY_YOUR_IP_ADDRESS"
                        linkText="GLOBAL_CONSTANTS.HERE"
                        linkUrl="https://whatismyipaddress.com/"
                            arrowXPosition={s(-58)}
                            verticalGap={s(-5)}
                            onError={(msg) => setErrormsg(t("GLOBAL_CONSTANTS.UNABLE_TO_OPEN_URL"))} 
                        />
                                    </ViewComponent>
                                    <CommonTouchableOpacity activeOpacity={0.8} onPress={() => {
                                        // Close all other sheets first
                                        actionSheetRef.current?.close();
                                        deleteConfirmSheetRef.current?.close();
                                        ipSheetRef.current?.open();
                                    }}>
                                        <ViewComponent style={[commonStyles.mt6]}>
                                            {ipAddress ? (
                                                    <ViewComponent style={[commonStyles.actioniconbg]}>
                                                    <MaterialIcons name="edit" size={s(22)} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                                                </ViewComponent>
                                            ) : (
                                                <ViewComponent style={[commonStyles.actioniconbg]}>
                                                    <MaterialIcons name="add" size={s(22)} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                                                </ViewComponent>
                                            )}
                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.sectionGap]}>
                                    {ipAddress ? (
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.IP_ADDRESS"}  />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={ipAddress} />
                                        </ViewComponent>
                                    ) : (
                                        <ViewComponent>
                                            <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_IP_ADDRESS_PROVIDED"} />
                                        </ViewComponent>
                                    )}
                                </ViewComponent>
                            </ViewComponent> */}

                            {(getRequirements().showPFC || getRequirements().showPPHS || getRequirements().showNationalId) && (
                                <ViewComponent>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap, commonStyles.alignCenter]}>
                                        <RequiredLabel text={"GLOBAL_CONSTANTS.DOCUMENTS"} style={[commonStyles.sectionTitle]} />
                                        <TouchableOpacity activeOpacity={0.8} onPress={handleAddDocuments}>
                                            <ViewComponent style={[commonStyles.mt6]}>
                                                {(documentsData?.passport || documentsData?.nationalId) ? (
                                                    <EditIcon width={s(22)} height={s(22)} color={NEW_COLOR.TEXT_PRIMARY} />
                                                ) : (
                                                    <ViewComponent style={[commonStyles.actioniconbg]}>
                                                        <MaterialIcons name="add" size={s(22)} color={NEW_COLOR.DARK_TEXT_WHITE} />
                                                    </ViewComponent>
                                                )}
                                            </ViewComponent>
                                        </TouchableOpacity>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.formItemSpace]}>
                                        {renderDocumentSection()}
                                    </ViewComponent>
                                </ViewComponent>
                            )}
                            {getRequirements().showUBO && (
                                <ViewComponent style={[commonStyles.titleSectionGap, openAccordion === ACCORDION_KEYS.UBO ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.bgnote, openAccordion === ACCORDION_KEYS.UBO ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                        <TouchableOpacity onPress={() => handleToggleAccordion(ACCORDION_KEYS.UBO)} style={[commonStyles.flex1]}>
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
                                        </TouchableOpacity>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                            <TouchableOpacity activeOpacity={0.8} onPress={handleAddUbos}>
                                                <MaterialIcons name="add-circle-outline" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleToggleAccordion(ACCORDION_KEYS.UBO)}>
                                                <MaterialIcons name={openAccordion === ACCORDION_KEYS.UBO ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                                            </TouchableOpacity>
                                        </ViewComponent>
                                    </ViewComponent>
                                    {openAccordion === ACCORDION_KEYS.UBO && (
                                        <ViewComponent style={[commonStyles.sectionGap]}>
                                            <FlatList
                                                data={getUboData()}
                                                renderItem={({ item, index }) => {
                                                    return (
                                                        <ViewComponent key={index} style={[commonStyles.px14]}>
                                                            {/* <TouchableOpacity onPress={() => handleItemPress(item, false)} activeOpacity={0.8}> */}

                                                            <TouchableOpacity activeOpacity={0.8}>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent]}>
                                                                    <ViewComponent style={[commonStyles.flex1, commonStyles.mt16]}>

                                                                        <ParagraphComponent text={item?.email ? safeDecrypt(item.email) : (item?.email || '--')} style={[commonStyles.listprimarytext]} />
                                                                    </ViewComponent>
                                                                    <ViewComponent style={[commonStyles.flex1, commonStyles.mt16]}>
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
                                                                        <TouchableOpacity activeOpacity={0.8} onPress={() => { handleUbosEdit(item?.id); }}><EditIcon width={s(16)} height={s(20)} color={NEW_COLOR.TEXT_PRIMARY} /></TouchableOpacity>
                                                                        <TouchableOpacity activeOpacity={0.8} onPress={() => { setSelectedItem({ ...item, isDirector: false }); deleteConfirmSheetRef.current?.open(); }}><UploadDeleteIcon width={s(16)} height={s(16)} /></TouchableOpacity>
                                                                    </ViewComponent>
                                                                </ViewComponent>
                                                            </TouchableOpacity>
                                                        </ViewComponent>
                                                    );
                                                }}
                                                keyExtractor={(item, index) => `ubo-${item.id || index}`}
                                                scrollEnabled={false}
                                                ListFooterComponent={renderFooter}
                                                ListEmptyComponent={noData}
                                            />
                                        </ViewComponent>
                                    )}
                                </ViewComponent>
                            )}
                            {getRequirements().showDirector && (
                                <ViewComponent style={[commonStyles.titleSectionGap, openAccordion === ACCORDION_KEYS.DIRECTORS ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.bgnote, openAccordion === ACCORDION_KEYS.DIRECTORS ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                                        <TouchableOpacity onPress={() => handleToggleAccordion(ACCORDION_KEYS.DIRECTORS)} style={[commonStyles.flex1]}>
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
                                        </TouchableOpacity>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                            <TouchableOpacity activeOpacity={0.8} onPress={handleAddDirectors}>
                                                <MaterialIcons name="add-circle-outline" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleToggleAccordion(ACCORDION_KEYS.DIRECTORS)}>
                                                <MaterialIcons name={openAccordion === ACCORDION_KEYS.DIRECTORS ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                                            </TouchableOpacity>
                                        </ViewComponent>
                                    </ViewComponent>
                                    {openAccordion === ACCORDION_KEYS.DIRECTORS && (
                                        <ViewComponent style={[commonStyles.sectionGap]}>
                                            <FlatList
                                                data={getDirectorData()}
                                                renderItem={({ item, index }) => {
                                                    return (
                                                        <ViewComponent key={index} style={[commonStyles.px14]}>
                                                            {/* <TouchableOpacity onPress={() => handleItemPress(item, true)} activeOpacity={0.8}> */}
                                                            <TouchableOpacity activeOpacity={0.8}>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.gap12]}>
                                                                    <ViewComponent style={[commonStyles.flex1, commonStyles.mt16]}><ParagraphComponent text={item?.email ? safeDecrypt(item.email) : (item?.email || '--')} style={[commonStyles.listprimarytext]} /></ViewComponent>
                                                                    <ViewComponent style={[commonStyles.flex1, commonStyles.mt16]}>{item?.shareHolderPercentage && <ParagraphComponent text={`${item.shareHolderPercentage}%`} style={[commonStyles.listprimarytext, commonStyles.mb2]} />}<ParagraphComponent text={(() => {
                                                                        const phoneCode = item?.phoneCode ? safeDecrypt(item.phoneCode) : (item?.phoneCode || '');
                                                                        const phoneNumber = item?.phoneNumber ? safeDecrypt(item.phoneNumber) : (item?.phoneNumber || '');
                                                                        if (!phoneCode && !phoneNumber) return '--';
                                                                        const formattedCode = phoneCode?.startsWith?.('+') ? phoneCode : `+${phoneCode}`;
                                                                        return `${formattedCode} ${phoneNumber}`;
                                                                    })()} style={[commonStyles.listprimarytext]} /></ViewComponent>
                                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap14, commonStyles.mt20, { width: s(60) }]}>
                                                                        <TouchableOpacity activeOpacity={0.8} onPress={() => { handleDirectorsEdit(item?.id); }}><EditIcon width={s(16)} height={s(20)} color={NEW_COLOR.TEXT_PRIMARY} /></TouchableOpacity>
                                                                        <TouchableOpacity activeOpacity={0.8} onPress={() => { setSelectedItem({ ...item, isDirector: true }); deleteConfirmSheetRef.current?.open(); }}><UploadDeleteIcon width={s(16)} height={s(16)} /></TouchableOpacity>
                                                                    </ViewComponent>
                                                                </ViewComponent>
                                                            </TouchableOpacity>
                                                        </ViewComponent>
                                                    );
                                                }}
                                                keyExtractor={(item, index) => `director-${item.id || index}`}
                                                scrollEnabled={false}
                                                ListFooterComponent={renderFooter}
                                                ListEmptyComponent={directorsNoData}
                                            />
                                        </ViewComponent>
                                    )}
                                </ViewComponent>
                            )}


                            {getRequirements().showAddress && (<>
                                <ViewComponent style={[commonStyles.sectionGap]} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                                        <RequiredLabel text={"GLOBAL_CONSTANTS.ADDRESS_INFO"} style={[commonStyles.sectionTitle]} />
                                        <InfoTooltip
                                            tooltipText="GLOBAL_CONSTANTS.TOOLTIP_ADDRESS_MANDATORY"
                                            linkText=""
                                            linkUrl=""
                                            verticalGap={s(34)}
                                            arrowXPosition={s(0)}
                                            onError={(msg) => setErrormsg(msg)}
                                        />
                                    </ViewComponent>
                                    <CommonTouchableOpacity onPress={handleAddAddress}>
                                        <ViewComponent style={[commonStyles.actioniconbg]}>
                                            <AddIcon />
                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.sectionGap]}>
                                    {(selectedAddresses && selectedAddresses.length > 0) ? (
                                        <FlatList
                                            data={selectedAddresses}
                                            renderItem={({ item, index }) => {
                                                const addressKey = selectedAddresses.length === 1 ? "GLOBAL_CONSTANTS.ADDRESS" : `${t("GLOBAL_CONSTANTS.ADDRESS")} ${index + 1}`;
                                                return (
                                                    <ViewComponent>
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                                            {selectedAddresses.length === 1 ? (
                                                                <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={addressKey} />
                                                            ) : (
                                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={addressKey} />
                                                            )}
                                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={item.favoriteName} />
                                                        </ViewComponent>
                                                        {index !== selectedAddresses.length - 1 && <ViewComponent style={[commonStyles.listitemGap]} />}
                                                    </ViewComponent>
                                                );
                                            }}
                                            keyExtractor={(item) => item.id}
                                            scrollEnabled={false}
                                        />
                                    ) : (
                                        <ViewComponent>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                                <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ADDRESS"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={"--"} />
                                            </ViewComponent>
                                        </ViewComponent>
                                    )}
                                </ViewComponent>

                            </>)}
                        </ViewComponent>}
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        {<ButtonComponent
                            title={(hasAccountCreationFee === false || hasAccountCreationFee === "false" || hasAccountCreationFee === undefined || hasAccountCreationFee === null || parseFloat(String(hasAccountCreationFee)) <= 0) ? "GLOBAL_CONSTANTS.SUBMIT" : "GLOBAL_CONSTANTS.CONTINUE"}
                            loading={submitLoading}
                            disable={submitLoading}
                            onPress={handleSubmit}
                        />}
                        <ViewComponent style={commonStyles?.mb32} />
                    </>
                </ScrollView>

            </Container>}

            <CustomRBSheet
                refRBSheet={actionSheetRef}
                height={'Small'}
            >
                <ViewComponent>
                    <TouchableOpacity onPress={handleEdit} activeOpacity={0.7}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2 }]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb5, commonStyles.bottomsheeticonbg]}>
                                    <EditIcon width={s(18)} height={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.EDIT"} style={[commonStyles.fs14, commonStyles.fw500]} />
                            </ViewComponent>
                            <Entypo name="chevron-small-right" size={24} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                    </TouchableOpacity>
                    <ViewComponent style={[commonStyles.listitemGap]} />

                    <TouchableOpacity onPress={handleDelete} activeOpacity={0.7}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2 }]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb5, commonStyles.bottomsheeticonbg]}>
                                    <UploadDeleteIcon width={s(18)} height={s(18)} />
                                </ViewComponent>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.DELETE"} style={[commonStyles.fs14, commonStyles.fw500]} />
                            </ViewComponent>
                            <Entypo name="chevron-small-right" size={24} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                    </TouchableOpacity>
                    <ViewComponent style={[commonStyles.mb16]} />
                </ViewComponent>
            </CustomRBSheet>

            {/* 
            IP Address Input Modal - Temporarily Disabled
            
            Reason: IP address collection is no longer required by business requirements
            This modal allowed users to manually enter their IP address for verification purposes
            
            The functionality has been disabled to simplify the KYB process and reduce user friction
            May be re-enabled if future compliance requirements mandate IP address collection
            
            <CustomRBSheet
                refRBSheet={ipSheetRef}
                height={'Small'}
                            modeltitle={true}
             title={'GLOBAL_CONSTANTS.ENTER_IP_ADDRESS'}
            >
                <Formik
                    initialValues={{ ipAddress: ipAddress }}
                    validationSchema={IPAddressSchema}
                    onSubmit={(values) => {
                        dispatch({ type: 'SET_IP_ADDRESS', payload: values.ipAddress });
                        setIpAddress(values.ipAddress);
                        ipSheetRef.current?.close();
                    }}
                    enableReinitialize
                >
                    {(formik) => (
                        <ViewComponent>                            
                            <Field
                                activeOpacity={0.9}
                                touched={formik.touched.ipAddress}
                                name="ipAddress"
                                label={"GLOBAL_CONSTANTS.IP_ADDRESS"}
                                error={formik.errors.ipAddress}
                                handleBlur={formik.handleBlur}
                                customContainerStyle={{
                                    height: 80,
                                }}
                                onHandleChange={(text: any) => {
                                    formik.handleChange('ipAddress')(text);
                                }}
                                placeholder={"GLOBAL_CONSTANTS.ENTER_IP_ADDRESS"}
                                component={InputDefault}
                                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                            />
                            
                            <ViewComponent style={[commonStyles.mt20]}>
                                <ButtonComponent
                                    title={"GLOBAL_CONSTANTS.CONTINUE"}
                                    onPress={formik.handleSubmit}
                                />
                            </ViewComponent>
                            
                            <ViewComponent style={[commonStyles.mt10]}>
                                <ButtonComponent
                                    title={"GLOBAL_CONSTANTS.CANCEL"}
                                    onPress={() => ipSheetRef.current?.close()}
                                    solidBackground={true}
                                />
                            </ViewComponent>
                            
                            <ViewComponent style={[commonStyles.mb10]} />
                        </ViewComponent>
                    )}
                </Formik>
            </CustomRBSheet> */}

            <CustomRBSheet
                refRBSheet={sectorTypeSheetRef}
                height={'Medium'}
                modeltitle={true}
                title={"GLOBAL_CONSTANTS.ADDITIONAL_INFO"}
            >
                <Formik
                    initialValues={{
                        sector: selectedSector,
                        type: selectedType
                    }}
                    validationSchema={KybSectorTypeSchema}
                    onSubmit={(values) => {
                        setSelectedSector(values.sector);
                        setSelectedType(values.type);
                        // Save to Redux state to persist across navigation
                        dispatch({ type: 'SET_SECTORS', payload: values.sector });
                        dispatch({ type: 'SET_TYPES', payload: values.type });
                        sectorTypeSheetRef.current?.close();
                    }}
                    enableReinitialize
                >
                    {(formik) => (
                        <ViewComponent>
                            <Field
                                name="sector"
                                label={"GLOBAL_CONSTANTS.SECTOR"}
                                error={formik.submitCount > 0 ? formik.errors.sector : undefined}
                                touched={formik.touched.sector}
                                handleBlur={formik.handleBlur}
                                customContainerStyle={{ height: 80 }}
                                data={sectors || []}
                                placeholder={"GLOBAL_CONSTANTS.SELECT_SECTOR"}
                                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                                component={CustomPicker}
                                modalTitle={"GLOBAL_CONSTANTS.SELECT_SECTOR"}
                                customBind={['name']}
                                valueField={'name'}
                                onChange={(value: string) => {
                                    formik.setFieldValue('sector', value);
                                }}
                                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                            />

                            <ViewComponent style={commonStyles.formItemSpace} />

                            <Field
                                name="type"
                                label={"GLOBAL_CONSTANTS.TYPE"}
                                error={formik.submitCount > 0 ? formik.errors.type : undefined}
                                touched={formik.touched.type}
                                handleBlur={formik.handleBlur}
                                customContainerStyle={{ height: 80 }}
                                data={types || []}
                                placeholder={"GLOBAL_CONSTANTS.SELECT_TYPE"}
                                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                                component={CustomPicker}
                                modalTitle={"GLOBAL_CONSTANTS.SELECT_TYPE"}
                                customBind={['name']}
                                valueField={'name'}
                                onChange={(value: string) => {
                                    formik.setFieldValue('type', value);
                                }}
                                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                            />

                            <ViewComponent style={[commonStyles.sectionGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CANCEL"}
                                        onPress={() => sectorTypeSheetRef.current?.close()}
                                        solidBackground={true}
                                    />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.SAVE"}
                                        onPress={formik.handleSubmit}
                                    />
                                </ViewComponent>
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.mb10]} />
                        </ViewComponent>
                    )}
                </Formik>
            </CustomRBSheet>

            <CustomRBSheet
                refRBSheet={deleteConfirmSheetRef}
                height={'Small'}
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
                height={'Large'}
                onClose={() => {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Dashboard", params: { initialTab: BanksPermission ? "GLOBAL_CONSTANTS.BANK" : "GLOBAL_CONSTANTS.WALLETS", animation: 'slide_from_left' } }],
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
        </ViewComponent>
    );
};

export default BankKybInfoPreview;

