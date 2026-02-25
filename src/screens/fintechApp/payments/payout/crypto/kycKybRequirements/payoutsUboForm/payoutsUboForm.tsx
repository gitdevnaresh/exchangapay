import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Alert, Modal } from "react-native";
import { getThemedCommonStyles } from "../../../../../../../components/CommonStyles";
import Container from "../../../../../../../components/container/container";
import { useThemeColors } from "../../../../../../../hooks/themedHook/useThemeColors";
import PageHeader from "../../../../../../../components/pageHeader/pageHeader";
import ViewComponent from "../../../../../../../components/view/view";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { isErrorDispaly, formatDateTimeAPI } from "../../../../../../../utils/helpers";
import UboFormComponent from "../../../../../../../components/common/UboFormFields";
import ButtonComponent from "../../../../../../../components/buttons/button";
import ErrorComponent from "../../../../../../../components/errorDisplay/errorDisplay";
import CreateAccountService from "../../../../../../../apiServices/bank/createAccount";
import ProfileService from "../../../../../../../apiServices/profile";
import * as ImagePicker from 'expo-image-picker';
import { getFileExtension, verifyFileTypes } from "../../../../../onboarding/constants";
import CustomPickerNonFormik from "../../../../../../../components/pickerComponents/basic/customPickerNonFormik";
import useEncryptDecrypt from "../../../../../../../hooks/encDecHook";
import PaymentService from "../../../../../../../apiServices/payments";
import DashboardLoader from "../../../../../../../components/loader"
import { useLngTranslation } from "../../../../../../../hooks/languagesHook/useLngTranslation";
import { useSelector } from 'react-redux';
import SafeAreaViewComponent from "../../../../../../../components/safeArea/safeArea";
import PayoutAddressForm from "../PayoutAddressForm";


interface PayoutUboFormProps {
    onClose: () => void;
    onSubmit: (uboObject: any) => void;
    editingUbo?: any;
    isEditMode?: boolean;
    selectedProgramId?: string;
    addressesList?: any[];
    hideAddressField?: boolean;
    kycRequirements?: any;
    onAddressAdded?: () => void;
}

const PayoutUboForm: React.FC<PayoutUboFormProps> = ({ onClose, onSubmit, editingUbo, isEditMode, selectedProgramId, addressesList: propAddressesList = [], hideAddressField = false, kycRequirements: propKycRequirements, onAddressAdded }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const [countryCodelist, setCountryCodelist] = useState<any[]>([]);
    const [countryList, setCountryList] = useState<any[]>([]);
    const [documentTypesLookUp, setDocumentTypesLookUp] = useState<any[]>([]);
    const [imagesLoader, setImagesLoader] = useState<{ frontId: boolean; backImgId: boolean }>({ frontId: false, backImgId: false });
    const [fileNames, setFileNames] = useState<{ frontId: string | null; backImgId: string | null }>({ frontId: null, backImgId: null });
    const [formActions, setFormActions] = useState<{ validateForm: () => Promise<any>; setTouched: (touched: any) => void; handleSubmit: () => void; setFieldValue: (field: string, value: any) => void } | null>(null);
    const [btnLoading, setBtnLoading] = useState(false);
    const [uboError, setUboError] = useState<string | null>(null);
    const scrollRef = useRef<any>(null);
    const today = new Date();
    const [benificiaryList, setBeneficiariesList] = useState<any[]>([]);
    const [uboDetails, setUbodetails] = useState<any>();
    const [selectedUbo, setSelectedUbo] = useState<any>();
    const [uboDetailsLoading, setDetailsLoading] = useState<boolean>(false);
    const [kycRequirements, setKycRequirements] = useState<any>(propKycRequirements);
    const [filteredDocumentTypes, setFilteredDocumentTypes] = useState<any[]>([]);
    const [addressesList, setAddressesList] = useState<any[]>(propAddressesList);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const { decryptAES, encryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const { t } = useLngTranslation();

    const [uboInitValues, setUboInitValues] = useState<any>({
        firstName: "",
        lastName: "",
        middleName: '',
        uboPosition: "Shareholder",
        dob: '',
        shareHolderPercentage: "",
        phoneCode: '',
        phoneNumber: "",
        address: "",
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

    const [shouldPreventOverride, setShouldPreventOverride] = useState<boolean>(false);

    useEffect(() => {
        setAddressesList(propAddressesList);
        
        // Auto-select first address when addresses list updates (since no isDefault field)
        // But don't override if we just set an address from refresh
        if (propAddressesList.length > 0 && formActions?.setFieldValue && uboInitValues && !shouldPreventOverride) {
            const firstAddress = propAddressesList[0];
            
            if (firstAddress && !uboInitValues.address) {
                formActions.setFieldValue('address', firstAddress.name);
            }
        }
    }, [propAddressesList, formActions, uboInitValues, shouldPreventOverride]);

    useEffect(() => {
        if (propKycRequirements) {
            setKycRequirements(propKycRequirements);
        }
    }, [propKycRequirements]);

    useEffect(() => {
        getListOfCountryCodeDetails();
        fetchDocumentTypes();
        fetchBenificiaryList();
        getKycRequirements();
        
        // Refresh addresses when component mounts or becomes focused
        refreshAddressesList();
        
        // Set selected UBO for edit mode
        if (!isEditMode) {
            setSelectedUbo(null);
        }
    }, []);


    useEffect(() => {
        if (uboDetails) {
            const newInitValues = {
                firstName: uboDetails._isFromAPI ? decryptAES(uboDetails.firstName) : uboDetails.firstName || "",
                lastName: uboDetails._isFromAPI ? decryptAES(uboDetails.lastName) : uboDetails.lastName || "",
                middleName: uboDetails.middleName || '',
                uboPosition: uboDetails.uboPosition || "Shareholder",
                dob: uboDetails.dob || '',
                shareHolderPercentage: uboDetails.shareHolderPercentage?.toString() || "",
                phoneCode: uboDetails._isFromAPI ? decryptAES(uboDetails.phoneCode) : uboDetails.phoneCode || '',
                phoneNumber: uboDetails._isFromAPI ? decryptAES(uboDetails.phoneNumber) : uboDetails.phoneNumber || "",
                address: uboDetails.address || '',
                note: uboDetails.note || "",
                frontId: uboDetails.docDetails?.documentFront || uboDetails.docDetails?.frontImage || uboDetails.docDetails?.frontIdPhoto || '',
                backImgId: uboDetails.docDetails?.documentBack || uboDetails.docDetails?.backImage || uboDetails.docDetails?.backDocImage || '',
                docType: uboDetails.docDetails?.documentType || uboDetails.docDetails?.type || uboDetails.docDetails?.docType || '',
                docDetailsid: uboDetails.docDetails?.id || '',
                country: uboDetails.country || '',
                email: uboDetails._isFromAPI ? decryptAES(uboDetails.email) : uboDetails.email || '',
                docNumber: uboDetails._isFromAPI ? decryptAES(uboDetails.docDetails?.documentNumber || uboDetails.docDetails?.docNumber) : (uboDetails.docDetails?.documentNumber || uboDetails.docDetails?.docNumber) || '',
                docExpireDate: uboDetails.docDetails?.docExpiryDate || uboDetails.docDetails?.docExpireDate || ''
            };
            
            setUboInitValues(newInitValues);

            // Set file names if images exist
            const frontImage = uboDetails.docDetails?.documentFront || uboDetails.docDetails?.frontImage || uboDetails.docDetails?.frontIdPhoto;
            const backImage = uboDetails.docDetails?.documentBack || uboDetails.docDetails?.backImage || uboDetails.docDetails?.backDocImage;

            if (frontImage) {
                setFileNames(prev => ({
                    ...prev,
                    frontId: frontImage.split('/').pop() || 'existing_front_image'
                }));
            }
            if (backImage) {
                setFileNames(prev => ({
                    ...prev,
                    backImgId: backImage.split('/').pop() || 'existing_back_image'
                }));
            }
        } else if (isEditMode && editingUbo) {
            const newInitValues = {
                firstName: editingUbo._isFromAPI ? decryptAES(editingUbo.firstName||editingUbo.firstname) : (editingUbo.firstName||editingUbo.firstname) || "",
                lastName: editingUbo._isFromAPI ? decryptAES(editingUbo.lastName||editingUbo.lastname) : (editingUbo.lastName||editingUbo.lastname) || "",
                middleName: editingUbo.middleName || '',
                uboPosition: editingUbo.uboPosition || "Shareholder",
                dob: editingUbo.dob || '',
                shareHolderPercentage: editingUbo.shareHolderPercentage?.toString() || "",
                phoneCode: editingUbo._isFromAPI ? decryptAES(editingUbo.phoneCode) : editingUbo.phoneCode || '',
                phoneNumber: editingUbo._isFromAPI ? decryptAES(editingUbo.phoneNumber) : editingUbo.phoneNumber || "",
                address: editingUbo.address || '',
                note: editingUbo.note || "",
                frontId: editingUbo.docDetails?.documentFront || editingUbo.docDetails?.frontImage || editingUbo.docDetails?.frontIdPhoto || '',
                backImgId: editingUbo.docDetails?.documentBack || editingUbo.docDetails?.backImage || editingUbo.docDetails?.backDocImage || '',
                docType: editingUbo.docDetails?.type || editingUbo.docDetails?.docType || '',
                docDetailsid: editingUbo.docDetails?.id || '',
                country: editingUbo.country || '',
                email: editingUbo._isFromAPI ? decryptAES(editingUbo.email) : editingUbo.email || '',
                docNumber: editingUbo._isFromAPI ? decryptAES(editingUbo.docDetails?.docNumber) : editingUbo.docDetails?.docNumber || '',
                docExpireDate: editingUbo.docDetails?.docExpiryDate || editingUbo.docDetails?.docExpireDate || ''
            };
            setUboInitValues(newInitValues);

            // Set file names if images exist
            const frontImage = editingUbo.docDetails?.frontImage || editingUbo.docDetails?.frontIdPhoto;
            const backImage = editingUbo.docDetails?.backImage || editingUbo.docDetails?.backDocImage;

            if (frontImage) {
                setFileNames(prev => ({
                    ...prev,
                    frontId: frontImage.split('/').pop() || 'existing_front_image'
                }));
            }
            if (backImage) {
                setFileNames(prev => ({
                    ...prev,
                    backImgId: backImage.split('/').pop() || 'existing_back_image'
                }));
            }
        } else {
            // Reset to empty values for add mode
            const firstAddress = addressesList[0];
            setUboInitValues({
                firstName: "",
                lastName: "",
                middleName: '',
                uboPosition: "Shareholder",
                dob: '',
                shareHolderPercentage: "",
                phoneCode: '',
                phoneNumber: "",
                address: firstAddress?.name || "",
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
        }
    }, [isEditMode, editingUbo, decryptAES, uboDetails, addressesList]);

    // Filter document types when initial values change (for edit mode)
    useEffect(() => {
        if (uboInitValues.country && kycRequirements) {
            const filtered = getFilteredDocumentTypes(uboInitValues.country);
            setFilteredDocumentTypes(filtered);
        }
    }, [uboInitValues.country, kycRequirements, documentTypesLookUp]);
    const getListOfCountryCodeDetails = async () => {
        try {
            const response: any = await CreateAccountService.getAddressLooupDetails();
            if (response?.ok) {
                setCountryCodelist(response?.data?.PhoneCodes ?? []);
            } else {
                setUboError(isErrorDispaly(response));
            }
        } catch (error) {
            setUboError(isErrorDispaly(error));
        }
    };
    const fetchBenificiaryList = async () => {
        try {
            const response: any = await PaymentService.kycBenificiariesList();
            if (response.ok) {
                setBeneficiariesList(response.data);
                
                // Set selected beneficiary for edit mode
                if (isEditMode && editingUbo) {
                    const matchingBeneficiary = response.data.find((beneficiary: any) => 
                        beneficiary.id === editingUbo.id || 
                        beneficiary.name === `${editingUbo.firstName || editingUbo.firstname} ${editingUbo.lastName || editingUbo.lastname}`.trim()
                    );
                    if (matchingBeneficiary) {
                        setSelectedUbo(matchingBeneficiary);
                    }
                }
            }
            else {
                setUboError(isErrorDispaly(response))
            }
        }
        catch (error) {
            setUboError(isErrorDispaly(error))
        }
    }
    const getUbodetails = async (id: any) => {
        setDetailsLoading(true);
        try {
            const response: any = await PaymentService.uboDetails(id)
            if (response) {
                // Add _isFromAPI flag to indicate this data comes from API and needs decryption
                const uboDetailsWithFlag = {
                    ...response?.data,
                    _isFromAPI: true
                };
                setUbodetails(uboDetailsWithFlag);
            }
            else {
                setUboError(isErrorDispaly(response.data))
            }
        }
        catch (error) {
            setUboError(isErrorDispaly(error))
        }
        finally {
            setDetailsLoading(false);
        }
    }
    const getKycRequirements = async () => {
        if (!selectedProgramId) return;
        setDetailsLoading(true);
        try {
            const response: any = await PaymentService.selectedPayoutCryptokycrequirements(selectedProgramId)
            if (response) {
                setKycRequirements(response?.data)
            }
            else {
                setUboError(isErrorDispaly(response.data))
            }
        }
        catch (error) {
            setUboError(isErrorDispaly(error))
        }
        finally {
            setDetailsLoading(false);
        }
    }


    const fetchDocumentTypes = async () => {
        try {
            const response: any = await ProfileService.getDocumentTypes();
            if (response?.ok) {
                setDocumentTypesLookUp(response?.data?.KycDocumentTypes || []);
                setCountryList(response?.data?.countryWithTowns || []);
            } else {
                setUboError(isErrorDispaly(response));
            }
        } catch (error) {
            setUboError(isErrorDispaly(error));
        }
    };

const getFilteredDocumentTypes = (selectedCountry: string) => {
    if (!selectedCountry || !kycRequirements?.kyb?.uboDocuments) {
        return documentTypesLookUp;
    }

    const uboDocuments = kycRequirements.kyb.uboDocuments;

    const countryRequirement =
        uboDocuments.find((doc: any) =>
            doc.countries &&
            doc.countries.split(',')
                .map((c: string) => c.trim())
                .includes(selectedCountry)
        )
        ||
        uboDocuments.find((doc: any) =>
            doc.countries === 'Default'
        );

    if (countryRequirement && countryRequirement.kycrequirements) {
        const requiredDocTypes =
            countryRequirement.kycrequirements
                .split(',')
                .map((type: string) => type.trim());

        const filtered =
            requiredDocTypes.length > 0
                ? [{
                    code: requiredDocTypes[0],
                    name: requiredDocTypes[0]
                        .replace(/_/g, ' ')
                        .toLowerCase()
                        .replace(/\b\w/g, l => l.toUpperCase())
                }]
                : [];

        return filtered;
    }

    return documentTypesLookUp;
};

const handleCountryChange = (country: string) => {
        const filtered = getFilteredDocumentTypes(country);
        setFilteredDocumentTypes(filtered);
        // Clear document type when country changes using Formik's setFieldValue
        if (formActions?.setFieldValue) {
            const newDocType = filtered[0]?.name || '';
            formActions.setFieldValue('docType', newDocType);
            formActions.setFieldValue('docExpireDate', '');
            formActions.setFieldValue('frontId', '');
            formActions.setFieldValue('backImgId', '');
            formActions.setFieldValue('docNumber', '');
        }

        // Clear file names
        setFileNames({ frontId: null, backImgId: null });
    };

    const handleUploadImg = async (
        item: string,
        setFields: (field: string, value: any) => void,
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
                    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, aspect: [1, 1], quality: 0.5 });

            if (!result.canceled) {
                const selectedImage = result.assets[0];
                const { uri, type } = selectedImage;
                const fileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
                const fileExtension = getFileExtension(selectedImage.uri);
                const isValidFileType = verifyFileTypes(fileName);

                if (!isValidFileType) {
                    setUboError("Please select a valid image file");
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
                    // Simulate upload - just set the URI for demo
                    setTimeout(() => {
                        setFields(item, uri);
                        setImagesLoader(prevState => ({
                            ...prevState,
                            [item]: false
                        }));
                    }, 1000);
                }
            }
        } catch (err) {
            setUboError(isErrorDispaly(err));
            setImagesLoader(prevState => ({
                ...prevState,
                [item]: false
            }));
        }
    };

    const deleteImage = (fileName: string, setFieldValue: (field: string, value: any) => void) => {
        setFieldValue(fileName, '');
        setFileNames(prevState => ({
            ...prevState,
            [fileName]: null
        }));
    };

    const handleUboSubmit = (values: any) => {
        setBtnLoading(true);
        const uboObject = {
            firstName: values?.firstName,
            lastName: values?.lastName,
            middleName: values?.middleName,
            uboPosition: values?.uboPosition,
            dob: formatDateTimeAPI(values?.dob),
            shareHolderPercentage: values?.shareHolderPercentage,
            phoneCode: values?.phoneCode,
            phoneNumber: values?.phoneNumber,
            address: values?.address,
            note: values?.note,
            country: values?.country,
            email: values?.email,
            docDetails: {
                frontImage: values?.frontId || '',
                backImage: values?.backImgId || '',
                type: values?.docType || '',
                docNumber: values?.docNumber || "",
                docExpiryDate: values?.docExpireDate || ""
            }
        };

        setTimeout(() => {
            setBtnLoading(false);
            onSubmit(uboObject);
        }, 1000);
    };

    const handleValidationSave = async () => {
        if (!formActions?.validateForm || !formActions?.handleSubmit) return;        
        const errors = await formActions.validateForm();
        if (Object.keys(errors).length > 0) {
            const touchedFields = Object.keys(uboInitValues).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {} as any);
            formActions.setTouched(touchedFields);
            setUboError(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
            setTimeout(() => {
                if (scrollRef?.current?.scrollTo) {
                    scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
                }
            }, 100);
        } else {
            formActions.handleSubmit();
        }
    };

    const handleUboError = useCallback(() => {
        setUboError(null);
    }, []);

    const handleAddAddress = () => {
        setAddressModalVisible(true);
    };

    const refreshAddressesList = async () => {
        try {
            const response: any = await PaymentService.kycAddresses();
            if (response.ok) {
                const filterData = response?.data?.map((item: any) => ({
                    ...item,
                    name: item.favoriteName
                }));
                setAddressesList(filterData);
                
                // Auto-select first address after refresh
                if (filterData.length > 0 && formActions?.setFieldValue) {
                    const firstAddress = filterData[0];
                    formActions.setFieldValue('address', firstAddress.name);
                    setShouldPreventOverride(true);
                    
                    // Reset the flag after a delay to allow normal binding later
                    setTimeout(() => {
                        setShouldPreventOverride(false);
                    }, 2000);
                }
            }
        } catch (error) {
            setUboError(isErrorDispaly(error));
        }
    };

    const handleCloseAddressModal = () => {
        setAddressModalVisible(false);
    };

    const handleAddressSubmit = async (addressObject: any) => {
        try {
            // Encrypt sensitive fields like the working example
            const encryptedAddressObject = {
                ...addressObject,
                postalCode: addressObject?.postalCode ? encryptAES(addressObject.postalCode) : "",
                phoneNumber: addressObject?.phoneNumber ? encryptAES(addressObject.phoneNumber) : "",
                phoneCode: addressObject?.phoneCode ? encryptAES(addressObject.phoneCode) : "",
                email: addressObject?.email ? encryptAES(addressObject.email) : "",
                createdBy: userInfo?.userName || userInfo?.name,
            };
            
            const response = await PaymentService.brlAddressPost(encryptedAddressObject);
            if (response.ok) {
                setAddressModalVisible(false);
                await refreshAddressesList();
                // Notify parent to refresh its address list
                if (onAddressAdded) {
                    onAddressAdded();
                }
            } else {
                // Pass the actual API response to CommonAddress for proper error handling
                throw response;
            }
        } catch (error) {
            // Re-throw error to be handled by CommonAddress component
            throw error;
        }
    };

    const handleSelectBenificiary = (selected: any) => {
        setSelectedUbo(selected);
        setUboError(null);
        if (selected?.id) {
            getUbodetails(selected?.id);
        } else {
            setUbodetails(null);
        }
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {uboDetailsLoading && (
                <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </SafeAreaViewComponent>
            )}
            {!uboDetailsLoading && <Container style={commonStyles.container}>
                <PageHeader
                    title={isEditMode ? "GLOBAL_CONSTANTS.EDIT_UBO" : "GLOBAL_CONSTANTS.ADD_UBO"}
                    onBackPress={onClose}
                />
                <KeyboardAwareScrollView
                    ref={scrollRef}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                >
                    <ViewComponent>
                        {uboError && <ErrorComponent message={uboError} onClose={handleUboError} />}
                        <ViewComponent style={[commonStyles.titleSectionGap]} />

                        {!uboDetailsLoading && <CustomPickerNonFormik
                            label="GLOBAL_CONSTANTS.BENFICIARY"
                            placeholder="GLOBAL_CONSTANTS.SELECT_BENEFICIARIES"
                            data={benificiaryList || []}
                            value={selectedUbo?.name}
                            onChange={(selected) => {
                                handleSelectBenificiary(selected)
                            }}
                            modalTitle="GLOBAL_CONSTANTS.SELECT_BENEFICIARIES"
                        />}
                        <ViewComponent style={[commonStyles.formItemSpace]} />

                        {!uboDetailsLoading && (
                            <UboFormComponent
                                key={`form-${selectedUbo?.id || 'no-beneficiary'}-${uboDetails?.id || 'no-details'}-${JSON.stringify(uboInitValues).slice(0, 50)}`}
                                onSubmit={handleUboSubmit}
                                initialValues={uboInitValues}
                                countryCodelist={countryCodelist}
                                countryList={countryList}
                                documentTypesLookUp={filteredDocumentTypes.length > 0 ? filteredDocumentTypes : [{ code: "PASSPORT", name: "Passport" }]}
                                imagesLoader={imagesLoader}
                                fileNames={fileNames}
                                onUploadImg={handleUploadImg}
                                deleteImage={deleteImage}
                                innerRef={scrollRef}
                                maxDate={maxDate}
                                loading={btnLoading}
                                onValidationError={setUboError}
                                onFormReady={setFormActions}
                                onCountryChange={handleCountryChange}
                                screenName="PayoutUboForm"
                                isDcoumentExpDate={false}
                                addressesList={addressesList}
                                hideAddressField={hideAddressField}
                                onAddAddress={handleAddAddress}
                            />
                        )}
                        {!uboDetailsLoading && (
                            <>
                                <ViewComponent style={[commonStyles.mb40]} />
                                <ButtonComponent
                                    title={"GLOBAL_CONSTANTS.CONFIRM"}
                                    loading={btnLoading}
                                    disable={btnLoading}
                                    onPress={handleValidationSave}
                                />
                                <ViewComponent style={[commonStyles.buttongap]} />
                                <ButtonComponent
                                    title={"GLOBAL_CONSTANTS.CANCEL"}
                                    onPress={onClose}
                                    solidBackground={true}
                                />
                            </>
                        )}
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </KeyboardAwareScrollView>
            </Container>}
            
            <Modal
                animationType="slide"
                transparent={false}
                visible={addressModalVisible}
                onRequestClose={handleCloseAddressModal}
            >
                <PayoutAddressForm
                    onClose={handleCloseAddressModal}
                    onSubmit={handleAddressSubmit}
                    kycRequirements={kycRequirements}
                    useKycAddressTypes={true}
                />
            </Modal>
        </ViewComponent>
    );
};

export default PayoutUboForm;