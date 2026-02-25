import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import ModalPicker from '../pickerComponents/ModalPicker';
import { getThemedCommonStyles } from '../CommonStyles';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';

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
  requiredMark?: any;
  selectionType?: 'id' | 'name';
  disabled?: boolean;
  modalTitle?: string;
  numberOfLines?: number;
  sheetHeight?: any;
  isIconsDisplay?: boolean;
  isOnlycountry?: boolean;
  showCountryImages?: boolean; // New flag
  addPlusPrefix?: boolean; // New prop
  showBalance?: boolean; // New flag to control balance display
}

const CustomPicker = ({
  field,
  form: { setFieldValue },
  requiredMark,
  placeholder,
  onChange,
  data = [],
  error,
  touched,
  onBlur,
  label,
  onPress,
  selectionType = 'name',
  disabled = false,
  modalTitle,
  numberOfLines,
  sheetHeight,
  isIconsDisplay = false,
  showCountryImages = false,
  isOnlycountry = false,
  addPlusPrefix = true, // Default value
  showBalance = false, // Default value
  // Default value for the flag
}: CustomPickerProps) => {
  const { name, value } = field;
  const selectedOption = data.find((option: any) => option[selectionType] === value) || { [selectionType]: value };
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const styles = screenStyles(NEW_COLOR);
  const handleSelect = (selected: any) => {
    const selectedValue = selected[selectionType];
    if (disabled) return;
    if (onBlur) {
      onBlur(name);
    }
    setFieldValue(name, selectedValue);
    if (onChange) {
      onChange(selectedValue);
    }
  };
  const { t } = useLngTranslation();
  return (
    <View>
      <ModalPicker
        value={selectedOption}
        data={data}
        placeholder={t(placeholder)}
        onPress={!disabled ? null : onPress}
        disabled={disabled}
        onChange={(item: any) => handleSelect(item)}
        modalTitle={t(modalTitle)}
        label={t(label)}
        requiredMark={requiredMark}
        error={error}
        touched={touched}
        numberOfLines={numberOfLines}
        sheetHeight={sheetHeight}
        isIconsDisplay={isIconsDisplay}
        showCountryImages={showCountryImages} // Pass the flag
        isOnlycountry={isOnlycountry}
        addPlusPrefix={addPlusPrefix} // Pass the flag
        showBalance={showBalance} // Pass the balance flag
      />
      {(error && touched) && <ParagraphComponent style={[commonStyles.inputrequirederrormessage]} text={t(error)} />}
    </View>
  );
};

const screenStyles = (NEW_COLOR: any) => StyleSheet.create({
  label: {
    paddingVertical: 3,
    marginBottom: 6,
  },
  error: {
    paddingTop: 4,
  },
  placeholder: {
    color: NEW_COLOR.PLACEHOLDER_TEXTCOLOR,
  },
});

export default CustomPicker;


