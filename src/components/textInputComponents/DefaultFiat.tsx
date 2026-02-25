import React, { memo, useEffect, useState, forwardRef, ReactNode } from 'react';
import { Input } from 'react-native-elements';
import { Platform, Pressable, StyleSheet, View, StyleProp, ViewStyle, TextStyle, KeyboardTypeOptions } from 'react-native';
import { NEW_COLOR } from '../../constants/styels/variables';
import Ionicons from '@expo/vector-icons/Ionicons'; // Import Ionicons
import { commaSeparating } from '../../utils/helpers';
import { ms, s } from '../../constants/styels/scale';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getThemedCommonStyles } from '../CommonStyles';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import LabelComponent from '../textComponets/lableComponent/lable';
interface InputFiatProps {
  field: { name: string; value: string | number };
  form: { handleChange: (name: string) => (value: string) => void };
  error?: string;
  label: string;
  placeholder: string;
  touched?: boolean;
  onBlur: (name: string) => (e: any) => void;
  onHandleChange?: (value: string) => void;
  editable?: boolean;
  customContainerStyle?: StyleProp<ViewStyle>;
  keyboardType?: KeyboardTypeOptions;
  innerRef?: React.Ref<React.ElementRef<typeof Input>>;
  requiredMark?: ReactNode;
  labelStyle?: StyleProp<TextStyle>;
  borderStyle?: StyleProp<ViewStyle>;
  minLength?: number;
  maxLength?: number;
  autoCapitalize?: any;
  // --- ADD THESE PROPS ---
  multiline?: boolean;
  numberOfLines?: number;
  textAlignVertical?: 'top' | 'center' | 'bottom';
}

// ... (RightIcon component remains the same) ...
interface RightIconProps {
  secureText: boolean,
  onPress: () => void;
  color: string;
}

const RightIcon = ({ secureText, onPress, color }: RightIconProps) => (
  <Pressable onPress={onPress} style={{ marginRight: 10, padding: s(2) }}>
    <Ionicons name={secureText ? "eye-off" : "eye"} color={color} size={s(22)} />
  </Pressable>
);

const InputFiat = forwardRef(
  (
    {
      field: { name, value },
      form: { handleChange: onChange },
      error,
      onHandleChange,
      label,
      placeholder,
      touched,
      onBlur,
      editable = true,
      customContainerStyle,
      keyboardType,
      innerRef,
      requiredMark,
      labelStyle,
      borderStyle,
      minLength,
      maxLength,
      autoCapitalize,
      // --- DESTRUCTURE NEW PROPS ---
      multiline = false,
      numberOfLines,
      textAlignVertical,
    }: InputFiatProps,
    ref
  ) => {
    const [secureText, setSecureText] = useState(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    // ... (useEffect, changeSecure, handleFormatAmount, etc. remain the same) ...
    useEffect(() => {
      if (name?.toLowerCase().includes('password')) {
        setSecureText(true);
      }
      return () => { };
    }, [name]);

    const changeSecure = () => {
      setSecureText(!secureText);
    };

    const handleFormatAmount = (val: string | number) => {
      if (!val) {
        return '';
      }
      let result = val.toString();

      if ((result.match(/\./g) ?? []).length > 1) {
        result = result.slice(0, -1);
      }

      const [beforeNumber, afterNumber] = result.replace(/[^0-9.]/g, '').split('.');

      const formattedInteger = commaSeparating(beforeNumber, 3);
      const formattedDecimal = afterNumber !== undefined ? `.${afterNumber.substring(0, 2)}` : '';
      return `${formattedInteger}${formattedDecimal}`;
    };

    const numberMaxLength = (labelName: string) => {
      if (labelName === 'zipCode') {
        return 8;
      }
      if (Platform.OS === 'ios') {
        return 12;
      }
      return 13;
    };

    const handleTextChange = (val: string) => {
      let valueToSet = multiline ? val : val?.trimStart(); // Don't trim start for multiline
      if (maxLength && valueToSet?.length > maxLength) {
        valueToSet = valueToSet?.substring(0, maxLength);
      }
      onChange?.(name)(valueToSet);
      onHandleChange && onHandleChange(valueToSet);
    };

    const { t } = useLngTranslation();
    const handleFocus = () => {
      setIsFocused(true);
    };
    const handluBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(name)(e)
    };
    return (
      <View style={[commonStyles.relative]}>
        {!!label && (
          <LabelComponent text={t(label)} style={[commonStyles.inputLabel, labelStyle]}>
            {requiredMark}
          </LabelComponent>
        )}
        <Input
          // --- FIX 1: PASS THE PROPS TO THE INPUT ---
          multiline={multiline}
          numberOfLines={numberOfLines}
          // ------------------------------------------
          placeholder={t(placeholder)}
          onChangeText={handleTextChange}
          testID="inputFiat"
          keyboardType={keyboardType ?? 'default'}
          onBlur={handluBlur}
          value={name === 'amount' ? handleFormatAmount(value) : String(value ?? '')}
          editable={editable}
          secureTextEntry={secureText}
          onFocus={handleFocus}
          autoCapitalize={autoCapitalize}
          containerStyle={{
            ...styles.container,
            ...(customContainerStyle as ViewStyle),
            height: touched && error ? ms(48) : ms(48),
          }}
          inputContainerStyle={[
            commonStyles.textInput,
            !editable && commonStyles.disabledContainerStyle, // Apply disabled style when not editable
            touched && error ? commonStyles.errorBorder : null,
            borderStyle,
            isFocused && !error && editable ? commonStyles.hoverborder : null,]}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
          inputStyle={[commonStyles.placeholderfontsizes,
          !editable && commonStyles.disabledTextStyle, // Apply disabled text color
          ]}
          maxLength={name === 'amount' || name === 'zipCode' ? numberMaxLength(name) : undefined}
          errorMessage={t((touched && error) || '')}
          errorStyle={[commonStyles.inputrequirederrormessage]}
          rightIcon={
            (name === 'password' || name === 'confirmPassword') && (
              <TouchableOpacity>
                <RightIcon onPress={changeSecure} secureText={secureText} color={NEW_COLOR.SEARCH_ICON} />
              </TouchableOpacity>
            )
          }
          ref={innerRef}
        />
      </View>
    );
  }
);

export default memo(InputFiat);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  error: {
    fontSize: ms(14),
    fontFamily: 'Poppins-medium',
    paddingTop: 3,
    margin: 0,
  },
  eyeIcon: {
    height: ms(15),
    width: ms(20),
  },
});
