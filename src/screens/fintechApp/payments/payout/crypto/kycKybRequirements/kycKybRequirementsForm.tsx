import React, { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import Container from "../../../../../../components/container/container";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import ViewComponent from "../../../../../../components/view/view";
import { Field, Formik } from 'formik';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CompanyFields from "./companyFields/companyFields";
import PaymentService from "../../../../../../apiServices/payments";
import { dateFormates, isErrorDispaly } from "../../../../../../utils/helpers";
import TextMultiLanguage from "../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ParagraphComponent from "../../../../../../components/textComponets/paragraphText/paragraph";
import useEncryptDecrypt from "../../../../../../hooks/encDecHook";
import { Data, KycKyb } from "./interface/interface";
import { Modal, TouchableOpacity } from "react-native";
import PayoutUboForm from "./payoutsUboForm/payoutsUboForm";
import FlatListComponent from "../../../../../../components/flatList/flatList";
import NoDataComponent from "../../../../../../components/noData/noData";
import DocumentUploadFields from "./uploadDocumentFields/uploadDocuments";
import { s } from "../../../../../../constants/styels/scale";
import CustomPicker from "../../../../../../components/customPicker/CustomPicker";
import { FORM_FIELD } from "../../../../onboarding/kyb/constants";
import PayoutAddressForm from './PayoutAddressForm';
import AddIcon from "../../../../../../components/addCommonIcon/addCommonIcon";
import InfoTooltip from "../../../../../../components/tooltip/InfoTooltip";
import ButtonComponent from "../../../../../../components/buttons/button";
import DashboardLoader from "../../../../../../components/loader";
import SafeAreaViewComponent from "../../../../../../components/safeArea/safeArea";
import ErrorComponent from "../../../../../../components/errorDisplay/errorDisplay";
import { useRef } from 'react';
import { useLngTranslation } from "../../../../../../hooks/languagesHook/useLngTranslation";
import { createKybValidationSchema, validateUboFields } from './validations/kybValidations';
import { buildKybObject } from "./utils/kybObjectBuilder";
import { FormattedDateText } from "../../../../../../components/textComponets/dateTimeText/dateTimeText";
import CardsModuleService from "../../../../../../apiServices/cards";
import { showAppToast } from "../../../../../../components/toasterMessages/ShowMessage";
import { KYB_INFO_CONSTANTS } from "../../../../onboarding/kyb/constants";
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import CustomeditLink from "../../../../../../components/svgIcons/mainmenuicons/linkedit";
import LabelComponent from "../../../../../../components/textComponets/lableComponent/lable";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AddCardsAddress from "../../../../cards/apply_card/apply_card_kyc/addCardsKycAddress";
import PaymentNotAvailable from "../components/unsupportedCountry";

const KycKybRequirementsForm = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const [kycRequirements, setKycRequirements] = useState<KycKyb | undefined>();
    const [Lookups, setLookups] = useState<Data | undefined>();
    const [error, setError] = useState<string | undefined>();
    const [isAddAddressModalVisible, setAddAddressModalVisible] = useState<boolean>(false);

    const scrollToTop = () => {
        setTimeout(() => {
            if (scrollRef?.current) {
                if (scrollRef.current.scrollTo) {
                    scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
                } else if (scrollRef.current.scrollToPosition) {
                    scrollRef.current.scrollToPosition(0, 0, true);
                }
            }
        }, 100);
    };

    const setErrorWithScroll = (errorMsg: string | null) => {
        setError(errorMsg || "");
        if (errorMsg) {
            scrollToTop();
        }
    };
    const { decryptAES, encryptAES } = useEncryptDecrypt();
    const safeDecrypt = useCallback((value: any) => {
        if (!value || typeof value !== 'string') return value || '';
        try {
            return decryptAES(value);
        } catch {
            return value;
        }
    }, [decryptAES]);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [modalVisible, setModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [uboList, setUboList] = useState<any[]>([]);
    const [editingUbo, setEditingUbo] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [addressesList, setAddressesList] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        businessName: '',
        RegistrationNo: '',
        registrationDate: '',
        chooseBusinessTrype: '',
        docType: '',
        frontId: '',
        businessRegistrationProofType: '',
        businessRegistrationProof: '',
        address: ""
    });
    const [imagesLoader, setImagesLoader] = useState<{ frontId: boolean; businessRegistrationProof: boolean }>({ frontId: false, businessRegistrationProof: false });
    const [fileNames, setFileNames] = useState<{ frontId: string | null; businessRegistrationProof: string | null }>({ frontId: null, businessRegistrationProof: null });
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<any>(null);
    const { t } = useLngTranslation();
    const [kybDocumentsDetails, setKybDocumentsDetails] = useState<any[]>([]);

    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    getLookups(),
                    Addresses(),
                    props?.route?.params?.VaultData?.productId ? PayoutKycRequirements() : Promise.resolve()
                ]);
            } finally {
                setLoading(false);
            }
        };
        initializeData();
    }, [props?.route?.params?.VaultData?.productId]);

    useEffect(() => {
        if (kycRequirements?.kyb) {

            const kyb = kycRequirements?.kyb;
            const docs = kyb?.documents || [];
            const businessProofCode = Lookups?.BusinessRegistrationProof?.[0]?.code || '';
            const docCode = (Lookups?.Documents?.[0]?.code || '')?.toLowerCase();

            const findDocsByType = (code: string) =>
                docs
                    .filter((doc: any) => (doc?.type?.type || '')?.toLowerCase() == code?.toLowerCase())
                    .map((doc: any) => ({
                        id: doc?.id,
                        fileName: doc?.fileName,
                        type: doc?.type || code,
                        blob: doc?.blob || '',
                        createdDate: doc?.createdDate || null,
                    }));

            const businessProofDocs = findDocsByType(businessProofCode);
            const docTypeDocs = findDocsByType(docCode);

            setKybDocumentsDetails(docs);
            const defaultAddress = addressesList.find(item => item.id === kycRequirements?.kyb?.addressDto?.addressId);
            const companyData = {
                businessName: safeDecrypt(kycRequirements?.kyb?.fullName?.businessName),
                RegistrationNo: kycRequirements?.kyb?.kybpfc?.identificationNumber || '',
                registrationDate: kycRequirements?.kyb?.kybpfc?.registrationDate || '',
                chooseBusinessTrype: kycRequirements?.kyb?.kybpfc?.businessType || '',
                docType: kycRequirements?.kyb?.documents && docTypeDocs[0]?.type?.type || '',
                frontId: kycRequirements?.kyb?.documents && docTypeDocs[0]?.type?.blob || '',
                businessRegistrationProofType: kycRequirements?.kyb?.documents && businessProofDocs[0]?.type?.type || '',
                businessRegistrationProof: kycRequirements?.kyb?.documents && businessProofDocs[0]?.type?.blob || '',
                address: defaultAddress?.favoriteName || ''
            };
            setFormData(companyData);
            if (kycRequirements?.kyb?.ubo && Array.isArray(kycRequirements.kyb.ubo) && kycRequirements.kyb.ubo.length > 0) {
                const firstUbo = kycRequirements.kyb.ubo[0];
                
                const safeDecrypt = (value: any) => {
                    if (!value) return '';
                    try {
                        const decrypted = decryptAES(value);
                        return decrypted;
                    } catch {
                        return value;
                    }
                };
                
                const initialUbo = {
                    id: firstUbo.id || uuidv4(),
                    firstName: firstUbo.firstName || safeDecrypt(firstUbo.firstName) || '',
                    lastName: firstUbo.lastName || safeDecrypt(firstUbo.lastName) || '',
                    middleName: firstUbo.middleName || '',
                    uboPosition: firstUbo.uboPosition || 'Shareholder',
                    dob: firstUbo.dob || '',
                    shareHolderPercentage: firstUbo.shareHolderPercentage || '',
                    phoneCode: firstUbo.phoneCode || safeDecrypt(firstUbo.phoneCode) || '',
                    phoneNumber: firstUbo.phoneNumber || safeDecrypt(firstUbo.phoneNumber) || '',
                    note: firstUbo.note || '',
                    country: firstUbo.country || '',
                    email: firstUbo.email || safeDecrypt(firstUbo.email) || '',
                    docDetails: {
                        frontImage: firstUbo.docDetails?.documentFront || '',
                        backImage: firstUbo.docDetails?.documentBack || '',
                        type: firstUbo.docDetails?.documentType || '',
                        docNumber: safeDecrypt(firstUbo.docDetails?.documentNumber) || '',
                        docExpiryDate: firstUbo.docDetails?.docExpiryDate || ''
                    },
                    _isFromAPI: true // Track data source
                };
                setUboList([initialUbo]);
            }
        }
    }, [kycRequirements, decryptAES, Lookups, addressesList]);
    const handleBack = () => {
        navigation.navigate("PayOutList", {
            animation: "slide_from_left",
            initialTab: 1
        });
    };
    const Addresses = async () => {
        try {
            const response: any = await PaymentService.kycAddresses();
            if (response.ok) {
                const filterData = response?.data?.map((item: any) => ({
                    ...item,
                    name: item.favoriteName
                }))
                setAddressesList(filterData)
            }
            else {
                setError(isErrorDispaly(response))
            }
        }
        catch (error) {
            setError(isErrorDispaly(error))
        }
    }
    const handleCloseAddAddressModal = () => {
        setAddAddressModalVisible(false);
    };

    const handleAddressSaveSuccess = () => {
        setAddAddressModalVisible(false);
        Addresses();
    };
    const hasPartialUboData = (ubo: any) => {
        const allFields = ['firstName', 'lastName', 'dob', 'phoneNumber', 'email', 'country', 'docDetails'];
        return allFields.some(field => {
            if (field === 'docDetails') {
                return ubo.docDetails && (ubo.docDetails.frontImage || ubo.docDetails.backImage || ubo.docDetails.docNumber || ubo.docDetails.docExpiryDate);
            }
            const value = ubo[field];
            return value && (typeof value !== 'string' || value.trim() !== '');
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            // Filter UBOs that have some data (not completely empty)
            const ubosWithData = uboList.filter(ubo => hasPartialUboData(ubo));

            // Check if we have at least one UBO when UBO is required
            if (kycRequirements?.kyb?.requirement?.includes('UBO') && ubosWithData.length === 0) {
                setError(t('GLOBAL_CONSTANTS.UBO_DETAILS_MANDTORY'));
                if (scrollRef?.current) {
                    if (scrollRef.current.scrollTo) {
                        scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
                    } else if (scrollRef.current.scrollToPosition) {
                        scrollRef.current.scrollToPosition(0, 0, true);
                    }
                }
                return;
            }

            if (kycRequirements?.kyb?.requirement?.includes('UBO') && ubosWithData.length > 0) {
                const totalPercentage = ubosWithData.reduce((sum, ubo) => {
                    const percentage = Number?.parseFloat(ubo?.shareHolderPercentage);
                    return sum + (Number.isNaN(percentage) ? 0 : percentage);
                }, 0);

                if (totalPercentage !== 100) {
                    setError(`${t('GLOBAL_CONSTANTS.THE_TOTAL_SHAREHOLDER_PERCENTAGE_IS')} ${totalPercentage}%. ${t('GLOBAL_CONSTANTS.IT_MUST_BE_EXACTLY_100_PERCENT')}`);
                    if (scrollRef?.current) {
                        if (scrollRef.current.scrollTo) {
                            scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
                        } else if (scrollRef.current.scrollToPosition) {
                            scrollRef.current.scrollToPosition(0, 0, true);
                        }
                    }
                    return;
                }
            }
            // Validate only UBOs that have data
            const uboErrors: any = {};
            ubosWithData.forEach((ubo, index) => {
                const errors = validateUboFields(ubo, t, false);
                if (Object.keys(errors).length > 0) {
                    const originalIndex = uboList.findIndex(u => u.id === ubo.id);
                    uboErrors[`ubo_${originalIndex}`] = errors;
                }
            });

            if (Object.keys(uboErrors).length > 0) {
                setError(t('GLOBAL_CONSTANTS.UBO_DETAILS_INCOMPLETE'));
                if (scrollRef?.current) {
                    if (scrollRef.current.scrollTo) {
                        scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
                    } else if (scrollRef.current.scrollToPosition) {
                        scrollRef.current.scrollToPosition(0, 0, true);
                    }
                }
                return;
            }

            // Pass all UBOs with data to the API
            const kybObject = buildKybObject(values, kycRequirements, ubosWithData, addressesList, encryptAES, props?.route?.params?.VaultData?.productId, props?.route?.params?.isReapply);            // Save KYB details
            const response = await PaymentService.saveKybDetails(kybObject);
            if (response.ok) {
                navigation.navigate("PaymentPending")
            } else {

                setError(isErrorDispaly(response));
                if (scrollRef?.current) {
                    if (scrollRef.current.scrollTo) {
                        scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
                    } else if (scrollRef.current.scrollToPosition) {
                        scrollRef.current.scrollToPosition(0, 0, true);
                    }
                }
            }

        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const PayoutKycRequirements = async () => {
        try {
            const response: any = await PaymentService.kycRequirements(props?.route?.params?.VaultData?.productId)
            if (response.ok) {
                setKycRequirements(response.data)
            }
            else {
                setError(isErrorDispaly(response))
            }
        }
        catch (error) {
            setError(isErrorDispaly(error))
        }
    }

    const getLookups = async () => {
        try {
            const response: any = await PaymentService?.paymentsLookups();
            if (response.ok) {
                setLookups(response.data)
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    }

    const handleAddUbo = () => {
        setIsEditMode(false);
        setEditingUbo(null);
        setModalVisible(true);
        setError('')
    };

    const handleAddAddress = () => {
        setAddressModalVisible(true);
    };

    const handleCloseAddressModal = () => {
        setAddressModalVisible(false);
    };

    const handleAddressSubmit = async (addressObject: any) => {
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
                postalCode: addressObject?.postalCode ? encryptAES(addressObject?.postalCode) : "",
                phoneNumber: addressObject?.phoneNumber ? encryptAES(addressObject?.phoneNumber) : "",
                phoneCode: addressObject?.phoneCode ? encryptAES(addressObject?.phoneCode) : "",
                email: addressObject?.email ? encryptAES(addressObject?.email) : "",
                isDefault: addressObject?.isDefault || false,
                createdBy: userInfo?.userName,
                town: addressObject?.town,
                createdDate: new Date(),
            };

            const response = await PaymentService.brlAddressPost(obj);
            if (response.ok) {
                showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');
                setAddressModalVisible(false);
                await Addresses(); // Refresh the addresses list
            } else {
                // Pass the actual API response to CommonAddress for proper error handling
                throw response;
            }
        } catch (error) {
            // Pass the actual error to CommonAddress for proper error handling
            throw error;
        }
    };


    const handleCloseModal = () => {
        setModalVisible(false);
        setIsEditMode(false);
        setEditingUbo(null);
    };

    const handleUboSubmit = (uboObject: any) => {
        if (isEditMode && editingUbo) {
            const updatedUbo = {
                ...uboObject,
                id: editingUbo.id, // Keep existing ID
                _isFromAPI: false // Mark as user input
            };
            setUboList(prevList =>
                prevList.map(ubo =>
                    ubo.id === editingUbo.id ? updatedUbo : ubo
                )
            );
        } else {
            const newUbo = {
                ...uboObject,
                id: uuidv4(), // Generate proper GUID
                _isFromAPI: false // Mark as user input
            };
            setUboList(prevList => [...prevList, newUbo]);
        }
        setModalVisible(false);
        setIsEditMode(false);
        setEditingUbo(null);
    };
    const handleUboEdit = (id: string) => {
        setError('');
        const uboToEdit = uboList.find(ubo => ubo.id === id);
        if (uboToEdit) {
            setEditingUbo(uboToEdit);
            setIsEditMode(true);
            setModalVisible(true);
        }
    };

    const uploadFileToServer = async (uri: string, type: string, fileName: string, fileExtension: string, item: string, setFieldValue: (field: string, value: string) => void) => {
        setImagesLoader(prevState => ({ ...prevState, [item]: true }));
        setTimeout(() => {
            setFieldValue(item, uri);
            setImagesLoader(prevState => ({ ...prevState, [item]: false }));
        }, 1000);
    };

    const handleCancel = () => {
        navigation.navigate("PayOutList", {
            animation: "slide_from_left",
            initialTab: 1
        });
    };


    const handleContinuePress = async (values: any, setTouched: any) => {
        try {
            const validationSchema = createKybValidationSchema(kycRequirements, t);
            await validationSchema.validate(values, { abortEarly: false });
            handleSubmit(values);
        } catch (validationError: any) {
            const touchedFields = Object.keys(formData).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {} as any);
            setTouched(touchedFields);
            setError(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
            if (scrollRef?.current) {
                if (scrollRef.current.scrollTo) {
                    scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
                } else if (scrollRef.current.scrollToPosition) {
                    scrollRef.current.scrollToPosition(0, 0, true);
                }
            }
        }
    };
    if (!loading && kycRequirements?.isCountryNotSupported) {
        return <PaymentNotAvailable onBackPress={handleBack} />;
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader
                    title={"GLOBAL_CONSTANTS.PAYOUT_REQUIREMENTS"}
                    onBackPress={handleBack}
                />
                {loading && <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </SafeAreaViewComponent>}
                {!loading && <Formik
                    initialValues={formData}
                    validationSchema={createKybValidationSchema(kycRequirements, t)}
                    onSubmit={handleSubmit}
                    enableReinitialize
                    validateOnChange={true}
                    validateOnBlur={true}
                >
                    {({ touched, errors, handleBlur, values, setFieldValue, setTouched }) => {
                        return (
                            <KeyboardAwareScrollView
                                ref={scrollRef}
                                contentContainerStyle={{ flexGrow: 1 }}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                                enableOnAndroid={true}
                            >
                                <ViewComponent>
                                    {error && <ErrorComponent message={error} onClose={() => setError(undefined)} />}
                                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                                    <TextMultiLanguage style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={"GLOBAL_CONSTANTS.COMPANY"} />
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.BUSSINESS_NAME"} />
                                        <ParagraphComponent text={safeDecrypt(kycRequirements?.kyb?.fullName?.businessName)} style={[commonStyles.listprimarytext]} />
                                    </ViewComponent>
                                    {Lookups && (
                                        <CompanyFields
                                            touched={touched}
                                            errors={errors}
                                            handleBlur={handleBlur}
                                            values={values}
                                            setFieldValue={setFieldValue}
                                            lookups={Lookups}
                                            kycRequirements={kycRequirements}
                                            formData={formData}
                                        />
                                    )}
                                    <ViewComponent style={[commonStyles.sectionGap]} />

                                    {/* UBO Section - Show only if UBO is required */}
                                    {kycRequirements?.kyb?.requirement?.includes('UBO') && (
                                        <>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10,]} >
                                                    <TextMultiLanguage style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.UBO_DETAILS_TITLE"} />
                                                    <InfoTooltip
                                                        tooltipText="GLOBAL_CONSTANTS.TOOLTIP_UBO_MANDATORY"
                                                        linkText=""
                                                        linkUrl=""
                                                        verticalGap={s(15)}
                                                        arrowXPosition={s(0)}

                                                    />
                                                </ViewComponent>
                                                <AddIcon onPress={handleAddUbo} style={[commonStyles.actioniconbg]} />
                                            </ViewComponent>

                                            {/* UBO Details Accordion */}
                                            <ViewComponent style={[]}>
                                                <FlatListComponent
                                                    scrollEnabled={false}
                                                    nestedScrollEnabled={true}
                                                    data={uboList}
                                                    renderItem={({ item, index }: any) => (
                                                        <ViewComponent style={[commonStyles.mb16]}>
                                                            <ViewComponent style={[]}>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.mb4, commonStyles.flexWrap, commonStyles.gap8]}>
                                                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.NAME"} style={[commonStyles.listsecondarytext]} />
                                                                    <ViewComponent style={[]}>
                                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap6]}>
                                                                            <ParagraphComponent text={item?.firstName || ""} style={[commonStyles.listprimarytext, commonStyles.textRight]} />
                                                                            <TouchableOpacity activeOpacity={0.8} onPress={() => handleUboEdit(item?.id)}>
                                                                                <CustomeditLink width={s(24)} height={s(20)} />
                                                                            </TouchableOpacity>
                                                                        </ViewComponent>
                                                                    </ViewComponent>
                                                                </ViewComponent>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.mb4, commonStyles.flexWrap, commonStyles.gap8]} >
                                                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"} style={[commonStyles.listsecondarytext]} />
                                                                    <FormattedDateText value={item?.dob || ""} dateFormat={dateFormates.date} style={[commonStyles.listsecondarytext, commonStyles.textRight]} />
                                                                </ViewComponent>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.mb4, commonStyles.flexWrap, commonStyles.gap8]} >
                                                                    <TextMultiLanguage text={'GLOBAL_CONSTANTS.PHONE'} style={[commonStyles.listsecondarytext]} />
                                                                    <ParagraphComponent text={`${item?._isFromAPI ? decryptAES(item?.phoneCode) : item?.phoneCode || ""} ${item?._isFromAPI ? decryptAES(item?.phoneNumber) : item?.phoneNumber || ""}`} style={[commonStyles.listprimarytext]} />
                                                                </ViewComponent>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.mb4, commonStyles.flexWrap, commonStyles.gap8]} >
                                                                    <TextMultiLanguage text={'GLOBAL_CONSTANTS.SHARE_HOLDER_PERCENTAGE'} style={[commonStyles.listsecondarytext]} />
                                                                    <ParagraphComponent text={`${item?.shareHolderPercentage || 0}%`} style={[commonStyles.listprimarytext]} />
                                                                </ViewComponent>
                                                            </ViewComponent>
                                                        </ViewComponent>
                                                    )}
                                                    keyExtractor={(item: any) => item?.id?.toString()}
                                                    ListEmptyComponent={() => <NoDataComponent />}
                                                />
                                            </ViewComponent>
                                        </>
                                    )}

                                    {/* Documents Section - Show only if Documents is required */}
                                    {kycRequirements?.kyb?.requirement?.includes('Documents') && Lookups && (
                                        <DocumentUploadFields
                                            touched={touched}
                                            errors={errors}
                                            handleBlur={handleBlur}
                                            values={values}
                                            setFieldValue={setFieldValue}
                                            documentTypesLookUp={Lookups?.Documents || []}
                                            businessRegistrationProofTypes={Lookups?.BusinessRegistrationProof || []}
                                            setErrormsg={setErrorWithScroll}
                                            imagesLoader={imagesLoader}
                                            setImagesLoader={setImagesLoader}
                                            fileNames={fileNames}
                                            setFileNames={setFileNames}
                                            uploadFileToServer={uploadFileToServer}
                                            commonStyles={commonStyles}
                                            kybDocumentsDetails={kybDocumentsDetails}
                                            NEW_COLOR={NEW_COLOR}
                                            t={(key: string) => key}
                                            ref={null}
                                        />
                                    )}

                                    {/* Address Section - Show only if Address is required */}
                                    {kycRequirements?.kyb?.requirement?.includes('Address') && (
                                        <>
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10,]} >
                                                    <TextMultiLanguage style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.ADDRESS_INFO"} />
                                                    <InfoTooltip
                                                        tooltipText="GLOBAL_CONSTANTS.PLEASE_SELECT_AT_LEAST_ONE_ADDRESS"
                                                        linkText=""
                                                        linkUrl=""
                                                        verticalGap={s(5)}
                                                        arrowXPosition={s(10)}
                                                    />
                                                </ViewComponent>
                                                <AddIcon onPress={handleAddAddress} style={[commonStyles.actioniconbg]}/>
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>
                                                <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.ADDRESS_INFO")} children={<ParagraphComponent style={[commonStyles.textRed]} text={' *'} />} />
                                                {/* <ViewComponent style={[commonStyles.actioniconbg, { marginTop: s(-8) }]}  >
                                                    <MaterialIcons name="add" size={s(22)} color={NEW_COLOR.DARK_TEXT_WHITE} onPress={handleAddAddress} />
                                                </ViewComponent> */}
                                             
                                            </ViewComponent>
                                            <Field
                                                activeOpacity={0.9}
                                                touched={touched?.address}
                                                name={'address'}
                                                error={errors?.address}
                                                handleBlur={handleBlur}
                                                customContainerStyle={{ height: 80 }}
                                                data={addressesList || []}
                                                placeholder={"GLOBAL_CONSTANTS.SELECT_ADDRESS"}
                                                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                                                component={CustomPicker}
                                                modalTitle={"GLOBAL_CONSTANTS.SELECT_ADDRESS"}
                                                onChange={(value: string) => {
                                                    setFieldValue('address', value);
                                                }}
                                                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                            />
                                        </>
                                    )}
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CONTINUE"}
                                        onPress={() => handleContinuePress(values, setTouched)}
                                    />
                                    <ViewComponent style={[commonStyles.buttongap]} />
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CANCEL"}
                                        solidBackground={true}
                                        onPress={handleCancel}
                                    />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.sectionGap]} />
                            </KeyboardAwareScrollView>
                        );
                    }}
                </Formik>}
            </Container>
            <AddCardsAddress isVisible={isAddAddressModalVisible} onClose={handleCloseAddAddressModal} onSaveSuccess={handleAddressSaveSuccess} />
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                <PayoutUboForm
                    onClose={handleCloseModal}
                    onSubmit={handleUboSubmit}
                    editingUbo={editingUbo}
                    isEditMode={isEditMode}
                    selectedProgramId={props?.route?.params?.VaultData?.productId}
                    addressesList={addressesList}
                    hideAddressField={false}
                    kycRequirements={kycRequirements}
                    onAddressAdded={() => {
                        // Add a small delay to ensure database is updated
                        setTimeout(() => {
                            Addresses();
                        }, 500);
                    }}
                />
            </Modal>

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

export default KycKybRequirementsForm;