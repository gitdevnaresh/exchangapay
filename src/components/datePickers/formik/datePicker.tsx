import React, { useState, useMemo } from "react";
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
import { DATE_PICKER_CONST, formatDate } from "./DatePickerConstants";
import { useLngTranslation } from "../../../hooks/languagesHook/useLngTranslation";
import Feather from "react-native-vector-icons/Feather";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../CommonStyles";
import ButtonComponent from "../../buttons/button";
import ViewComponent from "../../view/view";
import LabelComponent from "../../textComponets/lableComponent/lable";
import CommonTouchableOpacity from "../../touchableComponents/touchableOpacity";
import { s } from "../../../constants/styels/scale";
import InfoTooltip from "../../tooltip/InfoTooltip";

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
  infoText?: string;
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
  infoText,
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
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
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

  const displayValue = selectedDate
    ? formatDate(selectedDate, mode)
    : t(placeholder) || format;

  const disabledIconColor = "#9098A9";

  return (
    <View>
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
        <LabelComponent text={label} style={[commonStyles.inputLabel]}>
          {required && <Text style={[commonStyles.textRed]}>*</Text>}
        </LabelComponent>
        {infoText && (
          <InfoTooltip

            linkText=""
            linkUrl=""          
            tooltipText={infoText}
            verticalGap={s(15)}
            arrowXPosition={s(0)}
            style={[commonStyles.mb8]}
          />
        )}
      </ViewComponent>
      <CommonTouchableOpacity  onPress={() => {
             Keyboard.dismiss();
            if (!disabled) {
              openPicker();
            }
          }}>
      <View
        style={[
          commonStyles.input,
          commonStyles.dflex,
          commonStyles.justifyContent,
          commonStyles.alignCenter,
          commonStyles.relative,
          touched[name] && errors[name] ? commonStyles.errorBorder : null,
          disabled && commonStyles.disabledContainerStyle,
        ]}
      >
        <Text
          style={[
            commonStyles.phonecodetextinput,
            {
              color: selectedDate
                ? NEW_COLOR.TEXT_WHITE
                : NEW_COLOR.PLACEHOLDER_TEXTCOLOR,
            },
            disabled && commonStyles.disabledTextStyle,
          ]}
        >
          {displayValue}
        </Text>

        <TouchableOpacity
          // onPress={() => !disabled && openPicker() }
          onPress={() => {
             Keyboard.dismiss();
            if (!disabled) {
              openPicker();
            }
          }}
          activeOpacity={disabled ? 1 : 0.9}
        >
          <Feather
            name={DATE_PICKER_CONST.CALENDER}
            size={s(18)}
            color={
              disabled ? disabledIconColor : iconColor ?? NEW_COLOR.TEXT_WHITE
            }
          />
        </TouchableOpacity>
      </View>
</CommonTouchableOpacity>
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
                          title="GLOBAL_CONSTANTS.CLEAR"
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
            commonStyles.inputrequirederrormessage
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
