import { useRef } from 'react';
import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { isErrorDispaly } from '../../utils/helpers';
import { showAppToast } from '../../components/toasterMessages/ShowMessage';
import { Linking } from "react-native";
import { getAllEnvData } from '../../../Environment';
import CreateAccountService from '../../apiServices/bank/createAccount';

export const useBankSumsubSDK = () => {
  const sdkInstance = useRef<any>(null);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const navigation = useNavigation<any>();
  const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
  const BanksPermission = menuItems?.find((item: any) => item?.featureName.toLowerCase() === 'banks')?.isEnabled;

  const geAuthConfig = (path: string) => {
    const envList = getAllEnvData();
    return (envList?.oAuthConfig as any)?.[path];
  }
  const baseURL = geAuthConfig('sumsubWebUrl');

  const launchBankSumsubSDK = async (params?: { requirement?: string; onSuccess?: () => void; onPending?: () => void; navigationTarget?: string }) => {
    if (!params?.requirement) {
      showAppToast(isErrorDispaly('KYC requirement is missing'));
      return Promise.resolve();
    }

    let wasDismissed = false;

    try {
      const response = await CreateAccountService.sumsubAccessToken(userInfo.id, params.requirement);

      if (response?.ok && response?.data?.token) {
        sdkInstance.current = SNSMobileSDK.init(response.data.token, async () => {
          try {
            const refreshRes = await CreateAccountService.sumsubAccessToken(userInfo.id, params.requirement!);
            return refreshRes?.data?.token;
          } catch (err) {
            return null;
          }
        })
          .withHandlers({
            onEvent: (event: any) => {
              if (
                event?.payload?.eventName === "msdk:dismiss" ||
                event?.payload?.eventName === "msdk:ui:applicantDataScreen:close"
              ) {
                wasDismissed = true;
                sdkInstance.current = null;
                SNSMobileSDK.reset();
              }
            },
          })
          .withDebug(true)
          .withLocale('en')
          .build();

        return new Promise((resolve) => {
          sdkInstance.current
            .launch()
            .then(async (result: any) => {
              if (result?.status) {
                try {
                  const payload = { kycStatus: result?.status };
                  const apiResponse = await CreateAccountService.poacreation(payload);
                } catch (error) {
                  showAppToast(isErrorDispaly(error));
                }

                if (result?.status === 'success' || result?.status === 'Approved') {
                  if (params?.onSuccess) {
                    params.onSuccess();
                  } else {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{
                          name: "Dashboard",
                          params: {
                            animation: 'slide_from_left'
                          }
                        }],
                      })
                    );
                  }
                } else {
                  if (params?.onPending) {
                    params.onPending();
                  } else {
                    navigation.goBack();
                  }
                }
              } else {
                // No status means dismissed or cancelled
                if (params?.onPending) {
                  params.onPending();
                } else {
                  navigation.goBack();
                }
              }
              resolve(result);
            })
            .catch((error: any) => {
              showAppToast(isErrorDispaly(error));
              resolve({ error });
            });
        });
      } else {
        showAppToast(isErrorDispaly(response));
        return Promise.resolve();
      }
    } catch (error: any) {
      showAppToast(isErrorDispaly(error));
      return Promise.resolve();
    }
  };

  return { launchBankSumsubSDK };
};