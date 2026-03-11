import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute, useIsFocused, RouteProp } from '@react-navigation/native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import TextMultiLangauge from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { isErrorDispaly } from '../../../utils/helpers';
import { s } from '../../../newComponents/theme/scale';
import { WithDrawServices } from '../../../apiServices/withdrawApis/withdrawServices';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import FlatListComponent from '../../../newComponents/flatList/flatList';
import { Ionicons } from "@expo/vector-icons";
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import SafeAreaViewComponent from '../../../newComponents/safeArea/safeArea';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import { CRYPTO_CONSTANTS } from '../constants';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import {
    DepositSelectNetworkNavigation,
    DepositSelectNetworkParams,
    NetworkRenderItem, Network
} from '../interface';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ImageUri from '../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';
import { CurrencyText } from '../../../newComponents/textComponets/currencyText/currencyText';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';

type DepositSelectNetworkRouteProp = RouteProp<{ DepositSelectNetwork: DepositSelectNetworkParams }, 'DepositSelectNetwork'>;

const DepositSelectNetwork = () => {
    const navigation = useNavigation<DepositSelectNetworkNavigation>();
    const route = useRoute<DepositSelectNetworkRouteProp>();
    const isFocused = useIsFocused();
    const coinCode = route.params.walletCode ?? '';
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [loading, setLoading] = useState<boolean>(true);
    const [networks, setNetworks] = useState<Network[]>([]);
    const { t } = useLngTranslation();
    const { logEvent } = useActionLogging();
    const [error,setError]=useState<string>("");

    useEffect(() => {
        if (coinCode && isFocused) {
            fetchNetworks();
        }
    }, [coinCode, isFocused]);
  useHardwareBackHandler(()=>{
    handleBackPress();
  })
    useEffect(() => {
        if (isFocused && !loading) { // Log screen view once data is loaded
            const screenViewData: ActionLogParams = { screename: 'DepositNetworkSelection', actionName: 'Screen Loaded', actionType: 'View' };
            logEvent('screen_view', screenViewData);
        }
    }, [isFocused, loading]);
    const fetchNetworks = async () => {
        setError("");
        setLoading(true);
        try {
            const response = await WithDrawServices.getWalletNetwork(coinCode);
            logEvent('screen_view', {
                screename: 'NetworkSelection',
                actionName: 'Network List',
                actionType: 'View',
                postObj: {
                    url: response?.config?.url,
                    cryptoCoinData: response?.data || []
                }
            })
            if (response.status === 200) {
                setNetworks(response.data as Network[]);
            } else {
                setNetworks([]);
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setLoading(false);
        }
    };
    const handleSelectNetwork = (network: Network) => {
        const actionData: ActionLogParams = {
            screename: 'DepositNetworkSelection',
            actionName: 'Select Network',
            actionType: 'Button',
            nextScreenName: 'DepositView',
            actionObj: {
                postObj: {
                    networkId: network.id,
                    networkCode: network.code,
                }
            }
        };
        logEvent('network_selection', actionData);
        navigation.navigate(CRYPTO_CONSTANTS.DEPOSIT_VIEW_NAVIGATION, {
            network: network,
            walletCode: coinCode
        });
    }
    const handleBackPress = () => {
        navigation.goBack();
    };
    const renderNetworkItem = ({ item }: NetworkRenderItem) => {
        return (
            <CommonTouchableOpacity style={[commonStyles.list, commonStyles.menuitemspace]}
                onPress={() => handleSelectNetwork(item)}
                activeOpacity={0.8}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                    <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                        <ImageUri uri={item?.logo} height={s(24)} width={s(24)} />
                    </ViewComponent>
                    <ViewComponent>
                        <TextMultiLangauge text={`${item?.coinNetWork} (${item.code})`} style={[commonStyles.fw400, commonStyles.fs14, commonStyles.list_text, commonStyles.mb4]} />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <ParagraphComponent text={`${t("GLOBAL_CONSTANTS.MINIMUM_DEPOSIT_AMOUNT")}:`} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]} />
                            <CurrencyText value={item?.depositMinLimit} currency={coinCode} decimalPlaces={0} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]} />
                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
                <ViewComponent >
                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                </ViewComponent>
            </CommonTouchableOpacity>
        );
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loading && <SafeAreaViewComponent><SwokipayDashboardLoader /></SafeAreaViewComponent>}
            {!loading && <Container style={[commonStyles.container]}>
                <PageHeader title={'GLOBAL_CONSTANTS.SELECT_NETWORK'} onBackPress={handleBackPress} />
                {error&&<ErrorComponent message={error} screen={true}/>}
                {networks.length > 0 && <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap12]}>
                    <ImageUri uri={COMMON_SVG_URLS.shieldIcon} width={s(24)} height={s(24)}/>
                    <TextMultiLangauge
                        text={'GLOBAL_CONSTANTS.DEPOSIT_NETWORK_SECURITY'}
                        style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey, commonStyles.titleSectionGap,commonStyles.flex1]}
                    />
                </ViewComponent>}
                <FlatListComponent
                    data={networks}
                    renderItem={renderNetworkItem}
                    keyExtractor={(item) => item?.id?.toString()}
                    showsVerticalScrollIndicator={false}
                />
            </Container>}
        </ViewComponent>
    );
};

export default DepositSelectNetwork;