import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Alert, BackHandler, Linking, Share } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useIsFocused } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import Container from '../../../../../../components/container/container';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import { isErrorDispaly } from '../../../../../../utils/helpers';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../../components/view/view';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import DashboardLoader from '../../../../../../components/loader';
import WalletsService from '../../../../../../apiServices/wallets';
import CopyCard from '../../../../../../components/copyIcon/CopyCard';
import ScrollViewComponent from '../../../../../../components/scrollView/scrollView';
import NoDataComponent from '../../../../../../components/noData/noData';
import SafeAreaViewComponent from '../../../../../../components/safeArea/safeArea';
import { s } from '../../../../../../constants/styels/scale';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import { CurrencyText } from '../../../../../../components/textComponets/currencyText/currencyText';
import TextMultiLangauge from "../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from '../../../../../../components/buttons/button';
import Feather from '@expo/vector-icons/Feather';
import { useLngTranslation } from '../../../../../../hooks/languagesHook/useLngTranslation';
import { useSelector } from 'react-redux';
import CommonTouchableOpacity from '../../../../../../components/touchableComponents/touchableOpacity';
import { getAllEnvData } from '../../../../../../../Environment';
import LabelComponent from '../../../../../../components/textComponets/lableComponent/lable';

interface BrlDepositViewProps {
    route: {
        params: {
            currency: string;
            selectedItem: {};
        };

    };
    navigation: {
        goBack: () => void;
    };
}

const BrlDepositView = React.memo((props: BrlDepositViewProps) => {
    const isFocused = useIsFocused();
    const [depositDetails, setDepositDetails] = useState<any>(null);
    const [errormsg, setErrormsg] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const userInfo: any = useSelector((state: any) => state.userReducer?.userDetails);
    const { oAuthConfig } = getAllEnvData();
    const AppUrl = oAuthConfig?.sumsubWebUrl
    const { t } = useLngTranslation();
    useEffect(() => {
        if (isFocused) {
            getDepositDetails();
        }
    }, [isFocused]);
    const backArrowButtonHandler = (): void => {
        props.navigation.goBack();
    };
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                backArrowButtonHandler();
                return true;
            }
        );
        return () => backHandler.remove();
    }, [backArrowButtonHandler]);
    const getDepositDetails = async () => {
        setLoading(true);
        setErrormsg("");
        try {
            const response: any = await WalletsService.getFiatCoinDetails(props.route.params.selectedItem?.productId);
            if (response?.ok) {
                setDepositDetails(response?.data || null);
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error: any) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setLoading(false);
        }
    };
    const onShare = useCallback(async () => {
        if (!depositDetails?.accNoorCryptoAddress) {
            Alert.alert(t("GLOBAL_CONSTANTS.ERROR"), t("GLOBAL_CONSTANTS.ADDRESS_NOT_AVAILABLE_TO_SHARE"));
            return;
        }
        const appLinks = AppUrl
        try {
            await Share.share({
                message: `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_SHARE_MY")} ${props?.route?.params?.selectedItem?.code} ${t("GLOBAL_CONSTANTS.ADDRESS_FOR_RECEIVING")} ${depositDetails.accNoorCryptoAddress}. ${t("GLOBAL_CONSTANTS.PLEASE_MAKE_SURE_YOU_ARE_USING_THE_CORRECT_PROTOCAL")}\n${appLinks}\n${t("GLOBAL_CONSTANTS.THANK_YOU")}`
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    }, [depositDetails?.accNoorCryptoAddress]);
    const copyToClipboard = async (text: string) => {
        try {
            Clipboard.setString(text);
        } catch (error: any) {
            Alert.alert(`${t("GLOBAL_CONSTANTS.FAILED_TO_COPY_TEXT_TO_CLIPBOARD")}`, error)
        }
    };

    const handleError = useCallback(() => {
        setErrormsg("");
    }, []);

    const handleClickMail = () => {
        const url = `mailto:${userInfo?.metadata?.AdminEmail}`;
        Linking.openURL(url)
    }

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await getDepositDetails();
        } finally {
            setRefreshing(false);
        }
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader title={`${t("GLOBAL_CONSTANTS.DEPOSIT")} ${props?.route?.params?.currency}`} onBackPress={backArrowButtonHandler} />
                {loading ? (
                    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <DashboardLoader />
                    </SafeAreaViewComponent>
                ) : (
                    <ScrollViewComponent
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    >
                        {errormsg !== "" && <ErrorComponent message={errormsg} onClose={handleError} />}

                        {!depositDetails && !loading && <NoDataComponent />}

                        {depositDetails?.accNoorCryptoAddress && (
                            <ViewComponent>
                                <ViewComponent style={[commonStyles.alignCenter, commonStyles.sectionGap]}>
                                    <ViewComponent>
                                        <TextMultiLangauge text={"GLOBAL_CONSTANTS.DEPOSIT_VIEW_AVAILABLE_BALANCE"} style={[commonStyles.transactionamounttextlabel]} />
                                        <CurrencyText value={props?.route?.params?.selectedItem?.amount || 0} currency={props?.route?.params?.currency} style={[commonStyles.transactionamounttext]} decimalPlaces={2} />
                                    </ViewComponent>
                                    <ViewComponent style={commonStyles.sectionGap} />
                                    <ViewComponent style={[commonStyles.bgAlwaysWhite, { padding: s(10), borderRadius: s(8) }]}>
                                        <QRCode value={depositDetails.accNoorCryptoAddress} size={s(200)} />
                                    </ViewComponent>
                                    <ViewComponent style={commonStyles.sectionGap} />
                                    <ViewComponent style={[commonStyles.bgnote]}>
                                        <ViewComponent style={[commonStyles.walletaddresssecondarybottomspace]} >
                                            <LabelComponent text={t("GLOBAL_CONSTANTS.ADDRESS")} style={[commonStyles.walletaddresssecondarytext]} multiLanguageAllows={true} />
                                            <CopyCard onPress={() => copyToClipboard(depositDetails.accNoorCryptoAddress)} />
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.textCenter]}>
                                            {depositDetails.accNoorCryptoAddress && (
                                                <ParagraphComponent
                                                    text={depositDetails.accNoorCryptoAddress}
                                                    style={[
                                                        commonStyles.walletaddressessprimarytext
                                                    ]}
                                                />
                                            )}

                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent style={commonStyles.sectionGap} />

                                </ViewComponent>
                                <ViewComponent>
                                    <ButtonComponent title={"GLOBAL_CONSTANTS.SHARE"} icon={<Feather name="share" size={s(20)} color={NEW_COLOR.SHARE_ICON} />} onPress={onShare} disable={false} solidBackground={true} />
                                </ViewComponent>
                            </ViewComponent>
                        )}
                        {userInfo?.accountType?.toLowerCase() !== 'personal' && <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.sectionGap]}>
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            <TextMultiLangauge text={"GLOBAL_CONSTANTS.TO_ENABLE_THE_BRL_ACCOUNT"} style={[commonStyles.sectionSubTitleText]} />
                            <CommonTouchableOpacity onPress={handleClickMail}>
                                <ParagraphComponent
                                    style={[
                                        commonStyles.textCenter,
                                        commonStyles.textlinks,
                                        commonStyles.mt10
                                    ]}
                                    text={userInfo?.metadata?.AdminEmail}
                                />
                            </CommonTouchableOpacity>
                        </ViewComponent>}
                    </ScrollViewComponent>
                )}
            </Container>
        </ViewComponent>
    );
});

export default BrlDepositView;
