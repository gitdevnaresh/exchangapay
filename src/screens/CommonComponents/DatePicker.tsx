import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { NEW_COLOR } from '../../constants/theme/variables';
import { } from 'react-native-gesture-handler';
import { commonStyles } from '../../components/CommonStyles';
import LabelComponent from '../../components/Paragraph/label';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  mode?: 'date' | 'time' | 'datetime' | 'countdown' | undefined;
  placeholder?: string;
  style?: any;
  minimumDate?: Date;
  maximumDate?: Date;
  iconPosition?: any;
  labelStyle?: any;
  Children?: any;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label = 'Date',
  mode = 'date',
  placeholder = 'Select a date',
  style,
  labelStyle,
  Children,
  iconPosition,
  minimumDate = undefined,
  maximumDate = undefined,
  ...rest
}) => {
  const [visible, setVisible] = useState(false);

  const showDatePicker = () => {
    setVisible(true);
  };

  const hideDatePicker = () => {
    setVisible(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    hideDatePicker();
    if (selectedDate) {
      onChange(selectedDate);
    }

  };

  return (<>
    {typeof label === "string" && <LabelComponent style={[styles.label, labelStyle, commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey]} text={label} Children={Children} />}
    <TouchableOpacity onPress={showDatePicker} activeOpacity={0.8}>
      <View style={[styles.SelectStyle]}>
        <TextInput

          mode="outlined"
          value={value.toLocaleDateString()}
          onFocus={showDatePicker}
          placeholder={placeholder}
          editable={false}
          style={[style, styles.dateinput, commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500]}
          outlineColor='transparent'

        />

        <Feather name="calendar" size={20} color={NEW_COLOR.TEXT_BLACK} />



      </View>
    </TouchableOpacity>
  </>
  );
};

const styles = StyleSheet.create({
  SelectStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", borderRadius: 12,
    borderWidth: 1,
    borderColor: NEW_COLOR.SEARCH_BORDER,
    marginBottom: 6,
    paddingHorizontal: 14,
    gap: 16,
    height: 54
  },
  dateinput: {
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0, borderBottomWidth: 0,
    borderBottomColor: "transparent", paddingLeft: 0
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center', borderBottomWidth: 1,
    borderBottomColor: NEW_COLOR.BORDER_DARK_2
  },
  iconButton: {
    position: 'absolute',
    right: -14,
  },
});

export default DatePicker;
