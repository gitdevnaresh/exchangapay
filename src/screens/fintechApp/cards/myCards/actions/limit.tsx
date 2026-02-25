import React from "react";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import CopyCard from "../../../../../components/copyIcon/CopyCard";
import { Clipboard } from "react-native";
import ButtonComponent from "../../../../../components/buttons/button";

interface CardActionsSheetLimitProps {
  topupBalanceInfo: {
    currency?: string;
    minLimit?: number;
    maxLimit?: number;
  };
  onClose?: () => void;
}

const CardActionsSheetLimit: React.FC<CardActionsSheetLimitProps> = ({
  topupBalanceInfo,
  onClose,
}) => {
  const copyToClipboard = async (text: any) => {
    try {
      await Clipboard.setString(text);
    } catch (error: any) {
    }
  };
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    <ViewComponent style={[, commonStyles.rounded5]}>
      {topupBalanceInfo?.minLimit && (<ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
        <ViewComponent style={[commonStyles.flex1]}>
          <TextMultiLangauge
            text={"GLOBAL_CONSTANTS.MINIMUM"}
            style={[
              commonStyles.listsecondarytext
            ]}
          />
        </ViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
          <CurrencyText
            currency={topupBalanceInfo?.currency ?? ""}
            value={topupBalanceInfo?.minLimit ?? 0}
            style={[
              commonStyles.listprimarytext
            ]}
          />
          <CopyCard onPress={() => copyToClipboard(String(topupBalanceInfo?.minLimit ?? 0))} copyIconColor={NEW_COLOR.TEXT_PRIMARY} />

        </ViewComponent>


      </ViewComponent>)}

      {topupBalanceInfo?.maxLimit && <ViewComponent style={[commonStyles.listGap]} />}

      {topupBalanceInfo?.maxLimit && (<ViewComponent
        style={[

          commonStyles.dflex,
          commonStyles.alignCenter,
          commonStyles.justifyContent,
        ]}
      >
        <ViewComponent style={[commonStyles.flex1]}>
          <TextMultiLangauge
            text={"GLOBAL_CONSTANTS.MAXIMUM"}
            style={[
              commonStyles.listsecondarytext
            ]}
          />
        </ViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
          <CurrencyText
            value={topupBalanceInfo?.maxLimit ?? 0}
            currency={topupBalanceInfo?.currency}
            style={[
              commonStyles.listprimarytext
            ]}
          />
          <CopyCard onPress={() => copyToClipboard(String(topupBalanceInfo?.maxLimit ?? 0))} copyIconColor={NEW_COLOR.TEXT_PRIMARY} />
        </ViewComponent>

      </ViewComponent>)}
      <ViewComponent style={[commonStyles.sectionGap]} />
      {onClose && (
        <ViewComponent style={[commonStyles.mt20]}>
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.CLOSE"}
            onPress={onClose}
            solidBackground={true}
          />
        </ViewComponent>
      )}
    </ViewComponent>
  );
}

export default CardActionsSheetLimit;