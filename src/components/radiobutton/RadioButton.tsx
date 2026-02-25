import React, { useMemo } from 'react';
import { View, TouchableOpacity, Keyboard } from 'react-native';
import { getThemedCommonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import { s } from '../theme/scale';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';

const RadioButton = ({ options, radioIsSide = "true",removeGap=false, selectedOption, onSelect, nameField = 'label', valueField = 'value' }: any) => {
  const {t} = useLngTranslation();
  const NEW_COLOR = useThemeColors();
   const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  return (
    <View style={[commonStyles.gap16, { flexDirection: radioIsSide ? "row" : "column" }]}>
      {options?.map((option: any) => (
        <TouchableOpacity
          key={option[valueField]}
          style={[commonStyles.dflex,commonStyles.alignCenter,commonStyles.gap10]}
          // onPress={() => onSelect(option[valueField]),Keyboard.dismiss()}
          onPress={() => {
            onSelect(option[valueField]);
            Keyboard.dismiss();
          }}
          activeOpacity={0.7}
        >
          <View
            style={{
              height: s(16),
              width: s(16),
              borderRadius: s(12),
              borderWidth: s(2),
              borderColor: option[valueField] === selectedOption ? NEW_COLOR.BUTTON_BG : NEW_COLOR.INACTIVE_Radio,
              alignItems: 'center',
              justifyContent: 'center',

            }}
          >
            {option[valueField] === selectedOption && (
              <View
                style={{
                  height: s(10),
                  width: s(10),
                  borderRadius: s(8),
                  backgroundColor: NEW_COLOR.BUTTON_BG,
                }}
              />
            )}
          </View>
          <ParagraphComponent
            text={t(option.label)}
            style={[
              commonStyles.fs16,
              commonStyles.fw400,
              { color: NEW_COLOR.TEXT_WHITE}
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RadioButton;