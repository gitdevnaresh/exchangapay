import React, { useEffect, useState } from 'react';
import { View, Modal,TouchableOpacity,StyleSheet } from 'react-native';
import { Picker } from './Picker';
import { s } from '../constants/theme/scale';
import { NEW_COLOR } from '../constants/theme/variables';
import ParagraphComponent from './Paragraph/Paragraph';
import { commonStyles } from './CommonStyles';
import Feather from "react-native-vector-icons/Feather";
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
        {/* A Modal renders in its own native window on iOS, so it needs its own
            provider or the SafeAreaView inside Picker gets zero insets and the
            header slides under the status bar / notch. */}
        <SafeAreaProvider>
          <Picker
            data={data}
            changeModalVisible={changeModalVisibility}
            setData={setData}
            selected={selected}
            customBind={customBind}
            modalTitle={modalTitle}
          />
        </SafeAreaProvider>
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