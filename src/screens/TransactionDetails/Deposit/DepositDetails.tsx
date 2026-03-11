import React from 'react';
import { DepositDetailsProps } from './types';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import { formatCurrency } from '../../../utils/helpers';
import { s } from '../../../constants/theme/scale';
import Clipboard from '@react-native-clipboard/clipboard';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import CopyCard from '../../../newComponents/copyComponent/CopyCard';
import { FormattedDateText } from '../../../newComponents/textComponets/dateTimeText/dateTimeText';
import { NEW_COLOR } from '../../../constants/theme/variables';
import { CurrencyText } from '../../../newComponents/textComponets/currencyText/currencyText';

// This style object creates the rounded-corner container for each detail row.
// You might need to adjust the backgroundColor to match your theme's exact color.
const getDetailRowStyles = (colors: any) => ({
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
    marginBottom: s(16), // Space between the header and the first item
    marginLeft: s(4),   // Slight indentation to align with the cards
  }
});


const DepositDetails: React.FC<DepositDetailsProps> = ({ transaction }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const detailRowStyles = getDetailRowStyles(NEW_COLOR);

  const copyToClipboard = (text: string) => {
    if (text) {
      Clipboard.setString(text);
    }
  };


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
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Type</ParagraphComponent>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.action || ""}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>

        {transaction?.action?.toLowerCase() === "cryptoback" && (
        <ViewComponent style={detailRowStyles.rowContainer}>
          <ViewComponent style={detailRowStyles.rowContent}>
            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Merchant Name</ParagraphComponent>
            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.merchantName || ''}</ParagraphComponent>
          </ViewComponent>
        </ViewComponent>
      )}
 

      {/* Network */}
   {transaction?.network&&  <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Network</ParagraphComponent>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.network || ''}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>}

       { transaction?.address&&<ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Address</ParagraphComponent>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
            {transaction?.address&&<CopyCard size={s(24)} onPress={() => copyToClipboard(transaction?.address)} />}
          </ViewComponent>
        </ViewComponent>
           <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textWhite]} text={transaction?.address}/>

        </ViewComponent>}
      {/* Paid */}
   {transaction?.paid  &&  (
     <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Paid</ParagraphComponent>
          <ParagraphComponent
            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}
          >
            {transaction?.paid
              ? `${formatCurrency(transaction?.paid||0, 2)} ${transaction?.cardCurrency || ""}`
              : ""}
          </ParagraphComponent>        </ViewComponent>
      </ViewComponent>)}

      {/* Fee */}
     <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Fee</ParagraphComponent>
          <CurrencyText style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} value={transaction?.fee} currency={transaction?.cardCurrency} />
        </ViewComponent>
      </ViewComponent>

 {/* Received */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Received</ParagraphComponent>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.amount &&(`${formatCurrency(transaction?.amount||0, 2)} ${transaction?.cardCurrency  ||""}`)||""}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>

      {/* Created on */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Created on</ParagraphComponent>
          <FormattedDateText
            value={transaction?.dateTime || ''}
            conversionType="UTC-to-local"
            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}
          />
        </ViewComponent>
      </ViewComponent>

      {/* Order ID */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Order ID</ParagraphComponent>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.txId || ''}</ParagraphComponent>
            <CopyCard size={s(24)} onPress={() => copyToClipboard(transaction?.txId)}  />
          </ViewComponent>
        </ViewComponent>
      </ViewComponent>

          {transaction?.remarks && (<ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Remarks</ParagraphComponent>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.remarks || ""}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>)}

    </ViewComponent>
  );
};

export default DepositDetails;