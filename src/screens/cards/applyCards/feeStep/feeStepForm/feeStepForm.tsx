import React, { useEffect, useState } from "react";
import { Formik, Field } from "formik";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View, TouchableOpacity } from "react-native";
import { ApplyCardFormProps, ApplyCardFormValues, AssetForSelector, feePhysicalCardApplyValidation, FORM_DATA_CONSTANTS } from "../../kycRequirements/constants";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../../../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../../../assets/styles/CommonStyles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ViewComponent from "../../../../../newComponents/view/view";
import ParagraphComponent from "../../../../../newComponents/textComponets/paragraphText/paragraph";
import { CurrencyText } from "../../../../../newComponents/textComponets/currencyText/currencyText";
import TextMultiLanguage from "../../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../../newComponents/touchableComponents/touchableOpacity";
import { s } from "../../../../../constants/theme/scale";
import LabelComponent from "../../../../../newComponents/textComponets/lableComponent/lable";
import CustomPickerModal from "../../../../../newComponents/pickerComponents/formik/customPicker";
import PhysicalCardDetails from "./phsicalCardDetails/physicalCardDetails";
import Loadding from "../../../../commonScreens/skeltons";
import ImageUri from "../../../../../newComponents/imageComponents/image";
import { COMMON_SVG_URLS } from "../../../../../assets/blobUrls";
import { transactionCard } from "../../../../commonScreens/transactions/skeltonViews";



const FeeStepForm = (props: ApplyCardFormProps) => {
    const {
        t,
        initialFormValues,
        iHaveCard,
        setIHaveCard,
        cardsFeeInfo,
        onSubmitForm,
        getApplyCardDeatilsInfo,
        cardFeeDetailsLoading,
        setSelectedCurrency,
        setSelectedNetwork,
        selectedCurrency,
        selectedNetwork,
        currencyList,
        networkList,
        getNetworkList,

    } = props;

    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const cardFeeLoader = transactionCard(4);

    const selectHaveCard = async (type: any) => {
        if ((type === FORM_DATA_CONSTANTS.HAVE_CARD && iHaveCard.haveCard) || (type === FORM_DATA_CONSTANTS.SEND_CARD && iHaveCard.sendCard)) {
            return;
        }
        let newIHaveCardState = { haveCard: false, sendCard: false };
        if (type === FORM_DATA_CONSTANTS.HAVE_CARD) {
            newIHaveCardState = { haveCard: true, sendCard: false };
        } else if (type === FORM_DATA_CONSTANTS.SEND_CARD) {
            newIHaveCardState = { haveCard: false, sendCard: true };
        }
        setIHaveCard(newIHaveCardState);
        if (selectedCurrency) {
            await getApplyCardDeatilsInfo?.(selectedCurrency.id, newIHaveCardState.haveCard);
        }
    };
    return (
        <KeyboardAwareScrollView
            contentContainerStyle={[{ flexGrow: 1 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
        >
            <Formik
                initialValues={initialFormValues}
                validationSchema={iHaveCard?.haveCard ? feePhysicalCardApplyValidation(cardsFeeInfo) : undefined}
                validateOnBlur={true}
                validateOnChange={true}
                enableReinitialize
                onSubmit={onSubmitForm}>
                {(formikProps: any) => {
                    const { touched, errors, handleBlur, values, setFieldValue, handleChange, handleSubmit }: {
                        touched: any;
                        errors: any;
                        handleBlur: any;
                        values: ApplyCardFormValues;
                        setFieldValue: any;
                        handleChange: any;
                        handleSubmit: any;
                    } = formikProps;

                    useEffect(() => {
                        if (selectedCurrency && !values.currency) {
                            setFieldValue("currency", selectedCurrency?.walletCode, false);
                        }
                        // if (selectedNetwork?.code && !values.network) {
                        //     setFieldValue("network", selectedNetwork.code, false);
                        // }
                    }, [selectedCurrency, setFieldValue, values.currency, values.network]);

                    const handleCurrencyChange = async (selectedValue: any) => {
                        setSelectedCurrency(selectedValue);
                        setFieldValue("currency", selectedValue.walletCode);
                        // setSelectedNetwork({}); // Clear selected network
                        // setFieldValue("network", ""); // Clear network when currency changes
                        // getNetworkList?.(selectedValue?.walletCode);
                        await getApplyCardDeatilsInfo?.(selectedValue.id, iHaveCard.haveCard);

                    }
                    const handleNetworkChange = async (selectedValue: any) => {
                        setSelectedNetwork(selectedValue);
                        setFieldValue("network", selectedValue.code);
                        // await getApplyCardDeatilsInfo?.(selectedValue.id, iHaveCard.haveCard);
                    }
                    return (
                        <ViewComponent>
{/* 
                            <Field
                                name="currency"
                                component={CustomPickerModal}
                                data={(currencyList || []).filter(item => item && (item.walletCode || item.id))}
                                label="GLOBAL_CONSTANTS.CURRENCY"
                                placeholder="GLOBAL_CONSTANTS.SELECT_CURRENCY"
                                modalTitle="GLOBAL_CONSTANTS.SELECT_CURRENCY"
                                inputCustomStyle={{ borderRadius: s(10) }}
                                error={touched.currency && errors.currency ? errors.currency : undefined}
                                searchPlaceholder="GLOBAL_CONSTANTS.SEARCH_CURRENCY"
                                sheetHeight={s(500)}
                                selectionType={"walletCode"}
                                isRequired={true}
                                onChange={handleCurrencyChange}
                                value={values.currency || selectedCurrency?.walletCode}
                            />

                            <ViewComponent style={[commonStyles.formItemSpace]} /> */}

                            {/* <Field
                                name="network"
                                component={CustomPickerModal}
                                data={(networkList || []).filter(item => item && (item.code || item.id))}
                                label="GLOBAL_CONSTANTS.NETWORK"
                                placeholder="GLOBAL_CONSTANTS.SELECT_NETWORK"
                                modalTitle="GLOBAL_CONSTANTS.SELECT_NETWORK"
                                inputCustomStyle={{ borderRadius: s(10) }}
                                error={touched.network && errors.network ? errors.network : undefined}
                                searchPlaceholder="GLOBAL_CONSTANTS.SEARCH_NETWORKS"
                                sheetHeight={s(500)}
                                selectionType={"code"}
                                isRequired={true}
                                onChange={handleNetworkChange}
                            /> */}

                            {/* <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.list]}>
                                <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                                    <ImageUri uri={selectedCurrency?.logo} height={s(24)} width={s(24)} />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1]}>
                                    <TextMultiLanguage
                                        text={"GLOBAL_CONSTANTS.AVAIL_BALANCE"}
                                        style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} />
                                    <ViewComponent>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                                            <CurrencyText
                                                value={selectedCurrency?.avilable || 0}
                                                // currency={`${selectedCurrency?.walletCode || ''}`}
                                                symboles={true}
                                                style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                                        </ViewComponent>
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent> */}

                            <ViewComponent style={[commonStyles.sectionGap]} />
                            {cardsFeeInfo && selectedCurrency && Object.keys(selectedCurrency).length > 0 && (<>
                                <ViewComponent style={[commonStyles.sectionGap]}>
                                    <ViewComponent>
                                        <TextMultiLanguage style={[commonStyles.transactionamounttextlabel]} text={"GLOBAL_CONSTANTS.AMOUNT_TO_BE_PAID"} />
                                    </ViewComponent>
                                    <ParagraphComponent style={[commonStyles.amountTobePaidtext, commonStyles.mt6]}>
                                        <CurrencyText
                                            value={cardsFeeInfo?.estimatedPaymentAmount !== null ? cardsFeeInfo?.estimatedPaymentAmount : 0}
                                            style={[commonStyles.transactionamounttext]}
                                            currency={cardsFeeInfo?.cardCurrency}
                                            symboles={true}

                                        />
                                        {/* <ParagraphComponent text={` ${cardsFeeInfo?.paymentCurrency} `} style={[commonStyles.transactionamounttext]} /> */}
                                    </ParagraphComponent>
                                </ViewComponent>
                                {/* <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignStart, commonStyles.sectionGap]}>
                                    <ImageUri uri={COMMON_SVG_URLS.infoIcon} width={s(24)} height={s(24)} />
                                    <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]} text={"GLOBAL_CONSTANTS.IT_IS_EXPECT_TO_ARRIVE"} />
                                </ViewComponent> */}
                                {cardsFeeInfo.cardType !== 'Virtual' &&
                                    <ViewComponent style={[commonStyles.sectionGap]}>
                                        <CommonTouchableOpacity onPress={() => selectHaveCard(FORM_DATA_CONSTANTS.HAVE_CARD)} >
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
                                                <MaterialCommunityIcons
                                                    name={iHaveCard?.haveCard === true ? 'checkbox-outline' : 'checkbox-blank-outline'} size={s(22)}
                                                    color={iHaveCard?.haveCard === true ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link}
                                                    onPress={() => selectHaveCard(FORM_DATA_CONSTANTS.HAVE_CARD)}
                                                />
                                                <TextMultiLanguage style={[commonStyles.checkboxcardtext, commonStyles.flex1]} text={"GLOBAL_CONSTANTS.IHAVE_THE_CARD_ON_HAND"} />
                                            </ViewComponent>
                                        </CommonTouchableOpacity>
                                        <ViewComponent style={[commonStyles.titleSectionGap]} />
                                        <CommonTouchableOpacity onPress={() => selectHaveCard(FORM_DATA_CONSTANTS.SEND_CARD)} >
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
                                                <MaterialCommunityIcons
                                                    name={iHaveCard?.sendCard === true ? 'checkbox-outline' : 'checkbox-blank-outline'} size={s(22)}
                                                    color={iHaveCard?.sendCard === true ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link}
                                                    onPress={() => selectHaveCard(FORM_DATA_CONSTANTS.SEND_CARD)}
                                                />
                                                <TextMultiLanguage style={[commonStyles.checkboxcardtext, commonStyles.flex1]} text={"GLOBAL_CONSTANTS.PLEASE_SEND_A_CARD_TO_ME"} />
                                            </ViewComponent>
                                        </CommonTouchableOpacity>

                                        {iHaveCard?.sendCard && (<ViewComponent style={[commonStyles.mt32]}>
                                            {/* ADDRESS HEADER */}
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb2]}>
                                                <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.SELECT_DELIVERY_ADDRESS")}>
                                                    <LabelComponent text={"*"} style={commonStyles.textError} />
                                                </LabelComponent>
                                                <ViewComponent style={[commonStyles.actioniconbg, { marginTop: s(-8) }]}>
                                                    <MaterialIcons name="add" size={s(22)} color={NEW_COLOR.DARK_TEXT_WHITE} />
                                                </ViewComponent>
                                            </ViewComponent>

                                        </ViewComponent>)}
                                        {iHaveCard?.haveCard && (
                                            <ViewComponent style={[commonStyles.mt24]}>
                                                <PhysicalCardDetails
                                                    touched={touched}
                                                    errors={errors}
                                                    handleBlur={handleBlur}
                                                    values={values}
                                                    setFieldValue={setFieldValue}
                                                    handleChange={handleChange}
                                                    envelopeNoRequired={cardsFeeInfo?.envelopeNoRequired}
                                                    needPhotoForActiveCard={cardsFeeInfo?.needPhotoForActiveCard}
                                                    additionalDocforActiveCard={cardsFeeInfo?.additionaldocForActiveCard}
                                                />
                                            </ViewComponent>
                                        )}
                                    </ViewComponent>
                                }
                                {cardFeeDetailsLoading && (
                                    <Loadding contenthtml={cardFeeLoader} />
                                )}
                                {!cardFeeDetailsLoading && cardsFeeInfo && (
                                    <ViewComponent style={[]}>
                                        <ViewComponent style={[commonStyles.listbg]}>
                                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ISSUING_FEE"} />
                                            <CurrencyText value={cardsFeeInfo?.issuingFee ?? 0} currency={cardsFeeInfo?.cardCurrency} style={[commonStyles.listprimarytext]} />
                                        </ViewComponent>
                                       { cardsFeeInfo?.firstRecharge>0&& <ViewComponent style={[commonStyles.menuitemspace]} />}
                                       { cardsFeeInfo?.firstRecharge>0&&<ViewComponent style={[commonStyles.listbg]}>
                                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FIRST_RECHARGE_AMOUNT"} />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                <CurrencyText value={cardsFeeInfo?.firstRecharge ?? 0} 
                                                currency={cardsFeeInfo?.cardCurrency} 
                                                style={[commonStyles.listprimarytext]} />
                                            </ViewComponent>
                                        </ViewComponent>}
                                        {(iHaveCard?.haveCard || iHaveCard?.sendCard) && cardsFeeInfo.cardType !== 'Virtual' && <>
                                            <ViewComponent style={[commonStyles.menuitemspace]} />
                                            <ViewComponent style={[commonStyles.listbg]}>
                                                <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FRIGHT_FEE"} />
                                                <ViewComponent style={[]}>
                                                    <CurrencyText value={cardsFeeInfo?.freightFee ?? 0} currency={cardsFeeInfo?.paymentCurrency} style={[commonStyles.listprimarytext]} />
                                                </ViewComponent>
                                            </ViewComponent>
                                        </>}
                                        <ViewComponent style={[commonStyles.menuitemspace]} />
                                        <ViewComponent style={[commonStyles.listbg]}>
                                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ESTIMATED_PAYMENT_AMOUNT"} />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                <CurrencyText value={cardsFeeInfo?.estimatedPaymentAmount ?? 0} currency={cardsFeeInfo?.cardCurrency} style={[commonStyles.listprimarytext]} />
                                            </ViewComponent>
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.menuitemspace]} />
                                       { cardsFeeInfo?.paymentCurrency&&<ViewComponent style={[commonStyles.listbg]}>
                                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.PAYMENT_CURRENCY"} />
                                            <ParagraphComponent text={`${cardsFeeInfo?.paymentCurrency}`} style={[commonStyles.listprimarytext]} />
                                        </ViewComponent>}
                                    </ViewComponent>)}
                            </>)}
                            <ViewComponent style={[commonStyles.sectionGap]} />

                        </ViewComponent>
                    );
                }}
            </Formik>
        </KeyboardAwareScrollView>
    );
};

export default FeeStepForm;
