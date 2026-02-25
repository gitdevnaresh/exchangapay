import React, { useEffect, useState } from 'react';
// FlatList and TouchableOpacity are imported to render the list
import { SafeAreaView, TouchableOpacity } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useHardwareBackHandler } from '../../../../../hooks/backHandleHook';
import { PAYOUT_CONSTANTS } from '../payOutConstants';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { isErrorDispaly } from '../../../../../utils/helpers';
import PaymentService from '../../../../../apiServices/payments';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { CoinImages, getThemedCommonStyles } from '../../../../../components/CommonStyles';
import ViewComponent from '../../../../../components/view/view';
import DashboardLoader from '../../../../../components/loader';
import ImageUri from '../../../../../components/imageComponents/image';
import { s } from '../../../../../components/theme/scale';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import FlatListComponent from '../../../../../components/flatList/flatList';
import SearchComponent from '../../../../../components/searchComponents/searchComponent';
import { isDecimalSmall } from "../../../../../../cofiguration";
import ComingSoon from '../../../../commonScreens/commingSoon/comingSoon';



const FiatCoinLIst = (props: any) => {
    const { isActive } = props;
    const navigation = useNavigation<any>();
    const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const isFocused = useIsFocused();
    const [coinsList, setCoinsList] = useState<any>([]);
    const [filteredCoinsList, setFilteredCoinsList] = useState<any>([]);

    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    useEffect(() => {
        if (isFocused && isActive && coinsList.length === 0) {
            getVaultsList();
        }
    }, [isFocused, isActive]);

    const handleCloseError = () => {
        setErrormsg("")
    }

    const getVaultsList = async () => {
        setIsDataLoading(true);
        try {
            let response: any;
            response = await PaymentService.payOutCurrencies('fiat');
            if (response?.ok) {
                setCoinsList(response.data);
                setFilteredCoinsList(response.data);
                setIsDataLoading(false);
            } else {
                setIsDataLoading(false);
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setIsDataLoading(false);
            setErrormsg(isErrorDispaly(error));

        };
    }

    const handlenavigatePayment = (item: any) => {
        navigation.navigate("FiatPayout", {
            selectedVault: item,
            allCoinsList: coinsList
        });
    };

    const handleSearchResult = (result: any[]) => {
        setFilteredCoinsList(result);
    };
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    })
    const backArrowButtonHandler = () => {
        if (props?.route?.params?.paymentType === PAYOUT_CONSTANTS.CRYPTO) {
            navigation.navigate("PayOutList")
        }
        else {
            navigation.navigate("Dashboard", { animation: 'slide_from_left', initialTab: "GLOBAL_CONSTANTS.PAYMENTS" });

        }
    }

    // Check if any item has isPayoutFiatAvailable true
    const hasPayoutFiatAvailable = filteredCoinsList.some((item: any) => item?.isPayoutFiatAvailable);

    // Renders each item in the FlatList
    const renderCoinItem = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => handlenavigatePayment(item)}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter, commonStyles.mb16]}>
                <ViewComponent style={{ width: s(32), height: s(32) }}>
                    <ImageUri uri={CoinImages[item?.code?.toLowerCase()] || ''} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ParagraphComponent text={item?.code} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.mb6]} />
                    <ParagraphComponent text={item?.name} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                </ViewComponent>
                <ViewComponent>
                    <CurrencyText smallDecimal={isDecimalSmall} value={item.amount || 0} currency={item?.code} symboles={true} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.mb4]} />
                </ViewComponent>
            </ViewComponent>
        </TouchableOpacity>
    );

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {isDataLoading && <SafeAreaView style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                <DashboardLoader />
            </SafeAreaView>
            }
            {!isDataLoading &&
                <ViewComponent style={commonStyles.flex1}>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    {errormsg !== "" && <ErrorComponent message={errormsg} onClose={handleCloseError} />}

                    {!hasPayoutFiatAvailable ? (
                        <ComingSoon pageHeader={false} />
                    ) : (
                        <>
                            <SearchComponent
                                data={coinsList}
                                customBind="code"
                                onSearchResult={handleSearchResult}
                                placeholder="GLOBAL_CONSTANTS.SEARCH_CURRENCY"
                            />
                            <FlatListComponent
                                data={filteredCoinsList}
                                renderItem={renderCoinItem}
                                keyExtractor={(item) => item.id}
                                ItemSeparatorComponent={() => <ViewComponent style={{ height: 1, backgroundColor: NEW_COLOR.border }} />}
                            />
                        </>
                    )}
                </ViewComponent>
            }
        </ViewComponent>
    )
}

export default FiatCoinLIst;
