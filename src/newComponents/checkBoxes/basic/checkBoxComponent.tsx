import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ViewComponent from '../../view/view';
import { commonStyles } from '../../theme/commonStyles';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import { s } from '../../../constants/theme/scale';
import { NEW_COLOR } from '../../../constants/theme/variables';


interface CommonCheckboxProps {
  label: string;
  style?: object;
  labelStyle?: object;
  initialChecked?: boolean;
  onChange?: (checked: boolean) => void; 
}

const CheckboxWithOutFormik: React.FC<CommonCheckboxProps> = ({
  label,
  style = {},
  labelStyle = {},
  initialChecked = false,
  onChange,
}) => {
  const [isChecked, setIsChecked] = useState(initialChecked);
  const toggleCheckbox = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    if (onChange) {
      onChange(newCheckedState); 
    }
  };

  return (
    <ViewComponent style={style}>
      <TouchableOpacity onPress={toggleCheckbox} style={[commonStyles.mr8]}>
          
          <MaterialIcons name={isChecked ? "check-box" :"check-box-outline-blank"} size={s(24)} color={isChecked ?NEW_COLOR.PRiMARY_COLOR:NEW_COLOR.TEXT_GREY} />
      </TouchableOpacity>
      <ParagraphComponent style={[labelStyle]}>
        {label}
      </ParagraphComponent>
    </ViewComponent>
  );
};


export default CheckboxWithOutFormik;
