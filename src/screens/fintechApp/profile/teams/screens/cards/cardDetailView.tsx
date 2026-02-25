import React, { useCallback, useEffect, useState, useRef } from 'react';
import { BackHandler, Image } from 'react-native';
import { useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { getThemedCommonStyles, statusColor, CARD_URIS } from '../../../../../../components/CommonStyles';
import { s } from '../../../../../../constants/styels/scale';
import ViewComponent from '../../../../../../components/view/view';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import DashboardLoader from '../../../../../../components/loader';
import SafeAreaViewComponent from '../../../../../../components/safeArea/safeArea';
import { isErrorDispaly } from '../../../../../../utils/helpers';
import TeamsService from '../../../../../../apiServices/profile/primary/teams';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { CurrencyText } from '../../../../../../components/textComponets/currencyText/currencyText';
import CommonTouchableOpacity from '../../../../../../components/touchableComponents/touchableOpacity';
import { CardTransactionsTab, CardHistoryTab } from '../../tabs';
import CardCarousel from '../../../../../../components/cardsCarousal/cardsCarousal';
import ImageBackgroundWrapper from '../../../../../../components/imageComponents/ImageBackground';
import ImageUri from '../../../../../../components/imageComponents/image';
import { hideDigitBeforLast } from '../../../../../../utils/helpers';
import { statusIconMap } from '../../../../cards/dashoard/constants';
import { CardDetails, CardApiResponse, CardDetailNavigationProps, TabRoute, TabProps, SceneProps, CardDetailState } from '../../utils/interfaces';
import { TAB_TITLES, PAGINATION, UI, TAB_ROUTES } from '../../constants';
import CustomTabView from '../../../../../../components/customTabView/customTabView';

const CardDetailView: React.FC<CardDetailNavigationProps> = (props) => {
  const initialCardLoadedRef = useRef(false);
  const routes = [
    { key: TAB_ROUTES.TRANSACTIONS, title: TAB_TITLES.CARD_TRANSACTIONS },
    { key: TAB_ROUTES.HISTORY, title: TAB_TITLES.CARD_HISTORY }
  ];

  const [state, setState] = useState<CardDetailState>({
    loading: false,
    errormsg: "",
    cardData: null as CardDetails | null,
    allMemberCards: [] as CardDetails[],
    activeCardId: "",
    carouselActiveIndex: 0,
    tabLoading: false,
    index: 0,
    routes,
    cardDetailsLoading: false,
  });

  const updateState = (newState: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const cardId = props?.route?.params?.cardId;
  const initialCardData = props?.route?.params?.cardData;
  const memberId = props?.route?.params?.memberId;

  useEffect(() => {
    if (isFocused && cardId && memberId) {
      fetchAllMemberCardsAndSetActive(cardId);
    }
  }, [isFocused, cardId, memberId]);

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

  const fetchAllMemberCardsAndSetActive = async (initialCardIdToActivate: string) => {
    updateState({ loading: true, errormsg: "" });

    try {
      const response = await TeamsService.getMemberCards(memberId, undefined, 1, PAGINATION.LARGE_PAGE_SIZE) as CardApiResponse;

      if (response && response.ok) {
        const allCards: CardDetails[] = (response.data as { data: CardDetails[] })?.data || [];

        if (allCards.length > 0) {
          let activeIdx = allCards.findIndex(card => card.id === initialCardIdToActivate);
          if (activeIdx === -1) activeIdx = 0;

          const targetCardId = allCards[activeIdx].id;

          updateState({
            allMemberCards: allCards,
            activeCardId: targetCardId,
            carouselActiveIndex: activeIdx
          });

          await fetchCardDetailsForActiveCard(targetCardId);
          initialCardLoadedRef.current = true;
        } else {
          updateState({ allMemberCards: [], cardData: initialCardData });
        }
      } else {
        updateState({ errormsg: isErrorDispaly(response), cardData: initialCardData });
      }
    } catch (error) {
      updateState({ errormsg: isErrorDispaly(error), cardData: initialCardData });
    } finally {
      updateState({ loading: false });
    }
  };

  const fetchCardDetailsForActiveCard = async (cardIdToFetch: string) => {
    updateState({ cardDetailsLoading: true });
    try {
      const response = await TeamsService.getCardDetails(cardIdToFetch) as CardApiResponse;
      if (response?.ok) {
        updateState({ cardData: (response.data as CardDetails) || null });
      } else {
        updateState({ errormsg: isErrorDispaly(response) });
      }
    } catch (error) {
      updateState({ errormsg: isErrorDispaly(error) });
    } finally {
      updateState({ cardDetailsLoading: false });
    }
  };

  const backArrowButtonHandler = () => {
    navigation.goBack();
  };

  const _handleIndexChange = useCallback((index: number) => {
    if (state.index === index) {
      return;
    }
    updateState({ index });
  }, [state.index]);

  const renderTabBar = useCallback((tabProps: TabProps) => {
    const active = tabProps.navigationState.index;
    return (
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.tabBarContainer, commonStyles.sectionGap]}>
        {tabProps.navigationState.routes.map((route: TabRoute, i: number) => {
          const isActive = active === i;
          return (
            <CommonTouchableOpacity
              key={route.key}
              style={[
                commonStyles.tabButton,
                isActive ? commonStyles.activeTabButton : commonStyles.inactiveTabButton,
              ]}
              activeOpacity={0.8}
              onPress={() => _handleIndexChange(i)}
            >
              <ParagraphComponent
                style={[
                  commonStyles.tabtext,
                  isActive ? commonStyles.textWhite : commonStyles.textlinkgrey
                ]}
                text={route.title}
              />
            </CommonTouchableOpacity>
          );
        })}
      </ViewComponent>
    );
  }, [commonStyles, _handleIndexChange]);

  const handleTabError = useCallback((error: string) => {
    updateState({ errormsg: error });
  }, []);

  // Use cardData if available, otherwise use initialCardData
  const displayCardData = state.cardData || initialCardData;

  const renderScene = useCallback(({ route: sceneRoute }: SceneProps) => {
    switch (sceneRoute.key) {
      case TAB_ROUTES.TRANSACTIONS:
        return (
          <CardTransactionsTab
            cardId={state.activeCardId || cardId}
            currency={displayCardData?.cardCurrency}
            isActiveTab={state.index === 0}
            onError={handleTabError}
          />
        );
      case TAB_ROUTES.HISTORY:
        return (
          <CardHistoryTab
            cardId={state.activeCardId || cardId}
            isActiveTab={state.index === 1}
            onError={handleTabError}
          />
        );
      default:
        return null;
    }
  }, [state.activeCardId, cardId, displayCardData?.cardCurrency, state.index, handleTabError]);


  const renderCarouselCard = useCallback((item: CardDetails, _index: number, calculatedItemWidth: number, calculatedItemHeight: number) => {
    return (
      <ImageBackgroundWrapper
        source={{ uri: item?.image }}
        resizeMode="cover"
        imageStyle={[commonStyles.rounded12]}
        style={[commonStyles.rounded12, { width: calculatedItemWidth, height: calculatedItemHeight }]}
      >
        <ViewComponent style={[commonStyles.p16, commonStyles.justifyContent, commonStyles.flex1]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
            {/* <ViewComponent style={{ width: s(60), height: s(20) }}>
              {item.cardName?.toLowerCase()?.replaceAll(" ", "") === 'abcvirtualcard' ? (
                <ImageUri width={s(60)} height={s(25)} uri={CARD_URIS.rapizdark} />
              ) : (
                <ImageUri width={s(60)} height={s(25)} uri={CARD_URIS.rapizdark} />
              )}
            </ViewComponent> */}

          </ViewComponent>
          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mt24]}>
            <ViewComponent>
              <ParagraphComponent
                text={item?.number ? hideDigitBeforLast(item?.number.replace(/\d{4}(?=.)/g, "$& ")) : ''}
                style={[commonStyles.cardnumber, item.cardName?.toLowerCase()?.replaceAll(" ", "") === 'abcvirtualcard' ? commonStyles.textAlwaysWhite : commonStyles.textAlwaysWhite]}
              />
              <ParagraphComponent
                text={item?.name}
                style={[commonStyles.cardname, item.cardName?.toLowerCase()?.replaceAll(" ", "") === 'abcvirtualcard' ? commonStyles.textAlwaysWhite : commonStyles.textAlwaysWhite]}
              />
            </ViewComponent>
            {item.status && (
              <ViewComponent>
                <ParagraphComponent
                  text={statusIconMap[item?.status?.toLowerCase()]}
                  style={[commonStyles.cardstatus, { color: statusColor[item?.status?.toLowerCase()] }]}
                  numberOfLines={1}
                />
              </ViewComponent>
            )}
          </ViewComponent>

          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt24]}>
            <ViewComponent>
              <TextMultiLanguage text={"GLOBAL_CONSTANTS.CURRENCY"} style={[commonStyles.Cardcurrencylabel, item.cardName?.toLowerCase()?.replaceAll(" ", "") === 'abcvirtualcard' ? commonStyles.textAlwaysWhite : commonStyles.textAlwaysWhite]} />
              <ParagraphComponent text={item?.currency}
                style={[commonStyles.cardcurrency, item.cardName?.toLowerCase()?.replaceAll(" ", "") === 'abcvirtualcard' ? commonStyles.textAlwaysWhite : commonStyles.textAlwaysWhite]} />
            </ViewComponent>
            {/* <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
              {item.cardName?.toLowerCase()?.replaceAll(" ", "") === 'abcvirtualcard' ?
                <ImageUri width={s(60)} height={s(25)} uri={CARD_URIS.visadark} />
                : <ImageUri width={s(60)} height={s(25)} uri={CARD_URIS.visadark} />
              }
            </ViewComponent> */}
          </ViewComponent>
        </ViewComponent>
      </ImageBackgroundWrapper>
    );
  }, [commonStyles, statusColor]);

  const handleCardChange = useCallback((newCard: CardDetails, index: number) => {
    if (initialCardLoadedRef.current) {
      initialCardLoadedRef.current = false;
      return;
    }
    updateState({ activeCardId: newCard.id, carouselActiveIndex: index });
    fetchCardDetailsForActiveCard(newCard.id);
  }, []);

  if (state.loading) {
    return (
      <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        <DashboardLoader />
      </SafeAreaViewComponent>
    );
  }

  const TARGET_CAROUSEL_ITEM_HEIGHT = s(210);
  const SPACE_FOR_DOTS = s(UI.SPACE_FOR_DOTS);

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ViewComponent style={{ flex: 1, paddingHorizontal: s(24), paddingTop: s(24) }}>
        <PageHeader
          title={displayCardData?.name || TAB_TITLES.CARD_DETAILS}
          onBackPress={backArrowButtonHandler}
        />

        {state.errormsg !== "" && (
          <ErrorComponent message={state.errormsg} onClose={() => updateState({ errormsg: "" })} />
        )}

        {(state.allMemberCards.length > 0 || displayCardData) && (
          <ViewComponent style={[commonStyles.flex1]}>
            {/* Card Carousel Section */}
            {state.allMemberCards.length > 0 ? (
              <ViewComponent style={[commonStyles.sectionGap]}>
                <CardCarousel
                  data={state.allMemberCards}
                  renderItem={renderCarouselCard}
                  keyExtractor={(item) => item.id.toString()}
                  height={TARGET_CAROUSEL_ITEM_HEIGHT + SPACE_FOR_DOTS}
                  onActiveCardChange={handleCardChange}
                  initialScrollIndex={state.carouselActiveIndex >= 0 && state.carouselActiveIndex < state.allMemberCards.length ? state.carouselActiveIndex : 0}
                />
              </ViewComponent>
            ) : (
              <ViewComponent style={[
                commonStyles.p20,
                commonStyles.mb16,
                commonStyles.alignCenter,
                {
                  backgroundColor: displayCardData?.colorCode || NEW_COLOR.CARD_BG,
                  borderRadius: s(16),
                  minHeight: s(120)
                }
              ]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb16]}>
                  <Image
                    source={{ uri: displayCardData?.image }}
                    style={{ width: s(60), height: s(40) }}
                    resizeMode="contain"
                  />
                </ViewComponent>
              </ViewComponent>
            )}

            {/* Card Balance Display */}
            {state.cardDetailsLoading ? (
              <ViewComponent style={[commonStyles.alignCenter, { marginTop: s(15), marginBottom: s(20) }]}>
                <ViewComponent style={[commonStyles.mb4]}>
                  <ViewComponent style={[
                    commonStyles.referaltextSkeleton, {
                      width: s(150),
                      height: s(24),
                      borderRadius: s(4)
                    }]} />
                </ViewComponent>
                <ViewComponent style={[
                  commonStyles.referaltextSkeleton, {
                    width: s(200),
                    height: s(37),
                    borderRadius: s(4)
                  }]} />
              </ViewComponent>
            ) : displayCardData && (
              <ViewComponent style={[commonStyles.sectionGap]}>
                <TextMultiLanguage
                  style={[commonStyles.transactionamounttextlabel]}
                  text="GLOBAL_CONSTANTS.CARD_BALANCE"
                />
                <CurrencyText
                  value={displayCardData.amount || displayCardData.balance || 0}
                  currency={displayCardData.cardCurrency || ""}
                  style={[commonStyles.transactionamounttext]}
                />
              </ViewComponent>
            )}

            {/* TabView - Takes remaining space */}
            <ViewComponent style={[commonStyles.flex1]}>
              <CustomTabView
                style={{ backgroundColor: NEW_COLOR.SCREENBG_BLACK }}
                navigationState={state}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={_handleIndexChange}
                lazy={true}
                lazyPreloadDistance={0}
              />
            </ViewComponent>
          </ViewComponent>
        )}
      </ViewComponent>
    </ViewComponent>
  );
};

export default CardDetailView;
