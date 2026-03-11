import React from 'react';
import ViewComponent from '../../../../newComponents/view/view';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { s } from '../../../../constants/theme/scale';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { Bullswipe } from '../../../../assets/svg';

interface AppHeaderProps {
    appVersion: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ appVersion }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    return (
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt50]}>
            <Bullswipe width={s(140)} height={s(30)} />
            <ViewComponent style={[commonStyles.mb16]} />
            <ParagraphComponent text={`v${appVersion}`} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite, { marginTop: s(16) }]} />
        </ViewComponent>
    );
};

export default AppHeader;