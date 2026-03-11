import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Formik, Field } from 'formik';
import { Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ViewComponent from '../../../../newComponents/view/view';
import FormikTextInput from '../../../../newComponents/textInputComponents/formik/textInput';
import CustomPickerModal from '../../../../newComponents/pickerComponents/formik/customPicker';
import DatePickerComponent from '../../../../newComponents/datePickers/formik/datePickerWithFormik';
import ButtonComponent from '../../../../newComponents/buttons/button';
import OnboardingService from '../../../../services/onboarding';
import { isErrorDispaly } from '../../../../utils/helpers';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import { useNavigation } from '@react-navigation/native';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import { s } from '../../../../constants/theme/scale';
import PhoneInputWithPicker from '../../../../newComponents/pickerComponents/formik/phonePickerInput';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import SwokipayDashboardLoader from '../../../../newComponents/swokipayloader';
import { WithDrawServices } from '../../../../apiServices/withdrawApis/withdrawServices';
import { AddBeneficiaryValidationSchema, Country, DocumentType, KYCRequirement } from './constants';
import ProfileService from '../../../../services/profile';
import { PersonalInfoData } from '../../../profile/personalnfoScreens/personalInformation/interface';
import FileUpload from '../../../../newComponents/fileUpload/fileUpload';
import * as ImagePicker from 'expo-image-picker';
import PermissionModel from '../../../commonScreens/permissionPopup';
import { checkAppPermissions } from '../../../../services/mediaPermissionService';
import { setBeneficiaryData } from '../../../../redux/actions/withdrawActions';
import ConfirmationPopup from '../../../commonScreens/confirmationPopup/ConfirmationPopup';

const AddBeneficiary = (props:any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const REVERSE_COLOR = useMemo(() => useThemeColors(true), []);
    const reverseCommonStyles = useMemo(() => getThemedCommonStyles(REVERSE_COLOR), [REVERSE_COLOR]);
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const { decryptAES } = useEncryptDecrypt();
    const [countries, setCountries] = useState<Country[]>([]);
    const [kycRequirements, setKycRequirements] = useState<KYCRequirement[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [requiredFields, setRequiredFields] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [personalInfo, setPersonalInfo] = useState<PersonalInfoData | null>(null);
    const rbSheetRef = useRef<any>(null);
    const transferType = props?.route?.params?.values?.transferType || '';
        useEffect(() => {
        fetchCountries();
        fetchKYCRequirements();
        if (transferType === 'first_party') {
            fetchPersonalInfo();
        } else {
            setInitialLoadComplete(true);
        }
    }, [transferType]);

    useEffect(() => {
        if (personalInfo && transferType === 'first_party' && kycRequirements.length > 0) {
            fetchSumsubData();
        }
    }, [personalInfo, kycRequirements]);
        const fetchPersonalInfo = async () => {
        try {
            setLoading(true);
            const response = await ProfileService.getPersonalInformation();
            if (response?.status === 200) {
                setPersonalInfo(response?.data as PersonalInfoData);
            } else {
                setPersonalInfo(null)
                setError(isErrorDispaly(response))
            }
        } catch (err) {
            setError(isErrorDispaly(err))
        } finally {
            setLoading(false);
        }
    };
    const fetchKYCRequirements = async () => {
        try {
            const response: any = await WithDrawServices.fetchDocumentRequirements();
            if (response.status === 200) {
                setKycRequirements(response.data);
            }
            else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
           setError(isErrorDispaly(error));
        }
    };
    const fetchDocumentRequirements = (countryName: string) => {
        const requirement = kycRequirements.find(req => 
            req.countries.split(',').map(c => c.trim()).includes(countryName)
        );
        
        if (!requirement || requirement.documentRequirement === 'BLOCKED') {
            setDocumentTypes([]);
            setRequiredFields([]);
            return;
        }
        
        const fields = requirement.documentRequirement.split(',').map(f => f.trim());
        setRequiredFields(fields);
        
        const docTypes = fields
            .filter(type => type !== 'DocumentNumber' && type !== 'DocFront' && type !== 'DocBack' && type !== 'Image')
            .map(type => ({
                id: type,
                name: type.replace(/_/g, ' ')
            }));
        setDocumentTypes(docTypes);
    }
    const fetchCountries = async () => {
        try {
            const res: any = await OnboardingService.countriesList();
            if (res?.status === 200) {
                setCountries(res.data);
            } else {
                setError(isErrorDispaly(res));
            }
        } catch (err: any) {
            setError(isErrorDispaly(err));
        }
    };
    const fetchSumsubData = () => {
        setLoading(true);
        try {
            const phoneNoSplit = personalInfo?.phoneNo?.split(' ') || [];
            const decryptedData = {
                firstName: decryptAES(personalInfo?.firstName || '') || '',
                lastName: decryptAES(personalInfo?.lastName || '') || '',
                email: decryptAES(personalInfo?.email || '') || '',
                phoneNumber: decryptAES(phoneNoSplit[1] || '') || '',
                countryCode: decryptAES(phoneNoSplit[0] || '') || '',
                addressLine1: '',
                addressLine2: '',
                beneficiaryCountry: personalInfo?.country || '',
                province: '',
                city: '',
                postalCode: '',
                dateOfBirth: personalInfo?.dob ? new Date(personalInfo.dob).toISOString() : '',
                documentType: personalInfo?.documentType || '',
                documentNumber: decryptAES(personalInfo?.documentNumber || '') || '',
                docImage: null,
            };
            setInitialValues(decryptedData);
            
            if (personalInfo?.country) {
                fetchDocumentRequirements(personalInfo.country);
            }
        } catch (err: any) {
            setError(isErrorDispaly(err));
        } finally {
            setLoading(false);
            setInitialLoadComplete(true);
        }
    };

    useHardwareBackHandler(() => {
        confirmCancel();
        return true;
    });

    const handleSubmit = async (values: any, { resetForm }: any) => {
        setError('');
        Keyboard.dismiss();
        setLoading(true);
        try {
            const beneficiaryData = {
                firstName: values.firstName,
                lastName: values.lastName,
                dateOfBirth: values.dateOfBirth,
                email: values.email,
                countryCode: values.countryCode,
                phoneNumber: values.phoneNumber,
                beneficiaryCountry: values.beneficiaryCountry,
                documentType: values.documentType,
                documentNumber: values.documentNumber,
                docImage: values.docImage,
                addressLine1: values.addressLine1,
                addressLine2: values.addressLine2,
                province: values.province,
                city: values.city,
                postalCode: values.postalCode,
                paymentMethod: props?.route?.params?.values?.paymentMethod || '',
                transferType: props?.route?.params?.values?.transferType || '', 
                receiveCurrency: props?.route?.params?.values?.receiveCurrency || '',
                sendCurrency: props?.route?.params?.values?.sendCurrency || '',
                sendAmount: props?.route?.params?.values?.sendAmount || '',
                receiveAmount: props?.route?.params?.values?.receiveAmount || '',
            };
            
            dispatch(setBeneficiaryData(beneficiaryData));
            navigation.navigate("BankInformation", { values: props?.route?.params?.values });
        } catch (err: any) {
            setError(isErrorDispaly(err));
        } finally {
            setLoading(false);
        }
    };

    const isFormComplete = (values: any) => {
        return values.firstName && values.lastName && values.dateOfBirth && values.email && 
               values.beneficiaryCountry && values.countryCode && values.phoneNumber && 
               values.addressLine1 && values.province && values.city && values.postalCode;
    };

    const handleBackPress = () => {
        Keyboard.dismiss();
        confirmCancel();
    };

    const confirmCancel = () => {
        rbSheetRef.current?.open();
    };

    const handleCancel = () => {
        rbSheetRef.current?.close();
        navigation.goBack();
        dispatch(setBeneficiaryData(null));
    };

    const closePopup = () => {
        rbSheetRef.current?.close();
    };

    const closePermissionModel = () => {
        setPermissionModel(false);
    }
    const [initialValues, setInitialValues] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        email: '',
        beneficiaryCountry: '',
        countryCode: '',
        phoneNumber: '',
        documentType: '',
        documentNumber: '',
        docImage: null,
        addressLine1: '',
        addressLine2: '',
        province: '',
        city: '',
        postalCode: '',
    });

    const [selectedCountry, setSelectedCountry] = useState<any>(null);
    const [permissionModel, setPermissionModel] = useState(false);
    const [permissionMessage, setPermissionMessage] = useState('');

    const handleImageUpload = async (fieldName: string, setFieldValue: any, source?: 'camera' | 'library') => {
        setError('');
        Keyboard.dismiss();

        try {
            let result;
            if (source === 'camera') {
                const res = await checkAppPermissions('camera');
                if (res.showPopup) {
                    setPermissionMessage(res.messageKey || 'GLOBAL_CONSTANTS.COMMON_PERMISSION_DENIED_MESSAGE');
                    setPermissionModel(true);
                    return;
                }
                if (!res.allowed) return;
                await new Promise(resolve => setTimeout(resolve, 300));
                result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
            } else {
                const res = await checkAppPermissions('library');
                if (res.showPopup) {
                    setPermissionMessage(res.messageKey || 'GLOBAL_CONSTANTS.COMMON_PERMISSION_DENIED_MESSAGE');
                    setPermissionModel(true);
                    return;
                }
                if (!res.allowed) return;
                await new Promise(resolve => setTimeout(resolve, 300));
                result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
            }

            if (result && !result.canceled) {
                const asset = result.assets[0];
                const fileSize = asset.fileSize || 0;
                const maxSizeInBytes = 15 * 1024 * 1024;
                
                if (fileSize > maxSizeInBytes) {
                    setError('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB');
                    return;
                }
                
                setFieldValue(fieldName, asset.uri);
            }
        } catch (err) {
            setError(isErrorDispaly(err));
        }
    };

    useEffect(() => {
        if (selectedCountry?.name && kycRequirements.length > 0) {
            fetchDocumentRequirements(selectedCountry.name);
        }
    }, [selectedCountry, kycRequirements]);

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader title={'GLOBAL_CONSTANTS.ADD_BENEFICIARY'} onBackPress={handleBackPress} />
                {loading && (
                        <SwokipayDashboardLoader />
                )}
                {error && <ErrorComponent message={error} screen={true} />}
                {!loading && initialLoadComplete && (
                    <KeyboardAwareScrollView
                        contentContainerStyle={[]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        enableOnAndroid={true}
                        extraScrollHeight={s(150)}
                        enableAutomaticScroll={true}
                    >
                        <ViewComponent>
                            <Formik
                                initialValues={initialValues}
                                validationSchema={AddBeneficiaryValidationSchema}
                                onSubmit={handleSubmit}
                                enableReinitialize
                            >
                                {({ values, handleSubmit, setFieldValue, isValid }) => {
                                    const isFirstParty = transferType === 'first_party';
                                    const isButtonEnabled = isFormComplete(values) && isValid && !loading;
                                    return (
                                        <>
                                            {/* First Name */}
                                            <FormikTextInput
                                                label={'GLOBAL_CONSTANTS.FIRST_NAME'}
                                                name="firstName"
                                                placeholder={"GLOBAL_CONSTANTS.ENTER_FIRST_NAME"}
                                                isRequired={true}
                                                editable={!isFirstParty}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            {/* Last Name */}
                                            <FormikTextInput
                                                label={'GLOBAL_CONSTANTS.LAST_NAME'}
                                                name="lastName"
                                                placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"}
                                                isRequired={true}
                                                editable={!isFirstParty}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            {/* Date of Birth */}
                                            <DatePickerComponent
                                                name="dateOfBirth"
                                                label={'GLOBAL_CONSTANTS.DATE_OF_BIRTH'}
                                                placeholder={'GLOBAL_CONSTANTS.DATE_PLACEHOLDER'}
                                                required={true}
                                                maximumDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                                                disabled={isFirstParty}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            {/* Email Address */}
                                            <FormikTextInput
                                                label={'GLOBAL_CONSTANTS.EMAIL_ADDRESS'}
                                                name="email"
                                                placeholder={"GLOBAL_CONSTANTS.ENTER_EMAIL"}
                                                keyboardType="email-address"
                                                isRequired={true}
                                                autoCapitalize="none"
                                                editable={!isFirstParty}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            {/* Beneficiary Country */}
                                            <Field
                                                name="beneficiaryCountry"
                                                component={CustomPickerModal}
                                                data={countries}
                                                label={'GLOBAL_CONSTANTS.COUNTRY'}
                                                isRequired={true}
                                                placeholder={'GLOBAL_CONSTANTS.SELECT_COUNTRY'}
                                                searchPlaceholder={'GLOBAL_CONSTANTS.SEARCH_COUNTRY'}
                                                disabled={isFirstParty}
                                                onChange={(value: string) => {
                                                    setSelectedCountry(value);
                                                    setFieldValue('documentType', '');
                                                    setFieldValue('documentNumber', '');
                                                }}
                                            />

                                            {/* Phone Number with Country Code */}
                                            <PhoneInputWithPicker
                                                phoneFieldName="phoneNumber"
                                                codeFieldName="countryCode"
                                                placeholder={"GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER"}
                                                modalTitle="GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"
                                                searchPlaceholder={"GLOBAL_CONSTANTS.SEARCH_COUNTRY"}
                                                customBind={["name", " (", "mobileCode", ")"]}
                                                data={countries || []}
                                                showCountryImages={true}
                                                label={"GLOBAL_CONSTANTS.MOBILE_NO"}
                                                maxLength={10}
                                                disabled={isFirstParty}
                                                isRequired={true}
                                                isCodeDisable={isFirstParty}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            {/* Document Type - Only show if documentTypes available */}
                                            {documentTypes.length > 0 && (
                                                <>
                                                    <Field
                                                        name="documentType"
                                                        component={CustomPickerModal}
                                                        data={documentTypes}
                                                        label={'GLOBAL_CONSTANTS.DOCUMENT_TYPE'}
                                                        isRequired={true}
                                                        placeholder={'GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE'}
                                                        disabled={isFirstParty}
                                                        searchPlaceholder={'GLOBAL_CONSTANTS.SEARCH_DOCUMENT_TYPE'}
                                                    />
                                                    <ViewComponent style={commonStyles.formItemSpace} />
                                                </>
                                            )}

                                            {/* Document Number - Only show if DocumentNumber is required */}
                                            {requiredFields.includes('DocumentNumber') && (
                                                <>
                                                    <FormikTextInput
                                                        label={'GLOBAL_CONSTANTS.DOCUMENT_NUMBER'}
                                                        name="documentNumber"
                                                        placeholder={"GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"}
                                                        isRequired={true}
                                                        autoCapitalize="characters"
                                                        editable={!isFirstParty}
                                                    />
                                                    <ViewComponent style={commonStyles.formItemSpace} />
                                                </>
                                            )}

                                            {/* Document Image - Only show if Image is required */}
                                            {requiredFields.includes('Image') && (
                                                <>
                                                    <FileUpload
                                                        label="GLOBAL_CONSTANTS.UPLOAD_DOCUMENT_IMAGE"
                                                        uploadedImageUri={values.docImage}
                                                        onSelectImage={(source) => handleImageUpload('docImage', setFieldValue, source)}
                                                        deleteImage={() => setFieldValue('docImage', null)}
                                                        isRequired={false}
                                                        showImageSourceSelector={true}
                                                    />
                                                    <ViewComponent style={commonStyles.formItemSpace} />
                                                </>
                                            )}

                                            {/* Address Line 1 */}
                                            <FormikTextInput
                                                label={'GLOBAL_CONSTANTS.ADDRESS_LINE'}
                                                name="addressLine1"
                                                placeholder={"GLOBAL_CONSTANTS.ADDRESS_LINE1_PLACEHOLDER"}
                                                isRequired={true}
                                               
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            {/* Address Line 2 */}
                                            <FormikTextInput
                                                label={'GLOBAL_CONSTANTS.ADDRESS_LINE_2'}
                                                name="addressLine2"
                                                placeholder={"GLOBAL_CONSTANTS.ADDRESS_LINE2_PLACEHOLDER"}
                                               
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            {/* Province / State */}
                                            <FormikTextInput
                                                label={'GLOBAL_CONSTANTS.PROVINCE_STATE'}
                                                name="province"
                                                placeholder={"GLOBAL_CONSTANTS.STATE_PLACEHOLDER"}
                                                isRequired={true}
                                               
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            {/* City */}
                                            <FormikTextInput
                                                label={'GLOBAL_CONSTANTS.CITY'}
                                                name="city"
                                                placeholder={"GLOBAL_CONSTANTS.CITY_PLACEHOLDER"}
                                                isRequired={true}
                                               
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            {/* Postal / ZIP Code */}
                                            <FormikTextInput
                                                label={'GLOBAL_CONSTANTS.POSTAL_ZIP_CODE'}
                                                name="postalCode"
                                                placeholder={"GLOBAL_CONSTANTS.POSTAL_CODE_PLACEHOLDER"}
                                                isRequired={true}
                                                
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            {/* Back and Next Buttons */}
                                            <ViewComponent style={[commonStyles.dflex, { gap: s(12), marginTop: s(30), marginBottom: s(30) }]}>
                                                <ViewComponent style={{ flex: 1 }}>
                                                    <ButtonComponent
                                                        title={'GLOBAL_CONSTANTS.BACK'}
                                                        onPress={handleBackPress}
                                                        solidBackground={true}

                                                    />
                                                </ViewComponent>
                                                <ViewComponent style={{ flex: 1 }}>
                                                    <ButtonComponent
                                                        title={'GLOBAL_CONSTANTS.NEXT'}
                                                        onPress={handleSubmit}
                                                        loading={loading}
                                                        disable={!isButtonEnabled}
                                                    />
                                                </ViewComponent>
                                            </ViewComponent>
                                        </>
                                    );
                                }}
                            </Formik>
                        </ViewComponent>
                    </KeyboardAwareScrollView>
                )}
            </Container>
            <ConfirmationPopup
                rbSheetRef={rbSheetRef}
                title="GLOBAL_CONSTANTS.ARE_YOU_SURE_YOU_WANT_TO_GO_BACK"
                message="GLOBAL_CONSTANTS.ANY_UNSAVED_DETAILS_MAY_BE_LOST"
                cancelButtonText="GLOBAL_CONSTANTS.STAY_ON_PAGE"
                confirmButtonText="GLOBAL_CONSTANTS.GO_BACK"
                onCancel={closePopup}
                onConfirm={handleCancel}
            />
            <PermissionModel permissionDeniedContent={permissionMessage} closeModel={closePermissionModel} addModelVisible={permissionModel} />
        </ViewComponent>
    );
};

export default AddBeneficiary;
