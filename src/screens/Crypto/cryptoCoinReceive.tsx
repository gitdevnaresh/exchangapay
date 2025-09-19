import React, { useEffect, useState } from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { View, ScrollView, SafeAreaView, TouchableOpacity, Image, BackHandler, Dimensions } from 'react-native';
import { Container } from '../../components';
import { formatCurrency, isErrorDispaly } from '../../utils/helpers';
import { ms, s } from '../../constants/theme/scale';
import { NEW_COLOR } from '../../constants/theme/variables';
import Loadding from '../../components/skeleton';
import { sellCoinSelect } from './buySkeleton_views';
import Images from '../../assets/images';
import ErrorComponent from '../../components/Error';
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import TextInputField from '../../components/textInput';
import { commonStyles } from '../../components/CommonStyles';
import { useSelector } from 'react-redux';
import CryptoServices from '../../services/crypto';
import SvgFromUrl from '../../components/svgIcon';
import { useIsFocused } from '@react-navigation/native';
import NoDataComponent from '../../components/nodata';

const { width } = Dimensions.get('window');
const isPad = width > 600;

const CryptoCoinReceive = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const sellCoinSelectLoader = sellCoinSelect(12)
    const [receiveCoinsDataLoading, setReceiveCoinsDataLoading] = useState<boolean>(false);
    const [receiveCoinsData, setReceiveCoinsData] = useState<any>([]);
    const [receiveCoinsDataoriginal, setReceiveCoinsDataOriginal] = useState<any>([]);
    const [errormsg, setErrormsg] = useState(null);
    const isFocused = useIsFocused();
    useEffect(() => {
        getCryptoReceiveData();
    }, [isFocused]);

    const SearchBoxComponent = (
        <View>
            <View style={styles.searchContainer}>
                <TextInputField inputStyle={isPad ? commonStyles.fs16 : commonStyles.fs24} style={styles.borderNone} onChangeText={(val) => handleChangeSearch(val)} placeholder={'Search Asset'} />
                <View style={styles.blackCircle} ><AntDesign name="search1" size={16} color={NEW_COLOR.TEXT_BLACK} style={styles.searchIcon} /></View>
            </View>
        </View>
    );

    const handleChangeSearch = (e: any) => {
        let value = e
        if (value) {
            let filterData = receiveCoinsDataoriginal.filter((item: any) => {
                return item.walletCode?.toLowerCase().includes(e.toLowerCase())
            })
            setReceiveCoinsData([...filterData]);
        } else {
            setReceiveCoinsData([...receiveCoinsDataoriginal]);
        }
    };

    const getCryptoReceiveData = async () => {
        setReceiveCoinsDataLoading(true);
        const response: any = await CryptoServices.getCryptoReceive();
        if (response?.status === 200) {
            setReceiveCoinsData(response?.data);
            setReceiveCoinsDataOriginal(response?.data)
            setReceiveCoinsDataLoading(false);
            setErrormsg(null);
        }
        else {
            setErrormsg(isErrorDispaly(response));
            setReceiveCoinsDataLoading(false);
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
        props.navigation.push("Dashboard")
    };

    const handleBuyCryptoCoinSlct = (val: any) => {
        props.navigation.push("SendCryptoDetails", {
            walletCode: val?.walletCode
        })
    };
    const cryptoList: any = {
        BTC: Images?.coins.coinbtc,
        USDT: Images?.coins.coineusdt,
        ETH: Images?.coins.coineth,
        USDC: Images?.coins.coineusdc
    }

    return (

        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView>
                <Container style={[commonStyles.container, commonStyles.flex1]}>
                    <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb43]}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <TouchableOpacity style={[styles.pr16,]} onPress={handleGoBack}>
                                <View>
                                    <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                                </View>
                            </TouchableOpacity>
                            <ParagraphComponent text='Withdraw' style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                        </View>

                    </View>
                    {errormsg && <View style={commonStyles.mb16}><ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} /></View>}
                    <View style={commonStyles.mb16}>{SearchBoxComponent}</View>
                    {receiveCoinsDataLoading ? (
                        <Loadding contenthtml={sellCoinSelectLoader} />
                    ) : (
                        <>
                            {receiveCoinsData?.length > 0 &&
                                <View>
                                    {receiveCoinsData?.map((item: any, index: any) => {
                                        return (

                                            <View style={commonStyles.mt16}>
                                                <TouchableOpacity onPress={() => handleBuyCryptoCoinSlct(item)} activeOpacity={0.8} key={index}>
                                                    <View style={[commonStyles.dflex, styles.rowStyle, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                                        <View style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                            <View style={[styles.icon,]}>
                                                                {item.logo && <SvgFromUrl
                                                                    uri={item.logo}
                                                                    width={40}
                                                                    height={40}
                                                                />}
                                                                {!item.logo && <Image source={cryptoList[item?.walletCode]} style={{ width: 40, height: 40 }} />}
                                                            </View>
                                                            <View>
                                                                <ParagraphComponent text={item?.walletCode} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textBlack,]} />

                                                            </View>
                                                        </View>
                                                        <View>
                                                            <ParagraphComponent text={`${formatCurrency(item?.avilable || 0, 2)}`} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textRight, commonStyles.textBlack,]} />

                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>

                                        )
                                    })}
                                </View>
                            }
                            {receiveCoinsData?.length < 1 && <View>
                                <NoDataComponent />
                            </View>
                            }
                        </>
                    )}

                </Container>
            </ScrollView>
        </SafeAreaView>

    )
})

export default CryptoCoinReceive;

const themedStyles = StyleService.create({
    borderCircle: { borderRadius: 100, padding: 8, backgroundColor: NEW_COLOR.BG_PURPLERDARK },
    blackCircle: {
        flexDirection: 'row', alignItems: "center",
        backgroundColor: NEW_COLOR.BG_PURPLERDARK,
        borderRadius: 108, position: 'absolute',
        right: 12, textAlign: 'center', height: 36, width: 36, justifyContent: "center"
    },
    borderNone: { borderWidth: 0, width: '100%' },
    pr16: { paddingRight: 16, },
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
    rowStyle: {
        borderRadius: 16,
        padding: 12,
        backgroundColor: NEW_COLOR.MENU_CARD_BG
    },
    icon: {
        marginRight: 10,
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
})
