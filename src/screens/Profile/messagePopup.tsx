
import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, ScrollView, BackHandler } from 'react-native';
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container } from "../../components";
import DefaultButton from "../../components/DefaultButton";
import AuthService from '../../services/auth';
import { setUserInfo } from '../../redux/Actions/UserActions';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { commonStyles } from '../../components/CommonStyles';
import { NEW_COLOR, WINDOW_WIDTH } from '../../constants/theme/variables';
import { s } from '../../constants/theme/scale';
import { RenderHTML } from 'react-native-render-html';
import ErrorComponent from '../../components/Error';
import { SvgUri } from 'react-native-svg';


const MessagePopUp = (props: any) => {
  const styles = useStyleSheet(themedStyles);
  const navigation = useNavigation<any>();
  const [saveLoading, setSaveLoading] = useState<boolean>(false)
  const [htmlContent, setHtmlContent] = useState<any>({});
  const [errorMsg, setErrorMsg] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  const updateUserInfo = () => {
    setSaveLoading(true)
    AuthService.getMemberInfo().then((userLoginInfo: any) => {
      dispatch(setUserInfo(userLoginInfo.data));
      if (userLoginInfo.data.customerState === "Approved") {
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: "Dashboard" }],
          })
        );
      }
      setSaveLoading(false);
    }).catch((error) => {
      setSaveLoading(false)
    })
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (props?.route?.params?.accountType === "Personal") {
          navigation.goBack();
        } else {
          return
        }

        return true;
      }
    );
    return () => {
      backHandler.remove();
    };
  }, [])


  const handleCloseError = () => {
    setErrorMsg(null);
  };

  const handleNavigateKyc = () => {
    navigation.navigate("addKycInfomation", {
      accountType: props?.route?.params?.accountType,
      isKycUpdated: false,
      step: 2
    })
  }


  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView>
        <Container style={commonStyles.container}>
          <View style={[commonStyles.mb24, commonStyles.mt8]}>
            <View>
              <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mxAuto]}>

                <View >
                  <SvgUri
                    uri={"https://prdexchangapaystorage.blob.core.windows.net/images/logox_orange.svg"}
                    width={s(61)}
                    height={s(55)}
                  />
                </View>
                <ParagraphComponent text='Exchanga Pay' style={[commonStyles.fs32, commonStyles.fw800, commonStyles.textOrange, commonStyles.textCenter]} />
              </View>
            </View>
          </View>
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
          {(!isLoading && !htmlContent?.message) &&
            <Container style={[commonStyles.container, commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter]}>
              <View style={commonStyles.flex1}>
                {(props?.route?.params?.accountType === "Personal" && props?.route?.params?.step === 1) && <View>
                  <ParagraphComponent style={[commonStyles.textCenter, commonStyles.textBlack, commonStyles.fs16, commonStyles.fw800]} text={"Please proceed to complete KYC."} />
                  <View style={[commonStyles.mb43]} />
                  <DefaultButton
                    title={"Continue"}
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
                    onPress={handleNavigateKyc}
                  />

                </View>}
                {(props?.route?.params?.accountType === "Personal" && props?.route?.params?.step === 2)
                  && <View>
                    <ParagraphComponent style={[commonStyles.textCenter, commonStyles.textBlack, commonStyles.fs16, commonStyles.fw800]} text={"DEAR User, Thank you for registering An admin will contact you when your application is approved."} />
                  </View>}
                {props?.route?.params?.accountType === "Business" && <View>
                  <ParagraphComponent style={[commonStyles.textCenter, commonStyles.textBlack, commonStyles.fs16, commonStyles.fw800]} text={"Please Proceed to our website at www.exchangapay.com to submit your KYB documents and complete Registration.You will Require the following documents(TBCW MITHUN) 1.passport ."} />
                </View>}
              </View>
            </Container>
          }

          <View style={[commonStyles.mb24]} />
          {props?.route?.params?.step !== 1 && <DefaultButton
            title={"Refresh"}
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
            onPress={() => updateUserInfo()}
          />}

        </Container>
      </ScrollView>
    </SafeAreaView>


  )
};


export default MessagePopUp;

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
  },
});
