import React from "react";
import ViewComponent from "../view/view";
import ErrorComponent from "../errorDisplay/errorDisplay";
import Loadding from "../skelton/skeltons";
import FlatListComponent from "../flatList/flatList";
import { getThemedCommonStyles } from "../CommonStyles";
import { kpisSkelton } from "../../skeletons/skeltonViews";
import ParagraphComponent from "../textComponets/paragraphText/paragraph";
import { CurrencyText } from "../textComponets/currencyText/currencyText";
import { useSelector } from "react-redux";
import { getTabsConfigation } from '../../../configuration';
import { useLngTranslation } from "../../hooks/languagesHook/useLngTranslation";
import NoDataComponent from "../noData/noData";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";
import { s } from "../../constants/styels/scale";
import CommonTouchableOpacity from "../touchableComponents/touchableOpacity";

interface KpiItem {
  id?: string | number;
  name: string;
  value: number | string;
  isCount?: boolean;
}

interface CommonListProps {
  data: KpiItem[];
  loading?: boolean;
  error?: string | null;
  clearError?: React.Dispatch<React.SetStateAction<string>>;
  kpiNavigation?: (item: KpiItem) => void;
  onKpiSelect?: (item: KpiItem) => void;
}

const ListItemSeparator = () => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return <ViewComponent style={[commonStyles.mb10]} />;
};

const KpiComponent = ({
  data,
  loading,
  error,
  clearError,
  kpiNavigation,
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

  // Separate the 'Total' KPI from the rest of the data
  const totalKpi = data.find(item => item.name === 'Total');
  const otherKpis = data.filter(item => item.name !== 'Total');

  const renderKpiItem = ({ item, style = {} }: { item: KpiItem, style?: object }) => (
    <CommonTouchableOpacity style={[totalKpi?.name !== item?.name && commonStyles.kpibg, commonStyles.flex1, style]}
      activeOpacity={0.9}
      onPress={() => { if (kpiNavigation) kpiNavigation(item); }}
    >
      <ViewComponent >
        <ParagraphComponent
          style={[commonStyles.kpiamountlabel, (totalKpi?.name === item?.name || !totalKpi) && commonStyles.kpiamountlabel]}
          text={t(item?.name) || ""}
        />
        {item?.isCount && <ParagraphComponent
          style={[commonStyles.kpiamounttext, totalKpi?.name === item?.name && commonStyles.mb10]}
          text={item?.value ?? 0}
        />}
        {!item?.isCount && <CurrencyText style={[commonStyles.kpiamounttext]} prifix={currency[userInfo?.currency]} value={parseFloat(String(item?.value ?? 0)) || 0} />}
      </ViewComponent>
    </CommonTouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return <Loadding contenthtml={transactionCard} />;
    }
    if (data.length === 0) {
      return <NoDataComponent />;
    }

    // Render Total KPI at the top if it exists
    const renderTotalKpi = () => {
      if (totalKpi) {
        return (
          <ViewComponent>
            {renderKpiItem({ item: totalKpi })}
          </ViewComponent>
        );
      }
      return null;
    };

    // Render the rest of the KPIs in a 2-column FlatList
    const renderOtherKpis = () => {
      return (
        <FlatListComponent
          data={otherKpis}
          scrollEnabled={false}
          keyExtractor={(item: KpiItem, index: number) => item.id?.toString() ?? index.toString()}
          renderItem={({ item }) => renderKpiItem({ item })}
          ItemSeparatorComponent={ListItemSeparator}
          columnWrapperStyle={{ columnGap: s(10) }}
          numColumns={2}
        />
      );
    };

    return (
      <ViewComponent>
        {renderTotalKpi()}
        {renderOtherKpis()}
      </ViewComponent>
    );
  };

  return (
    <ViewComponent>
      {error && <ErrorComponent message={error} onClose={clearErrorMsg} />}
      {renderContent()}
    </ViewComponent>
  );
};

export default KpiComponent;