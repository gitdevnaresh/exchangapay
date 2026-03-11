import React, { useEffect, useMemo, useState } from "react";
import { getThemedCommonStyles, statusColor } from "../../../../assets/styles/CommonStyles";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import ViewComponent from "../../../../newComponents/view/view"
import SwokipayDashboardLoader from "../../../../newComponents/swokipayloader";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import FlatListComponent from "../../../../newComponents/flatList/flatList";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { FormattedDateText } from "../../../../newComponents/textComponets/dateTimeText/dateTimeText";
import Ionicons from '@expo/vector-icons/Ionicons';
import SupportService from "../../../../services/profile/SupportTicket";
import { isErrorDispaly } from "../../../../utils/helpers";
import { SupportTicket } from "./interfaces";
import { s } from "../../../../constants/theme/scale";
import Loadding from "../../../commonScreens/skeltons";
import { allTransactionList } from "../../../commonScreens/transactions/skeltonViews";
import { RefreshControl } from "react-native";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";

const SupportTickets = () => {
  const NEW_COLOR = useMemo(() => useThemeColors(), []);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const navigation = useNavigation<any>();
  const [ticketData, setTicketData] = useState<SupportTicket[]>([]);
  const [ticketDataLoading, setTicketDataLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const isFocussed = useIsFocused();
  const supportTicketSkeleton = allTransactionList(3);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const backArrowButtonHandler = () => {
    navigation.goBack();
  }
useHardwareBackHandler(() => {
  backArrowButtonHandler();
  return true;
});
  useEffect(() => {
    if (isFocussed) {
      setCurrentPage(1);
      setTicketData([]);
      GetSupportTickects(1);
    }
  }, [isFocussed]);
  const ItemSeparator = React.memo(() => {
    return <ViewComponent style={{ marginBottom: s(6) }} />;
  });

  const handleTicketView = (data: any) => {
    navigation.navigate("SupportChat",{ ticketData: data })
  }
  const GetSupportTickects = async (page: number = 1) => {
    if (page === 1) {
      setTicketDataLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response: any = await SupportService.getSupportTickets(page, 12);
      if (response.ok) {
        const newData = response?.data?.data || [];

        if (page === 1) {
          setTicketData(newData);
        } else {
          setTicketData(prev => [...prev, ...newData]);
        }

        setHasMoreData(newData.length === 12);
        setCurrentPage(page);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (e) {
      setError(isErrorDispaly(e));
    } finally {
      setTicketDataLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMoreData) {
      GetSupportTickects(currentPage + 1);
    }
  };

  const middleEllipsis = (text: string, maxLength = 30) => {
    if (!text || text.length <= maxLength) return text;

    const half = Math.floor((maxLength - 1) / 2);
    return text.slice(0, half) + '…' + text.slice(text.length - half);
  };


  const renderItem = ({ item, index }: any) => {
    const subject = item?.subject;
    let displaySubject = subject;
    if (subject && subject.length > 40) {
      displaySubject = `${subject.substring(0, 25)}......`;
    }


    return (
      <CommonTouchableOpacity onPress={() => handleTicketView(item)} style={[commonStyles.transactionsCard]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.gap12, commonStyles.alignCenter]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1]}>
            <ViewComponent>
              {displaySubject && <ParagraphComponent text={middleEllipsis(displaySubject)} numberOfLines={1} style={[commonStyles.fs14, commonStyles.mb6, commonStyles.textWhite]} />}
              {item?.priority && <ParagraphComponent text={item.priority} style={[commonStyles.fs12, commonStyles.textGrey]} />}
            </ViewComponent>
            <ViewComponent>
              {item?.createdAt && <FormattedDateText conversionType={"UTC-to-local"} value={item.createdAt} style={[commonStyles.fs14, commonStyles.mb6, commonStyles.textWhite]} />}
              {item?.status && <ParagraphComponent text={item.status} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textRight, { color: statusColor[item?.status?.toLowerCase()] }]} />}
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    );
  };
const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    setTicketData([]);
    GetSupportTickects(1).finally(() => setRefreshing(false));
  }
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (<ViewComponent style={[commonStyles.mt6]}>
    <Loadding contenthtml={supportTicketSkeleton} />
    </ViewComponent>
    )
  };
  const handleCreate = () => {
    navigation.navigate("CreateTicket");
  }
  const createTicket = (
    <CommonTouchableOpacity onPress={handleCreate} style={[]}>
      <Ionicons name="add-circle-outline" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
    </CommonTouchableOpacity>
  )


  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container>
        <PageHeader title={"GLOBAL_CONSTANTS.SUPPORT_TICKETS"} onBackPress={backArrowButtonHandler} rightActions={createTicket} />
        {error && <ErrorComponent message={error} screen={true} />}
        {ticketDataLoading && <SwokipayDashboardLoader />}
        {!ticketDataLoading && (
          <FlatListComponent
            data={ticketData ?? []}
            ItemSeparatorComponent={ItemSeparator}
            keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
            renderItem={renderItem}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            scrollEnabled={true}
            nestedScrollEnabled={false}
            contentContainerStyle={{ paddingBottom: s(80) }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderFooter}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NEW_COLOR.BG_YELLOW} />}
          />)}
      </Container>
    </ViewComponent>
  )
}

export default SupportTickets