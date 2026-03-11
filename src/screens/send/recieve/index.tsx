import { useIsFocused, useNavigation } from "@react-navigation/native";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ScrollViewComponent from "../../../newComponents/scrollView/scrollView";
import DepositeService from "../../../services/depositeService";
import ViewComponent from "../../../newComponents/view/view"; // Keep this line
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import QRCode from "react-native-qrcode-svg";
import { s } from "../../../constants/theme/scale";
import ImageUri from "../../../newComponents/imageComponents/image";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeColors } from "../../../hooks/useThemeColors";
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import ButtonComponent from "../../../newComponents/buttons/button";
import { isErrorDispaly } from "../../../utils/helpers";
import Container from "../../../newComponents/container/container";
import Loadding from "../../commonScreens/skeltons";
import SafeAreaViewComponent from "../../../newComponents/safeArea/safeArea";
import SwokipayDashboardLoader from "../../../newComponents/swokipayloader";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import PopupOrSheet from "../../../newComponents/models/PopupOrSheet";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import SendServices from "../../../services/send";
import useEncryptDecrypt from "../../../hooks/encDecHook";
import ViewShot from 'react-native-view-shot';
import { WalletsReceiveLoader } from "./skelton";
import { useDispatch, useSelector } from "react-redux";
import { setFromReceive } from "../../../redux/actions/sendActions";
import RNFS from "react-native-fs";
import { Currency } from "../../commonScreens/CurrencyDropDown/CurrencyDropdown";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import TransactionIcon from "../../../assets/mainmenuicons/transactionfilter";
import { CoinImages, COMMON_SVG_URLS } from "../../../assets/blobUrls";
import { CurrencyText } from "../../../newComponents/textComponets/currencyText/currencyText";
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay";

const Receive = (props: any) => {
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const { walletCode, network: initialNetworkCode } = props.route.params || "";
    const [currencyData, setCurrencyData] = useState<any>(null);
    const { t } = useLngTranslation();
    const [coinListLoader, setCoinListLoader] = useState<boolean>(true);
    const currencySheetRef = useRef<any>(null);
    const notificationSheetRef = useRef<any>(null);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const receiveData = WalletsReceiveLoader();
    const [recevieDetailsLoader, setRecevieDetailsLoader] = useState<boolean>(false);
    const [selectedCurrency, setSelectedCurrency] = useState<any>([])
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const [amount, setAmount] = useState<any>(0);
    const [qrCodeInfo, setQrCodeInfo] = useState<any>(null)
    const qrCodeRef = useRef<any>(null); // 1. Create a ref for the QRCode
    const { decryptAES } = useEncryptDecrypt();
    const qrCardShotRef = useRef<any>(null);
    const [receiveSetAmount, setReceiveSetAmount] = useState<any>(0);
    const dispatch = useDispatch();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { referralDetails } = props?.route?.params || {};
    const [noteInfo, setNoteInfo] = useState<string>("");
    const decryptedRefernce = decryptAES(userInfo?.depositReference)
    const [error, setError] = useState<string>("");
    useEffect(() => {
        if (isFocused && receiveSetAmount == 0) {
            fetchCurrency();
        }
    }, [isFocused, walletCode, initialNetworkCode, receiveSetAmount]);
    useEffect(() => {
        if (isFocused && !coinListLoader && currencyData) { // Log screen view once data is loaded
            if (notificationSheetRef.current && !notificationSheetRef.current.open()) {
                notificationSheetRef.current?.open();
            }
            const screenViewData: ActionLogParams = {
                screename: 'DepositView',
                actionName: 'Screen Loaded',
                actionType: 'View',
                actionObj: {
                    postObj: { walletCode, initialNetworkCode, networkDataLoaded: !!currencyData }
                }
            };
            logEvent('screen_view', screenViewData);
        }
    }, [isFocused, coinListLoader]);
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    })
    const backArrowButtonHandler = useCallback(() => {
        dispatch(setFromReceive(true));
        navigation.goBack();
    }, [navigation]);

    const fetchCurrency = useCallback(async () => {
        setError("");
        try {
            const depositDataResponse: any = await DepositeService.getDepositCurrecies();
            logEvent('screen_view', {
                screename: 'RecieveView',
                actionName: 'Get View data',
                actionType: 'View',
                postObj: {
                    url: depositDataResponse?.config?.url,
                    cryptoCoinData: depositDataResponse?.data || []
                }
            });
            if (depositDataResponse?.ok && depositDataResponse?.data) {
                setCurrencyData(depositDataResponse.data);
                setSelectedCurrency(depositDataResponse?.data[0])
                handleReceiverDetails(depositDataResponse?.data[0]?.walletCode, true, false)

            } else {
                setCurrencyData(null);
                setError(isErrorDispaly(depositDataResponse));
            }

        } catch (error) {
            setError(isErrorDispaly(error));
        }
    }, []);
    const handleReceiverDetails = async (walletCode?: string, currencyLoader?: boolean, newAmount?: any,) => {
        setError("");
        if (currencyLoader !== true) {
            setRecevieDetailsLoader(true);
        } else {
            setCoinListLoader(true);
        }
        const obj: any = {
            "receiverId": referralDetails?.customerId || userInfo?.id,
            "fullName": `${decryptAES(userInfo.firstName)} ${decryptAES(userInfo.lastName)}`,
            "amount": amount || newAmount || 0,
            "currency": walletCode,
            "type": "bullswipeId",
            "value": referralDetails?.referralCode || decryptedRefernce
        }
        try {
            let response: any = await SendServices.postReceiveDetails(obj);
            if (response?.status === 200) {
                setQrCodeInfo(response?.data);
                const data = JSON?.parse(decryptAES(response?.data));
                setReceiveSetAmount(data?.amount || data?.Amount);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            if (currencyLoader !== true) {
                setRecevieDetailsLoader(false);
            } else {
                setCoinListLoader(false);
            }
        }
    }

    const handleShare = async () => {
        setError("");
        if (!qrCodeInfo) {
            setError(t("GLOBAL_CONSTANTS.QR_CODE_IS_NOT_AVAILABLE_TO_SHARE"));
            return;
        }
        try {
            const uri = await qrCardShotRef.current?.capture?.();
            if (uri) {
                // Verify file exists before setting
                const fileExists = await RNFS.exists(uri);
                if (fileExists) {
                    navigation?.navigate("ShareQrCode", { capturedImageUri: uri, selectedCurrency, referralDetails, qrCodeInfo });
                } else {
                    setError(t("GLOBAL_CONSTANTS.CAPTURED_IMAGE_FILE_NOT_FOUND"));
                }
            } else {
                setError(t("GLOBAL_CONSTANTS.FAILED_TO_CAPTURE_QR_IMAGE"))
            }
        } catch {
            setError(t("GLOBAL_CONSTANTS.FAILED_TO_CAPTURE_QR_IMAGE"))
        }
    };


    const CurrencySelector = ({ currencyList, onSelect, selectedCurrency }: { currencyList: any[], onSelect: (item: any) => void, selectedCurrency: any }) => {
        return (
            <FlatList
                data={currencyList}
                keyExtractor={(item: any) => `${item.code}-${item.id}`}
                renderItem={({ item }) => {
                    const isSelected = selectedCurrency && item.walletCode === selectedCurrency.walletCode;
                    return (
                        <TouchableOpacity onPress={() => onSelect(item)}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, isSelected && reversCommonStyles.bgBlack, commonStyles.p10, commonStyles.rounded10]}>
                                <ViewComponent style={[reversCommonStyles.modalIconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                                    <ImageUri uri={item?.logo} height={s(24)} width={s(24)} />
                                </ViewComponent>
                                <ViewComponent style={{ flex: 1 }}>
                                    <ParagraphComponent text={item.walletCode} style={[commonStyles.fs14, commonStyles.fw600, reversCommonStyles.textWhite]} />
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
    const handleCurrencySelect = (currency: any) => {
        setAmount(0);

        currencySheetRef.current?.close();
        const actionData: ActionLogParams = {
            screename: 'RecieveView',
            actionName: `Network Selected: ${currency.walletCode}`,
            actionType: 'Selection',
            actionObj: {
                postObj: {
                    selectedNetworkId: currency.id,
                    selectedNetworkCode: currency.walletCode,
                    selectedCoinCode: walletCode,
                }
            }
        };
        logEvent('deposit_network_selected', actionData);
        setSelectedCurrency(currency);
        handleReceiverDetails(currency?.walletCode, false, true);
    };
    const handleSetAmount = () => {
        navigation.navigate("SetAmount", {
            initialAmount: receiveSetAmount || "",
            initialCurrency: selectedCurrency || null,
            currencyList: currencyData || [],
            note: noteInfo,
            onAmountChange: (newAmount: number, newCurrency: Currency, screenName: string, note: string) => {
                setNoteInfo(note);
                setReceiveSetAmount(newAmount);
                setSelectedCurrency(newCurrency);
                handleReceiverDetails(newCurrency?.walletCode, false, newAmount)

            },
        });
    };

    const handleSend = () => {
        navigation.navigate("Send");

    }
    const handleTransactions = () => {
        navigation.navigate("TransactionList", { trasactionType: 'receive' });
    }
    const handleRightAction = (
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.gap16]}>

            <CommonTouchableOpacity style={[commonStyles.radioBg, commonStyles.p6, commonStyles.rounded12, commonStyles.px16]} onPress={handleSend}>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.SEND"} style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textWhite]} />
            </CommonTouchableOpacity>

            <CommonTouchableOpacity onPress={handleTransactions}>
                <TransactionIcon />
            </CommonTouchableOpacity>
        </ViewComponent>
    );
    const ScannerLogo = receiveSetAmount ? CoinImages[selectedCurrency?.walletCode?.toLowerCase()] : COMMON_SVG_URLS?.BullswipeQrImage;
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {coinListLoader && <SafeAreaViewComponent><SwokipayDashboardLoader /></SafeAreaViewComponent>}
            {!coinListLoader && (
                <Container style={[]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.RECEIVE"} onBackPress={backArrowButtonHandler} rightActions={handleRightAction} />
                    {error && <ErrorComponent message={error} screen={true} />}
                    <ScrollViewComponent contentContainerStyle={{ flexGrow: 1 }}>
                        {recevieDetailsLoader && <Loadding contenthtml={receiveData} />}
                        {!recevieDetailsLoader && (<ViewComponent style={{ flex: 1 }}>
                            <ViewComponent>
                                <TextMultiLanguage
                                    style={[commonStyles.fw400, commonStyles.fs14, commonStyles.textlinkgrey, commonStyles.textCenter]}
                                    text={"GLOBAL_CONSTANTS.RECEIVE_CRYPTO_FROM_BULLSWIPE_USERS_TO_YOUR_WALLET"}
                                />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.myAuto]}>

                                <ViewComponent>
                                    <TextMultiLanguage
                                        style={[commonStyles.fw400, commonStyles.fs14, commonStyles.textCenter, commonStyles.textWhite, commonStyles.sectionGap]}
                                        text={"GLOBAL_CONSTANTS.SCAN_WITH_THE_BULLSWIPE_APP_TO_PAY"}
                                    />
                                </ViewComponent>
                                {qrCodeInfo && (
                                    <ViewComponent style={[commonStyles.alignCenter]}>
                                        {/* Main screen: QR + amount only */}
                                        <ViewComponent style={[commonStyles.bgAlwaysWhite, commonStyles.p10, commonStyles.rounded16]}>
                                            <QRCode
                                                value={qrCodeInfo}
                                                size={s(220)}
                                                getRef={(c) => (qrCodeRef.current = c)}
                                                logoSVG={ScannerLogo}
                                                logoBackgroundColor='transparent'
                                            />
                                        </ViewComponent>


                                        {receiveSetAmount > 0 && (<ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mt32]}>

                                            <ViewComponent style={[]}>
                                                <ParagraphComponent style={[commonStyles.fs30, commonStyles.fw700, commonStyles.textWhite]} text={"+"} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                                                <CurrencyText
                                                    value={receiveSetAmount}
                                                    style={[commonStyles.fs30, commonStyles.fw700, commonStyles.textWhite]}
                                                    symboles={true}
                                                />
                                                <ParagraphComponent
                                                    text={selectedCurrency?.walletCode}
                                                    style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textGrey, commonStyles.mt12]}
                                                />
                                            </ViewComponent>
                                        </ViewComponent>)}
                                        {noteInfo !== "" && (<ViewComponent style={[commonStyles.alignCenter, commonStyles.mt5]}>
                                            <ParagraphComponent
                                                style={[commonStyles.fw400, commonStyles.fs14, commonStyles.textWhite]}
                                                text={`${t("GLOBAL_CONSTANTS.NOTE")} ${noteInfo}` || ''} />
                                        </ViewComponent>)}

                                        {/* Hidden ViewShot for capture */}
                                        <ViewShot
                                            ref={qrCardShotRef}
                                            options={{ format: 'png', quality: 0.9 }}
                                            style={{ position: 'absolute', top: -700, left: -1000 }} // off-screen
                                        >
                                            <ViewComponent style={[commonStyles.alignCenter, commonStyles.px24, commonStyles.screenBg, commonStyles.pb40, commonStyles.pt34, commonStyles.rounded12]}>

                                                {/* Capture-only title */}
                                                <ViewComponent style={[commonStyles.alignCenter, commonStyles.sectionGap]}>

                                                    <TextMultiLanguage
                                                        style={[commonStyles.fw400, commonStyles.fs14, commonStyles.textCenter, commonStyles.textWhite]}
                                                        text="GLOBAL_CONSTANTS.SCAN_WITH_THE_BULLSWIPE_APP_TO_PAY"
                                                    />
                                                </ViewComponent>

                                                {/* QR code */}
                                                <ViewComponent style={[commonStyles.bgAlwaysWhite, commonStyles.p10, commonStyles.rounded16]}>
                                                    <QRCode value={qrCodeInfo} size={s(220)}
                                                        logoSVG={ScannerLogo}
                                                        logoBackgroundColor='transparent'
                                                    />
                                                </ViewComponent>

                                                {/* Conditional text based on type */}
                                                <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt32]}>


                                                    <ParagraphComponent
                                                        style={[commonStyles.fw400, commonStyles.fs14, commonStyles.textWhite, commonStyles.textCenter]}
                                                        text={`${t("GLOBAL_CONSTANTS.UID_WITH_COLON")} ${referralDetails?.referralCode || decryptedRefernce}` || ''}
                                                    />

                                                    {receiveSetAmount > 0 && (<ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mt4]}>
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                                                            <CurrencyText
                                                                value={receiveSetAmount}
                                                                style={[commonStyles.fs30, commonStyles.fw700, commonStyles.textWhite]}
                                                            // symboles={true}
                                                            />
                                                            <ParagraphComponent
                                                                text={selectedCurrency?.walletCode}
                                                                style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textGrey, commonStyles.mt12]}
                                                            />
                                                        </ViewComponent>
                                                    </ViewComponent>)}


                                                    {noteInfo !== "" && (<ViewComponent style={[commonStyles.alignCenter, commonStyles.mt4]}>
                                                        <ParagraphComponent
                                                            style={[commonStyles.fw400, commonStyles.fs12]}
                                                            text={`${t("GLOBAL_CONSTANTS.NOTE")} ${noteInfo}` || ''} />
                                                    </ViewComponent>)}
                                                </ViewComponent>

                                            </ViewComponent>
                                        </ViewShot>

                                    </ViewComponent>
                                )}
                            </ViewComponent>

                            <ViewComponent style={{
                            }}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.gap12, commonStyles.sectionGap]}>
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <ButtonComponent
                                            title={receiveSetAmount === 0 ? "GLOBAL_CONSTANTS.SET_AMOUNT" : "GLOBAL_CONSTANTS.EDIT_AMOUNT"}
                                            onPress={handleSetAmount}
                                            solidBackground={true}
                                        />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.SHARE_QR_CODE"}
                                            onPress={handleShare}
                                            solidBackground={true}
                                        />
                                    </ViewComponent>
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.mb10]} />
                            </ViewComponent>
                        </ViewComponent>)}
                    </ScrollViewComponent>
                    <PopupOrSheet displayType="bottom-sheet"
                        ref={currencySheetRef}
                        title="GLOBAL_CONSTANTS.SELECT_CURRENCY"
                        height={s(400)}
                    >
                        <CurrencySelector currencyList={currencyData} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
                    </PopupOrSheet>
                </Container>
            )}
        </ViewComponent>
    );
};
export default Receive;


