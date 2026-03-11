import React, { useEffect, useState, useRef } from "react";
import { Formik, Field } from "formik";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { View, TouchableOpacity, Text, useWindowDimensions, Platform } from "react-native";
import * as Yup from "yup";
import moment from "moment";
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../../components/buttons/button";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import FeePhysicalCardApply from "./physicalCardApply";
import { ApplyCardFormProps, ApplyCardFormValues, AssetForSelector, feePhysicalCardApplyValidation, FORM_DATA_CONSTANTS } from "../constants";
import Loadding from "../../../../../components/skelton/skeltons";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import { s } from "../../../../../constants/styels/scale";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CommonDropdown from '../../../../../components/dropDown';
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";
import { CoinImages, getThemedCommonStyles } from "../../../../../components/CommonStyles";
import ImageUri from "../../../../../components/imageComponents/image";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { isDecimalSmall } from '../../../../../../configuration';
import CustomPicker from "../../../../../components/customPicker/CustomPicker";
import LabelComponent from "../../../../../components/textComponets/lableComponent/lable";
import CustomeditLink from "../../../../../components/svgIcons/mainmenuicons/linkedit";
import CardsModuleService from "../../../../../apiServices/cards";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { isErrorDispaly } from "../../../../../utils/helpers";
import AddCardsAddress from "../apply_card_kyc/addCardsKycAddress";
import { cardDynamicFeildRenderLoader } from "../../dashoard/constants";
import { AddressDetail, AddressItem, ApiResponse, DynamicField } from "../interface";
import * as Linking from 'expo-linking';
import CustomRBSheet from "../../../../../components/models/commonBottomSheet";
import ScrollViewComponent from "../../../../../components/scrollView/scrollView";
import FlatListComponent from "../../../../../components/flatList/flatList";
import RenderHTML from "react-native-render-html";
import { sanitizeHtmlForReactNative } from "../../../../../hooks/securityHook/secureDomContent";

// Additional interfaces for type safety


const ApplyCardForm = (props: ApplyCardFormProps) => {
    const {
        t,
        initialFormValues,
        iHaveCard,
        setIHaveCard,
        cardsFeeInfo,
        onSubmitForm,
        selectedAssetForDisplay,
        setSelectedAssetForDisplay,
        coinWithCurrencyListForSelector,
        getApplyCardDeatilsInfo,
        cardFeeDetailsLoading,
        cardFeeLoader,
        btnLoading,
        cardId,
        dynamicFields,
        setDynamicFields
    } = props;

    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(null);
    const [addressesDetails, setAddressesDetails] = useState<AddressDetail[]>([]);
    const [isAddAddressModalVisible, setAddAddressModalVisible] = useState<boolean>(false);
    const [fieldsLoading, setFieldsLoading] = useState(false);
    const isFocused = useIsFocused();
    const navigation = useNavigation<NavigationType>();
    const termsSheetRef = useRef<any>();
    const dynamicRBSheetRef = useRef<any>();
    const [cardDetails, setCardDetails] = useState<any>();
    const [dynamicCheckboxes, setDynamicCheckboxes] = useState<{ [key: number]: boolean }>({});
    const [readDocuments, setReadDocuments] = useState<{ [key: string]: boolean }>({});
    const [currentSheetType, setCurrentSheetType] = useState<'esign' | 'cardterms' | 'privacy' | 'authorized' | null>(null);
    const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);
    const [pendingFormValues, setPendingFormValues] = useState<any>(null);
    const { width } = useWindowDimensions();

    const createDynamicInitialValues = (fields: DynamicField[]) => {
        const dynamicValues: Record<string, string> = {};
        fields.forEach((field) => {
            dynamicValues[field.field] = "";
        });
        return dynamicValues;
    };

    const createDynamicValidationSchema = (fields: DynamicField[]) => {
        const shape: Record<string, Yup.AnySchema> = {};
        fields.forEach((field) => {
            if (field.isMandatory === "true" || field.isMandatory === true) {
                let validation = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");

                if (field.validation) {
                    validation = validation.matches(new RegExp(field.validation), `Enter valid ${field.label || field.field}`);
                }

                if (field.field?.toLowerCase().includes('expiry') || field.field?.toLowerCase().includes('expire')) {
                    validation = validation.test('not-expired', 'GLOBAL_CONSTANTS.CARD_HAS_EXPIRED', (value) => {
                        if (!value) return false;
                        const [month, year] = value.split('/');
                        const expiry = moment(`20${year}-${month}-01`).endOf('month');
                        return expiry.isSameOrAfter(moment(), 'day');
                    });
                }

                shape[field.field] = validation;
            }
        });
        return Yup.object().shape(shape);
    };

    const handleCurrencySelect = async (selectedItem: AssetForSelector) => {
        setSelectedAssetForDisplay(selectedItem);
        if (selectedItem.id) {
            await getApplyCardDeatilsInfo(selectedItem.id, iHaveCard?.haveCard);
        }
    };
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        if (isFocused) {
            getPersonalCustomerDetailsInfo();
            if (cardId) {
                getDynamicFields();
                getCardDetails();

            }
        }
    }, [isFocused, cardId]);
    const getCardDetails = async () => {
        try {
            const response: any = await CardsModuleService.getApplyCardDeatils(cardId);
            if (response?.ok) {
                setCardDetails(response?.data);
            }
        } catch (error) {
            console.error('Error fetching card details:', error);
        }
    };

    const parseNoteData = () => {
        if (cardDetails?.noteType !== 'Dynamic') return [];
        try {
            const parsed = cardDetails?.note ? JSON.parse(cardDetails.note) : [];
            if (parsed.length > 0 && parsed[0].hasOwnProperty('note')) {
                return parsed;
            } else {
                return [{ title: 'Terms and Conditions', note: parsed }];
            }
        } catch (error) {
            return [];
        }
    };

    const getCurrentNoteItems = () => {
        const noteGroups = parseNoteData();
        return noteGroups[currentNoteIndex]?.note || [];
    };

    const handleDynamicCheckboxChange = (index: number) => {
        setDynamicCheckboxes(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const areAllRequiredCheckboxesChecked = () => {
        const noteItems = getCurrentNoteItems();
        return noteItems.every((item: any, index: number) => !item.isRequired || dynamicCheckboxes[index]);
    };

    const handleNextNote = () => {
        const noteGroups = parseNoteData();
        if (currentNoteIndex < noteGroups.length - 1) {
            setCurrentNoteIndex(prev => prev + 1);
            setDynamicCheckboxes({});
        } else {
            proceedWithPayment();
        }
    };

    const proceedWithPayment = () => {
        termsSheetRef?.current?.close();
        if (pendingFormValues) {
            onSubmitForm(pendingFormValues);
            setPendingFormValues(null);
        }
    };

    const cancelTermsOverlay = () => {
        // setDynamicCheckboxes({});
        setCurrentNoteIndex(0);
        setPendingFormValues(null);
        termsSheetRef?.current?.close();
    };

    const openDynamicSheet = async (type: 'esign' | 'cardterms' | 'privacy' | 'authorized') => {
        setCurrentSheetType(type);
        termsSheetRef?.current?.close();
        setTimeout(() => dynamicRBSheetRef?.current?.open(), Platform.OS === 'ios' ? 500 : 200);
    };

    const handleDynamicRead = () => {
        if (currentSheetType === 'esign') setReadDocuments(prev => ({ ...prev, 'E_SIGN_CONSENT': true, 'esign-consent': true }));
        else if (currentSheetType === 'cardterms') setReadDocuments(prev => ({ ...prev, 'CARD_TERMS': true, 'card-terms': true }));
        else if (currentSheetType === 'privacy') setReadDocuments(prev => ({ ...prev, 'PRIVACY_POLICY': true, 'privacy-policy': true }));
        else if (currentSheetType === 'authorized') setReadDocuments(prev => ({ ...prev, 'AUTHORIZED_USER_AGREEMENT': true, 'authorized-user-agreement': true }));
        dynamicRBSheetRef?.current?.close();
        setTimeout(() => termsSheetRef?.current?.open(), Platform.OS === 'ios' ? 500 : 200);
    };

    const cancelDynamicOverlay = () => {
        dynamicRBSheetRef?.current?.close();
        setTimeout(() => termsSheetRef?.current?.open(), Platform.OS === 'ios' ? 300 : 200);
    };

    useEffect(() => {
        const noteItems = getCurrentNoteItems();
        const updatedCheckboxes: { [key: number]: boolean } = {};
        noteItems.forEach((item: any, index: number) => {
            const linkMatches = item?.title?.match(/<a[^>]*data-action=['"]([^'"]*)['"][^>]*>/g) || [];
            const requiredActions = linkMatches.map((match: string) => {
                const actionMatch = match.match(/data-action=['"]([^'"]*)['"]/);
                return actionMatch ? actionMatch[1] : null;
            }).filter(Boolean);
            if (requiredActions.length > 0) {
                const allDocumentsRead = requiredActions.every((action: string) => readDocuments[action]);
                updatedCheckboxes[index] = allDocumentsRead;
            }
        });
        setDynamicCheckboxes(prev => ({ ...prev, ...updatedCheckboxes }));
    }, [readDocuments, cardDetails?.note, currentNoteIndex]);

    const renderAgreementItem = ({ item, index }: { item: any; index: number }) => (
        <ViewComponent>
            <CommonTouchableOpacity onPress={() => handleDynamicCheckboxChange(index)}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.flexWrap]}>
                    <MaterialCommunityIcons name={dynamicCheckboxes[index] ? 'checkbox-outline' : 'checkbox-blank-outline'} size={s(24)} style={{ marginTop: s(2) }} color={dynamicCheckboxes[index] ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link} />
                    <ViewComponent style={{ flex: 1 }}>
                        <Text style={{ color: NEW_COLOR.TEXT_WHITE, fontSize: s(14), lineHeight: s(20) }}>
                            {(() => {
                                const htmlContent = item.title;
                                const parts = htmlContent.split(/(<a[^>]*>.*?<\/a>)/);
                                return parts.map((part: string, partIndex: number) => {
                                    const dataActionMatch = part.match(/<a[^>]*data-action=['"]([^'"]*)['"][^>]*>(.*?)<\/a>/);
                                    if (dataActionMatch) {
                                        const action = dataActionMatch[1];
                                        const linkText = dataActionMatch[2];
                                        return <Text key={partIndex} style={commonStyles.inputbottomtextlink} onPress={() => {
                                            if (action === 'E_SIGN_CONSENT' || action === 'esign-consent') openDynamicSheet('esign');
                                            else if (action === 'CARD_TERMS' || action === 'card-terms') openDynamicSheet('cardterms');
                                            else if (action === 'PRIVACY_POLICY' || action === 'privacy-policy') openDynamicSheet('privacy');
                                            else if (action === 'AUTHORIZED_USER_AGREEMENT' || action === 'authorized-user-agreement') openDynamicSheet('authorized');
                                        }}>{linkText}</Text>;
                                    }
                                    const hrefMatch = part.match(/<a[^>]*href=['"]([^'"]*)['"][^>]*>(.*?)<\/a>/);
                                    if (hrefMatch) return <Text key={partIndex} style={commonStyles.inputbottomtextlink} onPress={() => Linking.openURL(hrefMatch[1])}>{hrefMatch[2]}</Text>;
                                    return <Text key={partIndex}>{part.replace(/<[^>]*>/g, '')}</Text>;
                                });
                            })()}
                        </Text>
                    </ViewComponent>
                </ViewComponent>
            </CommonTouchableOpacity>
        </ViewComponent>
    );

    const handlePayButtonPress = (values: any, handleSubmit: any) => {
        if (cardDetails?.note && cardDetails?.note !== "") {
            setPendingFormValues(values);
            setCurrentNoteIndex(0);
            // setDynamicCheckboxes({});
            termsSheetRef?.current?.open();
        } else {
            handleSubmit();
        }
    };

    const getDynamicFields = async () => {
        setFieldsLoading(true);
        try {
            const res = await CardsModuleService.getActiveCardDynamicFeilds(cardId) as ApiResponse<DynamicField[]>;
            if (res.ok) {
                const fields = Array.isArray(res?.data) ? res?.data : [];
                if (setDynamicFields) {
                    setDynamicFields(fields);
                }
            }
        } catch (error) {
        } finally {
            setFieldsLoading(false);
        }
    };

    const getPersonalCustomerDetailsInfo = async () => {
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
                setAddressesDetails(response?.data?.data || []);

                const defaultAddress = addressesList.find((addr: AddressItem) => addr.isDefault);
                if (defaultAddress && !selectedAddress) {
                    setSelectedAddress(defaultAddress);
                    const addressDetail = response?.data?.data?.find((addr: AddressDetail) => addr?.id === defaultAddress?.id);
                    if (addressDetail) {
                        // Auto-bind default address data to form
                        // This will be handled in the formik render function
                    }
                }
            }
        } catch (error) {
        }
    };

    const handleAddress = (addressName: string, setFieldValue: (field: string, value: unknown) => void) => {
        const address = addresses?.find((item: AddressItem) => item?.name === addressName);
        if (address) {
            setSelectedAddress(address);
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS, addressName);
            setFieldValue('shippingAddressId', address.id);
            const addressDetail = addressesDetails?.find((addr: AddressDetail) => addr?.id === address?.id);
            if (addressDetail) {
                setFieldValue('addressLine1', addressDetail?.addressLine1 || "");
                setFieldValue('addressLine2', addressDetail?.addressLine2 || "");
                setFieldValue('city', addressDetail?.city || "");
                setFieldValue('state', addressDetail?.state || "");
                setFieldValue('postalCode', addressDetail?.postalCode || "");
                setFieldValue('addressCountry', addressDetail?.country || "");
                setFieldValue('town', addressDetail?.town || "");
            }
        }
    };
    const handleAddAddress = () => {
        setAddAddressModalVisible(true);
    };

    const handleCloseAddAddressModal = () => {
        setAddAddressModalVisible(false);
    };

    const handleAddressSaveSuccess = () => {
        setAddAddressModalVisible(false);
        getPersonalCustomerDetailsInfo();
    };


    const selectHaveCard = async (type: string) => {
        if ((type === FORM_DATA_CONSTANTS.HAVE_CARD && iHaveCard.haveCard) || (type === FORM_DATA_CONSTANTS.SEND_CARD && iHaveCard.sendCard)) {
            return;
        }
        let newIHaveCardState = { haveCard: false, sendCard: false };
        if (type === FORM_DATA_CONSTANTS.HAVE_CARD) {
            newIHaveCardState = { haveCard: true, sendCard: false };
        } else if (type === FORM_DATA_CONSTANTS.SEND_CARD

        ) {
            newIHaveCardState = { haveCard: false, sendCard: true };
        }
        setIHaveCard(newIHaveCardState);
        if (selectedAssetForDisplay) {
            await getApplyCardDeatilsInfo(selectedAssetForDisplay.id, newIHaveCardState.haveCard);
        }
    };


    // Create combined initial values - only include dynamic fields when iHaveCard is true
    const combinedInitialValues = {
        ...initialFormValues,
        ...(iHaveCard?.haveCard ? createDynamicInitialValues(dynamicFields || []) : {}),
        agreedToTerms: false
    };

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={[{ flexGrow: 1 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
        >
            <Formik
                initialValues={combinedInitialValues}
                validationSchema={Yup.object().shape({
                    ...(iHaveCard?.haveCard ? createDynamicValidationSchema(dynamicFields || []).fields : {})
                })}
                validateOnBlur={true}
                validateOnChange={true}
                enableReinitialize
                onSubmit={onSubmitForm}>
                {(formikProps) => {
                    const { touched, errors, handleBlur, values, setFieldValue, handleChange, handleSubmit } = formikProps;
                    useEffect(() => {
                        if (selectedAssetForDisplay) {
                            setFieldValue("currency", selectedAssetForDisplay.code, false);
                        } else {
                            setFieldValue("currency", "", false);
                        }
                    }, [selectedAssetForDisplay, setFieldValue]);

                    useEffect(() => {
                        const defaultAddress = addresses.find((addr: AddressItem) => addr.isDefault);
                        if (defaultAddress && !values.address) {
                            handleAddress(defaultAddress.name, setFieldValue);
                        }
                    }, [addresses, setFieldValue, iHaveCard]);

                    return (
                        <ViewComponent>
                            <ViewComponent style={[commonStyles.coinselector]}>
                                <CommonDropdown
                                    data={coinWithCurrencyListForSelector}
                                    selectedItem={selectedAssetForDisplay}
                                    onSelect={handleCurrencySelect}
                                    placeholder={t('GLOBAL_CONSTANTS.SELECT_CURRENCY')}
                                    renderItem={(item, isSelected) => (
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, isSelected && commonStyles.inputdropdowntabactivebg, commonStyles.gap8, commonStyles.p10, commonStyles.py8, commonStyles.mt4]}>
                                            <ViewComponent style={{ width: s(32), height: s(32) }}>
                                                <ImageUri
                                                    uri={CoinImages[item?.code?.toLowerCase()] || item.coinImage}
                                                    width={s(30)}
                                                    height={s(30)}
                                                    style={{ borderRadius: s(18) }}
                                                />
                                            </ViewComponent>
                                            <ViewComponent style={commonStyles.flex1} >
                                                <ParagraphComponent style={[commonStyles.inputdropdowntext]}>
                                                    {item.code}
                                                </ParagraphComponent>
                                            </ViewComponent>
                                            <CurrencyText value={item?.amount || 0} decimalPlaces={4} style={[commonStyles.availbleamount]} />
                                        </ViewComponent>
                                    )}
                                    dropdownHeight={s(300)}
                                />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.availablecontentcenter]}>

                                {selectedAssetForDisplay && (
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyend, commonStyles.mt8]}>
                                        <ParagraphComponent
                                            style={[commonStyles.availblelabel]}
                                            text={`${t('GLOBAL_CONSTANTS.AVAILABLE_BALANCES')}`}
                                        />
                                        <CurrencyText
                                            value={selectedAssetForDisplay?.amount ?? 0}
                                            currency={selectedAssetForDisplay.code}
                                            style={[commonStyles.availbleamount]}
                                            decimalPlaces={4}
                                        />
                                    </ViewComponent>
                                )}
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.sectionGap]} />
                            {cardsFeeInfo && selectedAssetForDisplay && (<>
                                <ViewComponent style={[commonStyles.sectionGap]}>
                                    <ViewComponent>
                                        <TextMultiLangauge style={[commonStyles.transactionamounttextlabel]} text={"GLOBAL_CONSTANTS.AMOUNT_TO_BE_PAID"} />
                                    </ViewComponent>
                                    <ParagraphComponent style={[commonStyles.amountTobePaidtext]}>
                                        <CurrencyText
                                            value={cardsFeeInfo?.estimatedPaymentAmount !== null ? cardsFeeInfo?.estimatedPaymentAmount : 0}
                                            style={[commonStyles.transactionamounttext]}
                                            decimalPlaces={4} smallDecimal={isDecimalSmall}
                                        />
                                        <ParagraphComponent text={` ${cardsFeeInfo?.paymentCurrency}`} style={[commonStyles.transactionamounttext]} />
                                    </ParagraphComponent>
                                </ViewComponent>
                                {cardsFeeInfo?.firstRecharge > 0 && <ViewComponent style={[commonStyles.dflex, commonStyles.gap6, commonStyles.alignStart, commonStyles.sectionGap, commonStyles.bgnote]}>
                                    <MaterialIcons name="info-outline" size={s(16)} color={NEW_COLOR.NOTE_ICON} />
                                    <TextMultiLangauge style={[commonStyles.bgNoteText, commonStyles.flex1]} text={"GLOBAL_CONSTANTS.IT_IS_EXPECT_TO_ARRIVE"} />
                                </ViewComponent>}
                                {cardsFeeInfo.cardType?.toLowerCase() === 'physical' &&
                                    <ViewComponent style={[]}>
                                        <CommonTouchableOpacity onPress={() => selectHaveCard(FORM_DATA_CONSTANTS.HAVE_CARD)} >
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
                                                <MaterialCommunityIcons
                                                    name={iHaveCard?.haveCard === true ? 'checkbox-outline' : 'checkbox-blank-outline'} size={s(22)}
                                                    color={iHaveCard?.haveCard === true ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link}
                                                    onPress={() => selectHaveCard(FORM_DATA_CONSTANTS.HAVE_CARD)}
                                                />
                                                <TextMultiLangauge style={[commonStyles.checkboxcardtext, commonStyles.flex1]} text={"GLOBAL_CONSTANTS.IHAVE_THE_CARD_ON_HAND"} />
                                            </ViewComponent>
                                        </CommonTouchableOpacity>
                                        <ViewComponent style={[commonStyles.titleSectionGap]} />
                                        <CommonTouchableOpacity onPress={() => selectHaveCard(FORM_DATA_CONSTANTS.SEND_CARD)} >
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16, iHaveCard?.sendCard && commonStyles.formItemSpace]}>
                                                <MaterialCommunityIcons
                                                    name={iHaveCard?.sendCard === true ? 'checkbox-outline' : 'checkbox-blank-outline'} size={s(22)}
                                                    color={iHaveCard?.sendCard === true ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link}
                                                    onPress={() => selectHaveCard(FORM_DATA_CONSTANTS.SEND_CARD)}
                                                />
                                                <TextMultiLangauge style={[commonStyles.checkboxcardtext, commonStyles.flex1]} text={"GLOBAL_CONSTANTS.PLEASE_SEND_A_CARD_TO_ME"} />
                                            </ViewComponent>
                                        </CommonTouchableOpacity>
                                        <ViewComponent style={[commonStyles.listGap,]}>

                                            {iHaveCard?.sendCard && (<ViewComponent style={[]}>
                                                {/* ADDRESS HEADER */}
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb2]}>
                                                    <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.SELECT_DELIVERY_ADDRESS")}>
                                                        <LabelComponent text={" *"} style={commonStyles.textError} />
                                                    </LabelComponent>
                                                    <ViewComponent style={[commonStyles.actioniconbg, { marginTop: s(-8) }]}>
                                                        <MaterialIcons name="add" size={s(22)} color={NEW_COLOR.DARK_TEXT_WHITE} onPress={handleAddAddress} />
                                                    </ViewComponent>
                                                </ViewComponent>

                                                {/* ADDRESS SELECTION */}
                                                <Field
                                                    activeOpacity={0.9}
                                                    touched={touched.address}
                                                    name={FORM_DATA_CONSTANTS.ADDRESS}
                                                    modalTitle={"GLOBAL_CONSTANTS.ADDRESS"}
                                                    data={addresses}
                                                    onChange={(value: string) => handleAddress(value, setFieldValue)}
                                                    error={errors?.address}
                                                    value={values?.address || (addresses?.length > 0 ? addresses[0]?.name : '')}
                                                    handleBlur={handleBlur}
                                                    customContainerStyle={{}}
                                                    placeholder={"GLOBAL_CONSTANTS.SELECT_ADDRESS"}
                                                    component={CustomPicker}
                                                    isOnlycountry={true}
                                                />

                                                {/* SELECTED ADDRESS PREVIEW */}
                                                {values?.address && (
                                                    <ViewComponent>
                                                        <View style={commonStyles.mt8} />
                                                        <TouchableOpacity style={[commonStyles.relative, commonStyles.bgnote]} disabled>
                                                            <View style={[
                                                                commonStyles.dflex,
                                                                commonStyles.gap16,
                                                                commonStyles.alignStart,
                                                                commonStyles.notebg,
                                                                commonStyles.rounded5,
                                                                commonStyles.p8,
                                                                commonStyles.mt4
                                                            ]}>
                                                                <View style={[commonStyles.flex1]}>
                                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                                                                        <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb2]}>
                                                                            <ParagraphComponent
                                                                                style={[commonStyles.twolettertext, commonStyles.textCenter]}
                                                                                text={
                                                                                    values?.address?.length > 40
                                                                                        ? `${values?.address?.slice(0, 8)}...${values?.address?.slice(-8)}`
                                                                                        : values?.address ?? "--"
                                                                                }
                                                                            />
                                                                        </View>
                                                                    </ViewComponent>
                                                                    <View>
                                                                        <ParagraphComponent
                                                                            text={[
                                                                                values?.addressLine1,
                                                                                values?.addressLine2,
                                                                                values?.town,
                                                                                values?.city,
                                                                                values?.state,
                                                                                values?.addressCountry?.length > 10
                                                                                    ? `${values?.addressCountry?.slice(0, 8)}...${values?.addressCountry?.slice(-8)}`
                                                                                    : values?.addressCountry,
                                                                                values?.postalCode
                                                                            ]?.filter(Boolean)?.join(", ") || "--"}
                                                                            style={[commonStyles.secondparatext]}
                                                                        />
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </ViewComponent>
                                                )}
                                            </ViewComponent>)}
                                            {iHaveCard?.haveCard && (
                                                <ViewComponent style={[commonStyles.mt24]}>
                                                    {fieldsLoading ? (
                                                        <Loadding contenthtml={cardDynamicFeildRenderLoader(dynamicFields?.length || 0)} />
                                                    ) : (
                                                        <FeePhysicalCardApply
                                                            touched={touched}
                                                            errors={errors}
                                                            handleBlur={handleBlur}
                                                            values={values}
                                                            setFieldValue={setFieldValue}
                                                            handleChange={handleChange}
                                                            envelopeNoRequired={cardsFeeInfo?.envelopeNoRequired}
                                                            needPhotoForActiveCard={cardsFeeInfo?.needPhotoForActiveCard}
                                                            additionalDocforActiveCard={cardsFeeInfo?.additionaldocForActiveCard}
                                                            cardId={cardId}
                                                            dynamicFields={dynamicFields || []}
                                                        />
                                                    )}
                                                </ViewComponent>
                                            )}
                                        </ViewComponent>
                                    </ViewComponent>
                                }
                                <ViewComponent style={[commonStyles.sectionGap]} />
                                {cardFeeDetailsLoading && (
                                    <Loadding contenthtml={cardFeeLoader} />
                                )}
                                {!cardFeeDetailsLoading && cardsFeeInfo && (
                                    <ViewComponent style={[]}>
                                        {cardsFeeInfo?.issuingFee > 0 && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8, commonStyles.listbannerbg]}>
                                            <TextMultiLangauge style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ISSUING_FEE"} />
                                            <CurrencyText value={cardsFeeInfo?.issuingFee ?? 0} decimalPlaces={4} currency={cardsFeeInfo?.paymentCurrency} style={[commonStyles.listprimarytext]} />
                                        </ViewComponent>}

                                        {cardsFeeInfo?.firstRecharge > 0 && (<ViewComponent>
                                            <ViewComponent style={[commonStyles.listitemGap]} />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8, commonStyles.listbannerbg]}>
                                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FIRST_RECHARGE_AMOUNT"} />
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                    <CurrencyText value={cardsFeeInfo?.firstRecharge ?? 0} currency={cardsFeeInfo?.cardCurrency} style={[commonStyles.listprimarytext]} />
                                                </ViewComponent>
                                            </ViewComponent>
                                        </ViewComponent>)}
                                        {((iHaveCard?.haveCard || iHaveCard?.sendCard) && cardsFeeInfo?.freightFee > 0) && cardsFeeInfo.cardType?.toLowerCase() === 'physical' && <>
                                            <ViewComponent style={[commonStyles.listitemGap]} />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8, commonStyles.listbannerbg]}>
                                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FRIGHT_FEE"} />
                                                <ViewComponent style={[]}>
                                                    <CurrencyText value={cardsFeeInfo?.freightFee ?? 0} currency={cardsFeeInfo?.paymentCurrency} decimalPlaces={4} style={[commonStyles.listprimarytext]} />
                                                </ViewComponent>
                                            </ViewComponent>
                                        </>}
                                        <ViewComponent style={[commonStyles.listitemGap]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8, commonStyles.listbannerbg]}>
                                            <TextMultiLangauge style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ESTIMATED_PAYMENT_AMOUNT"} />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
                                                <CurrencyText value={cardsFeeInfo?.estimatedPaymentAmount ?? 0} currency={cardsFeeInfo?.paymentCurrency} decimalPlaces={4} style={[commonStyles.listprimarytext]} />
                                            </ViewComponent>
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.listitemGap]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8, commonStyles.listbannerbg]}>
                                            <TextMultiLangauge style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.PAYMENT_CURRENCY"} />
                                            <ParagraphComponent text={`${cardsFeeInfo?.paymentCurrency}`} style={[commonStyles.listprimarytext]} />
                                        </ViewComponent>
                                    </ViewComponent>)}
                            </>)}
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            <ViewComponent style={[commonStyles.sectionGap]} />

                            <ButtonComponent
                                title={`${t("GLOBAL_CONSTANTS.PAY")}`}
                                disable={btnLoading || !cardsFeeInfo || !selectedAssetForDisplay}
                                loading={btnLoading}
                                onPress={() => handlePayButtonPress(values, handleSubmit)}
                            />
                            <ViewComponent style={[commonStyles.mb43]} />
                        </ViewComponent>
                    );
                }}
            </Formik>
            <AddCardsAddress
                isVisible={isAddAddressModalVisible}
                onClose={handleCloseAddAddressModal}
                onSaveSuccess={handleAddressSaveSuccess}
            />
            <CustomRBSheet refRBSheet={termsSheetRef} title="GLOBAL_CONSTANTS.NOTES" height={s(600)}>
                <ViewComponent style={{ flex: 1 }}>
                    <ScrollViewComponent style={{ flex: 1 }}>
                        {cardDetails?.noteType === 'Dynamic' ? (
                            <ViewComponent>
                                <TextMultiLangauge text={parseNoteData()[currentNoteIndex]?.title || 'Terms and Conditions'} style={[commonStyles.sectionTitle, commonStyles.mb16]} />
                                <FlatListComponent data={getCurrentNoteItems()} keyExtractor={(_, index) => index.toString()} renderItem={renderAgreementItem} ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.mt10]} />} scrollEnabled={false} />
                            </ViewComponent>
                        ) : (
                            <RenderHTML contentWidth={width} source={{ html: sanitizeHtmlForReactNative(cardDetails?.note) || cardDetails?.note || '' }} tagsStyles={{ body: { color: NEW_COLOR.TEXT_WHITE, fontSize: 14 }, li: { color: NEW_COLOR.TEXT_WHITE, fontSize: 12 } }} />
                        )}
                    </ScrollViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent title="GLOBAL_CONSTANTS.CANCEL" onPress={cancelTermsOverlay} solidBackground={true} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent title={currentNoteIndex < parseNoteData().length - 1 ? "Next" : "GLOBAL_CONSTANTS.IVE_READ"} onPress={currentNoteIndex < parseNoteData().length - 1 ? handleNextNote : proceedWithPayment} disable={cardDetails?.noteType === 'Dynamic' ? !areAllRequiredCheckboxesChecked() : false} />
                        </ViewComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </ViewComponent>
            </CustomRBSheet>

            <CustomRBSheet refRBSheet={dynamicRBSheetRef} title={currentSheetType === 'esign' ? 'E-Sign Consent' : currentSheetType === 'cardterms' ? 'Card Terms' : currentSheetType === 'privacy' ? 'Privacy Policy' : 'Authorized User Agreement'} height={s(600)}>
                <ViewComponent style={{ flex: 1 }}>
                    <ScrollViewComponent style={{ flex: 1 }}>
                        <TextMultiLangauge text="Document content here" style={[commonStyles.textWhite]} />
                    </ScrollViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent title="GLOBAL_CONSTANTS.CANCEL" onPress={cancelDynamicOverlay} solidBackground={true} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent title="GLOBAL_CONSTANTS.IVE_READ" onPress={handleDynamicRead} />
                        </ViewComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </ViewComponent>
            </CustomRBSheet>
        </KeyboardAwareScrollView>
    );
};

export default ApplyCardForm;
