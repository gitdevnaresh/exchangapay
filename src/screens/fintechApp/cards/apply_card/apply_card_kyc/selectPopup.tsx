import React from "react";
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Overlay } from 'react-native-elements';
import { AntDesign } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { s } from '../../../../../constants/styels/scale';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
interface OverlayPopupProps {
    isVisible: boolean;
    handleClose: () => void;
    methodOne: () => void;
    methodTwo: () => void;
    colors?: any
    windowWidth: number;
    windowHeight: number;
    title: string;
    lable1: string;
    lable2: string;
}
const OverlayPopup = ({
    isVisible,
    handleClose,
    methodOne,
    methodTwo,
    colors,
    windowWidth,
    windowHeight,
    title,
    lable1,
    lable2,
}: OverlayPopupProps) => {

    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = screenStyles(NEW_COLOR);
    return (
        <Overlay
            backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            overlayStyle={[styles.overlayContent, { width: windowWidth - 20, height: windowHeight / 3.5 }]}
            isVisible={isVisible}
            onBackdropPress={handleClose}
        >
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles?.mb24]}>
                <ParagraphComponent
                    style={[commonStyles.fs18, commonStyles.fw800, commonStyles.textBlack]}
                    text={t(title)}
                />
                <AntDesign
                    onPress={handleClose}
                    name={"close"}
                    size={s(22)}
                    color={colors?.TEXT_BLACK}
                    style={{ marginTop: 3 }}
                />
            </View>

            <View style={[commonStyles.gap10]}>
                {[
                    {
                        text: lable1,
                        onPress: methodOne,
                    },
                    {
                        text: lable2,
                        onPress: methodTwo,
                    },
                ]?.map((option) => (
                    <TouchableOpacity key={option.text} onPress={option.onPress} activeOpacity={0.6}>
                        <View style={styles.SelectStyle}>
                            <Ionicons
                                name={"cloud-upload-outline"}
                                size={22}
                                color={colors?.TEXT_BLACK}
                            />
                            <ParagraphComponent
                                style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw500]}
                                text={option.text}
                            />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={[commonStyles.mb16]} />
        </Overlay>
    );
};

export default OverlayPopup;

const screenStyles = (NEW_COLOR: any) => StyleSheet.create({
    overlayContent: {
        paddingHorizontal: s(28),
        paddingVertical: s(24),
        borderRadius: 25, backgroundColor: NEW_COLOR.DARK_BG,
    }, SelectStyle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center", borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
        marginBottom: 6,
        gap: 9, minHeight: 54, backgroundColor: NEW_COLOR.BG_BLACK,
        borderStyle: "dashed",
    },
})
