import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NEW_COLOR } from '../../constants/theme/variables';

import { ms } from '../../constants/theme/scale';


interface CommonAutoCompleteProps {
  label: string;
  name: string;
  api?: string;
  data?: any[];
  errors?: string;
  bindValue: string;
  dropdownCallabck?: (respData: any) => void;
  placeholder: string;
  maxLength?: number;
  starRequired?: boolean;
  disabled?: boolean;
  apiCallBack?: (callBack: any) => void;
  initialValue?: string;
  minCharAllow?:number;
  touched?:any
  loader?:boolean
}

const FormAutoCompleteDropdown: React.FC<CommonAutoCompleteProps> = ({ 
  label, 
  placeholder, 
  maxLength,
  api, 
  data, 
  errors, 
  bindValue = '', 
  dropdownCallabck, 
  starRequired, 
  disabled = false, 
  apiCallBack ,
  initialValue = '',
  minCharAllow=3,
  touched,
  loader,
}) => {
  const [dropdownList, setDropdownList] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const fetchDropdownData = async (input: string) => {
    if (api) {
      if (input.length >= minCharAllow) {
        try {
          const response = await autoCompleteApi(`${api}/${input}`);
          if (response.data) {
            validateValue(inputValue, response?.data);
          }
          setDropdownList(response?.data);
        } catch (error) {
          // Handle error
        }
      } else {
        setDropdownList([]);
      }
    } else if (apiCallBack) {
     
      if (input&&input.length >= minCharAllow) {
        apiCallBack(input);
      }else {
        apiCallBack('');
        setDropdownList([]);
      }
    } else if (data) {
      const filteredList = data.filter((item) => {
        return item[bindValue]?.toLowerCase().indexOf(input?.toLowerCase()) > -1;
      });
      validateValue(inputValue, input ? filteredList : data);
      setDropdownList(input ? filteredList : data || []);
    } else {
      setDropdownList([]);
    }
  };
  const validateValue = (val: string, list: any[]) => {
    const listRes = list.filter((item) => item[bindValue]?.toLowerCase() === val?.toLowerCase());
    if (listRes.length > 0 && dropdownCallabck) {
      dropdownCallabck(listRes[0]);
    }
  };

  const handleDropdown = (e: any) => {
    const inVal = e.nativeEvent.text || inputValue;
    const filteredData = dropdownList.filter(item => item[bindValue]?.toLowerCase() === inVal?.toLowerCase());
    if (filteredData.length < 1) {
      dropdownCallabck && dropdownCallabck(null);
    }
  };

  useEffect(() => {
    fetchDropdownData(inputValue);
  }, [inputValue]);

  useEffect(() => {
    setDropdownList(data || []);
    validateValue(inputValue, data || []);
  }, [data]);
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);
  return (
    <View style={styles.container}>
    {label &&<LabelComponent>
    {label} {starRequired && <Text style={styles.required}>*</Text>}
    </LabelComponent>}
  
  <TextInput
    style={[errors ? styles.errorBorder : null,commonStyles.textInput]}
    value={inputValue}
    placeholder={placeholder}
    maxLength={maxLength}
    editable={!disabled}
    onChangeText={(text) => setInputValue(text)}
    onBlur={handleDropdown}
    onFocus={() => setModalVisible(true)} 
    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
  
  />
   {errors && touched && <ParagraphComponent style={styles.error} text={errors} />}
      {(dropdownList.length > 0 && modalVisible&&!loader )&& (
        <FlatList
          data={dropdownList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => {
                setInputValue(item[bindValue]);
                dropdownCallabck && dropdownCallabck(item);
                setModalVisible(false);
              }}
              style={styles.dropdownItem}
            >
              <Text>{item[bindValue]}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default FormAutoCompleteDropdown;

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 4,color:NEW_COLOR.TEXT_WHITE,

  },
  errorBorder: {
    borderColor: 'red',
  },
  error: {
    color: NEW_COLOR.TEXT_RED,
    fontSize: ms(14),
    paddingTop: 4,
},
  dropdownItem: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});