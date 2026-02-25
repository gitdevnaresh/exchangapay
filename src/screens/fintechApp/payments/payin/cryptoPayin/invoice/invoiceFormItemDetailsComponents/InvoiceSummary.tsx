import React, { useMemo } from "react";
import ViewComponent from "../../../../../../../components/view/view";
import TextMultiLanguage from "../../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { useThemeColors } from "../../../../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../../../../components/CommonStyles";
import { CurrencyText } from "../../../../../../../components/textComponets/currencyText/currencyText";

interface InvoiceSummaryProps {
  commonStyles: any;
  props: any;
  getData: any;
  WithOutTax: number;
  TotalTax: number;
  DiscountAmunt: number;
  InvoiceCurrency: any
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  props,
  getData,
  WithOutTax,
  TotalTax,
  DiscountAmunt,
  InvoiceCurrency,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

  return (
    <ViewComponent>
      <TextMultiLanguage text={"GLOBAL_CONSTANTS.SUMMARY"} style={[commonStyles.sectionTitle]} />
      <ViewComponent style={[commonStyles.titleSectionGap]} />
      <ViewComponent style={[commonStyles?.dflex, commonStyles?.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
        <TextMultiLanguage text={"GLOBAL_CONSTANTS.AMOUNT_WITHOUT_TAX"} style={[commonStyles.listsecondarytext]} />
        <CurrencyText value={props.route.params?.id ? (getData?.amountwithoutTax || 0) : (WithOutTax || 0)} decimalPlaces={4} style={[commonStyles.listprimarytext, commonStyles.flex1, commonStyles.textRight]} />
      </ViewComponent>
      <ViewComponent style={[commonStyles.listitemGap]} />
      <ViewComponent style={[commonStyles?.dflex, commonStyles?.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
        <TextMultiLanguage text={"GLOBAL_CONSTANTS.TOTAL_TAX_AMOUNT"} style={[commonStyles.listsecondarytext]} />
        <CurrencyText value={props.route.params?.id ? (getData?.taxAmount || 0) : (TotalTax || 0)} decimalPlaces={4} style={[commonStyles.listprimarytext]} />
      </ViewComponent>
      <ViewComponent style={[commonStyles.listitemGap]} />
      <ViewComponent style={[commonStyles?.dflex, commonStyles?.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
        <TextMultiLanguage text={"GLOBAL_CONSTANTS.TOTAL_DISCOUNT"} style={[commonStyles.listsecondarytext]} />
        <CurrencyText value={props.route.params?.id ? (getData?.totalDiscount || 0) : (DiscountAmunt || 0)} decimalPlaces={4} style={[commonStyles.listprimarytext]} />
      </ViewComponent>
      <ViewComponent style={[commonStyles.listitemGap]} />
      <ViewComponent style={[commonStyles?.dflex, commonStyles?.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
        <TextMultiLanguage text={"GLOBAL_CONSTANTS.AMOUNT_DUE"} style={[commonStyles.listsecondarytext]} />
        <CurrencyText value={props.route.params?.id ? (getData?.totalAmount || 0) : ((WithOutTax - DiscountAmunt) + TotalTax || 0)} decimalPlaces={4} style={[commonStyles.listprimarytext]} currency={InvoiceCurrency} />
      </ViewComponent>
    </ViewComponent>
  )
};

export default InvoiceSummary;