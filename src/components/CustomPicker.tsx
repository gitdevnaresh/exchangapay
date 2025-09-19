import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ms } from '../constants/theme/scale';
import ModalPicker from '../components/ModalPicker';
import { NEW_COLOR } from '../constants/theme/variables';
import LabelComponent from './Paragraph/label';
import ParagraphComponent from './Paragraph/Paragraph';
import { commonStyles } from './CommonStyles';

interface CustomPickerProps {
  field: any;
  form: any;
  onPress: () => void;
  placeholder: any;
  onChange(index: number): void;
  data: any;
  error: any;
  touched: any;
  onBlur: any;
  label: any;
  labelStyle?: any;
  containerStyle?: any;
  Children?: any;
  modalTitle?: any;
  disable?: boolean;
  isLoading?: boolean;
}
const CustomPickerAcc = ({ field, form: { setFieldValue }, placeholder, Children, containerStyle, modalTitle, labelStyle, onChange, data = [], error, touched, onBlur, label, onPress, disable ,isLoading}: CustomPickerProps) => {
  const { name, value } = field;
  const [selectedOption, setSelectedOption] = useState(undefined)
  useEffect(() => {
    if (data?.length > 0) {
      const SelInfo = data.find((option: any) => {
        if (typeof option?.name === "string" && typeof value === "string") {
          return option?.name?.toUpperCase() === value?.toUpperCase()
        } else {
          return option?.name === value
        }
      }
      );
      setSelectedOption(SelInfo);

    } else {
      setSelectedOption(undefined);
    }
  }, [data, value])
  const handleSelect = (selected: any) => {
    const selectedValue = selected ? selected?.name : selected;
    if (onBlur !== null && onBlur !== undefined) {
      onBlur(name);
    }
    setFieldValue(name, selectedValue);
    if (onChange !== null && onChange !== undefined) {
      onChange(selectedValue);
    }
  };

  return (
    <View style={[containerStyle,]}>
      {label && <LabelComponent style={[styles.label, labelStyle,]} text={label} Children={Children} />}
      <ModalPicker
        value={selectedOption}
        data={data}
        placeholder={placeholder}
        onPress={onPress}
        onChange={(item: any) => handleSelect(item)}
        modalTitle={modalTitle}
        disable={disable}
        isLoading={isLoading}
      />
      {error && touched && error && <ParagraphComponent style={[styles.error, commonStyles.textError]} text={error && touched && error} />}

    </View>
  );
};
export default CustomPickerAcc;

const styles = StyleSheet.create({
  error: {
    fontSize: ms(12),
    minHeight: 17, marginTop: 4
  },
  placeholder: {
    color: NEW_COLOR.PLACEHOLDER_STYLE,
  },
});
