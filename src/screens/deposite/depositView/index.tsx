import { useIsFocused, useNavigation } from "@react-navigation/native";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ScrollViewComponent from "../../../newComponents/scrollView/scrollView";
import DepositeService from "../../../services/depositeService";
import { WithDrawServices } from '../../../apiServices/withdrawApis/withdrawServices';
import ViewComponent from "../../../newComponents/view/view"; // Keep this line
import { useCallback, useEffect, useRef, useState } from "react";
import { DepositNetworkData, DepositViewProps, NetworkFromWalletNetwork } from "./interface";
import { FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import QRCode from "react-native-qrcode-svg";
import { s } from "../../../constants/theme/scale";
import ImageUri from "../../../newComponents/imageComponents/image";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeColors } from "../../../hooks/useThemeColors";
import { showAppToast } from "../../../newComponents/ToasterMessages/ShowMessage";
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import ButtonComponent from "../../../newComponents/buttons/button";
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import ViewShot from 'react-native-view-shot';
import { isErrorDispaly } from "../../../utils/helpers";
import Container from "../../../newComponents/container/container";
import SafeAreaViewComponent from "../../../newComponents/safeArea/safeArea";
import SwokipayDashboardLoader from "../../../newComponents/swokipayloader";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import PopupOrSheet from "../../../newComponents/models/PopupOrSheet";
import BottomNavigation from "../../commonScreens/BottomNavigation/BottomNavigation";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import CopyCard from "../../../newComponents/copyComponent/CopyCard";
import { CoinImages, COMMON_SVG_URLS } from "../../../assets/blobUrls";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import NoDataComponent from "../../../newComponents/noData/noData";
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay";
import { CurrencyText } from "../../../newComponents/textComponets/currencyText/currencyText";


const DepositView = (props: DepositViewProps) => {
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { walletCode, network: initialNetworkCode } = props.route.params || "";
    const [networkData, setNetworkData] = useState<DepositNetworkData | null>(null);
    const { t } = useLngTranslation();
    const [coinListLoader, setCoinListLoader] = useState<boolean>(true);
    const [coinWithCurrenyList, setCoinWithCurrenyList] = useState<NetworkFromWalletNetwork[]>([]);
    const currencySheetRef = useRef<any>(null);
    const notificationSheetRef = useRef<any>(null);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const [netWorkListLoader, setNetworkLoader] = useState<boolean>(false);
    const viewShotRef = useRef<any>(null);
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const [error, setError] = useState<string>("");

    // Fix the TypeScript error by properly handling the network parameter
    const getNetworkCode = () => {
        if (typeof initialNetworkCode === 'string') {
            return initialNetworkCode;
        }
        if (initialNetworkCode && typeof initialNetworkCode === 'object' && 'code' in initialNetworkCode) {
            return (initialNetworkCode as any).code;
        }
        return undefined;
    };

    useEffect(() => {
        if (isFocused) {
            fetchDepositDataAndNetworks(walletCode, getNetworkCode());
        }
    }, [isFocused, walletCode, initialNetworkCode]);

    useEffect(() => {
        if (isFocused && !coinListLoader && networkData) { // Log screen view once data is loaded
            if (notificationSheetRef.current && !notificationSheetRef.current.open()) {
                notificationSheetRef.current?.open();
            }
            const screenViewData: ActionLogParams = {
                screename: 'DepositView',
                actionName: 'Screen Loaded',
                actionType: 'View',
                actionObj: {
                    postObj: { walletCode, initialNetworkCode, networkDataLoaded: !!networkData, networksLoaded: coinWithCurrenyList.length > 0 }
                }
            };
            logEvent('screen_view', screenViewData);

        }
    }, [isFocused, coinListLoader, coinWithCurrenyList]);
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    })
    const backArrowButtonHandler = useCallback(() => {
        navigation.goBack();
    }, [navigation]);
    const fetchDepositDataAndNetworks = useCallback(async (coin: string, network: string | undefined) => {
        setError("");
        setCoinListLoader(true);
        try {
            const depositDataResponse: any = await DepositeService.getDepositData(coin, network);
            logEvent('screen_view', {
                screename: 'DepositView',
                actionName: 'Get View data',
                actionType: 'View',
                postObj: {
                    url: depositDataResponse?.config?.url,
                    cryptoCoinData: depositDataResponse?.data || []
                }
            });
            if (depositDataResponse?.ok && depositDataResponse?.data) {
                setNetworkData(depositDataResponse.data);
            } else {
                setNetworkData(null);
                setError(isErrorDispaly(depositDataResponse));
            }
            const networksResponse: any = await WithDrawServices.getWalletNetwork(coin);
            if (networksResponse.status === 200 && networksResponse.data) {
                setCoinWithCurrenyList(networksResponse.data);
                const initialSelectedNetwork = networksResponse.data.find((item: NetworkFromWalletNetwork) => item.code === network);
                if (!initialSelectedNetwork && networksResponse.data.length === 0) {
                    setCoinWithCurrenyList([]);
                }
            } else {
                setCoinWithCurrenyList([]);
                setError(isErrorDispaly(networksResponse));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setCoinListLoader(false);
        }
    }, []);
    const fetchSelectedNetworkData = useCallback(async (coin: string, network: string) => {
        setError("")
        currencySheetRef.current?.close();
        setNetworkLoader(true);
        try {
            const depositDataResponse: any = await DepositeService.getDepositData(coin, network);
            logEvent('screen_view', {
                screename: 'DepositView',
                actionName: 'Select network',
                actionType: 'View',
                postObj: {
                    url: depositDataResponse?.config?.url,
                    cryptoCoinData: depositDataResponse?.data || []
                }
            })
            if (depositDataResponse?.ok && depositDataResponse?.data) {
                setNetworkData(depositDataResponse.data);
            } else {
                setNetworkData(null);
                setError(isErrorDispaly(depositDataResponse));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setNetworkLoader(false);
            notificationSheetRef.current?.open();
        }
    }, []);
    const onShare = useCallback(async () => {
        setError("");
        if (!networkData?.address) {
            setError(t("GLOBAL_CONSTANTS.ADDRESS_NOT_AVAILABLE_TO_SHARE"));
            return;
        }
        try {
            const uri = await viewShotRef.current?.capture?.();
            if (uri) {
                const fileExists = await RNFS.exists(uri);
                if (fileExists) {
                    const shareOptions = {
                        // title: `${t("GLOBAL_CONSTANTS.SHARE_ADDRESS")}`,
                        message: `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_SHARE_MY")} ${walletCode} (${networkData?.network}) ${t("GLOBAL_CONSTANTS.ADDRESS_FOR_RECEIVING")} ${networkData?.address}. ${t("GLOBAL_CONSTANTS.PLEASE_MAKE_SURE_YOU_ARE_USING_THE_CORRECT_PROTOCAL")}\n${t("GLOBAL_CONSTANTS.THANK_YOU")}`,
                        url: `file://${uri.replace('file://', '')}`,
                        type: 'image/png'
                    };
                    await Share.open(shareOptions as any);
                } else {
                    // fallback to text
                    await Share.open({
                        message: `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_SHARE_MY")} ${walletCode} (${networkData?.network}) ${t("GLOBAL_CONSTANTS.ADDRESS_FOR_RECEIVING")} ${networkData?.address}. ${t("GLOBAL_CONSTANTS.PLEASE_MAKE_SURE_YOU_ARE_USING_THE_CORRECT_PROTOCAL")}\n${t("GLOBAL_CONSTANTS.THANK_YOU")}`
                    } as any);
                }
            } else {
                await Share.open({
                    message: `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_SHARE_MY")} ${walletCode} (${networkData?.network}) ${t("GLOBAL_CONSTANTS.ADDRESS_FOR_RECEIVING")} ${networkData?.address}. ${t("GLOBAL_CONSTANTS.PLEASE_MAKE_SURE_YOU_ARE_USING_THE_CORRECT_PROTOCAL")}\n${t("GLOBAL_CONSTANTS.THANK_YOU")}`
                } as any);
            }
            const actionData: ActionLogParams = {
                screename: 'DepositView',
                actionName: 'Share Address',
                actionType: 'Share',
                actionObj: {
                    postObj: {
                        address: networkData?.address,
                        coinCode: walletCode,
                        networkCode: networkData?.network,
                    }
                }
            };
            logEvent('share_address', actionData);
        } catch (error: any) {
            // 'User did not share' is normal behavior - user either shared successfully or cancelled
            if (error?.message === 'User did not share' ||
                error?.message?.includes('User did not share') ||
                error?.message?.includes('cancelled') ||
                error?.message?.includes('CANCELLED') ||
                error?.code === 'CANCELLED') {
                // This is normal behavior, don't show error
                return;
            }
            // Only show error for actual failures
            setError(t('GLOBAL_CONSTANTS.FAILED_TO_SHARE'));
        }
    }, [networkData?.address, networkData?.network, walletCode, t]);

    const copyToClipboard = useCallback(async (text: string) => {
        try {
            Clipboard?.setString(text);
            const actionData: ActionLogParams = {
                screename: 'DepositView',
                actionName: 'Copy Address',
                actionType: 'Copy',
            };
            logEvent('copy_address', actionData);
        } catch {
            setError(`${t("GLOBAL_CONSTANTS.FAILED_TO_COPY_TEXT_TO_CLIPBOARD")}`);
        }
    }, [walletCode, networkData?.network, t]);
    const CurrencySelector = ({ currencyList, onSelect, selectedCurrency }: { currencyList: NetworkFromWalletNetwork[], onSelect: (item: NetworkFromWalletNetwork) => void, selectedCurrency: DepositNetworkData | null }) => {
        return (
            <FlatList
                data={currencyList}
                keyExtractor={(item: NetworkFromWalletNetwork) => `${item.code}-${item.id}`}
                renderItem={({ item }) => {
                    const isSelected = selectedCurrency && item.code === selectedCurrency.network;
                    return (
                        <TouchableOpacity onPress={() => onSelect(item)}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, isSelected && reversCommonStyles.bgBlack, commonStyles.p10, commonStyles.rounded10]}>
                                {item?.logo && <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                                    <ImageUri uri={item?.logo} height={s(24)} width={s(24)} />
                                </ViewComponent>}
                                <ViewComponent style={{ flex: 1 }}>
                                    <ParagraphComponent text={item.name} style={[commonStyles.fs14, commonStyles.fw600, reversCommonStyles.textWhite]} />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignEnd, commonStyles.justifyend]}>
                                    {isSelected && <ViewComponent style={[commonStyles.dflex, commonStyles.alignEnd, commonStyles.justifyend, reversCommonStyles.radioDot]}>
                                        <MaterialIcons name="check" size={s(16)} color={REVERSE_NEW_COLOR.BgAlwaysBlack} />
                                    </ViewComponent>}
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listGap]} />
                        </TouchableOpacity>);
                }} />
        );
    };
    const handleCurrencySelect = (networkItem: NetworkFromWalletNetwork) => {
        currencySheetRef.current?.close();
        const actionData: ActionLogParams = {
            screename: 'DepositView',
            actionName: `Network Selected: ${networkItem.code}`,
            actionType: 'Selection',
            actionObj: {
                postObj: {
                    selectedNetworkId: networkItem.id,
                    selectedNetworkCode: networkItem.code,
                    selectedCoinCode: walletCode,
                }
            }
        };
        logEvent('deposit_network_selected', actionData);
        fetchSelectedNetworkData(walletCode, networkItem.code);
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {coinListLoader && <SafeAreaViewComponent><SwokipayDashboardLoader /></SafeAreaViewComponent>}
            {!coinListLoader && (
                <Container >
                    <PageHeader title={`${t("GLOBAL_CONSTANTS.DEPOSIT")} ${walletCode}`} onBackPress={backArrowButtonHandler} />
                    {error && <ErrorComponent message={error} screen={true}/>}
                    <ScrollViewComponent contentContainerStyle={{ flexGrow: 1, paddingBottom: s(60) + insets.bottom }}>
                        {netWorkListLoader && <SwokipayDashboardLoader />}
                        {!netWorkListLoader && <ViewComponent>
                            {coinWithCurrenyList?.length > 0 && (
                                <ViewComponent style={[commonStyles.mxAuto, commonStyles.networkDropdown]}>
                                    <CommonTouchableOpacity
                                        style={[commonStyles.dflex, commonStyles.gap8, commonStyles.py8, commonStyles.alignCenter]}
                                        activeOpacity={0.8} onPress={() => currencySheetRef.current?.open()}>
                                        <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.list_text]} text={networkData?.network || getNetworkCode() || "N/A"} />
                                        <MaterialIcons name="keyboard-arrow-down" size={s(20)} color={NEW_COLOR.LIST_TEXT} />
                                    </CommonTouchableOpacity>
                                </ViewComponent>
                            )}
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            {networkData && (
                                <ViewComponent>
                                    <ViewComponent style={[commonStyles.alignCenter]}>
                                        <ViewComponent style={[commonStyles.bgAlwaysWhite, commonStyles.p10, commonStyles.rounded16]}>
                                            <QRCode value={networkData?.address} size={s(220)} logoSVG={CoinImages[walletCode?.toLowerCase()]} />
                                        </ViewComponent>
                                        {/* Hidden ViewShot for sharing with BullSwipe logo */}
                                        <ViewShot
                                            ref={viewShotRef}
                                            options={{ format: "jpg", quality: 0.9 }}
                                            style={{ position: 'absolute', top: s(-1000), left: s(-1000) }}
                                        >
                                            <ViewComponent style={[commonStyles.alignCenter, commonStyles.screenBg, { paddingHorizontal: s(20), paddingVertical: s(16) }]}>
                                                <ViewComponent style={[commonStyles.mb32,commonStyles.mt16]}>
                                                    <ParagraphComponent style={[commonStyles.fs18, commonStyles.fw600, commonStyles.textWhite, commonStyles.textCenter]} text={`${t("GLOBAL_CONSTANTS.DEPOSIT")} ${walletCode} ${t("GLOBAL_CONSTANTS.TO")} ${t("GLOBAL_CONSTANTS.BULLSWIPE")}`} />
                                                </ViewComponent>
                                                <ViewComponent style={[commonStyles.bgAlwaysWhite, commonStyles.p10, commonStyles.rounded16, commonStyles.sectionGap]}>
                                                    <QRCode value={networkData?.address} logoSVG={CoinImages[walletCode?.toLowerCase()]} logoSize={s(40)} size={s(220)} />
                                                </ViewComponent>
                                                
                                                <ViewComponent style={[commonStyles.rounded12, commonStyles.applycardbg, commonStyles.py16, commonStyles.px8, commonStyles.gap8, commonStyles.mb12, { width: '100%' }]}>
                                                    <TextMultiLanguage
                                                        text={"GLOBAL_CONSTANTS.DEPOSIT_ADDRESS"}
                                                        style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                                                    />
                                                    <ParagraphComponent text={networkData?.address} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} />
                                                </ViewComponent>

                                                <ViewComponent style={[commonStyles.rounded12, commonStyles.bordered, commonStyles.py12, commonStyles.px8, commonStyles.gap8, commonStyles.mb16, { width: '100%' }]}>
                                                    <ViewComponent style={[commonStyles.dflex,commonStyles.justifyContent,commonStyles.alignCenter]}>
                                                    <TextMultiLanguage
                                                        text={"GLOBAL_CONSTANTS.DEPOSIT_NETWORK"}
                                                        style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                                                    />
                                                    <ParagraphComponent
                                                        text={`${networkData?.network}`}
                                                        style={[commonStyles.fs14, commonStyles.textWhite, commonStyles.fw400]}
                                                    />
                                                    </ViewComponent>
                                               
                                                
                                                 <ViewComponent style={[commonStyles.dflex,commonStyles.justifyContent,{ width: '100%' }]}>
                                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.MINIMUM_DEPOSIT"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
                                                    <ParagraphComponent
                                                        text={`${Number(networkData.depositMinimumamount || 0).toFixed(2)} ${walletCode}`}
                                                        style={[commonStyles.fs14, commonStyles.textWhite, commonStyles.fw400]}
                                                    />
                                                </ViewComponent>
                                                 </ViewComponent>
                                                 <ViewComponent style={[commonStyles.mb16]}/>
                                            </ViewComponent>
                                        </ViewShot>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    <ViewComponent style={[commonStyles.walletlistbg,commonStyles.menuitemspace]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                           <ParagraphComponent
                                                text={`${networkData?.network} ${t("GLOBAL_CONSTANTS.WALLET_ADDRESS")}`}
                                                style={[commonStyles.listsecondarytext]}
                                            />
                                            <CopyCard onPress={() => copyToClipboard(networkData?.address)} size={s(24)} />
                                        </ViewComponent>
                                        <ParagraphComponent text={networkData?.address} style={[commonStyles.listprimarytext]} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                                         <TextMultiLanguage
                                            text={t("GLOBAL_CONSTANTS.DEPOSIT_NETWORK")}
                                            style={[commonStyles.listsecondarytext]}
                                        />
                                        <ParagraphComponent
                                            text={`${networkData?.network}`}
                                            style={[commonStyles.listprimarytext]}
                                        />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listbg,commonStyles.titleSectionGap]}>
                                        <TextMultiLanguage text={t("GLOBAL_CONSTANTS.MINIMUM_DEPOSIT")} style={[commonStyles.listsecondarytext]} />
                                        <CurrencyText
                                            value={networkData?.depositMinimumamount || 0} currency={walletCode} decimalPlaces={0}
                                            style={[commonStyles.listprimarytext]}
                                        />
                                    </ViewComponent></ViewComponent>
                            )}
                            {!networkData && (
                                <NoDataComponent />
                            )}
                            {networkData && (
                                <ViewComponent style={[]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.mb24, commonStyles.gap10]}>
                                        <ImageUri uri={COMMON_SVG_URLS.infoIcon} width={s(24)} height={s(24)} />
                                        <ParagraphComponent
                                            text={`${t("GLOBAL_CONSTANTS.NOTE_DESCRIPTION")} ${"\n"}${walletCode} ${"on"} ${networkData?.network}${t("GLOBAL_CONSTANTS.NEXT_NOTE_DESCRIPTION")}`}
                                            style={[commonStyles.fs14, commonStyles.textGrey, commonStyles.fw400, commonStyles.flex1]}
                                        />
                                    </ViewComponent>

                                    <ButtonComponent title="GLOBAL_CONSTANTS.SHARE" onPress={onShare} />
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                </ViewComponent>)}
                        </ViewComponent>}
                    </ScrollViewComponent>
                    <PopupOrSheet displayType="bottom-sheet"
                        ref={currencySheetRef}
                        title="GLOBAL_CONSTANTS.SELECT_NETWORK"
                        height={s(400)}
                    >
                        <CurrencySelector currencyList={coinWithCurrenyList} onSelect={handleCurrencySelect} selectedCurrency={networkData} />

                    </PopupOrSheet>
                    <PopupOrSheet
                        ref={notificationSheetRef}
                        height={s(320)}
                        showCloseIcon={false}
                        showCloseIconAndTittle={false}
                    >
                        <ViewComponent style={[commonStyles.alignCenter, commonStyles.gap16]}>
                            <ViewComponent >
                                <ImageUri uri={COMMON_SVG_URLS.alert_Icon} width={s(90)} height={s(70)} />
                            </ViewComponent>
                            <TextMultiLanguage
                                text={"GLOBAL_CONSTANTS.DEPOSIT_NOTIFIACTION_DISCRIPTION"}
                                style={[commonStyles.fw400, commonStyles.fs14, reversCommonStyles.textWhite, commonStyles.textCenter]}
                            />
                            <ButtonComponent title="GLOBAL_CONSTANTS.CONTINUE" onPress={() => notificationSheetRef.current?.close()} customButtonStyle={{ width: s(160) }} />
                        </ViewComponent>
                    </PopupOrSheet>
                </Container>
            )}

            {/* Bottom Navigation Tabs */}
            <ViewComponent style={{
                position: 'absolute',
                bottom: insets.bottom,
                left: 0,
                right: 0
            }}>
                <BottomNavigation />
            </ViewComponent>
        </ViewComponent>
    );
};
export default DepositView;