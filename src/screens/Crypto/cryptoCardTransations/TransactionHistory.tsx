import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Content } from "../../../components";
import { View, TouchableOpacity, Dimensions } from "react-native";
import ParagraphComponent from "../../../components/Paragraph/Paragraph";
import { NEW_COLOR, } from "../../../constants/theme/variables";
import { s } from "../../../constants/theme/scale";
import { commonStyles } from "../../../components/CommonStyles";
import CardsModuleService from "../../../services/card";
import { formatCurrency, formatDateLocal, isErrorDispaly } from "../../../utils/helpers";
import { FlatList } from "react-native-gesture-handler";
import NoDataComponent from "../../../components/nodata";
import Loadding from "../../../components/skeleton";
import { sellCoinSelect } from "../buySkeleton_views";
import TransactionDetails from "./transactionDetails";
import Badge from "../../../components/badge/badge";
import SvgFromUrl from "../../../components/svgIcon";
import ConsumeTransactionDetails from "./ConsumeTransactionDetails";
import { LIST_PERF_PAGINATED } from "../../../constants/listPerformance";


// Hoisted out of the component: it is a constant lookup table, and rebuilding
// it per render would force the memoised renderItem to be rebuilt too.
const badgeColor = {
  approved: NEW_COLOR.BG_GREEN,
  completed: NEW_COLOR.BG_GREEN,
  pending: NEW_COLOR.BG_YELLOW,
  submitted: NEW_COLOR.BG_BLUE,
  failed: NEW_COLOR.BG_RED,
  fail: NEW_COLOR.BG_RED,
  rejected: NEW_COLOR.BG_RED,
  finished: NEW_COLOR.BG_GREEN,
  freezed: NEW_COLOR.TEXT_GREY,
  unfreezed: NEW_COLOR.BG_GREEN,
  cancelled: NEW_COLOR.BG_RED,
}

const EXChangaTransactionHistory = React.memo((props: any) => {
  const styles = useStyleSheet(themedStyles);
  const [activeTab, setActiveTab] = useState(0);
  const [transLoading, setTransLoading] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<any>('');
  const [transactionData, setTransactionData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [isMoreData, setIsMoreData] = useState<boolean>(true);
  const CardListLoader = sellCoinSelect(10);
  const [transactionId, setTranasctionId] = useState<string>('');
  const { width } = Dimensions.get('window');
  const isPad = width > 600;
  const [isCommonVisible, setIsCommonVisible] = useState<boolean>(false);
  const [isConsumeDetailsVisible, setIsConsumeDetailsVisible] = useState<boolean>(false);
  const [iconsList, setIconsList] = useState<any>([]);
  const data = [
    {
      name: "All"
    },
    {
      name: "Deposit",
    },

    {
      name: "Consumption",
    },

  ]
  useEffect(() => {
    getTransactionTypes()
    fetchTransactions();
  }, [page])

  const fetchTransactions = async () => {
    if (!transLoading && isMoreData) {
      try {
        setTransLoading(true);
        const response: any = await CardsModuleService.getCustomerTransactions(data[activeTab]?.name, page, 10, props?.route?.params?.cardId || '', props?.route?.params?.screenName);
        if (response && response.data && Array.isArray(response.data?.data)) {
          if (page === 1) {
            setTransactionData([...response.data?.data]);
          } else {
            setTransactionData([...transactionData, ...response.data?.data]);
          }
          setIsMoreData(response.data?.data?.length === 10);
          setPage(page + 1);
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

  // Functional updaters so this stays referentially stable — renderItem is
  // memoised now and would otherwise close over a stale visibility flag.
  const toggleOverlay = useCallback((item: any) => {
    if (item?.action?.toLowerCase() === "consume") {
      setIsConsumeDetailsVisible(prev => !prev);
      setTranasctionId(item.id);
    } else {
      setIsCommonVisible(prev => !prev);
      setTranasctionId(item.id);
    }


  }, []);
  const closePop = () => {
    setIsCommonVisible(false);
    setIsConsumeDetailsVisible(false);

  };
  const getTransactionTypes = async () => {
    try {
      const response = await CardsModuleService.customerTransactionTypes();
      if (response?.ok) {
        setIconsList(response?.data?.CustomerTransactionTypes)
      } else {
        setErrormsg(isErrorDispaly(response))
      }

    } catch (error) {
      setErrormsg(isErrorDispaly(error))

    }
  };
  // Built once per icon fetch instead of doing a linear find() inside every
  // row on every scroll frame.
  const iconsByName = useMemo(() => {
    const map = new Map<string, string>();
    (iconsList || []).forEach((iconItem: any) => {
      if (iconItem?.name) map.set(iconItem.name, iconItem.logo);
    });
    return map;
  }, [iconsList]);

  const getIconUrl = useCallback((action: string, currencyType?: string): any => {
    let actionKey = action;
    if (action === "TopUp") {
      if (currencyType === "Fiat") actionKey = "TopupFiat";
      else if (currencyType === "Crypto") actionKey = "TopupCrypto";
    }
    if (iconsByName.size > 0) {
      return iconsByName.get(actionKey) || "https://swokistoragespace.blob.core.windows.net/images/send.svg";
    }
    return undefined;
  }, [iconsByName]);



  const renderItem = useCallback(({ item, index }: any) => {
    return (
      <>
        <TouchableOpacity activeOpacity={1} onPress={() => toggleOverlay(item)}>
          <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, styles.rowColor, { padding: isPad ? 18 : 10, paddingTop: 22, paddingBottom: 18 }]}>

            <View style={[styles.iconCircle]}>
              <SvgFromUrl uri={getIconUrl(item?.action, item?.currencyType)} width={s(42)} height={s(42)} />
            </View>
            <View style={[commonStyles.flex1,]}>
              <View style={[commonStyles.flex1, commonStyles?.mb4]}>
                <ParagraphComponent text={formatDateLocal(item.dateTime)} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textBlack,]} numberOfLines={1} />

              </View>

              <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent, commonStyles.flex1,]}>
                <View style={[commonStyles?.flex1]}>
                  {(item.postSettlementDate && item?.state === "Approved") && <ParagraphComponent text={`${item?.postOn || " "} ${formatDateLocal(item.postSettlementDate)}`} style={[commonStyles.fs10, commonStyles.fw500, commonStyles.textGrey,]} numberOfLines={1} />}
                  <ParagraphComponent text={item?.txType || ""} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textBlack, commonStyles?.mt8]} />
                </View>


                <ParagraphComponent text={formatCurrency(item.action === "Consume" && item?.state === "Approved" ? item.postSettlementAmount || 0 : item?.amount || 0, 2) + " " + item.type} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textBlack, commonStyles.textRight]} numberOfLines={1} />
              </View>


            </View>
            {item?.state && item?.state.toLowerCase() == "approved" ? <>
              {item?.state && <View style={[
                styles.status, { backgroundColor: badgeColor[item?.state?.toLowerCase()] || NEW_COLOR.BG_GREEN }
              ]}>
                <ParagraphComponent
                  text={item.state}
                  style={[commonStyles.fw600, commonStyles.textAlwaysWhite, { marginBottom: 2, fontSize: 8 }]}
                  numberOfLines={1}
                />
              </View>}</>
              : <View style={{ position: 'absolute', top: 0, right: 24, }}><Badge text={item.state} color={badgeColor[item?.state?.toLowerCase()] || NEW_COLOR.BG_GREEN} /></View>
            }

          </View>
        </TouchableOpacity>

        {index !== transactionData.length - 1 && (
          <View style={[{ marginVertical: s(8) }]} />
        )}
        {index == transactionData.length - 1 && (
          <View style={[commonStyles.mb16,]} />
        )}
      </>

    )
  }, [getIconUrl, isPad, styles, toggleOverlay, transactionData.length]);

  const renderFooter = () => {
    if (!transLoading) return null;
    return (
      <Loadding contenthtml={CardListLoader} />
    );
  };

  const loadMoreData = () => {
    if (!transLoading && isMoreData) {
      fetchTransactions();
    }
  };
  const handleTab = (index: number) => {
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
              onPress={() => { handleTab(index) }}
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
          onEndReached={() => loadMoreData()}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={() => <>{!transLoading && <NoDataComponent />}</>}
          // P-01: rows are variable height (the post-settlement line is
          // conditional), so no getItemLayout here — cap the window instead.
          {...LIST_PERF_PAGINATED}
        />
      </View>

      {isCommonVisible && <TransactionDetails transId={transactionId} closePop={() => closePop()} />}
      {isConsumeDetailsVisible && <ConsumeTransactionDetails transId={transactionId} closePop={() => closePop()} />}
    </View>
  );
});
export default EXChangaTransactionHistory;

const themedStyles = StyleService.create({
  pending: {
    backgroundColor: NEW_COLOR.BG_ORANGE
  },
  activeTabStyle: {
    backgroundColor: NEW_COLOR.BG_ORANGE,
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
  iconCircle: {
    borderRadius: 100 / 2,
  },
  rowColor: {
    backgroundColor: NEW_COLOR.MENU_CARD_BG, borderRadius: 16, position: 'relative'
  },
  status: { position: 'absolute', top: 0, right: 24, paddingVertical: 2, paddingHorizontal: 12, borderBottomRightRadius: 12, borderBottomLeftRadius: 12 },
});