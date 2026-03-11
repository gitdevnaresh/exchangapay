import React from "react";
import { TextInput, Platform, ToastAndroid, Alert } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { s } from "../theme/scale";
import ViewComponent from "../view/view";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";

interface WithdrawAmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  containerStyle?: any;
  inputStyle?: any;
  minLimit?: number;
  maxLimit?: number;
  availableBalance?: number;
}

const AmountInput: React.FC<WithdrawAmountInputProps> = ({
  value,
  onChangeText,
  placeholder = "0",
  editable = true,
  containerStyle,
  inputStyle,
  minLimit = 0,
  maxLimit,
  availableBalance,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  // ✅ Format in Indian Numbering System
  const formatIndian = (numStr: string) => {
    if (!numStr) return "";
    const [intPartRaw, decimalPart] = numStr.split(".");
    const intPart = intPartRaw.replace(/^0+(?!$)/, ""); // remove leading 0s

    let lastThree = intPart.slice(-3);
    let other = intPart.slice(0, -3);

    if (other !== "") {
      lastThree = "," + lastThree;
      other = other.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    }

    let formatted = other + lastThree;

    if (decimalPart !== undefined) {
      formatted += "." + decimalPart.slice(0, 2); // only 2 decimals
    }

    return formatted;
  };

  const handleChange = (text: string) => {
    // Only allow numbers and decimal point
    const numericOnly = text.replace(/[^0-9.]/g, "");
    
    // strip commas
    const cleaned = numericOnly.replace(/,/g, "");

    // split into int + decimal
    const [intPart, decimalPart] = cleaned.split(".");

    // 🚨 Allow only one "."
    if ((cleaned.match(/\./g) || []).length > 1) return;

    // 🚨 Restrict 8 digits before "."
    if (intPart.length > 6) {
      // allow if user just typed "." after 8 digits
      if (decimalPart === undefined && text.endsWith(".")) {
        onChangeText(formatIndian(intPart) + ".");
      }
      return;
    }

    // 🚨 Restrict decimals to 2
    if (decimalPart !== undefined && decimalPart.length > 2) return;

    const formatted = formatIndian(cleaned);
    onChangeText(formatted);
  };

  const validateOnBlur = () => {
    if (!value) return;
    const numValue = parseFloat(value.replace(/,/g, ""));
    if (isNaN(numValue)) return;

    let msg = "";
    if (numValue < minLimit) msg = `Amount must be at least ${minLimit}`;
    else if (maxLimit !== undefined && numValue > maxLimit)
      msg = `Amount cannot exceed ${maxLimit}`;
    else if (availableBalance !== undefined && numValue > availableBalance)
      msg = `Amount cannot exceed available balance (${availableBalance})`;

    // if (msg) {
    //   if (Platform.OS === "android") {
    //     ToastAndroid.show(msg, ToastAndroid.SHORT);
    //   } else {
    //     Alert.alert("Invalid Amount", msg);
    //   }
    // }
  };

  return (
    <ViewComponent
      style={[{ alignItems: "center", marginVertical: s(32) }, containerStyle]}
    >
      <TextInput
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={NEW_COLOR.TEXT_GREY}
        keyboardType="number-pad"
        editable={editable}
        textAlign="center"
        style={[
          {
            color: NEW_COLOR.TEXT_WHITE,
            fontSize: s(40),
            includeFontPadding: false,
            textAlignVertical: "center",
          },
          commonStyles.fw700,
          inputStyle,
        ]}
        onBlur={validateOnBlur}
      />
    </ViewComponent>
  );
};

export default AmountInput;
