import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, LayoutAnimation, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Container from '../../../../components/container/container';
import ErrorComponent from '../../../../components/errorDisplay/errorDisplay';
import NoDataComponent from '../../../../components/noData/noData';
import { CommissionInfo, gradients } from './feeinterfaces';
import { s } from '../../../../constants/styels/scale';
import Feather from "react-native-vector-icons/Feather";
import { isErrorDispaly } from '../../../../utils/helpers';
import { ProfileGeneralServices } from '../../../../apiServices/profile/general';
import DashboardLoader from "../../../../components/loader"
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import SafeAreaViewComponent from '../../../../components/safeArea/safeArea';
import ViewComponent from '../../../../components/view/view';
import { useHardwareBackHandler } from '../../../../hooks/backHandleHook';
import PageHeader from '../../../../components/pageHeader/pageHeader';
import { getTabsConfigation } from '../../../../../configuration';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import { useSelector } from 'react-redux';
import ScrollViewComponent from '../../../../components/scrollView/scrollView';
import TextMultiLanguage from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';

const UpgradeFees = () => {
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const [expanded, setExpanded] = useState<number | null>(null);
    const [actionsList, setActionsList] = useState<any[]>([]);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [moduleExpandLoader, setModuleExpandLoader] = useState(false);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [feesData, setFeesData] = useState<CommissionInfo>({
        membershipName: '',
        membershipPrice: 0,
        referralBonus: 0,
        id: "",
        customerId: "",
        customerIds: "",
        tierName: "",
        onBoardingFee: 0,
        monthlyFee: 0,
        dormantFee: 0,
        userCreated: "",
        createdDate: "",
        modifiedBy: "",
        modifiedDate: "",
        status: "",
        info: "",
        commissionModels: []
    });
    useEffect(() => {
        getFeesdata();
    }, []);
    const exchangeConfig = getTabsConfigation("EXCHANGE");
    const hideExchangeCoinNames = exchangeConfig?.HIDE_COIN_NAMES;
    const hideExchangeNetworks = exchangeConfig?.HIDE_NETWORKS;
    const formatNameMapping: Record<string, string> = {
        bankaccountcreation: "Account Creation",
        bankdepositfiat: "Deposit Fiat",
        bankwithdrawfiat: "Withdraw Fiat",
        depositcrypto: "Deposit Crypto",
        withdrawcrypto: "Withdraw Crypto",
        depositfiat: "Deposit Fiat",
        withdrawfiat: "Withdraw Fiat",
        payincrypto: "Payin Crypto",
        payoutcrypto: "Payout Crypto",
        payinfiat: "Payin Fiat",
        payoutfiat: "Payout Fiat",

    };

    // const tabs = getTabsConfigation("TABS")?.filter((tab: any) => tab?.isDisplay);
    const menuItemsFromStore = useSelector((state: any) => state.userReducer?.menuItems);
    const tabs = menuItemsFromStore?.filter((tab: any) => tab?.isEnabled);
    const showCardsSection = tabs?.some((tab: any) => tab?.featureName?.toLowerCase() === 'cards');
    const showBankSection = tabs?.some((tab: any) => tab?.featureName?.toLowerCase() === 'banks');
    const showPaymentsSection = tabs?.some((tab: any) => tab?.featureName?.toLowerCase() === 'payments');
    const showExchnagesSection = tabs?.some((tab: any) => tab?.featureName?.toLowerCase() === 'exchange');
    const showWalletsSection = tabs?.some((tab: any) => tab?.featureName?.toLowerCase() === 'wallets');
    const allChargerMenu = [
        { name: "Wallets Charges", module: "wallets", show: showWalletsSection },
        { name: "Bank Charges", module: "banks", show: showBankSection },
        { name: "Cards Charges", module: "cards", show: showCardsSection },
        { name: "Payments Charges", module: "payments", show: showPaymentsSection },
        { name: "Exchange Charges", module: "exchange", show: showExchnagesSection },

    ];
    const [chargerMenu] = useState(allChargerMenu.filter(item => item.show));
    const getFeesdata = useCallback(async () => {
        setErrormsg("");
        setIsLoading(true);
        try {
            const response: any = await ProfileGeneralServices.getFeesData();
            if (response?.ok) {
                setFeesData(response?.data);
                setIsLoading(false);
            } else {
                setErrormsg(isErrorDispaly(response));
                setIsLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setIsLoading(false);
        }
    }, []);

    const handleRefresh = useCallback(() => {
        getFeesdata()
        setExpanded(null);
        setActionsList([]);
    }, [getFeesdata]);

    const onRefresh = useCallback(async () => {
        setRefresh(true);
        try {
            await getFeesdata();
            setExpanded(null);
            setActionsList([]);
        } finally {
            setRefresh(false);
        }
    }, [getFeesdata]);

    const fetchChargesData = useCallback(async (module: string) => {
        setErrormsg("");
        setModuleExpandLoader(true);
        try {
            const response: any = await ProfileGeneralServices.getUpgradeFeeChargesData(feesData?.id, module);
            if (response.ok) {
                setActionsList(response?.data);
                setModuleExpandLoader(false);
            } else {
                setErrormsg(isErrorDispaly(response));
                setModuleExpandLoader(false);

            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setModuleExpandLoader(false);
        } finally {
            setIsLoading(false);
            setModuleExpandLoader(false);
        }
    }, [feesData?.id]);

    const toggleItem = useCallback((item: any, index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expanded === index) {
            setExpanded(null);
        } else {
            setExpanded(index);
            fetchChargesData(item.module);
        }
    }, [expanded, fetchChargesData]);

    const backArrowButtonHandler = useCallback(() => {
        navigation.navigate("NewProfile", { animation: 'slide_from_left' });
    }, [navigation]);

    useHardwareBackHandler(() => {
        backArrowButtonHandler();
        return true;
    });
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {isLoading && (<SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>)}
            {(!isLoading && chargerMenu?.length > 0) && (<Container style={[commonStyles.container]}>
                <PageHeader
                    title={"GLOBAL_CONSTANTS.FEES"}
                    onBackPress={backArrowButtonHandler}
                />
                <ScrollViewComponent showsVerticalScrollIndicator={false} refreshing={refresh} onRefresh={onRefresh} >
                    {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}

                    <ViewComponent style={[commonStyles.rounded5]}>
                        {chargerMenu?.map((item, index) => (
                            <ViewComponent
                                key={index}
                                style={[
                                    commonStyles.screenBg,
                                    expanded === index ? commonStyles.sectionBorder : commonStyles.borderTransparent,
                                    commonStyles.transactionsListGap
                                ]}
                            >
                                <TouchableOpacity onPress={() => toggleItem(item, index)} activeOpacity={0.8}>
                                    <LinearGradient
                                        colors={gradients[index % gradients.length]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[
                                            commonStyles.p10,
                                            {
                                                borderTopLeftRadius: s(4),
                                                borderTopRightRadius: s(4),
                                                borderBottomLeftRadius: expanded === index ? 0 : s(4),
                                                borderBottomRightRadius: expanded === index ? 0 : s(4)
                                            }
                                        ]}
                                    >
                                        <ViewComponent
                                            style={[
                                                commonStyles.dflex,
                                                commonStyles.alignCenter,
                                                commonStyles.justifyContent,
                                                commonStyles.gap8,
                                                commonStyles.flexWrap

                                            ]}
                                        >
                                            <ParagraphComponent
                                                style={[
                                                    commonStyles.feesaccordiansectiontitle
                                                ]}
                                                text={`${item.name}`}
                                            />
                                            <Feather
                                                name="chevron-down"
                                                size={s(20)}
                                                color={NEW_COLOR.FEESARROW}
                                                style={{
                                                    transform: [
                                                        { rotate: expanded === index ? "180deg" : "0deg" }
                                                    ]
                                                }}
                                            />
                                        </ViewComponent>
                                    </LinearGradient>
                                </TouchableOpacity>
                                {expanded === index && (
                                    <ViewComponent style={[{ paddingTop: 0 }]}>

                                        {moduleExpandLoader && (
                                            <ViewComponent
                                                style={[

                                                    commonStyles.alignCenter,
                                                    commonStyles.justifyCenter,
                                                    commonStyles.p20
                                                ]}
                                            >
                                                <ActivityIndicator size="small" color={NEW_COLOR.TEXT_PRIMARY} />
                                            </ViewComponent>)}
                                        {!moduleExpandLoader && actionsList.length > 0 && (
                                            <ViewComponent>

                                                {actionsList.map((actionItem: any, actionIndex: number) => (
                                                    <ViewComponent key={actionIndex} style={[commonStyles.p8, commonStyles.borderBottom]}>
                                                        {item.module === "cards" ? (
                                                            <ViewComponent>
                                                                {actionItem?.actionDetails?.map((detail: any, detailIndex: number) => (
                                                                    <ViewComponent key={detailIndex} style={[commonStyles.mb12]}>

                                                                        <ParagraphComponent
                                                                            text={detail.name}
                                                                            style={[commonStyles.feessectiontitle, commonStyles.titleSectionGap]}
                                                                        />

                                                                        {detail?.issuingFee && (
                                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.listGap, commonStyles.gap8, commonStyles.justifyContent
                                                                            ]}>
                                                                                <ParagraphComponent
                                                                                    text="Issuing Fee:"
                                                                                    style={[commonStyles.feeslistprimarytext]}
                                                                                />
                                                                                <ParagraphComponent
                                                                                    text={` ${detail.issuingFee.replace(/EUR|USD/gi, "").trim()}`}
                                                                                    style={[commonStyles.feesssecondarylist, commonStyles.flex1, commonStyles.textRight]}
                                                                                />
                                                                            </ViewComponent>
                                                                        )}

                                                                        {detail?.fee && (
                                                                            <ViewComponent
                                                                                style={[
                                                                                    commonStyles.dflex,
                                                                                    commonStyles.listGap,
                                                                                    commonStyles.gap8,
                                                                                    commonStyles.justifyContent

                                                                                ]}
                                                                            >
                                                                                <ParagraphComponent
                                                                                    text="Top Up Fee:"
                                                                                    style={[commonStyles.feeslistprimarytext]}
                                                                                />
                                                                                <ParagraphComponent
                                                                                    text={` ${detail.fee}`}
                                                                                    style={[
                                                                                        commonStyles.feesssecondarylist, commonStyles.flex1, commonStyles.textRight,
                                                                                        detail.fee.toString().length > 50
                                                                                            ? { marginTop: s(4) }
                                                                                            : { marginTop: s(0) }
                                                                                    ]}
                                                                                    numberOfLines={0}
                                                                                />
                                                                            </ViewComponent>
                                                                        )}


                                                                        {detail?.maintenanceFee && (

                                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.listGap, commonStyles.gap8, commonStyles.justifyContent,
                                                                            ]}>
                                                                                <ParagraphComponent
                                                                                    text="Maintenance Fee:"
                                                                                    style={[commonStyles.feeslistprimarytext]}
                                                                                />
                                                                                <ParagraphComponent
                                                                                    text={` ${detail.maintenanceFee.replace(/EUR|USD/gi, "").trim()}`}
                                                                                    style={[commonStyles.feesssecondarylist, commonStyles.flex1, commonStyles.textRight]}
                                                                                />
                                                                            </ViewComponent>
                                                                        )}

                                                                        {detail?.cardCancellationFee && (


                                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.titleSectionGap
                                                                            ]}>
                                                                                <ParagraphComponent
                                                                                    text="Cancellation Fee:"
                                                                                    style={[commonStyles.feeslistprimarytext]}
                                                                                />
                                                                                <ParagraphComponent
                                                                                    text={` ${detail.cardCancellationFee.replace(/EUR|USD/gi, "").trim()}`}
                                                                                    style={[commonStyles.feesssecondarylist, commonStyles.flex1, commonStyles.textRight]}
                                                                                />
                                                                            </ViewComponent>
                                                                        )}

                                                                    </ViewComponent>
                                                                ))}
                                                            </ViewComponent>
                                                        ) : (
                                                            <ViewComponent>


                                                                <ViewComponent style={[
                                                                    commonStyles.dflex,
                                                                    commonStyles.alignCenter,
                                                                    commonStyles.justifyContent,
                                                                    commonStyles.gap8,
                                                                    item.module === "exchange" && hideExchangeCoinNames ? {} : { marginBottom: commonStyles.mb12.marginBottom }
                                                                ]}>
                                                                    <ParagraphComponent
                                                                        text={formatNameMapping[actionItem.action?.toLowerCase()] || actionItem.action}
                                                                        style={[commonStyles.feessectiontitle]}
                                                                    />
                                                                    {item.module === "exchange" && hideExchangeCoinNames && actionItem?.actionDetails?.length === 1 && (
                                                                        <ParagraphComponent
                                                                            text={actionItem.actionDetails[0].fee}
                                                                            style={[commonStyles.feesssecondarylist, commonStyles.flex1, commonStyles.textRight]}
                                                                        />
                                                                    )}
                                                                </ViewComponent>


                                                                {!(item.module === "exchange" && hideExchangeCoinNames && actionItem?.actionDetails?.length === 1) && actionItem?.actionDetails?.map((detail: any, detailIndex: number) => (
                                                                    <ViewComponent key={`${actionItem.action}-${detail.name}-${detailIndex}`}>
                                                                        <ViewComponent style={[
                                                                            commonStyles.dflex,
                                                                            commonStyles.listGap,
                                                                            commonStyles.gap10,
                                                                            commonStyles.justifyContent
                                                                        ]}>
                                                                            {item.module === "exchange" ? (
                                                                                hideExchangeCoinNames ? (
                                                                                    <ParagraphComponent
                                                                                        text={detail.fee}
                                                                                        style={[commonStyles.feesssecondarylist]}
                                                                                    />
                                                                                ) : (
                                                                                    <>
                                                                                        <ParagraphComponent
                                                                                            text={
                                                                                                `${detail.name}${!hideExchangeNetworks && detail.network
                                                                                                    ? ` (${detail.network})`
                                                                                                    : ""
                                                                                                }`
                                                                                            }
                                                                                            style={[commonStyles.listprimarytext]}
                                                                                        />
                                                                                        <ParagraphComponent
                                                                                            text={detail.fee}
                                                                                            style={[commonStyles.feesssecondarylist, commonStyles.flex1, commonStyles.textRight]}
                                                                                        />
                                                                                    </>
                                                                                )
                                                                            ) : (
                                                                                <>
                                                                                    <ParagraphComponent
                                                                                        text={
                                                                                            `${detail.name}${item.module !== "banks" && detail.network
                                                                                                ? ` (${detail.network})`
                                                                                                : ""
                                                                                            }`
                                                                                        }
                                                                                        style={[commonStyles.feeslistprimarytext]}
                                                                                    />
                                                                                    <ParagraphComponent
                                                                                        text={detail.fee}
                                                                                        style={[commonStyles.feesssecondarylist, commonStyles.textRight, commonStyles.flex1]}
                                                                                    />
                                                                                </>
                                                                            )}
                                                                        </ViewComponent>
                                                                    </ViewComponent>
                                                                ))}
                                                            </ViewComponent>
                                                        )}
                                                    </ViewComponent>
                                                ))}

                                            </ViewComponent>
                                        )}
                                        {!moduleExpandLoader && actionsList.length === 0 && <NoDataComponent />}
                                    </ViewComponent>
                                )}
                            </ViewComponent>
                        ))}
                    </ViewComponent>

                </ScrollViewComponent>
            </Container>)}
        </ViewComponent>
    );
};
export default UpgradeFees;