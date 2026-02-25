import { useCallback } from "react";
import SummeryDetails from "./withDrawSummary";
import { useNavigation } from "@react-navigation/native";
import { init } from "i18next";

const WalletsWithDrawSummary = (props:any) => {
  const navigation=useNavigation<any>();
        const handleSendAgain = useCallback(() => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'WalletsAllCoinsList', params: { initialTab: 1 } }]
            });
        }, [navigation]);
        const handleBackToWallets = useCallback(() => {
            navigation.reset({
                index: 0,
                routes: [{ name: "Dashboard", params: { initialTab: "GLOBAL_CONSTANTS.WALLETS" } }]
            });
        }, [navigation]);
  return (
    <SummeryDetails {...props} handleSendAgain={handleSendAgain} handleBackToBank={handleBackToWallets} secondaryButtonText={"GLOBAL_CONSTANTS.BACK_TO_WALLETS"}/>
  
  )
}
export default WalletsWithDrawSummary