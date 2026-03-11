import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import CurrencySelectionComponent, { Currency } from '../../../newComponents/currencySelectionComponent/CurrencySelectionComponent';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ViewComponent from '../../../newComponents/view/view';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import TransactionIcon from '../../../assets/mainmenuicons/transactionfilter';
import {setHelightedWithdraw } from '../../../redux/actions/sendActions';
import { useDispatch } from 'react-redux';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';


const WithdrawSelectCurrency = () => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const dispatch = useDispatch();
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
        navigation.navigate('WithdrawSelectNetwork', {
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
         dispatch(setHelightedWithdraw(true));
        navigation.navigate('WithdrawMethodSelect', {animation:"slide_from_left"});
    };

    const handleTransactions = () => {
        const actionData = {
            screename: 'WithdrawCurrencySelect',
            actionName: 'Transactions Icon Pressed',
            actionType: 'Navigation',
            nextScreenName: 'TransactionList'
        };
        logEvent('navigation_action', actionData);
        navigation.navigate("TransactionList", { trasactionType: 'withdraw' });
    };

    const handleRightAction = (
        <CommonTouchableOpacity onPress={handleTransactions}>
            <TransactionIcon />
        </CommonTouchableOpacity>
    );

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader 
                    title="GLOBAL_CONSTANTS.SELECT_CURRENCY" 
                    onBackPress={handleBackPress} 
                    rightActions={handleRightAction} 
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



export default WithdrawSelectCurrency;