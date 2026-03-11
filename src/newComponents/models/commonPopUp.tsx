import React, { ReactNode } from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';

interface ReusableModalProps {
    visible: boolean;
    closePopUP: () => void;
    title: string;
    children: ReactNode;
    showCloseIcon?: boolean;
    modalHeight?: number;
    modalStyles?: object;
    titleStyle?: object;
}

const CommonPopUp: React.FC<ReusableModalProps> = ({
    visible,
    closePopUP,
    title,
    children,
    showCloseIcon = true,
    modalHeight = 300,
    modalStyles = {},
    titleStyle = {},
}) => {
    const {t} = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={closePopUP}
        >
            <View style={[commonStyles.bgGray4, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                <View
                    style={[
                        commonStyles.screenBg,
                        { 
                            width: '90%', 
                            height: modalHeight, 
                            borderRadius: 10, 
                            padding: 20,
                            ...modalStyles 
                        }]
                    }
                >
                    <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                        <ParagraphComponent
                            text={t(title)}
                            style={[commonStyles.textWhite, { fontSize: 18, fontWeight: 'bold', ...titleStyle }]}
                        />
                        {showCloseIcon && (
                            <TouchableOpacity onPress={closePopUP} style={{ position: 'absolute', top: 10, right: 10 }}>
                                <AntDesign name="close" size={22} color={NEW_COLOR.TEXT_WHITE} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        {children}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CommonPopUp;
