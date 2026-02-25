import React from "react";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import ViewComponent from "../../../../../components/view/view";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import FreezeIcon from "../../../../../components/svgIcons/cardsicons/freezeIcon";
import SetPinIcon from "../../../../../components/svgIcons/cardsicons/setPinIcon";
import LimitIcon from "../../../../../components/svgIcons/cardsicons/limitIcon";
import CardInfoIcon from "../../../../../components/svgIcons/cardsicons/cardInfoIcon";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";

interface CardActionsSheetManageCardProps {
  onFreezePress: () => void;
  onPinPress: () => void;
  onLimitPress: () => void;
  onCardInfoPress: () => void;
  cardState?: string;
}
const CardActionsSheetManageCard: React.FC<CardActionsSheetManageCardProps> = ({
  onFreezePress,
  onPinPress,
  onLimitPress,
  onCardInfoPress,
  cardState,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const freezeLabel =
    cardState === "Freezed"
      ? "GLOBAL_CONSTANTS.UN_FREEZED"
      : "GLOBAL_CONSTANTS.FREEZED";
  return (
    <ViewComponent
      style={[
        commonStyles.dflex,
        commonStyles.gap20,
        commonStyles.justifyAround,
      ]}
    >
      <CommonTouchableOpacity onPress={onFreezePress}>
        <ViewComponent
          style={[
            commonStyles.iconbg
          ]}
        >
          <FreezeIcon />
        </ViewComponent>
        <TextMultiLangauge
          text={freezeLabel}
          style={[
            commonStyles.textWhite,
            commonStyles.fs12,
            commonStyles.fw500,
            commonStyles.mt4,
            commonStyles.textlightblack,
            commonStyles.textLeft,
            commonStyles.mxAuto,
          ]}
        />
      </CommonTouchableOpacity>

      <CommonTouchableOpacity onPress={onPinPress}>
        <ViewComponent
          style={[
            commonStyles.iconbg
          ]}
        >
          <SetPinIcon />
        </ViewComponent>
        <TextMultiLangauge
          text={"GLOBAL_CONSTANTS.SET_PIN"}
          style={[
            commonStyles.iconbg
          ]}
        />
      </CommonTouchableOpacity>

      <CommonTouchableOpacity onPress={onLimitPress}>
        <ViewComponent
          style={[
            commonStyles.iconbg
          ]}
        >
          <LimitIcon />
        </ViewComponent>
        <TextMultiLangauge
          text={"GLOBAL_CONSTANTS.LIMIT"}
          style={[
            commonStyles.iconbg
          ]}
        />
      </CommonTouchableOpacity>

      <CommonTouchableOpacity onPress={onCardInfoPress}>
        <ViewComponent
          style={[
            commonStyles.iconbg
          ]}
        >
          <CardInfoIcon />
        </ViewComponent>
        <TextMultiLangauge
          text={"GLOBAL_CONSTANTS.CARD_INFO"}
          style={[
            commonStyles.textWhite,
            commonStyles.fs12,
            commonStyles.fw500,
            commonStyles.mt4,
            commonStyles.textlightblack,
            commonStyles.textLeft,
            commonStyles.mxAuto,
          ]}
        />
      </CommonTouchableOpacity>
    </ViewComponent>)
};

export default CardActionsSheetManageCard;