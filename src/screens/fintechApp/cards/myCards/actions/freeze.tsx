import React from "react";
import { s } from "../../../../../constants/styels/scale";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../../components/buttons/button";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import FreezeIcon from "../../../../../components/svgIcons/cardsicons/freezeIcon";

interface FreezeProps {
  CardsInfoData: any;
  buttonLoader: boolean;
  onConfirmFreeze: () => Promise<void>;
  onClose?: () => void;
}

const CardActionsSheetFreeze: React.FC<FreezeProps> = ({
  CardsInfoData,
  buttonLoader,
  onConfirmFreeze,
  onClose,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    <ViewComponent>
      <ViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.mt24]}>
          <FreezeIcon height={s(70)} width={s(70)} />
        </ViewComponent>
      </ViewComponent>
      <TextMultiLangauge
        text={"GLOBAL_CONSTANTS.ARE_YOU_SURE"}
        style={[
          commonStyles.bottomsheetsectiontitle,
          commonStyles.textCenter
        ]}
      />
      {CardsInfoData?.state?.toLowerCase() !== "freezed" && (
        <TextMultiLangauge
          text={"GLOBAL_CONSTANTS.FREEZED_THE_CARD"}
          style={[
            commonStyles.bottomsheetsectiontitle,
            commonStyles.textCenter,
            commonStyles.mt2,
          ]}
        />
      )}
      {CardsInfoData?.state?.toLowerCase() === "freezed" && (
        <TextMultiLangauge
          text={"GLOBAL_CONSTANTS.UNFREEZE_THE_CARD?"}
          style={[
            commonStyles.textCenter,
            commonStyles.textWhite,
            commonStyles.fs18,
            commonStyles.fw600,
            commonStyles.mt4,
          ]}
        />
      )}
      <ViewComponent style={[commonStyles.sectionGap]} />
      <ViewComponent style={[commonStyles.mb10]} />
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10,]}>
        <ViewComponent style={[commonStyles.flex1]}>
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.CANCEL"}
            loading={false}
            onPress={onClose}
            solidBackground={true}
          />
        </ViewComponent>
        <ViewComponent style={[commonStyles.flex1]}>
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.CONFIRM"}
            loading={buttonLoader}
            onPress={onConfirmFreeze}
          />
        </ViewComponent>
        <ViewComponent style={[]} />
      </ViewComponent>
    </ViewComponent>
  );
}

export default CardActionsSheetFreeze;