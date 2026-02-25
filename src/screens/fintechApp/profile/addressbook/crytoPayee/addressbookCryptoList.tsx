import React, { useCallback, useEffect, useState } from 'react';
import { View, SafeAreaView, TouchableOpacity } from 'react-native';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { ADD_BOOK_CONST } from '../constants';
import { s } from '../../../../../constants/styels/scale';
import { isErrorDispaly } from '../../../../../utils/helpers';
import Container from '../../../../../components/container/container';
import NoDataComponent from '../../../../../components/noData/noData';
import Icon from '../../../../../components/Icon';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import Images from '../../../../../assets/images';
import SearchComponent from '../../../../../components/searchComponents/searchComponent';
import AddressbookService from '../../../../../apiServices/profile/general/addressbook';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { useNavigation } from '@react-navigation/native';
import DashboardLoader from '../../../../../components/loader';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';

const cryptoList: any = {
    BTC: Images?.coins.coinbtc,
    USDT: Images?.coins.coineusdt,
    ETH: Images?.coins.coineth,
    USDC: Images?.coins.coineusdc
};

const AddressbookCryptoList = React.memo((props: any) => {
    const [cryptoCoinData, setCryptoCoinData] = useState<any>([]);
    const [sendCryptoPreList, setCryptoPreList] = useState<any>([]);
    const [walletDtaLoading, setWalletDataLoading] = useState(false);
    const [errormsg, setErrormsg] = useState("");
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        getAddressbookCryptoWallets();
    }, []);



    const handleSearchResult = useCallback((result: any[]) => {
        setCryptoCoinData(result);
    }, []);

    const getAddressbookCryptoWallets = useCallback(async () => {
        setErrormsg('')
        setWalletDataLoading(true);
        const response: any = await AddressbookService.getPayeesLookups();
        if (response?.ok) {
            setCryptoCoinData(response?.data?.cryptoCurrency);
            setCryptoPreList(response?.data?.cryptoCurrency);
            setWalletDataLoading(false);
            setErrormsg('');
        } else {
            setErrormsg(isErrorDispaly(response));
            setWalletDataLoading(false);
        }
    }, []);

    const backArrowAddressbookHandler = useCallback(() => {
        props.navigation.navigate("Addressbook");
    }, [props.navigation]);

    const handleAdressbookCryptoCoinSlct = useCallback((val: any) => {
        navigation.navigate(ADD_BOOK_CONST?.ADD_CONTACT_COMPONENT, {
            walletCode: val?.code,
            logo: val?.logo,
            screenName: "Addressbook",
            details: val?.details
        })
    }, [navigation]);

    const handleCloseError = useCallback(() => {
        setErrormsg("");
    }, []);

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            {walletDtaLoading ? (
                <DashboardLoader />
            ) : (
                <Container style={[commonStyles.container]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.SELECT_ASSET"} onBackPress={backArrowAddressbookHandler} isrefresh={true} onRefresh={getAddressbookCryptoWallets} />
                    <View>
                        <SearchComponent
                            data={sendCryptoPreList || []}
                            customBind="walletCode"
                            onSearchResult={handleSearchResult}
                            placeholder="GLOBAL_CONSTANTS.SEARCH_COIN"
                        />
                        <View>
                            {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                            <>
                                {cryptoCoinData?.length > 0 &&
                                    <View>

                                        {cryptoCoinData?.map((item: any, index: any) => {
                                            return (
                                                <View key={item?.name}>
                                                    <TouchableOpacity onPress={() => handleAdressbookCryptoCoinSlct(item)}>

                                                        <View style={[commonStyles.dflex, commonStyles.flex1, commonStyles.justifyContent, commonStyles.gap10,]} key={item?.name}>

                                                            <View >
                                                                <Icon containerStyle={{}} source={cryptoList[item?.code || 'USDT']} style={{ width: s(30), height: s(30) }} />
                                                            </View>
                                                            <View style={[commonStyles.flex1,]}>
                                                                <View style={[commonStyles.dflex, commonStyles.flex1, commonStyles.justifyContent, commonStyles.gap10]}>
                                                                    <View>
                                                                        <ParagraphComponent text={item?.code} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.mb2]} />
                                                                        <ParagraphComponent text={item?.name} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textLink]} />
                                                                    </View>
                                                                    {item?.amount && <View>
                                                                        <ParagraphComponent text={`${item?.amount?.toLocaleString()}`} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textRight, commonStyles.textWhite]} />
                                                                    </View>}
                                                                </View>

                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                    {index !== cryptoCoinData.length - 1 && <View style={[commonStyles.hLine, commonStyles.my10]} />}

                                                </View>

                                            )
                                        })}
                                    </View>
                                }
                                {
                                    cryptoCoinData.length < 1 && <View>

                                        <View >
                                            <NoDataComponent />
                                        </View>
                                    </View>
                                }
                            </>

                        </View>
                    </View>
                </Container>
            )}
        </SafeAreaView>
    )
})

export default AddressbookCryptoList;


