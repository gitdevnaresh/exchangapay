import React, { useState, forwardRef } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Field, FieldProps } from 'formik';
import { useLngTranslation } from '../../../hooks/languagesHook/useLngTranslation';
import { ms, s } from '../../../constants/styels/scale';
import LabelComponent from '../../textComponets/lableComponent/lable';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import icons from '../../../assets/icons';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../CommonStyles';

interface TextInputWithChildProps {
  label?: string;
  name: string;
  placeholder: string;
  secureTextEntry?: boolean;
  style?: object;
  numberOfLines?: number;
  editable?: boolean;
  keyboardType?: string;
  maxLength?: number;
  extraChildren?: React.ReactNode;
  requiredMark?: boolean;
  error?: boolean;
  touched: any;
  value?: any;
  onHandleChange?: (value: string) => void; // Optional onChange handler
}

const TextInputWithChild = forwardRef(
  (
    {
      label,
      name,
      placeholder,
      secureTextEntry = false,
      style,
      numberOfLines,
      editable = true,
      keyboardType = 'default',
      maxLength,
      extraChildren,
      requiredMark = false,
      error = false,
      touched,
      onHandleChange,
    }: TextInputWithChildProps,
    ref,
  ) => {
    const [secureText, setSecureText] = useState(secureTextEntry);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = screenStyles(NEW_COLOR);
    const changeSecureText = () => {
      setSecureText(!secureText);
    };
    const handleTextChange = (value: string) => {
      if (onHandleChange) {
        onHandleChange(value);
      }
    };
    return (
      <View >

        <Field name={name}>
          {({ field, form }: FieldProps) => (<>
            <View style={[commonStyles.inputContainer, commonStyles.relative, style, error && touched && commonStyles.errorBorder]}>
              <LabelComponent style={[commonStyles.inputLabel]}>
                {t(label)}
                {requiredMark && <LabelComponent style={[commonStyles.textRed]} text=" *" />}
              </LabelComponent>
              <TextInput
                {...field}
                placeholder={t(placeholder)}
                placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                secureTextEntry={secureText}
                multiline={numberOfLines > 1}
                numberOfLines={numberOfLines}
                editable={editable}
                keyboardType={keyboardType}
                maxLength={maxLength}
                style={[
                  commonStyles.placeholderfontsizes,
                  commonStyles.px16,
                  commonStyles.flex1,
                ]}
                onChangeText={(text) => {
                  field.onChange(name)(text);
                  handleTextChange(text);
                }}
                onBlur={field.onBlur(name)}
              />
              {extraChildren && <View>{extraChildren}</View>}


            </View>
            {form.touched[name] && form.errors[name] && (
              <ParagraphComponent
                style={[commonStyles.inputrequirederrormessage]}
                text={t(form.errors[name])}
              />
            )}
          </>
          )}
        </Field>

        {/* Icon for password visibility toggle (if applicable) */}
        {name === 'password' || name === 'confirmPassword' ? (
          <TouchableOpacity onPress={changeSecureText} style={[commonStyles.dflex, commonStyles.alignCenter]}>
            <Image source={secureText ? icons.eyeSlashGray : icons.eyeGray} style={styles.eyeIcon} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  },
);

const screenStyles = (NEW_COLOR: any) => StyleSheet.create({
  inputHeight: {
    height: s(48),
    paddingHorizontal: 16,
  },
  eyeIcon: {
    height: ms(15),
    width: ms(20),
    marginRight: 10,
  },
});

export default TextInputWithChild;

