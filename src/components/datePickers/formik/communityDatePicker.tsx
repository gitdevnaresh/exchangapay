import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Datepicker } from "@ui-kitten/components";
import { useFormikContext } from "formik";
import { DATE_PICKER_CONST } from "./DatePickerConstants";
import { useLngTranslation } from "../../../hooks/languagesHook/useLngTranslation";
import Feather from "@expo/vector-icons/Feather";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../CommonStyles";
import LabelComponent from "../../textComponets/lableComponent/lable";

interface DatePickerComponentProps {
  name: string;
  label: string;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  format?: string;
  iconColor?: string;
  stylesOverride?: object;
  required?: boolean;
  disabled?: boolean;
}

const CommunityDatePickerComponent: React.FC<DatePickerComponentProps> = ({
  name,
  label,
  placeholder = DATE_PICKER_CONST.FORMAT,
  maximumDate,
  minimumDate,
  format = DATE_PICKER_CONST.FORMAT,
  iconColor,
  stylesOverride = {},
  required = true,
  disabled = false,
}) => {
  const { setFieldValue, values, errors, touched } =
    useFormikContext<{ [key: string]: any }>();
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

  // Normalize value
  const normalizeDate = (val: any): Date | undefined => {
    if (!val) return undefined;
    if (val instanceof Date && !isNaN(val.getTime())) return val;
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const selectedDate = normalizeDate(values[name]);
  const effectiveMinDate = minimumDate ?? new Date(1900, 0, 1);
  const effectiveMaxDate = maximumDate ?? new Date(2100, 11, 31);

  const handleDateSelect = (date: Date) => {
    if (!date) {
      setFieldValue(name, "");
    } else {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setFieldValue(name, `${year}-${month}-${day}`);
    }
  };

  const CalendarIcon = () => (
    <Feather
      name={DATE_PICKER_CONST.CALENDER}
      size={20}
      color={disabled ? "#9098A9" : iconColor ?? NEW_COLOR.TEXT_WHITE}
    />
  );

  return (
    <View style={stylesOverride}>
      {/* Label */}
      <LabelComponent text={label} style={[commonStyles.inputLabel]}>
        {required && <Text style={[commonStyles.textRed, commonStyles.fs12]}> *</Text>}
      </LabelComponent>

      {/* Datepicker styled like Input */}
      <Datepicker
        size="large"
        date={selectedDate}
        onSelect={handleDateSelect}
        min={effectiveMinDate}
        max={effectiveMaxDate}
        disabled={disabled}
        placeholder={t(placeholder) || format}
        accessoryRight={CalendarIcon}
        style={[
          commonStyles.input,
          commonStyles.justifyContent,
          disabled && commonStyles.disabledContainerStyle,
          touched[name] && errors[name] ? commonStyles.errorBorder : null,
        ]}
        controlStyle={{
          borderWidth: 0,
          backgroundColor: "transparent",
          alignContent: 'center',
        }}
      />
      {touched[name] && errors[name] && (
        <Text style={[commonStyles.inputrequirederrormessage]}>{t(errors[name] as string)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  errorBorder: {
    borderColor: "#FF3D71",
    borderWidth: 1,
    borderRadius: 8,
  },
  errorText: {
    color: "#FF3D71",
    fontSize: 14,
    marginTop: 4,
  },
});

export default CommunityDatePickerComponent;

