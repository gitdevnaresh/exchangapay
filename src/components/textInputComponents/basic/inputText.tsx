import React from "react";
import { StyleSheet, TextInput, TextInputProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import ViewComponent from '../../view/view';
import { useLngTranslation } from '../../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../CommonStyles';
import LabelComponent from '../../textComponets/lableComponent/lable';


interface CommonInputTextProps extends TextInputProps {
    label?: string;
    value: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'ascii-capable' | 'numbers-and-punctuation' | 'url' | 'decimal-pad' | 'twitter' | 'web-search' | 'visible-password';
    secureTextEntry?: boolean;
    editable?: boolean;
    style?: StyleProp<ViewStyle>;
    isRequired?: boolean;
    numberOfLines?: number;
    inputStyle?: StyleProp<TextStyle>;
    multiline?: boolean;
}

const CommonInputText: React.FC<CommonInputTextProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    secureTextEntry = false,
    editable = true,
    style = {},
    isRequired = false,
    numberOfLines,
    inputStyle,
    multiline = false,
    ...props
}) => {
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return (
        <ViewComponent style={[styles.container, style]}>
            {label && (
                <LabelComponent style={[commonStyles.mb4, commonStyles.inputLabel]}>
                    {t(label)}
                    {isRequired && <LabelComponent style={[commonStyles.textRed]}> *</LabelComponent>}
                </LabelComponent>
            )}
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder ? t(placeholder) : undefined}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                editable={editable}
                numberOfLines={numberOfLines}
                style={[commonStyles.textInput, inputStyle, multiline && { textAlignVertical: 'top' }]}
                multiline={multiline}
                placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
                {...props}
            />
        </ViewComponent>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
});

export default CommonInputText;

