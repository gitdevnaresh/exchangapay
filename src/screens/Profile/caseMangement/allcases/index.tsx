import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useCallback } from "react";
import ProfileService from "../../../../services/profile";
import { formatDateLocal, isErrorDispaly } from "../../../../utils/helpers";
import { BackHandler, FlatList, SafeAreaView, TouchableOpacity, View, ViewComponent } from "react-native";
import { commonStyles, statusColor } from "../../../../components/CommonStyles";
import { personalInfoLoader } from "../../skeleton_views";
import ParagraphComponent from "../../../../components/Paragraph/Paragraph";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import Loadding from "../../../../components/skeleton";
import { Container } from "../../../../components";
import ErrorComponent from "../../../../components/Error";

interface Item {
  title?: string;
  number?: string;
  createdDate?: string;
  state?: string;
  length?: any;
  id?: string;
}
const ItemSeparator = React.memo(() => {
  return <View style={[commonStyles.mb8]} />;
});

const SupportAllCases: React.FC<any> = () => {
  const [casesData, setCasesData] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true); // new state variable
  const [totalRecords, setTotalRecords] = useState(0);
  const navigation = useNavigation<any>();
  const loadeMoreLoader = personalInfoLoader(10);
  const [error, setError] = useState<string | null>(null);




  useEffect(() => {
    getRefTransactions(1);
  }, []);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { backArrowButtonHandler(); return true; }
    );
    return () => backHandler.remove();
  }, []);




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
    if (pageNo > 1) {
      getRefTransactions(pageNo);
    }
  }, [pageNo, getRefTransactions]);


  const backArrowButtonHandler = () => {
    navigation.navigate('support', { animation: 'slide_from_left' });
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
      return (<ViewComponent style={[commonStyles.px24]}>
        <Loadding contenthtml={loadeMoreLoader} />;
      </ViewComponent>
      )
    }
    return null;
  };
  const handleCaseView = (item: Item) => {
    navigation.navigate("supportCaseView", { id: item?.id })
  };
  const middleEllipsis = (text: string, maxLength = 30) => {
    if (!text || text.length <= maxLength) return text;

    const half = Math.floor((maxLength - 1) / 2);
    return text.slice(0, half) + '…' + text.slice(text.length - half);
  };
  const renderItem = ({ item, index }: any) => { // <-- Use a curly brace here
    const title = item?.title;
    let displayTitle = title;
    if (title && title.length > 30) {
      displayTitle = `${title.substring(0, 25)}......`;
    }
    return (
      <TouchableOpacity onPress={() => handleCaseView(item)} style={[commonStyles.sectionStyle]}>
        <View style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
          <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1]}>
            <View>
              {(item?.number) && <ParagraphComponent text={item?.number} style={[commonStyles.fs14, commonStyles.textAlwaysWhite, commonStyles.mb4, commonStyles.fw600]} />}
              {displayTitle && <ParagraphComponent text={middleEllipsis(displayTitle)} numberOfLines={1} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textAlwaysWhite]} />}
            </View>
            <View>
              <ParagraphComponent text={formatDateLocal(item?.date ?? item?.createdDate)} style={[commonStyles.fs14, commonStyles.textpara, commonStyles.mb4, commonStyles.fw600]} numberOfLines={1} />
              {(item?.state) && <ParagraphComponent text={item?.state ?? item?.state} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textRight, { color: statusColor[item?.state?.toLowerCase()] }]} />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const handleCloseError = () => {
    setError(null);
  };

  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>



      <Container style={[commonStyles.container]}>
        <PageHeader
          title={"All Cases"}
          onBackPress={backArrowButtonHandler}
          isrefresh={true}
          onRefresh={handleRefresh}
        />
        {(loading && casesData.length === 0) && (<Loadding contenthtml={personalInfoLoader(10)} />)}
        {error && <ErrorComponent message={error} onClose={handleCloseError} />}
        {!(loading && casesData.length === 0) && (<FlatList
          data={casesData}
          ItemSeparatorComponent={ItemSeparator}
          keyExtractor={(item, index) => item.id ?? index.toString()}
          renderItem={renderItem}
          onEndReached={loadMoreData}
          ListFooterComponent={renderFooter}
          onEndReachedThreshold={0.1}
          removeClippedSubviews={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />)}
      </Container>

    </SafeAreaView>
  );
};
export default SupportAllCases;