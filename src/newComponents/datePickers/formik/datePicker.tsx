import React, { useState } from "react";
import { StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Feather from "react-native-vector-icons/Feather";
import { useFormikContext } from "formik";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import { commonStyles } from "../../theme/commonStyles";
import LabelComponent from "../../textComponets/lableComponent/lable";
import moment from "moment";
import { NEW_COLOR } from "../../../constants/theme/variables";
import ParagraphComponent from "../../textComponets/paragraphText/paragraph";
import CommonTouchableOpacity from "../../touchableComponents/touchableOpacity";
import ViewComponent from "../../view/view";
import { AntDesign } from '@expo/vector-icons';
import { s } from "../../theme/scale";

interface DatePickerComponentProps {
  name: string;
  label: string;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  mode?: string;                  // need to  pass parameters as : "date" | "time" | "datetime"; 
  format?: string;
  iconColor?: string;
  stylesOverride?: object;
  required?: boolean;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerComponentProps> = ({
  name,
  label,
  placeholder = "DD-MM-YYYY",
  maximumDate,
  minimumDate = new Date(1900, 0, 1),
  mode = "date",
  format = "DD-MM-YYYY",
  iconColor = NEW_COLOR.TEXT_WHITE,
  required = true,
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const { setFieldValue, values, errors, touched } =
    useFormikContext<{ [key: string]: any }>();
  const selectedDate: Date | null = values[name];
  const { t } = useLngTranslation();

  const formatDate = (date: Date | null, format = 'DD-MM-YYYY'): string => {
    if (!date) return 'DD-MM-YYYY';
    return moment(date).format(format);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowPicker(false);
    if (event.type === "set" && date) {
      setFieldValue(name, date);
    } else {
      setFieldValue(name, null);
    }
    if (event.type === "set" && date) {
      setFieldValue(name, date); // Set the selected date
    }
  };


  return (
    <ViewComponent >


      <ViewComponent style={[commonStyles.input, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.relative, touched[name] && errors[name] ? commonStyles.errorBorder : null]}>
        <LabelComponent text={t(label)} style={[commonStyles.inputLabel]} >{required && <ParagraphComponent style={[commonStyles.textRed]}>*</ParagraphComponent>}</LabelComponent>
        <ParagraphComponent
          style={[commonStyles.fs16, commonStyles.fw400,
          {
            color: selectedDate ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.PLACEHOLDER_COLOR,
          },
          ]}
        >
          {selectedDate
            ? formatDate(selectedDate)
            : t(placeholder) || placeholder || format}
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
        <CommonTouchableOpacity onPress={() => !disabled && setShowPicker(true)} activeOpacity={0.9}>
          <Feather name={"calendar"} size={22} color={iconColor} />
        </CommonTouchableOpacity>
      </ViewComponent>



      {touched[name] && errors[name] && (
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
          <AntDesign
            name="closecircleo"
            size={s(14)}
            color={NEW_COLOR.TEXT_RED}
            style={[commonStyles.mt6]}
          />
          <ParagraphComponent style={[styles.errorText, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]}>{t(errors[name])}</ParagraphComponent>
        </ViewComponent>
      )}
    </ViewComponent>
  );
};

export default DatePicker;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    color: NEW_COLOR.TEXT_GREY2
  },
  requiredText: {
    fontSize: 14,
    color: NEW_COLOR.TEXT_RED,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_GREY,
    borderRadius: 8,
    padding: 12,
    color: NEW_COLOR.TEXT_WHITE,
  },
  placeholderText: {
    fontSize: 12,
    color: NEW_COLOR.TEXT_GREY2,
    flex: 1,
  },
  inputText: {
    fontSize: 12,
    color: NEW_COLOR.TEXT_WHITE,
  },
  errorText: {
    color: NEW_COLOR.TEXT_RED,
  },
});
