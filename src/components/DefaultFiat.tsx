import React, { memo, forwardRef, useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
  Image,
} from "react-native";
import { ms, s } from "../constants/theme/scale";
import { NEW_COLOR } from "../constants/theme/variables";
import { commaSeparating } from "../utils/helpers";
import LabelComponent from "./Paragraph/label";
import { commonStyles } from "./CommonStyles";
import icons from "../.../../assets/icons";
import { Scanbar } from "../assets/svg";

interface Props {
  field: any;
  form: any;
  label?: string;
  placeholder?: string;
  error?: string;
  editable?: boolean;
  keyboardType?: any;
  maxLength?: number;
  multiline?: boolean;
  inputHeight?: number;
  textArea?: boolean;
  isScanner?: boolean;
  onScannerPress?: () => void;
  onChangeText?: (text: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  Children?: any;
  labelStyle?: any;
}

const InputFiat = forwardRef<TextInput, Props>(
  (
    {
      field: { name, value },
      form: { setFieldValue, handleBlur },
      label,
      placeholder,
      error,
      editable = true,
      keyboardType = "default",
      maxLength,
      multiline = false,
      inputHeight = 46, // ✅ SAME AS OLD
      textArea = false,
      isScanner = false,
      onScannerPress,
      onChangeText,
      autoCapitalize = "none",
      Children,
      labelStyle,
    },
    ref
  ) => {
    const [secureText, setSecureText] = useState(false);

    useEffect(() => {
      if (name?.toLowerCase().includes("password")) {
        setSecureText(true);
      }
    }, [name]);

    const formatAmount = (val: any) => {
      if (!val) return "";
      let result = val.toString();
      if ((result.match(/\./g) || []).length > 1) {
        result = result.slice(0, -1);
      }
      const [before, after] = result.replace(/[^0-9.]/g, "").split(".");
      return `${commaSeparating(before, 3)}${after ? `.${after.slice(0, 2)}` : ""}`;
    };

    const displayValue =
      name === "amount" ? formatAmount(value) : value;

    return (
      <>
        {label && (
          <LabelComponent
            text={label}
            Children={Children}
            style={[
              commonStyles.fs12,
              commonStyles.fw500,
              NEW_COLOR.TEXT_LABEL,
              labelStyle,
            ]}
          />
        )}

        <View
          style={[
            styles.container,
            {
              minHeight: error ? ms(56) : ms(46), // ✅ SAME LOGIC AS OLD
              backgroundColor: editable
                ? NEW_COLOR.SCREENBG_WHITE
                : NEW_COLOR.DISABLED_INPUTBG,
              borderColor: NEW_COLOR.SEARCH_BORDER,
            },
          ]}
        >
          <TextInput
            ref={ref}
            value={displayValue}
            editable={editable}
            placeholder={placeholder}
            keyboardType={keyboardType}
            secureTextEntry={secureText}
            multiline={multiline}
            autoCapitalize={autoCapitalize}
            onBlur={() => handleBlur(name)}
            onChangeText={(text) => {
              setFieldValue(name, text);
              onChangeText?.(text);
            }}
            maxLength={maxLength}
            placeholderTextColor={NEW_COLOR.PLACEHOLDER_STYLE}
            style={[
              styles.input,
              {
                height: inputHeight, // ✅ IMPORTANT
                paddingVertical: Platform.OS === "ios" ? ms(14) : ms(10),
                textAlignVertical: textArea ? "top" : "center",
              },
            ]}
          />

          {(name === "password" || name === "confirmPassword") && (
            <Pressable onPress={() => setSecureText(!secureText)}>
              <Image
                source={secureText ? icons.eyeSlashGray : icons.eyeGray}
                style={styles.eyeIcon}
              />
            </Pressable>
          )}

          {isScanner && (
            <Pressable onPress={onScannerPress}>
              <Scanbar width={s(24)} height={s(24)} />
            </Pressable>
          )}
        </View>

        {!!error && (
          <LabelComponent text={error} style={styles.errorText} />
        )}
      </>
    );
  }
);


export default memo(InputFiat);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: ms(14),
    color: NEW_COLOR.TEXT_BLACK,
    fontFamily: "PlusJakartaSans-Medium",
    // ❌ removed height: "100%"
  },
  eyeIcon: {
    width: ms(20),
    height: ms(15),
    marginLeft: 10,
  },
  errorText: {
    color: NEW_COLOR.TEXT_RED,
    fontSize: ms(12),
    marginTop: 4,
    marginHorizontal: 4,
    minHeight: 17, // ✅ same as old
  },
});

