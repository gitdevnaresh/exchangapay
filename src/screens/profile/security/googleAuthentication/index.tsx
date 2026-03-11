import React, { useEffect, useState } from 'react';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { isErrorDispaly } from '../../../../utils/helpers';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ViewComponent from '../../../../newComponents/view/view';
import { GoogleAuthenticator } from '../../../../assets/vectorAssets';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import CustomSwitch from '../../../../newComponents/switch';
import { useIsFocused } from '@react-navigation/native';
import SwokipayDashboardLoader from '../../../../newComponents/swokipayloader';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import { s } from '../../../../constants/theme/scale';
import { getMFADevices } from '../../../../apiServices/fronteggApiServices/fronteggServices';
import { useSelector } from 'react-redux';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';

export interface GoogleAuthenticationProps {
  navigation: any;
  route: any;
}

const GoogleAuthentication: React.FC<GoogleAuthenticationProps> = ({ navigation, route }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const isFoucused = useIsFocused();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getDeviceID();
  }, [isFoucused]);

  useHardwareBackHandler(() => {
    handleBack();
  })

  const getDeviceID = async () => {
    setError("");
    setLoading(true);
    try {
      const response: any = await getMFADevices(userInfo?.userId);
      if (response?.status === 200) {
        const authenticators = response?.data?.authenticators || [];
        setDeviceId(response?.data);
        setIsEnabled(authenticators.length > 0);
        setLoading(false);
      }
      else {
        setError(isErrorDispaly(response));
        setLoading(false);
      }
    } catch (e) {
      setError(isErrorDispaly(e));
      setLoading(false);
    }
  }
  const handleToggle = async (data: boolean) => {
    if (isEnabled) {
      navigation.navigate("GoogleAthenticatorDisable");
    }
    else {
      navigation.navigate("GoogleAthenticatorEnable");
    }

  };

  const handleBack = () => {
    navigation.navigate("LoginVerificationScreen", { animation: 'slide_from_left' });
  };
  const handleRefresh = () => {
    setError("");
    getDeviceID();
  };

  return (
    <Container style={[commonStyles.flex1, commonStyles.screenBg]}>
      <PageHeader title={'GLOBAL_CONSTANTS.GOOGLE_AUTHENTICATOR_TITLE'} onBackPress={handleBack} isrefresh={true} onRefresh={handleRefresh} />
      {error&&<ErrorComponent message={error} screen={true}/>}
      {loading && <SwokipayDashboardLoader />}
      {!loading && <ViewComponent>
        <ViewComponent style={[commonStyles.justifyCenter, commonStyles.sectionGap]}>
          <ViewComponent style={[commonStyles.mt16]}>
            <TextMultiLanguage text={'GLOBAL_CONSTANTS.GOOGLE_AUTHENTICATOR_DESC'} style={[commonStyles.fs14, commonStyles.textGrey, commonStyles.alignStart]} />
          </ViewComponent>
          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.rounded12, commonStyles.borderSeparate, commonStyles.gap8, commonStyles.p8, commonStyles.mt16]}  >
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
              <ViewComponent style={[commonStyles.iconcirclebg, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                <GoogleAuthenticator width={s(18)} height={s(18)} />
              </ViewComponent>
              <TextMultiLanguage text={'GLOBAL_CONSTANTS.BIND_GOOGLE_AUTHENTICATOR'} style={[commonStyles.fs14, commonStyles.textWhite, commonStyles.fw400, commonStyles.textCenter]} />
            </ViewComponent>

            <CustomSwitch
              value={isEnabled}
              onValueChange={handleToggle}

            />
          </ViewComponent>
        </ViewComponent>
      </ViewComponent>}
    </Container>
  );
};

export default GoogleAuthentication; 