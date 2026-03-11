import React, { useMemo, useRef } from 'react';
import { TextInput, TextInputProps, StyleProp, ViewStyle, TextStyle, Keyboard, ActivityIndicator } from 'react-native';
import { useFormikContext } from 'formik';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import ViewComponent from '../../view/view';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import { s } from '../../../constants/theme/scale';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import LabelComponent from '../../textComponets/lableComponent/lable';
import CommonTouchableOpacity from '../../touchableComponents/touchableOpacity';
import PopupOrSheet from '../../models/PopupOrSheet';
import { Picker } from '../../pickerComponents/picker/Picker';
import ImageUri from '../../imageComponents/image';

interface CurrencyOption {
    id: string;
    code: string;
    name: string;
    symbol?: string;
    logo?: any;
    image?: any;
    maxAmount?: number;
    decimals?: number;
    minAmount?: number;
    availableBalance?: number;
}

interface AmountInputWithCurrencyProps extends Omit<TextInputProps, 'onChange'> {
    label?: string;
    customStyle?: StyleProp<ViewStyle>;
    name: string;
    currencyFieldName: string;
    custInput?: StyleProp<TextStyle>;
    isRequired?: boolean;
    placeholder?: string;
    containerStyle?: StyleProp<ViewStyle>;
    customError?: string | null;
    isModel?: boolean;
    discription?: string;
    currencyOptions: CurrencyOption[];
    onCurrencyChange?: (currency: CurrencyOption) => void;
    onAmountChange?: (amount: string, currency: CurrencyOption) => void;
    editable?: boolean;
    disabled?: boolean;
    showCurrencyLogo?: boolean;
    sheetHeight?: number;
    modalTitle?: string;
    searchPlaceholder?: string;
    linkedFieldName?: string;
    customBind?: [string];
    isConverting?: boolean;
    exchangeRate?: number;
}

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{1F004}-\u{1F0CF}\u{2B06}\u{2194}\u{1F201}-\u{1F251}]/gu;

const formatIndianNumber = (numStr: string): string => {
    if (!numStr) return "";
    const [intPartRaw, decimalPart] = numStr.split(".");
    const intPart = intPartRaw.replace(/^0+(?!$)/, "");

    let lastThree = intPart.slice(-3);
    let other = intPart.slice(0, -3);

    if (other !== "") {
        lastThree = "," + lastThree;
        other = other.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    }

    let formatted = other + lastThree;

    if (decimalPart !== undefined) {
        const decimals = decimalPart.slice(0, 2);
        formatted += "." + decimals;
    }

    return formatted;
};

const removeCommasFromNumber = (value: string): string => {
    return value.replace(/,/g, '');
};

const validateAmount = (
    amount: string,
    currency: CurrencyOption | undefined
): string | null => {
    if (!amount) return null;

    const numAmount = parseFloat(removeCommasFromNumber(amount));

    if (isNaN(numAmount)) return "Invalid amount";

    if (currency?.minAmount && numAmount < currency.minAmount) {
        return `Minimum amount is ${currency.minAmount} ${currency.code}`;
    }

    if (currency?.maxAmount && numAmount > currency.maxAmount) {
        return `Maximum amount is ${currency.maxAmount} ${currency.code}`;
    }

    if (currency?.availableBalance !== undefined && numAmount > currency.availableBalance) {
        return `Insufficient balance: ${currency.availableBalance} ${currency.code}`;
    }

    const [, decimalPart] = removeCommasFromNumber(amount).split(".");
    const allowedDecimals = currency?.decimals ?? 2;
    if (decimalPart && decimalPart.length > allowedDecimals) {
        return `Maximum ${allowedDecimals} decimal places allowed`;
    }

    return null;
};

const AmountInputWithCurrency: React.FC<AmountInputWithCurrencyProps> = ({
    label,
    discription,
    customStyle,
    name,
    currencyFieldName,
    custInput,
    isRequired = false,
    placeholder,
    containerStyle,
    customError = null,
    isModel = false,
    currencyOptions = [],
    onCurrencyChange,
    onAmountChange,
    editable = true,
    disabled = false,
    showCurrencyLogo = true,
    sheetHeight = 400,
    modalTitle,
    searchPlaceholder,
    linkedFieldName,
    customBind = ['code'],
    isConverting = false,
    exchangeRate,
    ...props
}) => {
    const { setFieldValue, handleBlur, touched, errors, values } = useFormikContext<any>();
    const rbSheetRef = useRef<any>(null);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors(isModel);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    // Set initial currency code if not selected
    React.useEffect(() => {
        if (!values[currencyFieldName] && currencyOptions.length > 0) {
            setFieldValue(currencyFieldName, currencyOptions[0].code);
        }
    }, [currencyOptions.length]);

    const selectedCurrency = useMemo(() => {
        return currencyOptions?.find(opt => opt.code === values[currencyFieldName]);
    }, [values[currencyFieldName], currencyOptions]);

    const displayCode = useMemo(() => {
        if (selectedCurrency) return selectedCurrency[customBind[0]] || '';
        return currencyOptions?.[0]?.[customBind[0]] || '';
    }, [selectedCurrency, customBind, currencyOptions]);

    const handleAmountChange = (text: string) => {
        if (EMOJI_REGEX.test(text)) return;

        const numericOnly = text.replace(/[^0-9.]/g, "");
        
        if (!numericOnly || numericOnly === '') {
            setFieldValue(name, '');
            if (linkedFieldName) {
                setFieldValue(linkedFieldName, '');
            }
            return;
        }

        const cleaned = removeCommasFromNumber(numericOnly);

        if ((cleaned.match(/\./g) || []).length > 1) return;

        const [intPart, decimalPart] = cleaned.split(".");

        const allowedDecimals = selectedCurrency?.decimals ?? 2;
        if (decimalPart !== undefined && decimalPart.length > allowedDecimals) return;

        setFieldValue(name, cleaned);

        if (linkedFieldName && exchangeRate && exchangeRate > 0) {
            const baseAmount = parseFloat(cleaned);
            if (!isNaN(baseAmount)) {
                const convertedValue = (baseAmount * exchangeRate).toFixed(2).replace(/\.?0+$/, '');
                setFieldValue(linkedFieldName, convertedValue);
            }
        }

        if (onAmountChange) {
            onAmountChange(cleaned, selectedCurrency || { id: '', code: '', name: '' });
        }
    };

    const handleCurrencySelect = (item: any) => {
        const currency = item as CurrencyOption;
        setFieldValue(currencyFieldName, currency.code);
        requestAnimationFrame(() => {
            rbSheetRef.current?.close();
        });
        
        if (onCurrencyChange) {
            onCurrencyChange(currency);
        }
    };

    const handleOpenSheet = () => {
        Keyboard.dismiss();
        requestAnimationFrame(() => {
            rbSheetRef.current?.open();
        });
    };

    const amountTouched = touched[name];
    const currencyTouched = touched[currencyFieldName];
    const amountError = amountTouched ? (validateAmount(values[name], selectedCurrency) || errors[name] || customError) : null;
    const currencyError = currencyTouched && errors[currencyFieldName] ? String(errors[currencyFieldName]) : null;
    const displayError = amountError || currencyError;
    const isInputDisabled = disabled || !editable;

    return (
        <ViewComponent style={containerStyle}>
            <ViewComponent
                style={[
                 commonStyles.amountInputContainer,
                    // amountTouched && amountError && { borderWidth: 1, borderColor: NEW_COLOR.TEXT_RED },
                ]}
            >
                <ViewComponent style={{ flex: 1, minWidth: 0 }}>
                    {label && (
                        <LabelComponent
                            style={[
                                commonStyles.fs12,
                                commonStyles.fw400,
                                commonStyles.textGrey,
                                commonStyles.mb4
                            ]}
                            text={t(label)}
                        />
                    )}
                    {isConverting ? (
                        <ViewComponent style={[{ width: '60%', height: 16, backgroundColor: NEW_COLOR.BORDER_LIGHT_GREEN, borderRadius: s(4), opacity: 0.3 }]} />
                    ) : (
                        <TextInput
                            style={[
                                commonStyles.fs14,
                                commonStyles.fw400,
                                commonStyles.textWhite,
                                {
                                    padding: 0,
                                    minWidth: 0,
                                },
                                custInput,
                            ]}
                            value={values[name] ? formatIndianNumber(values[name]) : ''}
                            onChangeText={handleAmountChange}
                            onBlur={handleBlur(name)}
                            keyboardType="number-pad"
                            editable={!isInputDisabled}
                            {...props}
                        />
                    )}
                </ViewComponent>

                <CommonTouchableOpacity
                    disabled={isInputDisabled}
                    onPress={isInputDisabled ? undefined : handleOpenSheet}
                    style={[commonStyles.dflex,commonStyles.alignCenter,commonStyles.gap5, isInputDisabled && { opacity: 0.5 }]}
                >
                    {showCurrencyLogo && (selectedCurrency?.image || currencyOptions?.[0]?.image) && (
                        <ImageUri 
                            uri={selectedCurrency?.image || currencyOptions?.[0]?.image} 
                            width={s(24)} 
                            height={s(24)} 
                            style={{ borderRadius: 100 / 2 }} 
                        />
                    )}
                    <ParagraphComponent
                        style={[commonStyles.fs14,commonStyles.fw400,commonStyles.textWhite]}
                        text={displayCode}
                    />
                    <Ionicons name="chevron-down" size={s(18)} color={NEW_COLOR.ICON_GREY} />
                </CommonTouchableOpacity>
            </ViewComponent>

            {displayError && (
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                    <AntDesign
                        name="closecircleo"
                        size={s(14)}
                        color={NEW_COLOR.TEXT_RED}
                        style={[commonStyles.mt6]}
                    />
                    <ParagraphComponent
                        style={[commonStyles.fs14, commonStyles.mt4, commonStyles.textRed, commonStyles.fw400]}
                        text={String(displayError)}
                    />
                </ViewComponent>
            )}

            <PopupOrSheet
                ref={rbSheetRef}
                height={sheetHeight}
                title={modalTitle ?? 'Select Currency'}
                onClose={() => {}}
            >
                <ViewComponent style={{ flex: 1 }}>
                    <Picker
                        data={currencyOptions}
                        changeModalVisible={() => rbSheetRef.current?.close()}
                        setData={handleCurrencySelect}
                        selectedValue={values[currencyFieldName]}
                        customBind={customBind}
                        showCountryImages={showCurrencyLogo}
                        searchPlaceholder={searchPlaceholder || "Search currency"}
                    />
                </ViewComponent>
            </PopupOrSheet>
        </ViewComponent>
    );
};

export default AmountInputWithCurrency;
