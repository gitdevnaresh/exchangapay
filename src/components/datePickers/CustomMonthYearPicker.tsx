import React, { useState } from 'react';
import { TouchableOpacity, Modal, View, Text, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import LabelComponent from '../textComponets/lableComponent/lable';
import { getThemedCommonStyles } from '../CommonStyles';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';
import Feather from '@expo/vector-icons/Feather';
import { s } from '../../constants/styels/scale';

interface MonthYearPickerProps {
  label: string;
  value: string;
  onDateChange: (formattedDate: string) => void;
  error?: string;
  isRequired?: boolean;
  placeholder?: string;
  touched?: boolean;
  focused?: boolean;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ label, value, onDateChange, error, isRequired, placeholder, touched, focused }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState<number | null>(null);
  const [tempYear, setTempYear] = useState<number | null>(null);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayYear = tempYear !== null ? tempYear : selectedYear;
  const months = displayYear === currentYear ? allMonths.slice(currentMonth) : allMonths;
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);

  const handleYearChange = (year: number) => {
    setTempYear(year);
    const currentTempMonth = tempMonth !== null ? tempMonth : selectedMonth;
    if (year === currentYear && currentTempMonth < currentMonth) {
      setTempMonth(currentMonth);
    }
  };

  const handleConfirm = () => {
    const finalMonth = tempMonth !== null ? tempMonth : selectedMonth;
    const finalYear = tempYear !== null ? tempYear : selectedYear;
    const month = String(finalMonth + 1).padStart(2, '0');
    const year = String(finalYear).slice(-2);
    onDateChange(`${month}/${year}`);
    setSelectedMonth(finalMonth);
    setSelectedYear(finalYear);
    setShowPicker(false);
    setTempMonth(null);
    setTempYear(null);
  };

  const handleClear = () => {
    onDateChange('');
    setShowPicker(false);
    setTempMonth(null);
    setTempYear(null);
  };

  const handleCancel = () => {
    setShowPicker(false);
    setTempMonth(null);
    setTempYear(null);
  };

  const displayValue = value ? value : placeholder ? placeholder : 'MM/YY';

  return (
    <View>
      <LabelComponent text={label} style={[commonStyles.inputLabel]}
        children={<LabelComponent text={isRequired ? " *" : ""} style={[commonStyles.textError]} />} />
      <CommonTouchableOpacity onPress={() => setShowPicker(true)}>
        <View style={[
          commonStyles.input,
          commonStyles.dflex,
          commonStyles.justifyContent,
          commonStyles.alignCenter,
          (showPicker) && !error ? commonStyles.hoverborder : null,
          (error && touched) ? commonStyles.errorBorder : null,
        ]}>
          <Text style={[
            commonStyles.monthYearText,
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
        <Modal
          transparent
          animationType="fade"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <TouchableWithoutFeedback onPress={handleCancel}>
            <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
              <TouchableWithoutFeedback>
                <View style={[commonStyles.bannerbg, commonStyles.mt10, commonStyles.rounded10, commonStyles.p10, { width: 380 }]}>
                  <View style={[commonStyles.dflex, { height: 200 }]}>
                    <ScrollView style={[commonStyles.flex1, { marginRight: 10 }]} showsVerticalScrollIndicator={false}>
                      {months.map((month, index) => {
                        const monthIndex = displayYear === currentYear ? currentMonth + index : index;
                        const displayMonth = tempMonth !== null ? tempMonth : selectedMonth;
                        return (
                          <TouchableOpacity
                            key={month}
                            onPress={() => setTempMonth(monthIndex)}
                            style={[
                              commonStyles.p10,
                              commonStyles.alignCenter,
                              displayMonth === monthIndex && { backgroundColor: NEW_COLOR.TEXT_PRIMARY }
                            ]}
                          >
                            <Text style={[{ color: NEW_COLOR.TEXT_WHITE, fontSize: 16 }]}>{month}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                    <ScrollView style={[commonStyles.flex1]} showsVerticalScrollIndicator={false}>
                      {years.map((year) => (
                        <TouchableOpacity
                          key={year}
                          onPress={() => handleYearChange(year)}
                          style={[
                            commonStyles.p10,
                            commonStyles.alignCenter,
                            displayYear === year && { backgroundColor: NEW_COLOR.TEXT_PRIMARY }
                          ]}
                        >
                          <Text style={[{ color: NEW_COLOR.TEXT_WHITE, fontSize: 16 }]}>{year}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10]}>
                    <TouchableOpacity style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.p10]} onPress={handleCancel}>
                      <ParagraphComponent text="Cancel" style={[{ color: NEW_COLOR.TEXT_WHITE }]} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.p10]} onPress={handleClear}>
                      <ParagraphComponent text="GLOBAL_CONSTANTS.CLEAR" style={[{ color: NEW_COLOR.TEXT_WHITE }]} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.p10]} onPress={handleConfirm}>
                      <ParagraphComponent text="GLOBAL_CONSTANTS.OK" style={[{ color: NEW_COLOR.TEXT_WHITE }]} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {error && touched && (
        <Text style={[commonStyles.inputrequirederrormessage]}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default MonthYearPicker;
