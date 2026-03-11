import React from "react";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ButtonComponent from "../../../../newComponents/buttons/button";
import { s } from "../../../../newComponents/theme/scale";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import ViewComponent from "../../../../newComponents/view/view";
import { Octicons } from "@expo/vector-icons";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";

interface ConfirmDetailsComponentProps {
  walletAddress: string;
  nickname: string;
  onEditAddress: () => void;
  onEditNickname: () => void;
  onContinue: () => void;
  loading?: boolean;
}

const ConfirmDetailsComponent: React.FC<ConfirmDetailsComponentProps> = ({
  walletAddress,
  nickname,
  onEditAddress,
  onEditNickname,
  onContinue,
  loading = false
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  return (
    <>
      <TextMultiLanguage 
        style={[commonStyles.fs14, commonStyles.fw400, commonStyles.TITLE_GREY, commonStyles.mb16]}
        text={"GLOBAL_CONSTANTS.CONFIRM_ADDRESS_NICKNAME"} 
      />
      
      {/* Address Row */}
      <TextMultiLanguage
        style={[commonStyles.fs14, commonStyles.TITLE_GREY, commonStyles.mb8]}
        text={"GLOBAL_CONSTANTS.ADDRESS"}
      />
      <ViewComponent
        style={[
          commonStyles.dflex, 
          commonStyles.alignCenter, 
          commonStyles.applycardbg, 
          commonStyles.rounded8, 
          commonStyles.py12, 
          commonStyles.px16, 
          commonStyles.mb16, 
          commonStyles.gap8
        ]}
      >
        <TextMultiLanguage
          style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textWhite, commonStyles.flex1]}
          text={walletAddress}
          numberOfLines={1}
          ellipsizeMode="tail"
        />
        <CommonTouchableOpacity onPress={onEditAddress}>
          <Octicons name="pencil" size={24} color={NEW_COLOR.TEXT_GREY} />
        </CommonTouchableOpacity>
      </ViewComponent>

      {/* Nickname Row */}
      <TextMultiLanguage
        style={[commonStyles.fs14, commonStyles.TITLE_GREY, { marginBottom: s(8) }]}
        text={"GLOBAL_CONSTANTS.NICKNAME"}
      />
      <ViewComponent
        style={[
          commonStyles.dflex, 
          commonStyles.alignCenter, 
          commonStyles.applycardbg, 
          commonStyles.rounded8, 
          commonStyles.py12, 
          commonStyles.px16, 
          commonStyles.mb16, 
          commonStyles.gap8
        ]}
      >
        <TextMultiLanguage
          style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textWhite, commonStyles.flex1]}
          text={nickname}
          numberOfLines={1}
          ellipsizeMode="tail"
        />
        <CommonTouchableOpacity onPress={onEditNickname}>
          <Octicons name="pencil" size={24} color={NEW_COLOR.TEXT_GREY} />
        </CommonTouchableOpacity>
      </ViewComponent>
      
      <ViewComponent style={{ flex: 1 }} />
      
      <ButtonComponent
        title={"GLOBAL_CONSTANTS.CONTINUE"}
        onPress={onContinue}
        solidBackground={false}
        loading={loading}
        disable={loading}
      />
    </>
  );
};

export default ConfirmDetailsComponent;