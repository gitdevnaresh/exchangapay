import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';

import Feather from "@expo/vector-icons/Feather";
import { Picker } from '../pickerComponents/Picker';
import { getThemedCommonStyles } from '../CommonStyles';
import { ms, s } from '../../constants/styels/scale';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import CustomRBSheet from '../models/commonBottomSheet';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';

interface PhoneCodePickerProps {
  placeholder: any;
  onChange(item: any): void;
  data: any;
  value: any;
  customBind: Array<string>;
  containerStyle?: any;
  arrowRight?: boolean;
  modalTitle?: any;
  inputStyle?: any;
  sheetHeight?: number;
  isOnlycountry?: boolean
  disabled?: boolean
}
const PhoneCodePicker = ({
  placeholder,
  onChange,
  data,
  value,
  customBind,
  containerStyle,
  modalTitle,
  arrowRight = false,
  inputStyle,
  isOnlycountry,
  disabled = false,
  sheetHeight = ms(400), // Default sheet height
}: PhoneCodePickerProps) => {
  const rbSheetRef = useRef<any>(null);
  const [selected, setSelected] = useState<any>();
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);


  useEffect(() => {
    if (!value) {
      setSelected('');
    }
  }, [data, value]);

  const handleSetData = (options: any) => {
    onChange(options);
    setSelected(options);
    requestAnimationFrame(() => {
      rbSheetRef.current?.close();
    });
  };
  const handlePressLogo = () => {
    requestAnimationFrame(() => {
      rbSheetRef.current?.open();
    });
    Keyboard.dismiss();
  };

  return (
    <View style={containerStyle}>
      <View >
        <TouchableOpacity activeOpacity={0.7} onPress={handlePressLogo} disabled={disabled}>
          <View style={[commonStyles.textInput, commonStyles.phonepickerinput, inputStyle, disabled && commonStyles.disabledContainerStyle]}>
            {(() => {
              const displayValue = typeof value === 'string' ? value : value?.name;
              const textToRender =
                displayValue && displayValue !== ''
                  ? String(displayValue).trim().startsWith('+')
                    ? displayValue
                    : `+ ${displayValue}`
                  : t(placeholder);
              const colorToRender = (displayValue === '' || displayValue === null || displayValue === undefined) ? NEW_COLOR.PLACEHOLDER_TEXTCOLOR : (disabled ? commonStyles.disabledTextStyle.color : NEW_COLOR.TEXT_WHITE);
              return (
                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, { color: colorToRender }]} text={textToRender} />
              );
            })()}
            <Feather name={arrowRight ? "chevron-right" : "chevron-down"} size={s(18)} color={disabled ? commonStyles.disabledTextStyle.color : NEW_COLOR.TEXT_WHITE} />
          </View>
        </TouchableOpacity>
      </View>
      <CustomRBSheet
        refRBSheet={rbSheetRef}
        height={"Large"}
        title={modalTitle ?? t('Select Code')} // Provide a default or use passed title
        onClose={() => { /* Optional: Handle sheet close by user interaction if needed */ }}
        scrollEnabled={false}
      >
        <View style={styles.sheetContentContainer}>
          <Picker
            data={data}
            changeModalVisible={() => rbSheetRef.current?.close()} // For Picker's internal close/cancel
            setData={handleSetData} // Picker calls this on selection
            selectedValue={selected}
            customBind={customBind}
            isOnlycountry={isOnlycountry}
          />
        </View>
      </CustomRBSheet>
    </View>
  );
};

export default PhoneCodePicker;

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    gap: s(6),
    justifyContent: 'space-between',
    alignItems: "center",
    width: s(110),
    height: s(48.5)
  },
  sheetContentContainer: {
    flex: 1,
  }
});
