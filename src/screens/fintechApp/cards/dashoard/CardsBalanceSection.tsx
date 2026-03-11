import React from "react";
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { s } from '../../../../constants/styels/scale';
import { CurrencyText } from '../../../../components/textComponets/currencyText/currencyText';
import ViewComponent from '../../../../components/view/view';
import Feather from 'react-native-vector-icons/Feather';
import { WalletGraph } from '../../../../assets/svg';
import { formatCurrency } from '../../../../utils/helpers';
import { getTabsConfigation, isDecimalSmall } from '../../../../../configuration';
import { useSelector } from 'react-redux';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
interface CardBalance {
  usd?: number;
  eur?: number;
}

interface CardsBalanceSectionProps {
  cardBalance: CardBalance;
  selectedCoin?: string;
  coins: string;
  coinSelection?: () => void;
  balanceLabel?: string;
  prifix?: string;
  isShowprifix?: boolean;
}

const CardsBalanceSection: React.FC<CardsBalanceSectionProps> = ({
  cardBalance,
  selectedCoin,
  coins,
  coinSelection,
  balanceLabel = "GLOBAL_CONSTANTS.CURRENT_VALUE",
  prifix,
  isShowprifix = false
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const handleFontSize = (amount: number | string) => {
    const balanceStr = amount?.toString();
    if (balanceStr?.length > 9) {
      return commonStyles.fs24;
    } else {
      return commonStyles.fs28;
    }
  };

  return (
    <ViewComponent style={[commonStyles.sectionGap, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
      <ViewComponent style={[commonStyles.flex1]}>
        <ParagraphComponent text={balanceLabel} style={[commonStyles.Amounttextlabel]} numberOfLines={1} />
        <ViewComponent style={[commonStyles.textLeft, commonStyles.dflex, commonStyles.gap6, commonStyles.alignCenter]}>
          {selectedCoin === 'USD' &&
            <CurrencyText value={cardBalance.usd ?? 0} smallDecimal={isDecimalSmall} currency={selectedCoin} symboles={true} style={[handleFontSize(formatCurrency(cardBalance.usd)), commonStyles.Amounttext, { marginLeft: s(-4) }]} />}
          {selectedCoin === 'EUR' &&
            <CurrencyText value={cardBalance.eur ?? 0} smallDecimal={isDecimalSmall} currency={selectedCoin} symboles={true} style={[handleFontSize(formatCurrency(cardBalance.eur)), commonStyles.Amounttext]} />
          }
          {
            isShowprifix && <CurrencyText smallDecimal={isDecimalSmall} value={cardBalance.eur ?? 0} currency={selectedCoin} prifix={prifix} style={[handleFontSize(formatCurrency(cardBalance.eur)), commonStyles.Amounttext]} />

          }
          {Boolean(coins) && <Feather name={"chevron-down"} color={NEW_COLOR.TEXT_WHITE} size={s(24)} onPress={coinSelection} style={[commonStyles.mt6]} />}
        </ViewComponent>
      </ViewComponent>
      <WalletGraph />
    </ViewComponent>
  );
};

export default CardsBalanceSection;