import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, ImageBackground, BackHandler, Image } from 'react-native';
import {useDispatch, useSelector } from 'react-redux';
import { WINDOW_WIDTH } from '../../../../../constants/styels/variables';
import { CARD_URIS, getThemedCommonStyles, statusColor } from "../../../../../components/CommonStyles";
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import NoDataComponent from '../../../../../components/noData/noData';
import { hideDigitBeforLast, isErrorDispaly } from '../../../../../utils/helpers';
import CardsModuleService from '../../../../../apiServices/cards';
import { FlatList } from 'react-native-gesture-handler';
import { useIsFocused } from '@react-navigation/native';
import Container from '../../../../../components/container/container';
import OriginalMaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; // Renamed original import
import { IconProps } from "react-native-vector-icons/Icon";
import { s } from '../../../../../components/theme/scale';
import { addNewAllCardsSk } from '../../skeltons';
import { CardList } from '../../interface';
import Loadding from '../../../../../components/skelton/skeltons';
import { BIND_CARD_CONSTANTS, CARDS_CONST, statusIconMap } from '../../dashoard/constants';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../components/view/view';
import ImageUri from '../../../../../components/imageComponents/image';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import DashboardLoader from "../../../../../components/loader";
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import { iconsList } from '../../dashoard/cardsInfoConfig';
import ReferralsIcon from '../../../../../components/svgIcons/mainmenuicons/referrals';
import SvgFromUrl from '../../../../../components/svgIcon';
import { setCardHolderStatusId } from '../../../../../redux/actions/actions';

const MaterialCommunityIcons = OriginalMaterialCommunityIcons as unknown as React.ComponentType<IconProps>;

const AllCardsList = (props: any) => {
    const CardWidth = (WINDOW_WIDTH * 20) / 100;
    const aspectRatio = 133 / 84.5;
    const CardHeight = CardWidth / aspectRatio;
    const styles = useStyleSheet(themedStyles);
    const isFocused = useIsFocused();
    const [page, setPage] = useState(1);
    const [cardsLoading, setCardsLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const [myCardsData, setMyCardsData] = useState<CardList[]>([]);
    const [allDataLoaded, setAllDataLoaded] = useState<boolean>(false);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const CardsListLoader = addNewAllCardsSk(8);
    const [isChecked, setIsChecked] = useState<boolean>(false)
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [isEmployeeStatus, setIsEmployeeStatus] = useState(true);
    const dispatch = useDispatch();
    useEffect(() => {
        if (page == 1) {
            fetchAllTopupCards();
        } else {
            setPage(1);
        }
    }, [isFocused]);
    const handleReload = () => {
        fetchAllTopupCards();
    }
    useEffect(() => {
        fetchAllTopupCards(1);
    }, [isChecked]);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);

    const handleBack = useCallback(() => {
        props.navigation.goBack();
    }, []);

    const handleCheckBox = () => {
        setIsChecked(!isChecked)
    }
    const fetchAllTopupCards = async (pages?: any) => {
        const pageSize = 10;
        const pageNo = pages ?? page;
        const excludeAssigned = isChecked;
        try {
            let response
            setCardsLoading(true);
            if (props?.route?.params?.type == "MyCards") {
                response = await CardsModuleService.getAllMyCards(userInfo?.accountType, pageSize, pageNo, excludeAssigned);
            }
            if (response && Array.isArray(response.data)) {
                if (response.data.length > 0) {
                    setMyCardsData(response.data);
                    setPage(prevPage => prevPage + 1);
                    setErrormsg('');
                    setAllDataLoaded(true);
                }
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setCardsLoading(false);
        }
    };

    const renderFooter = () => {
        if (!cardsLoading) return null;
        return (
            <Loadding contenthtml={CardsListLoader} />
        );
    };
    const loadMoreData = () => {
        if (!cardsLoading && !allDataLoaded) {
            fetchAllTopupCards();
        }
    };
    const handleApplyCardById = (val: any) => {
        const isDoubleStep = val?.cardProcessType?.toLowerCase() === "doublestep";
        const status = val?.status?.toLowerCase();
        const cardHolderStatus = val?.cardHolderStatus?.toLowerCase();
        const baseParams = {
            cardId: val?.programId,
            cardType: val?.type,
            cardName: val?.cardName,
            cardHolderStatus: val?.cardHolderStatus,
            currency: val?.currency || val?.cardCurrency,
            logo: val?.image,
            cardProcessType: val?.cardProcessType,

        };

        if (isDoubleStep && status === "underreview" && cardHolderStatus === "approved") {
            dispatch(setCardHolderStatusId(val?.id));
            props?.navigation.navigate("ApplyCard", baseParams);
        } else if (isDoubleStep && status === "rejected" && cardHolderStatus === "rejected") {
            dispatch(setCardHolderStatusId(val?.id));
            props?.navigation.navigate("CardSetupStatus", baseParams);
        } else if (isDoubleStep && status === "underreview" && cardHolderStatus === "pending") {
            dispatch(setCardHolderStatusId(val?.id));
            props?.navigation.navigate("CardSetupStatus", baseParams);
        } else if (val?.employeeStatus) {
            props?.navigation.navigate("getMyCard", {
                cardId: val?.id,
                cardType: val?.type,
                actionType: "getCard"
            });
        } else {
            props?.navigation.navigate("CardsInfo", {
                cardId: val?.id,
                cardType: props?.route?.params?.type
            });
        }
    };
    const handleCloseError = useCallback(() => {
        setErrormsg("")
    }, [])
    const noData = () => {
        if (!cardsLoading && myCardsData?.length <= 0) {
            return <NoDataComponent />
        }
        return null;

    }

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {cardsLoading && <DashboardLoader />}
            {!cardsLoading && <Container style={[commonStyles.container]} >
                <PageHeader title={props?.route?.params?.type == CARDS_CONST.MYCARDS_ ? "GLOBAL_CONSTANTS.MY_CARDS" : "GLOBAL_CONSTANTS.ASSIGN_CARDS"} onBackPress={() => handleBack()} isrefresh={true} onRefresh={handleReload} />
                <ViewComponent>
                    {errormsg !== "" && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                    <View>
                        {(userInfo?.accountType == CARDS_CONST.BUSINESS && props?.route?.params?.type == CARDS_CONST.MYCARDS_) && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyend, commonStyles.titleSectionGap]}>
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.EXCLUDE_ASSIGNED"}
                                style={[commonStyles.listprimarytext]} />
                            <MaterialCommunityIcons
                                name={isChecked === true ? "checkbox-outline" : "checkbox-blank-outline"}
                                color={isChecked === true ? NEW_COLOR.BUTTON_TEXT : NEW_COLOR.CHECK_BOXSTROKE}
                                size={s(18)}
                                onPress={handleCheckBox}
                            />
                        </ViewComponent>}
                        {!cardsLoading && myCardsData.length > 0 &&

                            <FlatList
                                data={myCardsData}
                                contentContainerStyle={{ paddingBottom: s(180) }}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item, index }: any) => (<>
                                    <TouchableOpacity onPress={() => handleApplyCardById(item)} activeOpacity={0.8}>
                                        <ViewComponent style={[commonStyles.cardslistbg, commonStyles.p10,]}>


                                            <View style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap16,]}>

                                                {item?.image?.toLowerCase().endsWith('.svg') ? (
                                                    <SvgFromUrl
                                                        uri={item?.image}
                                                        width={CardWidth}
                                                        height={CardHeight}
                                                        style={[styles.cardSmall, { width: CardWidth, height: CardHeight }, commonStyles.cardslistradius]}
                                                    >
                                                        <View style={[commonStyles.p8, commonStyles.flex1]}>
                                                            {/* ...children... */}
                                                        </View>
                                                    </SvgFromUrl>
                                                ) : (
                                                    <ImageBackground
                                                        source={{ uri: item?.image }}
                                                        resizeMode="cover"
                                                        style={[styles.cardSmall, { width: CardWidth, height: CardHeight }]}
                                                        imageStyle={[commonStyles.cardslistradius]}
                                                    >
                                                        <View style={[commonStyles.p8, commonStyles.flex1]}>
                                                            {/* <ViewComponent style={[commonStyles.dflex, commonStyles.p4]}>
                                                            {item?.cardName?.toLowerCase()?.replaceAll(" ", "") == 'abcvirtualcard' ?
                                                                <ImageUri width={s(18)} height={s(10)} uri={CARD_URIS.rapizdark} />
                                                                : <ImageUri width={s(18)} height={s(10)} uri={CARD_URIS.rapizdark} />
                                                            }
                                                        </ViewComponent>

                                                        <View style={{ marginTop: "auto", }}>
                                                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyend, commonStyles.p4]}>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                                                                    {item?.cardName?.toLowerCase()?.replaceAll(" ", "") == 'abcvirtualcard' ? <ImageUri width={s(18.5)} height={s(6)} uri='https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/cardvisalogo.svg' />
                                                                        : <ImageUri width={s(18.5)} height={s(6)} uri='https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/card_visa_logo.svg' />
                                                                    }
                                                                </ViewComponent>
                                                            </View>
                                                        </View> */}
                                                        </View>
                                                    </ImageBackground>
                                                )}

                                                <View style={commonStyles.flex1}>
                                                    <ParagraphComponent style={[commonStyles.primarytext]} text={item?.cardName ?? ""} numberOfLines={1} />
                                                    <ParagraphComponent style={[commonStyles.secondparatext]}
                                                        text={item?.number === null && BIND_CARD_CONSTANTS.BIND_CARD_NULL || hideDigitBeforLast(item?.number)} numberOfLines={1} />
                                                    {props?.route?.params?.type !== CARDS_CONST.MYCARDS_ && <ParagraphComponent style={[commonStyles.secondparatext]} text={item?.assignedTo ?? ""} numberOfLines={1} />}
                                                </View>
                                                <ViewComponent>
                                                    {item?.status && (
                                                        <View >
                                                            <ParagraphComponent
                                                                text={statusIconMap[item?.status?.toLowerCase()]} style={[commonStyles.colorstatus, commonStyles.textRight, { color: statusColor[item?.status?.toLowerCase()] },
                                                                ]}
                                                                numberOfLines={1}
                                                            />
                                                        </View>
                                                    )}

                                                </ViewComponent>

                                            </View>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.mt12]}>
                                                <ParagraphComponent text={'GLOBAL_CONSTANTS.BALANCE'} style={[commonStyles.listsecondarytext]} />
                                                <CurrencyText value={item?.amount} currency={item?.currency} style={[commonStyles.listprimarytext]} />

                                            </ViewComponent>

                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mt16]}>
                                                <ParagraphComponent text={'GLOBAL_CONSTANTS.SUPPORTED_PLATFORM'} style={[commonStyles.listsecondarytext]} />
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6, commonStyles.justifyend,]}>

                                                    {item?.platforms?.split(',')?.map((platform: string) => {
                                                        const platformKey = platform?.toLowerCase().trim();
                                                        const icon = iconsList[platformKey];
                                                        return icon ? <ViewComponent key={platformKey}>{React.cloneElement(icon, { height: s(20), width: s(20) })}</ViewComponent> : <ReferralsIcon />;
                                                    })}
                                                </ViewComponent>

                                            </ViewComponent>
                                        </ViewComponent>
                                    </TouchableOpacity>

                                    {index !== myCardsData.length - 1 && (
                                        <View style={[commonStyles.transactionsListGap]} />
                                    )}
                                </>)}
                                keyExtractor={(item, idx) => item.number ? item?.number : idx.toString()}
                                onEndReached={() => loadMoreData()}
                                onEndReachedThreshold={0.1}
                                ListFooterComponent={renderFooter}
                                ListEmptyComponent={noData}
                            />
                        }
                    </View>
                    {!cardsLoading && myCardsData?.length < 1 && <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_CARDS_AVAILABLE"} />}

                </ViewComponent>
            </Container>}
        </ViewComponent>
    );
};
export default AllCardsList;
const themedStyles = StyleService.create({
    cardSmall: {
        height: "100%",
        width: "100%",
    },
});

