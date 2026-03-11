import React from 'react';
import { ApplyCardDetailsProps } from './types';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import { formatCurrency } from '../../../utils/helpers';
import { s } from '../../../constants/theme/scale';
import Clipboard from '@react-native-clipboard/clipboard';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import CopyCard from '../../../newComponents/copyComponent/CopyCard';
import { FormattedDateText } from '../../../newComponents/textComponets/dateTimeText/dateTimeText';
import { formatCardNumberForDisplay } from '../constants';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { NEW_COLOR } from '../../../constants/theme/variables';

const getDetailRowStyles = (colors: any) => ({
  rowContainer: {
    backgroundColor: NEW_COLOR.BANNER_BG,
    paddingHorizontal: s(8),
    paddingVertical: s(8),
    borderRadius: s(8),
    marginBottom: s(6),
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: s(12),
    flexWrap: "wrap"
  },
  headerText: {
    marginBottom: s(10),
    marginLeft: s(4),
  }
});


const ApplyCardDetails: React.FC<ApplyCardDetailsProps> = ({ transaction }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const detailRowStyles = getDetailRowStyles(NEW_COLOR);

  const copyToClipboard = (text: string) => {
    if (text) {
      Clipboard.setString(text);
    }
  };


  return (
    <ViewComponent style={[{ marginTop: -30 }]}>
      {/* Transaction Details Header */}
      <ParagraphComponent
        text="Transaction Details"
        style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite, detailRowStyles.headerText]}
      />

      {/* Transaction ID */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.S/N"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}/>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
            <ParagraphComponent
              style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {transaction?.txId || ''}
            </ParagraphComponent>
            <CopyCard size={s(24)} onPress={() => copyToClipboard(transaction?.txId)}  />
          </ViewComponent>

        </ViewComponent>

      </ViewComponent>

      {/* Amount */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.TYPE"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}/>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.cardType || ""}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>

      {/* Old Card number*/}
      {transaction?.action.toLowerCase().replace(/\s/g, '') === "replacecard" && (<><ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.OLD_CARD_NUMBER"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}/>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.oldCardNumber&&formatCardNumberForDisplay( transaction?.oldCardNumber) || ""}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent></>)}


      {/* New Card number ||  Card number*/}
      {transaction?.action?.toLowerCase()?.replace(/\s/g, '') == "replacecard" && (<> <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.NEW_CARD_NUMBER"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}/>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.cardNumber &&formatCardNumberForDisplay(transaction?.action?.toLowerCase()?.replace(/\s/g, '') === "replacecard" && transaction?.cardNumber || transaction?.cardNumber) || ""}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent></>)}

      {transaction?.action?.toLowerCase()?.replace(/\s/g, '') !== "replacecard" && (<> <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.CARD_NUMBER"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}/>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.cardNumber &&formatCardNumberForDisplay(transaction?.cardNumber) || ""}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent></>)}



      {/* Fee */}
      {(transaction?.action?.toLowerCase().replace(/\s/g, '') !== 'deletecard' && transaction?.action.toLowerCase().replace(/\s/g, '') !== 'replacecard') && (<>  <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.TOTAL_AMOUNT"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}/>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.amount &&`${formatCurrency(transaction?.amount||0, 2)} ${transaction?.cardCurrency || ""}`}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent></>)}


      {(transaction?.action.toLowerCase().replace(/\s/g, '') == 'deletecard' || transaction?.action.toLowerCase().replace(/\s/g, '') == 'replacecard') && (<> <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.REASON"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}/>
          <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{`${transaction?.remarks}`}</ParagraphComponent>
        </ViewComponent>
      </ViewComponent>
        <ViewComponent style={detailRowStyles.rowContainer}>
          <ViewComponent style={detailRowStyles.rowContent}>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.FEE"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}/>
            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.fee && `${formatCurrency(transaction?.fee||0,2)}${transaction.cardCurrency || ""}`}</ParagraphComponent>
          </ViewComponent>
        </ViewComponent>
      {(transaction?.action.toLowerCase().replace(/\s/g, '') == 'deletecard') && ( <><ViewComponent style={detailRowStyles.rowContainer}>
          <ViewComponent style={detailRowStyles.rowContent}>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.CANCELLED_BY"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}/>
            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.createdBy && `${transaction.createdBy || ""}`}</ParagraphComponent>
          </ViewComponent>
        </ViewComponent></>)}
      </>)}


      {/* Created on */}
      <ViewComponent style={detailRowStyles.rowContainer}>
        <ViewComponent style={detailRowStyles.rowContent}>
          <TextMultiLanguage text={"GLOBAL_CONSTANTS.CREATED_ON"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}/>
          <FormattedDateText
            value={transaction?.dateTime || ''}
            conversionType="UTC-to-local"
            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}
          />        </ViewComponent>
      </ViewComponent>

    </ViewComponent>
  );
};

export default ApplyCardDetails;




