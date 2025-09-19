import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { NEW_COLOR } from '../constants/theme/variables';
import { commonStyles } from './CommonStyles';

interface TextInputFieldProps {
  label?: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: object;
  numberOfLines?: number;
  editable?: boolean;
  keyboardType?: string;
  inputStyle?: any;
}

const TextInputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  style,
  numberOfLines,
  inputStyle,
  editable,
  keyboardType = 'default',
}: TextInputFieldProps) => {
  const inputProps = {
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    numberOfLines,
    style: [styles.input, numberOfLines && numberOfLines > 1 && styles.textArea, style],
    editable: editable !== undefined ? editable : true,
    keyboardType,
  };

  return (
    <View style={[styles.inputContainer, style]}>
      <TextInput {...inputProps} multiline={typeof numberOfLines === "number" && numberOfLines > 1} placeholderStyle={{ fontSize: 24 }} placeholderTextColor={NEW_COLOR.PLACEHOLDER_STYLE} style={[commonStyles.fs14, commonStyles.fw500, styles.inputHeight, commonStyles.textBlack, inputStyle]} placeholder={placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderRadius: 10,
    borderColor: NEW_COLOR.SEARCH_BORDER,
    borderWidth: 1,
    backgroundColor: 'transparent',
    height: 54,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  input: {
    height: 64,
  },
  fs14: { fontSize: 14 },
  fw500: { fontWeight: '500' },
  inputHeight: { height: 54, paddingHorizontal: 8 }
});

export default TextInputField;