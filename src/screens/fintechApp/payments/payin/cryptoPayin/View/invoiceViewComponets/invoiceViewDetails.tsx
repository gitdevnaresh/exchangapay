import React from "react";
import ViewComponent from "../../../../../../../components/view/view";
import ImageUri from "../../../../../../../components/imageComponents/image";
import TextMultiLanguage from "../../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ParagraphComponent from "../../../../../../../components/textComponets/paragraphText/paragraph";
import { s } from "../../../../../../../components/theme/scale";
import { dateFormates } from "../../../../../../../utils/helpers";
import Content from "../../../../../../../components/container/Content";
import { CurrencyText } from "../../../../../../../components/textComponets/currencyText/currencyText";
import ActionButton from "../../../../../../../components/gradianttext/gradiantbg";
import CommonTouchableOpacity from "../../../../../../../components/touchableComponents/touchableOpacity";
import StateChanageIcon from "../../../../../../../components/svgIcons/mainmenuicons/statechange";
import { useThemeColors } from "../../../../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles, statusColor } from "../../../../../../../components/CommonStyles";
import { InvoiceImage, RapidLogo } from "../../../../../../../assets/svg";
import EditLinksIcon from "../../../../../../../components/svgIcons/mainmenuicons/linkedit";
import { FormattedDateText } from "../../../../../../../components/textComponets/dateTimeText/dateTimeText";
import RapidzEditIcon from "../../../../../../../components/svgIcons/mainmenuicons/rapidzedit";
const InvoiceDetails = ({
    invoiceGetData,
    decryptAES,
    handleEdit,
    handleStateChange,


}: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignStart, commonStyles.sectionGap, commonStyles.gap8]}>
                {invoiceGetData?.state !== "PAID" && <CommonTouchableOpacity style={[commonStyles.flex1]} >
                    <ViewComponent>
                        <ActionButton text={"GLOBAL_CONSTANTS.EDIT"} useGradient customIcon={<RapidzEditIcon />} onPress={() => handleEdit(invoiceGetData)} />

                    </ViewComponent></CommonTouchableOpacity>}
                <ViewComponent style={[commonStyles.flex1]} >
                    <ActionButton text={"GLOBAL_CONSTANTS.STATE_CHANGE"} onPress={() => handleStateChange()} customTextColor={NEW_COLOR.TEXT_PRIMARY} customIcon={<StateChanageIcon />} />
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.INVOICE"} style={[commonStyles.sectionTitle, commonStyles.mb8]} />
            </ViewComponent>

            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.sectionGap]}>
                <ViewComponent>
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.ISSUED_DATE"} style={[commonStyles.paymentinvoicedatetext]} />
                    <FormattedDateText value={invoiceGetData?.issuedDate} dateFormat={dateFormates.date} style={[commonStyles.paymentinvoicedate]} />

                </ViewComponent>
                <ViewComponent >
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.DUE_DATE"} style={[commonStyles.paymentinvoicedatetext]} />
                    <FormattedDateText value={invoiceGetData?.dueDate} dateFormat={dateFormates.date} style={[commonStyles.paymentinvoicedate]} />

                </ViewComponent>
            </ViewComponent>



            <ViewComponent >
                <ViewComponent>
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.ADDRESS"} style={[commonStyles.sectionSubTitleText,]} />
                    {/* <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.ARTHA_TECHNOLOGIES"} style={[commonStyles.paymentadddressestext]} />
                    </ViewComponent> */}
                    {/* {invoiceGetData?.merchantName && <ParagraphComponent text={`${invoiceGetData?.merchantName || ""}`} style={[commonStyles.paymentadddressestext]} />} */}
                    {invoiceGetData?.companyName && <ParagraphComponent text={`${invoiceGetData?.companyName || ""}`} style={[commonStyles.paymentadddressestext]} />}
                    {invoiceGetData?.clientName && <ParagraphComponent text={`${invoiceGetData?.clientName || ""}`} style={[commonStyles.paymentadddressestext]} />}
                    {invoiceGetData?.streetAddress && <ParagraphComponent text={`${invoiceGetData?.streetAddress},`} style={[commonStyles.paymentadddressestext]} />}

                    {(() => {
                        const city = invoiceGetData?.city ? invoiceGetData?.city + ', ' : '';
                        const state = invoiceGetData?.state ? invoiceGetData?.state + ', ' : '';
                        const country = invoiceGetData?.country || '';
                        const zip = decryptAES(invoiceGetData?.zipCode || '');
                        const addressLine = city + state + country + (zip ? ` - ${zip}` : '');
                        return (
                            <ParagraphComponent
                                text={addressLine}
                                style={[commonStyles.paymentadddressestext]}
                            />
                        );
                    })()}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.mt4]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.STATUS"} style={[commonStyles.listsecondarytext]} />
                        <ParagraphComponent text={invoiceGetData?.status ? `: ${invoiceGetData.status},` : ""} style={[commonStyles.listprimarytext, { color: statusColor[invoiceGetData?.status?.toLowerCase()] }]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.mt4]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.TAX_IDENTIFICATION_NO"} style={[commonStyles.listsecondarytext]} />
                        <ParagraphComponent text={` ${decryptAES(invoiceGetData?.taxIdentificationNumber)}` || ""} style={[commonStyles.listprimarytext]} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.titleSectionGap]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap30, commonStyles.alignCenter,]}>
                <ViewComponent style={[]}>
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.FROM"} style={[commonStyles.listprimarytext]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                        <ImageUri width={s(30)} height={s(30)} uri='https://devtstarthaone.blob.core.windows.net/arthaimages/decode_image.svg' />
                        <ViewComponent style={[]}>
                            <ParagraphComponent text={invoiceGetData.companyName} style={[commonStyles.paymentinvoicfrom]} />
                            <ParagraphComponent text={decryptAES(invoiceGetData?.emails)} style={[commonStyles.sectionsubtitlepara]} />
                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
                <ViewComponent style={[]}>
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.BILLED_TO"} style={[commonStyles.listprimarytext]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignStart]}>
                        <InvoiceImage height={s(24)} width={s(24)} />
                        <ViewComponent style={[]}>
                            <ParagraphComponent text={invoiceGetData?.clientName} style={[commonStyles.sectionsubtitlepara]} />
                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />
            <Content horizontal>
                <ViewComponent style={[commonStyles.sectionBorder, commonStyles.rounded5]} >
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap12, {
                        borderBottomWidth: 1,
                        borderBottomColor: NEW_COLOR.SECTION_BORDER,
                    }, commonStyles.p8]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.ITEM_NAME"} style={[commonStyles.invoicetable, { width: s(100) }]} />
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.QTY"} style={[commonStyles.invoicetable, { width: s(80) }]} />
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.UNIT_PRICE"} style={[commonStyles.invoicetable, { width: s(100) }]} />
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.DISCOUNT_PERCENTAGE"} style={[commonStyles.invoicetable, { width: s(100) }]} />
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.TAX_PERCENTAGE"} style={[commonStyles.invoicetable, { width: s(100) }]} />
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.AMOUNT"} style={[commonStyles.invoicetable, { width: s(80) }]} />
                    </ViewComponent>

                    {invoiceGetData?.details?.map((item: any, index: any) => (
                        <ViewComponent key={item.id}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.p8]}>
                                <ParagraphComponent text={item?.itemName || ""} style={[commonStyles.listprimarytext, { width: s(100) }]} />
                                <ParagraphComponent text={item?.quantity || ""} style={[commonStyles.listprimarytext, { width: s(80) }]} />
                                <CurrencyText value={item?.unitPrice || 0} decimalPlaces={4} style={[commonStyles.listprimarytext, { width: s(100) }]} />
                                <ParagraphComponent text={parseFloat(item?.discountPercentage) || 0} style={[commonStyles.listprimarytext, { width: s(100) }]} />
                                <ParagraphComponent text={parseFloat(item?.taxPercentage) || 0} style={[commonStyles.listprimarytext, { width: s(100) }]} />
                                <CurrencyText value={item?.amount || 0} decimalPlaces={4} style={[commonStyles.listprimarytext, { width: s(80) }]} />
                            </ViewComponent>
                            {index !== invoiceGetData?.details?.length - 1 && <ViewComponent style={[commonStyles.hLine,]} />}
                        </ViewComponent>
                    ))}
                </ViewComponent>
            </Content>

            <ViewComponent style={[commonStyles.titleSectionGap]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyend]}>
                <ViewComponent style={[commonStyles.bordered, commonStyles.p10, commonStyles.rounded5]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap22, commonStyles.mb14, commonStyles.flexWrap]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.AMOUNT_WITHOUT_TAX"} style={[commonStyles.listsecondarytext]} />
                        <CurrencyText value={invoiceGetData?.amountwithoutTax || 0} decimalPlaces={4} style={[commonStyles.listprimarytext]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap22, commonStyles.mb14, commonStyles.flexWrap]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.TOTAL_DISCOUNT"} style={[commonStyles.listsecondarytext]} />
                        <CurrencyText value={invoiceGetData?.totalDiscount || 0} decimalPlaces={4} style={[commonStyles.listprimarytext]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap22, commonStyles.mb14, commonStyles.flexWrap]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.TOTAL_TAX_AMOUNT"} style={[commonStyles.listsecondarytext]} />
                        <CurrencyText value={invoiceGetData?.taxAmount || 0} decimalPlaces={4} style={[commonStyles.listprimarytext]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap22]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.TOTAL_PAYBLE"} style={[commonStyles.listsecondarytext]} />
                        <CurrencyText value={invoiceGetData?.dueAmount || 0} decimalPlaces={4} style={[commonStyles.listprimarytext]} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />
        </ViewComponent>
    )
};

export default InvoiceDetails;