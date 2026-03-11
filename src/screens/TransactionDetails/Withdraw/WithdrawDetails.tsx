import React from 'react';
import { WithdrawDetailsProps } from './types';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import { s } from '../../../constants/theme/scale';
import Clipboard from '@react-native-clipboard/clipboard';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import CopyCard from '../../../newComponents/copyComponent/CopyCard';
import { FormattedDateText } from '../../../newComponents/textComponets/dateTimeText/dateTimeText';
import { NEW_COLOR } from '../../../constants/theme/variables';
import { CurrencyText } from '../../../newComponents/textComponets/currencyText/currencyText';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import { Linking } from 'react-native';

// This style object creates the rounded-corner container for each detail row.
// You might need to adjust the backgroundColor to match your theme's exact color.
const getDetailRowStyles = (colors) => ({
  rowContainer: {
    backgroundColor: NEW_COLOR.BANNER_BG, // A dark grey color similar to the screenshot
    paddingHorizontal: s(8),
    paddingVertical: s(8),
    borderRadius: s(8),
    marginBottom: s(6), // Space between each row item
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: s(12),
    flexWrap: "wrap"
  },
  headerText: {
    marginBottom: s(10), // Space between the header and the first item
    marginLeft: s(4),   // Slight indentation to align with the cards
  }
});


const WithdrawDetails: React.FC<WithdrawDetailsProps> = ({ transaction }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const detailRowStyles = getDetailRowStyles(NEW_COLOR);

  const copyToClipboard = (text: string) => {
    if (text) {
      Clipboard.setString(text);
    }
  };
const handleOpenExplorer = () => {
    if(transaction?.hash&&transaction?.explorer){
        const url=`${transaction?.explorer || ""}${transaction?.hash}`
        Linking.openURL(url);
    }
}
  // Calculate the "Paid" amount by adding the received amount and the fee
  const paidAmount = (transaction?.amount || 0) + (transaction?.comission || 0);
  return (
    <ViewComponent>
      {/* Transaction Details Header */}
      <ParagraphComponent
        text="Transaction Details"
        style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite, detailRowStyles.headerText]}
      />
      {/* Type */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.TYPE"}/>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.action || ""}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>

      {/* Network */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.NETWORK"}/>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.network || ''}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>


      {/* Transaction ID */}
     {transaction?.address&&<ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.ADDRESS"}/>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
            {transaction?.address&&<CopyCard size={s(24)} onPress={() => copyToClipboard(transaction?.address)} />}
          </ViewComponent>

        </ViewComponent>
        <ParagraphComponent
          style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {transaction?.address || ''}
        </ParagraphComponent>
      </ViewComponent>}

      {/* Amount */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.AMOUNT"}/>
          <CurrencyText value={transaction?.amount} currency={transaction?.cardCurrency} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
        </ViewComponent>
      </ViewComponent>

      {/* Fee */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.FEE"}/>
          <CurrencyText style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} value={transaction?.fee} currency={transaction?.cardCurrency} />
        </ViewComponent>
      </ViewComponent>
      
      {/* Created on */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.CREATED_ON"}/>
          <FormattedDateText
            value={transaction?.dateTime || ''}
            conversionType="UTC-to-local"
            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}
          />        </ViewComponent>
      </ViewComponent>




      {/* Transaction ID */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.TRANSACTIONS_ID"}/>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.txId || ''}</ParagraphComponent>
           {transaction?.txId&& <CopyCard size={s(24)} onPress={() => copyToClipboard(transaction?.txId)}  />}
          </ViewComponent>
        </ViewComponent>
      </ViewComponent>
      
         {transaction?.remarks && (<ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.REMARKS"}/>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.remarks || ""}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>)}
       {transaction?.hash&&<ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.HASH"}/>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
            {transaction?.hash&&<CopyCard size={s(24)} onPress={() => copyToClipboard(transaction?.address)} />}
          </ViewComponent>

        </ViewComponent>
        <CommonTouchableOpacity onPress={handleOpenExplorer}>
        <ParagraphComponent
          style={[commonStyles.fs14, commonStyles.fw500, commonStyles.text_yellow,commonStyles.flex1]}
          ellipsizeMode="middle"
        >
          {transaction?.hash || ''}
        </ParagraphComponent>
        </CommonTouchableOpacity>
      </ViewComponent>}
    </ViewComponent>
  );
};

export default WithdrawDetails;