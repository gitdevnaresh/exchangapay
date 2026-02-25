import React, { useCallback, useEffect, useState, useRef } from "react";
import { useIsFocused, useNavigation, useFocusEffect } from "@react-navigation/native";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import ScrollViewComponent from "../../../../../components/scrollView/scrollView";
import ViewComponent from "../../../../../components/view/view";
import { CoinImages, getThemedCommonStyles, QRCODESIZE } from "../../../../../components/CommonStyles";
import { DepositData, SelectedAsset } from "./interface";
import { Alert, SafeAreaView, Share, BackHandler, Linking, useWindowDimensions } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import RenderHTML from 'react-native-render-html';
import { sanitizeHtmlForReactNative } from '../../../../../hooks/securityHook/secureDomContent';
import Loadding from "../../../../../components/skelton/skeltons";
import SvgFromUrl from "../../../../../components/svgIcon";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import QRCode from "react-native-qrcode-svg";
import { s } from "../../../../../constants/styels/scale";
import LabelComponent from "../../../../../components/textComponets/lableComponent/lable";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";
import { isErrorDispaly } from "../../../../../utils/helpers";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { WalletsDepositLoader } from "../../../../../skeletons/cardsSkeletons";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import NoDataComponent from "../../../../../components/noData/noData";
import Container from "../../../../../components/container/container";
import DashboardLoader from "../../../../../components/loader";
import { CRYPTO_CONSTANTS } from "../../constant";
import Feather from '@expo/vector-icons/Feather';
import CopyCard from "../../../../../components/copyIcon/CopyCard";
import CommonDropdown from '../../../../../components/dropDown';
import ButtonComponent from "../../../../../components/buttons/button";
import { getTabsConfigation, isDecimalSmall, supportMail } from '../../../../../../configuration';
import { useSelector } from "react-redux";
import ImageUri from "../../../../../components/imageComponents/image";
import { getAllEnvData } from "../../../../../../Environment";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import WalletsService from "../../../../../apiServices/wallets";
const CryptoDeposit = (props: any) => {
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const [network, setNetwork] = useState<string>("");
    const [netWorkListLoader, setNetworkLoader] = useState<boolean>(false);
    const receiveData = WalletsDepositLoader();
    const [networkData, setDataNetwork] = useState<any>(null);
    const [isValidWalletDeposite, setIsValidWalletDeposite] = useState<boolean>(true);
    const { t } = useLngTranslation();
    const currency = getTabsConfigation('CURRENCY');
    const baseCurrency = useSelector((state: any) => state.userReducer?.userDetails?.currency);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [depositData, setDepositData] = useState<DepositData>({ assetsList: [], errorMessage: '', coin: '', coinListLoader: true, merchantId: "" });
    const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null);
    const [coinWithCurrenyList, setCoinWithCurrenyList] = useState<any>([]);
    const [selectedCurrencyData, setSelectedCurrencyData] = useState<any>();
    // Add a state to track dropdown open in the parent
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const copyCardRef = useRef<any>(null);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { width } = useWindowDimensions();
    const { oAuthConfig } = getAllEnvData();
    const AppUrl = oAuthConfig?.sumsubWebUrl
    useEffect(() => {
        getCurrencyWithNetworkDetails();
    }, [isFocused]);
    const backArrowButtonHandler = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                backArrowButtonHandler();
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription?.remove();
        }, [backArrowButtonHandler])
    );
    const createCombination = (asset: any, networkDetail: any) => ({
        id: networkDetail.id,
        coinName: asset.name,
        coinCode: asset.code,
        coinImage: asset.image || CoinImages[asset.code?.toLowerCase()],
        networkName: networkDetail.name,
        networkCode: networkDetail.code,
        amount: asset.amount,
        minLimit: networkDetail.minLimit,
        maxLimit: networkDetail.maxLimit,
        fee: networkDetail.fee ?? 0,
        feeType: networkDetail.feeType ?? '',
        amountInBase: asset.amountInBase,
    });

    const processNetworkResponse = (networkResponse: any, asset: any, combinations: any[]) => {
        const isValidResponse = networkResponse?.ok && Array.isArray(networkResponse.data) && networkResponse.data.length > 0;
        if (!isValidResponse) return;

        networkResponse.data.reduce((acc: any, networkDetail: any) => {
            combinations.push(createCombination(asset, networkDetail));
            return acc;
        }, null);
    };

    const createAssetPromise = (asset: any, merchantId: string, combinations: any[]) => {
        return WalletsService.getWalletRecieved(asset.code, 'deposit')
            .then(networkResponse => processNetworkResponse(networkResponse, asset, combinations));
    };

    const buildAssetCombinations = async (availableAssets: any[], merchantId: string) => {
        const combinations: any[] = [];
        const promises = availableAssets.reduce((acc: any[], asset) => {
            acc.push(createAssetPromise(asset, merchantId, combinations));
            return acc;
        }, []);

        await Promise.all(promises);
        return combinations;
    };

    const findSelectedAsset = (combinations: any[]) => {
        const propsData = props?.route?.params?.propsData;
        const coinData = props?.route?.params?.coinData;

        return combinations.reduce((found, data) => {
            return found ||
                (data.coinCode === propsData?.coinName ? data : null) ||
                (data.id === propsData?.coinId ? data : null) ||
                (data.coinName === propsData?.coinName ? data : null) ||
                (data.coinCode === coinData?.code ? data : null);
        }, null) || combinations[0];
    };

    const getCurrencyWithNetworkDetails = useCallback(async () => {
        setDepositData((prev) => ({ ...prev, coinListLoader: true, errorMessage: '' }));
        try {
            const assetResponse = await WalletsService.getShowAssets();
            const data = assetResponse?.data as { wallets?: any[] } | undefined;
            if (!assetResponse?.ok || !data?.wallets?.[0]?.assets) {
                setDepositData(prev => ({ ...prev, errorMessage: isErrorDispaly(assetResponse) || t("ERROR_MESSAGES.FAILED_TO_LOAD_ASSETS") }));
                return;
            }
            const wallet = data.wallets[0];
            const currentMerchantId = props?.route?.params?.propsData?.marchentId || props?.route?.params?.propsData?.merchantId || wallet?.id;
            if (!currentMerchantId) {
                setDepositData(prev => ({ ...prev, errorMessage: t("GLOBAL_CONSTANTS.MERCHANT_ID_MISSING") }));
                return;
            }
            setDepositData(prev => ({ ...prev, merchantId: currentMerchantId }));
            const availableAssets = wallet.assets;
            if (!availableAssets || availableAssets.length === 0) {
                setDepositData(prev => ({ ...prev, errorMessage: t("GLOBAL_CONSTANTS.NO_ASSETS_AVAILABLE") }));
                return;
            }
            const combinations = await buildAssetCombinations(availableAssets, currentMerchantId);
            if (combinations.length > 0) {
                const finalSelectedAsset = findSelectedAsset(combinations);
                setSelectedCurrencyData(finalSelectedAsset);
                setSelectedAsset(finalSelectedAsset);
                setCoinWithCurrenyList(combinations);
                const correctMerchantId = props?.route?.params?.propsData?.marchentId || props?.route?.params?.propsData?.merchantId || currentMerchantId;
                await getNetworkLookUps(correctMerchantId, finalSelectedAsset?.coinCode, finalSelectedAsset.networkName);
            } else {
                setCoinWithCurrenyList([]);
                setSelectedAsset(null);
                setDataNetwork(null);
                setIsValidWalletDeposite(false);
                // setDepositData(prev => ({ ...prev, errorMessage: t("GLOBAL_CONSTANTS.NO_ASSET_NETWORK_COMBINATIONS_FOUND") }));
            }
        } catch (error) {
            setDepositData(prev => ({ ...prev, errorMessage: isErrorDispaly(error) }));
        } finally {
            setDepositData((prev) => ({ ...prev, coinListLoader: false }));
        }
    }, []);
    const findChosenNetwork = (responseData: any[], selectedNetworkIdentifier?: string) => {
        const propsData = props?.route?.params?.propsData;
        const coinData = props?.route?.params?.coinData;

        return responseData.reduce((found, net) => {
            return found ||
                (net?.coinCode === propsData?.coinName ? net : null) ||
                (net?.id === propsData?.coinId ? net : null) ||
                (net?.name === selectedNetworkIdentifier || net?.code === selectedNetworkIdentifier ? net : null) ||
                (net?.coinCode === coinData?.code ? net : null);
        }, null);
    };

    const getNetworkLookUps = async (merchantId: string, coinCode: string, selectedNetworkIdentifier?: string, selectNetworkLoader?: boolean) => {
        setDepositData((prev) => ({ ...prev, errorMessage: "" }));
        if (selectNetworkLoader === true) {
            setNetworkLoader(true);
        }
        try {
            const response: any = await WalletsService.getWalletRecieved(coinCode, 'deposit');
            if (response?.ok && response?.data && response?.data?.length > 0) {
                const chosenNetwork = findChosenNetwork(response.data, selectedNetworkIdentifier);

                if (chosenNetwork) {
                    setNetwork(chosenNetwork.name);
                    setDataNetwork(chosenNetwork);
                    setIsValidWalletDeposite(!!chosenNetwork?.address && typeof chosenNetwork?.address === "string");
                } else {
                    setDataNetwork(response.data[0]);
                    setNetwork(response.data[0]?.name || "");
                    setIsValidWalletDeposite(!!response.data[0]?.address && typeof response?.data[0]?.address === "string");
                }
                if (selectNetworkLoader === true) {
                    setNetworkLoader(false);
                }
            } else {
                setNetwork("");
                setDataNetwork(null);
                setIsValidWalletDeposite(false);
                setDepositData((prev) => ({ ...prev, errorMessage: isErrorDispaly(response) || `${CRYPTO_CONSTANTS.NO_NETWORK_DATA_FOUND_FOR} ${coinCode}` }));
            }
        } catch (error) {
            setDepositData((prev) => ({ ...prev, errorMessage: isErrorDispaly(error) }));
            setNetwork("");
            setDataNetwork(null);
            setIsValidWalletDeposite(false);
        } finally {
            if (selectNetworkLoader === false) {
                setNetworkLoader(false);
            }
        }
    };
    const onShare = useCallback(async () => {
        if (!networkData?.address) {
            Alert.alert(t("GLOBAL_CONSTANTS.ERROR"), t("GLOBAL_CONSTANTS.ADDRESS_NOT_AVAILABLE_TO_SHARE"));
            return;
        }
        const appLinks = AppUrl;
        try {
            await Share.share({
                message: `${t("GLOBAL_CONSTANTS.HERE_MY")} ${selectedCurrencyData?.coinCode || selectedAsset?.coinName || depositData.coin} ${t("GLOBAL_CONSTANTS.DETAILS_FOR_THE_TRANSFER")}\n${selectedCurrencyData.network || selectedAsset?.networkName || network} ${t("GLOBAL_CONSTANTS.ADDRESS_COLON")} ${networkData?.address} \n${t("GLOBAL_CONSTANTS.PLEASE_CONFIRM_THE_NETWORK_IS_CORRECT_PRIOR_TO_THE_TRANSFER")}`
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    }, [selectedAsset, depositData?.coin, networkData?.address, network, t]);
    const copyToClipboard = useCallback((text: any) => {
        try {
            Clipboard?.setString(text);
        } catch (error: any) {
            Alert.alert(`${t("GLOBAL_CONSTANTS.FAILED_TO_COPY_TEXT_TO_CLIPBOARD")}`, error);
        }
    }, []);
    const handleCloseError = useCallback(() => {
        setDepositData((prev) => ({ ...prev, errorMessage: "" }));
    }, []);
    const handleCurrencySelect = async (asset: any) => {
        setSelectedCurrencyData(asset);
        setSelectedAsset(asset);
        setNetworkLoader(true);

        try {
            const correctMerchantId = props?.route?.params?.propsData?.marchentId || props?.route?.params?.propsData?.merchantId || depositData.merchantId;
            const response = await WalletsService.getWalletRecieved(asset?.coinCode, 'deposit');

            if (response?.ok && response?.data && Array.isArray(response.data) && response.data.length > 0) {
                const selectedNetworkData = response.data.find((net: any) =>
                    net?.name === asset?.networkName || net?.code === asset?.networkCode
                ) || response.data[0];

                setNetwork(selectedNetworkData.name);
                setDataNetwork(selectedNetworkData);
                setIsValidWalletDeposite(!!selectedNetworkData?.address && typeof selectedNetworkData?.address === "string");
            }
        } catch (error) {
            setDepositData((prev) => ({ ...prev, errorMessage: isErrorDispaly(error) }));
        } finally {
            setNetworkLoader(false);
        }

        setDropdownOpen(false);
    };
    const handleRefresh = async () => {
        getCurrencyWithNetworkDetails();
    }
    const handleClickMail = () => {
        const url = `mailto:${userInfo?.metadata?.AdminEmail || supportMail}`;
        Linking.openURL(url)
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {depositData?.coinListLoader &&
                <SafeAreaView style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </SafeAreaView>

            }
            {!depositData?.coinListLoader && (
                <Container style={[commonStyles.container]}>
                    <PageHeader title={t("GLOBAL_CONSTANTS.DEPOSIT")} onBackPress={backArrowButtonHandler} />
                    {depositData?.errorMessage !== "" && (<ErrorComponent message={depositData?.errorMessage} onClose={handleCloseError} />)}
                    <CommonDropdown
                        data={coinWithCurrenyList}
                        selectedItem={selectedCurrencyData}
                        onSelect={handleCurrencySelect}
                        dropdownOpen={dropdownOpen}
                        setDropdownOpen={setDropdownOpen}
                        renderItem={(item: any, isSelected: boolean, dropdownOpen: boolean) => (
                            <ViewComponent
                                style={[
                                    commonStyles.dflex,
                                    commonStyles.alignCenter,
                                    commonStyles.justifyContent,
                                    commonStyles.p10,
                                    isSelected && commonStyles.inputdropdowntabactivebg,
                                ]}
                            >
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                    <ViewComponent style={{ width: s(32), height: s(32) }}>
                                        <ImageUri uri={CoinImages[item?.coinCode?.toLowerCase()] || item?.coinImage || item?.image} width={s(32)} height={s(32)} />
                                    </ViewComponent>
                                    <ParagraphComponent
                                        text={`${item.coinCode} (${item.networkName})`}
                                        style={[
                                            commonStyles.inputdropdowntext

                                        ]}
                                    />
                                </ViewComponent>
                            </ViewComponent>
                        )}
                    />

                    {!netWorkListLoader && networkData && (!networkData.address || networkData.address.trim() === '') && (
                        <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.p16, commonStyles.notebg, commonStyles.rounded5]}>
                                <MaterialIcons name="info-outline" size={s(20)} color={NEW_COLOR.NOTE_ICON} />
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ParagraphComponent
                                        text={`${t("GLOBAL_CONSTANTS.DEPOSIT_ADDRESS_ERROR_PART1")} ${selectedCurrencyData?.coinCode || selectedAsset?.coinCode || t('GLOBAL_CONSTANTS.THIS_CURRENCY')} ${t("GLOBAL_CONSTANTS.DEPOSIT_ADDRESS_ERROR_PART2")}`}
                                        style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}
                                    />
                                    <ParagraphComponent
                                        text={userInfo?.metadata?.AdminEmail || ""}
                                        style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textprimary]}
                                        onPress={() => Linking.openURL(`${t("GLOBAL_CONSTANTS.CONTACT")}: ${userInfo?.metadata?.AdminEmail || ""}`)}
                                    />
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>
                    )}

                    {!(!netWorkListLoader && networkData && (!networkData.address || networkData.address.trim() === '')) && (
                        <ScrollViewComponent refreshing={depositData?.coinListLoader} onRefresh={handleRefresh} >
                            <ViewComponent>
                                <ViewComponent style={[commonStyles.sectionGap]} />
                                {netWorkListLoader && <Loadding contenthtml={receiveData} />}
                                {!netWorkListLoader && networkData && <ViewComponent>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap6, commonStyles.alignCenter, commonStyles.justifyCenter,]}>
                                        <SvgFromUrl uri={props?.route?.params?.logo} width={s(24)} height={s(24)} />
                                        <ViewComponent>
                                            <TextMultiLangauge text={t("GLOBAL_CONSTANTS.DEPOSIT_VIEW_AVAILABLE_BALANCE")} style={[commonStyles.transactionamounttextlabel]} />
                                            <CurrencyText value={selectedCurrencyData?.amount ?? networkData?.amount ?? networkData?.available ?? 0} currency={selectedCurrencyData?.coinCode || selectedAsset?.coinCode} style={[commonStyles.transactionamounttext]} decimalPlaces={4} smallDecimal={isDecimalSmall} />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter]}>
                                                <CurrencyText
                                                    value={(selectedCurrencyData?.amountInBase || 0)}
                                                    prifix={`≈ ${currency[baseCurrency] || ""}`}
                                                    style={[commonStyles.transactionamounttextsecondary]}
                                                />
                                            </ViewComponent>
                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.sectionGap]}>
                                    </ViewComponent>
                                    {isValidWalletDeposite && (<ViewComponent style={[]}>
                                        <ViewComponent style={[commonStyles.mxAuto]}>
                                            <ViewComponent style={[commonStyles.bgAlwaysWhite, commonStyles.p10]}>
                                                <QRCode value={networkData?.address} size={QRCODESIZE} />
                                            </ViewComponent>
                                        </ViewComponent>
                                    </ViewComponent>)}
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    <ViewComponent style={[commonStyles.bgnote]}>
                                        <ViewComponent style={[commonStyles.walletaddresssecondarybottomspace]} >
                                            <LabelComponent text={t("GLOBAL_CONSTANTS.ADDRESS")} style={[commonStyles.walletaddresssecondarytext]} multiLanguageAllows={true} />
                                            <CopyCard
                                                ref={copyCardRef}
                                                onPress={() => {
                                                    if (isValidWalletDeposite && networkData?.address) {
                                                        copyToClipboard(networkData?.address);
                                                    }
                                                }}
                                            />
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.textCenter]}>
                                            {networkData?.address && (
                                                <ParagraphComponent
                                                    text={`${networkData.address}`}
                                                    style={[
                                                        commonStyles.walletaddressessprimarytext
                                                    ]}
                                                />
                                            )}

                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent style={commonStyles.sectionGap} />
                                    <ViewComponent style={[commonStyles.buttonpadding]}>
                                        <ButtonComponent title={"GLOBAL_CONSTANTS.SHARE"} icon={<Feather name="share" size={s(20)} color={NEW_COLOR.SHARE_ICON} />} onPress={onShare} disable={false} solidBackground={true} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    {(networkData?.maxLimit !== null || networkData?.minLimit !== null) && <ViewComponent style={[commonStyles.bgnote]}>
                                        {networkData?.minLimit !== null && <ViewComponent style={[commonStyles.dflex, commonStyles.gap8]}>
                                            <ParagraphComponent text={"•"} style={[commonStyles.bgNoteText, commonStyles.fs24]} />
                                            <CurrencyText prifix={t("GLOBAL_CONSTANTS.THE_MINIMUM_AMOUNT_REQUIRED_TO_PROCESS_THIS_DEPOSIT_IS")} value={networkData?.minLimit || 0} coinName={selectedAsset?.coinCode || selectedCurrencyData?.coinCode} currency={`${selectedCurrencyData?.coinCode || selectedAsset?.coinCode} (${networkData.code}). ${t("GLOBAL_CONSTANTS.DEPOSIT_BELOW_THIS_AMOUNT_WILL_NOT_BE_PROCESSED")}`} style={[commonStyles.bgNoteText, commonStyles.flex1]} decimalPlaces={4} smallDecimal={false} />
                                        </ViewComponent>}
                                        <ViewComponent style={[commonStyles.mt10]} />
                                        {networkData?.maxLimit !== null && <ViewComponent style={[commonStyles.dflex, commonStyles.gap8]}>
                                            <ParagraphComponent text={"•"} style={[commonStyles.bgNoteText, commonStyles.fs24]} />
                                            <CurrencyText prifix={t("GLOBAL_CONSTANTS.THE_MAXIMUM_LIMIT_FOR_A_SINGLE_TRANSACTION_IS")} value={networkData?.maxLimit || 0} coinName={selectedAsset?.coinCode || selectedCurrencyData?.coinCode} currency={`${selectedCurrencyData?.coinCode || selectedAsset?.coinCode} (${networkData.code}). `} style={[commonStyles.bgNoteText, commonStyles.flex1]} decimalPlaces={4} smallDecimal={false} />
                                        </ViewComponent>}
                                    </ViewComponent>}
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    {networkData?.remarks && (
                                        <ViewComponent style={[commonStyles.bgnote]}>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8]}>
                                                <MaterialIcons name="info-outline" size={s(18)} color={NEW_COLOR.NOTE_ICON} style={[commonStyles.mt16]} />
                                                <ViewComponent style={[commonStyles.flex1]}>
                                                    <RenderHTML
                                                        contentWidth={width}
                                                        source={{ html: sanitizeHtmlForReactNative(networkData?.remarks) }}
                                                        tagsStyles={{
                                                            body: {
                                                                color: NEW_COLOR.TEXT_WHITE,
                                                                fontSize: s(14),
                                                                fontFamily: "Manrope-Regular",
                                                            },

                                                        }}
                                                        renderersProps={{
                                                            img: {
                                                                enableExperimentalPercentWidth: true,
                                                            },
                                                        }}
                                                        enableExperimentalMarginCollapsing={true}
                                                    />

                                                </ViewComponent>
                                            </ViewComponent>
                                        </ViewComponent>
                                    )}

                                    <ViewComponent style={commonStyles.mb24} />
                                </ViewComponent>}
                                {coinWithCurrenyList && (!networkData || networkData.length <= 0) && netWorkListLoader && <ViewComponent >
                                    <NoDataComponent Description={t("GLOBAL_CONSTANTS.NO_DATA_AVAILABLE")} />
                                </ViewComponent>}
                                {(!coinWithCurrenyList || coinWithCurrenyList?.length <= 0) && !depositData?.coinListLoader && <ViewComponent >
                                    {/* <NoDataComponent Description={t("GLOBAL_CONSTANTS.NO_DATA_AVAILABLE")} /> */}
                                    <TextMultiLangauge text={t("GLOBAL_CONSTANTS.UNABLE_TO_GENERATE_DEPOSIT_ADDRESS")} style={[commonStyles.primarytext, commonStyles.textCenter]} />
                                    <TextMultiLangauge text={t("GLOBAL_CONSTANTS.PLEASE_TRY_AGAIN")} style={[commonStyles.primarytext, commonStyles.textCenter]} />
                                    <CommonTouchableOpacity onPress={handleClickMail}>
                                        <ParagraphComponent
                                            text={userInfo?.metadata?.AdminEmail || supportMail}
                                            style={[commonStyles.textCenter, commonStyles.textlinks, commonStyles.mt10]}
                                        />
                                    </CommonTouchableOpacity>
                                </ViewComponent>}
                            </ViewComponent>
                        </ScrollViewComponent>
                    )}
                </Container>)}
        </ViewComponent>
    );
};
export default CryptoDeposit;
