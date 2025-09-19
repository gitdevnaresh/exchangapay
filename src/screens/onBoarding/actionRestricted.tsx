import React from 'react';
import { View } from 'react-native';
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container } from "../../components";
import DefaultButton from "../../components/DefaultButton";
import { isLogin, loginAction, setUserInfo } from '../../redux/Actions/UserActions';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useAuth0 } from "react-native-auth0";
import ParagraphComponent from '../../components/Paragraph/Paragraph'
import { commonStyles } from '../../components/CommonStyles';
import { NEW_COLOR } from '../../constants/theme/variables';
import AntDesign from "react-native-vector-icons/AntDesign";
import { CONSTANTS } from './constants';
const ActionRestricted = () => {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { clearSession } = useAuth0();



  const handleLgout = async () => {
    dispatch(setUserInfo(""));
    dispatch(isLogin(false));
    dispatch(loginAction(""));
    await clearSession();
    navigation.navigate(CONSTANTS.SPLASH_SCREEN);
  };




  return (
    <Container style={[commonStyles.container, commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter]}>
      <View style={[commonStyles.flex1,]}>
        <AntDesign name={CONSTANTS.EXCLAMATION_CIRCLE} color={NEW_COLOR.BG_ORANGE} size={50} style={[commonStyles.mxAuto]} />
        <View style={[commonStyles.mb24]} />
        <ParagraphComponent style={[commonStyles.textCenter, commonStyles.textBlack, commonStyles.fs36, commonStyles.fw800]} text={CONSTANTS.ACTION_RESTRICTED} />
        <View style={[commonStyles.mb8]} />
        <ParagraphComponent style={[commonStyles.textCenter, commonStyles.textBlack, commonStyles.fs16, commonStyles.fw600]} text={CONSTANTS.ADMIN_ACCOUNTS_CANNOT_SWITH_TO_USER_MODE_PLASE_LOG_IN_WITH_THE_APPROPRIATE_ACCOUNT_TO_CONTINUE} />
        <View style={[commonStyles.mb24]} />
        <DefaultButton
          title={CONSTANTS.GO_BACK}
          customTitleStyle={styles.btnConfirmTitle}
          icon={undefined}
          style={undefined}
          customButtonStyle={undefined}
          customContainerStyle={undefined}
          backgroundColors={undefined}
          colorful={undefined}
          transparent={undefined}
          onPress={handleLgout}
        />
        <View style={[commonStyles.mb16]} />
        <View style={[commonStyles.mb43]} />
      </View>

    </Container>
  );
};

export default ActionRestricted;

const themedStyles = StyleService.create({
  btnConfirmTitle: {
    color: NEW_COLOR.TEXT_ALWAYS_WHITE
  },
});
