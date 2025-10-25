
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Linking, Text } from 'react-native';
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container } from "../../components";
import DefaultButton from "../../components/DefaultButton";
import { TouchableOpacity } from 'react-native-gesture-handler';
import AuthService from '../../services/auth';
import { useSelector } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { commonStyles } from '../../components/CommonStyles';
import { NEW_COLOR, WINDOW_WIDTH } from '../../constants/theme/variables';
import { s } from '../../constants/theme/scale';
import { CONSTANTS, EMAIL_CONSTANTS, REGISTRATION_CONSTATNTS } from './constants';
import { RenderHTML } from 'react-native-render-html';
import ErrorComponent from '../../components/Error';
import { isErrorDispaly } from '../../utils/helpers';
import { progressSkeltons } from '../Profile/skeleton_views';
import Loadding from '../../components/skeleton';
import { SvgUri } from 'react-native-svg';
import useLogout from '../../hooks/useLogOut';
import useMemberLogin from '../../hooks/useMemberLogin';
import { SafeAreaView } from 'react-native-safe-area-context';

const UnderReview = () => {
  const styles = useStyleSheet(themedStyles);
  const navigation = useNavigation<any>();
  const [saveLoading, setSaveLoading] = useState<boolean>(false)
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const [htmlContent, setHtmlContent] = useState<any>({});
  const [errorMsg, setErrorMsg] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLogout, setIsLogout] = useState<boolean>(false)
  const { logout } = useLogout()
  const isFocused = useIsFocused();
  const skeltons = progressSkeltons();
  const { getMemDetails } = useMemberLogin();
  useEffect(() => {
    handleGetCustomerNotes();
  }, [isFocused])



  const handleGetCustomerNotes = async () => {
    setHtmlContent({});
    setIsLoading(true)
    try {
      const response: any = await AuthService.customerNotes();
      if (response?.data) {
        setHtmlContent(response?.data);
        setIsLoading(false)
      } else {
        setErrorMsg(isErrorDispaly(response));
        setHtmlContent({});
        setIsLoading(false)
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
      setHtmlContent({});
      setIsLoading(false)
    }
  };
  const handleLinkPress = (href: any) => {
    if (href.startsWith('mailto:')) {
      Linking.openURL(href).catch(err => console.error("Failed to open email:", err));
    } else {
      navigation.navigate('addKycInfomation', {
        screenName: "resumit"
      });
    }
  };
  const handleCloseError = () => {
    setErrorMsg(null);
  };
  const handleRejectedNav = () => {
    navigation.navigate("addKycInfomation", {
      screenName: "resumit"
    })
  };
  const handleRefresh = async () => {
    setSaveLoading(true);
    await getMemDetails({})
    handleGetCustomerNotes()
    setSaveLoading(false);

  };
  const handleLogout = async () => {
    setIsLogout(true)
    await logout();
    setIsLogout(false)
  };
  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView>
        <Container style={commonStyles.container}>
          <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mxAuto]}>
            <SvgUri
              uri={REGISTRATION_CONSTATNTS.EXCHANGAPAY_LOGO}
              width={s(61)}
              height={s(56)}
            />
            <ParagraphComponent
              text={REGISTRATION_CONSTATNTS.EXCHANGA_PAY}
              style={[commonStyles.fs32, commonStyles.fw800, commonStyles.textOrange, commonStyles.textCenter]}
            />
          </View>

          {isLoading && <Loadding contenthtml={skeltons} />}
          {errorMsg && <ErrorComponent message={errorMsg} onClose={handleCloseError} />}

          {(!isLoading && htmlContent?.message) && <View style={commonStyles.flex1}>
            <RenderHTML
              contentWidth={WINDOW_WIDTH}
              source={{ html: htmlContent?.message }}
              tagsStyles={{
                body: { color: NEW_COLOR.TEXT_BLACK },
              }}
              renderersProps={{
                a: {
                  onPress: (event, href) => handleLinkPress(href),
                },
              }}

              enableExperimentalMarginCollapsing={true}
            />

          </View>}
          {((!isLoading && (userInfo.customerState === "Approval In Progress" || userInfo.customerState === "Registered" || (userInfo.customerState === "Approved" && userInfo?.isSumsubKyc))) && (!htmlContent?.message)) && (
            <Container style={[commonStyles.container, commonStyles.flex1]}>
              <View style={commonStyles.flex1}>

                <ParagraphComponent
                  text="KYC Verification Status"
                  style={[
                    commonStyles.fs22,
                    commonStyles.fw700,
                    commonStyles.textCenter,
                    commonStyles.mb16,
                    commonStyles.textBlack,
                    { marginTop: 24 }
                  ]}
                />


                <ParagraphComponent
                  style={[
                    commonStyles.textCenter,
                    commonStyles.fs16,
                    commonStyles.mb16,
                    commonStyles.textBlack
                  ]}
                  text={
                    "Thank you for completing your KYC. We are currently reviewing your documents. This process typically takes 1–5 minutes, but may occasionally take longer.\n\nOnce you’ve received your verification results via email, click the refresh button to update your status.\n\nIf you have any questions or need assistance, please don’t hesitate to contact our support team at "
                  }
                />
                <TouchableOpacity
                  onPress={() => Linking.openURL(`mailto:${userInfo?.supportEmail || 'support@exchangapay.com'}`)}
                  activeOpacity={0.7}
                >
                  <ParagraphComponent
                    text={userInfo?.supportEmail || " "}
                    style={[
                      commonStyles.textCenter,
                      commonStyles.fs16,
                      commonStyles.textBlack,
                      { color: "#0099FF", textDecorationLine: "underline" }
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </Container>)
          }
          <View style={[commonStyles.mb24]} />
          {(!isLoading && userInfo.customerState?.toLowerCase() === "registered") && (!htmlContent?.message && !userInfo.isSumsubKyc) &&
            <Container style={[commonStyles.container, commonStyles.flex1]}>
              <View style={commonStyles.flex1}>

                <ParagraphComponent
                  text="KYC Rejected"
                  style={[
                    commonStyles.fs22,
                    commonStyles.fw700,
                    commonStyles.textCenter,
                    commonStyles.mb16,
                    commonStyles.textBlack,
                    { marginTop: 24 }
                  ]}
                />


                <ParagraphComponent
                  style={[
                    commonStyles.textCenter,
                    commonStyles.fs16,
                    commonStyles.mb16,
                    commonStyles.textBlack
                  ]}
                  text={
                    "Your KYC was rejected ,Please contact "
                  }
                />
                <TouchableOpacity
                  onPress={() => Linking.openURL(`mailto:${userInfo?.supportEmail || 'support@exchangapay.com'}`)}
                  activeOpacity={0.7}
                >
                  <ParagraphComponent
                    text={userInfo?.supportEmail || 'support@exchangapay.com'}
                    style={[
                      commonStyles.textCenter,
                      commonStyles.fs16,
                      commonStyles.textBlack,
                      { color: "#0099FF", textDecorationLine: "underline" }
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <View style={[commonStyles.mb32]} />
            </Container>
          }
          <View style={[commonStyles.mb10]} />
          {(!isLoading && !isLogout) && <DefaultButton
            title={CONSTANTS?.REFRESH}
            customTitleStyle={styles.btnConfirmTitle}
            icon={undefined}
            style={undefined}
            customButtonStyle={undefined}
            customContainerStyle={undefined}
            backgroundColors={undefined}
            colorful={undefined}
            transparent={undefined}
            disable={saveLoading}
            loading={saveLoading}
            refresh={true}
            onPress={handleRefresh}
          />}
          {(!isLoading && !isLogout) && <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.mt10]}>
            <TouchableOpacity onPress={handleLogout} style={[commonStyles.px10]} ><Text style={[commonStyles.textCenter, commonStyles.textOrange, commonStyles.fs16, commonStyles.fw600]}>{EMAIL_CONSTANTS.LOG_OUT}</Text></TouchableOpacity>
          </View>
          }
        </Container>
      </ScrollView>
    </SafeAreaView>


  )
};


export default UnderReview;

const themedStyles = StyleService.create({
  btnConfirmTitle: {
    color: NEW_COLOR.TEXT_ALWAYS_WHITE
  }, dashedBorder: {
    padding: 4,
    borderRadius: s(50) / 2,
    borderWidth: 1, borderColor: NEW_COLOR.PROFILE_BORDER,
    borderStyle: "dashed"
  }, profile: {
    width: s(36),
    height: s(36),
    borderRadius: s(36) / 2,
  }, container: {
    flex: 1,
  }, resend: {
    textAlign: "center",
  },
});
