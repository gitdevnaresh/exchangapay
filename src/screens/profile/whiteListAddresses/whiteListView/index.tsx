import QRCode from "react-native-qrcode-svg";
import { getThemedCommonStyles, statusColor } from "../../../../assets/styles/CommonStyles";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import SafeAreaViewComponent from "../../../../newComponents/safeArea/safeArea";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import SwokipayDashboardLoader from "../../../../newComponents/swokipayloader";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import ViewComponent from "../../../../newComponents/view/view";
import CopyCard from "../../../../newComponents/copyComponent/CopyCard";
import ButtonComponent from "../../../../newComponents/buttons/button";
import { s } from "../../../../constants/theme/scale";
import { useCallback, useEffect, useState,useRef} from "react";
import { WithDrawServices } from "../../../../apiServices/withdrawApis/withdrawServices";
import { isErrorDispaly } from "../../../../utils/helpers";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Clipboard from "@react-native-clipboard/clipboard";
import { WhiteListAddress } from "./interface";
import { ActionLogParams, useActionLogging } from "../../../../hooks/loggingHook";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import ViewShot from "react-native-view-shot";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import NoDataComponent from "../../../../newComponents/noData/noData";
import { BullSwipe } from "../../../../assets/vectorAssets";
import { CoinImages } from "../../../../assets/blobUrls";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";

const WhiteListView = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();
    const [loading, setLoading] = useState(true);
    const [whiteListAddress, setWhiteListAddress] = useState<WhiteListAddress | null>(null);
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const { logEvent } = useActionLogging();
    const { decryptAES } = useEncryptDecrypt();
    const viewShotRef = useRef<ViewShot>(null);
    const [error, setError] = useState<string>("");



    useEffect(() => {
        setError("");
        if (isFocused) fetchPayeeDetails();
    }, [props.route?.params?.payeeId, isFocused]);

    const fetchPayeeDetails = async () => {
        setLoading(true);
        try {
            const res: any = await WithDrawServices.whiteListDetails(props?.route?.params?.payee?.id);
            if (res.status === 200) {
                setWhiteListAddress(res?.data);
            } else {
                setError(isErrorDispaly(res));
            }
        } catch (err) {
            setError(isErrorDispaly(err));
        }
        finally {
            setLoading(false);
        }

    };

    const backArrowButtonHandler = useCallback(() => {
        navigation.goBack();
        return true;
    }, [navigation]);
    useHardwareBackHandler(() => {
        backArrowButtonHandler()
    })

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
    }, []);

    const onShare = async () => {
        setError("");
        try {
            const uri = await viewShotRef.current?.capture?.();
            if (uri) {
                const fileExists = await RNFS.exists(uri);
                if (fileExists) {
                    const shareOptions = {
                        title: t("GLOBAL_CONSTANTS.SHARE_WHITELIST_ADDRESS_DETAILS"),
                        message: `${t("GLOBAL_CONSTANTS.WHITELIST_ADDRESS_SHARE_MESSAGE")}
${t("GLOBAL_CONSTANTS.WHITELIST_ADDRESS_NAME")}: ${decryptAES(whiteListAddress?.favouriteName || "")}
${t("GLOBAL_CONSTANTS.WALLET_ADDRESS")}: ${whiteListAddress?.walletaddress}
${t("GLOBAL_CONSTANTS.NETWORK")}: ${whiteListAddress?.network}
${t("GLOBAL_CONSTANTS.CURRENCY")}: ${whiteListAddress?.currency || '--'}`,
                        url: `file://${uri.replace('file://', '')}`,
                        type: 'image/png'
                    };
                    await Share.open(shareOptions);
                } else {
                    setError(t("GLOBAL_CONSTANTS.CAPTURED_IMAGE_FILE_NOT_FOUND"));
                }
            } else {
                setError(t("GLOBAL_CONSTANTS.FAILED_TO_CAPTURE_QR_IMAGE"));
            }
        } catch(error:any)
        {
             if (error?.message === 'User did not share' || 
                error?.message?.includes('User did not share') ||
                error?.message?.includes('cancelled') ||
                error?.message?.includes('CANCELLED') ||
                error?.code === 'CANCELLED') {
                // This is normal behavior, don't show error
                return;
            }
            setError(t("GLOBAL_CONSTANTS.FAILED_TO_SHARE"));
        }
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loading && <SafeAreaViewComponent><SwokipayDashboardLoader /></SafeAreaViewComponent>}
            {!loading && (
                <Container>
                    <PageHeader title={"GLOBAL_CONSTANTS.WHITELIST_ADDRESS_DETAILS"} onBackPress={backArrowButtonHandler} />
                    {error&& <ErrorComponent message={error} screen={true}/>}
                    <ScrollViewComponent contentContainerStyle={{ flexGrow: 1, paddingBottom: s(60) }}>
                        {!whiteListAddress ?<ViewComponent style={[commonStyles.flex1,commonStyles.alignCenter,commonStyles.justifyCenter]}>
                            <NoDataComponent/>
                        </ViewComponent>:
                        (<ViewComponent>
                            <ViewComponent style={[commonStyles.alignCenter, commonStyles.mb16]}>
                                <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fw700, commonStyles.fs18, commonStyles.mb4]} text={decryptAES(whiteListAddress?.favouriteName || "")} />
                                <TextMultiLanguage style={[commonStyles.textGrey, commonStyles.fw400, commonStyles.fs14]} text={"GLOBAL_CONSTANTS.WHITELIST_ADDRESS_NAME"} />
                            </ViewComponent>
                            {whiteListAddress && (
                                <ViewComponent>
                                    {/* Main view QR code without logo */}
                                    <ViewComponent style={[commonStyles.alignCenter]}>
                                        <ViewComponent style={[commonStyles.bgAlwaysWhite, commonStyles.p10, commonStyles.rounded16]}>
                                            <QRCode value={whiteListAddress.walletaddress} logoSVG={CoinImages[whiteListAddress?.currency?.toLowerCase()]}  logoSize={s(40)} size={s(220)} />
                                        </ViewComponent>
                                    </ViewComponent>  
                                    {/* Hidden ViewShot for sharing with BullSwipe logo */}
                                    <ViewShot 
                                        ref={viewShotRef} 
                                        options={{ format: "jpg", quality: 0.9 }}
                                        style={{ position: 'absolute', top: s(-1000), left: s(-1000 )}}
                                    >
                                        <ViewComponent style={[commonStyles.alignCenter, commonStyles.p16, commonStyles.screenBg]}>
                                            <ViewComponent style={[commonStyles.mb16]}>
                                                <BullSwipe width={s(120)} height={s(40)} color={NEW_COLOR.TEXT_WHITE} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.bgAlwaysWhite, commonStyles.p10, commonStyles.rounded16]}>
                                                <QRCode value={whiteListAddress?.walletaddress} logoSize={s(40)} logoSVG={CoinImages[whiteListAddress?.currency?.toLowerCase()]} size={s(220)} />
                                            </ViewComponent>
                                        </ViewComponent>
                                    </ViewShot>
                                    <ViewComponent style={[commonStyles.mb16]} />
                                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                                    <ViewComponent style={[commonStyles.rounded12, commonStyles.applycardbg, commonStyles.py16, commonStyles.px8, commonStyles.gap8]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                            <TextMultiLanguage
                                                text={"GLOBAL_CONSTANTS.WALLET_ADDRESS"}
                                                style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                                            />
                                            <CopyCard onPress={() => copyToClipboard(whiteListAddress?.walletaddress)} size={s(24)} />
                                        </ViewComponent>
                                        <ParagraphComponent text={whiteListAddress?.walletaddress} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.flex1]} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.rounded12, commonStyles.applycardbg, commonStyles.py12, commonStyles.px8, commonStyles.gap8, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt5]}>
                                        <TextMultiLanguage
                                            text={t("GLOBAL_CONSTANTS.CURRENCY")}
                                            style={[commonStyles.fs14, commonStyles.fw400,commonStyles.textGrey]}
                                        />
                                        <ParagraphComponent
                                            text={`${whiteListAddress?.currency}`}
                                            style={[commonStyles.fs16, commonStyles.textWhite, commonStyles.fw400]}
                                        />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.rounded12, commonStyles.applycardbg, commonStyles.py12, commonStyles.px8, commonStyles.gap8, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt5]}>
                                        <TextMultiLanguage
                                            text={t("GLOBAL_CONSTANTS.NETWORK")}
                                            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                                        />
                                        <ParagraphComponent
                                            text={`${whiteListAddress?.network}`}
                                            style={[commonStyles.fs16, commonStyles.textWhite, commonStyles.fw400]}
                                        />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.rounded12, commonStyles.applycardbg, commonStyles.py12, commonStyles.px8, commonStyles.gap8, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt5]}>
                                        <TextMultiLanguage
                                            text={t("GLOBAL_CONSTANTS.STATE")}
                                            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                                        />
                                        <ParagraphComponent
                                            text={`${whiteListAddress?.whiteListState}`}
                                            style={[commonStyles.fs16, commonStyles.fw400, { color: statusColor[whiteListAddress?.whiteListState?.toLowerCase()] }]}
                                        />
                                    </ViewComponent>
                                </ViewComponent>
                            )}
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            <ButtonComponent title="GLOBAL_CONSTANTS.SHARE" onPress={onShare} />
                            <ViewComponent style={[commonStyles.sectionGap]} />
                        </ViewComponent>)}
                    </ScrollViewComponent>
                </Container>
            )}
        </ViewComponent>
    );
};
export default WhiteListView;