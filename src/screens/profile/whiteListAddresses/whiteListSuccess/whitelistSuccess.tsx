import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ActionLogParams, useActionLogging } from "../../../../hooks/loggingHook";
import { Network } from "../../../deposite/interface";
import PayeeSuccessComponent from "../../../commonScreens/whitelistWalletaddress/payeeSuccessComponent/PayeeSuccessComponent";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";

const WhiteListSuccess: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { logEvent } = useActionLogging();

  const { selectedNetwork, coinCode, coinData } = route.params as {
    selectedNetwork: Network;
    coinCode: string;
    coinData: any;
  };
useHardwareBackHandler(() => {
    handleNavigatePayeeList();
  });
  const handleNavigatePayeeList = () => {
    const actionData: ActionLogParams = {
      screename: 'whitelistSuccess',
      actionName: 'button_click',
      actionType: 'Button',
      nextScreenName: 'WhiteListAddresses',
      actionObj: {
        selectedNetwork: selectedNetwork,
        coinCode: coinCode
      }
    };
    logEvent('screen_view', actionData);
    navigation.navigate({ 
      name: "WhiteListAddresses", 
      params: { selectedNetwork, coinCode, coinData }, 
      merge: true 
    });
  };

  return (
    <PayeeSuccessComponent 
      onContinue={handleNavigatePayeeList}
      buttonTitle="GLOBAL_CONSTANTS.GO_TO_WHITELISTED_ADDRESSES"
    />
    
  );
};

export default WhiteListSuccess;