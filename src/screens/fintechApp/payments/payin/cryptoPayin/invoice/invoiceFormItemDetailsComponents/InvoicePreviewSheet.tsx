import React from "react";
import CustomRBSheet from "../../../../../../../components/models/commonBottomSheet";
import ViewComponent from "../../../../../../../components/view/view";
import ScrollViewComponent from "../../../../../../../components/scrollView/scrollView";
import TextMultiLanguage from "../../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ParagraphComponent from "../../../../../../../components/textComponets/paragraphText/paragraph";
import ImageUri from "../../../../../../../components/imageComponents/image";
import { s } from "../../../../../../../constants/styels/scale";
import ButtonComponent from "../../../../../../../components/buttons/button";
import { EditImage, RapidLogo } from "../../../../../../../assets/svg";
import { CurrencyText } from "../../../../../../../components/textComponets/currencyText/currencyText";

interface InvoicePreviewSheetProps {
  refRBSheet: any;
  height: number;
  invoiceGetData: any;
  commonStyles: any;
  handleClose?: any
}

const InvoicePreviewSheet: React.FC<InvoicePreviewSheetProps> = ({
  refRBSheet,
  height,
  invoiceGetData,
  commonStyles,
  handleClose
}) =>

(
  <CustomRBSheet
    refRBSheet={refRBSheet}
    height={"Extra Large"}
  >
    <ViewComponent>
      <ScrollViewComponent>
        <TextMultiLanguage text={"GLOBAL_CONSTANTS.INVOICE"} style={[commonStyles.textWhite, commonStyles.fs32, commonStyles.fw700]} />
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.mt16]}>
          <ViewComponent>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.ISSUED_DATE"} style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} />
            <ParagraphComponent text={`${invoiceGetData?.issuedDate || ""}`} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600, commonStyles.mt4]} />
          </ViewComponent>
          <ViewComponent style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <ViewComponent>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.mb4]}>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.DUE_DATE"} style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} />
                <EditImage />
              </ViewComponent>
              <ParagraphComponent text={`${invoiceGetData?.dueDate || ""}`} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]} />
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]} />
        <ViewComponent >
          <ViewComponent>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.ADDRESS"} style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw600, commonStyles.mb6]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.mt4, commonStyles.mb4]}>
              <RapidLogo width={s(20)} height={s(20)} />
              <TextMultiLanguage text={"GLOBAL_CONSTANTS.ARTHA_TECHNOLOGIES"} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600]} />
            </ViewComponent>
            <ParagraphComponent text={`${invoiceGetData?.companyName || ""}`} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600, commonStyles.mb4]} />
            <ParagraphComponent text={`${invoiceGetData?.clientName || ""}`} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600, commonStyles.mb4]} />
            <ParagraphComponent text={`${invoiceGetData?.streetAddress || ""},`} style={[commonStyles.textlinkgrey, commonStyles.fs12, commonStyles.fw400, commonStyles.mb4]} />
            <ParagraphComponent text={`${invoiceGetData?.city || ""}, ${invoiceGetData?.state || ""}, ${invoiceGetData?.country || ""} - ${invoiceGetData?.zipCode || ""}`} style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400, commonStyles.mb4]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap2]}>
              <TextMultiLanguage text={"GLOBAL_CONSTANTS.TAX_IDENTIFICATION_NO"} style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} />
              <ParagraphComponent text={`${invoiceGetData?.taxIdentificationNumber || ""},`} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]} />
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]} />
        <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.justifyContent]}>
          <ViewComponent style={[commonStyles.flex1]}>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.FROM"} style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite, commonStyles.titleSectionGap]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignStart]}>
              <ImageUri width={s(30)} height={s(30)} uri='https://devtstarthaone.blob.core.windows.net/arthaimages/decode_image.svg' />
              <ViewComponent style={[commonStyles.flex1]}>
                <ParagraphComponent text={`${invoiceGetData?.companyName || ""}`} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite, commonStyles.mb4]} />
                <ParagraphComponent text={`${invoiceGetData?.emails || ""}`} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]} />
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>
          <ViewComponent style={[commonStyles.flex1]}>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.BILLED_TO"} style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite, commonStyles.titleSectionGap]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignStart]}>
              <ImageUri width={s(30)} height={s(30)} uri='https://devtstarthaone.blob.core.windows.net/arthaimages/decode_image.svg' />
              <ViewComponent style={[commonStyles.flex1]}>
                <ParagraphComponent text={`${invoiceGetData?.clientName || ""}`} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite]} />
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]} />
        <ScrollViewComponent horizontal>
          <ViewComponent style={[commonStyles.rounded5, commonStyles.sectionBorder]}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.px10, commonStyles.py8, { borderBottomWidth: s(1), borderBottomColor: commonStyles.sectionBorder }]}>
              <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey, { width: 160 }]} text={"GLOBAL_CONSTANTS.ITEM_NAME"} />
              <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey, { width: 80 }]} text={"GLOBAL_CONSTANTS.QTY"} />
              <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey, { width: 120 }]} text={"GLOBAL_CONSTANTS.UNIT_PRICE"} />
              <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey, { width: 100 }]} text={"GLOBAL_CONSTANTS.DISCOUNT_PERCENTAGE"} />
              <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey, { width: 100 }]} text={"GLOBAL_CONSTANTS.TAX_PERCENTAGE"} />
              <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey, { width: 100 }]} text={"GLOBAL_CONSTANTS.AMOUNT"} />
            </ViewComponent>
            {invoiceGetData?.details?.map((item: any, index: number) => (
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.px10, commonStyles.py8, { borderBottomWidth: s(1), borderBottomColor: commonStyles.sectionBorder }]} key={item.id}>
                <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textWhite, { width: 160 }]}>{item.itemName || ""}</ParagraphComponent>
                <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textWhite, { width: 80 }]}>{item.quantity || ""}</ParagraphComponent>
                <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textWhite, { width: 120 }]}>{parseFloat(item?.unitPrice).toFixed(2) || ""}</ParagraphComponent>
                <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textWhite, { width: 100 }]}>{parseFloat(item?.discountPercentage) || ""}</ParagraphComponent>
                <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textWhite, { width: 100 }]}>{parseFloat(item?.taxPercentage) || ""}</ParagraphComponent>
                <CurrencyText style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textWhite, { width: 100 }]} value={item?.amount || 0} decimalPlaces={4} />
              </ViewComponent>
            ))}
          </ViewComponent>
        </ScrollViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]} />
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyend]}>
          <ViewComponent style={[commonStyles.bordered, commonStyles.p16, commonStyles.rounded10, { width: '70%' }]}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.titleSectionGap]}>
              <TextMultiLanguage text={"GLOBAL_CONSTANTS.AMOUNT_WITHOUT_TAX"} style={[commonStyles.textlinkgrey, commonStyles.fs12, commonStyles.fw400]} />
              <CurrencyText value={invoiceGetData?.amountwithoutTax || 0} decimalPlaces={4} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600]} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.titleSectionGap]}>
              <TextMultiLanguage text={"GLOBAL_CONSTANTS.TOTAL_DISCOUNT"} style={[commonStyles.textlinkgrey, commonStyles.fs12, commonStyles.fw400]} />
              <ParagraphComponent text={`${invoiceGetData?.totalDiscount || ""}`} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600]} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.titleSectionGap]}>
              <TextMultiLanguage text={"GLOBAL_CONSTANTS.TOTAL_TAX_AMOUNT"} style={[commonStyles.textlinkgrey, commonStyles.fs12, commonStyles.fw400]} />
              <CurrencyText value={invoiceGetData?.taxAmount || 0} decimalPlaces={4} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600]} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
              <TextMultiLanguage text={"GLOBAL_CONSTANTS.DUE"} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]} />
              <CurrencyText value={invoiceGetData?.dueAmount || 0} decimalPlaces={4} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]} />
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]} />
        <ViewComponent>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.mb10]}>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.INVOICE_CURRENCY"} style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} />
            <ParagraphComponent text={`${invoiceGetData?.invoiceCurrency || ""}`} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600, commonStyles.mt4]} />
          </ViewComponent>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.CC_EMAIL"} style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} />
            <ParagraphComponent text={`${invoiceGetData?.emails || ""}`} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]} />
          </ViewComponent>
        </ViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]} />
        <ButtonComponent title="GLOBAL_CONSTANTS.CLOSE" solidBackground={true} onPress={handleClose} />
        <ViewComponent style={[commonStyles.sectionGap]} />
        <ViewComponent style={[commonStyles.mb20]} />

      </ScrollViewComponent>
    </ViewComponent>
  </CustomRBSheet>
);

export default InvoicePreviewSheet;