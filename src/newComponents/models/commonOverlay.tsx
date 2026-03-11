import React from 'react';
import {TouchableOpacity } from 'react-native';
import { Overlay } from 'react-native-elements';
import { AntDesign } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import { WINDOW_WIDTH } from '../theme/variables';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import { s } from '../theme/scale';
import ViewComponent from '../view/view';




interface CustomOverlayProps {
    isVisible: boolean;
    onClose?: () => void;
    onPressCloseIcon?: () => void;
    title?: string;
    children: React.ReactNode;
    overlayStyle?: object;
    backdropStyle?: object;
    crossIcon?: boolean;
    showHeader?: boolean;
    CloseStyle?: any;
}

const CustomOverlay: React.FC<CustomOverlayProps> = ({
    isVisible,
    onClose,
    onPressCloseIcon,
    title,
    children,
    overlayStyle = {},
    backdropStyle = {},
    crossIcon = false,
    showHeader = false,
    CloseStyle,
}) => {
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };
    const NEW_COLOR = useThemeColors(true);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const CloseIcon = () => {
        onPressCloseIcon();
    }
    return (
        <Overlay
            isVisible={isVisible}
            onBackdropPress={handleClose}
            overlayStyle={[commonStyles.rounded30,
                { 
                    width: WINDOW_WIDTH - 30, 
                    padding: 0,
                    backgroundColor: NEW_COLOR.SCREENBG_BLACK,
                },
                overlayStyle,
            ]}
            backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', ...backdropStyle }}
        >
            <ViewComponent style={[{ backgroundColor: NEW_COLOR.SCREENBG_BLACK, borderRadius: s(20) }]}>
                {showHeader && <ViewComponent style={[commonStyles.dflex, commonStyles.justify, commonStyles.alignCenter, commonStyles.p16, commonStyles.relative,]}>
                    <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.textLeft]} text={title} />
                    {crossIcon && <TouchableOpacity onPress={CloseIcon || handleClose} style={commonStyles.closeIcon}>
                        <AntDesign size={s(24)} name="close" color={NEW_COLOR.TEXT_WHITE} />
                    </TouchableOpacity>}
                </ViewComponent>}
                <ViewComponent style={[]}>
                    {children}
                </ViewComponent>
            </ViewComponent>
        </Overlay>
    );
};

export default CustomOverlay;
