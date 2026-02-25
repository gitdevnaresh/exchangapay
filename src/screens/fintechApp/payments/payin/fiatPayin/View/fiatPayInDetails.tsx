import React from "react";
import {
    StyleSheet,
    Linking,
    Share,
} from 'react-native';
import { s } from '../../../../../../components/theme/scale';
import QRCode from 'react-native-qrcode-svg';
import ViewComponent from '../../../../../../components/view/view';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles, statusColor } from '../../../../../../components/CommonStyles';
import ButtonComponent from '../../../../../../components/buttons/button';
import Feather from '@expo/vector-icons/Feather';
import { CurrencyText } from '../../../../../../components/textComponets/currencyText/currencyText';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import { dateFormates, isErrorDispaly } from '../../../../../../utils/helpers';
import { showAppToast } from '../../../../../../components/toasterMessages/ShowMessage';
import TextMultiLanguage from '../../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { useLngTranslation } from '../../../../../../hooks/languagesHook/useLngTranslation';
import { FormattedDateText } from '../../../../../../components/textComponets/dateTimeText/dateTimeText';
import { MaterialIcons } from '@expo/vector-icons';
import CommonTouchableOpacity from '../../../../../../components/touchableComponents/touchableOpacity';
import CopyCard from '../../../../../../components/copyIcon/CopyCard';
import { copyToClipboard } from '../../../../../../components/copyToClipBoard/copy ToClopBoard';
import { useNavigation } from '@react-navigation/native';
import LabelComponent from "../../../../../../components/textComponets/lableComponent/lable";


const PaymentScreen = ({ paymentData }: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
    const handleOpenLink = () => {
        Linking?.openURL(paymentData?.paymentLink)
    }
    const handleShare = async () => {
        try {
            await Share.share({
                message: `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_SHARE_MY")} ${paymentData?.currency} ${t("GLOBAL_CONSTANTS.TRANSACTION")}. \n${t("GLOBAL_CONSTANTS.PLEASE_MAKE_SURE_YOU_ARE_USING_THE_CORRECT_PROTOCAL")}\n${t("GLOBAL_CONSTANTS.I_AM_USING")}: ${paymentData?.paymentLink}\n${t("GLOBAL_CONSTANTS.THANK_YOU")}`
            });
        } catch (error) {
            showAppToast(isErrorDispaly(error), "error")
        }
    };

    const handlePaymentLinkCopyToClipboard = () => {
        copyToClipboard(paymentData?.paymentLink)
    }
    const handleCancel = () => {
        navigation.goBack();
    }
    return (

        <ViewComponent style={[commonStyles.screenBg]}>
            <ViewComponent style={[]}>
                {/* <ParagraphComponent text={paymentData?.paymentType} style={[commonStyles.transactionamounttextlabel]} /> */}
                <CurrencyText
                    value={paymentData?.amount ?? 0}
                    currency={paymentData?.currency ?? ''}
                    symboles={true}
                    style={[
                        commonStyles.transactionamounttext,
                        commonStyles.sectionGap
                    ]}
                />
                <ViewComponent style={[]}>{paymentData?.orderID}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.listitemGap]}>
                        <ParagraphComponent text={`${paymentData?.paymentType || t("GLOBAL_CONSTANTS.STATIC_PAYMENT_LINK")}`} style={[commonStyles.listsecondarytext]} />
                        <ParagraphComponent text={paymentData?.invoiceNumber} style={[commonStyles.listprimarytext]} />
                    </ViewComponent>
                    {paymentData?.orderID && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.listitemGap]}>
                        <ParagraphComponent text={`${t("GLOBAL_CONSTANTS.ORDER_ID")}   `} style={[commonStyles.listsecondarytext]} />
                        <ParagraphComponent text={paymentData?.orderID} style={[commonStyles.listprimarytext]} />
                    </ViewComponent>}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.listitemGap]}>

                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.DUE_DATE_COLLON"} style={[commonStyles.listsecondarytext]} />
                        <FormattedDateText value={paymentData?.expireDate} dateFormat={dateFormates.date} style={[commonStyles.listprimarytext]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.sectionGap]}>

                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.STATUS"} style={[commonStyles.listsecondarytext]} />
                        <ParagraphComponent text={paymentData?.invoiceState} style={[commonStyles.colorstatus, commonStyles.textRight, { color: statusColor[paymentData?.invoiceState?.toLowerCase()] || NEW_COLOR.TEXT_GREEN }]} />
                    </ViewComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.titleSectionGap]}>
                    <ParagraphComponent style={[commonStyles.transactionamounttext, commonStyles.mb12]}>{paymentData?.currency}</ParagraphComponent>
                    <ViewComponent style={[styles.qrCodeContainer, commonStyles.mb6]}>

                        {paymentData?.paymentLink && <ViewComponent>
                            <QRCode value={paymentData?.paymentLink} size={s(200)} />
                        </ViewComponent>}
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.mt10, commonStyles.titleSectionGap]}>
                        <TextMultiLanguage style={[commonStyles.transactionamounttextlabel]} text={"GLOBAL_CONSTANTS.AMOUNT_DUE"} />
                        <CurrencyText
                            value={paymentData?.dueAmount ?? 0}
                            currency={paymentData?.currency ?? ''}
                            symboles={true}
                            style={[
                                commonStyles.transactionamounttext
                            ]}
                        />
                    </ViewComponent>

                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.bgnote, commonStyles.titleSectionGap]}>
                <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.PAYMENT_LINK"} style={[commonStyles.walletaddresssecondarytext]} />
                    {paymentData?.paymentLink && <CopyCard onPress={handlePaymentLinkCopyToClipboard} />}
                </ViewComponent>
                <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter]}>
                    <CommonTouchableOpacity onPress={handleOpenLink}>
                        <LabelComponent style={[commonStyles.paymentLinkprimarytext]} selectable={true}>
                            {paymentData?.paymentLink}
                        </LabelComponent>
                        {/* <ParagraphComponent text={`${paymentData?.paymentLink?.substring(0, 15)}......${paymentData?.paymentLink?.slice(-15)}`} style={[commonStyles.paymentLinkprimarytext]} /> */}
                    </CommonTouchableOpacity>
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.bgnote]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8]}>

                    <ViewComponent>
                        <MaterialIcons name="info-outline" size={s(20)} color={NEW_COLOR.NOTE_ICON} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]} >
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.NOTE_PLEASE_DOUBLE_CHECK_ALL_DETAILS_INCLUDING_THE_SELECTED"} style={[commonStyles.bgNoteText]} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />
            <ViewComponent>
                <ButtonComponent title={"GLOBAL_CONSTANTS.SHARE"} icon={<Feather name="share" size={s(18)} color={NEW_COLOR.TEXT_PRIMARY} />} onPress={handleShare} disable={false} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.buttongap]} />
            <ViewComponent>
                <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={handleCancel} disable={false} solidBackground={true} />
            </ViewComponent>
        </ViewComponent>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    cardCurrencyText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 15,
    },
    qrCodeContainer: {
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 6,
    },
    paymentLinkTitle: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    paymentLinkText: {
        fontSize: 14,
        color: '#E5B842', // Gold color for link
        marginBottom: 30,
        textAlign: 'center',
    },
});

export default PaymentScreen;