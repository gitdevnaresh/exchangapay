import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import ModalPicker from '../components/ModalPicker';
import LabelComponent from './Paragraph/label';
import ParagraphComponent from './Paragraph/Paragraph';
import { ms } from '../constants/theme/scale';
import { NEW_COLOR } from '../constants/theme/variables';
import { commonStyles } from './CommonStyles';


interface CustomPickerProps {
  field: any;
  form: any;
  onPress: () => void;
  placeholder: string;
  onChange(index: number | string): void;
  data: { name: string }[];
  error: string;
  touched: boolean;
  onBlur: (name: string) => void;
  label: string;
  labelStyle?: any;
  containerStyle?: any;
  modalTitle?: string;
}

const CustomDropDownTextPicker = ({
  field,
  form: { setFieldValue },
  placeholder,
  containerStyle,
  modalTitle,
  labelStyle,
  onChange,
  data = [],
  error,
  touched,
  onBlur,
  label,
  onPress,
}: CustomPickerProps) => {
  const { name, value } = field;
  const [manualEntry, setManualEntry] = useState<string | undefined>(value);

  useEffect(() => {
    if (data?.length > 0 && value) {
      const selected = data.find((option) => option.name === value);
      if (selected) setManualEntry(selected.name);
    }
  }, [data, value]);

  const handleSelect = (selected: { name: string }) => {
    const selectedValue = selected ? selected.name : '';
    setManualEntry(selectedValue);
    setFieldValue(name, selectedValue);
    if (onChange) onChange(selectedValue);
    if (onBlur) onBlur(name);
  };

  const handleManualInput = (text: string) => {
    setManualEntry(text);
    setFieldValue(name, text);
    if (onChange) onChange(text);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <LabelComponent style={[styles.label, labelStyle]} text={label} />}
      <View  style={[styles.input, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
        <TextInput
          style={styles.textInput}
          value={manualEntry}
          onChangeText={handleManualInput}
          placeholder={placeholder}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_STYLE}
        />
        <ModalPicker
          value={manualEntry}
          data={data}
          placeholder={placeholder}
          onPress={onPress}
          onChange={(item: any) => handleSelect(item)}
          modalTitle={modalTitle}
          isDropdownText={true}
        />
      </View>
      {error && touched && <ParagraphComponent style={[styles.error, commonStyles.textError]} text={error} />}
    </View>
  );
};

export default CustomDropDownTextPicker;

const styles = StyleSheet.create({
  container: {
    marginBottom: ms(16),
  },
  label: {
    fontSize: ms(14),
    color: NEW_COLOR.LABEL_TEXT,
    marginBottom: ms(8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_GREY,
    borderRadius: ms(8),
    paddingHorizontal: ms(12),
    paddingVertical: ms(10),
    backgroundColor: NEW_COLOR.INPUT_BG,
  },
  textInput: {
    // flex: 1,
    fontSize: ms(14),
    color: NEW_COLOR.TEXT_ALWAYS_WHITE,
    height:200
  },
  
  error: {
    fontSize: ms(12),
    color: NEW_COLOR.TEXT_RED,
    marginTop: ms(4),
  },
  input: {
    borderRadius: 8,
    borderColor: NEW_COLOR.SEARCH_BORDER,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
    borderWidth: 1,
    color: NEW_COLOR.TEXT_WHITE,
    paddingVertical: 8,
    paddingHorizontal: 14, height: 46
  },
});
