import React from "react";
import { View, TouchableOpacity } from 'react-native';
import { Overlay } from 'react-native-elements';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { WINDOW_WIDTH } from '../../constants/styels/variables';
import { s } from '../../constants/styels/scale';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import { getThemedCommonStyles } from '../CommonStyles';


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
    crossIcon = true,
    showHeader = true,
    CloseStyle,
}) => {
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const CloseIcon = () => {
        onPressCloseIcon();
    }
    return (
        <Overlay
            isVisible={isVisible}
            onBackdropPress={handleClose}
            overlayStyle={[
                commonStyles.sheetbg,
                commonStyles.popup,
                // { width: WINDOW_WIDTH - 30, padding: 0 },
                overlayStyle,
            ]}
            backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.33)', ...backdropStyle }}
        >
            <View style={[commonStyles.sheetbg, commonStyles.popupspace]}>
                {showHeader && <View style={[commonStyles.dflex, commonStyles.justify, commonStyles.alignCenter,]}>
                    <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.textLeft]} text={title} />
                    {crossIcon && <TouchableOpacity onPress={CloseIcon || handleClose} style={commonStyles.closeIcon}>
                        <AntDesign size={s(24)} name="close" color={NEW_COLOR.TEXT_WHITE} />
                    </TouchableOpacity>}
                </View>}
                <View style={[]}>
                    {children}
                </View>
            </View>
        </Overlay>
    );
};

export default CustomOverlay;
