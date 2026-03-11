import React from "react";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../newComponents/view/view";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useActionLogging } from "../../../hooks/loggingHook";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import AddNewAddressComponent from "../../commonScreens/whitelistWalletaddress/addNewAddressComponent/AddNewAddressComponent";


const AddNewAddress = () => {
    const route = useRoute();
    const { selectedNetwork, coinCode, walletAddress: existingWalletAddress, nickname, isEditFlow, coinData } = route.params as {
        selectedNetwork: { code: string };
        coinCode: string;
        walletAddress?: string;
        nickname?: string;
        isEditFlow?: boolean;
        coinData: any;
    };
    
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const navigation = useNavigation<any>();

    useHardwareBackHandler(() => {
        handleBackPress();
    });

    const handleSubmit = (values: { walletAddress: string; selectedNetworkCode: string }) => {
        if (isEditFlow) {
            navigation.navigate({
                name: "ConfirmDetails",
                params: {
                    walletAddress: values.walletAddress,
                    nickname: nickname,
                    selectedNetwork: selectedNetwork,
                    coinCode: coinCode,
                    coinData: coinData
                },
                merge: true,
            });
        } else {
            const actionData = {
                screename: "AddNewAddress",
                actionName: "Submit",
                actionType: "Button",
                nextScreenName: "AddAccountNickname",
                actionObj: { walletAddress: values.walletAddress, selectedNetworkCode: selectedNetwork?.code || "" },
            };
            logEvent("submit_button_click", actionData);
            navigation.navigate({ 
                name: "AddAccountNickname", 
                params: { 
                    walletAddress: values.walletAddress, 
                    selectedNetwork: selectedNetwork, 
                    coinCode: coinCode, 
                    coinData: coinData 
                } 
            });
        }
    };

    const handleBackPress = () => {
        const actionData = {
            screename: "AddNewAddress",
            actionName: "Back Press",
            actionType: "Button",
            nextScreenName: "amount EnterScreen",
        };
        logEvent('back_press', actionData);
        navigation.goBack();
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            
                <Container style={[commonStyles.sectionGap]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.ADD_NEW_WALLET_ADDRESS"} onBackPress={handleBackPress} />
                    <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                    <AddNewAddressComponent
                        onSubmit={handleSubmit}
                        initialWalletAddress={existingWalletAddress}
                        selectedNetworkCode={selectedNetwork?.code}
                    />
                    </KeyboardAwareScrollView>
                </Container>
            
        </ViewComponent>
    );
};

export default AddNewAddress;