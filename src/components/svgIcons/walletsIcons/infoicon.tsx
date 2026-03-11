import React from "react";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ViewStyle } from 'react-native';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from "../../CommonStyles";
import ViewComponent from "../../view/view";
interface InfoIconProps {
    onPress: () => void;
    size?: number;
    style?: ViewStyle | ViewStyle[];
}

const InfoIcon: React.FC<InfoIconProps> = ({ onPress, size = 18, style }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    return (
        <ViewComponent>
            <MaterialIcons name="info-outline" size={s(size)} color={NEW_COLOR.NOTE_ICON} />
        </ViewComponent>
    );
};

export default InfoIcon;
