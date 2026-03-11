import React from 'react';
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

// This style object creates the rounded-corner container for each detail row.
// You might need to adjust the backgroundColor to match your theme's exact color.
const getDetailRowStyles = (colors:any) => ({
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


const SignupBonus: React.FC<any> = ({ transaction }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const detailRowStyles = getDetailRowStyles(NEW_COLOR);

  const copyToClipboard = (text: string) => {
    if (text) {
      Clipboard.setString(text);
    }
  };

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
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Type</ParagraphComponent>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.action || ""}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>

      {/* Network */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Network</ParagraphComponent>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.network || ''}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>


    

      {/* Amount */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Amount</ParagraphComponent>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.amount && `${formatCurrency(transaction?.amount||0, 2)} ${transaction?.cardCurrency || ""}`}</ParagraphComponent>
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
          />        </ViewComponent>
      </ViewComponent>


      {/* Fee */}
      {transaction?.fee &&(<ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Fee</ParagraphComponent>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.fee && `${formatCurrency(transaction?.fee||0, 2)} ${transaction?.cardCurrency || ""}`}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>)}

      {/* Transaction ID */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Transaction ID </ParagraphComponent>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.txId || ''}</ParagraphComponent>
            <CopyCard size={s(24)} onPress={() => copyToClipboard(transaction?.txId)}/>
          </ViewComponent>
        </ViewComponent>
      </ViewComponent>
    </ViewComponent>
  );
};

export default SignupBonus;