import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, ImageBackground } from 'react-native';
import { useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { getThemedCommonStyles, statusColor } from '../../../../../../components/CommonStyles';
import { s } from '../../../../../../constants/styels/scale';
import FlatListComponent from '../../../../../../components/flatList/flatList';
import ScrollViewComponent from '../../../../../../components/scrollView/scrollView';
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
import TextMultiLanguage from '../../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { CurrencyText } from '../../../../../../components/textComponets/currencyText/currencyText';
import { FormattedDateText } from '../../../../../../components/textComponets/dateTimeText/dateTimeText';
import NoDataComponent from '../../../../../../components/noData/noData';
import { useLngTranslation } from '../../../../../../hooks/languagesHook/useLngTranslation';
import MemberInfoSection from '../../components/memberInfoSection';
import { useSelector } from 'react-redux';
import TransactionDetails from '../../../../../commonScreens/transactions/details';
import { ReceivedImages, Transactionwithdraw } from '../../../../../../assets/svg';
import { Card, Transaction, MemberCardsResponse, MemberTransactionsResponse, MemberDetailsResponse, TeamCardsViewNavigationProps, ReduxState, MemberDetails } from '../../utils/interfaces';
import { CARD_URIS } from '../../../../../../components/CommonStyles';
import { WINDOW_WIDTH } from '../../../../../../constants/styels/variables';
import { hideDigitBeforLast } from '../../../../../../utils/helpers';
import { AliaPay, PhonePay, ShopeeImage } from '../../../../../../assets/svg';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ImageUri from '../../../../../../components/imageComponents/image';
import { PAGINATION, UI, CARD_TYPES, STATUS, DECIMAL_PLACES, CURRENCY_TYPES, PLATFORMS, ANIMATION_VALUES } from '../../constants';
import KeyboardAvoidingWrapper from '../../../../../../components/keyboard/keyBoardAvoidingView';

const TeamCardsView: React.FC<TeamCardsViewNavigationProps> = (props) => {
  const CardWidth = (WINDOW_WIDTH * 20) / 100;
  const aspectRatio = 133 / 84.5;
  const CardHeight = CardWidth / aspectRatio;
  const [loading, setLoading] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<string>("");
  const [cardsList, setCardsList] = useState<Card[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [memberDetails, setMemberDetails] = useState<MemberDetails | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("");


  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { t } = useLngTranslation();
  const baseCurrency = useSelector((state: ReduxState) => state.userReducer?.userDetails?.currency);

  const memberId = props?.route?.params?.memberId;
  const memberData = props?.route?.params?.memberData;

  useEffect(() => {
    if (isFocused && memberId) {
      loadInitialData();
    }
  }, [isFocused, memberId]);


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

  const loadInitialData = async () => {
    setLoading(true);
    setErrormsg("");

    try {
      const [cardsResponse, transactionsResponse, detailsResponse] = await Promise.all([
        TeamsService.getMemberCards(memberId, undefined, 1, PAGINATION.SMALL_PAGE_SIZE),
        TeamsService.getMemberTransactions(memberId, STATUS.ALL, undefined, UI.EMPTY_STRING, UI.EMPTY_STRING, STATUS.ALL, 1, PAGINATION.SMALL_PAGE_SIZE),
        TeamsService.getMemberDetails(memberId)
      ]) as [MemberCardsResponse, MemberTransactionsResponse, MemberDetailsResponse];

      if (cardsResponse && cardsResponse.ok) {
        const data = cardsResponse.data?.data || [];
        setCardsList(data);
      } else {
        setErrormsg(isErrorDispaly(cardsResponse));
      }

      if (transactionsResponse && transactionsResponse.ok) {
        const transData = transactionsResponse.data?.data || [];
        setTransactionsList(transData.slice(0, PAGINATION.SMALL_PAGE_SIZE));
      } else {
        setErrormsg(isErrorDispaly(transactionsResponse));
      }

      if (detailsResponse && detailsResponse.ok) {
        setMemberDetails(detailsResponse.data);
      } else {
        setErrormsg(isErrorDispaly(detailsResponse));
      }

    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setLoading(false);
    }
  };

  const backArrowButtonHandler = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSeeAllPress = useCallback(() => {
    navigation.navigate('TeamCardsListView', {
      memberId: memberId,
      memberData: memberData,
      memberName: memberDetails?.fullName || memberData?.fullName || t('GLOBAL_CONSTANTS.TEAMS')
    });
  }, [navigation, memberId, memberData, memberDetails?.fullName, t]);

  const handleCardPress = useCallback((card: Card) => {
    navigation.navigate('CardDetailView', {
      cardId: card.id,
      cardData: card,
      memberId: memberId,
      memberData: memberData
    });
  }, [navigation, memberId, memberData]);

  const handleSeeAllTransactions = useCallback(() => {
    navigation.navigate('TeamTransactionsListView', {
      memberId: memberId,
      memberData: memberData,
      memberDetails: memberDetails
    });
  }, [navigation, memberId, memberData, memberDetails]);

  const handleTransactionPress = useCallback((transaction: Transaction) => {
    setSelectedTransactionId(transaction?.id);
    setModalVisible(true);
  }, []);

  const renderCardItem = ({ item }: { item: Card }) => {
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
                  {item?.name?.toLowerCase()?.replaceAll(UI.SPACE_CHAR, UI.EMPTY_STRING) == CARD_TYPES.ABC_VIRTUAL_CARD ?
                    <ImageUri width={s(18)} height={s(10)} uri={CARD_URIS.rapiz} />
                    : <ImageUri width={s(18)} height={s(10)} uri={CARD_URIS.rapiz} />
                  }
                </ViewComponent>
                
                <ViewComponent style={{ marginTop: "auto" }}>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyend]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                      {item?.name?.toLowerCase()?.replaceAll(UI.SPACE_CHAR, UI.EMPTY_STRING) == CARD_TYPES.ABC_VIRTUAL_CARD ? 
                        <ImageUri width={s(18.5)} height={s(6)} uri={CARD_URIS.visa} />
                        : <ImageUri width={s(18.5)} height={s(6)} uri={CARD_URIS.visa} />
                      }
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
              <PhonePay height={s(20)} width={s(20)} />
              <AliaPay height={s(20)} width={s(20)} />
              <ShopeeImage height={s(20)} width={s(20)} />
              <MaterialIcons name={"keyboard-arrow-right"} size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    );
  };

  const TransactionListItemSeparator = React.memo(({ commonStyles }: { commonStyles: any }) => (
    <ViewComponent style={[commonStyles.transactionsListGap]} />
  ));

  const createItemSeparator = (commonStyles: any) => () => (
    <TransactionListItemSeparator commonStyles={commonStyles} />
  );

  const itemSeparator = createItemSeparator(commonStyles);

  const iconsList = {
    buy: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(30), height: s(30), borderRadius: s(30) / 2 }]}>
      <ViewComponent>
        <Transactionwithdraw width={s(14)} height={s(14)} />
      </ViewComponent>
    </ViewComponent>,
    withdraw: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(30), height: s(30), borderRadius: s(30) / 2 }]}>
      <ViewComponent>
        <Transactionwithdraw width={s(14)} height={s(14)} />
      </ViewComponent>
    </ViewComponent>,
    deposit: <ViewComponent style={[commonStyles.bgdeposist, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(30), height: s(30), borderRadius: s(30) / 2 }]}>
      <ViewComponent>
        <ReceivedImages width={s(14)} height={s(14)} />
      </ViewComponent>
    </ViewComponent>,
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const txType = item.txType || item.type || "";
    const amount = item?.amount || 0;
    const state = item?.state;
    const decimalPlaces = item?.isFiatOrCrypto?.toLowerCase() == CURRENCY_TYPES.CRYPTO ? DECIMAL_PLACES.CRYPTO : DECIMAL_PLACES.FIAT
    return (
      <CommonTouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleTransactionPress(item)}
        style={[commonStyles.cardsbannerbg]}
      >
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
          <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
            <ViewComponent style={[{ minHeight: s(30), minWidth: s(30) }]}>
              {iconsList[(txType?.toLowerCase()?.replaceAll(UI.SPACE_CHAR, UI.EMPTY_STRING) || item?.type?.toLowerCase()?.replaceAll(UI.SPACE_CHAR, UI.EMPTY_STRING)) as keyof typeof iconsList]}
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1, commonStyles.gap6]}>
              <ViewComponent>
                <ParagraphComponent text={item?.vaultOrCardName || ""} numberOfLines={1} style={[commonStyles.primarytext]} />
                <ParagraphComponent text={txType || ""} numberOfLines={1} style={[commonStyles.secondarytext]} />
                <FormattedDateText value={item?.date} style={[commonStyles.secondarytext]} conversionType='UTC-to-local' />
              </ViewComponent>
              <ViewComponent>
                <CurrencyText value={amount} currency={item?.wallet} style={[commonStyles.primarytext, commonStyles.textRight]} decimalPlaces={decimalPlaces} />
                <ParagraphComponent text={state} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textRight, { color: statusColor[state?.toLowerCase()] || NEW_COLOR.TEXT_GREEN }]} />
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        <DashboardLoader />
      </SafeAreaViewComponent>
    );
  }
  return (
    <KeyboardAvoidingWrapper>
      <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        <Container style={commonStyles.container}>
          <PageHeader
            title={"GLOBAL_CONSTANTS.MEMBER_PRIFILE"}
            onBackPress={backArrowButtonHandler}
          />

          {errormsg !== "" && (
            <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />
          )}

          <ScrollViewComponent showsVerticalScrollIndicator={false}>
            {/* Member Info Section */}
            <MemberInfoSection
              memberDetails={memberDetails || undefined}
              memberData={memberData}
            />

            {/* Cards Section */}
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
              <TextMultiLanguage
                style={[commonStyles.sectionTitle]}
                text="GLOBAL_CONSTANTS.CARDS"
              />
              {cardsList.length > 0 && (
                <CommonTouchableOpacity onPress={handleSeeAllPress}>
                  <TextMultiLanguage
                    style={[commonStyles.sectionLink]}
                    text="GLOBAL_CONSTANTS.SEE_ALL"
                  />
                </CommonTouchableOpacity>
              )}
            </ViewComponent>

            <FlatListComponent
              data={cardsList}
              ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.listGap]} />}
              extraData={cardsList.length}
              keyExtractor={(item: Card) => item.id}
              renderItem={renderCardItem}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              ListEmptyComponent={
                !loading ? (
                  <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt20]}>
                    <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
                  </ViewComponent>
                ) : null
              }
            />
            <ViewComponent style={[commonStyles.sectionGap]} />

            {/* Transactions Section */}
            <ViewComponent style={[commonStyles.sectionGap]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                <TextMultiLanguage
                  style={[commonStyles.sectionTitle]}
                  text="GLOBAL_CONSTANTS.TRANSACTIONS"
                />
                {transactionsList.length > 0 && (
                  <CommonTouchableOpacity onPress={handleSeeAllTransactions}>
                    <TextMultiLanguage
                      style={[commonStyles.sectionLink]}
                      text="GLOBAL_CONSTANTS.SEE_ALL"
                    />
                  </CommonTouchableOpacity>
                )}
              </ViewComponent>

              <FlatListComponent
                data={transactionsList}
                extraData={transactionsList.length}
                keyExtractor={(item: Transaction) => item.id}
                ItemSeparatorComponent={itemSeparator}
                renderItem={renderTransactionItem}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                ListEmptyComponent={
                  !loading ? (
                    <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt20]}>
                      <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
                    </ViewComponent>
                  ) : null
                }
              />
            </ViewComponent>

          </ScrollViewComponent>
        </Container>

        {modalVisible && (
          <TransactionDetails
            modalVisible={modalVisible}
            transactionId={selectedTransactionId}
            closePopUp={() => setModalVisible(false)}
            accountType="TeamMemberTransactions"
          />
        )}
      </ViewComponent>
    </KeyboardAvoidingWrapper>
  );
};

export default TeamCardsView;
