import React, { useEffect, useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from './Picker';
import { NEW_COLOR } from '../constants/theme/variables';
import Feather from "react-native-vector-icons/Feather";
import ParagraphComponent from './Paragraph/Paragraph';

interface PhoneCodePickerProps {
  placeholder: any;
  onChange(index: number): void;
  onPress: () => void;
  data: any;
  value: any;
  customBind: Array<string>;
  containerStyle?: any;
  arrowRight: boolean;
  modalTitle?: any;
  disable?: boolean;
}
const PhoneCodePicker = ({
  placeholder,
  onChange,
  data,
  value,
  customBind,
  containerStyle,
  modalTitle,
  disable,
  arrowRight = false,
}: PhoneCodePickerProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const changeModalVisibility = (bool: any) => {
    setIsModalVisible(bool);
  };

  useEffect(() => {
    if (!value) {
      setSelected('');
    }
  }, [data, value]);

  const setData = (options: any) => {
    onChange(options);
    setSelected(options);
  };
  const handlePressLogo = () => {
    setIsModalVisible(true);
  };

  const handleOpenModel = () => {
    changeModalVisibility(false)
  }

  return (
    <View style={containerStyle}>
      <View >
        <TouchableOpacity activeOpacity={0.7} onPress={handlePressLogo}
          disabled={disable}
        >
          <View style={styles.input}>
            <ParagraphComponent style={{ color: value ? NEW_COLOR.TEXT_BLACK : NEW_COLOR.PLACEHOLDER_STYLE }} text={(typeof value === 'string' ? value : value?.name) || placeholder} />

            {!arrowRight && <Feather name="chevron-down" size={18} color={NEW_COLOR.SEARCH_BORDER} />}
            {arrowRight && <Feather name="chevron-down" size={18} color={NEW_COLOR.TEXT_BLACK} />}
          </View>
        </TouchableOpacity>
      </View>
      <Modal
        transparent
        visible={isModalVisible}
        onRequestClose={handleOpenModel}
      >
        <Picker
          data={data}
          changeModalVisible={changeModalVisibility}
          setData={setData}
          selected={selected}
          customBind={customBind}
          modalTitle={modalTitle}
        />
      </Modal>
    </View>
  );
};

export default PhoneCodePicker;

const styles = StyleSheet.create({
  placeholder: {
    color: NEW_COLOR.PLACEHOLDER_STYLE,
  },
  input: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    padding: 10, zIndex: 5, alignItems: "center",
    borderWidth: 1, borderColor: NEW_COLOR.SEARCH_BORDER,
    borderRadius: 8, minHeight: 46
  },
});