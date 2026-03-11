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
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { CurrencyText } from '../../../newComponents/textComponets/currencyText/currencyText';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { useSelector } from 'react-redux';


// This style object creates the rounded-corner container for each detail row.
// You might need to adjust the backgroundColor to match your theme's exact color.
const getDetailRowStyles = (colors: any) => ({
    rowContainer: {
        backgroundColor: NEW_COLOR.BANNER_BG, // A dark grey color similar to the screenshot
        paddingHorizontal: s(8),
        paddingVertical: s(8),
        borderRadius: s(8),
        marginBottom: s(8), // Space between each row item
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


const ReceiveDetails: React.FC<any> = ({ transaction }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const detailRowStyles = getDetailRowStyles(NEW_COLOR);
    const { decryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state: any) => state?.userReducer?.userDetails);

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

            {transaction?.merchantName && <ViewComponent style={detailRowStyles.rowContainer}>
                <ViewComponent style={detailRowStyles.rowContent}>
                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Merchant Name</ParagraphComponent>
                    <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.merchantName || ''}</ParagraphComponent>
                </ViewComponent>
            </ViewComponent>}

            <ViewComponent style={detailRowStyles.rowContainer}>
                <ViewComponent style={detailRowStyles.rowContent}>
                    <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.SENDER"} />
                    <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.address || ""}</ParagraphComponent>
                </ViewComponent>
            </ViewComponent>

            {/* Received */}
            <ViewComponent style={detailRowStyles.rowContainer}>
                <ViewComponent style={detailRowStyles.rowContent}>
                    <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.RECEIVER"} />
                    <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{decryptAES(userInfo?.depositReference) || ''}</ParagraphComponent>
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={detailRowStyles.rowContainer}>

            <ViewComponent style={[detailRowStyles.rowContent]}>
                <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.AMOUNT"} />
                <CurrencyText value={transaction?.amount} currency={transaction?.cardCurrency} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
            </ViewComponent>
                        </ViewComponent>

            {/* Fee */}
            {transaction?.fee && (<ViewComponent style={detailRowStyles.rowContainer}>
                <ViewComponent style={detailRowStyles.rowContent}>
                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}>Fee</ParagraphComponent>
                    <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.fee && `${formatCurrency(transaction?.fee || 0, 2)} ${transaction?.cardCurrency || ""}`}</ParagraphComponent>
                </ViewComponent>
            </ViewComponent>)}

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
                        <CopyCard size={s(24)} onPress={() => copyToClipboard(transaction?.txId)} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>

        </ViewComponent>
    );
};

export default ReceiveDetails;