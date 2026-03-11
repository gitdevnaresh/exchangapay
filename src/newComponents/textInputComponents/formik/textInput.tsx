import React, { useState } from 'react';
import { TextInput, TouchableOpacity, TextInputProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useField } from 'formik';
import { AntDesign, Feather } from '@expo/vector-icons';
import ViewComponent from '../../view/view';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import { s } from '../../theme/scale';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import LabelComponent from '../../textComponets/lableComponent/lable';

interface CommonTextInputProps extends TextInputProps {
    label?: string;
    customStyle?: StyleProp<ViewStyle>;
    name: string;
    custInput?: StyleProp<TextStyle>;
    isRequired?: boolean;
    placeholder?: string;
    secureTextEntry?: boolean;
    maxLength?: number;
    onChangeText?: (text: string) => void;
    editable?: boolean;
    numericOnly?: boolean;
    emojisAllowed?: boolean;
    keyboardType?: TextInputProps['keyboardType'];
    containerStyle?: StyleProp<ViewStyle>;
    customError?: string | null;
    rightIcon?: any;
    autoCapitalize?: any;
    isModel?: boolean;
    isNumber?: boolean;
    isDecimal?: boolean;
    discription?: string;
    maxIntegerLength?: number;
}
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{1F004}-\u{1F0CF}\u{2B06}\u{2194}\u{1F201}-\u{1F251}]/gu;

// Utility functions for Indian number formatting
const formatIndianNumber = (numStr: string): string => {
    if (!numStr) return "";
    const [intPartRaw, decimalPart] = numStr.split(".");
    const intPart = intPartRaw.replace(/^0+(?!$)/, ""); // remove leading 0s

    let lastThree = intPart.slice(-3);
    let other = intPart.slice(0, -3);

    if (other !== "") {
        lastThree = "," + lastThree;
        other = other.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    }

    let formatted = other + lastThree;

    if (decimalPart !== undefined) {
        formatted += "." + decimalPart.slice(0, 2); // only 2 decimals
    }

    return formatted;
};

const removeCommasFromNumber = (value: string): string => {
    return value.replace(/,/g, '');
};

const FormikTextInput: React.FC<CommonTextInputProps> = ({
    label,
    discription,
    customStyle,
    name,
    custInput,
    isRequired = false,
    placeholder,
    secureTextEntry,
    maxLength,
    onChangeText,
    editable,
    numericOnly = false,
    emojisAllowed = false,
    keyboardType = 'default',
    containerStyle,
    customError = null,
    rightIcon,
    autoCapitalize = "none",
    isModel = false,
    isNumber = false,
    isDecimal = false,
    maxIntegerLength,
    ...props
}) => {
    const [field, meta, helpers] = useField(name);
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useLngTranslation();
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const NEW_COLOR = useThemeColors(isModel);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const handleInputChange = (text: string) => {
        let processedText = text;
        
        if (isNumber) {
            // Only allow numbers and decimal point
            const numericOnly = text.replace(/[^0-9.]/g, "");
            
            // Strip commas for processing
            const cleaned = removeCommasFromNumber(numericOnly);
            
            // Split into integer and decimal parts
            const [intPart, decimalPart] = cleaned.split(".");
            
            // Allow only one decimal point
            if ((cleaned.match(/\./g) || []).length > 1) return;
            
            // Restrict digits before decimal only if maxIntegerLength is provided
            if (maxIntegerLength && intPart.length > maxIntegerLength) {
                // Allow if user just typed "." after max digits
                if (decimalPart === undefined && text.endsWith(".")) {
                    const formatted = formatIndianNumber(intPart) + ".";
                    helpers.setValue(intPart + ".");
                    if (onChangeText) {
                        onChangeText(intPart + ".");
                    }
                }
                return;
            }
            
            // Restrict decimals to 2 places
            if (decimalPart !== undefined && decimalPart.length > 2) return;
            
            // Store raw value without commas
            const rawValue = cleaned;
            
            // Set raw value to formik
            helpers.setValue(rawValue);
            
            if (onChangeText) {
                onChangeText(rawValue);
            }
            return;
        }
        
        if (numericOnly) {
            processedText = processedText.replace(/\D/g, '');
        }
        if (!emojisAllowed) {
            processedText = processedText.replace(EMOJI_REGEX, '');
        }
        helpers.setValue(processedText);
        if (onChangeText) {
            onChangeText(processedText);
        }
    };

    return (
        <ViewComponent style={containerStyle}>
            {label && (
                <>
                    <LabelComponent style={[commonStyles.inputLabel, discription && commonStyles.mb0]}>
                        {t(label)}
                        {isRequired && <LabelComponent style={[commonStyles.textRed]}> *</LabelComponent>}
                    </LabelComponent>
                    {discription && (
                        <LabelComponent style={[commonStyles.inputLabel]}>
                            {t(discription)}
                        </LabelComponent>
                    )}
                </>
            )}
            <ViewComponent style={customStyle}>
                <ViewComponent style={commonStyles.relative}>
                    <TextInput
                        style={[
                            commonStyles.textInput,
                            custInput,
                            (secureTextEntry || rightIcon) && { paddingRight: s(45) },
                            meta?.touched && meta?.error && commonStyles.errorBorder,
                            { backgroundColor: editable === false ? NEW_COLOR.INPUT_BORDER : NEW_COLOR.INPUTFIELD_BG }
                        ]}
                        value={isNumber && field?.value ? formatIndianNumber(field?.value) : field?.value}
                        onChangeText={handleInputChange}
                        onBlur={() => helpers?.setTouched(true)}
                        maxLength={maxLength}
                        // placeholder={t(placeholder ?? '')}
                        // placeholderTextColor={isModel ? NEW_COLOR.PLACEHOLDER_TEXTCOLOR : NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                        secureTextEntry={secureTextEntry && !showPassword}
                        editable={editable}
                        autoCapitalize={autoCapitalize}
                        keyboardType={keyboardType}
                        {...props}
                    />
                    {secureTextEntry && (
                        <TouchableOpacity onPress={togglePasswordVisibility} style={{ top: 8, position: 'absolute', right: 10 }}>
                            <Feather
                                name={showPassword ? "eye-off" : "eye"}
                                size={s(20)}
                                color={NEW_COLOR.TEXT_link}
                                style={[commonStyles.p6]}
                            />
                        </TouchableOpacity>
                    )}
                    {rightIcon && (
                        <ViewComponent style={{ position: 'absolute', right: s(16), top: s(14) }}>
                            {rightIcon}
                        </ViewComponent>
                    )}
                </ViewComponent>
            </ViewComponent>
            {meta?.touched && (meta?.error || customError) ? (
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                    <AntDesign
                        name="closecircleo"
                        size={s(14)}
                        color={NEW_COLOR.TEXT_RED}
                        style={[commonStyles.mt6]}
                    />
                    <ParagraphComponent style={[commonStyles.fs14, commonStyles.mt4, commonStyles.textRed, commonStyles.fw400]} text={t((meta?.error ?? customError) ?? '')} />
                </ViewComponent>
            ) : null}
        </ViewComponent>
    );
};

export default FormikTextInput;
