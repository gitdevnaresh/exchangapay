import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
  type ViewToken,
} from 'react-native';
import SwokipayDashboardLoader from '../../../../newComponents/swokipayloader';
import { cardsService } from '../../../../apiServices/cardsApis/cardsApiServices';
import { isErrorDispaly } from '../../../../utils/helpers';
import { Card } from '../interface';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import Container from '../../../../newComponents/container/container';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { s } from '../../../../constants/theme/scale';
import ViewComponent from '../../../../newComponents/view/view';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { useNavigation, useFocusEffect, useRoute, CommonActions, useIsFocused } from '@react-navigation/native'; // Import useRoute
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import NoDataComponent from '../../../../newComponents/noData/noData';
import ImageBackgroundWrapper from '../../../../newComponents/imageComponents/ImageBackground';
import { Visa } from '../../../../assets/vectorAssets';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import KycVerifyPopup from '../../../commonScreens/kycVerify';
import { useDispatch, useSelector } from 'react-redux';
import { setBillingAddress } from '../../../../redux/actions/cardActions';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ScrollViewComponent from '../../../../newComponents/scrollView/scrollView';
import InactiveAccountPopup from '../../../commonScreens/inactiveSheet/accountInactive';
import ComingSoon from '../../../commonScreens/comingSoon/comingSoon';

import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import PopupOrSheet from '../../../../newComponents/models/PopupOrSheet';
import DynamicNotes from './dynamicNote';
import { MAsterIcon } from '../../../../assets/svg';

const CARD_TYPES = ['Virtual', 'Physical'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_MARGIN = 20;
const LIST_WIDTH = SCREEN_WIDTH - HORIZONTAL_MARGIN * 2;
const CARD_WIDTH = LIST_WIDTH * 0.7;
const SPACING = 80;
const TOGGLE_WIDTH = LIST_WIDTH;
const ChooseCard = (props: any) => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>(); // Get the route object to access params
  const [selectedType, setSelectedType] = useState('Virtual');
  const [cardsList, setCardsList] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | undefined>(undefined);
  const [showNoCardPopup, setShowNoCardPopup] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [kycModelVisible, setKycModelVisible] = useState(false)
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const { t } = useLngTranslation();
  const dispatch = useDispatch();
  const [isInactive, setIsInactive] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const noteRef = useRef<any>(null);
  const isFocused = useIsFocused();
  useHardwareBackHandler(() => {
    handleBackPress();
  });
  const filteredCards = useMemo(() => {
    return cardsList.filter(card =>
      (card.cardType || '').toString().trim().toLowerCase() === selectedType.toLowerCase()
    );
  }, [cardsList, selectedType]);
  const isSingleCard = filteredCards.length === 1;

  // Effect to fetch cards when the screen is focused to ensure data is always fresh
  useFocusEffect(

    useCallback(() => {
      allcardsList();
    }, [isFocused])
  );
  useFocusEffect(
    useCallback(() => {
      // Check for navigation params first
      const prevSelectedCardId = route.params?.prevSelectedCardId;
      let prevSelectedType = route.params?.prevSelectedType;

      if (filteredCards.length > 0) {
        let cardToSelect = selectedCard;
        let typeToSet = selectedType;

        // If coming back to the screen, try to restore previous state
        if (prevSelectedCardId && prevSelectedType) {
          cardToSelect = filteredCards.find(c => c.id === prevSelectedCardId);
          typeToSet = prevSelectedType;
        }

        // If no card is selected yet, or the selected one is gone, find a default
        if (!cardToSelect || !filteredCards.some(c => c.id === cardToSelect?.id)) {
          // Prioritize the first card of the current or previous type
          cardToSelect = filteredCards.find(c => (c.cardType || '').toString().trim().toLowerCase() === typeToSet.toLowerCase());

          // If still no card, just take the first one from the filtered list
          if (!cardToSelect) {
            cardToSelect = filteredCards[0];
            typeToSet = (cardToSelect.cardType || '').toString().trim();
          }
        }

        setSelectedType(typeToSet);
        setSelectedCard(cardToSelect);

        // Scroll to the selected card
        const indexToScroll = filteredCards.findIndex(c => c.id === cardToSelect?.id);
        if (indexToScroll !== -1 && flatListRef.current) {
          // Use a timeout to ensure the list has rendered before scrolling
          setTimeout(() => flatListRef.current?.scrollToIndex({ index: indexToScroll, animated: false }), 0);
        }
      } else {
        setSelectedCard(undefined);
        setShowNoCardPopup(true);
      }
    }, [filteredCards, route.params]) // Re-run when filteredCards or navigation params change
  );

  const allcardsList = async () => {
    setError("");
    setIsLoading(true);
    try {
      const response = await cardsService.applyCardsList();
      if (Array.isArray(response?.data)) {
        const sorted = [...response.data].sort((a, b) => {
          const typeA = (a.cardType || '').toString().trim().toLowerCase();
          const typeB = (b.cardType || '').toString().trim().toLowerCase();
          if (typeA === 'virtual' && typeB !== 'virtual') return -1;
          if (typeB === 'virtual' && typeA !== 'virtual') return 1;
          return 0;
        });
        setCardsList(sorted);
      } else {
        setCardsList([]);
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setCardsList([]);
      setError(isErrorDispaly(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (type: string) => {
    if (selectedType === type) return;

    setSelectedType(type);

    const firstCardOfType = cardsList.find(card =>
      (card.cardType || '').toString().trim().toLowerCase() === type.toLowerCase()
    );

    if (firstCardOfType) {
      // The flatlist will re-render with new data. Let onViewableItemsChanged handle selection.
      setSelectedCard(firstCardOfType);
      setShowNoCardPopup(false);
    } else {
      setSelectedCard(undefined);
      setShowNoCardPopup(true);
    }
  };


  const closekycModel = () => {
    setKycModelVisible(false)
  }
  const handleApplycard = () => {
    if (userInfo?.customerAccountStatus === false) {
      setIsInactive(true);
      return;
    }
    if (userInfo.isKYC !== true) {
      setKycModelVisible(true)
      return;
    }
        if (selectedCard) {
      dispatch(setBillingAddress(""));
      if (selectedCard?.isAskPersonalInfo) {
         navigation.navigate("SupportedCountry", {
          card: selectedCard,
          prevSelectedCardId: selectedCard.id,
          cardId: selectedCard.id,
          prevSelectedType: selectedType,
    });
        // noteRef.current?.open()
      }
      else {
        // Pass the current selected card's ID and type as params when navigating
        navigation.navigate("CardApplicationOrder", {
          card: selectedCard,
          prevSelectedCardId: selectedCard.id,
          cardId: selectedCard.id,
          prevSelectedType: selectedType,
        });
      }
    } else {
      setShowNoCardPopup(true);
    }
  };

  const handleClose = () => {
    setIsInactive(false);
  }

  const handleBackPress = () => {
    if (props?.route?.params?.screenName == 'MyCards') {
      navigation.goBack();
    }
    else {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: "Dashboard" }],
        })
      );
    }
    // navigation.goBack();

  }


  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    if (viewableItems.length > 0) {
      const firstVisibleItem = viewableItems[0].item as Card;
      if (firstVisibleItem && selectedCard?.id !== firstVisibleItem.id) {
        setSelectedCard(firstVisibleItem);
        setShowNoCardPopup(false);
      }
    } else if (filteredCards.length === 0) {
      setShowNoCardPopup(true);
    }
  }).current;

  const toggleIndicatorTranslateX = useMemo(() => {
    const isVirtualSelected = selectedType.toLowerCase() === 'virtual';
    return isVirtualSelected ? 0 : TOGGLE_WIDTH / 2;
  }, [selectedType]);

  const closeNoteRef = () => {
    noteRef.current?.close()
  };

  const handleSubmit = (result: any) => {
    closeNoteRef();

    setTimeout(() => {
      navigation.navigate("CardKycRequirements", {
        cardDetails: selectedCard,
        prevSelectedCardId: selectedCard.id,
        prevSelectedType: selectedType,
      });
    }, 300);
  }
  const itemLength = CARD_WIDTH + (isSingleCard ? 0 : SPACING);
  const CARD_HEIGHT = s(400);
  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container style={[]}>
        <PageHeader title={"GLOBAL_CONSTANTS.CHOOSE_CARD"} onBackPress={handleBackPress} />
        {isLoading && (
          <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
            <SwokipayDashboardLoader />
          </ViewComponent>
        )}
        {!isLoading && (
          <>
        {error && <ErrorComponent message={error} screen={true} />}
        <ScrollViewComponent style={[]} onRefresh={allcardsList}>
          <View style={[
            commonStyles.toggleContainer,
            {
              width: '100%',
              marginHorizontal: 0,
              paddingHorizontal: 0,
              alignSelf: 'stretch',
            }
          ]}>

            <Animated.View
              style={[
                commonStyles.toggleIndicator, { width: TOGGLE_WIDTH / 2 },
                {
                  transform: [
                    { translateX: toggleIndicatorTranslateX },
                  ],
                },
              ]}
            />
            {CARD_TYPES?.map((type) => (
              <TouchableOpacity
                key={type}
                style={commonStyles.toggleButton}
                onPress={() => handleToggle(type)}
                activeOpacity={0.8}
              >
                <ParagraphComponent style={[
                  commonStyles.fw500,
                  commonStyles.fs12,
                ]} >
                  {type}
                </ParagraphComponent>
              </TouchableOpacity>
            ))}
          </View>


          <Animated.FlatList
            ref={flatListRef}
            data={filteredCards}
            keyExtractor={(item: Card) => item.id}
            horizontal
            scrollEnabled={!isSingleCard}
            snapToAlignment="center"
            snapToInterval={isSingleCard ? CARD_WIDTH : CARD_WIDTH + SPACING}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            bounces={false}
            style={{
              width: LIST_WIDTH,      // <- inner width (no container padding)
              alignSelf: 'center',
            }}
            contentContainerStyle={{
              paddingHorizontal: (LIST_WIDTH - CARD_WIDTH) / 2,
            }}
            ItemSeparatorComponent={
              isSingleCard ? undefined : () => <View style={{ width: SPACING }} />
            }
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            renderItem={({ item }) => (
              <View
                style={{
                  width: CARD_WIDTH,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {(selectedType === 'Virtual' || selectedType === 'Virtual Card') && (
                <View
  style={{
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: s(16),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
                <ImageBackgroundWrapper
    source={{ uri: item.logo }}
    resizeMode="cover"
    style={{
      width: CARD_HEIGHT,   // 👈 swapped
      height: CARD_WIDTH,   // 👈 swapped
      transform: [{ rotate: '-90deg' }],
    }}
    imageStyle={{
      borderRadius: s(16),
    }}
  >
                    {/* <ViewComponent
                      style={{
                        flex: 1,
                        justifyContent: "flex-end",
                        alignItems: "flex-start",
                        padding: s(16),
                      }}
                    >
                      {item?.cardAssoc?.toLowerCase() === "visa" ? <Visa />
                        : <MAsterIcon />}
                    </ViewComponent> */}
                  </ImageBackgroundWrapper>
                  </View>
                )}
                {(selectedType === 'Physical' || selectedType === 'Physical Card') && (
                  <View
  style={{
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: s(16),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
                  <ImageBackgroundWrapper
                    source={{ uri: item.logo}}
                    style={{
                      width: CARD_HEIGHT,
                      height: CARD_WIDTH,
                      transform: [{ rotate: '-90deg' }],
                    }}
                    resizeMode="cover"
                    imageStyle={{ borderRadius: s(16) }}
                  >
                  </ImageBackgroundWrapper>
                  </View>
                )}
              </View>
            )}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 90 }}
            getItemLayout={(data, index) => ({
              length: itemLength,
              offset: itemLength * index,
              index,
            })}
          />

          {(filteredCards.length <= 0 && (selectedType === 'Virtual' || selectedType === 'Virtual Card')) && (<ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter, { height: s(400) }]}>
            <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_CARDS_YET"} />
          </ViewComponent>)}

          {(filteredCards.length <= 0 && (selectedType === 'Physical' || selectedType === 'Physical Card')) && (<ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter, { height: s(400) }]}>
            <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_CARDS_YET"} />
          </ViewComponent>)}


          {/* {selectedCard && (selectedType === 'Virtual' || selectedType === 'Virtual Card') && (
            <ViewComponent style={[commonStyles.sectionGap, commonStyles.mt32, commonStyles.alignCenter, commonStyles.p10, commonStyles.rounded10, { backgroundColor: NEW_COLOR.APPLY_CARD_BG }]}>
              <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw500, commonStyles.mb5]}>
                {`${selectedType} Card`}
              </ParagraphComponent>
              <TextMultiLanguage style={[commonStyles.fs12]} text={selectedType === 'Virtual'
                ? "GLOBAL_CONSTANTS.PAY_CONTACTLESS_ONLINE_OR_IN_STORE"
                : 'GLOBAL_CONSTANTS.TAP_AND_PAY_ATM_WITHDRAWAL'
              } />
            </ViewComponent>
          )} */}
          {selectedCard && (selectedType === 'Physical' || selectedType === 'Physical Card') && (
            <ViewComponent style={[commonStyles.sectionGap, commonStyles.mt32, commonStyles.alignCenter, commonStyles.p10, commonStyles.rounded10, { backgroundColor: NEW_COLOR.APPLY_CARD_BG }]}>
              <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw500, commonStyles.mb5]}>
                {`${selectedType} Card`}
              </ParagraphComponent>
              <TextMultiLanguage style={[commonStyles.fs12]} text={'GLOBAL_CONSTANTS.TAP_AND_PAY_ATM_WITHDRAWAL'} />
            </ViewComponent>
          )}

        </ScrollViewComponent>

        <ViewComponent>
          {filteredCards.length > 0 && (selectedType === 'Virtual' || selectedType === 'Virtual Card') && (
            <ButtonComponent
              onPress={handleApplycard}
              title={
                selectedCard && selectedCard.cardFee !== undefined && selectedCard.cardCurrency
                  ? `${t("GLOBAL_CONSTANTS.APPLY_CARD_FOR")}${selectedCard.cardFee.toFixed(2)} `
                  : t('GLOBAL_CONSTANTS.APPLY_CARD')
              }
              currency={selectedCard?.cardCurrency}
              capitalizeTitle={false}
            />
          )}
          {filteredCards.length > 0 && (selectedType === 'Physical' || selectedType === 'Physical Card') && (
            <ButtonComponent
              onPress={handleApplycard}
              title={
                selectedCard && selectedCard.cardFee !== undefined && selectedCard.cardCurrency
                  ? `${t("GLOBAL_CONSTANTS.APPLY_CARD_FOR")}${selectedCard.cardFee.toFixed(2)} `
                  : t('GLOBAL_CONSTANTS.APPLY_CARD')
              }
              currency={selectedCard?.cardCurrency}
              capitalizeTitle={false}
            />
          )}
        </ViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]} />
        </>
        )}
      </Container>

      {isInactive && (<InactiveAccountPopup isVisibleModel={isInactive} onClose={handleClose} />)}
      {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
      <PopupOrSheet ref={noteRef}
        height={s(500)}
        showCloseIcon={false}
      >
        <DynamicNotes info={selectedCard || ""} onSubmit={(value) => { handleSubmit(value) }} onClose={closeNoteRef} />
      </PopupOrSheet>
    </ViewComponent>
  );
};

export default ChooseCard;