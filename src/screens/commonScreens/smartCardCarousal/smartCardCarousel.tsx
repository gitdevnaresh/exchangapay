import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { TouchableOpacity, View, Dimensions, FlatList, ViewToken } from "react-native";
import CardsModuleService from "../../../apiServices/cards";
import { isErrorDispaly } from "../../../utils/helpers";
import { getThemedCommonStyles, statusColor } from "../../../components/CommonStyles";
import { useIsFocused, useNavigation, NavigationProp, ParamListBase } from "@react-navigation/native";
import { s } from "../../../constants/styels/scale";
import { SmartCardCarouselInterface } from "./interface";
import ViewComponent from "../../../components/view/view";
import { ApplyCardImage } from "../../../assets/svg";
import ImageBackgroundWrapper from "../../../components/imageComponents/ImageBackground";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import { useLngTranslation } from "../../../hooks/languagesHook/useLngTranslation";
import CommonTouchableOpacity from "../../../components/touchableComponents/touchableOpacity";
import AntDesign from '@expo/vector-icons/AntDesign';
import { statusIconMap } from "../../fintechApp/cards/dashoard/constants";
import KycVerifyPopup from "../kycVerify";
import { useDispatch,useSelector } from "react-redux";
import ParagraphComponent from "../../../components/textComponets/paragraphText/paragraph";
import { setCardHolderStatusId } from "../../../redux/actions/actions";

export interface CardItem {
  id: string;
  type: string;
  cardName: string;
  number: string;
  status: 'Approved' | 'Active' | 'Pending' | 'Rejected' | 'Canceled' | 'Freezed';
  currency: string;
  image?: string;
  amount?: number;
  coinCode?: string;
  cardProcessType?: string;
  cardHolderStatus?: string;
  employeeStatus?: boolean;
  programId?: string; 
}

export interface SmartCardCarouselInterfaceExtended extends SmartCardCarouselInterface {
  initialCardsData?: CardItem[];
  onError?: (errorMessage: string) => void;
  screenName?: string;

  /** New: smaller height & opacity for side cards */
  inactiveCardHeightRatio?: number; // default 0.90
  inactiveCardOpacity?: number;     // default 0.55
  activeCardOpacity?: number;       // default 1
}

const SmartCardCarousel = (props: SmartCardCarouselInterfaceExtended) => {
  const [data, setData] = useState<{
    allCards: CardItem[];
    errorMsg: string;
    allCardsLoading: boolean;
    clickedCardId: string | null | false;
  }>({
    allCards: props.initialCardsData || [],
    errorMsg: '',
    allCardsLoading: props.initialCardsData === undefined,
    clickedCardId: false
  });

  const {
    inactiveCardHeightRatio = 0.92,
    inactiveCardOpacity = 0.45,
    activeCardOpacity = 1,
  } = props;

  const carouselRef = useRef<FlatList<CardItem>>(null);
  const isFocused = useIsFocused();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const NEW_COLOR = useMemo(() => useThemeColors(), []);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const { t } = useLngTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEmployeeStatus, setIsEmployeeStatus] = useState(true);
  const dispatch = useDispatch();
  // ✅ Memoize layout calculations
  const layoutConfig = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    const CAROUSEL_HEIGHT = s(210);
    const isSingle = data.allCards.length === 1;
    const ITEM_WIDTH = Math.round(screenWidth * (isSingle ? 0.86 : 0.82));
    const SPACING = Math.round(screenWidth * 0.054);
    const SIDE_GUTTER = (screenWidth - ITEM_WIDTH) / 2;
    return { screenWidth, CAROUSEL_HEIGHT, isSingle, ITEM_WIDTH, SPACING, SIDE_GUTTER };
  }, [data.allCards.length]);

  const [kycModelVisible, setKycModelVisible] = useState<any>(false);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);

  useEffect(() => {
    if (props.initialCardsData !== undefined) {
      setData(prev => ({ ...prev, allCards: props.initialCardsData || [], allCardsLoading: false, errorMsg: '' }));
    } else if (isFocused) {
      getAllCard();
    }
  }, [isFocused, props.initialCardsData]);

  useEffect(() => {
    if (!data.allCardsLoading && props.onLoadComplete) {
      props.onLoadComplete(true);
    }
  }, [data.allCardsLoading, props.onLoadComplete]);

  const closekycModel = useCallback(() => setKycModelVisible(false), []);

  const getAllCard = async () => {
    setData(prev => ({ ...prev, allCardsLoading: true, errorMsg: '' }));
    const pageSize = 10;
    const pageNo = 1;
    try {
      const response: any = await CardsModuleService.getCards(pageSize, pageNo);
      if (response?.ok) {
        setData(prev => ({ ...prev, allCards: response?.data ?? [], allCardsLoading: false, errorMsg: '' }));
        props.onError?.('');
      } else {
        const msg = isErrorDispaly(response);
        setData(prev => ({ ...prev, allCards: [], allCardsLoading: false, errorMsg: msg }));
        props.onError?.(msg);
      }
    } catch (error) {
      const msg = isErrorDispaly(error);
      setData(prev => ({ ...prev, allCardsLoading: false, errorMsg: msg }));
      props.onError?.(msg);
    }
  };

  // ✅ Memoized Card Item Component
  const MemoizedCardItem = React.memo(({
    item,
    index,
    layoutConfig,
    activeIndex,
    inactiveCardHeightRatio,
    activeCardOpacity,
    inactiveCardOpacity,
    handleCardDetails,
    commonStyles
  }: {
    item: CardItem;
    index: number;
    layoutConfig: any;
    activeIndex: number;
    inactiveCardHeightRatio: number;
    activeCardOpacity: number;
    inactiveCardOpacity: number;
    handleCardDetails: (item: CardItem) => void;
    commonStyles: any;
  }) => {
    const isActive = layoutConfig.isSingle || index === activeIndex;
    const itemHeight = isActive ? layoutConfig.CAROUSEL_HEIGHT : Math.round(layoutConfig.CAROUSEL_HEIGHT * inactiveCardHeightRatio);
    const itemOpacity = isActive ? activeCardOpacity : inactiveCardOpacity;

    return (
      <TouchableOpacity
        onPress={() => handleCardDetails(item)}
        activeOpacity={0.8}
        style={{
          width: layoutConfig.ITEM_WIDTH,
          marginHorizontal: layoutConfig.SPACING / 2,
          height: layoutConfig.CAROUSEL_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ width: '100%', height: itemHeight, opacity: itemOpacity }}>
          <ImageBackgroundWrapper
            source={{ uri: item?.image }}
            style={[commonStyles.rounded12, { width: "100%", height: "100%" }]}
            resizeMode="cover"
            imageStyle={[commonStyles.rounded12, { width: "100%", height: "100%" }]}
          >
            <ViewComponent style={[commonStyles.p16, commonStyles.justifyContent, commonStyles.flex1]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.justifyend]}>
                {item.status && (
                  <View>
                    <ParagraphComponent
                      text={statusIconMap[item?.status?.toLowerCase()]}
                      style={[commonStyles.cardstatus, { color: statusColor[item?.status?.toLowerCase()] }]}
                      numberOfLines={1}
                    />
                  </View>
                )}
              </ViewComponent>
              <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt24]}>
                <ViewComponent></ViewComponent>
              </ViewComponent>
            </ViewComponent>
          </ImageBackgroundWrapper>
        </View>
      </TouchableOpacity>
    );
  });

  // ✅ Stable viewability config
  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 60 }), []);
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems?.length > 0) {
        const v = viewableItems[0];
        if (v?.index != null) setActiveIndex(v.index);
      }
    },
    []
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: layoutConfig.ITEM_WIDTH + layoutConfig.SPACING,
      offset: (layoutConfig.ITEM_WIDTH + layoutConfig.SPACING) * index,
      index,
    }),
    [layoutConfig.ITEM_WIDTH, layoutConfig.SPACING]
  );

  const handleCardDetails = useCallback(async (item: CardItem) => {
    dispatch(setCardHolderStatusId(""));
    const isDoubleStep = item?.cardProcessType?.toLowerCase() === "doublestep";
    const status = item?.status?.toLowerCase();
    const cardHolderStatus = item?.cardHolderStatus?.toLowerCase();

    const baseParams = {
      cardId: item?.programId,
      cardType: item?.type,
      cardName: item?.cardName,
      cardHolderStatus: item?.cardHolderStatus,
      currency: item?.currency,
      logo: item?.image,
      cardProcessType: item?.cardProcessType,
    };

    if (isDoubleStep && status === "underreview" && cardHolderStatus === "approved") {
      dispatch(setCardHolderStatusId(item?.id));
      navigation.navigate("ApplyCard", baseParams);
    } else if (isDoubleStep && status === "rejected" && cardHolderStatus === "rejected") {
      dispatch(setCardHolderStatusId(item?.id));
      navigation.navigate("CardSetupStatus", baseParams);
    } else if (isDoubleStep && status === "underreview" && cardHolderStatus === "pending") {
      dispatch(setCardHolderStatusId(item?.id));
      navigation.navigate("CardSetupStatus", baseParams);
    } else if (item?.employeeStatus) {
      navigation.navigate("getMyCard", {
        cardId: item?.id,
        cardType: item?.type,
        actionType: "getCard"
      });
    } else {
      navigation.navigate(props?.routing, {
        cardId: item?.id,
        cardType: item?.type
      });
    }
  }, [navigation, props?.routing]);

  const keyExtractor = useCallback((item: CardItem) => item.id.toString(), []);

  const extraData = activeIndex;
  const renderCardItem = useCallback(({ item, index }: { item: CardItem; index: number }) => (
    <MemoizedCardItem
      item={item}
      index={index}
      layoutConfig={layoutConfig}
      activeIndex={activeIndex}
      inactiveCardHeightRatio={inactiveCardHeightRatio}
      activeCardOpacity={activeCardOpacity}
      inactiveCardOpacity={inactiveCardOpacity}
      handleCardDetails={handleCardDetails}
      commonStyles={commonStyles}
    />
  ), [layoutConfig, activeIndex, inactiveCardHeightRatio, activeCardOpacity, inactiveCardOpacity, handleCardDetails, commonStyles]);

  const handleApplyCardNavigation = useCallback(() => {
    // if (userInfo?.kycStatus !== "Approved") {
    //   setKycModelVisible(true);
    // } else {
    //   navigation.navigate("AllCards", { screenName: props?.screenName });
    // }
    navigation.navigate("AllCards", { screenName: props?.screenName });
  }, [userInfo?.kycStatus, navigation, props?.screenName]);

  const renderContent = useCallback(() => {
    if (data.allCardsLoading) {
      return <ViewComponent style={{ height: layoutConfig.CAROUSEL_HEIGHT }} />;
    }
    if (data.allCards.length > 0) {
      return (
        <ViewComponent style={{ height: layoutConfig.CAROUSEL_HEIGHT, overflow: 'visible' }}>
          <FlatList
            ref={carouselRef}
            data={data.allCards}
            renderItem={renderCardItem}
            keyExtractor={keyExtractor}
            extraData={extraData}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={layoutConfig.ITEM_WIDTH + layoutConfig.SPACING}
            snapToAlignment="start"
            decelerationRate="fast"
            removeClippedSubviews={false}
            maxToRenderPerBatch={3}
            initialNumToRender={3}
            windowSize={5}
            updateCellsBatchingPeriod={50}
            style={{ overflow: 'visible' }}
            contentContainerStyle={{ paddingHorizontal: layoutConfig.SIDE_GUTTER - (layoutConfig.SPACING * 1.6) }}
            getItemLayout={getItemLayout}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        </ViewComponent>
      );
    }
    return (
      <ViewComponent style={[commonStyles.cardbannerbg]}>

        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
          <CommonTouchableOpacity onPress={handleApplyCardNavigation} style={[commonStyles.flex1]}>
            <ViewComponent style={[commonStyles.p12]}>
              <ParagraphComponent
                text={'GLOBAL_CONSTANTS.GET_NEW_CARD_TODAY'}
                style={[
                  commonStyles.cardbannertext,
                ]}
              />
              <ViewComponent
                style={[
                  commonStyles.dflex,
                  commonStyles.alignCenter,
                  commonStyles.gap4,
                ]}
              >
                <ParagraphComponent
                  text={t('GLOBAL_CONSTANTS.APPLY_CARDS')}
                  style={[commonStyles.sectionLink]}
                />
                <AntDesign name="arrowright" size={s(20)} style={[commonStyles.arrowiconprimary]} />
              </ViewComponent>
            </ViewComponent>
          </CommonTouchableOpacity>
          <ViewComponent >
            <ViewComponent style={[commonStyles.cardbannerimg]} >
              <ApplyCardImage />
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
        {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
      </ViewComponent>


    );
  }, [data.allCardsLoading, data.allCards.length, layoutConfig, renderCardItem, getItemLayout, onViewableItemsChanged, viewabilityConfig, commonStyles, handleApplyCardNavigation, t, kycModelVisible, closekycModel]);

  return (
    <ViewComponent>
      {renderContent()}
    </ViewComponent>
  );
};
export default React.memo(SmartCardCarousel);
