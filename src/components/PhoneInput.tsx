import React, { useEffect, useState, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { NEW_COLOR } from '../constants/theme/variables';
import { text } from '../constants/theme/mixins';
import AntDesign from "react-native-vector-icons/AntDesign";
import Text from '../components/Text';

interface propTypes {
  field: any,
  form: any,
  error: any,
  placeholder: any,
  touched: any,
  onChange: any,
  setFieldValue: any,
  customContainerStyle: any,
  onBlur: any,
  innerRef: any,
  label: any
}

const PhoneEntry = forwardRef(({
  field: { name, value },
  form: { setFieldValue },
  error,
  onChange,
  placeholder,
  customContainerStyle,
  touched,
  onBlur,
  innerRef,
  label
}: propTypes,
  // eslint-disable-next-line no-unused-vars
  ref) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleChangeValue = (text: any) => {
    onBlur(name);
    setFieldValue(name, text);
    if (onChange !== null) {
      onChange(text);
    }
  };

  const cleanTextFields = () => {
    setPhoneNumber('');
    innerRef?.current?.setState({ number: '' });
  };

  useEffect(() => {
    cleanTextFields();
    return () => {
      cleanTextFields();
    };
  }, []);

  // const getCurrentCountry = () => {
  //   return RNLocalize.getLocales()[103].countryCode;
  // };

//   const getCurrentCountry = () => {
//     const locales = RNLocalize.getLocales();
//     const indianLocaleIndex = locales.findIndex(locale => locale.countryCode === 'IN');
//     if (indianLocaleIndex !== -1) {
//         return locales[indianLocaleIndex].countryCode;
//     } else {
//         return 'IN';
//     }
// };
  // const defaultCode = getCurrentCountry();

  return (
    <View style={[styles.container, customContainerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <PhoneInput
        codeTextStyle={{ color: '#000' }}
        ref={innerRef}
        name={name}
        value={value}
        defaultValue={phoneNumber}
         // defaultCode={defaultCode}
        layout='second'
        withShadow
        containerStyle={[
          styles.phoneContainer,
          {
            borderColor: touched && error
              ? NEW_COLOR.BORDER_RED : NEW_COLOR.BORDER_SECONDARY,
          },
        ]}
        textContainerStyle={styles.textInput}
        flagButtonStyle={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 50,
          borderBottomLeftRadius: 50,
          borderTopRightRadius: 1,
          borderBottomRightRadius: 1,
          borderWidth: 1,
          borderColor: "#5F5959",
          paddingLeft: 10,
          paddingRight: 10,
        }}
        textInputStyle={{
          backgroundColor: '#fff',
          paddingRight: 20,
          paddingLeft: 10,
          paddingVertical: 30,
          borderTopRightRadius: 50,
          borderBottomRightRadius: 50,
          marginRight: 1,
          marginVertical: 1,
          borderWidth: 1,
          borderColor: "#5F5959",
        }}
        textInputProps={{ placeholderTextColor: '#B1B1B1', color: "#000" }}
        placeholder={placeholder}
        onChangeText={(text: any) => {
          setPhoneNumber(text);
        }}
        onChangeFormattedText={(text: any) => {
          handleChangeValue(text);
        }}
        renderDropdownImage={<AntDesign name="down" size={16} color={NEW_COLOR.TEXT_BLACK} />}
      />
      <Text style={styles.error}>{touched && error && error}</Text>
    </View>
  );
});
export default PhoneEntry;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  phoneContainer: {
    shadowOpacity: 0,
    borderRadius: 0,
    width: '100%',
    display: 'flex',
    elevation: 5,
    borderWidth: 0,
    backgroundColor: '#fff',
  },
  textInput: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    backgroundColor: '#fff',
  },
  label: {
    color: "#B1B1B1",
    fontSize: 15,
    fontWeight: 'normal',
    paddingVertical: 0,
    marginBottom: 7,
    marginLeft: 11,
  },
  error: {
    ...text(13, 16.8, 400, NEW_COLOR.TEXT_RED),
    minHeight: 17,
    margin: 0,
    alignSelf: 'flex-end',
  },
});