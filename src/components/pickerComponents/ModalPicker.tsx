import React, { useRef, ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { Picker } from './Picker';
import { getThemedCommonStyles } from '../CommonStyles';
import Feather from 'react-native-vector-icons/Feather';
import { ms, s } from '../../constants/styels/scale';
import CustomRBSheet from '../models/commonBottomSheet'; // Adjusted path
import ImageUri from '../imageComponents/image';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import LabelComponent from '../textComponets/lableComponent/lable';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';

interface PickerItem {
  id?: string | number;
  name?: string;
  code?: string;
  [key: string]: any; // Allows for other properties
}

interface RBSheetRef {
  open: () => void;
  close: () => void;
}

interface ModalPickerProps {
  placeholder: string;
  onChange(item: PickerItem): void;
  onPress?: () => void;
  data: PickerItem[];
  value: PickerItem | string | null | undefined;
  customBind: Array<string>;
  disabled?: boolean;
  modalTitle?: string;
  label?: string;
  requiredMark?: ReactNode;
  error?: string | null;
  touched?: boolean;
  numberOfLines?: number;
  sheetHeight?: number; // Added for RBSheet height,
  showCountryImages?: boolean; // New flag
  isIconsDisplay?: boolean;
  isOnlycountry?: boolean;
  addPlusPrefix?: boolean; // New prop to control + prefix
  showBalance?: boolean; // New flag to control balance display
}
const ModalPicker = ({
  placeholder,
  onChange,
  data,
  value,
  customBind,
  disabled = false,
  modalTitle,
  label,
  requiredMark,
  error,
  touched,
  numberOfLines,
  isOnlycountry = false,
  sheetHeight = ms(500),
  showCountryImages = false, // Default value for the flag
  isIconsDisplay = false,
  addPlusPrefix = true, // Default to true for backward compatibility
  showBalance = false // Default to false
}: ModalPickerProps) => {
  const rbSheetRef = useRef<RBSheetRef>(null);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const currentDisplayValue = typeof value === 'string'
    ? value
    : (value && typeof value === 'object' ? (value as PickerItem).name : undefined);


  const handleOpenPicker = () => {
    Keyboard.dismiss();
    if (!disabled) {
      requestAnimationFrame(() => {
        rbSheetRef.current?.open();
      });
    }
  };

  const handleSetData = (options: PickerItem) => {
    onChange(options);
    requestAnimationFrame(() => {
      rbSheetRef.current?.close();
    });
  };
  const changeModalVisible = () => {
    requestAnimationFrame(() => {
      rbSheetRef.current?.close();
    });
  };
  const textToRender =
    currentDisplayValue && currentDisplayValue !== ''
      // The condition is changed from checking for '+' to checking if the string is purely digits.
      ? /^\d+$/.test(currentDisplayValue) && addPlusPrefix
        // If it's only digits (like "91") and addPlusPrefix is true, add the "+".
        ? `+ ${currentDisplayValue}`
        // Otherwise (like "+91" or "USA" or when addPlusPrefix is false), display the value as is.
        : currentDisplayValue
      // If currentDisplayValue is empty, use the placeholder.
      : placeholder;
  const disabledIconColor = '#9098A9'; // Muted icon color

  return (
    <View>
      <View >
        {label && <LabelComponent style={commonStyles.inputLabel} text={label}>{requiredMark}</LabelComponent>}

        <TouchableOpacity onPress={handleOpenPicker}
          activeOpacity={disabled ? 1 : 0.7} // No opacity change when disabled
        >
          <View style={[
            commonStyles.input,
            commonStyles.dflex,
            commonStyles.alignCenter,
            commonStyles.justifyContent,
            commonStyles.relative,
            (touched && error) && commonStyles.errorBorder,
            commonStyles.gap8,
            disabled && commonStyles.disabledContainerStyle, // Apply disabled style here
          ]}>
            {showCountryImages && value && typeof value === 'object' && (value as PickerItem).image && (
              <ImageUri uri={(value as PickerItem).image} style={{ width: s(26), height: s(26) }} />
            )}
            <ParagraphComponent
              style={[
                commonStyles.flex1,
                commonStyles.placeholderfontsizes,
                { color: currentDisplayValue ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.PLACEHOLDER_TEXTCOLOR },
                disabled && commonStyles.disabledTextStyle, // Apply disabled text style here
              ]} text={textToRender} numberOfLines={numberOfLines ?? 1} />
            <Feather
              name="chevron-down"
              size={s(22)}
              color={disabled ? disabledIconColor : NEW_COLOR.TEXT_WHITE} // Apply disabled color to icon
            />
          </View>
        </TouchableOpacity>

      </View>
      <CustomRBSheet
        refRBSheet={rbSheetRef}
        height={"Large" || sheetHeight}
        title={modalTitle || "Select an option"} // Provide a default title
        onClose={() => { /* Optional: Handle sheet close by user interaction if needed */ }}
        scrollEnabled={false}
      >
        <View style={styles.sheetContentContainer}>
          <Picker
            data={data}
            changeModalVisible={changeModalVisible}
            setData={handleSetData}
            customBind={customBind}
            selectedValue={value} // Pass the current value to Picker
            showCountryImages={showCountryImages} // Pass the flag
            isIconsDisplay={isIconsDisplay}
            isOnlycountry={isOnlycountry}
            showBalance={showBalance} // Pass the balance flag
          />
        </View>
      </CustomRBSheet>
    </View>
  );
};

export default ModalPicker;

const styles = StyleSheet.create({
  sheetContentContainer: {
    flex: 1,
  }
});
