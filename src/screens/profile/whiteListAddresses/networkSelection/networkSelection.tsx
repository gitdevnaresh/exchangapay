import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Network } from '../../../deposite/interface';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import ViewComponent from '../../../../newComponents/view/view';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import NetworkSelectionComponent from '../../../commonScreens/networkSelectionComponent/NetworkSelectionComponent';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';




const NetworkSelection = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const coinCodeData = route?.params?.coinData ?? route?.params?.coinCode ?? '';
    const { logEvent } = useActionLogging();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [error,setError]=useState<string>("");

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
            name: 'AddProfileWalletaddress', 
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
        navigation.goBack();
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader 
                    title="GLOBAL_CONSTANTS.SELECT_NETWORK" 
                    onBackPress={handleBackPress} 
                />
                {error&&<ErrorComponent message={error} screen={true}/>}
                <NetworkSelectionComponent
                    coinData={coinCodeData}
                    onNetworkSelect={handleSelectNetwork}
                    errorMessage={setError}
                />
            </Container>
        </ViewComponent>
    );
};

export default NetworkSelection;