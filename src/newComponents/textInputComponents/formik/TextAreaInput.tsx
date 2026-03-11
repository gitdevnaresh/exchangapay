import React, { useState, useCallback, useMemo } from 'react';
import { TextInput, TextInputProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useField } from 'formik';
import { AntDesign } from '@expo/vector-icons';
import ViewComponent from '../../view/view';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import { s } from '../../theme/scale';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import LabelComponent from '../../textComponets/lableComponent/lable';

interface TextAreaInputProps extends TextInputProps {
    label?: string;
    name: string;
    custInput?: StyleProp<TextStyle>;
    isRequired?: boolean;
    placeholder?: string;
    maxLength?: number;
    onChangeText?: (text: string) => void;
    editable?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    customError?: string | null;
    isModel?: boolean;
    maxLines?: number;
    minHeight?: number;
    showCharCount?: boolean;
}

const FormikTextAreaInput: React.FC<TextAreaInputProps> = ({
    label,
    name,
    custInput,
    isRequired = false,
    placeholder,
    maxLength = 300,
    onChangeText,
    editable = true,
    containerStyle,
    customError = null,
    isModel = false,
    maxLines = 4, // Maximum number of lines before scrolling starts
    minHeight = s(100), // Starting height of the textarea
    showCharCount = false,
    ...props
}) => {
    const [field, meta, helpers] = useField(name);
    const [inputHeight, setInputHeight] = useState(minHeight);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors(isModel);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    
    const lineHeight = s(20);
    const maxHeight = useMemo(() => lineHeight * maxLines + s(24), [maxLines, lineHeight]);
    const charCount = field?.value?.length || 0;

    const handleInputChange = useCallback((text: string) => {
        helpers.setValue(text);
        onChangeText?.(text);
    }, [helpers, onChangeText]);

    const handleContentSizeChange = useCallback((e: any) => {
        const newHeight = e.nativeEvent.contentSize.height;
        setInputHeight(Math.min(Math.max(newHeight, minHeight), maxHeight));
    }, [minHeight, maxHeight]);

    return (
        <ViewComponent style={containerStyle}>
            {label && (
                <LabelComponent style={commonStyles.inputLabel}>
                    {t(label)}
                    {isRequired && <LabelComponent style={[commonStyles.textRed]}> *</LabelComponent>}
                </LabelComponent>
            )}
            <ViewComponent>
                <TextInput
                    style={[
                        commonStyles.textInput,
                        custInput,
                        {
                            height: inputHeight,
                            minHeight: minHeight,
                            maxHeight: maxHeight,
                            paddingTop: s(12),
                            paddingBottom: s(12),
                            textAlignVertical: 'top',
                            lineHeight: lineHeight,
                            backgroundColor: editable === false ? NEW_COLOR.INPUT_BORDER : NEW_COLOR.INPUTFIELD_BG
                        },
                        meta?.touched && meta?.error ? commonStyles.errorBorder : null
                    ]}
                    value={field?.value || ''}
                    onChangeText={handleInputChange}
                    onBlur={() => helpers?.setTouched(true)}
                    maxLength={maxLength}
                    // placeholder={placeholder}
                    // placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                    editable={editable}
                    multiline={true}
                    onContentSizeChange={handleContentSizeChange}
                    scrollEnabled={inputHeight >= maxHeight}
                    {...props}
                />
            </ViewComponent>
            {showCharCount && maxLength && (
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyend, commonStyles.mt4]}>
                    <ParagraphComponent 
                        style={[
                            commonStyles.fs12, 
                            { color: charCount >= maxLength ? NEW_COLOR.TEXT_RED : NEW_COLOR.TEXT_GREY }
                        ]} 
                        text={`${charCount}/${maxLength}`} 
                    />
                </ViewComponent>
            )}
            {meta?.touched && (meta?.error || customError) ? (
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                    <AntDesign
                        name="closecircleo"
                        size={s(14)}
                        color={NEW_COLOR.TEXT_RED}
                        style={[commonStyles.mt6]}
                    />
                    <ParagraphComponent 
                        style={[commonStyles.fs14, commonStyles.mt4, commonStyles.textRed, commonStyles.fw400]} 
                        text={t((meta?.error ?? customError) ?? '')} 
                    />
                </ViewComponent>
            ) : null}
        </ViewComponent>
    );
};

export default FormikTextAreaInput;
