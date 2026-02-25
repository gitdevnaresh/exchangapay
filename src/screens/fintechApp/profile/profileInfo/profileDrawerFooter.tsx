import React from "react";
import { ActivityIndicator } from 'react-native';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import ViewComponent from '../../../../components/view/view';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import GradientText from '../../../../components/gradianttext/gradianttext';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';

interface ProfileDrawerFooterProps {
  onLogoutPress: () => void;
  logoutLoader: boolean;
  version: string;
  showLogoutConfig?: boolean;
}

const ProfileDrawerFooter: React.FC<ProfileDrawerFooterProps> = ({
  onLogoutPress,
  logoutLoader,
  version,
  showLogoutConfig,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  return (
    <ViewComponent>
      {showLogoutConfig && (
        <ViewComponent>
          <CommonTouchableOpacity
            onPress={onLogoutPress}
            style={[commonStyles.p14, commonStyles.rounded5, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.gap10, logoutLoader ? commonStyles.justifyCenter : null, { backgroundColor: NEW_COLOR.GRAY_LIGHT }]}
            activeOpacity={0.7}
          >
            {logoutLoader ? (
              <ActivityIndicator size="small" color={NEW_COLOR.TEXT_BLACK} />
            ) : (
              <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.LOG_OUT"} />
            )}
          </CommonTouchableOpacity>
        </ViewComponent>
      )}
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.mt6]}>
        <GradientText style={[commonStyles.fw600, commonStyles.fs14, commonStyles.textCenter]} text={`V - ${version}`} />
      </ViewComponent>
    </ViewComponent>
  );
};

export default ProfileDrawerFooter;