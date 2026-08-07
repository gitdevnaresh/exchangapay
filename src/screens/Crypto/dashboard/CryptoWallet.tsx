import React, { useCallback, useEffect, useState } from 'react';
import { View, SafeAreaView, FlatList, TouchableOpacity, Image, BackHandler } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container } from '../../../components';
import { NEW_COLOR } from '../../../constants/theme/variables';
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from '../../../components/Paragraph/Paragraph';
import { commonStyles } from '../../../components/CommonStyles';
import CoinImages from "../../../assets/images/index"
import CryptoServices from '../../../services/crypto';
import { formatCurrency, isErrorDispaly } from '../../../utils/helpers';
import ErrorComponent from '../../../components/Error';
import SvgFromUrl from '../../../components/svgIcon';
import NoDataComponent from '../../../components/nodata';
import { IconRefresh } from '../../../assets/svg';
import { s } from '../../../constants/theme/scale';
import { useIsFocused } from '@react-navigation/native';
import Loadding from '../../../components/skeleton';
import { sellCoinSelect } from '../buySkeleton_views';
import { LIST_PERF_PAGINATED } from '../../../constants/listPerformance';

const CryptoWallet = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const isFocused = useIsFocused();
    const cryptoWalletSkeltons = sellCoinSelect(12);
    const [receiveCoinsDataLoading, setReceiveCoinsDataLoading] = useState<boolean>(false);
    const [receiveCoinsData, setReceiveCoinsData] = useState<any>([]);
    const [errormsg, setErrormsg] = useState<any>(null);
    useEffect(() => {
        getCryptoReceiveData()
    }, [isFocused])

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleGoBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);


    const handleGoBack = () => {
        props.navigation?.navigate('Dashboard', { screen: 'Home', animation: "slide_from_left" })
    };
    const getCryptoReceiveData = async () => {
        setReceiveCoinsDataLoading(true);
        try {
            const response: any = await CryptoServices.getCryptoWallets();
            if (response?.status === 200) {
                setReceiveCoinsData(response?.data);
                setReceiveCoinsDataLoading(false);
                setErrormsg(null);
            }
            else {
                setErrormsg(isErrorDispaly(response));
                setReceiveCoinsDataLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setReceiveCoinsDataLoading(false);
        }
    };

    const handleCryptoWalletView = (item: any) => {
        props.navigation.navigate("CryptoWalletView", {
            id: item.id,
            walletCode: item.walletCode,
            network: item.network,
            avilable: item.avilable,
            baseValue: item.baseValue
        }
        )
    };

    // P-02: wallets are one row per coin *per network*, so this list grows well
    // past a viewport. It used to be a .map() inside a ScrollView, mounting
    // every row up front; FlatList mounts only what is near the viewport.
    const keyExtractor = useCallback(
        (item: any, index: number) =>
            String(item?.id ?? `${item?.walletCode}-${item?.network}` ?? index),
        [],
    );

    const renderWalletItem = useCallback(({ item }: { item: any }) => (
        <>
            <TouchableOpacity onPress={() => { handleCryptoWalletView(item) }} activeOpacity={0.9} >
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, styles.rowStyle]}>

                    <View>
                        {item.logo && <SvgFromUrl
                            uri={item.logo}
                            width={36}
                            height={36}
                        />}
                        {!item.logo && <Image source={CoinImages.coins['coine' + item?.walletCode?.toLowerCase()] || CoinImages.coins.coinbtc} style={{ width: 40, height: 40 }} />}
                    </View>
                    <View style={[commonStyles.flex1,]}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.flex1,]}>
                            <ParagraphComponent text={`${item.walletCode} (${item.network}) `} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw600, commonStyles.flex1,]} numberOfLines={1} />
                            <ParagraphComponent text={`${formatCurrency(item.avilable || 0, 2)}`} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw600, commonStyles.textRight, { marginTop: -3 }]} numberOfLines={1} />

                        </View>
                    </View>
                </View>
            </TouchableOpacity>
            <View style={[commonStyles.mb20]} />
        </>
    ), [styles]);

    const ListHeader = (
        <>
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent]}>
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                    <TouchableOpacity style={[]} onPress={handleGoBack} >
                        <View>
                            <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                        </View>
                    </TouchableOpacity>
                    <ParagraphComponent text="Crypto Wallet" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                </View>
                <TouchableOpacity activeOpacity={0.6} onPress={getCryptoReceiveData}>
                    <IconRefresh height={s(24)} width={s(24)} />
                </TouchableOpacity>
            </View>
            {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}
            <View style={[commonStyles.mb43]} />
        </>
    );

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container,]}>
                <FlatList
                    testID="crypto-wallet-list"
                    data={receiveCoinsDataLoading ? [] : (receiveCoinsData || [])}
                    renderItem={renderWalletItem}
                    keyExtractor={keyExtractor}
                    ListHeaderComponent={ListHeader}
                    ListEmptyComponent={
                        receiveCoinsDataLoading
                            ? <Loadding contenthtml={cryptoWalletSkeltons} />
                            : <NoDataComponent />
                    }
                    showsVerticalScrollIndicator={false}
                    {...LIST_PERF_PAGINATED}
                />
            </Container>
        </SafeAreaView>
    )
});

export default CryptoWallet;

const themedStyles = StyleService.create({
    borderCircle: { borderRadius: 100, padding: 8, backgroundColor: '#382645' },
    rowStyle: {
        borderRadius: 16,
        padding: 12,
        backgroundColor: NEW_COLOR.MENU_CARD_BG
    },
    label: {
        color: NEW_COLOR.TEXT_LABEL
    }
});