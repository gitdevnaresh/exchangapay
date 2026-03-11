import React from "react";
import ViewComponent from "../view/view";
import ErrorComponent from "../errorDisplay/errorDisplay";
import Loadding from "../../screens/commonScreens/skeltons";
import FlatListComponent from "../flatList/flatList";
import { kpisSkelton } from "../../screens/commonScreens/transactions/skeltonViews";
import ParagraphComponent from "../textComponets/paragraphText/paragraph";
import { CurrencyText } from "../textComponets/currencyText/currencyText";
import { useSelector } from "react-redux";
import { getTabsConfigation } from "../../../configuration";
import { useLngTranslation } from "../../hooks/useLngTranslation";
import { useThemeColors } from "../../hooks/useThemeColors";
import { s } from "../theme/scale";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import NoDataComponent from "../noData/noData";

interface KpiItem {
  id?: string | number; // Make 'id' optional to reflect potential undefined values
  name: string;
  value: number | string;
  isCount?: boolean;
}

interface CommonListProps {
  data: KpiItem[];
  loading?: boolean;
  error?: string | null;
  clearError?: React.Dispatch<React.SetStateAction<string>>;
}

const ListItemSeparator = () => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return <ViewComponent style={[commonStyles.mb14]} />;
};

const KpiComponent = ({
  data,
  loading,
  error,
  clearError,
}: CommonListProps) => {
  const transactionCard = kpisSkelton(1);
  const userInfo = useSelector((state: any) => state.userReducer.userDetails);
  const currency = getTabsConfigation('CURRENCY')
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const clearErrorMsg = () => {
    if (clearError) {
      clearError("");
    }
  }
  const renderItem = ({ item, index }: { item: KpiItem, index: number }) => {
    const isTotal = item.name.toLowerCase() === 'total';
    return (
      <ViewComponent key={item.id?.toString() ?? index.toString()} style={[commonStyles.bannerbg, isTotal ? commonStyles.w100 : commonStyles.flex1, commonStyles.p10, commonStyles.pl16, commonStyles.rounded10]}>
        <ViewComponent>
          <ParagraphComponent
            style={[commonStyles.textKpiLabel, commonStyles.fs14, commonStyles.fw500, commonStyles.mb5]}
            text={t(item?.name) || ""}
          />
          {item?.isCount && <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500]} text={item?.value ?? 0} />}
          {!item?.isCount && <CurrencyText style={[commonStyles.textWhite, commonStyles.fs22, commonStyles.fw600]} prifix={currency[userInfo?.currency]} value={parseFloat(String(item?.value ?? 0)) || 0} />}
        </ViewComponent>
      </ViewComponent>
    );
  }

  const renderContent = () => {
    if (loading) {
      return <Loadding contenthtml={transactionCard} />;
    }
    if (data.length > 0) {
      const totalItem = data.find(item => item.name.toLowerCase() === 'total');
      const otherItems = data.filter(item => item.name.toLowerCase() !== 'total');
      
      return (
        <ViewComponent>
          {/* Total item - full width */}
          {totalItem && (
            <ViewComponent style={[commonStyles.mb14]}>
              {renderItem({ item: totalItem, index: 0 })}
            </ViewComponent>
          )}
          
          {/* Other items - 2 columns */}
          {otherItems.length > 0 && (
            <FlatListComponent
              data={otherItems}
              keyExtractor={(item: KpiItem, index: number) => item.id?.toString() ?? index.toString()}
              renderItem={renderItem}
              ItemSeparatorComponent={ListItemSeparator}
              columnWrapperStyle={{ columnGap: 14 }}
              numColumns={2}
              NoData={<NoDataComponent/>}
            />
          )}
        </ViewComponent>
      );
    }
    return <NoDataComponent />;
  };
  return (
    <ViewComponent>
      {renderContent()}
    </ViewComponent>
  );
};

export default KpiComponent;
