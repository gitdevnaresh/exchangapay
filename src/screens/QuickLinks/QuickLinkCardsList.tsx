
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, ScrollView, BackHandler, Image } from 'react-native';
import { isErrorDispaly } from '../../utils/helpers';
import { Container } from '../../components';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import AntDesign from "react-native-vector-icons/AntDesign";
import { NEW_COLOR } from '../../constants/theme/variables';
import { commonStyles } from "../../components/CommonStyles";
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import "moment-timezone";
import Loadding from '../../components/skeleton';
import { sellCoinSelect } from '../Crypto/buySkeleton_views';
import ErrorComponent from '../../components/Error';
import CardsModuleService from '../../services/card';
import NoDataComponent from '../../components/nodata';
import { useIsFocused } from '@react-navigation/native';
import { s } from '../../constants/theme/scale';

const QuickCardsList = (props: any) => {
    const styles = useStyleSheet(themedStyles);
    const [cardsLoading, setCardsLoading] = useState(false);
    const [errormsg, setErrormsg] = useState("");
    const [cardsList, setMyCardsData] = useState<any>([]);
    const CardListLoader = sellCoinSelect(10);
    const isFocused = useIsFocused();
    useEffect(() => {
        getCardsList();
    }, [isFocused]);
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

    const getCardsList = async () => {
        try {
            setCardsLoading(true);
            const response: any = await CardsModuleService?.getWalletCards();
            if (response?.ok) {
                setMyCardsData(response?.data)
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

    const handleGetCardsById = (value: any) => {
        props.navigation.push("QuickcardLink", {
            cardName: value?.cardName,
            cardId: value?.id,
            kycRequiredWhileApplyCard: value?.kycRequiredWhileApplyCard,
            envelopeNoRequired: value.envelopeNoRequired,
        })
    };

    const handleCloseError = () => {
        setErrormsg('')
    };
    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView >
                <Container style={[commonStyles.container]} >
                    {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                        <TouchableOpacity style={[]} onPress={handleBack} >
                            <View>
                                <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                            </View>
                        </TouchableOpacity>
                        <ParagraphComponent text="Select Card" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                    </View>

                    <View style={[commonStyles.mb43]} />
                    {cardsLoading &&
                        <Loadding contenthtml={CardListLoader} />}
                    {cardsList?.length > 0 &&
                        <View style={[styles.sectionStyle]}>

                            {cardsList?.map((item: any, index: any) => (
                                <>
                                    <TouchableOpacity onPress={() => { handleGetCardsById(item) }} activeOpacity={0.8} >
                                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12,]}>
                                            <View style={[commonStyles.relative,]}>
                                                <Image style={[styles.cardRotate]} source={{ uri: item?.logo }} />
                                            </View>

                                            <View style={commonStyles.flex1}>
                                                <ParagraphComponent style={[commonStyles.textBlack, commonStyles.fs14, commonStyles.fw600, commonStyles.mb4]} text={item?.cardName} numberOfLines={1} />
                                                <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw500, { color: item?.status === "Approved" ? NEW_COLOR.TEXT_GREEN : NEW_COLOR.TEXT_YELLOW }]} text={item?.status} numberOfLines={1} />
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    {index !== cardsList?.length - 1 && <View style={[commonStyles.hLine, { marginVertical: 12 }]} />}

                                </>


                            ))}

                        </View>
                    }
                    {!cardsLoading && cardsList?.length < 1 && <View>
                        <NoDataComponent Description={"NO DATA"} />
                    </View>}


                </Container>
            </ScrollView>
        </SafeAreaView>
    );
};


export default QuickCardsList;
const themedStyles = StyleService.create({
    sectionStyle: {
        borderRadius: 16,
        padding: 14,
        backgroundColor: NEW_COLOR.MENU_CARD_BG
    },
    rebate: {
        backgroundColor: NEW_COLOR.BTN_PINK, color: NEW_COLOR.TEXT_WHITE, paddingHorizontal: 2, paddingVertical: 1, borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 10, transform: [{ rotate: '-90deg' }], position: 'absolute',
        right: -3,
        bottom: "65%",
    },
    textGrey: {
        color: NEW_COLOR.TEXT_GREY
    },
    cardSmall: {
        borderRadius: 12,
    },
    noData: {
        fontSize: 16, fontWeight: "400", color: NEW_COLOR.TEXT_GREY, marginTop: 22
    },
    cardBorder: {
        borderWidth: 1,
        borderColor: NEW_COLOR.BORDER_LIGHT,
        borderRadius: 12, padding: 8,
    },
    mb16: {
        marginBottom: 16,
    },
    arrowRotate: {
        transform: [{ rotate: "45deg" }]
    },
    mt14: {
        marginTop: 14
    },
    mb24: {
        marginBottom: 24,
    },

    custNodata: {
        marginTop: 22,
        marginBottom: 80,
    },
    cAccount: {
        justifyContent: "center",
        alignItems: "center",
    },
    darkCircle: {
        backgroundColor: NEW_COLOR.DARK_BG,
        height: 50, width: 50, borderRadius: 50 / 2
    },
    cardRotate: {
        height: 30,
        width: 50, borderRadius: 8,
        // transform: [{ rotate: "8deg" }],
        // position:"absolute",top:"23%",left:"35%"
    },
});