import React, { memo } from 'react';
import { SvgUri } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { s } from '../../constants/styels/scale';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import ViewComponent from '../view/view';
import { useColorScheme } from 'react-native';
import { getThemedCommonStyles, LOGO_URIS } from '../CommonStyles';


// Logo URIs centralized
interface CardLogoComponentProps {
    Description?: boolean;
    width?: number;
    height?: number;
}

const CardLogoComponent = ({
    Description = false,
    width = s(180),
    height = s(60),
}: CardLogoComponentProps) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
    const colorScheme = useColorScheme();

    const isDarkTheme =
        appThemeSetting !== 'system'
            ? appThemeSetting === 'dark'
            : colorScheme === 'dark';

    const uri = isDarkTheme ? LOGO_URIS.dark : LOGO_URIS.light;
    return (
        <ViewComponent style={{ width: s(150), height: s(60) }}>
            <SvgUri height={height} width={width} uri={uri} />
        </ViewComponent>
    );
};

export default CardLogoComponent;

