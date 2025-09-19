
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, Image, ScrollView, BackHandler } from 'react-native';
import { getAllTopCards } from '../../store/card/thunk';
import { isErrorDispaly } from '../../utils/helpers';
import { Container } from '../../components';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import AntDesign from "react-native-vector-icons/AntDesign";
import { NEW_COLOR } from '../../constants/theme/variables';
import { commonStyles } from "../../components/CommonStyles";
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import "moment-timezone";
import ErrorComponent from '../../components/Error';
import Loadding from '../../components/skeleton';
import { sellCoinSelect } from '../Crypto/buySkeleton_views';
import NoDataComponent from '../../components/nodata';

const AllNewCards = (props: any) => {
    const styles = useStyleSheet(themedStyles);
    const [cardsLoading, setCardsLoading] = useState(false);
    const [errormsg, setErrormsg] = useState("");
    const [myCardsData, setMyCardsData] = useState<any>([]);
    const CardListLoader = sellCoinSelect(10)

    useEffect(() => {
        fetchAllTopCards(pageSize);
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

    const fetchAllTopCards = async (pageSize: number) => {
        const pageNo = 1;
        try {
            setCardsLoading(true);
            const response: any = await getAllTopCards(pageSize, pageNo);
            if (response && response.data && Array.isArray(response.data)) {
                setMyCardsData(response.data);
                setErrormsg('');
            } else {
                setErrormsg("Invalid data received");
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setCardsLoading(false);
        }
    };

    const handleApplyCardById = (val: any) => {
        props.navigation.push("ApplyCard", {
            cardId: val?.id,
            logo: val?.logo,
            isCardBlock: val?.isCardBlock,
        });
    };
    const handleCloseError = () => {
        setErrormsg("");
    };
    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView >
                <Container style={[commonStyles.container]} >

                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                        <TouchableOpacity style={[]} onPress={() => handleBack()} >
                            <View>
                                <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                            </View>
                        </TouchableOpacity>
                        <ParagraphComponent text="All New Cards" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                    </View>
                    {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                    <View style={[commonStyles.mb43]} />
                    {cardsLoading ? (
                        <Loadding contenthtml={CardListLoader} />
                    ) : (<>{myCardsData.length > 0 &&
                        <View>
                            {myCardsData.map((item: any, i: any) => {
                                return (
                                    <View style={[styles.sectionStyle, commonStyles.mb16]} key={i}>
                                        <TouchableOpacity onPress={() => handleApplyCardById(item)} activeOpacity={0.8}>
                                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12,]}>

                                                <View style={[commonStyles.relative, { marginRight: 20 }]}>

                                                    <Image style={[styles.cardRotate]} source={{ uri: item?.logo }} />
                                                </View>
                                                <View style={commonStyles.flex1}>
                                                    <ParagraphComponent style={[commonStyles.textBlack, commonStyles.fs16, commonStyles.fw700, commonStyles.mb4]} text={item?.name} numberOfLines={1} />
                                                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey, commonStyles.mb4]} text={`${item?.supportedFlatforms || " "}`} numberOfLines={1} />
                                                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey]} text={item?.status} numberOfLines={1} />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                );
                            })}
                        </View>}
                        {myCardsData?.length < 0 &&
                            <NoDataComponent Description={"No data available"} />
                        }
                    </>
                    )}
                </Container>
            </ScrollView>
        </SafeAreaView>

    );
};
export default AllNewCards;
const themedStyles = StyleService.create({
    sectionStyle: {
        borderRadius: 16,
        padding: 14, backgroundColor: NEW_COLOR.MENU_CARD_BG
    },
    rebate: {
        backgroundColor: NEW_COLOR.BTN_PINK, color: NEW_COLOR.TEXT_WHITE, paddingHorizontal: 2, paddingVertical: 1, borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 10, transform: [{ rotate: '-90deg' }], position: 'absolute',
        right: -3,
        bottom: "65%",
    },
    noData: {
        fontSize: 16, fontWeight: "400", color: NEW_COLOR.TEXT_GREY, marginTop: 22
    },
    textGrey: {
        color: NEW_COLOR.TEXT_GREY
    },
    cardSmall: {
        height: "100%",
        width: "100%",
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

    },
});
