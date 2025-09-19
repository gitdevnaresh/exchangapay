import React, { useEffect, useState } from "react";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Content } from "../../../components";
import { View, TouchableOpacity, FlatList } from "react-native";
import ParagraphComponent from "../../../components/Paragraph/Paragraph";
import { NEW_COLOR } from "../../../constants/theme/variables";
import { ms } from "../../../constants/theme/scale";
import { useSelector } from "react-redux";
import CardsModuleService from "../../../services/card";
import { formatDateLocal, isErrorDispaly } from "../../../utils/helpers";
import NoDataComponent from "../../../components/nodata";
import { commonStyles } from "../../../components/CommonStyles";
import { sellCoinSelect } from "../buySkeleton_views";
import Loadding from "../../../components/skeleton";
import { useIsFocused } from "@react-navigation/native";


const EXChangaApplicationRecords = React.memo((props: any) => {
  const styles = useStyleSheet(themedStyles);
  const [activeTab, setActiveTab] = useState(0);
  const data = [
    {
      name: "All",
    },
    {
      name: "Pending",
    },
    {
      name: "Finished",
    },
  ]
  const [transLoading, setTransLoading] = useState(false);
  const [errormsg, setErrormsg] = useState<any>('');
  const [transactionData, setTransactionData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const CardListLoader = sellCoinSelect(10);
  const isFocused = useIsFocused();
  const [isMoreData, setIsMoreData] = useState(true);

  useEffect(() => {
    fetchTransactions()
  }, [page])
  useEffect(() => {
    setIsMoreData(true)
    setPage(1)
  }, [isFocused])

  const fetchTransactions = async () => {
    if (!transLoading && isMoreData) {
      try {
        setTransLoading(true);
        const response: any = await CardsModuleService.getCustomerApplicatioinTransactions(data[activeTab]?.name, props?.route?.params?.cardId || '', page, 10);
        if (response && response.data && Array.isArray(response.data?.data)) {
          if (page === 1) {
            setTransactionData([...response.data?.data]);
          } else {
            setTransactionData([...transactionData, ...response.data?.data]);
          }
          setIsMoreData(response.data?.data?.length === 10);
          setPage(prevPage => prevPage + 1);
          setErrormsg('');
          setTransLoading(false);
        } else {
          setIsMoreData(false);
          setErrormsg("Invalid data received");
          setTransLoading(false);
        }
      } catch (error) {
        setIsMoreData(false);
        setErrormsg(isErrorDispaly(error));
        setTransLoading(false);
      }
    }
  };
  const loadMoreData = () => {
    if (!transLoading && isMoreData) {
      fetchTransactions();
    }
  }
  const badgeColor = {
    approved: NEW_COLOR.BG_GREEN,
    pending: NEW_COLOR.BG_YELLOW,
    submitted: NEW_COLOR.BG_BLUE,
    failed: NEW_COLOR.BG_RED,
    fail: NEW_COLOR.BG_RED,
    rejected: NEW_COLOR.BG_RED,
    finished: NEW_COLOR.BG_GREEN,
    freezed: NEW_COLOR.TEXT_GREY,
    unfreezed: NEW_COLOR.BG_GREEN,
    "freeze failed": NEW_COLOR.BG_RED,
    "freeze pending": NEW_COLOR.BG_YELLOW,
    "unfreeze pending": NEW_COLOR.BG_YELLOW,
    cancelled: NEW_COLOR.BG_RED
  }
  const textColor = {
    approved: commonStyles.textBlack,
    pending: commonStyles.textBlack,
    submitted: commonStyles.textBlack,
    failed: commonStyles.textWhite,
    fail: commonStyles.textWhite,
    rejected: commonStyles.textWhite,
    finished: commonStyles.textBlack,
    freezed: commonStyles.textWhite,
    unfreezed: commonStyles.textBlack,
    "freeze failed": commonStyles.textBlack,
    "freeze pending": commonStyles.textBlack,
    "unfreeze pending": commonStyles.textBlack
  }

  const renderItem = ({ item, index }) => {
    return (
      <>

        <View style={[styles.sectionStyle]}>
          <ParagraphComponent text={item.cardNumber} style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textBlack]} />
          <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12, styles.mt16]}>
            <View style={commonStyles.flex1}>
              <ParagraphComponent text="Time" style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey, commonStyles.mb4]} />
              <ParagraphComponent text={formatDateLocal(item.cardDateTime)} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textBlack]} />
            </View>
            <View style={styles.borderRight}></View>
            <View style={commonStyles.flex1}>
              <ParagraphComponent text="Card Name" style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey, commonStyles.mb4]} />
              <ParagraphComponent text={item.cardName} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textBlack]} />
            </View>
            <View style={[styles.status, { backgroundColor: badgeColor[item.status.toLowerCase()] || NEW_COLOR.TEXT_GREY }]}>
              <ParagraphComponent text={item.status} style={[commonStyles.fs10, commonStyles.fw500, styles.textRight, textColor[item?.status?.toLowerCase()] || commonStyles.textBlack, { marginBottom: 1 }]} numberOfLines={1} />
            </View>
          </View>
        </View>
        {!transLoading && index == transactionData.length - 1 && (<>
          <View style={[commonStyles.mb16,]} />
        </>
        )}
      </>)
  };

  const renderFooter = () => {
    if (!transLoading) return null;
    return (
      <Loadding contenthtml={CardListLoader} />
    );
  };
  const handleTabchange = (index: number) => {
    setPage(1);
    setActiveTab(index);
    setIsMoreData(true);
    setTransactionData([]);
  }

  return (
    <View style={{ flex: 1, }}>
      <View style={[commonStyles.mb16]} />
      <View>
        <Content
          horizontal
          contentContainerStyle={{}}
        >
          {data.map((item, index) => (
            <TouchableOpacity activeOpacity={0.8}
              onPress={() => { handleTabchange(index) }}
            >
              <View style={[styles.tabstyle, activeTab === index && styles.activeTabStyle]}>

                <ParagraphComponent text={item.name} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw600]} />
              </View>
            </TouchableOpacity>
          ))
          }
        </Content>
      </View>
      <View style={[commonStyles.mb16]} />
      <View style={{ flex: 1 }}>

        <FlatList
          data={transactionData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={() => <>{!transLoading && <NoDataComponent />}</>}
        />
      </View>
    </View>
  );

});
export default EXChangaApplicationRecords;

const themedStyles = StyleService.create({
  orange: {
    backgroundColor: "#fcba03"
  },
  sectionStyle: {
    borderRadius: 16,
    padding: 14, marginBottom: 12,
    backgroundColor: NEW_COLOR.MENU_CARD_BG
  },
  mb8: {
    marginBottom: 8
  },
  mt16: {
    marginTop: 16,
  },
  mAuto: {
    marginBottom: "auto",
    marginTop: "auto", marginRight: "auto", marginLeft: "auto"
  },
  mb24: {
    marginBottom: 24,
  },
  tabstyle: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: NEW_COLOR.MENU_CARD_BG,
    borderRadius: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center", gap: 10,
    marginRight: 8
  },
  mb16: {
    marginBottom: 16,
  },
  gap12: {
    gap: 12
  },
  textGrey: {
    color: NEW_COLOR.TEXT_GREY
  },
  textRight: {
    textAlign: "right"
  },
  flex1: {
    flex: 1
  },
  gap16: {
    gap: 16,
  },
  justifyContent: {
    justifyContent: "space-between",
  },
  alignCenter: {
    alignItems: "center",
  },
  textCenter: {
    textAlign: "center",
  },
  justify: {
    justifyContent: "space-between",
  },
  dflex: {
    flexDirection: "row",
  },
  iconCircle: {
    padding: 16,
    borderWidth: 1, borderColor: NEW_COLOR.BORDER_LIGHT,
    borderRadius: 100 / 2,

  },
  textGreen: {
    color: NEW_COLOR.TEXT_GREEN
  },
  textPurple: {
    color: NEW_COLOR.TEXT_PURPLE
  },
  textLightGrey: {
    color: NEW_COLOR.TEXT_LIGHTGREY
  },
  fw300: {
    fontWeight: "300",
  },
  fw800: {
    fontWeight: "800",
  },
  fw600: {
    fontWeight: "600",
  },
  fw700: {
    fontWeight: "700",
  },
  fw400: {
    fontWeight: "400",
  },
  fw500: {
    fontWeight: "500",
  },
  gap8: {
    gap: 8
  },
  textBlack: {
    color: NEW_COLOR.TEXT_BLACK
  },
  fs14: {
    fontSize: ms(14)
  },
  fs16: {
    fontSize: ms(16)
  },
  fs12: {
    fontSize: ms(12)
  },
  fs10: {
    fontSize: ms(10)
  },
  textWhite: {
    color: NEW_COLOR.TEXT_WHITE
  },
  mb43: {
    marginBottom: 43,
  },

  activeTabStyle: {
    backgroundColor: NEW_COLOR.BG_ORANGE,
  },
  bgGreen: { backgroundColor: NEW_COLOR.BG_GREEN },
  bgPending: { backgroundColor: NEW_COLOR.BG_PENDING },
  status: { position: 'absolute', top: -52, right: 18, paddingHorizontal: 12, paddingVertical: 3, borderBottomRightRadius: 12, borderBottomLeftRadius: 12 },
  borderRight: { width: 1, backgroundColor: '#959393', opacity: 0.3 }
});