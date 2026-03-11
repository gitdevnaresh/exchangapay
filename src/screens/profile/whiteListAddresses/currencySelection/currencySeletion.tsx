import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import { Currency } from '../../../currencyList/currency.types';
import ViewComponent from '../../../../newComponents/view/view';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import CurrencySelectionComponent from '../../../../newComponents/currencySelectionComponent/CurrencySelectionComponent';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';



const CurrencySelection = () => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const [error,setError]=useState<string>("");
    useHardwareBackHandler(() => {
        handleBackPress();
    });

    const handleSelectCurrency = (currency: Currency) => {
        const actionData: ActionLogParams = {
            screename: 'WithdrawCurrencySelect',
            actionName: 'OnPress Crypto Coin',
            actionType: 'Button',
            nextScreenName: 'WithdrawSelectCurrency', // This is optional
            actionObj: {
                postObj: {
                    coinId: currency?.id,
                    walletCode: currency?.walletCode,
                }
            }
        };
        logEvent('crypto_selection', actionData);
        navigation.navigate('NetworkSelection', {
            coinData: currency,
        });
    };

    const handleBackPress = () => {
        const actionData: ActionLogParams = {
            screename: 'WithdrawCurrencySelect',
            actionName: 'Back Press',
            actionType: 'Button',
            nextScreenName: 'dashboard',
        };
        logEvent('back_press', actionData);
        navigation.goBack();
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader 
                    title="GLOBAL_CONSTANTS.SELECT_CURRENCY" 
                    onBackPress={handleBackPress} 
                />
                 {error&&<ErrorComponent message={error} screen={true}/>}
                <CurrencySelectionComponent
                    onCurrencySelect={handleSelectCurrency}
                    ErrorMessage={setError}
                />
            </Container>
        </ViewComponent>
    );
};



export default CurrencySelection;