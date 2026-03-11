import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import NetworkSelectionComponent, { Network } from '../../commonScreens/networkSelectionComponent/NetworkSelectionComponent';
import ViewComponent from '../../../newComponents/view/view';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import TextMultiLangauge from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { s } from '../../../newComponents/theme/scale';
import ImageUri from '../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';



const WithdrawSelectNetwork = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const coinCodeData = route?.params?.coinData ?? route?.params?.coinCode ?? '';
    const { logEvent } = useActionLogging();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [error, setError] = React.useState<string>("");

    useHardwareBackHandler(() => {
        handleBackPress();
    });
    const handleSelectNetwork = (network: Network) => {
        const actionData: ActionLogParams = {
            screename: 'WithdrawNetworkSelection',
            actionName: 'Select Network',
            actionType: 'Button',
            nextScreenName: 'AmountEnterScreen',
            actionObj: {
                postObj: {
                    networkId: network.id,
                    networkCode: network.code,
                }
            }
        };
        logEvent('screen_view', actionData);
        navigation.navigate({ 
            name: 'AmountEnterScreen', 
            params: { 
                selectedNetwork: network, 
                coinCode: coinCodeData?.walletCode, 
                coinData: coinCodeData 
            } 
        });
    };

    const handleBackPress = () => {
        const actionData: ActionLogParams = {
            screename: 'WithdrawNetworkSelection',
            actionName: 'Back Press',
            actionType: 'Button',
            nextScreenName: 'WithdrawSelectCurrency',
        };
        logEvent('back_press', actionData);
        navigation.navigate({ name: 'WithdrawSelectCurrencyBack' });
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader 
                    title="GLOBAL_CONSTANTS.SELECT_NETWORK" 
                    onBackPress={handleBackPress} 
                />
                {error&&<ErrorComponent message={error} screen={true}/>}
               {!error&& <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap12]}>
                    <ImageUri  uri={COMMON_SVG_URLS.shieldIcon} width={s(24)} height={s(24)}/>
                    <TextMultiLangauge
                        text="GLOBAL_CONSTANTS.NETWORK_SECURITY"
                        style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey, commonStyles.mb16,commonStyles.flex1]}
                    />
                </ViewComponent>}
                
                <NetworkSelectionComponent
                    coinData={coinCodeData}
                    onNetworkSelect={handleSelectNetwork}
                    errorMessage={setError}
                />
            </Container>
        </ViewComponent>
    );
};

export default WithdrawSelectNetwork;