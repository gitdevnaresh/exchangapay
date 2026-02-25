
import React, { useEffect, useState, useCallback } from "react"
import { ProfilePrimaryServices } from "../../../../apiServices/profile/primary";
import { dateFormates, isErrorDispaly } from "../../../../utils/helpers";
import { useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles, statusColor } from "../../../../components/CommonStyles";
import ViewComponent from "../../../../components/view/view";
import FlatListComponent from "../../../../components/flatList/flatList";
import Container from "../../../../components/container/container";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import { FormattedDateText } from "../../../../components/textComponets/dateTimeText/dateTimeText";
import TextMultiLangauge from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { ApiResponse } from "apisauce";
import KpiComponent from "../../../../components/kpiComponent/kpiComponent";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
const ItemSeparator = React.memo(() => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return <ViewComponent style={[commonStyles.transactionsListGap]} />;
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


const Support: React.FC<SupportPropd> = () => {
  const [error, setError] = useState<string>("")
  const [casesData, setCasesData] = useState<Item[]>([]);
  const [casesDataLoading, setCasesDataLoading] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [kpiData, setKpiData] = useState<KpiItem[]>([]);

  useEffect(() => {
    getRefTrnsactions();
    getReferralKpis();
  }, []);
  const getReferralKpis = useCallback(async () => {
    setError('')
    try {
      const response = await ProfilePrimaryServices.getCasesKPis();
      if (response.ok) {
        const responseData = response.data as KpiItem[];
        setKpiData(responseData);
      }
      else {
        setError(isErrorDispaly(response))
      }
    }
    catch (error) {
      setError(isErrorDispaly(error))
    }
  }, []);
  const getRefTrnsactions = useCallback(async () => {
    setCasesDataLoading(true);
    try {
      const response: ApiResponse<any, any> = await ProfilePrimaryServices.getCasesList(1, 5);
      if (response?.ok) {
        setCasesData(response.data?.data);
        setCasesDataLoading(false);
      } else {
        setError(isErrorDispaly(response));
        setCasesDataLoading(false);
      }
    } catch (error) {
      setError(isErrorDispaly(error));
      setCasesDataLoading(false);
    }
  }, []);
  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  })
  const backArrowButtonHandler = useCallback(() => {
    navigation.navigate('NewProfile', { animation: 'slide_from_left' });
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([getRefTrnsactions(), getReferralKpis()]);
  }, [getRefTrnsactions, getReferralKpis]);

  const onRefresh = useCallback(async () => {
    setRefresh(true);
    try {
      await Promise.all([getRefTrnsactions(), getReferralKpis()]);
    } finally {
      setRefresh(false);
    }
  }, [getRefTrnsactions, getReferralKpis]);
  const handleViewCase = useCallback(() => {
    navigation.navigate("SupportAllCases")
  }, [navigation]);
  const handleCaseView = useCallback((item: Item) => {
    navigation.navigate("SupportCaseView", { id: item?.id })
  }, [navigation]);
  const renderListHeader = useCallback(() => (
    <>
      {error !== "" && <ErrorComponent message={error} onClose={() => setError("")} />}
      <KpiComponent data={kpiData ?? []} />
      <ViewComponent style={[commonStyles.sectionGap]} />
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
        <TextMultiLangauge text={"GLOBAL_CONSTANTS.RECENT_CASES"} style={[commonStyles.sectionTitle, commonStyles.textLeft]} />
        {casesData?.length >= 1 && <CommonTouchableOpacity onPress={handleViewCase} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.sectionLink]} >
          <TextMultiLangauge text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink]} />
        </CommonTouchableOpacity>}
      </ViewComponent>
    </>
  ), [error, kpiData, casesData, commonStyles, handleViewCase]);
  const renderItem = useCallback(({ item, index }: any) => {
    const title = item?.title;
    let displayTitle = title;
    if (title && title.length > 30) {
      displayTitle = `${title.substring(0, 25)}......`;
    }
    return (
      <CommonTouchableOpacity onPress={() => handleCaseView(item)} style={[commonStyles.cardsbannerbg]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1]}>
            <ViewComponent>
              {(item?.number) && <ParagraphComponent text={item?.number} style={[commonStyles.primarytext]} />}
              {displayTitle && <ParagraphComponent text={displayTitle} style={[commonStyles.secondarytext]} />}
            </ViewComponent>
            <ViewComponent>
              {(item?.createdDate) && <FormattedDateText conversionType={"UTC-to-local"} value={(item?.date ?? item?.createdDate) as string} dateFormat={dateFormates?.dateTime} style={[commonStyles.primarytext]} />}
              {(item?.state) && <ParagraphComponent text={item?.state ?? item?.state} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textRight, commonStyles.mb5, { color: statusColor[item?.state?.toLowerCase()] }]} />}
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    );
  }, [commonStyles, handleCaseView]);
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {casesDataLoading && <DashboardLoader />}
      {(!casesDataLoading && casesData) && (
        <Container style={[commonStyles.container]}>
          <PageHeader title={"GLOBAL_CONSTANTS.SUPPORT"} onBackPress={backArrowButtonHandler} />
          <ScrollViewComponent refreshing={refresh} onRefresh={onRefresh} >
            <FlatListComponent
              data={casesData ?? []}
              ItemSeparatorComponent={ItemSeparator}
              keyExtractor={(item, index) => item.id ?? index.toString()} // Use a more stable key if available
              renderItem={renderItem}
              ListHeaderComponent={renderListHeader}
              scrollEnabled={false}   // ?? disables FlatList scroll
              nestedScrollEnabled={true}
            />
          </ScrollViewComponent>
        </Container>
      )}
    </ViewComponent>

  )
}
export default Support;
