import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useCallback } from "react";
import { RefreshControl } from "react-native";
import ViewComponent from "../../../../../components/view/view";
import { getThemedCommonStyles, statusColor } from "../../../../../components/CommonStyles";
import { FormattedDateText } from "../../../../../components/textComponets/dateTimeText/dateTimeText";
import Container from "../../../../../components/container/container";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import FlatListComponent from "../../../../../components/flatList/flatList";
import { dateFormates, isErrorDispaly } from "../../../../../utils/helpers";
import { allTransactionList } from "../../../../../skeletons/skeltonViews";
import { ProfilePrimaryServices } from "../../../../../apiServices/profile/primary";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../../components/loader";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import Loadding from "../../../../../components/skelton/skeltons";

interface Item {
  title?: string;
  number?: string;
  createdDate?: string;
  state?: string;
  length?: any;
  id?: string;
}
const ItemSeparator = React.memo(() => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return <ViewComponent style={[commonStyles.transactionsListGap]} />;
});

const SupportAllCases: React.FC<any> = () => {
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [casesData, setCasesData] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true); // new state variable
  const [refresh, setRefresh] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const loadeMoreLoader = allTransactionList(10);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const getRefTransactions = useCallback(async (currentPage: number) => {
    if (currentPage === 1) {
      setLoading(true); // show main loader
    } else {
      setIsLoadingMore(true); // show footer loader
    }

    try {
      interface ApiSuccessData {
        data: Item[];
        pagination: {
          hasNextPage: boolean;
        }
      }
      const response = await ProfilePrimaryServices.getCasesList(currentPage, 10);
      if (response?.ok) {
        const responseData = response.data as ApiSuccessData | undefined;
        const newTransactions = responseData?.data || [];
        setCasesData((prevData) => currentPage === 1 ? newTransactions : [...prevData, ...newTransactions]);
        setHasMoreData(responseData?.pagination?.hasNextPage ?? false);
      } else {
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
    }
    setLoading(false);
    setIsLoadingMore(false);
  }, []);


  useEffect(() => {
    getRefTransactions(pageNo);
  }, [pageNo]);

  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  })

  const backArrowButtonHandler = useCallback(() => {
    navigation.navigate('Support', { animation: 'slide_from_left' });
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    setPageNo(1);
    getRefTransactions(1);
  }, [getRefTransactions]);

  const onRefresh = useCallback(async () => {
    setRefresh(true);
    try {
      setPageNo(1);
      await getRefTransactions(1);
    } finally {
      setRefresh(false);
    }
  }, [getRefTransactions]);

  const loadMoreData = useCallback(() => {
    if (!isLoadingMore && !loading && hasMoreData) {
      setPageNo((prevPage) => prevPage + 1);
    }
  }, [isLoadingMore, loading, hasMoreData]);

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return <Loadding contenthtml={loadeMoreLoader} />;
    }
    return null;
  }, [isLoadingMore, loadeMoreLoader]);
  const handleCaseView = useCallback((item: Item) => {
    navigation.navigate("SupportCaseView", { id: item?.id })
  }, [navigation]);
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
              {(item?.state) && <ParagraphComponent text={item?.state ?? item?.state} style={[commonStyles.colorstatus, commonStyles.textRight, { color: statusColor[item?.state?.toLowerCase()] }]} />}
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    );
  }, [commonStyles, handleCaseView]);

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {(pageNo === 1 && loading) &&
        <DashboardLoader />}
      {!loading && <Container style={commonStyles.container}>
        <PageHeader
          title={"GLOBAL_CONSTANTS.ALL_CASES"}
          onBackPress={backArrowButtonHandler}
          isrefresh={true}
          onRefresh={handleRefresh}
        />
        <FlatListComponent
          ListHeaderComponent={errorMsg ? <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} /> : null}
          data={casesData}
          ItemSeparatorComponent={ItemSeparator}
          keyExtractor={(item, index) => item.id ?? index.toString()}
          renderItem={renderItem}
          onEndReached={loadMoreData}
          ListFooterComponent={renderFooter}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl tintColor={NEW_COLOR.BUTTON_BG} refreshing={refresh} onRefresh={onRefresh} />}
        />
      </Container>}
    </ViewComponent>
  );
};
export default SupportAllCases;
