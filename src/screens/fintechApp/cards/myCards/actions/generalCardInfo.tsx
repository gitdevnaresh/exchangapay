import React from "react";
import ViewComponent from '../../../../../components/view/view';
import TextMultiLangauge from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import ButtonComponent from '../../../../../components/buttons/button';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";

interface CardActionsSheetGeneralCardInfoProps {
  CardsInfoData: {
    name?: string;
    type?: string;
    currency?: string;
    cardCurrency?: string;
    state?: string;
    cardLimitTypes?: any[];
  };
  onClose?: () => void;
}

const CardActionsSheetGeneralCardInfo: React.FC<CardActionsSheetGeneralCardInfoProps> = ({
  CardsInfoData,
  onClose,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const cardCurrency = CardsInfoData?.cardCurrency;
  const renderInfoItem = (labelKey: string, value?: string) => (
    <ViewComponent>
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
        <TextMultiLangauge
          text={labelKey}
          style={[commonStyles.listsecondarytext]}
        />
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
          <ParagraphComponent
            text={value || "N/A"}
            style={[commonStyles.listprimarytext]}
            numberOfLines={1}
          />

        </ViewComponent>
      </ViewComponent>
      <ViewComponent style={[commonStyles.listGap]} />
    </ViewComponent>
  );

  return (
    <ViewComponent >
      {renderInfoItem("GLOBAL_CONSTANTS.CARD_NAME", CardsInfoData?.name)}
      {renderInfoItem("GLOBAL_CONSTANTS.TYPE", CardsInfoData?.type)}
      {renderInfoItem("GLOBAL_CONSTANTS.CURRENCY", cardCurrency)}
      {renderInfoItem("GLOBAL_CONSTANTS.STATUS", CardsInfoData?.state)}

      {CardsInfoData?.cardLimitTypes && CardsInfoData?.cardLimitTypes.length > 0 &&
        (CardsInfoData.cardLimitTypes?.map((limit: any) => (
          <ViewComponent key={limit?.limitType}>
            {limit?.limitAmount > 0 && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
              <ParagraphComponent
                text={limit?.displayName}
                style={[commonStyles.listsecondarytext]}
              />
              <CurrencyText
                value={limit?.limitAmount}
                currency={CardsInfoData?.cardCurrency}
                style={[commonStyles.listprimarytext]}
              />
            </ViewComponent>}
            <ViewComponent style={[commonStyles.listitemGap]} />
          </ViewComponent>
        )))}

      {onClose && (
        <ViewComponent style={[commonStyles.mt32]}>
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.CLOSE"}
            onPress={onClose}
            solidBackground={true}
          />
        </ViewComponent>
      )}
    </ViewComponent>
  );
};

export default CardActionsSheetGeneralCardInfo;