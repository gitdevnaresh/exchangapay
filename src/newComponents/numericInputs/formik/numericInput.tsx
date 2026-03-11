import React from 'react';
import { TextInput, StyleSheet, Text } from 'react-native';
import { useField } from 'formik';
import ViewComponent from '../../view/view';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import { ms } from '../../theme/scale';
import { NEW_COLOR } from '../../../constants/theme/variables';
import LabelComponent from '../../../components/Paragraph/label';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';

interface NumericInputProps {
  label?: string;
  requiredMark?: boolean;
  placeholder?: string;
  maxLength?: number;
  name: string;
  editable?: boolean;
  onValueChange?: (value: string) => void;
  decimalAllowed?: boolean; 
}

const NumericInput: React.FC<NumericInputProps> = ({
  label,
  requiredMark = false, 
  placeholder,
  maxLength,
  name,
  editable = true,
  onValueChange,
  decimalAllowed = false,
}: NumericInputProps) => {
  const [field, meta, helpers] = useField<string>(name);
  const { setValue, setTouched } = helpers;
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const handleChange = (text: string) => {
    let numericValue = text;
    if (decimalAllowed) {
      numericValue = numericValue.replace(/[^0-9.]/g, '');
      const decimalIndex = numericValue.indexOf('.');
      if (decimalIndex !== -1) {
        const integerPart = numericValue.slice(0, decimalIndex);
        const fractionalPart = numericValue.slice(decimalIndex + 1).replace(/\./g, ''); 
        numericValue = integerPart + '.' + fractionalPart.slice(0, 2);
      }
    } else {
      numericValue = numericValue.replace(/\D/g, '');

    }

    setValue(numericValue);
    if (onValueChange) {
      onValueChange(numericValue);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <ViewComponent style={[commonStyles.relative]}>
      {label && (
        <LabelComponent style={[commonStyles.inputLabel]}>
          {t(label)}
          {requiredMark && <Text style={{ color: NEW_COLOR.TEXT_RED }}>*</Text>}
        </LabelComponent>
      )}

      <TextInput
        style={[
          commonStyles.dflex,
          commonStyles.alignCenter,
          commonStyles.justifyContent,
          commonStyles.relative,
          commonStyles.input,
          meta.touched && meta.error && commonStyles.errorBorder,
        ]}
        value={field.value}
        onChangeText={handleChange}
        placeholder={t(placeholder ?? '')}
        keyboardType={decimalAllowed ? 'decimal-pad' : 'numeric'}
        maxLength={maxLength}
        placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
        onBlur={handleBlur}
        editable={editable}
      />

      {meta.touched && meta.error && (
        <ParagraphComponent style={styles.error} text={t(meta.error)} />
      )}
    </ViewComponent>
  );
};

const styles = StyleSheet.create({
  error: {
    color: NEW_COLOR.TEXT_RED,
    fontSize: ms(14),
    paddingTop: 4,
  },
});

export default NumericInput;
