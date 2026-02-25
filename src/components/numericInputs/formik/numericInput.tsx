import React from "react";
import { TextInput, StyleSheet, Text } from 'react-native';
import { useField } from 'formik';
import ViewComponent from '../../view/view';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import { ms } from '../../theme/scale';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import { NEW_COLOR } from '../../../constants/styels/variables';
import { useLngTranslation } from '../../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import LabelComponent from '../../textComponets/lableComponent/lable';

interface CustomPickerProps {
  value: any;
  onChangeText?: (...args: (string | number)[]) => void;
  placeholder?: any;
  type?: string;
  data?: any;
  error?: any;
  touched?: any;
  onBlur?: any;
  label?: any;
  requiredMark?: any;
  maxLength?: number;
  name?: any;
  setFieldValue?: any;
  editable?: boolean;
}

const NumericInput = ({
  value,
  onChangeText,
  placeholder,
  type = 'numeric',
  label,
  requiredMark,
  error,
  touched,
  maxLength,
  name,
  setFieldValue,
  editable = false
}: CustomPickerProps) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = themedStyles(NEW_COLOR);

  // Remove commas
  const cleanInput = (text: string) => text.replace(/,/g, '');

  // Format with comma separation
  const formatNumberWithCommas = (num: string) => {
    if (!num) return '';
    const [intPart, decimalPart] = num.split('.');
    const formattedInt = parseInt(intPart || '0', 10).toLocaleString('en-US');
    return decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;
  };

  const handleChange = (text: string) => {
    // Remove commas before validation
    let rawValue = cleanInput(text);

    // Validate numeric and one decimal point
    if (!/^\d*\.?\d*$/.test(rawValue)) return;

    // Limit to 2 decimals
    if (rawValue.includes('.')) {
      const [_, decimalPart] = rawValue.split('.');
      if (decimalPart.length > 2) return;
    }

    // Send raw numeric to form
    setFieldValue && setFieldValue(name, rawValue);
    onChangeText && onChangeText(rawValue);
  };

  const handleBlur = () => {
    setFieldValue && setFieldValue(name, cleanInput(value));
  };

  return (
    <ViewComponent style={[commonStyles.relative]}>
      {label && (
        <LabelComponent
          style={[commonStyles.inputLabel]}
          text={label}
        >
          {requiredMark}
        </LabelComponent>
      )}

      <TextInput
        style={[
          commonStyles.amountInput,

          error && touched ? commonStyles.errorBorder : null
        ]}
        value={formatNumberWithCommas(value)}
        onChangeText={handleChange}
        placeholder={t(placeholder)}
        keyboardType="number-pad"
        maxLength={maxLength}
        placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
        onBlur={handleBlur}
        editable={!editable}
        autoCapitalize="words"

      />

      {error && touched && (
        <ParagraphComponent
          style={styles.error}
          text={t(error)}
        />
      )}
    </ViewComponent>
  );
};

const themedStyles = (NEW_COLOR: any) =>
  StyleSheet.create({
    inputHeight: {
      height: 54,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderColor: NEW_COLOR.INPUT_BORDER,
      borderWidth: 1,
      backgroundColor: 'transparent'
    },
    label: {
      paddingVertical: 3,
      marginBottom: 6
    },
    error: {
      color: NEW_COLOR.TEXT_RED,
      fontSize: ms(14),
      paddingTop: 4
    },
    placeholder: {
      color: NEW_COLOR.TEXT_SECONDARY
    }
  });

export default NumericInput;

