import React from 'react';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import { formatDateTimeHour, formatCurrency } from '../../../utils/helpers';
import { s } from '../../../constants/theme/scale';
import Clipboard from '@react-native-clipboard/clipboard';
import { getThemedCommonStyles, statusColor } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import CopyCard from '../../../newComponents/copyComponent/CopyCard';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { DetailsProps } from './types';

const Details: React.FC<DetailsProps> = ({ transaction }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
   const copyToClipboard = (text: string) => {
      if (text) {
        Clipboard.setString(text);
      }
    };
  
    // Truncate address for display
    const truncate = (str: string) => str && str.length > 12 ? `${str.slice(0, 8)}...${str.slice(-8)}` : str || '--';
  
    return (
      <ViewComponent >
        {/* Transaction ID */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.TRANSACTIONS_ID"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8, commonStyles.flex1]}>
            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.flex1, commonStyles.textRight]} text={transaction?.transactionId || '--'} />
            <CopyCard size={s(24)} onPress={() => copyToClipboard(transaction?.transactionId)}  />
          </ViewComponent>
        </ViewComponent>
        <ViewComponent style={[commonStyles.listGap]} />
        {/* Date */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.TRANSACTIONS_DATE"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
          <ParagraphComponent text={formatDateTimeHour(transaction?.txDate || '--')} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
        </ViewComponent>
        <ViewComponent style={[commonStyles.listGap]} />
        {/* Amount */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.AMOUNT"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} text={formatCurrency(transaction?.amount, 2)} />
        </ViewComponent>
           <ViewComponent style={[commonStyles.listGap]} />
        {/* Commission (Fee) */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.FEE"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} text={formatCurrency(transaction?.comission, 2)} />
        </ViewComponent>
        <ViewComponent style={[commonStyles.listGap]} />
        {/* Currency */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.CURRENCY"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} text={transaction?.currency || '--'} />
        </ViewComponent>
        <ViewComponent style={[commonStyles.listGap]} />
        {/* Network */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.NETWORK"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} text={transaction?.network || '--'} />
        </ViewComponent>
        <ViewComponent style={[commonStyles.listGap]} />
        {/* Status */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
          <TextMultiLanguage text={'GLOBAL_CONSTANTS.STATUS'} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
          <ParagraphComponent text={transaction?.state || '--'} style={[commonStyles.fs14, commonStyles.fw500, { color: statusColor[transaction?.state?.toLowerCase?.()] || NEW_COLOR.TEXT_GREEN }]} />
        </ViewComponent>
        <ViewComponent style={[commonStyles.listGap]} />
        {/* Transaction Type */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.TRANSACTIONS_TYPE"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} text={transaction?.transactiontype || '--'} />
        </ViewComponent>
        <ViewComponent style={[commonStyles.listGap]} />
        {/* From Address */}
        {transaction?.from && (
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.SENDERS_ADDRESS"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
              <ParagraphComponent text={truncate(transaction?.from)} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
              <CopyCard size={s(24)} onPress={() => copyToClipboard(transaction?.from)} />
            </ViewComponent>
          </ViewComponent>
        )}
        <ViewComponent style={[commonStyles.listGap]} />
        {/* To Address */}
        {transaction?.to && (
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.RECEIVER'S_ADDRESS"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
              <ParagraphComponent text={truncate(transaction?.to)} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
              <CopyCard size={s(24)} onPress={() => copyToClipboard(transaction?.to)} />
            </ViewComponent>
          </ViewComponent>
        )}
        <ViewComponent style={[commonStyles.listGap]} />
        {/* Remarks */}
        {transaction?.remarks && (
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.REMARKS"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} text={transaction?.remarks} />
          </ViewComponent>
        )}
       <ViewComponent style={[commonStyles.sectionGap]} />
      </ViewComponent>
    );
};

export default Details; 