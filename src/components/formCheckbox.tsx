import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFormikContext } from 'formik';

interface CheckboxProps {
  fieldName: string;
  label: string;
}

const FormCheckbox: React.FC<CheckboxProps> = ({ fieldName, label }) => {
  const { values, setFieldValue,errors } = useFormikContext<any>(); // Use 'any' type for values

  const isChecked = values[fieldName];
  const error = errors[fieldName];
  const toggleCheckbox = () => {
    setFieldValue(fieldName, !isChecked);
  };

  return (<>
    <TouchableOpacity onPress={toggleCheckbox} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 24, height: 24, borderRadius: 4, borderWidth: 1, marginRight: 8, justifyContent: 'center', alignItems: 'center' }}>
        {isChecked && <View style={{ width: 12, height: 12, backgroundColor: 'green', borderRadius: 2 }} />}
      </View>
      <View ><Text>{label}</Text></View>
      
    </TouchableOpacity>
    <View>{error && <Text style={{ color: 'red' }}>{error}</Text>}</View>
    </>
  );
};

export default FormCheckbox;
