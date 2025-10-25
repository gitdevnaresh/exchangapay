import React, { useEffect, useState } from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { View, ScrollView, SafeAreaView, TouchableOpacity, Image, Platform, BackHandler, Dimensions } from 'react-native';
import { Container } from '../../../components';
import { text } from '../../../constants/theme/mixins';
import { isErrorDispaly } from '../../../utils/helpers';
import { ms, s, screenHeight } from '../../../constants/theme/scale';
import { NEW_COLOR, WINDOW_WIDTH } from '../../../constants/theme/variables';
import Loadding from '../../../components/skeleton';
import { sellCoinSelect } from '../buySkeleton_views';
import ErrorComponent from '../../../components/Error';
import Images from '../../../assets/images';
import ParagraphComponent from '../../../components/Paragraph/Paragraph';
import AntDesign from "react-native-vector-icons/AntDesign";
import TextInputField from '../../../components/textInput';
import { commonStyles } from '../../../components/CommonStyles';
import SendCryptoServices from '../../../services/sendcrypto';
import SvgFromUrl from '../../../components/svgIcon';
import NoDataComponent from '../../../components/nodata';
import { useIsFocused } from '@react-navigation/native';
const { width } = Dimensions.get('window');
const isPad = width > 600;
const SelectCryptoAsset = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const [cryptoCoinData, setCryptoCoinData] = useState<any>([]);
    const [sendCryptoPreList, setCryptoPreList] = useState<any>([]);
    const [walletDtaLoading, setWalletDataLoading] = useState(false);
    const [errormsg, setErrormsg] = useState<any>(null);
    const sellCoinSelectLoader = sellCoinSelect(10);
    const isFocused = useIsFocused();
    useEffect(() => {
        getCryptoWallets();
    }, [isFocused]);

    const SearchBoxComponent = (
        <View style={styles.searchBox}>
            <View style={styles.searchContainer}>

                <TextInputField inputStyle={isPad ? commonStyles.fs16 : commonStyles.fs24} style={styles.borderNone} onChangeText={(val) => handleChangeSearch(val)}
                    placeholder={'Search Asset'}
                />
                <View style={styles.blackCircle} ><AntDesign name="search1" size={s(16)} color={NEW_COLOR.TEXT_WHITE} style={styles.searchIcon} /></View>
            </View>
        </View>
    );

    const handleChangeSearch = (e: any) => {
        let value = e?.trime();
        if (value) {
            let filterData = sendCryptoPreList.filter((item: any) => {
                return item.walletCode?.toLowerCase().includes(e.toLowerCase())
            })
            setCryptoCoinData(filterData);
        } else {
            setCryptoCoinData(sendCryptoPreList);
        }
    };
    const groupByAlphabet = () => {
        const sortedData = cryptoCoinData.sort((a: any, b: any) => a.walletCode.localeCompare(b.walletCode));
        let groupedData: any = {};

        sortedData?.forEach(item => {
            const firstLetter = item.walletCode?.charAt(0).toUpperCase();
            if (!groupedData[firstLetter]) {
                groupedData[firstLetter] = [];
            }
            groupedData[firstLetter].push(item);
        });
        return Object.keys(groupedData).map(letter => (
            <View>
                {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}

                {groupedData[letter].map(item => (
                    <>
                        <View style={{ marginBottom: 12 }}>
                            <TouchableOpacity onPress={() => handleBuyCryptoCoinSlct(item)} activeOpacity={0.7}>
                                <View style={[commonStyles.dflex, styles.rowStyle, commonStyles.alignCenter]}>
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                        <View style={[styles.icon,]}>
                                            {item.logo && <SvgFromUrl
                                                uri={item.logo}
                                                width={40}
                                                height={40}
                                            />}

                                            {!item.logo && <Image source={cryptoList[item?.walletCode]} style={{ width: s(42), height: s(42) }} />}
                                        </View>
                                        <View>
                                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textBlack]} text={item?.walletCode} />
                                            {item?.walletName && <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textGrey]} text={item?.walletName} />}

                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </>
                )
                )}


            </View>
        ))
    };
    const getCryptoWallets = async () => {
        setWalletDataLoading(true);
        try {
            const response: any = await SendCryptoServices.getWithdrawCryptoCoinList();
            if (response?.status === 200) {
                setCryptoCoinData(response?.data);
                setCryptoPreList(response?.data);
                setWalletDataLoading(false);
                setErrormsg(null);
            } else {
                setErrormsg(isErrorDispaly(response));
                setWalletDataLoading(false);
            }
        } catch (error: any) {
            setErrormsg(isErrorDispaly(error));
            setWalletDataLoading(false);
        }

    };



    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleGoBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);

    const handleGoBack = () => {
        props?.navigation?.navigate("Dashboard", {
            screen: 'Home',
            animation: "slide_from_left"
        })
    };

    const handleBuyCryptoCoinSlct = (val: any) => {
        props.navigation.navigate("CryptoReceive", {
            cryptoCoin: val?.walletCode
        })
    };
    const cryptoList: any = {
        BTC: Images?.coins.coinbtc,
        USDT: Images?.coins.coineusdt,
        ETH: Images?.coins.coineth,
        USDC: Images?.coins.coineusdc,
        EUR: Images?.coins.coineusdc
    }

    return (
        <>
            <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
                <ScrollView>
                    <Container style={[commonStyles.container, commonStyles.flex1]}>

                        <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter,]}>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter,]}>
                                <TouchableOpacity style={[styles.pr16,]} onPress={handleGoBack} activeOpacity={0.7}>
                                    <View>
                                        <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                                    </View>
                                </TouchableOpacity>
                                <ParagraphComponent text='Crypto Deposit' style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                            </View>

                        </View>
                        {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}
                        <View style={styles.searchSpace}>{SearchBoxComponent}</View>

                        {walletDtaLoading ? (
                            <Loadding contenthtml={sellCoinSelectLoader} />
                        ) : (
                            <>


                                {groupByAlphabet()}
                                {(!cryptoCoinData || cryptoCoinData?.length < 1) && <><NoDataComponent /></>}
                            </>
                        )}

                    </Container>
                </ScrollView>
            </SafeAreaView>
        </>
    )
})

export default SelectCryptoAsset;

const themedStyles = StyleService.create({
    fw500: {
        fontWeight: "500"
    },
    textGrey: {
        color: NEW_COLOR.TEXT_GREY
    },
    mt26: {
        marginTop: 26,
    },
    mb28: { marginBottom: 28 },
    blackCircle: {
        flexDirection: 'row', alignItems: "center",
        backgroundColor: '#3F3356',
        borderRadius: 108, position: 'absolute',
        right: 12, textAlign: 'center', height: 36, width: 36, justifyContent: "center"
    },
    borderNone: { borderWidth: 0, width: '100%' },
    fs16: {
        fontSize: ms(16)
    },
    fs14: {
        fontSize: ms(14)
    },
    textBlack: {
        color: NEW_COLOR.TEXT_BLACK
    },
    fw800: {
        fontWeight: "800",
    },
    fw600: {
        fontWeight: "600",
    },
    fw400: {
        fontWeight: "400",
    },
    mb16: { marginBottom: 16 },
    px8: { paddingHorizontal: 8 },
    pr16: { paddingRight: 16, },
    fw700: { fontWeight: "700", color: NEW_COLOR.TEXT_BLACK },
    borderLight: { borderColor: NEW_COLOR.BORDER_LIGHT, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 16, borderWidth: 1, marginBottom: 16, width: (WINDOW_WIDTH * 27) / 100 },
    borderCircle: { borderRadius: 100, padding: 8, backgroundColor: '#382645' },
    justifyleft: {
        justifyContent: "flex-start",
        alignItems: "center",
    },
    container: {
        flex: 1, backgroundColor: NEW_COLOR.BACKGROUND_WHITE, padding: 24
    },
    dFlex: {
        flexDirection: "row", alignItems: 'center',
    },
    textRight: {
        textAlign: "right"
    },
    searchBox: {
        // paddingBottom: ms(12),
    },
    searchContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        flexDirection: 'row',
        paddingHorizontal: ms(10),
        borderRadius: 10,
        backgroundColor: NEW_COLOR.BG_BLACK,
        borderColor: NEW_COLOR.SEARCH_BORDER,
        borderWidth: 1,
        height: 64,
        borderStyle: 'dashed'
    },
    searchIcon: {
        color: NEW_COLOR.TEXT_BLACK,
    },
    searchInput: {
        ...text(14, 16.8, 400, NEW_COLOR.TEXT_LIGHT, true),
        position: 'relative', zIndex: 2, width: WINDOW_WIDTH - ms(25) - 35,
        paddingVertical: Platform.OS === 'android' ? 0 : 10, color: "#999999"
    },
    searchSpace: {
        marginTop: 36, marginBottom: 24
    },
    justifyContent: {
        justifyContent: "space-between"
    },
    recipientSubText: {
        fontSize: ms(18), fontWeight: "500", color: NEW_COLOR.TEXT_GREY, marginTop: 40, marginBottom: 25
    },
    rowStyle: {
        borderRadius: 16,
        padding: 12,
        backgroundColor: NEW_COLOR.MENU_CARD_BG
    },
    row: {
        flexDirection: "row"
    },
    icon: {
        marginRight: 10,
    },
    money: {
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: 16,
        fontWeight: "500",
    },
    cAccount: {
        justifyContent: "center", alignItems: "center",
    },
    custNodata: {
        marginTop: 22, marginBottom: 80
    },
    noData: {
        marginTop: 22
    },
    textRecipient: {
        fontSize: ms(18), fontWeight: "500", color: NEW_COLOR.TEXT_GREY
    },
    flex1: {
        flex: 1
    },
    loading: {
        paddingBottom: screenHeight * 0.15,
        paddingTop: ms(30),
    },
    coinIcon: {
        width: ms(36),
        height: ms(36),
    },
    alignItems: {
        flexDirection: "row",
        alignItems: "center",
    },

})
