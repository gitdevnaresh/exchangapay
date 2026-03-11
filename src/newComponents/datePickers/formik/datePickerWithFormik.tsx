import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFormikContext } from "formik";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import Feather from "@expo/vector-icons/Feather";
import { useThemeColors } from "../../../hooks/useThemeColors";
import ButtonComponent from "../../buttons/button";
import ViewComponent from "../../view/view";
import LabelComponent from "../../textComponets/lableComponent/lable";
import CommonTouchableOpacity from "../../touchableComponents/touchableOpacity";
import { s } from "../../theme/scale";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import { DATE_PICKER_CONST, formatDate } from "./datePickerConstants";

interface DatePickerComponentProps {
  name: string;
  label: string;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  mode?: "date" | "time" | "datetime";
  format?: string;
  iconColor?: string;
  stylesOverride?: object;
  required?: boolean;
  disabled?: boolean;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  name,
  label,
  placeholder = DATE_PICKER_CONST.FORMAT,
  maximumDate,
  minimumDate = new Date(1900, 0, 1),
  mode = DATE_PICKER_CONST.DATE as "date",
  format = DATE_PICKER_CONST.FORMAT,
  iconColor,
  stylesOverride = {},
  required = true,
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  // Add state to track picker mode for Android
  const [androidMode, setAndroidMode] = useState<"date" | "time">("date");
  const { setFieldValue, values, errors, touched } =
    useFormikContext<{ [key: string]: any }>();
  const selectedDate: Date | null = values[name];
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyeles(NEW_COLOR);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      if (mode === "datetime") {
        if (event.type === "set") {
          if (androidMode === "date") {
            setTempDate(date || new Date());
            setAndroidMode("time"); // Switch to time picker
          } else if (androidMode === "time") {
            // Merge tempDate and new time
            const finalDate = tempDate ? new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), date.getHours(), date.getMinutes()) : date;
            setFieldValue(name, finalDate);
            setShowPicker(false);
            setAndroidMode("date"); // Reset mode for next time
          }
        } else if (event.type === "neutralButtonPressed") {
          // Handle Clear button for Android
          setFieldValue(name, null);
          setShowPicker(false);
          setAndroidMode("date");
        } else {
          // 'dismissed' or 'cancel' event
          setShowPicker(false);
          setAndroidMode("date"); // Reset mode
        }
      } else { // Handle 'date' or 'time' mode
        if (event.type === "set" && date) {
          setFieldValue(name, date);
        } else if (event.type === "neutralButtonPressed") {
          setFieldValue(name, null);
        }
        setShowPicker(false);
      }
    }

    if (Platform.OS === "ios") {
      if (event.type === "dismissed") {
        setShowPicker(false);
        setTempDate(null);
      } else if (date) {
        setTempDate(date);
      }
    }
  };

  const handleConfirmDate = () => {
    if (tempDate) {
      setFieldValue(name, tempDate);
    }
    setShowPicker(false);
    setTempDate(null);
  };

  const handleCancelDate = () => {
    setFieldValue(name, null); // <-- Clear the date in Formik
    setShowPicker(false);
    setTempDate(null);
  };

  const openPicker = () => {
    setShowPicker(true);
    if (Platform.OS === "android" && mode === "datetime") {
      setAndroidMode("date");
    }
  }

  const pickerValue =
    selectedDate instanceof Date ? selectedDate : tempDate || new Date();

    //   const displayValue = selectedDate
    // ? formatDate(selectedDate, mode)
    // : t(placeholder) || format;
  const displayValue = selectedDate ? formatDate(selectedDate, mode) : '';

  const disabledIconColor = "#9098A9";
  return (
    <View>
      <LabelComponent text={label} multiLanguageAllows={true} style={[commonStyles.inputLabel]}>
        {required &&<LabelComponent style={[commonStyles.textRed]}> *</LabelComponent>}
      </LabelComponent>
      <TouchableOpacity
        onPress={() => {
          if (disabled) return;
          Keyboard.dismiss();
          openPicker();
        }}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <View
          style={[
            commonStyles.textInput,
            commonStyles.dflex,
            commonStyles.justifyContent,
            commonStyles.alignCenter,
            commonStyles.relative,
            touched[name] && errors[name] ? commonStyles.errorBorder : null,
            { backgroundColor: disabled ? NEW_COLOR.INPUT_BORDER : NEW_COLOR.INPUTFIELD_BG },
          ]}
        >
          <Text
            style={[
              commonStyles.phonecodetextinpu,
              {
                color: selectedDate
                  ? NEW_COLOR.TEXT_WHITE
                  : NEW_COLOR.PLACEHOLDER_TEXTCOLOR,
              },
            ]}
          >
            {displayValue || ''}
          </Text>
          <Feather
            name={DATE_PICKER_CONST.CALENDER}
            size={s(18)}
            color={
              disabled ? disabledIconColor : iconColor ?? NEW_COLOR.TEXT_WHITE
            }
          />
        </View>
      </TouchableOpacity>
      {showPicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
            <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
              <TouchableWithoutFeedback>
                <View style={[commonStyles.bannerbg, commonStyles.mt10, commonStyles.rounded10, commonStyles.p10]}>
                  <DateTimePicker
                    mode={Platform.OS === "ios" ? mode : androidMode}
                    value={pickerValue}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    onChange={handleDateChange}
                    positiveButton={{ label: "Ok", textColor: NEW_COLOR.TEXT_PRIMARY }}
                    display="spinner"
                    textColor={NEW_COLOR.TEXT_WHITE}
                    neutralButtonLabel={Platform.OS === "android" ? "Clear" : undefined}
                  />
                  {Platform.OS === "ios" && (
                    <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10]}>
                      <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                          title="GLOBAL_CONSTANTS.CANCEL"
                          onPress={handleCancelDate} // <-- Use the handler here
                          solidBackground={true}
                        />
                      </ViewComponent>
                      <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent title="GLOBAL_CONSTANTS.OK" onPress={handleConfirmDate} />
                      </ViewComponent>
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {touched[name] && errors[name] && (
        <Text
          style={[
            commonStyles.inputerrormessage
          ]}
        >
          {t(errors[name] as string)}
        </Text>
      )}
    </View>
  );
};

export default DatePickerComponent;

const screenStyeles = (NEW_COLOR: any) =>
  StyleSheet.create({
    pickerContainer: {
      backgroundColor: NEW_COLOR.BACKGROUND,
      borderRadius: 12,
      padding: 16,
    },
    errorText: {
      color: NEW_COLOR.TEXT_RED,
    },
  });