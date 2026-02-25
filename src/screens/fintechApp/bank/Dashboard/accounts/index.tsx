
import Container from "../../../../../components/container/container"
import { CoinImages, getThemedCommonStyles, statusColor } from "../../../../../components/CommonStyles"
import React, { useEffect, useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import CreateAccountService from "../../../../../apiServices/bank/createAccount"
import { isErrorDispaly } from "../../../../../utils/helpers"
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay"
import NoDataComponent from "../../../../../components/noData/noData"
import { s } from "../../../../../constants/styels/scale"
import SvgFromUrl from "../../../../../components/svgIcon"
import { useNavigation } from "@react-navigation/native"
import { BANK_CONST } from "../../constants"
import { getTabsConfigation } from '../../../../../../configuration'
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors"
import ViewComponent from "../../../../../components/view/view"
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity"
import FlatListComponent from "../../../../../components/flatList/flatList"
import SafeAreaViewComponent from "../../../../../components/safeArea/safeArea"
import DashboardLoader from "../../../../../components/loader"
import { setAccountInfo } from "../../../../../redux/actions/actions"
import { useFocusEffect } from "@react-navigation/native"
import { BackHandler } from "react-native"
import PageHeader from "../../../../../components/pageHeader/pageHeader"
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText"
import useEncryptDecrypt from "../../../../../hooks/encDecHook"
import TextMultiLanguage from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge"
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph"
import { ACCOUNTDASH_CONSTANTS } from "../../constants"
import { Logger } from "../../../../../utils/Logger";

const currencyFullNames: { [key: string]: string } = {
    USD: "United States Dollar",
    EUR: "Euro",
    GBP: "British Pound Sterling",
    JPY: "Japanese Yen",
    CAD: "Canadian Dollar",
    AUD: "Australian Dollar",
    CHF: "Swiss Franc",
    CNY: "Chinese Yuan",
    INR: "Indian Rupee"
};

const Accounts = React.memo((props: any) => {
    const [createAccListLoading, setCreateAccListLoading] = useState(false);
    const [bankKpiDetails, setBankKpiDetails] = useState<any>([]);
    const [errormsg, setErrormsg] = useState("");
    const navigation = useNavigation<any>();
    const currencySymbole = getTabsConfigation("CURRENCY");
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const dispatch = useDispatch<any>();
    const { decryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);

    useEffect(() => {
        const fetchAccountDetails = async () => {
            try {
                await getCreateAccountDetails();
            } catch (error) {
                Logger.error('getCreateAccountDetails useEffect failed', { error });
            }
        };
        fetchAccountDetails();
    }, [])

    const getCreateAccountDetails = async () => {
        try {
            setCreateAccListLoading(true);

            const kpiResponse = await CreateAccountService.bankKpis();

            if (kpiResponse.ok) {
                setBankKpiDetails(kpiResponse?.data);
                setErrormsg("");
            } else {
                setErrormsg(isErrorDispaly(kpiResponse));
            }

            setCreateAccListLoading(false);
        } catch (error) {
            Logger.error('getCreateAccountDetails failed', { error });
            setErrormsg(isErrorDispaly(error));
            setCreateAccListLoading(false);
        }
    };

    const backArrowButtonHandler = useCallback(() => {
        try {
            if (props.route.params?.screenName == "Dashboard") {
                navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.HOME", animation: 'slide_from_left' });
            } else {
                navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.BANK", animation: 'slide_from_left' });
            }
        } catch (error) {
            Logger.error('backArrowButtonHandler failed', { error, screenName: props.route.params?.screenName });
        }
    }, [navigation, props.route.params?.screenName]);

    useFocusEffect(
        useCallback(() => {
            try {
                const onBackPress = () => {
                    backArrowButtonHandler();
                    return true;
                };

                const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

                return () => subscription?.remove();
            } catch (error) {
                Logger.error('useFocusEffect failed', { error });
            }
        }, [backArrowButtonHandler])
    );
    const gridRefresh = useCallback(async () => {
        try {
            await getCreateAccountDetails();
        } catch (error) {
            Logger.error('gridRefresh failed', { error });
        }
    }, []);
    const handleChage = (value: any) => {
        try {
            if (props?.route?.params?.isWithdrawTrue) {
                navigation.navigate(BANK_CONST.SEND_AMOUNTS, {
                    avialableBal: value?.amount,
                    walletCode: value?.currency,
                    screenName: "Accounts",
                })
            }
            else if (props?.route?.params?.fromDeposit) {
                navigation.navigate(BANK_CONST.BANK, {
                    customerId: userInfo?.id,
                    currency: value?.currency,
                    logo: value?.image,
                    avialableBal: value?.amount,
                    type: BANK_CONST.DEPOSITE,
                    screenName: "Accounts",
                })
            }
            else if ((props?.route?.params?.type === BANK_CONST.DEPOSITE)) {
                navigation.navigate(BANK_CONST.BANK, {
                    customerId: userInfo?.id,
                    currency: value?.currency,
                    logo: value?.image,
                    avialableBal: value?.amount,
                    type: props?.route?.params?.type,
                    screenName: "Accounts",
                })
            }
            else if (props?.route?.params?.type === BANK_CONST.WITHDRAW) {
                if (!value?.accountNumber) {
                    navigation.navigate(BANK_CONST.CURRENCY_POP, {
                        accountNumber: decryptAES(value?.accountNumber), avialableBal: value?.amount,
                        accountId: value?.productid,
                        walletCode: value?.currency,
                        name: value?.name, screenName: "",
                        selectedId: value?.id
                    });
                } else {
                    navigation.navigate(BANK_CONST.SEND_AMOUNTS, {
                        avialableBal: value?.amount,
                        accountId: props?.route?.params?.accountId,
                        walletCode: props?.route?.params?.walletCode || value?.currency,
                        id: props?.route?.params?.id,
                        type: props?.route?.params?.type,
                        screenName: "Accounts",
                    })
                }

            }
            else {
                dispatch(setAccountInfo(value));
                navigation.navigate(BANK_CONST.CURRENCY_POP, {
                    accountNumber: decryptAES(value?.accountNumber),
                    name: value?.name,
                    avialableBal: value?.amount,
                    accountId: value?.id,
                    walletCode: value?.currency,
                    id: value?.id,
                    logo: value?.image,
                    screenName: "Accounts",
                    parentScreen: props.route.params?.screenName,
                    selectedId: value?.id
                });
            }
        } catch (error) {
            Logger.error('handleChage failed', { error, valueId: value?.id });
            setErrormsg(isErrorDispaly(error));
        }
    }
    return (

        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.ACCOUNTS"} onBackPress={backArrowButtonHandler} isrefresh={true} onRefresh={gridRefresh} />
                {(createAccListLoading) && (
                    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <DashboardLoader />
                    </SafeAreaViewComponent>
                )}
                {!createAccListLoading && (
                    <ViewComponent style={[commonStyles.flex1]}>
                        {errormsg !== "" && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}

                        {(bankKpiDetails && bankKpiDetails?.length > 0) && (
                            <FlatListComponent
                                showsVerticalScrollIndicator={false}
                                data={bankKpiDetails}
                                keyExtractor={(item: any) => item.id.toString()}
                                renderItem={({ item }) => {
                                    return (
                                        <ViewComponent >
                                            <CommonTouchableOpacity onPress={() => handleChage(item)} style={[commonStyles.cardsbannerbg]}>
                                                <ViewComponent>

                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.titleSectionGap]} >
                                                        <ViewComponent style={{ minHeight: s(34), minWidth: s(34) }}>
                                                            <SvgFromUrl uri={item?.currency?.toLowerCase() === 'usd' ? CoinImages['bankusd'] : CoinImages[item?.currency?.toLowerCase() || '']}
                                                                width={s(32)}
                                                                height={s(32)}
                                                            />
                                                        </ViewComponent>
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flex1]}>
                                                            <ViewComponent style={[commonStyles.flex1]}>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent,]}>
                                                                    <ParagraphComponent style={[commonStyles.accountselectprimarytext]} text={item?.currency} />
                                                                    <CurrencyText value={item?.amount} prifix={currencySymbole[item?.currency]} style={[commonStyles.primarytext]} />

                                                                </ViewComponent>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent,]}>
                                                                    <ParagraphComponent style={[commonStyles.accountselectsecondarytext]} text={currencyFullNames[item?.currency] || item?.name || '-'} />
                                                                    {item?.bankStatus?.toLowerCase() !== 'approved' && <ViewComponent style={[commonStyles.alignEnd]}>
                                                                        <ParagraphComponent
                                                                            style={[commonStyles.colorstatus, { color: statusColor[item?.bankStatus?.toLowerCase() === 'rejected' ? item?.bankStatus?.toLowerCase() : 'pending'] || statusColor[ACCOUNTDASH_CONSTANTS.PENDING] }]}
                                                                            text={item?.bankStatus?.toLowerCase() === 'rejected' ? `${item?.bankStatus}` : 'Pending'}
                                                                        />
                                                                    </ViewComponent>
                                                                    }

                                                                </ViewComponent>
                                                            </ViewComponent>
                                                        </ViewComponent>
                                                    </ViewComponent>



                                                    {item?.bankStatus?.toLowerCase() === 'approved' && item?.accountNumber && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap]}>
                                                        <TextMultiLanguage style={[commonStyles.accountselectsecondarytext]} text={'GLOBAL_CONSTANTS.IBAN_ACCOUNT_NUMBER'} />
                                                        <ParagraphComponent style={[commonStyles.accountselectprimarytext]} text={item?.accountNumber ? decryptAES(item.accountNumber) : '-'} />
                                                    </ViewComponent>}

                                                </ViewComponent>
                                            </CommonTouchableOpacity>
                                            <ViewComponent style={[commonStyles.transactionsListGap]} />
                                        </ViewComponent>
                                    );
                                }}
                            />
                        )}

                        {(!bankKpiDetails || bankKpiDetails?.length == 0) && !createAccListLoading && (
                            <NoDataComponent />
                        )}
                    </ViewComponent>
                )}
            </Container>
        </ViewComponent>
    )
});
export default Accounts;

