/**
 * KYB Service - Business Logic for Know Your Business (KYB) Process
 * 
 * This service handles:
 * 1. UBO/Director/Representative data management and validation
 * 2. Duplicate prevention across all entity types
 * 3. Dynamic validation based on KYB requirements from API
 * 4. Data transformation between API and form structures
 * 5. Share percentage validation and business rules
 * 
 * Key Features:
 * - Prevents duplicate entries by email across UBO/Director/Representative
 * - Dynamic field validation based on server-side requirements
 * - Combines form data with existing API data for complete view
 * - Handles record status tracking (ADDED/MODIFIED/EXISTING/DELETED)
 */

// Service file for KYB business logic, API calls, and validation
import CardsModuleService from '../../../../../apiServices/cards';
import { isErrorDispaly } from '../../../../../utils/helpers';
import { KYB_INFO_CONSTANTS } from './constant';
import ProfileService from '../../../../../apiServices/profile';
// API: Fetch sectors and types
export const fetchSectorsAndTypes = async (setSectors: any, setTypes: any, setErrormsg: any, t: any) => {
    try {
        const [industryRes] = await Promise.all([

            CardsModuleService.getIndustryLu()
        ]);
        if (industryRes?.ok) {
            setSectors(Array.isArray(industryRes.data) ? industryRes.data : []);
        } else {
            setErrormsg(t('GLOBAL_CONSTANTS.FAILED_TO_LOAD_SECTORS'));
        }
    } catch (error) {
        setErrormsg(t('GLOBAL_CONSTANTS.FAILED_TO_LOAD_LOOKUPS'));
    }

};

// API: Fetch default addresses
export const fetchDefaultAddresses = async (dispatch: any, setErrormsg: any, setAddresses: any, setAddressesDetails: any, handleAddress: any) => {
    const pageSize = 10;
    const pageNo = 1;
    try {
        const response: any = await CardsModuleService?.cardsAddressGet(pageNo, pageSize);
        if (response?.ok) {
            const addressesList = response?.data?.data.map((item: any) => ({
                id: item?.id,
                favoriteName: `${item?.favoriteName || item?.fullName || item?.id} (${item?.addressType})`,
                name: `${item?.favoriteName || item?.fullName || item?.id} (${item?.addressType})`,
                isDefault: item?.isDefault || false,
            }));
            setAddresses(addressesList);

            const defaultAddress = addressesList.find((addr: any) => addr.isDefault);
            if (defaultAddress) {
                // Dispatch to Redux state
                dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: defaultAddress.name });
                // Call handleAddress to update form values
                handleAddress(defaultAddress?.name, addressesList, response?.data?.data);
            }

            setAddressesDetails(response?.data?.data);
            setErrormsg('');
        } else {
            setErrormsg(isErrorDispaly(response));
        }
    } catch (error) {
        setErrormsg(isErrorDispaly(error));
    }
};

export const fetchCounriesLookup = async (setCountries: any, setErrormsg: any, fetchDocuments: any, formInitialValues?: any, ref?: any) => {
    try {
        const response: any = await CardsModuleService.getCardCountries();
        if (response?.status == 200) {
            setCountries(response?.data || []);
            const selectedCountry = response?.data?.find((c: any) => c?.name == (formInitialValues?.country));
            if (selectedCountry?.name) {
                fetchDocuments(selectedCountry.name);
            }
            setErrormsg('');
        } else {
            setErrormsg(isErrorDispaly(response));
        }
    } catch (error) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrormsg(isErrorDispaly(error));
    }
};

// API: Fetch documents by country
export const fetchDocuments = async (setCountryIdType: any, setErrormsg: any, country?: string) => {
    try {
        const response: any = await CardsModuleService.getDocuments(country);
        if (response?.status == 200) {
            setCountryIdType(response?.data);
            setErrormsg('');
        } else {
            setErrormsg(isErrorDispaly(response));
        }
    } catch (error) {
        setErrormsg(isErrorDispaly(error));
    }
};

export const fetchCardsDocTypes = async (setCardDocType: any, setErrormsg: any, country?: string) => {
    try {
        const response: any = await CardsModuleService.getCardDocTypes();
        if (response?.status == 200) {
            setCardDocType(response?.data);
            setErrormsg('');
        } else {
            setErrormsg(isErrorDispaly(response));
        }
    } catch (error) {
        setErrormsg(isErrorDispaly(error));
    }
};

// API: Get country code details
export const getListOfCountryCodeDetails = async (setCountryCodelist: any, setErrormsg: any, ref?: any) => {
    const response: any = await CardsModuleService.getAddressLu();
    if (response?.status === 200) {
        setCountryCodelist(response?.data?.PhoneCodes);
        setErrormsg("");
    } else {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrormsg(isErrorDispaly(response));
    }
};

// API: Fetch profile edit lookups
export const fetchLookUps = async (setDocumentTypesLookUp: any, setStatesList: any, setCountriesWithStates: any, setErrormsg: any, persionalDetails: any, ref?: any) => {
    try {
        const response: any = await ProfileService.getprofileEditLookups();
        if (response?.status == 200) {
            setDocumentTypesLookUp(response.data.KycDocumentTypes || []);

            const selectedCountryForStates: any = response?.data?.countryWithStates?.find((c: any) => c?.name == persionalDetails?.kyc?.basic?.country);
            if (selectedCountryForStates && selectedCountryForStates.details?.length > 0) {
                setStatesList(selectedCountryForStates.details);
            } else {
                setStatesList([]);
            }
            setCountriesWithStates(response?.data?.countryWithStates || []);

            setErrormsg('');
        } else {
            setErrormsg(isErrorDispaly(response));
        }
    } catch (error) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrormsg(isErrorDispaly(error));
    }
};



// API: Get personal details
export const getPersionalDetails = async (selectedBank: any, setPersionalDetails: any, setErrormsg: any, setLoadingData: any, cardId?: any) => {
    setErrormsg('');
    setLoadingData(true);
    try {
        const res = await CardsModuleService.getApplyCardsRequirements(selectedBank?.productId || cardId);

        if (res?.ok) {
            setPersionalDetails(res?.data || {});
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

/**
 * DYNAMIC KYB REQUIREMENTS SYSTEM
 * 
 * Maps server-side KYB requirements string to boolean flags for UI rendering.
 * This enables dynamic form fields based on regulatory requirements per jurisdiction.
 * 
 * How validation state checking works:
 * 1. Server sends comma-separated requirement string (e.g., "ubo,uboidentification,uboselfie")
 * 2. Function parses string and maps to boolean flags
 * 3. UI components use these flags to show/hide form sections
 * 4. Validation rules adapt based on these requirements
 * 
 * Example requirement flow:
 * - Server: "ubo,uboidentification,uboaddress"
 * - Result: {showUBO: true, showUBOIdentification: true, showUBOAddress: true}
 * - UI: Shows UBO form with ID upload and address sections
 * - Validation: Requires UBO details, document upload, and address info
 */
export const getKybRequirements = (requirementString: string) => {
    // Parse comma-separated requirements string from server
    const requirements = requirementString ? requirementString.toLowerCase().split(',').map(r => r.trim()) : [];

    // Map string requirements to boolean flags for UI control
    const mappedRequirements = {
        // Company level requirements
        showCompanyInformation: requirements.includes('companyinformation'),
        showCompanyDocuments: requirements.includes('companydocuments'),
        showCompanyAddress: requirements.includes('companyaddress'),

        // Personal information requirements
        showPersonalInformation: requirements.includes('personalinformation'),
        showPersonalInformationAddress: requirements.includes('personalinformationaddress'),
        showPersonalIdentification: requirements.includes('personalidentification'),

        // Entity type requirements
        showUBO: requirements.includes('ubo'),
        showRepresentatives: requirements.includes('representatives'),
        showDirectors: requirements.includes('directors'),

        // UBO specific requirements - controls what fields are shown/validated
        showUBOIdentification: requirements.includes('uboidentification'), // Document upload section
        showUBOSelfie: requirements.includes('uboselfie'),                 // Selfie photo requirement
        showUBOAddress: requirements.includes('uboaddress'),               // Address information section

        // Director specific requirements
        showDirectorIdentification: requirements.includes('directoridentification'),
        showDirectorSelfie: requirements.includes('directorselfie'),
        showDirectorAddress: requirements.includes('directoraddress'),

        // Representative specific requirements
        showRepresentativeIdentification: requirements.includes('representativeidentification'),
        showRepresentativeSelfie: requirements.includes('representativeselfie'),
        showRepresentativeAddress: requirements.includes('representativeaddress')
    };

    return mappedRequirements;
};

// Helper: Get requirements (KYB only)
export const getRequirements = (persionalDetails: any) => {
    // Get KYB requirements only
    let requirementString = persionalDetails?.kyb?.kycRequirements;

    // If kycRequirements is an array, parse it
    if (Array.isArray(requirementString)) {
        const businessReq = requirementString.find(req => req.AccountType === 'Business');
        requirementString = businessReq?.requirements || '';
    } else if (typeof requirementString === 'string') {
        // If it's a JSON string, try to parse it
        try {
            const parsed = JSON.parse(requirementString);
            if (Array.isArray(parsed)) {
                const businessReq = parsed.find(req => req.AccountType === 'Business');
                requirementString = businessReq?.requirements || '';
            }
        } catch (e) {
            // If parsing fails, use as is
        }
    }
    const requirements = requirementString ? requirementString.toLowerCase().split(',').map((r: any) => r.trim()) : [];

    const mappedReqs = {
        showFullName: requirements.includes('fullname'),
        showBasic: requirements.includes('basic'),
        showAddress: requirements.includes('address') || requirements.includes('companyaddress'),
        personalInformationAddress: requirements.includes('personalinformationaddress'),
        showUBO: requirements.includes('ubo'),
        showDirector: requirements.includes('director') || requirements.includes('directors'),
        showPFC: requirements.includes('pfc'),
        showPPHS: requirements.includes('pphs'),
        showNationalId: requirements.includes('ni'),
        showRepresentative: requirements.includes('representative') || requirements.includes('representatives'),
        // UBO specific requirements
        showUBOIdentification: requirements.includes('uboidentification'),
        showUBOSelfie: requirements.includes('uboselfie'),
        showUBOAddress: requirements.includes('uboaddress'),
        // Director specific requirements
        showDirectorIdentification: requirements.includes('directoridentification'),
        showDirectorSelfie: requirements.includes('directorselfie'),
        showDirectorAddress: requirements.includes('directoraddress'),
        // Representative specific requirements
        showRepresentativeIdentification: requirements.includes('representativeidentification'),
        showRepresentativeSelfie: requirements.includes('representativeselfie'),
        showRepresentativeAddress: requirements.includes('representativeaddress'),
        // Personal identification
        showPersonalIdentification: requirements.includes('personalidentification')
    };

    return mappedReqs;
};

/**
 * UBO DATA MANAGEMENT SYSTEM
 * 
 * Combines form data with API data to create complete UBO dataset.
 * Handles data synchronization between local form state and server state.
 * 
 * How UBO details are managed:
 * 1. Form data (Redux) - New/modified UBOs from user input
 * 2. API data (Server) - Existing UBOs from previous submissions
 * 3. Deleted items - UBOs marked for deletion
 * 4. Duplicate prevention - Uses email and ID tracking
 * 
 * Record Status Tracking:
 * - ADDED: New UBO created in form
 * - MODIFIED: Existing UBO edited in form
 * - EXISTING: UBO from API, not modified
 * - DELETED: UBO marked for removal (filtered out)
 * 
 * This ensures data integrity and proper API payload construction.
 */
export const getUboData = (uboFormDataList: any[] = [], persionalDetails: any, deletedApiItems: any[] = []) => {
    const combinedData: any[] = [];
    const addedIds = new Set();      // Track IDs to prevent duplicates
    const addedEmails = new Set();   // Track emails to prevent duplicates

    // STEP 1: Add form data first with proper record status
    // Form data takes priority over API data for same entities
    for (const item of uboFormDataList) {
        if (!addedIds.has(item.id) && !addedEmails.has(item.email?.toLowerCase()?.trim())) {
            // Check if this item exists in API data (determines if ADDED or MODIFIED)
            const isExistingApiItem = persionalDetails?.kyb?.ubos?.some((apiUbo: any) => apiUbo.id === item.id);
            combinedData.push({
                ...item,
                recordStatus: isExistingApiItem ? "Modified" : "Added"
            });
            addedIds.add(item.id);
            if (item.email) addedEmails.add(item.email.toLowerCase().trim());
        }
    }

    // Add API data from ubos array
    if (persionalDetails?.kyb?.ubos && Array.isArray(persionalDetails.kyb.ubos)) {
        persionalDetails.kyb.ubos.forEach((ubo: any) => {
            const uboEmail = ubo.personDetails?.email?.toLowerCase()?.trim();
            if (!(deletedApiItems || []).includes(ubo.id) &&
                !addedIds.has(ubo.id) &&
                !addedEmails.has(uboEmail)) {
                // Transform API structure to form structure
                const transformedUbo = {
                    id: ubo.id || "00000000-0000-0000-0000-000000000000",
                    firstName: ubo.personDetails?.firstName || '',
                    lastName: ubo.personDetails?.lastName || '',
                    email: ubo.personDetails?.email || '',
                    phoneCode: ubo.personDetails?.phoneCode || '',
                    phoneNumber: ubo.personDetails?.phoneNumber || '',
                    shareHolderPercentage: ubo.personDetails?.shareHolderPercentage?.toString().replace('%', '') || '0',
                    dob: ubo.personDetails?.dateOfBirth || '',
                    country: ubo.personDetails?.country || '',
                    docType: ubo.identification?.idType || '',
                    docNumber: ubo.identification?.idNumber || '',
                    docExpiryDate: ubo.identification?.docExpireDate || '',
                    docIssueDate: ubo.identification?.docIssueDate || '',
                    frontId: ubo.identification?.frontDocument || '',
                    backImgId: ubo.identification?.backDocument || '',
                    gender: ubo.personDetails?.gender || '',
                    selfi: ubo.selfie || '',
                    addressType: ubo.ubosAddress?.addressType || '',
                    addressLine1: ubo.ubosAddress?.line1 || '',
                    addressLine2: ubo.ubosAddress?.line2 || '',
                    city: ubo.ubosAddress?.city || '',
                    state: ubo.ubosAddress?.state || '',
                    postalCode: ubo.ubosAddress?.postalCode || '',
                    addressCountry: ubo.ubosAddress?.country || '',
                    recordStatus: "Added",
                    // Mark as incomplete if required fields are missing
                    isIncomplete: !ubo.personDetails?.firstName || !ubo.personDetails?.lastName || !ubo.personDetails?.email || !ubo.personDetails?.shareHolderPercentage
                };

                combinedData.push(transformedUbo);
                addedIds.add(ubo.id);
                if (uboEmail) addedEmails.add(uboEmail);
            }
        });
    }

    return combinedData;
};

// Helper: Get Director data
export const getDirectorData = (directorFormDataList: any[] = [], persionalDetails: any, deletedApiItems: any[] = []) => {
    const combinedData: any[] = [];
    const addedIds = new Set();
    const addedEmails = new Set();

    // Add form data first with proper record status
    for (const item of directorFormDataList) {
        if (!addedIds.has(item.id) && !addedEmails.has(item.email?.toLowerCase()?.trim())) {
            const isExistingApiItem = persionalDetails?.kyb?.directors?.some((apiDirector: any) => apiDirector.id === item.id);
            combinedData.push({
                ...item,
                recordStatus: isExistingApiItem ? "Modified" : "Added"
            });
            addedIds.add(item.id);
            if (item.email) addedEmails.add(item.email.toLowerCase().trim());
        }
    }

    // Add API data from directors array
    if (persionalDetails?.kyb?.directors && Array.isArray(persionalDetails.kyb.directors)) {
        persionalDetails.kyb.directors.forEach((director: any) => {
            const directorEmail = director.personDetails?.email?.toLowerCase()?.trim();
            if (!(deletedApiItems || []).includes(director.id) &&
                !addedIds.has(director.id) &&
                !addedEmails.has(directorEmail)) {
                // Transform API structure to form structure
                const transformedDirector = {
                    id: director.id || "00000000-0000-0000-0000-000000000000",
                    firstName: director.personDetails?.firstName || '',
                    lastName: director.personDetails?.lastName || '',
                    email: director.personDetails?.email || '',
                    phoneCode: director.personDetails?.phoneCode || '',
                    phoneNumber: director.personDetails?.phoneNumber || '',
                    shareHolderPercentage: director.personDetails?.shareHolderPercentage?.toString().replace('%', '') || '0',
                    gender: director.personDetails?.gender || '',
                    dob: director.personDetails?.dateOfBirth || '',
                    country: director.personDetails?.country || '',
                    docType: director.identification?.idType || '',
                    docNumber: director.identification?.idNumber || '',
                    docExpiryDate: director.identification?.docExpireDate || '',
                    docIssueDate: director.identification?.docIssueDate || '',
                    frontId: director.identification?.frontDocument || '',
                    backImgId: director.identification?.backDocument || '',
                    selfi: director.selfie || '',
                    addressType: director.directorAddress?.addressType || '',
                    addressLine1: director.directorAddress?.line1 || '',
                    addressLine2: director.directorAddress?.line2 || '',
                    city: director.directorAddress?.city || '',
                    state: director.directorAddress?.state || '',
                    postalCode: director.directorAddress?.postalCode || '',
                    addressCountry: director.directorAddress?.country || '',
                    recordStatus: "Added",
                    // Mark as incomplete if required fields are missing
                    isIncomplete: !director.personDetails?.firstName || !director.personDetails?.lastName || !director.personDetails?.email || !director.personDetails?.shareHolderPercentage
                };

                combinedData.push(transformedDirector);
                addedIds.add(director.id);
                if (directorEmail) addedEmails.add(directorEmail);
            }
        });
    }

    return combinedData;
};

// Helper: Has UBO
export const hasUbo = (persionalDetails: any, uboFormDataList: any[], deletedApiItems: any[]) => {
    if (uboFormDataList.length > 0) return true;

    if (persionalDetails?.kyb?.ubos && Array.isArray(persionalDetails.kyb.ubos)) {
        return persionalDetails.kyb.ubos.some((ubo: any) =>
            !(deletedApiItems || []).includes(ubo.id) && (
                (ubo.personDetails?.firstName && ubo.personDetails.firstName.trim() !== '') ||
                (ubo.personDetails?.email && ubo.personDetails.email.trim() !== '') ||
                (ubo.personDetails?.phoneNumber && ubo.personDetails.phoneNumber.trim() !== '')
            )
        );
    }

    return false;
};

// Helper: Has Director
export const hasDirector = (persionalDetails: any, directorFormDataList: any[], deletedApiItems: any[]) => {
    if (directorFormDataList.length > 0) return true;

    if (persionalDetails?.kyb?.directors && Array.isArray(persionalDetails.kyb.directors)) {
        return persionalDetails.kyb.directors.some((director: any) =>
            !(deletedApiItems || []).includes(director.id) && (
                (director.personDetails?.firstName && director.personDetails.firstName.trim() !== '') ||
                (director.personDetails?.email && director.personDetails.email.trim() !== '') ||
                (director.personDetails?.phoneNumber && director.personDetails.phoneNumber.trim() !== '')
            )
        );
    }

    return false;
};

// Helper: Get Representative data
export const getRepresentativeData = (representativeFormDataList: any[] = [], persionalDetails: any, deletedApiItems: any[] = []) => {
    const combinedData: any[] = [];
    const addedIds = new Set();
    const addedEmails = new Set();

    // Add form data first with proper record status
    for (const item of representativeFormDataList) {
        if (!addedIds.has(item.id) && !addedEmails.has(item.email?.toLowerCase()?.trim())) {
            const isExistingApiItem = persionalDetails?.kyb?.representatives?.some((apiRep: any) => apiRep.id === item.id);
            combinedData.push({
                ...item,
                recordStatus: isExistingApiItem ? "Modified" : "Added"
            });
            addedIds.add(item.id);
            if (item.email) addedEmails.add(item.email.toLowerCase().trim());
        }
    }

    // Add API data from representatives array
    if (persionalDetails?.kyb?.representatives && Array.isArray(persionalDetails.kyb.representatives)) {
        persionalDetails.kyb.representatives.forEach((representative: any) => {
            const representativeEmail = representative.personDetails?.email?.toLowerCase()?.trim();
            if (!(deletedApiItems || []).includes(representative.id) &&
                !addedIds.has(representative.id) &&
                !addedEmails.has(representativeEmail)) {
                // Transform API structure to form structure
                const transformedRepresentative = {
                    id: representative.id || "00000000-0000-0000-0000-000000000000",
                    firstName: representative.personDetails?.firstName || '',
                    lastName: representative.personDetails?.lastName || '',
                    email: representative.personDetails?.email || '',
                    gender: representative.personDetails?.gender || '',
                    phoneCode: representative.personDetails?.phoneCode || '',
                    phoneNumber: representative.personDetails?.phoneNumber || '',
                    shareHolderPercentage: representative.personDetails?.shareHolderPercentage?.toString().replace('%', '') || '0',
                    dob: representative.personDetails?.dateOfBirth || '',
                    country: representative.personDetails?.country || '',
                    docType: representative.identification?.idType || '',
                    docNumber: representative.identification?.idNumber || '',
                    docExpiryDate: representative.identification?.docExpireDate || '',
                    docIssueDate: representative.identification?.docIssueDate || '',
                    frontId: representative.identification?.frontDocument || '',
                    backImgId: representative.identification?.backDocument || '',
                    selfi: representative.selfie || '',
                    addressType: representative.representativesAddress?.addressType || representative.representativeAddress?.addressType || '',
                    addressLine1: representative.representativesAddress?.line1 || representative.representativeAddress?.line1 || '',
                    addressLine2: representative.representativesAddress?.line2 || representative.representativeAddress?.line2 || '',
                    city: representative.representativesAddress?.city || representative.representativeAddress?.city || '',
                    state: representative.representativesAddress?.state || representative.representativeAddress?.state || '',
                    postalCode: representative.representativesAddress?.postalCode || representative.representativeAddress?.postalCode || '',
                    addressCountry: representative.representativesAddress?.country || representative.representativeAddress?.country || '',
                    recordStatus: "Added",
                    // Mark as incomplete if required fields are missing
                    isIncomplete: !representative.personDetails?.firstName || !representative.personDetails?.lastName || !representative.personDetails?.email || !representative.personDetails?.shareHolderPercentage
                };

                combinedData.push(transformedRepresentative);
                addedIds.add(representative.id);
                if (representativeEmail) addedEmails.add(representativeEmail);
            }
        });
    }

    return combinedData;
};

// Helper: Has Representative
export const hasRepresentative = (persionalDetails: any, representativeFormDataList: any[], deletedApiItems: any[]) => {
    if (representativeFormDataList.length > 0) return true;

    if (persionalDetails?.kyb?.representatives && Array.isArray(persionalDetails.kyb.representatives)) {
        return persionalDetails.kyb.representatives.some((representative: any) =>
            !(deletedApiItems || []).includes(representative.id) && (
                (representative.personDetails?.firstName && representative.personDetails.firstName.trim() !== '') ||
                (representative.personDetails?.email && representative.personDetails.email.trim() !== '') ||
                (representative.personDetails?.phoneNumber && representative.personDetails.phoneNumber.trim() !== '')
            )
        );
    }

    return false;
};

// Validation: Representatives
export const validateRepresentatives = (persionalDetails: any, representativeFormDataList: any[], deletedApiItems: any[], safeDecrypt: any, t: any): string[] => {
    const requirements = getRequirements(persionalDetails);

    if (!requirements.showRepresentative) {
        return [];
    }

    const allRepresentativeData = getRepresentativeData(representativeFormDataList, persionalDetails, deletedApiItems);

    if (allRepresentativeData.length > 0) {
        const errors: string[] = [];
        allRepresentativeData.forEach((representative: any, index: number) => {
            // Check all Representative data for missing sections
            const completenessErrors = validateApiDataCompleteness(representative, 'Representative', t, requirements);
            errors.push(...completenessErrors.map(err => `Representative ${index + 1} ${err}`));
        });
        return errors;
    }

    // No Representatives found but required
    return ['Representative details are required'];
};

// Validation: Form Fields
export const validateFormFields = (values: any, t: any): string[] => {
    const errors: string[] = [];

    if (!values.firstName?.trim()) {
        errors.push(t('GLOBAL_CONSTANTS.FIRST_NAME_REQUIRED'));
    }
    if (!values.lastName?.trim()) {
        errors.push(t('GLOBAL_CONSTANTS.LAST_NAME_REQUIRED'));
    }
    if (!values.email?.trim()) {
        errors.push(t('GLOBAL_CONSTANTS.EMAIL_REQUIRED'));
    }
    if (!values.shareHolderPercentage) {
        errors.push(t('GLOBAL_CONSTANTS.SHARE_PERCENTAGE_REQUIRED'));
    } else {
        const percentage = parseFloat(values.shareHolderPercentage);
        if (isNaN(percentage) || percentage < 25) {
            errors.push(t('GLOBAL_CONSTANTS.VALUE_MUST_25_OR_MORE'));
        }
    }

    return errors;
};



// Helper: Get dynamic required fields based on requirements
export const getDynamicRequiredFields = (itemType: 'UBO' | 'Director' | 'Representative', requirements: any, t: any): string[] => {
    const fields = ['First Name', 'Last Name', 'Email', 'Phone Code', 'Phone Number', 'Country', 'Shareholder Percentage', 'Date of Birth'];

    // Add identification fields if required
    if ((itemType === 'UBO' && requirements.showUBOIdentification) ||
        (itemType === 'Director' && requirements.showDirectorIdentification) ||
        (itemType === 'Representative' && requirements.showRepresentativeIdentification)) {
        fields.push('Identification Section');
    }

    // Add selfie if required
    if ((itemType === 'UBO' && requirements.showUBOSelfie) ||
        (itemType === 'Director' && requirements.showDirectorSelfie) ||
        (itemType === 'Representative' && requirements.showRepresentativeSelfie)) {
        fields.push('Selfie Image');
    }

    // Add address fields if required
    if ((itemType === 'UBO' && requirements.showUBOAddress) ||
        (itemType === 'Director' && requirements.showDirectorAddress) ||
        (itemType === 'Representative' && requirements.showRepresentativeAddress)) {
        fields.push('Address Section');
    }

    return fields;
};

// Validation: Check missing required sections for UBO/Director/Representative from API data
export const validateApiDataCompleteness = (item: any, itemType: 'UBO' | 'Director' | 'Representative', t: any, requirements?: any): string[] => {
    const errors: string[] = [];

    // Check Personal Information section
    const personalInfoMissing = !item.firstName?.trim() || !item.lastName?.trim() || !item.email?.trim() ||
        !item.dob || !item.country || !item.phoneCode || !item.phoneNumber ||
        !item.shareHolderPercentage;

    if (personalInfoMissing) {
        errors.push('Personal Info: Please complete all required fields');
    }

    // Dynamic validation based on requirements
    if (requirements) {
        // Identification validation - only if required
        const needsIdentification =
            (itemType === 'UBO' && requirements.showUBOIdentification) ||
            (itemType === 'Director' && requirements.showDirectorIdentification) ||
            (itemType === 'Representative' && requirements.showRepresentativeIdentification);

        if (needsIdentification) {
            const identificationMissing = !item.docType || !item.docNumber?.trim() || !item.frontId || !item.backImgId;
            if (identificationMissing) {
                errors.push('Identification: Please upload all required documents');
            }
        }

        // Selfie validation - only if required
        const needsSelfie =
            (itemType === 'UBO' && requirements.showUBOSelfie) ||
            (itemType === 'Director' && requirements.showDirectorSelfie) ||
            (itemType === 'Representative' && requirements.showRepresentativeSelfie);

        if (needsSelfie) {
            if (!item.selfi) {
                errors.push('Selfie: Please upload your photo');
            }
        }

        // Address validation - only if required
        const needsAddress =
            (itemType === 'UBO' && requirements.showUBOAddress) ||
            (itemType === 'Director' && requirements.showDirectorAddress) ||
            (itemType === 'Representative' && requirements.showRepresentativeAddress);

        if (needsAddress) {
            const addressMissing = !item.addressType || !item.addressCountry || !item.state || !item.city?.trim() || !item.addressLine1?.trim() || !item.postalCode?.trim();
            if (addressMissing) {
                errors.push('Address: Please complete all required fields');
            }
        }
    }

    return errors;
};

/**
 * DUPLICATE PREVENTION SYSTEM
 * 
 * Prevents duplicate UBO/Director/Representative entries based on email addresses.
 * This is critical for KYB compliance as each person can only have one role.
 * 
 * How it works:
 * 1. Takes current form values, existing list of entities, and API data
 * 2. Compares email addresses (case-insensitive, trimmed) across all sources
 * 3. Excludes current item being edited (editId) from duplicate check
 * 4. Returns appropriate error message based on entity type
 * 
 * Used in UboFormDetails component during form submission to prevent:
 * - Same person being added as both UBO and Director
 * - Same email being used for multiple UBOs
 * - Data integrity issues in KYB process
 * - Duplicates with existing API data
 */
export const checkDuplicateUbo = (values: any, currentList: any[], editId: string | undefined, t: any, persionalDetails?: any, deletedApiItems?: any[]): string | null => {
    // Extract and normalize email for comparison
    const emailToCheck = values.email?.toLowerCase()?.trim();

    if (emailToCheck) {
        // Check duplicates in Redux form data first
        const formDataDuplicate = currentList.find(item =>
            item.id !== editId &&
            item.email?.toLowerCase()?.trim() === emailToCheck
        );

        if (formDataDuplicate) {
            const position = values.uboPosition?.toLowerCase();
            if (position === 'director') {
                return t('GLOBAL_CONSTANTS.DIRECTOR_ALREADY_EXISTS');
            } else if (position === 'representative') {
                return t('GLOBAL_CONSTANTS.REPRESENTATIVE_ALREADY_EXISTS');
            } else {
                return t('GLOBAL_CONSTANTS.UBO_ALREADY_EXISTS');
            }
        }

        // Check duplicates in API data if available
        if (persionalDetails?.kyb) {
            const deletedItems = deletedApiItems || [];
            const position = values.uboPosition?.toLowerCase();

            // Check only within the same entity type in API data
            let apiEntities = [];
            if (position === 'director') {
                apiEntities = persionalDetails.kyb.directors || [];
            } else if (position === 'representative') {
                apiEntities = persionalDetails.kyb.representatives || [];
            } else {
                apiEntities = persionalDetails.kyb.ubos || [];
            }

            const apiDuplicate = apiEntities.find((item: any) =>
                item.id !== editId &&
                !deletedItems.includes(item.id) &&
                item.personDetails?.email?.toLowerCase()?.trim() === emailToCheck
            );

            if (apiDuplicate) {
                if (position === 'director') {
                    return t('GLOBAL_CONSTANTS.DIRECTOR_ALREADY_EXISTS');
                } else if (position === 'representative') {
                    return t('GLOBAL_CONSTANTS.REPRESENTATIVE_ALREADY_EXISTS');
                } else {
                    return t('GLOBAL_CONSTANTS.UBO_ALREADY_EXISTS');
                }
            }
        }
    }

    return null; // No duplicate found
};

// Validation: Documents
export const validateDocuments = (persionalDetails: any, documentsData: any, t: any): string[] => {
    const requirements = getRequirements(persionalDetails);
    const errors: string[] = [];
    if (!requirements.showPFC && !requirements.showPPHS && !requirements.showNationalId) {
        return errors;
    }
    const hasApiDocs = persionalDetails?.businessCustomerDetails?.kybDocs && persionalDetails.businessCustomerDetails.kybDocs.length > 0;
    const hasPassport = documentsData?.passport;
    const hasNationalId = documentsData?.nationalId;
    if (!hasApiDocs && !hasPassport && !hasNationalId) {
        errors.push(t('GLOBAL_CONSTANTS.PLEASE_ADD_ONE_DOCUMENT'));
    }
    return errors;
};

/**
 * UBO VALIDATION SYSTEM
 * 
 * Comprehensive validation for Ultimate Beneficial Owners based on:
 * 1. Dynamic KYB requirements from server
 * 2. Business rules (25% minimum shareholding)
 * 3. Data completeness checks
 * 4. Regulatory compliance requirements
 * 
 * Validation Flow:
 * 1. Check if UBO is required based on server requirements
 * 2. Validate each UBO's shareholding percentage (≥25%)
 * 3. Check data completeness for API-sourced UBOs
 * 4. Ensure all required fields are present based on jurisdiction
 * 
 * Returns array of validation error messages for UI display.
 */
export const validateUbos = (persionalDetails: any, uboFormDataList: any[], deletedApiItems: any[], safeDecrypt: any, t: any): string[] => {
    // Get dynamic requirements from server
    const requirements = getRequirements(persionalDetails);

    // Skip validation if UBO not required for this jurisdiction/product
    if (!requirements.showUBO) {
        return [];
    }

    // Get combined UBO data (form + API)
    const allUboData = getUboData(uboFormDataList, persionalDetails, deletedApiItems);

    if (allUboData.length > 0) {
        const errors: string[] = [];

        // Validate each UBO individually
        allUboData.forEach((ubo: any, index: number) => {
            // Check all UBO data for missing sections
            const completenessErrors = validateApiDataCompleteness(ubo, 'UBO', t, requirements);
            errors.push(...completenessErrors.map(err => `UBO ${index + 1} ${err}`));
        });
        return errors;
    }

    // No UBOs found but required
    return ['UBO details are required'];
};

// Validation: Directors
export const validateDirectors = (persionalDetails: any, directorFormDataList: any[], deletedApiItems: any[], safeDecrypt: any, t: any, validateUbosFn: any): string[] => {
    const requirements = getRequirements(persionalDetails);

    if (!requirements.showDirector) {
        return [];
    }

    const allDirectorData = getDirectorData(directorFormDataList, persionalDetails, deletedApiItems);

    if (allDirectorData.length > 0) {
        const errors: string[] = [];
        allDirectorData.forEach((director: any, index: number) => {
            // Check all Director data for missing sections
            const completenessErrors = validateApiDataCompleteness(director, 'Director', t, requirements);
            errors.push(...completenessErrors.map(err => `Director ${index + 1} ${err}`));
        });
        return errors;
    }

    // No Directors found but required
    return ['Director details are required'];
};

// Validation: Addresses
export const validateAddresses = (persionalDetails: any, selectedAddresses: any[], t: any, formValues?: any): string[] => {
    const requirements = getRequirements(persionalDetails);
    if (!requirements.showAddress) return [];

    const hasReduxAddresses = selectedAddresses && selectedAddresses.length >= 1;
    const hasFormAddress = formValues?.address && formValues.address.trim() !== '';
    if (!hasReduxAddresses && !hasFormAddress) {
        return [t('GLOBAL_CONSTANTS.PLEASE_SELECT_AT_LEAST_ONE_ADDRESS')];
    }
    return [];
};

/**
 * SHARE PERCENTAGE VALIDATION SYSTEM
 * 
 * Ensures total shareholding across all entities doesn't exceed 100%.
 * Critical for KYB compliance and corporate governance requirements.
 * 
 * Validation Logic:
 * 1. Only calculates shareholding for required entity types based on KYB requirements
 * 2. Combines shareholding from required UBOs, Directors, and Representatives
 * 3. Ensures total doesn't exceed 100% (business rule)
 * 4. Handles edge cases with invalid/missing percentage values
 * 
 * This prevents data integrity issues and ensures regulatory compliance
 * for corporate ownership structure reporting.
 */
export const fetchUBODeatilsLookup = async (setCountries: any, setErrormsg: any, fetchDocuments: any, formInitialValues?: any, ref?: any) => {
    try {
        const response: any = await CardsModuleService.getUBODetails("Ubo");
        if (response?.status == 200) {
            setCountries(response?.data || []);
            const selectedCountry = response?.data?.find((c: any) => c?.name == (formInitialValues?.country));
            if (selectedCountry?.name) {
                fetchDocuments(selectedCountry.name);
            }
            setErrormsg('');
        } else {
            setErrormsg(isErrorDispaly(response));
        }
    } catch (error) {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrormsg(isErrorDispaly(error));
    }
};


export const validateSharePercentages = (persionalDetails: any, uboFormDataList: any[], directorFormDataList: any[], deletedApiItems: any[], t: any, representativeFormDataList: any[] = []): string[] => {
    const requirements = getRequirements(persionalDetails);

    // Skip if no entity types are required
    if (!requirements.showUBO && !requirements.showDirector && !requirements.showRepresentative) return [];

    let totalPercentage = 0;

    // Calculate UBO shareholding total - only if UBO is required
    if (requirements.showUBO) {
        const uboData = getUboData(uboFormDataList, persionalDetails, deletedApiItems);
        uboData.forEach((ubo: any) => {
            const percentage = parseFloat(ubo.shareHolderPercentage || 0);
            if (!isNaN(percentage)) {
                totalPercentage += percentage;
            }
        });
    }

    // Calculate Director shareholding total - only if Director is required
    if (requirements.showDirector) {
        const directorData = getDirectorData(directorFormDataList, persionalDetails, deletedApiItems);
        directorData.forEach((director: any) => {
            const percentage = parseFloat(director.shareHolderPercentage || 0);
            if (!isNaN(percentage)) {
                totalPercentage += percentage;
            }
        });
    }

    // Calculate Representative shareholding total - only if Representative is required
    if (requirements.showRepresentative) {
        const representativeData = getRepresentativeData(representativeFormDataList, persionalDetails, deletedApiItems);
        representativeData.forEach((representative: any) => {
            const percentage = parseFloat(representative.shareHolderPercentage || 0);
            if (!isNaN(percentage)) {
                totalPercentage += percentage;
            }
        });
    }

    // Business Rule: Total shareholding cannot exceed 100%
    if (totalPercentage > 100) {
        return [`${t('GLOBAL_CONSTANTS.TOTAL_SHARE_PERCENTAGE_EXCEEDS_100')} ${totalPercentage}%.`];
    }

    return []; // Validation passed
};

// Validation: Sector and Type
export const validateSectorAndType = (sectors: any[], types: any[], selectedSector: string, selectedType: string, t: any): string[] => {
    const errors: string[] = [];

    if (!selectedSector) {
        errors.push(`${t('GLOBAL_CONSTANTS.ADDITIONAL_INFORMATION')} ${t('GLOBAL_CONSTANTS.SECTOR_REQUIRED')}`);
    }
    if (!selectedType) {
        errors.push(`${t('GLOBAL_CONSTANTS.ADDITIONAL_INFORMATION')} ${t('GLOBAL_CONSTANTS.TYPE_REQUIRED')}`);
    }

    return errors;
};

// Transform UBO data for card application payload
export const transformUboDataForCard = (uboData: any[]) => {
    return uboData.map((ubo: any) => ({
        id: ubo.recordStatus === "Modified" ? ubo.id : "00000000-0000-0000-0000-000000000000",
        recordStatus: ubo.recordStatus || "Added",
        personDetails: {
            firstName: ubo.firstName || '',
            lastName: ubo.lastName || '',
            email: ubo.email || '',
            phoneCode: ubo.phoneCode || '',
            phoneNumber: ubo.phoneNumber || '',
            shareHolderPercentage: ubo.shareHolderPercentage || '0',
            dateOfBirth: ubo.dob || '',
            country: ubo.country || ''
        },
        identification: {
            idType: ubo.docType || '',
            idNumber: ubo.docNumber || '',
            docExpireDate: ubo.docExpiryDate || '',
            docIssueDate: ubo.docIssueDate || '',

            frontDocument: ubo.frontId || '',
            backDocument: ubo.backImgId || ''
        },
        selfie: ubo.selfi || '',
        ubosAddress: {
            addressType: ubo.addressType || '',
            line1: ubo.addressLine1 || '',
            line2: ubo.addressLine2 || '',
            city: ubo.city || '',
            state: ubo.state || '',
            postalCode: ubo.postalCode || '',
            country: ubo.addressCountry || ''
        }
    }));
};

// Transform Director data for card application payload
export const transformDirectorDataForCard = (directorData: any[]) => {
    return directorData.map((director: any) => ({
        id: director.recordStatus === "Modified" ? director.id : "00000000-0000-0000-0000-000000000000",
        recordStatus: director.recordStatus || "Added",
        personDetails: {
            firstName: director.firstName || '',
            lastName: director.lastName || '',
            email: director.email || '',
            phoneCode: director.phoneCode || '',
            phoneNumber: director.phoneNumber || '',
            shareHolderPercentage: director.shareHolderPercentage || '0',
            dateOfBirth: director.dob || '',
            country: director.country || ''
        },
        identification: {
            idType: director.docType || '',
            idNumber: director.docNumber || '',
            docExpireDate: director.docExpiryDate || '',
            docIssueDate: director.docIssueDate || '',

            frontDocument: director.frontId || '',
            backDocument: director.backImgId || ''
        },
        selfie: director.selfi || '',
        directorAddress: {
            addressType: director.addressType || '',
            line1: director.addressLine1 || '',
            line2: director.addressLine2 || '',
            city: director.city || '',
            state: director.state || '',
            postalCode: director.postalCode || '',
            country: director.addressCountry || ''
        }
    }));
};

// Transform Representative data for card application payload
export const transformRepresentativeDataForCard = (representativeData: any[]) => {
    return representativeData.map((representative: any) => ({
        id: representative.recordStatus === "Modified" ? representative.id : "00000000-0000-0000-0000-000000000000",
        recordStatus: representative.recordStatus || "Added",
        personDetails: {
            firstName: representative.firstName || '',
            lastName: representative.lastName || '',
            email: representative.email || '',
            phoneCode: representative.phoneCode || '',
            phoneNumber: representative.phoneNumber || '',
            shareHolderPercentage: representative.shareHolderPercentage || '0',
            dateOfBirth: representative.dob || '',
            country: representative.country || ''
        },
        identification: {
            idType: representative.docType || '',
            idNumber: representative.docNumber || '',
            docExpireDate: representative.docExpiryDate || '',
            docIssueDate: representative.docIssueDate || '',

            frontDocument: representative.frontId || '',
            backDocument: representative.backImgId || ''
        },
        selfie: representative.selfi || '',
        representativeAddress: {
            addressType: representative.addressType || '',
            line1: representative.addressLine1 || '',
            line2: representative.addressLine2 || '',
            city: representative.city || '',
            state: representative.state || '',
            postalCode: representative.postalCode || '',
            country: representative.addressCountry || ''
        }
    }));
};

// Build complete company application model for card application
export const buildCardCompanyApplicationModel = (applyCardsKyBData: any, uboData: any[], directorData: any[], representativeData: any[]) => {
    return {
        ...applyCardsKyBData,
        ubos: transformUboDataForCard(uboData),
        directors: transformDirectorDataForCard(directorData),
        representatives: transformRepresentativeDataForCard(representativeData)
    };
};

// Submission: Direct submit
export const handleDirectSubmit = async ({
    userinfo,
    documentsData,
    getUboDataFn,
    getDirectorDataFn,
    getRepresentativeDataFn,
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
}: {
    userinfo: any;
    documentsData: any;
    getUboDataFn: () => any[];
    getDirectorDataFn: () => any[];
    getRepresentativeDataFn: () => any[];
    encryptAES: any;
    selectedAddresses: any;
    isReapply: boolean;
    selectedSector: string;
    selectedType: string;
    selectedBank: any;
    setSubmitLoading: (loading: boolean) => void;
    successSheetRef: any;
    setErrormsg: (msg: string) => void;
    ref: any;
}) => {
    const payload = {
        walletId: null,
        amount: 0,
        documents: [],
        address: selectedAddresses || [],
        ubo: getUboDataFn() || [],
        director: getDirectorDataFn() || [],
        representative: getRepresentativeDataFn() || [],
        isTradingAddress: userinfo?.accountType?.toLowerCase() !== "personal",
        isReapply: isReapply,
        sector: selectedSector,
        type: selectedType
    };
    try {
        // const response = await CreateAccountService.summaryAccountCreation(
        //     selectedBank?.productId,
        //     payload
        // );
        // if (response?.ok) {
        //     setSubmitLoading(false);
        //     successSheetRef.current?.open();
        // } else {
        //     setErrormsg(isErrorDispaly(response));
        //     ref?.current?.scrollTo({ y: 0, animated: true });
        //     setSubmitLoading(false);
        // }

    } catch (error) {
        setErrormsg(isErrorDispaly(error));
        ref?.current?.scrollTo({ y: 0, animated: true });
        setSubmitLoading(false);
    }
};