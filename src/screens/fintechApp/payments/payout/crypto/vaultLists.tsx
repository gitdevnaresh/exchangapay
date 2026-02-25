import React, { useEffect, useState } from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import ImageUri from '../../../../../components/imageComponents/image';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import { CoinImages, getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { s } from '../../../../../components/theme/scale';
import NoDataComponent from '../../../../../components/noData/noData';
import SearchComponent from '../../../../../components/searchComponents/searchComponent';
import { useHardwareBackHandler } from '../../../../../hooks/backHandleHook';
import { PAYOUT_CONSTANTS } from '../payOutConstants';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { isErrorDispaly } from '../../../../../utils/helpers';
import PaymentService from '../../../../../apiServices/payments';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../components/view/view';
import DashboardLoader from '../../../../../components/loader';
import FlatListComponent from '../../../../../components/flatList/flatList';
import ComingSoon from '../../../../commonScreens/commingSoon/comingSoon';



const VaultList = (props: any) => {
    const { isActive } = props;
    const navigation = useNavigation<any>();
    const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const isFocused = useIsFocused();
    const [vaultsLists, setVaultsLists] = useState<any>({
        vaultsList: [],
        vaultsPrevList: [],
    });
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [vaultCoinsLists, setVaultsCoinsList] = useState<any>({
        coinsList: [],
        coinsPrevList: []
    });
    useEffect(() => {
        if (isFocused && isActive && vaultsLists.vaultsList.length === 0) {
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
            response = await PaymentService.payOutCurrencies('crypto');
            if (response?.ok) {
                setVaultsLists((prev: any) => ({ ...prev, vaultsList: response?.data, vaultsPrevList: response?.data }))
                setVaultsCoinsList((prev: any) => ({ ...prev, coinsList: response?.data[0]?.details, coinsPrevList: response?.data[0]?.details }))
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
    const handleSearchResult = (result: any[]) => {
        setVaultsCoinsList((prev: any) => ({ ...prev, coinsList: result }));
    };
    // Check if any vault has isPayoutCryptoAvailable true
    const hasPayoutCryptoAvailable = vaultsLists.vaultsList.some((vault: any) => vault?.isPayoutCryptoAvailable);
    const handlenavigatePayment = (item: any) => {
        const rawState = vaultsLists.vaultsList[0]?.providerStatus || vaultsLists.providerState;
        const isReapply = vaultsLists.vaultsList[0]?.isReApply || vaultsLists.isReApply;
        const remarks = vaultsLists.vaultsList[0]?.remarks || vaultsLists.remarks;

        const providerState = rawState ? rawState.toString().toLowerCase() : null;
        if (providerState === null || providerState === undefined || providerState === 'null') {
            // Redirect to KYC flow
            navigation.navigate("EnableProvider", {
                VaultData: item,
            })
        } else if (providerState === 'pending') {
            // Show pending screen
            navigation.navigate("PaymentPending");
        } else if (providerState === 'rejected') {
            // Show reapply screen
            if (isReapply) {
                navigation.navigate("ReApplyPayoutKyb", {
                    VaultData: item,
                    isReapply: isReapply,
                    remarks: remarks
                });
            } else {
                navigation.navigate("PaymentPending");
            }

        } else if (providerState === 'approved') {
            // Show payout form
            navigation.navigate("CryptoPayout", {
                coinName: item?.coinName,
                coinCode: item?.code,
                available: item?.amount,
                logo: item?.image,
                network: item?.networks,
                merchantId: vaultsLists?.vaultsList?.[0]?.id,
                vault: vaultsLists?.vaultsList?.[0]?.name,
                networksData: item?.networks,
                screenName: PAYOUT_CONSTANTS.PAYMENTS,
                paymentType: props?.route?.params?.paymentType,
                vaultData: vaultsLists?.vaultsList?.[0],
                vaultsList: vaultsLists?.vaultsList,
                selectedVault: vaultsLists?.vaultsList?.[0],
            });
        }
    };
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    })
    const backArrowButtonHandler = () => {
        if (props?.route?.params?.paymentType === PAYOUT_CONSTANTS.CRYPTO) {
            navigation.navigate("PayOutList")
        }
        else {
            navigation.goBack();
        }

    }

    const renderCoinItem = ({ item, index }: { item: any; index: number }) => (
        <CommonTouchableOpacity activeOpacity={0.5} onPress={() => handlenavigatePayment(item)}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                <ViewComponent style={{ width: s(36), height: s(36) }}>
                    <ImageUri uri={CoinImages[item?.code?.toLowerCase()] || item?.image} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                    <ViewComponent>
                        <ParagraphComponent text={item?.name} style={[commonStyles.primarytext]} />
                        <ParagraphComponent text={`${item?.code ?? ''}`} style={[commonStyles.secondarytext]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.alignEnd]}>
                        <CurrencyText value={item?.amount ?? 0} decimalPlaces={4} currency={item?.code} style={[commonStyles.primarytext]} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
        </CommonTouchableOpacity>
    );

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {isDataLoading && <SafeAreaView style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                <DashboardLoader />
            </SafeAreaView>
            }
            {!isDataLoading && <ViewComponent style={[commonStyles.flex1]}>
                <ViewComponent style={[commonStyles.sectionGap]} />
                {errormsg !== "" && <ErrorComponent message={errormsg} onClose={handleCloseError} />}

                {!hasPayoutCryptoAvailable ? (
                    <ComingSoon pageHeader={false} />
                ) : (
                    <ViewComponent>
                        <SearchComponent
                            data={vaultCoinsLists?.coinsPrevList || []}
                            customBind="code"
                            onSearchResult={handleSearchResult}
                            placeholder="GLOBAL_CONSTANTS.SEARCH_CURRENCY"
                        />
                        {/* <ViewComponent style={[commonStyles.sectionGap]} /> */}
                        <FlatListComponent
                            data={vaultCoinsLists?.coinsList || []}
                            renderItem={renderCoinItem}
                            keyExtractor={(item, index) => item?.code ?? index.toString()}
                            ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.listGap]} />}
                            ListEmptyComponent={() => <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                            nestedScrollEnabled={true}
                        />
                    </ViewComponent>
                )}

            </ViewComponent>}
        </ViewComponent>
    )
}

export default VaultList;


