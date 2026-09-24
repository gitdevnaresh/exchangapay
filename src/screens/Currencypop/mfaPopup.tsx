import React, { useState } from 'react';
import { View ,StyleSheet} from 'react-native';
import { Overlay } from "../../components/ui";
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { s } from '../../constants/theme/scale';
import {NEW_COLOR, WINDOW_WIDTH } from "../../constants/theme/variables";
import DefaultButton from '../../components/DefaultButton';
import AntDesign from "react-native-vector-icons/AntDesign";
import useLogout from '../../hooks/useLogOut';
const MFAPopup = ({isVisible,handleClose}:any) => {
const { logout } = useLogout();
const [isBtnLoading,setIsBtnLoading]=useState<boolean>(false)
    const handleLgout = async () => {
        setIsBtnLoading(true)
        try {
            await logout();
        } finally {
            setIsBtnLoading(false)
        }
    };

    return (
        <Overlay onBackdropPress={handleClose} overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 30 }]} isVisible={isVisible}>
            
                      <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb43]}>
                      <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text="Security Alert" />
          
          <AntDesign onPress={handleClose} name="close" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />

        </View>


        <View style={[ commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb43]}>
          <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text="Due To Security Reasons " />
          <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text="Please log out and Re-login." />

         
        </View>
        <View style={[commonStyles.gap10]}>
             <DefaultButton
                        title={"Logout"}
                        customTitleStyle={''}
                        style={undefined}
                        customContainerStyle={undefined}
                        backgroundColors={undefined}
                        colorful={undefined}
                        onPress={handleLgout}
                        transparent={undefined}
                        loading={isBtnLoading}
                        disable={isBtnLoading}
                        iconRight={true}
                      />
        </View>
      </Overlay>
    );
};
export default MFAPopup;
const styles = StyleSheet.create({
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

