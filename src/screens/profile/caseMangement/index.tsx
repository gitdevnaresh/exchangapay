import React, { useEffect, useState } from "react"
import ProfileService from "../../../services/profile"
import { dateFormates, isErrorDispaly } from "../../../utils/helpers";
import { useNavigation } from "@react-navigation/native";
import ViewComponent from "../../../newComponents/view/view";
import FlatListComponent from "../../../newComponents/flatList/flatList";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import { FormattedDateText } from "../../../newComponents/textComponets/dateTimeText/dateTimeText";
import TextMultiLangauge from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { ApiResponse } from "apisauce";
import KpiComponent from "../../../newComponents/kpiComponent/kpiComponent";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import ScrollViewComponent from "../../../newComponents/scrollView/scrollView";
import { getThemedCommonStyles, statusColor } from "../../../assets/styles/CommonStyles";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import SwokipayDashboardLoader from "../../../newComponents/swokipayloader";
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay";
const ItemSeparator = React.memo(() => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return <ViewComponent style={[commonStyles.mb8]} />;
});

interface Item {
  title?: string;
  number?: string;
  createdDate?: string;
  state?: string;
  length?: any;
  id?: string;
}
interface KpiItem {
  name: string;
  value: string | number;
  isCount?: boolean; // Optional, based on ReferralData interface
}
interface SupportPropd {
  route: { params: any; };
  navigation: any; // You can replace 'any' with NavigationProp<ParamListBase> or a more specific navigation type
}


const CaseManagement: React.FC<SupportPropd> = () => {
  const [casesData, setCasesData] = useState<Item[]>([]);
  const [casesDataLoading, setCasesDataLoading] = useState<boolean>(false)
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [kpiData, setKpiData] = useState<any>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      getReferralKpis();
    getRefTrnsactions();
  }, []);
  const getReferralKpis = async () => {
    setError("");
    try {
      const response = await ProfileService.getCasesKPis();
      
      if (response?.ok && response?.data) {
        const responseData = response.data as KpiItem[];
        setKpiData(responseData);
      }
      else {
        setKpiData([]);
        setError(isErrorDispaly(response));
      }
    }
    catch (error) {
      setKpiData([]);
      setError(isErrorDispaly(error));
    }
  };
  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  })
  const getRefTrnsactions = async () => {
    setError("");
    setCasesDataLoading(true);
     try {
         const response: ApiResponse<any, any> = await ProfileService.getCasesList(1, 5);
        if (response.ok) {
          setCasesData(response.data?.data);
          setCasesDataLoading(false);
        } else {
          setError(isErrorDispaly(response));
          setCasesDataLoading(false);
          setCasesData([]);
        }
      } catch (error) {
        setError(isErrorDispaly(error));
        setCasesDataLoading(false);
      }
      finally{
            setCasesDataLoading(false);

      }
  };

  const backArrowButtonHandler = () => {
    navigation.navigate('NewProfile', { animation: 'slide_from_left' });
  };

  const handleRefresh = () => {
    getRefTrnsactions();
  }
  const handleViewCase = () => {
    navigation.navigate("SupportAllCases")
  }
  const handleCaseView = (item: Item) => {
    navigation.navigate("SupportCaseView", { id: item?.id })
  }
    const middleEllipsis = (text: string, maxLength = 30) => {
  if (!text || text.length <= maxLength) return text;

  const half = Math.floor((maxLength - 1) / 2);
  return text.slice(0, half) + '…' + text.slice(text.length - half);
};
  const renderListHeader = () => (
    <>
      <KpiComponent data={kpiData || []} />
      <ViewComponent style={[commonStyles.sectionGap]} />
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
        <TextMultiLangauge text={"GLOBAL_CONSTANTS.RECENT_CASES"} style={[commonStyles.sectionTitle, commonStyles.textLeft]} />
        {casesData?.length >= 1 && <CommonTouchableOpacity onPress={handleViewCase} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.sectionLink]} >
          <TextMultiLangauge text={"GLOBAL_CONSTANTS.VIEW_ALL"} style={[commonStyles.sectionLink]} />
        </CommonTouchableOpacity>}
      </ViewComponent>
    </>
  );
  const renderItem = ({ item, index }: any) => { // <-- Use a curly brace here
    const title = item?.title;
    let displayTitle = title;
    if (title && title.length > 30) {
      displayTitle = `${title.substring(0, 25)}......`;
    }
    return (
      <CommonTouchableOpacity onPress={() => handleCaseView(item)} style={[commonStyles.transactionsCard]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1]}>
            <ViewComponent>
              {(item?.number) && <ParagraphComponent text={item?.number} style={[commonStyles.fs14, commonStyles.mb6, commonStyles.textWhite]} />}
              {displayTitle && <ParagraphComponent text={middleEllipsis(displayTitle)} numberOfLines={1} style={[commonStyles.fs12, commonStyles.mb6, commonStyles.textlinkgrey]} />}
            </ViewComponent>
            <ViewComponent>
              {(item?.createdDate) && <FormattedDateText conversionType={"UTC-to-local"} value={(item?.date ?? item?.createdDate) as string} dateFormat={dateFormates?.dateTime} style={[commonStyles.fs14, commonStyles.mb6, commonStyles.textWhite]} />}
              {(item?.state) && <ParagraphComponent text={item?.state ?? item?.state} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textRight, commonStyles.mb5, { color: statusColor[item?.state?.toLowerCase()] }]} />}
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    );
  };
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {casesDataLoading && <SwokipayDashboardLoader />}
      {!casesDataLoading && (
        <Container style={[commonStyles.container]}>
          <PageHeader title={"GLOBAL_CONSTANTS.CASES"} onBackPress={backArrowButtonHandler} isrefresh={true} onRefresh={handleRefresh} />
          {error && <ErrorComponent message={error} screen={true} />}
          <ScrollViewComponent>
            <FlatListComponent
              data={casesData ?? []}
              ItemSeparatorComponent={ItemSeparator}
              keyExtractor={(item, index) => item.id ?? index.toString()} // Use a more stable key if available
              renderItem={renderItem}
              ListHeaderComponent={renderListHeader}
              scrollEnabled={false}   // 👈 disables FlatList scroll
              nestedScrollEnabled={true}
            />
          </ScrollViewComponent>
        </Container>
      )}
    </ViewComponent>

  )
}
export default CaseManagement;