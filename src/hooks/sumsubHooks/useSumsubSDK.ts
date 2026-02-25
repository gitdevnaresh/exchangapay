import { useRef } from 'react';
import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import OnBoardingService from '../../apiServices/onBoarding';
import useEncryptDecrypt from '../encDecHook';
import { isErrorDispaly } from '../../utils/helpers';
import { showAppToast } from '../../components/toasterMessages/ShowMessage';
import { Linking } from "react-native";
import { getAllEnvData } from '../../../Environment';
import { Logger } from '../../utils/Logger';



export const useSumsubSDK = () => {
  const sdkInstance = useRef<any>(null);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const { decryptAES } = useEncryptDecrypt();
  const decryptedPhone = decryptAES(userInfo?.phoneNumber);
  const decryptEmail = decryptAES(userInfo?.email);
  const decryptedPhoneCode = decryptAES(userInfo?.phonecode);
  const navigation = useNavigation<any>();
  const theme = useSelector((state: any) => state.userReducer?.appTheme);
  const level = userInfo?.accountType === "Personal" ? userInfo?.metadata?.kyc : userInfo?.metadata?.kyb
  const geAuthConfig = (path: string) => {
    const envList = getAllEnvData();
    return envList?.oAuthConfig[path];
  }
  const baseURL = geAuthConfig('sumsubWebUrl');

  const launchSumsubSDK = async (cardParams?: any) => {
    if (userInfo?.accountType === "Personal") {
      try {
        const response = await OnBoardingService.sumsubAccessToken(userInfo.id, level);
        if (
          response?.ok &&
          response?.data &&
          typeof response.data === 'object' &&
          'token' in response.data
        ) {
          sdkInstance.current = SNSMobileSDK.init((response.data as { token: string }).token, async () => {
            try {
              const refreshRes = await OnBoardingService.sumsubAccessToken(userInfo.id, level);
              const newToken = refreshRes?.data?.token;
              return newToken;
            } catch (err) {
              Logger.error('Error fetching new token', err);
              return null;
            }
          }
          )
            .withHandlers({
              onStatusChanged: (event: any) => { },
              onLog: (event: any) => { },
              onEvent: (event: any) => {
                if (
                  event?.payload?.eventName === "msdk:dismiss" ||
                  event?.payload?.eventName === "msdk:ui:applicantDataScreen:close"
                ) {
                  sdkInstance.current = null;
                  SNSMobileSDK.reset();
                  if (cardParams) {
                    navigation.navigate('AllCards');
                  }
                }
              },
            })
            .withDebug(true)
            .withLocale('en')
            .withApplicantConf({
              // phone: decryptedPhone || null,
              email: decryptEmail
            })
            .build();

          sdkInstance.current
            .launch()
            .then((result: any) => {
              if (result?.status === 'success' || result?.status === 'Approved') {
                if (cardParams) {
                  navigation.navigate('ApplyCard', {
                    ...cardParams,
                    refreshFromSumsub: true
                  });
                } else {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 1,
                      routes: [{ name: 'SumsubSuccess' }],
                    })
                  );
                }
              }
            })
            .catch((error: any) => {
              let errorMsg = error.toString();
              showAppToast(errorMsg);
              if (cardParams) {
                navigation.navigate('AllCards');
              } else {
                navigation.goBack();
              }
            });
        } else {
          const errorMsg = isErrorDispaly(response);
          showAppToast(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (error: any) {
        let errorMsg = error.toString();
        showAppToast(errorMsg);
        throw error;
      }
    }
    else {
      const redirectUrl = baseURL;
      if (userInfo?.accountType !== "Personal" && (userInfo?.kycStatus === 'Approved' || userInfo?.kycStatus === 'success')) {
        navigation.navigate("AccountProgress")
      } else {
        await Linking.openURL(redirectUrl);
      }
    }
  };

  return { launchSumsubSDK };
}; 