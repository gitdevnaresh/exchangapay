import React, { useCallback, useEffect, useState } from 'react';
import { WithdrawDetailsProps } from './types';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import { formatCurrency, isErrorDispaly } from '../../../utils/helpers';
import { s } from '../../../constants/theme/scale';
import Clipboard from '@react-native-clipboard/clipboard';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import CopyCard from '../../../newComponents/copyComponent/CopyCard';
import { FormattedDateText } from '../../../newComponents/textComponets/dateTimeText/dateTimeText';
import { formatCardNumberForDisplay } from '../constants';
import { Alert, Share } from 'react-native';
import { t } from 'i18next';
import { ActionLogParams, useActionLogging } from "../../../hooks/loggingHook";
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import ConsumptionSimliyRating from './smilyRating';
import TransactionService from '../../../services/transaction';
import { useIsFocused } from '@react-navigation/native';
import { NEW_COLOR } from '../../../constants/theme/variables';


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


const ConsumeDetails: React.FC<WithdrawDetailsProps> = ({ transaction }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const detailRowStyles = getDetailRowStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const isFoused = useIsFocused();
    const [rating, setRating] = useState();


    const copyToClipboard = (text: string) => {
        if (text) {
            Clipboard.setString(text);
        }
    };
    useEffect(() => {
       if( transaction?.txId){
        getTrnsactionRatingDetails(transaction?.txId);
       }
    }, [isFoused])


    const getTrnsactionRatingDetails = async (txId: string) => {

        let resposne: any = await TransactionService?.getConsumtionRating(txId);
        try {
            if (resposne?.ok) {
                setRating(resposne?.data);
            } else {
                showAppToast(isErrorDispaly(resposne), "error");
            }
        }
        catch (error) {
            showAppToast(isErrorDispaly(error), "error");
        }
    }


    const updateTheRating = async (selectedRating: any) => {
        let obj =
        {
            "rating": selectedRating,
            "reason": "Rating",
            "descrption": "Rating Change",
            "ratingId": transaction?.txId,
            "screenAction":"Consume Transaction"

        }
        try {
            let resposne: any = await TransactionService?.updateConsumtionRating(obj);
            if (resposne?.ok) {
                getTrnsactionRatingDetails(transaction?.txId)
            } else {
                showAppToast(isErrorDispaly(resposne), "error");
            }

        } catch (error) {
            showAppToast(isErrorDispaly(error), "error");
        }

    }

    const onShare = useCallback(async () => {

        try {
            await Share.share({
                message: `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_SHARE_MY")} ${walletCode} (${networkData?.network}) ${t("GLOBAL_CONSTANTS.ADDRESS_FOR_RECEIVING")} ${networkData?.address}. ${t("GLOBAL_CONSTANTS.PLEASE_MAKE_SURE_YOU_ARE_USING_THE_CORRECT_PROTOCAL")}\n${t("GLOBAL_CONSTANTS.THANK_YOU")}`
            });
            const actionData: ActionLogParams = {
                screename: 'TransactionDetails',
                actionName: 'Share Address',
                actionType: 'Share',
            };
            logEvent('share_address', actionData);
        } catch (error: any) {
            Alert.alert(error.message);
        }
    }, []);

    // Calculate the "Paid" amount by adding the received amount and the fee
    const paidAmount = (transaction?.amount || 0) + (transaction?.comission || 0);

    return (
        <ViewComponent style={[{ marginTop: -30 }]}>
            <ViewComponent>
                {/* Transaction Details Header */}
                <ParagraphComponent
                    text="Payment Method"
                    style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite, detailRowStyles.headerText]}
                />
                {/* Type */}
                <ViewComponent style={detailRowStyles.rowContainer}>
                    <ViewComponent style={detailRowStyles.rowContent}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]}>Payment account</ParagraphComponent>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.paymentMethod || ""}</ParagraphComponent>
                    </ViewComponent>
                </ViewComponent>

                {/* Network */}
                <ViewComponent style={detailRowStyles.rowContainer}>
                    <ViewComponent style={detailRowStyles.rowContent}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]}>Currency</ParagraphComponent>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.cardCurrency || ''}</ParagraphComponent>
                    </ViewComponent>
                </ViewComponent>

                {/* Amount */}
                <ViewComponent style={detailRowStyles.rowContainer}>
                    <ViewComponent style={detailRowStyles.rowContent}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]}>Amount</ParagraphComponent>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.amount && (`${formatCurrency(transaction?.amount||0, 2)} ${transaction?.currency || ""}`) || ""}</ParagraphComponent>
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.mt30]}>
                {/* Transaction Details Header */}
                <ParagraphComponent
                    text="Transaction Details"
                    style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite, detailRowStyles.headerText]}
                />
                {/* Created on */}
                <ViewComponent style={detailRowStyles.rowContainer}>
                    <ViewComponent style={detailRowStyles.rowContent}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]}>Date</ParagraphComponent>
                        <FormattedDateText
                            value={transaction?.dateTime || ''}
                            conversionType="UTC-to-local"
                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}
                        />        </ViewComponent>
                </ViewComponent>


                {/* Network */}
                <ViewComponent style={detailRowStyles.rowContainer}>
                    <ViewComponent style={detailRowStyles.rowContent}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]}>Card number</ParagraphComponent>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.cardNumber && formatCardNumberForDisplay(transaction?.cardNumber) || ''}</ParagraphComponent>
                    </ViewComponent>
                </ViewComponent>
                {/* Mcc */}
                <ViewComponent style={detailRowStyles.rowContainer}>
                    <ViewComponent style={detailRowStyles.rowContent}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]}>Mcc</ParagraphComponent>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.mcc || ''}</ParagraphComponent>
                    </ViewComponent>
                </ViewComponent>

                {/* Type */}
                <ViewComponent style={detailRowStyles.rowContainer}>
                    <ViewComponent style={detailRowStyles.rowContent}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]}>Type</ParagraphComponent>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.type || ''}</ParagraphComponent>
                    </ViewComponent>
                </ViewComponent>

                {/* Channel */}
                <ViewComponent style={detailRowStyles.rowContainer}>
                    <ViewComponent style={detailRowStyles.rowContent}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]}>Channel</ParagraphComponent>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.channel || ''}</ParagraphComponent>
                    </ViewComponent>
                </ViewComponent>
                {/* Merchant city */}
                <ViewComponent style={detailRowStyles.rowContainer}>
                    <ViewComponent style={detailRowStyles.rowContent}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]}> Merchant city</ParagraphComponent>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.merchantCity || ''}</ParagraphComponent>
                    </ViewComponent>
                </ViewComponent>
                {/* Merchant country */}
                <ViewComponent style={detailRowStyles.rowContainer}>
                    <ViewComponent style={detailRowStyles.rowContent}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]}>Merchant country</ParagraphComponent>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.merchantCountry || ''}</ParagraphComponent>
                    </ViewComponent>
                </ViewComponent>


                {/* Transaction ID */}
                <ViewComponent style={detailRowStyles.rowContainer}>
                    <ViewComponent style={detailRowStyles.rowContent}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]}>Transaction Id</ParagraphComponent>
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

                {/* Note */}
                <ViewComponent style={detailRowStyles.rowContainer}>
                    <ViewComponent style={detailRowStyles.rowContent}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]}>Note</ParagraphComponent>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transaction?.network || ''}</ParagraphComponent>
                    </ViewComponent>
                </ViewComponent>

                <ViewComponent style={[commonStyles.mb48, commonStyles.mt30]}>

                    <ConsumptionSimliyRating
                        rating={rating}
                        onRate={updateTheRating}
                    />
                </ViewComponent>


                {/* <ViewComponent style={[commonStyles.mb48,commonStyles.listGap, { margin: 8 }]}>
                            <ButtonComponent
                              title="GLOBAL_CONSTANTS.SHARE"
                              onPress={onShare}
                              customContainerStyle={[commonStyles.bg_yellow]}
                            />
                          </ViewComponent> */}




            </ViewComponent>
        </ViewComponent>
    );
};

export default ConsumeDetails;




