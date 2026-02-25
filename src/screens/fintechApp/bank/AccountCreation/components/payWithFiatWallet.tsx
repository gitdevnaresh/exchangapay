import React, { useCallback, useEffect, useState } from 'react';
import {  Keyboard } from 'react-native';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import {  CurrencyDetails, FiatLoadingstate, PayWithWalletFiatConfirm, PayWithWalletFiatLists } from './createAccConstant';
import { s } from '../../../../../components/theme/scale';
import { isErrorDispaly } from '../../../../../utils/helpers';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { CoinImages, getThemedCommonStyles } from '../../../../../components/CommonStyles';
import SvgFromUrl from '../../../../../components/svgIcon';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import Container from '../../../../../components/container/container';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import SearchComponent from '../../../../../components/searchComponents/searchComponent';
import ViewComponent from '../../../../../components/view/view';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import Paragraph from '../../../../../components/textComponets/paragraphText/paragraph';
import BankServices from '../../../../../apiServices/bank';
import DashboardLoader from '../../../../../components/loader';
import NoDataComponent from '../../../../../components/noData/noData';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';

const PayWithFiatCurrencies = React.memo((props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const selectedBank = props.selectedBank || useSelector((state: any) => state.userReducer.selectedBank);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>("");
    const [refresh, setRefresh] = useState<boolean>(false);
    const { t } = useLngTranslation();
    const isFocused = useIsFocused();
    const Kyc_KybDocuments = props?.route?.params?.Documents;
    const [lists, setLists] = useState<PayWithWalletFiatLists>({
        currenciesList: [],
        currenciesPrevList: []
    });
    const [isLoadings, setIsLoadings] = useState<FiatLoadingstate>({
        currencyLoading: false,
        isActive: false,
        isCurencySelected: false,
        btnLoading: false
    })
    const [selectedItem, setSelectedItem] = useState<CurrencyDetails>({
        id: "",
        currency: "",
        code: "",
        logo: "",
        amount: 0,
        amountInUSD: 0,
        minLimit: 0,
        maxLimit: 0
    })

    useEffect(() => {
        if (props?.isActiveTab !== false) {
            getCurrencies()
            setSelectedItem({
                id: "",
                currency: "",
                code: "",
                logo: "",
                amount: 0,
                amountInUSD: 0,
                minLimit: 0,
                maxLimit: 0
            })
        }
    }, [isFocused, props?.isActiveTab]);

    const handleSearchResult = (filteredData: any[]) => {
        setLists((prev) => ({ ...prev, currenciesList: filteredData }))
    };



    const onRefresh = async () => {
        setRefresh(true);
        try {
            await getCurrencies();
        } finally {
            setRefresh(false);
        }
    };

    const getCurrencies = async () => {
        setIsLoadings((prev) => ({ ...prev, currencyLoading: true }))
        setErrormsg('');
        try {
            const response: any = await BankServices.getVaultFiatCurrencies();
            if (response.ok) {
                setLists((prev: any) => ({ ...prev, currenciesList: response?.data?.assets, currenciesPrevList: response?.data?.assets }))
                setIsLoadings((prev) => ({ ...prev, currencyLoading: false }))
            } else {
                setErrormsg(isErrorDispaly(response));
                setIsLoadings((prev) => ({ ...prev, currencyLoading: false }))
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setIsLoadings((prev) => ({ ...prev, currencyLoading: false }))
        }
    };

    const handleContinue = async () => {
        setIsLoadings((prev) => ({ ...prev, btnLoading: true }))
        const saveObj: PayWithWalletFiatConfirm = {
            walletId: selectedItem?.id,
            amount: 0,
            // documents: identityDocuments,
        }
        try {
            const response: any = await BankServices.confirmPayWithFiat(selectedBank?.productId, saveObj);
            if (response?.ok) {
                setIsLoadings((prev) => ({ ...prev, btnLoading: false }))
                setSearchText('')
                props?.navigation.navigate("payWithFiatPreview", {
                    selectedAccount: props?.route?.params?.selectedAccount,
                    selectedBank: selectedBank?.name,
                    accountToCreate: response?.data?.accountToCreate,
                    amount: response?.data?.amount,
                    payingWalletCoin: response?.data?.payingWalletCoin,
                    selectedPayingItem: selectedItem,
                    documents: Kyc_KybDocuments
                })
            } else {
                setIsLoadings((prev) => ({ ...prev, btnLoading: false }))
                setErrormsg(isErrorDispaly(response))
            }
        } catch (error) {
            setIsLoadings((prev) => ({ ...prev, btnLoading: false }))
            setErrormsg(isErrorDispaly(error))
        }
    };

    const handleSelectedItem = async (item: any) => {
        // Check if amount is 0 or null
        if (!item?.amount || item?.amount <= 0) {
            setSelectedItem(item);
            setErrormsg(`${t("GLOBAL_CONSTANTS.INSUFFICIENT_FUNDS")} for ${item?.code || 'selected coin'}`);
            return;
        }

        setSelectedItem(item);
        setErrormsg('');
        setIsLoadings((prev) => ({ ...prev, btnLoading: true }));
        const saveObj: PayWithWalletFiatConfirm = {
            walletId: item?.id,
            amount: 0,
        };
        try {
            const response: any = await BankServices.confirmPayWithFiat(selectedBank?.productId, saveObj);
            if (response?.ok) {
                setIsLoadings((prev) => ({ ...prev, btnLoading: false }));
                setSearchText('');
                props?.navigation.navigate("payWithFiatPreview", {
                    selectedAccount: props?.route?.params?.selectedAccount,
                    selectedBank: selectedBank,
                    accountToCreate: response?.data?.accountToCreate,
                    amount: response?.data?.amount,
                    payingWalletCoin: response?.data?.payingWalletCoin,
                    selectedPayingItem: item,
                    documents: Kyc_KybDocuments,
                    fromScreen: props.route.params.targetScreen
                });
            } else {
                setIsLoadings((prev) => ({ ...prev, btnLoading: false }));
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setIsLoadings((prev) => ({ ...prev, btnLoading: false }));
            setErrormsg(isErrorDispaly(error));
        }
    }
    const handleCloseError = useCallback(() => {
        setErrormsg("")
    }, []);
    return (
        <Container style={[commonStyles.screenBg]}>
            <ScrollViewComponent
                refreshing={refresh} onRefresh={onRefresh}
            >
                {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                <ViewComponent>
                    <SearchComponent
                        key={props?.isFocused ? 'focused' : 'unfocused'}
                        data={lists?.currenciesPrevList || []}
                        onSearchResult={handleSearchResult}
                    />
                </ViewComponent>
                {isLoadings?.currencyLoading && (
                    <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <DashboardLoader />
                    </ViewComponent>)}
                {!isLoadings?.currencyLoading && lists?.currenciesList && lists?.currenciesList?.length > 0 &&
                    <ViewComponent>
                        <ViewComponent>
                            {lists?.currenciesList?.map((item: any, index: any) => {
                                const isSelected = selectedItem?.id === item.id;
                                return (
                                    <CommonTouchableOpacity
                                        key={item.id}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            handleSelectedItem(item);
                                        }}
                                        activeOpacity={0.85}

                                    >
                                        <ViewComponent
                                            style={[
                                                commonStyles.gap16,
                                                commonStyles.dflex,
                                                commonStyles.alignCenter,
                                                commonStyles.py14,
                                                isSelected && { backgroundColor: NEW_COLOR.actioniconbg || '', borderRadius: s(8) }
                                            ]}  >

                                            <ViewComponent style={{ width: s(30), height: s(30) }}>
                                                <SvgFromUrl uri={item?.code?.toLowerCase() === 'usd' ? CoinImages['bankusd'] : CoinImages[item?.code?.toLowerCase() || '']} width={s(32)} height={s(32)} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.flexWrap, { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                                <Paragraph text={item?.code || ""} style={[commonStyles.listprimarytext]} />
                                                <CurrencyText
                                                    value={item?.amount || 0}
                                                    style={[commonStyles.listprimarytext]}
                                                    decimalPlaces={2}
                                                />
                                            </ViewComponent>
                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                )
                            })}
                        </ViewComponent>
                    </ViewComponent>
                }
                {!isLoadings?.currencyLoading && lists?.currenciesList?.length < 1 &&
                    <ViewComponent >
                        <NoDataComponent />
                    </ViewComponent>
                }



            </ScrollViewComponent>


        </Container>
    )
})

export default PayWithFiatCurrencies;
