import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { TextInput, BackHandler } from 'react-native';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { CoinImages, getThemedCommonStyles } from '../../../../components/CommonStyles';
import { useLngTranslation } from '../../../../hooks/languagesHook/useLngTranslation';
import { NavigationProp, ParamListBase, useIsFocused, useNavigation } from '@react-navigation/native';
import ViewComponent from '../../../../components/view/view';
import ExchangeCommonService from '../../../../apiServices/exchange/common/exchangeCommonService';
import { isErrorDispaly } from '../../../../utils/helpers';
import Container from '../../../../components/container/container';
import PageHeader from '../../../../components/pageHeader/pageHeader';
import ErrorComponent from '../../../../components/errorDisplay/errorDisplay';
import FlatListComponent from '../../../../components/flatList/flatList';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import SvgFromUrl from '../../../../components/svgIcon';
import { ms, s } from '../../../../constants/styels/scale';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import { CurrencyText } from '../../../../components/textComponets/currencyText/currencyText';
import NoDataComponent from '../../../../components/noData/noData';
import DashboardLoader from '../../../../components/loader';
import SearchComponent from '../../../../components/searchComponents/searchComponent';
import { ApiResponse, CryptoAsset, CryptoDetails, CryptoListState, CryptoLoadingState, CryptoRowProps, ExchangeCryptoDetailsParams, ExchangeCryptoListProps, RenderItemProps } from '../interfaces/exchangeInterfaces';



// Memoized row component
const CryptoRow = React.memo(({ item, onPress, isSelected, commonStyles, NEW_COLOR }: CryptoRowProps) => {
    return (
        <CommonTouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={[commonStyles.listitemGap]}
        >
            <ViewComponent
                style={[isSelected && commonStyles.tabactivebg, isSelected && commonStyles.px10, commonStyles.py7, isSelected && commonStyles.rounded12, commonStyles.gap16, commonStyles.dflex, commonStyles.alignCenter,]}  >
                <ViewComponent style={{ width: s(30), height: s(30) }}>
                    {CoinImages[item?.code?.toLowerCase()] && (
                        <SvgFromUrl uri={CoinImages[item?.code?.toLowerCase()]} width={s(32)} height={s(32)} />
                    )}
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flex1]}>
                    <ViewComponent>
                        <ParagraphComponent text={item?.name || ""} style={[commonStyles.primarytext]} />
                        <ParagraphComponent text={item?.code || ""} style={[commonStyles.secondarytext]} />
                    </ViewComponent>
                    <CurrencyText value={item?.amount || 0} style={[commonStyles.primarytext]} currency={item?.code} decimalPlaces={4} />
                </ViewComponent>
            </ViewComponent>
        </CommonTouchableOpacity>
    );
});

const CryptoList = React.memo((props: ExchangeCryptoListProps) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const { t } = useLngTranslation();
    const isFocused = useIsFocused();
    const navigation =  useNavigation<NavigationProp<ParamListBase>>();

    const [lists, setLists] = useState<CryptoListState>({
        cryptoList: [],
        cryptoPrevList: []
    });

    const [isLoadings, setIsLoadings] = useState<CryptoLoadingState>({
        cryptoLoading: false,
        isActive: false,
        isCryptoSelected: false,
        btnLoading: false
    });
    const [refreshing, setRefreshing] = useState(false);

    const [selectedItem, setSelectedItem] = useState<CryptoDetails>({
        id: "",
        code: "",
        name: "",
        amount: 0,
        logo: ""
    });

    const handleGoBack = useCallback(() => {
        navigation?.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.EXCHANGE", animation: "slide_from_left" });
    }, [navigation]);

    useEffect(() => {
        if (isFocused) {
            getCryptoList();
            setSelectedItem({ id: "", code: "", name: "", amount: 0, logo: "" });
        }
    }, [isFocused]);

    useEffect(() => {
        const backAction = () => {
            handleGoBack();
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [handleGoBack]);

    const handleSearchResult = (filteredData: CryptoAsset[]) => {
        setLists((prev) => ({ ...prev, cryptoList: filteredData }))
    };

    const getCryptoList = async () => {
        setIsLoadings((prev) => ({ ...prev, cryptoLoading: true }))
        setErrormsg('');
        try {
            const pageNo = 1;
            const pageSize = 10;
            const response = await ExchangeCommonService.getexchangeCryptoList(pageNo, pageSize) as ApiResponse;

            if (response.ok) {
                const assetsData = response?.data?.assets || [];
                setLists((prev) => ({ ...prev, cryptoList: assetsData, cryptoPrevList: assetsData }))
                setIsLoadings((prev) => ({ ...prev, cryptoLoading: false }))
            } else {
                setErrormsg(isErrorDispaly(response));
                setIsLoadings((prev) => ({ ...prev, cryptoLoading: false }))
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setIsLoadings((prev) => ({ ...prev, cryptoLoading: false }))
        }
    };

    const handleSelectedItem = useCallback((item: CryptoAsset) => {
        setIsLoadings((prev) => ({ ...prev, isActive: true, isCryptoSelected: true }));
        setSelectedItem({ ...item, logo: item.image });
        const screenName = props?.route?.params?.type === 'sell' ? 'CryptoSellExchange' : 'CryptoExchange';
        (props?.navigation?.navigate as (screen: string, params: ExchangeCryptoDetailsParams) => void)(screenName, {
            cryptoCoin: item?.code,
            coinFullName: item?.name,
            logo: item?.image,
            amountInUSD: item?.amount,
            fromScreen: 'ExchangeCryptoList'
        });
    }, [props?.route?.params?.type, props?.navigation]);

    const renderItem = useCallback(({ item }: RenderItemProps) => {
        const isSelected = selectedItem?.id === item.id;
        return (
            <CryptoRow
                item={item}
                onPress={() => handleSelectedItem(item)}
                isSelected={isSelected}
                commonStyles={commonStyles}
                NEW_COLOR={NEW_COLOR}
            />
        );
    }, [selectedItem?.id, handleSelectedItem, commonStyles, NEW_COLOR]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await getCryptoList();
        setRefreshing(false);
    }, []);

    const handleCloseError = useCallback(() => {
        setErrormsg("")
    }, []);

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container style={[commonStyles.container, commonStyles.flex1]}>
                <PageHeader title={t("GLOBAL_CONSTANTS.SELECT_CRYPTO")} onBackPress={handleGoBack} />
                {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                <ViewComponent style={[commonStyles.titleSectionGap]}>
                    <SearchComponent
                        key={isFocused ? 'focused' : 'unfocused'}
                        data={lists?.cryptoPrevList || []}
                        onSearchResult={handleSearchResult}
                    />
                </ViewComponent>
                {isLoadings?.cryptoLoading && (
                    <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <DashboardLoader />
                    </ViewComponent>)}
                {!isLoadings?.cryptoLoading && lists?.cryptoList && lists?.cryptoList?.length > 0 &&
                    <ViewComponent>
                        <FlatListComponent
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            data={lists?.cryptoList}
                            scrollEnabled={true}
                            numColumns={1}
                            renderItem={renderItem}
                            keyExtractor={(item: CryptoAsset) => item.id}
                        />
                    </ViewComponent>
                }
                {!isLoadings?.cryptoLoading && lists?.cryptoList?.length < 1 &&
                    <ViewComponent>
                        <NoDataComponent />
                    </ViewComponent>
                }
            </Container>
        </ViewComponent>
    )
})

export default CryptoList;
