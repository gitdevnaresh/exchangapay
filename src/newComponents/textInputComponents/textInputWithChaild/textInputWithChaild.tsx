import React, { useState, forwardRef } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Field, FieldProps } from 'formik';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { ms, s } from '../../../constants/theme/scale';
import LabelComponent from '../../textComponets/lableComponent/lable';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';

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
            <View style={[styles.inputContainer, commonStyles.relative, style, error && touched && commonStyles.errorBorder]}>
              <LabelComponent style={[commonStyles.inputLabel, commonStyles.pt0, commonStyles.pb0]}>
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
                  commonStyles.fs16,
                  commonStyles.fw400,
                  styles.inputHeight,
                  commonStyles.textWhite,
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
                style={[commonStyles.textError, commonStyles.mt4, commonStyles.fs14, commonStyles.fw400]}
                text={t(form.errors[name])}
              />
            )}
          </>
          )}
        </Field>

        {/* Icon for password visibility toggle (if applicable) */}
        {name === 'password' || name === 'confirmPassword' ? (
          <TouchableOpacity onPress={changeSecureText} style={[commonStyles.dflex, commonStyles.alignCenter]}>
              <Feather
                                name={secureText ? "eye" : "eye-off"}
                                size={s(20)}
                                color={NEW_COLOR.TEXT_link}
                                style={[commonStyles.p6]}
                            />
            {/* <Image source={secureText ? icons.eyeSlashGray : icons.eyeGray} style={styles.eyeIcon} /> */}
          </TouchableOpacity>
        ) : null}
      </View>
    );
  },
);

const screenStyles = (NEW_COLOR: any) => StyleSheet.create({
  inputContainer: {
    borderRadius: 5,
    borderColor: NEW_COLOR.INPUT_BORDER,
    borderWidth: 1,
    backgroundColor: 'transparent',
    height: s(48),
  },
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
