import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useCallback } from "react";
import ViewComponent from "../../../../components/view/view";
import { getThemedCommonStyles, statusColor } from "../../../../components/CommonStyles";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import Container from "../../../../components/container/container";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import FlatListComponent from "../../../../components/flatList/flatList";
import { isErrorDispaly } from "../../../../utils/helpers";
import Loadding from "../../../../components/skelton/skeltons";
import { allTransactionList } from "../../../../skeletons/skeltonViews";
import { ProfilePrimaryServices } from "../../../../apiServices/profile/primary";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { cryptoCurrencies } from "./interFaces";
import { s } from "../../../../constants/styels/scale";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
interface TransactionItem {
  id: string;
  type?: string;
  transactionType?: string;
  transactionId?: string;
  date?: string;
  transactionDate?: string;
  currency?: string;
  network?: string;
  netWork?: string;
  amount: number | string;
}

interface MemberAllTransactionsProps {
  route: {
    params: {
      id: string;
    };
  };
}

const ItemSeparator = React.memo(() => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return <ViewComponent style={[commonStyles.transactionsListGap]} />;
});

const MemberAllTransactions: React.FC<MemberAllTransactionsProps> = (props) => {
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [transactionData, setTransactionData] = useState<TransactionItem[]>([]);
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false);
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const allTransactionListLoader = allTransactionList(10);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const getRefTransactions = useCallback(async (currentPage: number) => {
    if (currentPage === 1) {
      setTransactionLoading(true);
    }
    try {
      interface ApiSuccessData {
        data: TransactionItem[];

      }
      const response = await ProfilePrimaryServices.referralTransactions(props.route.params.id, currentPage, 10);
      if (response.ok) {
        const responseData = response.data as ApiSuccessData | undefined;
        const newTransactions = responseData?.data || [];
        if (newTransactions.length < 10) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setTransactionData((prevData) => currentPage === 1 ? newTransactions : [...prevData, ...newTransactions]);
      } else {
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
    } finally {
      setTransactionLoading(false);
    }
  }, [props.route.params.id]);

  useEffect(() => {
    getRefTransactions(pageNo);
  }, [pageNo, getRefTransactions]);

  useEffect(() => {
    setTransactionData([]);
    setPageNo(1);
  }, [props.route.params.id]);

  const backArrowButtonHandler = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    setPageNo(1);
    setHasMore(true);
    getRefTransactions(1);
  }, [getRefTransactions]);

  const onRefresh = useCallback(async () => {
    setRefresh(true);
    try {
      setPageNo(1);
      setHasMore(true);
      await getRefTransactions(1);
    } finally {
      setRefresh(false);
    }
  }, [getRefTransactions]);

  const loadMoreData = useCallback(() => {
    if (!transactionLoading && hasMore) {
      setPageNo((prevPage) => prevPage + 1);
    }
  }, [transactionLoading, hasMore]);

  const handleViewDetails = useCallback((item: any) => {
    navigation?.navigate("MemberTransactionViewDetails", { transactionData: item })
  }, [navigation]);

  const renderFooter = useCallback(() => {
    if (transactionLoading && pageNo > 1) {
      return (
        <Loadding contenthtml={allTransactionListLoader} />
      );
    }
  }, [transactionLoading, pageNo, allTransactionListLoader]);

  const renderItem = useCallback(({ item, index }: any) => {
    return (
      <CommonTouchableOpacity onPress={() => handleViewDetails(item)} style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1,]}>
          <ViewComponent>
            {(item?.type || item?.transactionType || item?.action) && <ParagraphComponent text={item?.type ?? item?.transactionType ?? item?.action} style={[commonStyles.idrprimarytext]} />}
            {item?.status && <ParagraphComponent style={[commonStyles.colorstatus, { color: statusColor[item?.status !== null && item?.status?.toLowerCase()] ?? NEW_COLOR.TEXT_GREEN }]} text={item?.status} />}
          </ViewComponent>
          <ViewComponent >
            {(item?.referralAmount) && <CurrencyText value={Number(item?.referralAmount)} coinName="BTC" style={[commonStyles.primarytext, commonStyles.textRight]} />}
            {item?.wallet && (
              <ParagraphComponent
                text={`${item.wallet}${item.network || item.netWork ? `(${item.network || item.netWork})` : ''}`}
                style={[commonStyles.secondarytext, commonStyles.textRight]} />
            )}
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>)
  }, [commonStyles, NEW_COLOR, handleViewDetails]);

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {pageNo === 1 && transactionLoading ? (
        <DashboardLoader />
      ) : (
        <Container style={commonStyles.container}>
          <ViewComponent style={[commonStyles.flex1]}>
            <PageHeader
              title={"GLOBAL_CONSTANTS.MEMBER_TENSACTIONS"}
              onBackPress={backArrowButtonHandler}
              isrefresh={true}
              onRefresh={handleRefresh}
            />

            <FlatListComponent
              ListHeaderComponent={errorMsg ? <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} /> : null}
              data={transactionData}
              ItemSeparatorComponent={<ViewComponent style={[commonStyles.listGap]} />}
              keyExtractor={(item: TransactionItem, index: number) => item.id ?? item.transactionId ?? index.toString()}
              renderItem={renderItem}
              onEndReached={loadMoreData}
              ListFooterComponent={renderFooter}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: s(100) }}
              refreshing={refresh}
              onRefresh={onRefresh}
            />
          </ViewComponent>

        </Container>
      )}
    </ViewComponent>
  );
};
export default MemberAllTransactions;

