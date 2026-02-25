import React, { useState } from 'react';
import { TouchableOpacity, Modal, View, Text, TouchableWithoutFeedback, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import ViewComponent from '../view/view';
import LabelComponent from '../textComponets/lableComponent/lable';
import { getThemedCommonStyles } from '../CommonStyles';
import ButtonComponent from '../buttons/button';
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';
import Feather from '@expo/vector-icons/Feather';
import { s } from '../../constants/styels/scale';

interface MonthYearPickerProps {
  label: string;
  value: string;
  onDateChange: (formattedDate: string) => void;
  error?: string;
  minimumDate?: Date;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ label, value, onDateChange, error, minimumDate }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && date) {
        // Lock day to 1st
        const lockedDate = new Date(date.getFullYear(), date.getMonth(), 1);
        setSelectedDate(lockedDate);
        const month = String(lockedDate.getMonth() + 1).padStart(2, '0');
        const year = String(lockedDate.getFullYear()).slice(-2);
        onDateChange(`${month}/${year}`);
      }
      setShowPicker(false);
    }

    if (Platform.OS === 'ios') {
      if (event.type === 'dismissed') {
        setShowPicker(false);
        setTempDate(null);
      } else if (date) {
        // Lock day to 1st
        const lockedDate = new Date(date.getFullYear(), date.getMonth(), 1);
        setTempDate(lockedDate);
      }
    }
  };

  const handleConfirmDate = () => {
    if (tempDate) {
      setSelectedDate(tempDate);
      const month = String(tempDate.getMonth() + 1).padStart(2, '0');
      const year = String(tempDate.getFullYear()).slice(-2);
      onDateChange(`${month}/${year}`);
    }
    setShowPicker(false);
    setTempDate(null);
  };

  const handleCancelDate = () => {
    setShowPicker(false);
    setTempDate(null);
  };

  const pickerValue = tempDate || selectedDate;
  const displayValue = value || 'MM/YY';

  return (
    <View>
      <LabelComponent text={label} style={[commonStyles.inputLabel]} />
      <CommonTouchableOpacity onPress={() => setShowPicker(true)}>
        <View style={[
          commonStyles.input,
          commonStyles.dflex,
          commonStyles.justifyContent,
          commonStyles.alignCenter,
          error ? commonStyles.errorBorder : null,
        ]}>
          <Text style={[
            commonStyles.phonecodetextinput,
            { color: value ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.PLACEHOLDER_TEXTCOLOR }
          ]}>
            {displayValue}
          </Text>
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Feather name="calendar" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
          </TouchableOpacity>
        </View>
      </CommonTouchableOpacity>

      {showPicker && (
        <Modal transparent animationType="fade" visible={showPicker}>
          <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
            <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
              <TouchableWithoutFeedback>
                <View style={[commonStyles.bannerbg, commonStyles.mt10, commonStyles.rounded10, commonStyles.p10]}>
                  <DateTimePicker
                    mode="date"
                    value={new Date(pickerValue.getFullYear(), pickerValue.getMonth(), 1)}
                    onChange={handleDateChange}
                    display="spinner"
                    datePickerModeAndroid="spinner"
                    textColor={NEW_COLOR.TEXT_WHITE}
                    minimumDate={minimumDate}
                  />
                  {Platform.OS === 'ios' && (
                    <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10]}>
                      <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent title="Cancel" onPress={handleCancelDate} solidBackground={true} />
                      </ViewComponent>
                      <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent title="OK" onPress={handleConfirmDate} />
                      </ViewComponent>
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {error && (
        <Text style={[commonStyles.inputrequirederrormessage]}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default MonthYearPicker;