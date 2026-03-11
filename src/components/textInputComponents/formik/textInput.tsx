import React, { useState, useMemo } from 'react';
import { TextInput, TouchableOpacity, TextInputProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useField } from 'formik';
import Feather from 'react-native-vector-icons/Feather';
import ViewComponent from '../../view/view';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import { useLngTranslation } from '../../../hooks/languagesHook/useLngTranslation';
import { s } from '../../../constants/styels/scale';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import LabelComponent from '../../textComponets/lableComponent/lable';
import { getThemedCommonStyles } from '../../CommonStyles';

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
}

const EMOJI_REGEX =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{1F004}-\u{1F0CF}\u{2B06}\u{2194}\u{1F201}-\u{1F251}]/gu;

const ICON_TOUCH_PAD = s(36); // reserved width for eye icon area

const FormikTextInput: React.FC<CommonTextInputProps> = ({
    label,
    customStyle,
    name,
    custInput,
    isRequired = false,
    placeholder,
    secureTextEntry,
    maxLength = 32, // default to 32
    onChangeText,
    editable = true,
    numericOnly = false,
    emojisAllowed = false,
    keyboardType = 'default',
    containerStyle,
    customError = null,
    ...props
}) => {
    const [field, meta, helpers] = useField(name);
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const togglePasswordVisibility = () => setShowPassword(v => !v);

    const handleInputChange = (text: string) => {
        let processedText = text;
        if (numericOnly) processedText = processedText.replace(/\D/g, '');
        if (!emojisAllowed) processedText = processedText.replace(EMOJI_REGEX, '');
        helpers.setValue(processedText);
        onChangeText?.(processedText);
    };
    const handleFocus = () => {
        setIsFocused(true);
    };
    const handluBlur = () => {
        setIsFocused(false);
        helpers?.setTouched(true)
    };
    return (
        <ViewComponent style={containerStyle}>
            {label && (
                <LabelComponent style={commonStyles.inputLabel}>
                    {t(label)}
                    {isRequired && <LabelComponent style={[commonStyles.textRed]}> *</LabelComponent>}
                </LabelComponent>
            )}

            <ViewComponent style={[commonStyles.pr2, customStyle]}>
                <ViewComponent style={[commonStyles.relative]}>
                    <TextInput
                        style={[
                            commonStyles.textInput,
                            commonStyles.phonecodetextinput, { width: "100%" },
                            !editable && commonStyles.disabledContainerStyle,
                            !editable && commonStyles.disabledTextStyle, // Apply disabled text color

                            // reserve horizontal space so text doesn't go under the icon
                            secureTextEntry && { paddingRight: ICON_TOUCH_PAD + s(14) },
                            custInput,
                            meta?.touched && meta?.error ? commonStyles.errorBorder : null,
                            isFocused && !meta?.error ? commonStyles.hoverborder : null,
                        ]}
                        value={field?.value ?? ''}               // ensure string
                        onChangeText={handleInputChange}
                        onBlur={handluBlur}
                        onFocus={handleFocus}
                        maxLength={maxLength}
                        placeholder={t(placeholder ?? '')}
                        placeholderTextColor={NEW_COLOR.placeholderTextColor}
                        secureTextEntry={secureTextEntry && !showPassword}
                        editable={editable}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType={keyboardType}
                        scrollEnabled
                        textContentType={secureTextEntry ? 'password' : 'none'}
                        {...props}
                    />

                    {secureTextEntry && (
                        <TouchableOpacity
                            onPress={togglePasswordVisibility}
                            activeOpacity={0.7}
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel={showPassword ? t('Hide password') : t('Show password')}
                            // absolute positioned but vertically centered and with a fixed touch area
                            style={{
                                position: 'absolute',
                                right: s(6),
                                top: 0,
                                bottom: 0,
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: ICON_TOUCH_PAD,
                            }}
                        >
                            <Feather
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={s(18)}
                                color={NEW_COLOR.TEXT_WHITE}
                            />
                        </TouchableOpacity>
                    )}
                </ViewComponent>
            </ViewComponent>
            {meta?.touched && (meta?.error || customError) ? (
                <ParagraphComponent style={[commonStyles.inputrequirederrormessage, commonStyles.inputrequirederrormessageformickTextinput]} text={t((meta?.error ?? customError) ?? '')} />
            ) : null}
        </ViewComponent>
    );
};

export default FormikTextInput;

