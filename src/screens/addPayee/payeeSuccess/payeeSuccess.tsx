import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Network } from "../../withdraw/networkSelection/interface";
import { ActionLogParams, useActionLogging } from "../../../hooks/loggingHook";
import PayeeSuccessComponent from "../../commonScreens/whitelistWalletaddress/payeeSuccessComponent/PayeeSuccessComponent";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";

const PayeeSuccess: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { logEvent } = useActionLogging();

  const { selectedNetwork, coinCode, coinData } = route.params as {
    selectedNetwork: Network;
    coinCode: string;
    coinData: any;
  };

  useHardwareBackHandler(() => {
      navigation.navigate({
            name: "AmountEnterScreen",
            params: {
                selectedNetwork: selectedNetwork || "",
                coinCode: coinCode || "",
                coinData: coinData
            }
  }); 
 });

  const handlePayeeList = () => {
    const actionData: ActionLogParams = {
      screename: 'WithdrawSuccess',
      actionName: 'button_click',
      actionType: 'Button',
      nextScreenName: 'payeeList',
      actionObj: {
        selectedNetwork: selectedNetwork,
        coinCode: coinCode
      }
    };
    logEvent('screen_view', actionData);
    navigation.navigate({ 
      name: "PayeeList", 
      params: { selectedNetwork, coinCode, coinData }, 
      merge: true 
    });
  };

  return (
    <PayeeSuccessComponent 
      onContinue={handlePayeeList}
      buttonTitle="GLOBAL_CONSTANTS.CONTINUE_TO_WITHDRAW"
      coinCode={coinCode}
      coinData={coinData}
      selectedNetwork={selectedNetwork}
      screneName="Withdraw"
    />
  );
};

export default PayeeSuccess;