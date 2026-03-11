import { SvgUri } from "react-native-svg";
import { DeposistImage, Transactionwithdraw } from "../../assets/svg"
import { useThemeColors } from "../../hooks/useThemeColors";
import ViewComponent from "../../newComponents/view/view";
import { s } from "../../newComponents/theme/scale";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import { COMMON_SVG_URLS } from "../../assets/blobUrls";
const NEW_COLOR = useThemeColors();
const commonStyles = getThemedCommonStyles(NEW_COLOR);

export const iconsList = {
  buy: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
    <ViewComponent >
      <Transactionwithdraw width={s(16)} height={s(16)} />
    </ViewComponent>
  </ViewComponent>,
  purchase: <SvgUri width={s(34)} height={s(34)} uri={COMMON_SVG_URLS.deposit_downArrow}  />,
  purchasefiat: <SvgUri width={s(34)} height={s(34)} uri={COMMON_SVG_URLS.deposit_downArrow}  />,
  purchasecrypto: <SvgUri width={s(34)} height={s(34)} uri={COMMON_SVG_URLS.deposit_downArrow}  />,
  sell: <SvgUri width={s(34)} height={s(34)} uri={COMMON_SVG_URLS.sell_icon} />,
  withdraw: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
    <ViewComponent>
      <Transactionwithdraw width={s(16)} height={s(16)} />
    </ViewComponent>
  </ViewComponent>,
  deposit: <ViewComponent style={[commonStyles.bgdeposist, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
    <ViewComponent >
      <DeposistImage width={s(16)} height={s(16)} />
    </ViewComponent>
  </ViewComponent>,
  accountdeposit: <SvgUri width={s(34)} height={s(34)} uri={COMMON_SVG_URLS.deposit_downArrow}  />,
  withdrawcrypto: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
    <ViewComponent>
      <Transactionwithdraw width={s(16)} height={s(16)} />
    </ViewComponent>
  </ViewComponent>,
  // swap: <AntDesign name="swap" size={s(34)} color={NEW_COLOR.ICON_GREY} style={{ transform: [{ rotate: '90deg' }] }} />,
  depositfiat: <ViewComponent style={[commonStyles.bgdeposist, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
    <ViewComponent >
      <DeposistImage width={s(16)} height={s(16)} />
    </ViewComponent>
  </ViewComponent>,
  exchangewallettransfer: <SvgUri width={s(34)} height={s(34)} uri={COMMON_SVG_URLS.withdraw}/>,
  depositcrypto: <ViewComponent style={[commonStyles.bgdeposist, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
    <ViewComponent >
      <DeposistImage width={s(16)} height={s(16)} />
    </ViewComponent>
  </ViewComponent>,
  withdrawfiat: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
    <ViewComponent >
      <Transactionwithdraw width={s(16)} height={s(16)} />
    </ViewComponent>
  </ViewComponent>,
  payoutfiat: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
    <ViewComponent >
      <Transactionwithdraw width={s(16)} height={s(16)} />
    </ViewComponent>
  </ViewComponent>,
  payoutcrypto: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
    <ViewComponent >
      <Transactionwithdraw width={s(16)} height={s(16)} />
    </ViewComponent>
  </ViewComponent>,


};


export const formatCardNumberForDisplay = (cardNumberString: any) => {

  // Add a check to prevent errors if the input is not a string
  if (typeof cardNumberString !== 'string' || cardNumberString.length < 4) {
    // Return a default value or an empty string if input is invalid
    return '****';
  }

  // Get the last four digits of the card number
  const lastFourDigits = cardNumberString.slice(-4);

  // Return the asterisks directly followed by the last four digits
  return `****${lastFourDigits}`;
};

export const getTransactionSign = (action: string) => {
  if (!action) {
    return '';
  }

  const cleanedAction = action.toLowerCase().replace(/\s/g, '');

  switch (cleanedAction) {
    case 'refund':
      return '+';
    case 'applycard':
    case 'consumption':
    case 'replacecard':
    case 'deletecard':
      return '-';
    default:
      return '';
  }
};