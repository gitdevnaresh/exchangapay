import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Feather from "react-native-vector-icons/Feather";
import { useFormikContext } from "formik";
import { useLngTranslation } from "../../../hooks/languagesHook/useLngTranslation";
import LabelComponent from "../../textComponets/lableComponent/lable";
import { NEW_COLOR } from "../../../constants/styels/variables";
import ParagraphComponent from "../../textComponets/paragraphText/paragraph";
import CommonTouchableOpacity from "../../touchableComponents/touchableOpacity";
import ViewComponent from "../../view/view";
import moment from "moment";
import { s } from "../../../constants/styels/scale";
import { getThemedCommonStyles } from "../../CommonStyles";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";

interface DatePickerComponentProps {
  name: string;
  label: string;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  mode?: "date" | "time" | "datetime";
  format?: string;
  labelStyle?: any;
  stylesOverride?: object;
  required?: boolean;
  disabled?: boolean;
}

const DatePickerWithFormik: React.FC<DatePickerComponentProps> = ({
  name,
  label,
  placeholder = "DD-MM-YYYY",
  maximumDate,
  minimumDate = new Date(1900, 0, 1),
  mode = "date",
  format = "DD-MM-YYYY",
  labelStyle,
  required = true,
  disabled = false,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const { setFieldValue, values, errors, touched } = useFormikContext<{ [key: string]: any }>();
  const selectedDate: Date | null = values[name];
  const { t } = useLngTranslation();

  useEffect(() => {
    if (values[name] && !showPicker) {
      setFieldValue(name, values[name]);
    }
  }, [values[name]]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowPicker(false);
    if (event.type === "set" && date) {
      setFieldValue(name, date);
    } else {
      setFieldValue(name, null);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return t(placeholder) || format;
    return moment(date).format(format);
  };

  return (
    <ViewComponent >


      <ViewComponent style={[commonStyles.relative, commonStyles.textInput, touched[name] && errors[name] ? commonStyles.errorBorder : null,
      commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter, commonStyles.justifyContent, disabled ? commonStyles.disabledBg : null]}>
        <LabelComponent text={t(label)} style={[commonStyles.inputLabel, labelStyle]}>
          {required && <ParagraphComponent style={styles.requiredText}>*</ParagraphComponent>}
        </LabelComponent>
        <ParagraphComponent
          style={[
            commonStyles.fs16, commonStyles.fw400,
            {
              color: selectedDate ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.PLACEHOLDER_COLOR,
            },
          ]}
        >
          {formatDate(selectedDate)}
        </ParagraphComponent>
        {showPicker && (
          <DateTimePicker
            mode={mode}
            value={selectedDate instanceof Date ? selectedDate : new Date()}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleDateChange}
            themeVariant="dark"
          />
        )}
        <CommonTouchableOpacity
          onPress={() => !disabled && setShowPicker(true)}
          activeOpacity={0.9}
          disabled={disabled}
        >
          <Feather
            name={"calendar"}
            size={s(22)}
            color={disabled ? NEW_COLOR.TEXT_GREY : NEW_COLOR.PRiMARY_COLOR}
          />
        </CommonTouchableOpacity>


      </ViewComponent>

      {touched[name] && errors[name] && (
        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textRed]}>
          {t(errors[name])}
        </ParagraphComponent>
      )}
    </ViewComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: NEW_COLOR.TEXT_GREY2,
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_GREY,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
  },
  inputText: {
    fontSize: 16,
    fontWeight: "400",
  },
  errorText: {
    fontSize: 12,
    color: NEW_COLOR.TEXT_RED,
    marginTop: 4,
  },
  errorBorder: {
    borderColor: NEW_COLOR.TEXT_RED,
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: NEW_COLOR.DISABLED_BG
  },
  requiredText: {
    color: NEW_COLOR.TEXT_RED,
    marginLeft: 4,
  }
});

export default DatePickerWithFormik;