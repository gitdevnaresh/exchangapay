import { useCallback } from "react";
import SummeryDetails from "./withDrawSummary";
import { useNavigation } from "@react-navigation/native";

const CommonWithDrawSummary = (props:any) => {
  const navigation=useNavigation<any>();
        const handleSendAgain = useCallback(() => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'AllAccounts' }]
            });
        }, [navigation]);
        const handleBackToWallets = useCallback(() => {
            navigation.reset({
                index: 0,
                routes: [{ name: "Dashboard", params: { initialTab: "GLOBAL_CONSTANTS.BANK" } }]
            });
        }, [navigation]);
  return (
    <SummeryDetails {...props} handleSendAgain={handleSendAgain} handleBackToBank={handleBackToWallets}/>
  
  )
}
export default CommonWithDrawSummary