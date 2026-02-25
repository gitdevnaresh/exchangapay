import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, BackHandler, Text } from 'react-native';
import { CommonActions, useIsFocused, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { FORM_FIELD } from '../../BusinessKyb/components/constants';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import ViewComponent from '../../../../../../components/view/view';
import { IdentityDocument, KycDetails, SectionProps } from '../types/interface';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import FlatListComponent from '../../../../../../components/flatList/flatList';
import FilePreview from '../../../../../../components/fileUpload/filePreview';
import { dateFormates, formatDates, formatDateTimeForAPI, isErrorDispaly } from '../../../../../../utils/helpers';
import InfoTooltip from '../../../../../../components/tooltip/InfoTooltip';
import CommonTouchableOpacity from '../../../../../../components/touchableComponents/touchableOpacity';
import { AddIcon } from '../../../../../../assets/svg';
import TextMultiLanguage from '../../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { useDispatch, useSelector } from 'react-redux';
import useEncryptDecrypt from '../../../../../../hooks/encDecHook';
import useMemberLogin from '../../../../../../hooks/userInfoHook';
import { getTabsConfigation } from '../../../../../../../configuration';
import ProfileService from '../../../../../../apiServices/profile';
import ButtonComponent from '../../../../../../components/buttons/button';
import CommonSuccess from '../../../../../commonScreens/successPage/commonSucces';
import CustomRBSheet from '../../../../../../components/models/commonBottomSheet';
import DatePickerComponent from '../../../../../../components/datePickers/formik/datePicker';
import { Formik } from 'formik';
import { DOBSchema } from '../schemas/schema';
import { s } from '../../../../../../components/theme/scale';
import CustomeditLink from '../../../../../../components/svgIcons/mainmenuicons/linkedit';
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import Container from '../../../../../../components/container/container';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import DashboardLoader from '../../../../../../components/loader';
import BankServices from '../../../../../../apiServices/bank';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import { useLngTranslation } from '../../../../../../hooks/languagesHook/useLngTranslation';

// Required Label Component
const RequiredLabel = ({ text, style }: { text: string, style?: any, multiLanguageAllows?: boolean }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return (
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
            <TextMultiLanguage style={style} text={text} />
            <Text style={[commonStyles.textError]}>*</Text>
        </ViewComponent>
    );
};

// --- REFACTORED AND FIXED SECTION ---
const PersonalInfoSection = ({ kycDetails, decryptAES, formatDate }: SectionProps) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    // Define all potential rows in an array for cleaner logic
    const infoRows = [
        // Always show required fields with '--' as fallback
        {
            key: 'firstName',
            label: 'GLOBAL_CONSTANTS.FIRST_NAME',
            value: kycDetails?.kyc?.fullName ? decryptAES?.(kycDetails.kyc.fullName.firstName) || '--' : '--',
            isShown: true,
        },
        {
            key: 'lastName',
            label: 'GLOBAL_CONSTANTS.LAST_NAME',
            value: kycDetails?.kyc?.fullName ? decryptAES?.(kycDetails.kyc.fullName.lastName) || '--' : '--',
            isShown: true,
        },
        {
            key: 'gender',
            label: 'GLOBAL_CONSTANTS.GENDER',
            value: kycDetails?.kyc?.basic?.gender || '--',
            isShown: true,
        },

    ];

    // Show all rows since they're all required
    const visibleRows = infoRows;

    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap, commonStyles.alignCenter]}>
                <ParagraphComponent style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.PERSONAL_INFORMATION"} multiLanguageAllows={true} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]}>
                <FlatListComponent
                    data={visibleRows}
                    renderItem={({ item: row, index }) => (
                        <ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={row.label} multiLanguageAllows={true} />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={String(row.value)} />
                            </ViewComponent>
                            {index < visibleRows.length - 1 && <ViewComponent style={[commonStyles.listitemGap]} />}
                        </ViewComponent>
                    )}
                    keyExtractor={(item) => item.key}
                    scrollEnabled={false}
                />
            </ViewComponent>
        </ViewComponent>
    );
};


const BasicInfoSection = ({ kycDetails, commonStyles, decryptAES }: SectionProps) => (
    <ViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap, commonStyles.alignCenter]}>
            <ParagraphComponent style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.BASIC_INFORMATION"} multiLanguageAllows={true} />
        </ViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.EMAIL"} multiLanguageAllows={true} />
                <ParagraphComponent style={[commonStyles.listprimarytext]} text={kycDetails?.kyc?.basic ? decryptAES?.(kycDetails.kyc.basic.email) || '--' : "--"} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.listitemGap]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} multiLanguageAllows={true} />
                <ParagraphComponent style={[commonStyles.listprimarytext]}
                    text={kycDetails?.kyc?.basic ? (() => {
                        const phoneCode = decryptAES?.(kycDetails.kyc.basic.phoneCode) || '';
                        const phoneNo = decryptAES?.(kycDetails.kyc.basic.phoneNo) || '';
                        const formattedCode = phoneCode.startsWith('+') ? phoneCode : `+${phoneCode}`;
                        return `${formattedCode} ${phoneNo}`;
                    })() : "--"} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.listitemGap]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.COUNTRY"} multiLanguageAllows={true} />
                <ParagraphComponent style={[commonStyles.listprimarytext]} text={kycDetails?.kyc?.basic?.country || "--"} />
            </ViewComponent>
        </ViewComponent>
    </ViewComponent>
);

const DocumentPreview = ({ imageUri, label, commonStyles, isLast = false }: DocumentPreviewProps) => {
    if (!imageUri) return null;
    return (
        <ViewComponent >
            <FilePreview label={label} uploadedImageUri={imageUri} />
        </ViewComponent>
    );
};

const getDocumentImage = (identityDocuments: IdentityDocument[] | undefined, kycDetails: KycDetails | undefined, field: string, kycField: string): string | null => {
    const hasIdentityDoc = identityDocuments && identityDocuments.length > 0;

    if (hasIdentityDoc) {
        return identityDocuments[0]?.[field] || null;
    }

    // For API fallback, check correct section based on field type
    if (kycField === 'frontDoc' || kycField === 'backDoc') {
        // PFC documents
        return kycDetails?.kyc?.pfc?.[kycField] || null;
    } else {
        // PPHS documents
        return kycDetails?.kyc?.pphs?.[kycField] || null;
    }
};

const DocumentSection = ({ identityDocuments, kycDetails, commonStyles, handleEditIdentificationDocuments }: SectionProps) => {
    // PFC: Front ID Photo only
    const documents = [
        { field: 'frontImage', kycField: 'frontDoc', label: 'GLOBAL_CONSTANTS.FRONT_ID_PHOTO' }
    ];

    const hasAnyDocument = documents.some(doc =>
        getDocumentImage(identityDocuments, kycDetails, doc.field, doc.kycField)
    );

    return (
        <ViewComponent>
            {/* Always show Document Number and Expiry Date fields */}
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"} multiLanguageAllows={true} />
                <ParagraphComponent style={[commonStyles.listprimarytext]} text={identityDocuments?.[0]?.documentNumber || kycDetails?.kyc?.pfc?.docId || '--'} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.listitemGap]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE"} multiLanguageAllows={true} />
                <ParagraphComponent style={[commonStyles.listprimarytext]} text={(() => {
                    const reduxDate = identityDocuments?.[0]?.documentExpiryDate;
                    const apiDate = kycDetails?.kyc?.pfc?.docExpiryDate;
                    if (reduxDate) {
                        return formatDates(reduxDate, dateFormates.date) || '--';
                    }
                    if (apiDate) {
                        return formatDates(apiDate, dateFormates.date) || '--';
                    }
                    return '--';
                })()} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.listitemGap]} />

            {/* Then show images or labels */}
            {documents.map((doc, index) => {
                const imageUri = getDocumentImage(identityDocuments, kycDetails, doc.field, doc.kycField);
                return (
                    <React.Fragment key={doc.field}>
                        {imageUri ? (
                            <DocumentPreview
                                imageUri={imageUri}
                                label={doc.label}
                                commonStyles={commonStyles}
                                isLast={false}
                            />
                        ) : (
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={doc.label} multiLanguageAllows={true} />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text="--" />
                            </ViewComponent>
                        )}
                        {index < documents.length - 1 && <ViewComponent style={[commonStyles.listitemGap]} />}
                    </React.Fragment>
                );
            })}
        </ViewComponent>
    );
};

const PPHSSection = ({ identityDocuments, kycDetails, commonStyles, handleEditIdentificationDocuments }: SectionProps) => {
    // PPHS: Hand Holding ID, Face Photo, Signature
    const documents = [
        { field: 'handHoldingImage', kycField: 'handHoldingIDPhoto', label: 'GLOBAL_CONSTANTS.HAND_HOLDING_ID' },
        { field: 'selfieImage', kycField: 'faceImage', label: 'GLOBAL_CONSTANTS.FACE_PHOTO' },
        { field: 'singatureImage', kycField: 'signImage', label: 'GLOBAL_CONSTANTS.SIGNATURE' }
    ];

    const hasAnyDocument = documents.some(doc =>
        getDocumentImage(identityDocuments, kycDetails, doc.field, doc.kycField)
    );

    return (
        <ViewComponent>
            {documents.map((doc, index) => {
                const imageUri = getDocumentImage(identityDocuments, kycDetails, doc.field, doc.kycField);
                return (
                    <React.Fragment key={doc.field}>
                        {imageUri ? (
                            <DocumentPreview
                                imageUri={imageUri}
                                label={doc.label}
                                commonStyles={commonStyles}
                                isLast={false}
                            />
                        ) : (
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={doc.label} multiLanguageAllows={true} />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text="--" />
                            </ViewComponent>
                        )}
                        {index < documents.length - 1 && <ViewComponent style={[commonStyles.listitemGap]} />}
                    </React.Fragment>
                );
            })}
        </ViewComponent>
    );
};

const NationalIdSection = ({ identityDocuments, kycDetails, commonStyles, handleEditIdentificationDocuments }: SectionProps) => {
    const NEW_COLOR = useThemeColors();
    const frontImage = identityDocuments && identityDocuments.length > 1 ? identityDocuments[1]?.frontImage : kycDetails?.kyc?.nationalId?.frontDoc;
    const backImage = identityDocuments && identityDocuments.length > 1 ? identityDocuments[1]?.backDocImage : kycDetails?.kyc?.nationalId?.backDoc;
    const hasAnyNationalId = frontImage || backImage;

    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap, commonStyles.alignCenter]}>
                <RequiredLabel text={"GLOBAL_CONSTANTS.NATIONAL_ID"} style={[commonStyles.sectionTitle]} />
                <CommonTouchableOpacity activeOpacity={0.8} onPress={handleEditIdentificationDocuments}>
                    <ViewComponent style={[commonStyles.mt6]}>
                        {hasAnyNationalId ? (
                            <ViewComponent style={[commonStyles.actioniconbg]}>
                                <MaterialIcons name="edit" size={s?.(22) || 22} color={NEW_COLOR.DARK_TEXT_WHITE} />
                            </ViewComponent>
                        ) : (
                            <ViewComponent style={[commonStyles.actioniconbg]}>
                                <MaterialIcons name="add" size={s?.(22) || 22} color={NEW_COLOR.DARK_TEXT_WHITE} />
                            </ViewComponent>
                        )}
                    </ViewComponent>
                </CommonTouchableOpacity>
            </ViewComponent>
            <ViewComponent>
                {/* Always show Document Number and Expiry Date fields */}
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"} multiLanguageAllows={true} />
                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={(identityDocuments && identityDocuments.length > 1 && identityDocuments[1]?.documentNumber) || kycDetails?.kyc?.nationalId?.docId || '--'} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.listitemGap]} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE"} multiLanguageAllows={true} />
                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={(() => {
                        const reduxDate = identityDocuments && identityDocuments.length > 1 && identityDocuments[1]?.documentExpiryDate;
                        const apiDate = kycDetails?.kyc?.nationalId?.docExpiryDate;
                        if (reduxDate) {
                            return formatDates(reduxDate, dateFormates.date) || '--';
                        }
                        if (apiDate) {
                            return formatDates(apiDate, dateFormates.date) || '--';
                        }
                        return '--';
                    })()} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]} />

                {/* Then show images or labels */}
                {frontImage ? (
                    <ViewComponent style={[commonStyles.formItemSpace]}>
                        <FilePreview label={"GLOBAL_CONSTANTS.FRONT_ID_PHOTO"} uploadedImageUri={frontImage || null} />
                    </ViewComponent>
                ) : (
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FRONT_ID_PHOTO"} multiLanguageAllows={true} />
                        <ParagraphComponent style={[commonStyles.listprimarytext]} text="--" />
                    </ViewComponent>
                )}
                <ViewComponent style={[commonStyles.listitemGap]} />
                {backImage ? (
                    <ViewComponent style={[commonStyles.formItemSpace]}>
                        <FilePreview label={"GLOBAL_CONSTANTS.BACK_ID_PHOTO"} uploadedImageUri={backImage || null} />
                    </ViewComponent>
                ) : (
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.BACK_ID_PHOTO"} multiLanguageAllows={true} />
                        <ParagraphComponent style={[commonStyles.listprimarytext]} text="--" />
                    </ViewComponent>
                )}
            </ViewComponent>
        </ViewComponent>
    );
};

const AdditionalInfoSection = ({ personalDob, kycDetails, commonStyles, handleEditDob, formatDate, NEW_COLOR, s }: SectionProps & { personalDob: any, handleEditDob: () => void, NEW_COLOR: any }) => {
    const displayDob = personalDob || kycDetails?.kyc?.basic?.dob;

    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap, commonStyles.alignCenter]}>
                <RequiredLabel text={"GLOBAL_CONSTANTS.ADDITIONAL_INFO"} style={[commonStyles.sectionTitle]} />
                <CommonTouchableOpacity activeOpacity={0.8} onPress={handleEditDob}>
                    <ViewComponent style={[commonStyles.mt6]}>
                        {displayDob ? (
                            <ViewComponent >
                                <CustomeditLink />
                            </ViewComponent>
                        ) : (
                            <ViewComponent style={[commonStyles.actioniconbg]}>
                                <AddIcon />
                            </ViewComponent>
                        )}
                    </ViewComponent>
                </CommonTouchableOpacity>
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"} multiLanguageAllows={true} />
                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={displayDob ? (formatDate?.(displayDob) || '--') : '--'} />
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>
    );
};

const AddressSection = ({ selectedAddresses, commonStyles, handleEditPersionalInfo, s, setErrormsg, t, showTooltip = true }: SectionProps & { showTooltip?: boolean, t?: (key: string) => string }) => {
    const NEW_COLOR = useThemeColors();
    const [defaultAddresses, setDefaultAddresses] = useState<any[]>([]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!selectedAddresses || selectedAddresses.length === 0) {
            fetchDefaultAddresses();
        }
    }, [selectedAddresses]);

    const fetchDefaultAddresses = async () => {
        try {
            const response = await BankServices.getAddressList();
            if (response?.ok && response.data && Array.isArray(response.data) && response.data.length > 0) {
                const firstAddress = response.data[0];
                setDefaultAddresses([firstAddress]);
                dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: [firstAddress] });
            }
        } catch (error) {
            setErrormsg?.(isErrorDispaly(error));
        }
    };

    const displayAddresses = selectedAddresses && selectedAddresses.length > 0 ? selectedAddresses : defaultAddresses;

    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                    <RequiredLabel text={"GLOBAL_CONSTANTS.ADDRESS_INFO"} style={[commonStyles.sectionTitle]} />
                    {showTooltip && (
                        <InfoTooltip
                            tooltipText="GLOBAL_CONSTANTS.TOOLTIP_ADDRESS_MANDATORY"
                            linkText=""
                            linkUrl=""
                            verticalGap={s?.(34) || 34}
                            arrowXPosition={s?.(0) || 0}
                            onError={(msg) => setErrormsg?.(msg)}
                        />
                    )}
                </ViewComponent>
                <CommonTouchableOpacity activeOpacity={0.8} onPress={handleEditPersionalInfo}>
                    <ViewComponent style={[commonStyles.mt6]}>
                        <ViewComponent style={[commonStyles.actioniconbg]}>
                            <AddIcon />
                        </ViewComponent>
                    </ViewComponent>
                </CommonTouchableOpacity>
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]}>
                {displayAddresses && displayAddresses.length > 0 ? (
                    <FlatListComponent
                        data={displayAddresses}
                        renderItem={({ item: address, index }) => {
                            const addressKey = displayAddresses.length === 1 ? "GLOBAL_CONSTANTS.ADDRESS" : `${t?.("GLOBAL_CONSTANTS.ADDRESS") || "Address"} ${index + 1}`;
                            return (
                                <ViewComponent>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                                        {displayAddresses.length === 1 ? (
                                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={addressKey} />
                                        ) : (
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={addressKey} />
                                        )}
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={address.favoriteName} />
                                    </ViewComponent>
                                    {index !== displayAddresses.length - 1 && <ViewComponent style={[commonStyles.listitemGap]} />}
                                </ViewComponent>
                            );
                        }}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                ) : (
                    <ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ADDRESS"} />
                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={"--"} />
                        </ViewComponent>
                    </ViewComponent>
                )}
            </ViewComponent>
        </ViewComponent>
    );
};

const BankKycProfilePreview = React.memo((props: any) => {
    const isFocused = useIsFocused();
    const scrollRef = useRef<ScrollView>(null);
    const ipSheetRef = useRef<any>(null);
    const dobSheetRef = useRef<any>(null);
    const successSheetRef = useRef<any>(null);

    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    // Use separate state for each data source
    const [kycDetails, setKycDetails] = useState<KycDetails>({});
    const [dobError, setDobError] = useState<string>("");

    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const navigation = useNavigation<any>();
    const { decryptAES } = useEncryptDecrypt();
    const { getMemDetails } = useMemberLogin();
    const dispatch = useDispatch();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();
    const { selectedBank, selectedAddresses, identityDocuments, personalDob, hasAccountCreationFee /*, ipAddress: storedIpAddress*/ } = useSelector((state: any) => state.userReducer);
    const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
    const BanksPermission = menuItems?.find((item: any) => item?.featureName.toLowerCase() === 'banks')?.isEnabled;
    const CommonConfig = getTabsConfigation('COMMON');
    useEffect(() => {
        if (isFocused) {
            setErrormsg("");
            fetchKycData();
        }
    }, [isFocused]);
    const handleRefresh = () => {
        getMemDetails(true);
        setErrormsg("");

        dispatch({ type: 'SET_IDENTITY_DOCUMENTS', payload: [] });
        dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: [] });
        dispatch({ type: 'SET_PERSONAL_DOB', payload: null });

        fetchKycData();
    };
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { props?.handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);

    const fetchKycData = async () => {
        setLoadingData(true);
        try {
            const detailsRes = await ProfileService.kycInfoDetails(selectedBank?.productId);

            if (detailsRes?.ok) {
                setKycDetails(detailsRes.data || {});

                const apiDob = detailsRes.data?.kyc?.basic?.dob;

                if (apiDob && !personalDob) {
                    // Convert API date string to Date object for consistent handling
                    try {
                        const dobAsDate = new Date(apiDob);
                        if (!isNaN(dobAsDate.getTime())) {
                            dispatch({ type: 'SET_PERSONAL_DOB', payload: dobAsDate });
                        } else {
                            // If Date conversion fails, parse manually
                            const dateMatch = apiDob.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                            if (dateMatch) {
                                const [, month, day, year] = dateMatch;
                                const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                dispatch({ type: 'SET_PERSONAL_DOB', payload: parsedDate });
                            } else {
                                dispatch({ type: 'SET_PERSONAL_DOB', payload: apiDob });
                            }
                        }
                    } catch (error) {
                        dispatch({ type: 'SET_PERSONAL_DOB', payload: apiDob });
                    }
                }

                // Store API documents to Redux if Redux is empty
                if ((!identityDocuments || identityDocuments.length === 0) && detailsRes.data?.kyc) {
                    const apiDocuments = [];

                    // Store passport document if available
                    if (detailsRes.data.kyc.pfc || detailsRes.data.kyc.pphs) {
                        const passportDoc = {
                            documentType: "Passport",
                            frontImage: detailsRes.data.kyc.pfc?.frontDoc || "",
                            backDocImage: detailsRes.data.kyc.pfc?.backDoc || "",
                            handHoldingImage: detailsRes.data.kyc.pphs?.handHoldingIDPhoto || "",
                            selfieImage: detailsRes.data.kyc.pphs?.faceImage || "",
                            singatureImage: detailsRes.data.kyc.pphs?.signImage || "",
                            documentNumber: detailsRes.data.kyc.pfc?.docId || "",
                            documentExpiryDate: detailsRes.data.kyc.pfc?.docExpiryDate || ""
                        };
                        apiDocuments.push(passportDoc);
                    }

                    // Store national ID document if available
                    if (detailsRes.data.kyc.nationalId) {
                        const nationalIdDoc = {
                            documentType: "National Id",
                            frontImage: detailsRes.data.kyc.nationalId.frontDoc || "",
                            backDocImage: detailsRes.data.kyc.nationalId.backDoc || "",
                            handHoldingImage: "",
                            selfieImage: "",
                            singatureImage: "",
                            documentNumber: detailsRes.data.kyc.nationalId.docId || "",
                            documentExpiryDate: detailsRes.data.kyc.nationalId.docExpiryDate || ""
                        };
                        apiDocuments.push(nationalIdDoc);
                    }

                    if (apiDocuments.length > 0) {
                        dispatch({ type: 'SET_IDENTITY_DOCUMENTS', payload: apiDocuments });
                    }
                }
            } else {
                setErrormsg(isErrorDispaly(detailsRes));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setLoadingData(false);
        }
    };

    const validatePFCDocuments = (hasIdentityDoc: boolean) => {
        const errors = [];
        if (!(hasIdentityDoc ? identityDocuments[0]?.frontImage : kycDetails.kyc?.pfc?.frontDoc))
            errors.push(t("GLOBAL_CONSTANTS.PASSPORT_SECTION_FRONT_ID_REQUIRED"));
        if (!((hasIdentityDoc && identityDocuments[0]?.documentNumber) || kycDetails.kyc?.pfc?.docId))
            errors.push(t("GLOBAL_CONSTANTS.PASSPORT_DOCUMENT_NUMBER_REQUIRED"));
        if (!((hasIdentityDoc && identityDocuments[0]?.documentExpiryDate) || kycDetails.kyc?.pfc?.docExpiryDate))
            errors.push(t("GLOBAL_CONSTANTS.PASSPORT_DOCUMENT_EXPIRY_DATE_REQUIRED"));
        return errors;
    };

    const validatePPHSDocuments = (hasIdentityDoc: boolean) => {
        const errors = [];
        if (!(hasIdentityDoc ? identityDocuments[0]?.handHoldingImage : kycDetails.kyc?.pphs?.handHoldingIDPhoto))
            errors.push(t("GLOBAL_CONSTANTS.PASSPORT_SECTION_HAND_HOLDING_REQUIRED"));
        if (!(hasIdentityDoc ? identityDocuments[0]?.selfieImage : kycDetails.kyc?.pphs?.faceImage))
            errors.push(t("GLOBAL_CONSTANTS.PASSPORT_SECTION_FACE_PHOTO_REQUIRED"));
        if (!(hasIdentityDoc ? identityDocuments[0]?.singatureImage : kycDetails.kyc?.pphs?.signImage))
            errors.push(t("GLOBAL_CONSTANTS.PASSPORT_SECTION_SIGNATURE_REQUIRED"));
        return errors;
    };

    const validateDocuments = () => {
        const errors = [];
        const hasIdentityDoc = identityDocuments && identityDocuments.length > 0;
        const requirements = getRequirements();

        if (requirements.showPFC) {
            errors.push(...validatePFCDocuments(hasIdentityDoc));
        }

        if (requirements.showPPHS) {
            errors.push(...validatePPHSDocuments(hasIdentityDoc));
        }

        return errors;
    };

    const validateNationalId = () => {
        const errors = [];
        const hasNationalId = identityDocuments && identityDocuments.length > 1;
        const requirements = getRequirements();

        // Only validate National ID if NI requirement is present
        if (requirements.showNationalId) {
            if (!(hasNationalId ? identityDocuments[1]?.frontImage : kycDetails.kyc?.nationalId?.frontDoc))
                errors.push(t("GLOBAL_CONSTANTS.NATIONAL_ID_SECTION_FRONT_REQUIRED"));
            if (!(hasNationalId ? identityDocuments[1]?.backDocImage : kycDetails.kyc?.nationalId?.backDoc))
                errors.push(t("GLOBAL_CONSTANTS.NATIONAL_ID_SECTION_BACK_REQUIRED"));
            if (!((hasNationalId && identityDocuments[1]?.documentNumber) || kycDetails.kyc?.nationalId?.docId))
                errors.push(t("GLOBAL_CONSTANTS.NATIONAL_ID_DOCUMENT_NUMBER_REQUIRED"));
        }

        return errors;
    };

    const validateAddresses = () => {
        const requirements = getRequirements();

        // Only validate addresses if address requirement is present
        if (!requirements.showAddress) {
            return [];
        }

        // Check both Redux addresses and if API call was successful
        const hasReduxAddresses = selectedAddresses && selectedAddresses.length > 0;

        if (!hasReduxAddresses) {
            return [t("GLOBAL_CONSTANTS.ADDRESS_FIELD_REQUIRED")];
        }
        return [];
    };

    const validateDob = () => {
        const displayDob = personalDob || kycDetails?.kyc?.basic?.dob;
        if (!displayDob) {
            return [t("GLOBAL_CONSTANTS.ADDITIONAL_INFO_DATE_OF_BIRTH_REQUIRED")];
        }
        return [];
    };

    const formatExpiryDate = (date: any): string => {
        if (!date) return '';

        if (date instanceof Date) {
            return formatDateTimeForAPI(date);
        }

        // Handle API date format like "9/14/2026 12:00:00 AM"
        if (typeof date === 'string') {
            // Try manual parsing for MM/DD/YYYY format first
            const dateMatch = date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (dateMatch) {
                const [, month, day, year] = dateMatch;
                const manualDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                return formatDateTimeForAPI(manualDate);
            }

            // Fallback to direct parsing
            try {
                const parsedDate = new Date(date);
                if (!isNaN(parsedDate.getTime())) {
                    return formatDateTimeForAPI(parsedDate);
                }
            } catch (error) {
                // Date parsing failed
            }
        }

        return '';
    };

    // const validateIPAddress = () => {
    //     if (!ipAddress || ipAddress.trim() === '') {
    //         return [t("GLOBAL_CONSTANTS.IP_ADDRESS_REQUIRED")];
    //     }
    //     return [];
    // };

    const handleSubmit = async () => {
        setSubmitLoading(true);

        // Store documents from API to Redux if Redux is empty
        if ((!identityDocuments || identityDocuments.length === 0) && kycDetails?.kyc) {
            const apiDocuments = [];

            // Store passport document if available
            if (kycDetails.kyc.pfc || kycDetails.kyc.pphs) {
                const passportDoc = {
                    documentType: "Passport",
                    frontImage: kycDetails.kyc.pfc?.frontDoc || "",
                    backDocImage: kycDetails.kyc.pfc?.backDoc || "",
                    handHoldingImage: kycDetails.kyc.pphs?.handHoldingIDPhoto || "",
                    selfieImage: kycDetails.kyc.pphs?.faceImage || "",
                    singatureImage: kycDetails.kyc.pphs?.signImage || "",
                    documentNumber: kycDetails.kyc.pfc?.docId || "",
                    documentExpiryDate: kycDetails.kyc.pfc?.docExpiryDate || ""
                };
                apiDocuments.push(passportDoc);
            }

            // Store national ID document if available
            if (kycDetails.kyc.nationalId) {
                const nationalIdDoc = {
                    documentType: "National Id",
                    frontImage: kycDetails.kyc.nationalId.frontDoc || "",
                    backDocImage: kycDetails.kyc.nationalId.backDoc || "",
                    handHoldingImage: "",
                    selfieImage: "",
                    singatureImage: "",
                    documentNumber: kycDetails.kyc.nationalId.docId || "",
                    documentExpiryDate: kycDetails.kyc.nationalId.docExpiryDate || ""
                };
                apiDocuments.push(nationalIdDoc);
            }

            if (apiDocuments.length > 0) {
                dispatch({ type: 'SET_IDENTITY_DOCUMENTS', payload: apiDocuments });
            }
        }

        // Use current documents (either from Redux or newly stored API documents)
        const currentDocuments = identityDocuments && identityDocuments.length > 0 ? identityDocuments :
            (kycDetails?.kyc ? [
                ...(kycDetails.kyc.pfc || kycDetails.kyc.pphs ? [{
                    documentType: "Passport",
                    frontImage: kycDetails.kyc.pfc?.frontDoc || "",
                    backDocImage: kycDetails.kyc.pfc?.backDoc || "",
                    handHoldingImage: kycDetails.kyc.pphs?.handHoldingIDPhoto || "",
                    selfieImage: kycDetails.kyc.pphs?.faceImage || "",
                    singatureImage: kycDetails.kyc.pphs?.signImage || "",
                    documentNumber: kycDetails.kyc.pfc?.docId || "",
                    documentExpiryDate: kycDetails.kyc.pfc?.docExpiryDate || ""
                }] : []),
                ...(kycDetails.kyc.nationalId ? [{
                    documentType: "National Id",
                    frontImage: kycDetails.kyc.nationalId.frontDoc || "",
                    backDocImage: kycDetails.kyc.nationalId.backDoc || "",
                    handHoldingImage: "",
                    selfieImage: "",
                    singatureImage: "",
                    documentNumber: kycDetails.kyc.nationalId.docId || "",
                    documentExpiryDate: kycDetails.kyc.nationalId.docExpiryDate || ""
                }] : [])
            ] : []);

        const documentErrors = [
            ...validateDocuments(),
            ...validateNationalId(),
            ...validateAddresses(),
            ...validateDob(),
            // ...validateIPAddress()
        ];

        if (documentErrors.length > 0) {
            setErrormsg(documentErrors.join(", "));
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            setSubmitLoading(false);
            return;
        }

        // Check if this is direct submit (no account creation fee)

        if (hasAccountCreationFee === false || hasAccountCreationFee === "false" || hasAccountCreationFee === undefined || hasAccountCreationFee === null || parseFloat(String(hasAccountCreationFee)) <= 0) {
            // Direct submit - call summaryAccountCreation API
            await handleDirectSubmit();
            return
        } else {
            // Normal flow - navigate to payment
            setSubmitLoading(false);
            navigation.navigate(props?.targetScreen, { ...props, ...props?.route?.params, animation: 'slide_from_right' })
        }
    };

    const handleDirectSubmit = async () => {
        // Transform and filter documents for personal accounts
        const transformedPersonalDocuments = (identityDocuments || []).filter((doc: any) => {
            if (doc.documentType?.toLowerCase() === "passport") {
                const hasData = doc.frontImage || doc.backDocImage || doc.documentNumber || doc.handHoldingImage || doc.selfieImage || doc.singatureImage;
                return hasData;
            }
            if (doc.documentType?.toLowerCase() === "national id") {
                const hasData = doc.frontImage || doc.backDocImage || doc.documentNumber;
                return hasData;
            }
            return false;
        }).map((doc: any) => {
            const transformed = {
                documentType: doc.documentType,
                frontImage: doc.frontImage || "",
                backDocImage: null,
                handHoldingImage: doc.handHoldingImage || "",
                singatureImage: doc.singatureImage || "",
                selfieImage: doc.selfieImage || "",
                docId: doc.documentNumber || "",
                docExpiryDate: doc.documentExpiryDate ? (() => {
                    if (doc.documentExpiryDate instanceof Date) {
                        return formatDateTimeForAPI(doc.documentExpiryDate);
                    }
                    if (typeof doc.documentExpiryDate === 'string') {
                        if (doc.documentExpiryDate.includes('AM') || doc.documentExpiryDate.includes('PM')) {
                            // Convert MM/DD/YYYY HH:MM:SS AM/PM to ISO format
                            const parts = doc.documentExpiryDate.split(' ');
                            const datePart = parts[0]; // "9/14/2026"
                            const timePart = parts[1]; // "12:00:00"
                            const ampm = parts[2]; // "AM"

                            const [month, day, year] = datePart.split('/');
                            const [hour, minute, second] = timePart.split(':');

                            let hour24 = parseInt(hour);
                            if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
                            if (ampm === 'AM' && hour24 === 12) hour24 = 0;

                            const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour24.toString().padStart(2, '0')}:${minute}:${second}`;
                            const dateObj = new Date(isoString);

                            if (!isNaN(dateObj.getTime())) {
                                return formatDateTimeForAPI(dateObj);
                            }
                        } else {
                            const dateObj = new Date(doc.documentExpiryDate);
                            if (!isNaN(dateObj.getTime())) {
                                return formatDateTimeForAPI(dateObj);
                            }
                        }
                    }
                    return "";
                })() : ""
            };
            return transformed;
        });

        // Personal account payload structure
        const payload = {
            walletId: null,
            amount: 0,
            metadata: null,
            documents: transformedPersonalDocuments,
            address: selectedAddresses || [],
            ubo: [],
            director: [],
            isReapply: false,
            sector: null,
            type: null,
            dob: personalDob ? formatDateTimeForAPI(personalDob) : null
        };

        try {
            const response = await BankServices.summaryAccountCreation(
                selectedBank?.productId,
                payload
            );

            if (response?.ok) {
                // Success - show success screen
                setSubmitLoading(false);
                successSheetRef.current?.open();
            } else {
                setErrormsg(isErrorDispaly(response));
                scrollRef.current?.scrollTo({ y: 0, animated: true });
                setSubmitLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            setSubmitLoading(false);
        }
    };

    const handleEditPersionalInfo = () => {
        navigation.navigate('AddressListScreen', { ProgramID: userinfo?.id, ...props, ...props?.route?.params });

    };

    const handleEditIdentificationDocuments = () => {
        navigation.navigate('BankKycProfileStep2', { ProgramID: selectedBank?.productId, ...props, ...props?.route?.params });
    };
    const handleEditDob = () => {
        dobSheetRef.current?.open();
    };

    const handleSaveDob = (dob: any) => {
        // Store Date object directly, formatDateTimeForAPI will handle conversion
        dispatch({ type: 'SET_PERSONAL_DOB', payload: dob });
        dobSheetRef.current?.close();
    };

    const formatDate = (dateInput: any) => {
        if (!dateInput) return '--';

        // Handle Date objects by converting to ISO string first
        if (dateInput instanceof Date) {
            const isoString = dateInput.toISOString();
            return formatDates(isoString, dateFormates.date) || '--';
        }

        // Handle string dates
        return formatDates(dateInput, dateFormates.date) || '--';
    };

    const getRequirements = () => {
        const requirements = (kycDetails as any)?.kyc?.requirement?.split(',') || [];
        return {
            showFullName: requirements.includes('FullName'),
            showBasic: requirements.includes('Basic'),
            showPFC: requirements.includes('PFC'),
            showPB: requirements.includes('PB'),
            showPPHS: requirements.includes('PPHS'),
            showAddress: requirements.includes('Address'),
            showNationalId: requirements.includes('NI')
        };
    };

    const requirements = getRequirements();




    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loadingData && <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}><DashboardLoader /></ViewComponent>}
            {!loadingData && <Container style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.KYC_INFORMATION"} onBackPress={props?.handleBack} isrefresh={true} onRefresh={handleRefresh} />
                <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
                    {errormsg !== "" && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}

                    <ViewComponent>
                        {requirements.showFullName && (
                            <PersonalInfoSection
                                kycDetails={kycDetails}
                                commonStyles={commonStyles}
                                decryptAES={decryptAES}
                                formatDate={formatDate}
                            />
                        )}

                        {requirements.showBasic && (
                            <BasicInfoSection
                                kycDetails={kycDetails}
                                commonStyles={commonStyles}
                                decryptAES={decryptAES}
                            />
                        )}

                        {/* Additional Info Section */}
                        <AdditionalInfoSection
                            personalDob={personalDob}
                            kycDetails={kycDetails}
                            commonStyles={commonStyles}
                            handleEditDob={handleEditDob}
                            formatDate={formatDate}
                            NEW_COLOR={NEW_COLOR}
                            s={s}
                        />


                        {(requirements.showPFC || requirements.showPPHS || requirements.showNationalId) && (
                            <ViewComponent>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap, commonStyles.alignCenter]}>
                                    <ParagraphComponent style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.DOCUMENTS"} multiLanguageAllows={true} />
                                </ViewComponent>

                                {(requirements.showPFC || requirements.showPPHS) && (
                                    <ViewComponent>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap, commonStyles.alignCenter]}>
                                            <RequiredLabel text={"GLOBAL_CONSTANTS.PASSPORT"} style={[commonStyles.sectionTitle]} />
                                            <CommonTouchableOpacity activeOpacity={0.8} onPress={handleEditIdentificationDocuments}>
                                                <ViewComponent style={[commonStyles.mt6]}>
                                                    {(kycDetails?.kyc?.pfc?.frontDoc ||
                                                        kycDetails?.kyc?.pphs?.handHoldingIDPhoto || kycDetails?.kyc?.pphs?.faceImage ||
                                                        kycDetails?.kyc?.pphs?.signImage ||
                                                        identityDocuments?.[0]?.frontImage ||
                                                        identityDocuments?.[0]?.handHoldingImage || identityDocuments?.[0]?.selfieImage || identityDocuments?.[0]?.singatureImage) ? (
                                                        <ViewComponent >
                                                            <CustomeditLink />
                                                        </ViewComponent>
                                                    ) : (
                                                        <ViewComponent style={[commonStyles.actioniconbg]}>
                                                            <AddIcon />
                                                        </ViewComponent>
                                                    )}
                                                </ViewComponent>
                                            </CommonTouchableOpacity>
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.formItemSpace]}>
                                            {requirements.showPFC && (
                                                <DocumentSection
                                                    identityDocuments={identityDocuments}
                                                    kycDetails={kycDetails}
                                                    commonStyles={commonStyles}
                                                    handleEditIdentificationDocuments={handleEditIdentificationDocuments}
                                                    decryptAES={decryptAES}
                                                />
                                            )}
                                            {requirements.showPPHS && (
                                                <PPHSSection
                                                    identityDocuments={identityDocuments}
                                                    kycDetails={kycDetails}
                                                    commonStyles={commonStyles}
                                                    handleEditIdentificationDocuments={handleEditIdentificationDocuments}
                                                    decryptAES={decryptAES}
                                                />
                                            )}
                                        </ViewComponent>
                                    </ViewComponent>
                                )}

                                {requirements.showNationalId && (
                                    <NationalIdSection
                                        identityDocuments={identityDocuments}
                                        kycDetails={kycDetails}
                                        commonStyles={commonStyles}
                                        handleEditIdentificationDocuments={handleEditIdentificationDocuments}
                                        decryptAES={decryptAES}
                                    />
                                )}
                            </ViewComponent>
                        )}

                        {requirements.showAddress && (
                            <AddressSection
                                selectedAddresses={selectedAddresses}
                                commonStyles={commonStyles}
                                handleEditPersionalInfo={handleEditPersionalInfo}
                                s={s}
                                kycDetails={kycDetails}
                                showTooltip={false}
                                decryptAES={decryptAES}
                                setErrormsg={setErrormsg}
                                t={t}
                            />
                        )}
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.mt30]} />
                    {
                        <ButtonComponent
                            title={(hasAccountCreationFee === false || hasAccountCreationFee === "false" || hasAccountCreationFee === undefined || hasAccountCreationFee === null || parseFloat(String(hasAccountCreationFee)) <= 0) ? "GLOBAL_CONSTANTS.SUBMIT" : "GLOBAL_CONSTANTS.CONTINUE"}
                            loading={submitLoading}
                            disable={submitLoading}
                            onPress={handleSubmit}
                        />
                    }
                    <ViewComponent style={commonStyles?.sectionGap} />
                </ScrollView>
            </Container>}

            <CustomRBSheet
                refRBSheet={dobSheetRef}
                height={s(320)}
                title={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"}
                modeltitle={false}
                onClose={() => { }}
            >
                <Formik
                    validationSchema={DOBSchema}
                    initialValues={(() => {
                        const parseDate = (dateStr: string) => {
                            try {
                                let date = new Date(dateStr);
                                if (!isNaN(date.getTime())) {
                                    return date;
                                }

                                const parts = dateStr.split(' ')[0].split('/');
                                if (parts.length === 3) {
                                    const month = parseInt(parts[0]) - 1;
                                    const day = parseInt(parts[1]);
                                    const year = parseInt(parts[2]);
                                    date = new Date(year, month, day);
                                    return date;
                                }

                                return undefined;
                            } catch (error) {
                                return undefined;
                            }
                        };

                        const dobToUse = personalDob || kycDetails?.kyc?.basic?.dob;
                        let initialDob;

                        if (dobToUse) {
                            initialDob = dobToUse instanceof Date ? dobToUse : parseDate(dobToUse);
                        } else {
                            // Don't bind any default date
                            initialDob = null;
                        }

                        return { dob: initialDob };
                    })()}
                    onSubmit={(values) => {
                        setDobError("");
                        handleSaveDob(values.dob);
                    }}
                    enableReinitialize
                >
                    {(formik) => (
                        <ViewComponent>
                            <DatePickerComponent
                                name={FORM_FIELD.DATE_OF_BIRTH}
                                label={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"}
                                maximumDate={maxDate}
                            // value={formik.values.dob}
                            // value={formik.values.dob instanceof Date && !isNaN(formik.values.dob.getTime()) ? formik.values.dob : new Date()}
                            // onHandleChange={(date: any) => {
                            //     formik.setFieldValue('dob', date, false);
                            // }}
                            />
                            <ViewComponent style={[commonStyles.sectionGap]} />

                            <ViewComponent style={[commonStyles.mt20]}>
                                <ButtonComponent
                                    title={"GLOBAL_CONSTANTS.SAVE"}
                                    onPress={formik.handleSubmit}
                                />
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.buttongap]}>
                                <ButtonComponent
                                    title={"GLOBAL_CONSTANTS.CANCEL"}
                                    onPress={() => dobSheetRef.current?.close()}
                                    solidBackground={true}
                                />
                            </ViewComponent>

                        </ViewComponent>
                    )}
                </Formik>
            </CustomRBSheet>
            <CustomRBSheet
                refRBSheet={successSheetRef}
                height={CommonConfig?.bankSucesssRbsheetHeight ? "Large" : "Large"}
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
});

export default BankKycProfilePreview;
