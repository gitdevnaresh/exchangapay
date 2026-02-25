import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getThemedCommonStyles } from '../../CommonStyles';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import { s } from '../../../constants/styels/scale';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';


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
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [isChecked, setIsChecked] = useState(initialChecked);
  const toggleCheckbox = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    if (onChange) {
      onChange(newCheckedState);
    }
  };

  return (
    <TouchableOpacity onPress={toggleCheckbox} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, style]}>
      <MaterialIcons name={isChecked ? "check-box" : "check-box-outline-blank"} size={s(24)} color={isChecked ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.TEXT_GREY} />
      <ParagraphComponent style={[labelStyle]}>
        {label}
      </ParagraphComponent>
    </TouchableOpacity>
  );
};


export default CheckboxWithOutFormik;
