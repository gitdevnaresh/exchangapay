import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Overlay } from 'react-native-elements';
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { s } from '../../constants/theme/scale';
import { NEW_COLOR, WINDOW_WIDTH } from "../../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useSelector } from 'react-redux';
const AccountDeactivatePopup = ({ isVisible, handleClose }: any) => {
    const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);

    return (
        <Overlay onBackdropPress={handleClose} overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 30 }]} isVisible={isVisible}>

            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb24]}>
                <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text="Alert" />

                <AntDesign onPress={handleClose} name="close" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />

            </View>


            <View style={[commonStyles.mb43]}>
                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textBlack, commonStyles.mb8]} text="Your Exchanga Pay account is deactivated due to an unresolved payment." />
                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.mb4]}  >To restore access, contact <ParagraphComponent style={[commonStyles.textOrange, commonStyles.fs16, commonStyles.fw600]}>{userInfo?.supportEmail || "support@exchangapay.com"}</ParagraphComponent> with your details.</ParagraphComponent>
                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.mb8]} text="We’re happy to assist you." />
                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.mb4]} text="Best regards," />
                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textBlack,]} text="Exchanga Pay" />
            </View>
        </Overlay>
    );
};
export default AccountDeactivatePopup;
const styles = StyleSheet.create({
    overlayContent: {
        paddingHorizontal: s(28),
        paddingVertical: s(24),
        borderRadius: 25, backgroundColor: NEW_COLOR.POP_UP_BG,
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

