import React, { useEffect, useRef, useState } from 'react';
import { s } from 'react-native-size-matters';
import RecentTransactions from '../transactions/recentTransactions';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import Container from '../../../components/container/container';
import PageHeader from '../../../components/pageHeader/pageHeader';
import ScrollViewComponent from '../../../components/scrollView/scrollView';
import ViewComponent from '../../../components/view/view';
import TextMultiLangauge from '../../../components/textComponets/multiLanguageText/textMultiLangauge';
import ParagraphComponent from '../../../components/textComponets/paragraphText/paragraph';
import { useSelector } from 'react-redux';
import { CurrencyText } from '../../../components/textComponets/currencyText/currencyText';
import KycVerifyPopup from '../kycVerify';
import DashboardLoader from '../../../components/loader';
import { getVerificationData } from '../../../apiServices/common/countryService';
import { isErrorDispaly } from '../../../utils/helpers';
import ErrorComponent from '../../../components/errorDisplay/errorDisplay';
import { oneCoinValue } from '../../fintechApp/Dashboard/constant';
import ActionButton from '../../../components/gradianttext/gradiantbg';
import DeposistIcon from '../../../components/svgIcons/mainmenuicons/dashboarddeposist';
import WithdrawIcon from '../../../components/svgIcons/mainmenuicons/dashboardwithdraw';
import CustomRBSheet from '../../../components/models/commonBottomSheet';
import { getTabsConfigation, isDecimalSmall } from '../../../../configuration';
import SafeAreaViewComponent from '../../../components/safeArea/safeArea';
import { useHardwareBackHandler } from '../../../hooks/backHandleHook';
import { useLngTranslation } from '../../../hooks/languagesHook/useLngTranslation';
import EnableProtectionModel from "../protection";

const CoinDetailsScreen = ({ route, navigation }: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { coinData, defaultVault } = route.params;
    const [refreshing, setRefreshing] = useState(false);
    const [screenLoading, setScreenLoading] = useState(false);
    const [withdrawLoader, setWithdrawLoader] = useState<boolean>(false);
    const [recentTranscationReload, setRecentTranscationReload] = useState(false);
    const [errormsg, setErrormsg] = useState("");
    const [errormsgLink, setErrormsgLink] = useState("");
    const [kycModelVisible, setKycModelVisible] = useState(false);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const currency = getTabsConfigation('CURRENCY')
    const verficationSheetRef = useRef<any>(null);
    const { t } = useLngTranslation();
    const [enableProtectionModel, setEnableProtectionModel] = useState<boolean>(false)
    const commonConfiguartion = getTabsConfigation("COMMON_CONFIGURATION");
    const closekycModel = () => {
        setKycModelVisible(false);
    };
    useHardwareBackHandler(() => {
        handleBack()
    });

    const handleLink = () => {
        navigation.navigate('Security');
        setErrormsg("");
        setErrormsgLink("");
    };
    const handleRecentTranscationReloadDetails = (reload: boolean) => {
        setRecentTranscationReload(reload);
    };
    const handleDeposit = () => {
        navigation?.navigate('CryptoDeposit', {
            propsData: {
                cryptoCoin: coinData?.code,
                coinBalance: coinData?.amount,
                coinValue: coinData?.coinValueinNativeCurrency,
                coinNa: coinData?.walletCode,
                oneCoinVal: coinData?.amountInUSD,
                percentages: coinData?.percent_change_1h,
                logo: coinData?.logo,
                coinName: coinData?.code,
                marchentId: defaultVault.id,
                merchantName: defaultVault?.merchantName || defaultVault?.name,
                coinId: coinData?.id
            }
        }
        )
    }

    const handleWithdraw = async () => {
        setErrormsg('');
        setErrormsgLink('');

        if ((commonConfiguartion?.IS_SKIP_KYC_VERIFICATION_STEP !== true) && (userInfo?.kycStatus !== "Approved" && (userInfo?.metadata?.IsInitialKycRequired == false && userInfo?.metadata?.IsInitialVaultRequired == true))) {
            setKycModelVisible(true);
        } else {
            setWithdrawLoader(true);
            const securityVerififcationData: any = await getVerificationData();
            if (securityVerififcationData?.ok) {
                setWithdrawLoader(false);
                if ((securityVerififcationData?.data?.isEmailVerification === true || securityVerififcationData?.data?.isPhoneVerified === true)) {
                    navigation?.navigate('CrptoWithdraw', {
                        propsData: {
                            cryptoCoin: coinData?.code,
                            coinBalance: coinData?.amount,
                            coinValue: coinData?.coinValueinNativeCurrency,
                            coinNa: coinData?.walletCode,
                            oneCoinVal: coinData?.amountInUSD,
                            percentages: coinData?.percent_change_1h,
                            logo: coinData?.logo,
                            coinName: coinData?.code,
                            marchentId: defaultVault?.id,
                            merchantName: defaultVault?.merchantName || defaultVault?.name,
                            coinId: coinData?.id,
                        },
                        originalSource: "Dashboard"
                    });
                } else {
                    setEnableProtectionModel(true)

                }
            } else {
                setWithdrawLoader(false);
                setEnableProtectionModel(true)
            }
        }
    }
    const errorMSgHandle = () => {
        setErrormsg("");
    };

    const handleBack = () => {
        navigation.goBack();
    }
    const closeEnableProtectionModel = () => {
        setEnableProtectionModel(false)
    }

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {screenLoading && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
            {!screenLoading && (
                <Container style={[commonStyles.container]}>
                    <PageHeader
                        title={coinData?.name || coinData?.coinName}
                        onBackPress={handleBack}
                    />
                    {errormsg && (<ErrorComponent message={errormsg} onClose={errorMSgHandle} children={errormsgLink || ""} handleLink={handleLink} />)}
                    <ScrollViewComponent>
                        <ViewComponent>
                            {/* <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter, commonStyles.mb10]}>
                                <ImageUri uri={CoinImages[coinData?.code?.toLowerCase()]} width={s(24)} height={s(24)} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                    <ParagraphComponent style={[commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.fs14]}>
                                        {coinData?.name||coinData?.coinName}{" "}
                                    </ParagraphComponent>
                                    <TextMultiLangauge text={"GLOBAL_CONSTANTS.BALANCE"} style={[commonStyles.fw500, commonStyles.fs14, commonStyles.textlinkgrey]} />
                                </ViewComponent>
                            </ViewComponent> */}
                            {/* <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
                                <ParagraphComponent text={`${oneCoinValue[coinData?.code] ?? ''}`} style={[commonStyles.fw600, commonStyles.textWhite, commonStyles.fs28, commonStyles.textWhite]} />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12,commonStyles.mt4]}>
                                <ParagraphComponent text={'+$315.20'} style={[commonStyles.textGreen, commonStyles.fs12]} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap5, commonStyles.fs12, commonStyles.fw400]}>
                                    <UpArrow style={{ width: s(10), height: s(5) }} />
                                    <ParagraphComponent text={'0.74%'} style={[commonStyles.textGreen, commonStyles.fs12, commonStyles.fw400]} />
                                </ViewComponent>
                            </ViewComponent> */}
                            {/* <MarketHighlights coinCode={coinData} /> */}
                            <ViewComponent style={[commonStyles.sectionGap,]}>
                                <TextMultiLangauge text={'GLOBAL_CONSTANTS.AVAIL_BALANCE'} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey, commonStyles.textCenter]} />
                                <CurrencyText value={coinData?.amount || 0} decimalPlaces={4} currency={coinData?.code} style={[commonStyles.fs30, commonStyles.fw700, commonStyles.textWhite, commonStyles.mt5, commonStyles.textCenter]} smallDecimal={isDecimalSmall} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter]}>
                                    <CurrencyText prifix={`${"≈"} ${currency[userInfo?.currency || ""] || ""}`} value={(Number(coinData?.amount || 0) * parseFloat((oneCoinValue[coinData?.code] || '0').replace(/[^0-9.]/g, ''))).toFixed(2)} style={[commonStyles.transactionamounttextsecondary]} />
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.sectionGap, commonStyles.gap10]}>
                                <ViewComponent style={[commonStyles.flex1]} >
                                    <ActionButton
                                        text={"GLOBAL_CONSTANTS.DEPOSIT"}
                                        useGradient
                                        onPress={handleDeposit}
                                        disable={withdrawLoader}
                                        customIcon={<DeposistIcon />}
                                    />

                                </ViewComponent>
                                <ViewComponent style={[commonStyles.flex1]} >
                                    <ActionButton
                                        text={"GLOBAL_CONSTANTS.WITHDRAW"}
                                        onPress={handleWithdraw}
                                        customTextColor={NEW_COLOR.TEXT_PRIMARY}
                                        customIcon={<WithdrawIcon />}
                                        loading={withdrawLoader}
                                        disable={withdrawLoader}
                                    />
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent>
                                <RecentTransactions
                                    accountType={"selectCurrenyDetail"}
                                    currency={coinData?.code}
                                    handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails}
                                />
                            </ViewComponent>
                        </ViewComponent>
                    </ScrollViewComponent>
                    {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
                    <ViewComponent style={[commonStyles.sectionGap]}>
                        {enableProtectionModel && <EnableProtectionModel
                            navigation={navigation}
                            closeModel={closeEnableProtectionModel}
                            addModelVisible={enableProtectionModel}
                        />}
                    </ViewComponent>
                    <CustomRBSheet
                        refRBSheet={verficationSheetRef}
                        height={'Small'}
                        onClose={() => { }}
                    >
                        <ViewComponent style={[commonStyles.p16, commonStyles.alignCenter]}>
                            <ParagraphComponent
                                text="Without verifications you cant withdraw. Please select send verifications from security section"
                                style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite, commonStyles.textCenter, commonStyles.mb20]}
                            />
                            <ActionButton
                                text="Go to Security"
                                useGradient
                                onPress={() => {
                                    verficationSheetRef?.current?.close();
                                    navigation.navigate('Security');
                                }}
                            />
                        </ViewComponent>
                    </CustomRBSheet>

                </Container>
            )}
        </ViewComponent>
    );
};

export default CoinDetailsScreen;