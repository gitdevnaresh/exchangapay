import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { BackHandler, ImageBackground } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CARD_URIS, getThemedCommonStyles, statusColor } from '../../../../../../components/CommonStyles';
import { s } from '../../../../../../constants/styels/scale';
import FlatListComponent from '../../../../../../components/flatList/flatList';
import ViewComponent from '../../../../../../components/view/view';
import CommonTouchableOpacity from '../../../../../../components/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import Container from '../../../../../../components/container/container';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import DashboardLoader from '../../../../../../components/loader';
import SafeAreaViewComponent from '../../../../../../components/safeArea/safeArea';
import { isErrorDispaly } from '../../../../../../utils/helpers';
import TeamsService from '../../../../../../apiServices/profile/primary/teams';
import { CurrencyText } from '../../../../../../components/textComponets/currencyText/currencyText';
import SearchCompApi from '../../../../../../components/searchComponents/searchCompApi';
import KpiComponent from '../../../../../../components/kpiComponent/kpiComponent';
import NoDataComponent from '../../../../../../components/noData/noData';
import { useLngTranslation } from '../../../../../../hooks/languagesHook/useLngTranslation';
import Loadding from '../../../../../../components/skelton/skeltons';
import { allTransactionList } from '../../../../../../skeletons/skeltonViews';
import { useSelector } from 'react-redux';
import { Card, KpiItem, MemberCardsResponse, KpiResponse, ReduxState, TeamCardsNavigationProps } from '../../utils/interfaces';
import ImageUri from '../../../../../../components/imageComponents/image';
import { WINDOW_WIDTH } from '../../../../../../constants/styels/variables';
import { hideDigitBeforLast } from '../../../../../../utils/helpers';
import { AliaPay, PhonePay, ShopeeImage } from '../../../../../../assets/svg';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { PAGINATION, UI } from '../../constants';
import KeyboardAvoidingWrapper from '../../../../../../components/keyboard/keyBoardAvoidingView';


const TeamCardsListView: React.FC<TeamCardsNavigationProps> = (props) => {
  const CardWidth = (WINDOW_WIDTH * 20) / 100;
  const aspectRatio = 133 / 75;
  const CardHeight = CardWidth / aspectRatio;
  const cardsListLoader = allTransactionList(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<string>("");
  const [cardsList, setCardsList] = useState<Card[]>([]);
  const [kpiData, setKpiData] = useState<KpiItem[]>([]);
  const [pageNo, setPageNo] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loadMoreLoading, setLoadMoreLoading] = useState<boolean>(false);

  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const { t } = useLngTranslation();
  const baseCurrency = useSelector((state: ReduxState) => state.userReducer?.userDetails?.currency);

  const memberId = props?.route?.params?.memberId;
  const memberData = props?.route?.params?.memberData;
  const memberName = props?.route?.params?.memberName || "";

  useEffect(() => {
    if (memberId) {
      setPageNo(1);
      setCardsList([]);
      loadInitialData(1, searchQuery);
    }
  }, [memberId, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        backArrowButtonHandler();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [])
  );

  const loadInitialData = async (page: number = 1, search?: string) => {
    setLoading(true);
    setErrormsg("");

    try {
      const searchParam = search !== undefined ? search : searchQuery;
      const finalSearchParam = searchParam && searchParam?.trim() !== '' ? searchParam : undefined;

      const [cardsResponse, kpiResponse] = await Promise.all([
        TeamsService.getMemberCards(memberId, finalSearchParam, page, PAGINATION.DEFAULT_PAGE_SIZE),
        TeamsService.getMemberCardsKpi(memberId)
      ]) as [MemberCardsResponse, KpiResponse];

      if (cardsResponse && cardsResponse.ok) {
        const data = cardsResponse.data?.data || [];
        setCardsList(data);
        setTotal(cardsResponse.data?.total || data.length);
      } else {
        setErrormsg(isErrorDispaly(cardsResponse));
      }

      if (kpiResponse && kpiResponse.ok) {
        setKpiData(kpiResponse.data || []);
      } else {
        setErrormsg(isErrorDispaly(kpiResponse));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setLoading(false);
    }
  };

  const getCardsList = async (page: number = 1, search?: string, isLoadMore: boolean = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setErrormsg("");
    } else {
      setLoadMoreLoading(true);
    }

    try {
      const searchParam = search !== undefined ? search : searchQuery;
      const finalSearchParam = searchParam && searchParam.trim() !== '' ? searchParam : undefined;
      const response = (await TeamsService.getMemberCards(memberId, finalSearchParam, page, PAGINATION.DEFAULT_PAGE_SIZE)) as MemberCardsResponse;

      if (response && response.ok) {
        const data = response.data?.data || [];

        if (isLoadMore && page > 1) {
          const existingIds = new Set(cardsList.map(c => c.id));
          const newData = data.filter(item => !existingIds.has(item.id));

          if (newData.length === 0) {
            setTotal(cardsList.length);
          } else {
            setCardsList(prev => [...prev, ...newData]);
          }
        } else {
          setCardsList(data);
        }
        setTotal(response.data?.total || data.length);
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      if (!isLoadMore) {
        setLoading(false);
      } else {
        setLoadMoreLoading(false);
      }
    }
  };

  const backArrowButtonHandler = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleMainSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const loadMoreData = useCallback(() => {
    if (cardsList.length < total && !loading && !loadMoreLoading && cardsList.length > 0) {
      const nextPage = pageNo + 1;
      setPageNo(nextPage);
      getCardsList(nextPage, searchQuery, true);
    }
  }, [cardsList.length, total, loading, loadMoreLoading, pageNo, searchQuery]);

  const renderFooter = useCallback(() => {
    if (loadMoreLoading) {
      return (
        <Loadding contenthtml={cardsListLoader} />
      );
    }
    return null;
  }, [loadMoreLoading, cardsListLoader]);

  const renderItemSeparator = useCallback(() => (
    <ViewComponent style={[commonStyles.listGap]} />
  ), [commonStyles.listGap]);

  const handleCardPress = useCallback((card: Card) => {
    (navigation).navigate('CardDetailView', {
      cardId: card.id,
      cardData: card,
      memberId: memberId,
      memberData: memberData
    });
  }, [navigation, memberId, memberData]);

  const renderItem = useCallback(({ item }: { item: Card }) => {
    const normalizedName = item?.name?.toLowerCase()?.replaceAll(UI.SPACE_CHAR, UI.EMPTY_STRING) || UI.EMPTY_STRING;
    const visaLogoUri = CARD_URIS.visa;

    return (
      <CommonTouchableOpacity
        activeOpacity={0.8}
        key={item.id}
        onPress={() => handleCardPress(item)}
      >
        <ViewComponent style={[commonStyles.Cardslist, commonStyles.p10, commonStyles.cardslistradius]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap16]}>
            <ImageBackground
              source={{ uri: item.image }}
              resizeMode="cover"
              style={[commonStyles.cardSmall, { width: CardWidth, height: CardHeight }]}
              imageStyle={[commonStyles.cardslistradius]}
            >
              {/* <ViewComponent style={[commonStyles.p8, commonStyles.flex1]}>
                <ViewComponent style={[commonStyles.dflex]}>
                  <ImageUri width={s(18)} height={s(10)} uri={CARD_URIS.rapiz} />
                </ViewComponent>
                
                <ViewComponent style={{ marginTop: "auto" }}>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyend]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                      <ImageUri width={s(18.5)} height={s(6)} uri={visaLogoUri} />
                    </ViewComponent>
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent> */}
            </ImageBackground>

            <ViewComponent style={commonStyles.flex1}>
              <ParagraphComponent style={[commonStyles.listprimarytext]} text={item?.name ?? ""} numberOfLines={1} />
              <ParagraphComponent style={[commonStyles.listprimarytext]} text={hideDigitBeforLast(item?.number)} numberOfLines={1} />
            </ViewComponent>

            <ViewComponent style={[commonStyles.mb18]}>
              {item?.state && (
                <ViewComponent>
                  <ParagraphComponent
                    text={item.state}
                    style={[
                      commonStyles.colorstatus,
                      commonStyles.textRight,
                      { color: statusColor[item?.state?.toLowerCase()] }
                    ]}
                    numberOfLines={1}
                  />
                </ViewComponent>
              )}
            </ViewComponent>
          </ViewComponent>

          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mt10, commonStyles.gap8, commonStyles.flexWrap]}>
            <ParagraphComponent text={'GLOBAL_CONSTANTS.BALANCE'} style={[commonStyles.listsecondarytext]} />
            <CurrencyText value={item?.balance} currency={baseCurrency} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
          </ViewComponent>

          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mt16]}>
            <ParagraphComponent text={'GLOBAL_CONSTANTS.SUPPORTED_PLATFORM'} style={[commonStyles.listsecondarytext]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6, commonStyles.justifyend, { marginRight: s(-6) }]}>
              <PhonePay />
              <AliaPay />
              <ShopeeImage height={s(20)} width={s(20)} />
              <MaterialIcons name={"keyboard-arrow-right"} size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    );
  }, [commonStyles, CardWidth, CardHeight, handleCardPress, statusColor, baseCurrency, NEW_COLOR]);

  if (loading && pageNo === 1) {
    return (
      <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        <DashboardLoader />
      </SafeAreaViewComponent>
    );
  }

  return (
    <KeyboardAvoidingWrapper
    >
      <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        <Container style={commonStyles.container}>
          <PageHeader
            title={`${memberName} ${t('GLOBAL_CONSTANTS.CARDS')}`}
            onBackPress={backArrowButtonHandler}
          />

          {errormsg !== "" && (
            <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />
          )}

          <FlatListComponent
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={renderItemSeparator}
            ListHeaderComponent={
              <ViewComponent style={[commonStyles.sectionGap]}>
                {/* KPI Section */}
                {kpiData.length > 0 && (
                  <ViewComponent style={[commonStyles.mb16]}>
                    <KpiComponent
                      data={kpiData}
                    />
                  </ViewComponent>
                )}

                <SearchCompApi
                  placeholder={"GLOBAL_CONSTANTS.SEARCH_CARDS"}
                  onSearch={handleMainSearch}
                  inputStyle={[commonStyles.textWhite]}
                  searchQuery={searchQuery}
                />
              </ViewComponent>
            }
            data={cardsList}
            extraData={cardsList.length}
            keyExtractor={(item: Card) => item.id}
            renderItem={renderItem}
            isLoading={loading}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            contentContainerStyle={{ paddingBottom: s(UI.CARDS_LIST_BOTTOM_PADDING) }}
            ListEmptyComponent={
              !loading ? (
                <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt20]}>
                  <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_CARDS_AVAILABLE"} />
                </ViewComponent>
              ) : null
            }
          />
        </Container>
      </ViewComponent>
    </KeyboardAvoidingWrapper>
  );
};

export default TeamCardsListView;
