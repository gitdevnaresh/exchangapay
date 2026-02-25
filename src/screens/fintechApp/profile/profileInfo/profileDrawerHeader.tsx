import React, { useEffect, useState, useCallback } from 'react';
import { Image, Clipboard, Alert } from 'react-native';
import AuthService from '../../../../apiServices/onBoarding/auth';
import { isErrorDispaly } from '../../../../utils/helpers';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import ViewComponent from '../../../../components/view/view';
import CopyCard from '../../../../components/copyIcon/CopyCard';
import Loadding from '../../../../components/skelton/skeltons';
import ErrorComponent from '../../../../components/errorDisplay/errorDisplay';
import { profileDrawerStyles } from './profileDrawer'; // Import styles from main
import { WINDOW_WIDTH } from '../../../../constants/styels/variables';
import { REFERRAL_CONST } from '../referrals/membersConstants';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import { ProfileDrawerInfoLoader } from '../../cards/skeltons';

interface ProfileDrawerHeaderProps {
  userInfoFromRoute: {
    name?: string;
    firstName?: string;
    lastName?: string;
    accountType?: string;
  };
  blockFocusEffects?: boolean;
  showProfileInfoConfig?: boolean;
}

const ProfileDrawerHeader: React.FC<ProfileDrawerHeaderProps> = ({
  userInfoFromRoute,
  blockFocusEffects,
  showProfileInfoConfig,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const DRAWER_VISIBLE_WIDTH = WINDOW_WIDTH * 0.8;
  const styles = profileDrawerStyles(NEW_COLOR, DRAWER_VISIBLE_WIDTH); // Use imported styles

  const { decryptAES } = useEncryptDecrypt();
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>({});
  const [errormsg, setErrormsg] = useState("");

  const getCustomerProfileInfo = useCallback(async () => {
    if (!userInfoFromRoute?.accountType) {
      return;
    }
    setErrormsg("");
    setUserDataLoading(true);
    try {
      const response: any = await AuthService.getCustomerProfile(userInfoFromRoute.accountType);
      if (response.ok) {
        setUserDetails(response?.data);
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setUserDataLoading(false);
    }
  }, [userInfoFromRoute?.accountType]);

  const copyToClipboard = useCallback(async (text: any) => {
    try {
      await Clipboard.setString(text);
    } catch (error: any) {
      Alert.alert(REFERRAL_CONST.FAILED_TO_COPY, error);

    }
  }, []);

  useEffect(() => {
    if (!blockFocusEffects && showProfileInfoConfig) {
      getCustomerProfileInfo();
    }
  }, [blockFocusEffects, showProfileInfoConfig, userInfoFromRoute?.accountType, getCustomerProfileInfo]);

  if (!showProfileInfoConfig) return null;

  return (
    <>
      {Boolean(errormsg) && <ErrorComponent message={errormsg} onClose={handleError} />}
      {userDataLoading ? (
        <Loadding contenthtml={ProfileDrawerInfoLoader()} />
      ) : (
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.gap6, commonStyles.dflex, commonStyles.mt30]}>
          <ViewComponent>
            <Image style={styles.defaultimg} source={userDetails?.image ? { uri: userDetails.image } : require("../../../../assets/images/profile/avathar.png")} />
          </ViewComponent>
          <ViewComponent style={[commonStyles.flex1]}>
            <ParagraphComponent style={[commonStyles.fs18, commonStyles.fw500, commonStyles.textWhite]} numberOfLines={1} text={`${userDetails?.firstName || ""} ${userDetails?.lastName || userInfoFromRoute?.name || ""}`} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
              <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.REF_ID"} />
              <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={decryptAES(userDetails?.reference) ?? ""} />
              {userDetails?.reference && <CopyCard onPress={() => copyToClipboard(String(decryptAES(userDetails.reference)))} copyIconColor={NEW_COLOR.TEXT_WHITE} />}
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      )}
    </>
  );
};

export default ProfileDrawerHeader;
