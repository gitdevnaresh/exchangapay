import React, { useState } from 'react';
import { View ,StyleSheet} from 'react-native';
import { Overlay } from 'react-native-elements';
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { s } from '../../constants/theme/scale';
import {NEW_COLOR, WINDOW_WIDTH } from "../../constants/theme/variables";
import DefaultButton from '../../components/DefaultButton';
import DeviceInfo from 'react-native-device-info';
import AuthService from '../../services/auth';
import { useDispatch } from 'react-redux';
import { isLogin, loginAction, setUserInfo } from '../../redux/Actions/UserActions';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAuth0 } from 'react-native-auth0';
import { fcmNotification } from '../../utils/FCMNotification';
import { remove } from '../../utils/ApiService';
import AntDesign from "react-native-vector-icons/AntDesign";
const MFAPopup = ({isVisible,handleClose}:any) => {
const dispatch=useDispatch();
const navigation=useNavigation();
const { clearSession } = useAuth0();
const [isBtnLoading,setIsBtnLoading]=useState<boolean>(false)
 const updateFcmToken = async () => {
    fcmNotification.createtoken((token: string) => {
      remove( `/api/v1/Notification/DeleteUserToken`,
        {
          token: token,
        }
      )
    });
  };


    const handleLgout = async () => {
        setIsBtnLoading(true)
        await clearSession();
        dispatch(setUserInfo(""));
        dispatch(isLogin(false));
        dispatch(loginAction(""));
        logOutLogData()
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: "SplashScreen" }],
          })
        );
        fcmNotification.unRegister();
        updateFcmToken()
        setIsBtnLoading(false)
      };
      const logOutLogData = async () => {
        const ip = await DeviceInfo.getIpAddress();
        const deviceName = await DeviceInfo.getDeviceName();
        const obj = {
          "id": "",
          "state": "",
          "countryName": "",
          "ipAddress": ip,
          "info": `{brand:${DeviceInfo.getBrand()},deviceName:${deviceName},model: ${DeviceInfo.getDeviceId()}}`
        }
        const actionRes = await AuthService.logOutLog(obj);
    
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

