import React, { useCallback, useEffect, useState } from 'react';
import { s } from '../../../../../constants/styels/scale';
import { CoinImages, getThemedCommonStyles, statusColor } from '../../../../../components/CommonStyles';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useHardwareBackHandler } from '../../../../../hooks/backHandleHook';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { GetStaticPayinData } from '../../interface';
import DashboardLoader from '../../../../../components/loader';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';
import PaymentService from '../../../../../apiServices/payments';
import ViewComponent from '../../../../../components/view/view';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import { isErrorDispaly } from '../../../../../utils/helpers';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import ImageUri from '../../../../../components/imageComponents/image';
import FlatListComponent from '../../../../../components/flatList/flatList';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import SearchComponent from '../../../../../components/searchComponents/searchComponent';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { FIAT_PAYIN_CONSTANTS } from './constants';

const FiatPayin = (props: any) => {
    const isInTab = props?.isInTab || false;
    const [CoinList, setCoinList] = useState<GetStaticPayinData[]>([]);
    const [filteredCoinList, setFilteredCoinList] = useState<GetStaticPayinData[]>([]);
    const [coinDtaLoading, setCoinDataLoading] = useState<boolean>(true);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        if (!isInTab || props?.isActiveTab) {
            getList();
        }
    }, [isFocused, isInTab, props?.isActiveTab]);
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    })
    const getList = async () => {
        setCoinDataLoading(true);
        setErrormsg('');
        try {
            let response: any;

            response = await PaymentService.fiatPayinLists("All");
            if (response.ok) {
                setCoinList(response?.data);
                setFilteredCoinList(response?.data);
                setCoinDataLoading(false);
            } else {
                setErrormsg(isErrorDispaly(response));
                setCoinDataLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setCoinDataLoading(false);
        }

    };
    const backArrowButtonHandler = useCallback(() => {
        navigation.navigate("Dashboard", { screen: "GLOBAL_CONSTANTS.PAYMENTS" });
    }, [navigation]);
    const handleView = (val: any) => {
        navigation.navigate(FIAT_PAYIN_CONSTANTS.PAYMENTS_FIAT_PAYIN_LIST, {
            data: val,
            returnTab: props?.currentTabIndex ?? 0
        })
    };

    const handleSearchResult = (result: GetStaticPayinData[]) => {
        setFilteredCoinList(result);
    };
    return (
        <ViewComponent style={[commonStyles.flex1]}>
            {coinDtaLoading && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
            {!coinDtaLoading && <ViewComponent style={[commonStyles.mt32, commonStyles.flex1]}>
                <ScrollViewComponent>
                    {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}
                    <ViewComponent style={[commonStyles.mb43]} >
                        <SearchComponent
                            data={CoinList}
                            customBind="currency"
                            onSearchResult={handleSearchResult}
                            placeholder="GLOBAL_CONSTANTS.SEARCH_CURRENCY"
                        />
                        <FlatListComponent
                            showsVerticalScrollIndicator={false}
                            data={filteredCoinList}
                            scrollEnabled={false}
                            nestedScrollEnabled={true}
                            renderItem={({ item, index }: any) => (
                                <ViewComponent style={[commonStyles.cardsbannerbg]}>
                                    <CommonTouchableOpacity key={item.id + index} onPress={() => handleView(item)}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter, commonStyles.flex1]}>
                                                <ViewComponent style={{ width: s(32), height: s(32) }}>
                                                    <ImageUri uri={CoinImages[item?.code ? item?.code.toLowerCase() : item?.currency?.toLowerCase()]} />
                                                </ViewComponent>
                                                <ViewComponent style={[commonStyles.mb4]}>
                                                    <ParagraphComponent text={`${item?.currency || item?.code} `} numberOfLines={1} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.mb6]} />
                                                    {item?.name && <ParagraphComponent text={item?.name} style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textlinkgrey]} />}
                                                </ViewComponent>
                                            </ViewComponent>
                                            <ViewComponent style={[]}>
                                                <CurrencyText value={item?.amount} currency={item?.code || item?.currency} symboles={true} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.textRight, commonStyles.mb2]} />
                                                {item?.accountNumber && <ParagraphComponent text={item?.accountNumber} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textRight]} />}
                                            </ViewComponent>
                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                    {index !== filteredCoinList.length - 1 &&
                                        <ViewComponent style={[commonStyles.transactionsListGap]} />}

                                </ViewComponent>)}
                            keyExtractor={(item) => item.id}
                        />
                    </ViewComponent>
                </ScrollViewComponent>
            </ViewComponent>}
        </ViewComponent>

    )

}

export default FiatPayin;

