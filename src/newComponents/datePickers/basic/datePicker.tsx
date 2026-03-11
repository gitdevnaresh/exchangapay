import React, { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import Feather from "react-native-vector-icons/Feather";
import ViewComponent from "../../view/view";
import LabelComponent from "../../textComponets/lableComponent/lable";
import { NEW_COLOR } from "../../../constants/theme/variables";
import moment from "moment";
import ParagraphComponent from "../../textComponets/paragraphText/paragraph";
import CommonTouchableOpacity from "../../touchableComponents/touchableOpacity";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";

interface DatePickerComponentProps {
  label: string;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  mode?: string; 
  format?: string;
  iconColor?: string;
  stylesOverride?: object;
  required?: boolean;
  value?: Date; 
  onDateChange: (date: Date) => void; // Callback for date change, passed from the parent component
}

const DatePickerWithOutFormik: React.FC<DatePickerComponentProps> = ({
  label,
  placeholder = "DD-MM-YYYY",
  maximumDate,
  minimumDate = new Date(1900, 0, 1),
  mode = "date",
  format = "DD-MM-YYYY",
  iconColor = NEW_COLOR.TEXT_WHITE,
  required = true,
  onDateChange,
  value,
}) => {
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { t } = useLngTranslation();
const REVERSE_NEW_COLOR = useThemeColors(true);
    const commonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  useEffect(() => {
    if (value && !(selectedDate instanceof Date)) {
      setSelectedDate(value);
    }
  }, [value]); // Re-run effect when value prop changes

  const handleDateChange = (event: any, date?: Date) => {
    setShowPicker(false);    
    if (event.type === 'set' && date) {
      setSelectedDate(date);
      onDateChange(date); // Call the onDateChange function passed from the parent
    }
  };

  const formatDate = (date: Date | null, format = 'DD-MM-YYYY'): string => {
    if (!date) return placeholder || format;
    return moment(date).format(format);
  };

  return (
    <ViewComponent>
      <ViewComponent
        style={[
          commonStyles.input,
          commonStyles.dflex,
          commonStyles.justifyContent,
          commonStyles.alignCenter,
          commonStyles.relative,
        ]}
      >
        <LabelComponent text={t(label)} style={[commonStyles.inputLabel]}>
          {required && <ParagraphComponent style={[commonStyles.textRed]}>*</ParagraphComponent>}
        </LabelComponent>

        <ParagraphComponent
          style={[
            commonStyles.fs16,
            commonStyles.fw400,
            {
              color: selectedDate ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.PLACEHOLDER_COLOR,
            },
          ]}
        >
          {selectedDate ? formatDate(selectedDate) : formatDate(null)} {/* Display formatted date or placeholder */}
        </ParagraphComponent>

        {showPicker && (
          <DateTimePicker
            mode={mode}
            value={selectedDate instanceof Date ? selectedDate : new Date()} // Ensure a valid date is passed
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleDateChange}
            themeVariant="dark"
          />
        )}
        <CommonTouchableOpacity onPress={() => setShowPicker(true)}>
          <Feather name={"calendar"} size={22} color={iconColor} />
        </CommonTouchableOpacity>
      </ViewComponent>
    </ViewComponent>
  );
};

export default DatePickerWithOutFormik;
