import React, { useCallback, useEffect, useState } from 'react';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { s } from '../../../newComponents/theme/scale';
import { isErrorDispaly } from '../../../utils/helpers';
import Container from '../../../newComponents/container/container';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import ViewComponent from '../../../newComponents/view/view';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import DepositeService from '../../../services/depositeService';
import { Ionicons } from "@expo/vector-icons";
import FlatListComponent from '../../../newComponents/flatList/flatList';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import SafeAreaViewComponent from '../../../newComponents/safeArea/safeArea';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import { CRYPTO_CONSTANTS } from '../constants';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import { DepositCoin, DepositCurrencySelectComponentProps } from '../interface';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import TransactionIcon from '../../../assets/mainmenuicons/transactionfilter';
import ImageUri from '../../../newComponents/imageComponents/image';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { useNavigation } from '@react-navigation/native';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';


const DepositCurrencySelect = React.memo((props: DepositCurrencySelectComponentProps) => {
    const [cryptoCoinData, setCryptoCoinData] = useState<DepositCoin[]>([]);
    const [walletDtaLoading, setWalletDataLoading] = useState<boolean>(false);
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [error,setError]=useState<string>("");
    const { logEvent } = useActionLogging();
    useEffect(() => {
        getAddressbookCryptoWallets();
    }, []);
  useHardwareBackHandler(()=>{
    backArrowAddressbookHandler();
  })
    const getAddressbookCryptoWallets = async () => {
        setError("");
        setWalletDataLoading(true);
        try {
            const response: any = await DepositeService.getDepositCurrecies();
            logEvent('screen_view', {
                screename: 'DepositCurrencySelect',
                actionName: 'Get Deposit Currencies',
                actionType: 'View',
                postObj: {
                    url: response?.config?.url,
                    cryptoCoinData: response?.data || []
                }
            });
            if (response?.ok) {
                setCryptoCoinData(response?.data || []); // Default to empty array if data is undefined
                setWalletDataLoading(false);
            } else {
                setError(isErrorDispaly(response));
                setWalletDataLoading(false);
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            setWalletDataLoading(false);
        }

    };

    const backArrowAddressbookHandler = useCallback(() => {
        navigation.goBack();
        // navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.HOME" })
    }, []);

    const handleCurrencySelection = (val: DepositCoin) => {
        const actionData: ActionLogParams = {
            screename: 'DepositCurrencySelect',
            actionName: `OnPress Crypto Coin`,
            actionType: 'Navigation',
            nextScreenName: 'DepositMethodSelect', // This is optional
            actionObj: {
                postObj: {
                    coinId: val?.id,
                    walletCode: val?.walletCode
                }
            }
        };
        logEvent('crypto_selection', actionData);

       navigation.navigate(CRYPTO_CONSTANTS.DEPOSIT_NETWORK_SELECT_NAVIGATION, {
                  walletCode: val?.walletCode,
                  walletId: val?.id,
              })
    };

    const renderCryptoItem = ({ item }: { item: DepositCoin }) => {
        return (
            <CommonTouchableOpacity
                onPress={() => handleCurrencySelection(item)}
                key={item?.id}
            >
                <ViewComponent style={[commonStyles.list, commonStyles.menuitemspace, commonStyles.gap16]}>
                    <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                        <ImageUri uri={item?.logo} height={s(24)} width={s(24)} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1,]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.justifyContent, commonStyles.gap10]}>
                            <ViewComponent>
                                <ParagraphComponent text={item?.walletCode} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.mb2]} />
                                <ParagraphComponent text={item?.walletCode} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]} />
                            </ViewComponent>
                        </ViewComponent>
                    </ViewComponent>
              <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                </ViewComponent>
            </CommonTouchableOpacity>
        );
    };
    const handleRedirectTransactions = () => {
        const actionData = {
            screename: 'DepositCurrencySelect',
            actionName: 'Transactions Icon Pressed',
            actionType: 'Navigation',
            nextScreenName: CRYPTO_CONSTANTS.TRANSACRION_LIST_NAVIGATION
        };
        // Log the user action when the "Transactions" icon is pressed
        logEvent('navigation_action', actionData);

        navigation.navigate(CRYPTO_CONSTANTS.TRANSACRION_LIST_NAVIGATION, { trasactionType: 'deposit' })
    }
    const addIcon = (
        <CommonTouchableOpacity
            activeOpacity={0.8}
            onPress={handleRedirectTransactions}
            style={[commonStyles.mt12]}
        >
            <TransactionIcon />
        </CommonTouchableOpacity>
    )
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {walletDtaLoading && <SafeAreaViewComponent>
                <SwokipayDashboardLoader /></SafeAreaViewComponent>}
            {(cryptoCoinData && !walletDtaLoading) &&
                <Container style={[commonStyles.container]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.SELECT_CURRENCY"} onBackPress={backArrowAddressbookHandler} isrefresh={false} rightActions={addIcon} />
                    {error&&<ErrorComponent message={error}/>}
                    <ViewComponent style={[commonStyles.flex1]}>
                        <FlatListComponent data={cryptoCoinData} renderItem={renderCryptoItem} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} />
                    </ViewComponent>
                </Container>}
        </ViewComponent>
    )
})

export default DepositCurrencySelect;
