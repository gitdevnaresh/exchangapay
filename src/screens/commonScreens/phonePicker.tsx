import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Keyboard } from 'react-native';
import Feather from "@expo/vector-icons/Feather";
import { ms, s } from '../../constants/theme/scale';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import { useThemeColors } from '../../hooks/useThemeColors';
import PopupOrSheet from '../../newComponents/models/PopupOrSheet';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import ParagraphComponent from '../../newComponents/textComponets/paragraphText/paragraph';
import { Picker } from '../../newComponents/pickerComponents/picker/Picker';

interface PhoneCodePickerProps {
  placeholder: any;
  onChange(index: number): void;
  data: any;
  value: any;
  customBind: Array<string>;
  containerStyle?: any;
  arrowRight?: boolean;
  modalTitle?: any;
  inputStyle?: any;
  sheetHeight?: number;
  showCountryImages?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
}

const PhoneCodePicker = ({
  placeholder,
  onChange,
  data,
  value,
  customBind,
  containerStyle,
  modalTitle,
  disabled,
  arrowRight = false,
  inputStyle,
  sheetHeight = ms(400),
  searchPlaceholder,
  showCountryImages
}: PhoneCodePickerProps) => {
  const rbSheetRef = useRef<any>(null);
  const [selected, setSelected] = useState("");
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    if (!value) {
      setSelected('');
    }
  }, [data, value]);

  const handleSetData = (option: any) => {
    onChange(option);
    setSelected(option);
    requestAnimationFrame(() => {
      rbSheetRef.current?.close();
    });
  };

  const handlePressLogo = () => {
    Keyboard.dismiss();
    requestAnimationFrame(() => {
      rbSheetRef.current?.open();
    });
  };

  const getDisplayItem = () => {
    if (typeof value === 'string') {
      return data?.find((item: any) => item.mobileCode === value || item.code === value);
    } else if (typeof value === 'object' && value !== null) {
      return value;
    }
    return undefined;
  };
  const displayItem = getDisplayItem();
  const displayCode = displayItem?.mobileCode ?? (typeof value === 'string' ? value : '');
  const textToRender = displayCode === '' ? t(placeholder) : displayCode;
  const colorToRender = !displayCode ? NEW_COLOR.PLACEHOLDER_TEXTCOLOR : NEW_COLOR.TEXT_WHITE;

  return (
    <View style={containerStyle}>
      <TouchableOpacity activeOpacity={0.7} onPress={handlePressLogo} disabled={disabled}>
        <View style={[commonStyles.textInput, styles.input, inputStyle, { backgroundColor: disabled ? NEW_COLOR.INPUT_BORDER : NEW_COLOR.INPUTFIELD_BG }]}>
          {/* Show flag only when a value is selected */}
          {displayCode !== '' && displayItem?.flag && (
            <Image
              source={{ uri: displayItem.flag }}
              style={styles.flagStyle}
            />
          )}

          <ParagraphComponent
            style={[commonStyles.fs16, commonStyles.fw400, commonStyles.flex1, { color: colorToRender }]}
            text={textToRender}
          />

          <Feather
            name={arrowRight ? "chevron-right" : "chevron-down"}
            size={s(18)}
            color={NEW_COLOR.TEXT_WHITE}
          />
        </View>
      </TouchableOpacity>

      <PopupOrSheet
        ref={rbSheetRef}
        height={sheetHeight}
        title={modalTitle ?? t('Select Code')}
        onClose={() => { }}
      >
        <View style={styles.sheetContentContainer}>
          <Picker
            data={data}
            changeModalVisible={() => rbSheetRef.current?.close()}
            setData={handleSetData}
            selectedValue={selected}
            customBind={customBind}
            showCountryImages={showCountryImages}
            searchPlaceholder={searchPlaceholder}
          />
        </View>
      </PopupOrSheet>
    </View>
  );
};

export default PhoneCodePicker;

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: s(125),
  },
  sheetContentContainer: {
    flex: 1,
  },
  flagStyle: {
    width: s(16),
    height: s(16),
    borderRadius: 100 / 2,
  },
});
