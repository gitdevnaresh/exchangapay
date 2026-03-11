import { AliaPay, AmazonPay, CanceledIcon, DeposistImage, PendingIcon, ShopeeImage, Transactionwithdraw } from "../../assets/svg";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useThemeColors } from "../../hooks/useThemeColors";
import { s } from "../theme/scale";
import ViewComponent from "../../newComponents/view/view";
import { SvgUri } from "react-native-svg";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import { COMMON_SVG_URLS } from "../../assets/blobUrls";

 const NEW_COLOR = useThemeColors();
 const commonStyles=getThemedCommonStyles(NEW_COLOR)
 
 export const statusIconMap: { [key: string]: JSX.Element } = {
        Approved: <AntDesign name="checkcircle" size={s(24)} color={NEW_COLOR.BG_GREEN} />,
        Active: <AntDesign name="checkcircle" size={s(24)} color={NEW_COLOR.BG_GREEN} />,
        Pending: <PendingIcon width={s(24)} height={s(24)} />,
        Rejected: <CanceledIcon width={s(24)} height={s(24)} />,
        Canceled: <CanceledIcon width={s(24)} height={s(24)} />,
        Freezed: <PendingIcon width={s(24)} height={s(24)} />
    };

    export const iconsList:any = {
        amazon: <AmazonPay height={s(25)} width={(s(25))} />,
        alipay: <AliaPay height={(s(25))} width={s(25)} />,
        shopee: <ShopeeImage height={(s(25))} width={s(25)} />,
    };


    export const iconsLists = {
    buy: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
      <ViewComponent>
        <Transactionwithdraw width={s(16)} height={s(16)} />
      </ViewComponent>
    </ViewComponent>,
    purchase: <SvgUri width={s(34)} height={s(34)} uri={COMMON_SVG_URLS.deposit_downArrow} />,
    purchasefiat: <SvgUri width={s(34)} height={s(34)} uri={COMMON_SVG_URLS.deposit_downArrow} />,
    purchasecrypto: <SvgUri width={s(34)} height={s(34)} uri={COMMON_SVG_URLS.deposit_downArrow} />,
    sell: <SvgUri width={s(34)} height={s(34)} uri={COMMON_SVG_URLS.sell_icon} />,
    withdraw: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
      <ViewComponent>
        <Transactionwithdraw width={s(16)} height={s(16)} />
      </ViewComponent>
    </ViewComponent>,
    deposit:  <ViewComponent style={[commonStyles.bgdeposist, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
      <ViewComponent >
        <DeposistImage width={s(16)} height={s(16)} />
      </ViewComponent>
    </ViewComponent>,
    accountdeposit: <SvgUri width={s(34)} height={s(34)} uri={COMMON_SVG_URLS.deposit_downArrow} />,
    withdrawcrypto: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
      <ViewComponent>
        <Transactionwithdraw width={s(16)} height={s(16)} />
      </ViewComponent>
    </ViewComponent>,
    depositfiat:  <ViewComponent style={[commonStyles.bgdeposist, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
      <ViewComponent >
        <DeposistImage width={s(16)} height={s(16)} />
      </ViewComponent>
    </ViewComponent>,
    exchangewallettransfer: <SvgUri width={s(34)} height={s(34)} uri={COMMON_SVG_URLS.withdraw} />,
    depositcrypto:  <ViewComponent style={[commonStyles.bgdeposist, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
      <ViewComponent >
        <DeposistImage width={s(16)} height={s(16)} />
      </ViewComponent>
    </ViewComponent>,
    withdrawfiat: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
      <ViewComponent>
        <Transactionwithdraw width={s(16)} height={s(16)}  />
      </ViewComponent>
    </ViewComponent>,
    payoutfiat: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
      <ViewComponent>
        <Transactionwithdraw width={s(16)} height={s(16)}  />
      </ViewComponent>
    </ViewComponent>,
    payoutcrypto: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(34), height: s(34), borderRadius: s(34) / 2 }]} >
      <ViewComponent>
        <Transactionwithdraw width={s(16)} height={s(16)} />
      </ViewComponent>
    </ViewComponent>,
  };