import React, { useMemo } from "react";
import FlatListComponent from "../../../../../../../components/flatList/flatList";
import CommonTouchableOpacity from "../../../../../../../components/touchableComponents/touchableOpacity";
import ViewComponent from "../../../../../../../components/view/view";
import ParagraphComponent from "../../../../../../../components/textComponets/paragraphText/paragraph";
import TextMultiLanguage from "../../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { s } from "../../../../../../../constants/styels/scale";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { CurrencyText } from "../../../../../../../components/textComponets/currencyText/currencyText";
import { useThemeColors } from "../../../../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../../../../components/CommonStyles";
import CustomeditLink from "../../../../../../../components/svgIcons/mainmenuicons/linkedit";

interface InvoiceItemListProps {
  data: any[];
  props: any;
  commonStyles: any;
  NEW_COLOR: any;
  formatCurrency: any;
  handleEdit: (item: any) => void;
  handleDelete: (item: any) => void;
  noNetworkData: () => React.ReactNode;
}

const ItemSeparator: React.FC = () => <ViewComponent style={{ height: s(16) }} />;

const InvoiceItemList: React.FC<InvoiceItemListProps> = ({
  data,
  props,
  formatCurrency,
  handleEdit,
  handleDelete,
  noNetworkData,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

  return (
    <FlatListComponent
      data={data}
      scrollEnabled={false}   // 👈 disables FlatList scroll
      nestedScrollEnabled={true}
      ItemSeparatorComponent={ItemSeparator}
      renderItem={({ item, index }: any) => (
        <CommonTouchableOpacity key={index} activeOpacity={0.7}

        >
          <ViewComponent style={[]}>
            <ViewComponent style={[]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.listitemGap, , commonStyles.gap8, commonStyles.flexWrap]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.gap6]}>
                  <ParagraphComponent text={item?.itemName} style={[commonStyles.listsecondarytext, { width: s(120) }]} numberOfLines={1} />
                  {!props?.route?.params?.id &&
                    <CustomeditLink onPress={() => handleEdit(item)} width={s(16)} height={s(16)} />
                  }
                  {!props?.route?.params?.id && <CommonTouchableOpacity activeOpacity={0.8} onPress={() => handleDelete(item)}>
                    <FontAwesome5 name="trash-alt" size={s(14)} color={NEW_COLOR.TEXT_PRIMARY} />
                  </CommonTouchableOpacity>}
                </ViewComponent>
                <CurrencyText value={item?.amount || 0} decimalPlaces={4} style={[commonStyles.listprimarytext]} />

              </ViewComponent>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.listitemGap, commonStyles.gap8, commonStyles.flexWrap]}>
                <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.QUANTITY"} />
                <ParagraphComponent style={[commonStyles.listprimarytext]} text={` ${formatCurrency(item?.quantity || 0, 2)}`} />
              </ViewComponent>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.listitemGap, commonStyles.gap8, commonStyles.flexWrap]}>
                <TextMultiLanguage text={`${"GLOBAL_CONSTANTS.UNIT_PRICE"}`} style={[commonStyles.listsecondarytext]} />
                <ParagraphComponent style={[commonStyles.listprimarytext]} text={` ${formatCurrency(item?.unitPrice || 0, 2)}`} />
              </ViewComponent>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.listitemGap, commonStyles.gap8, commonStyles.flexWrap]}>
                <TextMultiLanguage text={`${"GLOBAL_CONSTANTS.DISCOUNT"}`} style={[commonStyles.listsecondarytext]} />
                <ParagraphComponent style={[commonStyles.listprimarytext]} text={` ${formatCurrency((parseFloat(item?.unitPrice) * parseFloat(item?.quantity) * parseFloat(item?.discountPercentage)) / 100 || 0, 4)} ${'('} ${item?.discountPercentage} ${'%)'}`} />
              </ViewComponent>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
                <TextMultiLanguage text={`${"GLOBAL_CONSTANTS.TAX"}`} style={[commonStyles.listsecondarytext]} />
                <ParagraphComponent style={[commonStyles.listprimarytext]} text={` ${formatCurrency(item?.taxAmount || 0, 4)} ${'('} ${item?.taxPercentage} ${'%)'}`} />
              </ViewComponent>



            </ViewComponent>

          </ViewComponent>
        </CommonTouchableOpacity>
      )}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={noNetworkData}
    />
  );
};

export default InvoiceItemList;