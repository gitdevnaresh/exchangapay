
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, ScrollView, Image, BackHandler } from 'react-native';
import { isErrorDispaly } from '../../utils/helpers';
import { Container } from '../../components';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import AntDesign from "react-native-vector-icons/AntDesign";
import { NEW_COLOR } from '../../constants/theme/variables';
import { commonStyles } from "../../components/CommonStyles";
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import Loadding from '../../components/skeleton';
import { sellCoinSelect } from '../Crypto/buySkeleton_views';
import ErrorComponent from '../../components/Error';
import CardsModuleService from '../../services/card';
import NoDataComponent from '../../components/nodata';
import { ChevronRight } from '../../assets/svg';

const ViewallMyCards = (props: any) => {
    const styles = useStyleSheet(themedStyles);
    const [cardsLoading, setCardsLoading] = useState(false);
    const [errormsg, setErrormsg] = useState("");
    const [myCardsData, setMyCardsData] = useState<any>([]);
    const CardListLoader = sellCoinSelect(10);
    useEffect(() => {
        fetchMyCards(pageSize);
    }, []);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);

    const handleBack = () => {
        props.navigation.goBack()
    };
    const pageSize = 50;

    const fetchMyCards = async (pageSize: number) => {
        const pageNo = 1;
        try {
            setCardsLoading(true);
            const response: any = await CardsModuleService?.getAllMycards(pageSize, pageNo);
            if (response?.ok) {
                setMyCardsData(response?.data);
                setErrormsg('');
                setCardsLoading(false);
            } else {
                setErrormsg(isErrorDispaly(response));
                setCardsLoading(false);
            }

        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setCardsLoading(false);
        }
    };

    const handleGetCardsById = (val: any) => {
        if (val.status === 'Pending') {
            props.navigation.push("CardSuccess", {
                cardId: val?.id
            });
        } else if (val.status === 'Reviewing') {
            props.navigation.push("ApplicatoionReview", {
                cardId: val?.id
            })
        }
        else {
            props.navigation.push("CardDetails", {
                cardId: val?.id,
                isCardBlock: val?.isCardBlock,
            });
        }
    };
    const StatusColors = {
        approved: NEW_COLOR.BG_GREEN,
        suspended: NEW_COLOR.BG_RED,
        pending: NEW_COLOR.BG_YELLOW,
        rejected: NEW_COLOR.BG_RED,
        cancelled: NEW_COLOR.BG_RED,
        freezed: NEW_COLOR.TEXT_GREY,
        failed: NEW_COLOR.BG_RED,
        unfreezed: NEW_COLOR.BG_GREEN,
        "freeze pending": NEW_COLOR.BG_YELLOW,
        "unfreeze pending": NEW_COLOR.BG_YELLOW,
        "under maintenance": NEW_COLOR.TEXT_ORANGE,
        "reviewing": NEW_COLOR.TEXT_ORANGE,
    };
    const handleCloseError = () => {
        setErrormsg("");
    };


    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView >
                <Container style={[commonStyles.container]} >
                    {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                        <TouchableOpacity style={[]} onPress={handleBack} >
                            <View>
                                <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                            </View>
                        </TouchableOpacity>
                        <ParagraphComponent text="All My Cards" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                    </View>
                    <View style={[commonStyles.mb43]} />
                    {cardsLoading && (
                        <Loadding contenthtml={CardListLoader} />)}
                    {!cardsLoading && <>{myCardsData?.length > 0 &&
                        <View >
                            {myCardsData?.map((item: any, i: any) => {
                                return (<>
                                    <TouchableOpacity style={[styles.sectionStyle, commonStyles.relative, { paddingTop: 22 }]} onPress={() => handleGetCardsById(item)} activeOpacity={0.8} >
                                        <View key={i} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.flex1]}>
                                            <View style={[commonStyles.relative, { marginRight: 6 }]}>
                                                <Image style={[styles.cardRotate]} source={{ uri: item?.logo }} />
                                            </View>
                                            <View style={commonStyles.flex1}>
                                                <ParagraphComponent style={[commonStyles.textBlack, commonStyles.fs14, commonStyles.fw600, commonStyles.mb8]} text={`${item?.cardName}`} numberOfLines={1} />
                                                <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey, commonStyles.mb8]} text={` ${item?.supportedFlatforms || ''}`} numberOfLines={1} />
                                            </View>
                                            <ChevronRight />
                                        </View>
                                        <View style={[styles.badgeStyle, { backgroundColor: StatusColors[item?.status?.toLowerCase()] || NEW_COLOR.BG_CANCEL }]}>
                                            <ParagraphComponent style={[commonStyles.fw600, commonStyles.textAlwaysWhite, commonStyles?.toCapitalize, { marginBottom: 2, fontSize: 8 }]} text={item?.status} />
                                        </View>
                                    </TouchableOpacity>
                                    <View style={[{ marginVertical: 6 }]} />
                                </>
                                );
                            })}
                        </View>}
                        {myCardsData?.length < 1 && <View>
                            <NoDataComponent Description={"No data available"} />
                        </View>}
                    </>
                    }
                </Container>
            </ScrollView>
        </SafeAreaView>
    );
};


export default ViewallMyCards;
const themedStyles = StyleService.create({
    sectionStyle: {
        borderRadius: 16,
        padding: 14,
        backgroundColor: NEW_COLOR.MENU_CARD_BG
    },
    badgeStyle: {
        position: "absolute", top: 0, right: 20, paddingVertical: 2, paddingHorizontal: 12,
        borderBottomEndRadius: 12, borderBottomStartRadius: 12,
    },
    textGrey: {
        color: NEW_COLOR.TEXT_GREY
    },
    cardRotate: {
        height: 30,
        width: 50, borderRadius: 8,
    },
});