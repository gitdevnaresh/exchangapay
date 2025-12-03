import React, { memo, useEffect, useState, forwardRef } from "react";
import { Input, Image } from "react-native-elements";
import { Platform, Pressable, StyleSheet } from "react-native";
import { COLOR, NEW_COLOR } from "../constants/theme/variables";
import icons from "../.../../assets/icons";
import { commaSeparating } from "../utils/helpers";
import { ms, s } from "../constants/theme/scale";
import { TouchableOpacity } from "react-native";
import { commonStyles } from "./CommonStyles";
import LabelComponent from "./Paragraph/label";
import { Scanbar } from "../assets/svg";

interface propTypes {
  field: any;
  form: any;
  error: any;
  label: any;
  placeholder: any;
  touched: any;
  onBlur: any;
  editable: any;
  customContainerStyle: any;
  placeholderTextColor: any;
  border: any;
  keyboardType: any;
  colorValue: any;
  innerRef: any;
  labelStyle: any;
  Children?: any;
  maxLength?: number | null;
  multiline?: boolean;
  inputContainerStyle?: any;
  numberOfLines?: number;
  inputHeight?: number;
  textArea?: boolean;
  isScanner?: boolean;
  onScannerPress?: any;
  onChangeText?: (text: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}
interface funType {
  secureText: any;
  onPress: any;
}
const InputFiat = forwardRef(
  (
    {
      field: { name, value },
      form: { handleChange: onChange },
      error,
      label,
      placeholder,
      touched,
      onBlur,
      editable = true,
      customContainerStyle,
      keyboardType,
      innerRef,
      labelStyle,
      Children,
      maxLength = null,
      multiline,
      inputContainerStyle,
      numberOfLines,
      inputHeight,
      textArea = false,
      isScanner = false,
      onScannerPress,
      onChangeText,
      autoCapitalize = "none",
    }: propTypes,
  ) => {
    const [secureText, setSecureText] = useState(false);

    useEffect(() => {
      if (name?.toLowerCase().includes("password")) {
        setSecureText(true);
      }
      return () => { };
    }, [name]);

    const RightIcon = ({ secureText, onPress }: funType) => (
      <Pressable onPress={onPress} style={{ marginRight: 10 }}>
        {!secureText && <Image source={icons.eyeGray} style={styles.eyeIcon} />}
        {secureText && (
          <Image source={icons.eyeSlashGray} style={styles.eyeIcon} />
        )}
      </Pressable>
    );
    const changeSecure = () => {
      setSecureText(!secureText);
    };

    const handleFormatAmount = (val: any) => {
      if (!val) {
        return "";
      }
      let result = val.toString();

      if ((result.match(/\./g) || []).length > 1) {
        result = result.slice(0, -1);
      }

      const [beforeNumber, afterNumber] = result
        .replace(/[^0-9.]/g, "")
        .split(".");

      return `${commaSeparating(beforeNumber, 3)}${afterNumber !== undefined ? `.${afterNumber.substring(0, 2)}` : ""
        }`;
    };



    const numberMaxLength = (labelName: any) => {
      if (labelName === "zipCode") {
        return 8;
      }
      if (Platform.OS === "ios") {
        return 12;
      }
      return 13;
    };

    return (
      <>
        {label && (
          <LabelComponent
            Children={Children}
            style={[
              labelStyle,
              commonStyles.fs12,
              commonStyles.fw500,
              NEW_COLOR.TEXT_LABEL,
            ]}
            text={label}
          />
        )}
        <Input
          numberOfLines={numberOfLines}
          placeholder={placeholder}
          onChangeText={onChangeText ? onChangeText : onChange(name)}
          multiline={multiline}
          testID="inputFiat"
          keyboardType={keyboardType ?? "default"}
          onBlur={onBlur && onBlur(name)}
          value={name === "amount" ? handleFormatAmount(value) : value}
          editable={editable}
          secureTextEntry={secureText}
          containerStyle={{
            ...styles.container,
            ...customContainerStyle,
            height: error ? ms(56) : ms(46),
          }}
          inputContainerStyle={[
            styles.input,
            {
              backgroundColor: editable
                ? NEW_COLOR.SCREENBG_WHITE
                : NEW_COLOR.DISABLED_INPUTBG,
              borderColor: NEW_COLOR.SEARCH_BORDER,
              // borderColor: changeBorderColor(false, border),
              borderRadius: 8,
              height: 46,
            },
            inputContainerStyle,
          ]}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_STYLE}
          inputStyle={{
            fontSize: ms(14),
            minHeight: "auto",
            paddingHorizontal: 14,
            // paddingVertical: 16,
            borderRadius: 5,
            textAlignVertical: (textArea && "top") || "center",
            color: NEW_COLOR.TEXT_BLACK,
            fontFamily: "PlusJakartaSans-Medium",
            height: inputHeight || 54,
          }}
          maxLength={
            name === "amount" || name === "zipCode"
              ? numberMaxLength(name)
              : maxLength
          }
          errorMessage={(touched && error) || error}
          errorStyle={[styles.error]}
          rightIcon={
            ((name === "password" || name === "confirmPassword") && (
              <TouchableOpacity activeOpacity={0.8}>
                <RightIcon onPress={changeSecure} secureText={secureText} />
              </TouchableOpacity>
            )) ||
            (isScanner && (
              <TouchableOpacity activeOpacity={0.8} onPress={onScannerPress}>
                <Scanbar height={s(24)} width={s(24)} />
              </TouchableOpacity>
            ))
          }
          ref={innerRef}
          autoCapitalize={autoCapitalize}
        />
      </>
    );
  }
);

export default memo(InputFiat);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  input: {
    borderRadius: 5,
    borderColor: NEW_COLOR.SEARCH_BORDER,

    borderWidth: 1,
    color: NEW_COLOR.TEXT_WHITE,
    paddingVertical: 8,
  },
  error: {
    color: NEW_COLOR.TEXT_RED,
    fontSize: ms(12),
    minHeight: 17,
    marginHorizontal: 4,
    margin: 0,
  },
  eyeIcon: {
    height: ms(15),
    width: ms(20),
  },
});
