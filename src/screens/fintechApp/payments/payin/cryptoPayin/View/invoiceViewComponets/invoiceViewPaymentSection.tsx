import React from "react";
import ViewComponent from "../../../../../../../components/view/view";
import ParagraphComponent from "../../../../../../../components/textComponets/paragraphText/paragraph";
import TextMultiLanguage from "../../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import QRCode from "react-native-qrcode-svg";
import CopyCard from "../../../../../../../components/copyIcon/CopyCard";
import CommonTouchableOpacity from "../../../../../../../components/touchableComponents/touchableOpacity";
import ButtonComponent from "../../../../../../../components/buttons/button";
import { s } from "../../../../../../../components/theme/scale";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useThemeColors } from "../../../../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../../../../components/CommonStyles";
import { CurrencyText } from "../../../../../../../components/textComponets/currencyText/currencyText";

const InvoicePaymentSection = ({
    invoiceGetData,
    handleRedirect,
    handelCopyWalletAddress,
    handleCopyPaymentLink,
    onShare,
}: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return (
        <ViewComponent>
            {invoiceGetData?.walletAddress && (
                <ViewComponent style={[commonStyles.mxAuto]}>
                    <ParagraphComponent text={`${invoiceGetData.currency} (${invoiceGetData.networkName})`} style={[commonStyles.sectionSubTitleText, commonStyles.textCenter]} />
                    <ViewComponent style={[commonStyles.bgAlwaysWhite, commonStyles.mt16, { padding: 6, borderRadius: 0 }]}>
                        <QRCode value={invoiceGetData.walletAddress ?? ""} size={s(200)} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                </ViewComponent>
            )}
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                <TextMultiLanguage style={[commonStyles.transactionamounttextlabel]} text={"GLOBAL_CONSTANTS.AMOUNT_DUE"} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                <CurrencyText style={[commonStyles.transactionamounttext]} value={invoiceGetData?.dueAmount} decimalPlaces={4} currency={invoiceGetData?.currency} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.titleSectionGap]} />
            {invoiceGetData?.walletAddress && (
                <ViewComponent style={[commonStyles.bgnote]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.RECIPIENT"} style={[commonStyles.walletaddresssecondarytext]} />
                        <CopyCard onPress={handelCopyWalletAddress} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                        <ParagraphComponent
                            text={`${invoiceGetData?.walletAddress?.substring(0, 15) ?? ""}......${invoiceGetData?.walletAddress?.slice(-15) ?? ""}`}
                            style={[commonStyles.walletaddressessprimarytext]}
                        />


                    </ViewComponent>

                </ViewComponent>
            )}
            <ViewComponent style={[commonStyles.titleSectionGap]} />
            <ViewComponent style={[commonStyles.bgnote]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10, commonStyles.alignCenter]}>
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.PAYMENT_LINK"} style={[commonStyles.walletaddresssecondarytext]} />

                    {invoiceGetData?.paymentLink && <CopyCard onPress={handleCopyPaymentLink} />}
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                    <CommonTouchableOpacity onPress={() => handleRedirect(invoiceGetData?.paymentLink)}>
                        <ParagraphComponent text={`${invoiceGetData?.paymentLink?.substring(0, 15) ?? ""}......${invoiceGetData?.paymentLink?.slice(-15) ?? ""}`} style={[commonStyles.paymentLinkprimarytext]} />
                    </CommonTouchableOpacity>
                </ViewComponent>
            </ViewComponent>

            {invoiceGetData?.paymentNote && (
                <ViewComponent style={[]}>
                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.PAYMENT_TERMS_NOTES"} style={[commonStyles.secondarytext, commonStyles.mb8]} />
                    <ViewComponent style={[commonStyles.bgnote]}>
                        <ParagraphComponent text={invoiceGetData.paymentNote ?? ""} style={[commonStyles.placeholderfontsizes]} />
                    </ViewComponent>
                </ViewComponent>
            )}
            <ViewComponent style={[commonStyles.titleSectionGap]} />
            <ViewComponent style={[commonStyles.bannerbg, commonStyles.rounded5, commonStyles.p10, commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8]}>
                <MaterialIcons name="info-outline" size={s(16)} color={NEW_COLOR.NOTE_ICON} />
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.PLEASE_DOUBLE_CHECK"} style={[commonStyles.bgNoteText, commonStyles.flex1]} />

            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />
            <ButtonComponent title={"GLOBAL_CONSTANTS.SHARE"} icon={<Feather name="share" size={s(18)} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />} onPress={onShare} disable={false} />
            <ViewComponent style={[commonStyles.buttongap]} />
        </ViewComponent>
    )
};

export default InvoicePaymentSection;