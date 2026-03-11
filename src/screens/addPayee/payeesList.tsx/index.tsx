import {useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useState} from "react";
import { useThemeColors } from "../../../hooks/useThemeColors";
import ViewComponent from "../../../newComponents/view/view";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ButtonComponent from "../../../newComponents/buttons/button";
import { Network } from "../../withdraw/networkSelection/interface";
import { ActionLogParams, useActionLogging } from "../../../hooks/loggingHook";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import PayeeListComponent from "../../commonScreens/payeesListComponent/payeesListComponent";
import ScrollViewComponent from "../../../newComponents/scrollView/scrollView";


type Payee = {
    id: string;
    favoriteName: string;
    type: string;
    currency: string;
    state: string; // "Approved" or other
    network: string;
    status: string;
    walletAddress: string;
    coinData:any
};


const PayeesList = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { selectedNetwork, coinCode, coinData } = route.params as {
        selectedNetwork: Network;
        coinCode: string;
        coinData: any;
    };
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();

    useHardwareBackHandler(() => {
        handleBackPress();
    });

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const onRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);
    const handleAddPayee = () => {
        const actionData: ActionLogParams = {
            screename: 'payeeList',
            actionName: 'create payee',
            actionType: 'Button',
            nextScreenName: 'addNewAddress',
            actionObj: {
                postObj: {
                    selectedNetwork: selectedNetwork,
                    coinCode: coinCode,
                }
            }
        };
        logEvent('screen_view', actionData);
        navigation.navigate({
            name: "AddNewAddress",
            params: { selectedNetwork: selectedNetwork, coinCode: coinCode, coinData: coinData },
            merge: true
        });
    };

    const handlePayeeSelect = (item?: Payee) => {
        const actionData: ActionLogParams = {
            screename: 'payeeList',
            actionName: 'select payee or back action',
            actionType: 'Button',
            nextScreenName: 'enter amount screen',
            actionObj: {
                postObj: {
                    selectedNetwork: selectedNetwork,
                    coinCode: coinCode,
                }
            }
        };
        logEvent('screen_view', actionData);
        navigation.navigate({
            name: "AmountEnterScreen",
            params: {
                selectedNetwork: selectedNetwork || "",
                coinCode: coinCode || "",
                payeeData: item || "",
                payeeList: "payeeList",
                coinData: coinData
            }
        });
    };

    const handleBackPress = () => {
        handlePayeeSelect();
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[]}>
                <PageHeader 
                    title="GLOBAL_CONSTANTS.WITHDRAW_ADDRESSES" 
                    onBackPress={handleBackPress} 
                    isrefresh={true} 
                    onRefresh={onRefresh}
                />
                  <ScrollViewComponent
                                    style={[commonStyles.flex1]}
                                    contentContainerStyle={[{ flexGrow: 1 }]}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >
                
                <PayeeListComponent
                    onPayeeSelect={handlePayeeSelect}
                    coinCode={coinCode}
                    network={selectedNetwork}
                    refreshTrigger={refreshTrigger}
                    selectable={true}
                />
                </ScrollViewComponent>
                <ButtonComponent 
                    title="GLOBAL_CONSTANTS.ADD_WITHDRAWAL_ADDRESS" 
                    onPress={handleAddPayee} 
                />
                                <ViewComponent style={[commonStyles.sectionGap]}/>

        </Container>
        </ViewComponent>
    );
};

export default PayeesList;