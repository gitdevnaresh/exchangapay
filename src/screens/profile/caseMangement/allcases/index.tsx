import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useCallback } from "react";
import ViewComponent from "../../../../newComponents/view/view";
import { FormattedDateText } from "../../../../newComponents/textComponets/dateTimeText/dateTimeText";
import Container from "../../../../newComponents/container/container";
import FlatListComponent from "../../../../newComponents/flatList/flatList";
import Loadding from "../../../commonScreens/skeltons";
import { allTransactionList } from "../../../commonScreens/transactions/skeltonViews";
import ProfileService from "../../../../services/profile";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import { getThemedCommonStyles, statusColor } from "../../../../assets/styles/CommonStyles";
import { dateFormates, isErrorDispaly } from "../../../../utils/helpers";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import SwokipayDashboardLoader from "../../../../newComponents/swokipayloader";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";

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
  return <ViewComponent style={[commonStyles.mb8]} />;
});

const SupportAllCases: React.FC<any> = () => {
  const [casesData, setCasesData] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true); // new state variable
  const [totalRecords, setTotalRecords] = useState(0);
  const navigation = useNavigation<any>();
  const loadeMoreLoader = allTransactionList(10);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [error, setError] = useState<string>("")

 const getRefTransactions = useCallback(async (currentPage: number) => {
    if (currentPage === 1) {
      setLoading(true); // show main loader
    } else {
      setIsLoadingMore(true); // show footer loader
    }

    try {
      interface ApiSuccessData {
        data: Item[];
        total?: number;
        pagination?: {
            hasNextPage?: boolean;
        }
      }
      const response = await ProfileService.getCasesList(currentPage, 10);
      if (response.ok) {
        const responseData = response.data as ApiSuccessData | undefined;
        const newTransactions = responseData?.data || [];
        const totalCount = responseData?.total || 0;
        setTotalRecords(totalCount);
        
        setCasesData((prevData) => {
          const newData = currentPage === 1 ? newTransactions : [...prevData, ...newTransactions];
          const hasMore = newData.length < totalCount;  
          setHasMoreData(hasMore);
          return newData;
        });
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    }
    setLoading(false);
    setIsLoadingMore(false);
  }, []);

  useEffect(() => {
    setError("");
    getRefTransactions(1);
  }, []);

  useEffect(() => {
    if (pageNo > 1) {
      getRefTransactions(pageNo);
    }
  }, [pageNo, getRefTransactions]);

  useHardwareBackHandler(()=>{
    backArrowButtonHandler();
  })

  const backArrowButtonHandler = () => {
    navigation.navigate('Support', { animation: 'slide_from_left' });
  };

  const handleRefresh = () => {
    setPageNo(1);
    setHasMoreData(true);
    setCasesData([]);
    getRefTransactions(1);
  };

  const loadMoreData = useCallback(() => {
    if (!isLoadingMore && !loading && hasMoreData && casesData.length < totalRecords) {
      setPageNo((prevPage) => prevPage + 1);
    }
  }, [isLoadingMore, loading, hasMoreData, pageNo, casesData.length, totalRecords]);

  const renderFooter = () => {
    if (isLoadingMore) {
      return <Loadding contenthtml={loadeMoreLoader} />;
    }
    return null;
  };
  const handleCaseView = (item: Item) => {
    navigation.navigate("SupportCaseView", { id: item?.id })
  }
  const renderItem = ({ item, index }: any) => {
    const title = item?.title;
    let displayTitle = title;
    if (title && title.length > 30) {
      displayTitle = `${title.substring(0, 25)}......`;
    }
    const middleEllipsis = (text: string, maxLength = 30) => {
  if (!text || text.length <= maxLength) return text;

  const half = Math.floor((maxLength - 1) / 2);
  return text.slice(0, half) + '…' + text.slice(text.length - half);
};
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
      {(loading && casesData.length === 0) && <SwokipayDashboardLoader />}
      {!(loading && casesData.length === 0) && (
        <Container>
          <PageHeader
            title={"GLOBAL_CONSTANTS.ALL_CASES"}
            onBackPress={backArrowButtonHandler}
            isrefresh={true}
            onRefresh={handleRefresh}
          />
          {error && <ErrorComponent message={error} screen={true} />}
          <FlatListComponent
            data={casesData}
            ItemSeparatorComponent={ItemSeparator}
            keyExtractor={(item, index) => item.id ?? index.toString()}
            renderItem={renderItem}
            onEndReached={loadMoreData}
            ListFooterComponent={renderFooter}
            onEndReachedThreshold={0.1}
            removeClippedSubviews={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </Container>
      )}
    </ViewComponent>
  );
};
export default SupportAllCases;