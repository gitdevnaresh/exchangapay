import React from "react";
import { MaterialIcons } from '@expo/vector-icons';
import { ViewStyle } from 'react-native';
import ViewComponent from '../view/view';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { s } from '../../constants/styels/scale';
import { getThemedCommonStyles } from "../CommonStyles";

interface AddIconProps {
    onPress?: () => void;
    size?: number;
    style?: ViewStyle | ViewStyle[];
}

const AddIcon: React.FC<AddIconProps> = ({ onPress, size = 22, style }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    return (
        <ViewComponent style={[style]}>
            <MaterialIcons
                name="add"
                size={s(size)}
                color={NEW_COLOR.ADD_ICON}
                onPress={onPress}
            />
        </ViewComponent>
    );
};

export default AddIcon;
