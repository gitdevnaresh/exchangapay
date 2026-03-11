import { useThemeColors } from "../../../hooks/useThemeColors";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../newComponents/view/view";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import { useNavigation } from "@react-navigation/native";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import Ionicons from '@expo/vector-icons/Ionicons';
import { s } from "../../../constants/theme/scale";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState, useEffect } from "react";
import { Formik, Field } from "formik";
import CurrencyDropdown, { CurrencyDropdownRef, Currency } from "../../commonScreens/CurrencyDropDown/CurrencyDropdown";
import { WithDrawServices } from "../../../apiServices/withdrawApis/withdrawServices";
import AmountInput from "../../../newComponents/numericInputs/amountInput";
import FormikTextInput from "../../../newComponents/textInputComponents/formik/textInput";
import CustomPickerModal from "../../../newComponents/pickerComponents/formik/customPicker";
import ButtonComponent from "../../../newComponents/buttons/button";
import { isErrorDispaly } from "../../../utils/helpers";
import SendServices from "../../../services/send";
import ConfirmTransferContent from "./components/ConfirmTransferContent";
import PopupOrSheet from "../../../newComponents/models/PopupOrSheet";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import { Keyboard } from "react-native";
import SwokipayDashboardLoader from "../../../newComponents/swokipayloader";
import * as Yup from "yup";
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import useEncryptDecrypt from "../../../hooks/encDecHook";
import ImageUri from "../../../newComponents/imageComponents/image";
import { CurrencyText } from "../../../newComponents/textComponets/currencyText/currencyText";

const TransferAmount = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const currencySheetRef = useRef<CurrencyDropdownRef>(null);
    const confirmTransferRef = useRef<any>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [amount, setAmount] = useState<string>(
        props?.route?.params?.qrData?.Amount !== undefined && props?.route?.params?.qrData?.Amount !== null
            ? String(props.route.params.qrData.Amount)
            : ""
    ); const [purposeOptions, setPurposeOptions] = useState([]);
    const [relationshipOptions, setRelationshipOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [feeDetails, setFeeDetails] = useState<any>(null);
    const [formValues, setFormValues] = useState<any>(null);
    const [loadingCurrencies, setLoadingCurrencies] = useState(false);
    const [error, setError] = useState<string>("");
    const { t } = useLngTranslation();
    const { decryptAES } = useEncryptDecrypt();

    const initialValues = {
        note: '',
        purposeOfTransfer: '',
        relationshipWithRecipient: ''
    };

    useEffect(() => {
        fetchCurrencies();
        fetchPurposeOfTransferLu();
        fetchRelationshipWithRecipientLu();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingCurrencies(true);
            await Promise.all([fetchCurrencies(), fetchPurposeOfTransferLu(), fetchRelationshipWithRecipientLu()]);
            setLoadingCurrencies(false);
        };
        fetchData();
    }, []);
    useHardwareBackHandler(() => {
        handleBackpress();
        return true;
    });


    const noteSchema = Yup.object().shape({
        note: Yup.string()
            .max(50, "GLOBAL_CONSTANTS.MAXIMUM_50_CHARACTERS_ALLOWED")

    });
    const fetchCurrencies = async () => {
        setError("");
        try {
            const response: any = await WithDrawServices.getWalletCurrencies();
            if (response.status === 200) {
                setCurrencies(response.data);
                let initialCurrency = null;
                // If QR provided a string currency code, find it from response
                const qrCurrency =
                    props?.route?.params?.qrData?.Currency || props?.route?.params?.Currency;
                if (qrCurrency) {
                    initialCurrency = response.data.find(
                        (c: any) => c.walletCode == qrCurrency
                    );
                }
                setSelectedCurrency(initialCurrency || response.data[0]);
            }
            else {
                setError(isErrorDispaly(response));
                setCurrencies([]);
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const fetchPurposeOfTransferLu = async () => {
        setError("");
        try {
            const response: any = await SendServices.getPurposeOfTransferLu();
            if (response.status === 200) {
                setPurposeOptions(response.data.PurposeOfTransfer);
            }
            else {
                setError(isErrorDispaly(response));
                setPurposeOptions([]);
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const fetchRelationshipWithRecipientLu = async () => {
        setError("");
        try {
            const response: any = await SendServices.getRelationShipLu();
            if (response.status === 200) {
                setRelationshipOptions(response.data.RelationshipWithRecipient);
            }
            else {
                setError(isErrorDispaly(response));
                setRelationshipOptions([]);
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    // Helper function to remove commas and parse amount
    const parseAmountValue = (amountStr: string): number => {
        return parseFloat(amountStr.replace(/,/g, '')) || 0;
    };
    const handleSummary = async (formValues: any) => {
        setError("");
        if (!selectedCurrency) {
            setError(t("GLOBAL_CONSTANTS.PLEASE_SELECT_CURRENCY"));
            return;
        }
        const numericAmount = parseAmountValue(amount);
        if (selectedCurrency && typeof selectedCurrency.avilable === 'number' && selectedCurrency.avilable < numericAmount) {
            setError(t("GLOBAL_CONSTANTS.INSUFFICIENT_BALANCE"));
            Keyboard.dismiss();
            return;
        }
        if (!amount || numericAmount <= 0) {
            setError(t("GLOBAL_CONSTANTS.PLEASE_ENTER_A_VALID_AMOUNT"));
            Keyboard.dismiss();
            return;
        }
        setFormValues(formValues);
        setLoading(true);
        try {
            const response: any = await SendServices.sendFee(selectedCurrency?.walletCode);
            if (response.status === 200) {
                setFeeDetails(response?.data);
                setLoading(false);
                confirmTransferRef.current?.open();
            } else {
                setLoading(false);
                setError(isErrorDispaly(response));
                setFeeDetails([]);
            }
        } catch (error) {
            setLoading(false);
            setError(isErrorDispaly(error));
        }
        finally {
            Keyboard.dismiss();
            setLoading(false);
        }
    }
    const handleBackpress = () => {
        navigation.goBack();
    }
    const handleOpenCurrencySheet = () => {
        Keyboard.dismiss();
        setTimeout(() => {
            currencySheetRef.current?.open();
        }, 100);
    }
    const handleAmountChange = (value: any) => {
        setAmount(value);
        setError("");
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                {loadingCurrencies && <SwokipayDashboardLoader />}
                {!loadingCurrencies && <Container>
                    <PageHeader title={"GLOBAL_CONSTANTS.TRANSFER_AMOUNT"} onBackPress={handleBackpress} />
                    {error && <ErrorComponent message={error} screen={true} />}
                    <ViewComponent style={[commonStyles.mt16, commonStyles.sectionGap]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.RECIPIENT"} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite, commonStyles.mb8]} />
                        <ViewComponent style={[commonStyles.sendBg]}>
                            <Ionicons name="person-outline" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                            <ViewComponent>
                                <ParagraphComponent text={props?.route?.params?.RecipientName || props?.route?.params?.qrData?.Value} style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textWhite, commonStyles.mb4]} />
                                <ParagraphComponent text={decryptAES(props?.route?.params?.Details?.fullName) || decryptAES(props?.route?.params?.fullName) || props?.route?.params?.qrData?.FullName} style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textWhite]} />
                            </ViewComponent>
                        </ViewComponent>
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.mxAuto, commonStyles.networkDropdown, commonStyles.mt16]}>
                        <CommonTouchableOpacity
                            style={[commonStyles.dflex, commonStyles.gap8, commonStyles.py8, commonStyles.alignCenter]}
                            activeOpacity={0.8}
                            onPress={handleOpenCurrencySheet}
                            disabled={(props?.route?.params?.qrData?.Amount > 0) ? true : false}
                        >
                            <ParagraphComponent
                                style={[commonStyles.fs12, commonStyles.fw400, commonStyles.list_text]}
                                text={selectedCurrency?.walletCode || "Select Currency"}
                            />
                            <MaterialIcons name="keyboard-arrow-down" size={s(20)} color={NEW_COLOR.LIST_TEXT} />
                        </CommonTouchableOpacity>
                    </ViewComponent>

                    <ViewComponent style={{ alignItems: "center", marginBottom: s(32) }}>
                        <AmountInput
                            value={amount}
                            onChangeText={handleAmountChange}
                            inputStyle={[commonStyles.fw700, {
                                fontSize: s(60),
                                color:
                                    props?.route?.params?.qrData?.Amount > 0
                                        ? commonStyles.textGrey.color
                                        : commonStyles.textWhite.color,

                            }]}
                            editable={props?.route?.params?.qrData?.Amount > 0 ? false : true}

                        />
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.mb16]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.list]}>
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
                                            currency={selectedCurrency?.walletCode}
                                            symboles={true}
                                            style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>
                    </ViewComponent>

                    <Formik
                        initialValues={initialValues}
                        onSubmit={(values) => handleSummary(values)}
                        validateOnChange={true}
                        validationSchema={noteSchema}
                        validateOnBlur={true}
                    >
                        {({ handleSubmit, touched, errors }) => (
                            <>
                                <FormikTextInput
                                    name="note"
                                    label="GLOBAL_CONSTANTS.ADD_A_NOTE"
                                    placeholder="GLOBAL_CONSTANTS.ENTER_A_NOTE"
                                    numberOfLines={3}
                                    maxLength={50}
                                    onChangeText={() => setError("")}
                                />
                                <ViewComponent style={[commonStyles.mb16]} />

                                <Field
                                    name="purposeOfTransfer"
                                    component={CustomPickerModal}
                                    data={purposeOptions || []}
                                    label="GLOBAL_CONSTANTS.PURPOSE_OF_TRANSFER"
                                    placeholder="GLOBAL_CONSTANTS.SELECT_PURPOSE_OF_TRANSFER"
                                    modalTitle="GLOBAL_CONSTANTS.SELECT_PURPOSE_OF_TRANSFER"
                                    inputCustomStyle={{ borderRadius: s(10) }}
                                    error={touched.purposeOfTransfer && errors.purposeOfTransfer ? errors.purposeOfTransfer : undefined}
                                    searchPlaceholder="GLOBAL_CONSTANTS.SEARCH_PURPOSE_OF_TRANSFER"
                                    sheetHeight={s(500)}
                                    onChange={() => setError("")}
                                />
                                <ViewComponent style={[commonStyles.formItemSpace]} />

                                <Field
                                    name="relationshipWithRecipient"
                                    component={CustomPickerModal}
                                    data={relationshipOptions || []}
                                    label="GLOBAL_CONSTANTS.RELATIONSHIP_WITH_RECIPIENT"
                                    placeholder="GLOBAL_CONSTANTS.SELECT_RELATIONSHIP_WITH_RECIPIENT"
                                    modalTitle="GLOBAL_CONSTANTS.SELECT_RELATIONSHIP_WITH_RECIPIENT"
                                    inputCustomStyle={{ borderRadius: s(10) }}
                                    error={touched.relationshipWithRecipient && errors.relationshipWithRecipient ? errors.relationshipWithRecipient : undefined}
                                    sheetHeight={s(500)}
                                    searchPlaceholder="GLOBAL_CONSTANTS.SEARCH_RELATIONSHIP_WITH_RECIPIENT"
                                    onChange={() => setError("")}
                                />
                                <ViewComponent style={[commonStyles.sectionGap]} />
                                <ViewComponent style={[commonStyles.flex1]} />
                                <ButtonComponent
                                    title="GLOBAL_CONSTANTS.CONTINUE"
                                    onPress={handleSubmit}
                                    loading={loading}
                                    disable={loading || !selectedCurrency || !amount}
                                />
                                <ViewComponent style={[commonStyles.sectionGap]} />
                            </>
                        )}
                    </Formik>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </Container>}

                <CurrencyDropdown
                    ref={currencySheetRef}
                    title="GLOBAL_CONSTANTS.SELECT_CURRENCY"
                    currencies={currencies}
                    onCurrencySelect={(currency) => {
                        setSelectedCurrency(currency);
                        setAmount("");
                        setError("");
                    }}
                    selectedCurrency={selectedCurrency || undefined}
                />

                <PopupOrSheet
                    showCloseIcon={false}
                    ref={confirmTransferRef}
                    height={s(550)}
                    showCloseIconAndTittle={false}
                >
                    <ConfirmTransferContent
                        amount={parseAmountValue(amount).toString()}
                        currency={selectedCurrency?.walletCode || ''}
                        recipient={props?.route?.params.Details || props?.route?.params?.qrData?.ReceiverId || ''}
                        note={formValues?.note}
                        purposeOfTransfer={formValues?.purposeOfTransfer}
                        relationshipWithRecipient={formValues?.relationshipWithRecipient}
                        feeDetails={feeDetails}
                        actionType={props?.route?.params?.actionType}
                        recipientName={props?.route?.params?.RecipientName || props?.route?.params?.qrData?.Value || ''}
                        onClose={() => confirmTransferRef.current?.close()}
                        isFromRecentPayees={props?.route?.params?.isFromRecentPayees || false}
                        fullName={props?.route?.params?.fullName}
                        scanFullName={props?.route?.params?.qrData?.FullName}
                    />
                </PopupOrSheet>
            </KeyboardAwareScrollView>
        </ViewComponent>
    );
}


export default TransferAmount;