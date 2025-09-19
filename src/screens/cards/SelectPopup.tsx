import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Overlay } from 'react-native-elements';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { StyleSheet } from 'react-native';
import { s } from '../../constants/theme/scale';
import { NEW_COLOR } from '../../constants/theme/variables';
import { CONSTANTS } from '../onBoarding/constants';

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
}: any) => {
    return (
        <Overlay
            backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            overlayStyle={[styles.overlayContent, { width: windowWidth - 20, maxHeight: windowHeight * 0.6 }]}
            isVisible={isVisible}
            onBackdropPress={handleClose}
        >
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb24]}>
                <ParagraphComponent
                    style={[commonStyles.fs18, commonStyles.fw800, commonStyles.textBlack]}
                    text={title}
                />
                <AntDesign
                    onPress={handleClose}
                    name={"close"}
                    size={22}
                    color={colors?.TEXT_BLACK}
                    style={{ marginTop: 3 }}
                />
            </View>

            <View  style={[commonStyles.mt10]}>
                {[
                    {
                        text: lable1,
                        onPress: methodOne,
                    },
                    {
                        text: lable2,
                        onPress: methodTwo,
                    },
                ].map((option, index) => (
                    <TouchableOpacity key={index} onPress={option.onPress} activeOpacity={0.6}>
                        <View style={styles.SelectStyle}>
                            <Ionicons
                                name={CONSTANTS?.CLOUD_UPLOAD_OUTLINE}
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

const styles = StyleSheet.create({
    overlayContent: {
        padding:s(36),
        borderRadius: 35, backgroundColor: NEW_COLOR.POP_UP_BG,
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
