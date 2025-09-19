import React, { forwardRef, memo, useEffect, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Input, Image } from 'react-native-elements';
import { Pressable, View } from 'react-native';
import Text from '../components/Text';
import Icons from '../.../../assets/icons';
import { NEW_COLOR, COLOR } from '../constants/theme/variables';
import { text } from '../constants/theme/mixins';
import { ms } from '../constants/theme/scale';
import ParagraphComponent from './Paragraph/Paragraph';
import LabelComponent from './Paragraph/label';
import { commonStyles } from './CommonStyles';
import Feather from 'react-native-vector-icons/Feather';

interface propTypes {
  field: any,
  form: any,
  error: any,
  label: any,
  placeholder: any,
  touched: any,
  onBlur: any,
  editable: any,
  placeholderTextColor: any,
  border: any,
  keyboardType: any,
  innerRef: any,
  labelStyle?: any;
}
interface funType {
  secureText: any,
  onPress: any
}
const InputSecure = forwardRef(
  (
    {
      field: { name, value },
      form: { handleChange: onChange },
      error,
      label,
      placeholder,
      touched,
      onBlur,
      editable,
      placeholderTextColor,
      border,
      keyboardType,
      innerRef,
      labelStyle,
    }: propTypes,
    // eslint-disable-next-line no-unused-vars
    ref,
  ) => {
    const [secureText, setSecureText] = useState(false);

    useEffect(() => {
      setSecureText(true);
      return () => { };
    }, [name]);

    const RightIcon = ({ secureText, onPress }: funType) => (
      <Pressable onPress={onPress} style={{ marginRight: -10 }}>
        {!secureText && <Feather size={ms(20)} name="eye" color={NEW_COLOR.TEXT_BLACK} />}
        {secureText && <Feather size={ms(20)} name="eye-off" color={NEW_COLOR.TEXT_BLACK} />}
      </Pressable>
    );

    const changeSecure = () => {
      setSecureText(!secureText);
    };

    const changeBorderColor = (isError: any, isBorder: any) => {
      if (isError) {
        return COLOR.RED_DARKEN_1;
      }
      if (isBorder) {
        return COLOR.GRAY_DARKEN_1;
      }
      return COLOR.PURPLE_LIGHTEN_1;
    };

    return (
      <>
        {label && <LabelComponent style={[styles.label, labelStyle, commonStyles.fs12, commonStyles.fw500, commonStyles.textBlack]} text={label} />}
        <View style={styles.wrapperInput}>
          <Input
            onChangeText={onChange && onChange(name)}
            keyboardType={keyboardType ?? 'default'}
            onBlur={onBlur && onBlur(name)}
            value={value}
            editable={editable}
            secureTextEntry={secureText}
            containerStyle={[styles.inputContainer, { height: 80, marginBottom: error ? 10 : 0 }]}
            style={[{}]}
            inputContainerStyle={[
              {
                borderColor: "transparent",
                zIndex: 10, borderWidth: 0
              },
            ]}
            placeholderTextColor={placeholderTextColor || NEW_COLOR.TEXT_GREY}
            inputStyle={styles.input}
            errorMessage={touched && error && error}
            errorStyle={styles.error}
            rightIcon={(
              <Pressable>
                <RightIcon onPress={changeSecure} secureText={secureText} />
              </Pressable>
            )}
            ref={innerRef}
          />
          <Text style={[styles.placeholder, !value ? commonStyles.textGrey : commonStyles.textBlack]} disabled onPress={() => innerRef.current.focus()}>
            {!value ? placeholder : ''}
          </Text>
        </View>
      </>
    );
  },
);

export default memo(InputSecure);


const styles = StyleSheet.create({
  placeholder: {
    position: 'absolute',
    top: ms(28),
    left: 34
  },
  label: {
    marginBottom: 4,
    marginLeft: 24,
  },
  wrapperInput: { justifyContent: 'center', alignItems: 'center' },
  inputContainer: {
    borderRadius: 100,
    borderColor: NEW_COLOR.BORDER_LIGHT,
    borderWidth: 1,
    backgroundColor: 'transparent',
    height: 77,
    paddingLeft: 24, paddingRight: 40,
    justifyContent: 'center', alignItems: 'center', flexDirection: "row"
    // marginBottom: 12,
  },
  input: {
    color: NEW_COLOR.TEXT_BLACK, paddingLeft: 8, paddingRight: 10
  },
  error: {
    color: NEW_COLOR.TEXT_RED_1,
    fontSize: ms(12),
    minHeight: 17, marginLeft: 12,
    position: "absolute", bottom: -24, left: 12
  },
});

