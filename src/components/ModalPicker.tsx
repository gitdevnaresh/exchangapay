import React, { useEffect, useState } from 'react';
import { View, Modal,TouchableOpacity,Image,StyleSheet } from 'react-native';
import Text from '../components/Text';
import { Picker } from './Picker';
import { ms, s } from '../constants/theme/scale';
import { text } from '../constants/theme/mixins';
import { NEW_COLOR } from '../constants/theme/variables';
import AntDesign from "react-native-vector-icons/AntDesign";
import Icons from '../assets/icons';
import ParagraphComponent from './Paragraph/Paragraph';
import { commonStyles } from './CommonStyles';
import { Arrowdown } from '../assets/svg';
import Feather from "react-native-vector-icons/Feather";
import { ActivityIndicator } from 'react-native';

interface ModalPickerProps {
   placeholder:any;
   onChange(index: number): void;
   onPress: () => void;
   data:any;
   value:any;
   customBind:Array<string>;
   modalTitle?:any;
   isDropdownText?:boolean;
   disable?:boolean
   isLoading?:boolean
  }
const ModalPicker = ({
  placeholder,
  onChange,
  data,
  value,
  customBind,
  modalTitle,
  isDropdownText,
  disable,
  isLoading=false
}:ModalPickerProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const changeModalVisibility = (bool:any) => {
    setIsModalVisible(bool);
  };

  useEffect(() => {
    if (!value) {
      setSelected('');
    }
  }, [data, value]);

  const setData = (options:any) => {
    onChange(options);
    setSelected(options);
  };
  const handleOpenModel=()=>{
    setIsModalVisible(true);
  };

  return (
    < >
      {!isDropdownText&&<View >
        <TouchableOpacity activeOpacity={0.8} onPress={handleOpenModel} disabled={disable}>
        <View style={[styles.input,disable ? commonStyles.disabledBg : null]}>
            <ParagraphComponent style={[commonStyles.flex1,{ color: value? NEW_COLOR.TEXT_BLACK : NEW_COLOR.PLACEHOLDER_STYLE }]} text={(typeof value ==='string'? value : value?.name )|| placeholder} />
            {!isLoading&&<Feather name="chevron-down" size={s(18)} color={NEW_COLOR.SEARCH_BORDER} />}
            {isLoading&&<ActivityIndicator size={s(18)} color={NEW_COLOR.BG_ORANGE}/>}
          </View>
        </TouchableOpacity>
      </View>}
      {isDropdownText&&<View >
        <TouchableOpacity activeOpacity={0.8} onPress={handleOpenModel}>
            <Feather name="chevron-down" size={s(18)} color={NEW_COLOR.SEARCH_BORDER} />
        </TouchableOpacity>
      </View>}
      <Modal
        transparent={false}
        visible={isModalVisible}
        onRequestClose={() => changeModalVisibility(false)}
        animationType="slide"
        style={{ flex: 1 }}
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
    </>
  );
};

export default ModalPicker;

const styles = StyleSheet.create({
    placeholder: {
      color: NEW_COLOR.TEXT_GREY,
    },
    input: {
      padding: 14,
      borderWidth: 1,
      borderColor: NEW_COLOR.SEARCH_BORDER,
      backgroundColor:NEW_COLOR.SCREENBG_WHITE,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems:"center",
      minHeight:46,
    },
  });